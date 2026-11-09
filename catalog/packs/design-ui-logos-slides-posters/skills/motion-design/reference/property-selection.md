# Choosing properties

What each animatable property tends to say.

## Position

| Moves | Reads as |
|---|---|
| Up | growth, improvement, aspiration |
| Down | settling, finishing, grounding |
| Left | going back, leaving |
| Right | moving forward, arriving |
| Inward | focus, convergence |
| Outward | spreading, expansion |

## Scale

| Change | Reads as |
|---|---|
| Bigger | importance, activation, closeness |
| Smaller | lower priority, distance |
| Pulsing | attention, a heartbeat, life |
| Slow breathing | presence, waiting |

## Rotation

| Amount | Reads as |
|---|---|
| 5 to 15 degrees | a subtle adjustment |
| 45 to 90 degrees | transformation |
| A full 360 | completion, processing |
| Ongoing | work in progress |

## Opacity

| Change | Reads as |
|---|---|
| Fading in | arrival, becoming enabled |
| Fading out | leaving, becoming disabled |
| Partly faded | secondary, or unavailable |

Do not use opacity alone for an important state change. Pair it with position or scale.

## Colour

| Shift | Reads as |
|---|---|
| Toward green | success, go |
| Toward red | error, stop |
| Toward blue | trust, active |
| Toward grey | disabled, inactive |
| Brighter | activated, focused |
| Dimmer | deactivated, pushed back |

## Pairs that work

| Pair | Good for |
|---|---|
| Position and opacity | content appearing or disappearing |
| Scale and opacity | cards, modals, notifications |
| Position and scale | selected or focused items |
| Rotation and scale | celebrations, playful activation |
| Position and rotation | organic transitions |
| Colour and scale | emphasising a state |

The first property carries the meaning, the second adds polish. Two is the sweet spot.

## By goal

| Goal | Lead | Support | Skip |
|---|---|---|---|
| Entrance | position | opacity | rotation |
| Exit | position | opacity | scaling up |
| Button press | scale | colour | position |
| Hover | scale or colour | opacity | position |
| Success | scale | colour and opacity | position |
| Error | position (shake) | colour | scale |
| Loading | rotation | opacity | position |
| Toggle | position | colour | rotation |
| Notification | position and scale | opacity | rotation |
| Delete | scale and opacity | position | growing |
| Selection | scale | colour, opacity | rotation |
| Progress | position or scale | colour | opacity |

## What it costs

| Property | Rendering cost |
|---|---|
| transform (translate, scale, rotate) | excellent, runs on the GPU |
| opacity | excellent, runs on the GPU |
| color, background-color | fine, causes repaint |
| clip-path | untested here; measure before relying on it |
| width, height | poor, forces layout |
| margin, padding | poor, forces layout |
| box-shadow | poor, costly to paint |

Default to transform and opacity for anything that moves.
