---
name: dependency-supply-chain-risk-checks
description: "Use when the user wants the packages a project depends on checked for supply-chain risk: single maintainers, abandoned or takeover-prone libraries, past vulnerabilities."
---

# Dependency supply-chain risk checks

Find the skill that fits the task in the table, read its file in full before you start, and follow it.

Script paths in this domain start at this domain's folder, the base directory Claude Code names when it loads this skill.

| Skill | What it does | When to use | File |
|---|---|---|---|
| Supply chain risk auditor | Use to audit a project's dependencies for heightened risk of exploitation or takeover, or to vet a new package before adding it. | Use when auditing a project's dependencies, or checking whether a package is risky before adding it — npm/pub/pip across our apps + Python tools. | skills/supply-chain-risk-auditor.md |
