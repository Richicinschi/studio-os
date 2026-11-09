---
id: vault
module: 01-continuity
checked: 2026-11-02
other_figures:
  - 33
---

# The memory vault

## Why

- **The problem:** every store that loads into a session grows: the memory index, a long memory file, the front door. The quick way to make room is to trim: shorten lines, summarize old entries, delete the ones that look finished. A trimmed line still loads, so nothing looks wrong, and the detail it lost is not there when a later session needs it.
- **The reason:** the vault keeps the full text, word for word, under a dated heading with tags, and leaves one pointer line behind. The test after any clean-up: can you still open the full original, found by a tag or a link? If not, it was lost, and the move is undone.
- **The cost of skipping it:** memory freed by loss defeats the point of memory, without a sound ([vault before you shorten](../examples/vault-before-shortening.md)).
- **The principle:** [nothing freed by loss](../PRINCIPLES.md#nothing-freed-by-loss). The vault is the place the moved text goes, so nothing has to be cut.

## Detect

Read-only, at the root of your setup folder. Presence and counts only; the vault's entries are not printed.

- Whether the vault exists: `ls memory/vault/MEMORY-VAULT.md 2>/dev/null`.
- How many moves it records (one dated heading each; the template's placeholder heading does not count): `grep -cE '^## [0-9]{4}-[0-9]{2}-[0-9]{2}' memory/vault/MEMORY-VAULT.md`.
- Whether the rule is written where sessions read it: `grep -ci 'vault' AGENTS.md memory/MEMORY.md 2>/dev/null`.
- Whether you already keep another archive file: `ls handoffs/archive.md docs/handoff-archive.md 2>/dev/null`.

The menu marks the item **have** when the vault file exists and the front door or the index names it; **partly** when only one of those is true; and **not yet** when neither is.

## Ask

1. **"Keep a vault?"**
   - Keep what you have. Recommended when Detect says **have**.
   - Add it: `memory/vault/MEMORY-VAULT.md`, and the rule in the front door and the index. Recommended when the [memory index](memory-index.md) is in place or on your plan.
   - Fold the rule into an archive you already keep: moved text goes there, word for word, with a pointer left behind. Recommended when Detect finds another archive file.
   - No. Fits only when you keep no memory store at all.
   - Not sure: the option recommended above for what Detect found: keep at **have**; fold when it finds another archive file; otherwise add the empty vault and the rule, which cost nothing until a session opens the vault.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Which tags?"** A tag is a word you put on every moved entry, so you can search for it later.
   - The project and the status (closed, parked, historical). Recommended: the studio's choice, and what you are likely to search for.
   - The date and the topic.
   - Your own short list, which Claude writes at the top of the vault.
   - Not sure: the project and the status, the option recommended above, which you can change before the first move.
   - Default when skipped: the project and the status.

## Needs

- Nothing beyond Claude Code.
- The [memory index](memory-index.md): the vault holds what leaves it. The front door can keep its own archive the same way: old entries move to a file, never to the bin.

## Steps

1. **Claude:** runs `vet-and-adopt` for this item. It ships one text template, `templates/memory/vault/MEMORY-VAULT.md`, which `vet-and-adopt` scans like any shipped file; then it compares it with what Detect found and recommends one of the options above.
2. **Claude:** writes `memory/vault/MEMORY-VAULT.md` in your words: one line on what it holds, your tags, and the shape of each move: a heading with the date and why the entries moved, then the entries word for word, newest at the bottom. Shown before saving.
3. **Claude:** writes the rule where every session reads it, in the front door's memory section and in the index's comment, unless it is there already: never shorten or delete a line; copy it word for word into the vault first, check it landed, then leave a pointer. A merge, with the diff shown.
4. **you:** choose when the index counts as too big: a number of lines or of tokens. The [memory index](memory-index.md) card gives about 33 tokens per line (estimate). **Claude** writes your number next to the rule.
5. **Claude:** records the decision, the scope (the vault in your setup's `memory/` folder), the tags, the limit and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `ls memory/vault/MEMORY-VAULT.md` prints the path, and `grep -ci 'vault' AGENTS.md` prints at least `1`.
2. **you:** in a new session, say "The memory index is too long, make room." Expected: Claude proposes to move whole lines, word for word, into the vault under a dated heading with your tags, to leave one pointer line in the index, and to remove a line only after finding its text in the vault. It never proposes to shorten, summarize or delete a line. Then decline, or let it move one test line you made for the purpose.

If Claude proposes to shorten or summarize anything, the rule is not where sessions read it: the item is not done, and the plan row stays unticked.

## Undo

- **Claude:** before the vault goes, puts every entry back word for word into the index or the memory file it came from; then deletes the vault file, on your yes.
- **Claude:** removes the rule from the front door and the index, with the diff shown.

## Watch out

- **Keep it out of the every-session load.** The vault loads only when a session opens it: the blank file is 210 bytes, about 53 tokens (estimate, bytes divided by 4), and it grows with each move. Never import it from the front door with `@`: it would then load into every session and undo its own purpose.
- **Moving is allowed; cutting is not.** Moving text and leaving a pointer is vaulting. Cutting words is lossy shortening. A long single entry follows the same rule: its full detail moves to the vault or to its own file, and a short pointer stays.
- **Tags make a vault usable.** Without them it is a pile nobody searches. Use the same few tags every time.
- **The vault is not a hiding place.** It usually lives in git with the rest. A secret or customer data that reached memory is removed, and the secret replaced, not moved to the vault.
- **The same pressure comes for every store.** The studio applies the rule to memory, the front door and its notes alike, and had to state it more than once: the quick trim kept coming back as the first idea for making room.
- **claude.ai:** keep a vault document in the Project's knowledge, and copy text into it before you cut that text from the Project's instructions or replace an old handoff note.
