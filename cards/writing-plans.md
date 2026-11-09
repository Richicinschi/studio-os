---
id: writing-plans
module: 03-planning
checked: 2026-11-09
tokens:
  description: 49
  body: 2537
---

# Writing plans from an approved design

## Why

- **The problem:** an approved design is still one big step. Without a written breakdown, a multi-step job lives in the conversation, nobody can see which parts are done, and the next session cannot pick it up.
- **The reason:** writing-plans turns an approved spec into small tasks for a builder who has never seen the code. Each task names its exact files and interfaces, and its steps run in order: write the failing test, watch it fail, write the code, watch it pass, commit, with every command followed by the output that means it passed. A self-review checks the plan against the spec before you read it.
- **The cost of skipping it:** the kit holds no story of a lost plan. Skipping it means the job's state is only in the chat, and instructions given only in the conversation can be lost when it is compacted ([docs/facts.md](../docs/facts.md), "Claude Code: context commands, subagents, extra folders").
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). The plan is a file any later session reads, ticks and resumes from.

## Detect

Read-only: names, descriptions, settings as set or not set, and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/writing-plans/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/writing-plans/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about implementation plans or task lists.
- Where plans live today, counts only: `ls docs/plans/*.md plans/*.md 2>/dev/null | wc -l`, and any plan-folder rule in `CLAUDE.md` or `AGENTS.md`.
- The agents its execution menu names: `ls .claude/agents/ "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/" 2>/dev/null`, file names only, looking for `bob-builder.md`, `linus-reviewer.md`, or your own builder and reviewer.
- Whether you sign commits: `git config --get commit.gpgsign` in each repository (`true`, or nothing).

The menu marks the item **have** when a `writing-plans` skill exists at either level, **partly** when another planning skill or an instruction-file rule covers the job, and **not yet** otherwise.

## Ask

1. **"Take writing-plans?"**
   - Keep what you have. Recommended when Detect says **have**.
   - ADAPT the kit's copy: your plan folder, your agents in its execution menu, and a commit line that matches whether you sign. Recommended when Detect says **not yet**. ADOPT as it is fits only when Detect finds both kit agents and `commit.gpgsign` set to `true`.
   - FOLD the idea into what you have: one rule in your `CLAUDE.md`, "for multi-step work, write a plan file with one checkbox per step, each with the command that proves it". Recommended when Detect says **partly**.
   - SKIP: your work rarely runs past one sitting.
   - Not sure: the option recommended above for what Detect found: keep what you have for **have**, ADAPT for **not yet**, FOLD for **partly**. Claude shows each change before it saves it.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where?"**
   - Every project, in `~/.claude/skills/`. Recommended when you plan work in more than one repository.
   - This project only, in the repository's `.claude/skills/`.
   - Not sure: the option recommended above: every project when you plan work in more than one repository, otherwise this project only. You can move it later.
   - Default when skipped: this project only.

## Needs

- Nothing beyond Claude Code to write a plan.
- git, for the commit step in each task.
- Something to carry the plan out: [executing-plans](executing-plans.md) or [subagent-driven-development](subagent-driven-development.md). Optional: without either, you hand the plan to a session yourself.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit's copy, `catalog/skills/writing-plans/`: scans it with SkillSpector (`skillspector scan catalog/skills/writing-plans --no-llm`; on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows) and triages each finding with you. It is one prose file with no scripts. The maintainers' latest scan result is in the skill's `SOURCE.md` ("Last scan"); your own scan is the one that decides. Then it recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found.
2. **Claude:** on your yes, writes the copy into the scope you chose and rewrites for your setup:
   - the author line in the front matter, which names the studio, to yours;
   - "Save plans to": the copy uses `docs/plans/YYYY-MM-DD-<feature-name>.md`; Claude puts your folder there, or keeps that one;
   - the execution menu at the end, which names the kit's `bob-builder` (a builder subagent per task) and `linus-reviewer` (one reviewer at the end): your own agents' names, or the two roles described without names. If you take neither executor skill, the menu and the plan header's "REQUIRED SUB-SKILL" line say instead that the plan is handed back to you;
   - the commit step, `git commit -S -m ...`, which signs: Claude keeps `-S` when you sign ([signed commits](signed-commits.md)) and drops it when you do not, because a signing commit fails without a key;
   - the line that sends worktree setup to `using-git-worktrees`: kept if you take [using-git-worktrees](using-git-worktrees.md), dropped otherwise.

   Claude shows the result before it saves it.
3. **Claude:** adds one line to your front door (`CLAUDE.md` or `AGENTS.md`) saying where plans live, so every session finds them. It shows the line first.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file is in place: `test -f <scope>/writing-plans/SKILL.md && echo present` prints `present`, where `<scope>` is the repository's `.claude/skills` or `~/.claude/skills`.
2. **you:** in a new session, with an approved spec or design document, say "write the plan for <its path>". Claude starts with "I'm using the writing-plans skill to create the implementation plan.", saves a file in your plan folder whose header names the Goal, Architecture, Tech Stack and Spec, and writes tasks whose steps are `- [ ]` checkboxes, each command followed by an `Expected:` line. It ends by giving you the path and asking you to review the plan.

If either check fails, the item is not done: the plan row stays unticked. A skill of the same name in your user folder wins over a project copy (docs/facts.md), so check which copy answered.

## Undo

- **Claude:** deletes the `writing-plans` folder from the scope it went into, and the plan-folder line from your front door.
- **Claude:** adds a row to `adoption/decisions.md` saying the item was removed.
- The plans it wrote stay; they are yours.

## Watch out

- **Tick as you go.** A plan is only a record if its boxes are ticked as each step lands. When the studio's wiki generator read its plans back, not one of 187 had every box ticked ([module 03](../modules/03-planning/README.md)).
- **A plan can turn into the code.** Its self-review compares the plan's length with the spec's; a plan several times longer than the spec is a transcript of the program, not a plan. Trim it to signatures, test names and assertions.
- **Signing:** with `-S` left in and no signing key, every commit step fails. Decide in step 2.
- **Models:** the kit's copy leaves the model to the session, following the studio's rule that subagents keep the session's model ([module 02](../modules/02-context-and-models/README.md)). Choose your own rule.
- **Company repositories:** a plan committed to `docs/` stays in the repository's history. Ask whether your company wants plans there before the first commit.
- **Cost:** its description loads into every session, about 49 tokens (an estimate, bytes divided by 4, description only, as on the other cards); the full skill, about 2,600 tokens (estimate), loads only when it is used.
- **Where specs come from:** [brainstorming](brainstorming.md) (the lighter design conversation) and [drill-to-plan](drill-to-plan.md) (the heavier interview) both end in an approved spec for this skill.
