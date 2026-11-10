---
title: A recorded yes before a merge
studio_sources:
  - .studio/rules/hard-rules.md
  - .studio/memory/feedback_no_squash_merges.md
  - .studio/memory/project_studio_rules_audit.md
---

# A recorded yes before a merge

## What happened

During a migration that touched every project repository, 21 pull requests were merged with a squash: each branch was folded into a single commit. Soon after, the studio set the rule for every repository: "We are never gonna squash merge our PRs. All the PRs will be merged using the full commit history." The 21 squash merges came before the rule, and were left as they are.

Merging is one of the acts that need an explicit yes in the studio, with force-pushing, tagging, rewriting history and skipping a hook. That yes is written down before the act: one row in a grants ledger with the date, the kind of act, its scope, the words of the yes verbatim, and a reference. The row is pushed so it exists before the act, and a guard refuses the act without one.

A later audit found the guard weaker than the rule: it accepted any row of the same kind dated today or yesterday, and never read the scope. So one recorded yes could have covered every act of that kind for up to 48 hours; the audit describes the hole, not a time it was used. The studio decided that grants are per act, and that the guard reads the scope.

## What it cost, or would have

A squash merge loses the branch's commits: how the work was built becomes one commit. A rebase merge rewrites every commit with new hashes, and on GitHub the rewritten commits arrive without signature verification ([docs/facts.md](../docs/facts.md), "GitHub: merge methods"): a history rewrite by another name. And under the guard the audit found, one merge grant could have let every other merge through for two days.

## The rule it produced

- Every pull request merges with a merge commit, keeping its full history. Never squash, never rebase. It is enforced twice: the repository settings on the git host allow only merge commits, and a local guard refuses a squash or a rebase merge.
- The one exception is a pull request where a merge commit is truly impossible: an explicit yes for that pull request, recorded first with the reason.
- A risky act happens only on an explicit ask for that act, recorded before it. The row's scope starts with its target, such as the repository and pull request number. A grant never carries over to the next act.
- The guards are a floor, not a wall. Skipping the git hooks gets past them, so a skip needs its own recorded yes.

## How to apply it

- Write your "ask me first" list in [templates/identity/RELATIONSHIP.md](../templates/identity/RELATIONSHIP.md): merges, force-pushes, tags, history rewrites, hook skips.
- If you want a record, keep a small ledger: date, act, target, your words, a reference. Claude adds the row before it acts, never after.
- Set your git host to allow only the merge method you chose. If your company squashes by policy, follow it, and record that as your decision.
- [templates/git-hooks](../templates/git-hooks/README.md) and the [git-guardrails](../catalog/skills/git-guardrails/SOURCE.md) skill are the local floor, taken through `vet-and-adopt`.
