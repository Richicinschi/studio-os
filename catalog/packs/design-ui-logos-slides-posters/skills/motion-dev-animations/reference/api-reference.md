# Motion API reference

What the `motion` package (formerly Framer Motion) offers, grouped by job. React imports come from `"motion/react"`; the plain-JS functions come from `"motion"`.

## The motion element

Any HTML or SVG tag has a motion twin: `motion.div`, `motion.button`, `motion.svg` and so on. One element can carry every kind of prop:

```tsx
import { motion } from "motion/react"

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ outline: "2px solid blue" }}
  whileInView={{ opacity: 1 }}
  drag
  dragConstraints={{ left: 0, right: 300 }}
  dragElastic={0.2}
  layout
  layoutId="hero-card"
  style={{ x: someMotionValue }}
/>
```

## Animation props

`initial` is the state before the first paint. Pass `false` to skip the entrance and start already at `animate`, or a variant name.

```tsx
<motion.div initial={{ opacity: 0, y: 20 }} />
<motion.div initial={false} />
<motion.div initial="hidden" variants={variants} />
```

`animate` is where it ends up. It takes values, a variant name, or a ternary that picks a name.

```tsx
<motion.div animate={{ opacity: 1, y: 0 }} />
<motion.div animate="visible" variants={variants} />
<motion.div animate={isOpen ? "open" : "closed"} />
```

`exit` plays as the element leaves the tree. It only works inside `AnimatePresence`.

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
  )}
</AnimatePresence>
```

`transition` decides how the change plays: duration, delay, easing, or a spring.

```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
/>
<motion.div
  animate={{ x: 100 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>
```

Transition types: `tween` (runs for a set time), `spring` (physics), `inertia` (carries momentum). If you leave `type` out, Motion chooses by the value being animated: physical values such as `x`, `y` and `scale` get a spring, while values like `opacity` and colour get a tween. Set `type` yourself when you need one behaviour. Named easings: `"linear"`, `"easeIn"`, `"easeOut"`, `"easeInOut"`. A custom curve is four numbers, such as `[0.17, 0.67, 0.83, 0.67]`.

## Gesture props

```tsx
<motion.button whileHover={{ scale: 1.1, backgroundColor: "#3b82f6" }} />
<motion.button whileTap={{ scale: 0.95 }} />
<motion.button whileFocus={{ outline: "2px solid blue", outlineOffset: "2px" }} />
<motion.div drag whileDrag={{ scale: 1.1, cursor: "grabbing" }} />
```

`whileInView` pairs with `viewport`:

```tsx
<motion.div
  whileInView={{ opacity: 1 }}
  viewport={{
    once: true,                      // play a single time
    amount: 0.3,                     // fraction that must be visible
    margin: "0px 0px -100px 0px",    // shift the trigger line
  }}
/>
```

## Drag

```tsx
<motion.div drag />          // both axes
<motion.div drag="x" />      // horizontal only
<motion.div drag="y" />      // vertical only
```

`dragConstraints` fences the movement, either with pixel edges or by pointing at a parent ref.

```tsx
<motion.div drag dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }} />

const boundsRef = useRef(null)
<div ref={boundsRef}>
  <motion.div drag dragConstraints={boundsRef} />
</div>
```

`dragElastic` sets how far the element may stray past the fence: `0` is a hard wall, `1` is no resistance, `0.2` is a mild pull-back. `dragMomentum` lets it glide after release:

```tsx
<motion.div drag dragElastic={0.2} dragMomentum />
```

## Layout animation

Add `layout` and the element animates its own position and size changes. Motion measures before and after, then plays the difference as a transform (the FLIP technique), so it is cheap.

```tsx
<motion.div layout />
```

Give two different elements the same `layoutId` and Motion morphs one into the other when one replaces the other.

```tsx
<motion.div layoutId="selected-tab" />   // in the list
<motion.div layoutId="selected-tab" />   // in the detail view
```

## Variants

Variants are named states. A parent that switches state tells every child with variants to follow, which is how staggering works.

```tsx
const list = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

<motion.ul variants={list} initial="hidden" animate="visible">
  {items.map(i => <motion.li key={i} variants={item} />)}
</motion.ul>
```

`staggerChildren` is the gap between children; `delayChildren` is the wait before the first.

## Hooks

`useMotionValue` holds a number that can change without re-rendering React.

```tsx
const x = useMotionValue(0)
x.set(100)
const now = x.get()
```

`useTransform` derives a value from another by mapping ranges.

```tsx
const opacity = useTransform(x, [0, 100], [0, 1])
const scale = useTransform(x, [0, 100], [0.5, 1])
```

`useScroll` reports scroll position. `scrollYProgress` runs from 0 to 1; `scrollY` is in pixels. `target` and `offset` narrow it to one element.

```tsx
const { scrollYProgress, scrollY } = useScroll({
  target: ref,
  offset: ["start start", "end start"],
})
```

`useSpring` makes a value chase another with spring physics.

```tsx
const springX = useSpring(x, { stiffness: 300, damping: 20 })
```

`useInView` returns whether a ref is on screen.

```tsx
const ref = useRef(null)
const seen = useInView(ref, { once: true, amount: 0.3 })
return <div ref={ref}>{seen && "Visible"}</div>
```

`useAnimate` gives an imperative handle for scripted sequences.

```tsx
const [scope, animate] = useAnimate()
const onClick = () => animate(scope.current, { x: 100 }, { duration: 0.5 })
return <div ref={scope} onClick={onClick} />
```

`useReducedMotion` returns `true` when the OS asks for less motion.

```tsx
const reduce = useReducedMotion()
return <motion.div animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }} />
```

## Components

`AnimatePresence` keeps leaving children mounted until their `exit` finishes. Each child needs a `key`. Its `mode`:

- `sync` (default): leaving and entering overlap.
- `wait`: the new one waits for the old one to finish leaving.
- `popLayout`: leaving children are lifted out of layout flow so neighbours move at once.

```tsx
<AnimatePresence mode="wait">
  {isVisible && <motion.div key="item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}
</AnimatePresence>
```

`MotionConfig` sets a default transition for everything inside it.

```tsx
<MotionConfig transition={{ duration: 0.5, ease: "easeOut" }}>
  <motion.div animate={{ x: 100 }} />
  <motion.div animate={{ y: 100 }} />
</MotionConfig>
```

`MotionConfig` also accepts `reducedMotion="user"` to make the whole subtree follow the OS setting.

## Plain JavaScript API

For Svelte, Astro and vanilla pages.

```javascript
import { animate, stagger, scroll, inView } from "motion"

animate("#box", { x: 100, opacity: 1 }, { duration: 1 })           // one element
animate("li", { opacity: 1 }, { delay: stagger(0.1) })              // many, staggered
scroll(animate("#box", { opacity: [0, 1] }))                        // tied to page scroll
scroll(progress => console.log(progress))                           // or read progress (0 to 1) yourself
inView("#box", element => animate(element, { opacity: 1 }))        // when visible; callback gets (element, info)
```

## TypeScript

```tsx
import type { Variant, Transition } from "motion/react"

const variants: Record<string, Variant> = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}
const transition: Transition = { duration: 0.5, ease: "easeOut" }
```

## Performance rules of thumb

1. Animate `x`, `y`, `scale`, `rotate` and `opacity`; browsers can composite these without re-doing layout, though how much is accelerated varies by browser.
2. Never animate `width`, `height`, `top` or `left`.
3. Add `will-change` only on elements that really animate.
4. For size or position changes, use `layout`.
5. As a rule of thumb, keep simultaneous animations to 10-15 elements at most.
6. Variants beat many inline objects.
7. Honour reduced motion.

## Recipes

Fade in:
```tsx
initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
```

Slide up:
```tsx
initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
```

Pop in with a spring:
```tsx
initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

Stagger children (set on the parent's visible variant):
```tsx
variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
```

Leave with a shrink:
```tsx
<AnimatePresence>
  {isVisible && <motion.div exit={{ opacity: 0, scale: 0.8 }} />}
</AnimatePresence>
```
