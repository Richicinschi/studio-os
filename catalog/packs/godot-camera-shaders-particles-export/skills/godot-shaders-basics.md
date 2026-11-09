---
id: godot-shaders-basics
title: Godot 4 shader basics
description: Godot 4 shaders (shader language, GLSL-like): canvas_item, spatial, fog, vertex, fragment, uniform and uniforms, built-in variables (UV, COLOR, ALBEDO), post-processing, visual effects, material customization, custom effects, stylized rendering, performance.
requires: [Godot]
---

## When to use

Typical wordings: "write a shader for my ship sprite", "make the asteroid dissolve", "add a vignette", "stylized cel lighting", "why is my shader slow", "my shader stutters the first time it shows", "animate a shader parameter from code".

This is polish and juice craft for a game that already exists, not a blueprint for a new project. Target Godot 4.x.

Neighbours in this pack: cameras, particle systems, tweening, export builds and project audits live in the other skills of the pack; come back here when the question is about shader code, materials or a shader parameter.

Reference files, open the one you need:
- `godot-shaders-basics/rules.md`: pitfalls and recommendations, the built-in lookup, uniform forms.
- `godot-shaders-basics/patterns-2d.md`: canvas_item patterns and the editor workflow.
- `godot-shaders-basics/patterns-3d.md`: spatial patterns, templates, terrain, wind, triplanar.
- `godot-shaders-basics/patterns-screen-and-gpu.md`: post-process, fog, depth, compute, custom visual shader nodes, warm-up.
- `godot-shaders-basics/animator.md`: a script helper that animates shader parameters.

## How it works

1. Pick the shader type from the goal. `canvas_item` is for 2D and UI, `spatial` for 3D, `fog` for volumetric fog volumes. Other types such as particles and sky exist but this skill does not use them. The file extension is `.gdshader`.
2. Apply a 2D shader in the editor: select the Sprite2D, give it a new ShaderMaterial, give that material a new Shader, then paste the code. Apply a 3D shader the same way on a mesh material.
3. Write the stage functions you need: `vertex()`, `fragment()`, `light()`, and `fog()` for fog shaders. Start from a small pattern in the reference files and change one thing at a time.
4. Expose every tweakable number as a uniform instead of a literal. Use hints so the inspector shows the right widget: `hint_range` for sliders, `source_color` for colours, a sampler2D for textures. Group related uniforms with `group_uniforms`.
5. Set uniforms from script with `ShaderMaterial.set_shader_parameter("name", value)`, by parameter name. For animation over time, use the helper in `animator.md` rather than a custom tween per effect.
6. When one value must differ per object (a flash, a tint) across many objects, use an `instance uniform`, not duplicated materials. When one value is shared by the whole world (a player position), use a `global uniform` and set it project-wide through the RenderingServer.
7. Check the pitfalls in `rules.md` before calling the shader finished, especially discard, branching, float equality, colour hints and UV ranges.
8. Keep a short comment at the top of each shader saying what the effect is and how it works.
9. Official reading for more depth: the Shading Language reference and the Your First Shader (2D) tutorial on docs.godotengine.org.

## Checks before done

- The shader compiles with no errors in the editor and the effect is visible on the target node.
- Colour uniforms carry `source_color`; ranged values carry `hint_range`.
- No unconditional discard used as a speed trick, no exact float equality, no runtime toggles built from preprocessor defines.
- If the target is Godot 4.3 or later and the shader draws a full-screen quad, it uses the reversed-Z form of POSITION from `patterns-screen-and-gpu.md`.
- First-use compile stutter was considered (warm-up) if the effect appears mid-game.
- Ask before uploading or publishing anything; never put keys or secrets in the repo; write all text in English.

## Without local tools

Without the Godot editor, give the person the full `.gdshader` code in a code block plus the steps to run: select the node, add a ShaderMaterial and a Shader, paste, then set the uniforms in the inspector or with `set_shader_parameter`. Say plainly that the shader was not compiled here, and ask them to paste back any compile error text so you can fix it.
