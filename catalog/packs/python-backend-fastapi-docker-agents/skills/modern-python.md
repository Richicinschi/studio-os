---
name: modern-python
description: "Sets up Python work on uv, ruff, ty, pytest and prek. Use when creating a Python project or package, writing a standalone script with dependencies, setting up pyproject.toml, linting/formatting/testing tooling, or (only if asked) migrating from pip, Poetry, mypy or black."
metadata:
  author: Richicinschi
---

# Modern Python

Astral toolchain: uv (packages, environments), ruff (lint, format), ty (types), pytest (tests, coverage), prek (git hooks), plus security checks.

## When to use it

Use it when the user:
- starts a Python project or package
- sets up pyproject.toml or lint/format/test tooling
- writes a script that needs third-party packages
- asks to move off legacy tooling (pip, Poetry, requirements files, setup.py, flake8, black, isort, mypy, pyright)

Do not use it when:
- the user wants to keep their legacy tooling. Respect that.
- the project must support Python older than 3.11
- the project is not Python, or Python is not the main language

Never start a migration unprompted. Migrate only on request.

## Hard rules

1. Change dependencies only with `uv add` and `uv remove`. Never hand-edit `dependencies` or `dependency-groups` in pyproject.toml; uv keeps the lock in step.
2. Never `uv pip install`. Use `uv add`, then `uv sync`.
3. Never activate a virtualenv. Run everything as `uv run ...`.
4. Dev, test and docs packages go in PEP 735 dependency groups. `optional-dependencies` is only for real optional runtime features that end users install.
5. Build backend: `uv_build`, not hatchling. Static `version` in the project table, not VCS-derived.
6. uv over Poetry and requirements.txt. Scripts use PEP 723 inline metadata; projects use pyproject.toml.
7. ty over mypy and pyright.
8. prek over pre-commit.
9. In ty config, `python-version` lives under `[tool.ty.environment]`, never directly under `[tool.ty]`.

## What replaces what

| Tool | Replaces |
|---|---|
| uv | pip, virtualenv, pip-tools, pipx, pyenv |
| ruff | flake8, black, isort, pyupgrade, pydocstyle |
| ty | mypy, pyright |
| pytest | test runner and coverage (with pytest-cov) |
| prek | pre-commit |

Security tools:

| Tool | Finds | Runs in |
|---|---|---|
| shellcheck | shell script faults | hooks |
| detect-secrets | committed secrets | hooks |
| actionlint | workflow syntax errors | hooks and CI |
| zizmor | workflow security problems | hooks and CI |
| pip-audit | dependencies with known vulnerabilities | CI and on demand |
| Dependabot | stale dependencies, on a schedule | GitHub |

## Pick the path

| Task | Path |
|---|---|
| Single-file script with dependencies | PEP 723, see `modern-python/references/pep723-scripts.md` |
| Multi-file project, not distributed | Minimal uv setup (below) |
| Reusable package or library | Full setup (below) |
| Existing project to convert | Migration, see `modern-python/references/migration-checklist.md` |

### Minimal setup

```bash
uv init myproject
cd myproject
uv add requests
uv add --group dev pytest ruff ty
uv run pytest
uv run ruff check
```

### Full setup

Scaffold with uv itself (flags per uv's project-init documentation):

1. `uv init --package myproject`, or `uv init --lib myproject` for a library (adds a `py.typed` marker). This gives pyproject.toml, README, `src/<name>/__init__.py` and `.python-version`.
2. Write pyproject.toml from `modern-python/references/pyproject.md`. Baseline:
   - version `0.1.0`, `requires-python = ">=3.11"`
   - groups: `dev` (includes lint, test, audit), `lint` (ruff, ty), `test` (pytest, pytest-cov), `audit` (pip-audit)
   - ruff: line-length 100, target py311, select ALL, ignore D, COM812, ISC001
   - pytest addopts: coverage of the package, floor 80
   - ty: terminal `error-on-warning = true`; `environment.python-version = "3.11"`; strict rules from day one on new projects (`possibly-unresolved-reference` = error, `unused-ignore-comment` = warn)
3. Install: `uv sync --all-groups`, or one group with `uv sync --group lint`.
4. Add a Makefile with phony targets:
   - `dev`: `uv sync --all-groups`
   - `lint`: `uv run ruff format --check && uv run ruff check && uv run ty check src/`
   - `format`: `uv run ruff format`
   - `test`: `uv run pytest`
   - `build`: `uv build`

## Migration (only when asked)

Before anything else: is this a standalone script (convert to PEP 723) or a project?

**From requirements files** (project):
```bash
uv init --bare
uv add flask requests        # each package, never by editing the toml
uv sync
```
To bulk-add, loop over requirements.txt lines, skipping comments, option lines and blanks, and `uv add` each one. Report failures. Complex specifiers may need hand handling. Review each package first.
Afterwards: delete requirements.txt, requirements-dev.txt and the old `venv`/`.venv` folder. Commit `uv.lock`.

**From setup.py / setup.cfg:** `uv init --bare`; `uv add` each `install_requires` entry; dev deps into the dev group; copy name, version, description and other metadata into the project table; delete setup.py, setup.cfg, MANIFEST.in.

**From flake8 / black / isort:** `uv remove` them; delete `.flake8` and the black and isort tables; `uv add --group dev ruff`; add ruff config (`modern-python/references/ruff-config.md`); run `uv run ruff check --fix`, then `uv run ruff format`.

**From mypy / pyright:** `uv remove` them; delete `mypy.ini`, `pyrightconfig.json` and the `tool.mypy` / `tool.pyright` tables; `uv add --group dev ty`; run `uv run ty check src/`.

Full checklist: `modern-python/references/migration-checklist.md`.

## uv commands

| Command | Does |
|---|---|
| `uv init` / `uv init --package` | new project / new packaged project |
| `uv add pkg` / `uv add --group dev pkg` | add runtime / dev dependency |
| `uv remove pkg` | remove |
| `uv sync` / `uv sync --all-groups` | install |
| `uv run cmd` | run inside the environment |
| `uv run --with pkg cmd` | one-off extra package |
| `uv build` / `uv publish` | build / upload |

`uv run --with` is for ad-hoc needs: trying a package, scripts outside a project, adding to project deps for one run (repeat `--with` for several). `uv add` is for a real project dependency that belongs in pyproject.toml and uv.lock.

Group examples: `dev` (ruff, ty), `test` (pytest, pytest-cov, hypothesis), `docs` (sphinx, myst-parser). Install several: `uv sync --group test --group docs`.

More: `modern-python/references/uv-commands.md`.

## Checks to confirm on any project

- `src/` layout
- `requires-python >= 3.11`
- ruff `select = ["ALL"]` with explicit ignores
- ty for types
- coverage minimum 80 percent or higher
- groups, not extras, for dev tools
- `uv.lock` in version control
- PEP 723 for standalone scripts

## References

All under `modern-python/references/`:
- `migration-checklist.md`: moving an existing project
- `pyproject.md`: full example config
- `uv-commands.md`: commands and env vars
- `ruff-config.md`: rule sets and options
- `testing.md`: pytest, coverage, CI
- `pep723-scripts.md`: single-file scripts
- `prek.md`: git hooks
- `security-setup.md`: secrets, workflows, audits
- `dependabot.md`: update schedule

Templates in `modern-python/templates/`: `pre-commit-config.yaml`, `dependabot.yml`.
