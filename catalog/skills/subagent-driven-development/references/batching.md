# Batching

Companion to subagent-driven-development.

A plan sometimes holds a run of tiny tasks that are all the same kind of edit applied to different files: one line changed, a constant swapped, a field added. When the edits are small and independent, do not dispatch one subagent per task. Write one brief that names every file with its change, give the batch to a single subagent, and review the resulting diff as a whole.

When a task needs thinking of its own, tests of its own, or a separate surface to review, it stays a dispatch of its own.
