---
id: coding-guidelines
module: 03-planning
checked: 2026-11-09
tokens:
  light: 95
  standard: 445
  full: 445
---

# The coding guidelines

## Why

- **The problem:** left to itself, an agent guesses what you meant without saying so, builds more than you asked for, and tidies code nobody mentioned. Each of those is a change someone has to read, test and live with, and it ends as work that answers a question you did not ask.
- **The reason:** four short rules in one file, `templates/rules/coding-guidelines.md`: ask before you build; make the smallest change that does the job; touch only what the task touches; define done as a check, then run it. The rules are written for Claude to read before it changes code, so they cost nothing until code is about to change if you keep them in a file of their own.
- **The cost of skipping it:** diffs with lines that trace to nothing you asked for, and fixes with no check that says when they are done. Module 03's evidence is about the last one: a green result that proved nothing.
- **The principle:** [simplicity first, surgical changes](../PRINCIPLES.md#simplicity-first-surgical-changes). These guidelines are that principle written as instructions Claude reads before it changes code.

## Detect

Read-only. Counts, presence and names; no network, and no skill body is opened.

- The four rules in your instruction files, a count per file of the lines that name one, in your setup and in each repository in `adoption/inventory.md`:
  `grep -ciE 'ask before you build|smallest change|touch only what|define done' CLAUDE.md AGENTS.md CLAUDE.local.md 2>/dev/null`. `4` means all four are there.
- A file of your own with coding rules anywhere in your setup, counted: `grep -rliE 'surgical|smallest change|goal-driven' --include='*.md' "<your setup>" 2>/dev/null | wc -l`.
- Whether your front door points at such a file: Claude reads the front door's lines that name it.
- Another skill doing the same job, names only: skill folders whose name contains `guidelines` or `coding-rules`, in `.claude/skills/` and in `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/"`.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when all four rules are in a file that loads every session, or in a file your front door tells Claude to read before it writes code; **partly** when one to three of them are found, or a file holds all four but nothing points to it; and **not yet** otherwise.

## Ask

1. **"Size?"**
   - Short: the four headings, one line each, in your words; about 95 tokens in every session, an estimate. Recommended for a first adoption, and when Detect says **not yet**.
   - Full: the kit's file as it is, with the examples edited to your language and tools; about 445 tokens, an estimate. Recommended when you have run the short size for a while and Claude still overbuilds or guesses without saying so.
   - Not sure: short; update mode offers to grow it later.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing is written.

   The item is recommended for the `software`, `ml` and `data` profiles and optional for `general`; a `general` profile that rarely writes code can skip it.
2. **"Where does it go?"**
   - Your front door, so every session reads it. Recommended for the `software`, `ml` and `data` profiles, where most sessions change code.
   - A file of its own, which one line in your front door tells Claude to read before it writes or changes code. The rules then load only when code is about to change; the line costs about 15 tokens in every session, an estimate. Recommended for the `general` profile.
   - FOLD into coding rules you already keep: Claude adds only the rules they lack, at the size you chose. Recommended when Detect says **partly**.
   - Not sure: the option recommended above: FOLD when Detect says **partly**, a file of its own for the `general` profile, otherwise your front door.
   - Default when skipped: your front door.

## Needs

- Nothing beyond Claude Code or a claude.ai Project. The file is the kit's own, so there is no download and nothing to scan.

## Steps

1. **Claude:** reads `templates/rules/coding-guidelines.md` and compares it with what Detect found.
2. **Claude:** writes the size you chose, in your words and with your tools in the examples, and shows it before saving:
   - **short:** the four headings, each with one line;
   - **full:** the four sections with their bullets, the opening paragraph included.
3. **Claude:** adds one line after them saying which wins when they disagree with the rest of your instructions, for example "Where these guidelines and the rest of my instructions disagree, my instructions win." It shows the line first; Watch out says why it matters.
4. **Claude:** puts it where question 2 decided: into your front door; or into a file of its own, such as `<your setup>/coding-guidelines.md`, with one line in your front door: "Before you write or change code, read `<that file>`."
5. **Claude:** records the size, the place and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -ciE 'ask before you build|smallest change|touch only what|define done' <the file it went into>`. Expected: `4` (the wording you chose may differ; Claude checks the four headings instead and says so).
2. **Claude:** for a file of its own, `grep -c '<that file name>' <your front door>`. Expected: `1` or more.
3. **you:** in a new session, in a throwaway repository in a temporary folder holding one small function, say "add input validation to this function". Expected: before its first edit, Claude says what it assumes and how the change will be checked (for example, a test with an invalid input), and the diff touches that function and its test only. With a file of its own, Claude reads that file before it edits.

If step 1 prints anything but `4`, step 2 prints `0`, or Claude edits before it says what it assumes, the item is not done: the plan row stays unticked, and the wording of the rules, or of the pointer line, is the next thing to look at.

## Undo

- **Claude:** removes the rules and the which-wins line from your front door; or deletes the file of its own and the pointer line.
- **Claude:** marks the row in `adoption/decisions.md` as undone.
- Nothing was installed, so nothing else needs removing.

## Watch out

- **"If uncertain, ask" can contradict your own rules.** The first rule says to ask when unsure. If your instructions say to state an assumption and carry on, the two disagree, and Claude follows one or the other from turn to turn. One line saying which file wins settles it: the line in step 3.
- **"Nothing beyond the ask" is not "less than the ask".** The rules rule out extras, not completeness. If you want the whole of what you asked for done every time, say so in the which-wins line.
- **They trade speed for caution** and leave trivial tasks to judgement. On a one-line fix, a plan and a check can cost more than the fix.
- **Where they load.** An instruction file loads for sessions started in its folder or below it ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"). A repository beside your setup folder does not see your setup's front door; give it its own copy or pointer line.
- **A company repository:** put them in your own local file, `CLAUDE.local.md`, which you add to `.gitignore` yourself, rather than in the shared front door, unless your team agrees. Where the repository's front door is an `AGENTS.md`, start that local file with the line `@AGENTS.md`: a `CLAUDE.local.md` stops Claude Code from reading `AGENTS.md` there by default ([docs/facts.md](../docs/facts.md), "Claude Code: the ! prefix, /init and local files").
- **Token cost,** estimates (bytes divided by 4), in every session from your front door, with the which-wins line: short about 95, full about 445. In a file of its own: about 15 for the pointer line, and the size's cost only when Claude reads the file.
