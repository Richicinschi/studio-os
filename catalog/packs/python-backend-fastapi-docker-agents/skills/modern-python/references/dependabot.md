# Dependabot

Copy `modern-python/templates/dependabot.yml` to `.github/dependabot.yml`.

What the template does:
- weekly updates for the `pip` and `github-actions` ecosystems
- `cooldown: default-days: 7`, so a freshly published release waits a week. Malicious releases are often pulled soon after publishing; the wait gives that a chance to happen first.
- groups, to cut PR noise (dev minor+patch, production patch, actions minor+patch)

How it fits with pip-audit: pip-audit catches known CVEs in what you have now, on every CI run. Dependabot stops you falling behind.

Common options: `interval` (daily, weekly, monthly), `cooldown`, `ignore`, `groups`, `reviewers`.
