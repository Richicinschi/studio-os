---
id: diagnosing-bugs
module: 09-data-work
checked: 2026-11-02
---

# Diagnosing bugs

## Why

- **The problem:** a hard bug or a slowdown invites guessing: read the code, form a theory, change something, look again. Each miss leaves a change behind, and after three misses nobody knows which change did what. Jumping to a theory before anything can show the bug is the exact failure this skill is built to prevent.
- **The reason:** before any theory, the skill builds one command that goes red on this bug (a feedback loop), shrinks the case until every part of it matters, ranks three to five theories that each predict something testable, probes one variable at a time, writes the regression test before the fix, and removes its own debug lines at the end. "Fixed" then means the command that was red is green.
- **The cost of skipping it:** a check that cannot go red proves nothing. The studio had a run pass every one of its checks while the change it made would have deleted about 190 pages ([the green run](../examples/green-run-that-would-have-deleted.md)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). No fix is proposed until a red command, a minimal case and a confirmed theory exist, and the report says which theory turned out right.

## Detect

Read-only: folder names, the front matter of skills and agents (their name, description and version), plugin names and command paths, never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/diagnosing-bugs "$U/skills/diagnosing-bugs" 2>/dev/null`. If one exists, its version: `awk '/^---$/{n++; next} n==1' <its SKILL.md> | grep -E 'version:'`. The kit's copy with the folded parts is `1.1.0`; `1.0.0` is the earlier copy without them.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'debug|diagnos|root cause|regression' && echo "$f"; done`
- The superpowers plugin, whose own debugging skill does this job: `claude plugin list`, read for a `superpowers` entry and its `Version`.
- Whether Claude's shell can run the skill's two bash scripts: `command -v bash` prints a path, or nothing.

The menu marks the item **have** when a `diagnosing-bugs` skill at `1.1.0` is in place, or another debugging skill (the superpowers plugin's included); **partly** when a `1.0.0` copy is there; **not yet** otherwise.

## Ask

1. **"Take diagnosing-bugs?"** Recommended when your work is software, ML or data.
   - ADAPT: the kit copy with your instruction file, your test command and your design skill in place of the studio's pointers. Recommended when Detect says **not yet** and you debug code you maintain.
   - ADOPT as it is: the body as it ships; Claude still drops the front matter's studio lines and the pointer to a skill this kit does not ship (step 2).
   - FOLD: add only what you lack to the debugging skill you have, for example the red-capable loop and its completion checklist. Recommended when Detect says **partly**, or **have** through another skill.
   - Skip. Recommended when Detect says **have** with this skill at `1.1.0`.
   - Not sure: the option recommended above for what Detect found: skip for **have** with this skill at `1.1.0`, FOLD for **partly** or **have** through another skill, ADAPT for **not yet**, with the lines it would change shown to you first.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"**
   - This project: `.claude/skills/diagnosing-bugs/` in the repository.
   - Every project: `~/.claude/skills/diagnosing-bugs/`. Recommended when you debug in more than one repository.
   - Not sure: the option recommended above: every project when you debug in more than one repository, otherwise this project, the narrower choice.
   - Default when skipped: this project.

## Needs

- Claude Code.
- Bash, for `scripts/hitl-loop.template.sh` and `references/find-polluter.sh`. macOS and Linux have it. On Windows it comes with Git for Windows, which Claude Code then uses for its shell tool ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux"):
  - Windows: `! winget install --id Git.Git -e --source winget`.
- Your project's own command for running one test: `find-polluter.sh` calls `npm test <file>` as shipped, and step 2 replaces it with yours.
- SkillSpector, for the scan in step 1: row 1 of your plan ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/diagnosing-bugs/`: `skillspector scan catalog/skills/diagnosing-bugs --no-llm` (on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows). Expect a verdict other than SAFE; Claude shows each finding with its reading of it, and continues only when you have read them and say so (Watch out has the triage). It reads the copy's `version:` line too: `1.1.0` carries the parts folded in from superpowers 7.0.1 (the Iron Law, the red flags, the common rationalizations, and `references/` with its five files); `1.0.0` is the earlier copy without them.
2. **Claude:** on your yes, writes the copy for your setup and shows you the change before it saves it:
   - the description's triggers in your words;
   - the pointer to `AGENTS.md`, `CONTEXT.md` and `DECISIONS.md` changed to your own instruction file and decision log, or dropped;
   - the last phase's hand-off to `/improve-codebase-architecture`, a skill this kit does not ship, pointed at your [codebase-design](codebase-design.md) copy or at a line that asks you;
   - `npm test` in `references/find-polluter.sh` replaced by your single-test command;
   - the front matter's author, the studio's audit label and the pointer to the studio's vendoring record dropped; the two upstream source lines kept;
   - `references/` kept together, since its files point at each other; `LICENSE` kept as it is, with both upstream copyright lines (MIT, per the `LICENSE` file itself, the kit's only source for it).
3. **Claude:** for FOLD, adds only the missing parts to your existing skill, each under a line naming where it came from, and carries the MIT notice with them.
4. **Claude:** records the decision, the scope, the scan result and its triage, and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** in a temporary folder, writes a function with a deliberate off-by-one mistake and a test that fails on it, using your test runner.
2. **you:** in a new session, say "debug this: <the test command>". Expected, in this order: Claude names one command, runs it and pastes its red output before offering any theory; then shows three to five ranked theories, each with the prediction that would prove it wrong; and only after a probe confirms one does it propose a fix, with the regression test written first. Then Claude deletes the temporary folder.

If Claude proposes or makes a fix before it has shown a red run, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes `.claude/skills/diagnosing-bugs/` or `~/.claude/skills/diagnosing-bugs/`, whichever scope you chose. For FOLD, it removes the sections it added, which `adoption/decisions.md` names.
- **Claude:** adds the removal to `adoption/decisions.md`. Regression tests the skill helped you write stay; they are your code now.

## Watch out

- **The scan says DO_NOT_INSTALL, and the kit keeps it.** The build of SkillSpector that reports 2.2.3 rated the copy that now ships `DO_NOT_INSTALL`, 84/100, from four findings. All four are false positives in the kit's triage ([the kit's scan triage](../tools/export/scan-triage.md), the release build): a comment in the human-in-the-loop template ("show instruction, wait for Enter"), read as a system prompt leaking; a debugging example in `references/defense-in-depth.md` that writes a folder, the working folder and a stack trace to a local log, read as context leaving; the line "Loop forever if condition never met" in `references/condition-based-waiting.md`, which names that as a mistake and gives the fix, a timeout, read as unbounded work; and the licence's "not limited to", read as scope creep. The template's only address is `http://localhost:3000`, in an example step, and it makes no network, credential or process call.
- **`references/find-polluter.sh` runs your tests.** It lists your test files, runs your test command on each one, and reports the one that leaves a file behind; reading it, it makes no network call. Your own scan of the copy you take is the one that counts.
- **Windows:** both scripts are bash. Claude Code uses Git Bash when Git for Windows is installed, and PowerShell otherwise ([docs/facts.md](../docs/facts.md)), and PowerShell does not run them.
- **Context cost:** the description loads every session, about 60 tokens; the body, about 2,760 tokens, loads when the skill runs, and each file in `references/` only when Claude opens it. Estimates (bytes divided by 4).
- **Three failed fixes is a stop.** After three misses the skill tells Claude to stop and question the design with you before a fourth attempt. Expect that question; it is the skill working.
- **Only tagged debug lines are cleaned up.** The skill tags each debug line it adds with a unique prefix and removes them by that prefix at the end. Lines you add by hand during the session are not tagged.
- **One copy of each skill.** If you also install the [superpowers](superpowers.md) plugin, its debugging skill answers the same requests. Keep one.
