# Migration checklist

Run only when the user asked for a migration.

## Before you touch anything

1. Pick the layout. `src/` or flat. For flat, set `[tool.uv.build-backend] module-root = ""`.
2. Pick the lock policy. Applications commit `uv.lock`. Libraries gitignore it.
3. Back up: make a branch or a tag of the current state.

## Find leftovers

```bash
rg -l "pylint|noqa|type: ignore"     # legacy pragmas
uv run ruff check --select INP001    # folders missing __init__.py
```

## Delete

- old virtualenv folders (venv, .venv)
- Pipfile and Pipfile.lock
- every requirements file (requirements.txt, requirements-dev.txt)
- packaging leftovers: MANIFEST.in, setup.cfg, setup.py
- linter and checker configs: pyrightconfig.json, mypy.ini, .flake8
- tox.ini, but only if nothing still needs it

## .gitignore

```
__pycache__/
*.pyc
.venv/
.ruff_cache/
.ty/
# libraries only:
uv.lock
```

## pyproject.toml

Strip the black, isort, mypy, pyright, pylint and flake8 tables.

## Easy wins with ruff

Run each rule set on its own, with fixes, and review the diff each time:

```bash
uv run ruff check --select UP --fix       # pyupgrade
uv run ruff check --select RET504 --fix   # needless assignment before return
uv run ruff check --select SIM --fix      # simplifications
uv run ruff check --select ERA --fix      # commented-out code
```

## CI cleanup

- Remove scheduled triggers that do nothing useful.
- Switch to `uv sync` and `uv run`.
- Pin GitHub Actions to commit SHAs.
- Set up the security tools (`security-setup.md`).

## Legacy code with many type errors

Adopt ty gradually. Keep `error-on-warning = true` and `python-version = "3.11"`, and start with these rules ignored:

```toml
[tool.ty.rules]
possibly-missing-attribute = "ignore"
unresolved-import = "ignore"
invalid-argument-type = "ignore"
not-subscriptable = "ignore"
unresolved-attribute = "ignore"
```

Remove each ignore as its errors are fixed. Track progress by counting error lines:

```bash
uv run ty check src/ | grep -c error
```

## Supply chain

- pip-audit in the dependency groups
- Dependabot with a 7-day cooldown
- exact (`==`) pins in production

## Final verification

Run all of it and report the results before saying it works:

```bash
uv sync --all-groups
uv run ruff check
uv run ruff format --check
uv run ty check src/
uv run pytest
uv run pip-audit
uv build        # only if the project is distributable
```
