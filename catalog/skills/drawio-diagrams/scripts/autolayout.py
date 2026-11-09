#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Place the nodes of a graph with Graphviz and write the result as .drawio XML.

Command line: autolayout.py INPUT.json, with optional -o OUTPUT.drawio and --mono.

Input is a JSON file:

  {
    "direction": "TB",                       "TB" (default) or "LR"
    "nodes": [{"id": "api", "label": "API", "style": "...",
               "width": 150, "height": 70, "group": "svc/store",
               "groupLabel": "Storage"}],
    "edges": [{"label": "reads", "source": "api", "target": "db"}]
  }

Only a node's "id" is required. Ids must be unique and cannot be "0" or "1",
which belong to draw.io's root cells. A "group" is a key, or a path such as
"svc/store" for nested containers. Graphviz (`dot`) must be on PATH.

Nodes land on a 10 px grid. Edges carry the bends that dot computed as
waypoints, so they pass around nodes. Each group becomes a dashed container
box. A top-level group gets one colour from the default preset; a node without
its own style takes that colour. --mono switches the colours off.

With -o the XML goes to that file and a summary line goes to stderr; without
it the XML goes to stdout. When `dot` is missing or fails, the script exits
with a message on stderr.
"""
import sys
import subprocess
import shlex
import os
import json
import pathlib
import argparse
from xml.sax.saxutils import escape

DEFAULT_W = 120
DEFAULT_H = 60
PAD = 24  # space between a container border and what it holds
GRID = 10
PX_PER_INCH = 72.0

HERE = os.path.dirname(__file__)
PRESET_DIR = os.path.join(HERE, os.pardir, "styles")
PRESET_NAME = "default.json"
SLOT_ORDER = "primary success accent secondary warning danger neutral".split()
BACKUP_COLOURS = [
    ("#dae8fc", "#6c8ebf"), ("#d5e8d4", "#82b366"), ("#ffe6cc", "#d79b00"),
    ("#e1d5e7", "#9673a6"), ("#fff2cc", "#d6b656"), ("#f8cecc", "#b85450"),
]
EDGE_STYLE = ";".join(["html=1", "rounded=0"]) + ";"


def box_style(fill, stroke):
    keys = ["rounded=1", "whiteSpace=wrap", "html=1", "fillColor=" + fill,
            "strokeColor=" + stroke]
    return ";".join(keys) + ";"


NODE_STYLE = box_style("#dae8fc", "#6c8ebf")
MONO_GROUP_STYLE = ";".join(["rounded=0", "whiteSpace=wrap", "html=1", "fillColor=none",
                             "strokeColor=#999999", "verticalAlign=top", "fontStyle=2",
                             "dashed=1"]) + ";"


def group_colours():
    """(fill, stroke) pairs in slot order, taken from the default preset if readable."""
    preset = os.path.join(PRESET_DIR, "built-in", PRESET_NAME)
    try:
        with open(preset, encoding="utf-8") as handle:
            palette = json.load(handle)["palette"]
        pairs = [(palette[s]["fillColor"], palette[s]["strokeColor"])
                 for s in SLOT_ORDER if s in palette]
        if pairs:
            return pairs
    except (OSError, KeyError, TypeError, ValueError):
        pass
    return BACKUP_COLOURS


COLOURS = group_colours()


# Small helpers

def xml_attr(value):
    return escape(str(value)).replace('"', "&quot;")


def dot_string(value):
    """Quote a value for DOT, escaping backslashes and double quotes."""
    return '"%s"' % str(value).translate({92: "\\\\", 34: '\\"'})


def to_grid(value):
    return int(round(value / GRID)) * GRID


def ident(node):
    return node["id"]


def node_size(node):
    width = node["width"] if "width" in node else DEFAULT_W
    height = node["height"] if "height" in node else DEFAULT_H
    return width, height


def edges_of(graph):
    return graph.get("edges") or []


def tag(name, pairs, closed=False):
    """An opening tag (or a self-closing one) with escaped attribute values."""
    body = " ".join('%s="%s"' % (key, xml_attr(val)) for key, val in pairs)
    return "<%s %s%s>" % (name, body, "/" if closed else "")


# Groups and the dot input

class Groups:
    """The container tree implied by the nodes' "group" paths.

    path_of[node_id]  tuple of segments for the node's own container
    members[path]     ids of nodes whose container is exactly this path
    kids[path]        direct child container paths
    order             every container path, shallow first
    """

    def __init__(self, nodes):
        self.path_of = {}
        self.members = {}
        known = set()
        for entry in nodes:
            raw = entry.get("group")
            trimmed = "" if raw is None else str(raw).strip("/")
            if not trimmed:
                continue
            path = tuple(trimmed.split("/"))
            self.path_of[ident(entry)] = path
            bucket = self.members.setdefault(path, [])
            bucket.append(ident(entry))
            for depth in range(1, len(path) + 1):
                known.add(path[:depth])
        self.kids = {}
        for path in sorted(known):
            if len(path) > 1:
                siblings = self.kids.setdefault(path[:-1], [])
                siblings.append(path)
        self.order = sorted(sorted(known), key=len)

    def top_levels(self, nodes):
        """Top-level group names in order of first use."""
        seen = []
        for entry in nodes:
            path = self.path_of.get(ident(entry))
            if path and path[0] not in seen:
                seen.append(path[0])
        return seen


def build_dot(graph):
    wanted = graph.get("direction") or "TB"
    flow = "TB"
    if str(wanted).upper() == "LR":
        flow = "LR"
    groups = Groups(graph["nodes"])
    number = {path: i for i, path in enumerate(groups.order)}
    header = ["digraph G {", "rankdir=" + flow + ";", "splines=ortho;",
              "node [shape=box", "fixedsize=true];"]
    lines = [" ".join(header)]

    def cluster(path, indent):
        lines.append("%ssubgraph cluster_%d { margin=%d;" % (indent, number[path], PAD))
        for child in groups.kids.get(path, []):
            cluster(child, indent + "  ")
        for member in groups.members.get(path, []):
            lines.append("%s  %s;" % (indent, dot_string(member)))
        lines.append(indent + "}")

    for path in groups.order:
        if len(path) == 1:
            cluster(path, "")
    for entry in graph["nodes"]:
        w, h = node_size(entry)
        lines.append("%s [width=%.4f height=%.4f];"
                     % (dot_string(ident(entry)), w / PX_PER_INCH, h / PX_PER_INCH))
    for link in edges_of(graph):
        lines.append("%s -> %s;" % (dot_string(link["source"]), dot_string(link["target"])))
    return "\n".join(lines + ["}"])


def run_dot(source):
    """Lay the graph out through Graphviz's plain text format.

    Returns the page height in inches, the centre of each node, and the control
    points of each edge (end points included). Inches count from the bottom left.
    """
    command = ["dot", "-Tplain"]
    try:
        done = subprocess.run(command, input=source, text=True, check=True,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except OSError:
        sys.exit("error: could not start Graphviz `dot`; is it installed and on PATH? "
                 "(macOS: brew install graphviz)")
    except subprocess.CalledProcessError as failure:
        sys.exit("error: dot failed: " + failure.stderr.strip())

    page_height = 0.0
    centres = {}
    routes = {}
    for line in done.stdout.splitlines():
        words = shlex.split(line)
        if not words:
            continue
        kind = words[0]
        if kind == "graph":
            page_height = float(words[3])
        elif kind == "node":
            centres[words[1]] = (float(words[2]), float(words[3]))
        elif kind == "edge":
            count = int(words[3])
            nums = [float(w) for w in words[4:4 + 2 * count]]
            routes[(words[1], words[2])] = list(zip(nums[0::2], nums[1::2]))
    return page_height, centres, routes


# Writing the drawio XML

def container_style(stroke):
    keys = ["rounded=0", "whiteSpace=wrap", "html=1", "fillColor=none",
            "strokeColor=" + stroke, "fontColor=" + stroke, "verticalAlign=top",
            "fontStyle=2", "dashed=1"]
    return ";".join(keys) + ";"


def vertex_cell(cid, label, style, parent, rect):
    x, y, w, h = rect
    opening = tag("mxCell", [("id", cid), ("value", label), ("style", style),
                             ("vertex", "1"), ("parent", parent)])
    geometry = tag("mxGeometry", [("x", x), ("y", y), ("width", w), ("height", h),
                                  ("as", "geometry")], closed=True)
    return "        %s\n          %s\n        </mxCell>" % (opening, geometry)


def node_rects(nodes, centres, page_height):
    """Page-pixel rectangle of each placed node, snapped to the grid.

    dot counts y upward from the bottom; draw.io counts downward from the top.
    """
    rects = {}
    for entry in nodes:
        centre = centres.get(ident(entry))
        if centre is None:
            continue
        w, h = node_size(entry)
        left = to_grid(centre[0] * PX_PER_INCH - w / 2)
        top = to_grid((page_height - centre[1]) * PX_PER_INCH - h / 2)
        rects[ident(entry)] = (left, top, w, h)
    return rects


def container_boxes(groups, rects):
    """Bounding box of every container, deepest first so parents wrap finished children."""
    boxes = {}
    for path in sorted(groups.order, key=len, reverse=True):
        spans = [rects[m] for m in groups.members.get(path, []) if m in rects]
        spans += [boxes[c] for c in groups.kids.get(path, []) if c in boxes]
        if not spans:
            continue
        left = min(s[0] for s in spans) - PAD
        top = min(s[1] for s in spans) - PAD
        right = max(s[0] + s[2] for s in spans) + PAD
        bottom = max(s[1] + s[3] for s in spans) + PAD
        boxes[path] = (left, top, right - left, bottom - top)
    return boxes


def edge_cell(index, link, bends, page_height, shift):
    """XML for one edge; `bends` are the interior route points in inches."""
    here = tag("mxGeometry", [("relative", "1"), ("as", "geometry")], closed=True)
    if bends:
        marks = []
        for px, py in bends:
            marks.append(tag("mxPoint", [("x", to_grid(px * PX_PER_INCH) + shift[0]),
                                         ("y", to_grid((page_height - py) * PX_PER_INCH) + shift[1])],
                             closed=True))
        here = (tag("mxGeometry", [("relative", "1"), ("as", "geometry")])
                + '<Array as="points">' + "".join(marks) + "</Array></mxGeometry>")
    opening = tag("mxCell", [("id", "e%d" % index), ("value", link.get("label", "")),
                             ("style", EDGE_STYLE), ("edge", "1"), ("parent", "1"),
                             ("source", link["source"]), ("target", link["target"])])
    return "        %s\n          %s\n        </mxCell>" % (opening, here)


def to_drawio(graph, page_height, centres, routes, color=True):
    listing = graph["nodes"]
    rects = node_rects(listing, centres, page_height)
    groups = Groups(listing)
    tops = groups.top_levels(listing)

    def colour_of(segment):
        return COLOURS[tops.index(segment) % len(COLOURS)]

    # Container ids that cannot clash with a node id, and their titles.
    taken = set(map(ident, listing))
    titles = {}
    for entry in listing:
        path = groups.path_of.get(ident(entry))
        if path is not None and "groupLabel" in entry:
            titles.setdefault(path, str(entry["groupLabel"]))
    box_id, box_title = {}, {}
    for i, path in enumerate(groups.order):
        name = "group_%d" % i
        while name in taken:
            name += "_"
        taken.add(name)
        box_id[path] = name
        box_title[path] = titles.get(path, path[-1])

    boxes = container_boxes(groups, rects)

    # Padding can push a container above or left of the origin; shift if so.
    xs = [v[0] for v in list(rects.values()) + list(boxes.values())]
    ys = [v[1] for v in list(rects.values()) + list(boxes.values())]
    shift = (PAD - min(xs) if xs and min(xs) < 0 else 0,
             PAD - min(ys) if ys and min(ys) < 0 else 0)

    def place(x, y, holder):
        """(x, y, parent id): relative to a container, or shifted page coordinates."""
        if holder is None:
            return x + shift[0], y + shift[1], "1"
        origin = boxes[holder]
        return x - origin[0], y - origin[1], box_id[holder]

    cells = []
    for path in groups.order:
        if path not in boxes:
            continue
        left, top, width, height = boxes[path]
        x, y, parent = place(left, top, path[:-1] if len(path) > 1 else None)
        style = container_style(colour_of(path[0])[1]) if color else MONO_GROUP_STYLE
        cells.append(vertex_cell(box_id[path], box_title[path], style, parent,
                                 (x, y, width, height)))

    for entry in listing:
        nid = ident(entry)
        placed = rects.get(nid)
        if placed is None:
            continue
        own = groups.path_of.get(nid)
        x, y, parent = place(placed[0], placed[1], own if own in boxes else None)
        if entry.get("style"):
            style = entry["style"]
        elif color and own:
            style = box_style(*colour_of(own[0]))
        else:
            style = NODE_STYLE
        cells.append(vertex_cell(nid, entry.get("label", nid), style, parent,
                                 (x, y, placed[2], placed[3])))

    for i, link in enumerate(edges_of(graph)):
        # End points sit on the node borders where draw.io attaches anyway;
        # only the bends in between become waypoints.
        path = routes.get((link["source"], link["target"])) or []
        cells.append(edge_cell(i, link, path[1:-1], page_height, shift))

    model = tag("mxGraphModel", [
        ("dx", 800), ("dy", 600), ("grid", 1), ("gridSize", 10), ("guides", 1),
        ("tooltips", 1), ("connect", 1), ("arrows", 1), ("fold", 1), ("page", 1),
        ("pageScale", 1), ("pageWidth", 850), ("pageHeight", 1100), ("math", 0),
        ("shadow", 0)])
    parts = [
        "<mxfile>",
        "  " + tag("diagram", [("id", "autolayout"), ("name", "Page-1")]),
        "    " + model,
        "      <root>",
        "        " + tag("mxCell", [("id", "0")], closed=True),
        "        " + tag("mxCell", [("id", "1"), ("parent", "0")], closed=True),
    ]
    parts.extend(cells)
    parts.extend(["      </root>", "    </mxGraphModel>", "  </diagram>", "</mxfile>"])
    return "\n".join(parts) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Lay out a graph JSON as draw.io XML.")
    parser.add_argument("input", metavar="GRAPH.json", help="the graph, as JSON")
    parser.add_argument("--output", "-o", help="write the .drawio here (default: stdout)")
    parser.add_argument("--mono", help="draw groups as plain grey boxes, without palette colours",
                        action="store_true")
    args = parser.parse_args()

    graph = json.loads(pathlib.Path(args.input).read_text(encoding="utf-8"))
    dot_source = build_dot(graph)
    layout = run_dot(dot_source)
    xml = to_drawio(graph, *layout, color=not args.mono)
    if not args.output:
        sys.stdout.write(xml)
        return 0
    pathlib.Path(args.output).write_text(xml, encoding="utf-8")
    summary = "wrote %s (%d nodes, %d edges)" % (
        args.output, len(graph["nodes"]), len(edges_of(graph)))
    print(summary, file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
