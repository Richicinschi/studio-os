---
name: godot-audit
description: >-
  Audit a Godot 4.x / GDScript project for code quality, project-structure, performance,
  and — uniquely — progression and currency ECONOMY health. Use when reviewing a Godot game's code
  before merge, when a game's progression "feels off" (maxes too fast, currency snowballs,
  grind dead-zones), or when asked to "audit / review the Godot project", "check the
  GDScript", "review the skill tree / economy balance". Produces a structured findings
  report (Critical / Improvements / Positive) with file:line locations and suggested fixes.
  Checks code against Godot's official GDScript style guide and the economy against
  idle-game math (Pecorella / GDC Europe 2016). Pairs with the gdlint linter and the
  godot-forge MCP (Script/Scene analysis + GUT runner) when available, but works
  rubric-only without them.
metadata:
  category: gamedev
  version: 1.1.0
  domain: Godot 4.x / GDScript code + incremental-economy audit
---

# Godot Audit

Audit a Godot 4.x project on four axes and emit one structured report. Axes A–C are general
GDScript/Godot quality; **axis D (economy health) is the distinctive part** for incremental /
roguelite / TD games and has no off-the-shelf equivalent.

## When to use

- Before merging a Godot feature branch (a `verify.sh`-style gate, but semantic).
- When a game's progression *feels* wrong: tree maxes too fast, a currency snowballs, or a
  grind dead-zone appears.
- On request: "audit the Godot project", "review the GDScript", "check the economy/skill-tree balance".

## How to run

1. **Scope.** Identify the target (whole repo, or named scripts/scenes). Default: `scripts/`,
   `data/`, `scenes/`.
2. **Automated layer first (if available).** These give cheap, objective signal — run them
   before the manual rubric so the report cites concrete evidence:
   - `gdlint <paths>` (gdtoolkit) — naming/style/static rules. *(Requires a working Python; if
     Python is unavailable, note it in the report's coverage line and skip.)*
   - **godot-forge MCP** (if connected): `script analysis` (10 GDScript pitfalls),
     `scene analysis` (.tscn/.tres antipatterns), `LSP diagnostics`, and the **GUT test runner**
     (confirm the suite is green — a red suite caps the audit at the failing tests).
3. **Manual rubric.** Walk axes A–D below. Every finding gets a `file:line`, a one-line issue,
   and a concrete suggested fix.
4. **Emit the report** in the output format below. Never claim full coverage if a layer was
   skipped — state what ran and what didn't.

## Axis A — Code quality (GDScript)

Measure the scripts against Godot's official GDScript style guide and the studio's typing rules.

- **Names.** Functions, variables and script files are snake_case; a `class_name` and node
  names are PascalCase; constants and enum members are CONSTANT_CASE. A signal is named for
  something that has already happened (`health_depleted`, not `deplete_health`).
- **Order inside a script.** Signals, enums and constants sit near the top, before the
  exported and plain variables; then the engine callbacks; then the script's own methods.
- **Types everywhere.** Every parameter and return value carries a type, every `@export` is
  typed, and the node returned by `instantiate()` is cast to its type. Godot 4.5 raises
  `inference_on_variant` as an error, so never infer with `:=` from a call that returns a
  Variant (`Dictionary.get()`, a ternary mixing types): write the type out.
- **No shadowing of `Object`'s own methods.** A script must not define a method that
  `Object` already has, such as `set_meta`.
- **Signals go up the tree, calls go down.** Connections are made in `_ready()`. Flag any two
  scripts that depend on each other.
- **Loading and freeing.** `preload()` for a path known while editing, `load()` only for a
  path built at run time, and `queue_free()` to remove a node.

## Axis B — Architecture & structure

- Single responsibility per node/script; shallow inheritance; sparse autoloads (each autoload
  is global state — justify it).
- **Data-driven content** lives in `Resource`/`.tres`, not hardcoded in logic (so balance =
  data authoring, not code edits). Flag content constants embedded in behavior scripts.
- File growing too large / doing too much → flag for split.

## Axis C — Performance (mobile-first)

- No `get_node()`/`load()` in hot paths (`_process`/`_physics_process`/per-frame loops) —
  cache with `@onready`/preloaded refs.
- Disable `_process()`/`_physics_process()` when idle.
- `StringName` (`&"x"`) for repeated string comparisons in loops.
- Heavy per-frame recompute (pathfinding, full-field nav) → throttle or cache; never every frame
  on mobile.

## Axis D — Progression and currency ECONOMY health (the distinctive part)

Grounded in idle-game math (Pecorella, GDC Europe 2016; *Math of Idle Games* I–III). The two
failure modes are **trivial maxing** (progression ends in a few sessions) and **snowball /
grind dead-zone** (a currency explodes or stalls). Check:

1. **Exponential cost vs polynomial production.** Every *infinite* / high-rank upgrade must have
   **`cost = base × growth^owned`, growth > 1 (choose the value by playtest)** while its production bonus
   grows only linearly/polynomially. Flag any infinite node with `cost_growth ≤ 1.0` (flat cost
   → trivial maxing) or additive cost.
2. **Difficulty-multiplier sanity.** If a player-controlled difficulty/threat dial multiplies a
   *persistent* reward, the **reward scaling exponent must not exceed the difficulty/cost
   exponent.** Flag `reward ∝ x^n` while `cost/HP ∝ x^m` with `n > m` (e.g. reward `l*l` vs HP
   `l`) — that makes raising difficulty a pure free gain and snowballs the currency. `n == m`
   (e.g. linear reward vs linear HP) is the healthy balanced target: pushing difficulty is gated
   by survival, not free. `n < m` is safe but makes pushing difficulty unattractive.
3. **Sublinear persistent banking.** Persistent/meta currency derived from run output should pass
   through a **fractional-exponent transform (sqrt / cube root)** so growing the bank gets steadily
   harder (with a square root, doubling the bank needs four times the run output). Flag raw `meta += run_output`
   with no sublinear damping when run output is itself multiplier-scaled.
4. **Prestige pacing** (if a reset layer exists): a reset should yield a clearly
   noticeable gain in prestige currency — flag resets that give trivial or runaway amounts.
   Measure it: simulate or playtest the first reset and compare the gain with the time spent to reach it.
5. **Unlock vs stat pacing.** One-time *unlock* nodes (content/dopamine) should interleave with
   *infinite stat* nodes; flag a tree that is all-finite (ends fast) or all-grind (no milestones).
   No universal ratio — recommend a playtest check, don't assert a number.

## Output format

```
## Godot Audit — <scope>

Coverage: rubric A–D | gdlint: <ran/skipped+why> | godot-forge: <ran/skipped> | GUT: <green/red/skipped>

### Critical
- [ ] <file:line> — <issue> — **Fix:** <solution>

### Improvements
- [ ] <file:line> — <issue> — **Fix:** <solution>

### Positive
- <reinforced good pattern>

### Economy health (axis D)
- <per-check verdict: PASS / FLAG with the formula evidence>

---
Reviewed against: Godot 4.5 best practices + idle-game economy math. Tools that did not run are noted above — coverage is rubric-level, not exhaustive, where a layer was skipped.
```

## Notes

- This skill is **assistant tooling**; it never modifies game code on its own — it reports.
- The economy rubric is the studio's own work; keep it current with the project's
  `docs/research/` incremental-design dossier.
- LGPL skills may inform genre knowledge but their text must not be
  copied into shipped game code.
