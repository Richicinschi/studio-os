# {BRAND NAME}: Brand Guidelines v1.0

> Draft, edited {DATE}

## Quick Reference

| Item | Setting |
|------|---------|
| Primary Color | #0F766E (Harbor Teal) |
| Secondary Color | #B45309 (Amber Glow) |
| Accent Color | #4338CA (Signal Indigo) |
| Primary Font | Manrope |
| Voice | Warm, Plain-spoken, Dependable |

---

## 1. Colour system

### Primary Colors

| Swatch | Hex | RGB | Role |
|--------|-----|-----|------|
| **Harbor Teal** | #0F766E | rgb(15,118,110) | Buttons, headings, links |
| **Harbor Teal Dark** | #115E59 | rgb(17,94,89) | Pressed and hover states |

### Secondary Colors

| Swatch | Hex | RGB | Role |
|--------|-----|-----|------|
| **Amber Glow** | #B45309 | rgb(180,83,9) | Highlights and badges |
| Signal Indigo | #4338CA | rgb(67,56,202) | Accent: links in long text, selected items |

### Neutral Palette

| Swatch | Hex | RGB | Role |
|--------|-----|-----|------|
| Paper | #FFFFFF | rgb(255,255,255) | Page background |
| Mist | #F5F7F6 | rgb(245,247,246) | Panels and cards |
| Ink | #14211F | rgb(20,33,31) | Headings and body copy |
| Slate | #52605D | rgb(82,96,93) | Captions, helper text |
| Line | #D9E0DE | rgb(217,224,222) | Dividers and outlines |

### Semantic Colors

| Meaning | Hex | Shown when |
|---------|-----|------------|
| Success | #15803D | Saved, sent, completed |
| Warning | #CA8A04 | Needs attention, pending |
| Error | #B91C1C | Failed, destructive |
| Info | #0369A1 | Neutral notices |

### Accessibility

- Ink on Paper measures 16.6:1 (AAA), computed with the WCAG 2.1 relative-luminance formula
- Harbor Teal on Paper measures 5.5:1 (AA), computed the same way
- Every interactive element is built to WCAG 2.1 AA

---

## 2. Type

### Font Stack

```css
--font-heading: 'Manrope', system-ui, -apple-system, sans-serif;
--font-body: 'Manrope', system-ui, -apple-system, sans-serif;
--font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
```

### Type Scale

| Style | Weight | Leading | Large screens | Small screens |
|-------|--------|---------|---------------|---------------|
| H1 | 700 | 1.2 | 48px | 32px |
| H2 | 600 | 1.25 | 36px | 28px |
| H3 | 600 | 1.3 | 28px | 24px |
| H4 | 600 | 1.35 | 24px | 20px |
| Body | 400 | 1.5 | 16px | 16px |
| Body Large | 400 | 1.6 | 18px | 18px |
| Small | 400 | 1.5 | 14px | 14px |
| Caption | 400 | 1.4 | 12px | 12px |

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 3. Logo

### Variants

| File | Version | Best for |
|------|---------|----------|
| logo-full-horizontal.svg | Full Horizontal | Page headers, documents |
| logo-stacked.svg | Stacked | Square areas, avatars |
| logo-icon.svg | Icon Only | Favicons, app icons |
| logo-mono.svg | Monochrome | One-colour printing |

### Clear Space

Minimum clear space = height of the logo mark.

### Minimum Size

- Full logo on screen: 120px wide at the least
- Icon on screen: 24px
- Full logo in print: 35mm
- Icon in print: 10mm

(These match `brand/references/logo-usage-rules.md`.)

### Don'ts

- Do not tilt, rotate or skew it
- Do not recolour it beyond the approved set
- Do not add shadows, glows or outlines
- Do not crop it or change its proportions
- Do not set it over a busy picture without a solid backing

---

## 4. How we sound

### Brand Personality

| Quality | What it means |
|---------|---------------|
| **Warm** | Friendly and personal, never gushing |
| **Plain-spoken** | Short words, short sentences, no buzzwords |
| **Dependable** | Does what it says; admits when it cannot |
| **Curious** | Asks what the reader needs before answering |

### Voice Chart

| Quality | We lean toward | We steer clear of |
|---------|----------------|-------------------|
| Warm | Kind, personable | Syrupy, over-familiar |
| Plain-spoken | Concrete, brief | Abstract, padded |
| Dependable | Honest, specific | Vague, overpromising |
| Curious | Attentive, open | Nosy, pushy |

### Tone by Context

| Where | Register | Sample line |
|-------|----------|-------------|
| Marketing | Upbeat, concrete | "Book your first session in two minutes." |
| Documentation | Neutral, step by step | "Open Settings, then choose Billing." |
| Error messages | Calm, offers a way out | "That card did not go through. Try another one." |
| Success | Brief and glad | "You're booked!" |

### Prohibited Terms

| Avoid | Reason |
|-------|--------|
| Game-changing | Says nothing specific |
| World-class | Unprovable boast |
| Cutting-edge | Stale buzzword |
| Utilize | Plain word is "use" |
| Empower | Vague and overused |

---

## 5. Imagery Guidelines

### Photography Style

- **Light:** daylight, soft shadows
- **People:** real customers and staff, unposed
- **Colour:** gentle grading that keeps the palette true
- **Framing:** one clear subject, plenty of breathing room

### Illustrations

- Look: simple flat shapes with a little texture
- Colours: palette only
- Strokes: even 2px line
- Corners: softened to 4px

### Icons

- Look: outline icons on a 24px grid
- Stroke: 1.5px everywhere
- Corner radius: 2px
- Fill: none

---

## 6. Interface parts

### Buttons

- Primary: teal #0F766E fill, white text, 8px corners
- Secondary: no fill, teal text, 8px corners
- Tertiary: no fill, slate #52605D text, 8px corners

### Spacing Scale

| Step | Size | Typical use |
|------|------|-------------|
| xs | 4px | Icon to label |
| sm | 8px | Inside compact controls |
| md | 16px | Default gap |
| lg | 24px | Between groups |
| xl | 32px | Between blocks |
| 2xl | 48px | Between sections |

### Corner rounding

Buttons and inputs use 8px, cards 12px, modals 16px, and pills or tags are fully round (9999px).

---

## AI Image Generation

### Base Prompt Template

Start every image prompt with this:

```
{DESCRIBE YOUR VISUAL STYLE HERE - mood, colors with hex codes, lighting, atmosphere}
```

### Style Keywords

| Aspect | Words to use |
|--------|--------------|
| **Lighting** | {e.g., golden hour, diffuse, studio} |
| **Mood** | {e.g., trustworthy, lively, serene} |
| **Composition** | {e.g., symmetrical, negative space, close-up} |
| **Treatment** | {e.g., matte, saturated, grainy} |
| **Aesthetic** | {e.g., editorial, retro, clean} |

### Visual Mood Descriptors

- {First mood word or phrase}
- {Second mood word or phrase}
- {Third mood word or phrase}

### Visual Don'ts

| Avoid | Reason |
|-------|--------|
| {Thing to avoid} | {Why} |

### Example Prompts

**Hero Banner:**
```
{A prompt for a wide hero image}
```

**Social Media Post:**
```
{A prompt for a square social image}
```

---

## Changelog

- 1.0, {DATE}: first version
