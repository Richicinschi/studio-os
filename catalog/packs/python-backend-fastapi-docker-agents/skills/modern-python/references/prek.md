# prek

Rust-native drop-in for pre-commit. It reads the same `.pre-commit-config.yaml`.

- single binary, no Python runtime needed
- faster hook installs than pre-commit
- shared toolchains, parallel cloning and parallel hook runs
- uses uv for Python hooks
- workspace mode for monorepos

## Commands

| Command | Does |
|---|---|
| `prek install` | install the git hook |
| `prek uninstall` | remove it |
| `prek run` | run on staged files |
| `prek run --all-files` | run on everything |
| `prek run --last-commit` | run on the last commit's files |
| `prek run HOOK` | run one hook |
| `prek run -d DIR` | run on a directory |
| `prek auto-update` | bump hook revs |
| `prek list` | list hooks |
| `prek clean` | clear the cache |

## Config

Start from `modern-python/templates/pre-commit-config.yaml`, copied to the repo root as `.pre-commit-config.yaml`.

- The template has placeholder revisions in angle brackets. Replace each with a real current release from that project's releases or tags page before use.
- Pin revs, not branches.
- Hooks: ruff (with fix), ruff-format, builtin hooks (trailing-whitespace, end-of-file-fixer, check-yaml, check-toml, check-json, check-merge-conflict), shellcheck at severity error, detect-secrets with baseline `.secrets.baseline`, actionlint, zizmor (persona regular, min-severity medium, min-confidence medium).
- Default language: python 3.12.

## In CI

Either use the prek GitHub action, `j178/prek-action` (the prek docs' Continuous Integration page). It installs prek and runs `prek run --all-files`. The user adds it to their workflow after a checkout step; pin both to commit SHAs:

```yaml
steps:
  - uses: actions/checkout@<sha>
  - uses: j178/prek-action@<sha>
```

Or:

```bash
uv tool install prek
prek run --all-files
```

CI always runs all files. Makefile targets:

```make
hooks:
	prek run --all-files
hooks-install:
	prek install
```

## Moving from pre-commit

```bash
uv tool install prek
uv tool uninstall pre-commit      # or pip uninstall pre-commit
prek install
```

Optionally delete the old pre-commit cache. The config file stays as it is.

Update hooks with a cooldown, for supply-chain safety:

```bash
prek auto-update --cooldown-days 7
```

Prefer builtin hooks: faster and offline. Create the detect-secrets baseline before the first commit (`security-setup.md`).
