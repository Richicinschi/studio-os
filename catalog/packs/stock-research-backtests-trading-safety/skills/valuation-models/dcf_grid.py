"""dcf_grid.py: a small DCF with a sensitivity grid and a reverse DCF. Stdlib only.

Usage:  python dcf_grid.py assumptions.json
        python dcf_grid.py --demo        (runs on made-up numbers)
        python dcf_grid.py --self-test   (built-in checks)
Rates are fractions. Accepted ranges: wacc 0.01 to 0.40, terminal_g -0.05 to
0.10, growth -0.50 to 1.00; anything else exits 2 with a message.

assumptions.json keys (all numbers, money in one currency, one unit):
  fcf0           last year's free cash flow
  growth         first-year FCF growth, e.g. 0.12
  fade_years     years over which growth fades linearly to terminal growth
  terminal_g     long-run growth after the explicit years, e.g. 0.025
  wacc           discount rate, e.g. 0.09
  net_debt       debt minus cash (negative if net cash)
  shares         share count in the same unit as fcf0
  price          current market price per share (optional, for sanity checks)
It prints: a base value per share, a WACC x terminal-growth grid, a
low/base/high range, what growth the market price implies, and warnings.
Illustrative arithmetic only, not investment advice.
"""
import json
import sys

# DEMO: made-up numbers for a smoke test, not data about any company.
DEMO = {"fcf0": 100.0, "growth": 0.10, "fade_years": 8, "terminal_g": 0.025,
        "wacc": 0.09, "net_debt": 200.0, "shares": 50.0, "price": 40.0}


def value_per_share(a, wacc=None, tg=None, growth=None):
    """Return (value per share, terminal share of enterprise value) or None."""
    wacc = a["wacc"] if wacc is None else wacc
    tg = a["terminal_g"] if tg is None else tg
    g0 = a["growth"] if growth is None else growth
    if wacc <= tg or wacc <= 0:
        return None  # terminal formula breaks when discount rate <= growth; a grid step can also push wacc to zero or below
    n = int(a["fade_years"])
    fcf, pv = a["fcf0"], 0.0
    for t in range(1, n + 1):
        g = g0 + (tg - g0) * (t - 1) / max(n - 1, 1)  # linear fade to tg
        fcf *= 1 + g
        pv += fcf / (1 + wacc) ** t
    tv_pv = fcf * (1 + tg) / (wacc - tg) / (1 + wacc) ** n
    pv += tv_pv
    return (pv - a["net_debt"]) / a["shares"], tv_pv / pv


def per_share(a, **kw):
    r = value_per_share(a, **kw)
    return None if r is None else r[0]


def implied_growth(a, price):
    """Bisect the first-year growth that makes the model equal the price."""
    lo, hi = -0.5, 1.0
    flo, fhi = per_share(a, growth=lo), per_share(a, growth=hi)
    if flo is None or not (flo <= price <= fhi):
        return None
    for _ in range(80):
        mid = (lo + hi) / 2
        if per_share(a, growth=mid) < price:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


# Sane ranges, as fractions. Outside these the input is almost surely a units slip.
RANGES = {"wacc": (0.01, 0.40), "terminal_g": (-0.05, 0.10), "growth": (-0.50, 1.00)}

REQUIRED = ("fcf0", "growth", "fade_years", "terminal_g", "wacc", "net_debt", "shares")


def check(a):
    """Return a message if the assumptions are unusable, else None."""
    if not isinstance(a, dict):
        return "assumptions.json must hold one JSON object with the keys named in the header."
    missing = [k for k in REQUIRED if k not in a]
    if missing:
        return "Missing keys: " + ", ".join(missing)
    for k in REQUIRED + (("price",) if "price" in a else ()):
        v = a[k]
        if isinstance(v, bool) or not isinstance(v, (int, float)) or v != v or abs(v) == float("inf"):
            return f"Key {k} must be a finite number, got {v!r}"
    if a["shares"] <= 0:
        return "shares must be above zero."
    if "price" in a and a["price"] <= 0:
        return "price must be above zero (leave the key out if unknown)."
    if a["fade_years"] < 0 or a["fade_years"] > 100:
        return "fade_years must be between 0 and 100."
    for k, (lo, hi) in RANGES.items():
        if not lo <= a[k] <= hi:
            return f"{k} = {a[k]} is outside the sane range {lo} to {hi} (fractions, so 0.09 means 9%). Check the units; a wacc of -1 or below makes the discount factor zero or negative."
    if a["fcf0"] <= 0:
        return "fcf0 must be positive: this model does not suit a company with negative or zero free cash flow (see the skill, step 2)."
    return None


def self_test():
    ok = True

    def chk(name, cond):
        nonlocal ok
        print(("PASS " if cond else "FAIL ") + name)
        ok = ok and cond

    chk("demo passes check", check(dict(DEMO)) is None)
    for k, bad in (("wacc", -1.0), ("wacc", -2.0), ("wacc", 9.0), ("wacc", 0.0), ("terminal_g", 0.5), ("growth", 5.0)):
        a = dict(DEMO)
        a[k] = bad
        m = check(a)
        chk(f"{k}={bad} rejected with a range message", m is not None and "sane range" in m)
    a = dict(DEMO)
    a["fade_years"] = 0
    chk("fade_years 0 still accepted by check", check(a) is None)
    chk("fade_years 0 value computed", value_per_share(a) is not None)
    chk("wacc <= terminal_g gives None", value_per_share(dict(DEMO), wacc=0.02, tg=0.025) is None)
    print("SELF-TEST " + ("OK" if ok else "FAILED"))
    return 0 if ok else 1


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    if argv[1] == "--self-test":
        return self_test()
    if argv[1] == "--demo":
        a = DEMO
    else:
        try:
            with open(argv[1], encoding="utf-8-sig") as fh:
                a = json.load(fh)
        except (OSError, ValueError) as e:
            print(f"Cannot read assumptions from {argv[1]}: {e}")
            return 2
    problem = check(a)
    if problem:
        print(problem)
        return 2
    base = value_per_share(a)
    if base is None:
        print("wacc must be above terminal_g")
        return 1
    v, tv_share = base
    print("ASSUMPTIONS:", json.dumps(a, sort_keys=True))
    print(f"\nBase value per share: {v:.2f}   (terminal value = {tv_share:.0%} of enterprise value)")
    waccs = [a["wacc"] + d for d in (-0.02, -0.01, 0, 0.01, 0.02)]
    tgs = [a["terminal_g"] + d for d in (-0.01, -0.005, 0, 0.005, 0.01)]
    print("\nValue per share, rows = WACC, columns = terminal growth")
    print("        " + "".join(f"{g:>9.1%}" for g in tgs))
    for w in waccs:
        row = [per_share(a, wacc=w, tg=g) for g in tgs]
        print(f"{w:>7.1%} " + "".join("      n/a" if x is None else f"{x:>9.2f}" for x in row))
    inner = [per_share(a, wacc=w, tg=g) for w in waccs[1:4] for g in tgs[1:4]]
    inner = [x for x in inner if x is not None]
    print(f"\nRange (middle 3x3 of the grid): low {min(inner):.2f}, base {v:.2f}, high {max(inner):.2f}")
    warn = []
    if a["fade_years"] == 0:
        warn.append("fade_years is 0: there is no explicit forecast, so the first-year growth input has no effect and the value is only the terminal formula on last year's cash flow; the reverse DCF cannot move growth either")
    if tv_share > 0.75:
        warn.append("terminal value is over 75% of the total (a starting-point threshold): the answer rests on the far future")
    if a["terminal_g"] > 0.04:
        warn.append("terminal growth above 4% is high (a starting-point threshold): check it against the official long-run growth forecast for the currency")
    if a["wacc"] - a["terminal_g"] < 0.03:
        warn.append("WACC minus terminal growth under 3 points (a starting-point threshold): the value is very touchy")
    if "price" in a:
        p = a["price"]
        print(f"\nMarket price {p:.2f}: base value is {v / p - 1:+.0%} versus price")
        if p < min(inner):
            print("Price is BELOW the whole range: either cheap or the assumptions are too kind.")
        elif p > max(inner):
            print("Price is ABOVE the whole range: either dear or the assumptions are too harsh.")
        else:
            print("Price sits inside the range: the model cannot separate it from fair.")
        g = implied_growth(a, p)
        print("Reverse DCF, first-year growth the price implies with other inputs held: "
              + ("outside -50%..100%, check inputs" if g is None else f"{g:.1%} (model used {a['growth']:.1%})"))
    for w in warn:
        print("WARNING:", w)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
