# Guidelines document outline

The skeleton for `docs/brand-guidelines.md`. A pre-filled version you can copy lives at `brand/templates/brand-guidelines-starter.md`.

## Skeleton

````markdown
# Brand Guidelines v{X.Y}

## Quick Reference
| Item | Setting |
|------|---------|
| Primary Color | #XXXXXX ({Colour Name}) |
| Secondary Color | #XXXXXX ({Colour Name}) |
| Accent Color | #XXXXXX ({Colour Name}) |
| Primary Font | {font-family} |
| Voice | {three key traits} |

## 1. Color Palette

### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| {Name} | #{hex} | rgb({r},{g},{b}) | Main brand colour: buttons, headers |
| {Name} | #{hex} | rgb({r},{g},{b}) | Supporting accent |

### Secondary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| {Name} | #{hex} | rgb({r},{g},{b}) | Secondary elements |
| {Name} | #{hex} | rgb({r},{g},{b}) | Highlights |

### Neutral Palette
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Background | #{hex} | rgb({r},{g},{b}) | Page backgrounds |
| Text Primary | #{hex} | rgb({r},{g},{b}) | Body copy |
| Text Secondary | #{hex} | rgb({r},{g},{b}) | Captions, muted text |
| Border | #{hex} | rgb({r},{g},{b}) | Dividers, borders |

### Accessibility
- Text on background: {ratio}:1 (WCAG {level})
- Call-to-action contrast: {ratio}:1
- Every interactive element meets WCAG 2.1 AA

## 2. Typography

### Font Stack
```css
--font-heading: '{Heading font}', {fallbacks};
--font-body: '{Body font}', {fallbacks};
--font-mono: '{Code font}', monospace;
```

### Type Scale
| Element | Font | Weight | Size (desktop / mobile) | Line Height |
|---------|------|--------|-------------------------|-------------|
| H1 | {font} | 700 | 48px / 32px | 1.2 |
| H2 | {font} | 600 | 36px / 28px | 1.25 |
| H3 | {font} | 600 | 28px / 24px | 1.3 |
| H4 | {font} | 600 | 24px / 20px | 1.35 |
| Body | {font} | 400 | 16px / 16px | 1.5 |
| Small | {font} | 400 | 14px / 14px | 1.5 |
| Caption | {font} | 400 | 12px / 12px | 1.4 |

## 3. Logo Usage

### Variants
- **Primary:** horizontal logo with the wordmark
- **Stacked:** vertical layout for square spaces
- **Icon:** the mark alone, for favicons and app icons
- **Monochrome:** one colour, for restricted palettes

### Clear Space
Minimum clear space = height of the logo mark

### Minimum Size
- Digital: 80px wide minimum
- Print: 25mm wide minimum

### Don'ts
- No rotating or skewing
- No colours outside the approved palette
- No effects such as shadows or gradients
- No cropping or changed proportions
- No busy backgrounds

## 4. Voice & Tone

### Brand Personality
| Trait | Description |
|-------|-------------|
| **{Trait 1}** | {meaning} |
| **{Trait 2}** | {meaning} |
| **{Trait 3}** | {meaning} |

### Voice Chart
| Trait | We Are | We Are Not |
|-------|--------|------------|
| {Trait} | {description} | {opposite} |

### Tone by Context
| Context | Tone | Example |
|---------|------|---------|
| Marketing | {tone} | "{example}" |
| Support | {tone} | "{example}" |
| Error Messages | {tone} | "{example}" |
| Success | {tone} | "{example}" |

### Prohibited Terms
| Avoid | Reason |
|-------|--------|
| {term 1} | {reason} |
| {term 2} | {reason} |

## 5. Imagery Guidelines

### Photography Style
- {lighting}
- {what subjects to show}
- {colour treatment}

### Illustrations
- Style: {description}
- Colours: brand palette only
- Stroke: {weight}px

### Icons
- Style: {outlined / filled / duotone}
- Grid: {size}px
- Corner radius: {value}px
````

## Using it

1. Copy the skeleton.
2. Replace every placeholder with the brand's real values.
3. Save it as `docs/brand-guidelines.md`.
4. Point your content workflows at that file.

## What the scripts read

Leave the section headings as written and the scripts can pull out the colour groups (hex values under the Primary, Secondary, Neutral and Semantic headings), the heading, body and mono fonts, the bold personality traits and the banned terms (first column of the Prohibited Terms table). Nothing reads the logo variants or the smallest size. Two scripts need the extra forms described in `brand/references/color-palette-management.md` (bold colour names) and the Quick Reference rows written as `#hex (Name)`.
