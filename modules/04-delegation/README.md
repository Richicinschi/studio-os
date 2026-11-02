---
title: Delegation
pack: way-of-working
sources:
  - .studio/memory/feedback_parallel_delegation.md
  - .studio/memory/feedback_subagent_orchestration.md
  - .claude/skills/improve/SKILL.md
questions:
  - Do you use Claude Code subagents today?
  - Does your work split into independent parts, such as several dashboards or several data sources?
---

# Delegation

The main thread thinks; other threads do the bulk. This module is how the studio splits work.

## The problem

One thread doing everything has two costs. It reads thirty files to find one function, and every file it read stays in its context. And it works through independent parts one after another when they could run at the same time. While it grinds through a long mechanical task, nobody is planning the next step.

## The mechanism

- **Claude orchestrates; subagents execute.** The main thread decides how to break the work down, makes the judgment calls and talks to you. Bulk and mechanical work goes to subagents. A subagent works in its own context window, and only its summary comes back ([docs/facts.md](../../docs/facts.md), "Claude Code: context commands, subagents, extra folders").
- **Independent tracks run in parallel.** At the start of any multi-step work, look for parts that do not touch the same files, and send them out at once, each with a brief that stands on its own. Start the longest tracks first. When one part waits on you, such as a sign-in, stage the work that does not depend on it.
- **Some work stays in the main thread:** decisions about design and about how to split the work, what the memory files should say (a delegate may write the files it is told to), anything across more than one repository, and any task whose brief would be longer than doing it. Git work is no longer a reason to keep a task: an implementer in a git worktree of its own commits and pushes its own branch, and the main thread brings the branches together afterwards.
- **Restraint.** For well-specified, mechanical work, skip the ritual of a fresh implementer plus a spec reviewer plus a quality reviewer for every task. Implement directly, or batch a few edits, then do one review at the end. Keep multi-agent review for complex, risky or ambiguous work. The studio learned this mid-plan, when a run of near-identical implement-then-review rounds was stopped as too repetitive. The early, risky groups had gained from the reviews; the later routine ones had not.
- **`improve` turns an audit into plans.** It surveys a codebase without changing it, ranks findings by impact against effort, and writes self-contained plans that a cheaper model with no context can carry out. Its `execute` variant hands one plan to an executor subagent and reviews the diff. The expensive model does the understanding and the specifying; cheaper ones do the execution. Running it is choosing a cheaper executor on purpose, which the studio's model rule in [module 02](../02-context-and-models/README.md) allows when you ask for it.
- **Long jobs in named containers.** Work longer than a few minutes runs where it can be watched and survives, and heavy work can go to a second machine, when you have one ([long jobs in containers](../../cards/long-jobs-in-containers.md)).

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

When the studio changed its brand, the sweep touched 24 files: mostly mechanical find-and-replace, with a few judgment calls. Claude did it in the main thread, in the foreground, for about 30 minutes. In that time the studio could have been making progress on the next step of its plan in parallel. A self-contained brief to a subagent would have been about 30 lines and could have run alongside.

The rule that came out of it: Claude is the orchestrator, not the executor. Before a long mechanical task, ask whether it can be delegated, and at the start of any multi-step work, name the parallel tracks. It was later reinforced: when work can run in parallel to go faster, it should, split into tasks over separate files with self-contained briefs, all sent out at once.

## Apply it in Claude Code

1. **Spawn a subagent** when the work splits into independent parts (several dashboards, several data sources, many files under one uniform rule), when a search must sweep many files or folders and you need only the conclusion, or when a long mechanical task would block the thinking.
2. **Do not spawn one** when you already know the file, when the task is two or three steps, when the brief would be longer than the work, or when the work needs judgment or spans more than one repository. Git alone is not a reason: give the subagent a worktree of its own and let it commit there.
3. **Brief it like a colleague who has seen nothing.** A subagent does not see your conversation. Give it the goal, what you have already ruled out, the exact files or folders, the rules (what to keep, what to change), what done looks like, and what to send back: conclusions, not file contents.
4. **Send independent briefs together,** in one message, so they run at once, and keep them on separate files. The studio gives each implementer that works in the same repository a git worktree of its own.
5. **Hold back on ceremony:** routine tasks from a detailed plan get one review at the end, not one each.
6. **Keep web research to one agent at a time** if you hit usage limits ([module 02](../02-context-and-models/README.md)).
7. **Adopt [improve](../../catalog/skills/improve/SOURCE.md)** through `vet-and-adopt` as ADAPT when you want an audit turned into plans; then say "audit this repo and write plans". Keep its `LICENSE` with your copy. (studio-specific: its first survey step also reads the studio's root `DECISIONS.md`; drop it or point it at your own decision log.)

## Apply it in claude.ai

Whether the claude.ai chat app has subagents is not documented ([docs/facts.md](../../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), so this route does the splitting by hand:

1. **Split the work** into parts that do not depend on each other, such as one dashboard or one data source each.
2. **Open one chat per part,** all in the same Project, so each starts with the same instructions and knowledge.
3. **Give each chat a brief** of the same shape: the goal, what is ruled out, the inputs, and what done looks like.
4. **End each chat with a result note.** Ask for "a short result note: what you found, what you decided, what is open", and add it to the Project's knowledge as `result-<part>.md`.
5. **Join the parts in a final chat** that reads the result notes, puts them together and reviews the whole once.

Catalog items used: [improve](../../catalog/skills/improve/SOURCE.md).
