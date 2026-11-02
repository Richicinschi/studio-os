---
name: git-guardrails
description: >-
  Set up a Claude Code PreToolUse hook that blocks DESTRUCTIVE git commands (force-pushes and
  remote deletes, history rewrites, reset --hard, clean -f, branch -D, checkout ./restore .,
  skipped hooks) before they execute, for a repo or agent no stricter guard covers. Use when the user wants to enforce the studio's
  no-force-push / no-history-rewrite rules at the tool layer outside the hub, add git safety
  hooks, or harden a project/agent against destructive git.
metadata:
  category: engineering
  author: Richicinschi (adapted by Claude from mattpocock/skills)
  version: 1.2.0
  domain: git safety hook for Claude Code
  sources:
    - mattpocock/skills · misc/git-guardrails-claude-code (MIT) — blocklist retuned to studio policy; see ./LICENSE
---

# Setup Git Guardrails

Sets up a PreToolUse hook that intercepts and blocks destructive git commands before Claude
executes them — a tool-layer backstop for the studio's hard rules (never force-push, rewrite
history, or `reset --hard` without an explicit ask). Complements any stricter guard you already run; this is the reusable installer for any project or agent.

> **Studio policy note:** unlike the upstream default, this does **not** block plain `git push`
> — Claude pushes at checkpoints by policy (see AGENTS.md). Only force-push and destructive ops
> are blocked.
>
> **Where it belongs:** only where a stricter guard of your own does
> not run, e.g. a session started inside a project or another agent. Never install it
> beside a guard that lets a force-push or history rewrite through once the owner's grant row is in
> your grants ledger (the rule that each risky act needs a recorded yes), and this script has no grant path, so it would block
> the granted act. It reads the command with `jq`; without `jq` it matches the raw hook input
> instead, so it still blocks.

## What Gets Blocked

- force-pushes and remote deletes: `push --force` / `-f` / `--force-with-lease`, a `+` refspec (`push origin +main`), `--mirror`, `--delete` / `-d`, `push origin :branch`
- history rewrites: `reset --hard`, any `rebase` (finishing one with `--continue`, `--abort`, `--skip` or `--quit` is allowed), `commit --amend`, `branch -f`, `checkout -B` / `switch -C`, `commit-tree`, `filter-branch`, `filter-repo`, `update-ref -d`
- destructive working-tree ops: `clean` with an `f` in its flags (`-f`, `-fd`, `-xdf`), `branch -D`, `checkout -f`, `checkout .` / `checkout -- .` / `restore .`, `worktree remove --force`
- the way back: `stash drop`, `stash clear`, `reflog expire`, `gc --prune`
- skipped hooks: `--no-verify`, `commit -n`, `-c core.hooksPath=`

(Plain `git push`, `push -n`, `branch -d`, `switch -c`, `stash` / `stash pop`, plain `gc` and `worktree remove` are allowed.) When blocked, Claude sees a message
telling it that it does not have authority to run these commands. The studio tests these cases against its own copy; Check step 1 tests yours.

## Steps

### 1. Ask scope

Ask the user: install for **this project only** (`.claude/settings.json`) or **all projects** (`~/.claude/settings.json`)?

### 2. Copy the hook script

The bundled script is at: [scripts/block-dangerous-git.sh](scripts/block-dangerous-git.sh)

Copy it to the target location based on scope:

- **Project**: `.claude/hooks/block-dangerous-git.sh`
- **Global**: `~/.claude/hooks/block-dangerous-git.sh`

Make it executable with `chmod +x`.

### 3. Add hook to settings

Add to the appropriate settings file:

**Project** (`.claude/settings.json`):

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

**Global** (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|PowerShell",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

If the settings file already exists, merge the hook into existing `hooks.PreToolUse` array — don't overwrite other settings.

### 4. Ask about customization

Ask if user wants to add or remove any patterns from the blocked list. Edit the copied script accordingly.

### 5. Verify

Run a quick test:

```bash
echo '{"tool_input":{"command":"git push --force origin main"}}' | <path-to-script>
```

Should exit with code 2 and print a BLOCKED message to stderr.
