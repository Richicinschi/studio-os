# Disney's twelve principles, applied to interfaces

## 1. Squash and stretch

- Squash is about [1.2, 0.8] (wider, shorter); stretch is about [0.85, 1.15].
- Hit lasts 30 to 65 ms (2 to 4 frames); recovery 65 to 130 ms (4 to 8 frames).
- Keep volume constant: if width grows 20%, height shrinks to compensate.
- Leave it out for premium or luxury brands.

## 2. Anticipation

- A small move opposite to the coming one, 100 to 200 ms long, 10 to 20% as large.
- A button dips 3% before growing; a card slides 5 to 10 px the wrong way first.
- Skip it for feedback shorter than 150 ms.

## 3. Staging

- Fade everything but the hero to 40 to 60% opacity, with an optional 2 to 4 px blur.
- The hero lands 100 to 200 ms after its supporting cast.
- One primary action per timing beat.

## 4. Straight ahead and pose to pose

| Method | Result | Use for |
|---|---|---|
| Straight ahead | fluid, spontaneous | particles, ambient effects, generative visuals |
| Pose to pose | planned, controlled | transitions, state changes |

## 5. Follow-through and overlap

- Child elements trail their parent by 50 to 150 ms.
- Stop trailing parts 100 to 200 ms apart.
- Springs suit trailing parts; a softer spring trails more.

## 6. Slow in, slow out

| Situation | Curve | Reason |
|---|---|---|
| Arriving | ease-out | lands gently |
| Leaving | ease-in | exits briskly |
| On screen | ease-in-out | smooth throughout |
| Loop | sine ease-in-out | no visible seam |

Never use linear easing for spatial movement. Linear is for rotation, progress bars and timers only.

## 7. Arcs

- Push the midpoint 10 to 20 px sideways off the straight line.
- About 5 px for corporate, 20 px or more for playful.
- Straight paths are fine for deliberately mechanical interfaces.

## 8. Secondary action

- Strength 30 to 50% of the main move, starting 50 to 100 ms after it, on a different curve.
- A card arrives and its shadow grows; a button is pressed and a ripple spreads.

## 9. Timing

| Weight or mood | Time |
|---|---|
| Heavy (modals, pages) | 400 to 800 ms |
| Light (tooltips, toggles) | 100 to 250 ms |
| Sad or serious | 600 ms and up |
| Happy or light | 200 to 400 ms |
| Urgent | 100 to 200 ms |

Entrances still run 30 to 50% longer than exits.

## 10. Exaggeration

| Personality | Amount |
|---|---|
| Playful | 15 to 25% |
| Energetic | 20 to 30% |
| Corporate | 0 to 5% |
| Premium | 0% |

Scale can overshoot by 10 to 30% and rotation by 5 to 15 degrees either way, where the personality allows it.

## 11. Solid drawing

- Keep proportions the same from keyframe to keyframe.
- Combine scale with rotation to hint at depth.
- Shadows should agree with the light source you imply.

## 12. Appeal

- Prefer smooth curves to hard angles, and timing that feels good.
- Hold one personality across every element.
- Things that ruin appeal: jerks, uneven timing, sudden stops, everything animating identically.

## Putting them together

Which principles each common recipe leans on:

- Loading spinner: appeal, slow in/out, timing.
- Error shake: staging and slow in/out, with timing; no exaggeration.
- Success celebration: exaggeration plus squash/stretch, with a secondary action, timing and appeal.
- Card entrance: staging, arcs, slow in/out, follow-through and an anticipation step.
- Button press: squash/stretch, anticipation, follow-through, a secondary action and timing.
