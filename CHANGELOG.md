# Changelog

Each export adds a section at the top. `drill-to-adopt` in update mode reads this file.

## v2.0.1 (2026-11-02)

- The kit is now public under the MIT licence (`LICENSE`), so you can clone it without an invite or a GitHub account; the third-party skills in `catalog/skills/` keep their own licences, listed in `docs/THIRD_PARTY_NOTICES.md`.
- The README is rewritten for someone who has never seen the kit, and START-HERE now says what each step should show, how to stop and pick up again, and where you start Claude Code for daily work; install steps for later items moved to `docs/install-reference.md`.
- A first adoption is shorter and ends with proof: its questions cover only the first wave, at most about 8 items; defaults that follow from your setup come as one list you keep in one reply; the menu shows modules first, and their items only when you open one; and the first sitting ends with a new session, in a second terminal, answering from your files. The other items you chose wait under Later waves, and none is dropped.
- The drill asks one question per message, each with a recommended option that Not sure takes, asks your data rules before it suggests where anything is stored, and hands you the commands you run yourself as one block.
- `git-guardrails` 1.2.0 still blocks when jq is missing, where the 2.0.0 copy let every command through, and now also blocks history rewrites, skipped hooks, remote branch deletes and more spellings of a force-push; if you adopted it from 2.0.0, update it.
- Cards and modules now rest on dated, sourced lines in `docs/facts.md`, and wrong advice is corrected: a `CLAUDE.local.md` stops Claude Code reading `AGENTS.md` unless it starts with `@AGENTS.md`, a `!` command is no longer offered for passwords or sign-ins, and an MCP secret passed with `--env` or `--header` is treated as stored in plain text in `~/.claude.json`, so the cards use a `${VAR}` reference instead.

**Changed:** `agent:atlas-operator`, `agent:bob-builder`, `agent:fred-advocate`, `agent:jony-designer`, `agent:linus-reviewer`, `agent:lorn-founder`, `agent:saul-counsel`, `agent:sherlock-researcher`, `skill:brainstorming`, `skill:building-pydantic-ai-agents`, `skill:claim-auditor`, `skill:claude-md-curator`, `skill:codebase-design`, `skill:council`, `skill:diagnosing-bugs`, `skill:dispatching-parallel-agents`, `skill:drawio-diagrams`, `skill:drill-to-plan`, `skill:executing-plans`, `skill:finishing-a-development-branch`, `skill:frontend-design`, `skill:git-cleanup`, `skill:git-guardrails`, `skill:handoff`, `skill:improve`, `skill:modern-python`, `skill:production-fastapi`, `skill:receiving-code-review`, `skill:requesting-code-review`, `skill:subagent-driven-development`, `skill:supply-chain-risk-auditor`, `skill:tdd`, `skill:using-agent-skills`, `skill:using-git-worktrees`, `skill:verification-before-completion`, `skill:writing-great-skills`, `skill:writing-plans`

## v2.0.0 (2026-11-02)

- Studio OS v2: a clean adoption kit. You adopt the studio's way of working piece by piece through drill-to-adopt and vet-and-adopt; nothing is installed for you.
- Replaces the populated v1 export, whose history is archived privately.

**Added:** `agent:atlas-operator`, `agent:bob-builder`, `agent:fred-advocate`, `agent:jony-designer`, `agent:karen-skeptic`, `agent:linus-reviewer`, `agent:lorn-founder`, `agent:marie-architect`, `agent:midas-treasurer`, `agent:saul-counsel`, `agent:sherlock-researcher`, `skill:brainstorming`, `skill:building-pydantic-ai-agents`, `skill:claim-auditor`, `skill:claude-md-curator`, `skill:codebase-design`, `skill:council`, `skill:diagnosing-bugs`, `skill:dispatching-parallel-agents`, `skill:drawio-diagrams`, `skill:drill-to-plan`, `skill:executing-plans`, `skill:finishing-a-development-branch`, `skill:frontend-design`, `skill:git-cleanup`, `skill:git-guardrails`, `skill:handoff`, `skill:improve`, `skill:modern-python`, `skill:production-fastapi`, `skill:receiving-code-review`, `skill:requesting-code-review`, `skill:subagent-driven-development`, `skill:supply-chain-risk-auditor`, `skill:tdd`, `skill:using-agent-skills`, `skill:using-git-worktrees`, `skill:verification-before-completion`, `skill:writing-great-skills`, `skill:writing-plans`

