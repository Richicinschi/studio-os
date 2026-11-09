---
id: godot-camera-systems
title: Godot camera systems
description: Use for Godot 4 2D/3D camera control: Camera2D, Camera3D, SpringArm3D, position_smoothing, smooth following, lerp, camera shake, trauma system, screen shake, deadzone, drag_margin, look_ahead, camera_limits, camera_transition, cinematic sequences, multi-camera.
requires: [Godot]
---

## When to use

Typical wordings: "make the camera follow the ship smoothly", "add screen shake when the boss lands", "the camera clips into walls", "zoom with the mouse wheel", "split screen for two players", "a minimap", "a cutscene fly-through", "keep both racers in view".

Neighbours in this pack: shaders, particles, tweening outside the camera, and export builds are covered by the sibling skills of this pack; this skill ends at the camera node and its rig. Hand over visual effects such as a screen flash or vignette to the shader skill, and packaging to the export skill.

Godot 4.x only. Class references: docs.godotengine.org pages for Camera2D and Camera3D.

## How it works

Required first step: before you build any behaviour below, open the matching file in `godot-camera-systems/` (listed in each group). They carry the vetted patterns. Do not improvise from memory when a file exists.

### A. Rules that apply everywhere
1. Never copy the target's `global_position` into the camera every frame with no easing. Ease toward it (`lerp`, `move_toward`) or turn on `position_smoothing_enabled`.
2. Use `offset` only for temporary effects (shake, sway, recoil). Permanent framing lives in `position`. Mixing them makes follow logic and effects fight.
3. Never shake by writing random values into `position`; that overwrites the follow. Layer shake through `offset` or a trauma/noise system.
4. Keep exactly one `Camera2D` with `enabled` set per viewport. A viewport has a single active camera; if it is disabled, the next enabled `Camera2D` in the tree takes over, which is confusing when several are on. Disable the inactive ones explicitly.
5. UI placed with anchors stays in screen space; do not compensate it for camera motion.
6. Use `_physics_process` for physics-driven targets and for raycast or spring logic. Use `_process` for visual-only easing. This keeps the camera in step with its target.
7. Do not zoom with plain linear interpolation. Use exponential-style smoothing, or a tween with `TRANS_CUBIC`. Larger `zoom` means closer in.

### B. 2D follow, smoothing and limits (file: `follow-and-limits.md`)
1. Simplest custom follow: each frame, ease toward the target with a speed scaled by delta.
2. Preferred: `position_smoothing_enabled = true` and set `position_smoothing_speed`.
3. Limits: set `limit_left`, `limit_top`, `limit_right`, `limit_bottom` to the level bounds, then set `limit_smoothed = true`. Always do the smoothing step when limits exist, or the view stops hard at the edge. The engine ignores `limit_smoothed` while `position_smoothing_enabled` is false, so with a hand-written ease the limits still clamp but the stop is only as soft as your own easing.
4. A helper that converts a `Rect2` into the four limits (cast to int) is useful when bounds come from a reference node.
5. Placement: make the follow script a child of the level, or parent it to the player and make the camera top-level. Warn if no target is assigned and do nothing without one.
6. Parenting the camera to the player is fine as a quick default for slow, non-rotating bodies. For fast or rotating bodies see section F.
7. Look-ahead: add the target's normalised velocity times a distance to the goal. For non-physics nodes derive velocity from position change over delta (guard against delta of zero); for `CharacterBody2D` use `get_real_velocity()`. Smooth the velocity first.
8. If look-ahead assigns position directly while built-in smoothing is on, the two conflict. Decide which one drives the motion and say so in a comment. Safest: smoothing off, your own ease on.
9. Deadzone for platformers: `drag_horizontal_enabled` and `drag_vertical_enabled` on, then `drag_left_margin`, `drag_right_margin`, `drag_top_margin`, `drag_bottom_margin` as fractions of the screen (asymmetric is fine, for example a larger top than bottom). Turn on `editor_draw_drag_margin` to see the zone.

### C. Shake (file: `trauma-shake.md`)
1. Basic: an intensity that decays; while above zero set `offset` to a random vector within plus or minus the intensity; at zero reset `offset`; a method sets the intensity. Fine for a quick effect, weaker than the next one.
2. Preferred, trauma: a value clamped 0 to 1, raised by hits, decaying linearly. Strength is trauma to a power (2 by default, so small hits stay gentle and big ones are explosive). Drive offset on both axes and `rotation` from smooth noise (`FastNoiseLite`, `get_noise_2d`) on separate lanes per channel, then reset offset and rotation when trauma hits zero.
3. Export the tuning: decay rate, maximum offset per axis, maximum roll, power, noise frequency, seed. Randomise the seed at start.
4. Never let trauma exceed 1.
5. Audit tool: plot a rolling history of about 200 trauma samples (your own choice of window) with `_draw` and `queue_redraw` each frame, reading trauma through a getter on the shake camera.
6. Combined camera: trauma shake and lead-room both write `offset`. Keep lead logic in its own controller, read velocity from the real player, and use a gentler decay.

### D. Zoom and transitions (file: `zoom-and-transitions.md`)
1. Wheel zoom: `MOUSE_BUTTON_WHEEL_UP` zooms in, `MOUSE_BUTTON_WHEEL_DOWN` out, clamp to a min and max.
2. Smooth variant: keep a target zoom, change it on wheel events, clamp, and ease the real `zoom` toward it with exponential smoothing. Check that the wheel directions match the basic version.
3. Move to a point of interest: `create_tween()`, `tween_property` on `global_position`, `set_ease(Tween.EASE_IN_OUT)`, `set_trans(Tween.TRANS_CUBIC)`.
4. State camera manager with follow, static and cinematic states. Entering static: turn smoothing off, tween, await `finished`, restore smoothing if needed. Entering follow: set the state and use a remote transform on the target. Get the active camera with `get_viewport().get_camera_2d()`.
5. Cinematic path: camera under a `PathFollow2D` on a `Path2D`; tween `progress_ratio` from 0 to 1 over the duration and await `finished`.
6. Framing: offset the goal vertically by a signed fraction of `get_viewport_rect()` height (negative shifts the camera up, so the subject sits lower) plus a velocity lead, then ease. Read velocity only if the target has one.

### E. Multiple targets and views (file: `multi-view.md`)
1. Framing box: build the bounding `Rect2` of all targets, `grow` it by padding, centre on `get_center()`, set zoom to the smaller of the two screen-to-box ratios, clamp it. Skip when there are no targets. In 3D change distance instead of zoom. Run in the physics step.
2. Basic split screen: two `Camera2D`, one per player, each with `anchor_mode` `ANCHOR_MODE_DRAG_CENTER`.
3. Full split screen: `HBoxContainer` holding two `SubViewportContainer`, each with a `SubViewport` and its own camera. For an uneven split change `size_flags_stretch_ratio` on the two children. Set `audio_listener_enable_2d` on one sub-viewport only, or audio doubles.
4. Minimap: a `Camera2D` inside a `SubViewport` follows the player's `global_position` and ignores its rotation. Set `render_target_update_mode` explicitly (`UPDATE_WHEN_VISIBLE` or a reduced fixed rate); never rely on the default. Optionally update only after the player moves far enough.

### F. 3D rigs (file: `rigs-3d.md`)
1. Third-person orbit: angle from `Input.get_axis` times rotation speed; position is target plus a horizontal circle at a distance plus fixed height; `look_at` the target with `Vector3.UP`.
2. `look_at` flips when the target is straight above or below the camera. Guard that case or use `Quaternion` tracking for vertical aiming.
3. `SpringArm3D`: set its collision mask to world and environment layers, otherwise the camera passes through terrain and walls.
4. Manual occlusion: each physics frame take the ideal position behind the target, cast a ray from the target with `get_world_3d().direct_space_state.intersect_ray` using `PhysicsRayQueryParameters3D` and an exclude list holding the target's `get_rid()`. On a hit, place the camera at `position` pushed out along `normal` by a small margin; otherwise use the ideal point. Then look at the target. Easing the camera closer smoothly looks better than snapping.
5. Spring-style follow: in `_physics_process`, ease toward target plus offset with a weight of stiffness times delta, then look at the target. This is an exponential ease, not a real spring; say so in comments. It reduces follow stutter at high speed.
6. First person: `Input.mouse_mode = Input.MOUSE_MODE_CAPTURED`; on `InputEventMouseMotion` rotate the parent body for yaw, accumulate pitch on the camera, clamp pitch to about 80 degrees (a starting point, not a measured value); sensitivity is an `@export`.
7. Walk bob: when the parent `CharacterBody3D` horizontal speed passes a small threshold, advance a timer by delta times speed and set local position to a figure eight (sine for vertical at the bob frequency, cosine for horizontal at half that), scaled by amplitude. When still, reset the timer and `lerp` back to zero.

### G. Decoupling the camera (file: `decoupling.md`)
1. Never parent a camera directly to a fast physics body: physics stutter and parent rotation cause instability and motion sickness.
2. Use `RemoteTransform2D` or `RemoteTransform3D` under the target: set `remote_path` to the camera, `update_position` on, `update_rotation` off, `update_scale` off.
3. Logical-position node: the camera follows a separate node that eases toward the target with a weight from 0 to 1 in the physics step. Enemies, the mouse or points of interest can nudge it, it can be locked to an `Area2D` bounds or moved to an explosion, all without touching player controls.

## Checks before done
- Exactly one enabled 2D camera per viewport.
- Limits set means `limit_smoothed` is on and built-in position smoothing is on too (otherwise the flag does nothing).
- No script writes random values to `position`; shake goes through `offset` or `rotation` and resets at zero.
- Trauma stays between 0 and 1; seed is randomised.
- Zoom wheel directions match between code paths, and tested by scrolling both ways.
- No `look_at` without the straight-up guard; `SpringArm3D` has a mask.
- Sub-viewports have an explicit update mode; only one has the 2D audio listener.
- Every 3D follow logic runs in the physics step when the target is physics driven.
- Helper files were opened before use; no keys or network calls in scripts; ask before any upload or publish; all text English.

## Without local tools

Without the Godot editor you cannot run the scene. Give the person the full GDScript and the node tree as text, say which node each script attaches to, and list steps for them to run: press play, trigger the effect, scroll the wheel both ways, walk into a wall. Ask them to paste any error back.
