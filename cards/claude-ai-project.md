---
id: claude-ai-project
module: 11-workspace-layout
checked: 2026-11-02
tokens:
  light: 116
  standard: 130
  full: 151
---

# The claude.ai Project instructions

## Why

- **The problem:** a new claude.ai chat knows nothing, and a long one gets heavy. Without a place that holds your context, you either carry on in yesterday's chat or explain everything again in a new one.
- **The reason:** a Project holds its own instructions and a knowledge base of documents, text and files ([docs/facts.md](../docs/facts.md), "claude.ai: Projects"). Its instructions tell every new chat who you are, what needs your OK, and to read the newest handoff note first; the notes in its knowledge carry the work from one chat to the next.
- **The cost of skipping it:** a chat works from what it is given and nothing else; without the instructions and the note, where you stopped exists only in a chat the next one does not see ([module 01, Evidence](../modules/01-continuity/README.md#evidence)).
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). The Project's instructions and its notes are the written state; each chat is short and starts from them.

## Detect

Claude Code cannot see your claude.ai account, so most of this is three questions you answer. The read-only part, in your setup folder:

- Whether your adoption records say you use claude.ai: `grep -ciE 'claude\.ai' adoption/spec.md adoption/inventory.md 2>/dev/null`.
- If you keep a copy of a Project's instructions in your setup, how many lines still hold a template prompt (a `<...>` placeholder): `grep -cE '<[a-z][^>]*>' <that file>`.
- Then, one yes or no each:
  1. Is there a Project for this stream of work?
  2. Do its instructions tell a new chat to read the newest handoff note first?
  3. Does its knowledge hold at least one note named `handoff-YYYY-MM-DD.md`?

The menu marks the item **have** when all three answers are yes; **partly** when a Project exists but one of the other two is no; and **not yet** when there is no Project for this work.

## Ask

1. **"Size?"** Each estimate is the instruction block before you fill it, bytes divided by 4; it grows with your lists. How claude.ai brings a Project's instructions and knowledge into each chat is not documented in docs/facts.md as of 2026-11-02, so the knowledge files are not counted.
   - Light: the block as the template has it (the work, two lines on who you are, the "ask me first" and "never" lists, the line to read the newest handoff note first, and the handoff shape), with only the handoff notes in the knowledge. About 116 tokens (estimate). Recommended for a first adoption, and when your data rules keep everything else out of claude.ai.
   - Standard: light, plus the two or three `STYLE.md` lines you would miss most in the block, and the reference documents this stream needs in the knowledge. About 130 tokens (estimate). Recommended when a new chat in this stream keeps asking for the same documents.
   - Full: standard, plus the full `USER.md` and `RELATIONSHIP.md` ([identity files](identity-user.md)) in the knowledge, and one line in the block that points to them. About 151 tokens (estimate). Recommended when you wrote them at the standard or full level.
   - Not sure: light, the size recommended above for a first adoption and the narrowest choice; update mode offers a larger size.
   - Default when skipped: light.
2. **"A claude.ai Project for this stream of work?"** A stream is a product, a client or a recurring report, not a single question.
   - Keep what you have. Recommended when Detect says **have**.
   - A new Project, with instructions from the kit's template. Recommended when you use claude.ai and Detect says **not yet**.
   - Fold into an existing Project: add the "read the newest handoff note first" line and the handoff shape to its instructions. Recommended when Detect says **partly**.
   - No: you use Claude Code only.
   - Not sure: the option recommended above for what Detect found: keep what you have for **have**, fold into the existing Project for **partly**, a new Project for **not yet**; Claude shows you the instruction text before anything is saved.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
3. **"claude.ai's own memory?"**
   - Leave it as your plan sets it; the Project's files stay the record you control. Recommended.
   - Turn it on: on Team and Enterprise it is off for each member until they turn it on.
   - Pause it: claude.ai keeps what it remembered, but stops using it and adding to it.
   - Not sure: leave it as it is, the option recommended above.
   - Default when skipped: no change.

## Needs

- A claude.ai account. The free plan allows at most five Projects; file size, file count and knowledge limits per plan are not documented in docs/facts.md as of 2026-11-02.
- Nothing to install.
- For the notes: the [handoff note](handoff.md) habit.

## Steps

All three sizes take every step; they differ in what step 2 writes into the block and what step 4 adds to the knowledge.

1. **you:** in claude.ai, make a new Project named after the stream of work. (docs/facts.md does not document the button names for making a Project, editing its instructions or adding to its knowledge as of 2026-11-02, so steps 1, 3 and 4 say what to do, not where to click.)
2. **Claude:** fills the instruction block from `templates/claude-ai/PROJECT-INSTRUCTIONS.md` in your words: the name of the work; two lines from your `USER.md`; the "ask me first" and "never" lists from your `RELATIONSHIP.md`; at standard and full, the two or three `STYLE.md` lines you would miss most; at full, one line pointing to the full `USER.md` and `RELATIONSHIP.md` in the knowledge; the line telling a new chat to read the newest `handoff-YYYY-MM-DD.md` first; and the shape of a note for when you say "handoff". Short enough to read in a minute. Shown for you to copy.
3. **you:** paste the block into the Project's instructions.
4. **you:** add to the Project's knowledge what your size holds: the handoff notes (light), plus the reference documents this stream needs (standard), plus the full `USER.md` and `RELATIONSHIP.md` (full). If there is no note yet, the first one comes at the end of today. Company material goes in only where your data rules allow it.
5. **you:** only if you chose to change memory in question 3: Settings > Your Claude > "Memory from chats" (older layout: Settings > Memory). To pause, choose "Pause memory", never "Reset memory", which deletes everything remembered, Project memories included.
6. **you:** at the end of each day, say "handoff" in the chat, save the answer as `handoff-YYYY-MM-DD.md`, and add it to the Project's knowledge. Keep the old notes.
7. **you:** start each day in a new chat in the same Project, not in yesterday's chat.
8. **Claude:** records the decision, the size, the Project's name, what went into its knowledge and the undo in `adoption/decisions.md`. With claude.ai only, Claude writes that line in the chat, and you add it to a decisions note in the Project's knowledge.

## Check

**you:** open a new chat in the Project and ask "where did we stop?" as the first message. Expected: Claude answers from the newest handoff note, names it, and gives its open items and the first step for the next session, without you explaining anything.

If it asks you, answers in general terms, or uses an older note, the item is not done: the plan row stays unticked. The usual causes are instructions that were not saved, a note not yet added to the knowledge, or a name that does not start `handoff-` and the date.

## Undo

- **you:** remove the block from the Project's instructions, or only the lines this card added.
- **you:** take the handoff notes out of the knowledge only after saving a copy elsewhere: they are your record.
- **you:** if you changed memory, set it back in Settings > Your Claude > "Memory from chats".
- **Claude:** adds the undo to `adoption/decisions.md`.

## Watch out

- **What it costs per chat.** The template's block, before you fill it, is 462 bytes, about 116 tokens (estimate, bytes divided by 4); the standard size's `STYLE.md` line adds 58 bytes, and the full size's pointer line 82 more, for about 130 and 151 tokens (estimates). It grows with your lists. How claude.ai brings a Project's instructions and knowledge into each chat, and how it caches chats, is not documented in docs/facts.md as of 2026-11-02.
- **Memory differs by plan.** It is on by default on Free, Pro, Max and Ultra. On Team and Enterprise it is off for each member until they turn it on, and owners cannot turn it on for them. It builds itself from your chats, so keep your contract in the instructions, which you wrote and review.
- **Past chats.** On Pro, Max, Ultra, Team and Enterprise, claude.ai can search and reference your past chats, on by default (Settings > Your Claude > "Search and reference chats"). The note is still the record you control.
- **Company data.** A personal account holding company material can break your company's rules. Put into a Project only what your data rules allow, and nothing that crosses between streams of work.
- **One block, many Projects.** Use the same contract block in every Project, and update all of them when it changes.
- **Names.** Two notes on one day share the name `handoff-YYYY-MM-DD.md`; add a letter to the second. Never replace an old note with a shorter summary: the old notes are your vault.
