---
name: git-guardrails
description: >-
  Install a PreToolUse hook that vetoes destructive git: no-verify, branch -D, clean -f, reset --hard, history rewrite, force-push. Use it to protect a project or an agent from destructive git at the tool layer, or to enforce no-force-push in Claude Code.
metadata:
  category: engineering
  author: Richicinschi
  version: 2.0.0
  domain: git safety hook for Claude Code
---
# Git guardrails

A Claude Code hook that checks every shell command before it runs and refuses the destructive
git ones: forced and destructive pushes, history rewrites, discarded work and skipped hooks. An
agent that needs one of these asks the user, who runs it.

It reads the command the way the shell and git read it: a quoted argument stays one argument, a
heredoc or here-string is data, `bash -c "…"` and `$( )` are read too, short flags count joined
or apart (`-fd`), and a long option counts by any prefix git accepts (`--forc`, `--ha`).

Needs Node 22 or later on the PATH. It needs no bash and no jq, and Claude Code starts it in exec
form (`node` with the script path as its one argument, no shell), so it runs the same on Windows,
macOS and Linux, with or without Git Bash, for Bash and PowerShell commands.


## Policy on plain push

A plain `git push` passes. Only forced and destructive pushes are stopped.

## What is blocked

| Command | Refused forms |
|---|---|
| `push` | `-f`, `--force`, `--force-with-lease`, `--force-if-includes`, `--mirror`, `-d`, `--delete`, `--prune`, a `+ref` such as `origin +main`, an empty-source `origin :branch`, and `-c remote.*` or `-c push.*` on the same line |
| `reset` | `--hard` |
| `rebase` | every use, except steering one already running: `--continue`, `--abort`, `--skip`, `--quit`, `--edit-todo`, `--show-current-patch` |
| `commit` | `--amend`, `-n` |
| `branch` | `-D`, `-f`, `--force`, `-M`, `-C` |
| `checkout` | `-f`, `--force`, `-B`, and pathspecs naming the whole tree |
| `switch` | `-C`, `--force-create`, `-f`, `--force`, `--discard-changes` |
| `restore` | pathspecs naming the whole tree, unless only `--staged` |
| `rm` | pathspecs naming the whole tree, with or without `-r` (git rm's `*` crosses `/`, so `rm -f '*'` deletes every tracked file), unless `--cached` or a dry run (`-n`, `--dry-run`; the last of each switch and its `--no-` form counts) |
| `checkout-index` | `-f`, `--force` |
| `read-tree` | `--reset` with `-u` |
| `clean` | `-f`, `--force` (in any flag group, such as `-fd` or `-xdf`), or `-c clean.requireForce=false`; `-n` passes |
| `worktree remove` | `-f`, `--force` |
| `stash` | `drop`, `clear` |
| `reflog` | `expire`, `delete`, `drop` |
| `gc` | `--prune` |
| `update-ref`, `commit-tree`, `filter-repo`, `filter-branch` | every use |
| `config` | giving `core.hooksPath` a value or removing it: `config core.hooksPath <folder>`, `set`, `unset`, `--unset`, `--unset-all`, `--replace-all`, `--add`, and renaming or removing the `core` section |
| any git call | `--no-verify` and every prefix of it from `--no-v` on (git takes a unique prefix, so `git am --no-v` skips the hooks; this also refuses the rare `--no-verbose`); `-c core.hooksPath=…`; `--config-env=core.hooksPath=…` |
| any command | `GIT_CONFIG_KEY_<n>=core.hooksPath`, the variable git reads with `GIT_CONFIG_COUNT` and `GIT_CONFIG_VALUE_<n>`, in shell form (alone, after `env` or `export`) or PowerShell form (`$env:GIT_CONFIG_KEY_0 = '...'`) |

A pathspec names the whole tree (from the top with `:(top)…` or `:/…`, else the current folder)
when, after its magic, `./` and `//` collapse and `..` takes off the segment before it, nothing is
left (`.`, `./`, `src/..`, an empty `:/`), or what is left is wildcards alone with a `*` in them
(`*`, `**`, `./**`, `**/*`, `:(glob)*`). `src/*.js`, `*.js`, `src/**`, `:(top)src/a.js` and
`:(literal)*` do not. A list made only of exclusions (`:!x`, `:^x`, `:(exclude)x`) means
everything but those, so it names the whole tree too. The rule lives in `lib/git.mjs`.

git reads a config key in any case, so the `core.hooksPath` rules match `core.hookspath`,
`CORE.HOOKSPATH` and every other mix. Turning hooks on with `git config core.hooksPath <folder>`
is refused too, because the same command can point the hooks at an empty folder: run it yourself.

## Still allowed

Unforced `git push` (and `push -n`), `git push origin :` (push matching branches), lowercase
`branch -d`, lowercase `switch -c`, `reset --soft`, `restore --staged .`, `rm -r --cached .`, `rm -r -n .`,
`stash` with `stash pop`, `gc` without `--prune`, `worktree remove` without force, a single file
from the top (`:(top)src/a.js`), and reading the hooks setting (`git config --get core.hooksPath`
or `git config core.hooksPath`, alone or with a redirect). Other tools' own `clean -f`, `rebase`
or `push --force` (npm, make, docker, jj, hg, gh) pass, and so does git text inside a commit
message, a heredoc, a here-string or another quoted argument.

A refused command prints a `BLOCKED` line on stderr that says the agent has no authority to run
it, and the script exits with code 2.

## When the guard cannot read a command

A hook that crashes lets the command run, so this one fails closed. If it cannot read the hook's
input, or fails while reading the command, it exits 2 with `BLOCKED: the guard could not read
this command (<error>); ask the user.` when the command names git (`git` as a word, or
`GIT_CONFIG`), and exits 0 otherwise. The text it checks is the command (`tool_input.command`)
alone, or all of the input when that is not JSON; the payload's other fields, such as a working
folder named `git`, never count. A payload with no command, and empty input, pass. The same holds
when the entry script was copied without `guard.mjs`, `rules.mjs` or `lib/` beside it.

`"onFailure": "block"` in the settings entry (step 3) covers what the script cannot: a mistyped
path, a missing `node`, or a timeout. `onFailure` requires Claude Code v2.1.295 or later (hooks
reference, https://code.claude.com/docs/en/hooks, read 2026-11-18). Without it, a hook that fails
to start lets the command run.

## Known gaps

It reads the command line, not what git will do. These pass:

- Config set outside the command line: a `GIT_CONFIG_PARAMETERS` value, a config file edited
  directly or named by `GIT_CONFIG_GLOBAL`, one found through a changed `HOME` or pulled in by an
  `include`, and `GIT_CONFIG_*` variables set earlier in the session or through a call such as
  PowerShell's `[Environment]::SetEnvironmentVariable`. Each of these can move the hooks folder.
- Aliases: one defined outside the line (`git wipe` after a config file sets `alias.wipe`), and
  one defined with `-c alias.*` on the same line (`git -c alias.wipe='reset --hard' wipe`).
- `--pathspec-from-file`: the pathspecs in the file are not read.
- Scripts that call git (`./cleanup.sh`), and `gh` and other tools that change a repository
  without git, such as `gh api -X DELETE repos/o/r/git/refs/heads/x`.
- `reset --merge` and `reset --keep`.
- Wildcard pathspecs with a literal or a class in them that still match nearly every path, such
  as `[a-z]*`, and a backslash as a folder separator, which git for Windows reads (`'.\'`,
  `'src\..'` name the whole tree there).
- It is tested only in Claude Code. Cursor, the GitHub Copilot CLI, Copilot in VS Code and the
  Devin CLI read a project's `.claude/settings.json` too, but may not run the entry from step 3 as
  Claude Code does (`args`, `${CLAUDE_PROJECT_DIR}`, `onFailure`). Where the hook fails to start,
  the command runs: see a forced push refused there before you rely on it.
- It runs only for the tools its matcher names, and another tool may give its shell another name.
- It has no way through for an approved act: the user runs that.

It also refuses some harmless commands, on purpose:

- A commit message or search that is exactly a refused flag: `git commit -m --no-verify`,
  `git grep -e --no-verify`.
- Any word naming `GIT_CONFIG_KEY_<n>=core.hooksPath`, even inside `echo` or `grep`.
- `:(top,glob)*`, which names the top-level files only (it still discards every one of them).

## Install

1. **Pick the scope.** Ask which applies: the current project alone (its own
   `.claude/settings.json`), or every project (`~/.claude/settings.json`).
2. **Copy the scripts folder.** Copy everything in the `scripts/` folder beside this file into
   `.claude/hooks/git-guardrails/` inside the project, or `~/.claude/hooks/git-guardrails/` for
   global scope:

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

   The entry script needs `guard.mjs`, `rules.mjs` and `lib/` beside it; copied alone, it refuses
   every command that names git (and still lets the others run). `cases.json` comes along as the
   tuning table (step 4).
3. **Register it.** Add a PreToolUse entry to the chosen settings file. If the file already has
   `hooks.PreToolUse`, append to that array; never replace the file.

   The entry uses exec form (`command` plus `args`): Claude Code starts `node` directly with the
   script path as one argument, with no shell. The hooks reference says to "Prefer exec form for
   any hook that references a path placeholder" (https://code.claude.com/docs/en/hooks, read
   2026-11-18; it states no minimum Claude Code version for exec form). A shell-form command such
   as `node "$CLAUDE_PROJECT_DIR/…"` breaks where Claude Code runs hooks through PowerShell
   (Windows without Git Bash): PowerShell reads `$CLAUDE_PROJECT_DIR` as an unset variable, node
   exits 1, and with `onFailure` set to `block` every command is refused.

   Project (`.claude/settings.json`):

   ```json
   {
     "hooks": {
       "PreToolUse": [
         { "matcher": "Bash|PowerShell", "hooks": [{ "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/git-guardrails/block-dangerous-git.mjs"], "onFailure": "block" }] }
       ]
     }
   }
   ```

   Global (`~/.claude/settings.json`): the same entry with the script's absolute path written out
   in `args`. `~` and `$HOME` are not among the reference's path placeholders, and exec form runs
   no shell to expand them, so write your home folder in full, with forward slashes on Windows too:

   ```json
   {
     "hooks": {
       "PreToolUse": [
         { "matcher": "Bash|PowerShell", "hooks": [{ "type": "command", "command": "node", "args": ["/home/<you>/.claude/hooks/git-guardrails/block-dangerous-git.mjs"], "onFailure": "block" }] }
       ]
     }
   }
   ```

   On Windows the path looks like `C:/Users/<you>/.claude/hooks/git-guardrails/block-dangerous-git.mjs`;
   on macOS, `/Users/<you>/.claude/hooks/git-guardrails/block-dangerous-git.mjs`.
4. **Tune.** Ask whether any rule should be added or dropped, and edit `rules.mjs` in the copy.
   `cases.json` lists commands the guard must block (`block`) and let run (`allow`); check a
   changed rule against them with the line in step 5. The `allow` group exists because an
   earlier version refused those harmless commands: health checks run
   `git config --get core.hooksPath`, other tools have their own `clean -f` or `rebase`, and
   commit messages mention refused commands; the `block` group holds spellings that once slipped
   through.
5. **Check it works.** Pipe a forced push into it:

   ```bash
   echo '{"tool_name":"Bash","tool_input":{"command":"git push --force origin main"}}' | node <path>; echo "exit $?"
   ```

   In PowerShell:

   ```powershell
   '{"tool_name":"Bash","tool_input":{"command":"git push --force origin main"}}' | node <path>; "exit $LASTEXITCODE"
   ```

   Expect `exit 2` and a `BLOCKED` line on stderr. A plain `git push` in the same form must print
   `exit 0`.
