---
id: pack-godot-camera-shaders-particles-export
module: domains
checked: 2026-11-09
tokens:
  light: 58
  standard: 58
  full: 58
---

# Domain: Godot games, camera, shaders, particles, export and audit

## Why

- **The problem:** Claude knows Godot 3 better than Godot 4 in places, so it writes code that does not run: old signal syntax, the wrong move call, untyped variables. Cameras that jitter, shaders that stutter, particles that cost too much and an export that fails on the last step are the next gaps, and a game whose progression "feels off" has no quick way to be checked.
- **The reason:** this pack gives Claude ten skills for Godot 4 and GDScript. Representative jobs: write typed GDScript and small scenes that run the first time; prove a change works with a headless run, tests, a screenshot and diagnostics; build 2D and 3D cameras (follow, shake, zoom, split screen); write shaders and GPU particle effects; animate with tweens; export to Windows, Linux, macOS, Android, iOS and Web, with signing and size cuts; and audit a project for code quality and for progression and currency balance. The rest cover controls, menus and saves, and working safely through an editor tool.
- **The cost of skipping it:** Claude writes Godot from memory, a change is called done without being run, and export problems appear on release day.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The test skill runs the project before and after a change and compares, and the other skills end in checks Claude can run.

## Detect

Read-only: presence and versions, never your project files. The program the skills use, printed as found or not found:

- `godot --version 2>/dev/null || godot4 --version 2>/dev/null`. Godot is the one requirement for nine of the ten skills.
- The pack, at project and user level: `ls -d .claude/skills/godot-camera-shaders-particles-export "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/godot-camera-shaders-particles-export 2>/dev/null`.
- Another skill that already covers Godot, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'godot|gdscript|shader|particle|tween'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers Godot and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you build games in Godot?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names a Godot game, GDScript, shaders or game exports as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project is the game.
   - Every project, in your user folder. Recommended when you make several Godot games.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- Godot 4 on your computer. Export also needs the export templates for each platform, and, by platform, the Android SDK and a Java runtime, Xcode and an Apple developer account for iOS, and a Developer ID certificate for a macOS build outside a store. The editor-tool skill needs a tool that drives the Godot editor, which the pack does not ship.
- Nine skills have a "Without local tools" section for claude.ai: Claude then writes and fixes code and asks you to run commands and paste the output. The audit skill has no such section; it states that it works from its rubric alone when its optional linter and editor tool are missing.
- Signing and upload credentials (keystore, certificate, Apple or Steam login) stay in your environment or a secret store, never in the repo.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/godot-camera-shaders-particles-export/`: scans it with SkillSpector (`skillspector scan catalog/packs/godot-camera-shaders-particles-export --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude and you:** look for code files with `find catalog/packs/godot-camera-shaders-particles-export -type f \( -name '*.mjs' -o -name '*.py' -o -name '*.sh' -o -name '*.js' -o -name '*.ts' \)`. It found none in the version this card was written against. The skill folders `godot-camera-systems/`, `godot-export-builds/`, `godot-particles/`, `godot-shaders-basics/` and `godot-tweening/` hold written notes with GDScript and shader code examples; skim them together before the copy, because Claude copies those examples into your game.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/godot-camera-shaders-particles-export/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the ten skill files under `skills/`.
2. **you:** in a new session, say "my 2D camera should follow the player and shake when I get hit". Expected: Claude opens the pack's entry, picks the camera skill, reads it in full, and builds a follow camera with a trauma-based shake instead of writing one from memory.
3. If Claude writes the camera without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `godot-camera-shaders-particles-export` folder from `skills/`.
- **you:** remove the zip from claude.ai's skill settings, if you added it there.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 58 tokens (estimate, bytes divided by 4). Its index, about 888 tokens (estimate), loads when a Godot task comes up, and each skill only when it is used.
- **Your game is session content.** Scripts, scenes and screenshots that Claude reads go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your rules before you open a project that holds a client's unreleased game.
- **Uploads and publishing need your approval.** The export skill says to ask before any upload or publish (Steam, itch.io, a store, a CDN or a release page), to read signing credentials from the environment, and never to write a keystore, certificate or password into a script. Keep that rule. The editor-tool skill asks first before it deletes files or changes settings that affect every scene.
- **Studio-specific wording.** The export skill's CI note says exports run locally in the studio because it has no build-minutes budget, the test skill points to the studio's own `tdd` skill, and the particles skill lists "studio rules". Replace those with your own, and check the version numbers it gives for the Android SDK and Java against the Godot release you use.
