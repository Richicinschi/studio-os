---
id: dispatching-parallel-agents
module: 04-delegation
checked: 2026-11-02
---

# Dispatching parallel agents

## Why

- **The problem:** one thread doing everything reads thirty files to find one function and keeps every one of them in its context, and it works through independent parts one after another when they could run at the same time. While it grinds, nobody plans the next step.
- **The reason:** when work splits into parts that share no files and no state, the skill sends one subagent (a helper with its own context window, which returns only a summary) per part, all in the same response, so they run at once. Each brief is focused, stands on its own, and says what to send back. When they return, Claude reads each summary, checks that the changes do not collide, and runs the full test suite.
- **The cost of skipping it:** a 24-file sweep, done by hand in the studio's main thread, held it for about 30 minutes; a 30-line brief to a subagent could have run alongside ([the sweep done by hand](../examples/sweep-done-by-hand.md)).
- **The principle:** [delegate the mechanical, keep the decisions](../PRINCIPLES.md#delegate-the-mechanical-keep-the-decisions). The independent parts go out; the main thread keeps the split and the judgement.

## Detect

Read-only: names, descriptions and counts. No skill or agent body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/dispatching-parallel-agents/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/dispatching-parallel-agents/SKILL.md" && echo user`.
- The upstream plugin, which carries it as `superpowers:dispatching-parallel-agents`: `claude plugin list`, reading only a `superpowers@...` entry and its `Version`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about subagents, delegation or parallel work.
- Agents you have: `ls .claude/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md 2>/dev/null | wc -l`.
- A delegation rule in your instruction files: `grep -n -i -E 'subagent|parallel|delegat' CLAUDE.md AGENTS.md 2>/dev/null`.

The menu marks the item **have** when a `dispatching-parallel-agents` skill exists at either level or the superpowers plugin is installed, **partly** when only an instruction-file rule or another skill covers it, and **not yet** otherwise.

## Ask

1. **"Take dispatching-parallel-agents?"**
   - Keep what you have. Recommended when Detect says **have**.
   - ADOPT the kit's copy as it is. The studio changed nothing in its body, only the front matter. Recommended when Detect says **not yet** and you work in Claude Code.
   - ADAPT: add your own limits, in your words: how many agents at once, research agents one at a time, and a separate worktree for each agent that edits the same repository. Recommended when you have hit usage limits before; Detect cannot see that, so Claude asks.
   - SKIP: you work only in claude.ai, whose chat app has no documented subagents ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"); module 04's claude.ai steps do the split by hand, one chat per part.
   - Not sure: the recommended option above for what Detect found: ADOPT when Detect says **not yet**, with the file shown before it is saved.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where?"**
   - Every project, in `~/.claude/skills/`. Recommended in most cases: any project can split work.
   - This project only, in the repository's `.claude/skills/`.
   - Not sure: every project, the recommended option.
   - Default when skipped: this project only.

## Needs

- Claude Code. Subagents are a Claude Code feature; whether claude.ai's chat app has them is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), so there you split the work by hand ([module 04](../modules/04-delegation/README.md)).
- Nothing else.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit's copy, `catalog/skills/dispatching-parallel-agents/`: scans it with SkillSpector (`skillspector scan catalog/skills/dispatching-parallel-agents --no-llm`; on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows) and triages each finding with you. It is one prose file with its licence and no scripts. The studio rescanned its adapted copies of superpowers 7.0.1 the same way and found no new real finding; `VENDORED.md` lists every change it made. Then it recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found.
2. **Claude:** on your yes, writes the copy into the scope you chose, keeps the upstream `LICENSE` (MIT), changes the author line in the front matter, which names the studio, to yours, and replaces the studio's `VENDORED.md` with a short note of your own (the upstream, version 7.0.1, what you changed). For ADAPT it adds a short "Limits" part with the numbers you choose. It shows the change before it saves it.
3. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file is in place: `test -f <scope>/dispatching-parallel-agents/SKILL.md && echo present` prints `present`.
2. **you:** in a new session, give Claude three independent questions about different parts of your project, and say they are independent: "find where X is computed, where Y is validated and where Z is logged". Claude sends three subagents in a single response, so they start together, and answers from their three summaries.

If Claude works through the parts one after another in its own thread, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes the `dispatching-parallel-agents` folder from the scope it went into.
- **Claude:** adds a row to `adoption/decisions.md` saying the item was removed.

## Watch out

- **Parallel agents have a rate cost of their own.** The studio once sent nine research agents out at once; together they used about 1.1 million subagent tokens, hit the session limit, and the last two died mid-run. The figure is the studio's own record of those runs, not re-measured for the kit ([module 02, Evidence](../modules/02-context-and-models/README.md#evidence)). Since then its web research runs one agent at a time.
- **Not for shared files or related failures.** Agents editing the same files overwrite each other's work, and failures that share a cause need one investigation, not three. Keep each agent on its own files, or give each its own [worktree](worktrees.md).
- **A summary is a claim.** Check the diff and run the full suite before you call the work done ([verification-before-completion](verification-before-completion.md)).
- **A brief must stand alone.** A subagent does not see your conversation: give it the goal, what is ruled out, the exact files, the rules, what done looks like, and what to send back ([module 04](../modules/04-delegation/README.md)).
- **Which model the agents use** is a choice. The studio keeps subagents on the session's own model and makes web research the one exception; yours may differ ([module 02](../modules/02-context-and-models/README.md)).
- **Not for building a plan's tasks.** [subagent-driven-development](subagent-driven-development.md) never runs two builders at once, because their changes would collide; this skill is for independent investigations and fixes.
- **Cost:** its name and description load into every session, about 33 tokens (an estimate, bytes divided by 4); the full skill, about 1,600 tokens (estimate), loads only when it is used.
