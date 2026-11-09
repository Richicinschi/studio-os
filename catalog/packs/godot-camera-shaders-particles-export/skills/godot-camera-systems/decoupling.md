# Decoupling the camera from the body

Scenario: a hover-bike racer with a body that spins and jitters on physics.

Remote transform set-up in code:

```gdscript
func attach_camera(body: Node2D, cam: Camera2D) -> void:
	var rt: RemoteTransform2D = RemoteTransform2D.new()
	body.add_child(rt)
	rt.remote_path = rt.get_path_to(cam)
	rt.update_position = true
	rt.update_rotation = false
	rt.update_scale = false
```

Use `RemoteTransform3D` for 3D. The camera stays upright and at normal scale while it tracks the body's position. Combine with `position_smoothing_enabled` on the camera if you want easing, since it is not parented.

Logical-position node (a "phantom"):

```gdscript
extends Node2D

@export var body: Node2D
@export var weight: float = 0.12   # 0 to 1

func _physics_process(_d: float) -> void:
	global_position = global_position.lerp(body.global_position, weight)
```

Point the camera (or a remote transform from this node) at the phantom. Other code may add an offset to the phantom, clamp it inside an `Area2D` shape, or move it toward a blast, and the bike controls never change.
