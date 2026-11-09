# Zoom, transitions, cinematics

Scenario: a tactics map and a chase scene.

Basic wheel zoom:

```gdscript
@export var zoom_min: float = 0.4
@export var zoom_max: float = 2.5
@export var zoom_step: float = 0.1

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			var z: float = clampf(zoom.x + zoom_step, zoom_min, zoom_max)
			zoom = Vector2(z, z)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			var z2: float = clampf(zoom.x - zoom_step, zoom_min, zoom_max)
			zoom = Vector2(z2, z2)
```

Smooth variant: keep `_target_zoom`, apply the same up (add) and down (subtract) rules to it, clamp, then in `_process` compute `var k: float = 1.0 - exp(-10.0 * delta)` and `zoom = zoom.lerp(Vector2(_target_zoom, _target_zoom), k)`. Test both scroll directions; they must match the basic version.

Move to a point:

```gdscript
func pan_to(dest: Vector2, secs: float) -> void:
	var tw: Tween = create_tween()
	tw.tween_property(self, "global_position", dest, secs).set_ease(Tween.EASE_IN_OUT).set_trans(Tween.TRANS_CUBIC)
	await tw.finished
```

State manager outline:

```gdscript
enum State { FOLLOW, STATIC, CINEMATIC }
var state: State = State.FOLLOW

func go_static(dest: Vector2) -> void:
	state = State.STATIC
	var cam: Camera2D = get_viewport().get_camera_2d()
	cam.position_smoothing_enabled = false
	var tw: Tween = create_tween()
	tw.tween_property(cam, "global_position", dest, 1.2).set_ease(Tween.EASE_IN_OUT).set_trans(Tween.TRANS_CUBIC)
	await tw.finished
	# re-enable smoothing here only if follow mode needs it

func go_follow(_target: Node2D) -> void:
	state = State.FOLLOW
	# the target carries a RemoteTransform2D pointing at the camera
```

Cinematic path: put the camera under a `PathFollow2D` that sits on a `Path2D`.

```gdscript
func play_flyover(pf: PathFollow2D, secs: float) -> void:
	pf.progress_ratio = 0.0
	var tw: Tween = create_tween()
	tw.tween_property(pf, "progress_ratio", 1.0, secs)
	await tw.finished
```

Framing with lead room:

```gdscript
@export var vertical_ratio: float = -0.12
@export var lead_factor: float = 0.25

func _process(delta: float) -> void:
	var goal: Vector2 = target.global_position
	goal.y += get_viewport_rect().size.y * vertical_ratio
	if "velocity" in target:
		goal += target.velocity * lead_factor
	global_position = global_position.lerp(goal, 1.0 - exp(-5.0 * delta))
```

A negative ratio moves the camera up, so the subject sits in the lower third.
