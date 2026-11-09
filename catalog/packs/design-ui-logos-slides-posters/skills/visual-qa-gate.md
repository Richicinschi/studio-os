---
id: visual-qa-gate
title: Check visuals before handover
requires: [a browser]
---

## When to use

- You are about to hand over anything people will look at: a web page, a slide, an illustration, an HTML mock-up.
- The person asks "does this page look right?", "is this image OK?", "check it before I send it".
- You just changed layout, colours or text sizes and need proof nothing broke.

Neighbours: if the job is to design or restyle the thing, use the design skills of this pack first and come back here to gate the result. If the job is page speed, use the web performance skills. If the job is a legal or accessibility sign-off, this gate is a spot check, not an audit; say so.

## How it works

The principle: scripts are reliable on what a model misjudges by eye (exact colours, alignment, sizes, counts). The model is reliable on what scripts cannot judge (balance, hierarchy, mood, whether it fits the purpose). Use both, and never let one stand in for the other.

1. **Render.** Open the deliverable in a real browser at three widths: phone (about 390 px), tablet (about 820 px), desktop (about 1440 px). For a slide or an image, render it at its real output size plus one smaller size. Wait until fonts and images have loaded before measuring. Take a full-page screenshot at each size.
2. **Measure.** In each size, run `skills/visual-qa-gate/page-checks.js` inside the page (evaluate its whole text with the browser tool and read the JSON it returns). It reports:
   - horizontal overflow (page wider than the screen, elements past the right edge)
   - clipped text (text cut off by its box)
   - overlapping text boxes
   - text contrast below 4.5:1 (3:1 for large or bold large text); contrast over a background image or gradient is skipped by the script, so judge those by eye and say so
   - text under 12 px
   - images with no alt attribute, and images that failed to load
   - tap targets under 24 px in either direction
   - layout shift above 0.1
   Console errors are not in the script: read the browser console log separately and count the errors and warnings.
3. **Look.** Open every screenshot and examine it yourself. Judge what the script cannot: visual balance, clear hierarchy (one obvious first thing to read), spacing rhythm, crowding, whether the mood fits the purpose, anything that looks unfinished or generic. Zoom into the crowded areas.
4. **List faults** as three parts each: what is wrong, where (size and element), how it was measured (script field, console, or "seen in screenshot"). A fault you only saw by eye is allowed but labelled as such. No vague notes like "could be cleaner".
5. **Fresh eyes.** When you can start a separate reviewer, hand the `design-critic` agent of this pack only the rendered screenshots (not your code, not your reasoning) and ask for faults. Merge what it finds into your list. A reviewer that has seen your intentions tends to excuse them.
6. **Fix and re-render.** Fix the faults, rerun steps 1 to 4 from scratch at all three sizes. A fix at one width often breaks another.
7. **Stop rule.** Pass the gate when every script count is zero (or a remaining item is explained and accepted by the person) and your own look finds no unlisted fault. After 3 rounds, stop and hand over with the remaining faults listed plainly, not hidden.
8. **Compare by counts.** When choosing between two versions, compare the number of counted defects (script totals plus seen faults), then the severity of the worst one. Never rate a version on a 0 to 10 scale; such scores are unrepeatable and cannot be checked.
9. **Report** with a short table: size, checks run, count per check, status. Say what was fixed, what remains, and what was not run.

Rules about honesty:
- A check that did not run is reported as "not run", never as passed. A script that returned nothing or errored counts as not run.
- Zero faults from a page that rendered blank or on a login wall means nothing. Confirm the screenshot shows the intended content before trusting any count.
- Do not loosen a threshold to make the gate pass.

## Without local tools

If you have no browser tool (for example on claude.ai chat with no page rendering):

1. Say at the start that nothing could be rendered or measured.
2. Offer the person `skills/visual-qa-gate/page-checks.js` as text to paste into their browser's developer console (on the page, at a phone width), and ask them to paste the JSON back. Explain in plain words: open the page, press F12, choose Console, paste, press Enter.
3. If you have a screenshot the person sent, do the "Look" step on it and label every finding "seen in screenshot, not measured".
4. Otherwise do a manual review of the source and mark each item below, one line each, as "not run" unless the person confirms it:
   - overflow at phone width: not run
   - clipped or overlapping text: not run
   - contrast ratios: not run (colour pairs in the source can be calculated by hand; say which ones)
   - text size floor: not run (read sizes from the source if present)
   - alt text: can be read from the source; report what is found
   - tap targets: not run
   - console errors: not run
   - layout shift: not run
5. Never write "looks good" or "passes". Write "not verified" with the list above.

## Checks before done

- Three sizes (or the stated reason for fewer) were rendered, and the screenshots showed the intended content.
- `page-checks.js` ran at each size and its counts are in your report, or the check is labelled not run.
- The console log was read and its error count reported.
- Every fault listed has what, where and how measured.
- The last round was a full re-render after the last fix, not a partial one.
- Each remaining fault is named in the hand-over; no skipped check is described as passed.
- If a separate reviewer was available, its findings are merged in; if not, the report says no independent review took place.
