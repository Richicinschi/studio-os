Change the brand's colours, type and mood, and carry the change through every design-system file.

<args>$ARGUMENTS</args>

## What changes

One run touches three files:

- `docs/brand-guidelines.md` is the document people read.
- `assets/design-tokens.json` holds the token definitions (primitive, then semantic, then component).
- `assets/design-tokens.css` holds the CSS variables generated from those tokens.

## Steps

### 1. Collect the input

Ask the user (with `AskUserQuestion`) for these five things:

- A **theme name**, such as "Quiet Harbor" or "Citrus Pop"
- The **primary colour**: its name (say, Lagoon) and its hex code
- The **secondary colour**: name and hex code
- The **accent colour**: name and hex code
- A few **mood words** that steer AI-generated images, such as "calm, honest, premium" or "loud, playful, young"

### 2. Edit the guidelines document

Open `docs/brand-guidelines.md` and change, in order:

1. The Quick Reference table, with the new names and hex codes
2. The Brand Concept section, with the theme name and a fresh description
3. The Color Palette section, giving primary, secondary and accent with their shades
4. The AI Image Generation section: base prompt, keywords and mood descriptors

### 3. Sync the tokens

```bash
node brand/scripts/sync-brand-to-tokens.cjs
```

The script rewrites the colours in `assets/design-tokens.json` and regenerates `assets/design-tokens.css`.

### 4. Check it took

```bash
# the guidelines still parse
node brand/scripts/inject-brand-context.cjs --json | head -30

# the CSS carries the new values
grep "primary" assets/design-tokens.css | head -5
```

### 5. Report back

Tell the user the theme, the three colours with their hex codes, and that the guidelines, the JSON tokens and the CSS tokens were all updated.

## Related skills

- `brand` reads the guidelines and runs the sync.
- `design-system` generates the tokens.

## Invocations

```bash
# the skill asks the questions
/brand:update

# with a theme as a hint
/brand:update "Quiet Harbor"

# with a preset name
/brand:update "dusk violet"
```

## Presets

When the user names a preset, use these colours in place of asking for them. Still ask for the theme name and mood words if the user has not given them. Each line reads primary, secondary, accent.

- **quiet-harbor:** Lagoon #0E7490, Sand #D6B98C, Seaglass #34D399
- **citrus-pop:** Tangerine #FB923C, Grape #7E22CE, Lime #A3E635
- **pine-and-clay:** Pine #166534, Clay #B45F3C, Oat #E7D9B8
- **dusk-violet:** Violet #6D28D9, Rose #F43F5E, Sky #38BDF8
- **ember:** Ember #EA580C, Charcoal #44403C, Gold #EAB308

## Ground rules

- Update all three files every time. A change to the guidelines alone leaves the tokens stale.
- Run the check in step 4 after each update.
- If the user wants, generate one sample image to see the new brand applied.
