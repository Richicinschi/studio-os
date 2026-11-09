# Shader parameter animator

Animate shader parameters from code, through one shared helper, instead of a separate tween written for every effect or an AnimationPlayer per node. This keeps dynamic effects cheap.

## Helper class

A static helper that tweens a parameter on a ShaderMaterial between two values over a duration. It uses the main scene tree, so it needs no node of its own. It returns silently if the material or the scene tree is missing.

```gdscript
class_name ShaderAnimator
extends RefCounted

static func tween_float(mat: ShaderMaterial, param: StringName,
        from: float, to: float, duration: float) -> void:
    if mat == null:
        return
    var tree: SceneTree = Engine.get_main_loop() as SceneTree
    if tree == null:
        return
    var tw: Tween = tree.create_tween()
    tw.tween_method(
        func(v: float) -> void: mat.set_shader_parameter(param, v),
        from, to, duration)

static func tween_vec3(mat: ShaderMaterial, param: StringName,
        from: Vector3, to: Vector3, duration: float) -> void:
    if mat == null:
        return
    var tree: SceneTree = Engine.get_main_loop() as SceneTree
    if tree == null:
        return
    var tw: Tween = tree.create_tween()
    tw.tween_method(
        func(v: Vector3) -> void: mat.set_shader_parameter(param, v),
        from, to, duration)

# Not implemented: pulsing needs an active node to own the looping tween.
# Do not present this as working.
static func pulse(mat: ShaderMaterial, param: StringName,
        low: float, high: float, period: float) -> void:
    push_warning("ShaderAnimator.pulse is a stub")
```

## Use

```gdscript
# Fade a shield bubble in over a quarter second.
ShaderAnimator.tween_float($Shield.material, "amount", 0.0, 1.0, 0.25)
```

## Notes

- A tween made with `create_tween` on the main loop's scene tree from the main loop is not bound to a node, so it keeps running if the node is freed. Make sure the material is still valid when the callback runs, or bind a tween to a node instead when lifetime matters.
- For a one-shot flash on many objects, tween the instance uniform through `set_instance_shader_parameter` on the node, not the shared material.
- If you want a pulse, write it on a node (a looping tween with `set_loops()`), since the stub above does nothing.
