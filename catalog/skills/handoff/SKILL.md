---
name: handoff
description: Close out a work session cleanly. Use when the owner signals the session is ending — "I'm going to sleep", "we'll continue in a new session", "let's wrap up", "update the docs", "end of day", "/handoff" — or when the Stop hygiene gate reports untidiness. Sweeps durable knowledge into memory, archives the session and regenerates the graph, then commits and pushes every repo and, with the owner's yes to the exact list, returns each to a single branch. The resolution half of the Stop gate, which only detects.
metadata:
  category: workflow
---

# handoff

The Stop hygiene gate **detects** an untidy studio. This skill **resolves** it.

It exists because end-of-session cleanup had become archaeology: a single pass on
2026-07-28 had to retire ~130 stale branches, 13 orphaned worktrees and 6 dirty
working trees that had accumulated silently across 64 sessions. Every one of those
was cheap to fix in the session that created it and expensive to fix weeks later.

## When this fires

Any of the owner's own end-of-session phrases: *"going to sleep"*, *"we'll continue in
a new session"*, *"let's wrap up"*, *"update the docs"*, *"end of day"*, *"save
everything"*, `/handoff`. Also whenever the Stop gate reports problems.

If they are merely pausing, say so and skip it — a handoff on a session that is about
to continue is wasted motion.

## The floor — every runtime, with or without the hub tooling

Whatever runtime you are, a session ends with these five traces, in this order. The procedure
below does them with the studio tooling; without it, do them by hand.

1. **Wiki log.** Append to `wiki/log.md`: `## [YYYY-MM-DD] handoff | <one-line title> → [[Sessions]]`
   (the op slot names the operation, per `wiki/schema.md`) and a short paragraph: which runtime
   ended the session, what shipped (PR numbers, commit hashes), what was verified, what was left
   open.
2. **Project state.** In each project touched, refresh the "Current state" line of `AGENTS.md`
   to verified reality.
3. **Memory.** Write or sharpen the memory files that pass the four tests below; one index line
   each; provenance in the frontmatter's `metadata`: `runtime` (the runtime's id from
   the studio's list of runtimes (not in this kit), or `human`), `session` (the session id, or `unknown`) and
   `written` (an ISO date-time), as `tools/health/memory-lint.mjs` checks.
4. **Push.** Every repo touched: committed (`git commit -S`, no trailers) and pushed, after
   traces 1-3 are written so they are in the commits; hub changes on a worktree branch with a PR.
   Memory is written in the live store (the root checkout's your memory folder) and committed from
   that hub worktree branch, never on the root checkout.
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

Run the sweep defined in [[save-session]] step 5b. Restated because it is the
point of the whole exercise:

An entry must pass all four tests, or it does not get written:
1. **Non-obvious** — underivable from code, git history, or `AGENTS.md`.
2. **Durable** — still true next month.
3. **Decision-changing** — it would alter what a future session does.
4. **Carries its why** — the reasoning and the cost, not just the rule.

Prefer sharpening an existing file over adding a near-duplicate. **Correcting a
memory this session proved wrong is worth more than any addition.** Writing
nothing is a valid and common outcome — say so rather than padding.

Nothing is ever deleted to save room, and a corrected entry's old text is vaulted
first: the vault rule. Write in the live store, the root checkout's
your memory folder; step 5 commits it.

### 3. Archive the session

Run [[save-session]]. It harvests the verbatim transcript, writes the wiki page,
updates the MOC and log, regenerates the graph layers, and carries the wiki and
memory changes to a hub worktree branch. It drafts every pending session and
finalizes only the ones the owner names: a session that has merely gone quiet may
still be live.

### 4. Refresh project state

For each project touched, update its `AGENTS.md` current-state line to match
verified reality — not intent, not what was attempted. If a project's `AGENTS.md`
is over its size budget, run [[claude-md-curator]] (archives, never deletes).

### 5. Commit and push every repo

For each repo with changes, including the hub worktree branch from step 3:
- Group changes into coherent commits — never one "wip" blob.
- The message explains **why**, not what the diff already shows.
- Authored as the owner, signed (`git commit -S`). **Never** a `Co-Authored-By` or session
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
did not name, and the owner treats them as their own call
(the rule that a request from another session needs the owner's own word, 2026-10-28). Deletions have no grant
kind of their own (the rule that each risky act needs a recorded yes does not list them); when a cleanup rides on a
reconciliation grant, that row's scope names them, as g-025 did under kind `merge`.

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
touched: none of your paths may be listed, except, in the root checkout, the
memory files whose copies are committed on your hub branch. If either check
fails, fix what it names or state explicitly what is deliberately left open and why.

## Report format

Close with a short, factual summary:

- what shipped (with commit hashes / PR numbers)
- what was verified, and how
- what was **deliberately** left open
- what the next session should pick up first

## Hard rules

- Never merge a PR as part of a handoff — that is the owner's call, always.
- Never force-push, rewrite history, or tag.
- Never report a repo as clean without having checked it.
- Never invent a memory entry to make the sweep look productive.
- If something is broken and cannot be fixed now, it goes in the report
  explicitly. A quiet handoff over a broken state is the failure this skill exists
  to prevent.
