---
name: handoff
description: >-
  Close out a work session cleanly. Use when the owner signals the end ("going to sleep", "we'll continue in a new session", "wrap up", "update the docs", "/handoff") or the Stop gate reports untidiness. Saves memory, archives the session, commits and pushes every repo, tidies branches on the user's yes.
metadata:
  category: workflow
---

# handoff

The Stop hygiene gate **detects** an untidy studio. This skill **resolves** it.

It exists because end-of-session cleanup left undone turns into archaeology: stale
branches, orphaned worktrees and dirty working trees pile up silently across sessions.
Each one is cheap to fix in the session that created it and expensive to fix weeks later.

## When this fires

Any of the owner's own end-of-session phrases: *"going to sleep"*, *"we'll continue in
a new session"*, *"let's wrap up"*, *"update the docs"*, *"end of day"*, *"save
everything"*, `/handoff`. Also whenever the Stop gate reports problems.

If they are merely pausing, say so and skip it — a handoff on a session that is about
to continue is wasted motion.

## The floor — every runtime, with or without tooling

Whatever runtime you are, a session ends with these five traces, in this order. The procedure
below does them with the tooling it names; without it, do them by hand.

1. **Session log.** If the project keeps a session log, append an entry: the date, a one-line
   title, which runtime ended the session, what shipped (PR numbers, commit hashes), what was
   verified, what was left open.
2. **Project state.** In each project touched, refresh the "Current state" line of `AGENTS.md`
   to verified reality.
3. **Memory.** Write or sharpen the memory files that pass the four tests below, one index line
   each, and record in each file which runtime and session wrote it, and when.
4. **Push.** Every repo touched: committed (`git commit`, no trailers) and pushed, after
   traces 1-3 are written so they are in the commits. A repo whose `main` is guarded gets a
   branch and a PR.
5. **Say it.** The last message names what was deliberately left undone and where.

## Procedure

Create a todo per step and work them in order. Do **not** skip a step silently; if
one genuinely does not apply, say which and why.

### 1. Establish the real state first

```
node <your setup check, if you keep one>
```

Fix any **FAIL** before continuing. Warnings are reported, not necessarily fixed.
Never start closing out against an assumed state.

Steps 2-4 write; step 5 commits what they wrote. Never commit first: a sweep written after
the push stays uncommitted while the gate still reports clean.

### 2. Memory sweep — the step most likely to be skipped

Sweep the session for what is worth remembering. This is the point of the whole exercise.

An entry must pass all four tests, or it does not get written:
1. **Non-obvious** — underivable from code, git history, or `AGENTS.md`.
2. **Durable** — still true next month.
3. **Decision-changing** — it would alter what a future session does.
4. **Carries its why** — the reasoning and the cost, not just the rule.

Prefer sharpening an existing file over adding a near-duplicate. **Correcting a
memory this session proved wrong is worth more than any addition.** Writing
nothing is a valid and common outcome — say so rather than padding.

Nothing is ever deleted to save room. Before you correct an entry, keep its old text
somewhere it can be found again. Step 5 commits what you wrote.

### 3. Archive the session

If you have no archiving tool, save this session's record where the project keeps
session records, if it keeps any: a summary, or the transcript if the project keeps
those, plus any index or log that lists them. Close only the sessions the user names: a session that has merely gone
quiet may still be live.

### 4. Refresh project state

For each project touched, update its `AGENTS.md` current-state line to match
verified reality — not intent, not what was attempted.

If a project's `AGENTS.md` has grown past the size the project allows, move older
detail into a file it links to. Archive it; never delete it.

### 5. Commit and push every repo

For each repo with changes, including any branch step 3 wrote to:
- Group changes into coherent commits — never one "wip" blob.
- The message explains **why**, not what the diff already shows.
- Authored as the owner, with `git commit`. **Never** a `Co-Authored-By` or session
  trailer; once installed, the commit-msg hook refuses them.
- Push. For a repo whose `main` is guarded, open a PR instead — the owner merges.

Verify per repo that no commit exists only on this disk, on any branch or worktree:

```
git -C <repo> rev-list --count --ignore-missing --branches $(git -C <repo> worktree list --porcelain | sed -n 's/^HEAD //p') --not --remotes
```

It must print `0`. `HEAD` alone misses side branches and worktrees, where the
worktree workflow puts its commits. Check against **all** remotes, not just
`origin` — a repo can legitimately have a `fork` remote that holds the work.

### 6. One branch per repo: list, ask, then delete

List every merged branch (local and remote) and every finished worktree, by repo,
with why each can go. Show the owner the exact list and delete only what they say yes to,
in this session: the auto-mode classifier refuses deletions a broad "do a handoff"
did not name, and the owner treats them as their own call.

Leave alone:
- branches with an **open PR** (work in flight awaiting review),
- branches the owner has explicitly asked to keep,
- anything they did not name.

Say out loud which branches and worktrees survived and why.

### 7. Confirm the gate is clean

```
printf '{"stop_hook_active":false}' | node <your setup>/hooks/session-end-check.mjs
```

Exit `0` means no commit is left unpushed; the gate does not look at uncommitted
files. So also run `git -C <repo> status --porcelain` for every repo this session
touched: none of your paths may be listed.

If either check fails, fix what it names or state explicitly what is deliberately
left open and why.

## Report format

Close with a short, factual summary:

- what shipped (with commit hashes / PR numbers)
- what was verified, and how
- what was **deliberately** left open
- what the next session should pick up first

## Never

- Never merge a PR as part of a handoff — that is the owner's call, always.
- Never force-push, rewrite history, or tag.
- Never report a repo as clean without having checked it.
- Never invent a memory entry to make the sweep look productive.
- If something is broken and cannot be fixed now, it goes in the report
  explicitly. A quiet handoff over a broken state is the failure this skill exists
  to prevent.
