---
id: bob-builder
module: 08-agents-and-council
checked: 2026-11-02
---

# The builder

## Why

- **The problem:** one thread doing everything reads every file it touches into its own context, and while it grinds through an implementation, nobody plans the next step.
- **The reason:** this agent implements one planned task in a git worktree of its own (a second working folder on its own branch), test-first: a failing test, the least code that passes it, then a commit. It does exactly what the plan says, stops and asks when the plan is unclear, and returns a working branch, passing tests and a short note: what it changed and how it verified it. The main thread keeps the plan and the decisions.
- **The cost of skipping it:** the studio once did a 24-file sweep in the main thread for about half an hour, time in which the next step could have moved forward in parallel ([the sweep done by hand](../examples/sweep-done-by-hand.md)).
- **The principle:** [delegate the mechanical, keep the decisions](../PRINCIPLES.md#delegate-the-mechanical-keep-the-decisions). The builder does the planned, well-specified work; you and the main thread keep the plan.

## Detect

Read-only: names, descriptions, versions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The agent itself, at project and user level: `ls .claude/agents/bob-builder.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/bob-builder.md" 2>/dev/null`, and any other name recorded for it in `adoption/decisions.md`.
- Another agent or skill doing the same job: an implementer, an executor, a "build this task" agent. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- The skills that start it by name in the kit's copies, by folder name only: `ls -d .claude/skills/subagent-driven-development .claude/skills/writing-plans "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/subagent-driven-development "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/writing-plans 2>/dev/null`, and the same two in `adoption/plan.md`.
- For each repository in `adoption/inventory.md`, the branch it would start from:
  - `git --version`;
  - the remote names, without their addresses: `git -C <repo> remote`;
  - the remote's default branch, as the clone recorded it: `git -C <repo> symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null`. Claude shows what it prints; when it prints nothing, Claude asks you for the base branch. This command is not in docs/facts.md as of 2026-11-02.

The menu marks the item **have** when an agent file named `bob-builder`, or the name recorded for it, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise.

## Ask

1. **"Take the builder?"**
   - On its own: the implementer you hand one planned task to by name. Recommended when Detect says **not yet** and you write plans before you build ([writing-plans](writing-plans.md)).
   - As the implementer behind [subagent-driven-development](subagent-driven-development.md), which starts it by this name for each task in the kit's copy. Recommended when Detect finds that skill, in place or planned.
   - FOLD it into the implementer you already have: worktree first, test first, evidence before "done". Recommended when Detect says **partly**.
   - Skip. Recommended when your tasks are routine and you would rather the main thread implement them and one review run at the end, which module 04 calls the cheaper path for well-specified work.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"**
   - This project only: `.claude/agents/` in the repository. Recommended when your repositories differ in test command or main branch.
   - Every project: your user folder's `agents/`. Recommended when they all build and test the same way.
   - Not sure: the recommended option above for your repositories; this project, the narrower choice, when Claude cannot tell.
   - Default when skipped: this project.

## Needs

- Claude Code, for the agent as a subagent. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), so this card has no claude.ai route.
- Git with worktrees, from START-HERE's "Prepare". The minimum git version for worktrees is not documented in docs/facts.md as of 2026-11-02.
- A test command for the project, because it works test-first.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Optional, for the skills it reaches for: the kit's [tdd](tdd.md), [using-git-worktrees](using-git-worktrees.md), [executing-plans](executing-plans.md) and [verification-before-completion](verification-before-completion.md).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/bob-builder.md`: scans it with SkillSpector (`skillspector scan catalog/agents/bob-builder.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file carries the studio's stack and branch.
2. **Claude:** writes the agent in your words, and shows it to you before saving:
   - **the name:** if [subagent-driven-development](subagent-driven-development.md) will start it, keep `bob-builder`, or rename it and change the name there too (that card says where). Otherwise a plain role name such as `builder`. The file name and the `name:` line match;
   - **the description:** what it builds and what it returns, without the studio's name for its crew;
   - **where it works:** the kit's copy says "a worktree off origin/main, never the primary tree". It names the remote and branch Detect printed, and your folder for worktrees ([worktrees](worktrees.md)). A repository with no remote starts from its local main branch;
   - **the stack skills:** the studio's own skills for the stacks it builds on become yours, or the line is cut;
   - **the skills it reaches for:** four, for test-driven development, worktrees, executing a plan and verification. They point at the kit's `tdd`, `using-git-worktrees`, `executing-plans` and `verification-before-completion` if you take them; otherwise the steps stay in plain words and the names are cut;
   - **the test command:** yours, named in the file;
   - **keep:** the lens (exactly what the plan says, no more), the stop-and-ask rule, test first, and the output: the branch, the passing tests, and "what I changed, how I verified";
   - **the tools:** a producer's: it keeps Write and Edit with read, search, shell, web and Skill; the `tools:` line is an allowlist. No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `.claude/agents/<name>.md` or `~/.claude/agents/<name>.md`, as you chose.
4. **Claude:** records the decision, the name, the scope, the base branch and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `.claude/agents/<name>.md` or `~/.claude/agents/<name>.md`.
2. **you:** in a new session, in a repository with tests, say "use the <name> agent to implement <one small function> with a test". Expected: Claude starts that subagent; its report names the new branch and the worktree folder, shows a test that failed first and then passed, and ends with what it changed and how it verified it. The worktree folder it names exists, and your own checkout is still on the branch it was on.

If the work lands in your own checkout, or the report says "done" with no test result, the item is not done: the plan row stays unticked, and the "where it works" line is the first thing to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to.
- **Claude:** tells you which of your skills start it by name; until they are changed (their cards' Undo), they will not find an implementer.
- **you:** remove the worktrees and branches it made once you no longer need them, as the [worktrees](worktrees.md) card describes. Deleting a branch with unmerged work is your decision.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 55 tokens (its 218 bytes divided by 4, an estimate). Its instructions, about 302 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **It writes and commits.** Its commits carry whatever identity the repository is set to. If you sign commits with a GnuPG passphrase, the agent keeps it only for its cache time after the last use ([docs/facts.md](../docs/facts.md), "Git: signed commits and identity per folder"); once that runs out, signing asks for it again and nobody is there to type it, so a long run can stop there ([signed commits](signed-commits.md)).
- **Restraint.** For routine tasks from a detailed plan, the studio skips a fresh implementer plus reviewers for each one, and implements directly with one review at the end ([module 04, The mechanism](../modules/04-delegation/README.md#the-mechanism)).
- **"origin/main" is an assumption.** A repository whose main branch has another name, or that has no remote, needs its base named in the file, or the agent starts from the wrong place.
- **Linked folders in a worktree.** In the studio, a run in a worktree whose project folders were folder links saw them as empty; it passed every check and would have deleted about 190 pages ([the green run](../examples/green-run-that-would-have-deleted.md)). If your repository holds folder links, read the size of a worktree run's diff before you trust it.
- **The council lists it but calls it on no panel.** The kit's council names the builder in its crew, and no row of its panel table convenes it: a council advises, and the builder acts on what you decide. You start it by name, or through subagent-driven-development.
- **Company rules:** what it reads and writes is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where its WebSearch and WebFetch requests go beyond that is not in docs/facts.md as of 2026-11-02. Check your data rules for the code it works on, and take both web tools out of the `tools:` line, an allowlist ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), if they require it.
