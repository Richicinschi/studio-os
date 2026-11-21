#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Turn a .drawio file into a diagrams.net link that carries the diagram itself.

The XML travels in the URL fragment (the part after '#'), which a browser never
sends to the server, so nothing is uploaded.

  encode_drawio_url.py <file.drawio>          read-only viewer link
  encode_drawio_url.py --edit <file.drawio>   link that opens the editor

Exit codes: 0 on success, 2 on a wrong argument count.
"""
import base64
import json
import sys
import zlib
from urllib.parse import quote

VIEWER_HOST = "viewer.diagrams.net"
EDITOR_HOST = "app.diagrams.net"
VIEWER_BASE = "https://" + VIEWER_HOST + "/?" + "&".join(["tags=%7B%7D", "lightbox=1", "edit=_blank"]) + "#R"
EDITOR_BASE = "https://" + EDITOR_HOST + "/?" + "&".join(["grid=0", "pv=0", "border=10", "edit=_blank"]) + "#create="


def pack(xml):
    """Percent-encode, raw-deflate, base64 (the order draw.io's loader undoes).

    The loader calls decodeURIComponent on the inflated text, so a bare '%' or a
    non-ASCII label would make it fail with "URI malformed" unless the XML is
    percent-encoded first. The safe set below matches encodeURIComponent.
    """
    keep = "".join(["!", "~", "*", "'", "(", ")"])
    escaped = quote(xml, safe=keep).encode("utf-8")
    deflater = zlib.compressobj(level=9, wbits=-zlib.MAX_WBITS)
    raw = deflater.compress(escaped) + deflater.flush()
    return base64.b64encode(raw).decode("ascii")


def encode(xml):
    """Link to the read-only viewer."""
    return VIEWER_BASE + quote(pack(xml), safe="")


def edit_url(xml):
    """Link that opens the diagram in the editor."""
    fields = {}
    fields["type"] = "xml"
    fields["compressed"] = True
    fields["data"] = pack(xml)
    envelope = json.dumps(fields)
    return EDITOR_BASE + quote(envelope, safe="")


def main(argv):
    wants_edit = "--edit" in argv
    paths = [word for word in argv if word not in ("--edit",)]
    if len(paths) != 1:
        program = "encode_drawio_url.py"
        sys.stderr.write("usage: " + program + " [--edit] <path>\n")
        return 2
    with open(paths[0], encoding="utf-8") as source:
        xml = source.read()
    print(edit_url(xml) if wants_edit else encode(xml))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
