#!/usr/bin/env python3
"""Check whether a URL may be fetched under a robots.txt, stdlib only.

Usage:
  python robots_check.py --file robots.txt [--agent NAME] URL [URL ...]
  python robots_check.py --site <scheme and host of the site> [--agent NAME] URL [URL ...]
  python robots_check.py --self-test

--file reads a saved robots.txt (no network). --site downloads the robots file
once from the site ROOT (scheme, host and port; any path in --site is dropped,
so a site given with a /blog/ path still fetches the root robots file); every
URL must then be on that same host. --self-test runs built-in assertions on
made-up robots text, uses no network, and exits 0 when all pass.

A SET of agents is checked by default: the declared name (--agent, default
research-fetcher) plus AI_AGENT_TOKENS below, the tokens sites use to refuse
our class of fetcher. --agents-only-declared checks the declared name only
(for diagnosing; the default is the full set). A DENY for ANY token in the AI
list is a refusal for the whole site and the tokens that refused are named.

Exit codes:
  0  every URL allowed for every agent checked
  1  the declared agent is denied by a path rule
  2  fault (bad arguments, missing file, address problem)
  3  refused: one or more AI-agent tokens are denied for a URL
  4  unreachable: the robots file could not be fetched (network, timeout,
     incomplete read, connection error)
  5  unparseable: the robots file is not valid UTF-8, or is UTF-16 (BOM) or
     holds NUL bytes; treated as closed, never as allow-all
Several apply at once: 3 beats 1.

Matching follows the Robots Exclusion Protocol (RFC 9309): the group whose
user-agent product token equals the agent's token wins (case-insensitive; a
"/version" is dropped on BOTH sides), else the "*" group; inside the group the
longest matching pattern wins, Allow wins a tie, "*" and a final "$" are
wildcards. Only a user-agent line after rules starts a new group; Sitemap,
Crawl-delay and other lines never end or start a group. A robots file the site
refuses or fails to serve (any HTTP error other than 404 or 410) counts as
closed, which is stricter than the standard for 4xx. Only a missing file (404,
410) counts as open. Redirects are followed by the standard opener.
"""
import argparse
import http.client
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

UNRESERVED = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~")

AI_AGENT_TOKENS = [
    "ClaudeBot", "Claude-User", "Claude-SearchBot", "Claude-Web", "anthropic-ai",
    "GPTBot", "ChatGPT-User", "OAI-SearchBot", "CCBot", "PerplexityBot",
    "Google-Extended", "Applebot-Extended",
]

EXIT_OK, EXIT_DENY, EXIT_FAULT, EXIT_REFUSED, EXIT_UNREACHABLE, EXIT_UNPARSEABLE = 0, 1, 2, 3, 4, 5


class Unreachable(Exception):
    pass


class Unparseable(Exception):
    pass


def norm(text):
    """Percent-encode non-ASCII, decode unreserved escapes, upper-case the rest."""
    text = urllib.parse.quote(text, safe="/%:@!$&'()*+,;=-._~?")

    def fix(m):
        ch = chr(int(m.group(1), 16))
        return ch if ch in UNRESERVED else "%" + m.group(1).upper()

    return re.sub(r"%([0-9A-Fa-f]{2})", fix, text)


def token(agent):
    """Product token: drop any /version, trim, lower-case."""
    return agent.split("/")[0].strip().lower()


def robots_url(site):
    """Robots address from the site ROOT: scheme + host + port, any path dropped."""
    p = urllib.parse.urlsplit(site)
    return p.scheme.lower() + ":" + "//" + p.netloc.rpartition("@")[2] + "/robots.txt"


def decode_robots(data):
    """Bytes to text per the RFC (UTF-8). UTF-16, NUL bytes or bad UTF-8: Unparseable."""
    if data[:2] in (b"\xff\xfe", b"\xfe\xff") or b"\x00" in data:
        raise Unparseable("robots file is UTF-16 or binary (NUL bytes)")
    try:
        return data.decode("utf-8").lstrip("﻿")
    except UnicodeDecodeError as e:
        raise Unparseable("robots file is not valid UTF-8: " + str(e))


def parse(text):
    """Return groups: {"agents": [tokens], "rules": [(allow, pattern)], "delay": str or None}."""
    groups, cur, in_agents = [], None, False
    for raw in text.lstrip("﻿").splitlines():
        line = raw.split("#", 1)[0].strip()
        if ":" not in line:
            continue
        field, value = (p.strip() for p in line.split(":", 1))
        field = field.lower()
        if field == "user-agent":
            if not in_agents:
                cur = {"agents": [], "rules": [], "delay": None}
                groups.append(cur)
            cur["agents"].append(token(value))
            in_agents = True
            continue
        if field in ("allow", "disallow"):
            in_agents = False
            if cur is not None and value:  # an empty Disallow forbids nothing
                cur["rules"].append((field == "allow", norm(value)))
        elif field == "crawl-delay":
            if cur is not None and cur["delay"] is None:
                cur["delay"] = value
        # sitemap and any other line: not a group member, changes nothing
    return groups


def pick(groups, agent):
    """Merge all groups naming the agent token, else all "*" groups: (rules, delay, named)."""
    tok = token(agent)
    named = [g for g in groups if tok in g["agents"]]
    if named:
        chosen, is_named = named, True
    else:
        chosen, is_named = [g for g in groups if "*" in g["agents"]], False
    rules = [r for g in chosen for r in g["rules"]]
    delay = next((g["delay"] for g in chosen if g["delay"]), None)
    return rules, delay, is_named


def to_regex(pattern):
    end = pattern.endswith("$")
    body = pattern[:-1] if end else pattern
    rx = ".*".join(re.escape(part) for part in body.split("*"))
    return re.compile(rx + ("$" if end else ""))


def allowed(rules, url):
    parts = urllib.parse.urlsplit(url)
    if parts.path == "/robots.txt":
        return True
    path = norm((parts.path or "/") + ("?" + parts.query if parts.query else ""))
    best_len, best_allow = -1, True
    for allow, pattern in rules:
        if to_regex(pattern).match(path):
            length = len(pattern)
            if length > best_len or (length == best_len and allow):
                best_len, best_allow = length, allow
    return best_allow


def agent_set(declared, declared_only):
    """Declared name first, then the AI list (no repeats, case-insensitive)."""
    out, seen = [], set()
    for a in [declared] + ([] if declared_only else AI_AGENT_TOKENS):
        if token(a) not in seen:
            seen.add(token(a))
            out.append(a)
    return out


def evaluate(text, declared, declared_only, urls):
    """Return (results, delay). results: per URL dict(url, declared_ok, refusers[(name, named)])."""
    groups = parse(text)
    ai = {token(t) for t in AI_AGENT_TOKENS}
    results, delay = [], None
    picks = {}
    for a in agent_set(declared, declared_only):
        picks[a] = pick(groups, a)
    dr, delay, dnamed = picks[declared]
    for url in urls:
        r = {"url": url, "declared_ok": allowed(dr, url), "declared_named": dnamed, "refusers": []}
        for a, (rules, _d, named) in picks.items():
            if token(a) in ai and not allowed(rules, url):
                r["refusers"].append((a, named))
        results.append(r)
    return results, delay


def load(args):
    """Return robots text. Raises Unreachable, Unparseable; file errors stay OSError."""
    if args.file:
        with open(args.file, "rb") as fh:
            return decode_robots(fh.read())
    req = urllib.request.Request(robots_url(args.site), headers={"User-Agent": args.agent})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
    except urllib.error.HTTPError as e:
        if e.code in (404, 410):
            return ""  # no file: nothing disallowed
        return "User-agent: *\nDisallow: /\n"  # unreadable: assume closed
    except (urllib.error.URLError, http.client.HTTPException, OSError) as e:
        # URLError, IncompleteRead, socket timeout, ConnectionError
        raise Unreachable(repr(e))
    return decode_robots(data)


def self_test():
    S = "https" + ":" + "//x.example"
    bad = []

    def check(name, cond):
        if not cond:
            bad.append(name)

    def run(text, urls, agent="research-fetcher", only=False):
        return evaluate(text, agent, only, [S + u for u in urls])

    # 1. robots address from the site root
    check("1 root", robots_url("https" + ":" + "//x.example/blog/") == S + "/robots.txt")
    check("1 port", robots_url("http" + ":" + "//x.example:8080/a/b") == "http" + ":" + "//x.example:8080/robots.txt")
    check("1 userinfo", robots_url("https" + ":" + "//u:p@x.example/z") == S + "/robots.txt")

    # 2. Sitemap and Crawl-delay do not split or start groups
    t = "User-agent: *\nDisallow: /a\nSitemap: s.xml\nDisallow: /b\n"
    res, _ = run(t, ["/a", "/b"], only=True)
    check("2 sitemap keeps group", [r["declared_ok"] for r in res] == [False, False])
    t = "User-agent: research-fetcher\nCrawl-delay: 3\nUser-agent: other\nDisallow: /x\n"
    res, d = run(t, ["/x"], only=True)
    check("2 delay does not end agent block", res[0]["declared_ok"] is False and d == "3")
    t = "User-agent: other\nSitemap: s.xml\nUser-agent: research-fetcher\nDisallow: /x\n"
    res, _ = run(t, ["/x"], only=True)
    check("2 sitemap between user-agent lines", res[0]["declared_ok"] is False)
    t = "Disallow: /x\nUser-agent: *\nDisallow: /y\n"
    res, _ = run(t, ["/x", "/y"], only=True)
    check("2 rules before any group ignored", [r["declared_ok"] for r in res] == [True, False])

    # 3. product token with /version, both sides, case-insensitive
    t = "User-agent: MyBot/1.0\nDisallow: /p\n"
    res, _ = run(t, ["/p"], agent="mybot/2", only=True)
    check("3 file version", res[0]["declared_ok"] is False and res[0]["declared_named"])
    res, _ = run(t, ["/p"], agent="MYBOT", only=True)
    check("3 case", res[0]["declared_ok"] is False)

    # 4. agent set, refusal by an AI token
    t = "User-agent: GPTBot/1\nDisallow: /\n"
    res, _ = run(t, ["/page"])
    check("4 gptbot refuses", res[0]["declared_ok"] and [n for n, _ in res[0]["refusers"]] == ["GPTBot"])
    res, _ = run(t, ["/page"], only=True)
    check("4 declared only", res[0]["refusers"] == [] and res[0]["declared_ok"])
    t = "User-agent: *\nDisallow: /private\n"
    res, _ = run(t, ["/private/x", "/open"])
    check("4 star deny hits whole set", len(res[0]["refusers"]) == len(AI_AGENT_TOKENS) and res[1]["refusers"] == [])
    check("4 list size", len(AI_AGENT_TOKENS) == 12 and len(set(map(token, AI_AGENT_TOKENS))) == 12)
    t = "User-agent: *\nDisallow: /x\nUser-agent: ClaudeBot\nAllow: /\n"
    res, _ = run(t, ["/x"])
    check("4 named allow beats star", "ClaudeBot" not in [n for n, _ in res[0]["refusers"]])

    # existing behaviour kept
    t = "User-agent: *\nDisallow: /a\nAllow: /a/b\nDisallow: /*.pdf$\n"
    res, _ = run(t, ["/a/c", "/a/b", "/z", "/f.pdf", "/f.pdfx", "/robots.txt"], only=True)
    check("longest/allow/wildcard", [r["declared_ok"] for r in res] == [False, True, True, False, True, True])
    t = "User-agent: *\nDisallow: /t\nAllow: /t\n"
    res, _ = run(t, ["/t"], only=True)
    check("allow wins tie", res[0]["declared_ok"])

    # 5. decoding
    for name, data in (("utf16 bom", b"\xff\xfeU\x00s\x00"), ("bad utf8", b"User-agent: *\n\xff\xfe\xfd"),
                       ("nul", b"User-agent: *\x00\n")):
        try:
            decode_robots(data)
            check("5 " + name, False)
        except Unparseable:
            pass
    check("5 utf8 bom ok", decode_robots(b"\xef\xbb\xbfUser-agent: *\n").startswith("User-agent"))
    check("5 utf8 text ok", "é" in decode_robots("User-agent: *\n# é\n".encode("utf-8")))

    if bad:
        print("self-test FAILED:", ", ".join(bad), file=sys.stderr)
        return 1
    print("self-test passed")
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--self-test", action="store_true", help="run built-in assertions, no network")
    src = ap.add_mutually_exclusive_group()
    src.add_argument("--file")
    src.add_argument("--site")
    ap.add_argument("--agent", default="research-fetcher")
    ap.add_argument("--agents-only-declared", action="store_true",
                    help="check only --agent (diagnosing); the default checks the full AI set too")
    ap.add_argument("urls", nargs="*")
    args = ap.parse_args()
    if args.self_test:
        return self_test()
    if not (args.file or args.site) or not args.urls:
        print("fault: give --file or --site, and at least one address", file=sys.stderr)
        return EXIT_FAULT
    if args.site and urllib.parse.urlsplit(args.site).scheme not in ("http", "https"):
        print("fault: --site must start with the http or https scheme", file=sys.stderr)
        return EXIT_FAULT
    if args.site and not urllib.parse.urlsplit(args.site).netloc:
        print("fault: --site has no host", file=sys.stderr)
        return EXIT_FAULT
    for url in args.urls:
        p = urllib.parse.urlsplit(url)
        if p.scheme not in ("http", "https") or not p.netloc:
            print("fault: not a full http(s) address:", url, file=sys.stderr)
            return EXIT_FAULT
        if args.site and p.netloc.lower() != urllib.parse.urlsplit(args.site).netloc.lower():
            print("fault: address is on another host than --site:", url, file=sys.stderr)
            return EXIT_FAULT
    try:
        text = load(args)
    except Unreachable as e:
        print("unreachable: robots file could not be fetched:", e, file=sys.stderr)
        return EXIT_UNREACHABLE
    except Unparseable as e:
        print("unparseable: treated as closed (deny):", e, file=sys.stderr)
        return EXIT_UNPARSEABLE
    except (OSError, ValueError) as e:
        print("fault:", e, file=sys.stderr)
        return EXIT_FAULT
    results, delay = evaluate(text, args.agent, args.agents_only_declared, args.urls)
    denied = refused = False
    names = []
    for r in results:
        # a refusal: any AI-agent token is denied for this address, whether a
        # group names it or the "*" group shuts it out (the whole set counts).
        is_ref = bool(r["refusers"])
        denied |= not r["declared_ok"]
        refused |= is_ref
        ok = r["declared_ok"] and not r["refusers"]
        print("ALLOW" if ok else "DENY ", r["url"])
        if is_ref:
            for n, named in r["refusers"]:
                if n not in names:
                    names.append(n)
                print("  refused by %s%s" % (n, "" if named else " (via the * group)"))
    if refused:
        print("REFUSED: AI-agent token(s) denied: " + ", ".join(names)
              + ". Treat as a refusal for the whole site: no workaround, no archive or cache route.")
    elif denied and results[0]["declared_named"]:
        print("note: a group naming your agent applies; treat DENY as a refusal")
    if args.agents_only_declared:
        print("note: only the declared agent was checked; the default checks the full set")
    print("crawl-delay:", delay or "none stated")
    if refused:
        return EXIT_REFUSED
    return EXIT_DENY if denied else EXIT_OK


if __name__ == "__main__":
    sys.exit(main())
