---
id: design-direction
title: Decide a look and feel
---

## When to use

Use this when the person wants to settle how a page, app, brand, deck or product should look and feel before anything is built. They might say "what should this look like?", "I don't know what style I want", "help me pick a direction for the site", or "give me options for the brand". The output is a written art direction. It is never code.

Neighbouring skills, and where each takes over:

- Building UI code with a distinctive look is the job of the hub skill `frontend-design`. Hand it the finished direction from this skill and let it build from there.
- Looking up palettes, font pairings, product-type styles and UX guidelines from data is the job of the hub skill `ui-styles-palettes-fonts`. Use it as a source of candidates while writing the options, or once a direction is chosen to fill in details.
- Fixing a screen that already exists and looks generic is `fix-ai-looking-ui` (same pack). This skill is for the stage before building.

This skill ends with a written direction. The person, or one of the skills above, builds from it.

## How it works

1. **Check what exists.** Ask whether a brand, logo, colours, existing site or reference the person likes is already there. If so, the direction must respect it. If a direction document already exists, read it and confirm it still holds instead of starting over.

2. **Ask only the questions that change the answer.** Use at most five, asked together, in plain words:
   - What is it, and who will use it? (A tired nurse at night and a collector browsing at leisure need different looks.)
   - Do people mostly read or mostly scan and tap?
   - What should someone feel in the first five seconds? Ask for two or three feeling words, not design terms.
   - Name one or two things they like and one thing they dislike. Examples of other people's work are fine.
   - How bold may it be? Safe and trusted, or memorable even if it divides opinion.
   If the person cannot answer, propose answers and let them correct you. Do not interrogate for more than one round.

3. **Write three genuinely different directions.** They must differ on at least three of these axes: light or dark, dense or airy, warm or cold, rounded or sharp, playful or serious, photographic or typographic or illustrated. If two options could be mistaken for each other at a glance, replace one. Make one option safe, one confident, and one deliberately unexpected but still suited to the audience. For each, give:
   - a name and a one-sentence feeling;
   - the colours as roles (background, text, one accent, one warning) with approximate values, and say how bright the accent is;
   - the type: one style for headings, one for body, and why they suit the feeling;
   - the layout stance (for example "wide margins, one idea per screen" or "tight grid, many items visible");
   - how things move, if at all, in one line;
   - one signature element nobody would confuse with a template;
   - the main risk of this choice.
   Where it helps, offer a very small visual: a swatch list, or a rough text sketch of the top of the page. Do not build screens.

4. **Make the person choose.** Recommend one option and say why in two sentences, tied to their answers. They may pick one, combine at most two (name which parts come from which), or ask for another round. After two rounds without a choice, suggest the recommended one and ask for a yes or a no.

5. **Write the commitment before any building.** Record the choice as a short design summary the person can keep (a file named DESIGN.md if files are available, otherwise a block in the chat to copy). Keep it under one page:
   - Purpose and audience, in two lines.
   - The feeling words and the one thing to avoid.
   - Colour roles with values, and the lightness of the main background and text so contrast is predictable.
   - Type choices and a size scale.
   - Layout and spacing rules, including one rule that deliberately breaks the usual grid.
   - Motion budget: what moves, what never does.
   - The signature element.
   - The faults to avoid (step 6), chosen from the list.
   Number the decisions so later work can say "this breaks decision 4".

6. **Check the direction against faults that make a design look machine-made.** Read the written direction and fix any of these before presenting it as final:
   - A purple-to-blue gradient as the main accent, or a gradient used on text.
   - A teal or indigo accent chosen only because it is the usual default.
   - Inter, Roboto, Arial or the system font as the only typeface with no reason given.
   - Every section laid out as the same stack: centred headline, three equal cards, then a button.
   - Cards inside cards, with a rounded border and soft shadow around everything.
   - Emoji or generic icons standing in for real content or imagery.
   - Vague labels like "seamless", "powerful" or "unlock" standing in for specific words.
   - Evenly spread, timid colour with no dominant colour and no sharp accent.
   - Stock-looking decoration (blobs, glowing orbs, sparkle shapes) that says nothing about the subject.
   - Motion on everything, or "transition: all" style blanket effects.
   If the direction contains one of these, either replace it or write down the reason it stays.

7. **Gate.** Nothing is built from this direction until the person has chosen an option or explicitly said to skip the choice. If they skip, record "no direction chosen, builder's judgement" in the summary and tell them the result may look generic. If they ask to start building while still undecided, give the recommended option as the default and ask for one yes.

8. **Hand off.** Say which skill or person builds next, and give them the summary. If they later ask to change the look, update the summary first, then change the build.

## Checks before done

- The person was asked no more than five questions, in one round, or gave the answers themselves.
- Exactly three directions were shown, and they differ on at least three axes (state which ones).
- Each direction has colours as roles, type, layout stance, motion, a signature element and a risk.
- The person made a choice, or waived it in words that are recorded.
- The written summary exists, fits on one page, and lists numbered decisions.
- The fault list was checked against the final direction, and any kept item has a stated reason.
- No code or built screens were produced, and the next builder is named.
