---
id: rules-audit
module: 06-git-and-guardrails
checked: 2026-11-02
---

# The periodic rules audit

## Why

- **The problem:** a rule written once drifts. What the front door says, what a hook or setting enforces, and what a skill's steps do stop matching, and nobody notices until a mistake gets through. A guard can be believed to block more than it does.
- **The reason:** a read-only session every few months reads everything that states a rule and lists what disagrees: contradictions, enforcement gaps, stale references, routines that break a rule, memory problems and plain gaps, each with both sides quoted by file and line. It changes nothing, so it is safe to run on a setup you depend on.
- **The cost of skipping it:** the studio's first audit returned 93 findings, three of them critical, and all three were holes in the guards in front of acts that cannot be undone. The guards had been believed to block more than they did ([auditing the studio's own rules](../examples/rules-audit.md)).
- **The principle:** [checks for rules that must never break, prose for judgement](../PRINCIPLES.md#checks-for-rules-that-must-never-break-prose-for-judgement). The audit is how you find out whether the checks still enforce what the prose says.

## Detect

Read-only. File names and counts only; no skill body or memory file is opened at this stage.

- Whether the brief is in your setup: `find "<your setup>" -maxdepth 4 -name 'rules-audit*' | wc -l`.
- Whether an audit was run before: `find "<your setup>" -maxdepth 4 -name '*-rules-audit.md' | wc -l`, which counts reports saved as in step 4 below. A report you keep under another name counts when you point Claude at it.
- How many kinds of place state rules in your setup, counted:
  - a front door: `ls CLAUDE.md AGENTS.md 2>/dev/null | wc -l`;
  - identity files: `ls identity/*.md 2>/dev/null | wc -l`;
  - memory files: `ls memory/*.md 2>/dev/null | wc -l`;
  - skills and agents: `ls .claude/skills/*/SKILL.md .claude/agents/*.md 2>/dev/null | wc -l`;
  - Claude Code hooks: `grep -c '"hooks"' .claude/settings*.json 2>/dev/null`;
  - git hooks, for each repository in `adoption/inventory.md`: `git -C <repo> config --get core.hooksPath >/dev/null && echo set || echo "not set"`.

The menu marks the item **have** when the brief is in your setup and an audit report exists; **partly** when only one of the two exists; and **not yet** otherwise.

## Ask

1. **"Audit your own rules now and then?"** Recommended when your work is software, ML or data.
   - Keep what you have. Recommended when Detect says **have**.
   - Yes, and run the first audit now. Recommended when Detect counts rules in three or more kinds of place (for example a front door, memory and hooks): that is where they drift apart.
   - Yes, but run it later: the brief goes into your setup now (one file, which loads nothing until you use it), and you put a date in your calendar. Recommended when Detect counts rules in two kinds of place.
   - No. Recommended when Detect finds only a front door: one short file, read as a whole, has little to drift from.
   - Not sure: the option recommended above for what Detect found: keep what you have at **have**; the first audit now with rules in three or more kinds of place; the brief now and the run later with two; no with only a front door.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"When does it run?"** (only when the answer above was yes)
   - Every few months, on a date in your own calendar.
   - After every big change to your rules, hooks or skills. Recommended when Detect finds rules in prose only.
   - Both. Recommended when Detect finds hooks or settings that enforce rules as well as prose that states them: a change to one is when the other drifts.
   - Not sure: the option recommended above for what Detect found: both when hooks or settings enforce rules beside the prose, after every big change when the rules are prose only.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no schedule; Claude mentions the audit again at your next update run.

## Needs

- Nothing beyond Claude Code, and SkillSpector for the scan in step 1 (row 1 of your plan, [SkillSpector](skillspector.md)).
- In claude.ai: a Project whose knowledge holds your instruction files.

## Steps

1. **Claude:** runs `vet-and-adopt` on the template `templates/audit/rules-audit-brief.md`. It ships a file, so it is scanned like a skill (a brief is instructions for Claude too), then compared with any audit routine you already have.
2. **Claude:** writes the brief into your setup, for example as `audit/rules-audit-brief.md`, rewritten for your setup, and shows it before saving:
   - `<your setup>` becomes your folder;
   - the reading list names only the places you have (front door, identity files, memory, skills, agents, Claude Code hooks, git hooks, project instruction files) and drops the rest;
   - company instruction files go on the list only if your data rules allow Claude to read them;
   - the six kinds of finding, the quotes of both sides with `file:line`, the verified or likely mark, the severity order and the closing list of what was found consistent all stay.
3. **you:** to run it, open a new session in your setup and say: "Run the rules audit in `audit/rules-audit-brief.md`, read only." Claude can hand it to a subagent, which reads everything in its own context window and sends back only the findings ([docs/facts.md](../docs/facts.md), "Claude Code: context commands, subagents, extra folders").
4. **Claude:** on your yes, saves the findings as `audit/<YYYY-MM-DD>-rules-audit.md`, so the next audit can be compared with this one.
5. **you:** check each critical finding against the file or the code yourself before you act on it. Then fix in waves, one change each, ticking off the finding numbers as they land.
6. **you:** put the next audit in your calendar, as you answered in question 2.
7. **Claude:** records the decision, the schedule, the date of the first run (or "not run yet") and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -c '<your setup>' audit/rules-audit-brief.md` in your setup. Expected: `0`, so no placeholder is left. The file exists at that path.
2. After the first run, the report file exists; every finding in it quotes both sides with `file:line` and is marked verified or likely; and it ends with what was checked and found consistent.

If a finding lacks either quote, or the report has no list of what was found consistent, the brief was not followed: the plan row stays unticked, and the audit runs again. If you chose to run it later, check 1 alone ticks the row, and the decision row says the first run is still open.

## Undo

- **Claude:** deletes the brief from your setup.
- **you:** keep or delete the reports; they are your record of what was found and fixed.
- **you:** remove the date from your calendar.

## Watch out

- **"Read only" is an instruction, not a lock.** If Claude proposes an edit during the audit, say no: the fixes come after, one change each.
- **A finding can be wrong.** Of the studio's 93 findings, 88 were verified with both sides quoted; the three critical ones were checked against the code again before anything was changed.
- **The worst findings sit in the guards.** In the studio's audit they were a force-push spelled in a way the guard did not know, a command wrapped in quotes that the guard did not read, and a recorded yes that covered more than one act. Before you claim a guard blocks something, look at the finding list.
- **Company files:** the audit reads what you list. Leave out any file your data rules keep away from Claude.
- **claude.ai:** run the brief in a Project whose knowledge holds your instruction files, with `<your setup>` replaced by "this Project's knowledge"; there are no hooks to read there.
- **Token cost:** the brief loads nothing until you run it; the kit's version is about 380 tokens, an estimate (bytes divided by 4). A run reads every file on its list, so its cost grows with your setup; in a subagent, that reading stays out of your main conversation.
