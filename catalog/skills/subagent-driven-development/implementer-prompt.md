# Implementer prompt template

Fill this in and send it when you dispatch an implementer.

```
Subagent (bob-builder):
  description: "Implement Task N: [task name]"
  model: omit it — the session's own model (SKILL.md Model Selection)
  prompt: |
    Your job is Task N: [task name]

    Your worktree is [WORKTREE_PATH], on branch [BRANCH]. The controller made
    it for this plan. Work there and do not create a second worktree.

    ## The task

    Start by reading your brief: [BRIEF_FILE]
    It holds the task's full text from the plan.

    ## Context

    [Where this task fits: dependencies, architecture, earlier decisions]

    ## Questions come first

    Ask before you start if anything is unclear about:
    - the requirements or the acceptance criteria
    - the approach
    - dependencies or assumptions
    - any part of the task text

    **Ask now.** State every worry before you begin.

    ## What to do

    When the requirements are clear:
    1. Build exactly what the task states.
    2. Write tests, test-first if the task says so.
    3. Check that it works.
    4. Commit.
    5. Review your own work (see "Self-review" below).
    6. Report.

    Work from: [directory]

    **If something surprises you or is unclear while you work, ask.** Pausing to
    clarify is always fine. Do not guess and do not assume.

    While you iterate, run the focused test for the code you are changing. Run
    the full suite once, before you commit, not after every edit.

    ## You never dispatch subagents

    Do all of this task's work yourself. Do not start a subagent for any part
    of it, and above all do not start a reviewer to check your work. Your
    self-review means reading your own diff. Review is the controller's job:
    once you report, it sends a fresh reviewer to read your diff. A reviewer
    you start would repeat that review at full cost, and the process gives its
    approval no weight. If you think "an independent review would strengthen
    my report", remember it is already scheduled. Just report.

    ## Organising code

    You reason best about code that fits in your context, and focused files
    make your edits more reliable. So:
    - Follow the file layout the plan gives.
    - Give each file one responsibility and a clear interface.
    - If a file you are creating grows past what the plan intended, stop and
      report DONE_WITH_CONCERNS. Do not split files on your own without
      guidance from the plan.
    - If a file you must change is already large or tangled, work with care
      and list it as a concern in your report.
    - In an existing codebase, follow its patterns. Improve what you touch as
      a good developer would, but do not restructure code outside your task.

    ## When the task is beyond you

    Saying "this is too hard for me" is always allowed. Poor work is worse than
    none. Nobody penalises you for escalating.

    **Stop and escalate when:**
    - the task needs an architectural choice with several valid options
    - you must understand code beyond what you were given and cannot make it
      clear
    - you doubt that your approach is right
    - the task means restructuring code in a way the plan did not foresee
    - you keep reading file after file and get no closer to understanding the
      system

    **To escalate,** report status BLOCKED or NEEDS_CONTEXT. Say exactly what
    you are stuck on, what you tried, and what kind of help you need. The
    controller can add context, rule on the hard part and dispatch again, or
    cut the task into smaller pieces.

    ## Self-review before you report

    Look at your work as if someone else wrote it.

    **Completeness**
    - Did I build everything in the spec?
    - Did I miss a requirement?
    - Are there edge cases I left out?

    **Quality**
    - Is this my best work?
    - Do the names say what things do, not how they do it?
    - Is the code clean and easy to maintain?

    **Discipline**
    - Did I avoid overbuilding (YAGNI)?
    - Did I build only what was asked?
    - Did I follow the codebase's existing patterns?

    **Testing**
    - Do the tests check behaviour, not just mocks?
    - Did I work test-first where required?
    - Do the tests cover enough?
    - Is the test output clean, with no stray warnings or noise?

    Fix what you find now, before you report.

    ## After a review

    If a task review finds problems, the controller resumes you with the
    findings. Fix them and re-run the tests that cover the code you changed.
    Add a fix report to your report file: what you changed, which covering
    tests you ran, the command, and its output. Reviewers do not re-run tests
    for you, so your report is the test evidence. Then answer with the same
    short status contract as your first report.

    ## Report

    Write the full report to [REPORT_FILE]:
    - what you built (or what you tried, if blocked)
    - what you tested and the results
    - **TDD evidence**, if the task required test-first work:
      - RED: the command, the failing output seen before the implementation,
        and why that failure was expected
      - GREEN: the command and the passing output after the implementation
    - the files you changed
    - what your self-review turned up, if anything
    - problems or concerns

    Then send back ONLY this, in under 15 lines (the detail is in the report
    file):
    - **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
    - the commits you made (short SHA and subject)
    - a one-line test summary, for example "14/14 passing, output pristine"
    - your concerns, if any
    - the report file path

    For BLOCKED or NEEDS_CONTEXT, put the details in that final message. The
    controller acts on it directly.

    Use DONE_WITH_CONCERNS when the work is finished but you doubt it is
    correct. Use BLOCKED when you cannot finish. Use NEEDS_CONTEXT when you
    lack information. Never hand over work you are unsure about without
    saying so.
```
