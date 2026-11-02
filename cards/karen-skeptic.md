---
id: karen-skeptic
module: 08-agents-and-council
checked: 2026-11-02
---

# The skeptic seat

## Why

- **The problem:** one model gives one view, shaped by how you asked. A plan checked only by the thread that wrote it gets agreed with, and a board that nods along is worthless.
- **The reason:** this agent's only job is to refute. It returns the three likeliest ways a plan breaks, each with the trigger that sets it off, then the one assumption that sinks everything if it is wrong. It runs as a subagent in its own context window, so it sees the plan you hand it, not the conversation that argued for it.
- **The cost of skipping it:** the plan's weakest joint is found after you commit to it, not before. When the studio tested its seats, they corrected each other instead of agreeing, which a single thread does not do ([module 08, Evidence](../modules/08-agents-and-council/README.md#evidence)).
- **The principle:** [push back once, then do it](../PRINCIPLES.md#push-back-once-then-do-it). The seat makes the case against a plan once, with its triggers and its evidence, and the decision stays with you.

## Detect

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The seat itself, at project and user level: `ls .claude/agents/karen-skeptic.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/karen-skeptic.md" 2>/dev/null`, and any other name recorded for this seat in `adoption/decisions.md`.
- Another agent or skill doing the same job: a skeptic, a devil's advocate, a red team or a risk reviewer. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- An instruction-file line that already asks for this lens: `grep -n -i -E 'devil|skeptic|refute|red team' CLAUDE.md AGENTS.md .claude/CLAUDE.md 2>/dev/null`.
- Whether a council is there to seat it: `ls -d .claude/skills/council "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/council" 2>/dev/null`.

The menu marks the item **have** when an agent file named `karen-skeptic`, or the name recorded for this seat, exists at either level; **partly** when another agent or skill does the same job, or an instruction-file line asks for it; and **not yet** otherwise.

## Ask

1. **"Take the skeptic seat?"**
   - On its own: one reviewer you call by name before you commit to a plan. Recommended when Detect says **not yet** and you are not taking the council.
   - On its own and as a council seat: the same file, also named in the council's seat list. Recommended when you take [council](council.md), whose panel table puts this seat on almost every kind of question.
   - FOLD it into the risk reviewer you already have: add this seat's output format (three ways it breaks, each with a trigger, then the one assumption). Recommended when Detect says **partly**.
   - Skip.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"**
   - Every project: your user folder's `agents/`. Recommended for this seat, because its lens does not depend on one codebase.
   - This project only: `.claude/agents/` in the repository, which anyone who uses the repository gets once it is committed.
   - claude.ai: a seat file in a Project's knowledge, asked in its own chat. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
   - Not sure: every project, the recommended option.
   - Default when skipped: every project.

## Needs

- Claude Code, for the seat as a subagent. In claude.ai the seat is a file you ask in a Project chat.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Optional, for the two skills it reaches for: the kit's [diagnosing-bugs](diagnosing-bugs.md) and [verification-before-completion](verification-before-completion.md). Without them it reads and reasons on its own. Either way it runs no command: it applies their method by reading, and asks you for the output a check would give.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/karen-skeptic.md`: scans it with SkillSpector (`skillspector scan catalog/agents/karen-skeptic.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file carries the studio's naming.
2. **Claude:** writes the seat in your words, and shows it to you before saving:
   - **the name:** a plain role name such as `skeptic`, or the kit's `karen-skeptic`; the file name and the `name:` line match. The persona name is the studio's, and a role name tells anyone reading your setup what the agent does;
   - **the description:** what it does and when to call it, in one or two sentences, without the studio's name for its council. It mentions your council only if you take one;
   - **the skills it reaches for:** a debugging skill and a verification skill. They point at the ones you have, such as the kit's `diagnosing-bugs` and `verification-before-completion`, or the section is cut;
   - **the voice:** the studio's seat "escalates everything". Keep the bite and aim it at the plan; in a team setting, write a voice your colleagues will read without bristling;
   - **keep:** the lens (attack the assumption, not the person), the three steps of how it works, the output format, and "when convened, speak only to risk";
   - **the tools:** an advisor's: read, search, web and Skill, with no shell, Write or Edit, so it reads and reports; the `tools:` line is an allowlist. No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, as you chose.
4. **Claude:** if you take the council, adds the seat to the council's seat list and to each panel row that needs a skeptic.
5. **Claude:** (claude.ai only) writes the seat's lens and output format as one short file.
6. **you:** (claude.ai only) add that file to the Project's knowledge.
7. **Claude:** records the decision, the name, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, and its `tools:` line names none of Bash, Write or Edit.
2. **you:** in a new session, say "use the <name> agent to refute this plan: <a small real plan>". Expected: Claude starts that subagent, and its report gives three ways the plan breaks, each with its trigger, then the one assumption that sinks it.
3. claude.ai: in a new chat in the Project, "Answer as the skeptic file describes: <the plan>" returns the same shape.

If Claude answers in the main thread without starting the subagent, or the report has no triggers, the item is not done: the plan row stays unticked, and the file's name and description are the first things to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to.
- **Claude:** removes the seat from the council's seat list and panel table, if it was added there.
- **you:** in claude.ai, remove the file from the Project's knowledge.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 57 tokens (its 225 bytes divided by 4, an estimate). Its instructions, about 276 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **Read-only is only as strong as the tool list.** The kit's release copy of this seat has no shell tool; if the copy you take still lists Bash in its `tools` line, remove it: the line is an allowlist, and a seat given Bash can change files without Write or Edit ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
- **What it reads leaves your machine.** Whatever the seat reads or looks up is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where WebSearch and WebFetch send their requests beyond that is not in docs/facts.md as of 2026-11-02. If your company's data rules cover the plans it reads, check them first, and take both web tools out of the `tools:` line if they require it.
- **It refutes; it does not decide.** A seat that says "no" every time is doing its job. The decision stays yours, and the [council](council.md) weighs it against seats with other lenses.
- **On Windows,** your user folder is `%USERPROFILE%\.claude` ([docs/facts.md](../docs/facts.md)).
