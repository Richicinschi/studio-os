---
title: The sweep done by hand
sources:
  - .studio/memory/feedback_parallel_delegation.md
---

# The sweep done by hand

## What happened

After a change to the studio's branding, 24 files needed updating: mostly mechanical find-and-replace, with a few judgment calls. Claude did all of it in the main thread, in the foreground, for about 30 minutes. During that time the studio and Claude could have been moving the next step of the project forward in parallel.

The studio said so, and named the model it wanted: Claude is the orchestrator, not the executor. The orchestrator's job is to keep several tracks moving, delegating what it can and doing the high-judgment work itself.

## What it cost, or would have

About half an hour of the main session, and its context, spent on work that needed almost no judgment. A self-contained prompt to a subagent would have been about 30 lines, and could have run while the main thread went on. The same shape comes back with every "search and replace across the repository" task.

## The rule it produced

When a task is long but mechanical, delegate it and keep working.

- Before a multi-step mechanical task, ask whether it can be delegated. Bulk edits over many files, where each file is independent and the rule is uniform, go to a subagent with a self-contained prompt.
- At the start of multi-step work, find the parallel tracks. While the person does something only they can do, such as a dashboard or an account setting, stage the work that does not wait on it.
- Some work stays in the main thread: architecture and judgment calls, deciding how to split the work, what the memory should say (a delegate may write the files it is told to), anything across more than one repository, and any task where the prompt would be longer than the work. Git work, once on that list, no longer is: an implementer in its own worktree commits and pushes its own branch, and the main thread brings the branches together.
- The prompt carries everything, because a subagent does not see the conversation: the goal, the exact files, the exact rules, what to keep and what to rewrite, and how to tell it is done.

Later the studio made it stronger: if work can run in parallel, it should. A phase now starts by splitting the work into tasks over separate files, each with its own brief, and dispatching every independent one at once. Implementers in the same repository each get their own worktree. One exception stays: web-research agents run one at a time.

## How to apply it

- Before a sweep starts, ask two questions: is it mechanical, and is each file independent? Two yeses make it a subagent's job. In Claude Code, `dispatching-parallel-agents` covers running independent tasks side by side.
- Give each subagent the five things above. If writing the brief would take longer than the work, do the work.
- The catalog's [improve](../catalog/skills/improve/SOURCE.md) skill turns an audit into small plans that a cheaper executor can run. Take it through `vet-and-adopt` first.
- In claude.ai, whether the chat app has subagents is not documented ([docs/facts.md](../docs/facts.md)). Split the sweep into separate chats in one Project, one part each.
