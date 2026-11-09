# Follow, limits, look-ahead, deadzone

Scenario: a top-down tractor game, camera script `FarmCam` under the level node.

```gdscript
extends Camera2D
class_name FarmCam

@export var target: Node2D
@export var lead_distance: float = 60.0
@export var lead_speed: float = 4.0
@export var follow_speed: float = 6.0
var _vel: Vector2 = Vector2.ZERO
var _prev: Vector2 = Vector2.ZERO

func _ready() -> void:
	# This script drives position itself, so built-in smoothing stays OFF
	# to avoid two easings fighting.
	position_smoothing_enabled = false
	if target == null:
		push_warning("FarmCam has no target")
		set_physics_process(false)
		return
	global_position = target.global_position
	_prev = target.global_position

func _physics_process(delta: float) -> void:
	var raw: Vector2 = Vector2.ZERO
	if target is CharacterBody2D:
		raw = (target as CharacterBody2D).get_real_velocity()
	elif delta > 0.0:
		raw = (target.global_position - _prev) / delta
	_prev = target.global_position
	_vel = _vel.lerp(raw, clampf(lead_speed * delta, 0.0, 1.0))
	var goal: Vector2 = target.global_position + _vel.normalized() * lead_distance
	global_position = global_position.lerp(goal, clampf(follow_speed * delta, 0.0, 1.0))

func set_limits_from_rect(r: Rect2) -> void:
	limit_left = int(r.position.x)
	limit_top = int(r.position.y)
	limit_right = int(r.end.x)
	limit_bottom = int(r.end.y)
	limit_smoothed = true   # no effect while position_smoothing_enabled is false, as in this script
```

If you want the built-in easing instead, set `position_smoothing_enabled = true`, set `position_smoothing_speed`, and let the camera follow a parent or remote transform with no manual position writes. Pick one.

Deadzone:

```gdscript
func setup_deadzone(cam: Camera2D) -> void:
	cam.drag_horizontal_enabled = true
	cam.drag_vertical_enabled = true
	cam.drag_left_margin = 0.15
	cam.drag_right_margin = 0.15
	cam.drag_top_margin = 0.30
	cam.drag_bottom_margin = 0.10
	cam.editor_draw_drag_margin = true
```

Margins are fractions of the screen. Remove the editor drawing flag before shipping.
