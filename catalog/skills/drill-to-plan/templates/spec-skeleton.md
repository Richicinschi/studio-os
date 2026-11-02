# <Topic> — design spec

> Produced by the `drill-to-plan` skill. Status: **draft — pending approval**.
> Delete any section that genuinely doesn't apply (don't pad). Each section is scaled to its
> real complexity. Unresolved items live in **Open Questions / Deferred**, never guessed.

## Context

Why this is being built — the problem/need, what prompted it, the intended outcome. 2–5 lines.

## Goal & success criteria

- **Outcome:** the one-sentence thing this delivers.
- **Success looks like:** concrete, checkable signals (not "works well").
- **Why now:** what makes this the right thing to build at this point.

## Users / who it's for

Who benefits and in what situation. Free vs Pro, anonymous vs signed-in, etc. where relevant.

## Scope & non-goals

- **In scope:** the bounded set this spec covers.
- **Non-goals:** explicitly out of scope (the most valuable section — it stops scope creep).

## Architecture

The shape of the solution: the main pieces and how they fit. Reference real files/modules in
the codebase that this touches or follows (`file_path`), the patterns it reuses, and where new
code lives.

## Components & interfaces

Per unit: what it does, how it's used, what it depends on. Keep each unit single-purpose with a
well-defined boundary — a consumer should understand it without reading its internals.

## Data model & flow

State/persistence shapes, where data lives (local vs Firestore vs server), how it moves, and
ownership/source-of-truth. Note any schema/rules changes (e.g. `firestore.rules`).

## Dependencies / integrations

External SDKs, services, platform APIs (a hosted backend, payments, an app store, etc.), and any new
packages — with the reason each is needed. Flag anything touching secrets or money.

## Error handling & edge cases

The failure modes that matter and how each is handled. Validate at user-input/network
boundaries only — no handling for impossible cases (Karpathy guideline). List the edge cases
the drill surfaced.

## Testing & verification

How we'll know it works end-to-end: the tests to write, the build/test commands to run (with
expected pass signal, e.g. "X/X green"), and any on-device check.

## Risks & tradeoffs

The real tradeoffs chosen during the drill and why; the risks and their mitigations.

## Rollout / migration

How it ships (flag-gated? re-consent? data migration?), and any back-compat or data-migration
steps. Note store/legal implications (health-claim wording, `kTermsVersion` bump, etc.) if any.

## Decisions resolved during the drill

A log of the key forks and what was decided — so the reasoning isn't lost. One line each:
`- <decision> — chose X over Y because …`

## Open questions / deferred

Anything unresolved or intentionally pushed out, with who/what is needed to close it. Never
fill these with guesses.

---
*Next step:* on approval, hand to `writing-plans` to produce the executable task
list.
