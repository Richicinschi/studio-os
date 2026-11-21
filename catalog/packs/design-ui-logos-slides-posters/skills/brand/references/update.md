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
node skills/brand/scripts/sync-brand-to-tokens.cjs
```

The script rewrites the colours in `assets/design-tokens.json`, then regenerates `assets/design-tokens.css` with the token generator at `.claude/skills/design-system/scripts/generate-tokens.cjs`. This domain does not ship that generator: without it the script stops with exit 1 and "CSS not regenerated" after updating the JSON, and the CSS still holds the old colours. Put a generator there and re-run, or copy the new values into `design-tokens.css` by hand (`brand.md`, Sync workflow).

### 4. Check it took

```bash
# the guidelines still parse
node skills/brand/scripts/inject-brand-context.cjs --json | head -30

# the CSS carries the new values
grep "primary" assets/design-tokens.css | head -5
```

### 5. Report back

Tell the user the theme, the three colours with their hex codes, and that the guidelines and the JSON tokens were updated. Say the CSS tokens were updated only if the sync regenerated them or you copied the values in by hand; otherwise say that `assets/design-tokens.css` still holds the old colours.

## Related skills

- `brand` reads the guidelines and runs the sync.
- The token generator at `.claude/skills/design-system/scripts/generate-tokens.cjs` in the project, when there is one, generates the CSS tokens. This domain does not ship that generator.

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
