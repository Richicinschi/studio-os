---
name: setup-workspace
description: >-
  Use when someone needs a place for their Claude setup, or wants existing folders organized for
  Claude: "set up my workspace", "create the setup folder", "restructure my folders", "organize my
  projects for Claude", or when an adoption plan's row is setup-workspace. Create mode builds
  the setup folder from the kit's templates in an empty folder. Restructure mode moves existing work
  through a written plan of reversible steps, each on the person's yes. It never overwrites a file and
  never deletes on its own.
metadata:
  category: adoption
  author: Studio OS kit
  version: 1.0.0
---

# setup-workspace

Give the adopter a working layout for their Claude setup without breaking anything they already have.
Every change is shown before it happens, made only on their yes, and can be undone. Follow
`drill-to-adopt`'s "Voice and honesty" and "Rules for every question": one question per message, a
plain-words line before every command.

## 1. Read first

- `adoption/inventory.md`: what exists, and the starting point.
- `adoption/spec.md`: above all its data rules, and their layout answers from round 1 (reorganize or
  leave, and each folder they named: move, point to, or leave).
- `modules/11-workspace-layout/README.md`: the layout, and the checklist of six things a move can break.

No inventory? Run the discovery in `drill-to-adopt` first, or ask them for the paths.

## 2. Create mode: an empty folder

It runs right after the scanner row, before any other row writes into the folder, and makes the whole
tree in one step.

1. Propose the tree, and show it as a tree:

   ```text
   <setup>/
     AGENTS.md          the front door (templates/AGENTS.md)
     CLAUDE.md          one line: @AGENTS.md
     identity/          USER.md, STYLE.md, RELATIONSHIP.md, SOUL.md (optional)
     memory/            MEMORY.md, README.md, vault/MEMORY-VAULT.md
     handoffs/          TEMPLATE.md
     adoption/          spec.md, decisions.md, inventory.md
     .claude/skills/    the skills they adopt
     git-hooks/         optional (templates/git-hooks/)
   ```

   Say where their work repositories live: inside it, or beside it as repositories of their own.
   Recommend beside it for a repository with a company remote.
2. On their yes, create all of it by copying from `templates/`: every file and folder the tree lists,
   the front door from `templates/AGENTS.md` included, and nothing it does not list. Never invent
   content. A file that already exists is left as it is (section 4).
3. Then, after the tree exists, ask about `git init` as a question of its own, never as part of the
   tree's question or another option: "Make this folder a git repository? It keeps a history of every
   change to your setup." Run it only on that yes, with a `.gitignore` that excludes `.env*`, data
   folders, `.claude/settings.local.json` and `CLAUDE.local.md`. Add no remote unless their data rules
   allow one and they ask for it.

## 3. Restructure mode: existing work

It runs only when they said yes in round 1 to reorganizing or to moving a folder they named.

1. **Map.** List every repository from the inventory. Each must be clean (`git status --short` prints
   nothing) before anything moves. If one is not, stop and ask them to commit or stash it themselves.
2. **Plan.** Write `adoption/restructure-plan.md` from `templates/adoption/restructure-plan.md`, one
   numbered step per change: what moves, from where, to where, why, how to undo it, and which of the
   six things it touches. Each folder they named (a notes folder, for example) gets its own step:
   moved only where they said move, a pointer from the front door where they said point to. The six
   (module 11's checklist):
   1. the `.gitignore` line that keeps the moved folder out of the repository above it;
   2. its row in a project registry;
   3. a tool's own list of projects and their folders;
   4. absolute paths inside the code;
   5. editable installs in virtual environments, which keep the old source path;
   6. old paths in live config and in prose, such as a `cd` line in an instruction file.

   Cached bytecode can also keep the old path. Some of these break silently, so compare the pass,
   skip and fail counts of the tests with those from before the move.

   Show the plan, and go on only on their yes to it.
3. **Apply,** one step at a time, each on their yes:
   - inside one repository, with `git mv`;
   - across repositories or folders, copy, check the copy, then remove the original only on a second
     yes, as that step's last action;
   - after each step, run the checks the plan lists (the tests, a link check, the tool that reads the
     path), and stop at the first failure, offering the undo;
   - tick the step's Done column.

## 4. Merge, never overwrite

An existing `CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`, `.mcp.json` or hook setup is merged:
show the diff and write only on their yes. A file of the same name is never replaced. An existing hook
setup (`.husky/`, `.pre-commit-config.yaml`, `.git/hooks/`) is never switched off; call the new checks
from it instead (`templates/git-hooks/README.md`).

## 5. Company repositories

By default no kit file goes into a company repository: the setup lives in their own folder. An
`AGENTS.md`, `.claude/` or `.mcp.json` inside one needs their yes, after the data-rules question in the
spec. Even then, prefer local files that stay out of git (`docs/facts.md`, "Claude Code: the ! prefix,
/init and local files"):

- `.claude/settings.local.json`: git ignores it when Claude Code creates it; add it to `.gitignore` if
  you create it by hand.
- `CLAUDE.local.md`: add it to `.gitignore` yourself. Where the repository has an `AGENTS.md`, a
  `CLAUDE.local.md` stops Claude Code reading it by default, so start the local file with the line
  `@AGENTS.md`.

## 6. Robustness

- Every step checks before it acts, so running it twice does no harm.
- It resumes from `adoption/restructure-plan.md`: a ticked step is done.
- Commands use `"$HOME/…"`, which PowerShell, bash and zsh all expand.
- On Windows, before a move, check that no new full path exceeds 260 characters, and that no two names
  in the target differ only by case (Windows and macOS treat them as the same file).
- It never deletes on its own: a removal is always the last step, on its own yes.

## 7. Record

Each step gets a row in `adoption/decisions.md` as soon as it is applied: the date, the kit version,
the item (`setup-workspace: <step>`), the decision, where it went, why, "n/a" for the scan, Check
"pending" until its check has run, and the undo.
