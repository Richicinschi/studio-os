# Camera shake, recoil, follow, path and physics sync

## Shake
Job: screen shake that always ends centred.

```gdscript
func shake(cam: Camera2D, intensity: float) -> void:
	var t: Tween = create_tween().bind_node(cam).set_loops(6)
	var kick: Vector2 = Vector2(randf_range(-1.0, 1.0), randf_range(-1.0, 1.0)) * intensity
	t.tween_property(cam, "offset", kick, 0.03)
	t.tween_property(cam, "offset", Vector2.ZERO, 0.03)
	t.finished.connect(func() -> void: cam.offset = Vector2.ZERO)
```
The loop count is finite, so it ends and emits `finished`; the handler forces zero offset in case the last step was cut short. This picks one random vector for every loop. For a new kick each loop, re-randomise from a `tween_callback` or use a short timer-driven function.

## Relative recoil
```gdscript
func kick_back(cam: Camera2D) -> void:
	var t: Tween = create_tween().bind_node(cam)
	t.tween_property(cam, "offset:x", -12.0, 0.05).as_relative().from_current()
	t.tween_property(cam, "offset:x", 0.0, 0.2)\
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
```
`as_relative()` treats the end value as a delta; `from_current()` re-reads the start when the step begins. Chain a return step so the value settles at rest.

## Follow cameras
Do not create a tween every frame in `_process` to follow a target. That breaks the one-tween-per-property rule and piles up tweens. Use the built-in smoothing on the camera, a `lerp` in `_physics_process`, or start one guarded tween only when the target changes (kill the old one first).

## Path follow
```gdscript
func ride(follower: PathFollow2D) -> void:
	follower.progress_ratio = 0.0
	var t: Tween = create_tween().bind_node(follower)
	t.tween_property(follower, "progress_ratio", 1.0, 2.0)\
		.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN_OUT)
```
The follower is a child of a Path2D. Reset the ratio to the start first, then tween it.

## Physics-synced body
```gdscript
func glide(body: Node3D, start: Vector3, end: Vector3) -> void:
	body.global_position = start
	body.reset_physics_interpolation()
	var t: Tween = create_tween().bind_node(body)
	t.set_process_mode(Tween.TWEEN_PROCESS_PHYSICS)
	t.tween_property(body, "global_position", end, 1.0)
```
Reset interpolation after teleporting, or the body streaks across the screen. The same applies to network position corrections.
