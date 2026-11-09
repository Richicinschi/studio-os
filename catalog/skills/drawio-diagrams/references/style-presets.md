# Style presets

A preset is a small JSON file that remembers how a person likes their diagrams to look: the
colours, the shape vocabulary, the fonts and the edge style. While one is active it takes the
place of the default colour, shape and edge tables in `SKILL.md`.

Read this file if any of these is true:
- someone wants a style learned, saved, remembered or extracted from a file;
- someone wants to list, show, delete, rename or default a preset;
- step 0 of the working order found a preset and you need the rules for using it;
- a preset file must be checked before it is used.

## Finding presets

There are two places, searched in this order.

1. `~/.drawio-skill/styles/<name>.json` holds the user's own presets.
2. `<skill-dir>/styles/built-in/<name>.json` holds the three that ship with the skill: `default`,
   `corporate` and `handdrawn`.

A user file hides a built-in of the same name. `styles/schema.json` describes the format.

Three rules about names and defaults:
- Lowercase every name before you create or look up a file. The schema insists on lowercase.
- Only a user preset may carry `"default": true`.
- To make a built-in the default, copy it into the user folder first and flag the copy. Leave
  the shipped file alone.

## Using a preset

The preset wins over everything in the default tables. Do not blend the two.

**Colour.** Work out the role of each shape: service, database, queue, gateway, error, external
or security. `roles` in the preset maps a role to a slot name, and `palette` maps the slot to a
fill and stroke. When the role is missing, or its slot is `null`, go down this ladder:

1. Try the role's home slot. Home slots: primary is for services, success for databases, warning
   for queues, accent for gateways, danger for errors, neutral for external systems, secondary
   for security.
2. Failing that, take the slot with the most content.
3. Stay inside the preset. Never borrow from the default table.

Decisions and containers are not in `roles`:
- A rhombus decision takes `palette.warning`, or the ladder starting from `warning` if that is empty.
- A swimlane container takes the slot of the tier it represents (services get `primary`, data
  gets `success`), or `primary` when nothing hints at a tier.

**Shapes.** The text in `shapes[role]` opens the vertex style, ahead of `whiteSpace=wrap;html=1;`
and the colours. A database in a preset whose `shapes.database` is `shape=cylinder3` therefore
begins `shape=cylinder3;`. Six keys exist: `service`, `database`, `queue`, `decision`,
`external`, `container`. Gateway, error and security borrow `shapes.service` unless the preset
names them.

**Edges.** Begin with `edges.style` and add `edges.arrow`. Position keys such as `exitX` and
`entryY` still come from the normal routing rules. If a link fits one of the words in
`edges.dashedFor` (the user used the word, or one end plays a role that is usually optional),
add `;dashed=1`.

**Fonts.** Every vertex gets `fontFamily` and `fontSize` from the preset. When `titleBold` is on,
container headers and swimlane titles also get `fontSize=<titleFontSize>;fontStyle=1`.

**Extras.**
- `sketch` true: add `sketch=1` to all vertex and edge styles.
- `globalStrokeWidth` other than 1 (0.5 included): add `strokeWidth=<n>` to all of them.

**Together with a diagram type.** The type keeps its structural keywords (an ERD still needs its
table-layout keys). The preset supplies colours, fonts, edge style and extras on top. If the type
hard-codes a colour, the preset's colour replaces it, except `fillColor=none`, which is structure.

## Learning a style from a file

Examples of the request: "remember this style as `<name>`", "save this as `<name>` style",
"learn my style from `<path>` as `<name>`".

The file type picks the route: `.drawio` and `.xml` go the XML way; `.png`, `.jpg`, `.jpeg` and
`.svg` (as a flat picture) go the image way. Then:

1. Read `style-extraction.md`.
2. Extract the candidate with the route's procedure.
3. Lowercase the name. Write the candidate to `drawio-preset-<name>.json` in the scratch
   directory. Do not touch `~/.drawio-skill/styles/` yet.
4. Draw the sample diagram from `style-extraction.md` with the candidate, export it to
   `./preset-<name>-sample.png`, and repair the PNG with `repair_png.py`.
5. Show the user a summary table (palette values, shape per role, font, edge style, extras), the
   sample's path (embedded if the environment allows), and a provenance line giving the source
   type, source path, extraction date and confidence.
6. Act on the answer.
   - "save" or "looks good": create `~/.drawio-skill/styles/` if needed, write the candidate there
     as `<name>.json`, then delete the scratch file and the sample PNG.
   - "change `<field>` to `<value>`": edit the candidate, draw again, ask again.
   - "cancel", "abort" or "no": delete the scratch file and sample; save nothing.

What to do when things go wrong:

| Situation | Response |
|---|---|
| The source path does not exist | Stop; say the path was not found. |
| The XML does not parse | Stop; quote the parse error and suggest repairing the file in the desktop app. |
| An image is given but no vision is available | Stop; ask for a vision-capable model or the `.drawio` file. |
| The file yields no shapes | Stop; refuse to save. |
| Under 3 distinct colour pairs | Carry on, with `confidence` `"low"` (image) or `"medium"` (XML), and warn. |
| The name is taken by a user preset | Ask whether to overwrite or rename. |
| The name is taken by a built-in | Save into the user folder, which hides the built-in; warn once. |
| The sample cannot be drawn | Show the summary anyway, note that the sample failed, and offer to save on the user's OK. Never block. |

## Looking after presets

Everything is asked in plain language. Lowercase the names first.

- **List.** For "list my styles", "what styles do I have" or "show me my style presets", read both
  folders and print name, location (user or built-in), `source.type`, `confidence` and the default
  flag. Mark any built-in that a user preset hides.
- **Show.** For "show my `<name>` style" or "what's in `<name>`", print the JSON with indentation
  and one line on source, confidence and default status.
- **Set default.** For "make `<name>` the default": on a user preset, set the flag, clear it from
  any other user preset, save both files. On a built-in, copy it to the user folder, then flag the
  copy.
- **Clear default.** For "remove default" or "unset default", clear the flag from whichever user
  preset holds it.
- **Delete.** Ask first, then remove `~/.drawio-skill/styles/<name>.json`. Never delete anything
  in `styles/built-in/`; suggest a same-named user preset to hide it.
- **Rename.** Move `<a>.json` to `<b>.json` in the user folder and change the `name` field inside.
  A built-in cannot be renamed; offer to copy it and rename the copy.
- **Learn.** "learn my style from `<path>` as `<name>`" starts the section above.

## Checking a preset

Run this light check whenever a preset is loaded, for drawing or for management:
- `name`, `version`, `palette`, `roles`, `shapes`, `font` and `edges` exist;
- `version` equals 1;
- every filled palette slot has `fillColor` and `strokeColor` in `#RRGGBB` form;
- `confidence`, if present, is `"low"`, `"medium"` or `"high"`.

A failed check while drawing: warn, fall back to the default conventions for this diagram only,
and leave the file unchanged. A failed check while learning: refuse to save and name the
offending field.
