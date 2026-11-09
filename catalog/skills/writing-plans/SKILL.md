---
name: writing-plans
description: Use before touching code, once you hold a spec or requirements for a multi-step task. Turns them into a task-by-task implementation plan, tests first, that someone new to the codebase can execute.
metadata:
  category: planning
  author: Richicinschi
  version: 1.0.0
  domain: implementation plans from a spec
---
# Writing Plans

A plan hands a spec to an implementer who has never seen this codebase or this spec. That person writes sound code in the project's language once the interface and the test are exact, and picks a sensible option wherever you left one open. What they cannot know is what you decided: the files, the names and signatures, the values the spec fixes, the test that proves each task. Write those decisions down, and split the work into small tasks. Keep it DRY and YAGNI, test first, commit often.

**First words to the user:** say that you are using writing-plans to build the plan.

**Where plans go:** `docs/plans/YYYY-MM-DD-<feature-name>.md`. If the user names another place, use theirs.

**Worktree:** the isolated workspace for the work comes from the `using-git-worktrees` skill when the plan is executed.

## Check the scope

When a spec covers several independent subsystems, brainstorming should already have split it. If that did not happen, suggest one plan per subsystem. Each plan should produce working software that can be tested on its own.

## Map the files first

Before cutting tasks, list each file the plan creates or changes, with its responsibility. This map is where the task boundaries come from.

- One job and one clear interface per file.
- Favour small, focused files over big ones; edits land more reliably in code you can hold in your head.
- Keep files that change together side by side, and divide along responsibilities rather than technical layers.
- In an existing codebase, follow what is already there. If the codebase keeps large files, do not unilaterally restructure them. If a file you must touch has grown unwieldy, planning a split is reasonable.

## Cut the tasks

The right size for a task is the smallest piece that runs its own test cycle and merits a fresh reviewer's gate. Setup, config, scaffolding and docs belong inside the task whose result needs them. Draw a boundary only where a reviewer could reasonably reject one task yet accept its neighbour. Each task must produce self-contained changes that make sense on their own, and deliver something that can be tested alone.

Inside a task, one step is one action with a result you can check:

- write the failing test
- run it and watch it fail
- write the minimal code
- run it and watch it pass
- commit

## Every plan MUST start with this header

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence: what this builds]

**Architecture:** [2-3 sentences on the approach]

**Tech Stack:** [Main technologies and libraries]

**Spec:** [Path to the spec or design doc this plan implements. The plan
is argued from the spec, so the spec goes along with it and executors
read both.]

## Global Constraints

[Project-wide requirements from the spec: version floors, dependency
limits, naming and copy rules, platform needs. One line each, with the
exact values copied verbatim from the spec. Every task is bound by this
section.]

## Review Focus

[Up to five input classes or failure modes (an empty list is valid when
you checked and found none) that the spec implies
but no task's tests cover, and that are most likely to hurt a real user.
One line each: the input or condition, and what a reasonable person
expects to happen. Most likely first. The spec states what the software
must do; it cannot list everything the software will meet, and its silence
about an input does not let that input break the program. Draw up the list
in one pass while the spec is in front of you. Afterwards, for each line,
put the test that pins it into the task that owns the code, written in
that task's own step style.]

---
```

## Write each task like this

````markdown
### Task N: [Component Name]

**Files:**
- Create: `duration.py`
- Modify: `existing/file.py:123-145` (only when the task edits an existing file; give the line range)
- Test: `tests/test_duration.py`

**Interfaces:**
- Consumes: [what this task takes from earlier tasks, with exact signatures]
- Produces: [what later tasks build on: exact function names, parameter
  types and return types. Each implementer reads only their own task, so
  this block is their only view of the names and types next door.]

- [ ] **Step 1: Write the failing test, and a stub so it fails for the right reason**

In `tests/test_duration.py`:

```python
from duration import parse_duration


def test_parses_hours_and_minutes():
    assert parse_duration("1h30m") == 5400
```

In `duration.py`, the stub:

```python
def parse_duration(text: str) -> int:
    raise NotImplementedError
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `python -m pytest tests/test_duration.py::test_parses_hours_and_minutes -v`
Expected: FAIL with "NotImplementedError"

- [ ] **Step 3: Implement `parse_duration(text: str) -> int` in `duration.py`**

Add a line on the approach when the signature and the test still leave a
real choice (which library call, which data structure). Add a code block
only when no signature or test could settle the algorithm.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `python -m pytest tests/test_duration.py::test_parses_hours_and_minutes -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/test_duration.py duration.py
git commit -S -m "feat: parse duration strings into seconds"
```
````

## What goes in a step

Finish a step at the point where the implementer could write exactly one reasonable thing from it. Aim for no ambiguity, not for completeness. Each kind of step gets whatever removes the doubt, and nothing beyond that.

- **Test step:** the test name, plus its assertions as real code, with the spec's exact values inside them.
- **Code step:** the file, and the signature (name, parameters, return type), and any value the spec pins. The implementer writes the body. Print a body only when the signature and the tests leave the algorithm open, or when the spec fixes exact copy.
- **Verification step:** the command to run, then the output that signals success (an `Expected:` line).
- **Pointer to another task:** name the task and lean on its Interfaces block. Never paste its code a second time.

Two opposite failures flank this. One is over-writing: a plan longer than the code it describes has turned into the code. The other is under-writing: placeholder lines that decide no question, such as "TBD", "handle edge cases", "add appropriate validation" or "write tests for the above", and any type or function that no task defines. The self-review below hunts both.

## Self-Review

Once the plan is written, open the spec again and read it as if it were new to you, comparing the plan to it. Work through this checklist yourself; it is not a job to hand to a subagent.

1. **Spec coverage.** Go through the spec one section at a time. Each requirement must map to a task that delivers it; note every one that does not.
2. **Step scan.** Read each step as the implementer would: there must be exactly one reasonable thing to write, and no step may demand or contain more. A line that settles nothing is a hole. A body that the signature and tests already imply is a transcript. Repair both.
3. **Type consistency.** Check that names, signatures and properties used in a later task are the ones an earlier task defined. A `renderTile()` in Task 2 that turns into `drawTile()` in Task 6 breaks: it fails to compile or fails at run time.
4. **Review Focus.** Take every kind of input or way of failing that the spec hints at, and find the task whose tests reach it. Up to five of the uncovered ones, the most likely to hurt a user, go in the Review Focus section, and each gets its test in the task that owns the code. If that section ends up empty, it means you looked and found none, not that you skipped the look.
5. **Proportion.** Set the plan's length beside the spec's. If the plan is several times longer, it transcribes the program. When code blocks fill most of it, shrink bodies to signatures, test names and assertions, and confirm each step is still unambiguous.

When you find a problem, fix it right there. You need not review again afterwards; fix it and move on. A requirement without a task gets a task.

## Execution Handoff

When the plan is saved and self-reviewed, give your human partner the link to read.

- They may have named an execution method already. Then ask them to read the plan and confirm it matches their intent, hold off implementing until they do, and afterwards use their method.
- If they have not, ask them to read the plan and also pick a method. Implementation waits for both.

**No method named yet. Say this:**

**"The plan is finished and saved at `docs/plans/<filename>.md`. Please read it through. Which way should it be executed?**

- **Subagent-driven** - A new subagent (`bob-builder`) takes each task in turn. A new reviewer inspects a task before the next one starts only if that task is risky or loosely specified, or after every task should you request it. The whole branch is reviewed once at the end. It costs a fresh context for each task and for each task review.
- **Native** - I do every task myself in this session, the way this harness normally runs work, and one new reviewer (`linus-reviewer`) examines the whole branch at the end. It is the cheapest and quickest route, but nothing gets an independent look until then.

**I would pick <one of the two> for this plan, because <one sentence drawn from the plan: how tangled the task interfaces are, the task count, or the price of a mistake that ships>. Does the plan say what you want, and which route do we take?"**

**A method was already named. Say this:**

**"The plan is finished and saved at `docs/plans/<filename>.md`. Please read it through. Does it say what you want?"**

**They choose Subagent-driven:**
- **REQUIRED SUB-SKILL:** Use subagent-driven-development

**They choose Native:**
- **REQUIRED SUB-SKILL:** Use executing-plans
