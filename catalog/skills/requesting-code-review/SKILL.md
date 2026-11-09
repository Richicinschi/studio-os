---
name: requesting-code-review
description: Use after completing tasks, after implementing major features, or before merging, to verify the work meets its requirements. Hands a fresh linus-reviewer agent a focused brief and a commit range.
metadata:
  category: quality
  author: Richicinschi
  version: 1.0.0
  domain: asking a reviewer agent to check finished work
---
# Requesting a code review

A second pair of eyes finds problems before the next task builds on them. Give the reviewer a written brief and the commit range. Never give it your session history: it should judge the work, not your reasoning.

Rule: review early, and review often.

## When to ask

Always:
- once a task finishes, if subagent-driven-development turned review on for it; and at the end of every plan
- after a large feature
- before merging to main

Worth it:
- when you are stuck and want a fresh view
- before a refactor, to get a baseline
- after a hard bug fix

## How to ask

1. Pick the commit range.

```bash
BASE_SHA=$(git rev-parse HEAD~1)   # whole branch instead: git merge-base origin/main HEAD
HEAD_SHA=$(git rev-parse HEAD)
```

2. Dispatch the `linus-reviewer` agent (set as `subagent_type`). Its brief is [code-reviewer.md](code-reviewer.md) with the four values below filled in. Leave the model out, so it runs on the session's own model (`.claude/agents/AGENTS.md`).

   - `[DESCRIPTION]`: one short paragraph on what you built
   - `[PLAN_OR_REQUIREMENTS]`: what the work had to do
   - `[BASE_SHA]`: the commit before your work
   - `[HEAD_SHA]`: your last commit

3. Handle what comes back.
   - Critical: fix now.
   - Important: fix before you go on.
   - Minor: write it down for later.
   - Think the reviewer is wrong? Say so, give your reasoning, and show the code or test that proves it.

## Sample session

```
[Task 5 done: add the retry queue]

You: Reviewing before Task 6.

BASE_SHA=$(git log --oneline | grep "Task 4" | head -1 | cut -d' ' -f1)
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch linus-reviewer]
  DESCRIPTION: Retry queue with backoff and a dead-job list
  PLAN_OR_REQUIREMENTS: Task 5 in docs/plans/queue-plan.md
  BASE_SHA: 9be04c1
  HEAD_SHA: 71d2a58

[Reviewer replies]:
  Strengths: small API, tests hit real timeouts
  Issues:
    Important: no cap on retry count
    Minor: log lines lack the job id
  Verdict: With fixes

You: [add max_attempts, rerun the tests]
[Go on to Task 6]
```

## Excuses that do not hold

| Excuse | Why it fails |
|--------|--------------|
| "I will read the diff myself, it is quicker" | You run the work. A long diff read inline fills the context you need to keep going. A reviewer holds the diff in its own context and returns only findings. |
| "The reviewer needs the full history to follow the change" | A good brief is enough. History drags in your assumptions and bends the verdict. |

## Never

- Skip a review because the change is small.
- Wave off a Critical finding.
- Carry on with an Important finding unfixed.
- Fight feedback that is correct.

When the reviewer is wrong, answer with reasoning and with code or tests that show it, or ask it to clarify.

The brief lives in [code-reviewer.md](code-reviewer.md).
