---
id: session-start-status
module: 01-continuity
checked: 2026-11-18
other_figures:
  - 200
---

# A status line at the start of a session

## Why

- **The problem:** a new session knows only what it reads. Commits that never reached a remote, a branch left idle for weeks, or a front door whose "current state" is older than the code all stay out of sight until a session trips over them, after it has already planned from stale ground.
- **The reason:** a SessionStart hook (a script Claude Code runs when a session begins; what it prints goes into the session's context) looks at your setup and the repositories it lists, and prints at most ten lines. Unsaved work comes first: a git guard ([git-guardrails](git-guardrails.md)) named in your settings that lets a test force-push through or is missing, uncommitted changes, commits on no remote (on any local branch or a detached HEAD), a repository git could not read; then a path in a Path or Folder column that does not exist. Then a front door whose current-state date is more than 14 days older than the last commit, and one line per repository counting its local branches with no commit for more than 14 days. When everything is in order it prints nothing, so a clean day costs nothing.
- **The cost of skipping it:** the next session works from state nobody updated. In the studio, a session archived its transcript but never updated memory, and the next one worked from state weeks out of date ([module 01, Evidence](../modules/01-continuity/README.md#evidence)). The studio's own start-of-session check comes from an outside framework: reconcile the written record with git at every start ([the outside-framework review](../examples/outside-framework-review.md)).
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). Written state is only as good as its date; the status tells each session where the record has fallen behind.

## Detect

Read-only. Settings, names, presence, counts and versions; no network. From the settings files only the `hooks` part is read.

- The SessionStart hooks you already have: in your setup's `.claude/settings.json` and `.claude/settings.local.json`, and in `~/.claude/settings.json` (or the one under `$CLAUDE_CONFIG_DIR` when that is set), the `hooks.SessionStart` entries: how many, their matchers, and the file name of the script each one runs.
- Whether each script such an entry names exists. An entry that names a missing file runs nothing while it still looks set.
- The template in your setup: `<your setup>/hooks/session-start-status.mjs`, present or not.
- Where it would read its list of repositories: `registry/PROJECTS.md` in your setup if it exists, else `adoption/inventory.md`.
- Whether your front door carries a dated current-state section, which the front-door line needs: `grep -ciE '^#+ .*current state' AGENTS.md CLAUDE.md 2>/dev/null`.
- What already loads into every session: the total in `adoption/inventory.md`, so the status's cost can be weighed against it.
- Versions: `node --version` (the hook runs on Node) and `git --version`.

The menu marks the item **have** when a SessionStart entry runs `session-start-status.mjs`, or another script you confirm reports unsaved work and stale state, and that file exists; **partly** when the file is in your setup but no entry runs it, or an entry names a file that is missing; and **not yet** otherwise.

## Ask

1. **"Show a short status at the start of each session?"**
   - ADAPT: the kit's hook, copied into your setup with its lines in your words. Recommended when Detect finds no SessionStart hook and your registry or inventory lists more than one repository.
   - FOLD: add its checks to the SessionStart hook you have, so one block of text arrives, not two. Recommended when Detect finds one.
   - No. Recommended when you work in one repository and end every session with the [handoff](handoff.md) skill, which leaves it committed and pushed. The [end-of-session check](session-end-check.md) does not replace this status: it stops only for old unpushed commits, and leaves uncommitted work for this status to name.
   - Not sure: the option recommended above for what Detect found and how you work: ADAPT, FOLD or no.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing.
2. **"When should it run?"**
   - New sessions only: the matcher `startup`. Recommended: a resumed session already holds its earlier context, and each run can cost up to about 200 tokens, more with git guard lines (Watch out).
   - New sessions and after `/clear`: the matchers `startup` and `clear`. Recommended when you start new tasks with `/clear` in the open window ([context habits](context-habits.md)).
   - Not sure: the option recommended above: `startup` only, or `startup` and `clear` when you start new tasks with `/clear`.
   - Default when skipped: `startup` only.
3. **"Register it where?"**
   - `.claude/settings.local.json` in your setup folder: only you, only sessions started there. Recommended when you start sessions in your setup and add repositories with `--add-dir`.
   - `~/.claude/settings.json`: every session on this machine, whatever folder it starts in. It still checks the repositories your setup lists. Recommended when you start sessions inside each repository.
   - Not sure: the option recommended above for where you start sessions.
   - Default when skipped: your setup's `.claude/settings.local.json`.

## Needs

- Node.js on the PATH, which runs the hook. [Tools some items need](../docs/install-reference.md#tools-some-items-need) installs Node.js 22:
  - Windows: `! winget install --id OpenJS.NodeJS.22 -e`;
  - macOS and Linux: through nvm, the three lines in [docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux";
  - then `! node --version`.
- Git (`git --version`).
- Claude Code. The SessionStart event, its matchers (`startup`, `resume`, `clear`, `compact`, `fork`) and the settings shape are in [docs/facts.md](../docs/facts.md), "Claude Code: hooks".
- SkillSpector, for the scan in step 1: row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `templates/hooks/session-start-status.mjs`: a scan of the folder, `skillspector scan templates/hooks --no-llm` (on Windows, `PYTHONUTF8=1` first), the triage, and a read of the whole file, about 200 lines. The kit holds no recorded scan of this folder as of 2026-11-02, so read the verdict with Claude. What the hook prints goes into every session, so it is scanned like a skill. The read shows that it runs git's read commands only (`status`, `remote`, `rev-list`, `rev-parse`, `log`, `for-each-ref`, `branch --show-current`), each with `--no-optional-locks` so `status` leaves `.git/index` as it is, reads the front doors of the repositories it lists, writes no file, and makes no network call. Besides git, it runs only each `block-dangerous-git.mjs` that a `hooks.PreToolUse` entry names in the settings files Detect reads, with `node`, given the test force-push of [git-guardrails](git-guardrails.md), Check step 1: no other hook.
2. **Claude:** copies it to `<your setup>/hooks/session-start-status.mjs`, fitted to you, and shows it before saving:
   - its comments and its lines in your words;
   - the idle-branch line made to skip your main branch too, if you want: the template skips only the checked-out branch, so a main branch you are not on shows once nobody has touched it for two weeks;
   - the two 14-day limits set to yours, if you want others.
3. **Claude:** merges one entry into `hooks.SessionStart` of the settings file you chose, keeping every other setting, and shows the change first:

   ```json
   "SessionStart": [
     { "matcher": "startup", "hooks": [ { "type": "command", "command": "node \"<your setup>/hooks/session-start-status.mjs\" \"<your setup>\"" } ] }
   ]
   ```

   For "after `/clear`" too, a second group, the same with `"matcher": "clear"`. With the setup folder as its argument, the hook checks your setup and the repositories it lists whatever folder the session started in. On Windows, Claude writes both paths with forward slashes, which JSON needs no escaping for.
4. **Claude:** when it created `.claude/settings.local.json` itself and your setup is a git repository, checks that git leaves the file out: `git -C "<your setup>" check-ignore -q .claude/settings.local.json && echo ignored || echo "not ignored"`. On "not ignored", it adds the file to `.gitignore` on your yes; a hand-made one must be added ([docs/facts.md](../docs/facts.md), "Claude Code: the ! prefix, /init and local files").
5. **you:** type `/hooks`. The read-only list shows the SessionStart entry, labelled with the file it comes from.
6. **Claude:** records the decision, the matchers, the settings file, the limits, the scan result and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** makes a throwaway repository in a temporary folder (`git init`, then `git config user.name throwaway`, `git config user.email canary@example.invalid` and `git config commit.gpgsign false` inside it, so your own name, address and signing take no part) with one empty commit (`git commit --allow-empty -m check`) and one new file, uncommitted. Then it runs `node "<your setup>/hooks/session-start-status.mjs" "<temp folder>"; echo "exit $?"`. Expected:

   ```text
   <folder name>: uncommitted changes
   exit 0
   ```

2. **Claude:** deletes the file, runs the same command again, and sees only `exit 0`. Then it deletes the temporary folder.
3. **you:** the live test. Have Claude create an empty file `start-check.tmp` in a repository the hook checks, then start a new session in your setup and ask, as the first message, "What did the session start tell you?" Expected: Claude names that repository and "uncommitted changes" without running a command first. Have Claude delete the file; in the next new session, the same question gets the answer that the start said nothing.

If step 1 prints only `exit 0`, the hook cannot see the repository: the folder argument is wrong. If it prints `<folder name>: could not be checked`, git is missing from the PATH of that shell. If it prints a Node error, read it: the kit's template skips a repository with no commits, so the cause is elsewhere, often a copy that differs from the template. If step 3 gets an answer without the repository, the entry is not running: look at `/hooks`. In each case the item is not done, and the plan row stays unticked.

## Undo

- **Claude:** removes its entries from `hooks.SessionStart` in the settings file they were added to, keeping every other setting, with the diff shown.
- **Claude:** deletes `<your setup>/hooks/session-start-status.mjs` and marks the row in `adoption/decisions.md` as undone.
- **you:** type `/hooks` to see that the entry is gone. Node.js stays installed; removing it is your decision.

## Watch out

- **It speaks into every session that has something to report.** At most ten lines; a longer list ends with "... and N more". Ten ordinary lines come to about 200 tokens; a git guard line, with its full path, is about twice as long, so ten such lines come to about 425 (estimates, bytes divided by 4). A clean day costs 0.
- **Silence has two meanings.** It prints nothing when all is in order, and also when it can see nothing: a registry path with a space in it, or a wrong folder argument. A cell in a column headed `Path` or `Folder` that looks like a path (starting with `/`, `~`, `./`, `../` or a drive letter) and does not exist prints `<cell>: not found`; the hook does not expand `~`, so such a cell is named that way too. Cells in other columns, such as "Read first", are never named. A repository git cannot read prints `<name>: could not be checked`, and so does every repository when git is missing from the PATH. So a hook that should speak and prints nothing is a failure. The Check shows it can speak; [setup-check](setup-check.md) shows it again later.
- **A git guard is tested, not only found.** For each `block-dangerous-git.mjs` a PreToolUse entry names, it sends the guard a test force-push as a Bash call, and prints `git guard <path> did not refuse a test force-push` when the guard does not exit 2: a guard whose rules changed, a mistyped or missing path, a path that is a folder (never run), or one that has not answered in the 3 seconds each run gets. A guard that refuses it is then sent a plain `git status`, and `git guard <path> refused a plain git status` is printed when that does not exit 0, as with a guard copied without `guard.mjs` beside it.
- **The guard test has limits.** All runs together get 6 seconds: no run starts with less than 1 second of them left, and a run cut short by what was left is not a failure; such guards are counted in one line, `<n> git guard(s) not tested`. All guard lines come first, so the ten-line limit never hides them. `${CLAUDE_PROJECT_DIR}` is read as your setup folder. An entry in exec form (`command` plus `args`) runs no shell, so any other path in it is taken as written; in a shell-form command, `$CLAUDE_PROJECT_DIR`, and `~` or `$HOME` at the start, are read as the shell reads them. Guards under other file names, such as version 1.4.0's `block-dangerous-git.sh`, are not seen.
- **A repository with no commits yet** is skipped until its first commit, so a new repository stays silent at first. A checked-out branch with no commit yet, as after `git checkout --orphan`, still has its other branches counted: their commits on no remote are printed.
- **The front-door line needs a dated "current state" heading.** It looks for a heading containing "current state" in `AGENTS.md` or `CLAUDE.md` and takes the first date written as YYYY-MM-DD in that section only: from the heading to the next heading of the same or higher level (a `#` line inside a fenced code block is not a heading). A date further down, under `## History` say, never counts, so a section with no date of its own prints no line. The kit's front-door template has no such heading, so that line stays silent unless your front door keeps one.
- **It compares with what your machine last heard.** It never contacts the server, so "not on any remote" means not on any remote your machine has fetched; fetch first when you need the server's view. The only wait it adds to a session's start is the guard test, a moment per guard and 6 seconds at most.
- **It reports; it does not fix.** Claude reads the lines as context and may raise them; acting on them waits for your word.
- **Windows:** hooks run through Git Bash, or through PowerShell when Git Bash is not installed. A registry path written the way Git Bash prints it, `/c/work/x`, is read as `C:/work/x`. How a path inside `node "<path>"` is treated on Windows is an open question; an entry in exec form (`"command": "node", "args": ["<path>"]`) passes the path to `node` as one argument with no shell ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"). Step 3 of the Check runs the command the way Claude Code does.
- **Other agent tools run it too.** Cursor, GitHub Copilot and Devin also load the hooks in `.claude/settings.json` ([docs/facts.md](../docs/facts.md), "Other agent tools: instruction files, skills and hooks"). The kit tested this hook in Claude Code only. If you use one of them on the same folders, repeat Check step 3 in that tool, or stop its import, knowing what else that stops ([docs/other-tools.md](../docs/other-tools.md)).
