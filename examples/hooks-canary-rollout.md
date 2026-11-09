---
title: Hooks on a canary first
sources:
  - .studio/memory/project_runtime_neutral_studio.md
  - .studio/guardrails/git-hooks/README.md
---

# Hooks on a canary first

## What happened

The studio wrote git hooks that every repository shares: one folder of hooks, and each repository's git configuration points at it. A shared floor like that is wrong everywhere at once if it is wrong at all, so it went out in steps.

1. **One archived repository first.** Seven paths were tried there, both ways:
   - allowed: a plain commit, and a push of a new branch;
   - refused: a conflict marker, a fake token, a private network address, an attribution trailer, and a tag push without a recorded yes.

   The repository's own hooks still ran alongside the shared ones.
2. **Two more repositories.** Across the three, the canary passed seven of seven.
3. **The hub.** It carries one extra rule for its main branch. A push to main that stayed inside the folders that rule allows went through; one outside them was refused. Four of four passed.
4. **Every repository in the studio's project list.** The install check reported none left without the hooks, and the studio's health check ran with no failures.

One case still waits: scheduled jobs that run without Node on their path, since the hooks need Node.

## What it cost, or would have

The rollout itself went without a failure, which is what the order was for. The hooks sit in front of every commit in every repository. A mistake in them, such as a pattern that refuses an ordinary commit or a setting that switches off a repository's own hooks, would have reached all of them at once. In this order it would have shown up in one archived repository first.

## The rule it produced

Change a shared floor on a canary first:

- one low-risk repository;
- every path tried both ways, what must go through and what must be refused;
- then a few more repositories;
- then the special cases, such as a branch with its own rule;
- then everything.

The hooks are a floor, not a wall: `git commit --no-verify` skips them, and so does `git -c core.hooksPath=/dev/null` ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees").

## How to apply it

- The kit's [templates/git-hooks](../templates/git-hooks/README.md) follow the same order. Run `canary.mjs` first, which tries the hooks in a throwaway repository; then turn them on in one real repository; then the rest, after a week without surprises. The README also gives the line that turns them off again.
- If a repository already has hooks, do not point it at the shared folder: with `core.hooksPath` set, git looks for hooks only there, so the repository's own stop running ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees"). Call the check from its existing hook instead, as the README says.
- The same shape fits any shared change: a template, a settings file, a skill every project loads. One place first, then the rest.
- In claude.ai: try a changed instruction in one Project for a few days before you copy it to the others.
