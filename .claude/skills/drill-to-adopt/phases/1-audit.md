## Phase 1: Audit (opt-in, read-only)

Your first question, multiple choice: "May I look around your setup folder before I ask anything?
Read-only: a script from the kit reads your setup and prints names only (file types, dependencies,
your Claude files, git remote hosts), never a value, and never opens secrets or data files." Options:
yes (recommended), no, or only one subfolder they name.

On yes, read `catalog/features.json` (the menu: every item, its module, importance, why, loads and
token estimate, and its card; and `domains`, the packs this kit ships, each with its skills, agents
and token costs) and `catalog/DETECT.md` (the Detect section of every card, in one file). The passes
below need both; open no card in this phase. Then check Node.js: `node --version`. With version 22 or
later, run from the kit folder, on
the folder they agreed to, then `claude plugin list` as before (without it, see "Without Node.js 22"
below):

```
node tools/audit.mjs "<folder>"
```

What the script reads, printing names only (`tools/audit.mjs`, its header comment). Names only means
no value from a settings or config file; skill and agent descriptions and instruction-file headings
are free text, and it prints them as they are:

- manifests: `package.json`, `pyproject.toml`, `requirements*.txt`, `environment.yml`, `Pipfile`,
  `go.mod`, `pom.xml`, `*.csproj`, `dbt_project.yml`, compose files (`docker-compose*.yml`,
  `compose.yaml`, `compose.override.yaml`) and GitHub Actions workflows: dependency, service and job
  names, never versions, environment values or commands;
- file-type counts: the top 15 extensions, notebooks and SQL included;
- the existing Claude setup: `.claude/settings*.json` (hook events and script file names, permission
  counts, enabled plugins), `.mcp.json` (server names, transport, host only), `.claude/skills/` and
  `.claude/agents/` (name and description from the front matter, never the body);
- instruction files, `CLAUDE.md`, `AGENTS.md` and the ones other agent tools keep (Cursor's rules,
  GitHub Copilot's instructions, `GEMINI.md` and others: `docs/other-tools.md`): line count and
  headings, never the body;
- git state per repository: the remote's host only (never the full URL), the branch, clean or how
  many changes;
- existing hooks: file names in `.husky/` and in `.git/hooks/` (not `.sample` files), and the hook
  ids in `.pre-commit-config.yaml`.

The script's rules, which hold whatever you intend:

- it never opens `.env*`, `*.pem`, `*.key`, `*credential*`, `*secret*`, `id_*`, or the data files
  themselves (`*.csv`, `*.parquet`, `*.xlsx`, `*.db`, `*.sqlite`, data folders); it lists them under
  "Present but not opened": their kind, how many, and up to 10 paths. A skill folder or an agent file
  named so (`secret-scanner`) is still read, for its front matter only;
- it goes no more than four levels deep, and never into `.git/` (beyond the hook file names above),
  `node_modules/`, `.venv/`, `venv/` or build folders;
- it reads no more than the first 200 lines of any manifest.

You open none of these files in this phase, in the setup folder: not to check the script, not for a
pass below. A file it shows as "present, not parsed" stays that way in the inventory. If the script
itself fails (Node.js 22 is there and it exits with an error), say so in one line and offer the choice
again: another folder or subfolder, or no. Never read the files yourself instead.

**Without Node.js 22** (`node` not found, or a version below 22): say in one line that the audit's
script needs Node.js 22, because it reads the settings and config files so that you never open them.
Hand over the install as a step only they can do, from `docs/install-reference.md`, "Tools some items
need": on Windows `winget install --id OpenJS.NodeJS.22 -e`, on macOS and Linux the nvm lines there;
then `! node --version` to check it. A Node.js installed while Claude Code runs may not be found
until Claude Code starts again: if it is still not found, start Claude Code again in a new terminal,
and the run resumes from `adoption/`. Until it is installed, make a names-only listing under the
script's rules above: file and folder names and counts by extension, from a directory listing that
opens no file, no more than four levels deep, never into the skipped folders or data folders. Never
fall back to opening the files the script reads, and run no command that prints a value from them.
Write the inventory sections that names can fill: File types; Present but not opened; which manifests,
Claude files, instruction files, skills, agents and hooks are present, by name; the folders that hold a
`.git`. Write "not checked (Node not installed)" in every cell that names alone cannot settle, and as
the mark of every menu item whose Detect needs more than names. Once Node.js 22 is installed, run the
script and write the inventory again from it.

Then these passes, which need you, under the same rules:

- **Infer their profiles** from the script's Stack and File types tables, and from file names (such
  as `pubspec.yaml`, `Cargo.toml` or a `Dockerfile`), never from a file's contents or a notebook's
  (its output cells can hold data). More than one can apply:
  - `ml`: torch, tensorflow, jax, scikit-learn, xgboost, lightgbm, transformers, mlflow, wandb or dvc
    in a manifest;
  - `data`: `dbt_project.yml`, more than a handful of `.sql` files, BI project files by extension,
    sqlfluff or great_expectations;
  - `software`: an app or service manifest (a web framework in `package.json`, `pubspec.yaml`, a
    service `Dockerfile`, `go.mod`, `Cargo.toml`);
  - `general` when nothing matches.

  Write them as `profiles:` in `adoption/inventory.md`, with the file that suggested each.
- **List what they already have.** At project level (`.claude/`), the script's "Already installed"
  rows. At user level (`~/.claude`, or `$CLAUDE_CONFIG_DIR` when it is set), which the script does
  not read, and slash commands at both levels:
  - skills and agents: name and description from the front matter only, never the body;
  - plugins: name and version (`claude plugin list`);
  - slash commands and MCP servers: names and scope only, never credentials or environment values;
  - hooks: the event and the script's file name, never its contents.

  Classify each against the kit, comparing its description with each item's `why` in
  `catalog/features.json`: `same job as <id>`, `overlaps <id> in part`, or
  `nothing like it in the kit, keep it`. Mark each scanned yes, no or unknown (a row in an earlier
  `adoption/decisions.md` counts as yes).
- **Estimate what loads into every session today** (whether `/context` output reaches you is an open
  question: `docs/facts.md`, "Claude Code: measuring context and asking multiple choice"): the size
  of each instruction file, at both levels, from a file listing (`ls -l`, or `dir` on Windows), which
  opens no file, plus the `description` of every skill and agent at both levels, divided by 4. Files
  they import with `@` are not counted, since finding them means reading the file: say so. Tell them
  `/context` shows the live breakdown; a total they read you is recorded as measured. Never open a
  data or secret file for this.
- **Run each item's Detect** from `catalog/DETECT.md`, so each menu item can be marked **have**,
  **partly** or **not yet**. Where a plugin enabled in their project brings a skill or agent of the
  same name, the mark is **a plugin provides one** in place of **not yet**, or
  **partly (a plugin provides one)** in place of **partly**, so what is missing stays in view; either
  way the kit's copy is not offered as a second. Where the card's plugin check could not run, say so
  and give no plugin mark. Detect commands print settings as set or not set, versions and counts;
  never print a key, a credential or a file's contents. In this phase, a Detect step that reads a file
  the script reads in the setup folder, or runs a command that prints values from those files (such as
  `git remote -v`, `git config --get remote.origin.url`, or `claude mcp list` in the setup folder or
  a repository), takes its answer from the script's output, and the file stays closed. A command that
  prints only set or not set, a count or a version may run, such as
  `git -C <repo> config --get core.hooksPath >/dev/null && echo set`. MCP servers: project servers
  come from the script's rows; where a card runs `claude mcp list`, run it only in an empty temporary
  folder (a new one in the system temp folder: `mktemp -d`, or a new folder under `$env:TEMP` on
  Windows; never inside the setup or kit folder), so it lists user-scope servers only (and those from a plugin or a claude.ai connector), under
  the rules for the user level: names and states, never a command, an argument or a URL. Where the
  output cannot settle the mark (a hook's matcher, a deny rule's text, an `@` import, a local-scope
  MCP server), say what is missing under "Kit items you already have" and give the item no mark.

Write `adoption/inventory.md` in their setup from `templates/adoption/inventory.md`: the script's
sections under the same headings, with each repository's folder written relative to the setup folder;
the user-level rows and plugins added to "Already installed", and its last three columns filled; then
every other section, the starting point (empty, existing work, or an existing Claude setup) included.
**Show it to them before any Decide question.** On no, skip the audit and ask round 1 open; the menu
then shows no have/partly marks.
