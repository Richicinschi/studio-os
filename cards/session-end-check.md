---
id: session-end-check
module: 01-continuity
checked: 2026-11-02
other_figures:
  - 43
  - 64
---

# A check before a session ends

## Why

- **The problem:** work survives the night only when it is saved somewhere other than your disk. A session can end with commits that never reached a remote, and nobody notices for days, when the context to finish them is gone, or ever.
- **The reason:** a Stop hook (a script Claude Code runs each time Claude finishes an answer) looks at your setup and the repositories it lists. It stops Claude for two things only: commits on no remote that are older than an active window (60 minutes unless you set another), the one state where work can be lost for good; and a repository git cannot read, where that state cannot be ruled out. It hands Claude one line per repository, with fresher unpushed commits and uncommitted changes added as "also worth knowing", and Claude raises them while the session that made them can still save them. It raises each of these once per session, and otherwise stays quiet. It only tells.
- **The cost of skipping it:** leftovers pile up where nobody looks. Before the studio had this check, one clean-up pass retired about 130 stale branches, 13 forgotten worktrees and 6 working copies with uncommitted changes, gathered over 64 sessions, each cheap to fix in the session that made it (the shipped [handoff](handoff.md) skill records it).
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). A commit that exists on one disk only is not safe state yet; the check names it before the conversation is left behind.

## Detect

Read-only. Settings, names, presence, counts and versions; no network. From the settings files only the `hooks` part is read, plus one name under `env`: no other variable there is looked at, since those can hold credentials.

- The Stop hooks you already have: in your setup's `.claude/settings.json` and `.claude/settings.local.json`, and in `~/.claude/settings.json` (or the one under `$CLAUDE_CONFIG_DIR` when that is set), the `hooks.Stop` entries: how many, and the file name of the script each one runs.
- Whether each script a Stop entry names exists. An entry that names a missing file runs nothing while it still looks set.
- Whether an active window is already set: `SESSION_END_ACTIVE_MINUTES` under `env` in those files, set or not set.
- The template in your setup: `<your setup>/hooks/session-end-check.mjs`, present or not.
- Where the hook would read its list of repositories: `registry/PROJECTS.md` in your setup if it exists, else `adoption/inventory.md`.
- For each repository in `adoption/inventory.md`, counts only: whether it has a remote, `git -C <repo> remote | wc -l`, and how many commits on its local branches or its HEAD are on no remote, `git -C <repo> rev-list --count HEAD --branches --not --remotes`.
- Versions: `node --version` (the hook runs on Node) and `git --version`.

The menu marks the item **have** when a Stop entry runs `session-end-check.mjs`, or another script you confirm checks for unpushed work, and that file exists; **partly** when the file is in your setup but no entry runs it, or an entry names a file that is missing; and **not yet** otherwise.

## Ask

1. **"Check for unpushed work when Claude stops?"**
   - ADAPT: the kit's hook, copied into your setup with its message in your words. Recommended when Detect finds no Stop hook and at least one of your repositories has a remote.
   - FOLD: add its check to the Stop hook you have. Recommended when Detect finds one: two hooks would each speak at a stop.
   - No. Fits when none of your repositories has a remote, or when you end every session with the [handoff](handoff.md) skill, which runs the same git checks on your word.
   - Not sure: ADAPT or FOLD as recommended above for what Detect found, or no when no repository has a remote.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing.
2. **"How long is a commit work in flight?"** Younger than this, an unpushed commit never stops Claude.
   - 60 minutes, the default. Recommended when you push at the end of each piece of work.
   - Longer, such as 240 or 480 minutes. Recommended when you push once or twice a day, or run several sessions at once, so another session's fresh commits do not stop yours.
   - Not sure: the option recommended above for how you push: 60 or 240 minutes. If the stops come too often, say so and Claude sets a longer window.
   - Default when skipped: 60 minutes.
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
- Git (`git --version`), and a remote for each repository whose work you want guarded.
- Claude Code. The settings shape, the Stop event and the `env` key are in [docs/facts.md](../docs/facts.md), "Claude Code: hooks" and "Claude Code: measuring context and asking multiple choice".
- SkillSpector, for the scan in step 1: row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `templates/hooks/session-end-check.mjs`: a scan of the folder, `skillspector scan templates/hooks --no-llm` (on Windows, `PYTHONUTF8=1` first), the triage, and a read of the whole file, about 140 lines. The kit holds no recorded scan of this folder as of 2026-11-02, so read the verdict with Claude. The read shows that it runs git's read commands only (`remote`, `rev-list`, `status`, `rev-parse`), each with `--no-optional-locks` so `status` leaves `.git/index` as it is, and makes no network call. Only when Claude Code sends a session id, it writes one file, `claude-session-end-check/<session id>.json` in the system's temporary folder: the commits and repositories it has raised in that session. It deletes the files in that folder untouched for more than 7 days, and nothing else.
2. **Claude:** copies it to `<your setup>/hooks/session-end-check.mjs`, with its comments and its message in your words, and shows it before saving.
3. **Claude:** merges one entry into `hooks.Stop` of the settings file you chose, keeping every other setting, and shows the change first:

   ```json
   "Stop": [
     { "hooks": [ { "type": "command", "command": "node \"<your setup>/hooks/session-end-check.mjs\" \"<your setup>\"" } ] }
   ]
   ```

   With the setup folder as its argument, the hook checks your setup and the repositories it lists whatever folder the session started in. The entry has no matcher: Stop takes none and runs at every stop ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"). Check step 4 is the proof that it runs. On Windows, Claude writes both paths with forward slashes, which JSON needs no escaping for.
4. **Claude:** for a window other than 60 minutes, adds it under `env` in the same settings file, for example `"env": { "SESSION_END_ACTIVE_MINUTES": "240" }`, keeping any variables already there. Variables under `env` reach every session and the processes it starts ([docs/facts.md](../docs/facts.md)).
5. **Claude:** when it created `.claude/settings.local.json` itself and your setup is a git repository, checks that git leaves the file out: `git -C "<your setup>" check-ignore -q .claude/settings.local.json && echo ignored || echo "not ignored"`. On "not ignored", it adds the file to `.gitignore` on your yes; a hand-made one must be added ([docs/facts.md](../docs/facts.md), "Claude Code: the ! prefix, /init and local files").
6. **you:** type `/hooks`. The read-only list shows the Stop entry, labelled with the file it comes from.
7. **Claude:** records the decision, the window, the settings file, the scan result and the undo in `adoption/decisions.md`.

## Check

Claude builds two throwaway repositories in a temporary folder, each with `git init`, then `git -C <repo> config user.name throwaway`, `git -C <repo> config user.email canary@example.invalid` and `git -C <repo> config commit.gpgsign false`, so your own name, address and signing take no part, and a remote name that points nowhere (`git -C <repo> remote add origin <temp folder>/nowhere`). It runs the hook on each by hand, feeding it what Claude Code would.

1. **Claude:** in the first, `fresh`, one new file, uncommitted, then `echo '{}' | node "<your setup>/hooks/session-end-check.mjs" "<temp folder>/fresh"; echo "exit $?"`. Expected: only `exit 0`. Then a commit made now (`git -C <temp folder>/fresh commit --allow-empty -m fresh`) and the same command. Expected: only `exit 0` again: uncommitted changes and fresh commits never stop Claude on their own.
2. **Claude:** in the second, `old`, one commit dated two hours ago: `GIT_COMMITTER_DATE="$(( $(date +%s) - 7200 )) +0000" git -C <temp folder>/old commit --allow-empty -m old` (git's internal date format, seconds since 1970 and a time zone: [docs/facts.md](../docs/facts.md), "Git: hooks and worktrees"; the output below shows git took it). Then `echo '{}' | node "<your setup>/hooks/session-end-check.mjs" "<temp folder>/old"; echo "exit $?"`. Expected, in your words if you rewrote the message:

   ```text
   These commits exist only on this machine:
     old: 1 commit not on any remote, the oldest from 2 hours ago
   Push what should be kept, with the person's yes, or say it is left on purpose and stop again. This check never pushes or cleans.
   exit 2
   ```

   With a window longer than two hours, the commit is still in flight and only `exit 0` appears; Claude then dates it past your window instead.
3. **Claude:** the second stop in a row goes through: `echo '{"stop_hook_active":true}' | node "<your setup>/hooks/session-end-check.mjs" "<temp folder>/old"; echo "exit $?"` prints only `exit 0`. Then Claude deletes the temporary folder.
4. **you:** the live test comes the first time a commit of yours stays unpushed past the window while Claude answers: Claude carries on once, unasked, and names that repository. A commit made only to test would have to be removed again, rewriting your history, so the card asks for none. Until then, `/hooks` listing the entry (Steps, step 6) is what you can see.

If step 2 prints only `exit 0` with the default window, the hook cannot see the repository: the folder argument is wrong. If a step prints `<name>: could not be checked`, git is missing from the PATH of that shell. If step 1 stops Claude for anything else, the copy is not the kit's current template. Either way the item is not done, and the plan row stays unticked.

## Undo

- **Claude:** removes its entry from `hooks.Stop`, and `SESSION_END_ACTIVE_MINUTES` from `env` if it added it, in the settings file it changed, keeping every other setting, with the diff shown.
- **Claude:** deletes `<your setup>/hooks/session-end-check.mjs` and marks the row in `adoption/decisions.md` as undone.
- **you:** type `/hooks` to see that the entry is gone. Node.js stays installed; removing it is your decision.

## Watch out

- **Stop runs after every answer, not once at the end**, though not after you interrupt Claude ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"). A check that spoke about every uncommitted file would cost an extra turn after every reply, so this one speaks only about old unpushed commits and unreadable repositories.
- **Uncommitted work on its own goes unreported.** A session that ends with uncommitted files and nothing old unpushed passes in silence; the [start-of-session status](session-start-status.md), if you take it, names them at your next start.
- **No remote, no stop.** A repository without a remote is never reported: there is nowhere to push to. Give such a repository a remote of your own, or rely on the [handoff](handoff.md) skill.
- **It cannot trap you.** On the second stop in a row Claude Code sets `stop_hook_active`, and the hook lets it through. Saying "leave it, it stays local on purpose" settles those commits for the session: the hook speaks again only when another commit passes the window, another repository cannot be read, or in a new session. Without a session id in what Claude Code sends, as in the Check, it raises them at every answer.
- **It never saves anything itself.** It never commits, pushes or cleans; a push waits for your yes. In a company repository, your company's rules decide whether Claude may push at all.
- **Several sessions at once.** The hook sees every repository it lists, not only those this session touched. The studio's own check once stopped four answers in a row over another live session's files; it now stops only for unpushed commits older than a few hours ([module 06](../modules/06-git-and-guardrails/README.md#the-mechanism) lists that lesson). If another session's commits stop yours, lengthen the window (question 2).
- **What it cannot read, it raises.** It reads repository paths from the tables in `registry/PROJECTS.md`, or else `adoption/inventory.md`, relative to your setup folder. A repository git cannot read (a `.git` that names a missing folder, say) is `<name>: could not be checked`, and stops Claude once per session like an old commit; without git on the PATH, every repository gets that line. A cell with a space in it is skipped, and so is a path that does not exist or starts with `~`, which the hook does not expand. The [start-of-session status](session-start-status.md) names a missing path, but only in a column headed `Path` or `Folder`. Silence means "nothing old unpushed" only once the Check has shown that the hook can speak; [setup-check](setup-check.md) runs that again later.
- **Windows:** hooks run through Git Bash, or through PowerShell when Git Bash is not installed. A registry path written the way Git Bash prints it, `/c/work/x`, is read as `C:/work/x`. How a path inside `node "<path>"` is treated on Windows is an open question ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"). The Check's commands are bash; in PowerShell, Claude rewrites them. The hook drops a byte-order mark at the start of its input, which PowerShell can send when it pipes text to `node`.
- **Token cost:** nothing loads into a session. When it stops Claude, its message has a fixed part of about 43 tokens for old commits only, 53 for repositories it could not read only, and 64 for both, and about 5 more for the "also worth knowing" heading. Then each line adds about 9 to 18 with 10-character folder names, more with longer ones (estimates, bytes divided by 4), plus Claude's reply.
- **Other agent tools run it too.** Cursor, GitHub Copilot and Devin also load the hooks in `.claude/settings.json` ([docs/facts.md](../docs/facts.md), "Other agent tools: instruction files, skills and hooks"). The kit tested this hook in Claude Code only. If you use one of them on the same folders, repeat Check step 4 in that tool, or stop its import, knowing what else that stops ([docs/other-tools.md](../docs/other-tools.md)).
