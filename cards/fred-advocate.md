---
id: fred-advocate
module: 08-agents-and-council
checked: 2026-11-02
---

# The user's advocate seat

## Why

- **The problem:** the people who build a thing judge it as builders. Jargon reads as clear, an extra step reads as harmless, and a feature that serves the builder passes for one that serves the user. One model, asked by the builder, sees it the same way.
- **The reason:** this agent steps into the shoes of the person at the other end, assumed busy, half paying attention and on a bad day, and asks: do they care, understand and benefit? It returns a user verdict: what that person feels here, the one point of confusion or friction, and the change that respects them most.
- **The cost of skipping it:** nobody in the room speaks for the person who is not there. When the studio tested its seats, each answered from its own lens, and in a debate they moved their positions instead of agreeing ([module 08, Evidence](../modules/08-agents-and-council/README.md#evidence)).
- **The principle:** [simplicity first, surgical changes](../PRINCIPLES.md#simplicity-first-surgical-changes). The seat flags features that serve the builder instead of the user: work nobody asked for, which someone then has to read, test and live with.

## Detect

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The seat itself, at project and user level: `ls .claude/agents/fred-advocate.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/fred-advocate.md" 2>/dev/null`, and any other name recorded for this seat in `adoption/decisions.md`.
- Another agent or skill doing the same job: a user advocate, a UX or usability reviewer, a customer-research or persona skill. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- Whether your instruction files already say who your users are: `grep -n -i -E 'users?|audience|customers?' CLAUDE.md AGENTS.md .claude/CLAUDE.md 2>/dev/null | wc -l`.
- Whether a council is there to seat it: `ls -d .claude/skills/council "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/council" 2>/dev/null`.

The menu marks the item **have** when an agent file named `fred-advocate`, or the name recorded for this seat, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise.

## Ask

1. **"Take the user's advocate seat?"**
   - As a council seat. Recommended when you take [council](council.md), whose panels on whether to build, on pricing and on design call it.
   - On its own: the seat you ask "how does this land for the person using it?" Recommended when Detect says **not yet** and other people use what you make: colleagues reading your reports, customers using your product.
   - FOLD it into what you have: a line in your instruction file that names your users and asks Claude to say how a change lands for them. Recommended when Detect says **partly**.
   - Skip. Recommended when you are the only person who uses what you build.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Who is the person at the other end?"**
   - Colleagues who read or use your work: reports, dashboards, internal tools.
   - Customers of your company's product, or of your own.
   - Several kinds: Claude lists them in the file, and the seat asks which one a question is about.
   - Not named yet: Claude writes "the person who will use this", and the seat asks for one real example the first time it runs. Recommended when you cannot name them now; it changes the least.
   - Not sure: the option recommended above, not named yet.
   - Default when skipped: "the person who will use this".
3. **"Where?"**
   - Every project: your user folder's `agents/`. Recommended when the same people use most of your work.
   - This project only: `.claude/agents/` in the repository. Recommended when this project has users of its own.
   - claude.ai: a seat file in a Project's knowledge, asked in its own chat. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
   - Not sure: the recommended option above for your work; every project when Claude cannot tell.
   - Default when skipped: every project.

## Needs

- Claude Code, for the seat as a subagent. In claude.ai the seat is a file you ask in a Project chat.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Nothing else: the two skills it reaches for in the kit's copy, `customer-research` and `onboarding`, are listed in [the catalog index](../catalog/INDEX.md) with their upstream, not shipped in the kit.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/fred-advocate.md`: scans it with SkillSpector (`skillspector scan catalog/agents/fred-advocate.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file speaks for the studio's own users.
2. **Claude:** writes the seat in your words, and shows it to you before saving:
   - **the name:** a plain role name such as `user-advocate`, or the kit's `fred-advocate`; the file name and the `name:` line match;
   - **the description:** the kit's copy names the studio's own audiences. They become your answer to question 2, and the studio's name for its council goes;
   - **the skills it reaches for:** the two research and first-run skills become yours, if you have them, or the section is cut;
   - **"leave money to" the treasurer:** your money seat's name, or the line is cut;
   - **keep:** the lens (busy, distracted, on their worst day), the warm, plain voice with no jargon, the three steps of how it works, the user verdict, and "when convened, speak only for the user";
   - **the tools:** an advisor's: read, search, web and Skill, with no shell, Write or Edit, so it reads and reports; the `tools:` line is an allowlist. No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, as you chose.
4. **Claude:** if you take the council, adds the seat to the council's seat list and to the panel rows on building, pricing and design.
5. **Claude:** (claude.ai only) writes the seat's lens and output format as one short file.
6. **you:** (claude.ai only) add that file to the Project's knowledge.
7. **Claude:** records the decision, the name, the users it speaks for, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, and its `tools:` line names none of Bash, Write or Edit.
2. **you:** in a new session, say "use the <name> agent to read <a short message, page or screen description> as its user would". Expected: Claude starts that subagent, and its report says what that person feels, names one point of confusion or friction, and proposes one change, in plain words.
3. claude.ai: in a new chat in the Project, "Answer as the advocate file describes: <the text>" returns the same three parts.

If the report talks about code or cost instead of the person, or names no single point of friction, the item is not done: the plan row stays unticked, and the file's lens and description are the first things to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to, or the line it added to your instruction file for FOLD.
- **Claude:** removes the seat from the council's seat list and panel table, if it was added there.
- **you:** in claude.ai, remove the file from the Project's knowledge.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 58 tokens (its 231 bytes divided by 4, an estimate). Its instructions, about 277 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **It imagines the user; it does not ask them.** A seat's empathy is a guess. One real person's reaction outweighs it; use the seat to choose what to ask them.
- **Read-only is only as strong as the tool list.** The kit's release copy of this seat has no shell tool; if the copy you take still lists Bash in its `tools` line, remove it: the line is an allowlist, and a seat given Bash can change files without Write or Edit ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
- **What it reads leaves your machine.** Whatever the seat reads or looks up is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where WebSearch and WebFetch send their requests beyond that is not in docs/facts.md as of 2026-11-02. If your company's data rules keep the material it reads inside, check them first, and take both web tools out of the `tools:` line.
- **On Windows,** your user folder is `%USERPROFILE%\.claude` ([docs/facts.md](../docs/facts.md)).
