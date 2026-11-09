---
id: pack-design-ui-logos-slides-posters
module: domains
checked: 2026-11-09
tokens:
  light: 74
  standard: 74
  full: 181
---

# Domain: design, UX and accessibility

## Why

- **The problem:** when you ask for a logo, a deck, a poster or a nicer screen without a method, you get the generic default: the same gradient, the same card grid, a logo you never agreed to, and a page nobody checked on a phone or with a keyboard.
- **The reason:** this pack gives Claude eighteen design jobs, each as a written procedure with a stop for your choice. Representative jobs: decide a look and feel before anything is built, fix a screen that looks machine-made, design a logo (three concepts, a hard stop for your pick, then an export kit), make a presentation from templates, make a poster or social card, and check accessibility with measured results. One reviewer agent judges a rendered design from the output alone.
- **The cost of skipping it:** each design task starts from a blank prompt, and the result is judged by whether it looks fine to the author.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The skills render the work, measure it (contrast, size, SVG audit) and name faults before they hand it over.

## Detect

Read-only: presence and versions, never your designs or files. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The pack and the two stubs, at project and user level: `ls -d .claude/skills/design-ui-logos-slides-posters .claude/skills/review-animations .claude/skills/motion-dev-animations "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/design-ui-logos-slides-posters "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/review-animations "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/motion-dev-animations 2>/dev/null`.
- Whether the agent exists: `ls .claude/agents/design-critic.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/design-critic.md 2>/dev/null`.
- Tools some of the skills use, printed as found or not found: `node --version 2>/dev/null`, `python --version 2>/dev/null`, and a browser (`google-chrome --version 2>/dev/null || chromium --version 2>/dev/null`; on Windows or macOS say which browser you use).
- Another skill that already does design work, from its front matter only:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'logo|design|slides|poster|accessib|brand' && echo "$f"; done`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already handles design and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you make logos, slides, posters, charts or screens, or check them for accessibility?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names a website, an app, a brand, presentations, posters or social cards as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when the design work belongs to one project.
   - Every project, in your user folder. Recommended when you design in several.
   - Not sure: this project only.
   - Default when skipped: this project only.
3. **"Take the reviewer agent?"** (only on a yes; Claude Code only)
   - Yes: `design-critic`, which reviews a rendered design from screenshots alone. About 50 tokens every session (estimate). Recommended when you publish what you make.
   - No. Recommended when you only want the procedures.
   - Not sure: yes.
   - Default when skipped: no.
4. **"Take the two animation stubs?"** (only on a yes)
   - Yes: `review-animations` and `motion-dev-animations`, one-line skills that send Claude into the pack. About 57 tokens every session together (estimate). Recommended when you write animation code.
   - No. Recommended otherwise; the entry still reaches both skills.
   - Not sure: no.
   - Default when skipped: no.

## Needs

- A browser for the skills marked as needing one (style guide capture, slide deck, app illustration, visual check), an SVG renderer for the logo skill, and a design-tool connection for the Figma skill. The animation-code skill uses `npm` for the library and `python` with `pip install jsonschema` for its config checker. Six skills carry a "Without local tools" section for claude.ai (style guide capture, Figma, logo, slide deck, app illustration, visual check), so a missing tool narrows what Claude does and stops nothing.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/design-ui-logos-slides-posters/`: scans it with SkillSpector (`skillspector scan catalog/packs/design-ui-logos-slides-posters --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude:** reads with you the scripts the pack ships, found in these skill folders: `accessibility-review` (`contrast.mjs`), `design-system-capture` (`merge-colors.mjs`), `logo-design` (`svg-audit.mjs`), `motion-dev-animations` (two `.py` checkers), `platform-formatted-document` (`check-pasteable-html.mjs`) and `visual-qa-gate` (`page-checks.js`). It says what each does before anything is saved.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/design-ui-logos-slides-posters/`; on a yes to question 4, `catalog/packs/design-ui-logos-slides-posters/stubs/review-animations/SKILL.md` to `<where>/skills/review-animations/SKILL.md` and `catalog/packs/design-ui-logos-slides-posters/stubs/motion-dev-animations/SKILL.md` to `<where>/skills/motion-dev-animations/SKILL.md`; and on a yes to question 3, `agents/design-critic.md` to `<where>/agents/`. It shows the list first and saves on your yes.
4. **you:** install a browser or `node` if Detect did not find one you need. A command that installs software is handed to you to type; Claude does not run it.
5. **Claude:** records the decision, the scope, the tools found and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose.
2. **you:** in a new session, say "I need a logo for my small business". Expected: Claude reads the entry, opens the logo skill, asks a few plain questions together, shows three black and white concepts, and stops for your pick before it builds any export files.
3. On claude.ai, upload the pack's zip first ([START-HERE](../START-HERE.md), "If you only use claude.ai"); the same request works without a local renderer, with the limits the skill states.
4. If Claude draws a logo without reading the pack's entry, or does not stop for your pick, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `design-ui-logos-slides-posters` folder from `skills/`, and, if they were copied, `review-animations` and `motion-dev-animations` from `skills/` and `design-critic.md` from `agents/`.
- **you:** remove the zip from claude.ai's skill settings.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 74 tokens (estimate, bytes divided by 4). Its index, about 1,366 tokens (estimate), loads when a design task comes up, and each skill only when it is used.
- **Your brand replaces the pack's assumptions.** A few skills carry the studio's own look, author name or budgets, for example the animation-code skill names a size budget for animation code and the front-end skill refers to the studio's checklist. Read these lines in step 1 and replace them with yours; the hard stops for your approval stay.
- **Your designs are session content.** Screenshots, files and text that Claude reads go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you hand over an unreleased design.
- **Clients and trademarks.** The logo skill will not imitate an existing brand's mark; the style guide skill reads only public pages, respects the site's rules, and never logs in for you. Keep both limits when you adapt them.
- **Animation code installs a library.** The animation skill names `npm install` and `pip install` commands; those are handed to you, not run by Claude.
