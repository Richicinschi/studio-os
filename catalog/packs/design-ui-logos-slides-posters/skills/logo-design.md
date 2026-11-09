---
id: logo-design
title: Design a logo
requires: [an SVG renderer]
---

## When to use

Use when the user needs a logo or brand mark for a project or business: "make me a logo", "I need a mark for my shop", "a symbol for my app".

Neighbours:
- Colour palettes, fonts, voice and a full brand guide: the `brand` hub skill takes over once the mark is approved.
- An app icon inside a UI, or screen design: `frontend-design` or `ui-styles-palettes-fonts`.
- A diagram or figure that is not a brand mark: `drawio-diagrams`.

Say this to the person early, in one sentence: you will not copy or imitate any existing brand's mark, because logos are trademarks and a lookalike can get them into legal trouble. If they ask for "like Nike's" or similar, explain it, and take the quality they like (simple, bold, one idea) instead of the shape.

## How it works

1. **Brief.** Ask a few plain questions, all at once, and accept short answers:
   - What is the name, exactly as written, and what does it do or sell?
   - Who is it for?
   - Three words for how it should feel.
   - Where will it appear most (app icon, shop sign, website, stickers)?
   - Any colours, shapes or competitors to avoid? Any logo they admire, and why?
   If they cannot answer, propose answers yourself and let them correct you. Do not interrogate.

2. **Light research.** Look at how the field usually does it (a web search if you have one, otherwise your own knowledge). Write down the clichés (a leaf for eco, a bulb for ideas, a cup for coffee) so you can steer away from them. This is for avoidance and for finding a gap, never for copying. Do not bring any real brand's mark into your drawing.

3. **Rough concepts.** Write 8 to 12 one-line ideas (words only, no drawing yet). Each line names the core image and the reason it fits. Cut to three that are clearly different from each other: for example one symbol, one letterform, one that mixes the two. Drop any idea that is just the product drawn literally.

4. **Build black and white first, as SVG.** One colour on a plain background. Colour comes later and only after approval, because colour starts taste arguments before the shape works. Rules for the drawing:
   - Square-ish viewBox such as `0 0 100 100`; few shapes; no text elements (turn letters into outlines or build them from shapes).
   - Real cut-outs through even-odd fill or a path with holes. Never a white shape laid on top.
   - Straight lines exactly horizontal, vertical or deliberately angled (30, 45, 60 degrees). A line one or two degrees off looks like a mistake.
   - No filters, blur, gradients, or embedded pictures.
   Make a symbol version, and a lockup version with the name when the name matters.

5. **Test loop, at least twice.** For each concept:
   - Run the audit: `node skills/logo-design/svg-audit.mjs concept.svg --bg "#ffffff"`, then again with the dark background the mark will sit on. Fix every ERROR, then re-run. Exit code 1 means problems.
   - Render and look (see "Without local tools" for the options). Check: still readable at 16 to 24 px; works on light and on dark; works as a one-colour stamp (single flat colour, no tints); letters still read as the intended letters; junctions have no slivers or lumps; flipped and rotated it does not form something unintended; it does not look like a known brand.
   - Fix and repeat. Say what you changed.

6. **HARD STOP.** Build one concept sheet: the three concepts side by side in black and white, each with its one-line idea, plus small versions at 24 px and a dark-background strip. Show it to the person, say which you recommend and why in two sentences, and ask which to take (or what to change). Then stop. Do not build the export kit, colour versions or any extra files until they answer with a pick. If they cannot reply, end your turn at this point and describe what the kit would contain. The only exception is the person saying in so many words not to check in.

7. **Refine the chosen concept** with their notes. Re-run step 5 on it. Only now offer colour: at most two colours, checked against light and dark with the audit's `--bg` option.

8. **Export kit** (after approval only). Put in one folder:
   - `logo.svg` (colour), `logo-black.svg`, `logo-white.svg` (reversed, for dark backgrounds), plus symbol-only versions.
   - PNGs at 16, 32, 64, 128, 256, 512 and 1024 px wide on transparent background, from the symbol and from the lockup.
   - A favicon: `favicon.svg` and a 32 px PNG (and a 180 px PNG for phone home screens). Use the symbol, simplified if needed.
   - `USAGE.md`, one page: the files and what each is for, minimum size, clear space (at least the height of the symbol's main shape on each side), the colour values, and what not to do (stretch, recolour, add effects, place on busy photos).
   Run the audit on every SVG in the kit, including the reversed one with `--bg "#000000"`.

## Without local tools

This needs an SVG renderer to see the drawing. If none is available, work down this list to find a way to look:
1. A local browser screenshot: open the SVG, or a small HTML page showing several SVGs at different sizes and on light and dark squares, in a headless browser, and read the image.
2. A command-line converter (such as an SVG-to-PNG tool) to make PNGs you can view.
3. Ask the person to open the SVG in a browser and describe what they see, or send a screenshot. Give them a short list of what to check (tiny size, dark background, any odd shapes).

If you cannot do any of these (for example plain claude.ai chat with no files): build the SVG, run `skills/logo-design/svg-audit.mjs` if you can run code (otherwise tell the person which rules it checks and review the SVG source against them by hand), and give the person the SVG code to save and open. State plainly what was not looked at: how it reads at 16 px, on dark, as a stamp, and whether any junction is ugly. Present the concept sheet as a description plus the SVG files, not as a verified picture. The hard stop in step 6 still applies.

## Checks before done

- The audit script printed PASS (exit 0) for every delivered SVG, on both a light and a dark `--bg`.
- You viewed a render of each concept, or told the person plainly which views you could not do.
- The person's pick is on record in the conversation before any kit file was made.
- The kit contains the colour, black and reversed SVGs, the PNG sizes, the favicon and `USAGE.md`, and each file opens.
- No SVG contains text elements, embedded pictures, filters or white cover shapes.
- You told the person the mark is original but has not been checked against trademark registers; for a business, a trademark search is theirs to do before launch.
