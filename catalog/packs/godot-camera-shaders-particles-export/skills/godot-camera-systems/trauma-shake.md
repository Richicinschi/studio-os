# Trauma shake

Scenario: a naval game; cannon fire adds a little trauma, a ship ramming adds a lot.

```gdscript
extends Camera2D
class_name TraumaCam

@export var decay: float = 0.9
@export var max_offset: Vector2 = Vector2(80.0, 50.0)
@export var max_roll_deg: float = 6.0
@export var power: int = 2
@export var noise_speed: float = 40.0
@export var noise: FastNoiseLite

var _trauma: float = 0.0
var _t: float = 0.0

func _ready() -> void:
	if noise == null:
		noise = FastNoiseLite.new()
	noise.seed = randi()

func add_trauma(amount: float) -> void:
	_trauma = clampf(_trauma + amount, 0.0, 1.0)

func get_trauma() -> float:
	return _trauma

func _process(delta: float) -> void:
	if _trauma <= 0.0:
		offset = Vector2.ZERO
		rotation = 0.0
		return
	_trauma = maxf(_trauma - decay * delta, 0.0)
	_t += delta * noise_speed
	var s: float = pow(_trauma, power)
	offset.x = max_offset.x * s * noise.get_noise_2d(_t, 0.0)
	offset.y = max_offset.y * s * noise.get_noise_2d(_t, 100.0)
	rotation = deg_to_rad(max_roll_deg) * s * noise.get_noise_2d(_t, 200.0)
```

Tuning notes: with decay 0.9 a full trauma fades in a little over a second. Example values, tune them: a light hit might add 0.2, a heavy one 0.5. The second arguments (0, 100, 200) give each channel its own noise lane. Stepping a counter instead of time works too, but still reset offset and rotation when trauma ends.

Basic variant for a throwaway effect:

```gdscript
var _power: float = 0.0

func shake(p: float) -> void:
	_power = p

func _process(delta: float) -> void:
	if _power > 0.0:
		_power = maxf(_power - 30.0 * delta, 0.0)
		offset = Vector2(randf_range(-_power, _power), randf_range(-_power, _power))
	else:
		offset = Vector2.ZERO
```

## Audit graph

Add a `Control` that holds a reference to the camera, appends `cam.get_trauma()` each frame to an array capped at 200, calls `queue_redraw()` in `_process`, and in `_draw` joins the points with `draw_polyline`. Read the curve to judge whether hits feel too long or too soft.

## Shake plus lead room

Both write `offset`. Keep lead room in a separate controller that moves the camera's `position`, not `offset`, or add the two results into one assignment in a single script. Take velocity from the actual player, never a placeholder zero.
