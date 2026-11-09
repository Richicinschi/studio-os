# Timelines: subtweens, paused games, cutscenes

## Nested sequences
```gdscript
func intro(ship: Node2D) -> void:
	var spin: Tween = create_tween()
	spin.tween_property(ship, "rotation", TAU, 1.0)
	var main: Tween = create_tween().bind_node(ship)
	main.tween_property(ship, "position:x", 600.0, 1.5)
	main.tween_subtween(spin)
	main.tween_property(ship, "modulate:a", 0.0, 0.5)
```
The main timeline waits for the subtween to finish. Do not call `play()` on the inner tween: the parent consumes it.

## Mini cutscene shape
One tween bound to a controller. A parallel opening block, then an explicit `chain()` to a `tween_interval`, a `tween_callback`, then more steps such as a shrink with `Tween.TRANS_BACK`, ending with a callback that frees the node. Connect `finished` if the caller must react to the end.

## Menus while the game is frozen
```gdscript
func open_menu(menu: Control) -> void:
	Engine.time_scale = 0.0
	menu.position.y = -300.0
	var t: Tween = create_tween().bind_node(menu).set_ignore_time_scale(true)
	t.tween_property(menu, "position:y", 40.0, 0.35)\
		.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)

func close_menu(menu: Control) -> void:
	Engine.time_scale = 1.0
	menu.queue_free()
```
Always restore the time scale on close. If you pause with the scene tree's `paused` flag instead, the tween also needs a pause mode that lets it run (see the Tween docs for your version).

## Fade, move, fade
`tween_property` on `modulate:a` to 0, a move step, then `modulate:a` to 1 gives a teleport with a fade. If the move is only an invisible jump, assign the position directly in a `tween_callback` rather than a zero-duration step.
