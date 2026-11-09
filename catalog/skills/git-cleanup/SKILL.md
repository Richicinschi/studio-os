---
name: git-cleanup
description: Tidy up local branches and worktrees whose work has already landed: shows the evidence for each one, asks twice, and deletes only what the user approves. Runs only when the user asks.
metadata:
  category: studio
  author: Richicinschi
  version: 1.0.0
  domain: pruning landed branches and worktrees
allowed-tools: Bash Read Grep AskUserQuestion
disable-model-invocation: true
---
# Git cleanup

Tidy the local branches and worktrees of one repository. Look first, sort every branch, show proof, ask the user twice, then delete only what they approved.

A guard hook that blocks forced branch deletion may be active in this studio. If it is, it also blocks the forced deletes this skill plans. Say so at the start. The hook is a backstop. The two questions to the user are the real check of intent.

## Scope

Use it when:

- Many local branches and worktrees have piled up.
- Branches were merged but never removed locally.
- A remote branch is gone but the local copy is still here.

Do not use it for:

- Remote branches. This skill is local only.
- Repository upkeep such as garbage collection or pruning objects.
- Unattended runs or automation. A person must answer at two points.

Start only when the user explicitly asks for it. Never start it on your own. The frontmatter keeps model invocation off.

## Ground rules

1. Delete nothing without the user's explicit approval. Every destructive step sits behind a gate.
2. There are exactly two gates: the review of the analysis, then the confirmation of the commands.
3. Never touch `main`, `master`, `develop` or anything under `release`. Filter them out by pattern in code. Do not analyze them. Do not delete them.
4. Pick the delete flag by category (see "Which delete flag").
5. Refuse to remove a worktree with uncommitted changes unless the user says, in so many words, that they accept losing those changes.
6. Never switch branches, stash or clean in the studio hub's shared root checkout. Other live sessions may be using it.

## Step 1. Collect

Gather everything before you sort anything. Quote every branch variable, because branch names can hold characters that break shell expansion.

```bash
# default branch: origin HEAD, else main
DEFAULT=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')
DEFAULT=${DEFAULT:-main}
PROTECTED='^(main|master|develop|release.*)$'

git fetch --prune
git branch -vv                       # branches with tracking info
git worktree list
git branch --merged "$DEFAULT"       # already in the default branch
git log "$DEFAULT" --oneline -n 80 | grep -iE '\(#[0-9]+\)|pull request'

for b in $(git for-each-ref --format='%(refname:short)' refs/heads | grep -vE "$PROTECTED"); do
  echo "== $b"
  git log "$DEFAULT..$b" --oneline                 # commits not in default
  git log "origin/$b..$b" --oneline 2>/dev/null    # unpushed; empty if no remote
done
```

Record: the default branch, the branch list with tracking state, the worktrees, the merged set, the recent PR-style entries, and the two commit lists for each unprotected branch.

## Step 2. Group by shared prefix

Do this before you judge any single branch.

```bash
git for-each-ref --format='%(refname:short)' refs/heads \
  | grep -vE "$PROTECTED" | sed 's/-[^-]*$//' | sort | uniq -c | sort -rn
```

The command drops the last dash-separated part of each name, counts repeats and sorts by count. Branches that share a prefix are probably rounds of one piece of work. Study each group as one unit:

1. Find the oldest and the newest branch by commit date.
2. Check whether the newer branches contain the commits of the older ones.
3. Find which merged pull requests carried each branch's work into the default branch.
4. Choose the final branch, usually the newest or most complete. Mark the older ones superseded.

A branch is superseded only with evidence. Accept one of these two:

- A merged pull request carried the branch's work into the default branch.
- A newer branch contains every commit of the older one.

A shared prefix alone proves nothing, because similar names can hold unrelated work. With no evidence, treat the branch as an ordinary one.

Show each group as a single table with one recommendation for the whole group. Do not spread its members over several categories. Example:

| Branch | Commits ahead | PR found | Verdict |
|---|---|---|---|
| ingest-retry-1 | 3 | #212 | superseded |
| ingest-retry-2 | 5 | #212 | superseded |
| ingest-retry-3 | 6 | none | keep (final, unmerged) |

## Step 3. Check the PR history

Do not trust keyword matching alone for branches whose remote is gone. For each one:

1. List its commits that are missing from the default branch.
2. Search the default branch's history for the branch name, words from its commit messages and PR numbers.
3. For a group, list the recent PR merges and see which one carried which work.
4. Confirm that the specific commits were absorbed. A similarly named pull request that merged is not enough.

If the user asks whether a branch is safe because its work was checked, the check is a local verification run. The studio retired hosted CI. Never say that CI is green.

## Step 4. Sort the rest

Walk each branch that is not in a group:

- Merged into the default branch: safe to delete.
- Not merged, remote exists:
  - Remote gone: if a pull request carried the work into the default branch, it is squash-merged. Otherwise it is remote-gone and needs review.
  - Remote present: if `origin/<branch>..<branch>` prints commits, it has unpushed work, so keep it. If not, it is synced with the remote, so keep it.
- Not merged, no remote: unique commits mean local work, so keep it. No unique commits means safe to delete.

| Category | Meaning | Action | Delete flag |
|---|---|---|---|
| Safe to delete | Merged | Delete | `-d` |
| Squash-merged | Work absorbed by a squash | Delete | `-D` |
| Superseded | Group member with evidence | Delete | `-D` |
| Remote-gone | Remote deleted, work not found in default | User reviews | none yet |
| Unpushed work | Commits missing from the remote | Keep | none |
| Local work | No remote, has unique commits | Keep | none |
| Synced with remote | Same as the remote | Keep | none |

Absent from the default branch and absent from the remote are two different facts. Always compare against the remote tracking branch before you call work unpushed.

## Which delete flag

Git cannot see that a squash merge took in a branch. So `git branch -d` always refuses a squash-merged branch. That refusal is normal and is not an error.

When a branch is squash-merged, plan `-D` from the start. Never try `-d` first and then come back with a second question. That burns one of the user's two confirmations for nothing.

Note: studio repositories merge pull requests with merge commits only (hard rule 13). Squash-merged branches are rare here. Still check for them. Outside repositories and old history contain squash merges.

## Step 5. Worktrees and live sessions

Two checks run on every worktree and on the current directory.

Dirty state. Run `git status --porcelain` in each one. For each dirty location, show a prominent warning. List the changed files and state that removing the worktree destroys those changes.

Live sessions. Another session may be using a worktree. Treat a worktree as in use if either is true:

- A running `claude` process has its working directory inside that worktree.
- The worktree has uncommitted changes.

Label these "in use, keep". They never enter the default recommendation. The user may still pick one by name at gate 1. Then the dirty-worktree rule still applies. This replaces any blanket rule about trees you did not create.

## Gate 1. Review the analysis

Show the whole analysis in one view, in this order:

1. Related groups, each with its recommendation.
2. Single branches by category: merged, squash-merged, needs review, keep.
3. Worktrees with their status.
4. A summary of counts.

Then ask with AskUserQuestion. Offer three choices:

- Take all recommended deletions (groups, merged, squash-merged).
- Delete only chosen groups or categories.
- Let me pick single branches.

Stop. Do nothing until the user answers.

## Gate 2. Confirm the commands

Print the exact commands that will run, each with its right flag:

```bash
git branch -d 'tidy-docs-links'            # merged
git branch -D 'ingest-retry-1'             # superseded
git branch -D 'cache-warm-prefetch'        # squash-merged
git worktree remove '../tidepool-wt-spike' # worktree
```

Ask for a yes or no. This is the only deletion confirmation. A forced delete that is needed is already on the list, so ask nothing more.

## Step 6. Execute and report

Run each deletion as its own command, so one failure does not block the rest. Report each result. On a failure, report the error and carry on.

Finish with two parts: what was deleted, and a table of the branches that remain with their status.

## Excuses to refuse

| Thought | Why it is wrong |
|---|---|
| "It is old, so delete it." | Age says nothing about merge state. Old branches can hold unmerged work. |
| "The reflog will save us." | Reflog entries expire, and many users cannot use them. |
| "It is local only, so it does not matter." | It may be the only copy of the work. |
| "A pull request merged, so it is safe." | A squash merge keeps no branch history. Confirm the specific commits were absorbed. |
| "Delete everything marked gone." | The marker means the remote was removed. The local branch may carry unpushed commits. |
| "The user sounds fed up, so wipe it all." | Show the analysis first. Let the user choose. |
| "It is not in the default branch, so it is unpushed." | Compare with the remote tracking branch. That is a different fact. |
