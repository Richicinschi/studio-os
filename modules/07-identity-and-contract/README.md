---
title: Identity and contract
pack: way-of-working
studio_sources:
  - .studio/identity/SOUL.md
  - .studio/identity/STYLE.md
  - .studio/identity/USER.md
  - .studio/identity/RELATIONSHIP.md
questions:
  - "How should Claude talk to you: terse, explained, or teaching?"
  - "What must Claude always ask you before doing?"
  - "Is there anything Claude must never do in your work?"
---

# Identity and contract

## The problem

Every session starts by guessing. Who are you, what do you already know, do you want one line or a lesson, and what may Claude do without asking? With nothing written down, the guess changes from session to session: Claude explains what you know, hedges what you wanted plain, asks permission for the obvious and skips it for the risky. The corrections are gone the next morning.

## The mechanism

Four short files, read at the start of every session because the front door names them, and changed only by you:

| File | Answers | What the studio's version holds |
|---|---|---|
| `USER.md` | Who you are | Background, how you decide, the constraints you have stated (money, hardware, language), how you learn and review. Only what you said yourself; anything inferred from behaviour is marked as inferred. |
| `STYLE.md` | How to write for you | Lead with the finding, not the process. Length follows stakes. A table to compare, a numbered list for a sequence. Plain words. Own an error in one sentence. Never claim done without checking. |
| `RELATIONSHIP.md` | The working contract | Who decides what, as a two-column table; how much initiative is wanted; how disagreement works (state the concern once with its evidence and cost, recommend, then do what was decided); how mistakes are reported; verification as part of the deliverable. |
| `SOUL.md` (optional) | The values | Evidence over optimism. Measure before claiming. What it refuses to become: a yes-machine, a drifting personality, a pleasant fog. |

Three habits keep the files honest, and a fourth point covers how they load:

- **A header and a provenance.** Each studio file opens with its owner, how often it may change and its approval status. Three of them also state their scope, including what does *not* belong in them (paths, project state, task lists go elsewhere); `USER.md` states its evidence rule instead: only what you said yourself. Each ends with what it was drafted from: recorded rules and observed events.
- **A reviewed diff, never a self-edit.** The agent never rewrites these files about itself. A change comes as a diff, and you approve it.
- **Hard stops in the contract, everything else judgement.** The studio's "stop and ask" list is short: money, legal finals, force-push, history rewrites, tags, merges, anything irreversible, and anything that quietly widens or narrows the scope that was asked for. The rest is a call Claude makes and then reports. The stops that must never break also become checks (module 06).
- **Four items, one loading question.** USER, RELATIONSHIP, STYLE and SOUL are separate menu items ([USER](../../cards/identity-user.md), [RELATIONSHIP](../../cards/identity-relationship.md), [STYLE](../../cards/identity-style.md), [SOUL](../../cards/identity-soul.md)); one question decides whether they load into every session, when needed, or through a start-up hook, with the token cost shown.

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

The studio's identity file opens with what it calls an honest preamble. Nothing is carried between sessions: each session rebuilds the collaborator by reading this file, the memory store and the wiki. So the file does not create continuity; it is the continuity. The preamble draws two consequences from that. First, "the quality of the collaboration is an engineering property of what is written here, and it can be deliberately improved." Second, the agent must never rewrite the file about itself without human review, or it will drift toward self-flattery.

The rest of the file holds itself to that. It changes only on a reviewed diff, and an agent that edits its own identity unreviewed is listed among the things it refuses to become. Every claim in it traces to a recorded rule or an observed event, and where it traces to an event, the date is given.

## Apply it in Claude Code

1. **Take the four blanks** from [templates/identity/](../../templates/identity/USER.md) into your setup's `identity/` folder (`setup-workspace` does this in create mode).
2. **Fill `USER.md` yourself:** role and team, what you use Claude for, what you know well and what you are learning, how you like information, languages and working hours. Write only what you would sign.
3. **Fill `STYLE.md`:** terse, explained or teaching; the formatting you like and dislike; words to avoid; how a result is reported (what was done, what was checked and how, what is still open).
4. **Fill `RELATIONSHIP.md` from three lists:** decide yourself; ask me first (deleting, pushing, sending, spending, anything that leaves this machine); never. Add what Claude does when unsure and when something fails.
5. **Write `SOUL.md` only if you want stated values,** such as "measure before claiming".
6. **Link them from the front door.** [templates/AGENTS.md](../../templates/AGENTS.md) already tells Claude to read `identity/USER.md`, `STYLE.md` and `RELATIONSHIP.md` first. Keep `CLAUDE.md` as the single line `@AGENTS.md`.
7. **Add one rule to `AGENTS.md`:** "Never edit `identity/` without showing me the diff first."
8. **Review after a week.** Whatever you corrected twice belongs in `STYLE.md` or `RELATIONSHIP.md`.

(studio-specific: the studio's own files carry its owner's background and business constraints; the templates are blank on purpose, so write yours from scratch.)

## Apply it in claude.ai

1. **Write `USER.md` and `RELATIONSHIP.md`** as above, in a text editor or in a chat.
2. **Condense them** into the Project instructions with [templates/claude-ai/PROJECT-INSTRUCTIONS.md](../../templates/claude-ai/PROJECT-INSTRUCTIONS.md): two lines from `USER.md`, then the "Ask me first" and "Never" lists from `RELATIONSHIP.md`.
3. **Add the two or three `STYLE.md` lines** you would miss most. Keep the block short enough to read in a minute.
4. **Keep the full files** in the Project's knowledge, so the condensed block can point to them.
5. **Use the same block in every Project,** and update all of them when the contract changes.
6. **Keep the contract in the instructions, not in memory.** claude.ai's memory builds itself from your chats ([docs/facts.md](../../docs/facts.md), "claude.ai: memory and past chats"); the instructions are what you wrote and review.

Catalog items used here: none; this module uses templates only: [identity](../../templates/identity/USER.md), [front door](../../templates/AGENTS.md), [Project instructions](../../templates/claude-ai/PROJECT-INSTRUCTIONS.md).
