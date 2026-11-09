---
id: verification-before-completion
module: 03-planning
checked: 2026-11-09
tokens:
  description: 58
  body: 1087
---

# Verification before completion

## Why

- **The problem:** at the end of the work, a green check is taken as proof. A passing check often means the check is broken: it ran nothing, ran the wrong thing, or could not fail. These failures report success or silence, never an obvious error, so nobody goes looking.
- **The reason:** before any claim that work is done, fixed or passing, the skill makes Claude name the command that proves it, run it fresh and in full, read the whole output and the exit code, and only then make the claim, with the evidence beside it. A subagent's "success" is checked against the diff, and a regression test counts only once it has been seen to fail.
- **The cost of skipping it:** a run in the studio passed every check it had and would have deleted about 190 pages; reading the change, not the checks, caught it ([the green run](../examples/green-run-that-would-have-deleted.md)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). This skill puts that principle in front of every "done" Claude says.

## Detect

Read-only: names and descriptions only. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/verification-before-completion/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/verification-before-completion/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about verifying, evidence, or checking before calling work done. The kit's [claim-auditor](claim-auditor.md) does a different job (see Watch out).
- A rule in your instruction files: `grep -n -i -E 'verif|evidence|baseline' CLAUDE.md AGENTS.md 2>/dev/null`.

The menu marks the item **have** when a `verification-before-completion` skill exists at either level, **partly** when only an instruction-file rule or another skill covers it, and **not yet** otherwise.

## Ask

1. **"Take verification-before-completion?"** Recommended when your work is software, ML or data.
   - Keep what you have. Recommended when Detect says **have**.
   - ADOPT the kit's copy as it is. Recommended when Detect says **not yet**.
   - ADAPT: add a baseline part in your words, so a result is compared with a number recorded before the change. Recommended when your work changes data, counts or generated files, whatever Detect says.
   - FOLD the idea into your instruction file: "never say done, fixed or passing without running the command that proves it in the same message, and quoting its result". Recommended when Detect says **partly** and you want one place for the rule.
   - Not sure: the option recommended above for what Detect found: keep what you have for **have**; otherwise ADAPT when your work changes data, counts or generated files, FOLD for **partly**, and ADOPT for **not yet**. Claude shows the file before it saves it.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where?"**
   - Every project, in `~/.claude/skills/`. Recommended in most cases: it applies to any work.
   - This project only, in the repository's `.claude/skills/`.
   - Not sure: every project, the option recommended above.
   - Default when skipped: this project only.

## Needs

- Nothing beyond Claude Code.
- The commands that prove your work: your tests, build, linter, or a query whose answer you know. The skill runs them; it does not supply them.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit's copy, `catalog/skills/verification-before-completion/`: scans it with SkillSpector (`skillspector scan catalog/skills/verification-before-completion --no-llm`; on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows) and triages each finding with you. It is one short prose file with no scripts. The maintainers' latest scan result is in the skill's `SOURCE.md`; your own scan is the one that decides. Then it recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found.
2. **Claude:** on your yes, writes the copy into the scope you chose and changes the author line in the front matter, which names the studio, to yours. For ADAPT it adds a short "Baseline" part, written for your work:
   - before a change, record the number that must not move without a reason: a row count, a total that must match the source, the answer to a query you already know, a file count;
   - after it, compare and report both numbers; a drop is a failure until it is explained;
   - ask what would have to break for a check to go red, and prove a new check can fail by breaking its input once;
   - never record a baseline that was not printed in front of you.

   For FOLD, Claude writes the one rule into your `CLAUDE.md` or `AGENTS.md` instead. It shows the change before it saves it.
3. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file is in place: `test -f <scope>/verification-before-completion/SKILL.md && echo present` prints `present` (for FOLD: the rule is in your instruction file).
2. **you:** in a new session, after a change, ask "are the tests passing?" without running anything yourself. Claude runs your test command in that reply and answers with the count from its output, such as "34/34 pass", rather than from memory.
3. For ADAPT: before a data change, ask Claude to record the baseline; afterwards, ask "is it done?". Claude reports the number before and the number after.

If Claude claims a result without running the command, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes the `verification-before-completion` folder from the scope it went into, or, for FOLD, the rule from your instruction file.
- **Claude:** adds a row to `adoption/decisions.md` saying the item was removed.

## Watch out

- **Running a check is not trusting it.** The skill makes Claude run the check fresh; it does not ask whether the check could fail. That is what the baseline in ADAPT adds, and why the studio pairs the two ([module 03](../modules/03-planning/README.md)).
- **claim-auditor is a different job.** [claim-auditor](claim-auditor.md) traces the claims in a finished deliverable back to their sources; this skill runs the checks before Claude says "done". The studio keeps both.
- **Subagents report success too.** "The agent said it worked" is not evidence; Claude checks the diff and runs the suite. This matters most with [dispatching-parallel-agents](dispatching-parallel-agents.md) and [subagent-driven-development](subagent-driven-development.md).
- **Two copies:** if you also have another skill that does the same job, both descriptions load. Keep one.
- **Cost:** its description loads into every session, about 56 tokens (an estimate, bytes divided by 4, description only, as on the other cards); the full skill, about 980 tokens (estimate), loads only when it is used.
- **claude.ai:** the same habit works as a Project instruction: give Claude the numbers you expect before you ask for the result, ask it to report every difference, and check one result by hand ([module 03](../modules/03-planning/README.md)).
