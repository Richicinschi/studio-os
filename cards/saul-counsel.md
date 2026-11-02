---
id: saul-counsel
module: 08-agents-and-council
checked: 2026-11-02
---

# The counsel seat, on call

## Why

- **The problem:** the legal side of a piece of work is the part nobody in the building thread reads: a claim in the copy that a regulator would object to, a disclosure the privacy notice lacks, a store rule, a contract gap. Found after release, each one is harder to undo than to avoid.
- **The reason:** this agent is on call, not a standing seat: it is pulled in only when something touches law, compliance, privacy, health claims, store policy or contracts. It names the specific risk, the exact rule or clause it touches, and the one fix, and it marks anything only a lawyer can settle as **[LEGAL REVIEW REQUIRED]**.
- **The cost of skipping it:** a missed obligation is found by someone else, after it ships. The kit has no story of its own for this seat; the module's evidence is the council's test, in which each seat answered from its own lens ([module 08, Evidence](../modules/08-agents-and-council/README.md#evidence)).
- **The principle:** [hard stops for the irreversible, judgement for the rest](../PRINCIPLES.md#hard-stops-for-the-irreversible-judgement-for-the-rest). The seat flags the risk and marks what needs a lawyer, so the part that cannot be undone waits for a person.

## Detect

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The seat itself, at project and user level: `ls .claude/agents/saul-counsel.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/saul-counsel.md" 2>/dev/null`, and any other name recorded for this seat in `adoption/decisions.md`.
- Another agent or skill doing the same job: a legal, compliance, privacy or policy reviewer. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- Your company's data rules and anything said about legal review: section 2 of `adoption/spec.md`.
- Whether a council is there to seat it: `ls -d .claude/skills/council "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/council" 2>/dev/null`.

The menu marks the item **have** when an agent file named `saul-counsel`, or the name recorded for this seat, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise.

## Ask

1. **"Take the counsel seat?"**
   - As an on-call council seat: added to a panel only when the question touches law, privacy, health or policy. Recommended when you take [council](council.md), whose panel table adds it for exactly those questions.
   - On its own: the seat you ask to read copy, a privacy notice or terms before they go out. Recommended when Detect says **not yet** and you publish to app stores, handle personal data, or write claims about health or money.
   - FOLD it into what you have: a line in your instruction file asking Claude to flag anything legal, privacy- or claims-related, cite the rule, and mark what needs a lawyer. Recommended when Detect says **partly**.
   - Skip. Recommended when your company's legal or compliance team reviews this work and wants no second channel.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Which rules does it check against?"**
   - Your company's own policies, by file path or page name.
   - The laws of your market and the policies of the platforms you publish on, by name.
   - No fixed list: it names the rule it cites each time, and you check each citation at its source. Recommended: it changes the least.
   - Not sure: the option recommended above, no fixed list, and every citation is checked before you act on it.
   - Default when skipped: no fixed list.
3. **"Where?"**
   - Every project: your user folder's `agents/`. Recommended when the same rules apply to all your work.
   - This project only: `.claude/agents/` in the repository. Recommended when one product carries the legal weight.
   - claude.ai: a seat file in a Project's knowledge, asked in its own chat. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
   - Not sure: the recommended option above for your work; every project when Claude cannot tell.
   - Default when skipped: every project.

## Needs

- Claude Code, for the seat as a subagent. In claude.ai the seat is a file you ask in a Project chat.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Nothing else from the kit: the three legal skills it reaches for in the kit's copy are the studio's own, which [the catalog index](../catalog/INDEX.md) marks "studio only, not in this kit".
- A lawyer, or your company's legal team, for every item it marks **[LEGAL REVIEW REQUIRED]**.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/saul-counsel.md`: scans it with SkillSpector (`skillspector scan catalog/agents/saul-counsel.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file names the rules the studio wrote it for, and the studio's own legal skills.
2. **Claude:** writes the seat in your words, and shows it to you before saving:
   - **the name:** a plain role name such as `counsel` or `compliance`, or the kit's `saul-counsel`; the file name and the `name:` line match;
   - **the description:** keep "on call" and the list of topics that pull it in, without the studio's council name;
   - **the rules it knows:** the kit's copy names the domain the studio wrote it for, GDPR and Dutch consumer law. They become your answer to question 2;
   - **the skills it reaches for:** the studio's legal skills are cut, or replaced by yours, such as a file of your company's policies;
   - **keep:** the voice (precise, cautious, cites the specific rule), the three steps of how it works, the verdict (the risk, the rule, the one fix), the **[LEGAL REVIEW REQUIRED]** marker, the line that it is not a substitute for a lawyer, and "when convened, speak only to risk and compliance";
   - **the tools:** an advisor's: read, search, web and Skill, with no shell, Write or Edit, so it reads and reports; the `tools:` line is an allowlist. No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, as you chose.
4. **Claude:** if you take the council, adds the seat to the council's seat list as on call, and to the panel rule "anything touching law, privacy or health: add this seat".
5. **Claude:** (claude.ai only) writes the seat's lens, its rules and its output format as one short file.
6. **you:** (claude.ai only) add that file, and the policies it checks against, to the Project's knowledge.
7. **Claude:** records the decision, the name, the rules it checks against, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, and its `tools:` line names none of Bash, Write or Edit.
2. **you:** in a new session, say "use the <name> agent to check this text: <a short paragraph of product copy that makes a strong claim>". Expected: Claude starts that subagent, and its report names the specific risk, the rule or policy it touches by name, one fix, and marks anything it cannot settle as **[LEGAL REVIEW REQUIRED]**.
3. claude.ai: in a new chat in the Project, "Answer as the counsel file describes: <the text>" returns the same parts.

If the report gives general caution with no rule named, or settles a question a lawyer should settle without the marker, the item is not done: the plan row stays unticked, and the "rules it knows" line is the first thing to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to, or the line it added to your instruction file for FOLD.
- **Claude:** removes the seat from the council's seat list and panel rule, if it was added there.
- **you:** in claude.ai, remove the file and any policy documents you added from the Project's knowledge.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 57 tokens (its 225 bytes divided by 4, an estimate). Its instructions, about 315 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **It is not legal advice.** It finds and flags; a lawyer, or your company's legal team, decides. Anything marked for legal review waits for them.
- **A citation can be wrong.** It cites the specific rule; check each one at its source before you act on it.
- **Company rules come first.** Where your company has a legal or compliance process, the seat feeds it and never replaces it. Contracts and personal data may not go into a session at all under your data rules.
- **Read-only is only as strong as the tool list.** The kit's release copy of this seat has no shell tool; if the copy you take still lists Bash in its `tools` line, remove it: the line is an allowlist, and a seat given Bash can change files without Write or Edit ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
- **What it reads leaves your machine.** Whatever the seat reads or looks up is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where WebSearch and WebFetch send their requests beyond that is not in docs/facts.md as of 2026-11-02. Never let it search with a contract clause or a customer's details; check your company's rules, and take both web tools out of the `tools:` line if they require it.
- **On Windows,** your user folder is `%USERPROFILE%\.claude` ([docs/facts.md](../docs/facts.md)).
