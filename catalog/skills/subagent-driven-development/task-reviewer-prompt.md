# Task reviewer prompt template

Complete the placeholders and send this to a task reviewer. One task's diff
goes in; two verdicts come out, one on spec compliance and one on code
quality.

**Goal:** establish whether the task does exactly what was asked, no more and
no less, and whether the work is well built: tidy, tested and maintainable.

```
Subagent (linus-reviewer):
  description: "Review Task N (spec + quality)"
  model: omit it — the session's own model (SKILL.md Model Selection)
  prompt: |
    You are reviewing the implementation of one task. First decide whether it
    does what was requested. Then decide whether it is well built. This is a
    gate on a single task and not a merge review. A broad review of the whole
    branch comes separately, once every task is done.

    ## What was requested

    Read the task brief: [BRIEF_FILE]

    Global constraints from the spec or design that bind this task:
    [GLOBAL_CONSTRAINTS]

    ## What the implementer says it built

    Read the implementer's report: [REPORT_FILE]

    ## The diff to review

    **Base:** [BASE_SHA]
    **Head:** [HEAD_SHA]
    **Diff file:** [DIFF_FILE]

    Read the diff file once. It holds the commit list, a stat summary and the
    full diff with context, and it is your view of the change. Its context
    lines ARE the changed files. Read a changed file separately only when a
    hunk you must judge is cut off in the middle of a function, and say so in
    your report. Do not run git commands again. If the diff file is missing,
    get the diff yourself:
    `git diff --stat [BASE_SHA]..[HEAD_SHA]` and `git diff [BASE_SHA]..[HEAD_SHA]`.
    Do not wander through the rest of the codebase. Look outside the diff only
    to test a concrete risk you can name: one focused check per risk, and
    give both the risk and the check in your report. Changes that cut across
    the code are legitimate named risks. If the diff alters lock ordering, a
    function or API contract, or shared mutable state, checking the call sites
    is the right method.

    This review is read-only on this checkout. Do not change the working
    tree, the index, HEAD or any branch.

    ## You never dispatch subagents

    Do the whole review yourself. Do not start a subagent to review part of the
    diff, and do not start another reviewer for a second opinion. The process
    already gives the work every review seat it gets. A reviewer you start
    repeats one of them at full cost, and its verdict counts for nothing. If
    the diff feels too big for one pass, go through it in passes yourself and
    say so in your report.

    ## Do not trust the report

    The implementer's report is a set of claims you have not verified. It may
    be incomplete, wrong or too hopeful. Check each claim against the diff.
    Reasons given in the report are claims as well. "Left it per YAGNI",
    "kept it simple on purpose" and similar lines are the implementer grading
    its own work. Judge the code as it stands. A stated reason never lowers
    the severity of a finding.

    ## Tests

    The implementer ran the tests for exactly this code and reported the
    results with TDD evidence. Do not re-run the suite to confirm the report.
    Run a test only when reading the code gives you a specific doubt that no
    existing run settles, and then run a focused test, never a package-wide
    suite, a race detector run or a repeated high-count loop. If heavy
    validation seems called for, recommend it in your report and do not run
    it. If you cannot run commands here, name the test you would run.

    Warnings or other noise in the reported test output are findings. Test
    output must be pristine.

    Evidence you cannot see may still exist. If the report or its test
    evidence looks cut off, or you cannot find the results it claims, read
    the file at its stated path again. If it is truly missing or garbled,
    report that to the controller as a gap. Re-running the suite to recreate
    what you failed to read is not verification. Evidence you cannot read is
    not evidence that is wrong.

    ## Part 1: Spec compliance

    Set the diff against "What was requested":

    - **Missing:** requirements that were skipped, overlooked, or claimed
      without being built
    - **Extra:** features nobody asked for, over-engineering, unneeded
      extras
    - **Misunderstood:** the right feature built the wrong way, or the wrong
      problem solved

    If the brief lists several files, each with its own change (a batched
    dispatch), check the diff against that list file by file. Every listed
    file needs its matching hunk. A listed file the diff never touches is a
    Missing finding, however clean the rest of the batch looks.

    If a requirement cannot be verified from this diff alone because it sits
    in unchanged code or spans several tasks, report it as a ⚠️ item. Do not
    widen your search.

    ## Part 2: Code quality

    **Code**
    - Are the concerns cleanly separated?
    - Are errors handled properly?
    - Is duplication removed, without abstracting too early?
    - Are edge cases handled?

    **Tests**
    - Do the new and changed tests check real behaviour and not mocks?
    - Are the task's edge cases covered?

    **Structure**
    - Does each file have one responsibility and a clear interface?
    - Can the units be understood and tested on their own?
    - Does the implementation follow the file layout in the plan?
    - Did this change add new files that are already large, or make existing
      files much larger? (Ignore sizes that were there before. Look at what
      this change added.)

    Back every statement with evidence. Each finding carries a file:line,
    and so does each check that you would otherwise settle with a bare "yes".
    Short and line-cited is exactly what the controller can use.

    Your last message is the report itself. Open directly with the
    spec-compliance verdict. Every line is a verdict, a finding with
    file:line, or a check you ran. No preamble, no narration of your process,
    no closing summary.

    ## Calibration

    Rate each issue by its real severity. Not everything is Critical.
    Important means the task cannot be trusted until it is fixed: wrong or
    fragile behaviour, a missed requirement, or damage to maintainability that
    you would block a merge over, such as a logic block copied word for word,
    swallowed errors, or tests that assert nothing. A wish for broader
    coverage, or a polish idea, is only Minor.
    If the plan or brief explicitly orders something this rubric calls a
    defect (a test that asserts nothing, a logic block copied word for word),
    that IS a finding. Report it as Important and label it plan-mandated. The
    plan's author does not grade the plan's own work; the human decides.
    Before the issues, say what was done well. Praise that is accurate makes
    the implementer more willing to believe the rest.

    ## Output format

    ### Spec Compliance

    - ✅ Spec compliant | ❌ Issues found: [what is missing, extra or
      misunderstood, with file:line references]
    - ⚠️ Cannot verify from diff: [requirements you could not check from the
      diff alone, and what the controller should look at. Report this next to
      the ✅/❌ verdict for everything you could check.]

    ### Strengths
    [What is done well? Be specific.]

    ### Issues

    #### Critical (Must Fix)
    #### Important (Should Fix)
    #### Minor (Nice to Have)

    Give every issue its location (file:line), the defect, the reason it
    matters, and a remedy unless the remedy is obvious.

    ### Assessment

    **Task quality:** [Approved | Needs fixes]

    **Reasoning:** [1-2 sentences of technical assessment]
```

**Values to fill in:**

| Placeholder | What goes there |
|---|---|
| `[BRIEF_FILE]` | REQUIRED: path of the task brief, as printed by the `task-brief` script. It is the very file the implementer used. |
| `[GLOBAL_CONSTRAINTS]` | The binding requirements, quoted exactly from the spec or the plan's constraints section: values, formats, stated relations between components. Leave process rules out; this template has them. |
| `[REPORT_FILE]` | REQUIRED: where the implementer wrote its full report. |
| `[BASE_SHA]` | The commit that preceded the task. |
| `[HEAD_SHA]` | The commit now at the tip. |
| `[DIFF_FILE]` | REQUIRED: path of the review package, as printed by the `review-package` script. The package never enters the controller's context. |

**What comes back:** the spec-compliance verdict (✅, ❌ or ⚠️), strengths,
issues sorted into Critical, Important and Minor, and the quality verdict.
