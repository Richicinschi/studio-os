A skill is a short written procedure the studio kept after something went wrong once. Each has its own folder under `.claude/skills/`; you will find them in your skill list or in `SKILLS.md`.

1. **Check for a skill before you act.** Do it before you ask a clarifying question, open the code or list files. When a skill might fit, even slightly, load it (the Skill tool, or open its `SKILL.md`) and follow it. If it proves wrong for the job, put it down. Not sure which one? `using-agent-skills` maps tasks to skills.
2. **Process skills come before craft skills.** A new feature or change starts with `brainstorming` (`drill-to-plan`, the heavier one, when the idea is still vague), ahead of any code and ahead of plan mode. A failure starts with `diagnosing-bugs`, ahead of any fix. A finished plan goes to `executing-plans` or `subagent-driven-development`. Before you say the work is done, run `verification-before-completion`.
3. **Say which skill you are using** ("Using <skill> to <purpose>"). If it has a checklist, turn each item into a task.
4. **Open the file; do not recall it.** Skills get edited, so your memory of one may be stale.
5. **Instructions outrank skills.** the owner's direct words come first, then the `AGENTS.md` files and the studio rules, then skills, then your own defaults. Only the owner can tell you to skip a skill's workflow.
6. **Sent out as a subagent with a single job?** Ignore this primer and do the job.

Each of these thoughts is a cue to pause and check for a skill: "this is only a quick question", "I'll read the code first", "I remember what that skill says", "a skill is too heavy for this", "one small thing before I start".
