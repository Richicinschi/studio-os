# ruff configuration

## Rules

```toml
[tool.ruff.lint]
select = ["ALL"]
ignore = ["D", "COM812", "ISC001"]
```

- Always ignore COM812 and ISC001: they conflict with the formatter.
- Commonly ignore D (docstrings), ANN401, TD002, TD003, FIX002.

Per-file ignores:

| Files | Ignore |
|---|---|
| tests | S101, PLR2004, ANN, D |
| scripts | T20, INP001 |
| `__init__.py` | F401 |
| migrations | ALL |

## What the main rule families check

| Family | Checks |
|---|---|
| E, W | pycodestyle errors and warnings |
| F | pyflakes: unused imports, undefined names |
| I | import sorting |
| N | naming conventions |
| D | docstrings |
| UP | syntax that newer Python replaces (pyupgrade) |
| ANN | missing type annotations |
| S | security (bandit) |
| B | likely bugs (bugbear) |
| A | names shadowing builtins |
| C4 | comprehension simplifications |
| SIM | code simplifications |
| RET | return statement style |
| PL | pylint rules |
| PT | pytest style |
| T20 | stray print calls |
| ERA | commented-out code |
| RUF | ruff's own rules |

`select = ["ALL"]` turns on every family; the ignore list then opts out.

Preview what UP would change without touching files:

```bash
uv run ruff check --select UP --diff
```

## Commands (always via uv run)

```bash
uv run ruff check
uv run ruff check --fix
uv run ruff check --fix --unsafe-fixes
uv run ruff format
uv run ruff format --check
uv run ruff format --diff
```

CI: `ruff check --output-format=github` and `ruff format --check`.

## Other options

Import sorting (`[tool.ruff.lint.isort]`):
- `known-first-party = ["my_package"]`
- `required-imports = ["from __future__ import annotations"]`
- section order: future, stdlib, third-party, first-party, local

Docstring checks, if you turn them on: `[tool.ruff.lint.pydocstyle] convention` of `google`, `numpy` or `pep257`, and ignore D100, D104, D203, D213.

Formatter (`[tool.ruff.format]`): `quote-style`, `indent-style`, `skip-magic-trailing-comma`, `line-ending`, `docstring-code-line-length = 80`.

## Ruff does not type check

Use ty: `uv add --group dev ty`, then `uv run ty check src/`.

## Moving from flake8, black or isort

Remove the tool, its plugins and its config. Isort settings go in `lint.isort`. The `UP` rules modernise code: `Optional[X]` to `X | None`, `List` to `list`, `super()` calls, format strings.

## Line length

Coming from 120 columns to 100 means manual fixes. To limit churn, keep `line-length = 120` first and tighten later.
