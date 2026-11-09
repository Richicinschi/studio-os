# Core philosophy

Three ideas, in the order you should settle them: the layers of a scene, the pillars behind a move, and the budget that keeps it readable.

## Layers

| Layer | Purpose | Strength | If missing |
|---|---|---|---|
| Primary | what the eye follows | 100% | critical: there is no animation |
| Secondary | supporting detail | 30-50% | high: the scene reads flat |
| Ambient | background life | 10-20% | medium: the scene lacks atmosphere |

The primary layer is mandatory. Always add a secondary layer too, starting 50-100 ms after the primary on a different curve, and an ambient layer where the context allows. Ambient motion is slow, constant and must never pull focus.

## Pillar 1: emotional intent

Name the feeling before touching a property.

| Feeling | Quality | Time | Curve |
|---|---|---|---|
| Trust | smooth, predictable | 300-400 ms | soft curves |
| Confidence | decisive | 200-400 ms | firm ease-out |
| Delight | bouncy, a little surprising | 200-300 ms | overshoot |
| Surprise | sudden, bursting | 150-300 ms | exponential |
| Urgency | sharp, direct | 100-200 ms | snappy ease-out |
| Calm | slow, flowing | 500-1000 ms | sine curves |

## Pillar 2: visual narrative

Every move has setup (20-30% of its time: set context, prepare the eye), action (30-40%: the main motion) and resolution (30-40%: settle and confirm). A 200 ms tooltip fade has all three, compressed. The longer four-act version is in the narrative file.

## Pillar 3: motion craft

- Pick the curve that suits the feeling.
- Scale duration with element size and distance.
- Organic things travel on arcs; mechanical things go straight.
- Add secondary motion: shadows, neighbours reacting.
- Do not let all parts start and stop on the same frame.

## Budget

- One hero move per moment.
- Two or three things moving at once, at most. Ambient motion is free and not counted.
- Offset starts instead of synchronising them.
- Nothing crosses more than a third of the screen without a change in direction, speed or arc.
