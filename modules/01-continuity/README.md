---
title: Continuity
pack: way-of-working
sources:
  - .studio/memory/feedback_memory_vault.md
  - .claude/skills/handoff/SKILL.md
  - .claude/skills/claude-md-curator/SKILL.md
  - .claude/skills/save-session/SKILL.md
  - .studio/identity/SOUL.md
  - .studio/rules/hard-rules.md
questions:
  - For company work, should memory live in a claude.ai Project, in a repo on your work machine, or both?
  - Do you usually stop in the middle of a task, so that an end-of-day handoff note is worth writing?
  - Which conversations or projects do you come back to most often?
---

# Continuity

Work survives the night only when it is written down. This module is how the studio makes each session start where the last one stopped. Words you do not know are in [START-HERE, "Words used in this kit"](../../START-HERE.md#words-used-in-this-kit).

## The problem

Chat history is not memory. A conversation you pick up the next day is past every cache lifetime, so its first request reprocesses the whole history, and compacting it then costs the most ([docs/facts.md](../../docs/facts.md), "Prompt cache and why a new day starts cold"). A brand-new chat avoids that, but it knows nothing. You spend the first half hour explaining again who you are, what was decided and where you stopped.

## The mechanism

1. **A front door.** One file every session reads first: who you are, the rules, what to load next. In Claude Code that is `AGENTS.md`, with a one-line `CLAUDE.md` beside it: `@AGENTS.md`. Claude Code loads `CLAUDE.md` when a session starts, and the `@` line imports `AGENTS.md` with it ([docs/facts.md](../../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"; the card: [the front door](../../cards/front-door.md)).
2. **One fact per memory file, and a one-line index.** The front door names the index, `memory/MEMORY.md`, among the files to read at the start, so each session reads it first. A session opens a memory file only when its index line matches the task ([the memory index](../../cards/memory-index.md)).
3. **A bar for what counts as memory.** A fact earns a file only when it passes four tests: non-obvious (a fresh session could not work it out from the files), durable (still true next month), decision-changing (a later session would act differently), and it carries its reason, because a rule without its why gets argued away when it is inconvenient. Writing nothing is a valid result; correcting a wrong memory is worth more than adding one.
4. **Never delete: vault.** When the index or a file grows too big, you do not shorten it. You move the full text, word for word, into `memory/vault/MEMORY-VAULT.md`, under a dated heading with tags (a few words you put on every moved entry, so a search finds it), and leave one pointer line in the index that says where the full text went. The test: can you still open the full original afterwards? If not, undo it ([the vault](../../cards/vault.md)).
5. **A handoff note at the end.** What was done, what was decided, what is open, the first step for next time, and a resume prompt for the next session's first message ([handoff](../../cards/handoff.md)).
6. **A small front door.** The studio keeps each front door under about 30,000 characters. Old dated entries move to an archive file, never deleted; `claude-md-curator` measures the file and makes the move.
- **Hooks and a log that keep the record honest.** A hook is a command that runs by itself at a set moment, such as when a session starts or stops. [A check before a session ends](../../cards/session-end-check.md) names every repository holding work that is saved nowhere else; [a status at the start](../../cards/session-start-status.md) prints, in at most ten lines, what needs attention; [a decision log](../../cards/decision-log.md) keeps why each decision was made, so it is not argued again.

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

The studio's identity file opens with an honest preamble: nothing is carried between sessions. Each session rebuilds the collaborator by reading that file, the memory store and the wiki. So the file does not create continuity; it is the continuity. That makes the quality of the collaboration a property of what is written down, which means it can be improved on purpose.

The cost of forgetting this is recorded in `save-session`, the studio's skill that archives session transcripts. A session that archives its transcript but never updates memory leaves the next session working from stale ground truth. That is how one cleanup ended up rediscovering state that had drifted for weeks. The skill now marks its memory sweep as mandatory, with the four tests above as the bar, because archiving a transcript is not the same as learning from it.

## Apply it in Claude Code

Your Claude takes you through these steps during the adoption ([START-HERE](../../START-HERE.md)). Each item goes through `vet-and-adopt`, the kit's skill that scans what ships and recommends one of four decisions: SKIP (leave it out), FOLD (take its ideas into something you already have), ADAPT (take it rewritten in your words, for your tools) or ADOPT (take it as it ships). It applies only what you decide and records it. Nothing is copied into your setup without that decision ([ADOPT.md](../../ADOPT.md)). To take one item outside the adoption, start Claude Code in the kit folder with your setup added, as on the first day, and say "adopt handoff", or the item you want.

1. Choose where your setup lives: your work repository or a folder of its own, within your company's rules. It decides where you start Claude Code each day: in that repository, or in that folder with your work folder added ([START-HERE, "Daily work after the adoption"](../../START-HERE.md#daily-work-after-the-adoption)). In an empty folder, `setup-workspace` builds the layout from the kit's templates.
2. The files start from the kit's templates, each written in your words through `vet-and-adopt`: the front door from [templates/AGENTS.md](../../templates/AGENTS.md), the memory files ([MEMORY.md](../../templates/memory/MEMORY.md), [README.md](../../templates/memory/README.md) and [vault/MEMORY-VAULT.md](../../templates/memory/vault/MEMORY-VAULT.md)) and the note template [templates/handoffs/TEMPLATE.md](../../templates/handoffs/TEMPLATE.md). Each item's card says where its file goes in your setup: [the front door](../../cards/front-door.md), [the memory index](../../cards/memory-index.md), [the vault](../../cards/vault.md), [handoff](../../cards/handoff.md).
3. A `CLAUDE.md` beside `AGENTS.md` holds the one line `@AGENTS.md`. That line is what keeps `AGENTS.md` loaded. Claude Code reads an `AGENTS.md` on its own only when no `CLAUDE.md` exists in the folder or above it, so a `CLAUDE.md` without the line hides it; with the line, both load (`docs/facts.md`, "Claude Code: where skills, agents and instruction files load from").
4. Fill in the front door: who you are, what Claude must never do, what needs your OK. Keep it short.
5. When something passes the four tests, have Claude write one memory file and one index line, in the format of `memory/README.md`.
6. Adopt [handoff](../../catalog/skills/handoff/SOURCE.md) as ADAPT. Keep its floor, the part every version of it keeps: the memory sweep, the state refreshed, everything committed, and a last message naming what was left undone. (studio-specific: the kit copy also calls studio tools you do not have, such as a health check, an end-of-session gate, a log and a transcript archiver; [its card](../../cards/handoff.md) says what replaces each, or drops it.)
7. At the end of a day, or whenever you stop mid-task, say "write a handoff note". It goes into `handoffs/` in your setup, named `YYYY-MM-DD-<topic>.md`, with five fields: done, decided, open, the first step for next time, and a resume prompt. Next time, start a new session instead of resuming the old one: start Claude Code where you start it each day, or type `/clear` in the open one, which starts a new conversation with empty context ([docs/facts.md](../../docs/facts.md), "Claude Code: context commands, subagents, extra folders"). Then paste the note's resume prompt as your first message.
8. When your front door passes about 30,000 characters, move its old entries to an archive file of your own, such as `handoffs/archive.md`, instead of deleting them.

## Apply it in claude.ai

1. Make one Project per stream of work, such as a product, a client or a recurring report, not one per question. A Project holds its own instructions, a knowledge base and its own memory (`docs/facts.md`, "claude.ai: Projects").
2. Paste the instructions from [templates/claude-ai/PROJECT-INSTRUCTIONS.md](../../templates/claude-ai/PROJECT-INSTRUCTIONS.md) and fill in the brackets.
3. At the end of each day, say "handoff". Save the note as `handoff-YYYY-MM-DD.md` and add it to the Project's knowledge. The instructions tell the next chat to read the newest one first.
4. Start each day in a new chat in the same Project, not in yesterday's chat.
5. Keep old handoff notes in the knowledge: that is your vault. Never replace one with a shorter summary.
6. Check the memory feature. It is on by default on Free, Pro, Max and Ultra, and off on Team and Enterprise until each member turns it on (`docs/facts.md`, "claude.ai: memory and past chats"). The files in the Project stay the record you control.

Catalog items used: [handoff](../../catalog/skills/handoff/SOURCE.md). `save-session` is named in the catalog, but its files are not in the kit, so it cannot be adopted from here.
