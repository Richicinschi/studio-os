---
id: requesting-code-review
module: 08-agents-and-council
checked: 2026-11-09
tokens:
  description: 49
  body: 705
---

# Requesting a code review

## Why

- **The problem:** a change checked only by the session that wrote it gets one view, and a big change deserves someone whose whole job is to find what is wrong with it. Reviewing inline also fills the main thread with the whole diff.
- **The reason:** this skill hands the change to a reviewer subagent with a brief it fills in: what was built, what it should do, and the first and last commit of the range. The reviewer gets that brief, never your session's history, reads the diff in its own context, and returns strengths, issues by severity with file and line, and a verdict on whether it is ready to merge. Then you fix, defer or push back, point by point.
- **The cost of skipping it:** in the studio, a run passed every check and would have deleted about 190 pages; reading the change, not the checks, is what caught it ([the green run](../examples/green-run-that-would-have-deleted.md)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). A change is not called ready to merge until a reviewer that did not write it has read the diff and given a verdict.

## Detect

Read-only: names, descriptions, versions and counts, never a skill's or an agent's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The skill, at project and user level: `ls -d .claude/skills/requesting-code-review "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/requesting-code-review" 2>/dev/null`.
- The reviewer it would start: `ls .claude/agents/linus-reviewer.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/linus-reviewer.md" 2>/dev/null`, the name recorded for that seat in `adoption/decisions.md`, and any other reviewer agent or review skill. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- Git: `git --version`.

The menu marks the item **have** when a skill of this name exists at either level; **partly** when another review skill exists, or only a reviewer agent; and **not yet** otherwise.

## Ask

1. **"Take the review request skill?"** Recommended when your work is software, ML or data.
   - ADOPT the kit's copy, which starts the `linus-reviewer` agent by name. Recommended when Detect finds `linus-reviewer` under that name, or your plan takes it.
   - ADAPT it to the reviewer you have: your own reviewer agent by its name, or a general-purpose subagent given the same brief. Recommended when Detect finds no `linus-reviewer`, or you renamed it.
   - Keep the review skill you have. Recommended when Detect says **have** and you take no reviewer seat.
   - Skip.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"** (only when the answer above was ADOPT or ADAPT)
   - Every project: your user folder's `skills/`. Recommended, because the skill works the same in every repository.
   - This project only: `.claude/skills/` in the repository.
   - Not sure: every project, the recommended option.
   - Default when skipped: every project.

## Needs

- Claude Code: the skill starts a subagent. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), so this card has no claude.ai route.
- Git, from START-HERE's "Prepare".
- A reviewer: the [linus-reviewer](linus-reviewer.md) agent, your own reviewer agent, or a general-purpose subagent. A built-in subagent of that kind is not documented in docs/facts.md as of 2026-11-02; ask Claude in a session whether it has one before you choose it.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/skills/requesting-code-review/` (`SKILL.md` and the brief template `code-reviewer.md`): scans it with SkillSpector (`skillspector scan catalog/skills/requesting-code-review --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The maintainers' latest scan result is in the skill's `SOURCE.md`; your own scan is the one that decides.
2. **Claude:** writes it for your setup, and shows it to you before saving:
   - **the reviewer it starts:** ADOPT keeps `linus-reviewer`. ADAPT changes it in two places, step 2 of "How to ask" in `SKILL.md` and the `Subagent (...)` line at the top of `code-reviewer.md`: to your reviewer agent's name, or to a general-purpose subagent given the filled-in brief;
   - **the model note:** step 2 of "How to ask" cites the studio's agent rules file (`.claude/agents/AGENTS.md`), which the kit does not ship: your own model rule in a few words, or cut;
   - **the "Mandatory" list:** the studio's copy asks for a review after a task only when that task's review is switched on in [subagent-driven-development](subagent-driven-development.md), and at the end of every plan. If you do not take that skill, that first line keeps only "at the end of every plan"; "after a major feature" and "before a merge to your main branch" stay as they are;
   - **the temporary folder:** the brief's example for looking at another revision is a Unix path under `/tmp`; on Windows, name a temporary folder of yours;
   - **the metadata block:** its author line names the studio; Claude writes yours, and keeps the name and description;
   - **keep:** the brief template with its "Set-aside list", its read-only rule, its rule that the reviewer starts no subagents of its own, and the severity scale (Critical, Important, Minor).
3. **Claude:** saves the folder, `SKILL.md` and `code-reviewer.md`, at `~/.claude/skills/requesting-code-review/` or `.claude/skills/requesting-code-review/`, as you chose.
4. **Claude:** records the decision, the scope, the reviewer it starts and the undo in `adoption/decisions.md`.

## Check

1. The folder exists at the level you chose, with `SKILL.md` and `code-reviewer.md` in it.
2. **you:** in a new session, inside a repository with one small finished commit, say "request a code review of my last commit". Expected: Claude works out the first and last commit of the range, starts the reviewer subagent with the filled-in brief, and returns strengths, issues by Critical, Important and Minor with file and line, and "Ready to merge?" answered Yes, No or With fixes.
3. **you:** afterwards, the repository is as it was: same branch, nothing changed in the working tree.

If Claude reviews the diff in the main thread, or reports that the reviewer it names does not exist, the item is not done: the plan row stays unticked, and the reviewer name in step 2 of "How to ask" is the first thing to look at.

## Undo

- **Claude:** deletes the `requesting-code-review` folder from the level it went to.
- The reviewer agent stays; it has its own card and undo.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 49 tokens (its 107 bytes divided by 4, an estimate). Its instructions, about 754 tokens, and the brief template, about 1,624 tokens (estimates), load only when it runs.
- **Two copies answer the same request.** If you also have another skill that does the same job, both descriptions load and two skills fit "request a review". Keep one.
- **One review at the end, for routine work.** The studio stopped a run of near-identical implement-then-review rounds as too repetitive: the early, risky tasks had gained from their reviews, the later routine ones had not ([module 04, The mechanism](../modules/04-delegation/README.md#the-mechanism)). That is why its "Mandatory" list no longer says "after each task".
- **Two output formats can meet.** The brief asks for "Ready to merge?", while the `linus-reviewer` seat's own instructions ask for APPROVE or CHANGES REQUESTED. Which wins is not documented; pick one when you adapt, so every review reads the same.
- **The reviewer must leave your checkout alone.** Another session may be working in it. The brief says so; keep that rule when you adapt it.
- **Company rules:** the reviewer reads the whole diff, which is session content that Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where a reviewer's WebSearch and WebFetch requests go beyond that is not in docs/facts.md as of 2026-11-02. Check your data rules for that code, and your reviewer's tool list against them.
