# Entrances and exits

## Four ways in

### 1. Slide in
Start 20 to 40 px away and transparent, finish in place and opaque. Ease-out, 200 to 350 ms.

| Personality | Distance | Curve | Overshoot |
|---|---|---|---|
| Playful | 30 to 50 px | ease-out-back | 10 to 15% |
| Premium | 15 to 25 px | cubic-bezier(0.4, 0, 0.2, 1) | none |
| Corporate | 20 to 30 px | cubic-bezier(0.2, 0, 0, 1) | 0 to 3% |
| Energetic | 40 to 80 px | ease-out-expo | 15 to 25% |

Side matters: from below means arrival, from the right means forward, from the left means back, from above means a dropdown or authority.

### 2. Scale in
Grow from 85 to 95% (and transparent) to 100% (and opaque) in 250 to 400 ms. Best for modals, dialogs, notifications, popovers and tooltips.

| Personality | Start size | Curve | Overshoot |
|---|---|---|---|
| Playful | 70 to 80% | ease-out-back | 10 to 20% |
| Premium | 95 to 98% | cubic-bezier(0.4, 0, 0.2, 1) | none |
| Corporate | 90 to 95% | cubic-bezier(0.2, 0, 0, 1) | 0 to 3% |
| Energetic | 50 to 70% | ease-out-expo | 15 to 30% |

### 3. Reveal with a mask
Use clip-path or a mask along with opacity, 300 to 500 ms, ease-out. Top to bottom is dramatic, left to right follows reading, center-out focuses, and edge-in feels contained.

### 4. Assemble
Parts come from different places, 50 to 100 ms apart, 300 to 600 ms in all. Suits icon builds, logo reveals and charts constructing themselves.

## Four ways out

Exits last 65 to 75% as long as the matching entrance.

1. Slide out: move 20 to 40 px and fade, ease-in, 150 to 250 ms.
2. Dissolve: fade (optionally to 98% size), ease-in, 150 to 250 ms. For gentle departures, sending things to the back, crossfades.
3. Collapse: shrink to 85 to 95% while fading, ease-in, 150 to 250 ms. For deleting and closing modals.
4. Transfer: travel toward the destination while shrinking, ease-in-out, 250 to 400 ms. For add to cart, save to a collection, move to a folder.

## Making exit and entry connect

- The eye should flow from the leaving piece to the arriving one.
- Where possible, exit near the place the next piece enters.
- Overlap them by 100 to 150 ms.
- Use one easing family for the pair.

## Recipes

**Notification slides in**
1. Slide from the right while fading (250 ms, ease-out).
2. Overshoot 3 to 5% (corporate) or 10 to 15% (playful).
3. The icon appears after 50 ms (100 ms).

**Toast goes away**
1. Slide toward the edge and fade (180 ms, ease-in).
2. The toasts below move up (200 ms, ease-in-out).

**Dropdown opens**
1. Grow vertically from 0 to full height (200 ms, ease-out).
2. Items fade in 30 ms apart, starting 50 ms after the container.

**Page transition, going forward**
1. The old page slides left and fades (300 ms, ease-in).
2. The new page arrives from the right and fades in after a 100 ms delay (400 ms, ease-out).
3. Shared elements morph across (400 ms, ease-in-out).
