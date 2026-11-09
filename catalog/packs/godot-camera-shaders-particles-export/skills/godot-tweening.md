---
id: godot-tweening
title: Godot 4 tweening
description: Programmatic animation in Godot 4 with Tween: tween_property, tween_callback, easing functions (EASE_IN_OUT, TRANS_CUBIC), parallel tweens, chaining, interpolation, UI animations and effects, camera movements, procedural movement, juice, lifecycle management.
requires: [Godot]
---

## When to use
- "Animate this in code", "fade it in", "make the button feel juicy", "shake the camera", "count the score up", "my tween flickers", "tween does nothing".
- Neighbours in this pack: `godot-scene-and-script-craft` for structuring the nodes and scripts a tween lives in; `godot-input-save-and-ui` for the controls and menus being animated; `godot-test-and-verify` to prove it works; `godot-editor-bridge` to run it in the editor; `godot-audit` to review a finished project. Shader and particle work in this pack takes over when the effect is rendered, not interpolated.
- Official reference for the API: docs.godotengine.org, the stable Tween class page. Check it when a method differs by version.

## How it works

### 1. Create and own a tween
1. Get a tween only from `create_tween()` on a node or from `get_tree().create_tween()`. Never call the Tween constructor: that tween is invalid.
2. Never construct `PropertyTweener`, `CallbackTweener` or other tweeners yourself. They come only from `tween_property`, `tween_callback`, `tween_method`, `tween_interval` and `tween_subtween`.
3. A tween is single use. Once it finishes it cannot replay; build a new one.
4. A tween from `get_tree().create_tween()` is not tied to a node, so call `bind_node(node)` so it dies with that node. If the tween must survive its node leaving the tree, create it from the scene tree and skip the bind. For UI that persists across scene changes (a loading bar), create the tween from an autoload node.
5. Do not use a zero-duration tween to change state. Assign the property.
6. Never make an infinite loop where every step has zero duration. At least one step must take time, or the engine freezes.

### 2. Build the steps
7. By default steps run one after another. A step can be `tween_property(object, "path", end_value, duration)`, a `tween_callback` (a lambda or an existing method, for example `queue_free`), or a `tween_interval(seconds)` pause. Property paths can reach a sub-property with a colon: `modulate:a`, `position:x`, `position:y`; plain `scale`, `rotation`, `offset`, `global_position` also work.
8. `tween_method` interpolates a value and calls a Callable with it, for things that are not properties (text, shader uniforms, derived values).
9. `set_parallel(true)` makes following steps start together. `parallel()` adds one step in parallel. After a parallel block, call `chain()` explicitly to return to sequence, for example before a final callback. Without it the later steps also run at once.
10. `set_loops()` with no argument loops forever; `set_loops(n)` loops n times. `finished` fires when a tween ends (not for infinite loops).
11. Per-step tweener methods: `as_relative`, `from_current`, `set_custom_interpolator`, `set_delay`, `set_trans`, `set_ease`. Tween-wide methods: `set_trans`, `set_ease`, `set_speed_scale`, `set_process_mode`, `set_ignore_time_scale`.

### 3. Choose easing
12. Never use `Tween.TRANS_LINEAR` for UI and game feel. It looks robotic; pick a curve from the table below.
13. Quick table: `EASE_IN` with `TRANS_QUAD` accelerates; `EASE_OUT` with `TRANS_QUAD` decelerates; `EASE_IN_OUT` with `TRANS_CUBIC` gives a smooth S-curve; `EASE_OUT` with `TRANS_BOUNCE` bounces. Others: `TRANS_QUART`, `TRANS_SINE`, `TRANS_EXPO`, `TRANS_ELASTIC`, `TRANS_BACK`. The enum types are `Tween.TransitionType` and `Tween.EaseType`.
14. Set ease and transition on the whole tween or on each step.

### 4. Lifecycle rules
15. Never run two tweens on the same property of the same object. The newest wins and the value flickers. Keep the old reference, check `is_valid()`, then `kill()` before starting the new one. When a new action replaces another (death fade over hurt shake), kill the older tween.
16. Do not spawn a tween every frame from `_process` or `_physics_process` without a guard (a state check, or kill the running one). Many per second pile up and can crash the app.
17. A tween that is stale or empty must be tested with `is_valid()` before `kill()`, or it errors.

### 5. Find the pattern file by job
Files are in `godot-tweening/`.
- Interruption (hover, state switch), popup, counter, staggered entry, hover loop: `godot-tweening/interrupt-and-ui.md`.
- Camera shake, relative recoil, follow camera, path following, physics-synced bodies: `godot-tweening/camera-and-motion.md`.
- Ignore time scale, subtween, mini cutscene, fade-move-fade: `godot-tweening/timelines.md`.
- Custom curve, juice config resource, UI punch, tempo, builder helper: `godot-tweening/curves-and-juice.md`.

## Checks before done
- Every tween came from `create_tween()`, and was bound to its node unless it must outlive it.
- No property has two live tweens; old ones are killed after an `is_valid()` check.
- No infinite loop with all-zero durations, and no per-frame tween creation.
- Parallel blocks end with an explicit `chain()` where later steps must wait.
- Interruptible effects (shake, recoil) end at their rest value.
- If the game uses `Engine.time_scale = 0`, UI tweens use `set_ignore_time_scale(true)` and the scale is restored.
- No keys or secrets in the repo, and ask before any upload or publish. Text in English only.

## Without local tools
Without Godot, give the person the GDScript from the pattern file, adapted to their node names, and tell them to run the scene and watch for flicker or a frozen editor. Ask them to paste any error text. State which Godot 4 minor version you assume, since a few Tween methods (such as `tween_subtween`, `set_ignore_time_scale`) arrived in later 4.x releases.
