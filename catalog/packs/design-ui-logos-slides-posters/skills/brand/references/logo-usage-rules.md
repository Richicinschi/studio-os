# Logo usage rules

How the logo is placed on anything the brand publishes.

## Variants

### Shapes
| Variant | File name | Where it fits |
|---------|-----------|---------------|
| Full horizontal | logo-full-horizontal.{ext} | Site headers, documents |
| Stacked | logo-stacked.{ext} | Square areas, social avatars |
| Icon only | logo-icon.{ext} | Favicons, app icons, tight spots |
| Wordmark only | logo-wordmark.{ext} | Where the icon already appears nearby |

### Colourways
| Colourway | Where it fits |
|-----------|---------------|
| Full colour | The default, on white or light grounds |
| Reversed | On dark grounds |
| Mono dark | On light grounds when colour is not possible |
| Mono light | On dark grounds when colour is not possible |

## Clear space

Keep an empty margin on all four sides equal to the height of the logo mark (the icon part).

```
    ┌─────────────────────────────┐
    │           [x]               │
    │   ┌───────────────────┐     │
    │   │                   │     │
[x] │   │    [LOGO]         │ [x] │
    │   │                   │     │
    │   └───────────────────┘     │
    │           [x]               │
    └─────────────────────────────┘
```

[x] = height of the logo mark.

## Smallest size

These are this skill's own starting defaults, not a standard. Test the real logo and raise them if any detail blurs.

### On screen
| Format | Min width | Note |
|--------|-----------|------|
| Full logo | 120px | Every element stays legible |
| Icon only | 24px | Favicons and tiny icons |
| Icon only | 32px | Interface elements |

### In print
| Format | Min width | Note |
|--------|-----------|------|
| Full logo | 35mm | Cards, letterhead |
| Icon only | 10mm | Small items |

## Backgrounds and colour

| Background | Which logo |
|------------|-----------|
| White | Full colour or dark mono |
| Light grey (#F5F5F5 or lighter) | Full colour or dark mono |
| Brand primary colour | Reversed (white) |
| Dark (#333 or darker) | Reversed (white) |
| A photograph | Pick whichever version keeps strong contrast |

Four colour rules:
1. Keep to the approved palette.
2. No gradients inside the logo.
3. No transparency on its parts.
4. No shadows or other effects.

## Never

- Stretch or squash it
- Tilt it at an angle
- Add a drop shadow
- Fill it with a gradient
- Recolour it outside the palette
- Outline it or add a stroke
- Put it on a busy background
- Crop any part away
- Rearrange its pieces
- Attach extra elements

## Co-branding

With a partner's logo:
1. Match their visual weight (same height).
2. Leave a clear gap between the two.
3. Add a divider line if the gap alone is not enough.
4. Show each in its own approved colours.
5. Clear space applies around both.

Two layouts:
```
Side by side:   [OUR LOGO] | [PARTNER LOGO]

Stacked:            [OUR LOGO]
                        +
                  [PARTNER LOGO]
```

## File formats

| For | Format | Note |
|-----|--------|------|
| Web | SVG | First choice, scales cleanly |
| Web, if SVG is unsupported | PNG | Keep the transparency |
| Print | PDF | Vector, top quality |
| Print, older systems | EPS | Legacy only |
| Office documents | PNG | a good default is 300 dpi |

Suggested folder:
```
assets/logos/
├── full-horizontal/
│   ├── logo-full-color.svg
│   ├── logo-full-color.png
│   ├── logo-reversed.svg
│   ├── logo-mono-dark.svg
│   └── logo-mono-light.svg
├── icon-only/
│   ├── icon-full-color.svg
│   ├── icon-reversed.svg
│   └── favicon.ico
└── monochrome/
    ├── logo-black.svg
    └── logo-white.svg
```

## Where it goes

### Social profile pictures
Use the icon-only logo as a PNG on LinkedIn, Twitter/X, Facebook and Instagram. Each platform sets and changes its own recommended avatar size, so look up the current size on the platform's help pages before exporting.

### Website
| Spot | Variant | Size (a good default) |
|------|---------|------|
| Header | Full horizontal | 120-200px wide |
| Footer | Full horizontal | 100-150px wide |
| Favicon | Icon only | 32x32px |
| Apple touch icon | Icon only | a larger square PNG; check Apple's current guidance for the size |

### Documents
| Document | Variant | Position |
|----------|---------|----------|
| Letterhead | Full horizontal | Top left |
| Presentation | Icon plus wordmark | Title slide |
| Report | Full horizontal | Cover and footer |

## Before you place it

1. Confirm it is the current version.
2. Check it suits the background.
3. Check the minimum size.
4. Check the clear space.
5. Read this page once more.

## Exceptions

For a use that breaks these rules:
1. Send a mockup of the proposed use.
2. Say where it will appear and who will see it.
3. Wait for the brand owner's answer.
4. Write any approved exception down.
