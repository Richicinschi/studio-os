# Choreography

How several things move together without turning into noise. Read the budgets first, then the staging rules, then the recipes.

## Budgets

- Distance: no move may cover more than a third of the screen unless something changes along the way (a turn, a speed change, an arc tweak).
- Count: with three or more animated items, at most a third are moving at any instant. Space starts so the first has landed when the third begins.
- Stagger: the time from the first item starting to the last starting stays under 500 ms, whatever the style.
- Rest: after a sequence resolves, hold still for 100-200 ms before the next one.

Beat shares for a sequence: setup 20-30%, action 30-40%, resolution 30-40%.

## Who leads

The hero goes first and travels furthest, on the most expressive curve. Supporting pieces are quieter on every axis. All pieces share one entry side or one origin point; mixed directions look like a mess.

A counterweight keeps the scene balanced. Something drifts the other way, slower:

| If the hero | Counter with | At this fraction of hero speed |
|---|---|---|
| rises | a shadow that spreads and softens | 20-30% |
| comes in from the left | a background that slides right | 20-30% |
| turns clockwise | ambient pieces that turn anticlockwise | 15-25% |
| grows | a shadow that shrinks | 10-20% |

## Ordering the stagger

| Order | What it is | Fits |
|---|---|---|
| Sequential | follows reading order | lists, grids |
| Center-out | spreads from the middle | hero content, ripples |
| Reverse | bottom to top | exits, going back |
| Random | irregular starts | organic or particle effects |
| Wave | start times follow a sine | bars, continuous data |

Use one easing family for the whole group and vary only the start time. The last item may get a touch of overshoot as a full stop.

## One trigger, several reactions

Start every reacting item within 50 ms of the trigger. They may finish at different moments. Keep one easing family, and let the motion start at the trigger point.

## Steering the eye

- Lead: move the target before its surroundings.
- Follow: let motion come to rest on the focal point.
- Peripheral: faint continuous motion at the edges.
- Point: movement aimed at the call to action.

Speed also gives depth: the front layer moves at 1.0x and is fastest, the middle at 0.5x, the back at 0.2x and is slowest.

## Recipes

**Dashboard loading**
1. Skeleton shapes fade in (100 ms).
2. The main figure arrives after a 100 ms delay (250 ms, ease-out).
3. Smaller cards follow, 50 ms apart, 200 ms each.
4. The chart draws (300 ms) alongside the cards.
5. A faint pulse stays on the key number.

**Opening a modal**
1. Dim the page behind (200 ms).
2. After 50 ms, grow the modal from 95% to 100% while fading in (300 ms).
3. Content fades in 100 ms after the modal (200 ms).
4. The close button comes last (150 ms).

**Adding a row to a list**
1. Rows below slide down to make space (200 ms, ease-in-out).
2. After 50 ms, the new row fades and slides in from above (250 ms, ease-out).
3. It lands with a 3-5% scale overshoot.
