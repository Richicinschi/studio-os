# Style extraction

You come here from `SKILL.md` or `style-presets.md` in two cases: the user asked to learn a style
from a file, or you have a candidate preset and need to draw its sample. The file holds the
sample diagram and both extraction routes, one for `.drawio` input and one for pictures.

## Sample diagram

A candidate preset is judged on a seven-box sample, drawn in the candidate's own palette, shapes,
fonts and edges. Every role shows up once. Six links join the boxes; the last one checks the
dashed rule, and the others check `edges.style` and `edges.arrow`.

Positions, in three rows:
- Top (y=60): `gateway` at x=360.
- Middle (y=200): `security` at x=60, `service` at x=360, `queue` at x=660.
- Bottom (y=360): `database` at x=60, `external` at x=360, `error` at x=660.

Style of a vertex with role R. Start from `shapes[R]`, then append the html and wrap keys, the two
font keys, and finally the fill and stroke found through `palette[roles[R]]`:
`<shapes[R]>;html=1;whiteSpace=wrap;fontFamily=<family>;fontSize=<size>;fillColor=<fill>;strokeColor=<stroke>`

Two switches change every vertex and edge style alike:
- `extras.sketch` true: append `;sketch=1`.
- `extras.globalStrokeWidth` anything but 1 (0.5 too): append `;strokeWidth=<n>`.

Style of an edge: `<edges.style>;<edges.arrow>`. The exit and entry keys are already written
into the XML below.

The sixth edge exercises `edges.dashedFor`:
- If the list has entries, label the edge with the first one and append `;dashed=1`.
- If the list is empty, label it `cross-call` and leave it solid. A preset without a dashed
  convention must not appear to have one.

Placeholders in the XML:
- `{{VSTYLE:<role>}}` stands for the vertex style of that role, written out as plain text with no
  URL encoding.
- `{{ESTYLE}}` stands for the edge style.
- `{{EDGE6_LABEL}}` and `{{EDGE6_DASH}}` hold the outcome of the sixth-edge rule.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="drawio" version="26.0.0">
  <diagram name="Preset Sample">
    <mxGraphModel>
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- top row -->
        <mxCell id="n1" value="Edge Proxy" style="{{VSTYLE:gateway}}" vertex="1" parent="1">
          <mxGeometry x="360" y="60" width="160" height="60" as="geometry" />
        </mxCell>

        <!-- middle row -->
        <mxCell id="n2" value="Login" style="{{VSTYLE:security}}" vertex="1" parent="1">
          <mxGeometry x="60" y="200" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="n3" value="Orders" style="{{VSTYLE:service}}" vertex="1" parent="1">
          <mxGeometry x="360" y="200" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="n4" value="Jobs" style="{{VSTYLE:queue}}" vertex="1" parent="1">
          <mxGeometry x="660" y="200" width="160" height="60" as="geometry" />
        </mxCell>

        <!-- bottom row -->
        <mxCell id="n5" value="Orders DB" style="{{VSTYLE:database}}" vertex="1" parent="1">
          <mxGeometry x="60" y="360" width="160" height="70" as="geometry" />
        </mxCell>
        <mxCell id="n6" value="Payment Provider" style="{{VSTYLE:external}}" vertex="1" parent="1">
          <mxGeometry x="360" y="360" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="n7" value="Dead Letters" style="{{VSTYLE:error}}" vertex="1" parent="1">
          <mxGeometry x="660" y="360" width="160" height="60" as="geometry" />
        </mxCell>

        <!-- edges -->
        <mxCell id="e1" value="" style="{{ESTYLE}};exitX=0.25;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0" edge="1" parent="1" source="n1" target="n2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e2" value="" style="{{ESTYLE}};exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0" edge="1" parent="1" source="n1" target="n3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e3" value="" style="{{ESTYLE}};exitX=0.75;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0" edge="1" parent="1" source="n1" target="n4">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e4" value="" style="{{ESTYLE}};exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0" edge="1" parent="1" source="n3" target="n6">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e5" value="" style="{{ESTYLE}};exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0" edge="1" parent="1" source="n3" target="n5">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e6" value="{{EDGE6_LABEL}}" style="{{ESTYLE}}{{EDGE6_DASH}};exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0" edge="1" parent="1" source="n3" target="n7">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### Drawing it

1. Save the filled-in XML as `drawio-preset-<name>.drawio` in the scratch directory.
2. Export with the CLI under whatever binary name works here, in long-flag form:
   `drawio --export --format png --embed-diagram --scale 2 --output <preset-name>-sample.png <file>.drawio`.
3. Repair the PNG with `repair_png.py` from this skill's `scripts` folder. Embedding the XML
   truncates the file here exactly as it does in the main export.
4. Leave the PNG as `./preset-<name>-sample.png` in the user's working directory.
5. Present the summary table, the PNG path, and the provenance and confidence line.

The user's reply decides what happens next.
- "save" or "looks good": write the candidate to `~/.drawio-skill/styles/<name>.json`, delete the
  scratch file and the sample PNG.
- "change `<field>` to `<value>`": adjust the candidate, draw it again, ask again.
- "cancel": delete the scratch file and the sample PNG, and save nothing.

When the export cannot run because the CLI is absent or fails, still give the summary and the
provenance line, plus a note that the sample picture could not be drawn because the CLI is
missing or failed, and that you will save as soon as the user agrees. Do not hold the user up.

## Route 1: from a .drawio file

The input is a path to a `.drawio` file and the output a candidate preset. Every step is
mechanical; no guesswork is needed.

1. **Parse.** Read the XML. Collect each `mxCell` that has a `style`, and split the collection
   into vertices (marked `vertex="1"`) and edges (marked `edge="1"`).
2. **Tokenise.** Cut each style string at its semicolons. Every piece is a `key=value` pair or a
   lone keyword such as `rhombus` or `ellipse`.
3. **Palette.** For each vertex note the (`fillColor`, `strokeColor`) pair, ignoring vertices that
   have neither. Count each pair and keep the seven most common.
4. **Shapes and roles.** Give every vertex a shape class. When several apply, the earlier of these
   wins: `cylinder3`, `ellipse`, `rhombus`, `swimlane`, `rounded=1`, `rounded=0`.
   Then decide its role. Test the conditions in the order shown; the first that holds settles it.
   1. shape class `cylinder3`: role `database`
   2. shape class `rhombus`: role `decision`
   3. shape class `swimlane`: role `container`
   4. `dashed=1` together with a grey fill (red, green and blue within 16 of one another): `external`
   5. label contains queue, bus, kafka or rabbit (any case): `queue`
   6. label contains gateway, api, lb or load: `gateway`
   7. label contains auth, login, jwt or oauth: `security`
   8. label contains error, fail or alert: `error`
   9. nothing above: `service`

   Seven roles own a palette slot: service, database, queue, gateway, error, external, security.
   For each, the (role, colour pair) combination seen most often wins, and its pair is stored in
   the role's slot. The slots are primary for service, success for database, warning for queue,
   accent for gateway, danger for error, neutral for external and secondary for security. Write
   the slot name into `roles[role]`.

   Decision and container get no `roles` entry; they live only in `shapes.decision` and
   `shapes.container`. Their colours still enter the palette count and may fill leftover slots.
   Colour pairs that no role claimed fill the remaining empty slots, commonest first.

   Store the winning shape class under `shapes[role]`, for instance
   `shapes.database = "shape=cylinder3"`. Only six keys exist: `service`, `database`, `queue`,
   `decision`, `external`, `container`. Gateway, error and security have no key of their own and
   reuse `shapes.service`.
5. **Fonts.** The most frequent `fontFamily` and `fontSize` across vertices become `font.fontFamily`
   and `font.fontSize`. Watch `fontStyle` while you work but do not output it, as the schema has
   no such field. If a distinct set of vertices combines a bigger `fontSize` with `fontStyle=1`
   (bold), call them titles: set `font.titleFontSize` to their commonest size and `font.titleBold`
   to true. Otherwise omit both title fields.
6. **Edges.** Take the commonest edge style once these position keys are removed: `entryX`,
   `entryY`, `exitX`, `exitY`, `entryDx`, `entryDy`, `exitDx`, `exitDy`. Store the arrow, read
   from `endArrow` and `endFill`, separately as `edges.arrow`. Gather the labels of edges with
   `dashed=1`; a word shared by two or more of them (such as "async" or "optional") goes into
   `edges.dashedFor`.
7. **Extras.** Any `sketch=1` on a vertex or edge makes `extras.sketch` true. The commonest
   `strokeWidth` over vertices is `extras.globalStrokeWidth`; the default is 1.
8. **Provenance.**
   ```json
   {
     "source": { "type": "xml", "path": "<absolute input path>", "extracted_at": "YYYY-MM-DD" },
     "confidence": "high"
   }
   ```

Unusual inputs:

| Input | Outcome |
|---|---|
| Under 3 distinct colour pairs | Leave the unused slots `null`, set `confidence` to `"medium"`, and warn. |
| Over 7 colour pairs | Keep the 7 commonest and warn about the dropped colours. |
| Library shapes such as `shape=mxgraph.aws4.*` | They match no entry in the class list and count as `rounded=0`. Icons are lost; colours, labels and edge style are kept, and the label rules still run. Tell the user that a vendor shape library was found, so its icons are not kept in the preset while colour and label are. |
| Labels in another language | The English word lists mostly miss, so most boxes become `service`. Palette, shapes, font and edges are unaffected and `confidence` stays `"high"`. Tell the user the labels are not English, so only service, database, decision, container and external could be inferred (from shape class) and the other roles are unmapped. |
| No `mxCell vertex="1"` | Stop and refuse to save. Tell the user the file has no shapes to learn from. |

## Route 2: from a picture

The input is a PNG, JPG or any image the model can read. The output is a candidate preset. The
result is inferred rather than parsed, so `confidence` is `"medium"` at most.

Vision is required. Without it, stop and tell the user to repeat the request on a model that
can see images, or to supply the `.drawio` source instead.

1. **Look.** Use the same image input that the render self-check uses.
2. **Palette.** Find each distinct fill on a shape body, then:
   - `fillColor`: round every RGB channel to the nearest multiple of 16. When the HSL lightness
     is under 0.75, lift it to 0.85, keeping hue and saturation, and convert back. Output
     `#RRGGBB`. Ordinary draw.io pastels sit at roughly 0.85 to 0.96, so anything under 0.75 is too
     dark to be a fill.
   - `strokeColor`: read the outline; if it cannot be read, darken the fill by 0.25 lightness.

   Next, choose the slot for the pair.
   1. Grey test first: red, green and blue within 16 of each other, or HSL saturation under 0.20,
      means `neutral`, whatever the hue.
   2. Otherwise use the hue. 180 to 260 degrees is `primary` (blue). 80 to 170 is `success`
      (green). 45 to 65 is `warning` (yellow). 20 to 44 is `accent` (orange). 0 to 19 or 320 to 360
      is `danger` (red or pink). 260 to 320 is `secondary` (purple).
   3. A hue that falls in a gap (65 to 80, 170 to 180) joins the closest band by angle.

   When two or more fills compete for a slot, order them by the pixel area they cover. The
   biggest keeps the slot; each other moves to the nearest empty slot by hue distance, looking at
   neighbours on both sides first and then further out. When every slot is full, drop the rest
   and warn.
3. **Shapes.** Judge each outline and note the keyword that fits:
   - soft-cornered rectangle: `rounded=1`
   - square-cornered rectangle: `rounded=0`
   - circle or oval: `ellipse`
   - diamond: `rhombus`
   - rectangle with curved ends: `shape=cylinder3`
   - header bar over nested children: `swimlane;startSize=30`
   - dashed rectangle: `rounded=1;dashed=1`

   Roles follow the same shape and label rules as Route 1; read the labels by eye.
4. **Fonts, as best you can.** Obviously serif text: `"Georgia"`. Obviously monospaced:
   `"Courier New"`. Anything else: `"Helvetica"`. Size: small is 11, medium 12, large 14. Headings
   that are clearly bigger or bolder justify `titleFontSize` and `titleBold: true`.
5. **Edges.** Set `edges.style` and `edges.arrow` from what the arrows look like.
   - Right-angle routing gives `edges.style = "html=1;rounded=1;jettySize=auto;orthogonalLoop=1;edgeStyle=orthogonalEdgeStyle"`;
     if the lines also curve, add `;curved=1`.
   - Filled triangular heads give `edges.arrow = "endArrow=classic;endFill=1"`.
   - Open V-shaped heads give `edges.arrow = "endArrow=open;endFill=0"`.
   - Dashed arrows near words like "optional", "async", "fallback" or "secondary": add those words
     to `edges.dashedFor`.
6. **Extras.** A wobbly, rough, hand-drawn look sets `extras.sketch` true. Lines over 1.5 times
   normal weight set `extras.globalStrokeWidth` to 2. Otherwise use `{ "sketch": false,
   "globalStrokeWidth": 1 }`.
7. **Provenance and confidence.**
   ```json
   {
     "source": { "type": "image", "path": "<absolute input path>", "extracted_at": "YYYY-MM-DD" },
     "confidence": "medium"
   }
   ```
   Fewer than 3 identifiable shapes lowers it to `"low"`. The one road to `"high"` is a checkable
   sign that draw.io itself produced the image (its default chrome, grid or watermark) with all
   seven slots filled and all seven roles labelled. That keeps inferred provenance distinct from
   parsed provenance.

Unusual inputs:

| Input | Outcome |
|---|---|
| No vision | Stop as described. Never guess. |
| Fewer than 3 identifiable shapes | Go on with `confidence: "low"` and warn that the preset only loosely approximates the picture. |
| No readable labels | Roles come from shape class alone: cylinder `database`, diamond `decision`, swimlane `container`, dashed grey rectangle `external`, the rest `service`. Palette, font and edges are still extracted. Tell the user that without readable labels only shape class could drive the roles. |
| Two colours in one hue family | The commoner keeps the slot and the other moves to the adjacent empty one (rule in step 2). |
| Over 7 fills | Keep the 7 that cover the most area and warn about the dropped colours. |
