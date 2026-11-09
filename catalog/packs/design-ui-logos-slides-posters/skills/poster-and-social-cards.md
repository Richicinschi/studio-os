---
id: poster-and-social-cards
title: Make a poster or social card
---

## When to use

Use this when the person wants a poster, flyer, cover image, event announcement or social media card, especially one that must be cheap to print (one or two inks) or must stay readable as a small thumbnail in a feed. Typical requests: "a poster for our bake sale", "an Instagram post for the launch", "a cover image for my newsletter", "a flyer I can photocopy".

Neighbouring jobs:
- A logo or brand mark: use the logo skill in this pack; come back here only when the logo sits on a poster.
- A multi-page document, slide deck or report: use the document or slides skills; this skill covers one sheet or one card.
- A chart or diagram as the main content: use the data-visualisation or diagram skills, then place the result here.
- Picking brand colours or fonts for a whole product: use the design-system skills. Here you only choose what one sheet needs.

## How it works

### 1. Resolve a manifest before any drawing or prompting

Fill in every field below. Where the person has not said, pick a default, and say the defaults aloud in one short message so they can reject any of them. Do not start drawing until you have written the manifest. Keep it short in the conversation; show the full list only if asked.

- Purpose: what should a stranger do or feel after two seconds (come to an event, buy, remember a name)?
- Size and orientation. Default: portrait, 3:4 for print on A-series paper or a similar proportion; 4:5 tall for a social feed.
- Inks and colours. Default for print: two inks, one dominant (about three quarters of the colour) and one accent (about a quarter), on plain off-white paper. Offer one ink as the cheapest option. Name each ink with an exact hex value so it can be reproduced.
- Headline: the exact words, two to eight words. If the person gave none, write one and flag it as a suggestion.
- Supporting text: one or two short lines at most.
- Date, place, call to action: only those the person supplied. Never invent dates, prices, addresses or web addresses; leave a visible placeholder and say so.
- Image: a photo they supplied, an illustration to be made, or none. "None" is a valid and often best answer.
- Language: the language of the text they gave; English otherwise.

If two or more fields are unknown and cannot be defaulted safely (for example, the event date), ask once, in one message, with all questions together.

### 2. Choose the layout with a first-match list

Walk the list from the top and take the first rule that fits, unless the person named a layout.

1. The sheet announces an event, a schedule or facts (date, time, place): information poster. A large headline across a single dominant image or shape, with one thin band holding the facts. The date stays smaller than the headline.
2. The subject is a plant, animal, specimen or collection: plate. A title, one rectangular picture, and a tidy caption block in columns.
3. One everyday object should repeat as a pattern: repeated-object field. Vary scale and crop; keep one open zone for the headline and facts.
4. The idea depends on two layers crossing (two colours overlapping): overlap collage. Overlap only in chosen spots.
5. The person supplied one photograph: image-led. The picture bleeds off at least one edge, the headline locks to it, and the footer is compact.
6. The words themselves are the visual: type-led. The headline fills the sheet; a small image or shape interrupts it.
7. Otherwise: cover layout. Headline near one edge, one dominant picture zone, almost no other text.

Whatever the layout, choose one focal point and one deliberately quiet zone. Do not fill the quiet zone with decoration or small print.

### 3. Set the type scale

Use at most two type sizes of significance plus a small tier. The headline must be at least five times the height of body text. Anything in between weakens the contrast. Pick one typeface family, or two that clearly differ. Body text on a printed sheet should stay readable from arm's length; on a social card, do not go below roughly 3% of the card's short side for any word that matters.

### 4. Build or prompt in fixed short paragraphs

If you are drawing with code (SVG, HTML to image) build in this order: canvas and inks, composition, subject, type, things to avoid. If you are writing a prompt for an image generator, write exactly five short paragraphs in that order:

1. Canvas and ink: ratio, paper colour with hex, each ink with hex and its role, flat front-on page.
2. Composition: the chosen layout, the focal point, the quiet zone, and how much of the sheet stays empty.
3. Subject: one recognisable subject, described plainly.
4. Type: the exact text in quotation marks, its position, and the headline-to-body size relation.
5. Avoid: a third colour, gradients that fake extra inks, invented logos or brand names, filler text, long passages of small text.

Generators often garble words. Keep generated text to the headline and perhaps one line; plan to overlay everything else yourself.

### 5. Generate, then inspect twice

Make the first version. Then look at it at full size and again at thumbnail size (about 150 pixels wide, as in a feed or a pinned list).

Full-size checks:
- Ink count: a one-ink design shows no second colour; a two-ink design shows no third. The accent covers no more than about 30% of the coloured area unless the subject demands it.
- Empty paper: roughly 25% to 50% of the sheet should be blank. Under a quarter feels crowded; over half feels unfinished.
- Margins: nothing important within about 5% of the trim edge. For print, keep text at least 5 mm inside the edge; artwork meant to reach the edge extends 3 mm past the trim line (bleed) and the person must know to ask the printer for that.
- Text: every word is spelled as supplied, with no invented words and no distorted letters.
- Focal point: a single thing draws the eye first.

Thumbnail checks:
- Can the headline still be read? If not, it is too small or too low in contrast.
- Is the subject still recognisable?
- Does one shape dominate, rather than many equal ones?

### 6. Retry once, then fall back

If any check fails, change something specific and state the change ("headline larger, accent reduced, picture cropped tighter"), then regenerate once. Do not make a third attempt. If text is still wrong or the thumbnail still fails, deliver a text-light version: the artwork with no words or only the headline you can set reliably, plus plain instructions for adding the remaining text in any layout tool or word processor. Say so plainly. Never pass off distorted text as correct.

### 7. Social card variants and safe areas

Offer the size the destination needs; if unsure, produce a square and say how it would change.
- Square, 1:1 (for example 1080 by 1080 pixels): works nearly everywhere; keep the headline in the central 80%.
- Tall, 4:5 or 3:4 (for example 1080 by 1350 or 1080 by 1440): feed posts and carousels; platforms may crop the top and bottom, so keep key words in the middle 80% of the height.
- Wide cover, roughly 2:1 or 21:9 (for example 2100 by 900): article and channel covers; apps often crop the sides when the image is shown small or as a circle crop, so keep the headline in the central half of the width.
- Also leave room at the bottom for the platform's own interface overlays (captions, buttons) and avoid placing a call to action in the outer strip.
Check each variant at thumbnail size separately; a design that works tall may fail wide.

### 8. Hand over

Give the person the file, the manifest in two lines (size, inks with hex, fonts used), and what is left for them: dates to confirm, the print bleed, and any text to add. Mention the paper size and a printer note if inks are limited ("two spot inks, or print in greyscale plus one colour").

Do not reuse fonts, artwork or templates from any outside collection unless the person supplies them or their terms are known. Use fonts already available on the person's system or in the tool you are using, and say which.

## Checks before done

- The manifest was written and the defaults were stated to the person before any drawing.
- The layout rule that matched is named, and the layout actually matches it.
- You looked at the result at full size and at thumbnail size, and you can say whether the headline survived as a thumbnail.
- Ink count matches the manifest (no stray extra colour), with hex values recorded.
- Empty paper is within about 25% to 50%, and nothing important sits near the edge.
- The headline is at least five times the body text height.
- Every word of text is exactly what the person supplied or approved; no invented dates, prices or addresses.
- If a retry was needed, you made only one, stated what changed, and, if it still failed, delivered the text-light fallback and said so.
- For social cards, each requested variant was checked against its safe area.
