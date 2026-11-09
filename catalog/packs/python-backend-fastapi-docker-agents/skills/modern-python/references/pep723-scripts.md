# Single-file scripts (PEP 723)

## Use it for

- single-file scripts
- quick automation
- shared utilities
- self-contained scripts

Do not use it for multi-file projects, reusable libraries or anything with complex configuration. Those get a pyproject.toml.

## The block

Metadata is TOML written as comments, opened by `# /// script` and closed by a bare `# ///`:

```python
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "httpx",
#     "rich",
# ]
# ///
```

A private index goes in the same block:

```python
# [tool.uv]
# extra-index-url = ["https://example.com/simple"]
```

## Make it executable

```python
#!/usr/bin/env -S uv run --script
```

Variants: `#!/usr/bin/env -S uv run --python 3.12 --script` to pin a Python, or add `--quiet` to silence uv's own output.

Then `chmod +x script.py` and run `./script.py`.

## Workflow

```bash
uv init --script report.py
uv add --script report.py httpx
uv remove --script report.py httpx
uv run report.py
```

## Practice

- Always set `requires-python`, as a lower bound (`>=3.11`), not an exact pin.
- Leave dependency versions off; let `uv add --script` choose.
- One purpose per script.
- Give it a docstring and type hints.

## Limits to tell the user

- no dependency groups
- no editable installs
- no local path dependencies
- no lockfile, so versions can differ between runs

If any of that matters, move to a full pyproject set-up.
