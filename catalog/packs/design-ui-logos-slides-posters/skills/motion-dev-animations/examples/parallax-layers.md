# Parallax layers

Layers shift at different rates as the page scrolls, which fakes depth. `useScroll` reports progress through a section, `useTransform` turns that progress into a per-layer offset, and only `transform` changes.

Fits hero backgrounds, story sections, product showcases.

## Two layers

```tsx
import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"

export function ParallaxHero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],   // from section top at viewport top, to section bottom at viewport top
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const fgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <img src="/dunes-bg.jpg" alt="" className="w-full h-[120%] object-cover" />
      </motion.div>

      <motion.div className="absolute inset-0 z-10 grid place-items-center" style={{ y: fgY }}>
        <h1 className="text-6xl font-bold text-white">Cross the dunes</h1>
      </motion.div>
    </section>
  )
}
```

Make the background image taller than the box (120% here), otherwise shifting it reveals an empty strip.

## Several layers

```tsx
export function MultiLayerParallax() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })

  const far = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const mid = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const near = useTransform(scrollYProgress, [0, 1], ["0%", "15%"])
  const text = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])   // goes the other way

  return (
    <section ref={ref} className="relative h-[150vh]">
      <motion.img src="/dunes.jpg" alt="" className="absolute inset-0 z-0 w-full h-full object-cover opacity-70" style={{ y: far }} />
      <motion.img src="/palms.png" alt="" className="absolute inset-0 z-10 w-full h-full object-cover" style={{ y: mid }} />
      <motion.img src="/reeds.png" alt="" className="absolute inset-0 z-20 w-full h-full object-cover" style={{ y: near }} />

      <motion.div className="absolute inset-0 z-30 grid place-items-center" style={{ y: text }}>
        <div className="text-center text-white">
          <h1 className="text-7xl font-bold mb-4">A week on the coast</h1>
          <p className="text-2xl">Notes from a slow trip</p>
        </div>
      </motion.div>
    </section>
  )
}
```

Mark decorative images with `alt=""` so screen readers skip them.

## Sideways drift for a row of cards

```tsx
export function DriftingCards() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })

  const x1 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])
  const x2 = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"])
  const x3 = useTransform(scrollYProgress, [0, 1], ["0%", "0%"])
  const x4 = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"])

  return (
    <section ref={ref} className="py-24 overflow-hidden">
      <div className="flex gap-8 px-8">
        {[x1, x2, x3, x4].map((x, i) => (
          <motion.div key={i} style={{ x }} className="card">Card {i + 1}</motion.div>
        ))}
      </div>
    </section>
  )
}
```

## Plain JavaScript

```javascript
import { scroll } from "motion"

const bg = document.querySelector(".parallax-bg")
const fg = document.querySelector(".parallax-fg")
const text = document.querySelector(".parallax-title")

// The callback receives progress through the section as a number from 0 to 1.
const section = document.querySelector(".parallax-section")
const travel = section.offsetHeight   // pixels the section scrolls through

scroll(
  progress => {
    if (bg) bg.style.transform = `translateY(${progress * travel * 0.5}px)`
    if (fg) fg.style.transform = `translateY(${progress * travel * 0.3}px)`
    if (text) text.style.transform = `translateY(${-progress * travel * 0.2}px)`
  },
  { target: section, offset: ["start start", "end start"] }
)
```

## Zoom and fade as you leave

```tsx
export function ParallaxZoom() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale, opacity }}>
        <img src="/coast-bg.jpg" alt="" className="w-full h-full object-cover" />
      </motion.div>
      <div className="relative z-10 grid place-items-center h-full">
        <h1 className="text-6xl font-bold text-white">Slow zoom on leaving</h1>
      </div>
    </section>
  )
}
```

## Keeping it fast

```tsx
<motion.div className="absolute inset-0" style={{ y, willChange: "transform" }}>
  <img src="/cover.jpg" alt="" className="w-full h-full object-cover" loading="eager" fetchPriority="high" />
</motion.div>
```

Eager loading and high fetch priority are right only for an image above the fold. Below it, lazy-load.

## Reduced motion

Collapse the range so nothing moves:

```tsx
import { useReducedMotion } from "motion/react"

const reduce = useReducedMotion()
const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "50%"])
```

## Choosing speeds

These are starting points to tune by eye, not measured values. They describe how fast a layer appears to travel compared with the page.

| Layer | Apparent speed against the page |
|---|---|
| Far background | slowest (a small share of normal scroll) |
| Middle | in between |
| Near foreground | close to normal scroll |
| Counter-moving text | opposite direction, gently |

The code above gets there with different translate amounts per layer (the far layer moves furthest down the section, which makes it seem to lag the page). Whichever scheme you use, keep the gaps between layers modest; depth comes from the differences, not from large numbers.

## Use and avoid

Use on heroes, showcases, story pages.

Avoid when the user prefers reduced motion, on weak mobile hardware, over text people must read steadily, with more layers than you need (a good ceiling is 3-5), and in horizontally scrolling sections.

Fast checklist: transforms only, `will-change: transform` on moving layers, `offset` set so it only runs near view, test on a slow phone.
