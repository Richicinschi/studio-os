---
id: midas-treasurer
module: 08-agents-and-council
checked: 2026-11-02
---

# The treasurer seat: does it pay

## Why

- **The problem:** popularity passes for value. Downloads, likes and free users feel like progress, while nobody has paid, and the question "is this worth it?" gets answered with whatever number is closest to hand.
- **The reason:** this agent asks what a thing is actually worth: does it pay, and soon? It distrusts vanity numbers, quantifies before it gives an opinion, and looks for the cheapest test that proves a real person will pay. It returns a verdict: whether it pays, the one simplest paid test to run first, and the popularity-versus-revenue trap if there is one.
- **The cost of skipping it:** money questions get a strategist's answer, or none. When the studio tested its seats, each answered from its own lens, and in a debate they moved their positions instead of agreeing ([module 08, Evidence](../modules/08-agents-and-council/README.md#evidence)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). Nothing is called worth it until a test shows someone pays, or whatever "pays" means for you.

## Detect

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The seat itself, at project and user level: `ls .claude/agents/midas-treasurer.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/midas-treasurer.md" 2>/dev/null`, and any other name recorded for this seat in `adoption/decisions.md`.
- Another agent or skill doing the same job: a pricing, revenue, budget or return-on-investment reviewer. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- What "pays" means in your work: your answers about your role and your work in `adoption/spec.md`.
- Whether a council is there to seat it: `ls -d .claude/skills/council "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/council" 2>/dev/null`.

The menu marks the item **have** when an agent file named `midas-treasurer`, or the name recorded for this seat, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise.

## Ask

1. **"Take the treasurer seat?"**
   - As a council seat. Recommended when you take [council](council.md), whose panels on whether to build and on pricing call it.
   - On its own: the seat you ask "is this worth it?" Recommended when Detect says **not yet** and you sell something, or must make the case for time or budget.
   - FOLD it into what you have: a line in your instruction file asking Claude, for any new piece of work, what it is worth and how you would know. Recommended when Detect says **partly**.
   - Skip. Recommended when nothing you build is sold or budgeted.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"What does 'pays' mean for you?"**
   - Revenue from customers: the lens stays as it is. Recommended when `adoption/spec.md` says you sell a product or service.
   - Time or cost saved: the lens becomes payback, hours or money saved against hours or money spent. Recommended when you build tools or analyses for your own team.
   - Budget approval: the lens becomes what the person holding the budget needs to see, and the cheapest proof of it.
   - Not sure: the recommended option above for what `adoption/spec.md` says; when it says neither, revenue, as in the kit, and the seat says so when a question is not about selling.
   - Default when skipped: revenue.
3. **"Where?"**
   - Every project: your user folder's `agents/`. Recommended, because the question does not depend on one repository.
   - This project only: `.claude/agents/` in the repository.
   - claude.ai: a seat file in a Project's knowledge, asked in its own chat. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
   - Not sure: every project, the recommended option.
   - Default when skipped: every project.

## Needs

- Claude Code, for the seat as a subagent. In claude.ai the seat is a file you ask in a Project chat.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Nothing else from the kit: the four skills it reaches for in the kit's copy (`pricing`, `paywalls`, `offers`, `cro`) are listed in [the catalog index](../catalog/INDEX.md) with their upstream, not shipped.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/midas-treasurer.md`: scans it with SkillSpector (`skillspector scan catalog/agents/midas-treasurer.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file carries the studio's naming and its own way of selling.
2. **Claude:** writes the seat in your words, and shows it to you before saving:
   - **the name:** a plain role name such as `treasurer` or `value`, or the kit's `midas-treasurer`; the file name and the `name:` line match;
   - **the description:** what it judges and when to call it, without the studio's council name, and with "not strategy" pointing at your focus seat by its name, or cut;
   - **the lens:** your answer to question 2. For payback or budget, "the simplest paid test" becomes the cheapest proof that fits it;
   - **the skills it reaches for:** the four pricing and conversion skills become yours, if you have them, or the section is cut;
   - **"leave focus to" and "the user to":** your focus and user seats' names, or the line is cut;
   - **keep:** the voice (dry, numbers first, quantify before you opine), the three steps of how it works, the verdict, and "when convened, speak only to money";
   - **the tools:** an advisor's: read, search, web and Skill, with no shell, Write or Edit, so it reads and reports; the `tools:` line is an allowlist. No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, as you chose.
4. **Claude:** if you take the council, adds the seat to the council's seat list and to the panel rows on building and pricing.
5. **Claude:** (claude.ai only) writes the seat's lens and output format as one short file.
6. **you:** (claude.ai only) add that file to the Project's knowledge.
7. **Claude:** records the decision, the name, what "pays" means, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, and its `tools:` line names none of Bash, Write or Edit.
2. **you:** in a new session, say "use the <name> agent to judge whether <a small real idea> is worth it". Expected: Claude starts that subagent, and its report says whether it pays (in your sense of the word), names one cheap test to run first, and names a vanity-number trap if it sees one.
3. claude.ai: in a new chat in the Project, "Answer as the treasurer file describes: <the idea>" returns the same three parts.

If the report gives a strategy opinion with no number and no test, the item is not done: the plan row stays unticked, and the file's lens is the first thing to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to, or the line it added to your instruction file for FOLD.
- **Claude:** removes the seat from the council's seat list and panel table, if it was added there.
- **you:** in claude.ai, remove the file from the Project's knowledge.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 59 tokens (its 235 bytes divided by 4, an estimate). Its instructions, about 281 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **A number without a source is a guess.** It quantifies before it gives an opinion; ask where each number came from before you act on it.
- **It proposes tests; spending is yours.** A paid test, an ad budget or a price change waits for your explicit yes ([hard stops for the irreversible](../PRINCIPLES.md#hard-stops-for-the-irreversible-judgement-for-the-rest)).
- **Read-only is only as strong as the tool list.** The kit's release copy of this seat has no shell tool; if the copy you take still lists Bash in its `tools` line, remove it: the line is an allowlist, and a seat given Bash can change files without Write or Edit ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
- **What it reads leaves your machine.** Whatever the seat reads or looks up is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where WebSearch and WebFetch send their requests beyond that is not in docs/facts.md as of 2026-11-02. Prices, margins and revenue may fall under your company's data rules: check them first, and take both web tools out of the `tools:` line if they require it.
- **On Windows,** your user folder is `%USERPROFILE%\.claude` ([docs/facts.md](../docs/facts.md)).
