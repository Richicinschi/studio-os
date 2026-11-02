---
id: front-door
module: 01-continuity
checked: 2026-11-02
tokens:
  light: 166
  standard: 358
  full: 405
---

# The front door

## Why

- **The problem:** without one file that every session reads first, each session guesses who you are, what the rules are and what to load, and you spend the start of each day explaining it again.
- **The reason:** Claude Code reads its instruction files at launch, before your first message. One front door that says who you are, what Claude must never do, what needs your OK and what to load next (memory, the newest handoff note) gives every session the same start.
- **The cost of skipping it:** each session rebuilds its picture of you from whatever it happens to read. The studio's evidence is that the written files are the only continuity there is: what is not written where a session reads it is gone by the next one ([module 01, Evidence](../modules/01-continuity/README.md#evidence)).
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). The front door is the first written state every session reads, and it points to the rest.

## Detect

Read-only, at the root of your setup folder. These commands print presence, sizes and yes/no answers; they never print a file's content, and they use no network.

- Which instruction files exist, each with its size in characters and in tokens (an estimate: bytes divided by 4):
  `for f in CLAUDE.md AGENTS.md CLAUDE.local.md .claude/CLAUDE.md; do if [ -f "$f" ]; then echo "$f: $(wc -m < "$f") characters, about $(( ($(wc -c < "$f") + 3) / 4 )) tokens (estimate)"; else echo "$f: not present"; fi; done`
- Whether `CLAUDE.md` imports the front door, that is, holds the line `@AGENTS.md`, which loads `AGENTS.md` with it: `grep -qE '^@AGENTS\.md[[:space:]]*$' CLAUDE.md && echo "imports AGENTS.md" || echo "no @AGENTS.md line"`.
- How many other import lines the two files hold (those files load at launch too): `grep -cE '^@' CLAUDE.md AGENTS.md 2>/dev/null`.
- Instruction files in the folders above, which load as well, and any of which stops Claude Code from reading `AGENTS.md` on its own ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"): `d="$PWD"; while [ "$d" != "$(dirname "$d")" ]; do d="$(dirname "$d")"; for n in CLAUDE.md CLAUDE.local.md .claude/CLAUDE.md; do [ -f "$d/$n" ] && echo "found $n in a folder above"; done; done`.
- Whether a project setting loads both files (the value `claude-md-and-agents-md`): `grep -l 'claude-md-and-agents-md' .claude/settings*.json 2>/dev/null`.
- The Claude Code version: `claude --version`.

The menu marks the item **have** when `AGENTS.md` exists and `CLAUDE.md` holds the line `@AGENTS.md`; **partly** when an instruction file exists but the two are not joined (a `CLAUDE.md` with its own content and no `AGENTS.md`, an `AGENTS.md` beside a `CLAUDE.md` that does not import it, or an `AGENTS.md` alone); and **not yet** when neither file exists.

## Ask

1. **"Size?"** Each estimate is the blank template's part that size keeps, bytes divided by 4; it loads every session and grows with what you write.
   - Light: who you are, what Claude must never do and what needs your OK: the template's opening section and its rules, with no load list. About 166 tokens (estimate). Recommended for a first adoption, and while your plan takes no memory or handoff item.
   - Standard: the whole template: light, plus the list of what loads at the start (the memory index, the newest handoff note), the rule for writing a memory and the note at the end of a session, each line kept only for an item you take. About 358 tokens (estimate). Recommended when your plan takes the [memory index](memory-index.md) or the [handoff note](handoff.md).
   - Full: standard, plus a short table of which file to read before which kind of task, so rules for one kind of work load only when that work starts ([module 02](../modules/02-context-and-models/README.md), "Rules on demand"). About 405 tokens (estimate) before you add rows. Recommended when Detect finds a front door of 1,000 tokens or more (estimate), or rules that apply to one kind of work only.
   - Not sure: the size recommended above for what Detect found and your plan: full when Detect finds a front door of 1,000 tokens or more, or rules for one kind of work only; standard when your plan takes the memory index or the handoff note; light otherwise. Grow it in update mode as you take more items.
   - Default when skipped: light.
2. **"Your front door?"**
   - Keep what you have. Recommended when Detect says **have**.
   - New: `AGENTS.md` from the kit's template, and a `CLAUDE.md` of one line, `@AGENTS.md`. Recommended when Detect says **not yet**.
   - Join: your `CLAUDE.md` stays word for word with `@AGENTS.md` added as its first line, and the new `AGENTS.md` holds only what the template adds. Recommended when Detect finds a `CLAUDE.md` with content of its own (**partly**).
   - Move: your `CLAUDE.md`'s content goes into `AGENTS.md` word for word, and `CLAUDE.md` becomes the one line. Both diffs are shown before anything is saved.
   - Not sure: the option recommended above for what Detect found: keep at **have**, new at **not yet**, join at **partly**. Never the move, the one choice that rewrites your file.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
3. **"Where?"**
   - Your setup folder. You start sessions there and give Claude a work repository with `claude --add-dir <repo>`. Recommended, and the only choice while your data rules are unknown.
   - A company repository too, as a `CLAUDE.local.md` there that you add to its `.gitignore`, starting with `@AGENTS.md` where the repository has its own `AGENTS.md`. Only with your company's OK.
   - Not sure: your setup folder only, the option recommended above; nothing goes into any company repository.
   - Default when skipped: your setup folder only.

## Needs

- Claude Code (`claude --version`). The one-line `CLAUDE.md` loads `AGENTS.md` through an import; reading an `AGENTS.md` that has no `CLAUDE.md` at all needs v2.1.277 or later ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
- Nothing else.

## Steps

Which steps each size takes: **light** and **standard** every step but 3, **full** every step. The sizes differ in what step 2 writes.

1. **Claude:** runs `vet-and-adopt` for this item. It ships one text template, `templates/AGENTS.md`, which `vet-and-adopt` scans like any shipped file; then it compares the template with what Detect found and recommends one of the options above.
2. **Claude:** drafts your `AGENTS.md` from the template, in your words, from your answers in `adoption/spec.md`: a paragraph on who you are and what you use Claude for, what Claude must never do here, what needs your OK, and, at standard and full, what to load at the start, the memory rule and the end-of-session note. The front door names only files that exist: lines for memory, handoff notes or identity files wait until you adopt those items. Claude shows the file before saving it.
3. **Claude:** (full) adds a short section with a table: one row per kind of task you name, and the file of rules to read before it. Those files are named, not imported with `@`, so each loads only when its task starts. Shown before saving.
4. **Claude:** sets up `CLAUDE.md` as you chose. A new one is the single line `@AGENTS.md`. An existing one is never replaced: Claude shows the diff (the added first line, or the content moved word for word into `AGENTS.md`) and saves only on your yes.
5. **you:** read the draft and change whatever you would not sign. Keep it short: every line loads into every session.
6. **you:** only if you chose a company repository and your company allows it, keep the local file out of git: `! echo "CLAUDE.local.md" >> <repo>/.gitignore`. Then **Claude** writes `<repo>/CLAUDE.local.md`, shown first.
7. **Claude:** records the decision, the size, the scope (setup folder, or which repository) and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -cE '^@AGENTS\.md[[:space:]]*$' CLAUDE.md` prints `1`.
2. **you:** start a new session in your setup folder and ask, as the first message, "What must you never do here?" Expected: Claude answers with the rules from your `AGENTS.md` without opening a file first (no file read appears before the answer).
3. **you:** type `/context` to see the load yourself: it lists which `CLAUDE.md` files loaded. Whether it lists the imported `AGENTS.md` on its own line is not documented in docs/facts.md as of 2026-11-02, so step 2 is the check that counts.

If step 1 prints `0`, or step 2 gets an answer that is not yours, the item is not done: the plan row stays unticked. The usual cause is a `CLAUDE.md` without the import line, here or in a folder above.

## Undo

- **Claude:** restores `CLAUDE.md` from the diff it showed: removes the `@AGENTS.md` line it added, or moves your content back word for word.
- **Claude:** deletes the `AGENTS.md` it created, on your yes. Text you wrote in it first goes back into `CLAUDE.md`, if you want to keep it.
- **you:** in a company repository, delete `CLAUDE.local.md` and its line in `.gitignore`.

## Watch out

- **A `CLAUDE.md` without the import hides `AGENTS.md`.** Since v2.1.277, Claude Code reads `AGENTS.md` only when no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` exists in the working folder or above it. A stray `CLAUDE.md` in a parent folder, or a new `CLAUDE.local.md`, turns your front door off without a sound. The line `@AGENTS.md` keeps it on ([docs/facts.md](../docs/facts.md)).
- **Every line costs every session.** The blank template is 1,430 bytes, about 358 tokens (estimate, bytes divided by 4); the light size keeps 662 bytes of it, about 166 tokens, and the full size's empty table adds 188 bytes, about 47 (estimates). It grows with what you write. Files it imports with `@` load at launch with it, up to four imports deep. The studio keeps each front door under about 30,000 characters and moves old entries to an archive, never deleting them ([claude-md-curator](claude-md-curator.md)).
- **Rules said only in chat do not last.** After a compaction (Claude Code summarizing a long conversation to free room), the project-root `CLAUDE.md` is read again from disk, and instructions given only in the conversation can be lost. A rule you want kept belongs in the front door.
- **A repository beside the setup does not see it.** A session started inside a repository next to your setup folder does not read the setup's front door. Start in the setup folder and add the repository with `--add-dir`; Claude Code does not discover most `.claude/` configuration from an added folder.
- **Company repositories get no front door by default.** Ask before any instruction file goes into one. Git does not ignore a `CLAUDE.local.md` until you add it to `.gitignore`.
- **`/init` writes a different file.** It writes a `CLAUDE.md` from an analysis of your code: what the code is, not who you are or what needs your OK. When a `CLAUDE.md` exists, it suggests improvements instead of overwriting it.
- **Windows:** the Detect commands are bash. Claude Code uses Git Bash for its shell tool when Git for Windows is installed; without it, Claude Code uses PowerShell, and Claude rewrites the commands for it.
