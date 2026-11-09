---
id: slide-deck
title: Make a presentation
requires: [a browser]
---

## When to use

Use this when the person asks for a presentation, a pitch deck, a set of slides, "something to show on a screen while I talk", or a redesign of a deck they already have.

Neighbouring jobs:
- A single image, poster or social card: use the skill for one-off visuals, not this one.
- A logo or brand identity the deck should follow: do that first, then come back here with the colours and fonts.
- A chart inside a slide: build the chart with the data-visualisation skill, then place it on the slide here.
- A written report or a document meant to be read rather than presented: that is a document job. A "report-out" deck is covered here only when it is shown live.
- If the person insists on a PowerPoint file and nothing else, the pptx skill takes over for the file itself; the content outline and look choice from this skill still apply.

## How it works

1. Ask before building. Put these in one short message and wait for the answers: the occasion (who is the audience, how long is the talk, is it read alone or presented live), the mood in the person's own words ("calm and serious", "loud and playful"), and the topic with a real title, subtitle, presenter name and date. Do not guess the mood, even when it seems obvious; people's taste surprises. Also ask whether they have a logo, brand colours or a font they must keep.

2. Find ready looks. A "look" is one complete visual style for a deck (fonts, colours, grid, decoration, a set of slide layouts) kept as a folder with a single HTML file and a small metadata file. If the workspace has a folder of looks, read only its index, not the HTML files. The index has one short record per look with these fields: a short id, a name, a one-line tagline, mood words, occasions it suits, tone, formality (casual to formal), density (airy to packed), scheme (light, dark, or both), what it is good for, what it should be avoided for, and slide count. Describe looks by how they feel, not by industry; a confident editorial look can carry a technical talk if the person wants to feel design-led. Keep the index small enough to read in one go; rebuild it from the metadata files whenever a look is added.

3. Pick three looks that are genuinely different from one another: different colour scheme or density or tone, so the person has a real choice. Three variations of the same dark blue style is a failure. Match against the mood, occasion and formality the person gave, and drop anything whose avoid-for note fits their situation.

4. Render a title slide for each of the three, using the person's real title, subtitle, name and date. Never use lorem ipsum or the look's demo text in a preview. Save each as a standalone HTML file in a previews folder, with any sibling files it needs, and open each in the browser. Send the person the three file paths with one line on the feeling of each. Then stop and wait for the choice. Do not start the deck before they pick, and do not mix looks.

5. Build the deck from the chosen look. Copy the look's folder into the person's workspace, never edit the library copy. Then follow the keep/replace rule:
   - Keep untouched: fonts, colour variables, grid, slide-level layout classes, decorative elements, and the navigation code. These are the design.
   - Replace: headlines, body text, numbers, names, dates, section labels, footers, and image placeholders (use the real image at the same size, or leave a clearly marked blank).
   - Need more slides of a layout the look has: duplicate a slide of that layout, fill it, and renumber the page labels. Need fewer: remove from the end and renumber.
   - Need a layout the look lacks (a comparison, a timeline, a big quote): design it using the same fonts, colours, spacing and decoration as its neighbours, so it looks like it belonged. Never recolour or swap fonts to make a new layout easier.

6. When no ready looks exist, build three yourself. Make three single-file HTML looks, each with a different scheme, density and tone, all in the same plain structure so they can be swapped: one `<section>` per slide at a fixed 16:9 size (for example 1920 by 1080) scaled to the window, all colours and fonts as CSS variables at the top, a few layout classes (cover, section break, text, two columns, big number, quote, closing), arrow-key and click navigation, and a visible page number. Render the person's real title on each, show the three, and continue from step 4. Offer to keep the chosen one as a reusable look.

7. Plan the structure before filling text. Write the slide list as one sentence per slide (the claim that slide makes), and show it if the deck is longer than ten slides. Starting shapes by occasion:
   - Investor pitch (10 to 14 slides): problem, who has it, the solution, how it works, why now, market, traction or evidence, business model, competition, team, the ask and what the money does. One number the audience will remember on the traction slide.
   - Class talk (about one slide per minute at most): the question, why it matters, background in two or three slides, method, findings, what it means, limits, one-slide summary, questions. End with the summary, not with a "thank you".
   - Report-out (status or results): the headline result first, then three to five supporting points, risks or open items, decisions needed, next steps with owners and dates. Put the conclusion on slide two, not at the end.
   Whatever the occasion: a cover, a closing slide, and a divider between big parts when the deck passes about eight slides.

8. Apply the content rules while writing:
   - One idea per slide. The headline is a full sentence stating the point, not a topic label ("Sales doubled after the redesign", not "Sales").
   - At most about 30 words of body text on a slide and no more than five bullets; if a slide needs more, split it, or move the detail to speaker notes or a handout.
   - Type for the back of the room: body text at least 24 px on a 1080-high slide (about 18 pt), headlines at least 40 px, nothing smaller than 16 px even in footers or chart labels.
   - Use real contrast: body text against its background at least 4.5 to 1, large text at least 3 to 1.
   - Put the talking points in speaker notes on every content slide: what to say, the example to give, the number to quote. Slides carry the point; notes carry the explanation. Use the look's notes mechanism if it has one; otherwise a hidden element or a separate notes section, and say where they are.

9. Check what scripts can check, in the browser, on every slide (step through them; do not eyeball three and assume):
   - Overflow: for each slide, compare each element's bounding box with the slide's box; any element reaching outside, or any scroll height above client height, is a failure.
   - Font floor: read the computed font size of every text element; list anything under 16 px, and body text under 24 px.
   - Contrast: compute the ratio between each text colour and its effective background; list anything under 4.5 (3 for large text). Text placed over an image needs a solid or darkened panel behind it.
   - Leftovers: search for placeholder text from the look (bracketed tokens, "Lorem", demo names, the old year) and for page labels that do not match the slide count.
   Fix what fails and repeat. Take a screenshot of the cover, one dense slide and the closing slide and look at them yourself.

10. Export. PDF: print the deck from the browser with the slide size set as the page size, background graphics on and margins at zero, then open the PDF and confirm the page count equals the slide count and nothing is cut off. Keep the HTML as the master. If the person asks for an editable format (PowerPoint or Keynote), say plainly that it is rebuilt from the content, not converted, so spacing and fonts will differ slightly, hand over to the pptx skill with the finished outline, and still deliver the PDF as the reference.

## Without local tools

If there is no browser, or the person is on claude.ai and cannot give you one:
- Do the thinking part fully: the questions, the three looks described in words (scheme, fonts, mood, density) so the person can choose, the slide-by-slide outline, the text of every slide and the speaker notes.
- Produce one self-contained HTML file with the deck in the chosen look (no external files; fonts fall back to system fonts if web fonts cannot load), and tell the person to open it in their browser, use the arrow keys to move, and use the browser's print dialog, set to landscape with background graphics on, to save a PDF.
- Say plainly what was not verified: previews were not rendered, overflow, font sizes and contrast were not measured, the PDF page count was not checked. Give the person the font floor and contrast numbers above so they can eyeball the result, and ask them to tell you which slides look cramped or cut off so you can fix them.

## Checks before done

- The person saw three genuinely different title slides with their own real title and chose one before any deck was built.
- Every slide in the final deck was stepped through in a browser, with no element outside its slide and no leftover placeholder text.
- The measured smallest font is 16 px or more, body text is 24 px or more, and every text/background pair is at or above the contrast thresholds.
- Each slide states one point, and the slide count and page labels agree.
- Speaker notes exist on every content slide, and the person was told where they are.
- The PDF exists, has the same page count as the deck, and was opened and looked at; the HTML master is kept beside it. If any of this could not be done, the report says which part was not verified.
