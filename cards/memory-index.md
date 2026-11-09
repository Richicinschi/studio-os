---
id: memory-index
module: 01-continuity
checked: 2026-11-02
tokens:
  light: 51
  standard: 55
  full: 55
other_figures:
  - 33
  - 1650
---

# The memory folder with its index

## Why

- **The problem:** chat history is not memory. A new session knows nothing of what earlier ones learned, and a chat picked up the next day is reprocessed in full. You end up telling Claude the same facts again.
- **The reason:** one fact per file, and a one-line index that the front door loads. Each line says when to open its file, so a session pays for the index every time and for a file only when its line matches the task. A bar keeps it clean: a fact earns a file only when it is non-obvious, durable, changes what a later session does, and carries its reason.
- **The cost of skipping it:** in the studio, a session archived its transcript but never updated memory, and the next session worked from stale ground truth; one cleanup ended up rediscovering state that had drifted for weeks ([module 01, Evidence](../modules/01-continuity/README.md#evidence)).
- **The principle:** [load only what is needed](../PRINCIPLES.md#load-only-what-is-needed). The index loads every session; each memory file opens only when its line matches the task.

## Detect

Read-only, at the root of your setup folder. Counts and sizes only: the memory files themselves are not opened.

- Whether the index and its format note exist: `ls memory/MEMORY.md memory/README.md 2>/dev/null`.
- How many memory files, and how many index lines (leaving out the template's own example line, `- [Title](file.md)`, which sits in its comment): `ls memory/*.md 2>/dev/null | grep -vcE '/(MEMORY|README)\.md$'` and `grep -E '^- \[' memory/MEMORY.md | grep -vc '^- \[Title\](file\.md)'`. Two different numbers mean a file without a line, or a line without a file.
- The index's size: `echo "about $(( ($(wc -c < memory/MEMORY.md) + 3) / 4 )) tokens (estimate)"`.
- Whether the front door loads it: `grep -c 'memory/MEMORY.md' AGENTS.md CLAUDE.md 2>/dev/null`.
- Whether the light size is in place: `ls NOTES.md 2>/dev/null` and `grep -c 'NOTES.md' AGENTS.md CLAUDE.md 2>/dev/null`.
- Whether another memory store is in use: a notes or memory file the front door names (Claude reads the front door, which discovery may do), and Claude Code's own auto memory. Where auto memory keeps its folder is not documented in docs/facts.md as of 2026-11-02; `/context`, which you type, shows which auto memory files loaded.

The menu marks the item **have** when `memory/MEMORY.md` exists, the front door names it, and the two counts match, or, at the light size, when `NOTES.md` exists and the front door names it; **partly** when the folder or the index exists but the front door does not load it, or the counts differ; and **not yet** when there is no memory folder.

## Ask

1. **"Size?"** Each estimate is what the size loads every session at the start, bytes divided by 4.
   - Light: one notes file, `NOTES.md`, a line per fact with its reason and date, loaded from the front door; plus [handoff notes](handoff.md), which a session reads only when it continues earlier work. About 51 tokens (estimate, from a sample `NOTES.md` of 203 bytes written as step 2 describes), and every fact you add loads in full. Recommended for a first adoption: it is the smallest that stops you repeating facts.
   - Standard: the index, `memory/MEMORY.md`, with one file per fact, and `memory/README.md` with the format and the four tests. About 55 tokens (estimate, the 218 bytes of the empty index template); each fact adds one index line, about 33 tokens (estimate), and its file opens only when the line matches the task. Recommended when your facts no longer fit one short file, or Detect finds a notes file that has grown long.
   - Full: the index with the [vault](vault.md), `memory/vault/MEMORY-VAULT.md`, where a line goes word for word before it is shortened or leaves the index. About 55 tokens (estimate), the same as standard: the vault loads only when a session opens it. Recommended when Detect finds an index already in use, whose lines will need somewhere to go.
   - Not sure: the size recommended above for what Detect found: full when it finds an index already in use; standard when it finds a notes file that has grown long; light otherwise. Grow it in update mode when the notes file gets long.
   - Default when skipped: light.
2. **"Keep a memory store?"**
   - Keep what you have. Recommended when Detect says **have**.
   - Start one at the size above, loaded from the front door. Recommended when Detect says **not yet**.
   - Fold the idea into the store you already use: the four tests and the one-line hook go into it, and no new folder is made. Recommended when Detect finds another memory store in use.
   - No.
   - Not sure: the option recommended above for what Detect found: keep at **have**; fold when it finds another memory store in use; otherwise start one at the size above, empty, with nothing written into it until a fact passes the four tests.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
3. **"Who writes a memory?"**
   - Claude proposes the file and its index line (at light, the line in `NOTES.md`) when a fact passes the four tests, and saves them on your yes. Recommended for the first weeks.
   - Claude writes them and lists them in the session's handoff note. Recommended once its proposals rarely need changing.
   - Only you.
   - Not sure: Claude proposes and waits for your yes, the option recommended above for the first weeks.
   - Default when skipped: Claude proposes, you approve.

## Needs

- Nothing beyond Claude Code.
- The [front door](front-door.md), which loads the index. The [vault](vault.md) is its partner: it takes lines that leave the index, word for word, so the index never has to be shortened.

## Steps

Which steps each size takes: **light** 1, 2, 5 to 7 and 10; **standard** 1, 3 to 8 and 10; **full** 1 and 3 to 10.

1. **Claude:** runs `vet-and-adopt` for this item. It ships two text templates, `templates/memory/MEMORY.md` and `templates/memory/README.md`, which `vet-and-adopt` scans like any shipped file; then it compares them with the store Detect found and recommends one of the options above.
2. **Claude:** (light) writes `NOTES.md` in your setup folder: a heading, and a one-line comment giving the line format (the fact, its reason, the date) and the four tests in short. Handoff notes come through the [handoff note](handoff.md) card. Shown before saving.
3. **Claude:** (standard and full) writes `memory/README.md` in your words: the four tests, the file format (a short name, a one-line description, a type, the date written; then the fact, its reason and how to apply it), and only the types you will use. Shown before saving.
4. **Claude:** (standard and full) writes `memory/MEMORY.md`, empty except for a comment giving the line format and the rule for lines: at standard, no line is shortened or deleted; at full, none is shortened or deleted without first being copied word for word to the vault. Shown before saving.
5. **Claude:** adds the index, or at light `NOTES.md`, to the front door's list of what loads at the start, if it is not there yet: a merge, with the diff shown.
6. **you:** name one fact you have had to repeat to new sessions.
7. **Claude:** writes it as the first memory: one file in `memory/` and one line in the index, or at light one line in `NOTES.md`, shown before saving.
8. **you:** (standard and full) read the line alone and ask: would a session know from these words when to open the file? If not, rewrite the hook, the part after the dash.
9. **Claude:** (full) adds the vault through the [vault](vault.md) card: `memory/vault/MEMORY-VAULT.md`, and the rule in the front door.
10. **Claude:** records the decision, the size, the scope (the `memory/` folder of your setup, or `NOTES.md` at light), who writes memories, and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -E '^- \[' memory/MEMORY.md | grep -vc '^- \[Title\](file\.md)'` and `ls memory/*.md | grep -vcE '/(MEMORY|README)\.md$'` print the same number, `1` after step 7. At light, instead: `grep -c 'NOTES.md' AGENTS.md` prints `1` or more.
2. **you:** in a new session in your setup folder, ask a question that only the first memory answers. Expected: Claude opens that memory file (you see it read `memory/<file>.md`) and answers from it. At light, Claude answers from `NOTES.md`, which it read at the start, without opening any other file.

If the counts differ, or Claude answers without opening the file, or opens every memory file to find it, the item is not done: the plan row stays unticked. The usual causes are a front door that does not load the index, or a hook that does not say when to open the file.

## Undo

- **Claude:** removes the index, or `NOTES.md`, from the front door's load list, with the diff shown.
- **you:** decide what happens to `memory/`, or to `NOTES.md` at light. The kit's advice is to keep it, or to move it out whole; Claude deletes it only on your yes.

## Watch out

- **The index grows with every line, and loads every session.** The empty index is 218 bytes, about 55 tokens. A realistic line, `- [Staging needs the VPN](staging-needs-vpn.md) — open before any deploy or staging query: staging answers only on the company VPN`, is 133 bytes with its line break (the long dash alone takes 3): about 33 tokens per line, an estimate (bytes divided by 4). So 50 lines add about 1,650 tokens to every session, and 100 lines about 3,300. The memory files cost nothing until a session opens one.
- **Never shorten a line to make room.** A line cut to a slogan still loads, so nothing looks wrong; the detail is missing when it matters. Move it word for word to the vault and leave a pointer ([vault before you shorten](../examples/vault-before-shortening.md)).
- **Two memories can disagree.** Claude Code has its own auto memory, which loads the first 200 lines or 25 KB of its own `MEMORY.md` each session ([docs/facts.md](../docs/facts.md)). If you keep both, decide which one is the record, and keep a fact in one place only.
- **Nothing secret in memory.** The index loads into every session and the folder usually lives in git: no keys, passwords, customer data or real network addresses, and nothing your company's data rules keep off your machine.
- **Dates are absolute.** "Next week" in a memory is wrong a week later; the format asks for a real date on anything about ongoing work.
- **Writing nothing is a valid result.** A sweep that invents entries to look busy fills the index with noise. Correcting a memory that turned out wrong is worth more than adding one.
