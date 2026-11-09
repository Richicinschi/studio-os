"""Luck check for a list of per-trade results (stdlib only).

Reads one number per line (or a CSV column) = result of one closed trade, in
order, as a fraction (0.012 = +1.2%) or in money. Subtracts a per-trade cost,
then reports: trade count, mean, a sign-flip permutation p-value and a centered
bootstrap p-value against "true mean is zero or less", a 95% bootstrap
interval for the mean, max drawdown of the running sum, a correction for the
number of strategies tried, and a one-line verdict followed by a fixed warning
about look-ahead and survivorship.
Usage: python bootstrap_check.py results.txt --cost 0.001 --tries 20
       python bootstrap_check.py results.txt --decimal ,      (decimal commas)
       python bootstrap_check.py --self-test
Decimal commas: --decimal auto (default) detects "0,0159" style numbers and says
so; --decimal "," or --decimal "." forces one reading. A value that does not fit
the chosen reading is skipped and listed, never turned into 0 or guessed.
Not investment advice. A pass is not proof; a fail is informative.
"""
import argparse, csv, math, random, re, statistics, sys

# Printed with every verdict, always.
WARNING = ("WARNING: a result that looks unlikely to be luck is NOT evidence of edge on its own. "
           "It applies only if the trades were generated without any future data (no look-ahead) "
           "and from a universe free of survivorship bias (delisted and failed names included).")

DC_LINE = re.compile(r"^\s*[-+]?\d+,\d+\s*$")           # a whole line like 0,0159
THOUSANDS_DOT = re.compile(r"^[-+]?\d{1,3}(\.\d{3})+,\d+$")  # 1.234,50
THOUSANDS_COMMA = re.compile(r"^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$")  # 1,234.50


def parse_number(text, decimal):
    """Return a finite float or None. Never guesses: a mismatching format gives None."""
    t = text.strip().replace(" ", "").replace(" ", "")
    if not t:
        return None
    try:
        if decimal == ",":
            if "." in t:
                if not THOUSANDS_DOT.match(t):
                    return None
                t = t.replace(".", "")
            t = t.replace(",", ".")
        else:
            if "," in t:
                if not THOUSANDS_COMMA.match(t):
                    return None
                t = t.replace(",", "")
        x = float(t)
    except ValueError:
        return None
    return x if math.isfinite(x) else None


def parse_text(text, column, decimal="auto", delimiter=None):
    """Return (values, info). info: skipped (list of (line_no, text)), header, decimal, delimiter, notes."""
    lines = text.splitlines()
    nonblank = [(i + 1, ln) for i, ln in enumerate(lines) if ln.strip()]
    notes = []
    if delimiter is None:
        joined = "\n".join(ln for _, ln in nonblank)
        delimiter = ";" if ";" in joined else ("\t" if "\t" in joined else ",")
    whole_line = False
    if decimal == "auto":
        decimal = "."
        if delimiter == ",":
            body = [ln for _, ln in nonblank if re.match(r"^\s*[-+]?[\d.,]", ln)]
            if column == 0 and body and sum(1 for ln in body if DC_LINE.match(ln)) == len(body):
                decimal, whole_line = ",", True
                notes.append("note: every line looks like a decimal-comma number (0,0159); read as decimal commas, one value per line. "
                             "If these are really two columns, rerun with --decimal \".\".")
        else:
            cells = []
            for _, ln in nonblank:
                parts = ln.split(delimiter)
                if column < len(parts):
                    cells.append(parts[column].strip())
            if any(re.match(r"^[-+]?\d+,\d+$", c) for c in cells):
                decimal = ","
                notes.append("note: found decimal-comma numbers; read as decimal commas. Rerun with --decimal \".\" to force the other reading.")
    elif decimal == ",":
        # a one-column file of 0,0159 values cannot use "," as the delimiter
        if delimiter == ",":
            whole_line = True
    vals, skipped, header = [], [], 0
    for no, ln in nonblank:
        if whole_line:
            cell = ln
        else:
            if delimiter == "," and decimal == "." and DC_LINE.match(ln):
                # "-23,50" would be read as a two-column row and give -23: refuse, say why
                skipped.append((no, ln.strip()[:40] + " (looks like a decimal comma; use --decimal \",\")"))
                continue
            row = next(csv.reader([ln], delimiter=delimiter))
            if column >= len(row):
                skipped.append((no, ln.strip()[:40]))
                continue
            cell = row[column]
        x = parse_number(cell, decimal)
        if x is None:
            if no == nonblank[0][0] and not re.match(r"^\s*[-+]?[\d.,]", cell):
                header += 1  # a text header on the first line is normal
            else:
                skipped.append((no, cell.strip()[:40]))
            continue
        vals.append(x)
    return vals, {"skipped": skipped, "header": header, "decimal": decimal, "delimiter": delimiter, "notes": notes}


def load(path, column, decimal="auto", delimiter=None):
    try:
        with open(path, encoding="utf-8-sig") as f:
            text = f.read()
    except (OSError, UnicodeDecodeError) as e:
        sys.exit(f"Cannot read {path}: {e}")
    vals, info = parse_text(text, column, decimal, delimiter)
    for n in info["notes"]:
        print(n, file=sys.stderr)
    print(f"read {len(vals)} value(s); skipped {len(info['skipped'])} unparsed line(s)"
          + (f"; {info['header']} header line" if info["header"] else "")
          + f"; decimal='{info['decimal']}'", file=sys.stderr)
    if info["skipped"]:
        shown = ", ".join(f"line {n}: {t!r}" for n, t in info["skipped"][:5])
        more = "" if len(info["skipped"]) <= 5 else f" (+{len(info['skipped']) - 5} more)"
        print(f"warning: these lines were NOT used and nothing was put in their place: {shown}{more}", file=sys.stderr)
    return vals


def max_drawdown(xs):
    peak = run = worst = 0.0
    for x in xs:
        run += x
        peak = max(peak, run)
        worst = min(worst, run - peak)
    return worst


def verdict(n, mean, p_adj, lo):
    if n < 30:  # 30 is a starting-point floor, not a measured value
        return "TOO FEW TRADES: cannot tell skill from luck."
    if mean <= 0:
        return "NO EDGE SHOWN: average result after costs is not positive."
    if p_adj < 0.05 and lo > 0:
        return ("LOOKS UNLIKELY TO BE LUCK on this data, which is not proof of edge; "
                "next test it on data you have never touched.")
    return "CANNOT RULE OUT LUCK: could easily happen by chance."


def self_test():
    ok = True

    def check(name, cond):
        nonlocal ok
        print(("PASS " if cond else "FAIL ") + name)
        ok = ok and cond

    v, i = parse_text("0,0159\n-0,02\n0,01\n", 0)
    check("decimal comma one column auto", v == [0.0159, -0.02, 0.01] and i["decimal"] == ",")
    v, i = parse_text("ret;x\n0,5;1\n-1,25;2\n", 0)
    check("semicolon file auto decimal comma, header counted", v == [0.5, -1.25] and i["header"] == 1)
    v, i = parse_text("0.5\n-1.25\n2\n", 0)
    check("plain dots", v == [0.5, -1.25, 2.0])
    v, i = parse_text("0.5\n-23,50\nabc\n", 0, decimal=".")
    check("dot mode rejects 23,50 and text, none turned into 0", v == [0.5] and len(i["skipped"]) == 2)
    v, i = parse_text("0,5\n1.234,50\n12.5\n", 0, decimal=",")
    check("comma mode: thousands dot ok, 12.5 rejected", v == [0.5, 1234.5] and len(i["skipped"]) == 1)
    v, i = parse_text("1\nnan\ninf\n", 0)
    check("nan and inf skipped", v == [1.0] and len(i["skipped"]) == 2)
    check("fixed warning mentions look-ahead and survivorship", "look-ahead" in WARNING and "survivorship" in WARNING)
    check("verdict pass wording is not proof", "not proof of edge" in verdict(100, 0.1, 0.01, 0.05))
    print("SELF-TEST " + ("OK" if ok else "FAILED"))
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file", nargs="?")
    ap.add_argument("--self-test", action="store_true", help="run the built-in checks and exit")
    ap.add_argument("--column", type=int, default=0)
    ap.add_argument("--decimal", default="auto", choices=["auto", ".", ","], help="decimal mark; auto detects 0,0159")
    ap.add_argument("--cost", type=float, default=0.0, help="per-trade cost, same unit as results")
    ap.add_argument("--tries", type=int, default=1, help="how many strategies/settings you tried to find this one")
    ap.add_argument("--reps", type=int, default=10000)
    ap.add_argument("--seed", type=int, default=1)
    a = ap.parse_args()
    if a.self_test:
        sys.exit(self_test())
    if not a.file:
        ap.error("the results file is required (or use --self-test)")
    if a.reps < 100:
        sys.exit("--reps must be at least 100.")
    if a.tries < 1:
        sys.exit("--tries must be at least 1 (1 means this was the only idea tried).")
    if a.column < 0:
        sys.exit("--column counts from 0.")

    xs = [x - a.cost for x in load(a.file, a.column, a.decimal)]
    n = len(xs)
    if n < 2:
        sys.exit("Need at least 2 numeric results.")
    rng = random.Random(a.seed)
    mean = statistics.fmean(xs)
    sd = statistics.stdev(xs)

    # sign-flip permutation: with no edge, each result is as likely to be its mirror image
    ge = sum(1 for _ in range(a.reps)
             if sum(x if rng.random() < 0.5 else -x for x in xs) / n >= mean)
    p_perm = (ge + 1) / (a.reps + 1)

    # centered bootstrap: shift data to mean zero, resample, count means at least as large
    centered = [x - mean for x in xs]
    ge = sum(1 for _ in range(a.reps)
             if statistics.fmean(rng.choices(centered, k=n)) >= mean)
    p_boot = (ge + 1) / (a.reps + 1)

    means = sorted(statistics.fmean(rng.choices(xs, k=n)) for _ in range(a.reps))
    lo, hi = means[int(0.025 * a.reps)], means[int(0.975 * a.reps) - 1]

    p = max(p_perm, p_boot)
    p_adj = min(1.0, 1 - (1 - p) ** a.tries) if a.tries > 1 else p  # Sidak-style
    dd = max_drawdown(xs)

    print(f"trades={n} cost_per_trade={a.cost}")
    print(f"mean_after_cost={mean:.6g} sd={sd:.6g} total={sum(xs):.6g}")
    print(f"p_permutation={p_perm:.4f} p_bootstrap={p_boot:.4f} tries={a.tries} p_adjusted={p_adj:.4f}")
    print(f"mean 95% interval=[{lo:.6g}, {hi:.6g}] max_drawdown_of_running_sum={dd:.6g}")
    print("VERDICT:", verdict(n, mean, p_adj, lo))
    print(WARNING)


if __name__ == "__main__":
    main()
