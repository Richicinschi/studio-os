---
name: drawio-diagrams
description: >-
  Use when the user wants a diagram: UML, ER, network topology, data flow, a flowchart, or an architecture or system diagram, or a picture to clarify a system with 3+ parts. It makes editable draw.io XML, lints it, delivers a local SVG. Excalidraw suits casual sketches; mermaid, diagrams-as-code.
metadata:
  category: studio
  author: Richicinschi
  version: 1.0.0
  domain: draw.io diagram authoring (architecture / flow / ERD / UML)
  capabilities: [file_read, file_write, shell]
---
# drawio-diagrams

The product of this skill is a pair of files: a `.drawio` document you write as XML, and an `.svg`
beside it that opens locally. A linter sits between writing and handing over. The scripts in this
folder assist you; the diagram itself is XML that you author directly.

Never return just a hosted link (diagrams.net or its viewer). The owner does not open those
(`.studio/identity/STYLE.md` section 3; it went wrong on 2026-07-28). A link is an optional
extra.

This copy of the skill makes no network calls. It leaves out the brand-icon fetcher and the
scripts that read code structure. It reads and writes files, and may run Graphviz or the
draw.io CLI when they are present.

## Tooling on this machine

There is no draw.io CLI here, and no `dot`, Inkscape or rsvg either. So the usual route is:

1. Write a small generator that reads one list of nodes and edges and writes both the
   `.drawio` and a hand-made `.svg`. Because both come from one list, they cannot disagree. Copy
   the house style of `docs/specs/2026-09-14-analytics-stack-lab-phases.drawio` and
   the `.svg` next to it. Run the generator with `py -3.13` on Windows or `uv run python` on
   the Mac.
2. Lint the document:
   `py -3.13 <skill-dir>/scripts/validate.py <name>.drawio` (Mac: `uv run python` in its place).
3. Check the picture with a headless browser. Chrome, for example:
   `chrome.exe --headless=new --window-size=W,H --user-data-dir=<scratch dir> --screenshot=<png> file:///<abs path>.svg`
   (Edge takes the same flags as `msedge.exe`). Open the PNG, then fix any overlap or clipped text.
4. Report the absolute path of the `.svg` (for viewing) and of the `.drawio` (for editing).

If the user asks for a browser link, and only as a bonus to the SVG, run the encoder:

```bash
py -3.13 <skill-dir>/scripts/encode_drawio_url.py --edit <name>.drawio   # editor link
py -3.13 <skill-dir>/scripts/encode_drawio_url.py <name>.drawio          # viewer link
```

The XML sits after the `#` in the link, so the file never leaves the machine.

For PNG or PDF output, put the draw.io desktop app on the machine (Mac: `brew install --cask drawio`)
and use the export commands near the end of this file. Lacking the app, deliver the `.drawio`
and the hand-made SVG.

## Which file to open

| Open | When |
|---|---|
| `references/diagram-types.md` | The request names a kind: ERD, UML class, sequence, architecture, ML model, flowchart. It gives shapes, edges and layout for each. |
| `references/shapes.md` with `scripts/shapesearch.py` | You need a vendor shape (AWS, Azure, GCP, Cisco, Kubernetes, UML, ER). `py -3.13 scripts/shapesearch.py "<keywords>"` prints the official `style=` string. A made-up `shape=mxgraph.*` name draws an empty box if it is wrong. |
| `references/autolayout.md` with `scripts/autolayout.py` | More than about 15 nodes. Describe the graph as JSON and let Graphviz place nodes and bends. It needs `dot`; if that is missing, place by hand. |
| `references/style-presets.md` with `references/style-extraction.md` | The user wants a reusable style learned, saved, listed or made the default. |
| `references/troubleshooting.md` | A render looks wrong or an export fails; it also covers WSL2 and Linux notes. |
| `scripts/repair_png.py` | After a `-e` PNG export on a machine with the CLI. It restores the missing end of the IEND chunk. |

## Working order

Ask one to three short questions only when the request is vague: what kind of diagram, which
parts, where to save it. If the request is clear, go straight on.

0. **Choose a style.** A user preset flagged as default in `~/.drawio-skill/styles/`, or one the
   user names, replaces the built-in colours, shapes, edges and font in this file for the
   diagram. With no preset, use the tables below. See `references/style-presets.md`.
1. **Plan.** Note the parts, how they connect, the direction (LR or TB), and the tiers. When the
   diagram describes a project in this workspace, read that project's `AGENTS.md` first so the
   picture is true to the system.
2. **Write the XML** using the skeleton and rules below. Hand-place small or styled diagrams;
   use `autolayout.py` for big graphs.
3. **Lint.** `validate.py` flags edges that point nowhere, repeated or reserved ids, parents that
   do not exist, and overlaps. Fix every item it prints.
4. **Hand over.** Give the `.svg` and the `.drawio` as absolute paths (or the CLI's SVG export if
   the CLI exists). Inspect the render for overlap and clipping before you show it.

## XML essentials

### Skeleton

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="drawio" version="26.0.0">
  <diagram name="Page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- your shapes start at id 2 -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

Rules:
- Cells `0` and `1` always exist. Your own cells begin at `2` and name `parent="1"`, or the id of
  the container they sit in.
- Every style has `html=1`. In attribute values write `&amp;`, `&lt;`, `&gt;` and `&quot;`, and
  use `&#xa;` for a line break in a label, never `\n`.
- Never put a double hyphen inside an XML comment. It is illegal and stops the file parsing.

### Vertices

| Keyword | Meaning |
|---|---|
| `rounded=1` | a service or module |
| `ellipse;` | a start or end, or an actor |
| `rhombus;` | a decision |
| `shape=cylinder3;` | a database |
| `swimlane;startSize=30;` | a titled container or tier |

```xml
<mxCell id="2" value="Billing" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
  <mxGeometry x="120" y="80" width="160" height="60" as="geometry" />
</mxCell>
```

### Containers

Model tiers as real containers, not as shapes laid over a big rectangle. A child gives
`parent="<container id>"`, and its x and y are measured from the container's corner. Add
`pointerEvents=0;` to a container that should not swallow connections aimed at its children.

### Edges

An edge must hold a child `<mxGeometry relative="1" as="geometry" />`; a self-closing edge cell is
not drawn.

```xml
<mxCell id="10" value="gRPC" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

- Always include `rounded=1;orthogonalLoop=1;jettySize=auto` in an edge style, for tidy routing.
- When a node has two or more links, pin `exitX/exitY/entryX/entryY` so lines spread along its
  border. The (x, y) fractions of the four side midpoints are top (0.5, 0), bottom (0.5, 1),
  left (0, 0.5) and right (1, 0.5).
- `flowAnimation=1;` animates a dot along the line (SVG and desktop only).
- To steer a line around a shape, give the edge waypoints inside its geometry, as an `Array`
  named `points` holding `mxPoint` elements.

### Layout

- Every x, y, width and height is a multiple of 10.
- Gaps by size: up to 5 nodes, 200 by 150 px; 6 to 10 nodes, 280 by 200; over 10, 350 by 250.
- Place related nodes together in a band, and hubs in the middle so links radiate without
  crossing.
- Keep roughly 80 px free between rows and columns so edges have a corridor.

### Colours when no preset is active

| Fill / stroke | For |
|---|---|
| `#dae8fc` / `#6c8ebf` (blue) | services and clients |
| `#d5e8d4` / `#82b366` (green) | databases and success |
| `#ffe6cc` / `#d79b00` (orange) | APIs and gateways |
| `#fff2cc` / `#d6b656` (yellow) | queues and decisions |
| `#f8cecc` / `#b85450` (red) | errors and alerts |
| `#e1d5e7` / `#9673a6` (purple) | auth and security |
| `#f5f5f5` / `#666666` (grey) | external or neutral parts |

The same values sit in `styles/built-in/default.json`.

## Kinds of diagram

For ERD, UML class, sequence, architecture, ML model and flowchart, open
`references/diagram-types.md`.

## Export (only where the draw.io CLI exists)

```bash
# Preview PNG: no -e (embedded XML breaks image APIs); width kept under the 2576 px limit
drawio -x -f png --width 2000 -o preview.png model.drawio
# Final editable PNG: keep -e, then complete the IEND chunk
drawio -x -f png -e -s 2 -o final.drawio.png model.drawio && uv run python scripts/repair_png.py final.drawio.png
# SVG and PDF are text formats, -e is safe
drawio -x -f svg -e -o final.svg model.drawio
```

Binary names per platform, headless Linux (`xvfb-run`) and WSL2 are in
`references/troubleshooting.md`.
