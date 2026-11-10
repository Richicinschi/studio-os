---
name: dependency-supply-chain-risk-checks
description: Use when the user wants the packages a project depends on checked for supply-chain risk: single maintainers, abandoned or takeover-prone libraries, past vulnerabilities.
---

# Dependency supply-chain risk checks

Find the skill that fits the task in the table, read its file in full before you start, and follow it. If a skill needs a local tool and you are on claude.ai without one, follow that skill's "Without local tools" section.

| Skill | What it does | When to use | File |
|---|---|---|---|
| Supply chain risk auditor | Identifies dependencies at heightened risk of exploitation or takeover (single-maintainer, unmaintained, low-popularity, risky features, past CVEs, no… | Use when auditing a project's dependencies, or checking whether a package is risky before adding it — npm/pub/pip across our apps + Python tools. | skills/supply-chain-risk-auditor.md |
