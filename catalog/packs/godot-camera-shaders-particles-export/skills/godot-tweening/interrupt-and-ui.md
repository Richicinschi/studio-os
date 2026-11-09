# Interrupting, popups, counters, staggers, floating loops

## Interrupt safely
Job: a node reacts to events (hover, hit, state switch) and must never have two tweens on one property.

```gdscript
var _active: Tween

func pulse_big() -> void:
	if _active and _active.is_valid():
		_active.kill()
	_active = create_tween().bind_node(self)
	_active.tween_property(self, "scale", Vector2(1.2, 1.2), 0.15)\
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
```

- Keep the reference in a member variable and check `is_valid()` before `kill()`.
- A death fade replacing a hurt shake follows the same rule: kill the older tween first.
- Hover on a Button: connect `mouse_entered` and `mouse_exited` to two functions that use this pattern, one to a slightly larger scale and one back to `Vector2.ONE`.

## Parallel popup
```gdscript
func open_panel(panel: Control) -> void:
	panel.pivot_offset = panel.size / 2.0
	panel.scale = Vector2.ZERO
	panel.modulate.a = 0.0
	var t: Tween = create_tween().bind_node(panel).set_parallel(true)
	t.tween_property(panel, "scale", Vector2.ONE, 0.3)\
		.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	t.tween_property(panel, "modulate:a", 1.0, 0.2)
	t.chain().tween_callback(_on_panel_open)
```
The explicit `chain()` is required. Without it the callback also starts at time zero, because parallel mode is still on.

## Number counter
Job: a value that is not a plain property (score text, shader uniform) counts up.

```gdscript
func count_to(label: Label, target: int) -> void:
	var text: String = label.text
	var digits: String = text.get_slice(" ", text.get_slice_count(" ") - 1)
	var current: int = digits.to_int() if digits.is_valid_int() else 0
	var prefix: String = text.trim_suffix(digits)
	var t: Tween = create_tween().bind_node(label)
	t.tween_method(func(v: int) -> void: label.text = prefix + str(v), current, target, 0.8)\
		.set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_OUT)
```
Parse the current number out of a prefixed label first, and guard the parse so a label without a number starts at 0. `tween_method` calls your Callable each step with the interpolated value.

## Staggered entry
```gdscript
func reveal(grid: GridContainer) -> void:
	var t: Tween = create_tween().bind_node(grid)
	for child in grid.get_children():
		if child is Control:
			child.pivot_offset = child.size / 2.0
			child.scale = Vector2.ZERO
			t.tween_property(child, "scale", Vector2.ONE, 0.2)\
				.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
```
One tween, one sequential step per child. For a softer overlap, switch to `set_parallel(true)` with a tiny `set_delay` per item, then `set_parallel(false)` to return to sequential.

## Floating loop
A cheap stand-in for an AnimationPlayer on a pickup or glow.

```gdscript
func start_bob(sprite: Sprite2D) -> void:
	var t: Tween = create_tween().bind_node(sprite).set_loops()
	t.tween_property(sprite, "position:y", -6.0, 0.9).as_relative()\
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	t.tween_property(sprite, "position:y", 6.0, 0.9).as_relative()\
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
```
`set_loops()` with no count loops forever. Every step has a real duration, so the engine does not freeze. A spinner is the same with a `rotation` step of `TAU`. Kill the loop when the node should stop.
