---
title: Auditing the studio's own rules
sources:
  - .studio/memory/project_studio_rules_audit.md
---

# Auditing the studio's own rules

## What happened

The studio asked for "every single piece of discrepancy, inconsistency or mistakes" in its rules, hooks, guidelines and routines. A read-only agent audited the hub: front door, identity, rules, project list, guards and hooks with their tests, health tools, routines, agents, memory and ledgers. It changed nothing.

It returned 93 findings, 88 of them verified: both sides quoted, and the guards run as real modules.

| Severity | Findings |
|---|---|
| Critical | 3 |
| High | 18 |
| Medium | 40 |
| Low | 32 |

The three critical findings, each re-checked against the code, were all holes in the guards that stand in front of acts that cannot be undone:

- **Missed spellings.** The guard against force-pushes and hook skips caught the common forms but missed variants: a combined short flag, a branch name with a leading plus, a mirror push, the short flag for skipping hooks, and a push of all tags.
- **Quoted commands.** The guards blanked out quoted text before matching, so a command wrapped in a quoted shell call passed three of them.
- **A yes that was not per act.** The grant check accepted any row of the same kind dated today or yesterday and never read its scope. One recorded yes could cover every act of that kind for up to 48 hours: a hole in the guard, not a time it was used.

The high findings included stale personal copies of skills that shadowed the project's own, routines whose steps broke the worktree and never-delete rules, a red test suite, and a network check that missed public addresses while a machine's local address and host name still sat in tracked files.

## What it cost, or would have

The rules had drifted from what enforces them and from the routines that follow them. The guards were believed to block more than they did. Every critical finding was a way past a guard the studio relied on.

## The rule it produced

Before claiming that a guard blocks something, check the finding list. The studio decided the same day: grants become per act, with the guard reading the scope; the stale skill copies are re-synced, and the health check gets a drift check; the project list is corrected; the network check widens to any real address, and the machine's details are scrubbed from current text without a history rewrite. The fixes were planned as six waves, one pull request each, and a seventh wave was added the same day. All seven had merged by the end of that day, with at least one finding still waiting on a decision.

## How to apply it

- [templates/audit/rules-audit-brief.md](../templates/audit/rules-audit-brief.md) is the same audit for your setup: read-only, six kinds of finding, both sides quoted with file and line, sorted by severity.
- Run it every few months, or after a big change. Check each critical finding against the code yourself before you act on it.
- Fix in waves, one change each, ticking off the finding IDs as they land.
- In claude.ai: run the brief in a Project, against your instruction files.
