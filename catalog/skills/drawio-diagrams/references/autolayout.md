# Auto-layout with Graphviz

Read this for a big diagram, such as a dependency graph or a module map with more than about 15
nodes, where typing x and y by hand is slow and breeds overlaps.

You write the graph as JSON. `scripts/autolayout.py` hands it to Graphviz, which decides where
each node goes and how each edge bends, and the script saves an ordinary `.drawio`. After that
you continue as usual: lint, check the render, deliver. A small or finely styled diagram is
better placed by hand, since auto-layout trades control for scale.

## Requirement

Graphviz, with `dot` on PATH.

```bash
brew install graphviz        # macOS
sudo apt install graphviz    # Debian or Ubuntu
```

This Windows machine has no `dot`. The script then stops with a plain message, and you place
the nodes yourself.

## Running it

```bash
py -3.13 <skill-dir>/scripts/autolayout.py graph.json -o diagram.drawio
```

(On the Mac use `uv run python`.) With `-o`, the file is written and stderr reports
`wrote diagram.drawio (N nodes, M edges)`. Without `-o`, the XML is printed to stdout. The
`--mono` flag turns the group colours off.

## The JSON

```json
{
  "direction": "LR",
  "nodes": [
    {"id": "web", "label": "Web app", "style": "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"},
    {"id": "auth", "label": "Auth service", "group": "platform", "groupLabel": "Platform"},
    {"id": "ledger", "label": "Ledger DB", "style": "shape=cylinder3;whiteSpace=wrap;html=1;", "width": 140, "height": 90, "group": "storage"}
  ],
  "edges": [
    {"source": "web", "target": "auth", "label": "token"},
    {"source": "auth", "target": "ledger"}
  ]
}
```

Fields:
- `direction` (optional, default `TB`): `TB` flows downward, `LR` flows rightward.
- `nodes[].id` (required): unique, and never `0` or `1`, which draw.io reserves for its root cells.
- `nodes[].label` (optional): the text shown; it falls back to the id, and XML escaping is
  automatic.
- `nodes[].style` (optional): any draw.io style. Without it, a grouped node takes its group's
  colour and an ungrouped one is blue. A style you give is never overridden.
- `nodes[].width` and `height` (optional, 120 by 60): pixel size; dot plans with the true size.
- `nodes[].group` (optional): a key, or a `/` path such as `app/cache`, for nested containers.
- `nodes[].groupLabel` (optional): the title for the node's innermost container. The last path
  segment is used if no node supplies one, and the first node to name a path wins.
- `edges[].source` and `target` (required): ids of existing nodes.
- `edges[].label` (optional): text on the link.

## How things are placed

- Graphviz computes a layered layout. The script turns its inch coordinates into pixels and
  snaps them to the 10 px grid.
- Edges use `splines=ortho`; each bend that dot picks is written as a waypoint, so lines go
  around nodes instead of through them.
- Presets are not known to the script. To use one, copy its role and shape styles into every
  node's `style` before running.

## Groups

Give nodes a `group` and the script draws one dashed container per group, with the title on top,
and tells dot to keep the members together (a Graphviz cluster). Members become children of
their container and use coordinates relative to it; nodes without a group stay at the top
level. The result is boxes of related modules, not a tangle.

- **Nesting.** In `"app/cache"`, the node sits in a `cache` box that is itself inside an `app` box.
  Each prefix of a path becomes a container, so a deep package tree maps onto nested boxes. A
  node can sit straight in `app` beside an `app/cache` sub-box.
- **Colour.** The first top-level group takes the first palette pair, the next group the next
  pair, and so on, drawn from `styles/built-in/default.json` in this order: primary, success,
  accent, secondary, warning, danger, neutral (blue, green, orange, purple, yellow, red, grey).
  The container outline and title use the pair, and so do member nodes with no style. With
  `--mono` you get grey dashed boxes and default blue nodes. Graphs without groups are not
  affected.
- **Size.** Each container wraps its members and child boxes with 24 px of padding. dot's cluster
  margin is the same 24 px, so the boxes equal dot's clusters, which dot never lets overlap.
- **Title.** It is drawn in the top padding.
- **Shift.** Should top padding cross the page's top or left edge, everything moves so no
  coordinate is negative.
- Containers own no edges. A link still joins one node to another and may cross box borders.

## Lint the result

```bash
py -3.13 <skill-dir>/scripts/validate.py diagram.drawio
```

Output from this script should lint clean. A failure means the input graph was faulty, for
instance an edge naming a node that does not exist.

The exit status makes it usable as a gate: it is non-zero when any error is found, and with
`--strict` also when any warning is found, so a script or pipeline can stop on it.

## Graphs from source code

This copy has no importers. Build the JSON with any analyser you trust, such as dependency-cruiser
for JavaScript or go-callvis for Go. Keep only edges inside the project, and think about
removing transitive edges with Graphviz `tred`, because dense import graphs turn into a ball.

## Limits

- Placement follows structure, not meaning. dot minimises crossings and may put a node in a
  column you would not pick. Try the other `direction`, or edit the XML afterwards.
- Two edges with the same source and target share one route.
- Containers only box nodes for layout. Swimlanes or tiers that need their own links must be
  built by hand (see "Containers" in `SKILL.md`).
