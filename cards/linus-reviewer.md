---
id: linus-reviewer
module: 08-agents-and-council
checked: 2026-11-02
---

# The reviewer seat

## Why

- **The problem:** a change checked only by the session that wrote it gets one view, and that view already believes the change is right. Its checks can pass while the change itself is wrong.
- **The reason:** this agent reviews a diff or a branch before it merges: correctness first, then your conventions, then security, then simpler code. It assumes there is a bug until it has shown there is not, cites each finding by file and line with its severity and fix, and ends with an explicit verdict, **APPROVE** or **CHANGES REQUESTED**. It has no Write or Edit tool, its instructions keep it to reading, and it runs in its own context window.
- **The cost of skipping it:** in the studio, a run passed every check and would have deleted about 190 pages; reading the change, not the checks, is what caught it ([the green run](../examples/green-run-that-would-have-deleted.md)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). A change is not called ready to merge until something that did not write it has read the diff and said what it checked.

## Detect

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The seat itself, at project and user level: `ls .claude/agents/linus-reviewer.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/linus-reviewer.md" 2>/dev/null`, and any other name recorded for this seat in `adoption/decisions.md`.
- Another agent or skill doing the same job: a code reviewer, a "review my diff" or pull-request reviewer. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- The skills that start this agent by name in the kit's copies, by folder name only: `ls -d .claude/skills/requesting-code-review .claude/skills/subagent-driven-development .claude/skills/executing-plans "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/requesting-code-review "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/subagent-driven-development "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/executing-plans 2>/dev/null`, and the same three in `adoption/plan.md`.
- Where your conventions are written: `ls CLAUDE.md AGENTS.md .claude/CLAUDE.md CONTRIBUTING.md 2>/dev/null`.
- Git, which it reads the diff with: `git --version`.

The menu marks the item **have** when an agent file named `linus-reviewer`, or the name recorded for this seat, exists at either level; **partly** when another reviewer agent or skill does the same job; and **not yet** otherwise.

## Ask

1. **"Take the reviewer seat?"** Recommended when your work is software, ML or data.
   - On its own: the reviewer you call by name before a merge. Recommended when Detect says **not yet** and none of the three skills that call it is in place or planned.
   - As the reviewer behind your review skills: the same file, which [requesting-code-review](requesting-code-review.md), [subagent-driven-development](subagent-driven-development.md) and [executing-plans](executing-plans.md) start by this name in the kit's copies. Recommended when Detect finds any of them, in place or planned.
   - FOLD it into the reviewer you already have: add this seat's order (correctness, conventions, security, simpler code), its file-and-line findings and its explicit verdict. Recommended when Detect says **partly**.
   - Skip.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"**
   - Every project: your user folder's `agents/`. Recommended when one set of conventions covers all your work.
   - This project only: `.claude/agents/` in the repository. Recommended when each repository has its own conventions file, so the seat names the right one.
   - Not sure: the recommended option above for your repositories; when Claude cannot tell, every project, pointed at "the repository's instruction file" rather than at one file name.
   - Default when skipped: every project.

## Needs

- Claude Code, for the seat as a subagent. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), so this card has no claude.ai route.
- Git, from START-HERE's "Prepare": the seat reads diffs and history with it.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Optional: the kit's [diagnosing-bugs](diagnosing-bugs.md), for proving a suspected bug before it is reported.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/linus-reviewer.md`: scans it with SkillSpector (`skillspector scan catalog/agents/linus-reviewer.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file carries the studio's naming and stacks.
2. **Claude:** writes the seat in your words, and shows it to you before saving:
   - **the name:** if any of the three skills above will start it, keep `linus-reviewer`, or rename it and change the name in those skills too (their cards say where). Otherwise a plain role name such as `reviewer`. The file name and the `name:` line match;
   - **the description:** what it reviews and when, without the studio's name for its crew;
   - **"our conventions":** the file where yours are written, from Detect, such as your `CLAUDE.md` or `CONTRIBUTING.md`;
   - **the review commands:** the kit's copy reaches for `/code-review` and `/security-review`. Neither is documented in docs/facts.md as of 2026-11-02; keep them only if your Claude Code has them, and otherwise name your own review skill or cut the line;
   - **the stack audits:** the kit's copy names three audit skills for the studio's own stacks. They become your stack's audit skills, or the line is cut;
   - **the debugging skill:** it points at the kit's `diagnosing-bugs` if you take it, or at your own, or the line is cut;
   - **keep:** the order of the lens, "assume there is a bug until proven otherwise", the findings format (file and line, severity, why, fix), the explicit verdict, and "never a rubber-stamp";
   - **the tools:** read, search, shell, web and Skill, with no Write or Edit; the `tools:` line is an allowlist. The shell can still change files, so the seat is read-only by its instructions, not by its tools (Watch out). No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, as you chose.
4. **Claude:** if you take the council, adds the seat to the council's seat list and to the panel row on architecture, for questions that come with a diff.
5. **Claude:** records the decision, the name, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, and its `tools:` line names neither Write nor Edit.
2. **you:** in a new session, inside a repository with one small finished commit, say "use the <name> agent to review my last commit". Expected: Claude starts that subagent, and its report lists findings by file and line, each with a severity and a fix (or says it found none and what it checked), and ends with **APPROVE** or **CHANGES REQUESTED**.
3. **you:** afterwards, the repository is as it was: same branch, nothing changed in the working tree.

If Claude reviews in the main thread, the report has no verdict, or the review changed your checkout, the item is not done: the plan row stays unticked, and the file's tools line and description are the first things to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to.
- **Claude:** tells you which of your skills start it by name; until they are changed (their cards' Undo), they will not find a reviewer.
- **Claude:** removes the seat from the council's seat list and panel table, if it was added there.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 51 tokens (its 202 bytes divided by 4, an estimate). Its instructions, about 327 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **Two output formats can meet.** When [requesting-code-review](requesting-code-review.md) starts this seat, its brief asks for Strengths, Issues by severity and "Ready to merge?", while the seat's own instructions ask for APPROVE or CHANGES REQUESTED. Which one wins is not documented; pick one when you adapt them, so every review reads the same.
- **Read-only is only as strong as the tool list.** The seat keeps Bash, and a subagent given Bash can change files without Write or Edit ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"); a git command can also move your checkout. The kit's review brief tells the reviewer to inspect with `git show`, `git diff` and `git log` and to look at another revision in a separate folder; keep that rule.
- **What it reads leaves your machine.** The code it reviews is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where WebSearch and WebFetch send their requests beyond that is not in docs/facts.md as of 2026-11-02. Check your company's data rules for that code, and take both web tools out of the `tools:` line if they require it.
- **One review at the end, for routine work.** The studio stopped a run of near-identical implement-then-review rounds as too repetitive: the early, risky tasks had gained from their reviews, the later routine ones had not ([module 04, The mechanism](../modules/04-delegation/README.md#the-mechanism)). Keep per-task reviews for risky or unclear work.
- **On Windows,** your user folder is `%USERPROFILE%\.claude` ([docs/facts.md](../docs/facts.md)).
