# Follow-through: execute, reconcile, issues

A written plan is only half the work. Three flows cover the rest: sending a plan to an executor
and judging what comes back (`execute`), keeping the stack of plans accurate over time
(`reconcile`), and putting plans where people look for tasks (`--issues`).

One rule never bends here: **the advisor does not write source code.** During `execute`, a
*different* subagent, the executor, changes code in an isolated git worktree. You send it off,
inspect what it produced, and rule on it, as a tech lead would without pushing to anyone's branch.

---

## `execute <plan>`

### Gate before dispatch

Do not dispatch if any item fails, and tell the user (a stale plan is refreshed first, as noted in the last item):

- The project is a git repo. Worktree isolation depends on it.
- The plan file exists, and each plan listed under its "Depends on" shows DONE in `plans/README.md`.
  Name the one that is missing.
- You have run the plan's drift check. If in-scope files changed after the "Planned at" commit,
  refresh the plan (see `reconcile` below) before any executor receives it.

### Sending the executor

Launch **one** `general-purpose` subagent with `isolation: "worktree"`. Do not set `model`: the
executor then runs on the parent's model, because this studio does not weaken the agent that
writes code to save tokens. Only when the user names a model (`execute 003 haiku`) do you pass
that one.

Build the prompt from three parts.

1. **The complete plan text.** The worktree contains only what is committed, so an
   uncommitted `plans/` folder cannot be read from there. Paste the plan in every time.
2. This opening brief:

> Your job is to carry out the plan that follows. Take the steps in order. For
> each one, run the check it gives and confirm the output before you
> proceed. Edit only files the plan allows. If a STOP condition comes up, stop
> right then and report. Do not route around problems. Commit inside the
> worktree following the plan's Git workflow section. One change to the
> plan: leave `plans/README.md` alone, because your reviewer owns the index.
> Before you reply, test every claim in your report against a tool result from
> this session and report only what has evidence behind it. A check that failed
> or was skipped must be stated as such. Reply in the layout shown next and
> nothing else.

3. The reply layout:

```
STATUS: COMPLETE | STOPPED
STEPS: for each step, done or skipped, and what its check printed
STOPPED BECAUSE: (only if STOPPED) the condition and what was observed
FILES CHANGED: list them
NOTES: deviations, surprises, judgment calls
```

### Reviewing the result

This is where your judgment counts. A fresh worktree has the git history but no `node_modules`
and no build output. The executor has to install dependencies, and a check that reads `dist/`
might need one build that the plan's command table (drawn up in the main tree) never listed.
Treat that as normal.

Review as a tech lead checks a PR against its spec. Repair nothing yourself.

1. **Rerun each done criterion** in the worktree. The report is only a claim.
2. **Compare scope.** `git -C <worktree> diff --stat` against the In scope list. One stray
   file fails the review.
3. **Read the full diff.** Does it fix the problem described under "Why this matters"? Does it look like the
   neighbouring code, following the style the plan points to?
4. **Read the new tests for what they assert.** Executors bend criteria to pass. A test that
   asserts nothing useful still turns the suite green.

### Ruling

**Weigh a deviation that the executor documented; do not reject it automatically.** The
"no workarounds" rule targets silent drift. Suppose an executor meets a true obstacle (the
planned approach breaks existing test doubles, say), makes the smallest adjustment, and explains
it in NOTES. That is the right behaviour. Accept it when it still serves the plan's aim and stays
within scope. A deviation that was not documented fails the review.

| Ruling | Condition | What you do |
|---|---|---|
| **APPROVE** | All items pass, scope is clean, quality is good | Mark DONE in the index. Give the user a short diff summary, the worktree path and branch, and anything from NOTES. **The user decides about merging. You never merge, push, or commit to their branch.** |
| **REVISE** | Problems that can be repaired | Send the same executor a SendMessage with concrete feedback ("item 3 fails with X; the handler in `jobs.go:140` drops the error, so return it as the plan's error style requires"). **Two rounds at most**, then BLOCK. |
| **BLOCK** | A STOP condition fired, scope was broken past repair, or the rounds ran out | Mark BLOCKED in the index and give the reason. Amend or rewrite the plan with what you learned, and tell the user what happened and what is different now. |

Running checks inside the executor's worktree is allowed. That tree is disposable. The ban on
state-changing commands exists to protect the user's own working tree.

---

## `reconcile`

This mode brings the stack of plans up to date after time has passed. Read `plans/README.md` and
every plan file, then handle each by status:

- **DONE**: confirm with inexpensive commands only that its done criteria still pass on
  the present HEAD, then mark it verified. Never delete a plan file; the files are the history.
- **BLOCKED**: read why, then look into the cause in the code. Rewrite the plan around the
  obstacle (new number if the whole approach changed, refresh in place if not), or mark it
  REJECTED with one line of reasoning.
- **IN PROGRESS and old**: report it to the user. Most likely an executor died halfway. Look at
  its worktree when there is one.
- **TODO**: run the drift check. If the code moved, first check that the finding still holds,
  since someone may have fixed it in passing. Then update the "Current state" excerpts and the
  "Planned at" commit. A finding that has disappeared becomes REJECTED ("fixed independently").

Close with a brief summary: verified as done, refreshed, rejected, and ready to run now.

---

## `--issues`

This modifier goes on any planning request (`/improve --issues`, `/improve security --issues`).
It counts as the user's permission to open issues; with no flag, open none.

1. Preflight. `gh auth status` has to pass and the repo needs a GitHub remote. If one fails, write
   the plan files normally and tell the user why no issues were made.
2. Check visibility with `gh repo view --json visibility`. A **public** repo means every issue is
   world-readable. Warn the user, and get an explicit yes before posting any plan that covers a
   vulnerability, a credential location, or another sensitive finding.
3. Show the titles that will be posted, and ask for one confirmation if a person is present.
4. For each plan run `gh issue create --title "<plan title>" --body-file <plan file>`. Use the
   labels `improve` and the category, but only where the label exists or can be created
   without an error. Skip a label rather than fail.
5. Save each issue's URL in the plan's header (`- **Issue**: <url>`) and in the index, `plans/README.md`.

Keep the plan file as the authoritative copy; the issue only spreads it around. Because each
plan stands alone, its text works as an issue body without edits.
