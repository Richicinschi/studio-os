## Continuity mode: the short path

When they say "start with continuity" or "the short path": two items and the proof, not the full
drill. It answers one problem, a new session that starts from zero, and ends when a fresh session
answers "where did we stop?" from their files. Every rule in `SKILL.md` holds: one question per message,
their yes before any read and any write, `vet-and-adopt` for each item.

1. **Say what it is**, in one message: the scanner, then a front door (the file Claude reads at the
   start of every session) and a handoff note (written at the end of one), then a fresh session that
   proves it, in their setup folder. The full adoption stays open for later and keeps what this
   path decided. Ask where their setup lives, if you do not know.
2. **Look, on their yes:** the Detect of `cards/skillspector.md`, `cards/front-door.md` and
   `cards/handoff.md` only, not the audit. Before the first file in `adoption/`, when their setup
   folder is in a git repository, ask once whether to keep `adoption/` out of git, as phase 2 asks it
   (`.claude/skills/drill-to-adopt/phases/2-decide.md`, round 1, step 2: read that step now). This path
   asks no data rules, so keep it out is the recommended option; Not sure writes nothing, and the
   question comes back in a full run. Then write what it found to `adoption/inventory.md` under
   "Continuity path".
3. **The scanner**, by `cards/skillspector.md`. When the pinned version is already there, skip its
   install, never the rest: its check, its scan-first question and its row. The scan-first line goes
   into the front door that step 4 writes.
4. **The front door**, by `cards/front-door.md` at the light size, with no size question: ask what
   they use Claude for here, in their own words, then what Claude must never do or must ask first,
   with a starter set fitted to their answer as the recommended option. Nothing else from round 1.
5. **The handoff note**, by `cards/handoff.md` at the light size, with no size question. Then write
   their first note from their template: done, the three items; open, the rest of the kit; the first
   step for next time, "say 'Start the adoption' in the kit folder" or their own; a resume prompt.
6. **The proof:** they open a second terminal in their setup folder, start Claude Code there, and ask
   "where did we stop?". It passes when the answer names the note and its first step, from the files
   and not from this conversation. They tell you what it said; record which file it came from.
7. **Record** each item's row in `adoption/decisions.md`, with the proof's result.

A later "Start the adoption" resumes at phase 1 and never asks about these items again
(`SKILL.md`, "Before the first question", step 2, says how).
