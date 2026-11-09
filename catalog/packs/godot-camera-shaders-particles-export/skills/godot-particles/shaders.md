# Custom particles shaders

A particles shader replaces the ParticleProcessMaterial. Create a ShaderMaterial, give it a `.gdshader` with `shader_type particles;`, and assign it as `process_material`. Reference: the shading language page for particle shaders at docs.godotengine.org.

## Orbit and wind example
Per-particle random phase and speed are stored in `CUSTOM` at start. Each step adds an orbit-like push plus a wind push read from a uniform.

```glsl
shader_type particles;
render_mode keep_data, disable_velocity;

// The particle shader has no random helper built in, so hash the seed ourselves.
float hash01(uint x) {
	x = (x ^ 61u) ^ (x >> 16u);
	x *= 9u;
	x = x ^ (x >> 4u);
	x *= 0x27d4eb2du;
	x = x ^ (x >> 15u);
	return float(x) / 4294967295.0;
}

uniform float orbit_strength = 2.0;
uniform vec3 wind = vec3(0.0);

void start() {
	if (RESTART) {
		CUSTOM.x = hash01(RANDOM_SEED) * 6.28318;            // phase
		CUSTOM.y = 0.5 + hash01(RANDOM_SEED ^ 0x9e3779b9u);  // speed scale
		TRANSFORM[3].xyz = EMISSION_TRANSFORM[3].xyz;
		VELOCITY = vec3(0.0);
	}
}

void process() {
	float t = TIME * CUSTOM.y + CUSTOM.x;
	vec3 orbit = vec3(cos(t), 0.0, sin(t)) * orbit_strength;
	VELOCITY += (orbit + wind) * DELTA;
	TRANSFORM[3].xyz += VELOCITY * DELTA;
}
```

Notes:
- `disable_velocity` makes the engine ignore `VELOCITY`, so the manual position step in `process()` is the only movement. Without it the particle would move twice.
- `keep_data` makes the buffer survive between frames, so position and state persist.
- Initialise only inside `if (RESTART)`, or the particle resets every frame.
- This shader never touches CPU-side state; everything is computed on the GPU.

## Setting runtime values
Declare each value as a `uniform` (like `wind` above) and set it from a script with `set_shader_parameter` (see `patterns.md`). A uniform lives on the material, so every emitter using that material shares it. USERDATA1 to USERDATA6 exist as read-only inputs of the particle shader, but nothing in the shader reference says a script writes them; check the vendor's current documentation before using them.

## Collision response
In `process()`, when `COLLIDED` is true:
1. `VELOCITY = reflect(VELOCITY, COLLISION_NORMAL) * 0.6;` for a damped bounce.
2. `TRANSFORM[3].xyz += COLLISION_NORMAL * COLLISION_DEPTH;` to push the particle out of the surface.

For fluid or swarm effects, combine this with forces applied every step. A collision node in the scene is needed for `COLLIDED` to be set.

## Splash on impact
```glsl
void process() {
	if (COLLIDED) {
		mat4 xf = mat4(1.0);
		xf[3].xyz = TRANSFORM[3].xyz + COLLISION_NORMAL * 0.02; // nudge off the surface, tunable
		vec3 v = reflect(VELOCITY, COLLISION_NORMAL) * 0.3;
		emit_subparticle(xf, v, vec4(1.0), vec4(0.0), FLAG_EMIT_POSITION | FLAG_EMIT_VELOCITY);
		ACTIVE = false;
	}
}
```
The signature is `emit_subparticle(mat4 xform, vec3 velocity, vec4 color, vec4 custom, uint flags)`; the position comes from the transform's origin. Check the shader reference for your build. It does nothing unless the particle system has a `sub_emitter` assigned.

## Manager script
```gdscript
extends GPUParticles3D

@export var mask: Texture2D

func _ready() -> void:
	var m := process_material as ShaderMaterial
	if m and mask:
		m.set_shader_parameter("emission_mask", mask)

func _on_visibility(visible_now: bool) -> void:
	emitting = visible_now
	speed_scale = 1.0 if visible_now else 0.0
```
Connect with `screen_entered.connect(_on_visibility.bind(true))` and `screen_exited.connect(_on_visibility.bind(false))` on a VisibleOnScreenNotifier3D, since those signals carry no arguments. `set_process` does not pause a GPU simulation; `emitting` and `speed_scale` do. The mask is a black-and-white texture (for example a `.png`) that the shader samples to decide where particles may spawn. Use your own project path for it.
