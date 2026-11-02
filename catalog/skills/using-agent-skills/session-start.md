> Source: the rules of obra/superpowers `skills/using-superpowers/SKILL.md` (MIT, Copyright (c) 2025 Jesse Vincent) @ v7.0.1 2ce8aa15, in the studio's shorter wording; folded into using-agent-skills (audit W7, 2026-11-02); licence in `LICENSE`. a start-up hook of your own (the studio's is not in this kit) injects everything below this line at session start, after a clear and after a compaction.

Skills are the studio's written process: one folder each under `.claude/skills/`, in your skill list or in `SKILLS.md`. They hold what went wrong before.

1. **Check for a skill before you act**: before a clarifying question, before exploring the code, before checking files. If one may apply, even on a small chance, invoke it (the Skill tool, or read its `SKILL.md`) and follow it; drop it if it turns out not to fit. Unsure which one: `using-agent-skills` routes the catalog.
2. **Process skills first, then implementation skills.** Something to build or change: `brainstorming` (or `drill-to-plan`, the heavier one) before any code, and before entering plan mode. Something broken: `diagnosing-bugs` before any fix. A plan in hand: `executing-plans` or `subagent-driven-development`. About to say done: `verification-before-completion`.
3. **Announce it** ("Using <skill> to <purpose>"), and where it has a checklist, make one task per item.
4. **Read the skill as it is now**, not as you remember it. Skills change.
5. **Instructions outrank skills.** the owner's direct requests, the `AGENTS.md` files and the studio rules come first; skills come before default behaviour. Skip a skill's workflow only when the owner says so.
6. **Dispatched as a subagent for one task?** This primer is not for you: do the task.

Thoughts that mean stop and check first: "it's just a simple question", "let me look at the code first", "I know what that skill says", "the skill is overkill", "I'll just do this one thing first".
