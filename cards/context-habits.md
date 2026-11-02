---
id: context-habits
module: 02-context-and-models
checked: 2026-11-02
---

# Context habits

## Why

- **The problem:** long threads wear out. Every turn carries the history before it, so a thread that runs for dozens of turns gets heavier with each one. Near its limit Claude Code compacts it (summarizes it to free room), and an instruction given only in the conversation can be lost. Picking yesterday's thread back up costs the most: it is past every cache lifetime, so its first request reprocesses all of it ([docs/facts.md](../docs/facts.md), "Prompt cache and why a new day starts cold").
- **The reason:** the state lives in files, so a thread can stay short. Four habits keep it that way: a fresh session per day or per task that starts from the handoff note; `/compact` at a natural break, with a line saying what to keep; bulk reading handed to a subagent (a helper with its own context window, which sends back only its summary); and `/context` to look at the load.
- **The cost of skipping it:** a thread keeps everything it has read. The studio once spent about half an hour of its main session, and that session's context, on a 24-file mechanical sweep that a subagent could have run alongside ([the sweep done by hand](../examples/sweep-done-by-hand.md)).
- **The principle:** [load only what is needed](../PRINCIPLES.md#load-only-what-is-needed). A fresh session carries the front door and one note, not yesterday's whole conversation.

## Detect

Read-only, at the root of your setup folder. Sizes, counts and one question; no file's content is printed.

- What every fresh session starts with, the front door and the files it imports (a line starting with `@` loads that file at launch): `wc -c CLAUDE.md AGENTS.md 2>/dev/null`, then `grep -hE '^@' CLAUDE.md AGENTS.md 2>/dev/null` for the imported files, whose sizes Claude adds with `wc -c`. Claude reports the sum as tokens (an estimate: bytes divided by 4).
- How the identity files load: imported into every session (`grep -cE '^@identity/' CLAUDE.md AGENTS.md 2>/dev/null`), or named in the front door for Claude to read when needed (`grep -c 'identity/' AGENTS.md 2>/dev/null`).
- Whether there is a note to start from: `ls handoffs/ 2>/dev/null | grep -cE '^[0-9]{4}-[0-9]{2}-[0-9]{2}'`.
- The habit itself is not in any file, so Claude asks one question: "When you come back the next day, do you start a new session, or carry on in yesterday's?"

The menu marks the item **have** when you start fresh and there is a handoff note to start from; **partly** when only one of the two is true; and **not yet** when neither is.

## Ask

1. **"How do you pick up work?"**
   - A fresh session each day or task, which reads the newest handoff note. Recommended when Detect finds handoff notes, or the [handoff note](handoff.md) is on your plan.
   - `/clear` in the window you already have open when a new task starts: the same empty conversation, with project memory kept.
   - Keep resuming the old thread. Fits only threads that stay short; the first request after a long gap reprocesses all of it.
   - Not sure: the recommended option above, a fresh session each day or task: Claude suggests one at your next new task and tries the habit with you for a week; nothing is written into your files.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Write the habits into the front door?"** Then Claude also reminds you of them.
   - Yes: a short "Context" section, about 74 tokens every session (estimate), so Claude suggests a note and a fresh session when the task changes or the thread runs long, suggests `/compact` at a natural break, and offers a subagent for wide reading. Recommended when Detect puts the front door and its imports under 1,000 tokens (estimate).
   - No: they stay your habits, and Claude's behaviour is unchanged. Recommended when the front door is already at 1,000 tokens or more (estimate), the point at which the kit's feature menu calls an item heavy.
   - Not sure: the recommended option above for what Detect measured.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no section.
3. **"Identity files: imported, or read when needed?"** Asked only when Detect finds them imported and the front door with its imports is at 1,000 tokens or more (estimate).
   - Keep them imported: every session loads them at launch, for certain.
   - Import the contract (`RELATIONSHIP.md`) only, and name the others in the front door for Claude to read when a task needs them. Recommended in this case.
   - Not sure: the recommended option above: import the contract only, and name the others in the front door; the [identity files](identity-user.md) card decides this in full.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.

## Needs

- Claude Code. The commands `/clear` (also `/reset` and `/new`), `/compact`, `/context` and `/autocompact` are described in [docs/facts.md](../docs/facts.md), "Claude Code: context commands, subagents, extra folders" and "Claude Code: measuring context and asking multiple choice".
- In claude.ai: a Project for the stream of work ([claude-ai-project](claude-ai-project.md)); the commands above are Claude Code's.

## Steps

1. **Claude:** runs `vet-and-adopt` for this item. This card is the whole item, so there is no file to scan; it compares the habits with what Detect found and recommends.
2. **you:** at the end of today, have Claude write a handoff note ([handoff note](handoff.md)).
3. **you:** next time, start a new session: type `/clear` in the open one, or close it and start Claude Code again in your setup folder. Ask "where did we stop?", or paste the note's resume prompt.
4. **you:** at a natural break inside one task, run `/compact` with a line on what to keep, for example `/compact keep the schema decisions and the failing query`. When the next part is a different task, use `/clear` instead.
5. **you:** when Claude is about to read many files to find one thing, say: "Give this search to a subagent, and bring back only the conclusion."
6. **you:** now and then, type `/context` to see the load by category, including which `CLAUDE.md` and auto memory files loaded. Read it yourself: its units are not documented, and whether its output reaches Claude is not documented either.
7. **Claude:** if you said yes to question 2, adds the "Context" section to the front door in your words; if you chose the split in question 3, changes the identity lines. Both as a merge, with the diff shown.
8. **Claude:** records the decision, the scope (your habits only, or the front door too), any change to the front door, and the undo in `adoption/decisions.md`.

## Check

1. **you:** the next working day, in a fresh session (a new terminal, or after `/clear`), ask "where did we stop?" as the first message. Expected: Claude reads the newest note in `handoffs/`, names it, and answers with its open items and its first step, without you explaining anything.
2. **you:** type `/context` after that answer and look at what loaded; compare the categories with what Detect measured (not the numbers, whose units are not documented).

If Claude cannot answer from the note, the item is not done: the plan row stays unticked. The usual cause is a front door that does not name `handoffs/`, or no note written the evening before.

## Undo

- **Claude:** removes the "Context" section, and puts back the identity lines as they were, from the diff it showed.
- The habits themselves stop when you stop them; no other file changed.

## Watch out

- **`/compact` after a long break costs the most.** Compacting after a gap reprocesses the whole history as uncached input. Compact while you are still working, at a break, not the next morning.
- **Switching model mid-thread** with `/model` makes the next request read the whole conversation with no cache hits. Choose the model at the start of the session.
- **Cache lifetimes.** On a Claude subscription within plan usage, the main conversation's cache lives one hour; on usage credits or an API key, five minutes; a subagent's, five minutes. To see which applies to you: `claude -p "hello" --output-format json`, then read `usage.cache_creation`.
- **What survives a compaction.** The project-root `CLAUDE.md`, unscoped rules and auto memory are read again from disk; skill bodies are capped. Instructions given only in the conversation can be lost, so anything you want kept goes into the front door. `/autocompact` sets an earlier trigger, for example `/autocompact 500k`.
- **Subagents have a cost of their own.** In the studio, nine research agents sent out in parallel used about 1.1 million subagent tokens together and hit the session limit; the last two failed mid-run and had to be run again. The figure is the studio's own record of those runs, not re-measured for the kit ([module 02, Evidence](../modules/02-context-and-models/README.md#evidence)). If you hit usage limits, run research agents one at a time.
- **Token cost.** The "Context" section written for this card was 296 bytes, about 74 tokens every session (estimate, bytes divided by 4). The habits themselves load nothing.
- **claude.ai:** one chat per task inside the Project; when a chat runs long or drifts, ask for a handoff note, add it to the Project's knowledge, and go on in a new chat. How claude.ai caches chats is not documented in docs/facts.md as of 2026-11-02; a fresh chat per task does not depend on it.
