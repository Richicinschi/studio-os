# Shapes and shape search

Read this when a diagram needs one specific symbol: a vendor icon from AWS, Azure or GCP, a
network device, Cisco or Kubernetes part, a UML, BPMN or ER element, or an electrical or P&ID
item. Read it as well each time you are tempted to type a `style=` string from memory.

There are two sources.

1. **The shape index**, queried with `scripts/shapesearch.py`. It lists 10,446 real shapes from
   draw.io's own palettes, each with its exact style and size. Reach for it with vendor icons
   and anything unusual. A stencil name typed from memory (`shape=mxgraph.*`) that turns out to
   be wrong gives no error; the shape just draws as an empty box. Use the searched style.
2. **The short lists at the end of this file**, for plain built-in shapes with a brief, stable
   style that can safely be typed.

## Searching

```bash
py -3.13 <skill-dir>/scripts/shapesearch.py "azure function app" --limit 5
py -3.13 <skill-dir>/scripts/shapesearch.py "bpmn gateway" --json
```

- Give keywords. Matching runs on shape tags, forgives similar-sounding spellings, and splits
  glued words (`pid2valve` is read as `pid valve`).
- Text output is two lines per hit: `Title  (WxH)`, then the whole style. With `--json` you get
  a list of `{style, w, h, title}` objects.
- Paste the style unchanged into the `mxCell`, and take the geometry width and height from the
  reported `w` and `h`; vendor icons keep a fixed aspect ratio.
- Hits are ordered by tag score. Inside one score, titles that contain the query words come
  first. Titles repeat across libraries (Lambda has `aws3`, `aws4` and `aws3d` versions), so ask
  for five and choose by title and size.

```xml
<mxCell id="2" value="Function" style="<the searched style>" vertex="1" parent="1">
  <mxGeometry x="60" y="60" width="78" height="78" as="geometry"/>
</mxCell>
```

The index spans the general and flowchart sets, network gear, mockups, and the cloud and
engineering families: three AWS generations, Azure, GCP, Cisco, Kubernetes, BPMN, UML, ER,
electrical and P&ID. It is stored as `data/shape-index.json.gz`; its origin is recorded in
`data/SHAPE-INDEX-NOTICE.md`.

## Brand logos for AI and LLM products

draw.io has no logos for current AI brands, and this copy of the skill has no icon fetcher.
Draw such a product as a plain box carrying its name. For data stores use a cylinder
(`shape=cylinder3;`) or search `shapesearch.py "<name> database"`.

## Styles you can type

Put `whiteSpace=wrap;html=1;` on each of these.

**Basic outlines.** Plain box: `rounded=0;`. Rounded box: `rounded=1;`. Ellipse: `ellipse;`, with
`aspect=fixed;` when it must be a true circle. Decision diamond: `rhombus;`. Hexagon:
`shape=hexagon;perimeter=hexagonPerimeter2;`. Cloud: `cloud;`. Speech bubble: `shape=callout;`.
Cube: `shape=cube;`.

**Storage and documents.** Database: `shape=cylinder3;`. Stored data: `shape=dataStorage;`.
Document: `shape=document;`. Note: `shape=note;`. Folder: `shape=folder;`. Cut-corner card:
`shape=card;`.

**Flowchart steps.** Double-barred process: `shape=process;`. Chevron: `shape=step;`. Manual
input: `shape=manualInput;`. Delay: `shape=delay;`. Off-page connector: `shape=offPageConnector;`.
Slanted input/output box: `perimeter=parallelogramPerimeter;shape=parallelogram;`. Trapezoid:
`perimeter=trapezoidPerimeter;shape=trapezoid;`.

**Logic and arrows.** OR gate: `shape=or;`. XOR gate: `shape=xor;`. One-way block arrow:
`shape=singleArrow;`. Two-way block arrow: `shape=doubleArrow;`.

**UML parts.**
- A stick-figure actor needs its label moved below: `verticalLabelPosition=bottom;verticalAlign=top;shape=umlActor;`
- The three robustness-diagram shapes are `shape=umlBoundary;`, `shape=umlControl;` and
  `shape=umlEntity;`.
- A sequence-diagram lifeline: `container=1;shape=umlLifeline;perimeter=lifelinePerimeter;`
- A labelled frame: `shape=umlFrame;`. A component: `shape=component;`.
- Interfaces: the lollipop (provided) is `shape=lollipop;direction=south;`; the socket (required)
  is `shape=requires;direction=north;`.

**Containers.** Children of a container use coordinates relative to it.
- No border and no links of its own: `group;pointerEvents=0;`
- Visible title bar, or it receives links: `swimlane;startSize=30;`
- Any other shape turned into a box that takes no links: add `container=1;pointerEvents=0;`

**Edge settings** to append to an edge style:
- right-angle routing: `rounded=1;orthogonalLoop=1;jettySize=auto;edgeStyle=orthogonalEdgeStyle;`
- curved lines: `curved=1;`
- headless line: `endArrow=none;`; an open head or a thin head: `endArrow=open;`, `endArrow=classicThin;`
- dashed: `dashed=1;`, and `dashPattern=8 8;` to set the rhythm
- moving dot: `flowAnimation=1;`
- text backing: `labelBackgroundColor=#ffffff;`

**Useful properties.**
- `fontStyle` adds up: 1 is bold, 2 italic, 4 underline, so 3 is bold italic.
- `direction=` takes north, south, east or west and turns a shape by quarter turns;
  `rotation=<degrees>` allows any angle.
- A gradient needs `gradientColor=#RRGGBB;` and, optionally, `gradientDirection=north;`.
- `sketch=1;` gives the hand-drawn look. For a whole diagram, set it through a style preset.
