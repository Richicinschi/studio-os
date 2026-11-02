---
id: decision-log
module: 01-continuity
checked: 2026-11-02
tokens:
  light: 0
  standard: 51
  full: 51
---

# A decision log

## Why

- **The problem:** chat history is not memory. The conversation in which you chose a tool or made a rule is gone by next month, and what remains is the rule without its reason. Then it gets argued again, by you or by a session that only sees the rule.
- **The reason:** one file holds one dated entry per decision that changes how you work: what made it necessary, what was decided, why, and what it rules out. An entry is never deleted or rewritten. When a decision changes, a new entry goes on top and the old one is marked superseded, so the reason it once held stays findable. Claude opens the file when a question touches an earlier decision, not at every start.
- **The cost of skipping it:** module 01 says it in one line: a rule without its why gets argued away when it is inconvenient ([module 01, The mechanism](../modules/01-continuity/README.md#the-mechanism), the fourth test for memory). The kit holds no story of a decision lost this way; skipping the log means every re-argument starts from nothing.
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). The reason for a decision is state like any other, and it survives only where a session will read it.

## Detect

Read-only, in your setup folder and in each repository in `adoption/inventory.md`. Names and counts; no entry's text is printed.

- A decision log already, names only: `find <folder> -maxdepth 3 \( -iname '*decision*' -o -iname 'adr*' \) -not -path '*/node_modules/*' 2>/dev/null`. ("ADR", architecture decision record, is a common name for the same idea.)
- In a log that exists, dated entries counted, and how many state a reason: `grep -cE '^## [0-9]{4}-[0-9]{2}-[0-9]{2}' <log>` and `grep -c '^\*\*Why:\*\*' <log>`.
- Whether the front door names it: `grep -c 'DECISIONS.md' AGENTS.md CLAUDE.md 2>/dev/null`.
- Whether the front door imports it, which loads all of it into every session: `grep -cE '^@.*DECISIONS' CLAUDE.md AGENTS.md 2>/dev/null`.

The menu marks the item **have** when a log with dated entries that state their reasons exists and the front door names it; **partly** when a log exists without dates or reasons, or nothing points to it; and **not yet** otherwise.

## Ask

1. **"Size?"**
   - Light: the file only. When you say "log this decision", Claude writes the entry. Nothing loads every session. Recommended for a first adoption, and when Detect finds no log.
   - Standard: light, plus one line in your front door, so Claude opens the log when a question touches an earlier decision and offers an entry when you decide something that changes how you work. About 51 tokens every session (estimate). Recommended when you make decisions with Claude most days.
   - Full: standard, plus a back-fill: Claude lists the rules already in your front door and memory that carry no reason, asks you for each reason, one at a time, and writes an entry for each answer. About 51 tokens every session (estimate), and some of your time for the back-fill. Recommended when Detect finds a front door with many rules and no log.
   - Not sure: the size recommended above for what Detect found: full when it finds a front door with many rules and no log; standard when you make decisions with Claude most days; light otherwise. Claude offers a larger size again after your first few entries.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing.

   The same for every profile.
2. **"Where does it live?"**
   - The root of your setup folder: one log for how you work. Recommended.
   - Inside a repository, for decisions about that code. In a company repository only with your team's OK: whoever can read the repository reads the log.
   - Not sure: the root of your setup folder, the option recommended above.
   - Default when skipped: your setup folder.

## Needs

- Nothing beyond Claude Code.

## Steps

Light takes steps 1, 2, 4 and 6; standard takes steps 1 to 4 and 6; full takes all six.

1. **Claude:** runs `vet-and-adopt` for this item. It ships one text template, `templates/decisions/DECISIONS.md`, which is scanned like any shipped file; then Claude compares it with what Detect found and recommends a size. With a log you already keep, it recommends FOLD: your file and its entries stay as they are, and new entries take the fields yours lacks.
2. **Claude:** writes `DECISIONS.md` in the place you chose, from the template, with its opening note in your words, and shows it before saving. Each entry is a heading with the date and a title, then five fields: Status, Context, Decision, Why, Consequences. Newest first.
3. **Claude:** for standard and full, adds one line to your front door, shown first, for example:

   ```markdown
   - Decisions: `DECISIONS.md` holds one dated entry per decision, with its reason. Read it when a question touches an earlier decision; when we decide something that changes how we work, offer an entry.
   ```

   It is 201 bytes, about 51 tokens every session (estimate). It is a pointer, not an `@` import: an import would load the whole log into every session.
4. **you:** log your first decision: "Log this decision: <something you decided this week, and why>." Claude asks for the reason if you left it out, and shows the entry before saving it.
5. **Claude:** for full, goes through your front door and memory files, finds the rules that carry no reason, and asks about one per message: "Why this rule?" Each answer becomes an entry, dated the day you made the decision when you know it, otherwise today with "decided before this log began" in its Context. You can answer `skip` to any of them.
6. **Claude:** records the decision, the size, where the log lives and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** after step 4, `grep -cE '^## [0-9]{4}-[0-9]{2}-[0-9]{2}: ' "<the log>"` prints 1 or more, and Claude shows the newest entry: a dated heading, then Status, Context, Decision, Why and Consequences, each filled in.
2. **you:** for standard and full, in a new session, ask as the first message: "Why did we decide <the decision from step 4>?" Expected: Claude opens the log (a file read appears) and answers from the entry.

If step 1 prints `0`, or an entry has an empty Why, or in step 2 Claude answers without opening the log, the item is not done: the plan row stays unticked. The usual cause in step 2 is a front-door line that is missing or names another path.

## Undo

- **Claude:** removes the front-door line, with the diff shown.
- **Claude:** deletes `DECISIONS.md` only on your yes; the entries are yours, so keep a copy if in doubt.
- **Claude:** marks the row in `adoption/decisions.md` as undone.

## Watch out

- **Never delete an entry; supersede it.** A decision that changes gets a new entry, and the old one's Status becomes `superseded by <date> <title>`. A rewritten entry loses the reason it once held ([the vault](vault.md) keeps the same rule for memory).
- **Point to it; never import it.** The empty template is 702 bytes, about 176 tokens (estimate) whenever it is opened, and each entry adds a few hundred bytes more. Named in the front door, it costs tokens only when Claude opens it; imported with `@`, all of it loads into every session.
- **What belongs in it.** A choice that changes how you work: a tool chosen, a rule made or reversed. A fact a later session needs is a memory file; a day's progress is a handoff note. The studio's own entries also name who decided and point to the evidence the reason rests on, such as a measurement, a commit or a report.
- **A log that nothing prompts falls behind.** At the light size nothing reminds Claude to offer an entry, so a decision made in a chat stays in that chat unless you say "log this". The standard size adds the reminder.
- **A long log:** Claude can list the dated headings (`grep -n '^## [0-9]' DECISIONS.md`) and open the one entry it needs, instead of reading the whole file.
- **Company rules.** Decisions about company work can be confidential. Where the log lives follows the data rules you gave in round 1 of the adoption.
- **claude.ai:** keep the log as a file in the Project's knowledge and add each new entry to it. Whether a Project reads its knowledge files only when needed is not documented in docs/facts.md as of 2026-11-02.
