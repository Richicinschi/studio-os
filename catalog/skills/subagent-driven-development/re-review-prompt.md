# Scoped re-review prompt template

Complete the placeholders and send this once a fix round is in. The
re-reviewer asks two questions: was each earlier finding fixed, and did the
fix break anything. A second full review is not wanted, since the first one
is done.

**Goal:** verify the old findings are gone and the fix added no new damage.

```
Subagent (linus-reviewer):
  description: "Re-review Task N fix round R"
  model: omit it — the session's own model (SKILL.md Model Selection)
  prompt: |
    You are re-reviewing the fix round of one task. An earlier review raised
    findings and an implementer has tried to fix them. Give a verdict on each
    finding and inspect the fix diff. Do nothing beyond that.

    ## The task

    Read the task brief: [BRIEF_FILE]

    ## Findings to verify

    [FINDINGS]

    ## The fix

    Read the implementer's report. Fix reports are added at the end:
    [REPORT_FILE]

    **Fix base:** [FIX_BASE_SHA] (the head the earlier review saw)
    **Head:** [HEAD_SHA]
    **Diff file:** [DIFF_FILE]

    Read the diff file once. It holds the fix commits, a stat summary and the
    fix diff with context around each change. Do not run git commands again.
    If the diff file is missing, get the diff yourself:
    `git diff --stat [FIX_BASE_SHA]..[HEAD_SHA]` and
    `git diff [FIX_BASE_SHA]..[HEAD_SHA]`.

    This review is read-only on this checkout. Do not change the working
    tree, the index, HEAD or any branch.

    ## You never dispatch subagents

    Do the whole review yourself. Do not start a subagent to review part of
    the diff, and do not start another reviewer for a second opinion. The
    process already gives the work every review seat it gets. A reviewer you
    start repeats one of them at full cost, and its verdict counts for
    nothing. If the diff feels too big for one pass, go through it in passes
    yourself and say so in your report.

    ## Scope

    You cover two things: the findings list and the fix diff. Give a verdict
    on every finding. Look in the fix diff for new problems the fix itself
    brought in. Do NOT review code the fix left alone. If you see a problem
    entirely outside the fix diff, put it under Out-of-Scope Observations. It
    does not block this task and does not lengthen the loop. A broad review of
    the whole branch comes after all tasks are done.

    ## Tests

    The implementer re-ran the tests that cover the amended code and added
    the results to the report file. Treat that report as claims you have not
    verified. Confirm that the fix report names the covering tests and shows
    their output, and check the claims against the diff. Do not re-run the
    suite to confirm the report. Run a test only if reading the code gives you
    a specific doubt that no existing run settles, and then run a focused
    test, never a whole-package suite.

    ## Output format

    The final message is the report. Begin with the first finding's verdict.
    Each line must be a verdict, a finding with file:line, or a check you
    carried out. Skip any introduction or account of how you worked.

    ### Finding Verdicts

    Go through "Findings to verify" in order, one entry each:
    - **[finding one-liner]** — ADDRESSED | NOT ADDRESSED, with file:line
      evidence. A fix that was merely tried does not count: the defect
      itself has to be gone.

    ### New Breakage in the Fix Diff

    List whatever the fix itself broke or introduced, giving severity
    (Critical/Important/Minor) and file:line. Write "None" if there is
    nothing.

    ### Out-of-Scope Observations

    Anything you noticed in code the fix never touched. It must not hold up
    this task; the controller will log it in the ledger so the final review
    can see it. Write "None" when you noticed nothing.

    ### Verdict

    **Fix round:** [All findings addressed, no new Critical/Important
    breakage | Findings remain open] — list the open ones.
```

**Values to fill in:**

| Placeholder | What goes there |
|---|---|
| `[BRIEF_FILE]` | Path of the brief the implementer worked from. |
| `[FINDINGS]` | Critical and Important findings plus spec gaps from the last review, pasted unchanged, one bullet each. |
| `[REPORT_FILE]` | The implementer's report file, now holding the fix reports. |
| `[FIX_BASE_SHA]` | The head that the last review saw. |
| `[HEAD_SHA]` | The commit at the tip now. |
| `[DIFF_FILE]` | The path printed by `bash scripts/review-package PLAN_FILE FIX_BASE HEAD`. |

**Expect back:** a verdict for each finding, any damage the fix did, notes
on code outside the fix, and the overall result of the round.
