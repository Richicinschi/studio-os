# Hero fade-up

Headline, subline and button rise a few pixels while fading in, one after another. Calm, reads top to bottom, and costs almost nothing because only opacity and transform change.

Fits landing pages, product launches, portfolio heroes.

## React / Next.js

```tsx
import { motion } from "motion/react"

const ease = [0.22, 1, 0.36, 1] as const

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
})

export function HeroFadeUp() {
  return (
    <section className="min-h-screen grid place-items-center bg-black text-white">
      <div className="max-w-4xl px-8 text-center">
        <motion.h1 className="text-6xl md:text-8xl font-bold mb-6" {...rise(0)}>
          Brew Slowly
        </motion.h1>

        <motion.p className="text-xl md:text-2xl text-gray-400 mb-8" {...rise(0.1)}>
          Single-origin beans, roasted every Monday.
        </motion.p>

        <motion.button
          className="px-8 py-4 bg-white text-black rounded-full font-medium"
          {...rise(0.2)}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
        >
          See the menu
        </motion.button>
      </div>
    </section>
  )
}
```

The 0.1s step between delays sets the reading order. The hover and tap states carry their own `transition`; without that, they would inherit the entrance's 0.8s duration and 0.2s delay.

## Plain JavaScript (Astro, Svelte)

```javascript
import { animate, stagger } from "motion"

animate(
  document.querySelectorAll(".hero-item"),
  { opacity: [0, 1], y: [20, 0] },
  { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: stagger(0.1) }
)
```

```html
<section class="hero">
  <h1 class="hero-item">Brew Slowly</h1>
  <p class="hero-item">Single-origin beans, roasted every Monday.</p>
  <button class="hero-item">See the menu</button>
</section>
```

Set `.hero-item { opacity: 0 }` in CSS (or hide it until the script runs) so the text does not flash before the animation starts.

## With reduced motion

```tsx
import { motion, useReducedMotion } from "motion/react"

export function Headline() {
  const reduce = useReducedMotion()
  const props = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
      }
  return <motion.h1 {...props}>Brew Slowly</motion.h1>
}
```

## Variations

Quicker:
```tsx
transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
```

Slower, more theatrical:
```tsx
transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
```

Longer travel:
```tsx
initial={{ opacity: 0, y: 40 }}
```

Spring instead of a curve:
```tsx
transition={{ type: "spring", stiffness: 100, damping: 20 }}
```

## Why it works

- A small offset (20px) reads as polish; a big one reads as a gimmick.
- The ease-out curve starts fast and lands softly.
- Staggered delays tell the eye where to start.
- Only transform and opacity change, so nothing reflows.

## Use and avoid

Use on landing pages, hero blocks, headers, launch announcements.

Avoid when the user prefers reduced motion (give them the static version), when many other things already animate, or when the text is something people must read immediately; do not hold it back behind a delay.
