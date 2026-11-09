---
id: subagent-driven-development
module: 04-delegation
checked: 2026-11-09
tokens:
  description: 63
  body: 4171
---

# Subagent-driven development

## Why

- **The problem:** one thread that builds a whole plan reads every file it touches and keeps them all, a long plan outgrows it and gets compacted, and while it grinds nobody plans the next step. The opposite failure is ceremony: a fresh builder, a spec reviewer and a quality reviewer for every routine task.
- **The reason:** a fresh builder subagent (a helper with its own context window) takes each task from a brief file cut from the plan. A ledger, a progress file in a git-ignored folder, records every finished task, so the run survives compaction. A review after a task runs only where the task is risky or under-specified, or on every task when you ask, and one review of the whole branch closes the run. The main thread answers the builder's questions, rules on conflicts and keeps deciding.
- **The cost of skipping it:** a 24-file sweep done by hand held the studio's main thread for about 30 minutes ([the sweep done by hand](../examples/sweep-done-by-hand.md)). The reverse, a reviewer after every routine task, was stopped mid-plan as repetitive: the early, risky tasks had gained from it, the later routine ones had not ([module 04, The mechanism](../modules/04-delegation/README.md#the-mechanism)).
- **The principle:** [delegate the mechanical, keep the decisions](../PRINCIPLES.md#delegate-the-mechanical-keep-the-decisions). A well-specified task needs one review at the end, not a ceremony per step.

## Detect

Read-only: names, descriptions, versions and counts. No skill or agent body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/subagent-driven-development/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/subagent-driven-development/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about running a plan through subagents.
- Agents for the two roles: file names in `.claude/agents/` and `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/"`, and the front matter of each, looking for one that builds and one that reviews (`bob-builder` and `linus-reviewer` by name).
- What it relies on, at both levels, folder names only (`test -d <level>/<name>`): `requesting-code-review` (whose `code-reviewer.md` briefs the final review), `using-git-worktrees`, `finishing-a-development-branch`, and `executing-plans`, which shares its scripts.
- bash, for its scripts: `bash --version | head -1`.
- A rule about subagent models or reviews in your instruction files: `grep -n -i -E 'subagent|model|review' CLAUDE.md AGENTS.md 2>/dev/null`.

The menu marks the item **have** when a `subagent-driven-development` skill exists at either level, **partly** when another skill does the job, and **not yet** otherwise.

## Ask

1. **"Take subagent-driven-development, and with which review default?"**
   - ADAPT with the kit's default: a task review only for risky or under-specified tasks, and one review of the whole branch at the end. Recommended when Detect says **not yet**. ADOPT as it is fits only when you also take the kit's two agents and share the studio's model rule.
   - ADAPT with a review after every task. Recommended when most of your plans touch security, money or data you cannot lose; Detect cannot see that, so Claude asks.
   - Keep what you have. Recommended when Detect says **have** or **partly**.
   - Run plans inline with [executing-plans](executing-plans.md) only: one context and one final review. Recommended when Detect finds no agents and your plans are short.
   - Not sure: the recommended option above for what Detect found: ADAPT with the kit's default when Detect says **not yet**. At the start of any plan you can still ask for a review on every task.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Who builds, and who reviews?"**
   - The kit's [bob-builder](bob-builder.md) and [linus-reviewer](linus-reviewer.md) agents. Recommended when you adopt them too.
   - Your own agents. Recommended when Detect finds a builder and a reviewer of yours.
   - No agent files: subagents briefed only with the skill's own prompt templates (`implementer-prompt.md`, `task-reviewer-prompt.md`). Recommended when Detect finds no agents.
   - Not sure: the recommended option above for what Detect found and your plan; the third option when none applies, and you can name agents later.
   - Default when skipped: the third option.
3. **"Where?"**
   - The scope where `executing-plans` is, because that skill's scripts call this skill's scripts in the folder beside it. Recommended when Detect finds it.
   - Every project, in `~/.claude/skills/`.
   - This project only, in the repository's `.claude/skills/`.
   - Not sure: the recommended option above when Detect finds `executing-plans`; otherwise this project only.
   - Default when skipped: this project only.

## Needs

- Claude Code with subagents. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"); module 04's claude.ai steps split work by hand ([module 04](../modules/04-delegation/README.md)).
- bash, for the three helper scripts. Windows: Git for Windows, `! winget install --id Git.Git -e --source winget`; macOS and Linux: check with `bash --version`. Without bash, the skill builds the review file from `git log` and `git diff` instead.
- git, and a test command for your project.
- The skills it calls, each with its own card: [requesting-code-review](requesting-code-review.md) for the final review's brief, [using-git-worktrees](using-git-worktrees.md), [finishing-a-development-branch](finishing-a-development-branch.md). Without one, step 2 points its line at yours or removes it.
- The agents from question 2, if you chose named ones.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit's copy, `catalog/skills/subagent-driven-development/`: scans it with SkillSpector (`skillspector scan catalog/skills/subagent-driven-development --no-llm`; on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows), triages each finding with you, and reads its three scripts itself (`scripts/sdd-workspace`, `task-brief`, `review-package`). They read the plan and the git history, write into the plan's workspace inside your repository, and send nothing out. The maintainers' latest scan result is in the skill's `SOURCE.md`; your own scan is the one that decides. Then it recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found.
2. **Claude:** on your yes, writes the copy into the scope you chose and rewrites for your setup:
   - the opening "Studio default" paragraph, which cites one of the studio's memory files, to one line of yours stating the review default from question 1. With a review after every task, the pre-flight's `Task reviews:` line becomes "every task";
   - "Model Selection", which cites the studio's agent rules file (`.claude/agents/AGENTS.md`) and names no model, so every subagent runs on the session's model unless `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"): your own model rule in one line, or a model chosen for each role;
   - the names `bob-builder` and `linus-reviewer`, in `SKILL.md`, the three prompt templates, `references/final-review.md` and `references/fix-loop.md`: your answer to question 2;
   - the line that hands the builder its worktree path and branch, which the studio's builder needs because it otherwise makes a worktree of its own: kept for a builder that does the same, dropped otherwise;
   - the author line in the front matter, which names the studio, to yours.

   Claude shows the result before it saves it.
3. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** inside one of your repositories, writes a one-task test plan to a temporary file outside it (a heading `### Task 1: check` and one line under it), then runs `bash <scope>/subagent-driven-development/scripts/task-brief <that file> 1`. Expected: `wrote <repo>/.studio-work/sdd/<plan name>/task-1-brief.md: <N> lines`, and `git status` shows nothing new, because the workspace ignores itself. Then Claude deletes the test plan and that workspace folder.
2. **you:** in a new session, say "execute the plan at <path> with subagents". Before it sends out Task 1, Claude creates `progress.md` in that plan's workspace, whose first line is `# SDD ledger — plan: <path>`, with a `Task reviews:` line naming the tasks that get a review, or none.

If either check fails, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes the `subagent-driven-development` folder from the scope it went into. If you keep [executing-plans](executing-plans.md), it first copies the three scripts into that skill, as its card describes.
- **Claude:** on your yes, deletes the `.studio-work/sdd/` workspaces of finished plans; they are git-ignored scratch, and the commits stay in your history.
- **Claude:** adds a row to `adoption/decisions.md` saying the item was removed.

## Watch out

- **Builders never run in parallel.** Two builders in one plan would change the same code; [dispatching-parallel-agents](dispatching-parallel-agents.md) is for independent investigations and fixes.
- **Rulings, not stalls.** It does not pause between tasks. It decides conflicts itself, writes each decision as a `Ruling:` line in the ledger, and stops only for an irreversible or destructive act, a security-sensitive one, a side effect outside the worktree such as a merge, a push to a shared branch or a publish, or a plan so broken that every way forward is a guess. Read the rulings at the end.
- **Which model the subagents use** is a choice. The kit's copy keeps every subagent on the session's own model, the studio's rule; you can choose a model for each role instead. A cheaper model per task saves tokens and gives weaker work nobody agreed to ([module 02](../modules/02-context-and-models/README.md)).
- **A builder must not start its own reviewer.** The skill's authors saw that duplicate a review on every task; the builder's prompt template forbids it.
- **The workspace is git-ignored,** ledger included, so a command that deletes ignored files deletes it too. `git clean -fdx` is meant to be one (its `-x`); what each `git clean` flag removes is not in docs/facts.md as of 2026-11-02, so read `git clean -h` before you run one. Recover the state from `git log`.
- **Windows needs Git Bash** for the scripts. Claude Code uses it for its shell tool when Git for Windows is installed, and PowerShell otherwise (docs/facts.md).
- **Cost:** its name and description load into every session, about 63 tokens (an estimate: their bytes divided by 4); the full skill, about 4,171 tokens (estimate), loads when it is used, with its templates and references as it reads them. Each task is also a fresh subagent that reads the code it needs from scratch.
