# spatial patterns

Examples use a racing game: a track, banked hills, roadside grass, a boost pad, a car body.

## Basic

```glsl
shader_type spatial;
void fragment() {
    ALBEDO = vec3(0.1, 0.5, 0.9);
}
```

## Toon (cel) lighting

In the `light()` stage take the dot of `NORMAL` and `LIGHT`, quantize it to a uniform number of steps, and multiply by a base colour to drive `DIFFUSE_LIGHT`.

```glsl
shader_type spatial;
uniform vec4 base : source_color = vec4(0.9, 0.3, 0.2, 1.0);
uniform float steps = 4.0;
void light() {
    float d = max(dot(NORMAL, LIGHT), 0.0);
    d = floor(d * steps) / steps;
    DIFFUSE_LIGHT += d * base.rgb;
}
```

## General effect template

Render modes `blend_mix, depth_draw_opaque, cull_disabled`. It pans UVs by time, mixes a base colour with emission energy, groups its uniforms, dissolves by noise with an emissive edge, and writes an alpha.

```glsl
shader_type spatial;
render_mode blend_mix, depth_draw_opaque, cull_disabled;

group_uniforms surface;
uniform vec4 albedo : source_color = vec4(1.0);
uniform sampler2D albedo_tex : source_color, hint_default_white;
uniform float emission_energy = 1.5;
uniform vec2 pan_speed = vec2(0.1, 0.0);
uniform float pan_scale = 1.0;
group_uniforms dissolve;
uniform sampler2D noise_tex;
uniform float dissolve : hint_range(0.0, 1.0) = 0.0;
uniform float edge_width : hint_range(0.0, 0.3) = 0.05;
uniform vec4 edge_color : source_color = vec4(1.0, 0.5, 0.1, 1.0);
group_uniforms;
uniform float fade_distance = 0.5; // declared only, see note

void fragment() {
    vec2 uv = UV * pan_scale + pan_speed * TIME;
    vec4 tex = texture(albedo_tex, uv) * albedo;
    float n = texture(noise_tex, uv).r;
    float edge = step(dissolve, n) - step(dissolve + edge_width, n);
    ALBEDO = mix(tex.rgb, edge_color.rgb, edge);
    EMISSION = tex.rgb * emission_energy + edge_color.rgb * edge * 2.0;
    ALPHA = tex.a * step(dissolve, n);
    // Proximity fade is NOT a built-in keyword here. It must be hand-built
    // from the depth texture. StandardMaterial3D has it natively.
}
```

Do not describe `fade_distance` as working; it is only a placeholder.

## Dissolve with alpha scissor

Alpha is noise minus a dissolve amount. Set `ALPHA_SCISSOR_THRESHOLD` small, build an edge mask with `step`, blend albedo toward an edge colour and add emission there. No `discard`, so the depth pre-pass and shadows still work.

```glsl
shader_type spatial;
uniform sampler2D noise_tex;
uniform float dissolve : hint_range(0.0, 1.0) = 0.0;
uniform vec4 edge_color : source_color = vec4(0.3, 1.0, 0.8, 1.0);
uniform float edge_thickness = 0.06;
void fragment() {
    float n = texture(noise_tex, UV).r;
    ALPHA = n - dissolve;
    ALPHA_SCISSOR_THRESHOLD = 0.01;
    float edge = step(ALPHA, edge_thickness) * step(0.0, ALPHA);
    ALBEDO = mix(vec3(0.7), edge_color.rgb, edge);
    EMISSION = edge_color.rgb * edge * 3.0;
}
```

## Hit flash (instance uniform)

```glsl
shader_type spatial;
instance uniform float flash : hint_range(0.0, 1.0) = 0.0;
uniform vec4 flash_tint : source_color = vec4(1.0);
uniform vec4 base : source_color = vec4(0.5);
void fragment() {
    ALBEDO = mix(base.rgb, flash_tint.rgb, flash);
    EMISSION = flash_tint.rgb * flash * 0.3;
}
```

Set per node with `set_instance_shader_parameter("flash", 1.0)` on the GeometryInstance3D.

## Noise terrain displacement

Derive a world XZ UV from the model matrix times the vertex, scaled down. Sample a height map, pass height in a varying, raise vertex y by height times a scale uniform. In fragment colour by a `step` on height.

```glsl
shader_type spatial;
uniform sampler2D height_map;
uniform float height_scale = 4.0;
varying float h;
void vertex() {
    vec2 uv = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xz * 0.02;
    h = texture(height_map, uv).r;
    VERTEX.y += h * height_scale;
}
void fragment() {
    ALBEDO = mix(vec3(0.2, 0.5, 0.2), vec3(0.95), step(0.7, h));
}
```

## Foliage wind

Render modes `depth_prepass_alpha` and `world_vertex_coords`. Vertex colour red is the sway mask, 0 at the ground and 1 at the tips. Offset x and z with sine and cosine of time times speed plus position terms, at different frequencies so the motion looks organic.

```glsl
shader_type spatial;
render_mode depth_prepass_alpha, world_vertex_coords;
uniform float speed = 1.5;
uniform float strength = 0.3;
void vertex() {
    float mask = COLOR.r;
    VERTEX.x += sin(TIME * speed + VERTEX.x * 0.7) * strength * mask;
    VERTEX.z += cos(TIME * speed * 1.3 + VERTEX.z * 0.5) * strength * mask;
}
```

## Global uniform grass flatten

A global vec3 holds the player position. Define it in Project Settings (Shader Globals) or at runtime with `RenderingServer.global_shader_parameter_add` and update it with `RenderingServer.global_shader_parameter_set`. Vertices within a radius are squashed toward the ground with `step` and `mix`, no branches.

```glsl
shader_type spatial;
render_mode world_vertex_coords;
global uniform vec3 player_pos;
uniform float radius = 1.5;
uniform float ground_y = 0.0;
void vertex() {
    float near = 1.0 - step(radius, distance(VERTEX.xz, player_pos.xz));
    VERTEX.y = mix(VERTEX.y, ground_y, near * COLOR.r);
}
```

## Triplanar mapping

Blend weights come from the absolute normal, normalized to sum to one. World position comes from the inverse view matrix times the view vertex. Sample the texture along the three axis planes and weight them. Good for cliffs, no UVs needed.

```glsl
shader_type spatial;
uniform sampler2D wall_tex : source_color;
varying vec3 wpos;
varying vec3 wnorm;
void vertex() {
    wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
    wnorm = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz);
}
void fragment() {
    vec3 w = abs(wnorm);
    w /= (w.x + w.y + w.z);
    vec3 c = texture(wall_tex, wpos.yz).rgb * w.x
           + texture(wall_tex, wpos.xz).rgb * w.y
           + texture(wall_tex, wpos.xy).rgb * w.z;
    ALBEDO = c;
}
```

If you need view-space data instead, rebuild world position with `INV_VIEW_MATRIX` times the view-space vertex.

## Instance texture array

A shared `sampler2DArray` plus a per-instance integer selects the layer, using UV and the index as the 3D coordinate.

```glsl
shader_type spatial;
uniform sampler2DArray layers : source_color;
instance uniform int layer_index = 0;
void fragment() {
    ALBEDO = texture(layers, vec3(UV, float(layer_index))).rgb;
}
```
