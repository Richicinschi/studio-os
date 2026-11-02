---
id: worktrees
module: 06-git-and-guardrails
checked: 2026-11-02
---

# One worktree per parallel session

## Why

- **The problem:** two Claude sessions in one checkout share one branch and one set of files. When one switches branches, stashes (puts changes aside) or cleans, the other's files change under it, and its next commit lands on the wrong branch.
- **The reason:** a git worktree is a second working folder of the same repository, on a branch of its own. When each parallel session works in its own worktree, no session can move another's branch, and the rule "never switch branches, stash or clean where another session may be live" holds because of where each session works, not because anyone remembers it.
- **The cost of skipping it:** commits on the wrong branch, and changes that have to be found and moved by hand while the other session keeps working. The kit has no full story of it; the studio's one recorded case, a single line in its copy of the `using-git-worktrees` skill, is under Watch out.
- **The principle:** [one task, one branch, one PR, full history](../PRINCIPLES.md#one-task-one-branch-one-pr-full-history). Each piece of work keeps its own branch only if each session keeps its own folder.

## Detect

Read-only. Counts and set / not set only.

- For each repository in `adoption/inventory.md`, how many worktrees it has: `git -C <repo> worktree list | wc -l` (`1` means the main checkout only).
- Whether a worktree folder inside a repository is kept out of git, when one exists: `git -C <repo> check-ignore -q .worktrees && echo ignored || echo "not ignored"`, and the same for `worktrees`.
- Whether your instruction files carry a worktree rule, a count per file: `grep -ci worktree CLAUDE.md AGENTS.md 2>/dev/null` in your setup and in each repository.
- Whether the full routine is there: a skill folder named `using-git-worktrees` in `.claude/skills/` or in `~/.claude/skills/` (or under `$CLAUDE_CONFIG_DIR` when that is set), or the superpowers plugin in `claude plugin list`.

The menu marks the item **have** when an instruction file carries a worktree rule and every worktree folder inside a repository is ignored; **partly** when the skill is there but no instruction says when to use it, or when the rule is there but a worktree folder inside a repository is not ignored; and **not yet** otherwise.

## Ask

1. **"Do you run more than one Claude session, or a subagent that writes code, on the same repository at once?"** Recommended when your work is software, ML or data.
   - Keep what you have. Recommended when Detect says **have**.
   - Yes: add the rule, one worktree per parallel session. Recommended when Detect counts more than one worktree in a repository, or when you send subagents to write code ([module 04](../modules/04-delegation/README.md)).
   - Yes, and the full routine too: the rule plus the [using-git-worktrees](using-git-worktrees.md) skill, which creates each worktree, installs its dependencies and runs the tests before work starts.
   - No: one session per repository at a time, so there is nothing to add.
   - Not sure: the option recommended above for what Detect found: keep what you have at **have**; otherwise the rule only, a few lines with nothing installed.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where do the worktrees go?"** (only when the answer above was yes)
   - A folder beside the repository, outside it, one subfolder per branch, for example `<repo>-worktrees/<branch>`. Recommended when Detect finds no worktree folder inside a repository: nothing in it can be committed by mistake.
   - `.worktrees/` inside the repository, kept out of git by a `.gitignore` line. Recommended when Detect finds one there already, ignored.
   - Not sure: the option recommended above for what Detect found: beside the repository, or `.worktrees/` when one is there already, ignored.
   - Default when skipped: beside the repository.

## Needs

- Git, from START-HERE's "Prepare":
  - Windows: `! winget install --id Git.Git -e --source winget`;
  - macOS: `! xcode-select --install`;
  - Debian or Ubuntu: `! sudo apt install git`.
- The minimum git version for worktrees: not documented in docs/facts.md as of 2026-11-02.
- Nothing else beyond Claude Code.

## Steps

1. **Claude:** writes the rule into your front door (`AGENTS.md`, or `CLAUDE.md` if that is your only one), in your words, and shows it before saving. A starting point: "When another session may be working in this repository, do your work in a worktree of your own, in `<the folder you chose>`, on a new branch off the latest main branch. Never switch branches, stash, reset or clean in a checkout another session may be using, and remove only a worktree you made in this session."
2. **Claude:** if you chose `.worktrees/` inside a repository, checks that git ignores it with `git -C <repo> check-ignore -q .worktrees`. When it does not, Claude adds the line `.worktrees/` to that repository's `.gitignore` on your yes; you commit that change like any other.
3. **Claude:** when a parallel session needs a worktree, on your yes, fetches and branches off the latest main branch: `git -C <repo> fetch origin`, then `git -C <repo> worktree add -b <branch> <folder>/<branch> origin/main`, with your own remote and main branch names in place of `origin` and `main`. This makes a new branch starting at `origin/main`, checked out in the new folder; `-b` refuses a branch name that already exists ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees").
4. **you:** start the second session in that folder, from a new terminal rather than with `!` (which runs inside the current session): `cd <folder>/<branch>`, then `claude`. The worktree holds committed files only, so install the project's dependencies there first.
5. **Claude:** when the work has landed, removes the worktree it made: `git -C <repo> worktree remove <folder>/<branch>`. Git removes only a clean worktree, with no untracked files and no changes to tracked ones ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees"); if it refuses, Claude shows those files and asks you, and it never forces the removal. The routine for the end of a branch is [finishing-a-development-branch](finishing-a-development-branch.md).
6. **Claude:** says, once, that the full form of this practice is the [using-git-worktrees](using-git-worktrees.md) skill: it checks whether the session is already in a worktree, prefers a worktree tool the session offers, creates the worktree, installs dependencies and runs the tests before work starts. You take it through its own card when the rule alone is not enough.
7. **Claude:** records the decision, the folder you chose and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -ci worktree <your front door>`. Expected: `1` or more.
2. **you:** in a new session, in a throwaway repository in a temporary folder with one commit, say "Start a branch for a small change; another session is working in this checkout." Expected: Claude proposes a worktree in the folder you chose, not a branch switch here (a throwaway repository has no remote, so it branches off the local main branch). After your yes, `git -C <repo> worktree list | wc -l` prints one more than before, and `git -C <repo> branch --show-current` in the original checkout prints the branch it had before. Then Claude removes the check worktree and you delete the throwaway folder.

If Claude runs `git checkout` or `git switch` in the shared checkout instead, the item is not done: the plan row stays unticked, and the wording of the rule is the next thing to look at.

## Undo

- **Claude:** removes the rule from your front door.
- **Claude:** removes the `.worktrees/` line from a `.gitignore` it changed, once that folder is empty.
- **Claude:** removes each worktree it made, with `git worktree remove <path>`, only after `git -C <path> status --porcelain` prints nothing. A refused removal is shown to you, never forced.
- **you:** the branches stay; deleting them is a separate yes for each ([git-cleanup](git-cleanup.md) sorts them first).

## Watch out

- **A worktree holds committed files only.** Uncommitted plans, ignored folders, installed dependencies and build output stay in the main checkout. Install again in each worktree, and commit a plan before a session in another worktree needs it.
- **Never clean up a worktree you did not make.** Several sessions' worktrees can sit in one folder, so the path proves nothing about who owns it; only a worktree made in this session is yours to remove.
- **Links inside a worktree can fool a tool.** The studio ran a generator in a worktree whose project folders were links to the real ones (on Windows, junctions). The scanner walked into none of them, and a run that passed every check would have deleted about 190 pages ([the green run](../examples/green-run-that-would-have-deleted.md)). Look at the size of a change made in a worktree before you trust it.
- **The studio's own failure:** a quick branch switch in a shared checkout moved another live session's branch, and its commits landed on the wrong branch. That is the act the rule forbids.
- **Company repositories:** a worktree beside a company repository is a second full copy of its files. Keep it only where your company allows the repository itself.
- **Token cost:** the rule costs about 75 tokens in every session, an estimate (bytes divided by 4). Nothing else loads.
