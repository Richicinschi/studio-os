# 3D rigs

Scenario: a diving game with a submarine and a diver.

Orbit:

```gdscript
extends Camera3D

@export var target: Node3D
@export var distance: float = 7.0
@export var height: float = 2.0
@export var turn_speed: float = 1.8
var _angle: float = 0.0

func _process(delta: float) -> void:
	_angle += Input.get_axis("orbit_left", "orbit_right") * turn_speed * delta
	var ring: Vector3 = Vector3(sin(_angle), 0.0, cos(_angle)) * distance
	global_position = target.global_position + ring + Vector3(0.0, height, 0.0)
	look_at(target.global_position, Vector3.UP)
```

Up-vector guard: if the direction to the target is nearly parallel to `Vector3.UP` (absolute dot product close to 1; 0.99 is a starting threshold to tune), skip `look_at` or pass a different up vector such as `Vector3.FORWARD`. Otherwise the view flips.

Occlusion with a ray:

```gdscript
@export var margin: float = 0.3
@export var back_distance: float = 6.0
@export var target_body: CollisionObject3D

func _physics_process(_d: float) -> void:
	var t: Vector3 = target_body.global_position
	var ideal: Vector3 = t + target_body.global_transform.basis.z * back_distance + Vector3.UP * 2.0
	var q: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(t, ideal)
	q.exclude = [target_body.get_rid()]
	var hit: Dictionary = get_world_3d().direct_space_state.intersect_ray(q)
	if hit.is_empty():
		global_position = ideal
	else:
		global_position = hit["position"] + hit["normal"] * margin
	look_at(t, Vector3.UP)
```

Check the sign of the back direction in your scene; it depends on which way the body faces. For smoother results lerp from the current position to the chosen one. A `SpringArm3D` with the camera as a child and a world-only `collision_mask` does the same job with less code.

Spring-style ease:

```gdscript
@export var stiffness: float = 8.0
@export var rig_offset: Vector3 = Vector3(0.0, 3.0, 8.0)

func _physics_process(delta: float) -> void:
	var goal: Vector3 = target.global_position + rig_offset
	global_position = global_position.lerp(goal, clampf(stiffness * delta, 0.0, 1.0))
	look_at(target.global_position, Vector3.UP)
```

This is an exponential ease, not a real spring.

First person:

```gdscript
extends Camera3D

@export var sensitivity: float = 0.0025
var _pitch: float = 0.0

func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		get_parent().rotate_y(-event.relative.x * sensitivity)
		_pitch = clampf(_pitch - event.relative.y * sensitivity, -deg_to_rad(80.0), deg_to_rad(80.0))
		rotation.x = _pitch
```

Walk bob (parent must be a `CharacterBody3D`):

```gdscript
@export var bob_freq: float = 9.0
@export var bob_amp: float = 0.05
var _clock: float = 0.0

func _process(delta: float) -> void:
	var body: CharacterBody3D = get_parent() as CharacterBody3D
	var speed: float = Vector2(body.velocity.x, body.velocity.z).length()
	if speed > 0.5:
		_clock += delta * speed
		position = Vector3(cos(_clock * bob_freq * 0.5) * bob_amp, sin(_clock * bob_freq) * bob_amp, 0.0)
	else:
		_clock = 0.0
		position = position.lerp(Vector3.ZERO, clampf(10.0 * delta, 0.0, 1.0))
```
