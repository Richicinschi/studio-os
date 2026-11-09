# uv commands

## Install uv

- macOS/Linux: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- Windows (PowerShell): `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`
- or Homebrew, or pipx

## Projects

```bash
uv init myproject
uv init --package myproject      # src layout
uv init --lib mylib
uv init --bare                   # pyproject.toml only
uv add httpx
uv add --group dev pytest
uv add --optional feature pkg    # optional runtime extra
uv remove httpx
uv lock
uv sync
uv sync --all-groups
uv sync --frozen                 # exact lock install; use in CI
uv run pytest
uv run --python 3.11 pytest
uv run --with rich script.py     # one-off package
```

## Build and publish

```bash
uv build
uv build --wheel
uv build --sdist
uv publish --token $PYPI_TOKEN
```

## Tools and Pythons

```bash
uv tool run ruff        # same as: uvx ruff
uv tool install prek
uv tool list
uv tool upgrade prek
uv python install 3.12
uv python list
uv python pin 3.12
```

## Environment variables

| Variable | Sets |
|---|---|
| UV_CACHE_DIR | cache location |
| UV_NO_CACHE | disable the cache |
| UV_PYTHON | which Python to use |
| UV_PROJECT | project directory |
| UV_PROJECT_ENVIRONMENT | where the project venv lives |
| UV_SYSTEM_PYTHON | use the system Python |

## Host and container from one tree

If you work on the host and in a container from the same folder, the two environments clash (different OS, Python or native deps). On the host set `UV_PROJECT_ENVIRONMENT=.venv-dev` and gitignore both `.venv` and `.venv-dev`.

## Speed

- uv caches heavily, so the first install is the slow one.
- Use `uv sync --frozen` in CI.
- `uv cache clean` shrinks the cache.
