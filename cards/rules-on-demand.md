---
id: rules-on-demand
module: 02-context-and-models
checked: 2026-11-02
tokens:
  light: 63
  standard: 89
  full: 114
---

# Rules loaded only when needed

## Why

- **The problem:** every line in the front door loads into every session and is carried on every turn. Rules that apply to one kind of task only, such as a database migration, a release or one client's style, cost tokens all day, and a thread that starts heavy wears out sooner ([module 02, The problem](../modules/02-context-and-models/README.md#the-problem)).
- **The reason:** rules for one kind of task live in their own files, and the front door holds a short table: "before this kind of task, read that file". Each session carries the table; a file loads only when its task comes up. The rules every session needs, what Claude must never do and what needs your OK, stay in the front door.
- **The cost of skipping it:** the front door grows with every rule until each session pays for all of them. By the studio's own estimate, measured on 2026-11-02 as file sizes in bytes divided by 4, its sessions started at about 30,000 tokens ([PRINCIPLES.md](../PRINCIPLES.md#load-only-what-is-needed)), and module 02 names what follows: long threads wear out and get forgetful.
- **The principle:** [load only what is needed](../PRINCIPLES.md#load-only-what-is-needed). The table is the index, and a rule file opens only when its row matches the task.

## Detect

Read-only, at the root of your setup folder. Instruction files may be read; nothing else is opened.

- The front door's size: `wc -c CLAUDE.md AGENTS.md 2>/dev/null`, reported as tokens (an estimate: bytes divided by 4).
- The files it imports, which load into every session with it (a line starting with `@` loads that file at launch): `grep -hE '^@' CLAUDE.md AGENTS.md 2>/dev/null`, each with its size from `wc -c`.
- Claude reads the front door and names each section or rule that applies to some kinds of task only (one language, one tool, one client, one kind of release), with its size in bytes.
- A table of this kind already: a section that names a file to read before a kind of task. For each file such a table names, present or not: a row that names a missing file sends Claude to a dead end.
- Rule files already kept apart: `ls rules/*.md 2>/dev/null | wc -l` (or the folder your front door uses).

The menu marks the item **have** when such a table exists, every file it names exists, and the front door holds no section that applies to one kind of task only; **partly** when the table names a missing file, or task-only sections or imports remain in the front door, or rule files exist that nothing points to; and **not yet** when there is no table.

## Ask

1. **"Size?"**
   - Light: a table of two rows, for the two kinds of task whose rules you need most, each rule file written new from what you tell Claude. About 63 tokens every session (estimate). Recommended for a first adoption, and when Detect puts the front door and its imports under 1,000 tokens (estimate).
   - Standard: a row for each kind of task that has rules of its own, each file written new; nothing in the front door moves. About 89 tokens with four rows (estimate), about 13 more for each further row.
   - Full: standard, plus the task-only sections and `@` imports already in your front door moved into rule files word for word, each becoming a row. About 114 tokens with six rows (estimate), and the front door loses what moved: the saving is the moved text's bytes divided by 4. Recommended when Detect puts the front door and its imports at 1,000 tokens or more (estimate), the point at which the kit's menu calls an item heavy, and finds sections in it that apply to one kind of task only.
   - Not sure: the size recommended above for what Detect found: full when it puts the front door and its imports at 1,000 tokens or more and finds sections that apply to one kind of task only; light otherwise.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing.

   The same for every profile.
2. **"Where do the rule files go?"**
   - A `rules/` folder in your setup, next to the front door. Recommended.
   - Beside a repository's own front door, for rules about that code. In a company repository only with your team's OK.
   - Not sure: `rules/` in your setup, the option recommended above.
   - Default when skipped: `rules/` in your setup.

## Needs

- Nothing beyond Claude Code.

## Steps

Light and standard take steps 1 to 4 and 6; full takes all six.

1. **Claude:** runs `vet-and-adopt` for this item. This card is the whole item, so there is no file to scan; Claude compares the card with what Detect found and recommends a size.
2. **you:** name the kinds of task that come with rules of their own, in your words, for example "a change to the database schema" or "anything sent to a client": two for light, every one for standard and full. Name the task, not the file: Claude matches the task in front of it against the left column.
3. **Claude:** writes one file per row in the place you chose, such as `rules/database.md`, from what you tell it and in your words, and shows each before saving.
4. **Claude:** adds the table to the front door, after its rules, and shows the change first, for example:

   ```markdown
   ## Read before some tasks

   Open the file on the right before you start that kind of task, and not otherwise.

   | Before | Read |
   |---|---|
   | any change to a database schema | `rules/database.md` |
   | a message to a client | `rules/client-writing.md` |
   ```

   The two rows are examples; yours replace them. This block is 250 bytes, about 63 tokens every session (estimate).
5. **Claude:** for full, moves each task-only section of the front door, word for word, into its rule file, and turns each `@` import of a task-only file into a row. It shows both sides of every move, never shortens text while moving it, and measures the front door before and after with `wc -c` (bytes divided by 4, an estimate). What Claude must never do, and what needs your OK, stay in the front door.
6. **Claude:** records the decision, the size, the rows, the front door's size before and after, and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** checks that every rule file the table names exists:

   ```bash
   grep -oE '`rules/[^`]+\.md`' AGENTS.md | tr -d '`' | while read -r f; do [ -f "$f" ] && echo "ok $f" || echo "missing $f"; done
   ```

   Expected: one `ok` line per row, and no `missing` line.
2. **you:** start a new session and say, as the first message: "I am about to <the task in your first row>. What do you read first?" Expected: Claude names the file from that row and opens it (a file read appears) before it says anything about the task.
3. **Claude:** for full, `wc -c AGENTS.md` now prints less than the size recorded in step 5, by about the size of what moved.

A `missing` line, or Claude answering without opening the file, means the item is not done: the plan row stays unticked. The usual cause in step 2 is a row named after a file rather than a task.

## Undo

- **Claude:** for full, moves each section back into the front door word for word, from the diff it showed, and puts back the `@` imports it replaced.
- **Claude:** removes the table section from the front door, with the diff shown.
- **Claude:** deletes the rule files it wrote, on your yes, or leaves them as plain files if you want to keep the rules; then marks the row in `adoption/decisions.md` as undone.

## Watch out

- **A rule that must never break does not go on demand.** On demand depends on Claude recognizing the task. What Claude must never do, and what needs your OK, stay in the front door, and a rule that must hold every single time belongs in a hook or a test ([checks for rules that must never break, prose for judgement](../PRINCIPLES.md#checks-for-rules-that-must-never-break-prose-for-judgement)).
- **A row that names a missing file is a dead end.** Rename or move a rule file and its row in the same change; the first step of the Check finds a row left behind.
- **After a compaction** (Claude Code summarizing a long conversation to free room), the project-root `CLAUDE.md` is read again from disk, but only up to five recently read files are. A rule file opened early in a long session may be gone from context, so Claude opens it again when the task comes back ([docs/facts.md](../docs/facts.md), "Claude Code: context commands, subagents, extra folders").
- **Imports load every session.** A line starting with `@` loads its file at launch, up to four imports deep ([docs/facts.md](../docs/facts.md), "Claude Code: measuring context and asking multiple choice"). A rule file belongs in a row, not in an import.
- **Claude Code's own rule files.** docs/facts.md mentions "unscoped rules" only in passing, as something read again after a compaction; how Claude Code's own rule files load is not documented there as of 2026-11-02. This card uses a plain table, which any runtime reads.
- **Token cost.** The table with two example rows is 250 bytes, about 63 tokens every session; each further row adds about 50 bytes, about 13 tokens (estimates, bytes divided by 4). A rule file costs tokens only when it is opened.
- **claude.ai:** put the rule files in the Project's knowledge and the table in its instructions. Whether a Project reads its knowledge files only when needed is not documented in docs/facts.md as of 2026-11-02, so the saving there is unknown.
