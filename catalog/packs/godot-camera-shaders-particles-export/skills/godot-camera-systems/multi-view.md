# Several targets, split screen, minimap

Scenario: a two-player kart arena.

Framing box (2D):

```gdscript
@export var targets: Array[Node2D] = []
@export var padding: Vector2 = Vector2(200.0, 150.0)
@export var zoom_floor: float = 0.3
@export var zoom_ceiling: float = 1.5

func _physics_process(_delta: float) -> void:
	if targets.is_empty():
		return
	var box: Rect2 = Rect2(targets[0].global_position, Vector2.ZERO)
	for t in targets:
		box = box.expand(t.global_position)
	box = box.grow_individual(padding.x, padding.y, padding.x, padding.y)
	global_position = box.get_center()
	var screen: Vector2 = get_viewport_rect().size
	var z: float = minf(screen.x / box.size.x, screen.y / box.size.y)
	z = clampf(z, zoom_floor, zoom_ceiling)
	zoom = Vector2(z, z)
```

`Rect2.grow(amount)` works too when one padding value is enough. In 3D keep the camera pointing the same way and change its distance instead of zoom.

Split screen tree:

```
HBoxContainer
  SubViewportContainer (stretch on, size_flags_stretch_ratio = 1)
    SubViewport (audio_listener_enable_2d = true)
      Camera2D (player one)
  SubViewportContainer (size_flags_stretch_ratio = 1)
    SubViewport (audio_listener_enable_2d = false)
      Camera2D (player two)
```

Both sub-viewports must show the same world: set the second one's `world_2d` to the first one's in code. To make the left side wider, set the first ratio to 2 and the second to 1; the second gets the remainder. The simple version without containers uses two `Camera2D` with `anchor_mode = Camera2D.ANCHOR_MODE_DRAG_CENTER`.

Minimap:

```gdscript
extends SubViewportContainer

@export var player: Node2D
@onready var vp: SubViewport = $SubViewport
@onready var cam: Camera2D = $SubViewport/Camera2D

func _ready() -> void:
	vp.render_target_update_mode = SubViewport.UPDATE_WHEN_VISIBLE

func _process(_d: float) -> void:
	cam.global_position = player.global_position
	cam.rotation = 0.0
```

To save more, pick a reduced fixed-rate update mode and only move the camera when the player has travelled a set distance since the last update.
