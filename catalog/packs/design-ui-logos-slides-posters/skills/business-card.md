---
id: business-card
title: Make a business card
requires: [a browser]
---

## When to use

Use this when the person wants business cards, a contact card, or "a QR code with my details" that a phone can scan to save them. A run ends with a print-ready PDF (front and back, each at the card size plus bleed), the contact file `contact.vcf`, its QR code `qr.svg`, and the two card SVGs the PDF was made from. Typical requests: "business cards for my new cleaning company", "a card with a QR code people can scan to save my number", "redo my card for the new address".

Neighbouring jobs:
- A logo: make it with the logo-design skill in this pack first. This skill places a logo the person has; it does not draw one.
- A poster, flyer, sticker, letterhead or social card: use poster-and-social-cards. This skill covers the card only.
- Colours and fonts for a whole brand: use the brand skill, then come back with its colours and fonts.

Contact details never leave the machine. Do not use a QR web service, an online converter or a font fetched from the web while the person's details are in play. Never draw a QR code by hand or with an image generator: the script below makes it.

The scripts sit in this pack's `skills/business-card/` folder (installed, for example, under `.claude/skills/design-ui-logos-slides-posters/skills/business-card/`). Below, `<scripts>` is that folder's full path and `<folder>` is the full path of the folder the card is made in. Keep the quotes in every command: paths with spaces then work.

On Windows, each command for a browser or Ghostscript is given twice, labelled with its shell; the `node` commands are the same in both.
- **Git Bash** (the shell Claude Code's Bash tool runs on Windows): write the program's path in POSIX form (`"/c/Program Files/..."`) and every file path in Windows form with forward slashes (`"E:/My Cards/card.pdf"`, not `/e/My Cards/...`). Put `MSYS_NO_PATHCONV=1` before Ghostscript, or it turns `/prepress` into a folder path. No `&` and no `| Out-Host`.
- **PowerShell**: start a quoted program path with `&`, and end a browser command with `| Out-Host`, or PowerShell returns before the PDF is written.

## How it works

### 1. Write the manifest before any drawing

Fill in every field below. Where the person has not said, pick a default, and say the defaults aloud in one short message so they can reject any of them. If the name or every way to reach them is unknown, ask once, with all questions in one message.

- Name (given and family), title, organisation.
- Phone numbers, email, web address. Postal address: optional.
- Logo file: optional, and only one the person supplies.
- Sides. Default two: the front carries the name, title, organisation and logo; the back carries the QR code and the contact lines. A one-sided card puts the QR on the front, at the same size rule.
- Size. Default 85 × 55 mm. Use 3.5 × 2 in (88.9 × 50.8 mm) when the person is in the US or Canada or asks for it, and any other size they name. Bleed 3 mm on every side; safe zone 4 mm inside the trim.
- Colours, each with its hex value.
- Fonts: at most two typefaces, each one allowed in a PDF (step 3).
- What goes on the back.

Contact details are only ever what the person gave. Never invent a phone number, email, address, title or web address. A missing field is left out, or shown on the card as a visible placeholder such as `[phone]`, and you say so. A placeholder never goes into `contact.json` or the QR.

### 2. Make the contact file and the QR code

Write `<folder>/contact.json` with only the fields the person gave, and save it as UTF-8 (the file-writing tool does; in Windows PowerShell add `-Encoding utf8`):

```json
{ "given": "<given name>", "family": "<family name>", "org": "<organisation>", "title": "<title>",
  "phones": ["<phone>"], "email": "<email>", "url": "<the person's web address>", "address": "<one line>" }
```

`given` is required. `phones` is a list. `url` starts with `http://` or `https://`. No other field is accepted. Then run:

```
node "<scripts>/vcard-qr.mjs" "<folder>/contact.json" --out "<folder>"
```

It writes `contact.vcf` and `qr.svg` into `<folder>` and prints four lines: the QR version, the module count, the error correction, and `smallest printed width: <w> mm`. Exit 1 means a field is invalid (the message names it: ask the person, never guess a fix), `contact.json is not UTF-8` (save it again as UTF-8), or `too large for a card`. Exit 2 is a usage or file error.

The QR on the card must be at least that smallest printed width and at least 15 mm. On an 85 × 55 mm back with contact lines beside it, plan about 30 mm for it; the safe height (47 mm, or 42.8 mm on a US card) is the hard limit. If it does not fit, or the script said `too large for a card`, drop the address from `contact.json` and run it again; then the second phone. Tell the person each field you dropped from the QR (it can stay printed on the card). If it still does not fit, offer a QR of the web address instead, which opens the site and does not save a contact. Then `qr.svg` holds the address, not the contact: delete the `contact.vcf` that `vcard-qr.mjs` wrote, because it no longer matches the QR, and hand over no `contact.vcf`. Make this QR from the `<scripts>` folder:

```
cd "<scripts>"
node --input-type=module -e "import { encodeQR, qrSvg } from './qr.mjs'; import { writeFileSync } from 'node:fs'; const q = encodeQR(new TextEncoder().encode(process.argv[1])); writeFileSync(process.argv[2], qrSvg(q)); console.log('smallest printed width: ' + Math.ceil((q.size + 8) * 4) / 10 + ' mm');" "<web address>" "<folder>/qr.svg"
```

### 3. Design each side as an SVG the checker can measure

Layout: one focal point (the name, or the organisation when it is the brand) and one quiet zone. The front holds few things; the back holds the QR and the contact lines, aligned to one edge. Use the colours of the manifest; keep the QR black on white.

Type rules:
- Smallest text 7 pt (font size 2.47 mm). The name at least 10 pt (3.53 mm). No line thinner than 0.25 pt (0.088 mm).
- At most two typefaces. Use a font only if it is on the person's system or they supplied it, and its licence lets it be embedded in a PDF. On Windows the Fonts folder's details show "Font embeddability": Editable, Installable or Print and preview are fine; Restricted is not. macOS and Linux show no such field, so there use a font whose licence you can name: one under an open font licence (the SIL Open Font License allows embedding; Linux's usual DejaVu, Liberation and Noto fonts are under open licences), or one the person supplied with a licence that allows embedding. When unsure, on any system, use an open-licence font. Name each font and say why it is allowed. Give every `font-family` a generic fallback (`sans-serif` or `serif`).
- Contrast at least 4.5:1 for every text colour on its background; card text is small, so the higher bar applies to all of it. Check each pair, writing the hex values without `#` (in Git Bash, zsh and PowerShell a `#` starts a comment, and the script then gets no colours): `node "<scripts>/../accessibility-review/contrast.mjs" 0f5c63 f7f4ee` checks text `#0f5c63` on `#f7f4ee`. Exit 0 means it passes.

Write `front.svg` and `back.svg` in `<folder>` to this convention, exactly. `card-check.mjs` refuses anything outside it, because Chrome would print it wrong or blank.

- **Well-formed XML.** Write every `&` as `&amp;` (so "Ruiz & Sons" is `Ruiz &amp; Sons`) and a `<` in text as `&lt;`. The only named entities are `&amp;` `&lt;` `&gt;` `&quot;` `&apos;`; numeric ones (`&#233;`) are fine. No attribute twice on one element, no raw `<` inside an attribute value, and declare any prefix you use (`xmlns:xlink="http://www.w3.org/1999/xlink"` before `xlink:href`). Comments are fine, but never put `--` inside one, nor a `-` just before its closing `-->`. No control characters. Nothing outside the root but comments and blank space, and no element inside it with an `xmlns` other than the SVG one. An optional `<?xml ...?>` first line is the only processing instruction allowed; a DOCTYPE may not hold its own definitions.
- **Root.** `<svg xmlns="http://www.w3.org/2000/svg" width="91mm" height="61mm" viewBox="0 0 91 61">` for an 85 × 55 card: the trim plus 3 mm bleed on every side. A US card is `width="94.9mm" height="56.8mm" viewBox="0 0 94.9 56.8"`; any other size is its trim plus 6 each way. One unit is one millimetre, and every position and size is a plain number in those units. The trim line runs 3 mm in from each edge and the safe area 7 mm in (bleed plus safe zone): on 91 × 61 the safe area is x 7 to 84 and y 7 to 54.
- **Elements allowed:** `g`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `path`, `text`, `tspan`, `image` (with `width` and `height`, embedded as a data URI), `title`, `desc`, the QR's `<svg id="qr">`, and `<defs>` holding only `linearGradient` or `radialGradient` with their `stop`s. Nothing else: no `use`, `symbol`, `clipPath`, `mask`, `pattern`, `filter` or `foreignObject`, and no other nested `<svg>`.
- **No CSS of any kind.** No `<style>` element, no `style="..."` attribute, no stylesheet instruction. Set everything as attributes: `fill="#0f5c63"`, `font-family="Arial, sans-serif"`, `font-weight="bold"`.
- **No `transform`, anywhere.** Place every shape and line of text by its own coordinates. Also refused: `clip-path`, `mask`, `filter`, `visibility`, `display`, `xml:space`, `letter-spacing`, `word-spacing`, `dominant-baseline`, `alignment-baseline`, `baseline-shift`, `direction`, `writing-mode`, `font-stretch`, `textLength`, `lengthAdjust`.
- **Text.** One line per `<text x="..." y="..." font-size="...">`; `y` is the baseline. `font-size` is a plain number, on the text or on a parent `<g>`. `text-anchor` may be `start`, `middle` or `end`, and nothing else. No `dx`, `dy` or `rotate` on text. A `<tspan>` may only change the look of part of a line (its weight or fill), with no `x`, `y`, `dx`, `dy`, `rotate` or `font-size`.
- **Text width is estimated, on the generous side.** Per character, as a share of the font size: 0.65 for most letters, digits and spaces; 0.85 for capitals and for `m`, `w`, `@`, `%`; 1.0 for Chinese, Japanese, Korean and full-width characters; up to 1.4 for emoji and pictographs. Bold counts 1.1 times wider, and one bold `<tspan>` makes the whole line count as bold. The box runs from one font size above the baseline to a quarter of it below, and must lie inside the safe area. So keep long lines short: at 2.8 mm text the 77 mm safe width holds about 40 plain characters, fewer with capitals or bold, and less beside a QR. Split an address over two lines rather than shrinking it, and leave a few millimetres spare.
- **Lines.** Every `stroke-width` at least 0.088. A filled `rect` at least 0.088 on both sides.
- **Backgrounds.** Any filled shape (`rect`, `path`, `polygon`, `circle`, `ellipse`, or a `polyline` whose fill is not `none`) that comes within 0.5 of a trim edge must run on to the bleed edge on that side, so no white sliver shows after cutting. Each is measured by its box: a circle from `cx - r` to `cx + r`, a polygon from its smallest to its largest point. A full background is `<rect x="0" y="0" width="91" height="61" fill="..."/>`. A path is measured from every coordinate in its `d`, curve control points included.
- **The QR, inline.** Open `qr.svg`, copy all of it into the side, and add `id="qr"` and its place to its `<svg>` tag: `<svg id="qr" x="50" y="15" width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65" shape-rendering="crispEdges">`. Keep its `viewBox`, its white `rect` and its black `path` as written; do not recolour them. `width` equals `height`, at least 15 and at least the smallest printed width, inside the safe area. No text anywhere, and nothing drawn after it, may overlap its box. No `opacity`, `fill-opacity` or `stroke-opacity` other than 1 on it or on a group round it. An `<image id="qr">` is refused.
- **A logo** goes in an `<image>` whose `href` (or `xlink:href`) is a data URI, because a card printed through `card.html` does not load outside files: an `href="logo.png"` prints as nothing, so `card-check.mjs` refuses any `<image>` whose link does not start `data:`. Write the placeholder `href="data:logo"` in the side, then run, once: `node "<scripts>/embed-logo.mjs" "<folder>/front.svg" "<logo file>"`. It puts the logo file into that side in place of the placeholder, as `image/png`, `image/jpeg` or `image/svg+xml` by the file's extension (`.png`, `.jpg` or `.jpeg`, `.svg`), and writes no other file. Exit 1 means the side holds no `href="data:logo"`. A placeholder left unfilled fails step 4 with `logo placeholder not filled (run embed-logo.mjs)`. Never write or copy the base64 text yourself. Keep the logo inside the safe area and clear of the QR.

### 4. Check both sides

```
node "<scripts>/card-check.mjs" "<folder>/front.svg" "<folder>/back.svg"
```

Add `--size us` for a US card, or `--size <W>x<H>` (in mm) for another trim. It prints `<file>: ok` per side, or one `error:` line per problem naming the element. Exit 0 means every check passed; 1 means a check failed; 2 means a usage or file error, or a side that is not well-formed XML. Fix every error with a specific change, say what it was (for example "contact lines 2.8 to 2.6 mm, address split over two lines"), and run it once more. Do not make a third attempt: if it still fails, tell the person which check fails and why, and make no PDF from a side that fails.

### 5. Print the PDF with the browser

Copy `<scripts>/card.html` into `<folder>`, beside `front.svg` and `back.svg`. It prints each side on its own page at 91 × 61 mm. For a US card change its four sizes to `94.9mm` and `56.8mm` (any other card: its trim plus 6 each way); for a one-sided card delete the back's `img` line. Then print it:

- Windows, Git Bash, with `<folder>` in Windows form (`E:/My Cards`): `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="<folder>/card.pdf" "<folder>/card.html"`.
- Windows, PowerShell: `& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="<folder>\card.pdf" "<folder>\card.html" | Out-Host`. Keep `| Out-Host`.
- Windows, when Chrome is not at that path: look for it under `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` (Git Bash: `"/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"`), then in the person's own `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe` (Git Bash: `"$LOCALAPPDATA/Google/Chrome/Application/chrome.exe"`; PowerShell: `& "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"`). When Chrome is not found, use Edge, which Windows ships with: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (Git Bash: `"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"`), with the same options.
- macOS: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="<folder>/card.pdf" "<folder>/card.html"`. Without Chrome, use `"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"` or `"/Applications/Chromium.app/Contents/MacOS/Chromium"` with the same options.
- Linux: `google-chrome --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="<folder>/card.pdf" "<folder>/card.html"`, or `chromium` or `chromium-browser` in place of `google-chrome`.
- Only when running as root inside a container, add `--no-sandbox`: Chrome will not start as root without it. Never add it otherwise.

The browser prints a line naming the bytes written to `card.pdf`; Edge may print error lines before it, which do not matter when that line follows.

### 6. Check the PDF

```
node "<scripts>/card-check.mjs" "<folder>/front.svg" "<folder>/back.svg" --pdf "<folder>/card.pdf"
```

Add the same `--size` as in step 4. Each page must print as the trim plus bleed (`page 1 91 x 61 mm`, `page 2 91 x 61 mm` for the default card), and the PDF must hold exactly one page per side given. More pages than sides means `card.html` was changed (each `img` needs `display: block`). Then look at both pages at full size: render them with Ghostscript when it is installed (`gs -q -o "<folder>/page%d.png" -sDEVICE=png16m -r300 "<folder>/card.pdf"`; on Windows call it as step 7 shows) or open the PDF in a viewer. One thing draws the eye first, every word is spelled as supplied, nothing important crowds the edge.

### 7. Convert to CMYK when Ghostscript is installed

Print shops print in CMYK. With Ghostscript, make a CMYK copy and keep the RGB file beside it:

```
gs -o "<folder>/card-cmyk.pdf" -sDEVICE=pdfwrite -sColorConversionStrategy=CMYK -sProcessColorModel=DeviceCMYK -dPDFSETTINGS=/prepress "<folder>/card.pdf"
```

On Windows the program is `gswin64c`. Its installer does not add it to the PATH, so call it by its full path; `<version>` is the folder name under `C:\Program Files\gs` (for example `gs10.08.0`):
- Git Bash, with `<folder>` in Windows form (`E:/My Cards`): `MSYS_NO_PATHCONV=1 "/c/Program Files/gs/<version>/bin/gswin64c.exe" -o "<folder>/card-cmyk.pdf" -sDEVICE=pdfwrite -sColorConversionStrategy=CMYK -sProcessColorModel=DeviceCMYK -dPDFSETTINGS=/prepress "<folder>/card.pdf"`.
- PowerShell: `& "C:\Program Files\gs\<version>\bin\gswin64c.exe" -o "<folder>\card-cmyk.pdf" -sDEVICE=pdfwrite -sColorConversionStrategy=CMYK -sProcessColorModel=DeviceCMYK -dPDFSETTINGS=/prepress "<folder>\card.pdf"`.

The other Ghostscript commands in steps 6 and 7 are called the same way: the same program path, and in Git Bash the same `MSYS_NO_PATHCONV=1`.

Check the copy: run step 6 again with `--pdf "<folder>/card-cmyk.pdf"` (same two page sizes), and `gs -q -o - -sDEVICE=inkcov "<folder>/card-cmyk.pdf"`, which must print four ink values (cyan, magenta, yellow, black) for each page. The conversion prints pure black, the QR included, as a mix of all four inks. If the printer asks for small black in black ink only, send them `card.pdf` and ask them to convert it.

Without Ghostscript, hand over the RGB `card.pdf` and tell the person to ask the printer whether RGB is accepted; most online printers convert it themselves.

### 8. Hand over

Give the person:
- `card.pdf` (and `card-cmyk.pdf` when made), `contact.vcf`, `qr.svg`, `front.svg` and `back.svg`, with the folder's full path. With a web-address QR (step 2) there is no `contact.vcf`: say that the QR opens the web address and does not save the contact.
- The trim size, the bleed (3 mm on every side), and the colour mode of each PDF (RGB, CMYK).
- The fonts used and why each may be embedded, and the colours with hex.
- Any field left out of the QR or shown as a placeholder.
- "Ask the printer to cut to trim": the PDF pages are larger than the card on purpose.
- Scan the QR with a phone, from the screen or a test print, before ordering, and check that the saved contact is right (for a web-address QR: that it opens the right site).

## Without local tools

First check what the environment has: `node --version`, and a headless Chrome or Chromium. The scripts travel with this pack, so where Node runs, run `vcard-qr.mjs` and `card-check.mjs` exactly as above: the QR is made the same way here as on a computer.
- Node and a browser: make the PDF as in step 5 (in a container running as root, with `--no-sandbox`).
- Node but no browser: hand over the two SVGs and `card.html` together, and tell the person to open `card.html` in a browser and save it as PDF at 91 × 61 mm (their card's trim plus 6 each way), margins none, with background graphics on, and to check that the PDF has one page per side.
- No Node at all: write the two SVGs (the back with an empty space of the planned size where the QR goes, nothing drawn in it) and the `.vcf` text, say plainly that the QR could not be made here, and offer `vcard-qr.mjs`, `qr.mjs`, `card-check.mjs` and `card.html` (with `embed-logo.mjs` when there is a logo) and the commands of steps 2 to 6, to run on a computer with Node 22 or newer and a browser. Never make the QR any other way.

Say plainly what was not checked: the measured sizes, the PDF's page size, the colour conversion, or the scan.

## Checks before done

- The manifest was written and its defaults stated to the person before any drawing.
- Every contact detail on the card and in `contact.vcf` is one the person gave; any gap is a visible placeholder or left out, and was said.
- `vcard-qr.mjs` made `contact.vcf` and `qr.svg`, and the QR on the card is at least its smallest printed width and at least 15 mm. Any field dropped from the QR was named. For a web-address QR, the step 2 command made `qr.svg` from the address, no `contact.vcf` is handed over, and the person was told the QR opens the site and does not save the contact.
- Any logo went in by `embed-logo.mjs`, and no `href="data:logo"` is left in either side.
- `card-check.mjs` exits 0 on both sides, and with `--pdf` on every PDF handed over: one page per side, each the trim plus bleed.
- Every text colour pair passed `contrast.mjs`; the fonts are named with why they may be embedded.
- You looked at both pages of the PDF at full size.
- The hand-over names the files, trim, bleed, colour mode, "cut to trim", and asks the person to scan the QR with a phone before ordering.
