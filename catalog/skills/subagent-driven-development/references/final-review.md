# Final review and finish

Companion to subagent-driven-development. Read this when the last task is complete.

## Review the whole branch

1. Build a package that covers everything the branch changed. MERGE_BASE is the commit where the branch began, for instance the output of `git merge-base main HEAD`:

```
bash scripts/review-package PLAN_FILE MERGE_BASE HEAD
```

The reviewer then opens a single file and does not have to reconstruct the diff with git commands.

2. Dispatch `linus-reviewer` with the model omitted (Model Selection in SKILL.md). Its brief is the one that requesting-code-review keeps: [the code-reviewer brief](../../requesting-code-review/code-reviewer.md). Pass the printed package path.
3. Point the reviewer to the deferred-minor and parked lines of the ledger, so it can say which of them need a fix before merge.
4. List the tasks that got no task review, because this is the only review those tasks receive. Add the plan's riskiest tasks to the list.

## One fix wave

When findings come back, send ONE fixer (`bob-builder`) the entire list. A fixer per finding means every one rebuilds context and re-runs the suites. In a real session, the wave after the final review cost more than all the tasks combined.

Afterwards run a single scoped re-review of that wave, and no more than one. Package the fix range:

```
bash scripts/review-package PLAN_FILE FIX_BASE HEAD
```

and dispatch the [re-review template](../re-review-prompt.md).

Findings still open after that get the breaker treatment from the fix loop (see fix-loop.md in this folder): park them with rulings, or, for load-bearing ones, rule and write down what you chose. Only the four stops listed in SKILL.md can halt you now. A second fix wave does not exist. Any load-bearing finding left over reaches your human partner through the options that finishing-a-development-branch presents.

## Finish

Gather first, delete second. Pull out every ledger line containing `Ruling:`: pre-flight rulings, parked findings, breaker decisions, with none left behind. Put them in your closing message under the heading "Rulings I made". Keep the order in which you decided them, and add to each one the price of being wrong. The list is complete or it is worthless: any ruling in the ledger must appear in it. It is the sole channel through which the calls you made for your human partner reach them, and they use it to redo whatever you got wrong. A ruling that vanishes with the workspace was taken in secret.

When the branch review is clean and its fixes are merged (committed to the branch), remove this plan's workspace:

```
rm -rf <workspace>
```

Git history is the record from then on. The folders beside it belong to other plans, so do not touch them.

Hand over to finishing-a-development-branch.
