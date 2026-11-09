---
id: design-system-capture
title: Capture a style guide
requires: [a browser]
---

## When to use

Use when the person likes how a website, an app screen or some reference images look and wants the colours, fonts and spacing saved as a reusable style guide. Typical words: "I love how this site looks, can we use that style", "pull the colours and fonts from this page", "make a style guide from these screenshots", "keep our new pages looking like this".

Neighbours:
- Designing a new look from nothing (no reference): the hub skills `frontend-design` or `ui-styles-palettes-fonts` take over.
- Brand voice, logo rules and messaging: the hub skill `brand` takes over.
- Checking contrast and accessibility of the captured colours in depth: use an accessibility-focused skill after capture.
- Drawing or rebuilding an actual logo or illustration: a logo or illustration skill, not this one.

## How it works

1. **Check the source is fair game.** Only public pages. Read the site's robots.txt and terms first; if they disallow automated visits to the page, stop and say so. Never log in on the person's behalf to reach a private page, never get past a login wall, captcha or bot protection, and never hammer a site with many page loads (one to a few pages is enough). If the page is blocked, ask the person for screenshots instead and use step 8.
2. **Tell the person the rule of use, in plain words.** Captured styles are inspiration for their own work. Do not copy another business's logo, name, wording, images or distinctive brand look closely enough that people could mistake the two. Colours and font choices are fine as a starting point; a trademark is not.
3. **Decide the pages.** Pick the home page plus one or two that show different things (a content page, a form or pricing page). Ask the person which pages best show the look they like.
4. **Extract in many small, separate steps.** Run one small in-page script per topic, each in its own try/catch (or its own tool call): colours, font families and sizes, font weights and line heights, spacing, border radius, shadows, buttons, links and inputs, page-width and breakpoints. If one step fails, record "not captured: <topic>, <reason>" and carry on. One failure must lose only its own section.
5. **Measure; do not eyeball.** Read real values from the page with in-page code: computed styles of elements (colour, background-color, border-color, font-family, font-size, font-weight, line-height, margin, padding, gap, border-radius, box-shadow), plus CSS custom properties declared on the root. Collect numbers, not impressions. A screenshot is for the person to look at, never the source of a hex value.
6. **Clean the colours.**
   - Convert everything to hex. Ignore fully transparent values.
   - Count how many elements use each colour.
   - Merge near-identical colours by perceptual distance, not by hex text. Write the hex list (one `#hex count` per line) to a file and run `node skills/design-system-capture/merge-colors.mjs <file> [distance]`. Default distance is 15 (Lab space; below about 2 the eye cannot tell, 15 groups "same family"). The script prints each group with its total count and the merged members.
   - Down-weight a colour found on a huge share of elements (over about 40 percent): it is usually a page background or default text colour, so it is a neutral, not a brand colour. Keep it, but do not call it the accent.
   - Up-weight colours seen in brand contexts: the logo, the main button, the header, links. Count these several times over (roughly five times for logo or brand areas, four for the main call-to-action button).
   - Name the roles: background, surface, text, muted text, primary/accent, border, and status colours if present.
7. **Give every finding a confidence level.** High: measured directly and seen in a brand context or on many elements. Medium: measured but seen once, or only one weak sign. Low: guessed, or from one tiny element. The same goes for detected tools (a font service, a CSS framework): one strong sign is high, two weak signs medium, a single weak sign low. Show confidence in the output and do not promote a low finding into the tokens without telling the person.
8. **Reference images instead of a page.** The model misreads colours in pictures, so measure them. Write a small Node or Python script (for the person to run, or run it if you can) that samples pixels (cap at about 100,000 by even spacing), groups them into 6 to 10 clusters, merges clusters closer than a small perceptual distance (loosen it for JPEG because compression adds noise), and reports hex plus share of the image. Largest cluster is usually the background; the cluster with the biggest lightness gap from it is the text; the most saturated cluster with meaningful share is the accent. Then verify numerically: re-measure a screenshot of the finished work and compare. Pass if the average colour distance is within about 5, the worst within about 20, and each colour's share moved by no more than about a third. If it fails, fix the tokens, not the threshold.
9. **Write the tokens.** Use the simple standard design-token format: a JSON file where each token has a `$value` and `$type` (color, dimension, fontFamily, fontWeight, shadow), grouped as `color.primary`, `font.size.body`, `space.4`, `radius.md`. Snap spacing to a scale (for example 4, 8, 12, 16, 24, 32, 48) and sizes to a type scale, noting where the source did not fit a scale. Also write the same values as CSS variables in a `tokens.css`, such as `--color-primary` and `--space-4`. Keep names about role, never about appearance ("primary", not "blue").
10. **Write DESIGN.md.** Sections: one-paragraph feel of the look in plain words; colour roles table with hex, role and confidence; typography (families, fallbacks, scale, weights, line heights); spacing scale; shape (radius, borders, shadows); component notes (buttons, inputs, cards); do and do-not rules; what was not captured and why; where it came from and the date, with the inspiration-not-copying note. Link the token file and CSS file.
11. **Add the drift check.** Create a small script in the person's project that scans their CSS/HTML/component files and finds hex colours, font families and pixel spacings not defined in the tokens (allowing a tolerance for near-identical colours, same distance as above). It lists each offender with file and line, and exits with code 0 when clean and code 1 when there is drift. Also support saving a baseline token file and comparing the current tokens against it, exiting 1 on any change. Offer to add it to the project's test or pre-commit step; do not install hooks without being asked.
12. **Hand over.** Show the person a short summary: the palette as swatches (render a small HTML page of coloured squares and open it), the fonts, and the low-confidence items they should decide on. If fonts are licensed or paid, say so; suggest an open alternative.

## Without local tools

Without a browser or a way to run code (for example on claude.ai chat):
- Ask the person to paste the page's CSS, or use the browser's "inspect" panel to copy the computed styles of the main elements, or share screenshots. Extract from what they paste.
- For images, you can only describe colours by eye. Say so, mark every colour low confidence, and offer a short script for the person to run that measures the real hex values, then take their output into step 6.
- Write DESIGN.md, the token JSON, the CSS variables and the drift-check script as text for the person to save and run.
- Be plain that nothing was measured on the live page and the drift check was not run.

## Checks before done

- Every hex in the tokens came from measured output (page values or the script), not from looking.
- Near-duplicate colours were merged and the merge output was seen, with the huge-coverage neutrals separated from the accent.
- Every colour and font in DESIGN.md has a confidence level, and every failed or skipped topic is listed under "not captured".
- The token JSON parses, and the CSS variables match it value for value.
- The drift check was run once on clean files (exit 0) and once with a deliberately off-token colour added (exit 1), then the test change was removed.
- For image references, the numeric comparison was run and its result reported.
- The person was told the source was public and robots-permitted, and told to use the result as inspiration, not as a copy of someone's brand.
