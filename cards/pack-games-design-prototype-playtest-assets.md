---
id: pack-games-design-prototype-playtest-assets
module: domains
checked: 2026-11-09
tokens:
  light: 56
  standard: 56
  full: 56
---

# Domain: making games (design, prototype, playtest, art and ports)

## Why

- **The problem:** a solo maker with a game idea tends to start building before the idea is a design, tests the game by reading the code instead of playing it, and tunes numbers by feel. Art, menus and ports each have their own traps, and none of them depends on which engine you use.
- **The reason:** this pack gives Claude eight skills, each a written procedure: turn an idea into a one-page design with a scope cut; build a first playable fast; playtest a game by driving it and report a counted list of faults; get usable game art, with a check script for edges and sizes; build menus from an approved mockup; check game numbers with a balance script; port a game your team wrote; and set up a game folder so an agent keeps your rules.
- **The cost of skipping it:** Claude builds from the first sentence of your idea, and bugs and unfair numbers show up when someone else plays.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The playtest skill reports faults it counted from runs and read-outs, and the balance skill shows sample runs before it proposes a number.

## Detect

Read-only: presence and versions, never your game files. Programs some of the skills use, printed as found or not found:

- `python --version 2>/dev/null || python3 --version`, then `python -c "import PIL; print(PIL.__version__)" 2>/dev/null` for Pillow (the art check script needs it), and `ffmpeg -version 2>/dev/null | head -1` (optional, for animation frames).
- The pack, at project and user level: `ls -d .claude/skills/games-design-prototype-playtest-assets "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/games-design-prototype-playtest-assets 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'game|playtest|sprite|prototype'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers game design or playtesting and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you make games, in any engine or in a browser?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names a game, a game idea, a game jam or game art as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project is the game.
   - Every project, in your user folder. Recommended when you make several games.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- Python 3 for the two scripts; Pillow for the art check (`python -m pip install pillow`, which you type). The balance script uses only Python's standard library. `ffmpeg` is optional. The playtest skill needs the game running, the menu skill needs an engine editor, and the port skill needs the build tools of the target platform.
- Four of the eight skills have a "Without local tools" section for claude.ai (art, menus, playtest, port). The other four work from what you paste or describe, so they need no tools.
- Accounts and keys only if you choose them: a paid image model for art, a developer account for a port. The skills ask first and state the cost.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/games-design-prototype-playtest-assets/`: scans it with SkillSpector (`skillspector scan catalog/packs/games-design-prototype-playtest-assets --no-llm`), triages the findings, and recommends the decision.
2. **Claude and you:** read the two scripts together before they are copied. They run only when you ask for them: `skills/game-art-pipeline/check_art.py` (reads images, writes nothing) and `skills/game-balance-and-economy/balance_sim.py` (runs sample trials and prints numbers).
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/games-design-prototype-playtest-assets/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the eight skill files and the two scripts under `skills/`.
2. **you:** in a new session, say "I have an idea for a small puzzle game, help me turn it into a design". Expected: Claude opens the pack's entry, picks the design-brief skill, reads it in full, asks about your limits, and stops at a question for your approval before it builds anything.
3. If Claude starts writing game code without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `games-design-prototype-playtest-assets` folder from `skills/`.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 56 tokens (estimate, bytes divided by 4). Its index, about 680 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **Your game is session content.** Code, screenshots and design notes that Claude reads go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you open a game that is not yours.
- **Paid and outward steps need your approval.** The art skill asks before a paid image model and states what is sent to the provider; the port skill asks before developer accounts, store fees, cloud builds and uploads; the balance skill changes no number until you approve. Keep that behaviour when you adapt them.
- **Scope limits.** The port skill is for a game whose source you or your team wrote, and asks that first. The balance skill covers in-game currency, not real prices, and flags paid random rewards for a legal check.
- **Studio skill names.** The game-folder skill hands off to two studio skills, `start-project` and `claude-md-curator`, and the menu skill points to a design skill. If you do not have skills with those names, replace the lines or ignore the hand-off.
