---
id: template-charts-reports
title: Make a chart or one-page report
---

## When to use

Use this when a person has numbers and wants a chart, a graph, a dashboard page or a short report, in words like "turn this spreadsheet into a chart", "show these sales by month", "make a one-page summary of the survey". They may not code and may not know chart names. Do not ask "which chart type do you want"; look at the data and decide.

Neighbouring jobs, and where they take over:

- Flow charts, system diagrams, org charts and other drawings that are not numbers: use the `drawio-diagrams` skill.
- A full slide deck or a multi-page document: this skill only makes the chart or the single page that goes inside it.
- A specific brand look: if the person has brand colours or a style guide, take the palette from there (step 5) and use the brand skill for the wider look.
- Heavy analysis (cleaning, statistics, modelling): do that first, then come back here with the finished numbers.

## How it works

1. **Get the facts that must appear.** Ask only for what is missing: what the numbers measure and their unit, the time span, where they came from and when they were collected. If the person pasted a table, read it and say back, in one line, what you think it shows. Never invent numbers. If sample data is needed to show a layout, say clearly it is sample data.

2. **Pick the output.** The default is one chart. Make a one-page report only if the person says report, summary, one-pager or brief. A request to "analyse" the data with no mention of a report still gets the one or two strongest charts plus a sentence offering a report. The deliverable is a single self-contained HTML file (all styles and scripts inside it, no internet needed to open it) or a standalone SVG when it is one chart going into a document. Tell the person plainly: "You get one file; double-click it and it opens in your browser."

3. **Read the shape of the data first.** Decide which shape you have, then route:
   - One number over time: line, or columns if there are fewer than about 12 periods and each period is a separate total.
   - Parts of a whole (shares adding to 100%): a single stacked bar, a 10-by-10 grid of squares, or a donut with a handful of slices. More than 5 parts: use sorted bars instead.
   - A ranking or comparison across categories: sorted horizontal bars, or dots on a shared line if there are many categories.
   - Two measures per item (how one relates to another): scatter plot, labelled for the few points that matter.
   - Distribution of many individual values: histogram with bins that mean something, or a strip of dots.
   - Before and after for a few items: paired dots joined by a line.
   - Gains and losses adding up to a total: waterfall of up to about six steps.
   - A table where exact values matter more than the pattern: a clean table with the key figure bolded, not a chart.
   - A date by value pattern over a year, or hour of day by weekday: a heat grid.

4. **Compare at least three candidate templates, in a fixed order, and write the comparison down.** A template here means a known, plain skeleton for a chart type (the structure of the markup, the scales, the label positions) that you reuse rather than invent. Compare in this order:
   - First, the standard readable set: bars, lines, dot plots, stacked bars, scatter.
   - Second, the expressive set: dot-grid fills, lollipops, paired dots, small multiples, heat grids.
   - Only if nothing in the first two sets can carry the data honestly and keep its labels readable: the fallback set of big-number tiles and sparklines (also the right pick when the person asked for a dashboard, a monitoring page or a three-second glance).
   For each of three or more candidates, note in a line each: fits the data shape, keeps units honest, fits the labels, reads quickly, and why it lost or won. If fewer than three fit, list every one that fits. "It looks nicer" is never a reason. If you fall back, name which earlier candidates failed and why.

5. **Lock one palette per delivery.** Choose it once and use no other colour anywhere in the file. Default: a neutral ladder (paper-light background, near-black text, about seven greys in between) where the darkest mark is the most important one, plus at most one accent colour for the single thing the takeaway is about. If the person gave brand colours, use them as the accent set. Keep colour-blind safety: never separate two categories by red against green alone; add labels, shape or position. Solid fills only, no gradients, no shadows. Text must be readable against its background (aim for a contrast ratio of at least 4.5 to 1).

6. **Build by taking the chosen template and swapping data in.** Write the skeleton for the winning chart type once, with the data held in one array at the top of the script. After that, change only data, title, labels, source and layout size. Do not redraw the chart from scratch, mix two templates into a hybrid, or fall back to a chart library's default look. For a batch of several charts, spread the templates across the batch: no repeated shape without reason, and one chart makes one point.

7. **Apply the honesty rules. These are not negotiable; any breach means redo.**
   - Marks are proportional to values. When size encodes a value (circles, squares), the area scales with the value, so the radius is the square root of the value scaled to the biggest one. Never use the value directly as a radius.
   - Bars start at zero and the axis is never broken. If one huge value flattens the rest, let it run off the edge with a clear label, or add a zoomed inset, or cut the bar itself (not the axis) and say so in a label.
   - A line chart may start above zero only if the axis shows a visible break mark and the first label says where it begins.
   - Any sample or demo data comes from a seeded generator (a small function with a fixed seed), never from the random function, so reopening the file shows the same chart. Label sample data as sample.
   - Every chart carries the unit on the axis or in the subtitle, the source, and the date of the data. Percentages say what they are a percentage of.
   - Order categories by value unless they have a natural order (time, age bands, ratings).
   - Label directly on the marks where possible instead of a distant legend. Smallest text in the drawing: about 11 px on screen.

8. **Write the one takeaway as the title.** The title is a sentence that states the finding, not the chart type: "Sales doubled in June, then fell back" rather than "Monthly sales". Check it against the data by recomputing the claim. The subtitle holds the legend or time span and the unit, separated by dots. If the data has no clear message, say so and write a neutral descriptive title instead of forcing a story.

9. **One-page report layout, top to bottom.** Only when a report was asked for.
   1. Title (the takeaway sentence) and one-line subtitle with period and unit.
   2. A two-sentence summary in plain words.
   3. The main chart, full width, with an alt-text line under it describing what it shows for people who cannot see it.
   4. Exactly three bullets: what changed, why it may matter, what to do or watch. Each one holds a number from the data.
   5. Caveats: sample size, gaps, estimates, anything that limits the reading.
   6. Source line: who produced the data, the date collected, and how the figures were calculated if anything was derived.
   Keep it to one printed page: set the page width and print styles so it fits A4 or Letter without cutting.

10. **Add the basics.** Make the page responsive (the chart scales with the window), respect the reduced-motion setting (no animation if it is on; animation is optional anyway), and keep the file free of any outside links, fonts or scripts so it works offline.

11. **Show the person the result and explain it plainly.** Say which chart you chose and why in one sentence, what the title claims, and anything you could not verify (for example, you could not check the source numbers yourself). Offer one change at a time, such as another palette or a second chart. When they ask for a small edit, change the file with a small edit rather than rewriting the page.

## Checks before done

- The chosen chart type matches the data shape, and you wrote down at least three candidates with reasons (or listed all that fit, if fewer).
- Every number in the chart and text appears in the person's data or is a calculation you can show; recompute the title's claim and any totals.
- Size-encoded marks scale by area (square root), bars start at zero, and no axis is truncated without a visible break.
- Only one palette is used across the whole file; no colour is the only carrier of meaning.
- Unit, source and date are visible, and any sample data is labelled and seeded.
- The title states a finding; for a report, the layout has title, takeaway, chart, three bullets, caveats and source, in that order.
- The file opens by itself with no internet; you opened or checked its markup for errors, and text does not overlap at narrow and wide widths. If you could not view it rendered, say so.
- You told the person in plain words what file they have and how to open it.
