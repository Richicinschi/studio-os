---
id: receiving-code-review
module: 08-agents-and-council
checked: 2026-11-09
tokens:
  description: 64
  body: 1533
---

# Receiving a code review

## Why

- **The problem:** a review is a second view, and a second view can be wrong. Taken on trust, a wrong suggestion breaks code that worked; argued away, a right one is lost. The usual failure is agreeing out loud before checking anything.
- **The reason:** this skill gives Claude a fixed way to take feedback: read all of it, restate each point, check it against the code, then fix it, one item at a time with a test each, or push back with a technical reason. An unclear item stops everything until it is clarified, because items are often related.
- **The cost of skipping it:** each review point is acted on as written, so a suggestion that is wrong for your codebase goes in, or a correct one is lost in an argument. The kit has no story of its own for this item.
- **The principle:** [push back once, then do it](../PRINCIPLES.md#push-back-once-then-do-it). When a review point is wrong, Claude says so once, with the evidence, and then does what you decide.

## Detect

Read-only: names, descriptions, versions and counts, never a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The skill, at project and user level: `ls -d .claude/skills/receiving-code-review "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/receiving-code-review" 2>/dev/null`.
- Another skill that handles review feedback. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- A rule in your instruction files about review feedback or agreeing too readily: `grep -n -i -E 'review|feedback|absolutely right' CLAUDE.md AGENTS.md .claude/CLAUDE.md 2>/dev/null`.

The menu marks the item **have** when a skill of this name exists at either level; **partly** when another skill or an instruction-file rule covers how to take review feedback; and **not yet** otherwise.

## Ask

1. **"Take the skill for acting on review feedback?"** Recommended when your work is software, ML or data.
   - ADOPT the kit's copy as it is. Recommended when Detect says **not yet**.
   - Keep the skill you have. Recommended when Detect says **have**.
   - FOLD three lines into your instruction file: check each review point against the code before changing anything; push back with a technical reason when a point is wrong; fix one item at a time and test each. Recommended when Detect says **partly**, or when you want nothing more loading every session.
   - Skip.
   - Not sure: the recommended option above for what Detect found.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"** (only when the answer above was ADOPT)
   - Every project: your user folder's `skills/`. Recommended, because the skill works the same in every repository.
   - This project only: `.claude/skills/` in the repository.
   - claude.ai: uploaded as a custom skill, for reviews you work through there.
   - Not sure: every project, the recommended option.
   - Default when skipped: every project.

## Needs

- Claude Code, or claude.ai with code execution turned on, which custom skills need ([docs/facts.md](../docs/facts.md), "claude.ai: custom skills and the built-in document skills").
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- The `gh` command line, only for the skill's last section, which replies inside GitHub review threads. That command and how to install `gh` are not documented in docs/facts.md as of 2026-11-02.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/skills/receiving-code-review/` (`SKILL.md`): scans it with SkillSpector (`skillspector scan catalog/skills/receiving-code-review --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The maintainers' latest scan result is in the skill's `SOURCE.md`; your own scan is the one that decides.
2. **Claude:** prepares the copy, and shows you every change before saving:
   - **the metadata block:** its author line names the studio; Claude writes yours, and keeps the name, description and body;
   - **the instruction-file rule it leans on:** the skill says the studio's instruction files forbid "You're absolutely right!". If Detect found no such line in yours, Claude offers to add one, or to drop those words from the skill, so it does not cite a rule you do not have;
   - **the last section,** on replying in GitHub review threads: kept if you review on GitHub, cut otherwise;
   - **keep:** the response pattern (read, understand, verify, evaluate, respond, implement), the stop on unclear items, the checks before taking an outside reviewer's suggestion, and the order of fixes.
3. **Claude:** saves it at `~/.claude/skills/receiving-code-review/` or `.claude/skills/receiving-code-review/`. For claude.ai, it zips the folder instead.
4. **you:** (claude.ai only) upload the zip through Customize > Skills > "+" > "+ Create skill" > "Upload a skill".
5. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The folder exists at the level you chose, with `SKILL.md` in it.
2. **you:** in a new session, paste a short review of a recent change with two points, one of them wrong for your code (for example, "remove this function", when something still calls it). Expected: Claude restates each point, searches the code before changing anything, pushes back on the wrong point with the reason (it found the caller), fixes the other one, and opens with neither thanks nor "You're absolutely right".
3. claude.ai: the same paste in a new chat gives the same behaviour.

If Claude agrees and starts changing code before checking, or removes the function that is still called, the item is not done: the plan row stays unticked, and whether the skill loaded at all (its folder and `name:` line) is the first thing to look at.

## Undo

- **Claude:** deletes the `receiving-code-review` folder from the level it went to, or the lines it added to your instruction file for FOLD.
- **you:** in claude.ai, remove the skill in Customize > Skills, where you uploaded it; the exact removal steps are not documented in docs/facts.md as of 2026-11-02.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 59 tokens (its 234 bytes divided by 4, an estimate). Its instructions, about 1,480 tokens (estimate), load only when it is used.
- **Two copies answer the same feedback.** If you also have another skill that does the same job, both descriptions load. Keep one.
- **It forbids thanks.** Its replies to review state the fix and leave out gratitude. In a team that reads those replies, some people find that curt; it is the kit's choice, and yours to keep or soften in your copy.
- **It weighs sources differently.** It trusts feedback from you after it understands it, checks an outside reviewer's suggestion against the codebase first, and stops to ask you when outside feedback conflicts with a decision you made earlier.
- **Company rules:** a review that came from a colleague is their work; pasting it into a personal account or a claude.ai Project may be outside your data rules.
