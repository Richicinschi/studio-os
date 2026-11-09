# Plan Template

A plan is read by an executor that starts from nothing. It was not in the advisor session, has not
seen the audit or the sibling plans, and may be a small, cheap model. Such a reader follows
precise instructions well. It guesses badly when the page is silent, stumbles on ambiguity, and
does not know when to quit.

Three habits of writing make a plan work for it:

1. **Put it all on the page.** Paths, code excerpts, house style and commands live in the plan.
2. **End every step with a check.** A command and its expected result mean the executor never
   has to judge success.
3. **Draw fences and mark exits.** List what must stay untouched, and say when to stop and
   report so the executor does not invent a way round a surprise.

Files are named `plans/NNN-short-slug.md`, numbered by the order they should run.

---

## Skeleton of one plan

```markdown
# Plan NNN: <what is true after this plan, as an imperative>

> **Read this first, executor**: go through the plan in sequence. When a step
> finishes, run its check and compare with the expected result before moving
> on. If a "STOP conditions" item shows up, stop there and write up what
> you saw. Do not find a workaround. At the end, mark this plan's row in
> `plans/README.md`, unless the reviewer who launched you told you they keep the index.
>
> **Drift check, run before anything else**: `git diff --stat <planned-at commit>..HEAD -- <paths in scope>`
> A change to any listed file means the plan may be out of date. Compare the
> "Current state" excerpts with the real code. If they disagree, stop.

## Status

- **Priority**: P1 | P2 | P3
- **Effort**: S | M | L
- **Risk**: LOW | MED | HIGH
- **Depends on**: plans/NNN-*.md, or "none"
- **Category**: bug | security | perf | tests | tech-debt | migration | dx | docs | direction
- **Planned at**: commit `<short hash>` on <YYYY-MM-DD>
- **Issue**: <issue URL, present only if `--issues` published it>

## Why this matters

Two to five sentences. Name the problem, what it costs today, and what improves. The executor
and any human reviewer should see the purpose, because purpose is what guides a good decision
when one detail of the plan proves wrong.

## Current state

Everything the executor must know, written out here. No "as noted earlier".

- Relevant files, each with its role in a line:
  - `svc/ledger/reports.py`: assembles the monthly report; the query-per-row loop is at
    lines 205-240
- Excerpts of today's code with `file:line` labels, long enough to prove the executor is
  looking at the right spot.
- House style that applies, plus one file to imitate: "Failures are returned as `Outcome`
  values. Read `svc/core/outcome.py` and how `svc/accounts/api.py:61-90` uses it, and do the
  same."
- Vocabulary or design limits from the intent documents you found: the `CONTEXT.md` words to
  use when naming things, the `DESIGN.md` tokens or components to reuse, the ADR this change
  must not contradict. Quote the actual lines; the executor never opened those files.

## Commands you will need

| Purpose   | Command                      | Success looks like |
|-----------|------------------------------|--------------------|
| Install   | `poetry install`             | exit 0             |
| Types     | `poetry run pyright`         | exit 0, no errors  |
| Tests     | `poetry run pytest -k <name>`| all green          |
| Lint      | `poetry run ruff check .`    | exit 0             |

(Take these from the repo, as confirmed in recon. Do not guess them.)

## Suggested executor toolkit

(Optional. Include only if matching skills or tools are likely to exist where the executor runs.
Otherwise leave this section out.)

- Skills to use when available, and the moment to use them: "use `sql-tuning` while writing the
  grouped query in step 3".
- Documents worth reading beforehand, by path or URL.

## Scope

**In scope** (these files only):
- `svc/ledger/reports.py`
- `tests/ledger/test_reports.py` (new file)

**Out of scope**, however related they look:
- `svc/ledger/reports_v1.py`: retired, on the delete list; edits waste effort and could break
  the clients still tied to it.
- The layout of the report output, which other systems parse.

## Git workflow

(Fill this from recon so it matches how the repo already works.)

- Branch name: `advisor/NNN-<slug>`, or the repo's own scheme when it has one.
- One commit per step or logical unit, written in the repo's message style (conventional
  commits, for instance; paste a real example from `git log`).
- Never push or open a PR unless the operator asked for it.

## Steps

### Step 1: <imperative title>

State the action exactly, with file and symbol names. If the target shape matters, show it: the
pattern to produce, not always every line.

**Verify**: `<command>` → <expected output>

### Step 2: ...

(Keep each step small enough to check by itself. When you can, sequence steps so the code works
after every one: introduce the new path, move callers across, then delete the old path.)

## Test plan

- New tests: the file, and the cases to cover. Include the happy path, the very regression this
  plan fixes, and any named edge case.
- A structural model from the existing suite: "follow `tests/accounts/test_api.py`".
- Verify: `<test command>` → everything passes, counting the N new tests.

## Done criteria

Every item can be checked by a tool, and ALL must hold:

- [ ] `poetry run pyright` exits 0
- [ ] `poetry run pytest` exits 0, and the new tests for <X> are present and green
- [ ] `grep -rn "<old pattern>" svc/` prints nothing
- [ ] `git status` shows no file outside the allowed list
- [ ] This plan's row in `plans/README.md` is updated

## STOP conditions

Stop where you are and describe what happened if:

- The code where "Current state" says it lives no longer matches the excerpts. The codebase has
  moved on since the plan was written.
- A check fails a second time after a reasonable repair.
- Making the change seems to require editing any file not on the In scope list.
- The assumption "<key assumption>" turns out to be wrong.

## Maintenance notes

Notes for the person who owns this code later:

- Future changes that touch the same ground ("if reports gain pagination, rethink the grouping
  from step 2").
- What the PR reviewer should look at hardest.
- Follow-up work left out deliberately, with the reason.
```

---

## The index: `plans/README.md`

Write it once when all plans exist. Executors then keep it current.

```markdown
# Implementation Plans

Created by the improve skill on <date>. Run in the order shown unless a
dependency says otherwise. Before starting, read your whole plan, respect
its STOP conditions, and update your own row at the end.

## Execution order & status

| Plan | Title | Priority | Effort | Depends on | Status |
|------|-------|----------|------|-------|--------|
| 001  | ...   | P1       | S    | none  | TODO   |
| 002  | ...   | P2       | M    | 001   | TODO   |

Statuses: TODO | IN PROGRESS | DONE | BLOCKED (one-line cause) | REJECTED (one line: fixed
elsewhere, or approach abandoned)

## Dependency notes

- 002 comes after 001 since <reason>.

## Findings considered and rejected

- <finding>: skipped because <one line>. (Recorded so no one re-audits it.)
```

## Before you call a plan finished

- Imagine a model that has never seen this repo. Can it do the work from the plan plus the repo?
  If a step leans on something only you learned in the session, write that fact into the plan.
- Does each check name a command and an expected result, not a judgement like "confirm it
  behaves"?
- Do steps cite files and symbols precisely, not "the relevant module"?
- Do the STOP conditions reflect this plan's actual hazards rather than stock wording?
- Would someone who reads only "Why this matters" and "Done criteria" know what they are signing off?
- Is the file free of secret values, with locations and credential kinds only?
- Is the "Planned at" commit filled in, and do the drift-check paths equal the In scope
  list?
