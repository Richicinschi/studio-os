---
id: godot-particles
title: Godot particle effects
description: "GPU particle systems in Godot 4: GPUParticles2D, GPUParticles3D, ParticleProcessMaterial, emission_shape, color_ramp, one_shot, gradients, sub-emitters, sub_emitter, custom shaders. For creating VFX: explosions, magic effects, weather, trails, environmental effects, visual feedback."
requires: [Godot]
---

# Godot particle effects

## When to use
- "Add a hit spark", "make the cauldron bubble", "rain over the whole map", "a comet tail behind the missile", "dust when the crate lands".
- Polish work on a game that already runs: impacts, deaths, pickups, ambient fire. Not for designing a game from nothing.
- Neighbours in this pack: camera shake and framing go to the camera skill; a full-screen or mesh surface shader goes to the shader skill; tweens and animation go to the animation skill; exporting builds goes to the export skill. This skill takes over when the thing on screen is made of many small particles, including a particles-type shader.

## How it works

### 1. Pick the node
1. On desktop use GPUParticles2D or GPUParticles3D.
2. Use CPUParticles2D only for low-end mobile or web targets without GPU support, or when a 2D effect must follow a physics body smoothly (section 6).
3. As a rule of thumb (a starting point, not a measured limit), do not use CPU particles above a few hundred particles, unless the target is low-end mobile or web without a modern graphics API.
4. For millions of things (fish, insects) skip particles and use a MultiMesh (see `godot-particles/scale-and-lod.md`).

### 2. Basic setup order
1. Add the particle node.
2. Set `amount` and `lifetime`.
3. Set `one_shot` for bursts.
4. Create a ParticleProcessMaterial.
5. On the material set `emission_shape` and its size, `gravity`, the `initial_velocity_min` and `initial_velocity_max` range, and `color`.
6. Assign the material to the node's `process_material`.
7. Give particles a real shape instead of plain quads: set `texture` on GPUParticles2D; on GPUParticles3D put the texture on the material of the draw pass mesh.

Emission shapes: never use EMISSION_SHAPE_POINT for volumetric 3D effects such as explosions, because it looks flat. Use EMISSION_SHAPE_SPHERE (with `emission_sphere_radius`) or EMISSION_SHAPE_BOX (with `emission_box_extents`) for natural spread.

### 3. Recipes (starting points, tune by eye)
- Plasma burst: `one_shot` on, moderate `amount`, short `lifetime`, `explosiveness` near 1, sphere emission, wide velocity range, gravity pointing down, `scale_min` and `scale_max` around 1, then emit.
- Chimney smoke: low `amount`, long `lifetime`, `direction` up, modest velocity range, grey semi-transparent `color`, a scale range.
- Firefly sparkle: box emission across a wide area, zero `gravity`, `angular_velocity_min` negative and `angular_velocity_max` positive, small scale range, a star `texture`.
- 3D ambient dust: larger `amount`, lifetime of several seconds, flat wide box emission, `direction` up, low speed range, gravity matching the real world.
- Layered look (fire plus smoke in one system): chain draw materials with the `next_pass` property of the material on the draw pass.

### 4. Colour over life
1. Build a Gradient with a start colour, a mid colour and an end point at 1.0 that must be fully transparent. Never leave the alpha out: without it particles vanish abruptly instead of fading.
2. Wrap it in a GradientTexture1D.
3. Assign that texture to the material's `color_ramp`.

### 5. Lifecycle
1. Always start spawn-on-demand and one-shot effects with `emitting` off, so nothing shows at the scene origin before your script has positioned the node.
2. Free a one-shot effect from its `finished` signal and `queue_free()`. Never from a timer: a timer can free too early or too late.
3. To reuse a finished one-shot, call `restart()`. Do not set `emitting = true` right after `finished`: GPU state is asynchronous and the plain re-enable can silently fail.
4. Spawn on demand: `preload` the effect scene, `instantiate()` it, `add_child` it to the parent (not to a node that is about to be freed), set its `global_position` to the source's, start emission, then free the source.
5. Pool for frequent effects: pre-instantiate a fixed set, keep them non-emitting, return each to the pool when its `finished` fires, take one on spawn, place it, call `restart()`. If the pool is empty, do nothing.
6. Never set `preprocess` very high. The GPU simulates all those frames in one tick and may crash. Use a modest warm-up for ambient effects.

Code for a burst node, a recycler and a pool is in `godot-particles/patterns.md`.

### 6. Space, trails and physics bodies
1. Never use `local_coords` for trails; trails must be in world space. For smoke behind a moving missile, set `local_coords` to false, because in local space the trail rigidly follows the emitter. Auras and other localised effects use local space.
2. To teleport an emitter that uses world space: stop emission, move it, call `restart()`, then resume emission. This avoids a streak across the jump.
3. Reported for Godot 4.3: 2D GPU particles stutter when parented to a body moved by physics. The fix used here is CPUParticles2D with `fract_delta` on (its default) and `physics_interpolation_mode` set to PHYSICS_INTERPOLATION_MODE_ON (the node default is off). Check the vendor's current documentation on physics interpolation, since later versions may change this.
4. A helper that applies this fix must warn (not fail) when handed a GPUParticles2D, and must never silently accept it. The helper is in `godot-particles/patterns.md`.

### 7. Sub-emitters and impacts
1. Chained effects (firework shells): put the child system's path (use `get_path_to`) in the parent's `sub_emitter`, and pick `sub_emitter_mode` on the parent's ParticleProcessMaterial, for example SUB_EMITTER_AT_END or SUB_EMITTER_AT_COLLISION.
2. Never make a system its own sub-emitter. A self-reference fails silently.
3. GPU particles send no per-collision events to scripts. For sparks or dust on contact: make the impact system the sub-emitter, set `collision_mode` to COLLISION_RIGID on the material, use SUB_EMITTER_AT_COLLISION, and set `sub_emitter_amount_at_collision` to the number spawned per impact.
4. Scripts cannot hear single GPU collisions, so cover impact audio with a looping impact sound whose pitch and start offset are randomised, played while the emitter runs. When each hit must sound on time, switch to CPU particles and detect hits with ray casts.

### 8. Custom particles shaders
Use these when the standard material cannot do the job (fluids, swarms, orbits). Details and a full example are in `godot-particles/shaders.md`.
1. Write `shader_type particles;` with `render_mode keep_data;` so data survives frames.
2. In `start()`, initialise position and custom state only when `RESTART` is true.
3. In `process()`, apply forces each step. On collision, reflect and damp velocity and push the particle out along `COLLISION_NORMAL` by `COLLISION_DEPTH`.
4. Store per-particle random phase and speed in `CUSTOM` at start, then drive orbit or spiral motion in `process()` at no CPU cost.
5. Pass runtime values (wind, intensity) as shader `uniform`s set with `set_shader_parameter` on the ShaderMaterial, so emitters share one material. USERDATA1 to USERDATA6 are read-only inputs inside the shader and are not set that way; check the vendor's current particle shader reference before relying on them.
6. Impact splashes: when `COLLIDED`, call `emit_subparticle(xform, velocity, color, custom, flags)` with a transform whose origin is nudged along the normal, a reduced reflected velocity and the flags FLAG_EMIT_POSITION and FLAG_EMIT_VELOCITY, then set `ACTIVE = false`. It only works if the system has a sub-emitter assigned.
7. A manager script can assign the ShaderMaterial, feed a black-and-white emission mask texture as a shader parameter, and switch emission and processing off when the effect is not visible.

### 9. Performance and platforms
1. To change cost at runtime, change `amount` (this restarts the system, so do it between effects). Never use `amount_ratio` as the performance dial: the full `amount` stays allocated and processed, so it saves no memory or processing; it is only for varying the emitted count while running.
2. Always set the visibility bounds on large systems, preferably generated with the editor toolbar: `visibility_rect` on GPUParticles2D, `visibility_aabb` on GPUParticles3D (the AABB property exists only in 3D). Wrong bounds make particles pop out under frustum culling and break distance LOD.
3. Turbulence evaluates 3D noise per particle and is expensive. Never enable it on mobile or web without testing it there first, and switch it off on weak platforms using feature tags (`OS.get_name()` returns "Android" on Android).
4. On mobile, halving `amount` is a simple first scaling step (a starting point; compare frame time before and after on your own device).
5. Attractors: set the attractor's `cull_mask` and the system's `layers` to one shared layer bit and enable `attractor_interaction_enabled` on the material, so global particles do not test against every attractor.
6. Weather over a big world: a GPUParticlesCollisionHeightField3D with `follow_camera_enabled`, `update_mode` UPDATE_MODE_WHEN_MOVED and a `resolution` kept as low as the look allows (RESOLUTION_1024 is the default; higher values capture small details in large scenes but cost performance, up to RESOLUTION_8192; lowering it offsets the cost of following the camera).
7. Distance LOD for torches and fires: `visibility_range_begin` 0, `visibility_range_end` at the maximum distance, `visibility_range_end_margin` about a tenth of that (a starting point, tune it), and `visibility_range_fade_mode` VISIBILITY_RANGE_FADE_SELF. Systems past the end distance are hidden; confirm in the profiler that they also stop costing time on your version.
8. Off-screen VFX should not run: turn emission and processing off when not visible.

More on these in `godot-particles/scale-and-lod.md`.

### 10. Where to read more
The Godot manual section on particle systems (3D and 2D) at docs.godotengine.org is the reference to cite.

## Checks before done
- Node type matches the target platform; no CPU particles above a few hundred without a reason.
- One-shots start with emission off and are freed or recycled from `finished`, never from a timer.
- `restart()` is used for reuse, not `emitting = true`.
- Gradients end transparent; visibility bounds are set (`visibility_rect` in 2D, `visibility_aabb` in 3D); `preprocess` is modest.
- Trails use world space; no self-referencing sub-emitter.
- Turbulence tested or tiered on mobile and web.
- Run the scene and look at it in motion on the weakest target device you have.
- Studio rules: ask before any upload or publish; no keys or secrets in the repo; English only.

## Without local tools
Without Godot installed you cannot see the effect. In claude.ai, ask for the full GDScript and `.gdshader` text as pasted code plus numbered editor steps: create the node, assign the material, attach the script. Then paste the result or a screenshot back, and adjust values from what you see. Property names may differ slightly between 4.x versions, so confirm in the inspector.
