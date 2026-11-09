---
name: verification-before-completion
description: Use before you claim work is complete, fixed, or passing, and before committing or creating PRs. It requires running verification commands and confirming output prior to making any success claim. Evidence before assertions, always.
metadata:
  category: quality
  author: Richicinschi
  version: 1.0.0
  domain: evidence before any claim of done
---
# Verification before completion

A claim of success is a statement about the world. Check the world first, then speak.

Breaking the letter of the rule breaks the rule. Following its wording while dodging its point is a breach too. If you find a phrasing that "technically" avoids it, the rule applies to that phrasing too.

## The law

You may not say that work is done, fixed or passing unless you ran the proving command in this same message and read what it printed. An earlier run does not count. A feeling of certainty does not count.

## The check, in order

Before you state any status, and before you sound pleased about it:

1. Name the command that would prove the claim.
2. Run the full command again, fresh and complete. Not a subset, not a remembered result.
3. Read all the output. Note the exit code and count the failures.
4. Compare the output with the claim.
   - It disagrees: report the real state, with the output as proof.
   - It agrees: make the claim and attach the output.
5. Only now write the claim.

Skipping any step is lying, not verifying. A guess presented as a result is a lie.

## What each claim needs

| Claim | What proves it | What does not |
|-------|----------------|---------------|
| Tests pass | Test run printed zero failures | An old run, "it ought to pass" |
| Lint is clean | Linter printed zero errors | Linting one folder and assuming the rest |
| Build works | Build command exited 0 | A clean lint, a quiet log |
| Bug is fixed | The original symptom no longer reproduces | The code changed, so it must be fixed |
| New test guards the bug | You saw it fail without the fix and pass with it | It passed once |
| Sub-agent finished | The diff in version control shows the change | The agent said it succeeded |
| Spec is satisfied | You walked the spec line by line | The tests are green |

## Warning signs

Stop and run the check when you notice any of these in yourself:

- Writing "should", "probably", "seems to", "looks right".
- Wanting to cheer ("Great!", "Perfect!", "Done!", "Nice!", "All set!", etc.) before a command has run.
- About to commit, push or open a PR with nothing run.
- Taking a delegate's success report at face value.
- Having checked only part of the thing.
- Thinking "just this once" or "one exception won't hurt".
- Being tired and wanting the task to be over.
- Any sentence that implies success when no command backs it.

## Excuses and the answer to each

| Excuse | Answer |
|--------|--------|
| "It should work now." | Run it. |
| "I am sure." | Sureness is not output. |
| "Only this once." | There is no once. |
| "The linter passed." | A linter does not compile or run the code. |
| "The agent reported success." | Look at the diff yourself. |
| "I am worn out." | Tiredness is a reason to rest, not to skip the run. |
| "Checking part of it is enough." | A part proves only that part. |
| "I phrased it differently, so the rule is not triggered." | The rule covers the meaning, not the words. |

## Patterns

Tests:

- Right: run `npm test`, see `212 passed, 0 failed`, then say "all 212 tests pass".
- Wrong: say "that ought to fix the failing tests".

Regression test for a bug:

- Right: write the test, run it green, undo the fix, run it and see it go red, restore the fix, run it green again.
- Wrong: say "I added a regression test" having run it only against the fixed code.

Build:

- Right: run `cargo build --release`, see exit code 0, then say "the release build succeeds".
- Wrong: say "clippy is quiet, so it builds".

Spec or plan:

- Right: reopen the plan, list every item, check each against the code or a run, then report what is done and what is missing.
- Wrong: say "the suite is green, so the phase is finished".

Delegated work:

- Right: the agent says it finished, you read the diff, you run the checks yourself, you report what you found.
- Wrong: pass the agent's report on as your own finding.

## When it applies

Always run the check before:

- Any statement of success or completion, in any wording.
- Any expression of satisfaction or relief about the work.
- Any positive remark about the state of the code.
- A commit, a push, a PR, or closing a task.
- Starting the next task.
- Handing work to an agent.

The rule covers exact phrases, paraphrases, synonyms, and anything that implies the work is finished or correct.
