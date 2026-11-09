---
id: finishing-a-development-branch
module: 06-git-and-guardrails
checked: 2026-11-09
tokens:
  description: 33
  body: 1932
---

# finishing-a-development-branch

## Why

- **The problem:** at the end of a branch, an agent left to itself picks how the work lands. It merges into the base branch on its own, guesses the wrong base, offers to throw the work away, force-pushes after a rejected push, or removes a worktree that holds files nobody committed. Each of these is hard to take back.
- **The reason:** the skill ends every branch the same way. It runs the full test suite first and confirms the base branch, then offers a menu of two options: push and open a pull request (PR) that you merge, or keep the branch as it is. A local merge or a discard happens only when you ask for it in so many words, a discard only after you type `discard`, and it removes only a worktree it made in this session, never with `--force` on its own.
- **The cost of skipping it:** a merge made the wrong way loses history, and nothing brings it back. In the studio, 21 pull requests were merged with a squash during one migration, before the rule existed: each branch's commits were folded into one, and they were left as they are ([a recorded yes before a merge](../examples/grant-before-merge.md)).
- **The principle:** [one task, one branch, one PR, full history](../PRINCIPLES.md#one-task-one-branch-one-pr-full-history). The skill ends a task as a PR that you merge, in the way you chose, instead of a merge the agent made.

## Detect

Read-only. Names, descriptions, counts and versions only; no skill body is opened.

- A skill of the same name: `.claude/skills/finishing-a-development-branch/SKILL.md` in each repository and in your setup, and `~/.claude/skills/finishing-a-development-branch/SKILL.md` (or the same under `$CLAUDE_CONFIG_DIR` when that is set). Where one exists, read its `name` and `description` only.
- Another skill doing the same job: the front matter of each skill (the lines between the first two `---`), searched for "merge", "pull request" or "finish":
  `for f in .claude/skills/*/SKILL.md "$HOME"/.claude/skills/*/SKILL.md; do sed -n '2,/^---/p' "$f" | grep -qiE 'merge|pull request|finish' && echo "$f"; done`.
- Whether your instruction files say who merges, a count per file: `grep -ciw merge CLAUDE.md AGENTS.md identity/RELATIONSHIP.md 2>/dev/null`.
- Whether the GitHub command line is there: `gh --version` (it may not be installed). Each repository's remote host is already in `adoption/inventory.md`.

The menu marks the item **have** when a skill of this name is present, in a project or in your user folder; **partly** when another skill or an instruction-file rule covers the end of a branch; and **not yet** otherwise.

## Ask

1. **"Take finishing-a-development-branch?"** Recommended when your work is software, ML or data.
   - ADAPT the kit's copy to your setup, with its studio-specific parts rewritten (step 2 below). Recommended when Detect says **not yet** or **partly** and your work ends in PRs. ADOPT as it is is not offered: the copy names the studio's own rule files, ledger and checkout.
   - Keep the one you have: your own skill. If you also have another skill that does the same job, keep one. Recommended when Detect says **have** and you are content with its menu (see Watch out).
   - FOLD: one rule in your front door, such as "never merge on your own: push and open a PR, or keep the branch, and ask me which". Recommended when you finish branches rarely.
   - SKIP.
   - Not sure: the option recommended above for what Detect found: keep the one you have at **have**; ADAPT when your work ends in PRs; FOLD, the one rule, when you finish branches rarely.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Who merges, and how?"**
   - You merge every PR on the server, with a merge commit, which keeps every commit of the branch. Recommended when the inventory shows a remote host for your repositories.
   - Claude may also merge locally, with `git merge --no-ff` as the studio's copy does, when you ask for that branch by name. Recommended when a repository has no remote.
   - Your company's merge method, such as a squash, followed as policy. Recommended when your company sets one.
   - Not sure: the option recommended above for what Detect found: your company's method when it sets one; you merge every PR when the inventory shows a remote host; Claude may also merge locally, when you ask by branch name, in a repository with no remote.
   - Default when skipped: you merge every PR.
3. **"Where does it go?"** (only for ADAPT)
   - This project only: `<repo>/.claude/skills/finishing-a-development-branch/`. Recommended when Detect finds one repository with a remote, or none.
   - Every project: `~/.claude/skills/finishing-a-development-branch/`. Recommended when Detect finds more than one repository with a remote.
   - Not sure: the option recommended above for what Detect found.
   - Default when skipped: this project only.

## Needs

- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)); on Windows, `PYTHONUTF8=1` first ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").
- Git, from START-HERE's "Prepare":
  - Windows: `! winget install --id Git.Git -e --source winget`;
  - macOS: `! xcode-select --install`;
  - Debian or Ubuntu: `! sudo apt install git`.
- A Bash shell for the skill's commands. On Windows, Git for Windows gives Claude Code one; without it, Claude Code uses PowerShell ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux"), and the commands need rewriting in step 2.
- A test command for each project; the skill will not offer the menu until the suite passes.
- Optional: the `gh` command line, to open a PR on GitHub from the terminal. How to install it is not documented in docs/facts.md as of 2026-11-02, and `gh` serves GitHub only ([docs/facts.md](../docs/facts.md), "GitHub: merge methods"); without it, or on another host, you open the PR on your server's website after the push.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/finishing-a-development-branch/`: scans it with SkillSpector, triages the findings, compares it with what Detect found, and recommends SKIP, FOLD, ADAPT or ADOPT. The maintainers' latest scan result is in the skill's `SOURCE.md`; your own scan is the one that decides.
2. **Claude:** on ADAPT, writes the skill into the place you chose and shows the diff before saving. It rewrites the studio-specific parts:
   - **The studio rule in the skill's step 4** (merging is the person's act, through the PR, with a merge commit, citing the studio's rule numbers): replaced by your answer to question 2, in your words. If you allowed a local merge, it goes back on the menu as an option.
   - **The local-merge section** (only on an explicit ask, after a row in the studio's own ledger, never in the studio's shared checkout): the explicit ask stays; the ledger becomes yours ([the grant ledger](grant-ledger.md)) or is dropped; the shared-checkout sentence names your own shared checkout, or is dropped.
   - **The cleanup in the skill's step 6** (a worktree is yours only if this session made it, because the studio's worktrees share one folder): kept, with your worktree folder named ([worktrees](worktrees.md)).
   - **The signed commit** made when files are saved before a cleanup: kept only if you sign ([signed commits](signed-commits.md)); otherwise a plain commit.
   - **The force-push row** that points at the studio's ledger: points at your yes-list or ledger.
   - **Tests and PRs**: your test command; your server's command line, or the link it prints on a push.
   - **The front matter's author**: your own.
3. **Claude:** records the decision, who merges and how, the scope and the undo in `adoption/decisions.md`, with the scan result.

## Check

1. **Claude:** the file exists at `<scope>/.claude/skills/finishing-a-development-branch/SKILL.md`.
2. **you:** in a new session, on a finished branch in one of your repositories whose tests pass, say "I'm done with this branch; finish it." Expected: Claude says "I'm using the finishing-a-development-branch skill to complete this work." (or the line you wrote in its place), runs the test suite first, confirms the base branch, and shows a menu with exactly the options you chose, with no merge unless question 2 put one there. Answer "keep the branch": nothing changes.

If the menu offers a merge you did not choose, or Claude acts before you answer, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes the skill folder from the scope it went to: `<repo>/.claude/skills/finishing-a-development-branch/` or `~/.claude/skills/finishing-a-development-branch/`.
- The skill changes no settings, so nothing else needs undoing.
- **you:** a PR it opened stays on the server until you merge or close it.

## Watch out

- **"Get rid of it" is not a discard.** Only the typed word `discard` lets the skill delete the branch, its commits and its worktree.
- **A refused worktree removal means unsaved files.** They exist nowhere else, and `--force` would destroy them; the skill shows them and asks what to do.
- **A rejected push is not a reason to force-push.** It means the server moved. The skill investigates, and force-pushes only on your explicit ask for that push ([the grant ledger](grant-ledger.md)).
- **Your company's merge rule comes first.** If your company squashes by policy, follow it, and record that as your decision.
- **Token cost:** the description loads in every session, about 30 tokens; the body, about 2,300 tokens, loads only when the skill is used. Both are estimates (bytes divided by 4).
