---
id: claude-md-curator
module: 01-continuity
checked: 2026-11-02
---

# claude-md-curator

## Why

- **The problem:** a front door that carries a dated log grows with every session, and all of it loads into every session. When it gets too big, the quick fix is to delete the old entries, and with them the history a later session may need.
- **The reason:** the skill measures the front door and moves its oldest dated entries, word for word, into an archive file. It checks that each entry landed in the archive before it removes it from the front door, and keeps what a cold session needs to find its way: the current state, the newest one or two entries, the rules and the pointers.
- **The cost of skipping it:** the studio's rule for every store that grows, the front door included, came from seeing what trimming loses ([vault before you shorten](../examples/vault-before-shortening.md)).
- **The principle:** [nothing freed by loss](../PRINCIPLES.md#nothing-freed-by-loss). The front door gets smaller only by moving text to an archive you can still open.

## Detect

Read-only. Names, descriptions, sizes and counts only: no skill's body is read.

- A skill of the same name: `ls -d .claude/skills/claude-md-curator "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/claude-md-curator" 2>/dev/null`.
- Another skill or agent doing the same job, from its front matter (the block between the first two `---` lines) only:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md .claude/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE '(CLAUDE|AGENTS)\.md|instruction file' && sed -n '2,/^---$/p' "$f" | grep -qiE 'archive|trim|budget|too (big|long)' && echo "$f"; done`
  Claude reads each match's description and says whether it does this job; a match is a candidate, not a verdict.
- The front door's size: `echo "$(wc -m < AGENTS.md) characters, about $(( ($(wc -c < AGENTS.md) + 3) / 4 )) tokens (estimate)"` (use `CLAUDE.md` if that is your front door).
- Whether it keeps a dated log in the shape the skill's script reads: `grep -c '^## Current state' AGENTS.md` and `grep -cE '^\*\*[0-9]{4}-[0-9]{2}-[0-9]{2}' AGENTS.md`.
- An archive file already in use: `ls handoffs/archive.md docs/handoff-archive.md 2>/dev/null`.
- Node.js, which the script needs: `node --version`.

The menu marks the item **have** when a skill named `claude-md-curator`, or another whose description covers archiving the front door, exists in either place; **partly** when an archive file is in use but no skill moves entries into it; and **not yet** otherwise.

## Ask

1. **"Take claude-md-curator?"**
   - No, not yet. Recommended when Detect says the front door is under 30,000 characters and holds no dated entries. In the kit's layout the notes live in `handoffs/`, so the front door seldom grows.
   - ADAPT: the skill and its measuring script, rewritten to archive into a file of yours (step 2 below). Recommended when the front door is over 30,000 characters or keeps a dated log.
   - FOLD: only its rule (move the oldest entries word for word, check they landed, then remove them) goes into your handoff skill or your front door, with no script. Recommended when you already use a skill that edits the front door.
   - ADOPT as it is. Not recommended: it archives into a wiki folder and looks for a project registry that your setup does not have.
   - Not sure: the option recommended above for what Detect found: no, not yet, when the front door is under 30,000 characters and holds no dated entries (the menu offers it again once it passes); ADAPT when it is over or keeps a dated log; FOLD when a skill of yours already edits the front door.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where does the archive go?"** (only for ADAPT or FOLD)
   - `handoffs/archive.md` in your setup folder. Recommended: it sits beside the notes it continues.
   - `docs/handoff-archive.md` inside each repository that keeps its own front door. Recommended when you keep a front door per repository.
   - Not sure: the option recommended above: `docs/handoff-archive.md` in each repository when you keep a front door per repository; `handoffs/archive.md` otherwise.
   - Default when skipped: `handoffs/archive.md`.
3. **"This setup or every project?"** (only for ADAPT)
   - This setup: `.claude/skills/claude-md-curator/`. Recommended when you have one front door.
   - Every project: `~/.claude/skills/claude-md-curator/`. Recommended when several repositories each keep a front door.
   - Not sure: the option recommended above: this setup with one front door, every project when several repositories each keep one.
   - Default when skipped: this setup.

## Needs

- Claude Code.
- Node.js, for the measuring script. [Tools some items need](../docs/install-reference.md#tools-some-items-need) installs Node.js 22; `! node --version` prints a version starting with `v22`. When it is missing:
  - Windows: `! winget install --id OpenJS.NodeJS.22 -e`;
  - macOS and Linux: `! curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash`, then `! . "$HOME/.nvm/nvm.sh" && nvm install 22`.
- SkillSpector, for the scan in step 1, row 1 of your plan ([SkillSpector](skillspector.md)): `! skillspector --version`.
- The [front door](front-door.md): the file it measures.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/skills/claude-md-curator/`: scans it with `skillspector scan catalog/skills/claude-md-curator --no-llm` (on Windows, `PYTHONUTF8=1` first), triages the findings, reads the script itself (it reads and writes local files, uses only Node's own modules plus an optional import of a studio file four folders up, and makes no network call), and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found.
2. **Claude:** for ADAPT, writes `SKILL.md` and `scripts/measure_claude_md.mjs` in the place you chose, in your words, and replaces each studio-specific part:
   - the archive in the studio's wiki, with its wiki tags, its wiki links, the links from the wiki's home and index pages, and the wiki log line → your archive file from question 2, plain Markdown, newest entry first;
   - the script's routing of the archive by repository → your one path, or `docs/handoff-archive.md` beside each front door;
   - the studio's project registry, its 6,000-byte budget, its many-projects model and its note about a generated root file → dropped;
   - the studio's budget hook (the script's `--hook` modes, run by the studio's settings at session start and after each edit) → dropped, so the skill runs when you ask, or from your [handoff](handoff.md) skill. Hooks of your own are possible ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"); wiring this one is not part of this card;
   - the budget read from a studio file four folders up → the number `30000` in the script, or your own;
   - the default file (given no path, the script measures the `CLAUDE.md` four folders above itself, which in this layout is the one-line import) → `AGENTS.md`, and the skill always passes the path;
   - the entry shape it counts (lines in a `## Current state` section that start with `**YYYY-MM-DD` and a dash) → kept if your front door uses it; otherwise the pattern is rewritten to match yours.
   It shows both files before saving.
3. **Claude:** for FOLD, adds the move, check and remove rule to your handoff skill or front door, with the diff shown.
4. **Claude:** records the decision, the archive path, the place, the scan result and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `node .claude/skills/claude-md-curator/scripts/measure_claude_md.mjs AGENTS.md` (or the user-level path) prints a `File:` line with your front door, and a `Total:` line with its size and budget that ends `UNDER budget` or `OVER budget by <n>`. When it is over, the suggestion names your archive file.
2. **Claude:** in a temporary folder, with the archive path for that run pointing into the same folder, copies your front door, empties the copy's `## Current state` section, writes three dated test entries there, newest first (the order the script expects), and runs the script there with `--archive --keep=2`. Expected: its JSON output shows `"moved": 1` (a copy that kept older entries of yours would move those too), the archive file it names holds the oldest test entry word for word, and the copy keeps the two newest. Then Claude deletes the temporary folder.

If the output names a `wiki/` path, or `moved` is `0` with three test entries in place, the ADAPT missed a step: the item is not done, and the plan row stays unticked.

## Undo

- **Claude:** deletes `.claude/skills/claude-md-curator/` (or `~/.claude/skills/claude-md-curator/`), on your yes.
- **Claude:** for FOLD, removes the lines it added, with the diff shown.
- The archive file stays: it holds your history. To bring an entry back, Claude copies it from the archive into the front door, word for word.

## Watch out

- **Cost.** The kit copy's description, which loads every session, is 714 bytes, about 179 tokens; its body, 6,251 bytes, about 1,563 tokens, loads only when it runs (estimates, bytes divided by 4). The script runs outside the conversation; only its printed report enters it.
- **The 30,000 line is the studio's.** At one byte a character, 30,000 characters is about 7,500 tokens (estimate) in every session. The script also prints a "hard limit" of 40,000 that it calls Claude Code's warning threshold; that number is not documented in docs/facts.md as of 2026-11-02.
- **"0 dated entries" can mean the wrong shape.** The script counts only the one line shape above. A clean report on a front door written another way proves nothing; try it once on a copy with entries you know are there.
- **`--archive` writes both files itself.** It checks every entry is in the archive before removing it, and leaves the front door unchanged when that check fails. Run it on a committed front door, so git can show and undo the change.
- **Windows line endings.** The script reads lines ending in CRLF or LF but writes the front door back with LF only. On a file saved with CRLF, your editor or git may then show every line as changed.
- **Keep the front door useful.** Archiving history is the point; stripping the rules, the current state or the pointers to reach a number is not.
