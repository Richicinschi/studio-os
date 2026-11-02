---
name: using-agent-skills
description: >-
  Router for the studio's OWN skill catalog — given a task, find the right skill. Use when
  starting a task and unsure which skill applies, when you want to discover what skills exist,
  or when chaining skills across a piece of work. Points only at skills that actually exist in
  this workspace (.claude/skills/) plus the built-in slash commands.
metadata:
  category: studio
  author: Richicinschi (Claude-authored; routing structure inspired by addyosmani/agent-skills; session primer from obra/superpowers)
  version: 1.1.0
  domain: skill discovery / routing over the studio catalog
  sources:
    - addyosmani/agent-skills · using-agent-skills (MIT) — routing-tree STRUCTURE only; the map is fully rewritten to our catalog, his collection refs + the Karpathy-duplicate "core behaviors" dropped (those live in AGENTS.md). See ./LICENSE.
    - obra/superpowers · skills/using-superpowers (MIT) @ v7.0.1 2ce8aa15 — folded in (audit W7, 2026-11-02) — its rules in studio wording as session-start.md (injected at session start), and references/claude-code-tools.md; see ./LICENSE and ../vendored.json
---

# using-agent-skills

Find the right studio skill for the task in front of you. This routes ONLY to skills that
exist here (`.claude/skills/`, grouped by category in `.claude/skills/README.md`) and the
built-in slash commands. The global operating rules — the hard rules in
your rules file and the Karpathy coding guidelines in
your coding guidelines, both loaded through the front door `AGENTS.md` — always
apply and are not repeated here.

## Task → skill

```
Vague idea / unsure what you want?             → drill-to-plan        (interrogate → design spec)
  …a lighter design conversation?              → brainstorming
Have a spec, need an ordered plan?             → writing-plans
Have a plan, run it?                           → executing-plans (inline) · subagent-driven-development (bob-builder per task)
Independent tasks at once?                     → dispatching-parallel-agents
Need an isolated workspace?                    → using-git-worktrees  (outside the repo, off origin/main)
Designing a module interface / where a seam goes? → codebase-design
Whole-codebase architecture friction?          → improve
New UI with a distinct look of its own?        → frontend-design
A diagram (architecture / flow / ERD / UML)?   → drawio-diagrams

Building a feature / fixing a bug, test-first? → tdd                  (your stack's test runner)
Something broke / slow / throwing?             → diagnosing-bugs
Performance / Core Web Vitals?                 → performance-optimization

Reviewing a change?                            → /code-review         (add `ultra` for cloud multi-agent)
  …by the studio's reviewer seat?              → requesting-code-review (dispatches linus-reviewer)
  …review feedback came back?                  → receiving-code-review
  …security angle?                             → /security-review
  …too complex, simplify?                      → /simplify
Confirm it actually works?                     → verification-before-completion · /verify   ·   launch the app → /run
Work done, branch green?                       → finishing-a-development-branch (PR; the owner merges)

Privacy Policy / Terms / store legal?          → legal-signoff-orchestrator  (entry to the legal-* suite)

Authoring or editing a skill?                  → writing-great-skills
Installing, updating or adopting an outside
  skill, plugin, MCP server or hook?           → vet-external-skill   (SkillSpector gate → egress check → decision; the scan-first rule)
Enforce no-force-push at the tool layer?       → git-guardrails
Learning a topic over multiple sessions?       → /teach

New app or game?                               → start-project
End of session / archive it?                   → save-session
AGENTS.md getting long?                        → claude-md-curator
```

## Rules

- Check for a matching skill before starting non-trivial work — skills encode process that prevents repeat mistakes. Every session starts with the same rule set, [`session-start.md`](session-start.md), which a start-up hook of your own (the studio's is not in this kit) injects on startup, clear and compaction (superpowers' using-superpowers, in studio wording).
- Claude Code specifics (running a whole plan one layer down, when the owner asks): [`references/claude-code-tools.md`](references/claude-code-tools.md).
- Skills compose. Common chains: `drill-to-plan` → `writing-plans` → `tdd` → `/code-review`; `diagnosing-bugs` → `tdd` (regression test) → `/code-review`; `vet-external-skill` → `writing-great-skills` (adapt the survivor).
- The full catalog lives in `.claude/skills/README.md`, which holds the one category list. When unsure, read it.
- This router reflects what exists today — add a line when a new skill lands, then re-sync (`node tools/sync-skills.mjs`).
