---
name: claude-md-curator
description: >-
  Use whenever you update a project's AGENTS.md (the project's context file; CLAUDE.md until
  the project is migrated) — adding a handoff/current-state entry or refreshing
  project state — or when it approaches/exceeds its ~30k-char context budget (the
  PostToolUse/SessionStart budget hook will also nudge you). Keeps AGENTS.md lean (current
  state + rules + pointers) by ARCHIVING older dated handoff entries into the handoff archive
  (a project repo's docs/handoff-archive.md; the hub's wiki/handoff-archive.md), never deleting them. Trigger on "update AGENTS.md", "AGENTS.md
  is too big / over the limit", "trim AGENTS.md", "add a handoff entry", and the same phrases
  with CLAUDE.md for a project not yet migrated.
metadata:
  category: studio
  author: Richicinschi (Claude-authored)
  version: 1.0.0
  domain: repo maintenance / context hygiene
---

# claude-md-curator

Keeps `AGENTS.md` (the project's context file; `CLAUDE.md` until the project is migrated) under its context budget **without losing history** — old handoff entries are *moved* into the handoff archive, never deleted.

**Budget:** target **≤ 30,000 chars** per AGENTS.md (one budget for every runtime: under Codex's 32 KiB default truncation and Claude Code's ~40k warn limit).

**Multi-project model (2026-06-07; root `CLAUDE.md` became a generated stub 2026-07-30):** root `CLAUDE.md` is produced by the studio's stub generator (not in this kit) and holds no rules, no registry, and no handoff log — **never hand-curate it, and never hand-edit it at all.** Global rules live in your rules files; the **Project Registry** is your project registry — an index, not a handoff log (**no dated entries to evict there either**), curated against its own **6,000 B** budget with the same script. Each project keeps a **per-project `AGENTS.md`** (the project's context file; `CLAUDE.md` until the project is migrated — `apps/<app>/AGENTS.md`, `games/<game>/AGENTS.md`, and every other registry group) that DOES carry that project's dated handoff log. **Curate each project's `AGENTS.md` individually** against the same 30,000 budget: run `node .claude/skills/claude-md-curator/scripts/measure_claude_md.mjs <path-to-that-AGENTS.md>` and archive its oldest entries into that project's archive — every registry project is its **own git repo** (has a `.git`) and archives into its **own `docs/handoff-archive.md`**; only the hub's own context file archives into the root `wiki/handoff-archive.md`. The script routes by that `.git` test. (Project structure: see the `start-project` skill + the `workspace-doc-structure` memory.)
**Archive:** the project's `docs/handoff-archive.md`, or for the hub `wiki/handoff-archive.md` (a node in the knowledge graph); chronological, newest-first.

## What this skill curates vs. leaves alone

- **Curates:** only the `## Current state` rolling log — the dated handoff entries (`**YYYY-MM-DD … —**`) and the "Last updated:" summary line.
- **Never touches:** a per-project AGENTS.md's durable sections (current state summary, stack, project rules, where to look) — those are rules/reference, not the bloat. Root `CLAUDE.md` is a generated stub since 2026-07-30 and is out of scope entirely; the studio's own durable rules now live in your rules files, never hand-edited by this skill.
- **Obeys the wiki exclusion rule** (see `wiki/schema.md`): never add wiki markup to app-rendered/legal docs. The archive is a normal wiki doc — fine.

## Workflow

1. **Measure.** Run the script (no deps):
   ```
   node .claude/skills/claude-md-curator/scripts/measure_claude_md.mjs
   ```
   It prints total chars, the budget delta, the "Last updated:" line size, and the dated-entry inventory **oldest→newest** with sizes + a suggested eviction count.
2. **Refresh the top.** If you're adding a new handoff entry, prepend it to the `## Current state` log, and keep the **"Last updated:" line a SHORT one-paragraph summary** (newest milestone + "full history → [[handoff-archive]]") — do not let it grow into a concatenation.
3. **Evict oldest → archive (the core loop).** While over budget **or** more than **2 full dated entries** remain in AGENTS.md, take the **oldest** entry and:
   a. **Append/prepend it verbatim** to the archive as `## <date> — <title>` (newest-first order; preserve the entry's full text exactly).
   b. **Verify** the move: grep a unique phrase from the entry in the archive and confirm it's there.
   c. **Only then remove** that entry's line from AGENTS.md. If the archive write/verify failed, **abort** — never delete an entry that isn't safely archived.
4. **Wiki integration.**
   - First time, for the hub's archive: create `wiki/handoff-archive.md` with frontmatter `tags: [meta, log, timeline]`, a one-line intro, and link it from `wiki/Home.md` + `wiki/index.md`.
   - Append a `wiki/log.md` op-line: `## [YYYY-MM-DD] curate | archived N AGENTS.md handoff entries → handoff-archive`.
5. **Re-measure.** Re-run the script; confirm `AGENTS.md ≤ 30,000` and the report shows ≤2 dated entries. If still over, the same move applies to the long sub-project checklist (move detailed per-piece paragraphs to the archive, keep a short status line) — but try the dated entries first.

## Hard rules

- **Never delete — only move.** Every byte removed from AGENTS.md must first exist in the archive. Verify before removing.
- **Keep AGENTS.md meaningful.** What stays must still let a cold session orient: the current-state summary, the newest 1–2 entries, the rules, the stack, the pointers. Don't strip it to uselessness to hit a number — archive history, keep meaning.
- **Idempotent + safe.** Re-running when already under budget is a no-op. Don't duplicate an entry already in the archive (check by date+title first).

## The budget hook (automatic backstop)
`.claude/settings.json` registers this script on `PostToolUse` (Edit|Write|MultiEdit) and `SessionStart`. **PostToolUse measures whichever file the edit actually touched** (a per-project AGENTS.md — the project's context file; CLAUDE.md until the project is migrated — or your project registry) — root `CLAUDE.md` is a generated stub since 2026-07-30 and never meaningfully approaches budget. **SessionStart sweeps every file the workspace model knows** (root + every registry project's resolved context file + your project registry), each against its own budget — **30,000 B** for a project context file, **6,000 B** for the registry. When one goes over budget, the hook injects a reminder naming that file and its archive — so curation isn't forgotten. The hook only reminds; it never edits files or blocks the turn.

## Reuse across the portfolio
Generic: `measure_claude_md.mjs [path]` accepts an AGENTS.md path (the project's context file; CLAUDE.md until the project is migrated), and both the report and the mechanical `--archive` mode route the archive by repo: a project dir with its own `.git` → `<project>/docs/handoff-archive.md`; part of APPDEV itself → root `wiki/handoff-archive.md`.
