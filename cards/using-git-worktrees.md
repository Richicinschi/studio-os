---
id: using-git-worktrees
module: 06-git-and-guardrails
checked: 2026-11-18
tokens:
  description: 57
  body: 1637
---

# using-git-worktrees

## Why

- **The problem:** parallel work in one checkout tangles. A branch switch, a stash or a clean in one session moves the files under another, and commits land on the wrong branch. Work started on a broken baseline is no better: every later test failure could be old or new.
- **The reason:** the skill makes isolation a routine. Before it creates anything, it checks whether the session is already in a worktree (a second working folder of the same repository, on its own branch) or in a submodule. It prefers a worktree tool the session offers, otherwise creates one with git, checks that a worktree folder inside the repository is ignored by git, installs the dependencies and runs the tests, so work starts from a known state.
- **The cost of skipping it:** commits on the wrong branch, moved by hand, and test failures nobody can place. The studio's skill records that a branch switch in a shared checkout once sent another live session's commits to the wrong branch; the kit has no longer story of it.
- **The principle:** [one task, one branch, one PR, full history](../PRINCIPLES.md#one-task-one-branch-one-pr-full-history). The skill gives each task its own branch in its own folder, which is what keeps parallel sessions from switching branches under each other.

## Detect

Read-only. Names, descriptions, counts and versions only; no skill body is opened.

- A skill of the same name: `.claude/skills/using-git-worktrees/SKILL.md` in each repository and in your setup, and `~/.claude/skills/using-git-worktrees/SKILL.md` (or the same under `$CLAUDE_CONFIG_DIR` when that is set). Where one exists, read its `name` and `description` only.
- Another skill doing the same job: the front matter of each skill (the lines between the first two `---`), searched for the word "worktree":
  `for f in .claude/skills/*/SKILL.md "$HOME"/.claude/skills/*/SKILL.md; do sed -n '2,/^---/p' "$f" | grep -qi worktree && echo "$f"; done`.
- A declared preference the skill would follow: `grep -ci worktree CLAUDE.md AGENTS.md 2>/dev/null` in your setup and each repository, a count.
- For each repository in `adoption/inventory.md`: the number of worktrees, `git -C <repo> worktree list | wc -l`; and, when a `.worktrees` folder exists, `git -C <repo> check-ignore -q .worktrees && echo ignored || echo "not ignored"`.
- Version: `git --version`.
- A skill of the same name from a plugin enabled here: run from the project folder, `claude plugin list --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let l;try{l=JSON.parse(s)}catch{}if(!Array.isArray(l))return console.log("plugin check could not run");for(const p of l){const r=p.readFromFolder||p.installPath,f=r&&require("path").join(r,process.argv[1]);if(p.enabled&&f&&require("fs").existsSync(f))console.log(p.id,f)}})' skills/using-git-worktrees/SKILL.md` prints the plugin's id and the path of each copy, and nothing else. `claude plugin list` reports which plugins are enabled for the current folder and the folder each one loads from, so a disabled plugin, a plugin installed for another repository and an old version left after an update do not count. When it prints `plugin check could not run` or an error such as `claude: command not found`, Detect says the plugin check could not run, and the item gets no plugin mark ([docs/facts.md](../docs/facts.md), "Claude Code: installed plugins and their skills").

The menu marks the item **have** when a skill of this name is present, in a project or in your user folder; **partly** when another skill or an instruction-file rule covers worktrees without the full routine; and **not yet** otherwise. When nothing marks it **have** and that plugin line prints a copy, the menu says **a plugin provides one** instead of **not yet**, or **partly (a plugin provides one)** instead of **partly**, so what is missing stays in view, and it does not offer the kit's copy as a second.

## Ask

1. **"Take using-git-worktrees?"** Recommended when your work is software, ML or data.
   - ADAPT the studio's copy to your setup, with its studio-specific parts rewritten (step 2 below). Recommended when Detect says **not yet** or **partly** and you run parallel sessions, or subagents that write code, on one repository. ADOPT as it is is not offered: the copy names the studio's own rule files and checkout.
   - Keep the one you have: your own skill. Recommended when Detect says **have**.
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
  The minimum git version: 2.28. The skill runs `git branch --show-current`, which came with git 2.22. This card's cleanup runs `git worktree remove`, which came with 2.17, and its check makes a throwaway repository with `git init -b`, which came with 2.28 ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees").
- A Bash shell for the skill's commands. On Windows, Git for Windows gives Claude Code one; without it, Claude Code uses PowerShell ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux"), and the commands need rewriting in step 2.
- Whatever your projects use to install and test (npm, cargo, pip or poetry, go): the skill runs them in each new worktree.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/using-git-worktrees/`: scans it with SkillSpector, triages the findings, compares it with what Detect found, and recommends SKIP, FOLD, ADAPT or ADOPT. The kit's maintainers' latest scan result is in `catalog/skills/using-git-worktrees/SOURCE.md`; your own scan is the one that decides.
2. **Claude:** on ADAPT, writes the skill into the place you chose and shows the diff before saving. It rewrites the studio-specific parts:
   - **The "A shared checkout" section** (a checkout your instructions call shared by several live sessions is never touched, and work for it always gets a worktree without asking): kept if your instructions name such a checkout; otherwise replaced by your own declared preference, for example "always make a worktree in this repository", or dropped, so the skill asks before it creates one, as its consent step already does.
   - **The worktree folder** (in the skill's step 4; in a studio repository, a folder beside the repository, never `.worktrees/` inside it): replaced by the folder you chose on the [worktrees](worktrees.md) card, or dropped, which keeps the skill's lookup of an existing `.worktrees/` or `worktrees/` and its `.worktrees/` default.
   - **Branching off `origin/main` after a fetch**: kept with your own remote and main branch names, or dropped, which goes back to a branch off the current checkout. When kept, the skill's `git worktree add --no-track -b <branch> <path> origin/main` keeps `--no-track`: without it the new branch tracks `origin/main`, and a plain `git push` from it can go to main ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees").
   - **The "Studio repo" row** in the quick lookup, and the row in "Excuses that fail" about the shared checkout that cites the studio's own incident: reworded for your setup, or dropped.
   - **The front matter's author**: your own.
   - **The skill's setup commands (its step 5) and test commands (its step 6)**: only those your projects use, written for PowerShell if that is your shell.
3. **Claude:** if you want no question each time, adds one line to your front door that declares your preference and folder; the skill follows a declared preference without asking. It shows the line before saving.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`, with the scan result.

## Check

1. **Claude:** the file exists at `<scope>/.claude/skills/using-git-worktrees/SKILL.md`.
2. **you:** make a throwaway repository with a remote, in a temporary folder: `git init --bare -b main origin.git`, then `git clone origin.git repo`, then `git -C repo config user.name throwaway`, `git -C repo config user.email canary@example.invalid` and `git -C repo config commit.gpgsign false`, so your own name, address and signing take no part, then in `repo` one commit holding a `.gitignore` with the line `.env`, then `git -C repo push origin main`.
3. **you:** in a new session in `repo`, say "Set up an isolated workspace for a branch called check-worktree." Expected: Claude says it is running the using-git-worktrees skill and preparing an isolated workspace (or the line you wrote in its place), runs the detection of its step 1 first, asks before it creates the worktree unless your front door declares the preference (say yes), and ends with a report that starts "Worktree ready at" and names the worktree's folder: the one you chose, or the one a worktree tool of the session picked. When it used git rather than a worktree tool, `git -C <path> status -sb`, with `<path>` that folder, prints `## check-worktree` with no `...origin/main` after it: the branch has no upstream.
4. **you:** create an ignored file in the check worktree, `echo KEY=x > <path>/.env`, close every terminal open inside it, then say "Remove the check worktree." Expected: before removing, Claude runs `git -C <path> status --porcelain --ignored`, names `.env` (the line `!! .env`) and asks you what happens to it. Answer "delete it"; Claude removes the check worktree, and you delete the throwaway folder.

If Claude creates a branch in the current checkout instead, or skips the detection, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes the skill folder from the scope it went to: `<repo>/.claude/skills/using-git-worktrees/` or `~/.claude/skills/using-git-worktrees/`.
- **Claude:** removes the preference line from your front door, if step 3 added one.
- **Claude:** removes the `.worktrees/` line from a `.gitignore` the skill changed, once that folder is empty.
- **Claude:** removes each worktree the skill made, with `git worktree remove <path>`, only after `git -C <path> status --porcelain` prints nothing and you have answered for each ignored file that `git -C <path> status --porcelain --ignored` lists. The removal deletes ignored files without a word, and plain `status --porcelain` does not list them; dependency folders (`node_modules/`, `.venv/`, `venv/`, `build/`, `dist/`, `.dart_tool/`) come back with an install or a build, while anything else (`.env`, results, logs, local data) exists only there, so Claude names it and asks whether to move it out first.
- **Claude:** starts a removal only once every session and terminal inside the worktree is closed. Git removes only a clean worktree unless forced ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees"); a refused removal is shown to you, never forced. On Windows, a removal that reports "failed to delete" has already unregistered the worktree; you delete the leftover folder by hand after closing what holds it. Branches stay until you delete them.

## Watch out

- **It commits on its own.** When a worktree folder inside the repository is not ignored, the skill adds it to `.gitignore` and commits that change before it goes on. In a company repository, decide in step 2 whether it asks you first.
- **It installs.** The skill's setup step runs your package manager in the new worktree, which downloads packages. Your company's rules on package sources apply there as anywhere.
- **A native tool comes first.** The skill uses a worktree tool the session offers before it falls back to git, and that tool decides where the worktree goes. Claude Code's own, the EnterWorktree tool, puts it under `.claude/worktrees/`, on a new branch from your repository's default branch ([docs/facts.md](../docs/facts.md), "Claude Code: worktrees and background commands").
- **A sandbox can cancel the isolation.** If creating the worktree fails with a permission error, the skill says so and works in the current folder instead. Read that message when it appears: the work is then not isolated.
- **A worktree holds committed files only, and links in it can fool a tool.** Uncommitted plans and ignored folders stay behind, and the ignored files made in a worktree, such as `.env` and results, go with it when it is removed. The studio once ran a generator in a worktree whose project folders were links to the real ones; the scanner walked into none of them, and the run passed every check while it would have deleted about 190 pages ([the green run](../examples/green-run-that-would-have-deleted.md)).
- **Two skills, one job.** If you also have another skill that does the same job, both offer themselves for the same task; keep one.
- **Token cost:** the description loads in every session, about 57 tokens; the body, about 1,640 tokens, loads only when the skill is used. Both are estimates (bytes divided by 4).
