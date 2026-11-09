---
id: executing-plans
module: 03-planning
checked: 2026-11-09
tokens:
  description: 53
  body: 4127
---

# Executing a plan inline, with a ledger

## Why

- **The problem:** a written plan still has to survive the session that carries it out. A long job outgrows one context, the conversation is compacted, and a session that has lost its place repeats work or skips it.
- **The reason:** executing-plans has Claude carry out the plan itself, task by task, in the session you start it in (a fresh one is best). Each task starts from a brief cut from the plan, follows its test-first steps, and is recorded in a ledger, a progress file in a git-ignored folder, only when its tests pass. After a compaction Claude trusts the ledger and `git log` over its own memory. One fresh reviewer reads the whole branch at the end.
- **The cost of skipping it:** the kit holds no story of its own for this. The skill's authors name the failure it prevents: after a compaction, a session that lost its place re-implements tasks whose commits already exist.
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). The ledger, not the conversation, says which tasks are done.

## Detect

Read-only: names, descriptions, versions and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/executing-plans/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/executing-plans/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about executing or implementing a plan.
- What it relies on, at both levels, folder names only (`test -d <level>/<name>`): `subagent-driven-development` (whose `scripts/` it calls), `requesting-code-review` (whose `code-reviewer.md` briefs the final review), `tdd`, `diagnosing-bugs`, `verification-before-completion`, `using-git-worktrees`, `finishing-a-development-branch`.
- A reviewer agent: `ls .claude/agents/ "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/" 2>/dev/null`, file names only, looking for `linus-reviewer.md` or your own reviewer.
- bash, for its scripts: `bash --version | head -1`.

The menu marks the item **have** when an `executing-plans` skill exists at either level, **partly** when the skill is there but `subagent-driven-development/scripts/` is not beside it, or when another skill does the job, and **not yet** otherwise.

## Ask

1. **"Take executing-plans?"**
   - Keep what you have. Recommended when Detect says **have**.
   - ADAPT the kit's copy: your reviewer, your model rule, and the names of the skills it calls. Recommended when Detect says **not yet**.
   - Run plans through [subagent-driven-development](subagent-driven-development.md) only: a fresh subagent per task instead of one context. Recommended when you want a review gate on tasks, or your plans are long.
   - SKIP: you do not run multi-task plans.
   - Not sure: the recommended option above for what Detect found: ADAPT when Detect says **not yet**, with each change shown before it is saved.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Who reviews the whole branch at the end?"**
   - The kit's [linus-reviewer](linus-reviewer.md) agent. Recommended when you adopt it, or Detect finds it.
   - Your own reviewer agent. Recommended when Detect finds one.
   - A fresh subagent briefed with `code-reviewer.md` from [requesting-code-review](requesting-code-review.md), with no agent file of its own. Recommended when you have no reviewer agent.
   - Claude reviews its own work, the skill's path without a subagent tool. It records that this is weaker, and tells you so.
   - Not sure: the recommended option above for what Detect found and your plan: the kit's agent if you take it, your own reviewer if Detect finds one, otherwise a fresh subagent with `code-reviewer.md`.
   - Default when skipped: a fresh subagent with `code-reviewer.md`.
3. **"Where?"**
   - The scope where `subagent-driven-development` is, because this skill's scripts call that skill's scripts in the folder beside it. Recommended when Detect finds it.
   - Every project, in `~/.claude/skills/`.
   - This project only, in the repository's `.claude/skills/`.
   - Not sure: the recommended option above when Detect finds `subagent-driven-development`; otherwise this project only.
   - Default when skipped: this project only.

## Needs

- Claude Code; a subagent for the final review is optional.
- bash, for its scripts. Windows: Git for Windows, `! winget install --id Git.Git -e --source winget`; macOS and Linux: check with `bash --version`.
- git, and a test command for your project, which each task's last step runs.
- [subagent-driven-development](subagent-driven-development.md)'s three helper scripts, `sdd-workspace`, `task-brief` and `review-package`. Step 2 copies them in if you do not take that skill.
- The skills it calls, each with its own card: [requesting-code-review](requesting-code-review.md), [tdd](tdd.md), [diagnosing-bugs](diagnosing-bugs.md), [verification-before-completion](verification-before-completion.md), [using-git-worktrees](using-git-worktrees.md), [finishing-a-development-branch](finishing-a-development-branch.md). Without one, step 2 points its line at yours or removes it.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit's copy, `catalog/skills/executing-plans/`: scans it with SkillSpector (`skillspector scan catalog/skills/executing-plans --no-llm`; on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows), triages each finding with you, and reads `scripts/task-start` and `scripts/task-done` itself. They run git and your test command, write into the plan's workspace inside your repository, and send nothing out. The maintainers' latest scan result is in the skill's `SOURCE.md` ("Last scan"); your own scan is the one that decides. Then it recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found.
2. **Claude:** on your yes, writes the copy into the scope you chose and rewrites for your setup:
   - the author line in the front matter, which names the studio, to yours;
   - "Final Review": the copy dispatches `linus-reviewer` with no model named, so it runs on the session's model unless `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), citing the studio's agent rules file (`.claude/agents/AGENTS.md`). Claude puts your answer to question 2 there, and your own model rule in one line, or none;
   - the skills it calls (`tdd`, `diagnosing-bugs`, `verification-before-completion`, `using-git-worktrees`, `finishing-a-development-branch`, `requesting-code-review`): each kept, renamed to yours, or removed with the line that calls it;
   - the pointer to `../using-agent-skills/references/claude-code-tools.md`: dropped unless you have that file;
   - when you do not take subagent-driven-development: its three helper scripts copied into this skill's `scripts/` folder, with the paths in `task-start`, `task-done` and `SKILL.md` changed to match.

   Claude shows the result before it saves it.
3. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** inside one of your repositories, writes a one-task test plan to a temporary file outside it (a heading `### Task 1: check` and one line under it), then runs `bash <scope>/executing-plans/scripts/task-start <that file> 1`. Expected, two lines: `brief: <repo>/.studio-work/sdd/<plan name>/task-1-brief.md` and `base: <the commit id of HEAD>`. `git status` shows nothing new, because the workspace ignores itself. Then Claude deletes the test plan and that workspace folder.
2. **you:** in a new session, say "execute the plan at <path> inline". Before Task 1, Claude creates `progress.md` in that plan's workspace, whose first line is `# SDD ledger — plan: <path>`.

If either check fails, the item is not done: the plan row stays unticked. An error naming `subagent-driven-development/scripts` means the scripts are not where `task-start` looks for them.

## Undo

- **Claude:** deletes the `executing-plans` folder from the scope it went into, with any scripts step 2 copied in.
- **Claude:** on your yes, deletes the `.studio-work/sdd/` workspaces of finished plans; they are git-ignored scratch, and the commits stay in your history.
- **Claude:** adds a row to `adoption/decisions.md` saying the item was removed.

## Watch out

- **It does not stop to check in.** It runs every task without asking "should I continue?". Four things stop it: an irreversible or destructive act, a security-sensitive one, a side effect outside the worktree such as a merge, a push to a shared branch or a publish, and a plan so broken that every way forward is a guess. Everything else it decides, records as a `Ruling:` line, and lists for you at the end under "Rulings I made". Read that list.
- **Not on your main branch.** It works in an isolated worktree and does not start on `main` or `master` without your explicit yes.
- **Windows needs Git Bash** for the scripts. Claude Code uses it for its shell tool when Git for Windows is installed, and PowerShell otherwise (docs/facts.md).
- **The workspace is git-ignored,** ledger included, so a command that deletes ignored files deletes it too. `git clean -fdx` is meant to be one (its `-x`); what each `git clean` flag removes is not in docs/facts.md as of 2026-11-02, so read `git clean -h` before you run one. Recover the state from `git log`.
- **Long plans:** the last tasks run on a compacted context. The skill itself prefers [subagent-driven-development](subagent-driven-development.md) when a plan is long, or when you want a review after each task.
- **Start it in a fresh session** when you want a clean context: it runs in whichever session invokes it.
- **Cost:** its name and description load into every session, about 53 tokens (an estimate, bytes divided by 4); the full skill, about 4,500 tokens (estimate), loads only when it is used.
