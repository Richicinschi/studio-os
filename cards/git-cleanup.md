---
id: git-cleanup
module: 06-git-and-guardrails
checked: 2026-11-02
tokens:
  description: 46
  body: 2344
---

# Cleaning up stale branches

## Why

- **The problem:** one branch per task leaves many branches and worktrees behind. Telling the finished ones from live work is where work gets lost: a branch whose remote is gone may still hold commits that were never pushed, and a branch that was squash-merged (folded into one commit on the main branch) looks unmerged to git.
- **The reason:** this skill sorts branches into merged, superseded and active, with evidence for each, shows you the whole analysis, then the exact delete commands, and deletes only after your yes at both of those gates. It never touches the protected branches, and it refuses to remove a worktree with uncommitted changes unless you accept the loss.
- **The cost of skipping it:** the kit holds no story of a branch lost this way. Skipping it means stale branches stay, or get deleted by age or by name, which can take the only copy of work that was never pushed.
- **The principle:** [one task, one branch, one PR, full history](../PRINCIPLES.md#one-task-one-branch-one-pr-full-history). A branch per task stays cheap only if the finished ones can be cleared without losing an unfinished one.

## Detect

Read-only. Names of skills, counts of branches, never branch names; nothing is fetched.

- The skill: a skill named `git-cleanup`, or another whose description is about cleaning up branches or worktrees, at project level (`.claude/skills/`) or user level (`~/.claude/skills/`, or under `$CLAUDE_CONFIG_DIR` when that is set). Names and descriptions only.
- For each repository in `adoption/inventory.md`, counts only:
  - local branches: `git -C <repo> branch --format='%(refname:short)' | wc -l`;
  - branches already merged into the default branch: `git -C <repo> branch --merged <default branch> | wc -l` (the default branch itself counts as one);
  - worktrees: `git -C <repo> worktree list | wc -l` (the main checkout counts as one).
- Whether Claude has a Bash tool, since the skill's commands are bash, and whether a git guard blocks `git branch -D` ([git-guardrails](git-guardrails.md), Detect).

The menu marks the item **have** when `git-cleanup`, or a skill doing the same job that asks before each deletion, exists, **partly** when a cleanup skill or routine exists that deletes without asking first, and **not yet** otherwise.

## Ask

1. **"Take git-cleanup?"** Recommended when your work is software, ML or data.
   - ADOPT as it is. Recommended when Detect counts many merged branches or worktrees, Claude has Bash, and your long-lived branches are among `main`, `master`, `develop` and `release/*`.
   - ADAPT: your own protected branch names, and the commands rewritten for PowerShell when Claude has no Bash. Recommended when Detect found either.
   - FOLD: add its two gates and its rule of evidence to the cleanup routine you already have. Recommended when Detect found one.
   - No. Recommended when Detect counts few branches.
   - Not sure: the option recommended above for what Detect found: ADOPT, ADAPT or FOLD as the counts and your setup say, or no when Detect counts few branches.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not installed.
2. **"Where?"** (only when the answer above was ADOPT or ADAPT)
   - Every project (user level). Recommended when you keep several repositories.
   - This project only. Recommended when you keep one repository.
   - Not sure: the option recommended above: every project with several repositories, this project only with one.
   - Default when skipped: this project only.

## Needs

- Git, and a Bash tool for Claude. On Windows, Git for Windows brings it: `! winget install --id Git.Git -e --source winget`; without it Claude Code uses PowerShell ([docs/facts.md](../docs/facts.md)), and the commands need rewriting (ADAPT).
- An interactive session: it asks at its two gates with `AskUserQuestion`, a tool that a run with `--permission-prompts none` does not have ([docs/facts.md](../docs/facts.md)).
- Access to your remote: its first phase runs `git fetch --prune`.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/skills/git-cleanup/`: scans it with SkillSpector, triages, and recommends against what Detect found. The kit's own scan, with the build that reports SkillSpector 2.2.3 ([docs/facts.md](../docs/facts.md), "Installing SkillSpector"), rated it `SAFE` at 0/100; a newer version may score it differently.
2. **Claude:** on your yes, writes it to the place you chose (`.claude/skills/git-cleanup/` or `~/.claude/skills/git-cleanup/`), fitted:
   - `disable-model-invocation: true` stays, so it runs only when you type its name: Claude cannot start it on its own ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from");
   - the protected-branch pattern lists your long-lived branches;
   - the note at its top about `git-guardrails` stays, in your words, only if you have that guard, and says what you do with the deletions it blocks (Watch out);
   - for PowerShell, the bash loops are rewritten (ADAPT);
   - the upstream `LICENSE` stays beside it.
   It shows you the files before saving them.
3. **Claude:** records the decision, the place and the undo in `adoption/decisions.md`.

## Check

**you:** in a repository with at least one merged branch, type `/git-cleanup`. Expected: Claude gathers the branches and worktrees, shows one analysis grouped into categories (safe to delete, squash-merged, needs review, keep), and stops with a question about what to clean up. Answer that you want nothing deleted. Afterwards, Detect's branch count for that repository is unchanged.

If it deletes anything before your answer, or starts when you did not type its name, the item is not done: the plan row stays unticked, and Claude removes the skill.

## Undo

- **Claude:** deletes the skill's folder, and marks the row in `adoption/decisions.md` as undone.
- Branches it already deleted do not come back with the skill. The skill itself warns that git's reflog, the log a deleted branch can sometimes be recovered from, expires; treat each deletion as final.

## Watch out

- **With git-guardrails, its force deletions are blocked.** Squash-merged and superseded branches need `git branch -D`, which the guard refuses. Claude shows the exact commands at its second gate; you run the `-D` lines yourself, in your own terminal.
- **It talks to your remote.** Its first phase runs `git fetch --prune`, which contacts your server. What `--prune` removes is not in docs/facts.md as of 2026-11-02; read `git help fetch` before the first run if that matters to you.
- **Protected means four names.** It never touches `main`, `master`, `develop` or `release/*`; a long-lived branch with another name, such as `production`, can be offered for deletion until you add it.
- **Squash merges are found through PR numbers.** It looks for `#123`-style numbers in the default branch's log; where merge messages carry none, more branches land in "needs review".
- **Bash only, as shipped.** On Windows without Git for Windows, Claude has PowerShell, and the commands do not run as written.
- **One yes covers the list it was given.** It asks twice, the second time with the exact commands; read that list, since your yes covers what is on it ([module 06](../modules/06-git-and-guardrails/README.md#the-mechanism)).
- **Licence:** it is under Creative Commons Attribution-ShareAlike 4.0, as the `LICENSE` file in its kit folder states; that licence is not checked in docs/facts.md as of 2026-11-02. Keep the licence and the credit to its upstream with any copy, and read the licence before you share an adapted one.
- **Token cost:** none in a session where you do not run it: with `disable-model-invocation: true`, its description is not in context ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"). Its body, about 2,344 tokens (estimate, bytes divided by 4), loads each time you run it.
