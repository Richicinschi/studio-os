---
id: using-git-worktrees
module: 06-git-and-guardrails
checked: 2026-11-02
---

# using-git-worktrees

## Why

- **The problem:** parallel work in one checkout tangles. A branch switch, a stash or a clean in one session moves the files under another, and commits land on the wrong branch. Work started on a broken baseline is no better: every later test failure could be old or new.
- **The reason:** the skill makes isolation a routine. Before it creates anything, it checks whether the session is already in a worktree (a second working folder of the same repository, on its own branch) or in a submodule. It prefers a worktree tool the session offers, otherwise creates one with git, checks that a worktree folder inside the repository is ignored by git, installs the dependencies and runs the tests, so work starts from a known state.
- **The cost of skipping it:** commits on the wrong branch, moved by hand, and test failures nobody can place. The studio's copy of the skill records that a branch switch in a shared checkout once sent another live session's commits to the wrong branch; the kit has no longer story of it.
- **The principle:** [one task, one branch, one PR, full history](../PRINCIPLES.md#one-task-one-branch-one-pr-full-history). The skill gives each task its own branch in its own folder, which is what keeps parallel sessions from switching branches under each other.

## Detect

Read-only. Names, descriptions, counts and versions only; no skill body is opened.

- A skill of the same name: `.claude/skills/using-git-worktrees/SKILL.md` in each repository and in your setup, and `~/.claude/skills/using-git-worktrees/SKILL.md` (or the same under `$CLAUDE_CONFIG_DIR` when that is set). Where one exists, read its `name` and `description` only.
- Another skill doing the same job: the front matter of each skill (the lines between the first two `---`), searched for the word "worktree":
  `for f in .claude/skills/*/SKILL.md "$HOME"/.claude/skills/*/SKILL.md; do sed -n '2,/^---/p' "$f" | grep -qi worktree && echo "$f"; done`.
- The superpowers plugin, which carries the upstream version of this skill: `claude plugin list`, its `Version` and `Status`.
- A declared preference the skill would follow: `grep -ci worktree CLAUDE.md AGENTS.md 2>/dev/null` in your setup and each repository, a count.
- For each repository in `adoption/inventory.md`: the number of worktrees, `git -C <repo> worktree list | wc -l`; and, when a `.worktrees` folder exists, `git -C <repo> check-ignore -q .worktrees && echo ignored || echo "not ignored"`.
- Version: `git --version`.

The menu marks the item **have** when a skill of this name is present, in a project, in your user folder or through the enabled superpowers plugin; **partly** when another skill or an instruction-file rule covers worktrees without the full routine; and **not yet** otherwise.

## Ask

1. **"Take using-git-worktrees?"** Recommended when your work is software, ML or data.
   - ADAPT the studio's copy to your setup, with its studio-specific parts rewritten (step 2 below). Recommended when Detect says **not yet** or **partly** and you run parallel sessions, or subagents that write code, on one repository. ADOPT as it is is not offered: the copy names the studio's own rule files and checkout.
   - Keep the one you have: the superpowers plugin's upstream copy, or your own skill. Recommended when Detect says **have**.
   - FOLD: only the rule, in your front door ([one worktree per parallel session](worktrees.md)). Recommended when you rarely run two sessions on one repository.
   - SKIP.
   - Not sure: the option recommended above for what Detect found: keep the one you have at **have**; ADAPT when you run parallel sessions, or subagents that write code, on one repository; FOLD, the rule alone, when you rarely do.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where does it go?"** (only for ADAPT)
   - This project only: `<repo>/.claude/skills/using-git-worktrees/`. Recommended when one repository has the parallel work.
   - Every project: `~/.claude/skills/using-git-worktrees/`. Recommended when Detect counts worktrees in more than one repository.
   - Not sure: the option recommended above for what Detect found: this project only when one repository has the parallel work, every project when Detect counts worktrees in more than one.
   - Default when skipped: this project only.

## Needs

- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)); on Windows, `PYTHONUTF8=1` first ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").
- Git, from START-HERE's "Prepare":
  - Windows: `! winget install --id Git.Git -e --source winget`;
  - macOS: `! xcode-select --install`;
  - Debian or Ubuntu: `! sudo apt install git`.
  The minimum git version for worktrees: not documented in docs/facts.md as of 2026-11-02.
- A Bash shell for the skill's commands. On Windows, Git for Windows gives Claude Code one; without it, Claude Code uses PowerShell ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux"), and the commands need rewriting in step 2.
- Whatever your projects use to install and test (npm, cargo, pip or poetry, go): the skill runs them in each new worktree.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/using-git-worktrees/`: scans it with SkillSpector, triages the findings, compares it with what Detect found, and recommends SKIP, FOLD, ADAPT or ADOPT. It reads `VENDORED.md` beside the skill, which lists every change the studio made to superpowers 7.0.1. The studio's scan of the whole 7.0.1 release said `DO_NOT_INSTALL` at 100/100, mostly from false positives ([docs/facts.md](../docs/facts.md), "Installing superpowers"); the scan of this one folder is the one to read here.
2. **Claude:** on ADAPT, writes the skill into the place you chose, with the upstream `LICENSE` (MIT) beside it, and shows the diff before saving. It rewrites the studio-specific parts that `VENDORED.md` lists:
   - **The studio rule in the skill's step 0** (the studio's shared checkout is never touched, and work there always gets a worktree without asking): replaced by your own declared preference, for example "always make a worktree in this repository", or dropped, so the skill asks before it creates one, as upstream does.
   - **The worktree folder** (in a studio repository, a folder beside the repository, never `.worktrees/` inside it): replaced by the folder you chose on the [worktrees](worktrees.md) card, or dropped, which keeps upstream's lookup of `.worktrees/` and `worktrees/` and its `.worktrees/` default.
   - **Branching off `origin/main` after a fetch**: kept with your own remote and main branch names, or dropped, which goes back to upstream's branch off the current checkout.
   - **The "studio repo" row** in the quick reference, and the row about the shared checkout that cites the studio's own incident: reworded for your setup, or dropped.
   - **The front matter's author and sources**: your own, keeping the upstream source and its licence.
   - **The skill's setup commands (its step 2) and test commands (its step 3)**: only those your projects use, written for PowerShell if that is your shell.
3. **Claude:** if you want no question each time, adds one line to your front door that declares your preference and folder; the skill follows a declared preference without asking. It shows the line before saving.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`, with the scan result.

## Check

1. **Claude:** the file exists at `<scope>/.claude/skills/using-git-worktrees/SKILL.md`, with `LICENSE` beside it.
2. **you:** in a new session, in a throwaway repository in a temporary folder with one commit, say "Set up an isolated workspace for a branch called check-worktree." Expected: Claude says "I'm using the using-git-worktrees skill to set up an isolated workspace." (or the line you wrote in its place), runs the detection of step 0 first, asks before it creates the worktree unless your front door declares the preference (say yes), and ends with a report that starts "Worktree ready at" and names the worktree's folder: the one you chose, or the one a worktree tool of the session picked. Then Claude removes the check worktree and you delete the throwaway folder.

If Claude creates a branch in the current checkout instead, or skips the detection, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes the skill folder from the scope it went to: `<repo>/.claude/skills/using-git-worktrees/` or `~/.claude/skills/using-git-worktrees/`.
- **Claude:** removes the preference line from your front door, if step 3 added one.
- **Claude:** removes the `.worktrees/` line from a `.gitignore` the skill changed, once that folder is empty.
- **Claude:** removes each worktree the skill made, with `git worktree remove <path>`, only after `git -C <path> status --porcelain` prints nothing. Git removes only a clean worktree unless forced ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees"); a refused removal is shown to you, never forced. Branches stay until you delete them.

## Watch out

- **It commits on its own.** When a worktree folder inside the repository is not ignored, the skill adds it to `.gitignore` and commits that change before it goes on. In a company repository, decide in step 2 whether it asks you first.
- **It installs.** The skill's setup step runs your package manager in the new worktree, which downloads packages. Your company's rules on package sources apply there as anywhere.
- **A native tool comes first.** The skill uses a worktree tool the session offers before it falls back to git, and that tool decides where the worktree goes. Claude Code's own worktree support: not documented in docs/facts.md as of 2026-11-02.
- **A sandbox can cancel the isolation.** If creating the worktree fails with a permission error, the skill says so and works in the current folder instead. Read that message when it appears: the work is then not isolated.
- **A worktree holds committed files only, and links in it can fool a tool.** Uncommitted plans and ignored folders stay behind. The studio once ran a generator in a worktree whose project folders were links to the real ones; the scanner walked into none of them, and the run passed every check while it would have deleted about 190 pages ([the green run](../examples/green-run-that-would-have-deleted.md)).
- **Two copies, one job.** If you keep the superpowers plugin and add your own copy, both offer themselves for the same task; keep one.
- **Token cost:** the description loads in every session, about 50 tokens; the body, about 2,060 tokens, loads only when the skill is used. Both are estimates (bytes divided by 4).
