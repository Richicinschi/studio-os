# Card hover

A card lifts and its shadow deepens under the pointer. It tells the user the card is clickable. Everything is transform or shadow, so it stays smooth.

Fits product cards, blog teasers, portfolio tiles, feature grids, pricing tables.

## Basic

```tsx
import { motion } from "motion/react"

export function HoverCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 cursor-pointer"
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}
```

```tsx
<HoverCard>
  <h3>Ceramic mug</h3>
  <p>Hand-glazed, holds 300 ml.</p>
</HoverCard>
```

## Fuller card: lift, scale, border tint, image zoom

```tsx
import { motion } from "motion/react"

type Props = { title: string; description: string; image: string }

export function PremiumCard({ title, description, image }: Props) {
  return (
    <motion.article
      className="bg-white rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent"
      initial={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      whileHover={{
        y: -12,
        scale: 1.02,
        boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
        borderColor: "rgba(59,130,246,0.5)",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.img
        src={image}
        alt={title}
        className="w-full h-48 object-cover"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
      />
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
        <motion.button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
          whileTap={{ scale: 0.95 }}
        >
          Details
        </motion.button>
      </div>
    </motion.article>
  )
}
```

The image scales inside a clipped container (`overflow-hidden`), so it never spills out.

## Quiet version for restrained brands

```tsx
export function QuietCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="bg-white rounded-3xl p-8 shadow-sm"
      whileHover={{ y: -4, scale: 1.01, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  )
}
```

## A grid that enters in sequence

```tsx
const grid = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const tile = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export function ProductGrid({ products }: { products: { id: number; title: string; price: string }[] }) {
  return (
    <motion.div className="grid md:grid-cols-3 gap-8" variants={grid} initial="hidden" animate="visible">
      {products.map(p => (
        <motion.div
          key={p.id}
          variants={tile}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
          className="bg-white rounded-2xl p-6 cursor-pointer"
        >
          <h3 className="text-xl font-bold">{p.title}</h3>
          <p className="text-2xl font-bold mt-2">{p.price}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
```

The tile's own `variants` handle entry; `whileHover` handles the lift. They do not fight.

## Plain JavaScript

```javascript
import { animate } from "motion"

const spring = { type: "spring", stiffness: 300, damping: 20 }

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mouseenter", () =>
    animate(card, { y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }, spring))
  card.addEventListener("mouseleave", () =>
    animate(card, { y: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }, spring))
})
```

## Press feedback

```tsx
// onClick is the handler passed in from the parent
<motion.div
  className="bg-white rounded-2xl p-6 cursor-pointer"
  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
  whileTap={{ scale: 0.98, y: -4 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
  onClick={onClick}
/>
```

## Keyboard focus

Hover alone excludes keyboard users. Make the card focusable and mirror the hover state on focus.

```tsx
<motion.div
  tabIndex={0}
  className="bg-white rounded-2xl p-6 cursor-pointer focus:outline-none"
  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
  whileFocus={{
    y: -8,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    outline: "2px solid #3b82f6",
    outlineOffset: "2px",
  }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>
```

A focusable card should also be a real link or button, or have a role and key handler, not just a div.

## Variations

Barely there:
```tsx
whileHover={{ y: -2, scale: 1.005 }}
```

Showcase:
```tsx
whileHover={{ y: -16, scale: 1.05, rotate: 2 }}
```

Coloured glow:
```tsx
whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(59,130,246,0.4)" }}
```

Tween instead of spring:
```tsx
transition={{ duration: 0.4, ease: "easeOut" }}
```

## Why it works

The lift suggests something you can pick up, the shadow backs that up, the spring makes it feel physical, and the response is immediate.

## Use and avoid

Use on cards that act as links or buttons.

Avoid on a wall of cards (too busy), on small touch targets (there is no hover on touch), when the user prefers reduced motion, and on cards that only display information.

Keep it fast: `will-change: transform` on the card, no animating of width or height, and not too many animated hoverables on one screen.
