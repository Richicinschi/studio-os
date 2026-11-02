---
name: drawio-diagrams
description: >-
  Use when the user wants a diagram, flowchart, architecture/system diagram, ER diagram, UML
  (class/sequence), network topology, or data-flow figure — especially for a project in this
  workspace (e.g. "diagram this app's architecture", "draw the data flow",
  "an ERD for the database"). Also use proactively when explaining a system with 3+ components
  or a non-trivial data flow that a picture would clarify. Generates editable draw.io
  (`.drawio`) XML, structurally lints it, and delivers a LOCAL SVG beside it that opens in any
  browser — no install needed. Best for polished, precise, exportable diagrams; route casual whiteboard
  sketches to excalidraw and git-rendered diagrams-as-code to mermaid instead.
metadata:
  category: studio
  author: Richicinschi (adapted by Claude from Agents365-ai/drawio-skill)
  version: 1.0.0
  domain: draw.io diagram authoring (architecture / flow / ERD / UML)
  capabilities: [file_read, file_write, shell]
  sources:
    - Agents365-ai/drawio-skill v1.14.0 (MIT) — XML authoring conventions, validate/encode/shapesearch/autolayout scripts, references. See ./LICENSE.
---

# drawio-diagrams

Author editable draw.io `.drawio` XML by hand, lint it, and deliver a local SVG beside it.
Never hand back only a diagrams.net or web-viewer URL: the owner does not open them
(a style rule the studio broke once and then wrote down). The scripts are aids — the
diagram is XML you write directly.

**Adapted for this studio** (vs. upstream): the network icon-fetcher (`aiicons.py`) and the
language import-parsers were **removed** — this skill makes **no network calls**. Its only
capabilities are file read/write and (optional) shelling out to Graphviz / the draw.io CLI.

## This box has no draw.io CLI — default path

`drawio` is **not installed here** (nor `dot`, Inkscape or rsvg), so the CLI export is
unavailable. The default flow is:

1. Write ONE small generator script that emits both the `.drawio` and a matching hand-built
   `.svg` from the same node/edge list, so the two never drift. House style to copy:
   a `.drawio` and `.svg` pair you made before. Run it with
   `py -3.13` on Windows, `uv run python` on the Mac.
2. Lint the `.drawio`: `py -3.13 <this-skill-dir>/scripts/validate.py <name>.drawio`
   (on the Mac: `uv run python <this-skill-dir>/scripts/validate.py <name>.drawio`).
3. Self-check the render: headless Edge or Chrome, e.g. `msedge.exe --headless=new
   --screenshot=<png> --window-size=W,H --user-data-dir=<scratch dir> file:///<abs path>.svg`,
   then read the PNG and fix overlaps or clipping.
4. Deliver the absolute paths of the `.svg` (to open) and the `.drawio` (to edit).

Optional, only when the owner asks for one, never instead of the SVG: a browser URL from
`py -3.13 <this-skill-dir>/scripts/encode_drawio_url.py [--edit] <name>.drawio` (the XML rides
in the URL `#fragment`, so nothing is uploaded).

To get raster exports, install the **draw.io desktop app** (e.g. on the Mac:
`brew install --cask drawio`) and use the Export section below. Without it, deliver the
`.drawio` + the hand-built SVG.

## Bundled resources (read on demand — none needed up front)

| File | Read it when |
|---|---|
| `references/diagram-types.md` | The user names a type (ERD, UML class, sequence, architecture, flowchart) — gives the shapes/edges/layout preset |
| `references/shapes.md` + `scripts/shapesearch.py` | You need a **specific vendor shape** (AWS/Azure/GCP/Cisco/Kubernetes/ER/UML). `py -3.13 scripts/shapesearch.py "<keywords>"` returns the exact official `style=` string — don't guess `shape=mxgraph.*` names (a wrong name renders as a blank box) |
| `references/autolayout.md` + `scripts/autolayout.py` | The graph is large/layout-heavy (>~15 nodes). Describe it as JSON and run autolayout to place nodes + route edges via Graphviz **(needs `dot` on PATH; if absent, hand-place)** |
| `references/style-presets.md` + `references/style-extraction.md` | The user asks to learn/save/list/set a reusable style preset |
| `references/troubleshooting.md` | An export fails or a rendering looks wrong (incl. cross-platform / WSL2 export notes) |
| `scripts/repair_png.py` | Only after a `-e` PNG export on a box that HAS the draw.io CLI (fixes draw.io's truncated IEND chunk) |

## Workflow

If the request is underspecified, ask 1–3 focused questions (type? scope/components? output
path?). Skip if it's already clear.

1. **Plan** — list components, relationships, layout direction (LR or TB), and grouping by
   tier/layer. For a workspace project, read its `AGENTS.md` first so the diagram is faithful.
2. **Generate** — write the `.drawio` XML (skeleton + rules below). Hand-place coordinates for
   small/styled diagrams; for big graphs use `autolayout.py`.
3. **Validate** — `py -3.13 <this-skill-dir>/scripts/validate.py <name>.drawio` catches dangling
   edges, duplicate/reserved ids, broken parents, and overlaps. Fix anything it reports.
4. **Deliver** — the local `.svg` beside the `.drawio`, both as absolute paths (default flow
   above, or the CLI's SVG export when it is present). Self-check the render for
   overlaps/clipping before showing. A diagrams.net URL is optional and never the only deliverable.

## Draw.io XML structure

### Skeleton

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="drawio" version="26.0.0">
  <diagram name="Page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- user shapes start at id 2 -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

**Rules:**
- `id="0"` and `id="1"` are required root cells — never omit. User shapes start at `id="2"`,
  `parent="1"` (or the container's id).
- All styles include `html=1`. Escape `&amp; &lt; &gt; &quot;` in attribute values; use
  `&#xa;` for line breaks in labels (not `\n`).
- **Never put `--` inside an XML comment** (illegal; breaks parsing).

### Shapes (vertex)

| Style keyword | Use for |
|--------------|---------|
| `rounded=1` | services, modules |
| `ellipse;` | start/end, actors |
| `rhombus;` | decision points |
| `shape=cylinder3;` | databases |
| `swimlane;startSize=30;` | titled container / tier |

```xml
<mxCell id="2" value="Label" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="160" height="60" as="geometry" />
</mxCell>
```

### Containers

Use real parent-child containment for tiers — don't stack shapes on a big rectangle. Children
set `parent="<containerId>"` with coordinates **relative to the container**; add
`pointerEvents=0;` to containers that shouldn't capture child connections.

### Edges

**Every edge must contain `<mxGeometry relative="1" as="geometry" />`** — self-closing edge
cells don't render.

```xml
<mxCell id="10" value="HTTP" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

- Always include `rounded=1;orthogonalLoop=1;jettySize=auto` (smart routing).
- When a node has 2+ connections, pin `exitX/exitY/entryX/entryY` to spread lines across its
  perimeter (top 0.5/0, right 1/0.5, bottom 0.5/1, left 0/0.5).
- Add `flowAnimation=1;` to an edge for a moving-dot data-flow animation (SVG/desktop).
- Add `<Array as="points"><mxPoint x="" y="" /></Array>` waypoints to route around a shape.

### Layout

- Snap all x/y/width/height to multiples of 10.
- Spacing by size: ≤5 nodes → 200×150px gaps; 6–10 → 280×200; >10 → 350×250.
- Group related nodes in a band; place hub nodes centrally so edges radiate, not cross.
- Leave an ~80px corridor between rows/columns for edges to route cleanly.

### Color palette (default — when no preset active)

| fillColor / strokeColor | Use for |
|---|---|
| `#dae8fc` / `#6c8ebf` (blue) | services, clients |
| `#d5e8d4` / `#82b366` (green) | databases, success |
| `#ffe6cc` / `#d79b00` (orange) | APIs, gateways |
| `#fff2cc` / `#d6b656` (yellow) | queues, decisions |
| `#f8cecc` / `#b85450` (red) | errors, alerts |
| `#e1d5e7` / `#9673a6` (purple) | auth, security |
| `#f5f5f5` / `#666666` (grey) | external / neutral |

## Diagram-type presets

When the user names a type, read `references/diagram-types.md` for the matching shapes/edges/
layout: ERD · UML Class · Sequence · Architecture · Flowchart.

## Export (only on a box with the draw.io desktop CLI)

```bash
# Preview PNG (NO -e — embedded XML breaks vision APIs), width-capped under the 2576px ceiling
drawio -x -f png --width 2000 -o diagram.png input.drawio
# Final, editable (PNG keeps -e; then repair the IEND chunk)
drawio -x -f png -e -s 2 -o diagram.drawio.png input.drawio && uv run python scripts/repair_png.py diagram.drawio.png
# SVG / PDF (text formats — -e is safe)
drawio -x -f svg -e -o diagram.svg input.drawio
```

Cross-platform binary-name resolution, headless Linux (`xvfb-run`), and WSL2 specifics are in
`references/troubleshooting.md`.
