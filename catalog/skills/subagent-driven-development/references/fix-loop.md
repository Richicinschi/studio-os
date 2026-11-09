# Fix loop

Companion to subagent-driven-development. You are here because a task review (turned on for that task) came back with spec ❌, a Critical or Important finding, or a ⚠️ item you checked and found to be a real gap.

Ledger lines this procedure writes (exact formats):

```
Task <N>: minor (deferred): <one-liner>
Task <N>: fix round <R>/5 (<X> addressed, <Y> open — <finding one-liners>; commits <a7>..<b7>)
Task <N>: parked — <finding> — Ruling: <why the code stands>
Task <N>: Ruling: <finding> — <what you decided and why>
```

## Findings that skip the loop

**Minor findings.** Write each to the ledger as you receive it, in the first format above. At the end, direct the whole-branch reviewer to those lines so it can choose the ones that need fixing before the merge. A list that no one reads is a silent discard. A Minor finding never starts a loop.

**Plan-mandated findings.** Some findings are labelled plan-mandated, and others simply clash with the plan's wording. You rule on these. Compare the finding with the plan text, let the spec be the final authority, and write the ruling in the ledger before you act on the finding. Do not drop a finding just because the plan asks for the thing in question. Do not send a fix that goes against the plan unless a ruling is on record.

All other findings go through the loop below.

## Rounds

One round is a fix dispatch followed by a scoped re-review. A task gets five rounds at most.

| Rounds | Who fixes | How |
|---|---|---|
| 1 to 3 | The original implementer | Resume it and send the open findings unchanged. It still has its context: the task, the code, its own choices. If the harness cannot message a live subagent, start a fresh implementer and hand over the brief path, the report path and the findings. Either way the report file is the memory. |
| 4 and 5 | A fresh `bob-builder` (model omitted, as in Model Selection in SKILL.md) | Give it the brief path, the report path and the open findings, plus the framing text shown below. When a loop outlasts three resumes, that usually means the implementer cannot see its own problem. Hand the task to someone who has not seen it before. |

Framing text for a fresh implementer (send it as written):

```
A prior implementer attempted this task [N] times; you own it now. Read the report file for what was tried.
```

Within every round:
1. The implementer changes the code and re-runs the tests that cover it.
2. It appends a fix report to the same report file and replies with the short contract.
3. Before you call the re-reviewer, check the fix report for three things: the covering tests, the command that was run, and the output. Dispatch once all three are there.
4. In the fix message, say which test files cover the change. Re-running the entire suite for a one-line change is unnecessary.

Then make the package for the fix range. FIX_BASE is the head the last review looked at:

```
bash scripts/review-package PLAN_FILE FIX_BASE HEAD
```

Dispatch the [re-review template](../re-review-prompt.md) with four inputs: the findings, the brief, the report and the diff path. The reviewer rates every finding ADDRESSED or NOT ADDRESSED, and hunts for fresh damage in the fix diff alone. Fresh Critical or Important damage joins the open findings. Anything it spots elsewhere is logged as a deferred minor and never lengthens the loop.

Close each round with the fix-round line from the ledger formats above.

You never make these fixes in the controller session. That keeps your context lean, and a fix made there would skip review.

## The breaker

If findings are still open after round 5's re-review, dispatch nothing more. You rule on each open finding, since you see the plan and the neighbouring tasks and the reviewer does not. Three cases:

- **Reviewer mistaken, or reasonable people could differ.** Park the finding with the "parked" format above. The final review will see both sides.
- **Valid, but nothing later depends on it.** Park it in the same form, with a ruling that calls it real and postponed.
- **Valid and load-bearing**: later work rests on it, or it shows a defect in the plan. Choose the smallest change that frees the dependent work. Record it with the last format above, and pass it along in the next task's dispatch. A structural failure parked in silence lets each dependent task build on a bad base. Stop only if the flaw leaves every path forward a guess.

Rule at the cap and nowhere else. Ruling sooner, just to close a loop, is pre-judging by another name. Each ruling is a ledger entry, and a silent discard is never allowed.
