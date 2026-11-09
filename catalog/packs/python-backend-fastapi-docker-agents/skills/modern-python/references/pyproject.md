# pyproject.toml reference

## Complete example

```toml
[project]
name = "my-package"
version = "0.1.0"
description = "What it does"
readme = "README.md"
license = "MIT"
authors = [{ name = "Your Name", email = "you@example.com" }]
requires-python = ">=3.11"
classifiers = [
  "Programming Language :: Python :: 3",
  "Programming Language :: Python :: 3.11",
  "Typing :: Typed",
]
dependencies = []

[project.optional-dependencies]
# real optional runtime features only, never dev tools
yaml = ["pyyaml"]

[project.urls]
Homepage = "https://example.com/my-package"
Repository = "https://example.com/my-package/repo"

[project.scripts]
my-package = "my_package.cli:main"

[build-system]
requires = ["uv_build>=0.9,<1"]   # check PyPI for the current 0.x
build-backend = "uv_build"

[dependency-groups]
dev = [{ include-group = "lint" }, { include-group = "test" }, { include-group = "audit" }]
lint = ["ruff", "ty"]
test = ["pytest", "pytest-cov"]
audit = ["pip-audit"]

[tool.uv]
default-groups = ["dev", "test"]
python-preference = "managed"

[tool.ruff]
line-length = 100
target-version = "py311"
src = ["src"]

[tool.ruff.lint]
select = ["ALL"]
ignore = ["D", "COM812", "ISC001"]

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101", "PLR2004", "ANN"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
docstring-code-format = true

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
addopts = "--cov=src/my_package --cov-report=term-missing --cov-fail-under=80"

[tool.coverage.run]
branch = true
source = ["src/my_package"]

[tool.coverage.report]
exclude_lines = ["pragma: no cover", "if TYPE_CHECKING:", "if __name__ == .__main__.:"]

[tool.ty.terminal]
error-on-warning = true

[tool.ty.environment]
python-version = "3.11"

[tool.ty.rules]
possibly-unresolved-reference = "error"
unused-ignore-comment = "warn"
```

## Notes

- Required project fields: `name` and `version`. `requires-python` is strongly recommended.
- Names are lowercase with hyphens. Metadata follows PEP 621.
- Version stays static in the `version` field.
- `uv_build` is preferred over hatchling.
- `python-version` for ty goes under `[tool.ty.environment]`.

## Version specifiers

| Spec | Means |
|---|---|
| `>=1.0` | 1.0 or newer |
| `>=1.0,<2.0` | stay on major 1 |
| `~=1.4` | same as `>=1.4,<2.0` (compatible release) |
| `==1.4.*` | any patch of 1.4 |

For fast-moving tools prefer `>=X.Y,<X+1`.

## Lock policy

- Applications commit `uv.lock`: reproducible deploys.
- Libraries gitignore it: consumers resolve their own versions.

## Project shapes

- Library: minimal runtime dependencies; optional runtime extras where useful.
- Application: runtime deps listed (for example fastapi, uvicorn, sqlalchemy) plus a `[project.scripts]` entry.
- CLI tool: typer and rich, plus a `[project.scripts]` entry.

All three keep dev tooling in dependency groups.
