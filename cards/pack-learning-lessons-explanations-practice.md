---
id: pack-learning-lessons-explanations-practice
module: domains
checked: 2026-11-09
tokens:
  light: 37
  standard: 37
  full: 53
---

# Domain: learning something from zero

## Why

- **The problem:** asking Claude to explain a topic gives you one good answer that you forget by next week. Being able to answer today feels like knowing, but it is not the same as still knowing next month.
- **The reason:** this pack holds one skill, `teach`, that runs a small course over many sessions. The folder you work in becomes the course: a mission file (why you want this), a glossary, a list of trusted sources, short learning records of what you now know, one short HTML lesson per narrow topic that ends in one concrete win, and reference sheets. It teaches from sources it has found, not from memory, and builds in retrieval practice, spaced returns to old material and mixed practice.
- **The cost of skipping it:** every session starts from nothing, the explanations come from memory, and nothing makes you recall what you learned.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The skill must find sources before it writes a lesson, and each lesson cites its best source.

## Detect

Read-only: presence only, never your notes. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The pack and the stub, at project and user level: `ls -d .claude/skills/learning-lessons-explanations-practice .claude/skills/teach "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/learning-lessons-explanations-practice "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/teach 2>/dev/null`. This pack has no agents.
- Whether a course folder already exists here (names only): `ls MISSION.md GLOSSARY.md RESOURCES.md lessons learning-records 2>/dev/null`.
- Another skill that already teaches, from its front matter only:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'teach|tutor|lesson|learn|course|flashcard' && echo "$f"; done`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already teaches and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you want to learn new subjects with Claude, over several sessions?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names studying, a course, an exam, a new language or a new tool you must learn.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when you will learn one subject in one folder. The course files are written into the folder you work in, so a dedicated folder per subject keeps them tidy.
   - Every project, in your user folder. Recommended when you want to start a course from any folder.
   - Not sure: this project only.
   - Default when skipped: this project only.
3. **"Take the `teach` command stub?"** (only on a yes)
   - Yes: a one-line skill `teach`, marked user only in the pack, which you start yourself and which sends Claude into the pack. About 16 tokens every session (estimate). Recommended, because it is how you start a course on purpose.
   - No: the entry still reaches the skill when you ask to learn something.
   - Not sure: yes.
   - Default when skipped: yes.

The pack has no agents.

## Needs

- No program is required. The skill can open a finished lesson in your browser with a command, and it searches the web for sources when your session allows it. The pack has no "Without local tools" section; on claude.ai the lessons are files Claude can show you, but a multi-session course needs a folder that persists, which Claude Code gives you and claude.ai does not.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/learning-lessons-explanations-practice/`: scans it with SkillSpector (`skillspector scan catalog/packs/learning-lessons-explanations-practice --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude:** reads the pack with you. It ships no script files (no `.mjs`, `.py` or `.sh`); it has the skill and four format notes for the course files.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/learning-lessons-explanations-practice/`, and, on a yes to question 3, `catalog/packs/learning-lessons-explanations-practice/stubs/teach/SKILL.md` to `<where>/skills/teach/SKILL.md`. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose.
2. **you:** in a new, empty folder, say "I want to learn <a subject> from zero". Expected: Claude reads the entry, opens the `teach` skill, asks why you want it (the mission) before it writes a lesson, and says it will look for trusted sources first.
3. If Claude explains the whole subject in one reply without asking for your mission or creating course files, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes `learning-lessons-explanations-practice` and, if copied, `teach` from `skills/`.
- **you:** the course files a session wrote into a folder (mission, lessons, records) are yours; delete or keep them.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 37 tokens (estimate, bytes divided by 4). Its index, about 154 tokens (estimate), loads when a task reaches the pack, and the `teach` skill only when it is used.
- **It writes many files into your folder.** A course adds a mission file, a glossary, a source list, lessons and records. Start it in a folder meant for that subject, not inside a project you ship.
- **Sources decide the quality.** The skill is told not to teach from memory; check the source list it builds before you trust the lessons, and expect it to go to the web.
- **What you tell it is session content.** Your goals and answers go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes").
- **Studio wording.** The skill's front matter names the studio as author and calls itself part of "this workspace"; adapt that line to your setup in step 2.
