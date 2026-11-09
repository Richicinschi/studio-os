# Spring physics in Motion

How to choose and tune spring transitions so motion feels physical instead of mechanical.

## What a spring is

A spring does not run for a fixed time. It pulls a value toward its target like a real spring and stops when the energy is gone. Three consequences:

- It can overshoot and settle, which reads as alive.
- If the user interrupts it halfway, it carries its speed into the new target instead of jerking.
- Its length depends on the numbers, not on a `duration`.

Good for: drag, hover and tap, interactive elements, layout changes, anything that should feel responsive.

Poor for: motion that must match a fixed clock (audio sync), very long travel (it can drag on), and plain fade-ins where a tween is simpler.

## Basic form

```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>
```

## The four numbers

### stiffness: how hard it pulls

Higher is faster and snappier. A good starting point is 300 (balanced). That is this skill's default, not necessarily the library's own; check Motion's spring documentation for its built-in values. Every range below is a rule of thumb.

| Range | Feel | Typical use |
|---|---|---|
| 100-200 | soft, gentle | modals, large panels |
| 300-400 | standard | buttons, cards, most UI |
| 500-700 | snappy | toggles, micro-interactions |
| 800-1000 | near-instant | cursor tracking, immediate feedback |

### damping: how fast the wobble dies

Lower means more bounce. A good starting point is 20 (some bounce); again this skill's default, not the library's.

| Range | Feel | Typical use |
|---|---|---|
| 10-15 | very bouncy | playful brands, games |
| 20-25 | a touch of bounce | most professional UI |
| 30-40 | a hint of bounce | serious, calm products |
| 50+ | no bounce at all | when precision matters |

### mass: how heavy it feels

Higher is slower to start and slower to stop.

| Value | Use for |
|---|---|
| 0.5 | icons, badges |
| 1 | buttons, cards (starting point) |
| 2 | modals, panels |
| 3-5 | full-screen overlays |

### velocity: the starting speed

In pixels per second. `0` starts from rest; a positive number is already heading to the target; a negative one heads away first. Use it to carry a drag release into a spring, or to chain two movements without a seam.

## Presets worth keeping

Gentle (a safe default):
```tsx
transition={{ type: "spring", stiffness: 300, damping: 20, mass: 1 }}
```

Snappy:
```tsx
transition={{ type: "spring", stiffness: 500, damping: 25, mass: 0.8 }}
```

Bouncy:
```tsx
transition={{ type: "spring", stiffness: 400, damping: 12, mass: 1 }}
```

Slow and smooth:
```tsx
transition={{ type: "spring", stiffness: 100, damping: 30, mass: 2 }}
```

No bounce (overdamped: the critical value at stiffness 300 and mass 1 is about 35, so 50 is a little past it and settles slightly slower):
```tsx
transition={{ type: "spring", stiffness: 300, damping: 50, mass: 1 }}
```

## Where each fits

Button hover, quick feedback:
```tsx
<motion.button whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} />
```

Modal entrance, soft landing:
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1.5 }}
/>
```

Drag release, a springy return:
```tsx
<motion.div drag dragElastic={0.2} transition={{ type: "spring", stiffness: 300, damping: 15 }} />
```

Magnetic button, smooth cursor chase:
```tsx
const springX = useSpring(x, { stiffness: 300, damping: 20 })
const springY = useSpring(y, { stiffness: 300, damping: 20 })
<motion.button style={{ x: springX, y: springY }} />
```

Toggle switch, a quick flip:
```tsx
<motion.div animate={{ x: isOn ? 20 : 0 }} transition={{ type: "spring", stiffness: 600, damping: 30 }} />
```

## Spring or tween

| | Spring | Tween |
|---|---|---|
| Length | set by physics | set by you |
| When interrupted | blends smoothly | can snap |
| Feel | organic | mechanical |
| You tune | stiffness, damping, mass | duration, easing |
| Best for | gestures, interactive parts | entrances, exits, anything timed |

## useSpring for values that change often

`useSpring` wraps a motion value so it chases a target with spring physics, without re-rendering React.

```tsx
const x = useMotionValue(0)
const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 1 })
x.set(100)   // springX glides there
```

Ideal for cursor trackers and scroll-linked effects.

## Tuning in order

1. Start at stiffness 300, damping 20, mass 1.
2. Speed: too slow, raise stiffness (400, 500); too fast, lower it (200, 100).
3. Bounce: too much, raise damping (30, 40); too little, lower it (15, 10).
4. Weight: too light, raise mass (1.5, 2); too heavy, lower it (0.8, 0.5).
5. Stress it: a tiny move, a huge move, and a user clicking repeatedly.

## Mistakes

Very stiff and barely damped looks harsh:
```tsx
stiffness: 1000, damping: 5     // jittery
stiffness: 500,  damping: 25    // better
```

Very soft and very heavy crawls:
```tsx
stiffness: 100, mass: 5         // painfully slow
stiffness: 200, mass: 2         // better
```

Also: do not use a spring for everything. Simple fades, timed sequences and most entrances are cleaner as tweens.

## Performance

1. Use `useSpring` for fast-changing values so React does not re-render.
2. Test on low-end devices; springs can be CPU heavy.
3. Damping at or just above the critical value, 2 x sqrt(stiffness x mass), gives no overshoot and about the quickest settle. At stiffness 300 and mass 1 that is roughly 35. Far above it (such as 50 at that stiffness) is overdamped and slower to settle.

## Reduced motion

When the user asks for less motion, skip the physics:

```tsx
const reduce = useReducedMotion()

const transition = reduce
  ? { duration: 0.01 }
  : { type: "spring", stiffness: 300, damping: 20 }
```

## Why springs suit calm design

They copy the physical world, answer to the user's input, add a little personality, and do not draw attention to themselves. Rules:

1. Begin gentle; add energy only if the design needs it.
2. Use higher stiffness for smaller elements.
3. Match bounce to the brand's personality.
4. Judge on a real device; physics feel different on a phone.
