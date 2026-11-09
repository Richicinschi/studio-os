---
id: session-end-check
module: 01-continuity
checked: 2026-11-02
other_figures:
  - 43
---

# A check before a session ends

## Why

- **The problem:** work survives the night only when it is saved somewhere other than your disk. A session can end with commits that never reached a remote, and nobody notices until days later, when the context to finish them is gone, or never.
- **The reason:** a Stop hook (a script Claude Code runs each time Claude finishes an answer) looks at your setup and the repositories it lists. It stops Claude for one thing only: commits that exist on no remote and are older than an active window, 60 minutes unless you set another, the one state where work can be lost for good. It then hands Claude one line per repository, with any fresher unpushed commits and uncommitted changes added as "also worth knowing", and Claude raises them while the session that made them can still save them. Otherwise it stays quiet, so an ordinary answer is never interrupted. It only tells: it never commits, pushes or cleans.
- **The cost of skipping it:** leftovers pile up where nobody looks. Before the studio had this check, one clean-up pass had to retire about 130 stale branches, 13 forgotten worktrees and 6 working copies with uncommitted changes, gathered over 64 sessions, each cheap to fix in the session that made it (the shipped [handoff](handoff.md) skill records it).
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). A commit that exists on one disk only is not safe state yet; the check names it before the conversation is left behind.

## Detect

Read-only. Settings, names, presence, counts and versions; no network. From the settings files only the `hooks` part is read, plus one name under `env`.

- The Stop hooks you already have: in your setup's `.claude/settings.json` and `.claude/settings.local.json`, and in `~/.claude/settings.json` (or the one under `$CLAUDE_CONFIG_DIR` when that is set), the `hooks.Stop` entries: how many, and the file name of the script each one runs.
- Whether each script a Stop entry names exists. An entry that names a missing file runs nothing while it still looks set: registered means found, not mentioned.
- Whether an active window is already set: `SESSION_END_ACTIVE_MINUTES` under `env` in those files, set or not set. No other variable under `env` is looked at, since those can hold credentials.
- The template in your setup: `<your setup>/hooks/session-end-check.mjs`, present or not.
- What the hook would read its list of repositories from: `registry/PROJECTS.md` and `adoption/inventory.md` in your setup, present or not. It takes the first of the two that exists.
- For each repository in `adoption/inventory.md`, counts only: whether it has a remote, `git -C <repo> remote | wc -l`, and how many commits on its local branches are on no remote, `git -C <repo> rev-list --count --branches --not --remotes`.
- Versions: `node --version` (the hook runs on Node) and `git --version`.

The menu marks the item **have** when a Stop entry runs `session-end-check.mjs`, or another script you confirm checks for unpushed work, and that file exists; **partly** when the file is in your setup but no entry runs it, or an entry names a file that is missing; and **not yet** otherwise.

## Ask

1. **"Check for unpushed work when Claude stops?"**
   - ADAPT: the kit's hook, copied into your setup with its message in your words. Recommended when Detect finds no Stop hook and at least one of your repositories has a remote.
   - FOLD: add its check to the Stop hook you have. Recommended when Detect finds one: two hooks would each speak at a stop.
   - No. Fits when none of your repositories has a remote (the hook never stops for one without), or when you end every session with the [handoff](handoff.md) skill, which runs the same git checks on your word.
   - Not sure: the option recommended above for what Detect found: ADAPT when it finds no Stop hook and a repository with a remote; FOLD when it finds a Stop hook; no when none of your repositories has a remote.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing.
2. **"How long is a commit work in flight?"** Younger than this, an unpushed commit never stops Claude.
   - 60 minutes, the default. Recommended when you push at the end of each piece of work.
   - Longer, such as 240 or 480 minutes. Recommended when you push once or twice a day, or run several sessions at once, so another session's fresh commits do not stop yours.
   - Not sure: the option recommended above: 60 minutes when you push at the end of each piece of work; 240 when you push once or twice a day or run several sessions at once. If the stops come too often, say so and Claude sets a longer window.
   - Default when skipped: 60 minutes.
3. **"Register it where?"**
   - `.claude/settings.local.json` in your setup folder: only you, only sessions started there. Recommended when you start sessions in your setup and add repositories with `--add-dir`.
   - `~/.claude/settings.json`: every session on this machine, whatever folder it starts in. It still checks the repositories your setup lists. Recommended when you start sessions inside each repository.
   - Not sure: the option recommended above: your setup's `.claude/settings.local.json` when you start sessions in your setup, `~/.claude/settings.json` when you start them inside each repository.
   - Default when skipped: your setup's `.claude/settings.local.json`.

## Needs

- Node.js on the PATH, which runs the hook. [Tools some items need](../docs/install-reference.md#tools-some-items-need) installs Node.js 22:
  - Windows: `! winget install --id OpenJS.NodeJS.22 -e`;
  - macOS and Linux: through nvm, the three lines in [docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux";
  - then `! node --version`.
- Git (`git --version`), and a remote for each repository whose work you want guarded.
- Claude Code. The settings shape, the Stop event and the `env` key are in [docs/facts.md](../docs/facts.md), "Claude Code: hooks" and "Claude Code: measuring context and asking multiple choice".
- SkillSpector, for the scan in step 1: row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `templates/hooks/session-end-check.mjs`: a scan of the folder, `skillspector scan templates/hooks --no-llm` (on Windows, `PYTHONUTF8=1` first), the triage, and a read of the whole file, about 60 lines. The kit holds no recorded scan of this folder as of 2026-11-02, so read the verdict with Claude. The read shows what it does: it runs git's read commands only (`remote`, `rev-list`, `log`, `status`, `rev-parse`) and makes no network call.
2. **Claude:** copies it to `<your setup>/hooks/session-end-check.mjs`, with its comments and its message in your words, and shows it before saving.
3. **Claude:** merges one entry into `hooks.Stop` of the settings file you chose, keeping every other setting, and shows the change first:

   ```json
   "Stop": [
     { "hooks": [ { "type": "command", "command": "node \"<your setup>/hooks/session-end-check.mjs\" \"<your setup>\"" } ] }
   ]
   ```

   The setup folder goes in as the argument, so the hook checks your setup and the repositories it lists whatever folder the session started in. The entry has no matcher, the way the studio registers its own Stop hook; matchers for Stop are not documented in docs/facts.md as of 2026-11-02, so step 4 of the Check is the proof. On Windows, Claude writes both paths with forward slashes, which JSON needs no escaping for.
4. **Claude:** for a window other than 60 minutes, adds it under `env` in the same settings file, for example `"env": { "SESSION_END_ACTIVE_MINUTES": "240" }`, keeping any variables already there. Variables under `env` reach every session and the processes it starts ([docs/facts.md](../docs/facts.md)).
5. **Claude:** when it created `.claude/settings.local.json` itself and your setup is a git repository, checks that git leaves the file out: `git -C "<your setup>" check-ignore -q .claude/settings.local.json && echo ignored || echo "not ignored"`. On "not ignored", it adds the file to `.gitignore` on your yes; a hand-made one must be added ([docs/facts.md](../docs/facts.md), "Claude Code: the ! prefix, /init and local files").
6. **you:** type `/hooks`. The read-only list shows the Stop entry, labelled with the file it comes from.
7. **Claude:** records the decision, the window, the settings file, the scan result and the undo in `adoption/decisions.md`.

## Check

Claude builds two throwaway repositories in a temporary folder, each with `git init` and a remote name that points nowhere (`git -C <repo> remote add origin <temp folder>/nowhere`), and runs the hook on each by hand, feeding it what Claude Code would. If your commits are signed, type your passphrase when a commit asks for it.

1. **Claude:** in the first, `fresh`, one new file, uncommitted, then `echo '{}' | node "<your setup>/hooks/session-end-check.mjs" "<temp folder>/fresh"; echo "exit $?"`. Expected: only `exit 0`. Then a commit made now (`git -C <temp folder>/fresh commit --allow-empty -m fresh`) and the same command. Expected: only `exit 0` again: uncommitted changes and fresh commits never stop Claude on their own.
2. **Claude:** in the second, `old`, one commit dated two hours ago: `GIT_COMMITTER_DATE="$(( $(date +%s) - 7200 )) +0000" git -C <temp folder>/old commit --allow-empty -m old` (seconds since 1970, then a time zone; this date form is not covered in docs/facts.md, so the expected output below is what shows git took it). Then `echo '{}' | node "<your setup>/hooks/session-end-check.mjs" "<temp folder>/old"; echo "exit $?"`. Expected, in your words if you rewrote the message:

   ```text
   These commits exist only on this machine:
     old: 1 commit not on any remote, the oldest from 2 hours ago
   Push what should be kept, with the person's yes, or say it is left on purpose and stop again. This check never pushes or cleans.
   exit 2
   ```

   With a window longer than two hours, the commit is still in flight and only `exit 0` appears; Claude then dates it past your window instead.
3. **Claude:** the second stop in a row goes through: `echo '{"stop_hook_active":true}' | node "<your setup>/hooks/session-end-check.mjs" "<temp folder>/old"; echo "exit $?"` prints only `exit 0`. Then Claude deletes the temporary folder.
4. **you:** the live test comes the first time a commit of yours stays unpushed past the window while Claude answers: Claude carries on once, unasked, and names that repository. Making a commit only to test, and removing it again, would rewrite your history, so the card does not ask for one. Until then, `/hooks` listing the entry (step 6 of Steps) is what you can see.

If step 2 prints only `exit 0` with the default window, the hook cannot see the repository: git is missing from the PATH of that shell, or the folder argument is wrong. If step 1 stops Claude, the copy is not the kit's current template. Either way the item is not done, and the plan row stays unticked.

## Undo

- **Claude:** removes its entry from `hooks.Stop`, and `SESSION_END_ACTIVE_MINUTES` from `env` if it added it, in the settings file it changed, keeping every other setting, with the diff shown.
- **Claude:** deletes `<your setup>/hooks/session-end-check.mjs` and marks the row in `adoption/decisions.md` as undone.
- **you:** type `/hooks` to see that the entry is gone. Node.js stays installed; removing it is your decision.

## Watch out

- **Stop runs after every answer, not once at the end.** Claude Code runs a Stop hook each time Claude finishes responding, though not after you interrupt it ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"). That is why the hook stays quiet unless something old is unpushed: a check that spoke about every uncommitted file would cost an extra turn after every reply.
- **Uncommitted work on its own goes unreported.** Changes you never committed are named only as "also worth knowing" next to an old unpushed commit. Ending a session with uncommitted files and nothing old unpushed passes in silence; the [start-of-session status](session-start-status.md), if you take it, names them the next time you start.
- **No remote, no stop.** A repository without a remote is never reported, because there is nowhere to push to. If your work lives in such repositories, this check stays silent about them; give them a remote of your own, or rely on the [handoff](handoff.md) skill.
- **It cannot trap you.** On the second stop in a row Claude Code sets `stop_hook_active`, and the hook lets it through. Saying "leave it, it stays local on purpose" ends the session.
- **It never saves anything itself.** A push waits for your yes. In a company repository, your company's rules decide whether Claude may push at all.
- **Several sessions at once.** The hook sees every repository it lists, not only the ones this session touched. When the studio began running many sessions in parallel, its own check stopped four answers in a row over another live session's files, so it now stops only for unpushed commits older than a window of a few hours ([module 06](../modules/06-git-and-guardrails/README.md#the-mechanism) lists that lesson as a source). If another session's commits stop yours, lengthen the window (question 2).
- **What it cannot read, it skips without a word.** It takes repository paths from the tables in `registry/PROJECTS.md`, or else `adoption/inventory.md`, relative to your setup folder. A cell with a space in it is skipped, and so is one starting with `~`, which the hook does not expand. When git is missing from the PATH it sees no repository at all and says nothing. Silence means "nothing old unpushed" only once the Check has shown that it can speak; [setup-check](setup-check.md) runs that again later.
- **Windows:** hooks run through Git Bash, or through PowerShell when Git Bash is not installed. How a path inside `node "<path>"` is treated on Windows is not documented in docs/facts.md as of 2026-11-02. The Check's commands are bash; in PowerShell, Claude rewrites them.
- **Token cost:** nothing loads into a session. When it stops Claude, its message is 170 bytes plus about 67 for each repository it names and 30 to 50 for each note: about 43 tokens, plus 8 to 17 per line (estimates, bytes divided by 4), plus Claude's reply.
