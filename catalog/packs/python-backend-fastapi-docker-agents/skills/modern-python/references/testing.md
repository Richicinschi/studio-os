# Testing

## Install

```bash
uv add --group test pytest pytest-cov hypothesis
uv add --group test pytest-asyncio     # async tests only
```

## pytest options

```toml
[tool.pytest.ini_options]
addopts = [
  "-ra",
  "--strict-markers",
  "--strict-config",
  "--cov=src/my_package",
  "--cov-report=term-missing",
  "--cov-fail-under=80",
]
markers = ["slow: slow tests", "integration: needs external services"]
filterwarnings = [
  "error",
  "ignore::DeprecationWarning:some_third_party_module",  # keep this narrow
]
```

## Coverage

```toml
[tool.coverage.run]
branch = true
omit = ["*/__main__.py", "*/conftest.py"]

[tool.coverage.report]
fail_under = 80
show_missing = true
exclude_lines = [
  "pragma: no cover",
  "if TYPE_CHECKING:",
  "if __name__ == .__main__.:",
  "raise NotImplementedError",
  "@abstractmethod",
]
```

## Layout

```
src/my_package/
tests/
  __init__.py
  conftest.py          # shared fixtures
  test_<module>.py     # one per module
  integration/
```

## Running

```bash
uv run pytest                           # all
uv run pytest -v                        # verbose
uv run pytest tests/test_x.py           # one file
uv run pytest tests/test_x.py::test_y   # one test
uv run pytest -k "name_pattern"
uv run pytest -m "not slow"
uv run pytest -x                        # stop at first failure
uv run pytest --lf                      # rerun last failures
uv run pytest --cov --cov-report=html
uv run coverage report
uv run coverage html
```

## Patterns to use

```python
import sys

import pytest
from hypothesis import given, strategies as st

@pytest.fixture
def conn():
    c = open_connection()
    yield c            # code after yield is teardown
    c.close()

@pytest.mark.parametrize("a, b, total", [(1, 2, 3), (0, 0, 0)])
def test_add(a, b, total):
    assert add(a, b) == total

def test_bad_input():
    with pytest.raises(ValueError, match="negative"):
        parse(-1)

@pytest.mark.asyncio
async def test_fetch():
    assert await fetch() is not None

@given(st.integers(), st.integers())
def test_add_commutes(a, b):
    assert add(a, b) == add(b, a)

@pytest.mark.skip(reason="not built yet")
def test_later(): ...

@pytest.mark.skipif(sys.platform == "win32", reason="posix only")
def test_posix(): ...
```

## CI steps

1. checkout (pinned to a SHA)
2. `uv sync --group test`
3. `uv run pytest --cov-report=xml`
4. audit: `uv sync --group audit`, then `uv run pip-audit`
5. upload coverage with the codecov action (pinned to a SHA)

## Makefile

```make
test:
	uv run pytest
test-cov:
	uv run pytest --cov-report=html
test-fast:
	uv run pytest -x -q --no-cov
```
