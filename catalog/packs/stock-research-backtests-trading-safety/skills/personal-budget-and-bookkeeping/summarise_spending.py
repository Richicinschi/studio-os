#!/usr/bin/env python3
"""Monthly spending summary from a bank CSV export. Python 3.8+, standard library only.

Reads a CSV, gives every row a category by matching keywords from a rules file
against the description, and prints a table: one row per category, one column
per month, money OUT shown as positive spending, money IN listed separately.
Nothing is sent anywhere; the script never touches the network.

Usage:
  python summarise_spending.py bank.csv rules.txt
  python summarise_spending.py bank.csv rules.txt --date-col Date --desc-col Memo \
      --amount-col Amount --date-format %d-%m-%Y --delimiter ";" --decimal ","

Rules file: one rule per line, "keyword = Category". Case-insensitive, first
match wins, lines starting with # are ignored. No match gives "Uncategorised".
A rule whose category is "Transfers" removes those rows from spending and income.
Prints the uncategorised descriptions at the end so you can add rules.
For a separate Debit/Credit column pair use --debit-col and --credit-col; the
debit column is read as its absolute value (a debit of 25.00 or -25.00 both
mean 25.00 out), the credit column as given. An empty cell in either is zero.
Amounts that do not fit --decimal (for example "-23,50" with --decimal ".") are
skipped and reported with their line numbers, never guessed.
  python summarise_spending.py --self-test
"""
import argparse, csv, math, re, sys
from collections import defaultdict
from datetime import datetime


def read_text(path, what):
    """Return the file text. Tries UTF-16 (with byte-order mark), then UTF-8, then Windows-1252."""
    try:
        with open(path, "rb") as f:
            raw = f.read()
    except OSError as e:
        sys.exit(f"Cannot read the {what} file '{path}': {e.strerror or e}")
    if raw.startswith((b"\xff\xfe", b"\xfe\xff")):
        return raw.decode("utf-16", errors="replace")
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        print(f"Note: the {what} file is not UTF-8; read as Windows-1252. Check accented characters.", file=sys.stderr)
        return raw.decode("cp1252", errors="replace")


THOUSANDS_DOT = re.compile(r"^[-+]?\d{1,3}(\.\d{3})+(,\d+)?$")    # 1.234,50 or 1.234
THOUSANDS_COMMA = re.compile(r"^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$")  # 1,234.50 or 1,234


def num(text, decimal, allow_empty=False):
    """Parse money text. A format that does not fit the chosen decimal mark is an error,
    never a guess: with decimal '.', '-23,50' is rejected (not read as -2350)."""
    if text is None:  # the row is shorter than the header
        raise ValueError("missing field")
    t = text.strip().replace(" ", "").replace(" ", "")
    if not t:
        if allow_empty:
            return 0.0  # an empty debit or credit cell is normal in a two-column export
        raise ValueError("empty amount")
    if decimal == ",":
        if "." in t:
            if not THOUSANDS_DOT.match(t):
                raise ValueError("dot in a decimal-comma number")
            t = t.replace(".", "")
        t = t.replace(",", ".")
    else:
        if "," in t:
            if not THOUSANDS_COMMA.match(t):
                raise ValueError("comma in a decimal-point number")
            t = t.replace(",", "")
    value = float(t)
    if not math.isfinite(value):
        raise ValueError("not a finite number")
    return value


def load_rules(path):
    rules = []
    for line in read_text(path, "rules").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, cat = line.split("=", 1)
            if key.strip() and cat.strip():
                rules.append((key.strip().lower(), cat.strip()))
    return rules


def self_test():
    ok = True

    def chk(name, cond):
        nonlocal ok
        print(("PASS " if cond else "FAIL ") + name)
        ok = ok and cond

    def fails(text, dec, empty=False):
        try:
            num(text, dec, empty)
            return False
        except ValueError:
            return True

    chk("23.50 point", num("23.50", ".") == 23.5)
    chk("-23,50 with point is rejected, not -2350", fails("-23,50", "."))
    chk("1,234.50 thousands comma ok", num("1,234.50", ".") == 1234.5)
    chk("1.234,50 decimal comma", num("1.234,50", ",") == 1234.5)
    chk("-23,50 decimal comma", num("-23,50", ",") == -23.5)
    chk("12.5 with decimal comma is rejected", fails("12.5", ","))
    chk("empty amount rejected", fails("", "."))
    chk("empty debit cell allowed", num("", ".", True) == 0.0)
    chk("nan rejected", fails("nan", "."))
    print("SELF-TEST " + ("OK" if ok else "FAILED"))
    return 0 if ok else 1


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("csv_file", nargs="?")
    p.add_argument("rules_file", nargs="?")
    p.add_argument("--self-test", action="store_true", help="run the built-in checks and exit")
    p.add_argument("--date-col", default="Date")
    p.add_argument("--desc-col", default="Description")
    p.add_argument("--amount-col", default="Amount")
    p.add_argument("--debit-col")
    p.add_argument("--credit-col")
    p.add_argument("--date-format", default="%Y-%m-%d")
    p.add_argument("--delimiter", default=",")
    p.add_argument("--decimal", default=".", choices=[".", ","])
    a = p.parse_args()
    if a.self_test:
        sys.exit(self_test())
    if not a.csv_file or not a.rules_file:
        p.error("csv_file and rules_file are required (or use --self-test)")
    if a.credit_col and not a.debit_col:
        print("Warning: --credit-col was given without --debit-col, so it is ignored and the --amount-col column is used. "
              "Give both for a Debit/Credit export.", file=sys.stderr)
    if len(a.delimiter) != 1:
        sys.exit('--delimiter must be exactly one character, for example "," or ";".')
    if a.debit_col and not a.credit_col:
        sys.exit("--debit-col needs --credit-col as well.")
    rules = load_rules(a.rules_file)
    if not rules:
        print("Note: the rules file has no usable 'keyword = Category' lines; everything will be Uncategorised.", file=sys.stderr)
    spend = defaultdict(lambda: defaultdict(float))
    income = defaultdict(float)
    unknown = defaultdict(int)
    months, bad, moved, bad_lines = set(), 0, 0, []
    text = read_text(a.csv_file, "CSV")
    reader = csv.DictReader(text.splitlines(), delimiter=a.delimiter, strict=True)
    try:
        if not reader.fieldnames:
            sys.exit("The CSV file is empty.")
        wanted = [a.date_col, a.desc_col, a.debit_col, a.credit_col] if a.debit_col else [a.date_col, a.desc_col, a.amount_col]
        missing = [c for c in wanted if c and c not in reader.fieldnames]
        if missing:
            sys.exit(f"Column(s) not found: {missing}. The file has: {reader.fieldnames}")
        for row in reader:
            try:
                month = datetime.strptime(row[a.date_col].strip(), a.date_format).strftime("%Y-%m")
                if a.debit_col:
                    amt = (num(row[a.credit_col], a.decimal, True)
                           - abs(num(row[a.debit_col], a.decimal, True)))
                else:
                    amt = num(row[a.amount_col], a.decimal)
            except (KeyError, ValueError, AttributeError, TypeError) as e:
                bad += 1
                if len(bad_lines) < 5:
                    bad_lines.append(f"line {reader.line_num}: {e}")
                continue
            desc = row.get(a.desc_col)
            desc = desc if isinstance(desc, str) else ""
            months.add(month)
            cat = next((c for k, c in rules if k in desc.lower()), None)
            if cat is not None and cat.lower() == "transfers":
                moved += 1  # own-account moves count as neither spending nor income
                continue
            if amt >= 0:
                income[month] += amt
                continue
            if cat is None:
                cat = "Uncategorised"
                unknown[desc.strip()] += 1
            spend[cat][month] += -amt
    except csv.Error as e:
        sys.exit(f"The CSV could not be parsed (line {reader.line_num}): {e}. Check the delimiter and quotes.")

    cols = sorted(months)
    if not cols:
        sys.exit("No usable rows. Check --date-col, --amount-col, --date-format, --delimiter, --decimal.")
    w = max([len(c) for c in spend] + [8, len("Income (in)")])
    print("Category".ljust(w), *[m.rjust(10) for m in cols], "Total".rjust(10))
    totals = defaultdict(float)
    for cat in sorted(spend, key=lambda c: -sum(spend[c].values())):
        vals = [spend[cat].get(m, 0.0) for m in cols]
        for m, v in zip(cols, vals):
            totals[m] += v
        print(cat.ljust(w), *[f"{v:10.2f}" for v in vals], f"{sum(vals):10.2f}")
    print("-" * (w + 11 * (len(cols) + 1)))
    print("Spending".ljust(w), *[f"{totals[m]:10.2f}" for m in cols], f"{sum(totals.values()):10.2f}")
    print("Income (in)".ljust(w), *[f"{income[m]:10.2f}" for m in cols], f"{sum(income.values()):10.2f}")
    if bad:
        print(f"\n{bad} row(s) skipped (unreadable date or amount; none counted as 0). First ones: "
              + "; ".join(bad_lines) + ("" if bad <= len(bad_lines) else " ..."))
        if a.decimal == "." and any("decimal-point" in b for b in bad_lines):
            print('Hint: some amounts use a comma as the decimal mark; rerun with --decimal ",".')
    if moved:
        print(f"{moved} row(s) in the Transfers category left out of spending and income.")
    if unknown:
        print("\nUncategorised descriptions (add a rule for the ones that repeat):")
        for d, n in sorted(unknown.items(), key=lambda x: -x[1])[:15]:
            print(f"  {n}x  {d}")


if __name__ == "__main__":
    main()
