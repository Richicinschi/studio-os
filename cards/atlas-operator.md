---
id: atlas-operator
module: 08-agents-and-council
checked: 2026-11-02
---

# The operator seat: what ships next

## Why

- **The problem:** work sprawls. Several things are half done, nothing lands, and each new idea joins "while we're at it". The thread that is building cannot see the sprawl, because from inside it every task looks reasonable.
- **The reason:** this agent asks one question: what ships next, and what is stopping it? It reads where things stand, and returns a five-line brief: the next shipment, what blocks it, the cut list, a proposed deadline, and one line on how. It would rather ship 60% of one thing than 100% of nothing. Asked to, it scopes the next step into a written plan.
- **The cost of skipping it:** nobody whose job is to cut. When the studio tested its seats, each answered from its own lens, and in a debate they moved their positions instead of agreeing ([module 08, Evidence](../modules/08-agents-and-council/README.md#evidence)).
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). The seat reads where things stand from your files (your current state, your last handoff note, your branches and commits), so its brief is only as good as what is written down.

## Detect

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The seat itself, at project and user level: `ls .claude/agents/atlas-operator.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/atlas-operator.md" 2>/dev/null`, and any other name recorded for this seat in `adoption/decisions.md`.
- Another agent or skill doing the same job: a project manager, a prioritiser, a "what's next" or scoping agent. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- The written state it would read:
  - a current-state section in your instruction files: `grep -c -i 'current state' CLAUDE.md AGENTS.md 2>/dev/null`;
  - handoff notes, counted: the folder recorded for them in `adoption/decisions.md` ([handoff note](handoff.md)), then `ls <that folder> | wc -l`.
- The planning skills it reaches for, by folder name only: `ls -d .claude/skills/drill-to-plan .claude/skills/writing-plans .claude/skills/finishing-a-development-branch "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/drill-to-plan "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/writing-plans "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/finishing-a-development-branch 2>/dev/null`.

The menu marks the item **have** when an agent file named `atlas-operator`, or the name recorded for this seat, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise.

## Ask

1. **"Take the operator seat?"**
   - On its own: the seat you ask "what ships next?" when work sprawls. Recommended when Detect says **not yet** and you carry several pieces of work at once.
   - On its own and as a council seat: the same file, also named in the council's seat list. Recommended when you take [council](council.md), whose panel on "why isn't this shipping?" calls it.
   - FOLD it into what you have: a "next shipment, blocked by, cut list" section in your handoff note, filled in at the end of each session. Recommended when Detect says **partly**, or when you keep handoff notes already.
   - Skip.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Advisor only, or may it write a plan?"**
   - Advisor only: no Write or Edit in its tools. Recommended when you write your plans yourself, or with [writing-plans](writing-plans.md) in the main thread.
   - It may scope the next step into a plan file, as the kit's copy does. Recommended when Detect finds [drill-to-plan](drill-to-plan.md) and writing-plans, in place or planned.
   - Not sure: the recommended option above for what Detect found; advisor only when neither applies, and you can add the write tools later.
   - Default when skipped: advisor only.
3. **"Where?"**
   - Every project: your user folder's `agents/`. Recommended, because it reads whatever project it is started in.
   - This project only: `.claude/agents/` in the repository.
   - Not sure: every project, the recommended option.
   - Default when skipped: every project.

## Needs

- Claude Code, for the seat as a subagent. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), so this card has no claude.ai route.
- Written state for it to read: a current-state section in your instruction file ([front door](front-door.md)) and handoff notes ([handoff note](handoff.md)). Without them, it guesses from branches and commits.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Optional, for scoping: the kit's [drill-to-plan](drill-to-plan.md), [writing-plans](writing-plans.md) and [finishing-a-development-branch](finishing-a-development-branch.md).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/atlas-operator.md`: scans it with SkillSpector (`skillspector scan catalog/agents/atlas-operator.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file carries the studio's naming and files.
2. **Claude:** writes the seat in your words, and shows it to you before saving:
   - **the name:** a plain role name such as `operator` or `shipping`, or the kit's `atlas-operator`; the file name and the `name:` line match;
   - **the description:** when to call it, without the studio's name for its council;
   - **who it is:** the kit's copy calls it the studio's chief of shipping and names the studio's own sprawl of half-done work. Claude writes your own version, or cuts it;
   - **what it reads:** the kit's copy reads the project's context file and "any save-session handoff", from a studio skill the kit does not ship. It reads your instruction file's current-state section and your newest handoff note, by their paths from Detect;
   - **the skills it reaches for:** the studio's session-saving skill is cut, or replaced by the kit's [handoff](handoff.md) if you take it; `drill-to-plan`, `writing-plans` and `finishing-a-development-branch` stay only if you take them;
   - **cut:** the note about setting deadlines through a scheduler, which the studio marks as not yet wired;
   - **keep:** the lens (what ships next, what blocks it, cut when in doubt), the voice (short sentences, then stop), the five-line brief, and "when convened, speak only to shipping";
   - **the tools:** your answer to question 2; the `tools:` line is an allowlist. Advisor only means read, search, shell, web and Skill, without Write or Edit; the shell can still change files, so Claude also takes Bash out when it must never change one. A planner also keeps Write and Edit. No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, as you chose.
4. **Claude:** if you take the council, adds the seat to the council's seat list and to the panel row on shipping.
5. **Claude:** records the decision, the name, the scope, the tools choice and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`; for advisor only, its `tools:` line names neither Write nor Edit.
2. **you:** in a new session in a project with a current-state section, say "use the <name> agent to tell me what ships next here". Expected: Claude starts that subagent, and its report is a five-line brief (next shipment, blocked by, cut list, a proposed deadline, one line on how) that names the file it read the state from.

If the brief names no source for the state, or runs past the five lines into a plan you did not ask for, the item is not done: the plan row stays unticked, and the "what it reads" line is the first thing to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to, or the section it added to your handoff note template for FOLD.
- **Claude:** removes the seat from the council's seat list and panel table, if it was added there.
- Plans it wrote stay; they are yours.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 69 tokens (its 274 bytes divided by 4, an estimate). Its instructions, about 389 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **Stale state, stale brief.** It reads your files, not your memory of the week. A current-state section last updated a month ago gives a brief from a month ago.
- **It cuts by design.** The deadline and the cut list are proposals; dropping work, and any date you promise someone, are your decisions.
- **Write access is a choice.** The kit's copy keeps Write and Edit for scoping. If you chose advisor only, they are gone; it also keeps Bash, and a subagent given Bash can change files without Write or Edit, so take Bash out too if it must never change a file ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
- **Open pull requests** are among what it reads in the kit's copy. Reading them needs your git host's command line or website; that is not documented in docs/facts.md as of 2026-11-02, so without it the seat reads branches and commits only.
- **On Windows,** your user folder is `%USERPROFILE%\.claude` ([docs/facts.md](../docs/facts.md)).
