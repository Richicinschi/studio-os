#!/usr/bin/env python3
"""check_art.py: check PNG game art for edge and size problems. Needs Pillow.

Usage:
  python check_art.py PATH [PATH ...] [--ladder 64,128,256] [--cell 64] [--key 255,0,255]

PATH is a PNG file or a folder (searched for *.png). For each file it reports:
  - mode: whether it has an alpha channel at all
  - border: share of the outer 1 px frame that is opaque (sprites should be near 0)
  - fringe: count of visible pixels close to the key colour (leftover background)
  - halo: share of semi-transparent pixels (high values hint at a dirty edge)
  - size: whether width and height are multiples of a ladder step
  - cell: whether the sheet divides evenly into --cell sized cells
  python check_art.py --self-test   builds small test images and checks the rules (exit 0 = pass)
A greyscale PNG of 8 or 16 bits has no alpha and is reported as "no alpha".
Exit code 0 when no warnings, 1 when any file has a warning, 2 on bad input
(including a corrupt or truncated PNG that cannot be read).
Reads files only. Writes nothing.
"""
import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is missing. Install it with: python -m pip install pillow")
    sys.exit(2)


# 16-bit greyscale PNGs open as "I;16" or "I" depending on the Pillow version.
NO_ALPHA_MODES = ("RGB", "L", "P", "1", "I", "I;16", "I;16L", "I;16B")


def collect(paths):
    out = []
    for p in paths:
        p = Path(p)
        if p.is_dir():
            out.extend(sorted(p.rglob("*.png")))
        elif p.is_file():
            out.append(p)
        else:
            print(f"not found: {p}")
            sys.exit(2)
    return out


def check(path, ladder, cell, key):
    warns = []
    im = Image.open(path)
    im.load()  # decode now, so a truncated or corrupt file raises here
    w, h = im.size
    if im.mode != "RGBA":
        if im.mode in NO_ALPHA_MODES and "transparency" not in im.info:
            warns.append(f"no alpha channel (mode {im.mode}): background is baked in")
            return w, h, warns, "no alpha"
        im = im.convert("RGBA")
    px = im.load()
    alpha = im.getchannel("A")

    border = [(x, y) for x in range(w) for y in (0, h - 1)]
    border += [(x, y) for y in range(1, h - 1) for x in (0, w - 1)]
    opaque = sum(1 for x, y in border if px[x, y][3] > 200)
    b_share = opaque / max(1, len(border))
    if b_share > 0.02:
        warns.append(f"border {b_share:.0%} opaque: sprite touches the edge or background remains")

    fringe = 0
    kr, kg, kb = key
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 16 and abs(r - kr) + abs(g - kg) + abs(b - kb) < 90:
                fringe += 1
    if fringe:
        warns.append(f"{fringe} visible pixels near the key colour: fringe left behind")

    hist = alpha.histogram()
    semi = sum(hist[17:239])
    visible = sum(hist[17:])
    halo = semi / max(1, visible)
    if halo > 0.15:
        warns.append(f"{halo:.0%} of visible pixels are semi-transparent: soft or dirty edge")

    if ladder and not any(w % s == 0 and h % s == 0 for s in ladder):
        warns.append(f"{w}x{h} is not a multiple of any ladder step {ladder}")
    if cell and (w % cell or h % cell):
        warns.append(f"{w}x{h} does not divide into {cell} px cells")

    note = f"border {b_share:.0%}, fringe {fringe}, halo {halo:.0%}"
    return w, h, warns, note


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--ladder", default="", help="comma list of size steps, e.g. 64,128,256")
    ap.add_argument("--cell", type=int, default=0, help="cell size a sheet must divide into")
    ap.add_argument("--key", default="255,0,255", help="background key colour r,g,b")
    a = ap.parse_args()
    try:
        ladder = [int(s) for s in a.ladder.split(",") if s.strip()]
        key = tuple(int(s) for s in a.key.split(","))
        assert len(key) == 3
    except (ValueError, AssertionError):
        print("bad --ladder or --key value: use whole numbers, e.g. --ladder 32,64 --key 255,0,255")
        return 2
    if any(s <= 0 for s in ladder):
        print("bad --ladder: every step must be a whole number above 0")
        return 2
    if a.cell < 0:
        print("bad --cell: must be 0 (off) or a positive whole number")
        return 2
    if any(c < 0 or c > 255 for c in key):
        print("bad --key: each of r,g,b must be between 0 and 255")
        return 2
    files = collect(a.paths)
    if not files:
        print("no PNG files found")
        return 2
    bad = 0
    unreadable = 0
    for f in files:
        try:
            w, h, warns, note = check(f, ladder, a.cell, key)
        except Exception as e:
            print(f"FAIL {f}: cannot read ({e})")
            unreadable += 1
            continue
        if warns:
            bad += 1
            print(f"WARN {f} ({w}x{h})")
            for m in warns:
                print(f"     - {m}")
        else:
            print(f"ok   {f} ({w}x{h}) {note}")
    print(f"{len(files)} file(s), {bad} with warnings, {unreadable} unreadable")
    if unreadable:
        return 2
    return 1 if bad else 0


def self_test():
    import contextlib
    import io
    import tempfile

    fails = []

    def check_case(name, ok):
        print(("pass  " if ok else "FAIL  ") + name)
        if not ok:
            fails.append(name)

    def run(argv):
        buf = io.StringIO()
        old = sys.argv
        sys.argv = ["check_art.py"] + argv
        try:
            with contextlib.redirect_stdout(buf):
                code = main()
        finally:
            sys.argv = old
        return code, buf.getvalue()

    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        grey = d / "grey16.png"
        Image.new("I;16", (64, 64), 30000).save(grey)  # a 16-bit greyscale PNG
        check_case("test image is 16-bit greyscale", Image.open(grey).mode in ("I", "I;16", "I;16B"))
        rgba = d / "rgba.png"
        im = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        im.putpixel((32, 32), (10, 200, 10, 255))
        im.save(rgba)
        good = d / "trunc.png"
        Image.new("RGBA", (64, 64), (1, 2, 3, 255)).save(good)
        data = good.read_bytes()
        bad = d / "trunc_bad.png"
        bad.write_bytes(data[: len(data) // 2])
        good.unlink()
        junk = d / "junk.png"
        junk.write_bytes(b"not a png at all")

        code, out = run([str(grey)])
        check_case("16-bit greyscale reported as no alpha (exit 1)", code == 1 and "no alpha channel" in out)
        code, out = run([str(rgba)])
        check_case("RGBA file reads and exits 0", code == 0 and "ok" in out)
        code, out = run([str(bad)])
        check_case("truncated PNG exits 2", code == 2 and "cannot read" in out)
        code, out = run([str(junk)])
        check_case("non-PNG data exits 2", code == 2 and "cannot read" in out)
        code, out = run([str(rgba), str(bad)])
        check_case("one bad file among good ones exits 2", code == 2)
    print(f"{len(fails)} check(s) failed" if fails else "all checks passed")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(self_test() if sys.argv[1:] == ["--self-test"] else main())
