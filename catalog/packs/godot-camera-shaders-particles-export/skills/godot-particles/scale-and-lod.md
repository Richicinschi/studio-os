# Scaling and level of detail

## Multimesh for huge counts
For fish, insects and similar very large crowds (a rough guideline, not a measured threshold; switch when particle nodes become too slow on your target), use a MultiMeshInstance3D with a MultiMesh instead of particle nodes.

```gdscript
extends MultiMeshInstance3D

func _ready() -> void:
	multimesh.physics_interpolation_quality = MultiMesh.INTERP_QUALITY_FAST

func submit(current: PackedFloat32Array, previous: PackedFloat32Array) -> void:
	multimesh.set_buffer_interpolated(current, previous)
```
Always submit both the current and the previous buffers each physics tick, so movement is smooth between ticks. The constants are `INTERP_QUALITY_FAST` and `INTERP_QUALITY_HIGH`; fast uses linear rotation blending, which can warp.

## Attractor isolation
```gdscript
func isolate(attractor: GPUParticlesAttractorSphere3D, p: GPUParticles3D) -> void:
	attractor.cull_mask = 1 << 4
	p.layers = 1 << 4
	var m := p.process_material as ParticleProcessMaterial
	if m:
		m.attractor_interaction_enabled = true
```
One shared layer bit means only matching systems test against that attractor.

## Weather height-field
```gdscript
extends GPUParticlesCollisionHeightField3D

func _ready() -> void:
	follow_camera_enabled = true
	update_mode = UPDATE_MODE_WHEN_MOVED
	resolution = RESOLUTION_2048   # the default is RESOLUTION_1024; raise only if small details are lost in a large scene
```
The node follows the active camera and rebuilds only when it or the camera moves. A higher resolution captures small details in large scenes more accurately but costs performance: 1024 is the default and 8192 the largest. Pick the lowest that still looks right, and lower it if following the camera is costly. Rain or snow particles collide with the height it records.

## Distance LOD
```gdscript
func set_lod(g: GeometryInstance3D, far: float) -> void:
	g.visibility_range_begin = 0.0
	g.visibility_range_end = far
	g.visibility_range_end_margin = far * 0.1
	g.visibility_range_fade_mode = GeometryInstance3D.VISIBILITY_RANGE_FADE_SELF
```
Systems beyond the end distance are hidden; confirm in the profiler how much this saves on your version.

## Platform tiers
Check `OS.get_name() == "Android"` or use feature tags (for example `OS.has_feature("mobile")` and `OS.has_feature("web")`) to halve `amount` and to switch off turbulence on weak targets. Confirm the exact tag names in the export docs for your version.
