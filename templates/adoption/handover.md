# Hand-over

**Date:** <YYYY-MM-DD> · **Kit version:** v<X.Y.Z> · **Wave:** <1, 2, ...>

Written by `drill-to-adopt` in phase 5, Verify, at the end of each wave, or of a sitting that ends with rows still waiting. It says what you have, what still waits on you, how to pick up tomorrow, and what your setup now costs at the start of every session.

## What you have now

| Item | Where it lives | Check run | Result |
|---|---|---|---|
| <id> | <path in your setup, or the claude.ai Project> | <the card's Check> | <pass / fail, with the line that showed it> |

## Still waiting on you

<Each row not yet ticked, by name, and what it waits on. Then every pending command in one block, in order, each with one line on what it does; paste them one at a time. "Nothing" when nothing waits.>

## How to resume tomorrow

1. Start a new session in <the folder you start from each day>, rather than resuming today's.
2. Say: "<the resume line from your newest handoff note>".
3. The answer comes from <the files it reads: the front door, the memory index, the newest handoff note>.

Fresh-session proof, run on <YYYY-MM-DD> in a second terminal: asked "<the question that names your problem>", the answer came from <file>; asked "where did we stop?", it came from <file>. <pass / fail>

## What loads into every session

| | Tokens (estimate unless marked measured) |
|---|---|
| Before the adoption (phase 1, the audit) | <N> |
| Your choice (phase 2, the menu) | <N> |
| Now (phase 5) | <N> |

<How "now" was found: file sizes divided by 4 (an estimate), or the `/context` breakdown you read out. Name the three heaviest items.>

## Skipped, and why

| Item or module | Why |
|---|---|

## When the kit changes

Pull the kit (`git pull` in its folder), read the top of its `CHANGELOG.md`, open Claude Code in the kit and say "Update my adoption." Only new or changed items are asked about; your answers in `adoption/features.md` and `adoption/decisions.md` stand. To take the next items from your plan's Later waves, say "next wave".
