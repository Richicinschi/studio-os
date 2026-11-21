#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check a .drawio file for structural mistakes without opening draw.io.

Command line: validate.py FILE, with optional --strict.

Errors (they make the exit code 1):
  - two cells with the same id
  - a parent, source or target id that no cell has
  - a vertex or edge that uses the reserved ids 0 or 1
  - a vertex with no usable width and height
  - a file that cannot be parsed, or a page with no model

Warnings (exit code 1 only with --strict):
  - a vertex with zero or negative size, or a negative position
  - two leaf vertices of the same parent that overlap
  - an edge route that runs through a vertex it does not connect
  - two edge routes that cross

Edge routes are only known when an edge stores waypoints (an <Array
as="points"> inside its geometry). Without waypoints draw.io chooses the path at
render time, so such edges are left out of the two route checks; that keeps the
route warnings free of guesses. A route starts and ends where the style pins the
exit and entry points, or at the centre of the vertex, and uses absolute
coordinates, so containers are accounted for.

A compressed (non-XML) page cannot be read: it is skipped with a warning.
Output lines: "warning: ...", "error: ...", then "N error(s), M warning(s)".
"""
import argparse
import math
import sys
import xml.etree.ElementTree as ET

ROOT_IDS = ("0", "1")
GEOMETRY_FIELDS = (("x", "0"), ("y", "0"), ("width", "nan"), ("height", "nan"))


class Cell:
    """One mxCell of a page, with the questions the checks ask of it."""

    def __init__(self, node):
        self.node = node
        self.id = node.get("id")
        self.parent = node.get("parent")
        self.is_vertex = node.get("vertex") in ("1",)
        self.is_edge = node.get("edge") in ("1",)
        self.style = node.get("style") or ""
        self.geometry = node.find("mxGeometry")

    def box(self):
        """(x, y, width, height); None without geometry or with unreadable numbers."""
        if self.geometry is None:
            return None
        try:
            return tuple(float(self.geometry.get(key, dflt)) for key, dflt in GEOMETRY_FIELDS)
        except ValueError:
            return None

    def has_size(self):
        found = self.box()
        return found is not None and not any(math.isnan(n) for n in found)

    def is_label(self):
        """Edge labels and relatively placed cells have no width/height of their own."""
        relative = self.geometry is not None and self.geometry.get("relative") in ("1",)
        return relative or "edgeLabel" in self.style

    def style_number(self, key):
        wanted = key + "="
        for piece in self.style.split(";"):
            if piece.startswith(wanted):
                try:
                    return float(piece[len(wanted):])
                except ValueError:
                    return None
        return None

    def waypoints(self):
        if self.geometry is None:
            return []
        holder = self.geometry.find("Array")
        if holder is None:
            return []
        found = []
        for point in holder.findall("mxPoint"):
            try:
                found.append((float(point.get("x")), float(point.get("y"))))
            except (TypeError, ValueError):
                continue
        return found


class Page:
    def __init__(self, cells):
        self.cells = [Cell(node) for node in cells]
        self.by_id = {}
        self.duplicates = []
        for cell in self.cells:
            if cell.id in self.by_id:
                self.duplicates.append(cell.id)
            self.by_id[cell.id] = cell
        self.parent_ids = {cell.parent for cell in self.cells}

    def page_box(self, cell):
        """Box in page coordinates: adds the offsets of every vertex ancestor."""
        if not cell.has_size():
            return None
        left, top, width, height = cell.box()
        visited = set()
        above = cell.parent
        while above and above in self.by_id and above not in visited:
            visited.add(above)
            holder = self.by_id[above]
            if holder.is_vertex and holder.has_size():
                outer = holder.box()
                left, top = left + outer[0], top + outer[1]
            above = holder.parent
        return (left, top, width, height)

    def anchor(self, edge, end):
        """Page position where an edge touches its source or target vertex."""
        other = self.by_id.get(edge.node.get(end))
        if other is None:
            return None
        box = self.page_box(other)
        if box is None:
            return None
        side = "exit" if end == "source" else "entry"
        fx = edge.style_number(side + "X")
        fy = edge.style_number(side + "Y")
        fx = 0.5 if fx is None else fx
        fy = 0.5 if fy is None else fy
        return (box[0] + fx * box[2], box[1] + fy * box[3])

    def route(self, edge):
        """Polyline of a waypointed edge, or None when it cannot be known."""
        middle = edge.waypoints()
        if not middle:
            return None
        start, end = self.anchor(edge, "source"), self.anchor(edge, "target")
        if start is None or end is None:
            return None
        return [start] + middle + [end]


# Geometry helpers

def overlaps(a, b):
    return not (a[0] + a[2] <= b[0] or b[0] + b[2] <= a[0]
                or a[1] + a[3] <= b[1] or b[1] + b[3] <= a[1])


def turn(a, b, c):
    """1 for a left turn a -> b -> c, -1 for a right turn, 0 when in line."""
    ab_x, ab_y = b[0] - a[0], b[1] - a[1]
    ac_x, ac_y = c[0] - a[0], c[1] - a[1]
    area = ab_x * ac_y - ab_y * ac_x
    if abs(area) < 1e-9:
        return 0
    return 1 if area > 0 else -1


def properly_cross(a1, a2, b1, b2):
    """Do segment a1-a2 and segment b1-b2 cross at a point interior to both?

    Meeting at an end point, or lying along one another, is not a crossing.
    """
    first = (turn(a1, a2, b1), turn(a1, a2, b2))
    second = (turn(b1, b2, a1), turn(b1, b2, a2))
    if 0 in first or 0 in second:
        return False
    return first[0] != first[1] and second[0] != second[1]


def inside(point, box, eps=1e-6):
    left, top = box[0] + eps, box[1] + eps
    right, bottom = box[0] + box[2] - eps, box[1] + box[3] - eps
    return left < point[0] < right and top < point[1] < bottom


def touches_box(line, box):
    """Does a polyline enter the box, or cross any of its four sides?"""
    west, north = box[0], box[1]
    east, south = west + box[2], north + box[3]
    ring = [(west, north), (east, north), (east, south), (west, south)]
    sides = [(ring[k], ring[(k + 1) % 4]) for k in range(4)]
    for start, stop in zip(line, line[1:]):
        if inside(start, box) or inside(stop, box):
            return True
        for c, d in sides:
            if properly_cross(start, stop, c, d):
                return True
    return False


def lines_cross(first, second):
    for a, b in zip(first, first[1:]):
        for c, d in zip(second, second[1:]):
            if properly_cross(a, b, c, d):
                return True
    return False


# The checks

def route_notes(page):
    notes = []
    routed = []
    for cell in page.cells:
        if cell.is_edge:
            line = page.route(cell)
            if line:
                ends = {cell.node.get("source"), cell.node.get("target")}
                routed.append((cell.id, line, ends))

    # Containers are meant to be crossed, so only leaf vertices count as obstacles.
    obstacles = []
    for cell in page.cells:
        if cell.is_vertex and cell.id not in page.parent_ids and not cell.is_label():
            box = page.page_box(cell)
            if box:
                obstacles.append((cell.id, box))

    for edge_id, line, ends in routed:
        for vertex_id, box in obstacles:
            if vertex_id not in ends and touches_box(line, box):
                notes.append("edge %r routes through vertex %r" % (edge_id, vertex_id))

    for i, (first_id, first_line, _) in enumerate(routed):
        for second_id, second_line, _ in routed[i + 1:]:
            if lines_cross(first_line, second_line):
                notes.append("edges %r and %r cross" % (first_id, second_id))
    return notes


def check_page(diagram):
    """Lint one page. Returns the list of errors and the list of warnings."""
    models = diagram.findall("mxGraphModel")
    model = models[0] if models else None
    if model is None:
        label = diagram.attrib.get("name", "?")
        packed = bool(diagram.text and diagram.text.strip())
        if packed:
            return [], ["page %r: compressed, skipped (cannot lint)" % label]
        return ["page %r: no <mxGraphModel>" % label], []

    nodes = []
    for root in model.findall("root"):
        nodes = root.findall("mxCell")
        break
    page = Page(nodes)
    problems = ["duplicate id %r" % dup for dup in page.duplicates]
    cautions = []

    for cell in page.cells:
        if cell.parent is not None and cell.parent not in page.by_id:
            problems.append("cell %r parent %r does not exist" % (cell.id, cell.parent))
        for end, target in (("source", cell.node.get("source")),
                            ("target", cell.node.get("target"))):
            if target and target not in page.by_id:
                problems.append("edge %r %s %r does not exist" % (cell.id, end, target))
        if (cell.is_vertex or cell.is_edge) and cell.id in ROOT_IDS:
            problems.append("cell %r reuses reserved id 0/1" % cell.id)
        if cell.is_vertex and not cell.is_label():
            if not cell.has_size():
                problems.append("vertex %r has missing/invalid geometry" % cell.id)
                continue
            x, y, w, h = cell.box()
            if w <= 0 or h <= 0:
                cautions.append("vertex %r non-positive size %gx%g" % (cell.id, w, h))
            if x < 0 or y < 0:
                cautions.append("vertex %r negative position (%g,%g)" % (cell.id, x, y))

    leaves = [c for c in page.cells
              if c.is_vertex and c.id not in page.parent_ids and c.has_size()]
    for i, left in enumerate(leaves):
        for right in leaves[i + 1:]:
            if left.parent == right.parent and overlaps(left.box(), right.box()):
                cautions.append("vertices %r and %r overlap" % (left.id, right.id))

    return problems, cautions + route_notes(page)


def load_root(path):
    """Parse the file, or stop with an error message."""
    try:
        return ET.parse(path).getroot()
    except (OSError, ET.ParseError) as exc:
        sys.exit("error: cannot parse %s: %s" % (path, exc))


def main():
    parser = argparse.ArgumentParser(description="Check a .drawio file for structural mistakes.")
    parser.add_argument("file")
    parser.add_argument("--strict", help="exit 1 on warnings as well as errors",
                        action="store_true")
    args = parser.parse_args()
    top = load_root(args.file)
    errors, warnings = [], []
    for page in top.findall("diagram") or [top]:
        found_errors, found_warnings = check_page(page)
        errors += found_errors
        warnings += found_warnings

    for text in warnings:
        print("warning: " + text)
    for text in errors:
        print("error: " + text)
    print("%d error(s), %d warning(s)" % (len(errors), len(warnings)))
    failed = bool(errors) or (args.strict and bool(warnings))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
