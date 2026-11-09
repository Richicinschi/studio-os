# Pre-flight scan

Companion to subagent-driven-development. Do it one time, before Task 1 goes out.

The aim is to catch conflicts in the plan while they are cheap. Go through the plan once and record each check as you make it. Look for:
- tasks that contradict each other, or contradict the Global Constraints section of the plan;
- anything the plan orders that the review rubric counts as a defect, for example a test that asserts nothing or a block of logic pasted twice.

The scan produces a table. A bare verdict does not count. The rows:

| Row for | Contents |
|---|---|
| Each pair of tasks that touch the same file or interface | the two task numbers, what the first produces, what the second consumes, and your finding |
| Each task | whether its text is self-consistent: tests it specifies against code it specifies, files it creates against files it modifies later |

If you write "the scan is clean" with no rows behind it, you did not do the scan.

Put the table in the ledger. Resolve every finding before execution begins: set it against the plan wording that demands it, treat the spec as the final authority, and write the ruling beside the row. If nothing turns up, carry on without comment and dispatch Task 1. Conflicts that only emerge once code exists are left to the review loop as the safety net.
