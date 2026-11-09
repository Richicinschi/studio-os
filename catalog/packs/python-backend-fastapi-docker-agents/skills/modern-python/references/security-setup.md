# Security setup

| Tool | Finds | Runs in |
|---|---|---|
| shellcheck | shell script faults | hooks |
| detect-secrets | committed secrets | hooks |
| actionlint | workflow syntax errors | hooks and CI |
| zizmor | workflow security problems | hooks and CI |
| pip-audit | dependencies with known CVEs | CI and on demand |
| Dependabot | stale dependencies | GitHub, scheduled |

## Order

1. Install prek (`prek.md`).
2. Install the tools:
   ```bash
   brew install actionlint shellcheck
   uv tool install detect-secrets
   uv tool install zizmor
   ```
   Alternatives: `go install`, `cargo`, `pipx`.
3. `prek install`
4. Create the baseline: `detect-secrets scan > .secrets.baseline`
5. Run `actionlint` and `zizmor .github/workflows` once by hand.

## detect-secrets

First time: generate the baseline, open it and confirm no real secret is in it, then commit it.

When the hook fails:
- list findings: `detect-secrets audit --report .secrets.baseline`
- false positive: `detect-secrets scan --update .secrets.baseline`
- real secret: remove it from the code and rotate the credential

## actionlint and zizmor

Fix `excessive-permissions` by adding explicit `permissions`:

| Job | Permissions |
|---|---|
| lint, test, audit | `contents: read` |
| push, release | `contents: write` |
| PR comments | `contents: read` and `pull-requests: write` |

Typical findings: template injection from event data, unpinned actions, dangerous `pull_request_target` with checkout, invalid triggers, undefined inputs, shell errors in `run` blocks.

shellcheck usual hits: SC2086 (unquoted variable), SC2046 (unquoted command substitution), SC2155 (declare and assign together).

## pip-audit

Needs the `audit` group.

```bash
uv run pip-audit        # audits the environment
uv run pip-audit .      # audits the project without installing
uv run pip-audit --fix  # upgrades vulnerable packages
```

It checks the PyPA advisory database. On a finding: decide whether the CVE touches how you use the package. If so, `uv add pkg@latest`. If not, assess the risk, look for alternatives, or add it to an ignore list with a reason.
