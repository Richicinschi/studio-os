# Typography specifications

How to specify and implement a brand's type.

## Font stack

```css
/* Headings: the display face */
--font-heading: 'Manrope', system-ui, -apple-system, sans-serif;

/* Body: easy to read at length */
--font-body: 'Manrope', system-ui, -apple-system, sans-serif;

/* Code and technical text */
--font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
```

Loading from Google Fonts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Scale

All sizes, weights, line heights and spacing on this page are this skill's defaults and rules of thumb, not standards; adjust them to the brand. The base is 16px (1rem), and each step multiplies by 1.25 (the ratio type-scale tools call Major Third, 1.250).

| Element | rem | px | Weight | Line height |
|---------|-----|----|--------|-------------|
| Display | 3.815 | 61 | 700 | 1.1 |
| H1 | 3.052 | 49 | 700 | 1.2 |
| H2 | 2.441 | 39 | 600 | 1.25 |
| H3 | 1.953 | 31 | 600 | 1.3 |
| H4 | 1.563 | 25 | 600 | 1.35 |
| H5 | 1.25 | 20 | 600 | 1.4 |
| Body large | 1.125 | 18 | 400 | 1.6 |
| Body | 1 | 16 | 400 | 1.5 |
| Small | 0.875 | 14 | 400 | 1.5 |
| Caption | 0.75 | 12 | 400 | 1.4 |

Screen-size overrides:
```css
/* phones, under 768px */
h1 { font-size: 2rem; }    /* 32px */
h2 { font-size: 1.5rem; }  /* 24px */
h3 { font-size: 1.25rem; } /* 20px */
body { font-size: 1rem; }  /* 16px */

/* 768px and wider */
h1 { font-size: 3rem; }    /* 48px */
h2 { font-size: 2.25rem; } /* 36px */
h3 { font-size: 1.75rem; } /* 28px */
body { font-size: 1rem; }  /* 16px */
```

## Weights

| Name | Number | Used for |
|------|--------|----------|
| Regular | 400 | Running text |
| Medium | 500 | Buttons, navigation |
| Semibold | 600 | Subheadings, emphasis |
| Bold | 700 | Headings, calls to action |

In practice: headings 600-700, body 400, links 500, buttons 600.

## Spacing

Line height by kind of text:

| Text | Line height | Why |
|------|-------------|-----|
| Headings | 1.1-1.3 | Tight reads as punchy |
| Body | 1.5-1.6 | Easiest to read |
| Small | 1.4-1.5 | A little tighter |
| Long articles | 1.6-1.75 | Extra room |

Letter spacing:

| Text | Tracking | Value |
|------|----------|-------|
| Display | Tighter | -0.02em |
| Headings | Default | 0 |
| Body | Default | 0 |
| All caps | Looser | 0.05em |
| Small caps | Looser | 0.1em |

Margins:
```css
h1, h2 { margin-top: 2rem; margin-bottom: 1rem; }
h3, h4 { margin-top: 1.5rem; margin-bottom: 0.75rem; }

p { margin-bottom: 1rem; }
p + p { margin-top: 0; }
```

Line length: a good default is around 65-75 characters for body text, and headings can run longer. WCAG 2.1 success criterion 1.4.8, Visual Presentation (level AAA), asks for no more than 80 characters per line. For code, a common default is 80-100 characters.
```css
.prose {
  max-width: 65ch;
}
```

## CSS variables

```css
:root {
  /* families */
  --font-heading: 'Manrope', system-ui, sans-serif;
  --font-body: 'Manrope', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  /* sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  /* weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* line heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

## Tailwind

An example configuration for the brand's own scale, not a copy of Tailwind's built-in values.

```javascript
theme: {
  fontFamily: {
    heading: ['Manrope', 'system-ui', 'sans-serif'],
    body: ['Manrope', 'system-ui', 'sans-serif'],
    mono: ['IBM Plex Mono', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1.1' }],
  }
}
```

## Pairings

| Feel | Heading | Body |
|------|---------|------|
| Clean, modern | Manrope | Manrope |
| Classic, trusted | Libre Baskerville | Source Sans 3 |
| Friendly tech | DM Sans | Nunito Sans |
| Editorial | Fraunces | Work Sans |

## Readability

Sizes:
- A good default is body text of 16px or more.
- Small text can go down to 14px, kept off long passages.
- Captions can go down to 12px, used sparingly.

Contrast: 4.5:1 for normal text and 3:1 for large text (WCAG 2.1 success criterion 1.4.3, Contrast (Minimum)). WCAG counts text as large at 18 point, or 14 point bold.

Also:
- Keep all caps for short labels.
- Align left; do not justify.
- Leave enough space between lines.
- Avoid weights under 400 at small sizes.
