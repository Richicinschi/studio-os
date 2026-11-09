# Shader rules, built-ins and uniform forms

## Pitfalls

- Discard: do not drop pixels unconditionally as a speed trick. It defeats the early depth pass and the vertex work is still paid. If an object should not show, consider not drawing it at all.
- Branching: in hot shaders avoid if/else on changing state. Select with arithmetic blends and `step` or `smoothstep` instead.
- Float equality: never test floats for exact equality. Precision differs per device. Compare within a small tolerance or use `step`.
- Foliage: for large amounts of leaves or grass do not use ordinary alpha blending. Use alpha scissor (cut-off) or alpha hash (dithered) so the depth pre-pass and shadows work. Blending loses shadows and screen-space reflections.
- Full-screen quads on 4.3 and later: Godot 4.3 uses reversed-Z depth. Do not set the clip position with an old-style w-based depth, it clips against the near plane. See `patterns-screen-and-gpu.md` for the right form.
- Colour uniforms: always add the `source_color` hint. Without it the value is treated as linear, which gives wrong gamma and washed-out colours in the inspector.
- Defines: do not use preprocessor defines for runtime toggles. Each define makes a shader variant that compiles on first use and stutters in game. Use a uniform.
- Normals: normalize direction vectors before `reflect` and lighting maths. Unnormalized input gives artifacts and wrong lighting.
- UV shifts: when moving UVs, wrap with `fract`, set the sampler to repeat, or `clamp`. Out-of-range UVs sample edge pixels or black.

## Recommendations

- Per-object variation: use instance uniforms rather than duplicating materials. One draw call and batching survive even with thousands of nodes. They work in `spatial` and `canvas_item` shaders, cannot hold textures or arrays, and are limited to about 16 per shader; for per-object textures pass a shared texture array and select the layer with an instance integer.
- Time: multiply time-driven motion by a speed uniform, never use raw TIME alone. Gameplay states can then control the pace.
- Stage choice: move expensive maths from `fragment()` to `vertex()` and pass the result in a `varying`. Vertex code runs per point, fragment code per pixel, which runs far more often.
- Uniforms over literals: expose tweakable numbers so they can be adjusted from the inspector or code.
- Pre-compute what you can, avoid costly operations per pixel, and prefer a texture for a complex pattern.
- Comment each shader with what the effect is and how it works.

## Uniform declaration forms

```glsl
uniform float amount : hint_range(0.0, 1.0) = 0.5;   // ranged slider
uniform vec4 glow_color : source_color = vec4(0.2, 0.9, 1.0, 1.0); // colour picker
uniform sampler2D noise_tex;                           // texture
uniform sampler2DArray layers;                         // texture array
instance uniform float hit : hint_range(0.0, 1.0) = 0.0; // per object
global uniform vec3 player_pos;                        // project-wide; must also exist in Project Settings > Shader Globals
varying float height;                                  // vertex to fragment
group_uniforms look;                                   // groups what follows
uniform vec4 rim : source_color;
group_uniforms;                                        // ends the group
```

## Render modes and hints seen in these patterns

Render modes: `unshaded`, `fog_disabled`, `blend_mix`, `depth_draw_opaque`, `cull_disabled`, `depth_prepass_alpha`, `world_vertex_coords`, `skip_vertex_transform`.

Hints: `source_color`, `hint_range`, `hint_screen_texture`, `hint_depth_texture`, `hint_normal_roughness_texture`, `hint_default_white`, `filter_linear_mipmap`, `filter_nearest`, `repeat_disable`.

## Built-ins by mode

- canvas_item: `UV`, `COLOR`, `TEXTURE`, `TEXTURE_PIXEL_SIZE`, `TIME`, `SCREEN_UV`, `SCREEN_PIXEL_SIZE`.
- spatial: `ALBEDO`, `ALPHA`, `ALPHA_SCISSOR_THRESHOLD`, `EMISSION`, `NORMAL`, `ROUGHNESS`, `METALLIC`, `VERTEX`, `POSITION`, `COLOR` (the vertex colour), `LIGHT`, `DIFFUSE_LIGHT`, `MODEL_MATRIX`, `INV_VIEW_MATRIX`, `INV_PROJECTION_MATRIX`.
- fog: `SDF`, `DENSITY`, `ALBEDO`, function `fog()`.

Functions used in the patterns: `texture`, `textureLod`, `mix`, `step`, `smoothstep`, `fract`, `floor`, `clamp`, `dot`, `reflect`, `distance`, `mod`, `abs`, `pow`, `sin`, `cos`, `max`.

Exact built-in availability can vary by Godot version. If a name is rejected, check the Shading Language reference for the version in use.
