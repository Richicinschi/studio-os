# Colour palette management

How to define a brand's colours, read them back, and hold work to them.

## Palette shape

```
Primary (1-2)
  main brand colour: buttons, headers, key elements
  supporting primary: second-level emphasis

Secondary (2-3)
  accents: highlights, interactive states
  supporting colours: icons, illustrations

Neutral (3-5)
  backgrounds: page, card, modal
  text: headings, body, muted
  UI parts: borders, dividers, shadows

Semantic (4)
  success  #22C55E  green
  warning  #F59E0B  amber
  error    #EF4444  red
  info     #3B82F6  blue
```

The group sizes above are rules of thumb. The four semantic values shown (a mid green, amber, red and blue) are a good default if the brand has no stronger idea.

## Writing the palette down

A table in the guidelines file, under a `### Primary Colors`, `### Secondary Colors`, `### Neutral` or `### Semantic` heading. Write the name in bold if `sync-brand-to-tokens.cjs` should pick up shades: a name containing "Dark" or "Light" fills that shade slot, any other bold name sets the base.
```markdown
| Name | Hex | RGB | HSL | Usage |
|------|-----|-----|-----|-------|
| **Harbor Teal** | #0F766E | rgb(15,118,110) | hsl(175,77%,26%) | Buttons, links |
```

CSS custom properties:
```css
:root {
  /* primary */
  --color-primary: #0F766E;
  --color-primary-light: #14B8A6;
  --color-primary-dark: #115E59;

  /* secondary */
  --color-secondary: #B45309;
  --color-accent: #4338CA;

  /* neutral */
  --color-background: #FFFFFF;
  --color-surface: #F5F7F6;
  --color-text-primary: #14211F;
  --color-text-secondary: #52605D;
  --color-border: #D9E0DE;
}
```

Tailwind:
```javascript
colors: {
  primary: {
    DEFAULT: '#0D9488',
    50: '#F0FDFA',
    100: '#CCFBF1',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
  }
}
```

## Contrast

The thresholds come from the W3C's Web Content Accessibility Guidelines 2.1:
- Success criterion 1.4.3, Contrast (Minimum), level AA: 4.5:1 for body text, 3:1 for large text.
- Success criterion 1.4.6, Contrast (Enhanced), level AAA: 7:1 for body text, 4.5:1 for large text.
- Success criterion 1.4.11, Non-text Contrast, level AA: 3:1 for interface components and graphics. It has no AAA level.

WCAG counts text as large at 18 point, or 14 point when bold.

To compute a ratio, get each colour's relative luminance (as defined in WCAG 2.1; its change log records the red threshold being corrected from 0.03928 to 0.04045, which the code below uses), then divide:
```javascript
const channel = (v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (r, g, b) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
```

## Pulling colours out

From an image: decode it, cluster the pixels into dominant colours (k-means works), snap each to its nearest brand colour, and report the share that matched. `extract-colors.cjs` does not do this itself. Given an image it prints the ImageMagick command (or an image-analysis alternative) to get the colours, and you then compare them with `colorDistance` or `calculateCompliance`, which the script exports.

From the guidelines: collect the hex values from the colour tables, along with the names and usage notes. `extract-colors.cjs --palette` covers the hex values only: it lists every hex code found under the four colour headings named above, and ignores names, usage notes and CSS variable blocks.

## Compliance targets

These are rules of thumb in the spirit of the 60-30-10 colour split, not measured standards. Good defaults to start from:
1. Primary colour covers 60-70 percent of the design.
2. Secondary covers 20-30 percent.
3. Accent covers 5-10 percent.
4. Colours outside the palette stay under 20 percent.

A report might look like this:
```json
{
  "compliance": 78,
  "colors": {
    "brand": ["#0F766E", "#B45309", "#FFFFFF"],
    "offBrand": ["#7A1FA2"],
    "dominant": "#0F766E"
  },
  "issues": [
    "Off-brand colour #7A1FA2 found (22% of the area)",
    "Primary colour underused (40% against a 60% target)"
  ]
}
```

## Habits

Do:
- Give main buttons and key elements the primary colour
- Keep hover and active states the same across the product
- Check every text and background pairing for contrast
- Write down why a colour was chosen

Avoid:
- More than two or three colours inside a single component
- Mixing warm and cool tones by accident
- Pure black (#000) for text; use #111 or similar
- Using colour as the only signal; add an icon or a word

## Starter palettes

Three examples to adapt.

Wellness
```
Primary: #0F766E (teal)
Secondary: #B45309 (amber)
Accent: #4338CA (indigo)
Background: #F5F7F6
Text: #14211F
```

Playful retail
```
Primary: #DB2777 (raspberry)
Secondary: #0E7490 (cyan)
Accent: #65A30D (lime)
Background: #FFFFFF
Text: #1C1917
```

Finance / legal
```
Primary: #1E3A5F (deep blue)
Secondary: #57534E (stone)
Accent: #B45309 (bronze)
Background: #FAFAF9
Text: #0C0A09
```

## Tools

- Coolors, for generating palettes
- The WebAIM contrast checker
- Color Hunt, for curated sets
- The default colour scale in the Tailwind CSS documentation
