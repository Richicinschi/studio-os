---
id: coding-guidelines
module: 03-planning
checked: 2026-11-02
tokens:
  light: 131
  standard: 418
  full: 631
---

# The coding guidelines

## Why

- **The problem:** left to itself, an agent guesses what you meant without saying so, builds more than you asked for, and tidies code nobody mentioned. Each of those is a change someone has to read, test and live with, and it ends as work that answers a question nobody asked ([module 03, The problem](../modules/03-planning/README.md#the-problem)).
- **The reason:** four short principles, published at [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills), whose README names the MIT licence (it has no licence file; [docs/facts.md](../docs/facts.md), "Licences of the external items"), name those habits and their opposites. **Think before coding:** say what you assume, show the trade-offs, ask when something is unclear. **Simplicity first:** the least code that solves the problem, nothing speculative. **Surgical changes:** touch only what the task needs, and clean up only your own leftovers. **Goal-driven execution:** turn the task into a check, and loop until it passes. In an instruction file, they apply to every change Claude makes, not only to the ones you remember to review. The kit does not ship the text: you take it from upstream, after a scan.
- **The cost of skipping it:** the kit has no story of an overbuilt change. What skipping means: diffs with lines that trace to nothing you asked for, and fixes with no check that says when they are done. The last principle is the one module 03's evidence is about: a run passed every check and would still have deleted about 190 generated plan pages ([module 03, Evidence](../modules/03-planning/README.md#evidence)).
- **The principle:** [simplicity first, surgical changes](../PRINCIPLES.md#simplicity-first-surgical-changes). These guidelines are that principle written as instructions Claude reads before it changes code.

## Detect

Read-only. Counts, presence and names; no network, and no skill body is opened.

- The four principles in your instruction files, a count per file of the lines that name one, in your setup and in each repository in `adoption/inventory.md`:
  `grep -ciE 'think before coding|simplicity first|surgical changes|goal-driven execution' CLAUDE.md AGENTS.md CLAUDE.local.md 2>/dev/null`. `4` means all four are there.
- A file of their own anywhere in your setup, counted: `grep -rliE 'surgical changes|goal-driven execution' --include='*.md' "<your setup>" 2>/dev/null | wc -l`.
- Whether your front door points at such a file: Claude reads the front door's lines that name it.
- Another skill or plugin doing the same job, names only: skill folders whose name contains `karpathy` or `guidelines`, in `.claude/skills/` and in `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/"`; entries containing `karpathy` in `claude plugin list`.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when all four principles are in a file that loads every session, or in a file your front door tells Claude to read before it writes code; **partly** when one to three of them are found, or a file holds all four but nothing points at it; and **not yet** otherwise.

## Ask

1. **"Size?"**
   - Light: the four headings, one line each, in your words; about 131 tokens in every session, an estimate. Recommended for a first adoption, and when Detect says **not yet**: a first adoption leans light.
   - Standard: the four principles word for word, each with its one-line rule and its bullets, without the opening paragraph, the trade-off note, the plan example and the closing line; about 418 tokens in every session, an estimate.
   - Full: the whole upstream text, word for word; about 631 tokens in every session, an estimate. Recommended when you have run a smaller size for a while and Claude still overbuilds or guesses without saying so.
   - Not sure: light, the option recommended above for a first adoption; update mode offers to grow it later.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing is copied.

   The item is recommended for the `software`, `ml` and `data` profiles and optional for `general`; a `general` profile that rarely writes code can skip it.
2. **"Where does it go?"**
   - Your front door, so every session reads it. Recommended for the `software`, `ml` and `data` profiles, where most sessions change code.
   - A file of its own, which one line in your front door tells Claude to read before it writes or changes code. The guidelines then load only when code is about to change; the line costs about 15 tokens in every session, an estimate. Recommended for the `general` profile, or when your front door is already long.
   - FOLD into coding rules you already keep: Claude adds only the principles they lack, at the size you chose. Recommended when Detect says **partly**.
   - Not sure: the option recommended above, at the size from question 1: FOLD when Detect says **partly**, a file of its own for the `general` profile, otherwise your front door.
   - Default when skipped: your front door.

## Needs

- git, for the clone that is scanned (START-HERE, "Prepare").
- SkillSpector, row 1 of your plan ([SkillSpector](skillspector.md)); on Windows, `PYTHONUTF8=1` first ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").
- Network access to GitHub for the clone.
- Nothing else beyond Claude Code.

## Steps

1. **Claude:** runs `vet-and-adopt` on the upstream repository itself, the original the text comes from. In a temporary folder it clones it, notes the commit, and scans it (in Windows PowerShell, `$env:PYTHONUTF8=1` first; in Git Bash, `PYTHONUTF8=1` in front of the scan):
   ```bash
   git clone --depth 1 https://github.com/multica-ai/andrej-karpathy-skills.git coding-guidelines
   git -C coding-guidelines rev-parse --short HEAD
   skillspector scan coding-guidelines --no-llm
   ```
   It triages the findings with you, reads the repository's `CLAUDE.md` (the text that will load) and its licence (a licence file, or the README's licence section), and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. Only the guidelines text is taken; anything else the repository ships would be an adoption of its own, with its own scan. The temporary folder is deleted once step 2 is saved.
2. **Claude:** writes the size you chose, from the clone and never from memory, and shows it before saving:
   - **light:** the four headings, each with one line in your words;
   - **standard:** the four sections word for word, each with its heading, its bold one-line rule and its bullets; the opening paragraph, the trade-off note, the plan example and the closing line are left out;
   - **full:** the whole of `CLAUDE.md` word for word, without its title line.

   Every size opens with one line naming the repository, its licence and the commit from step 1.
3. **Claude:** adds one line after them saying which wins when they disagree with the rest of your instructions, for example "Where these guidelines and the rest of my instructions disagree, my instructions win." It shows the line first; Watch out says why it matters.
4. **Claude:** keeps the licence notice. On 2026-11-02 the repository had no licence file, only a "License" section in its README that reads "MIT" ([docs/facts.md](../docs/facts.md), "Licences of the external items"). For standard and full, which copy the text word for word, Claude saves the licence text the repository gives, its licence file if step 1 finds one and otherwise that README section, beside the guidelines (or, when they sit in your front door, in a `licences/` folder in your setup), and names it in the source line. If step 1 finds neither, Claude stops, says so, and offers light in your own words only.
5. **Claude:** puts it where question 2 decided: into your front door; or into a file of its own, such as `<your setup>/coding-guidelines.md`, with one line in your front door: "Before you write or change code, read `<that file>`."
6. **Claude:** records the size, the place, the commit, the scan result, the licence file and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -ciE 'think before coding|simplicity first|surgical changes|goal-driven execution' <the file it went into>`. Expected: `4`.
2. **Claude:** for a file of its own, `grep -c '<that file name>' <your front door>`. Expected: `1` or more.
3. **you:** in a new session, in a throwaway repository in a temporary folder holding one small function, say "add input validation to this function". Expected: before its first edit, Claude says what it assumes and how the change will be checked (for example, a test with an invalid input), and the diff touches that function and its test only. With a file of its own, Claude reads that file before its first edit. Then you delete the throwaway folder.

If step 1 prints anything but `4`, step 2 prints `0`, or Claude edits before it says what it assumes, the item is not done: the plan row stays unticked, and the wording of the guidelines, or of the pointer line, is the next thing to look at.

## Undo

- **Claude:** removes the guidelines, the source line and the which-wins line from your front door; or deletes the file of its own and the pointer line.
- **Claude:** deletes the saved licence text once nothing it covers is left.
- **Claude:** marks the row in `adoption/decisions.md` as undone.
- Nothing was installed, so nothing else needs removing.

## Watch out

- **"If uncertain, ask" can contradict your own rules.** The first principle says to ask when unsure. If your instructions say to state an assumption and carry on, the two disagree, and Claude follows one or the other from turn to turn. One line saying which file wins settles it: the line in step 3.
- **"Nothing beyond the ask" is not "less than the ask".** The guidelines rule out extras, not completeness. If you want the whole of what you asked for done every time, say so in the which-wins line.
- **They trade speed for caution,** as the upstream text says itself, and leave trivial tasks to judgement. On a one-line fix, a plan and a check can cost more than the fix.
- **Where they load.** An instruction file loads for sessions started in its folder or below it ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"). A repository beside your setup folder does not see your setup's front door; give it its own copy or pointer line. One instruction file for every project on the machine is not documented in docs/facts.md as of 2026-11-02.
- **A company repository:** put them in your own local file, `CLAUDE.local.md`, which you add to `.gitignore` yourself, rather than in the shared front door, unless your team agrees. Where the repository's front door is an `AGENTS.md`, start that local file with the line `@AGENTS.md`: a `CLAUDE.local.md` stops Claude Code from reading `AGENTS.md` there by default ([docs/facts.md](../docs/facts.md), "Claude Code: the ! prefix, /init and local files").
- **Upstream can change.** The source line names the commit you copied; scan a newer version before you take it.
- **The worked examples.** The repository also has worked examples for each principle, which the studio keeps in a file that never loads. They are long: take them, if at all, into a file read on demand.
- **Token cost,** estimates (bytes divided by 4), in every session from your front door, each with the source line and the which-wins line: light about 131, standard about 418, full about 631 (the full text alone is about 585). In a file of its own: about 15 for the pointer line, and the size's cost only when Claude reads the file.
