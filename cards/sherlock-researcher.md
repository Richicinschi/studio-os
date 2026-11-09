---
id: sherlock-researcher
module: 08-agents-and-council
checked: 2026-11-02
tokens:
  description: 57
  body: 356
other_figures:
  - 230000
---

# The researcher

## Why

- **The problem:** a question that one search will not settle gets answered from the first source found, or from memory, and every page read along the way stays in the main thread's context.
- **The reason:** this agent breaks a question into search angles, reads the real sources, checks the key claims against each other, and returns a cited report: each finding with its source and a confidence, where the sources contradict each other, and what is still unknown. It works in its own context window; only the report comes back.
- **The cost of skipping it:** wide reading done in the main thread costs that thread its time and its context. The kit has no story of a research question answered in the main thread; the nearest is other side work, a 24-file mechanical sweep the studio did there by hand for about half an hour, which a subagent could have run ([the sweep done by hand](../examples/sweep-done-by-hand.md)).
- **The principle:** [delegate the mechanical, keep the decisions](../PRINCIPLES.md#delegate-the-mechanical-keep-the-decisions). The researcher does the searching and the reading; you decide what the findings mean.

## Detect

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The agent itself, at project and user level: `ls .claude/agents/sherlock-researcher.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/sherlock-researcher.md" 2>/dev/null`, and any other name recorded for it in `adoption/decisions.md`.
- Another agent or skill doing the same job: a researcher, a "deep research" or fact-checking skill. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- Whether you hit usage limits: your answer in `adoption/spec.md`.

The menu marks the item **have** when an agent file named `sherlock-researcher`, or the name recorded for it, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise.

## Ask

1. **"Take the researcher?"**
   - On its own: the agent you hand a research question to by name. Recommended when Detect says **not yet** and your work has questions that need several sources.
   - FOLD it into the research skill or agent you already have: add this agent's report format (each finding with its source and confidence, the contradictions, the unknowns). Recommended when Detect says **partly**.
   - Skip. Recommended when your questions are settled by your own files and one search.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"One search at a time, or several at once?"**
   - One at a time. Recommended when `adoption/spec.md` says you hit usage limits; the kit's copy works this way now, as the studio's own researcher does.
   - Several at once, with a cap you set. Recommended when you do not hit usage limits and your questions split into independent parts.
   - Not sure: the recommended option above for what `adoption/spec.md` says; one at a time when it does not say.
   - Default when skipped: one at a time.
3. **"Where?"**
   - Every project: your user folder's `agents/`. Recommended, because research does not depend on one codebase.
   - This project only: `.claude/agents/` in the repository.
   - Not sure: every project, the recommended option.
   - Default when skipped: every project.

## Needs

- Claude Code, for the agent as a subagent. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), so this card has no claude.ai route.
- Web search and fetch in your Claude Code. Whether they are on for your plan or your company's setup is not documented in docs/facts.md as of 2026-11-02.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.
- Optional, for several searches at once: the kit's [dispatching-parallel-agents](dispatching-parallel-agents.md).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/agents/sherlock-researcher.md`: scans it with SkillSpector (`skillspector scan catalog/agents/sherlock-researcher.md --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers scanned its skills, not its agents, so yours is the first scan of this file. Expect ADAPT: the file carries the studio's naming and its own research jobs.
2. **Claude:** writes the agent in your words, and shows it to you before saving:
   - **the name:** a plain role name such as `researcher`, or the kit's `sherlock-researcher`; the file name and the `name:` line match;
   - **the description:** the kinds of research you do, in place of the studio's crew name and the studio's own example job;
   - **how it searches:** your answer to question 2. The kit's copy already says one at a time in step 2 of "how you work", with a pointer to one of the studio's memory notes as its reason; the pointer goes, and the reason stays in your words. For several at once, step 2 names your cap instead;
   - **the skills it reaches for:** the kit's copy names `deep-research`, which is not in the kit, and `competitor-profiling`, which the kit lists without shipping it. They become your own research skills, or the lines are cut. `dispatching-parallel-agents`, which the kit's copy keeps for independent work other than searching, stays if you take it, and covers searches too only when you chose several at once;
   - **keep:** the lens (separate fact from assertion; state confidence; name what is unknown), the step that checks key claims against each other, and the report format. Keep "write it to a file only if asked";
   - **the tools:** read, search, shell, web, Skill and Write; the `tools:` line is an allowlist. The kit's copy also lists `Task`, its way to start helpers of its own. A subagent can start subagents of its own, up to three layers below the main conversation; with one search at a time it does not need to, and `Task` is dropped. No model line, so it runs on your session's model unless Claude names a model for that call or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
3. **Claude:** saves it as `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`, as you chose.
4. **Claude:** records the decision, the name, the scope, how it searches, and the undo in `adoption/decisions.md`.

## Check

1. The file exists at `~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`.
2. **you:** in a new session, say "use the <name> agent to research <a small factual question that two public sources answer>". Expected: Claude starts that subagent, and its report gives each finding with a source link and a confidence, any contradiction between sources, and what is still unknown.
3. **you:** open one of the cited links and find the claim there.

If the report has findings without sources, or a cited page does not say what the report claims, the item is not done: the plan row stays unticked, and the verification step in the file is the first thing to look at.

## Undo

- **Claude:** deletes `<name>.md` from the agents folder it went to.
- **Claude:** deletes any report file it wrote, only if you ask; reports are yours.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Its description loads every session:** about 57 tokens (its 228 bytes divided by 4, an estimate). Its instructions, about 344 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **Parallel research has a rate cost.** The studio once sent nine research agents out at once. Together they used about 1.1 million subagent tokens and hit the session limit, and the last two died mid-run and had to be run again. Run one at a time, each agent still used about 190,000 to 230,000 tokens. These figures are the studio's own record of those runs, not re-measured for the kit ([module 02, Evidence](../modules/02-context-and-models/README.md#evidence)).
- **The model.** The studio's agents run on the session's model, with one exception: wide web research runs on the smaller `sonnet` model, one agent at a time, because it is search-and-cite work ([module 02](../modules/02-context-and-models/README.md)). Choose the model for the session before you start a big research run.
- **What it searches for leaves your machine.** The question and every search the agent writes are session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"); where WebSearch and WebFetch send their requests beyond that is not in docs/facts.md as of 2026-11-02. If your company's data rules keep a topic or a name inside, leave it out of the question, or take WebSearch and WebFetch out of the `tools:` line, an allowlist ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), and point it at internal sources.
- **A citation is a claim too.** Open one or two cited pages before you act on the report.
- **The council lists it but calls it on no panel.** The kit's council names the researcher in its crew, and no row of its panel table convenes it; you call it by name.
