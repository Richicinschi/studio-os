# Resuming

Companion to subagent-driven-development. Use it when the plan's workspace already contains `<workspace>/progress.md`.

Read line 1 of that ledger, then act on what it says.

| Line 1 names | Meaning | What to do |
|---|---|---|
| Your plan file | The ledger is yours | Any task with a `Task <N>: complete` entry is DONE and must not be dispatched again. Restart at the earliest task lacking such an entry. If a task's newest entry is a fix round, its loop is still running: carry on with the following round. |
| Another plan file | It records someone else's progress | Leave it exactly where it is and begin a new ledger of your own. |

An orphan ledger at the retired flat location `.studio-work/sdd/progress.md` belongs in the second row: it is not yours, so leave it alone.
