---
id: tdd
module: 09-data-work
checked: 2026-11-02
---

# Test-driven development

## Why

- **The problem:** code that was never tested fails in front of the people who use it. In data work that is a transformation run on real data before anyone checked it against a known input and output, or an agent whose tool calls into an API or a database were never tested ([module 09, The problem](../modules/09-data-work/README.md#the-problem)).
- **The reason:** the skill writes one failing test, watches it fail, writes the least code that makes it pass, and repeats, one behaviour at a time ("red, then green"). A test you watched fail has proved it can catch the break it names; a test written after the code passes at once and proves nothing.
- **The cost of skipping it:** a check that cannot fail is decoration. The studio had a run pass every one of its checks while the change it made would have deleted about 190 pages ([the green run](../examples/green-run-that-would-have-deleted.md)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The red step is the evidence that a test can fail; only after it does green mean something.

## Detect

Read-only: folder names, the front matter of skills and agents (their name, description and version), and plugin names, never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/tdd "$U/skills/tdd" 2>/dev/null`. If one exists, its version: `awk '/^---$/{n++; next} n==1' <its SKILL.md> | grep -E 'version:'`. The kit's copy with the folded parts is `1.1.0`; `1.0.0` is the earlier copy without them.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'test.?driven|test.?first|red.?green' && echo "$f"; done`
- The superpowers plugin, whose own test-driven-development skill does this job: `claude plugin list`, read for a `superpowers` entry and its `Version`.
- A test-first rule in an instruction file: `grep -inE 'test.?first|failing test|red.?green' CLAUDE.md AGENTS.md 2>/dev/null`.

The menu marks the item **have** when a `tdd` skill at `1.1.0` is in place, or another test-first skill (the superpowers plugin's included); **partly** when a `1.0.0` copy or only an instruction-file rule is there; **not yet** otherwise.

## Ask

1. **"Take tdd?"** Recommended when your work is software, ML or data.
   - ADAPT: the kit copy with your test runner and your instruction file in place of the studio's. Recommended when Detect says **not yet** and you write code that must keep working.
   - ADOPT as it is: the body as it ships; Claude still replaces the front matter's studio lines (step 3).
   - FOLD: add only what you lack to the test-first skill you have, for example the vertical slices and the per-cycle checklist into superpowers' skill, or the folded checklists into a `1.0.0` copy. Recommended when Detect says **partly**, or **have** through another skill.
   - Skip. Recommended when Detect says **have** with this skill at `1.1.0`, or when you write no code.
   - Not sure: the recommended option above for what Detect found: ADAPT when Detect says **not yet**, with the runner line shown before it is saved.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"How strict?"** (for ADAPT, ADOPT or FOLD)
   - Strict, as shipped: code written before its test is deleted and written again from the test. Recommended for code other people run.
   - Strict for production code, loose for exploration: a notebook or a spike may come first, and is thrown away before the real code is written test-first. The skill's own table allows it, answering "Need to explore first" with "Fine. Throw away exploration, start with TDD."
   - Not sure: strict, the recommended option; loosening it later is one line.
   - Default when skipped: strict.
3. **"Where?"**
   - This project: `.claude/skills/tdd/` in the repository.
   - Every project: `~/.claude/skills/tdd/`. Recommended when you write tests in more than one repository.
   - Not sure: every project, the recommended option, when you write tests in more than one repository; otherwise this project, the narrower choice.
   - Default when skipped: this project.

## Needs

- Nothing beyond Claude Code, plus the test runner your project already uses. Test runners and their installs are not documented in docs/facts.md as of 2026-11-02; your project's own setup is the source.
- SkillSpector, for the scan in step 1: row 1 of your plan ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/tdd/`: `skillspector scan catalog/skills/tdd --no-llm` (on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows), the triage, and a recommendation of SKIP, FOLD, ADAPT or ADOPT against what Detect found. It reads the copy's `version:` line first: `1.1.0` carries the parts folded in from superpowers 7.0.1 (the Iron Law, the verification checklist, the common rationalizations, the red flags, and `writing-good-tests.md`); `1.0.0` is the earlier copy without them.
2. **you:** tell Claude the command that runs your tests, and the one that runs a single test, if your runner has one.
3. **Claude:** on your yes, writes the copy for your setup and shows you the change before it saves it:
   - the description's triggers in your words, and your runner in place of the two the studio names there for its own stacks;
   - the planning step's pointer to `AGENTS.md` and `CONTEXT.md` changed to your own instruction file, and to a glossary if you keep one;
   - the front matter's author, the studio's audit label and the pointer to the studio's vendoring record dropped; the two upstream source lines kept;
   - the strictness you chose in question 2;
   - `tests.md`, `mocking.md`, `refactoring.md` and `writing-good-tests.md` kept, and `LICENSE` kept as it is, with both upstream copyright lines (MIT).
4. **Claude:** for FOLD, adds only the missing parts to your existing skill, each under a line naming where it came from, and carries the MIT notice with them.
5. **Claude:** records the decision, the scope, the strictness, the scan result and the undo in `adoption/decisions.md`.

## Check

1. **you:** in a new session, ask for a small function test-first, for example "add a function that turns a list of amounts into a total, test-first".
2. Expected, in this order: Claude asks which interface and which behaviours to test; writes one test; runs it and shows it failing for the expected reason (the function does not exist yet); then writes the least code and shows the same test passing.

If Claude writes the function before the test, or never shows a failing run, the item is not done: the plan row stays unticked. Look first at whether the skill loaded at all: its description may not match the way you phrased the request.

## Undo

- **Claude:** deletes `.claude/skills/tdd/` or `~/.claude/skills/tdd/`, whichever scope you chose. For FOLD, it removes the sections it added, which `adoption/decisions.md` names.
- **Claude:** adds the removal to `adoption/decisions.md`. Tests the skill helped you write stay; they are your code now.

## Watch out

- **Context cost:** the description loads every session, about 60 tokens; the body, about 1,950 tokens, loads when the skill runs, and `writing-good-tests.md` adds about 2,110 more when Claude writes or changes tests. All three are estimates (bytes divided by 4).
- **The Iron Law is strict on purpose:** "Write code before the test? Delete it. Start over." If that does not fit how you work, settle it in question 2 rather than letting Claude decide case by case.
- **The planning step waits for you.** Before the first test, it asks you to confirm the interface and which behaviours matter. In a long run you will not watch, put those answers in the request.
- **One copy of each skill.** If you also install the [superpowers](superpowers.md) plugin, its test-driven-development skill answers the same requests. Keep one, or Claude chooses between two on every request.
- **An older copy is shorter.** A copy whose front matter says `version: 1.0.0` predates the folded parts; the kit now ships `1.1.0`. The kit's scans of both on 2026-11-02, with the SkillSpector build that reports 2.2.3, said SAFE, 5/100 (a fresh install is newer and may score them differently; [docs/facts.md](../docs/facts.md), "Installing SkillSpector"); the folded copy's one finding is licence text, and it is text only, with no scripts. Scan the copy you take.
- **Two upstreams, one licence file.** Both are MIT; an adapted copy keeps `LICENSE` with both copyright lines, and the upstreams are named in the skill's front matter and in `SOURCE.md`.
