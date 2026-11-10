---
name: git-guardrails
description: >-
  Install a PreToolUse hook that vetoes destructive git: no-verify, branch -D, clean -f, reset --hard, history rewrite, force-push. Meant for any repo or agent that the hub guard misses. Use it to protect a project from destructive git, or to enforce no-force-push outside the hub, at the tool layer.
metadata:
  category: engineering
  author: Richicinschi
  version: 1.4.0
  domain: git safety hook for Claude Code
---
# Git guardrails

A hook that checks every shell command before it runs and refuses the destructive git ones.
It enforces, at the tool layer, the studio rule that an agent never force-pushes, rewrites
history or discards work with `reset --hard` unless the owner explicitly asked. Use it for any project or agent that the hub's own
guard does not watch.

## Why and where

- Use it where the hub guard (G6, under `.studio/guardrails/`) does not run: a session opened
  inside a project, or a different agent.
- Never put it in the hub, and never beside G6. Hard rule 11 lets a forced push or a
  history rewrite proceed once the owner has written a grant row for it in your grants ledger;
  G6 honours that row. This script has no idea what a grant is, so it would veto the granted act.
- The script extracts the command with `jq`. With no `jq` installed it matches against the whole
  hook payload, so nothing slips past.

## Policy on plain push

A plain `git push` passes. The studio pushes at checkpoints (see AGENTS.md). Only forced and
destructive pushes are stopped.

## What is blocked

| Command | Refused forms |
|---|---|
| `push` | `--mirror`, `--delete`, `-d`, `-f`, `--force`, `--force-with-lease`, a `+ref` such as `origin +main`, an empty-source `origin :branch` |
| `reset` | `--hard` |
| `rebase` | every use, except `--continue`, `--quit`, `--skip` and `--abort` on one already running |
| `commit` | `--amend`, `-n` |
| `branch` | `-D`, `-f` |
| `checkout` | `-f`, `-B`, `.`, `-- .` |
| `switch` | `-C` |
| `restore` | `.` |
| `clean` | any flag group containing `f`, such as `-f`, `-fd`, `-xdf` |
| `worktree remove` | `--force` |
| `stash` | `drop`, `clear` |
| `reflog` | `expire` |
| `gc` | `--prune` |
| `update-ref` | `-d` |
| `commit-tree`, `filter-repo`, `filter-branch` | all uses |
| `config` | giving `core.hooksPath` a value or removing it: `config core.hooksPath <folder>`, `set`, `--unset`, `unset`, `--replace-all`, `--add` |
| any git call | `--no-verify` and every prefix of it from `--no-v` on, since git takes a unique prefix (`git am --no-v` skips the hooks; this also refuses the rare `--no-verbose` and its prefixes); `-c core.hooksPath=`; `--config-env=core.hooksPath=` |
| any command | `GIT_CONFIG_KEY_<n>=core.hooksPath`, the variable git reads with `GIT_CONFIG_COUNT` and `GIT_CONFIG_VALUE_<n>`, in shell form (alone, after `env` or `export`) or PowerShell form (`$env:GIT_CONFIG_KEY_0 = '...'`) |

git reads a config key in any case, so the `core.hooksPath` rules match `core.hookspath`,
`CORE.HOOKSPATH` and every other mix. Turning hooks on with `git config core.hooksPath <folder>`
is refused too, because the same command can point the hooks at an empty folder: run it yourself.

## Still allowed

Unforced `git push` (and `push -n`), lowercase `branch -d`, lowercase `switch -c`, `stash`
with `stash pop`, `gc` without `--prune`, `worktree remove` without force, and reading the hooks
setting (`git config --get core.hooksPath`, alone or with a redirect).

A refused command prints a `BLOCKED` message on stderr that says the agent has no authority to
run it, and the script exits with code 2.

## Known gaps

- It matches the command's text, not what git will do, so a spelling not on the list passes.
  `reset --merge` and `reset --keep` pass.
- Config that reaches git from outside the command's text passes: a `GIT_CONFIG_PARAMETERS`
  value, a config file edited directly, named by `GIT_CONFIG_GLOBAL`, found through a changed
  `HOME` or pulled in by an `include`, and `GIT_CONFIG_*` variables set before the command or
  through a call such as PowerShell's `[Environment]::SetEnvironmentVariable`. Each of these can
  move the hooks folder.
- It runs only inside Claude Code, and only for the tools its matcher names.
- It has no way through for an approved act: you run that yourself.

## Install

1. **Pick the scope.** Ask which applies: the current project alone (its own
   `.claude/settings.json`), or every project (`~/.claude/settings.json`).
2. **Copy the script.** The script ships beside this file, in the scripts folder. Put a copy at
   `.claude/hooks/` inside the project, or `~/.claude/hooks/` for global scope, and `chmod +x`
   it.
3. **Register it.** Add a PreToolUse entry to the chosen settings file. If the file already has
   `hooks.PreToolUse`, append to that array; never replace the file.

   Project:

   ```json
   {
     "hooks": {
       "PreToolUse": [
         {
           "matcher": "Bash|PowerShell",
           "hooks": [
             {
               "type": "command",
               "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
             }
           ]
         }
       ]
     }
   }
   ```

   Global: the same entry, but its command points at the copy under your home folder.
4. **Tune.** Ask whether any pattern should be added or dropped, and edit the copied script to
   match.
5. **Check it works.** Pipe a forced push into it:

   ```bash
   echo '{"tool_input":{"command":"git push --force origin main"}}' | <path-to-script>
   ```

   Expect exit code 2 and a `BLOCKED` line on stderr. A plain `git push` in the same form must
   exit 0.

The hub keeps the full case table in its guardrails test folder (the file named
`git-guardrails-skill.test.mjs`).
