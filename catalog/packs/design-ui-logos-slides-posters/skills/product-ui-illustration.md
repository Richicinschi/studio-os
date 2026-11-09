---
id: product-ui-illustration
title: Illustrate an app screen
requires: [a browser]
---

## When to use

Use this when the person wants a picture of an app screen or a single interface component for a launch page, documentation or a social post. Typical requests: "draw our card component with its measurements", "make a clean mock of the dashboard for the landing page", "animate this screen for the hero section".

Neighbours:
- A real, working interface to ship in the product: that is front-end building, not an illustration. Hand over to the front-end design skills.
- A chart of data: use the data-visualisation skills.
- A flowchart, architecture or system diagram: use the diagramming skills.
- A logo or brand mark: use the logo skill.
- A general motion piece with no product screen in it: use the motion skills.

## How it works

1. Ask two things, in plain words. What is being pictured (one component, or a whole screen)? Where will it be seen (page width, light or dark ground, still or moving)? Draw at the size it will be seen, not larger.
2. Choose the kind.
   - **Dimensional drawing**: one component, one sheet, like an engineering drawing. Pick it when the audience needs to understand sizes, spacing and structure (documentation, design-system pages, a technical post).
   - **Faux product UI**: a believable, simplified screen that sells the idea. Pick it for launch pages and posts. If the person is unsure, say which you recommend and why, then go.
3. Decide the medium: still, or animated. Default to still unless the person asks for movement.

### Kind A: dimensional drawing

House rules. Hold all of them.

- **Monochrome.** Black lines on white, greys only. Tell parts apart by line weight, dash pattern, hatching and light grey fill. No accent colour.
- **Structure, not content.** Draw labelled placeholders (title slot, action slot, content slot) instead of real text. Never dimension a piece of text by its width. Name the sizing behaviour of each slot: hug (sized by content), flex (takes the remaining space), fill.
- **Codes with formulas.** Every dimension on the sheet is a short code, never a bare number. A table lists code, plain variable name and value. Derived values show their formula and result, for example `header-min = 2 x pad + action-height = 64`. Group codes by prefix: spacing, heights, sizes, borders, radii, shadow, limits.
- **Unbranded.** Leave brand names and logos out of the drawing, the title block and the footer unless the person asks for them, and give the sheet a neutral name such as "UI-CARD-001".
- **Never invent values.** Anything unknown is drawn as a proportional schematic and marked `[TBD]`. Tell the person which values were unknown.
- **Title block.** Sheet name, subject, scale note, date, revision.

Method: measure, then name, then derive.
1. Get the real component: its source, a rendered page, or the person's description. If it exists in a browser, render it, wait for fonts, then walk its boxes and read each one's position, padding, gap, radius, border, minimum height.
2. Give every distinct measurement a code and a variable name. Survey all variants before naming, so one code is not used for two different things.
3. Write the derived values as formulas from the named ones (inner radius = outer radius minus border minus inset; overall height = sum of regions). Only the base values are typed in; everything else is computed.
4. Check every formula closes: recompute each total from its parts.

Build: one self-contained HTML file (no external fonts, scripts or images) with a title block in HTML and one SVG sheet of fixed proportions, about 1700 by 1060 units. Write a small set of helper functions in the file: horizontal dimension, vertical dimension, callout, radius label, boxed note number, detail circle, table. Conventions: outline about 1.6 px, dimension lines about 0.7 px, extension lines thinner and stopping just short of the feature, filled arrowheads, dimension text with a white halo behind it so lines never strike through numbers. Where a dimension span is too short for arrows, put the arrows outside. Stagger labels in tight chains.

Two traps: a stylesheet fill that targets a shape's class beats a hatch fill written as an attribute, so keep hatched shapes in a class that sets no fill; and inside scaled groups give lines a non-scaling stroke so thickness stays constant.

Before delivering: every code on the sheet is in a table; every formula closes; no brand text; no colour (search the file for hex values outside the greys); no text-dependent widths. Then render the sheet around 1800 px wide, check by eye for labels that collide or content that runs over the sheet's border, and correct everything in a single round.

### Kind B: faux product UI

1. Plan before drawing. Write down: the focal object, the single action, the payoff, and what can be left out. Fewer things, drawn well.
2. Set a text budget first: decide how many real words the picture shows, normally three to seven items. Every other line of text becomes a plain grey bar pushed to the edges, away from where the eye goes.
3. Use the person's tokens (colours, radius, type) if they gave a product or site; otherwise pick one theme and one accent and keep to them. No sparkles, no purple gradient by default, no made-up logos, no letter-in-a-square marks.
4. Let the main surface fill at least two thirds of the frame and run off an edge, rather than float with air on all four sides. Keep insets even.
5. Do not hand-draw a phone status bar or home indicator badly; omit them or draw them once, correctly.
6. Build as one self-contained HTML/SVG file.
7. Run the gate below.

### Animation (either kind)

Write the scene as a pure function of time: a single `render(t)` in which every property is computed from the time `t` and nothing is carried over from the frame before. That way any moment can be reached directly, the person can scrub through it, and a recorder can capture it one frame at a time. Rules:
- Use only the clock: time in, state out. No timers that accumulate, no random values without a fixed seed.
- Build helpers for segment, interpolate and ease, and clamp to 0 to 1.
- Draw strokes first and fade fills in afterwards, otherwise a white fill hides the lines still drawing.
- Keep it 8 to 15 seconds, three to five beats and a payoff. Stagger groups, ease in and out, and hold only briefly. Nothing moves without a reason; data never runs backwards without a cause.
- Choose a poster frame: the moment that tells the story alone, with the result left on screen, since many people only see that frame.
- Keep stroke widths constant when a group scales.

### Verification gate (faux UI, and animation of any kind)

Do not hand over until these named checks pass in a real render.
1. Render in the browser at the display size. For animation, sample frames across the whole timeline, including the first, last and poster frame.
2. Run named geometric checks, by measuring element boxes in the page, not by eye alone:
   - **clipping**: no element or text is cut by its container or by the frame, unless it deliberately runs off the edge;
   - **overlap**: no two elements overlap unless the overlap is intended (list the intended ones);
   - **text fit**: every label fits its box on one line or its planned lines, with no overflow;
   - **alignment and padding**: left edges and insets that should match are equal within one unit; no near-tangent edges (gaps under about 3 units that are not zero);
   - **jumps**: in animation, no property changes abruptly between neighbouring frames except by design.
3. Fix every finding, then re-run all checks. A finding may be waived only if you can say why it is intentional.
4. Report to the person what passed, what was waived and why. Passing is necessary, not sufficient: also look at the screenshot once with a fresh eye.

## Without local tools

Without a browser (for example on claude.ai with no page rendering), still write the single HTML/SVG file, with the same house rules, codes and formulas computed by hand and double-checked by recomputing each total. Say clearly: "This was not rendered or checked." Name which checks could not be run (clipping, overlap, text fit, alignment, frame jumps). Where possible show the person the file in their own browser, and offer to fix whatever they see. If the platform can display HTML directly, that counts as rendering for the person's eyes but not as a measured check.

## Checks before done

- The kind (drawing or faux UI) was chosen and said aloud, and the output is one self-contained file with no external requests.
- Drawing kind: every dimension is a code listed in a table, every formula was recomputed and closes, unknowns are marked `[TBD]`, and a search shows no colour and no brand text.
- Faux UI: the page was rendered in a browser and the clipping, overlap, text fit and alignment checks ran with no unwaived finding, or the person was told plainly that no render happened.
- Animation: `render(t)` depends on `t` only, and frames at the start, middle, end and poster point were sampled and looked at.
- The person was told which values were unknown or invented, and which checks passed or were skipped.
