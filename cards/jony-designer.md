---
id: jony-designer
module: 08-agents-and-council
checked: 2026-11-02
---

# The designer seat

## Why

- **The problem:** "good enough" ships. Generated design drifts toward the generic: uneven spacing, weak hierarchy, colours and type that match nothing else you make. The thread that built a screen has stopped seeing it.
- **The reason:** this agent judges how a surface looks and feels against your design system or brand: generic design, inconsistency, weak hierarchy, motion that drags. It returns a craft verdict: the top problem, the fix that fits your system, and one detail that would lift it.
- **The cost of skipping it:** nobody whose job is the details. When the studio tested its seats, each answered from its own lens, and in a debate they moved their positions instead of agreeing ([module 08, Evidence](../modules/08-agents-and-council/README.md#evidence)).
- **The principle:** [checks for rules that must never break, prose for judgement](../PRINCIPLES.md#checks-for-rules-that-must-never-break-prose-for-judgement). Taste needs judgement, which is what a seat is for. A design rule that must never break, such as "colours only from our tokens", belongs in a check instead.

## Detect

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The seat itself, at project and user level: `ls .claude/agents/jony-designer.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/jony-designer.md" 2>/dev/null`, and any other name recorded for this seat in `adoption/decisions.md`.
- Another agent or skill doing the same job: a design or UI reviewer, a brand or design-system skill, the kit's [frontend-design](frontend-design.md). This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- Whether the repository holds a design system or brand guide, counted by file name only: `find . -maxdepth 3 -not -path './node_modules/*' -not -path './.git/*' \( -iname '*design-system*' -o -iname '*brand*' -o -iname '*style-guide*' \) | wc -l`.
- Whether a council is there to seat it: `ls -d .claude/skills/council "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/council" 2>/dev/null`.

The menu marks the item **have** when an agent file named `jony-designer`, or the name recorded for this seat, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise.

## Ask

1. **"Take the designer seat?"**
   - On its own: the seat you ask to look at a screen, page, slide or chart before it goes out. Recommended when Detect says **not yet** and you make things other people see.
   - On its own and as a council seat: the same file, also named in the council's seat list. Recommended when you take [council](council.md), whose panel on design, UX and brand calls it.
   - FOLD it into the design skill or reviewer you already have: add this seat's craft verdict (the top problem, the fix, one detail). Recommended when Detect says **partly**.
   - Skip. Recommended when you build nothing with a visible surface.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"What does it judge against?"**
   - Your design system or brand guide, by its path. Recommended when Detect counts one.
   - A public guideline you follow, by name or link.
   - No fixed system: it judges consistency, hierarchy and spacing within what it is shown.
   - Not sure: your design system or brand guide when Detect counts one, the recommended option; otherwise no fixed system, and the seat names each inconsistency it finds so you can turn the repeated ones into rules.
   - Default when skipped: no fixed system.
3. **"Where?"**
   - This project only: `.claude/agents/` in the repository. Recommended when the design system lives in this repository.
   - Every project: your user folder's `agents/`. Recommended when one brand covers all your work.
   - claude.ai: a seat file in a Project's knowledge, asked in its own chat. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
   - Not sure: the recommended option above for where your design system lives; this project when Claude cannot tell.
   - Default when skipped: this project.

## Needs

- Claude Code, for the seat as a subagent. In claude.ai the seat is a file you ask in a Project chat.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Nothing else from the kit: the skills it reaches for in the kit's copy are the studio's own design-system skill, which the kit does not ship, and three design and motion skills that [the catalog index](../catalog/INDEX.md) lists with their upstream, without shipping them.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/jony-designer.md`: scans it with SkillSpector (`skillspector scan catalog/agents/jony-designer.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file holds the studio's own design system as its law.
2. **Claude:** writes the seat in your words, and shows it to you before saving:
   - **the name:** a plain role name such as `designer`, or the kit's `jony-designer`; the file name and the `name:` line match. The persona name is the studio's;
   - **the description:** what it judges and when to call it, without the studio's name for its council, and with "not code structure" pointing at your architecture seat by its name, or cut;
   - **its law:** the kit's copy holds the studio's own colour scheme and design system as law. It becomes your answer to question 2, by path or name;
   - **the skills it reaches for:** the studio's design-system skill, a palette and UX skill, a motion skill and an animation-review skill. They become yours, if you have them, such as the kit's [frontend-design](frontend-design.md), or the section is cut;
   - **"leave structure to" the architect:** your architecture seat's name, or the line is cut;
   - **keep:** the lens (spacing, hierarchy, type, motion; no generic design), the three steps of how it works, the craft verdict, and "when convened, speak only to design";
   - **the tools:** an advisor's: read, search, web and Skill, with no shell, Write or Edit, so it reads and reports; the `tools:` line is an allowlist. No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `.claude/agents/<name>.md` or `~/.claude/agents/<name>.md`, as you chose.
4. **Claude:** if you take the council, adds the seat to the council's seat list and to the panel row on design.
5. **Claude:** (claude.ai only) writes the seat's lens, its law and its output format as one short file.
6. **you:** (claude.ai only) add that file, and your design guide if you have one, to the Project's knowledge.
7. **Claude:** records the decision, the name, what it judges against, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `.claude/agents/<name>.md` or `~/.claude/agents/<name>.md`, and its `tools:` line names none of Bash, Write or Edit.
2. **you:** in a new session, say "use the <name> agent to review the design of <one page, component or stylesheet>". Expected: Claude starts that subagent, and its report names the top problem, a fix that cites your design system (or, with no fixed system, the inconsistency it found), and one detail that would lift it.
3. claude.ai: in a new chat in the Project, "Answer as the designer file describes: <the surface>" returns the same three parts.

If the report comments on code structure instead of the surface, or gives taste with no reference to your system or to what it was shown, the item is not done: the plan row stays unticked, and the "its law" line is the first thing to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to.
- **Claude:** removes the seat from the council's seat list and panel table, if it was added there.
- **you:** in claude.ai, remove the file from the Project's knowledge.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 60 tokens (its 240 bytes divided by 4, an estimate). Its instructions, about 311 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **What it can see.** Its tools read files: markup, styles, copy, motion code. Whether a subagent can look at a rendered screen or an image you attached is not documented in docs/facts.md as of 2026-11-02; describe the screen, or point it at the files that draw it.
- **A rule it enforces every time is a check, not a seat.** If the seat keeps flagging the same thing, such as a colour outside your tokens, write that rule as a lint or a test and keep the seat for judgement.
- **Read-only is only as strong as the tool list.** The kit's release copy of this seat has no shell tool; if the copy you take still lists Bash in its `tools` line, remove it: the line is an allowlist, and a seat given Bash can change files without Write or Edit ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
- **What it reads leaves your machine.** Whatever the seat reads or looks up is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where WebSearch and WebFetch send their requests beyond that is not in docs/facts.md as of 2026-11-02. Unreleased designs may fall under your company's data rules: check them first, and take both web tools out of the `tools:` line if they require it.
- **On Windows,** your user folder is `%USERPROFILE%\.claude` ([docs/facts.md](../docs/facts.md)).
