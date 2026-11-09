# Screen, depth, fog, compute and tooling patterns

## Full-screen quad (Godot 4.3 and later)

Godot 4.3 uses reversed-Z. Put a QuadMesh (flipped faces, large extra cull margin) in front of the camera. Use `unshaded` and `skip_vertex_transform`. Set `POSITION` from the vertex xy with depth one and w one. Do not use the old w-based depth, which clips at the near plane.

```glsl
shader_type spatial;
render_mode unshaded, fog_disabled, skip_vertex_transform;
void vertex() {
    POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}
void fragment() {
    ALBEDO = vec3(SCREEN_UV, 0.0); // placeholder: post-process goes here
}
```

## Hex pixelate (post-process, canvas_item)

Read the screen through `hint_screen_texture` with `repeat_disable` and `filter_nearest`. Quantize screen UV into hex cells using a size uniform times the screen pixel size. Offset alternate rows by half a cell, adjust the centre for the triangular corner regions, and sample with `textureLod` at level zero.

```glsl
shader_type canvas_item;
uniform sampler2D screen_tex : hint_screen_texture, repeat_disable, filter_nearest;
uniform float cell : hint_range(2.0, 64.0) = 12.0;
void fragment() {
    vec2 size = cell * SCREEN_PIXEL_SIZE;
    vec2 g = vec2(size.x, size.y * 1.5);
    vec2 p = SCREEN_UV / g;
    float row = floor(p.y);
    p.x += mod(row, 2.0) * 0.5;       // offset alternate rows
    vec2 centre = (vec2(floor(p.x) + 0.5, row + 0.5)) * g;
    centre.x -= mod(row, 2.0) * 0.5 * g.x;
    // For exact hex corners, compare against the neighbour cell centres
    // in the triangular regions and pick the nearer one.
    COLOR = textureLod(screen_tex, centre, 0.0);
}
```

This sketch snaps to offset rectangular cells; the corner adjustment is the part to refine for true hexagons.

## Depth to world height

Sample the depth texture with `textureLod` level zero. Build NDC from screen UV and depth, multiply by `INV_PROJECTION_MATRIX` then `INV_VIEW_MATRIX`, divide by w, and use world Y for visualisation. With reversed-Z, use the raw depth value directly in the NDC. Useful for water depth and fog effects.

```glsl
shader_type spatial;
render_mode unshaded, fog_disabled;
uniform sampler2D depth_tex : hint_depth_texture, filter_nearest;
void fragment() {
    float depth = textureLod(depth_tex, SCREEN_UV, 0.0).r;
    vec3 ndc = vec3(SCREEN_UV * 2.0 - 1.0, depth);
    vec4 view = INV_PROJECTION_MATRIX * vec4(ndc, 1.0);
    view.xyz /= view.w;
    vec4 world = INV_VIEW_MATRIX * vec4(view.xyz, 1.0);
    ALBEDO = vec3(fract(world.y * 0.1));
}
```

## Debug visualiser

An unshaded, `fog_disabled` spatial shader on a full-screen quad switches by an integer uniform between depth, normals and UVs. Depth is made linear through the inverse projection matrix and divided by a view range. Normals from `hint_normal_roughness_texture` are remapped from 0 to 1 into signed values, and back for display.

```glsl
shader_type spatial;
render_mode unshaded, fog_disabled, skip_vertex_transform;
uniform int mode = 0;
uniform float view_range = 50.0;
uniform sampler2D depth_tex : hint_depth_texture;
uniform sampler2D nr_tex : hint_normal_roughness_texture;
void vertex() { POSITION = vec4(VERTEX.xy, 1.0, 1.0); }
void fragment() {
    if (mode == 0) {
        float d = textureLod(depth_tex, SCREEN_UV, 0.0).r;
        vec4 v = INV_PROJECTION_MATRIX * vec4(SCREEN_UV * 2.0 - 1.0, d, 1.0);
        ALBEDO = vec3(-(v.z / v.w) / view_range);
    } else if (mode == 1) {
        vec3 n = textureLod(nr_tex, SCREEN_UV, 0.0).xyz * 2.0 - 1.0;
        ALBEDO = n * 0.5 + 0.5;
    } else {
        ALBEDO = vec3(SCREEN_UV, 0.0);
    }
}
```

A branch on a uniform is acceptable in a debug tool; keep it out of shipped hot shaders.

## Fog shader

Type `fog`. Use the signed distance of the fog volume (`SDF`), clamped and squared, to fade density at the edges. Output `DENSITY` and `ALBEDO` into the volumetric buffer. Expose density and edge colour. Good for cave mist and clouds that react to lighting. Needs a FogVolume node and volumetric fog enabled in the environment.

```glsl
shader_type fog;
uniform float density = 1.0;
uniform vec4 edge_color : source_color = vec4(0.6, 0.7, 0.9, 1.0);
void fog() {
    float fade = clamp(-SDF, 0.0, 1.0);
    DENSITY = density * fade * fade;
    ALBEDO = edge_color.rgb;
}
```

## Compute particles (GDScript, local rendering device)

Steps: create a local rendering device, load a compiled GLSL shader file (`.glsl` imported as an RDShaderFile), build the SPIR-V shader, create a storage buffer sized from a PackedFloat32Array, bind it in a uniform set, create a compute pipeline, then begin a compute list, bind pipeline and uniform set, dispatch workgroups, end the list. Used for large GPU simulations such as swarms or fluids. The dispatch below is simplified: it shows no submit, sync or readback.

```gdscript
func run_compute(positions: PackedFloat32Array) -> void:
    var rd: RenderingDevice = RenderingServer.create_local_rendering_device()
    var file: RDShaderFile = load("res://swarm.glsl")
    var shader: RID = rd.shader_create_from_spirv(file.get_spirv())
    var bytes: PackedByteArray = positions.to_byte_array()
    var buffer: RID = rd.storage_buffer_create(bytes.size(), bytes)
    var u := RDUniform.new()
    u.uniform_type = RenderingDevice.UNIFORM_TYPE_STORAGE_BUFFER
    u.binding = 0
    u.add_id(buffer)
    var set_rid: RID = rd.uniform_set_create([u], shader, 0)
    var pipeline: RID = rd.compute_pipeline_create(shader)
    var list: int = rd.compute_list_begin()
    rd.compute_list_bind_compute_pipeline(list, pipeline)
    rd.compute_list_bind_uniform_set(list, set_rid, 0)
    rd.compute_list_dispatch(list, 64, 1, 1)
    rd.compute_list_end()
    # Real use also needs rd.submit(), rd.sync() and buffer_get_data().
```

## Custom Visual Shader node

A script marked `@tool` that extends `VisualShaderNodeCustom` and gives `class_name`. It overrides `_get_name`, `_get_category`, `_get_return_icon_type`, `_get_input_port_count`, `_get_input_port_name`, `_get_input_port_type`, `_get_output_port_count`, `_get_output_port_name`, `_get_output_port_type`, and `_get_code`, which returns a shader code string built from the provided variable arrays. Port type constants live on `VisualShaderNode`, for example `VisualShaderNode.PORT_TYPE_SCALAR`. Mode checks use `Shader.Mode`.

```gdscript
@tool
class_name VisualShaderNodeDoubler
extends VisualShaderNodeCustom

func _get_name() -> String: return "Doubler"
func _get_category() -> String: return "Custom"
func _get_return_icon_type() -> VisualShaderNode.PortType:
    return VisualShaderNode.PORT_TYPE_SCALAR
func _get_input_port_count() -> int: return 1
func _get_input_port_name(port: int) -> String: return "value"
func _get_input_port_type(port: int) -> VisualShaderNode.PortType:
    return VisualShaderNode.PORT_TYPE_SCALAR
func _get_output_port_count() -> int: return 1
func _get_output_port_name(port: int) -> String: return "result"
func _get_output_port_type(port: int) -> VisualShaderNode.PortType:
    return VisualShaderNode.PORT_TYPE_SCALAR
func _get_code(input_vars: Array[String], output_vars: Array[String],
        mode: Shader.Mode, type: VisualShader.Type) -> String:
    return output_vars[0] + " = " + input_vars[0] + " * 2.0;"
```

## Warm-up against first-use stutter

During a loading screen, instantiate each scene that will appear, place it in front of the camera, await one drawn frame, then free it. This makes the shaders compile before play.

```gdscript
func warm_up(scenes: Array[PackedScene]) -> void:
    for ps: PackedScene in scenes:
        var inst: Node = ps.instantiate()
        add_child(inst)
        await RenderingServer.frame_post_draw
        inst.queue_free()
```

For 3D scenes also position the instance in view of the camera, as only visible objects are drawn.
