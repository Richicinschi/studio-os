---
id: diagnosing-bugs
module: 09-data-work
checked: 2026-11-09
tokens:
  description: 60
  body: 2563
---

# Diagnosing bugs

## Why

- **The problem:** a hard bug or a slowdown invites guessing: read the code, form a theory, change something, look again. Each miss leaves a change behind, and after three misses nobody knows which change did what. Jumping to a theory before anything can show the bug is the exact failure this skill is built to prevent.
- **The reason:** before any theory, the skill builds one command that goes red on this bug (a feedback loop), shrinks the case until every part of it matters, ranks three to five theories that each predict something testable, probes one variable at a time, writes the regression test before the fix, and removes its own debug lines at the end. "Fixed" then means the command that was red is green.
- **The cost of skipping it:** a check that cannot go red proves nothing. The studio had a run pass every one of its checks while the change it made would have deleted about 190 pages ([the green run](../examples/green-run-that-would-have-deleted.md)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). No fix is proposed until a red command, a minimal case and a confirmed theory exist, and the report says which theory turned out right.

## Detect

Read-only: folder names, the front matter of skills and agents (their name, description and version) and command paths, never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/diagnosing-bugs "$U/skills/diagnosing-bugs" 2>/dev/null`. If one exists, its version: `awk '/^---$/{n++; next} n==1' <its SKILL.md> | grep -E 'version:'`. The kit's copy is `1.1.0`; `1.0.0` is an earlier copy.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'debug|diagnos|root cause|regression' && echo "$f"; done`
- Whether Claude's shell can run the skill's two bash scripts: `command -v bash` prints a path, or nothing.

The menu marks the item **have** when a `diagnosing-bugs` skill at `1.1.0` is in place, or another debugging skill; **partly** when a `1.0.0` copy is there; **not yet** otherwise.

## Ask

1. **"Take diagnosing-bugs?"** Recommended when your work is software, ML or data.
   - ADAPT: the kit copy with your instruction file, your test command and your design skill in place of the studio's pointers. Recommended when Detect says **not yet** and you debug code you maintain.
   - ADOPT as it is: the body as it ships; Claude still drops the front matter's studio lines and the pointer to a skill you may not have (step 2).
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

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/diagnosing-bugs/`: `skillspector scan catalog/skills/diagnosing-bugs --no-llm` (on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows). The maintainers' latest scan result, in the skill's `SOURCE.md` ("Last scan"), is `SAFE` (risk 0/100); a newer SkillSpector can score it differently. If your scan says anything other than SAFE, Claude shows each finding with its reading of it, and continues only when you have read them and say so (Watch out has what to check). It reads the copy's `version:` line too: `1.1.0` is the kit's copy, with `references/` and its five files.
2. **Claude:** on your yes, writes the copy for your setup and shows you the change before it saves it:
   - the description's triggers in your words;
   - the pointer to `AGENTS.md`, `CONTEXT.md` and `DECISIONS.md` changed to your own instruction file and decision log, or dropped;
   - the last phase's hand-off to the `improve` skill: kept when you take the kit's [improve](improve.md), otherwise pointed at your own skill or at a line that asks you;
   - `npm test` in `references/find-polluter.sh` replaced by your single-test command;
   - the front matter's author changed to yours;
   - `references/` kept together, since its files point at each other.
3. **Claude:** for FOLD, adds only the missing parts to your existing skill, each under a line naming where it came from.
4. **Claude:** records the decision, the scope, the scan result and its triage, and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** in a temporary folder, writes a function with a deliberate off-by-one mistake and a test that fails on it, using your test runner.
2. **you:** in a new session, say "debug this: <the test command>". Expected, in this order: Claude names one command, runs it and pastes its red output before offering any theory; then shows three to five ranked theories, each with the prediction that would prove it wrong; and only after a probe confirms one does it propose a fix, with the regression test written first. Then Claude deletes the temporary folder.

If Claude proposes or makes a fix before it has shown a red run, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes `.claude/skills/diagnosing-bugs/` or `~/.claude/skills/diagnosing-bugs/`, whichever scope you chose. For FOLD, it removes the sections it added, which `adoption/decisions.md` names.
- **Claude:** adds the removal to `adoption/decisions.md`. Regression tests the skill helped you write stay; they are your code now.

## Watch out

- **If your scan does not say SAFE.** The maintainers' latest scan result, in the skill's `SOURCE.md` ("Last scan"), is `SAFE`, but a newer SkillSpector can flag it. Read each finding against the file and line it names before you continue: the skill is prose, one template script and a few reference files, and the usual readings to check are a debugging example that logs a working folder or stack trace locally, a phrase in a template read as a prompt leak, and a line about loops with no deadline read as unbounded work. Your own scan of the copy you take is the one that decides.
- **`references/find-polluter.sh` runs your tests.** It lists your test files, runs your test command on each one, and reports the one that leaves a file behind. Read it before you run it.
- **Windows:** both scripts are bash. Claude Code uses Git Bash when Git for Windows is installed, and PowerShell otherwise ([docs/facts.md](../docs/facts.md)), and PowerShell does not run them.
- **Context cost:** the description loads every session, about 60 tokens; the body, about 2,760 tokens, loads when the skill runs, and each file in `references/` only when Claude opens it. Estimates (bytes divided by 4).
- **Three failed fixes is a stop.** After three misses the skill tells Claude to stop and question the design with you before a fourth attempt. Expect that question; it is the skill working.
- **Only tagged debug lines are cleaned up.** The skill tags each debug line it adds with a unique prefix and removes them by that prefix at the end. Lines you add by hand during the session are not tagged.
- **One copy of each skill.** If you also have another skill that debugs, it answers the same requests. Keep one.
