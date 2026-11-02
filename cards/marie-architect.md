---
id: marie-architect
module: 08-agents-and-council
checked: 2026-11-02
---

# The architect seat: the simplest thing that works

## Why

- **The problem:** the thread that designs a thing tends to add to it: a layer for later, an abstraction for a second case that never comes, a clever shortcut. Each one is code someone has to read, test and live with, and nobody in that thread asks whether it earns its place.
- **The reason:** this agent asks one question of every module, layer and abstraction: does it earn its place? It returns the one over-engineering risk, the smaller design, and what to cut. It reads the design in its own context window, apart from the thread that is attached to it.
- **The cost of skipping it:** the work answers a question nobody asked, or grows parts nobody needs ([module 03, The problem](../modules/03-planning/README.md#the-problem)).
- **The principle:** [simplicity first, surgical changes](../PRINCIPLES.md#simplicity-first-surgical-changes). The seat proposes the least design that solves the problem, and names what to cut.

## Detect

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The seat itself, at project and user level: `ls .claude/agents/marie-architect.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/marie-architect.md" 2>/dev/null`, and any other name recorded for this seat in `adoption/decisions.md`.
- Another agent or skill doing the same job: an architecture reviewer, a "simplify" or refactoring reviewer. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- The skills it reaches for, by folder name only: `ls -d .claude/skills/codebase-design .claude/skills/improve .claude/skills/diagnosing-bugs "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/codebase-design "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/improve "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/diagnosing-bugs 2>/dev/null`.
- Whether a council is there to seat it: `ls -d .claude/skills/council "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/council" 2>/dev/null`.

The menu marks the item **have** when an agent file named `marie-architect`, or the name recorded for this seat, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise.

## Ask

1. **"Take the architect seat?"**
   - On its own: one reviewer you call by name on a design or a structure before you build it. Recommended when Detect says **not yet**; with the skeptic, the module page names it as the pair that suits most decisions.
   - On its own and as a council seat: the same file, also named in the council's seat list. Recommended when you take [council](council.md), whose panels on architecture and on "why isn't this shipping?" call it.
   - FOLD it into the reviewer you already have: add this seat's question and its output (the one risk, the smaller design, what to cut). Recommended when Detect says **partly**.
   - Skip.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"**
   - Every project: your user folder's `agents/`. Recommended when you work on more than one codebase.
   - This project only: `.claude/agents/` in the repository. Recommended when you want it to read one repository's own structure rules.
   - claude.ai: a seat file in a Project's knowledge, asked in its own chat. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
   - Not sure: the recommended option above for your work; every project when Claude cannot tell.
   - Default when skipped: every project.

## Needs

- Claude Code, for the seat as a subagent. In claude.ai the seat is a file you ask in a Project chat.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Optional, for the skills it reaches for: the kit's [codebase-design](codebase-design.md), [improve](improve.md) and [diagnosing-bugs](diagnosing-bugs.md). Without them it reads and reasons on its own. Either way it runs no command: it applies their method by reading, and asks you for the output a check would give.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/marie-architect.md`: scans it with SkillSpector (`skillspector scan catalog/agents/marie-architect.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file carries the studio's naming.
2. **Claude:** writes the seat in your words, and shows it to you before saving:
   - **the name:** a plain role name such as `architect`, or the kit's `marie-architect`; the file name and the `name:` line match. The persona name is the studio's;
   - **the description:** what it does and when to call it, without the studio's name for its council, and with "not aesthetics" pointing at your design seat by its name, or cut if you have none;
   - **the voice:** the kit's copy borrows a public figure's style as shorthand. Claude writes the voice in plain words instead: calm, declutters, would rather delete than add;
   - **the skills it reaches for:** a design-vocabulary skill, a simplification skill and a debugging skill. They point at the ones you have, such as the kit's `codebase-design`, `improve` and `diagnosing-bugs`, or the section is cut;
   - **"leave looks to" the designer:** your design seat's name, or the line is cut;
   - **keep:** the lens (the simplest thing that works; seams that keep code testable), the three steps of how it works, the output format, and "when convened, speak only to structure and maintainability";
   - **the tools:** an advisor's: read, search, web and Skill, with no shell, Write or Edit, so it reads and reports; the `tools:` line is an allowlist. No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, as you chose.
4. **Claude:** if you take the council, adds the seat to the council's seat list and to the panel rows on structure.
5. **Claude:** (claude.ai only) writes the seat's lens and output format as one short file.
6. **you:** (claude.ai only) add that file to the Project's knowledge.
7. **Claude:** records the decision, the name, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, and its `tools:` line names none of Bash, Write or Edit.
2. **you:** in a new session, say "use the <name> agent to review the structure of <a small module or design note>". Expected: Claude starts that subagent, and its report names one over-engineering risk, a smaller design, and what to cut.
3. claude.ai: in a new chat in the Project, "Answer as the architect file describes: <the design>" returns the same three parts.

If Claude answers in the main thread without starting the subagent, or the report praises the design without naming a cut or saying there is nothing to cut, the item is not done: the plan row stays unticked, and the file's name and description are the first things to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to.
- **Claude:** removes the seat from the council's seat list and panel table, if it was added there.
- **you:** in claude.ai, remove the file from the Project's knowledge.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 64 tokens (its 253 bytes divided by 4, an estimate). Its instructions, about 289 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **Its cuts are proposals.** It would rather delete than add; the deletion is a change you decide on and review like any other.
- **Read-only is only as strong as the tool list.** The kit's release copy of this seat has no shell tool; if the copy you take still lists Bash in its `tools` line, remove it: the line is an allowlist, and a seat given Bash can change files without Write or Edit ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
- **What it reads leaves your machine.** Whatever the seat reads or looks up is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where WebSearch and WebFetch send their requests beyond that is not in docs/facts.md as of 2026-11-02. If your company's data rules cover the code it reads, check them first, and take both web tools out of the `tools:` line if they require it.
- **It judges structure, not looks.** A design question about how something looks belongs to a design seat, such as [jony-designer](jony-designer.md).
- **On Windows,** your user folder is `%USERPROFILE%\.claude` ([docs/facts.md](../docs/facts.md)).
