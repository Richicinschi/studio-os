---
id: pack-unity-editor-scripts-prefabs-builds
module: domains
checked: 2026-11-09
tokens:
  light: 48
  standard: 48
  full: 48
---

# Domain: Unity games (editor, scripts, prefabs, tests and builds)

## Why

- **The problem:** Unity hides many of its traps in places a first read of the code does not show: a script that works in one scene and breaks in another, a renamed field that wipes saved values, an asset import that overwrites a folder, and a build that fails at signing. A non-coder who builds a Unity game with Claude does not know which of these to ask about.
- **The reason:** this pack gives Claude six skills, each a written procedure: work the edit-run loop (compile, run code in the editor, read the console); write C# scripts and prefabs that avoid the usual Update-loop and reference traps; playtest in Play mode and profile frame cost and memory; build for PC, Android and iOS with signing and size checks; import and organise assets under a plan with no silent overwrite; and add multiplayer basics with a local two-client test.
- **The cost of skipping it:** Claude writes Unity code from general C# habits, and the faults show up as lost values, slow frames or a rejected build.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The skills read the console, the profiler and the build report before they say a change works.

## Detect

Read-only: presence and versions, never your project files. Unity has no single version command, so Detect looks for the editor folders the skills name:

- `ls -d "/c/Program Files/Unity/Hub/Editor"/* /Applications/Unity/Hub/Editor/* 2>/dev/null` lists the installed editor versions on Windows and macOS.
- Programs for the platform builds, printed as found or not found: `java -version 2>&1 | head -1` and `adb version 2>/dev/null | head -1` for Android, and `xcodebuild -version 2>/dev/null | head -1` on a Mac for iOS.
- The pack, at project and user level: `ls -d .claude/skills/unity-editor-scripts-prefabs-builds "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/unity-editor-scripts-prefabs-builds 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'unity|c#'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers Unity and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you build games or tools in Unity?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names Unity, C# scripts, prefabs or a Unity build as part of your work.
   - No: skip it. Recommended otherwise, including when you use another engine.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project is the Unity game.
   - Every project, in your user folder. Recommended when you work in Unity across several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- The Unity editor, installed through Unity Hub, on the version your project uses. Every one of the six skills lists Unity as a need. The build skill adds the platform tools: a C++ toolchain for IL2CPP, the Android build support, and, for iOS, a Mac with Xcode.
- All six skills have a "Without local tools" section for claude.ai. There Claude cannot run Unity, so it works from the console text, folder listings and build logs you paste back.
- Accounts and keys only if you ship: a developer account for a store, a signing key for Android. The build skill says to keep the key and its password out of the chat and out of version control, and asks you for file and setting names only.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/unity-editor-scripts-prefabs-builds/`: scans it with SkillSpector (`skillspector scan catalog/packs/unity-editor-scripts-prefabs-builds --no-llm`), triages the findings, and recommends the decision.
2. **Claude and you:** read what the pack ships. It holds six skill files and no scripts or templates (a search for `.cs`, `.py`, `.sh`, `.js` and `.ts` files finds none). The edit-run loop skill does tell Claude to run the Unity editor from the command line in batch mode, so read the commands in `skills/unity-editor-loop.md` with Claude before you adopt it.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/unity-editor-scripts-prefabs-builds/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the six skill files under `skills/`.
2. **you:** in a new session, say "my Unity prefab keeps losing its changes, what am I doing wrong?". Expected: Claude opens the pack's entry, picks the scripts-and-prefabs skill, reads it in full, and walks you through the Overrides drop-down and Apply or Revert.
3. If Claude answers from general knowledge without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `unity-editor-scripts-prefabs-builds` folder from `skills/`.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 48 tokens (estimate, bytes divided by 4). Its index, about 490 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **Your project is session content.** Scripts, console text and build logs that Claude reads go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you open a project that is not yours.
- **Approval points.** The skills ask before they delete files, clear the Library folder, overwrite an unsaved scene or prefab, install a package, rename a serialized field, buy an asset, run Play mode on a scene that could write saves or call a live service, rent a server, open a router port, pay for a developer account, or upload a build. Keep that behaviour when you adapt them.
- **Studio references.** The build skill points to "the legal and marketing skills in the studio core" for store listing text and privacy policy. If you do not have skills for those, replace the line with the one you use.
- **Version drift.** The multiplayer skill says package names and menu names change between Unity versions, and tells Claude to say so when it cannot find one. Check the editor version against what the skill describes.
