---
name: brand
description: >-
  Use when the work touches a brand: style guides, tone of voice, branded content, marketing assets,
  brand compliance. It covers brand voice, visual identity, messaging frameworks, asset management
  and consistency checks.
argument-hint: "[update|review|create] [args]"
metadata:
  version: "1.0.0"
  category: design
  author: Richicinschi
  domain: brand voice, visual identity and design tokens, set up per client for website projects
---

# Brand

One brand lives in one markdown file, `docs/brand-guidelines.md`. This skill keeps that file honest: it defines the voice and look, checks work against it, files the assets, and pushes the colours into design tokens.

## Use it for

- Defining a voice and the tone for each setting
- Writing visual-identity rules and a style guide
- Building a messaging framework
- Auditing existing material for consistency
- Naming, filing and approving assets
- Managing the colour palette and type specification

## Quick start

Print the brand as a prompt block, or as JSON:
```bash
node skills/brand/scripts/inject-brand-context.cjs
node skills/brand/scripts/inject-brand-context.cjs --json
```

Check one asset's name, format, size and manifest entry:
```bash
node skills/brand/scripts/validate-asset.cjs <asset-path>
```

List the palette, or get the steps for pulling colours out of an image:
```bash
node skills/brand/scripts/extract-colors.cjs --palette
node skills/brand/scripts/extract-colors.cjs <image-path>
```

`inject-brand-context` and `extract-colors` read `docs/brand-guidelines.md` from the current folder unless you pass another path (`--brand-file` for `extract-colors`). `validate-asset` reads `.assets/manifest.json` instead.

## Sync workflow

```bash
# 1. Change docs/brand-guidelines.md (by hand, or through the update subcommand)
# 2. Push the colours into the tokens
node skills/brand/scripts/sync-brand-to-tokens.cjs
# 3. Confirm the guidelines still parse
node skills/brand/scripts/inject-brand-context.cjs --json | head -20
```

Three files stay in step:
- `docs/brand-guidelines.md` is the source of truth.
- `assets/design-tokens.json` holds the token definitions.
- `assets/design-tokens.css` holds the CSS variables generated from them.

`sync-brand-to-tokens` reads those fixed paths from the project root and takes no path argument. It adds the guideline colours to the palette in `design-tokens.json` and keeps the keys already there.

The CSS step needs a token generator at `.claude/skills/design-system/scripts/generate-tokens.cjs` in the project, which the script runs as `node <generator> --config assets/design-tokens.json -o assets/design-tokens.css`. This domain does not ship that generator. Without it, or when it fails, the script writes `design-tokens.json`, then stops with exit 1 and "CSS not regenerated": `design-tokens.css` still holds the old colours. Then either put a generator that takes those two flags at that path and run the sync again, or copy the new colour values from `design-tokens.json` into the matching variables in `design-tokens.css` by hand.

## Subcommands

| Subcommand | What it does | Reference |
|------------|--------------|-----------|
| `update` | Change the brand's colours, type and mood, then sync every design-system file | `brand/references/update.md` |

## Routing

1. Take the first word of `$ARGUMENTS` as the subcommand.
2. Open `brand/references/<subcommand>.md`.
3. Follow it with the rest of the arguments.

## References

Open the one that matches the question.

- Writing or testing the brand voice: `brand/references/voice-framework.md`
- Logo, colour and type basics in one page: `brand/references/visual-identity.md`
- Mission, positioning, pitches: `brand/references/messaging-framework.md`
- Auditing live material: `brand/references/consistency-checklist.md`
- Outline for the guidelines document: `brand/references/brand-guideline-template.md`
- Folders, file names, manifest, tags: `brand/references/asset-organization.md`
- Palette, contrast, compliance targets: `brand/references/color-palette-management.md`
- Type scale, weights, spacing: `brand/references/typography-specifications.md`
- Logo placement and sizes: `brand/references/logo-usage-rules.md`
- Signing off a finished asset: `brand/references/approval-checklist.md`

## Scripts

| Script | Job |
|--------|-----|
| `skills/brand/scripts/inject-brand-context.cjs` | Turn the guidelines into a prompt block or JSON |
| `skills/brand/scripts/sync-brand-to-tokens.cjs` | Copy guideline colours into `design-tokens.json`, then regenerate the CSS when a token generator is present (exits 1 without one; see Sync workflow) |
| `skills/brand/scripts/validate-asset.cjs` | Check an asset's filename, format, size and manifest entry (it does not measure dimensions or colours) |
| `skills/brand/scripts/extract-colors.cjs` | Show the palette; for an image, print how to extract and compare colours |
| `skills/brand/scripts/self-check.cjs` | Feeds the four scripts malformed input (bad manifests, empty or garbage guidelines) and fails on any crash; Node only |

## Templates

| Template | Job |
|----------|-----|
| `brand/templates/brand-guidelines-starter.md` | A full guidelines document to copy for a new brand |
