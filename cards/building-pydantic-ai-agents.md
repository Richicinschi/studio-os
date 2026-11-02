---
id: building-pydantic-ai-agents
module: 09-data-work
checked: 2026-11-02
---

# Pydantic AI agents

## Why

- **The problem:** an agent whose tool calls into an API or a database were never tested. It works in the demo, and nobody can say which tool it will call, with which arguments, on the next input ([module 09, The problem](../modules/09-data-work/README.md#the-problem)).
- **The reason:** the skill is a reference for Pydantic AI, a Python framework for building agents. Each tool gets typed inputs and a typed output; leaving plain text out of the output type forces a structured result; and tests run the agent against a stand-in model (`TestModel`), so which tool was called, with what, is checked the same way on every run. Module 09 uses it as the reference for tool contracts even if you build with another framework.
- **The cost of skipping it:** the kit has no story of its own here. Without it, an agent's tool calls are tested against a live model, if at all, where each run is slow and its answer can change from one run to the next.
- **The principle:** [checks for rules that must never break, prose for judgement](../PRINCIPLES.md#checks-for-rules-that-must-never-break-prose-for-judgement). A tool contract held by a type and a test cannot be forgotten the way a sentence in a prompt asking for structure can.

## Detect

Read-only: folder names, the front matter of skills and agents (their name and description), and counts of files, never a skill's body, a data file or a credential such as a model provider's key. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/building-pydantic-ai-agents "$U/skills/building-pydantic-ai-agents" 2>/dev/null`.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'pydantic.?ai|agent framework|tool call' && echo "$f"; done`
- Whether the project uses Pydantic AI, as a count of files: `grep -rlE 'pydantic[_-]ai' --include='*.py' --include='pyproject.toml' . 2>/dev/null | wc -l`.
- Module 09's tool-contract checklist, already in an instruction file: `grep -inE 'typed (input|output)|TestModel|tool contract|explicit timeout' CLAUDE.md AGENTS.md 2>/dev/null`.

The menu marks the item **have** when a skill named `building-pydantic-ai-agents` exists, or another skill covers building and testing Pydantic AI agents; **partly** when the instruction file holds the tool-contract checklist but no skill is there; **not yet** otherwise.

## Ask

1. **"Take building-pydantic-ai-agents?"**
   - ADOPT as it is: the upstream reference, kept word for word according to the skill's own front matter ("SKILL + references kept verbatim"; `SOURCE.md` uses the kit's general wording, "adapted", so compare with upstream if it matters); only the front matter's studio lines go (step 2). Recommended when Detect says **not yet** and you build agents with Pydantic AI.
   - FOLD: only module 09's four-line tool-contract checklist, in your words, into the agent project's instruction file. Recommended when you build agents with another framework.
   - ADAPT: the reference cut down to the parts you use, for example tools and testing only. Recommended when its context cost matters more to you than its breadth.
   - Skip. Recommended when Detect says **have**, or when you build no agents.
   - Not sure: the option recommended above for what Detect found: skip for **have**; ADOPT when you build agents with Pydantic AI; FOLD when you build them with another framework, with the four lines shown to you first.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"** (for ADOPT or ADAPT)
   - This project: `.claude/skills/building-pydantic-ai-agents/` in the agent project. Recommended when you have one agent project.
   - Every project: `~/.claude/skills/building-pydantic-ai-agents/`.
   - Not sure: this project, the option recommended above and the narrower choice.
   - Default when skipped: this project.

## Needs

- For the skill: nothing beyond Claude Code.
- For the agents it helps you build: Python, 3.10 or later according to the skill's own front matter, and Pydantic AI itself. Installing either is not documented in docs/facts.md as of 2026-11-02; uv, which the kit's Python items use, is ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux").
- An API key for the model provider your agent calls, kept out of the repository.
- SkillSpector, for the scan in step 1: row 1 of your plan ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/building-pydantic-ai-agents/`: `skillspector scan catalog/skills/building-pydantic-ai-agents --no-llm` (on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows), the triage, and a recommendation against what Detect found. The studio's scan of this copy on 2026-11-02 said SAFE, 5/100; your own result is the one that counts.
2. **Claude:** for ADOPT or ADAPT, on your yes, writes the copy and shows you the change before it saves it: the description's triggers in your words; the front matter's studio lines (who adapted it, the studio's note on what it was kept for, the studio's own scan note) dropped; the upstream author and source line kept; the eleven files in `references/` kept, or for ADAPT only those you chose, with the routing tables trimmed to match; `LICENSE` kept (MIT, per the `LICENSE` file itself, the kit's only source for it).
3. **Claude:** for FOLD, writes the tool-contract checklist in your words into the agent project's `CLAUDE.md` or `AGENTS.md`, under its rules: every tool has typed inputs and a typed output, never free text where a structure is expected; every outside call has an explicit timeout and logs the request and the outcome; every tool has a test that runs without a real model and checks which tool was called with which arguments; every number the agent reports names the query or call that produced it.
4. **Claude:** records the decision, the scope, the scan result and the undo in `adoption/decisions.md`.

## Check

- **ADOPT or ADAPT. you:** in a new session in the agent project, ask "how do I test this agent's tool calls without calling a real model?". Expected: Claude answers from the skill: `TestModel`, set with `agent.override(model=...)` rather than by assigning `agent.model`, and an assertion on which tools the model was offered or called.
- **FOLD. you:** in a new session, ask Claude to add one tool to the agent. Expected: the new tool has typed inputs and output, an explicit timeout on any outside call, and a test that runs without a real model.

If the answer or the code misses those points, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes `.claude/skills/building-pydantic-ai-agents/` or `~/.claude/skills/building-pydantic-ai-agents/`, whichever scope you chose.
- **Claude:** for FOLD, removes the checklist lines from the instruction file, which `adoption/decisions.md` names.
- **Claude:** adds the removal to `adoption/decisions.md`. Agent code and tests written with it stay; they are your code now.

## Watch out

- **Context cost:** the description loads every session, about 90 tokens; the body, about 2,970 tokens, loads when the skill runs. The eleven reference files hold about 13,470 tokens together, and the skill tells Claude to open one at a time. Estimates (bytes divided by 4).
- **Its model names are dated.** The examples use model ids such as `claude-sonnet-4-6` and `claude-opus-4-6`; the current Claude models are listed in [docs/facts.md](../docs/facts.md), "Models: which for what". Which ids Pydantic AI accepts is not documented in docs/facts.md as of 2026-11-02.
- **Tracing can send your payloads out.** The skill recommends Logfire for tracing, and one of its settings captures the exact payloads sent to the model provider. Where those traces are stored is not documented in docs/facts.md as of 2026-11-02; with company data in the prompts, check your rules before you turn it on.
- **Overlap with production-fastapi.** [production-fastapi](production-fastapi.md)'s description also triggers on a `pydantic` import, so in a Pydantic AI project both bodies can load, about 9,050 tokens together (an estimate). Take production-fastapi only where the agent calls or serves HTTP, and narrow its trigger.
- **A fast-moving library.** The skill already warns that one keyword is deprecated and will be removed in the next major version; check it against the version you install.
