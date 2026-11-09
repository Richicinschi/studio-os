# canvas_item patterns

Examples use a side-scrolling space shooter: an enemy ship sprite, shield bubbles, a nebula background.

## Editor workflow

Select the Sprite2D, give it a new ShaderMaterial, give that a new Shader, paste the code. From script set values with `material.set_shader_parameter("name", value)`.

## Basic tint

Sample the texture and multiply the colour by a tint.

```glsl
shader_type canvas_item;
uniform vec4 tint : source_color = vec4(1.0, 0.6, 0.6, 1.0);
void fragment() {
    COLOR = texture(TEXTURE, UV) * tint;
}
```

## Dissolve (noise against an amount)

A noise texture (for example a NoiseTexture2D) is compared with an `amount` uniform hinted 0 to 1. Pixels whose noise is below the amount are removed. Use for a ship that disintegrates.

```glsl
shader_type canvas_item;
uniform sampler2D noise_tex;
uniform float amount : hint_range(0.0, 1.0) = 0.0;
void fragment() {
    vec4 c = texture(TEXTURE, UV);
    float n = texture(noise_tex, UV).r;
    c.a *= step(amount, n);
    COLOR = c;
}
```

## Wave distortion

Offset one UV axis by the sine of the other axis plus scaled time, with speed and amplitude uniforms. Good for heat haze, water, a wobbling shield.

```glsl
shader_type canvas_item;
uniform float speed = 2.0;
uniform float amplitude = 0.02;
void fragment() {
    vec2 uv = UV;
    uv.x += sin(uv.y * 20.0 + TIME * speed) * amplitude;
    COLOR = texture(TEXTURE, uv);
}
```

Remember the UV-range pitfall: shifted UVs can leave 0 to 1.

## Outline

Sample the four neighbouring texels (left, right, up, down). The offset is the texture pixel size times a width uniform. Take the maximum alpha among them, then mix the outline colour behind the sprite colour.

```glsl
shader_type canvas_item;
uniform vec4 line_color : source_color = vec4(1.0, 0.9, 0.2, 1.0);
uniform float width = 1.0;
void fragment() {
    vec2 px = TEXTURE_PIXEL_SIZE * width;
    float a = texture(TEXTURE, UV + vec2(px.x, 0.0)).a;
    a = max(a, texture(TEXTURE, UV - vec2(px.x, 0.0)).a);
    a = max(a, texture(TEXTURE, UV + vec2(0.0, px.y)).a);
    a = max(a, texture(TEXTURE, UV - vec2(0.0, px.y)).a);
    vec4 base = texture(TEXTURE, UV);
    COLOR = mix(vec4(line_color.rgb, a), base, base.a);
}
```

The sprite needs a transparent margin, otherwise the outline is clipped at the texture edge.

## Vignette

Darken by the distance of UV from the screen centre, scaled by a strength uniform. Put it on a full-rect ColorRect over the game.

```glsl
shader_type canvas_item;
uniform float strength : hint_range(0.0, 2.0) = 0.8;
void fragment() {
    float d = distance(UV, vec2(0.5));
    COLOR = vec4(0.0, 0.0, 0.0, clamp(d * strength, 0.0, 1.0));
}
```
