---
title: Context and models
pack: way-of-working
checked: 2026-11-02
sources:
  - .studio/memory/feedback_agents_parent_model.md
  - .studio/memory/feedback_subagent_orchestration.md
questions:
  - "Which tasks fill most of your Claude time: exploring data, writing SQL or Python, building agents, writing documents, or reviewing work?"
  - Which plan are you on, and do you hit usage limits?
  - Do your chats run long, dozens of turns on one problem?
---

# Context and models

A thread is a working space, not a filing cabinet. This module is how the studio keeps each thread short and picks the model for the work in front of it.

## The problem

Long threads wear out. Every turn carries the history before it, so a thread that runs for dozens of turns gets heavier with each one. Near its limit Claude Code compacts it automatically, and an instruction given only in the conversation can be lost. Picking yesterday's thread back up is the costliest case: it is past every cache lifetime, so the first request reprocesses all of it ([docs/facts.md](../../docs/facts.md), "Prompt cache and why a new day starts cold").

The model, meanwhile, is usually whatever was selected last time. That is a habit, not a choice.

## The mechanism

- **One task, one fresh session.** State lives in files, not in the thread ([module 01](../01-continuity/README.md)). A new task starts a new session that reads the front door and, when the work continues, the newest handoff note.
- **Clear or compact on purpose.** `/clear` starts an empty conversation and keeps project memory. `/compact` summarizes the conversation so far, focused by any instructions you pass it. Exact commands and effects: `docs/facts.md`, "Claude Code: context commands, subagents, extra folders". Compact at a natural break while you are still working, not after a long gap, when it reprocesses the whole history uncached.
- **Side work goes to subagents.** A subagent works in its own context window, and only its summary comes back. A search across forty files then costs the main thread a paragraph, not forty file dumps. [Module 04](../04-delegation/README.md) covers when and how.
- **The model is chosen per task,** by Anthropic's own guidance, summed up in the table below from `docs/facts.md`, "Models: which for what". Choose at the start of a session: switching with `/model` mid-thread makes the next request read the whole conversation with no cache hits.
- **The studio's subagent rule.** A subagent whose definition has no `model` line runs on the main conversation's model, unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"). The studio leaves the line out, so its subagents inherit the parent model. It never sets a cheaper model on a subagent just to save tokens, because a silent downgrade gives weaker results nobody agreed to; a different model is set only when someone asks for it for a specific agent. This departs on purpose from Anthropic's note that Haiku suits subagent tasks. It is a choice of quality over cost, and yours may differ. One standing exception: a wide web-research fan-out runs on a smaller model, the `sonnet` alias, one agent at a time. Agents that build or review keep the parent model.
- **Rules on demand.** Rules that apply only to some work live in their own files, and the front door holds a short table of which file to read before which task, so they cost nothing until needed ([rules on demand](../../cards/rules-on-demand.md); the habits above are [context habits](../../cards/context-habits.md)).

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

The exception has a history. The studio once sent nine research agents out in parallel, all on the parent model. Together they burned about 1.1 million subagent tokens and hit the session limit; the last two died mid-run with HTTP 429 errors and had to be run again. Run one at a time on `sonnet`, the same research finished at comparable quality, each agent still using about 190,000 to 230,000 tokens and more than 80 tool calls. These figures are the studio's own record of those runs, not re-measured for the kit. Research is search-and-cite work, not limited by reasoning, so the smaller model cost little there, and the slower wall clock was a smaller loss than losing the session.

The general lesson: pick the model by the kind of work, and remember that parallel agents have a rate cost of their own.

## Apply it in Claude Code

1. **New task, new session.** Open with the front door and, if the task continues earlier work, the newest handoff note.
2. **Pick the model before the first message,** from the table, with `/model` or its alias. Claude Code's default on the Pro, Max, Ultra, Team and Enterprise plans and on the API is Opus 5.5.
3. **At a natural break inside one task,** run `/compact` with a line on what to keep, for example `/compact keep the schema decisions and the failing query`. When the next part is a different task, run `/clear` instead.
4. **Never resume yesterday's thread to carry on.** End it with a handoff note, start fresh tomorrow, and paste the note's resume prompt.
5. **Delegate searches and wide reading** to a subagent, and ask for conclusions, not file contents.
6. **Run web research one agent at a time,** if you hit usage limits.
7. **To see which cache lifetime applies to you,** run `claude -p "hello" --output-format json` and read `usage.cache_creation`.

| Kind of work | Model | Alias in Claude Code |
|---|---|---|
| Not sure which: most workloads | Opus 5.5 | `opus` |
| Long autonomous coding, large refactors, computer use | Opus 5.5 | `opus` |
| Multi-hour agent sessions, deep research, demanding reasoning: the hardest and longest-running tasks | Fable 5.1 | `fable` |
| Everyday coding, data analysis, content | Sonnet 5.5 | `sonnet` |
| Simple tasks; real-time, high-volume, cost-sensitive work; subagent tasks | Haiku 5.5 | `haiku` |

Effort is a second dial; its levels are under the same heading in `docs/facts.md`.

## Apply it in claude.ai

1. **One chat per task,** inside the Project for that stream of work. The Project's instructions and knowledge carry the context, so a new chat starts informed instead of cold.
2. **When a chat runs long or drifts,** ask for a handoff note, add it to the Project's knowledge, and go on in a new chat.
3. **Pick the model per chat** from the same table. The claude.ai model menu lists Haiku 5.5, Sonnet 5.5, Opus 5.5 and Fable 5.1, with older models. Which plan gets which model, and which one is the default, is not documented (`docs/facts.md`, "Models: which for what").
4. **Caching:** how claude.ai caches chats is not documented either; a fresh chat per task does not depend on it.

Catalog items used: [sherlock-researcher](../../catalog/agents/sherlock-researcher.md), the research agent in the story (module 08 covers the agents). The habits on this page are one menu item with its card: [context habits](../../cards/context-habits.md).
