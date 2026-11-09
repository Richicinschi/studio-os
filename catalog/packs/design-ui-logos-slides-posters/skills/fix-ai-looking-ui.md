---
id: fix-ai-looking-ui
title: Fix a generic-looking screen
---

## When to use

Use this when a screen, page or app view already exists and the person says it looks bland, generic, template-like, "AI-made", or just "off", and wants it polished. Typical words: "this looks like every other site", "make it look less AI", "it feels cheap but I can't say why", "tidy up this page".

This skill starts from something that exists. Neighbours take over elsewhere:

- Building new UI from scratch is the job of the hub skill `frontend-design`.
- Looking up palettes, font pairings and named styles is `ui-styles-palettes-fonts`. Call it from pass 2 or 4 below if the person needs options; do not reproduce its data here.
- Deciding the look before anything is built (mood, brand, references) is `design-direction`, in this same pack. If the screen has no identity at all and the person wants one invented from nothing, hand over to it first, then return here.
- Accessibility audits, performance and bug fixing are other jobs. Fix a contrast problem you meet, but do not turn this into a compliance review.

## How it works

Keep a short running note called the change log: one line per pass, "before / after / why". It becomes your report.

1. **Look at the real thing.** Find the files that render the screen. If a browser or screenshot tool is available, open the screen and look at it at a phone width and a desktop width; judge what people see, not only the code. If you can only see code or a screenshot, say so and work from that. If you only have a screenshot, rebuild it faithfully first and treat the rebuild as the original. Save a copy or note the starting state so you can compare later.

2. **Audit, in this order.** List each fault with where it lives, one line each:
   - Layout and spacing: cramped or uniform gaps, everything centred, same-size cards in a grid, boxes inside boxes, no clear first thing to read.
   - Type: one weight everywhere, headline barely bigger than body, default system font with no reason, wide lines of body text, all-caps tracked labels on everything.
   - Colour: a purple-to-blue gradient, glow, grey-on-white with one random accent, colours with no meaning, pure black on pure white.
   - Imagery and icons: emoji used as icons, stock-looking blobs, sparkle icons, a mock window drawn by hand, icon in a tinted circle above every heading.
   - Motion: everything fades up on scroll, bounce on every button, animation of width or height, nothing that responds to touch.
   - Stock devices: an opening block made of one huge figure, a tiny caption and a row of stats; one word picked out in a headline by colour or italics; small captions sitting over content that needs none; numbering on items that have no order; tinted rules, dividers and badges added only to fill space; the same shadow and corner on every box.
   - Copy: words like "seamless", "powerful", "unlock", "elevate", "supercharge"; three-item feature lists with identical sentence shapes; invented statistics or testimonials.

3. **Triage.** Count honestly.
   - Many faults across colour, type, icons and copy: heavy. Run the full procedure.
   - A mostly designed screen with a few faults: light. Fix only what the audit found, keep its palette, type and layout, and take the direction from the existing brand.
   - Nothing worth fixing: say so plainly. Suggest two or three small refinements at most, each with the exact value to change, and make them only if the person says yes; then stop. A screen that already works is not improved by being altered for its own sake.

4. **Write the design direction: one sentence, before any edit.** Base it on the product's purpose and its audience, not on trends. Shape: "A [concrete adjective], [concrete adjective] tool for [person], that feels like [a place or material it belongs to]." Empty adjectives (clean, modern, sleek, minimal, premium) do not count as description, because every template claims them; replace each with something you could point at on the screen. Add the one small detail that only this product would have, used consistently. Show the audit and the sentence to the person and wait for a yes on a heavy job (changing direction later means redoing every pass). On a light job, state the sentence and continue. If the product has a real brand (a logo, a colour, a typeface that is not itself on the fault list), keep it and build the sentence around it.

5. **Pass 1, spacing.** Pick one base unit (4 or 8 px) and set every gap, padding and margin to multiples of it. Give related things smaller gaps than unrelated things. Stop when you can name the spacing steps in use and there are no more than about five.

6. **Pass 2, colour.** Reduce to neutrals tinted toward the product's world, one accent, and meaningful status colours. Remove gradients and glows unless they carry meaning. Put all colours in named variables. Stop when the accent appears on the primary action and a few key spots only, and body text contrast is at least 4.5:1.

7. **Pass 3, icons and imagery.** Replace emoji and decorative icons with one consistent icon set (same stroke, same size), or remove them. Remove icons that only decorate. Show the real product or real content where you can. Stop when no two icon styles remain and no icon is there only to fill space.

8. **Pass 4, copy.** Rewrite vague claims into specific statements of what the thing does. Cut invented numbers, testimonials and logos; if they are missing, leave a visible placeholder and tell the person. Make labels sentence case. Stop when each heading says something a competitor could not say verbatim.

9. **Pass 5, type.** Choose at most two families with a reason from the direction sentence. Set a scale of about six sizes (ratio roughly 1.2 to 1.333), body at 16 px or more, lines of 45 to 75 characters, a clear weight contrast between heading and body. Stop when the order of reading is clear with eyes half closed.

10. **Pass 6, layout.** Fix hierarchy: one dominant element per view, alignment on a few shared edges, vary section shapes so they are not all centred stacks of equal cards. Stop when each view answers "what is this and what do I do next" in the first screen without scrolling.

11. **Pass 7, details.** One radius per nesting level, consistent borders and shadows, visible focus states, hover and pressed states, empty and error states. Stop when every interactive element shows all its states.

12. **Pass 8, visuals.** Add rich colour, material or a rendered object only in one or two moments the product earns (a chart whose colours mean series, a real screenshot). If you need a generated image, write the prompt and tell the person; do not fake one. Stop after two moments.

13. **Pass 9, motion.** Animate only transform and opacity. Keep durations short, ease out, give a reduced-motion fallback, and keep content visible without scripts. Remove scroll-in effects on everything. Stop when each remaining animation explains a change of state.

14. **Re-check after every pass.** Re-open the screen (or re-read the code if no browser), compare with the audit list, tick off what the pass fixed, note anything it broke, and add the change-log line. Do not start the next pass while the stop-condition is unmet. Render at most about three full times in a run; use code review for the rest.

15. **Preserve what works.** Do not re-skin the whole screen. Any element the audit did not flag, and that fits the direction, stays exactly as it is, including the person's own logo, copy they wrote, and structure their users know.

16. **When to stop.** Stop when the audit list is empty or each remaining item is a taste call you can name, or when two consecutive passes change little. Polishing further has diminishing returns and risks drifting from the direction. Report instead.

17. **Report** in plain words: the direction sentence, the change log (before and after per pass), anything left undone, and anything the person must supply (real photos, real numbers, brand fonts). Explain technical terms like "token" or "contrast ratio" simply when you use them.

## Checks before done

- The direction sentence was written before the first edit, and it contains no vague banned words.
- Every fault on the audit list is either fixed, or listed in the report with a reason.
- A change-log line exists for each pass run, and each pass's stop-condition was checked after it.
- The screen was viewed after the last pass (browser, screenshot, or an explicit note that it was not).
- Nothing the audit did not flag was restyled, and the person's own brand elements are unchanged.
- No invented statistics, testimonials or logos remain; placeholders are labelled.
- Text contrast of body copy is at least 4.5:1 and focus states are visible.
