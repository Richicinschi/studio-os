---
id: ui-styles-palettes-fonts
title: Pick styles, palettes and fonts
---

## When to use

Use this when the person needs concrete choices for an interface that is already decided in outline: which visual style, which colours, which pair of fonts, or whether a control follows good usability practice. They might say "what colours for a meditation app?", "suggest fonts that go with this", "which chart type fits this data?" or "is this form easy to use?". It works for web and mobile, in any framework.

Where the neighbours take over:

- The person has not yet said how the product should feel, and wants options to choose between: `design-direction`. Come back here once a direction is written, to fill in the details.
- The person likes an existing site or image and wants its colours and fonts extracted: `design-system-capture`.
- A brand already exists and must be kept consistent (logo rules, voice, asset naming): `brand`.
- A screen exists and looks bland: `fix-ai-looking-ui`, which calls back here for candidates.
- Writing the interface code with a distinctive look: `frontend-design`.
- Contrast, keyboard use and screen-reader checks as a formal review: `accessibility-review`.

This skill holds no data files and runs no scripts. It is a method for making each choice on purpose, with a reason the person can read.

## How it works

1. **Collect four facts first.** What the product does, who uses it and where (desk, phone on a train, a clinic), how serious the subject is (money and health call for calm trust; a game can shout), and any limit already fixed (a brand colour, a platform, a framework). Ask only for what is missing, in one round.

2. **Choose the style by the user's situation, not by fashion.** Name the style in plain words and give the one reason it fits. Typical pairings:
   - Dense tools used for hours (dashboards, admin screens, editors): flat and quiet, small type, strong grid, few colours, a dark option.
   - Calm and care (wellness, health, finance): generous space, soft corners, muted natural colours, no pure black, no harsh red except for real errors.
   - Playful and young (games, kids, social): saturated colour, rounded shapes, big type, motion that rewards a tap.
   - Premium and editorial (luxury, portfolios, magazines): large serif or high-contrast type, restrained palette, lots of empty space, photography leading.
   - Raw and loud (indie, music, streetwear): hard edges, heavy type, flat blocks of colour. Use it on purpose or not at all.
   Effects such as glass blur, soft 3D buttons or gradients are decoration. Add one only if it helps people see what can be tapped or what is in front.

3. **Build the palette from roles.** Pick in this order and write the value beside each role:
   - one background and one surface colour a step away from it;
   - one text colour that reads on both;
   - one accent for the main action, used rarely so it stays meaningful;
   - success, warning and error colours that are not told apart by hue alone;
   - a muted text colour for secondary labels.
   Then test it, do not trust the eye. Body text needs a contrast ratio of at least 4.5 to 1 on its background, large text and icons at least 3 to 1. Check the dark version separately; do not invert the light one. Keep to one accent, and a total of about six colours plus tints.

4. **Pair fonts with a job each.** Use at most two families: one for headings and one for body, or a single family in several weights. Pair by contrast of character with agreement of proportions (a geometric heading with a humane body, a serif heading with a plain sans). State the sizes: body 16 px or larger on the web, a heading scale where each step is about 1.2 to 1.5 times the last, line height around 1.5 for body text and 1.1 to 1.3 for headings, line length of 45 to 75 characters. Prefer fonts with a free licence and a good range of weights, and say how each loads (system stack, self-hosted file, or a font service) with a fallback.

5. **Run the usability pass on what is being built.** Look for these, in this order, and report each as pass, fix or not applicable:
   - tap targets at least 44 by 44 points on touch screens, with room between neighbours;
   - every control shows a visible focus state and works from the keyboard;
   - every state exists: default, hover, pressed, disabled, loading, empty, error;
   - forms: labels above fields, errors beside the field in words that say what to do, no clearing of typed input on error;
   - navigation: the person always knows where they are and how to go back, with five or fewer top-level places on a phone;
   - feedback within about 100 ms of an action, a progress sign for anything slower than a second;
   - motion short (150 to 300 ms), skippable, and switched off when the system asks for reduced motion;
   - text readable without zoom, and layouts that survive a 320 px wide screen and 200% text size.

6. **Pick charts by the question.** Comparison between categories: bars. Change over time: a line. Share of a whole with few parts: a single stacked bar or a simple ring; with many parts, a sorted bar. Relationship between two numbers: a scatter plot. Distribution: a histogram. A single number that matters: a big figure with a small trend line. Avoid 3D, avoid dual axes, label values directly where it fits, and use the accent colour only for the series the reader should look at first. For anything beyond a quick choice, use `template-charts-reports`.

7. **Write the result down** as a short block the build can follow: style name and reason; the palette as roles with values and contrast ratios; the fonts with sizes and loading; the usability findings; the chart choices if any. Offer to save it as the project's design file so later screens stay consistent.

## Mistakes to avoid

- Offering five palettes when one reasoned choice and one alternative would do.
- Picking colours by name ("a nice teal") with no values and no contrast check.
- Using a trending look because it is trending, then finding it fights the audience.
- Giving advice for one platform only. A phone and a wide screen need different type sizes and spacing.
- Treating the usability pass as optional because the design looks good.
