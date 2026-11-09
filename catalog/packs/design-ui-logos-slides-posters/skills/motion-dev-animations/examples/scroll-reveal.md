# Scroll reveal

Content fades and slides in the first time it nears the viewport. It paces a long page and keeps the eye moving. Motion uses the browser's Intersection Observer for this, so you do not write a scroll listener yourself.

Fits feature sections, testimonials, long articles, galleries, pricing.

## Simplest form

```tsx
import { motion } from "motion/react"

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
```

```tsx
<ScrollReveal>
  <h2>This slides in on arrival</h2>
  <p>It plays once, then stays put.</p>
</ScrollReveal>
```

## Choose the direction

```tsx
type Direction = "up" | "down" | "left" | "right"

const offsets = {
  up: { y: 50 },
  down: { y: -50 },
  left: { x: 50 },
  right: { x: -50 },
}

export function Reveal({ children, direction = "up", delay = 0 }: {
  children: React.ReactNode
  direction?: Direction
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

```tsx
<Reveal direction="left" delay={0.1}><h2>Enters from the left</h2></Reveal>
<Reveal direction="right" delay={0.2}><p>Enters from the right</p></Reveal>
```

"left" means it starts at the right and slides left into place; check that matches what you want.

## A list that cascades

```tsx
const list = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const row = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function FeatureList({ features }: { features: string[] }) {
  return (
    <motion.ul
      variants={list}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="space-y-4"
    >
      {features.map(f => (
        <motion.li key={f} variants={row} className="p-6 bg-white rounded-xl shadow-lg">
          {f}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

## Plain JavaScript (Astro, Svelte)

```javascript
import { inView, animate } from "motion"

document.querySelectorAll(".reveal").forEach(el => {
  const stop = inView(
    el,
    () => {
      animate(el, { opacity: [0, 1], y: [50, 0] }, { duration: 0.6, ease: "easeOut" })
      stop()   // the vanilla API keeps watching until told otherwise; this gives the "once" behaviour
    },
    { amount: 0.3 }
  )
})
```

```html
<div class="reveal"><h2>Shows up on scroll</h2></div>
<div class="reveal"><p>And so does this line.</p></div>
```

Start `.reveal` at `opacity: 0` in CSS so it does not flash first.

## When you want the boolean

`useInView` hands back whether the element is on screen, for when the animation needs custom logic.

```tsx
import { motion, useInView } from "motion/react"
import { useRef } from "react"

export function ObservedReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, amount: 0.3, margin: "0px 0px -100px 0px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={seen ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
```

## A whole section

```tsx
const features = [
  { title: "Roasted fresh", description: "Beans leave the oven on Monday" },
  { title: "Ships fast", description: "At your door within 48 hours" },
  { title: "Recyclable", description: "Bag and valve go in the paper bin" },
]

const grid = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
}
const card = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

export function FeaturesSection() {
  return (
    <section className="py-24 px-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4">What we promise</h2>
        <p className="text-xl text-gray-600">Three small promises</p>
      </motion.div>

      <motion.div
        variants={grid}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        {features.map(f => (
          <motion.div key={f.title} variants={card} className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
            <p className="text-gray-600">{f.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
```

## Tweaks

Replay every time it re-enters:
```tsx
viewport={{ once: false }}
```

Start earlier, 200px before it shows (a positive bottom margin widens the trigger zone; a negative one, like the -100px above, makes it fire later):
```tsx
viewport={{ margin: "0px 0px 200px 0px" }}
```

Wait until fully visible:
```tsx
viewport={{ amount: 1 }}
```

Slower:
```tsx
transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
```

## Why these settings

- `once: true` stops the page from re-animating on every scroll, which gets tiring.
- `amount: 0.3` starts the motion early enough to finish as the content settles into view.
- Staggering gives a list a rhythm instead of a single block.

## Use and avoid

Use on grids, testimonials, long text, galleries, pricing.

Avoid hiding anything essential behind a reveal, revealing a very large number of elements at once, anything above the fold (it should simply be there), and when the user prefers reduced motion. For that last case, render the final state with no offset.
