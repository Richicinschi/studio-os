#!/usr/bin/env python3
"""balance_sim.py: two small checks for game numbers, standard library only.

  curve  Print the cost of each level for a growth curve, the running total,
         and how long each level takes at a given income per minute.
         python balance_sim.py curve --base 100 --growth 1.15 --levels 30 --income 60

  drops  Sample a drop table many times with a fixed seed and report how many
         tries a player needs to get each item (mean, median, 90th percentile,
         worst seen). Table format: name:weight, comma separated.
         python balance_sim.py drops --table "common:80,rare:19,epic:1" --trials 20000 --seed 7
         Draws that hit the cap (--cap) are counted and shown as capped and
         capped_share, and are left OUT of mean, median, p90 and worst, so those
         columns describe finished draws only (they read low when capped is above 0).

  python balance_sim.py --self-test   runs the built-in checks (exit 0 = pass).

Exit codes: 0 ok, 1 bad option value, 2 a --base that is not finite or whose
curve overflows. Same seed gives the same numbers, so a result can be repeated
and compared before and after a change. Output is plain text. Nothing is
written to disk.
"""
import argparse
import math
import random
import statistics
import sys


def fail_base(msg):
    print("error: " + msg, file=sys.stderr)
    sys.exit(2)


def curve(a):
    if a.levels < 1:
        sys.exit("--levels must be 1 or more")
    if not (a.base > 0 and math.isfinite(a.base)):
        fail_base("--base must be a finite number above zero")
    if not (a.growth > 0 and math.isfinite(a.growth)):
        sys.exit("--growth must be a finite number above zero")
    if not math.isfinite(a.income) or a.income < 0:
        sys.exit("--income must be a finite number, zero or more")
    # Compute every row first, so an overflow stops the run before any table is printed.
    total = 0.0
    rows = []
    for lv in range(1, a.levels + 1):
        try:
            if a.kind == "exp":
                cost = a.base * (a.growth ** (lv - 1))
            else:
                cost = a.base * (lv ** a.growth)
        except OverflowError:
            cost = math.inf
        total += cost
        if not (math.isfinite(cost) and math.isfinite(total)):
            fail_base("--base %g overflows at level %d: lower --base, --growth or --levels" % (a.base, lv))
        if a.income > 0 and not math.isfinite(cost / a.income):
            fail_base("--base %g with --income %g overflows at level %d" % (a.base, a.income, lv))
        rows.append((lv, cost, total))
    if a.income == 0:
        print("note: no --income given, so the minutes column is shown as n/a")
    print("level  cost        total        minutes_at_income")
    prev_minutes = None
    for lv, cost, total in rows:
        if a.income > 0:
            mins = cost / a.income
            jump = "" if not prev_minutes else "  x%.2f" % (mins / prev_minutes)
            print("%-6d %-11.1f %-12.1f %.1f%s" % (lv, cost, total, mins, jump))
            prev_minutes = mins
        else:
            print("%-6d %-11.1f %-12.1f n/a" % (lv, cost, total))
    if a.income > 0:
        print("\nTotal to reach level %d: %.1f minutes (%.1f hours) at income %s per minute"
              % (a.levels, total / a.income, total / a.income / 60, a.income))
    print("Last column x shows how much longer a level takes than the one before. "
          "As a starting guideline, not a measured value: ratios from 1.05 to 1.3 read as steady; jumps far above that are walls.")


def parse_table(text):
    items = []
    for part in text.split(","):
        name, _, w = part.strip().partition(":")
        if not name or not w:
            sys.exit("bad table entry: %r (use name:weight)" % part)
        try:
            weight = float(w)
        except ValueError:
            sys.exit("bad weight in %r: not a number (use name:weight)" % part)
        items.append((name.strip(), weight))
    if any(not (w > 0 and math.isfinite(w)) for _, w in items):
        sys.exit("weights must be finite numbers above zero")
    names = [n for n, _ in items]
    if len(set(names)) != len(names):
        sys.exit("duplicate item name in table; give each item one entry")
    return items


def drops(a):
    if a.trials < 1:
        sys.exit("--trials must be 1 or more")
    if a.cap < 1:
        sys.exit("--cap must be 1 or more")
    items = parse_table(a.table)
    names = [n for n, _ in items]
    weights = [w for _, w in items]
    total_w = sum(weights)
    rng = random.Random(a.seed)
    print("item        chance    mean_tries  median  p90   worst  capped  capped_share")
    for name, w in items:
        p = w / total_w
        done, capped = [], 0
        for _ in range(a.trials):
            n = 1
            while rng.choices(names, weights)[0] != name:
                n += 1
                if n > a.cap:
                    break
            if n > a.cap:
                capped += 1
            else:
                done.append(n)
        share = "%.1f%%" % (100.0 * capped / a.trials)
        if done:
            done.sort()
            p90 = done[int(0.9 * (len(done) - 1))]
            print("%-11s %-9.4f %-11.1f %-7d %-5d %-6d %-7d %s" % (
                name, p, statistics.mean(done), statistics.median(done), p90, done[-1], capped, share))
        else:
            print("%-11s %-9.4f %-11s %-7s %-5s %-6s %-7d %s" % (
                name, p, "n/a", "n/a", "n/a", "n/a", capped, share))
    print("\nMean tries is about 1/chance, but the 90th percentile is what "
          "the unlucky tenth of players feel. Cap per sample: %d tries. "
          "Draws that hit the cap are counted in capped and left out of the other "
          "columns, so mean, median, p90 and worst cover finished draws only "
          "and read low when capped is above zero." % a.cap)


def self_test():
    import contextlib
    import io

    def run(argv):
        buf, err = io.StringIO(), io.StringIO()
        old = sys.argv
        sys.argv = ["balance_sim.py"] + argv
        code = 0
        try:
            with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(err):
                main()
        except SystemExit as e:
            code = e.code if isinstance(e.code, int) else 1
        finally:
            sys.argv = old
        return code, buf.getvalue(), err.getvalue()

    fails = []

    def check(name, ok):
        print(("pass  " if ok else "FAIL  ") + name)
        if not ok:
            fails.append(name)

    code, out, _ = run(["drops", "--table", "a:1,b:4", "--trials", "300", "--seed", "3", "--cap", "5"])
    row = [l for l in out.splitlines() if l.startswith("a ")][0].split()
    check("capped draws counted and shown", code == 0 and int(row[6]) > 0 and row[7].endswith("%"))
    check("worst never above cap (capped excluded)", int(row[5]) <= 5)
    code, out, _ = run(["drops", "--table", "a:1,b:999999", "--trials", "50", "--cap", "1"])
    check("all-capped gives n/a, not a crash", code == 0 and "n/a" in out and "100.0%" in out)
    code, out, _ = run(["drops", "--table", "a:1,b:1", "--trials", "200", "--seed", "7"])
    check("no capped draws shows 0.0%", code == 0 and "0.0%" in out)
    code, out, err = run(["curve", "--base", "1e308", "--levels", "30"])
    check("overflowing --base exits 2 with message, no table", code == 2 and "overflows" in err and "level" not in out)
    code, _, err = run(["curve", "--base", "1e999"])
    check("infinite --base exits 2", code == 2 and "finite" in err)
    code, out, _ = run(["curve", "--base", "100", "--levels", "3", "--income", "60"])
    check("normal curve still exits 0", code == 0 and "Total to reach level 3" in out)
    print("%d check(s) failed" % len(fails) if fails else "all checks passed")
    return 1 if fails else 0


def main():
    if sys.argv[1:] == ["--self-test"]:
        sys.exit(self_test())
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("curve")
    c.add_argument("--base", type=float, default=100)
    c.add_argument("--growth", type=float, default=1.15)
    c.add_argument("--levels", type=int, default=30)
    c.add_argument("--income", type=float, default=0, help="currency earned per minute")
    c.add_argument("--kind", choices=["exp", "power"], default="exp",
                   help="exp: base*growth^(n-1); power: base*n^growth")
    d = sub.add_parser("drops")
    d.add_argument("--table", required=True)
    d.add_argument("--trials", type=int, default=10000)
    d.add_argument("--seed", type=int, default=1)
    d.add_argument("--cap", type=int, default=100000)
    a = ap.parse_args()
    if a.cmd == "curve":
        curve(a)
    else:
        drops(a)


if __name__ == "__main__":
    main()
