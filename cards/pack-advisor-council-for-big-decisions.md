---
id: pack-advisor-council-for-big-decisions
module: domains
checked: 2026-11-09
tokens:
  light: 49
  standard: 49
  full: 560
---

# Domain: a council of viewpoints for big decisions

## Why

- **The problem:** one model gives one view, shaped by how you framed the question, and asking the same thread for a second opinion gets the same view again. A big decision, such as a tool choice, a design or what to ship first, deserves someone whose whole job is to find what is wrong with it.
- **The reason:** this pack holds a `council` skill and eight seats, one lens each: founder, skeptic, designer, architect, counsel, treasurer, user advocate and operator. The council picks the seats that suit the question, runs them on the same context, and returns one brief: a line per seat, where they disagree, a recommendation, and the decision handed back to you.
- **The cost of skipping it:** a big decision gets one view, and nothing in that view argues back.
- **The principle:** [push back once, then do it](../PRINCIPLES.md#push-back-once-then-do-it). Each seat states its concern once, from its own lens; the brief shows the conflict instead of averaging it away, and the decision stays yours.

## Detect

Read-only: names, descriptions and counts, never a skill's or an agent's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The pack, the council skill and the seats, at project and user level: `ls -d .claude/skills/advisor-council-for-big-decisions .claude/skills/council .claude/agents "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/advisor-council-for-big-decisions "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/council "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents 2>/dev/null`.
- How many agent files exist at each level: `ls .claude/agents/*.md 2>/dev/null | wc -l` and `ls "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md 2>/dev/null | wc -l`.
- Another skill or agent that already runs a panel (a "board", "panel", "second opinion" or "debate" in its description). Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md .claude/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md 2>/dev/null`

The menu marks the domain **have** when the pack's folder and the `council` skill exist and at least three seats are in place; **partly** when only some of that is true, or another skill already runs a panel; and **not yet** otherwise.

## Ask

1. **"Does a decision of this weight come up in your work?"** Count the answer against your spec: a solo maker choosing a product, a price or a stack says yes; someone who never chooses between options says no.
   - Yes: take the pack. Recommended when your work in `adoption/spec.md` includes choices that cost weeks or money.
   - No: skip it. Recommended when it does not.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Which seats?"** (only on a yes)
   - All eight. About 540 tokens every session (estimate): the descriptions of the eight seats, about 60 each, and the entry. Recommended when your decisions touch money, design and law as well as strategy.
   - Three: the skeptic, the architect and the operator. About 190 tokens (estimate). Recommended for a first adoption.
   - Not sure: three.
   - Default when skipped: three.
3. **"Where?"**
   - This project only: `.claude/`. Recommended when your decisions concern one project.
   - Every project: your user folder. Recommended when you decide across several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- Claude Code. The council starts its seats as subagents. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), so claude.ai gets the council skill only, and you run the seats by hand.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/advisor-council-for-big-decisions/`: scans it with SkillSpector (`skillspector scan catalog/packs/advisor-council-for-big-decisions --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/advisor-council-for-big-decisions/`; `stubs/council/SKILL.md` to `<where>/skills/council/SKILL.md`; and the seats you chose from `agents/` to `<where>/agents/`. It shows the list first and saves on your yes.
3. **Claude:** records the decision, the seats, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, and each seat file you took is in `agents/`.
2. **you:** in a new session, say "convene the council on: should I <a small real decision>". Expected: Claude names the seats it picked and the ones it left out, starts the picked seats, and returns one line per seat, the conflicts, a recommendation, and the decision handed back to you.
3. If the answer comes in one voice without starting any seat, or names a seat you did not take, the item is not done: the plan row stays unticked, and the seat list is the first thing to look at.

## Undo

- **Claude:** deletes `advisor-council-for-big-decisions` and `council` from `skills/` and the seat files it copied from `agents/`.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Every seat's description loads every session.** All eight cost about 540 tokens (estimate) together with the entry; three cost about 190. The council's instructions load only when it runs.
- **A debate costs about seats times rounds.** Four seats over two rounds are eight subagent runs.
- **Parallel agents have a rate cost of their own.** Many seats at once can reach a session limit; a cap per round is cheap insurance.
- **A brief that reads like agreement has lost its point.** If it shows no conflict, ask for the disagreements again.
- **Company rules:** every seat gets the same context, and that context is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before a question names anything they keep inside.
