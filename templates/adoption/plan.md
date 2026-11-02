# Adoption plan

**Spec:** `adoption/spec.md`, approved <YYYY-MM-DD> · **Kit version:** v<X.Y.Z>

Written by `drill-to-adopt` from your approved spec, in waves, one item per row: never two items in one row, and an item folded into another keeps its own row and says where it went. `vet-and-adopt` takes the first row without a tick, follows that item's card (`cards/<id>.md` in the kit), and ticks the row only after the row's check has passed. The steps only you can do come from each card's **you:** lines, and the check from its Check part.

## Wave 1: the first sitting (at most about 8 rows)

Row 1 is always the scanner, so it arrives right before the first thing it checks. In an empty folder, row 2 builds the whole setup folder from the kit's templates, before anything else writes into it. When anything installed was never scanned, a row scans it, read-only. Then `handoff`, so your next session starts where this one stopped; when you asked for your existing folders to be reorganized, a row that moves them, each step on your yes; then the front door and memory, and the two or three items that answer the problem you named. This sitting ends with these rows checked and a fresh session shown working. Move any item up from Later waves if you want it today.

| # | Item | Module | Route (adopt, adapt, fold, write, run) | Steps only you can do | How you will see it works | Done |
|---|---|---|---|---|---|---|
| 1 | skillspector: SkillSpector and the scan-first rule | 05-skills | adopt | Install uv, then SkillSpector: the `!` lines for your system in the kit's `cards/skillspector.md` | `skillspector --version` prints a version, and a scan of one kit skill prints a verdict | [ ] |
| 2 | setup-workspace, create mode (only in an empty folder) | 11-workspace-layout | run | none; `git init` comes as its own question afterwards | every file of the tree exists, copied from the kit's templates | [ ] |
| 3 | scan what you already have (only when something installed was never scanned) | 05-skills | read-only | none | each installed item scanned, its result in `adoption/decisions.md`, nothing changed | [ ] |
| 4 | handoff (<size>) | 01-continuity | adapt | <the card's you: steps> | a fresh session asked "where did we stop?" answers from your note | [ ] |
| 5 | <id> (<size>) | <module id> | <route> | <the card's you: steps, as ! lines, or a separate terminal for a sign-in> | <the card's Check, with its expected output> | [ ] |

## Later waves

Everything else you ticked, in the order it will come, each with why it waits. Say "next wave" once wave 1 works, or run update mode, and the next few become a new wave.

| Item | Module | Why it waits |
|---|---|---|
| <id> | <module id> | <one line: what it adds, and why not today> |
