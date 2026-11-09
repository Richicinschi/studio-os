---
name: using-git-worktrees
description: Use before executing implementation plans, or when starting feature work that needs isolation from the current workspace. Ensures an isolated workspace exists, using native tools, or the git worktree fallback when none apply.
metadata:
  category: workflow
  author: Richicinschi
  version: 1.0.0
  domain: isolated workspaces for feature work
---
# Using git worktrees

Do feature work in its own workspace, so the checkout you started from stays untouched.

Open by telling the user that this skill is running and that you are preparing an isolated workspace.

## Order of preference

1. Already isolated? Then stop here and use what exists.
2. A native worktree tool? Use it.
3. Neither? Use plain git.

Do not work against the harness. It tracks its own worktrees, and it cannot see ones you add behind its back.

## Studio rule: the shared checkout

The hub's shared checkout belongs to every live session at once (hard rules, "Multi-agent operating model"; `AGENTS.md` section 5). In it, never switch branches, stash, reset or commit. Your move would shift HEAD and the index under the other sessions.

Every change to tracked hub files goes through a worktree off `origin/main`. For hub work you have your answer to the consent question below already: make the worktree, do not ask.

## 1. Am I already isolated?

Compare the two git directories:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

They differ in a linked worktree. They also differ in a submodule, so rule that out first:

```bash
# prints a path only inside a submodule; then treat this as an ordinary repo
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**Outcome A: a linked worktree (not a submodule).** Do not create another. Jump to step 5. Report one of:
- "Already isolated at `<path>` on branch `<name>`."
- "Already isolated at `<path>`, detached HEAD, managed from outside. A branch is needed when you finish."

**Outcome B: an ordinary checkout, or a submodule.** Go on to step 2.

## 2. Do I have consent?

Check your instructions for a stated worktree preference. If there is one, follow it without asking. If there is none, ask:

> "Shall I set up an isolated worktree? It keeps your current branch clear of my changes."

If the answer is no, stay where you are and go to step 5, with one exception: in the hub's shared checkout, stop and tell the user. Never do hub work in the shared root.

## 3. Create it: native tool first

Look at what you can call: `EnterWorktree`, `WorktreeCreate`, a `/worktree` command, a `--worktree` flag. If one exists, use it, then go to step 5. It picks the location, makes the branch and handles cleanup. Running `git worktree add` yourself next to it leaves state the harness cannot manage.

Only when you hold no such tool do you continue to step 4.

## 4. Fallback: plain git

Choose the location in this order. The first match wins.

1. A directory the user named, or one your instructions declare. Use it, no question.
2. In a studio repo: a sibling folder next to the repo, never inside it, holding one worktree for each branch. A `.worktrees/` directory inside the repo is not allowed. (Claude Code's own tool may use `.claude/worktrees/`; that is fine.)
3. Elsewhere: an existing `.worktrees` or `worktrees` directory in the repo. If both exist, take `.worktrees`.
4. Nothing else to go on: `.worktrees/` at the repo root.

**Ignore check, for locations inside the repo only.** Confirm git ignores the directory before you use it:

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

If it is not ignored, add it to `.gitignore` and commit that first. Otherwise the worktree's files can end up committed into the repo.

**Create:**

```bash
path="$LOCATION/$BRANCH_NAME"

# branch from origin/main, not from whatever the shared checkout holds
git fetch origin
git worktree add -b "$BRANCH_NAME" "$path" origin/main
cd "$path"
```

**If git refuses with a permission error**, the sandbox blocked it. Tell the user so, then do the setup and baseline run in the current directory. In the hub's shared checkout do not: stop and tell the user, because the shared root is never a place to work.

## 5. Project setup

Run what the manifest files call for:

```bash
if [ -f package.json ]; then npm install; fi
if [ -f Cargo.toml ]; then cargo build; fi
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi
if [ -f go.mod ]; then go mod download; fi
```

No manifest means no install.

## 6. Clean baseline

Run the project's test command (`npm test`, `cargo test`, `pytest`, `go test ./...`, or whatever it uses) before you change anything.

- Failures: report them and ask whether to go on or look into them first.
- Green: report ready.

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick lookup

| Situation | Do this |
|---|---|
| Linked worktree already | Skip creation (step 1) |
| Inside a submodule | Act as in an ordinary repo |
| Native tool on hand | Use it (step 3) |
| No native tool | Plain git (step 4) |
| Studio repo | Sibling folder, branched from `origin/main`; hands off the shared checkout |
| `.worktrees/` exists | Use it, after the ignore check |
| `worktrees/` exists | Use it, after the ignore check |
| Both exist | `.worktrees/` |
| Neither exists | Look in your instructions, else default to `.worktrees/` |
| Location not git-ignored | Ignore it first and commit that change |
| Create denied by the sandbox | Stay in the current directory; in the hub's shared checkout, stop and tell the user |
| Baseline red | Report, ask |
| No manifest file | Skip the install |

## Excuses that fail

| Excuse | Why not |
|---|---|
| "I plainly am not in a worktree." | Harness-made isolation and submodules both mislead the eye. Run the step 1 commands. |
| "`git worktree add` is faster than finding a tool." | Skipping the native tool is the most common mistake here. It leaves state the harness cannot see or clean up. |
| "That directory must be ignored by now." | Run `git check-ignore`. If it is not ignored, the whole tree can be committed. |
| "Any directory name will do." | Order: what the user said, then what exists, then the default. |
| "A quick `git checkout -b` in the shared checkout is easier." | Live sessions sit in that checkout. Your switch moves their HEAD and index, and a commit made there goes onto someone else's branch (seen on 2026-06-12). Make a worktree. |
| "The workspace is new, so baseline tests can wait." | If the baseline is red and unknown, you cannot tell old failures from new ones. Run the tests now. Whether to continue past a failure is for your human partner to say. |
