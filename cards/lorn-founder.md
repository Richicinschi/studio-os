---
id: lorn-founder
module: 08-agents-and-council
checked: 2026-11-02
---

# The founder seat: should this exist at all

## Why

- **The problem:** work starts on whatever is new and shiny. Every yes is several other things not done, and once work has begun, sunk cost keeps it going. A thread asked "how do we build this?" never asks whether to.
- **The reason:** this agent asks one question before any other: should this exist at all, weighed against everything else you could do with the time? It returns a three-line verdict: **Pursue**, **Park** or **Kill**, the one reason, and the opportunity cost.
- **The cost of skipping it:** focus, the scarcest resource, goes to whatever asked last. When the studio tested its seats, each answered from its own lens, and in a debate they moved their positions instead of agreeing ([module 08, Evidence](../modules/08-agents-and-council/README.md#evidence)).
- **The principle:** [push back once, then do it](../PRINCIPLES.md#push-back-once-then-do-it). The seat says no once, with one reason and its cost, and hands the decision back to you.

## Detect

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The seat itself, at project and user level: `ls .claude/agents/lorn-founder.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/lorn-founder.md" 2>/dev/null`, and any other name recorded for this seat in `adoption/decisions.md`.
- Another agent or skill doing the same job: a strategy, priorities or go/no-go reviewer. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- What it could weigh a new idea against: the repositories listed in `adoption/inventory.md`, counted, and whether your instruction files carry a current-state or priorities section: `grep -c -i -E 'current state|priorit|roadmap' CLAUDE.md AGENTS.md 2>/dev/null`.
- Whether a council is there to seat it: `ls -d .claude/skills/council "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/council" 2>/dev/null`.

The menu marks the item **have** when an agent file named `lorn-founder`, or the name recorded for this seat, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise.

## Ask

1. **"Take the founder seat?"**
   - As a council seat. Recommended when you take [council](council.md), whose panels on whether to build and on pricing call it.
   - On its own: the seat you ask "should I do this at all?" Recommended when Detect says **not yet** and several repositories or streams of work compete for your time.
   - FOLD it into what you have: a line in your instruction file asking Claude, before any new piece of work, what it displaces. Recommended when Detect says **partly**.
   - Skip. Recommended when your priorities are set for you, by a team lead or a roadmap, and your questions are about how, not whether.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"What does it weigh a new idea against?"**
   - A file that lists your work in flight (a roadmap, a priorities list, a project list), by its path.
   - Your instruction file's current-state section. Recommended when Detect finds one.
   - Nothing written: the seat asks you what else is in flight each time.
   - Not sure: your instruction file's current-state section when Detect finds one, the recommended option; otherwise it asks each time, and you can name a file later.
   - Default when skipped: it asks each time.
3. **"Where?"**
   - Every project: your user folder's `agents/`. Recommended, because the question is about all your work, not one repository.
   - This project only: `.claude/agents/` in the repository.
   - claude.ai: a seat file in a Project's knowledge, asked in its own chat. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
   - Not sure: every project, the recommended option.
   - Default when skipped: every project.

## Needs

- Claude Code, for the seat as a subagent. In claude.ai the seat is a file you ask in a Project chat.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Nothing else from the kit: the three skills it reaches for in the kit's copy (`marketing-plan`, `competitor-profiling`, `pricing`) are listed in [the catalog index](../catalog/INDEX.md) with their upstream, not shipped.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/lorn-founder.md`: scans it with SkillSpector (`skillspector scan catalog/agents/lorn-founder.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file weighs everything against the studio's own portfolio.
2. **Claude:** writes the seat in your words, and shows it to you before saving:
   - **the name and the role:** "founder" fits someone who owns the whole portfolio. If that is not you, Claude names the role for whoever decides what deserves your time, such as `focus` or `priorities`; the file name and the `name:` line match. The persona name and the note about it go;
   - **the description:** what it judges and when to call it, without the studio's council name and without its worry about spreading thin across the studio's own portfolio, which becomes your own version, or is cut;
   - **what it reads:** the kit's copy reads the project's context file and the studio's project registry. It reads your answer to question 2, by path, or asks you;
   - **the skills it reaches for:** the three marketing and pricing skills become yours, if you have them, or the section is cut;
   - **"leave money to" and "shipping to":** your money and shipping seats' names, or the line is cut;
   - **keep:** the lens (should this exist at all; suspicious of shiny features, sunk cost and "while we're at it"), the three-line verdict, and "when convened, speak only to focus and fit";
   - **the tools:** an advisor's: read, search, web and Skill, with no shell, Write or Edit, so it reads and reports; the `tools:` line is an allowlist. No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, as you chose.
4. **Claude:** if you take the council, adds the seat to the council's seat list and to the panel rows on building and pricing.
5. **Claude:** (claude.ai only) writes the seat's lens and output format as one short file.
6. **you:** (claude.ai only) add that file, and your list of work in flight if you keep one, to the Project's knowledge.
7. **Claude:** records the decision, the name, what it weighs against, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, and its `tools:` line names none of Bash, Write or Edit.
2. **you:** in a new session, say "use the <name> agent to judge whether I should start <a small real idea>". Expected: Claude starts that subagent, and its report is three lines: Pursue, Park or Kill, one reason, and an opportunity cost that names something from your list of work in flight (or asks you for it).
3. claude.ai: in a new chat in the Project, "Answer as the founder file describes: <the idea>" returns the same three lines.

If the report discusses how to build the idea instead of whether to, or gives no verdict, the item is not done: the plan row stays unticked, and the file's lens is the first thing to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to, or the line it added to your instruction file for FOLD.
- **Claude:** removes the seat from the council's seat list and panel table, if it was added there.
- **you:** in claude.ai, remove the file from the Project's knowledge.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 69 tokens (its 273 bytes divided by 4, an estimate). Its instructions, about 325 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **It says no a lot, by design.** "Kill" is advice; stopping work you or others have committed to is your decision, and in a company, often not yours alone.
- **It cannot weigh what it cannot read.** With no list of work in flight, its opportunity cost is a guess; give it one, or answer its question each time.
- **Read-only is only as strong as the tool list.** The kit's release copy of this seat has no shell tool; if the copy you take still lists Bash in its `tools` line, remove it: the line is an allowlist, and a seat given Bash can change files without Write or Edit ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
- **What it reads leaves your machine.** Whatever the seat reads or looks up is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where WebSearch and WebFetch send their requests beyond that is not in docs/facts.md as of 2026-11-02. An unannounced idea may fall under your company's data rules: check them first, and take both web tools out of the `tools:` line if they require it.
- **On Windows,** your user folder is `%USERPROFILE%\.claude` ([docs/facts.md](../docs/facts.md)).
