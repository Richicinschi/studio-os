---
name: using-agent-skills
description: >-
  Maps a task to the studio skill or pack that fits it. Use when starting a task, if unsure which skill applies; also to discover what exists. Points to core skills, standalone commands and packs, plus built-in slash commands.
metadata:
  category: studio
  author: Richicinschi
  version: 1.1.0
  domain: skill discovery / routing over the studio catalog
---
# using-agent-skills

Name the task, find the row, open the skill. This page lists the skills this kit ships in `.claude/skills/`, the skills inside any domain you installed, and Claude Code's built-in slash commands.

A name followed by "pack X" lives inside the domain X you installed. Read `.claude/skills/X/SKILL.md`, find the skill in its table, open the file it names and follow it.

The hard rules (your rules file) and coding guidelines (your coding guidelines) are loaded through `AGENTS.md`. They always apply and are not repeated below.

## Which skill for which task

### Shaping the work

| Situation | Go to |
|---|---|
| Idea is vague, you cannot yet say what you want | `drill-to-plan` (questions one at a time, ends in a design spec) |
| A lighter talk about a design | `brainstorming` |
| A spec exists and needs ordered steps | `writing-plans` |
| A plan exists and must be run | `executing-plans` (in this session) or `subagent-driven-development` (one `bob-builder` per task) |
| Several tasks that share no state | `dispatching-parallel-agents` |
| Work needs its own checkout | `using-git-worktrees` (outside the repo, off origin/main) |
| Where should a module boundary or seam go | `codebase-design` (pack engineering-testing-performance-code-design) |
| The architecture of a whole codebase feels wrong | `improve` |
| A finished deliverable whose claims need tracing | `claim-auditor` |
| A diagram: architecture, flow, ER, UML | `drawio-diagrams` |

### Building and fixing

| Situation | Go to |
|---|---|
| New behaviour or a bug fix, test first | `tdd` (flutter test, or GUT for Godot) |
| Something is broken, slow or throwing | `diagnosing-bugs` |
| Page speed or Core Web Vitals | `performance-optimization` (pack engineering-testing-performance-code-design) |
| A new interface with its own distinct look | `frontend-design` (pack design-ui-logos-slides-posters) |
| Godot game code or a project audit | `godot-audit` (pack godot-camera-shaders-particles-export) |
| Privacy policy, terms or store legal | `legal-signoff-orchestrator` (entry to the `legal-*` suite) |

### Checking and finishing

| Situation | Go to |
|---|---|
| Review a change | `/code-review` (the `ultra` level runs a multi-agent review in the cloud) |
| Review by the studio's own reviewer seat | `requesting-code-review` (sends it to `linus-reviewer`) |
| Review comments have come back | `receiving-code-review` |
| Security angle on a change | `/security-review` |
| Change is too complicated | `/simplify` |
| Prove that it works | `verification-before-completion` or `/verify`; to start the app, `/run` |
| Branch is green and ready | `finishing-a-development-branch` (opens the PR; the owner merges) |
| Merged branches and worktrees to clear | `git-cleanup` |
| Session is ending | `handoff`; to archive the session, `save-session` |

### Skills, tools and housekeeping

| Situation | Go to |
|---|---|
| Writing or changing a skill | `writing-great-skills` |
| Block force-push at the tool layer in a repo the hub guard does not cover | `git-guardrails` |
| Learning a subject across several sessions | `/teach` |

## Using the map

- Look for a matching skill before any non-trivial work. They hold process that stops old mistakes coming back. Every session begins with the same short rule set in [`session-start.md`](session-start.md); a start-up hook of your own (the studio's is not in this kit) injects it on startup, clear and compaction.
- Cheaper coordination of a full plan, on the owner's request only: see [`references/claude-code-tools.md`](references/claude-code-tools.md).
- Skills chain. Typical runs: `drill-to-plan`, `writing-plans`, `tdd`, `/code-review`. For a bug: `diagnosing-bugs`, then `tdd` for the regression test, then `/code-review`. For an outside skill: `vet-and-adopt`, then `writing-great-skills` to adapt whatever survives.
- When no row fits, list `.claude/skills/` and read the descriptions.
