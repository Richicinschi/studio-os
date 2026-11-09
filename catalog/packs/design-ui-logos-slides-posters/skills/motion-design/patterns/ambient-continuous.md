# Ambient and continuous patterns

Ambient motion sits at 10-20% of the primary move's strength and never competes with it. Ranges below marked "each way" are amplitude, not total travel.

## Stack the layers from the back

| Layer | Kind | Example |
|---|---|---|
| Back | gradient drift or parallax | slow colour temperature change |
| Middle | floating pieces or particles | gently drifting shapes |
| Front | breathing or shimmer | faint pulse on content |

Together they should not exceed 20% of the primary motion's visual energy. Keep fewer than 20 ambient pieces, animate only transform and opacity, and prefer a few big pieces to many tiny ones.

## Slow oscillations

**Breathing or pulsing**: scale between 0.98 and 1.02 on a sine ease-in-out, one cycle every 2-4 seconds; or oscillate opacity between 0.7 and 1.0. A pulse beyond plus or minus 5% scale starts demanding attention.

| Where | Scale range | Cycle | Opacity range |
|---|---|---|---|
| Call to action | 0.97-1.03 | 2500 ms | 0.7-1.0 |
| Active indicator | 0.95-1.05 | 2000 ms | 0.6-1.0 |
| Waiting or idle | 0.98-1.02 | 3000 ms | 0.8-1.0 |
| Background piece | 0.99-1.01 | 4000 ms | 0.9-1.0 |

**Floating**: move up and down by 5-15 px each way on a sine ease-in-out, 3-5 seconds a cycle. Optionally tilt 2-3 degrees each way, running 30% of a cycle behind the vertical motion. With several floating pieces give each its own period so they never line up:
- First: 4000 ms, 10 px each way.
- Second: 5500 ms, 8 px each way, offset 30%.
- Third: 3500 ms, 12 px each way, offset 60%.

**Gradient drift**: shift the background position by 10-20% each way, or turn the gradient angle by 15 degrees each way, over 8-20 seconds. Linear or sine easing. It should be hard to notice at a glance.

## Depth and scroll

| Layer | Speed | Holds |
|---|---|---|
| Front | 1.0x | interactive items, text |
| Middle | 0.5x | decoration, cards |
| Back | 0.2x | patterns, scenery |
| Far back | 0.1x | texture, atmosphere |

- Scroll-driven parallax: under 100 px of total offset, not on phones, and never on text.
- Pointer-driven parallax: front layer at most 10-20 px, back layer 5-10 px in the opposite direction, smoothed over 100-200 ms.

## Turning and sweeping

Spinners turn linearly, one revolution in 1-2 seconds. Slower turning for decoration:

| Kind | Speed | Fits |
|---|---|---|
| Slow spin | 10-30 s per turn | background decoration |
| Gear-like | 3-5 s per turn | technical themes |
| Orbit | 5-15 s per turn | space or science |
| Wobble | 2-4 s per cycle, sine | playful idle state |

Shimmer: a gradient sweeps left to right in 1.5-2.5 seconds, then rests 2-5 seconds; its opacity goes 0%, 30%, 0%. Good for loading skeletons, premium accents and "new" badges.

## Particles

- Snow or falling: 10-20 pieces, falling 20-60 px/s, drifting 10-20 px sideways, 3-8 px wide, 30-70% opacity.
- Dust or motes: 5-10 pieces, 10-30 px/s in mixed directions, 2-5 px, 20-50% opacity.
- Sparkles or stars: 8-15 pieces, each pulsing opacity 0 to 100% to 0 over 500-1500 ms at random starts.
