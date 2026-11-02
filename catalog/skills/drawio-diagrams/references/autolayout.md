# Auto-layout (Graphviz)

Read this when a diagram is **large or layout-heavy** — dependency/call graphs, code/module structure, or roughly **more than ~15 nodes** — where hand-placing `x`/`y` coordinates is slow, error-prone, and overlap-prone.

Instead of computing coordinates by hand in the Generate step, describe the graph as JSON and let `scripts/autolayout.py` place the nodes and route the edges with Graphviz, then continue the normal workflow (Export draft → Self-check → …) on the produced `.drawio`.

For small or carefully-styled diagrams, keep hand-placing — auto-layout trades fine control for scale.

## Dependency

Requires Graphviz `dot` on PATH:

```bash
# macOS
brew install graphviz
# Debian/Ubuntu
sudo apt install graphviz
```

The script exits with a clear message if `dot` is missing — fall back to hand-placed coordinates in that case.

## Usage

```bash
uv run python <this-skill-dir>/scripts/autolayout.py graph.json -o diagram.drawio
```

It prints `wrote diagram.drawio (N nodes, M edges)` to stderr and writes a normal `.drawio` file. From there, continue at the **Export draft** step of the main workflow (preview PNG with `--width 2000`, self-check, review loop, final export with `-e` + `repair_png.py`).

## Input format

```json
{
  "direction": "TB",
  "nodes": [
    {"id": "client", "label": "Web Client", "style": "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"},
    {"id": "gw", "label": "API Gateway", "group": "edge", "groupLabel": "Edge tier"},
    {"id": "db", "label": "User DB", "style": "shape=cylinder3;whiteSpace=wrap;html=1;", "width": 120, "height": 80, "group": "data"}
  ],
  "edges": [
    {"source": "client", "target": "gw", "label": "HTTPS"},
    {"source": "gw", "target": "db"}
  ]
}
```

**Fields**

| Field | Required | Default | Notes |
|---|---|---|---|
| `direction` | no | `TB` | `TB` (top→bottom) or `LR` (left→right) — the layout rank direction |
| `nodes[].id` | **yes** | — | Unique; must not be `0` or `1` (reserved for draw.io root cells) |
| `nodes[].label` | no | the `id` | Display text; auto XML-escaped |
| `nodes[].style` | no | group colour, else blue | Any draw.io style string — reuse the role/shape styles from `diagram-types.md` and the active preset. A styleless node is tinted by its group (see **Containers / grouping**); an explicit style always wins |
| `nodes[].width` / `height` | no | `120` / `60` | Pixels; dot lays out at this real size |
| `nodes[].group` | no | none | Group key, or a `/`-delimited path (`"core/db"`) for **nested** containers — nodes sharing a path are boxed together (see **Containers / grouping**) |
| `nodes[].groupLabel` | no | last path segment | Title shown on the node's deepest container (first node with the path wins) |
| `edges[].source` / `target` | **yes** | — | Must match node ids |
| `edges[].label` | no | empty | Edge text |

## How it places things

- Node positions come from `dot` (hierarchical layered layout), converted to draw.io pixels and snapped to the grid (multiples of 10).
- Edges use `splines=ortho`: dot's orthogonal route is replayed as draw.io waypoints, so edges go **around** nodes instead of through them.
- Apply the active style preset by setting each node's `style` to the preset's role/shape values before calling the script — the script does not know about presets.

## Containers / grouping

Give nodes a `group` key and the script wraps each group in a labeled container (a dashed box with the group title at top) and tells dot to keep that group's nodes together via a Graphviz cluster. Grouped nodes become children of their container (`parent="<container>"`, relative coordinates); ungrouped nodes stay at the top level. This turns a flat hairball into a "boxes of related modules" architecture view.

**Nesting.** A `group` value with `/` separators builds nested containers: `"core/db"` puts the node inside a `db` box that itself sits inside a `core` box. Every path prefix becomes a container, so an arbitrarily deep package tree maps to nested boxes. A node can also sit *directly* in a parent box (`group: "core"`) alongside a sibling sub-box (`group: "core/db"`).

- **Colour by group.** Each top-level group is assigned a colour from the skill's own palette (`styles/built-in/default.json`, cycled in role order: blue → green → orange → purple → yellow → red → grey). A node with no `style` of its own is tinted with its group's colour, and the container's border + title match — so related modules read as a coloured cluster instead of monochrome boxes. A node that carries its own `style` (e.g. from an applied preset) is left untouched. Pass `--mono` to turn colouring off (dashed grey boxes, default-blue nodes — the previous look). Ungrouped graphs are unaffected.
- Each container box is the bounding box of its members and child boxes plus a uniform padding. The dot cluster margin is set to that same padding, so each box equals dot's cluster box — which dot keeps non-overlapping at **any nesting depth**.
- The title sits in the top padding (`verticalAlign=top`); the box title is the path's last segment, or a member's `groupLabel`.
- Containers are visual only (no edges of their own). Edges still connect node→node and route across containers normally.
- If a container's top padding would cross the page origin, the whole diagram is shifted so nothing lands at a negative coordinate.

## Validate before previewing

`scripts/validate.py` is a deterministic structural linter — run it on the produced `.drawio` before the (slower, vision-based) self-check:

```bash
uv run python <this-skill-dir>/scripts/validate.py diagram.drawio
```

It catches dangling edge endpoints, duplicate/reserved ids, broken parent references (errors), plus off-grid/negative geometry and overlapping sibling nodes (warnings) — without launching draw.io. Exit status is non-zero on any error (or any warning with `--strict`), so it can gate the workflow. Auto-layout output should always pass clean; a failure means a malformed input graph (e.g. an edge referencing a missing node id).

## Importers

The upstream skill's code importers are not in this copy: the studio removed them. To diagram a codebase, list its modules and their imports into the graph JSON that `scripts/autolayout.py` reads, by hand or with Claude, then run autolayout on it.

## Limitations

- **Placement is topological, not semantic** — dot minimises edge crossings, which may put a node in a different column than you'd choose by hand. Re-export with the other `direction`, or hand-tune the produced XML afterwards (it's a normal `.drawio`).
- **Parallel edges** between the same `(source, target)` pair share one route.
- **Containers don't add edges** — `group`/nesting only boxes nodes for layout; edges remain node→node. For hand-built swimlane/architecture containers with their own connections, see SKILL.md "Containers and groups".
