# Timing and easing lookups

## Duration by element

| Element | Time |
|---|---|
| Tooltip, tiny feedback | 80 to 120 ms |
| Button, toggle | 120 to 180 ms |
| Icon change | 150 to 250 ms |
| Card in or out | 200 to 350 ms |
| Modal, dialog | 300 to 400 ms |
| Page transition | 400 to 600 ms |
| Dramatic reveal | 600 to 1200 ms |
| Ambient loops | 2000 to 20000 ms |

## Scaling with distance

Multiply the base time: 50 px 0.8x, 100 px 1.0x, 200 px 1.3x, 300 px 1.5x, 400 px 1.6x, a full screen 1.8 to 2.0x.

## Entrance versus exit

The entrance is the reference. The exit takes 65 to 75% of it.

## Response limits

| Interaction | Longest acceptable |
|---|---|
| Hover | under 100 ms |
| Press or tap | under 150 ms |
| Release or settle | 200 to 300 ms |
| Error shake | 300 to 400 ms |
| Long press | 500 to 800 ms |
| Start of a drag | under 50 ms |

## Durations per personality

| | Quick | Standard | Slow |
|---|---|---|---|
| Playful | 150 ms | 250 ms | 400 ms |
| Premium | 350 ms | 500 ms | 800 ms |
| Corporate | 200 ms | 300 ms | 450 ms |
| Energetic | 100 ms | 180 ms | 300 ms |

## Easing by direction

Arriving: ease-out. Leaving: ease-in. Visible: ease-in-out. Looping: sine. Rotation and progress: linear.

## Named curves

| Job | Curve | Value |
|---|---|---|
| Playful overshoot | Bounce settle | cubic-bezier(0.175, 0.885, 0.32, 1.275) |
| Dramatic snap | Elastic snap | cubic-bezier(0.68, -0.55, 0.265, 1.55) |
| Ambient drift | Gentle float | cubic-bezier(0.4, 0, 0.2, 1) |
| Fast and decisive | Snappy | cubic-bezier(0.2, 0, 0, 1) |
| Browser default | CSS ease keyword | cubic-bezier(0.25, 0.1, 0.25, 1) |
| Things coming in | Material 3 standard decelerate | cubic-bezier(0, 0, 0, 1) |
| Exits | Material 3 standard accelerate | cubic-bezier(0.3, 0, 1, 1) |
| Entrances | Material 3 emphasized decelerate | cubic-bezier(0.05, 0.7, 0.1, 1) |
| Default on-screen | Material 3 standard | cubic-bezier(0.2, 0, 0, 1) |

The four Material curves match the Easing constants in the Flutter API reference, which implement the Material specification; the CSS ease keyword is defined in the CSS Easing Functions specification. The rest are common curves from easing libraries, offered as starting points.

## By imagined material

| Material | Time factor | Overshoot |
|---|---|---|
| Metal | 1.2x | 0% |
| Rubber | 0.8x | 15 to 25% |
| Water | 1.5x | 5% |
| Paper | 1.0x | 3 to 5% |
| Smoke | 2.0x | 0% |
| Glass | 0.9x | 0% |

## Springs

Starting points of the skill, not taken from any library. They assume a mass of 1 and a spring written as stiffness k and damping coefficient c, where the damping ratio is c divided by twice the square root of k. If your library asks for a ratio instead (some do), use the ratio column; if it asks for c, compute c = 2 x ratio x square root of k.

| Feel | Stiffness k | Damping coefficient c | Damping ratio |
|---|---|---|---|
| Very stiff | 400+ | 25 to 30 | about 0.6 to 0.75 |
| Standard | 250 to 350 | 18 to 24 | about 0.55 to 0.7 |
| Bouncy | 150 to 250 | 10 to 15 | about 0.3 to 0.5 |
| Very bouncy | 100 to 200 | 5 to 10 | about 0.2 to 0.35 |
| Gentle | 100 to 150 | 20 to 25 | about 1.0 |

A ratio below 1.0 oscillates before settling; exactly 1.0 settles fastest without oscillating; above 1.0 it creeps to rest. Only the Gentle row stops without a wobble; for a heavier, overdamped feel raise c further. Libraries differ in how they define stiffness and damping, so confirm the convention before copying numbers.

## Staggers

| Style | Gap | Total |
|---|---|---|
| Micro cascade | 20 to 40 ms | under 200 ms |
| Standard | 50 to 100 ms | under 400 ms |
| Dramatic | 100 to 200 ms | under 600 ms |
| Wave | 30 to 60 ms | under 500 ms |

Order: top to bottom for lists, left to right for rows, center-out for heroes, random for organic effects, reversed for exits. The full stagger must stay under 500 ms.

## Overshoot allowance

| Context | Overshoot |
|---|---|
| Success | 5 to 10% |
| Error | 0% |
| Feedback | 2 to 5% |
| Celebration | 15 to 25% |
| Premium | 0% |
