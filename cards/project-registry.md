---
id: project-registry
module: 11-workspace-layout
checked: 2026-11-02
---

# A project registry

## Why

- **The problem:** Claude works best with one clear front door and a predictable layout, so it knows where to start reading ([module 11, The problem](../modules/11-workspace-layout/README.md#the-problem)). Past a few repositories, a session no longer knows what exists, where each one lives, or which file to read first, so it guesses, or reads its way through folders to find out.
- **The reason:** one file, `registry/PROJECTS.md` in your setup folder, with one row per repository: its name, its path, its status and the file to read first. It is an index, not a log: what happened in a project stays in that project's own front door. The session hooks ([session-start-status](session-start-status.md), [session-end-check](session-end-check.md)) read its Path column to know which repositories to check.
- **The cost of skipping it:** the kit has no story of a session lost for want of a registry. What skipping means: a session that crosses into another project spends its first turns finding it, and the session hooks fall back to `adoption/inventory.md`, which shows your repositories as they were on the day of the audit.
- **The principle:** [load only what is needed](../PRINCIPLES.md#load-only-what-is-needed). One pointer line loads in every session; the registry loads when a task needs it, and names the one file to open next.

## Detect

Read-only. Presence and counts; no network.

- The registry: `<your setup>/registry/PROJECTS.md`, present or not, and its rows, counted (the first two table lines are the header and its rule):
  ```bash
  grep -E '^\|' "<your setup>/registry/PROJECTS.md" | sed '1,2d' | wc -l
  ```
- How many repositories you have: the rows of `adoption/inventory.md`, and those inside your setup folder, the setup itself included when it is one: `find "<your setup>" -maxdepth 3 -name .git | wc -l`.
- Rows whose path is not a repository, counted (`0` is right):
  ```bash
  cd "<your setup>" && grep -E '^\|' registry/PROJECTS.md | sed '1,2d' | cut -d'|' -f3 | tr -d ' `' |
    while read -r p; do git -C "$p" rev-parse --git-dir >/dev/null 2>&1 || echo x; done | wc -l
  ```
- Whether your front door points at it: `grep -c PROJECTS.md CLAUDE.md AGENTS.md 2>/dev/null`.
- Another list doing the same job: a table of repositories in your front door or a README, noted by its heading only.
- The session hooks: whether `.claude/settings.json` names `session-start-status` or `session-end-check`.

The menu marks the item **have** when the registry has a row for every repository, every path in it is a repository, and your front door points at it; **partly** when it exists but misses a repository, holds a stale path, or nothing points at it; and **not yet** otherwise.

## Ask

1. **"Keep a project registry?"**
   - Yes: one row per repository in `registry/PROJECTS.md`, and one line in your front door that points at it. Recommended when Detect counts more than three repositories.
   - Not yet: your front door and `adoption/inventory.md` are enough for now. Recommended when Detect counts three or fewer; update mode asks again when the count grows.
   - FOLD: you keep such a list already, and Claude gives it the four columns, or moves it into the registry and leaves a pointer where it was. Recommended when Detect finds one.
   - No.
   - Not sure: the option recommended above for what Detect found: FOLD when you keep such a list already; otherwise yes with more than three repositories, and not yet with three or fewer.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing changes.

   The item is optional for every profile: the number of repositories decides it, not the kind of work.
2. **"Which repositories go in the table?"** (only for yes or FOLD)
   - Every repository you work in. Recommended when all of them are yours to commit to.
   - Your own work only; the rest (someone else's code you cloned, an archive, a repository you only read) named in a short paragraph under the table, which says they are left out on purpose. Recommended when some are not yours to commit to: the session hooks check every repository in the table, and would report a clone's old branches as idle in every session.
   - Not sure: the option recommended above: every repository when all are yours to commit to; your own work in the table and the rest in the paragraph when some are not.
   - Default when skipped: every repository.

## Needs

- Nothing beyond Claude Code and git.
- For the hooks to use it: the [session-start-status](session-start-status.md) and [session-end-check](session-end-check.md) items; without a registry they read `adoption/inventory.md` instead.

## Steps

1. **Claude:** runs `vet-and-adopt` on `templates/registry/PROJECTS.md`, a short Markdown file: the scan takes a moment, then the comparison with any list you keep. A practice defaults to ADAPT.
2. **Claude:** writes `<your setup>/registry/PROJECTS.md` from `adoption/inventory.md`, one row per repository you chose, and shows it before saving:
   - **Project:** a short name; where the real name is on your [never-share list](never-share-list.md), a neutral one;
   - **Path:** relative to your setup folder, with forward slashes, and without spaces (Watch out);
   - **Status:** active, paused or done;
   - **Read first:** that repository's front door, such as `<folder>/AGENTS.md`, or the README it has instead; "none yet" when it has neither, so the absence is known rather than found later.

   The comment at the top says, in your words, what the file is for and that it is an index, not a log.
3. **Claude:** for the repositories left out on purpose (question 2), writes one short paragraph under the table that names them and says why. It is prose, not a table, so the hooks do not read it.
4. **Claude:** writes one line into your front door, in your words, and shows it before saving. A starting point: "Which repositories exist, and where each one starts, is in `registry/PROJECTS.md`. Read it when a task names a project you have not opened, and change its row in the same session when a repository is added, moved or retired."
5. **Claude:** records the decision, the number of rows and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** every path in the table is a repository:
   ```bash
   cd "<your setup>" && grep -E '^\|' registry/PROJECTS.md | sed '1,2d' | cut -d'|' -f3 | tr -d ' `' |
     while read -r p; do git -C "$p" rev-parse --git-dir >/dev/null 2>&1 && echo "ok $p" || echo "MISSING $p"; done
   ```
   Expected: one `ok` line per row, and no `MISSING`.
2. **Claude:** `grep -c PROJECTS.md <your front door>`. Expected: `1` or more.
3. **Claude:** when the session hooks are installed, it creates an empty file `registry-check.txt` in one listed repository, runs the start hook by hand, `node "<your setup>/hooks/session-start-status.mjs" "<your setup>"`, and expects, among its lines, `<that repository's folder name>: uncommitted changes`. Then it deletes the file.
4. **you:** in a new session started in your setup folder, ask "Where does <a project in the table> start?" Expected: Claude reads the registry and names that row's Read first file.

A `MISSING` line, a missing pointer, or a hook run that does not name the repository means the item is not done: the plan row stays unticked, and that row's path is the next thing to look at.

## Undo

- **Claude:** deletes `<your setup>/registry/PROJECTS.md`, and the `registry/` folder once it is empty.
- **Claude:** removes the pointer line from your front door.
- **Claude:** marks the row in `adoption/decisions.md` as undone. The session hooks go back to reading `adoption/inventory.md`.

## Watch out

- **A path with a space is skipped.** The hooks take a table cell as a path only when it has no spaces, so a folder named `client work` is never checked; and a path that starts with `~` is not expanded, so it is never found either. Write paths relative to the setup folder. Rename a folder with a space with care (a move can break six things, [module 11](../modules/11-workspace-layout/README.md#the-mechanism)), or accept that the hooks skip it.
- **Every table in the file is read.** The hooks read each cell of each table in the registry as a possible path, so a second table that names a repository's folder puts it under the checks. Keep the left-out list, and anything else, as prose.
- **An index, not a log.** Dated entries and project news belong in each project's own front door. The studio keeps its own registry under about 6,000 bytes and moves anything else out ([module 11](../modules/11-workspace-layout/README.md#the-mechanism) lists that note as a source).
- **A move leaves a stale row.** Moving a repository breaks its path here as well as in configs, scripts and links; Check step 1 finds it.
- **Absence on purpose.** Name the repositories that have no front door, and the folders that are deliberately not projects, so a session reads the absence as a known fact, not a fault to fix.
- **Paths are relative to the setup folder,** not to `registry/`: the hooks resolve them from the folder they run for. A session started inside a project folder finds no registry there, and its hooks check that repository only.
- **Where the setup folder goes.** If your setup folder is pushed to a remote, the registry goes with it, with every project name in it; name company and client projects only as your data rules allow.
- **Token cost:** the pointer line costs about 57 tokens in every session, an estimate (bytes divided by 4). The registry loads only when Claude reads it: about 110 tokens for the template's header and comment, and about 18 per row, also estimates.
