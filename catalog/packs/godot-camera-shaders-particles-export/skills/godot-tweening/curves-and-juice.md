# Curves, juice config, builder helper

## Custom curve easing
```gdscript
@export var impact_curve: Curve

func thump(sprite: Sprite2D) -> void:
	var t: Tween = create_tween().bind_node(sprite)
	var step: PropertyTweener = t.tween_property(sprite, "scale", Vector2(1.4, 1.4), 0.25)
	if impact_curve:
		step.set_custom_interpolator(func(v: float) -> float: return impact_curve.sample(v))
	t.tween_property(sprite, "scale", Vector2.ONE, 0.1)
```
The interpolator gets progress from 0 to 1 and returns the eased value. A missing curve falls back to stock easing.

Curve-weighted move: a `tween_method` step samples the curve each step and uses it as the weight of a `lerp` toward the destination. It lerps from the live position, so it is not a fixed-start path.

## Shared feel config
```gdscript
class_name JuiceStyle
extends Resource
@export var duration: float = 0.25
@export var trans: Tween.TransitionType = Tween.TRANS_QUAD
@export var ease_type: Tween.EaseType = Tween.EASE_OUT
```
Gameplay nodes read the resource when they build tweens, so feel is balanced in one place.

## UI punch
A `tween_method` step with `TRANS_ELASTIC` and `EASE_OUT` drives a shader distortion uniform. Run a scale punch in parallel, then `chain()` a return step.

## Tempo and bursts
- `set_speed_scale()` matches UI speed to game tempo.
- `set_parallel(true)` fires scale, rotation and colour as one burst.
- UI that must outlive scene changes: create the tween from an autoload node.

## Builder helper
Write it as a script of `static` functions, not a class that extends Node. Get a tween with `Engine.get_main_loop()` cast to SceneTree, then `create_tween()`. Offer:
- fade out and fade in on `modulate:a`;
- bounce scale: two half-duration steps, `TRANS_QUAD` out then `TRANS_ELASTIC` out, from the node's original scale;
- shake: random offsets in fixed short steps, then back to the origin.

Test whether a node has a property with `"scale" in node`, not a method check.

Callback chaining takes a list of tweens and a list of Callables. If lengths differ, `push_error` and return; skip invalid Callables; connect each to the matching tween's `finished`.

Play state: a tween from the factory starts by itself, so `play()` on it is redundant. A tween you paused or created stopped needs `play()`. To start a second tween when the first ends, connect `first.finished` to a function that builds the second.
