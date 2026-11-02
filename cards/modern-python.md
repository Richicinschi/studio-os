---
id: modern-python
module: 09-data-work
checked: 2026-11-02
---

# Modern Python

## Why

- **The problem:** analysis code is code, but it is often set up like a scratch file: a requirements list nobody pins, a virtual environment someone forgot to activate, three linters with three configs, and no tests. Module 09 counts it as code, checked like any other.
- **The reason:** the skill sets up Python one way: uv for dependencies and environments (`uv add`, `uv run`, and a `uv.lock` file kept in version control), ruff for linting and formatting, ty for type checks, pytest with a coverage floor, and inline metadata for one-file scripts. It also moves an existing project off pip, Poetry, black or mypy, step by step.
- **The cost of skipping it:** the kit has no story of its own here. Without it, each project ends up set up differently, and the checks that should hold every time depend on whoever ran them last.
- **The principle:** [checks for rules that must never break, prose for judgement](../PRINCIPLES.md#checks-for-rules-that-must-never-break-prose-for-judgement). Lint, format, type and coverage rules run as commands and hooks, not as style advice someone has to remember.

## Detect

Read-only: folder names, the front matter of skills and agents (their name and description), a version, and the names of project files, never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/modern-python "$U/skills/modern-python" 2>/dev/null`.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE '[^a-z]uv[^a-z]|ruff|poetry|python project' && echo "$f"; done`
- uv: `uv --version` (it may not be installed).
- How this project is set up today, file names only: `ls pyproject.toml uv.lock requirements*.txt poetry.lock setup.py setup.cfg .pre-commit-config.yaml 2>/dev/null`.
- Whether the repository already points git at a shared hooks folder (the kit's git hook templates do this): `git config --get core.hooksPath >/dev/null && echo set || echo "not set"`.

The menu marks the item **have** when a skill named `modern-python` exists, or another skill's description covers setting up Python with uv; **partly** when the project already uses uv (a `uv.lock` exists) without such a skill; **not yet** otherwise.

## Ask

1. **"Take modern-python?"**
   - ADOPT as it is: the upstream body, references and templates; only the front matter's studio lines go (step 3). Recommended when Detect says **not yet** and you start new Python projects.
   - ADAPT: the same, with the strict defaults (every ruff rule on, an 80% coverage floor, warnings as type errors) eased for an existing codebase, or the pre-commit part dropped if your repositories use other hooks. Recommended when Detect found `requirements*.txt`, `poetry.lock` or `setup.py`, or `core.hooksPath` set.
   - FOLD: its table of what to avoid and what to use instead, into the Python skill or instruction file you have. Recommended when Detect says **have** through another skill.
   - Skip. Recommended when you do not write Python, or must keep your current tooling.
   - Not sure: the option recommended above for what Detect found: FOLD for **have** through another skill, ADAPT when it found `requirements*.txt`, `poetry.lock` or `setup.py`, otherwise ADOPT; Claude shows you the settings it would change.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"**
   - This project: `.claude/skills/modern-python/`.
   - Every project: `~/.claude/skills/modern-python/`. Recommended when you write Python in more than one repository.
   - Not sure: the option recommended above: every project when you write Python in more than one repository, otherwise this project, the narrower choice.
   - Default when skipped: this project.

## Needs

- uv ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux"):
  - Windows: `! powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`;
  - macOS and Linux: `! curl -LsSf https://astral.sh/uv/install.sh | sh`;
  - then `uv --version` prints a version.
- ruff, ty and pytest arrive as each project's development dependencies through uv (`uv add --group dev ...`), as the skill sets them up; nothing more to install globally.
- Python 3.11 or later for the projects it sets up: the skill's own rule, which says not to use it where an older Python is required. How uv provides Python is not documented in docs/facts.md as of 2026-11-02.
- SkillSpector, for the scan in step 1: row 1 of your plan ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/modern-python/`: `skillspector scan catalog/skills/modern-python --no-llm` (on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows). Expect DO_NOT_INSTALL; Claude shows each finding with its reading of it, and continues only when you have read them and say so (Watch out has the studio's triage).
2. **you:** install uv with the line for your system, if Detect found none.
3. **Claude:** on your yes, writes the copy for your setup and shows you the change before it saves it:
   - the description's triggers in your words;
   - the front matter's author and the studio's note on what it serves dropped; the upstream source line kept;
   - for ADAPT, the defaults you chose to ease, written as starting values you can tighten later;
   - in `templates/pre-commit-config.yaml`, each `rev: <latest>` replaced by a release you have checked, or the template dropped if your repositories use other hooks;
   - `LICENSE` kept: per the `LICENSE` file itself, the kit's only source for it, it is CC BY-SA 4.0 (a Creative Commons licence that asks you to credit Trail of Bits and to share an adapted copy under the same licence).
4. **Claude:** records the decision, the scope, the scan result and its triage, the pinned versions, and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** makes an empty temporary folder.
2. **you:** in a new session there, say "set up a new Python project here with uv". Expected: a `pyproject.toml` with a `[dependency-groups]` table and a `uv.lock` file, with the development tools added through `uv add --group dev`, not by editing `pyproject.toml` by hand. Then Claude deletes the folder.

If the setup uses `pip install`, a `requirements.txt` or a hand-edited dependency list, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes `.claude/skills/modern-python/` or `~/.claude/skills/modern-python/`, whichever scope you chose. For FOLD, it removes the lines it added, which `adoption/decisions.md` names.
- **you:** a project it already moved to uv goes back by reverting that change in git; commit before a migration, so there is one change to revert.
- **you:** uv stays installed until you remove it; its uninstall is not documented in docs/facts.md as of 2026-11-02.
- **Claude:** adds the removal to `adoption/decisions.md`.

## Watch out

- **The scan says DO_NOT_INSTALL, and the studio kept it.** The build of SkillSpector that reports 2.2.3 rated the kit copy 100/100 from seven findings. The studio read each one: uv's own installer piped into a shell (the same command the kit's start uses); a vendor's installer for prek, a hook runner, fetched from its GitHub releases and piped into a shell; an optional clean-up of one tool's cache with `rm -rf`, scoped to that folder; and an example web request to a reserved example domain. All by design or false positives, and no code file sends anything anywhere.
- **The pre-commit template fetches code at whatever version you name.** It points at hook repositories on GitHub with `rev: <latest>` placeholders, and running the hooks downloads their code. Pin each `rev` to a release you have checked.
- **Installers from the internet run as you.** The prek installer is a script from its vendor; read it, or scan it, before you run it. The same goes for the project template the skill offers to bootstrap from (`uvx cookiecutter gh:trailofbits/cookiecutter-python`), which it asks you about first.
- **A migration deletes files.** Moving off pip removes `requirements.txt`, `requirements-dev.txt` and the old virtual environment; moving off setuptools removes `setup.py`, `setup.cfg` and `MANIFEST.in`. Commit first, and Claude shows the plan before it deletes anything.
- **One set of hooks per repository.** If a repository already uses the kit's [git hook templates](git-hooks.md) through `core.hooksPath`, decide which owns the hooks; that card says how to call its check from an existing pre-commit setup.
- **The Makefile needs `make`,** whose install docs/facts.md does not cover for any system; each of its targets is a `uv` line you can run directly.
- **Context cost:** the description loads every session, about 40 tokens; the body, about 2,450 tokens, loads when the skill runs, and each reference file only when Claude opens it. Estimates (bytes divided by 4).
