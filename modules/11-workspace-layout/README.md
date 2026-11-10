---
title: Workspace layout and restructuring
pack: way-of-working
studio_sources:
  - .studio/memory/feedback_moving_a_project.md
  - .studio/memory/reference_workspace_doc_structure.md
  - .studio/memory/feedback_multi_agent_isolation.md
  - .claude/skills/start-project/SKILL.md
questions:
  - Are you starting from an empty folder, or do you already have work you want Claude to know about?
  - Do your projects live in one place, or spread over several folders and drives?
  - Would you like help reorganizing, or should everything stay where it is?
---

# Workspace layout and restructuring

## The problem

Claude works best with one clear front door and a predictable layout, so it knows where to start reading and where memory lives. Reorganizing existing work to get there, though, is how things break, often without any error. A moved folder leaves its old path behind in configs, scripts, caches and other people's shortcuts.

## The mechanism

- **One setup folder.** It holds the front door (`AGENTS.md`, imported by a one-line `CLAUDE.md`), memory, handoff notes, identity files and your adoption record. Work repositories live inside it or beside it, each a repository of its own; beside it suits one with a company remote. The studio's hub has this shape: it owns no project, and every project under it is its own repository, so sessions on different projects cannot tangle (studio-specific: its group folders and project registry).
- **Empty folder: create mode.** `setup-workspace` proposes the tree, shows it, and on your yes copies it from `templates/`. `git init` is a separate yes; a remote comes only if your data rules allow one and you ask.
- **Existing work: restructure mode.** Map first: every repository must be clean (`git status --short` prints nothing) before anything moves. Then a written plan of reversible steps (`templates/adoption/restructure-plan.md`): what moves, from where to where, why, how to undo it, which of the six things below it touches, and the check after it. You approve the plan, then each step. Inside one repository a move is `git mv`, committed as its own step, and `git log --follow <file>` still lists a moved file's history across the rename ([docs/facts.md](../../docs/facts.md), "Git: hooks and worktrees"); across repositories, the step copies, checks the copy, and removes the original only on a second yes, as its last action. Checks run after every step and stop at the first failure. Nothing is overwritten: an existing `CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`, `.mcp.json` or hook setup is merged, diff shown first.
- **The six things a move can break,** from the studio's memory of its own move:
  1. the `.gitignore` line that keeps the moved folder out of the repository above it;
  2. the folder's row in the project registry;
  3. a tool's own list of projects and their folders;
  4. absolute paths inside the project's own code;
  5. editable installs in virtual environments, which keep the old source path;
  6. old paths in live config and in prose, such as a `cd` line in an instruction file.

  A seventh turned up later: cached bytecode that still reports the old path. Some break silently, so passing tests prove little: compare the pass, skip and fail counts with those from before. Search live files for the old path (dated notes stay as history), and test the search on a file you know contains it before you trust a clean result.
- **Company repositories get no studio files** unless you say yes. Where you do, prefer local files that stay out of git: `CLAUDE.local.md`, added to `.gitignore` by you and starting with `@AGENTS.md` where the repository has one, and `.claude/settings.local.json` (`docs/facts.md`, "Claude Code: the ! prefix, /init and local files").
- **Parallel sessions** each keep to their own repository; a change to the shared setup folder goes through its own branch, never a branch switch under a live session (module 06).
- **A project registry** once there are more than three repositories: one row each, with where it lives and what to read first ([project registry](../../cards/project-registry.md)).

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

The studio once moved its projects into group folders. The plan assumed a move was one folder move plus three reference updates; it was wrong on three counts, so the list of what a move touches grew to six. The one that bit hardest was absolute paths inside a project's own code. Its data-dependent tests skipped when their data was missing, so after the move seventeen quietly went from running to skipping, and the suite still reported green. A second failure was just as quiet: virtual environments kept the old source path in their editable-install files. A day after the move was declared done, a tool's table of verification commands turned up with four of six entries updated; the other two would have sent a check into a folder that no longer existed. Later a seventh turned up: cached bytecode printed the old path in every error trace. The rule the studio wrote down: a green suite is not evidence that a move worked.

## Apply it in Claude Code

1. Run the discovery in `drill-to-adopt` first, so `adoption/inventory.md` records your starting point.
2. When the adoption plan's first task is `setup-workspace`, say "Set up my workspace" for an empty folder, or "Restructure my folders" for existing work.
3. **Create mode:** approve the proposed tree, then decide separately about `git init` and any remote.
4. **Restructure mode:** commit or stash, yourself, any repository it reports as not clean; then approve or change `adoption/restructure-plan.md`.
5. Approve one step at a time. After each, the step's checks run and its Done column is ticked; at the first failure it stops and offers the undo. A removal is always the last step, on its own yes.
6. Stopped halfway? Run it again: it resumes from the first unticked step.
7. On Windows, it also checks that no new path exceeds 260 characters and that no two names differ only by case.
8. Each finished step gets a row in `adoption/decisions.md`. A day later, search for the old paths once more.

## Apply it in claude.ai

Here the layout question becomes which Projects to create and what each one's knowledge holds.

1. Make one Project per stream of work, such as a product or a recurring report.
2. Give each Project its instructions from `templates/claude-ai/PROJECT-INSTRUCTIONS.md`.
3. Put into each Project's knowledge only what that stream needs: reference documents, its spec, its latest handoff notes. Nothing crosses between streams, and company material goes only where your data rules allow it.
4. To reorganize, create the new Project first, move the knowledge over, check it, and retire the old one last. The free plan allows at most five Projects (`docs/facts.md`, "claude.ai: Projects").

Used here: the kit's [`setup-workspace`](../../.claude/skills/setup-workspace/SKILL.md), [`templates/adoption/restructure-plan.md`](../../templates/adoption/restructure-plan.md) and [`templates/claude-ai/PROJECT-INSTRUCTIONS.md`](../../templates/claude-ai/PROJECT-INSTRUCTIONS.md). Listed only: `start-project` (catalog-only, studio only).
