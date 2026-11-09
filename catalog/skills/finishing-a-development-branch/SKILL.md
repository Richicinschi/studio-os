---
name: finishing-a-development-branch
description: Use when implementation is complete and all tests pass, and you must decide how to integrate the work: open a PR or keep the branch.
metadata:
  category: workflow
  author: Richicinschi
  version: 1.0.0
  domain: wrapping up completed branch work
---
# Finishing a development branch

Order of work: prove the tests are green, find out where you stand, offer the menu, do what they pick, tidy only what is yours.

Say first that you are wrapping up this branch with this skill.

## 1. Run the suite

Run the whole test suite of the project (for example `npm test`, `pytest` or `cargo test`). Run it against the exact tree you will hand over, not an older state.

If anything fails, print the failures and stop. No menu until the suite is green.

```
Tests failing (<N> failures). Fix these before finishing:

[the failures]
```

## 2. Find out where you stand

Record three values now. Later steps change directory, and cleanup needs the old values.

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

| Situation | Menu | Cleanup |
|-----------|------|---------|
| `GIT_DIR` equals `GIT_COMMON` (plain repo) | the 2-item menu | nothing to remove |
| They differ, on a named branch | the 2-item menu | by provenance, see section 6 |
| They differ, detached HEAD | the detached menu | none; the host owns the workspace |

## 3. Name the base branch

The base is the branch this work was cut from. Check the plan, the chat and the upstream setting. If none does, ask: "This branch was cut from <best guess>. Right?" Wait for a yes. A PR or merge aimed at the wrong base is costly to undo.

## 4. Offer the menu

Studio rule (your rules file, rules 11 and 13): merging is for your human partner alone. The PR lands with a merge commit, via `gh pr merge N --merge`. No squash, no rebase. A local merge has no place on the menu.

Named branch, in a plain repo or a worktree. Show exactly this:

```
The work is done. What now?

1. Push and open a Pull Request (you merge it)
2. Keep the branch as it is (I'll deal with it later)

Which one?
```

Detached HEAD. Show exactly this:

```
The work is done. This is a detached HEAD (a workspace managed from outside).

1. Push as a new branch and open a Pull Request
2. Keep as it is (I'll deal with it later)

Which one?
```

Add nothing to either list. Then wait. Never offer deletion. It follows only from their own plain request (section 5c).

## 5. Do what they picked

### Option 1: push and open the PR

```bash
git push -u origin <feature-branch>
# detached HEAD: git push origin HEAD:refs/heads/<new-branch>
```

Open the PR against the base branch. Use the forge CLI if there is one, otherwise the URL the push prints. Follow the repo's PR template and conventions. Give your partner the PR URL. The merge is theirs to press, not yours.

Leave the worktree alone: PR feedback gets fixed there.

Any commit you make on the way is signed: `git commit -S`, with the repo's own identity.

### Option 2: keep it

Say: "Branch <name> stays. Worktree kept at <path>."

### 5b. They ask for a local merge

Do this only if they ask, for this branch, in so many words. First check that your grants ledger holds the grant row for it (the rule that each risky act needs a recorded yes). No row: stop, do not merge. A local merge happens in a project repo, where the before-tool guards do not run, so this check is yours and nothing else will catch a missing row.

The hub's shared root is off limits here: other live sessions work in that checkout, and switching its branch or committing there would break them. Hub branches always go through their PR.

Inside a project repo:

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

git checkout <base-branch>
git pull
git merge --no-ff <feature-branch>

<test command>
```

Merge first, then confirm it worked before you remove anything. If `git merge` stops on a conflict, stop and report it, and remove nothing. If the merged result fails its tests, also stop: keep the branch and the worktree and look into it. Nothing was pushed, so the damage is local.

Only once the merge is complete and the merged tests are green, tidy the worktree (section 6) and then run:

```bash
git branch -d <feature-branch>
```

### 5c. They ask to discard

Run this path only when they ask outright to throw the work away. Show first:

```
This deletes for good:
- Branch <name>
- Commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

Wait for the word `discard`. Any other reply is not a confirmation. Then:

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

Clean up the worktree (section 6), then:

```bash
git branch -D <feature-branch>
```

## 6. Tidy the workspace

Only a local merge or a confirmed discard gets here. Options 1 and 2 never remove the worktree. Run removal from the main repo root, never from inside the worktree, and use the values saved in section 2.

- `GIT_DIR` equals `GIT_COMMON`: a plain repo, no worktree. Nothing to do.
- This session made the worktree (through using-git-worktrees): you remove it. Studio worktrees all sit in one folder next to the repo, together with those of other live sessions, so the location says nothing. Only creating it yourself in this session counts.

  ```bash
  git worktree remove "$WORKTREE_PATH"
  git worktree prune
  ```

- Anyone else made it: the host or another session owns it. Leave it. If your platform has a workspace-exit tool, use that.

If git refuses because the tree has modified or untracked files, some of them may be the only copy (plans, notes, scratch). Never add `--force` on your own. List them and ask:

```bash
git -C "$WORKTREE_PATH" status --porcelain -uall
```

```
Removal refused. These files were never committed:

<file list>

1. Commit them to <branch> first (signed: git commit -S)
2. Move them into <main repo root>
3. Delete them (cannot be undone)

Which one?
```

Do what they choose, then remove the worktree.

## At a glance

| Path | Merge | Push | Worktree kept | Branch deleted |
|------|-------|------|---------------|----------------|
| 1. PR | your partner, with `--merge` | yes | yes | no |
| 2. Keep | none | no | yes | no |
| Local merge (asked for, grant row present, not in the hub root) | `--no-ff` | no | no | yes, `-d` |
| Discard (asked for, typed `discard`) | none | no | no | yes, `-D` |

## Excuses that do not hold

| Thought | Why it fails |
|---------|--------------|
| "It passed earlier in this session." | Earlier proves an earlier tree. Run it again on this one. |
| "Obviously they want it merged." | Merging is their decision. Show the menu and wait. |
| "The feature looks finished, so I'll suggest dropping it." | The menu is fixed. Discarding comes only from their own request. |
| "'Yeah, bin it' is a confirmation." | Only the typed word `discard` counts. |
| "The PR is open, so the worktree is just clutter." | Review fixes get made there. Keep it until the PR lands. |
| "That other worktree looks abandoned, I'll remove it too." | You remove only what this session created. The rest belongs to others. |
| "Removal was refused, `--force` just finishes the job." | The refusal means unsaved files live only there. Force destroys them. Ask. |
| "That failure on the merged result is probably flaky." | A red merged result halts everything. Keep branch and worktree and investigate. |
| "The base is obviously main." | Confirm it first. Fixing a wrong base later is painful. |
| "The push was rejected, a force-push will sort it." | The remote has new commits. Find out why. Force-push only at your partner's explicit request, once its grant row is recorded (the rule that each risky act needs a recorded yes). |
| "CI is green, so I may as well press merge for them." | Merging is their job. Hand over the URL and stop there. |
