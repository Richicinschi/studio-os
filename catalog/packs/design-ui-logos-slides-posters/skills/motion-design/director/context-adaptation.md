# Context adaptation

Adjust the same design to the device, the audience, the user's settings and the hardware budget.

## Device scaling

| Device | Time factor | Complexity | Physics |
|---|---|---|---|
| Desktop | 1.0x (reference) | full | any |
| Tablet | 0.9x | standard | most |
| Phone | 0.8x | cut back to one or two properties | snappy only |
| Watch | 0.6x | one property | none |
| TV or kiosk | 1.3x | full | any |

On phones: lean on opacity and transform, answer touch in under 100 ms, trim stagger budgets by about 30%, avoid parallax. Desktop can add hover states, cursor tracking, multi-column staggers and spatial choreography.

## Accessibility

### prefers-reduced-motion

| Normally | Swap for |
|---|---|
| slide in | a plain fade |
| bounce or spring | instant change, or one simple ease-out |
| parallax | still layers |
| autoplay | paused until the user starts it |
| elaborate choreography | one fade |
| endless ambient motion | still, or a gentle opacity pulse |

In reduced mode: drop spatial movement, keep opacity changes, remove springs, cut durations by at least half, and never loop on its own.

### Vestibular triggers (the skill's own rules of thumb, not a standard; WCAG 2.2 success criterion 2.3.3, Animation from Interactions, is the related criterion at level AAA)

Avoid these, or offer a calm alternative: large zooms, full-screen position shifts, spinning objects over 100 px, parallax with more than two layers, quick reversals of direction.

### Cognitive load

- The same interaction should always animate the same way.
- Moving content that starts by itself, lasts more than five seconds and sits alongside other content needs a way to pause, stop or hide it, unless the motion is essential (WCAG 2.2 success criterion 2.2.2, Pause, Stop, Hide, level A).
- Never let motion be the only carrier of important information.

## Performance budget

| Tier | What you animate | Rule-of-thumb count at once (the skill's own starting points, not from a source) |
|---|---|---|
| Best | transform, opacity | no practical limit (GPU) |
| Fine | plus colour, clip-path (measure it) | 10 to 15 |
| Borderline | plus width, height, margin | 5 to 8 |
| Avoid | box-shadow, border-radius, filter (filters can be composited in some browsers, so measure) | 1 to 3 |

- A 60fps display gives 16.67 ms per frame (1000 divided by 60); keep animation code under 10 ms of each frame.
- Use will-change sparingly, and keep under 20 animated elements in view.
- Staggering spreads the load; starting everything together spikes it.
- Ambient effects may drop to 30fps.

## By kind of product

| Product | Personality | Time | How much motion |
|---|---|---|---|
| Finance | Corporate or Premium | 250 to 500 ms | low |
| Social | Playful | 150 to 300 ms | medium |
| Enterprise SaaS | Corporate | 200 to 400 ms | low |
| Games | Energetic | 100 to 250 ms | high |
| Health | Corporate, calm | 300 to 600 ms | very low |
| Shopping | varies | 200 to 400 ms | medium |
| Editorial | Premium | 350 to 600 ms | low |
| Kids | Playful | 150 to 300 ms | high |

## Responsive motion

| Container width | Largest move | Time factor |
|---|---|---|
| under 400 px | 20% of width | 0.8x |
| 400 to 800 px | 25% of width | 1.0x |
| 800 to 1200 px | 20% of width | 1.0x |
| over 1200 px | 15% of width | 1.1x |

Narrow screens: one item at a time. Middle: a regular stagger over two or three columns. Wide: the whole choreography, center-out stagger, parallax.

## Dark mode

Turn intensity down by 10 to 20%, because bright elements on dark pop harder. Keep ambient motion quieter, watch opacity values, and never flash pure white.
