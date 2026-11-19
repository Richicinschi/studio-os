---
id: git-guardrails
module: 06-git-and-guardrails
checked: 2026-11-19
tokens:
  description: 64
  body: 2808
---

# A guard on Claude's git commands

## Why

- **The problem:** an agent that can run git can lose work in one command: a `reset --hard` drops uncommitted changes, a force-push replaces what is on the server, a `branch -D` deletes a branch that was never merged.
- **The reason:** a Claude Code hook (a command that Claude Code runs at a set moment, here before each Bash or PowerShell command) reads the command the way the shell and git read it and refuses the destructive git ones, exit code 2, before they run: forced and destructive pushes, history rewrites, discarded work and skipped hooks (the full table is in the skill, under "What is blocked"). Plain `push` stays allowed. Version 2.0.0 is a Node script, so it runs the same on Windows, macOS and Linux, with or without Git Bash.
- **The cost of skipping it:** without it, only a sentence in your instructions stands between Claude and those commands, and prose loses: in the studio, a prose rule was broken twice in one day by the same agent that had written it ([module 06, The problem](../modules/06-git-and-guardrails/README.md#the-problem)).
- **The principle:** [hard stops for the irreversible, judgement for the rest](../PRINCIPLES.md#hard-stops-for-the-irreversible-judgement-for-the-rest). The commands that cannot be undone become hard stops; everything else stays Claude's call.

## Detect

Read-only. Presence, settings, names and versions; no network.

- Versions: `node --version` (22 or later runs the guard) and `claude --version` (`onFailure` in the settings entry needs v2.1.295 or later).
- Claude's shell tools in this session: Bash, PowerShell or both; Claude says which it has. On Windows, Claude Code uses Git for Windows' Bash when it is installed, and PowerShell without it ([docs/facts.md](../docs/facts.md)).
- A git guard already: in `.claude/settings.json` and `.claude/settings.local.json` (project) and `~/.claude/settings.json` (user, or under `$CLAUDE_CONFIG_DIR` when that is set), the `hooks.PreToolUse` entries: how many, which tools each one's matcher names, whether its `command` or `args` name `block-dangerous-git` or another git guard, and whether it sets `onFailure`. Only the hooks part is read.
- The scripts: `.claude/hooks/git-guardrails/block-dangerous-git.mjs` or `~/.claude/hooks/git-guardrails/block-dangerous-git.mjs`, present or not, with `guard.mjs`, `rules.mjs` and `lib/` beside it; and version 1.4.0's bash script, `.claude/hooks/block-dangerous-git.sh` or `~/.claude/hooks/block-dangerous-git.sh`.
- The skill: a skill named `git-guardrails`, or another doing the same job, at project or user level. Names and descriptions only.
- Whether your instruction files put pushing on your ask-first list (for question 2).

The menu marks the item **have** when a git guard runs for every shell tool Claude has, **partly** when a guard is set but one shell tool is not matched, or its entry names a script that is missing, and **not yet** otherwise.

## Ask

1. **"Block destructive git commands before Claude runs them?"**
   - Install the hook only: Claude follows the skill's steps from the kit copy, and only the hook's scripts folder and its settings entry land in your setup. Recommended when Detect found no git guard, or version 1.4.0's bash script.
   - Install the skill too, so you can put the guard into other projects later.
   - FOLD: add the refusals your guard lacks to the hook you already have. Recommended when Detect found a guard other than this one.
   - No.
   - Not sure: the option recommended above for what Detect found: the hook only, with the rules as they are, when Detect found no git guard or version 1.4.0; FOLD when it found another guard.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing.
2. **"May Claude run a plain `git push`?"**
   - Yes: only forced and destructive pushes and the other destructive commands are refused, as in the kit copy. Recommended when your instruction files do not put pushing on your ask-first list.
   - No: plain `git push` is refused too, through a rule added to `rules.mjs`, and you push yourself. Recommended when Detect found pushing on your ask-first list.
   - Not sure: the option recommended above for what Detect found: allowed when pushing is not on your ask-first list, refused when it is.
   - Default when skipped: allowed.
3. **"Where?"**
   - This project only: `.claude/settings.json`, with the scripts in `.claude/hooks/git-guardrails/`. Recommended when Claude runs git in one repository.
   - Every project: `~/.claude/settings.json`, with the scripts in `~/.claude/hooks/git-guardrails/`. Recommended when Claude runs git in several.
   - Not sure: the option recommended above: this project only when Claude runs git in one repository, every project when it runs git in several.
   - Default when skipped: this project only.

## Needs

- Node.js 22 or later on the PATH, which runs the guard. [Tools some items need](../docs/install-reference.md#tools-some-items-need) installs Node.js 22:
  - Windows: `! winget install --id OpenJS.NodeJS.22 -e`;
  - macOS and Linux: through nvm, the three lines in [docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux";
  - then `! node --version`.
- Claude Code v2.1.295 or later, for `"onFailure": "block"` in the settings entry ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"): `claude --version`.
- No bash and no jq: the settings entry starts `node` directly, with no shell.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/skills/git-guardrails/` (version 2.0.0). The kit's recorded scan is of version 2.0.0, on 2026-11-19 ([the kit's scan triage](../tools/export/scan-triage.md#git-guardrails-do_not_install-100100-19-findings)): 19 findings, each a false positive or by design, all from the guard's job: the refused and allowed forms its text lists, the commands in its test table (`cases.json`) and the rules that match them, the test force-push its own check sends, and the settings file it writes to. Claude shows each finding with its reading and goes on only after you have read them.
2. **Claude:** copies everything in the skill's `scripts/` folder to the place you chose, `.claude/hooks/git-guardrails/` or `~/.claude/hooks/git-guardrails/`:

   Bash (or any POSIX shell):

   ```bash
   mkdir -p .claude/hooks/git-guardrails
   cp -R <this-skill>/scripts/. .claude/hooks/git-guardrails/
   ```

   PowerShell:

   ```powershell
   New-Item -ItemType Directory -Force .claude/hooks/git-guardrails | Out-Null
   Copy-Item -Recurse -Force <this-skill>/scripts/* .claude/hooks/git-guardrails/
   ```

   The entry script needs `guard.mjs`, `rules.mjs` and `lib/` beside it; copied alone, it refuses every command that names git. When plain pushes are refused (question 2), Claude adds that rule to `rules.mjs` and shows you the change before saving it. If you install the skill too, Claude rewrites in your words its note on G6, the studio's own guard, which your setup does not have. When Detect found version 1.4.0's bash script, Claude removes it and its settings entry in the same change, so one guard runs.
3. **Claude:** merges one entry into `hooks.PreToolUse` of the settings file for that place, keeping every other setting, and shows you the change before saving it. For this project:

   ```json
   { "matcher": "Bash|PowerShell", "hooks": [{ "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/git-guardrails/block-dangerous-git.mjs"], "onFailure": "block" }] }
   ```

   For every project, the same entry with the script's full path written in `args`, with forward slashes on Windows too, such as `C:/Users/<you>/.claude/hooks/git-guardrails/block-dangerous-git.mjs`: exec form runs no shell to expand `~` or `$HOME`. The entry is in exec form (`command` plus `args`): Claude Code starts `node` with the script path as one argument, which the hooks reference prefers for any hook that names a path placeholder. `"onFailure": "block"` refuses the command when the guard cannot start or times out (a mistyped path, `node` missing); without it, such a hook lets the command run. It needs Claude Code v2.1.295 or later. The matcher `Bash|PowerShell` is a list of exact tool names, so it covers both shell tools ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"). Check step 2 is the proof on your machine.
4. **Claude:** records the decision, the place, the rules changed and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** sends a test force-push to the guard, in the shell it has:

   Bash: `echo '{"tool_name":"Bash","tool_input":{"command":"git push --force origin main"}}' | node <path to block-dangerous-git.mjs>; echo "exit $?"`

   PowerShell: `'{"tool_name":"Bash","tool_input":{"command":"git push --force origin main"}}' | node <path to block-dangerous-git.mjs>; "exit $LASTEXITCODE"`

   Expected: `BLOCKED: 'git push --force origin main' hit the rule "force-push". You are not authorised to run this; ask the user.`, then `exit 2`. The same line with `git status` in place of the push prints `exit 0`.
2. **you:** in a new session, ask Claude to run `git branch -D no-such-branch` in any repository. That branch does not exist, so nothing is lost either way. Expected: Claude reports the command as blocked. If Claude also has PowerShell, ask for the same through PowerShell.

If step 1 prints `exit 0` for the force-push, the rules differ from the kit copy's; if it prints a Node error and `exit 1`, the path is wrong; if `git status` also prints `exit 2`, after `BLOCKED: the guard could not read this command (Cannot find module ...)`, a file is missing beside the script; if step 2 shows git's own error that the branch was not found, the hook did not run for that tool. Either way the item is not done, and the plan row stays unticked.

## Undo

- **Claude:** removes the entry from `hooks.PreToolUse` in the same settings file, leaving the rest, and deletes the `git-guardrails` folder under `hooks/`.
- **Claude:** deletes the skill's folder, if you installed the skill too, and marks the row in `adoption/decisions.md` as undone.
- **you:** Node.js stays installed; removing it is your decision.

## Watch out

- **It stops accidents, not attackers.** It reads the command line, not what git will do, so a command written to get around it passes: the known gaps below are such routes. Keep the acts it refuses on your ask-first list too.
- **Run Check step 1 again after any change** to the scripts, the rules or your PATH: a guard that stopped refusing looks the same as one that works. With the [start-of-session status](session-start-status.md), each new session sends the same test force-push to every guard your settings name and prints a line when one lets it through.
- **Every shell tool needs matching.** A PowerShell command passes a guard whose matcher names only Bash. The kit copy names both; a guard you already have may not.
- **When the guard cannot read a command,** it refuses it if it names git (`BLOCKED: the guard could not read this command (<error>); ask the user.`) and lets the others run. `onFailure` covers what the script cannot: a mistyped path, a missing `node`, a timeout.
- **What it refuses and lets run:** the table under "What is blocked" and "Still allowed" in [the skill](../catalog/skills/git-guardrails/SKILL.md), and `scripts/cases.json`, the commands it must block and must let run. Add what matters to you in `rules.mjs`, and check the change against `cases.json`.
- **Known gaps.** These pass, as the skill lists them:
  - Config set outside the command line: a `GIT_CONFIG_PARAMETERS` value, a config file edited directly or named by `GIT_CONFIG_GLOBAL`, one found through a changed `HOME` or pulled in by an `include`, and `GIT_CONFIG_*` variables set earlier in the session or through a call such as PowerShell's `[Environment]::SetEnvironmentVariable`. Each of these can move the hooks folder ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees").
  - Aliases: one defined outside the line (`git wipe` after a config file sets `alias.wipe`), and one defined with `-c alias.*` on the same line (`git -c alias.wipe='reset --hard' wipe`).
  - `--pathspec-from-file`: the pathspecs in the file are not read.
  - Scripts that call git (`./cleanup.sh`), and `gh` and other tools that change a repository without git, such as `gh api -X DELETE repos/o/r/git/refs/heads/x`.
  - `reset --merge` and `reset --keep`.
  - Wildcard pathspecs with a literal or a class in them that still match nearly every path, such as `[a-z]*`, and a backslash as a folder separator, which git for Windows reads (`'.\'`, `'src\..'` name the whole tree there).
  - It runs only inside Claude Code, and only for the tools its matcher names.
  - It has no way through for an approved act: you run that.
- **It also refuses some harmless commands, on purpose:**
  - A commit message or search that is exactly a refused flag: `git commit -m --no-verify`, `git grep -e --no-verify`.
  - Any word naming `GIT_CONFIG_KEY_<n>=core.hooksPath`, even inside `echo` or `grep`.
  - `:(top,glob)*`, which names the top-level files only (it still discards every one of them).
- **Setting the hooks folder is your own command.** Version 2.0.0 refuses `git config core.hooksPath <folder>`, not only removing the setting: the command that points git at your hooks can as well point it at an empty folder and turn every hook off. Where an item turns hooks on through that setting, such as [the git hook templates](git-hooks.md), you run that line yourself, in a terminal of your own, and Claude reads it back with `git config --get core.hooksPath`, which stays allowed. Whether a `!` command goes through Claude Code's hooks is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: the ! prefix, /init and local files"), so a separate terminal is the route that works either way.
- **No way through for one approved act.** When you decide a force-push is right, you run it yourself in your own terminal; the guard cannot let one through. Beside a guard of yours that does let an approved act through, this one still refuses it, so the studio keeps it out of the places its own guard covers: take one guard or the other for a repository, not both.
- **It also refuses [git-cleanup](git-cleanup.md)'s force deletions** (`git branch -D`).
- **A shared repository:** `.claude/settings.json` and `.claude/hooks/` are usually committed, so the guard reaches your team too. Agree it first, or put the entry in `.claude/settings.local.json`, your own settings for one project (a hand-made one goes in `.gitignore`), with the scripts in your user folder and their full path in `args`.
- **Windows:** exec form needs no Git Bash. A shell-form entry such as `node "$CLAUDE_PROJECT_DIR/…"` breaks where Claude Code runs hooks through PowerShell (Windows without Git Bash), which reads `$CLAUDE_PROJECT_DIR` as an unset variable ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"); with `onFailure` set to `block`, every command is then refused. Check step 2 is the proof on your machine.
- **Token cost:** the hook loads nothing into context. If you keep the skill, its description loads every session, about 64 tokens, and its body about 2,810 tokens when it runs: estimates (bytes divided by 4) measured on the kit's copy of version 2.0.0.
