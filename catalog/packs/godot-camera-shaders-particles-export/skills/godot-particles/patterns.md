# Particle script patterns

All snippets are GDScript for Godot 4.x. Names are examples; rename freely.

## Pool of ready effects
Build the set once, then lend effects out. An empty pool simply skips the effect.

```gdscript
extends Node

var idle_fx: Array[GPUParticles2D] = []

func fill(template: PackedScene, n: int) -> void:
	for i in n:
		var fx := template.instantiate() as GPUParticles2D
		fx.emitting = false
		fx.finished.connect(idle_fx.append.bind(fx))
		add_child(fx)
		idle_fx.append(fx)

func play(pos: Vector2) -> void:
	if idle_fx.is_empty():
		return
	var fx: GPUParticles2D = idle_fx.pop_back()
	fx.global_position = pos
	fx.restart()
```

## Spawn on demand
Add the effect to a node that outlives the source, then free the source.

```gdscript
const SPARKS := preload("res://fx/spark_burst.tscn")

func explode() -> void:
	var fx := SPARKS.instantiate() as GPUParticles2D
	fx.global_position = global_position
	get_parent().add_child(fx)
	fx.emitting = true
	queue_free()
```

## Burst emitter
Put this on a GPUParticles3D that has a ParticleProcessMaterial. It frees itself from `finished`, not from a timer.

```gdscript
extends GPUParticles3D
class_name BurstEmitter

signal burst_done

func _ready() -> void:
	emitting = false
	finished.connect(_finish)

func _finish() -> void:
	burst_done.emit()
	queue_free()

func burst(at: Vector3, count: int = 24) -> void:
	one_shot = true
	amount = count
	global_position = at
	emitting = true

func burst_toward(at: Vector3, heading: Vector3, slow: float, fast: float, count: int = 24) -> void:
	var pm := process_material as ParticleProcessMaterial
	if pm == null:
		push_error("BurstEmitter needs a ParticleProcessMaterial")
		return
	pm.direction = heading
	pm.initial_velocity_min = slow
	pm.initial_velocity_max = fast
	burst(at, count)

static func create(scene: PackedScene, parent: Node, at: Vector3) -> BurstEmitter:
	var node := scene.instantiate()
	var emitter := node as BurstEmitter
	if emitter == null:
		push_error("Scene root is not a BurstEmitter")
		node.queue_free()
		return null
	parent.add_child(emitter)
	emitter.burst(at)
	return emitter
```

## One-shot recycler
```gdscript
extends GPUParticles2D

func _ready() -> void:
	emitting = false
	one_shot = true
	finished.connect(queue_free)   # or hand back to a pool instead

func play_again() -> void:
	restart()
```

## Physics body trail fix (2D)
```gdscript
static func fix_trail(p: Node) -> void:
	if p is CPUParticles2D:
		p.fract_delta = true
		p.physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	else:
		push_warning("Use CPUParticles2D for trails on physics bodies, got " + p.get_class())
```

## World versus local space, safe teleport
```gdscript
func set_trail(p: GPUParticles3D, is_trail: bool) -> void:
	p.local_coords = not is_trail

func safe_teleport(p: GPUParticles3D, to: Vector3) -> void:
	p.emitting = false
	p.global_position = to
	p.restart()
	p.emitting = true
```

## Runtime shader value
```gdscript
func set_intensity(p: GPUParticles3D, v: float) -> void:
	var m := p.process_material as ShaderMaterial
	if m == null:
		return
	m.set_shader_parameter("intensity", v)
```
The shader declares `intensity` as a uniform; see `shaders.md`.

## Gradient fade
```gdscript
func make_ramp() -> GradientTexture1D:
	var g := Gradient.new()
	g.colors = PackedColorArray([Color(1.0, 0.9, 0.4, 1.0), Color(1.0, 0.4, 0.1, 0.8), Color(0.2, 0.2, 0.2, 0.0)])
	g.offsets = PackedFloat32Array([0.0, 0.4, 1.0])
	var t := GradientTexture1D.new()
	t.gradient = g
	return t
```
Assign the result to `ParticleProcessMaterial.color_ramp`.
