#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix the cut-off end of PNG files exported by the draw.io CLI with -e.

With embedded XML, the CLI writes the 4-byte length of the final IEND chunk and
then stops, leaving out the chunk name and checksum. Strict decoders, including
image APIs, refuse such a file. SVG and PDF exports are fine.

  repair_png.py <file.drawio.png>

The script prints "repaired <path>" when it changed the file and nothing when
the file was already whole, so running it after every -e export is safe.
Exit codes: 0 on success, 2 on a wrong argument count.
"""
import sys

# Length 0, the name IEND, and its fixed CRC.
IEND_CHUNK = bytes(4) + b"IEND" + bytes.fromhex("ae426082")
STUB = IEND_CHUNK[:4]


def repair(path):
    """Complete the IEND chunk in place. Return True when the file changed."""
    with open(path, "rb") as handle:
        body = handle.read()
    if body.endswith(IEND_CHUNK):
        return False
    if body.endswith(STUB):
        body = body[: -len(STUB)]
    with open(path, "wb") as handle:
        handle.write(body + IEND_CHUNK)
    return True


def main(argv):
    if len(argv) != 1:
        sys.stderr.write("usage: repair_png.py <path>\n")
        return 2
    if repair(argv[0]):
        print(f"repaired {argv[0]}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
