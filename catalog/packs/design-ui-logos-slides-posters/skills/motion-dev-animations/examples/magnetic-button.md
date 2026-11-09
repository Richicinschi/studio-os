# Magnetic button

The element leans toward the pointer while it is over it, then springs home. Mouse position feeds motion values, a spring smooths them, and React never re-renders during the move.

Fits primary calls to action, portfolio pieces, playful brands. Mouse only: touch screens have no hover.

## Basic

```tsx
import { motion, useMotionValue, useSpring } from "motion/react"
import { useRef, type MouseEvent } from "react"

export function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20 })
  const sy = useSpring(y, { stiffness: 300, damping: 20 })

  function onMove(e: MouseEvent<HTMLButtonElement>) {
    const box = ref.current?.getBoundingClientRect()
    if (!box) return
    const dx = e.clientX - (box.left + box.width / 2)
    const dy = e.clientY - (box.top + box.height / 2)
    x.set(dx * 0.3)     // follow at 30% of the distance
    y.set(dy * 0.3)
  }

  function onLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      className="px-8 py-4 bg-blue-500 text-white rounded-full font-medium"
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}
```

## With a size swell and a glow

```tsx
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { useRef, type MouseEvent } from "react"

export function GlowMagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20 })
  const sy = useSpring(y, { stiffness: 300, damping: 20 })

  // the further it is pulled, the bigger it gets
  const scale = useTransform([x, y], ([lx, ly]: number[]) => 1 + Math.hypot(lx, ly) * 0.003)

  function onMove(e: MouseEvent<HTMLButtonElement>) {
    const box = ref.current?.getBoundingClientRect()
    if (!box) return
    x.set((e.clientX - (box.left + box.width / 2)) * 0.4)
    y.set((e.clientY - (box.top + box.height / 2)) * 0.4)
  }

  return (
    <motion.button
      ref={ref}
      className="relative px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold text-lg overflow-hidden"
      style={{ x: sx, y: sy, scale }}
      onMouseMove={onMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.div className="absolute inset-0 bg-white opacity-0" whileHover={{ opacity: 0.2 }} transition={{ duration: 0.3 }} />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
```

## A big surface that tilts

Same idea, applied to a card: a small shift plus a 3D tilt.

```tsx
import { motion, useMotionValue, useSpring } from "motion/react"
import { useRef, type MouseEvent } from "react"

export function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const rx = useMotionValue(0), ry = useMotionValue(0)
  const cfg = { stiffness: 200, damping: 20 }
  const sx = useSpring(x, cfg), sy = useSpring(y, cfg)
  const srx = useSpring(rx, cfg), sry = useSpring(ry, cfg)

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const box = ref.current?.getBoundingClientRect()
    if (!box) return
    const dx = e.clientX - (box.left + box.width / 2)
    const dy = e.clientY - (box.top + box.height / 2)
    x.set(dx * 0.1)
    y.set(dy * 0.1)
    rx.set((dy / box.height) * -10)   // top edge tips away
    ry.set((dx / box.width) * 10)
  }

  function onLeave() { x.set(0); y.set(0); rx.set(0); ry.set(0) }

  return (
    <motion.div
      ref={ref}
      className="bg-white rounded-3xl p-8 shadow-lg cursor-pointer"
      style={{ x: sx, y: sy, rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}
```

## A custom cursor dot

```tsx
import { motion, useMotionValue, useSpring } from "motion/react"
import { useEffect } from "react"

export function CursorDot() {
  const cx = useMotionValue(0)
  const cy = useMotionValue(0)
  const sx = useSpring(cx, { stiffness: 500, damping: 30 })
  const sy = useSpring(cy, { stiffness: 500, damping: 30 })

  useEffect(() => {
    const move = (e: globalThis.MouseEvent) => {
      cx.set(e.clientX - 16)   // 16 = half the 32px dot
      cy.set(e.clientY - 16)
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [cx, cy])

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 bg-blue-500 rounded-full pointer-events-none z-50 mix-blend-difference"
      style={{ x: sx, y: sy }}
    />
  )
}
```

Hiding the real cursor (`cursor: none`) hurts people who track the pointer by eye. Leave it visible unless the design truly needs it.

## Plain JavaScript

```javascript
import { animate } from "motion"

const btn = document.querySelector(".magnetic-btn")
let tx = 0, ty = 0

btn.addEventListener("mousemove", e => {
  const r = btn.getBoundingClientRect()
  tx = (e.clientX - (r.left + r.width / 2)) * 0.3
  ty = (e.clientY - (r.top + r.height / 2)) * 0.3
  animate(btn, { x: tx, y: ty }, { type: "spring", stiffness: 300, damping: 20 })
})

btn.addEventListener("mouseleave", () => {
  animate(btn, { x: 0, y: 0 }, { type: "spring", stiffness: 300, damping: 20 })
})
```

## Dials

Stronger pull, multiply by 0.6; subtler, by 0.15. Faster response: `stiffness: 500, damping: 25`. Floatier: `stiffness: 150, damping: 15`. Cap the travel so it never wanders:

```tsx
const cap = 30
x.set(Math.max(-cap, Math.min(cap, dx * 0.4)))
```

## Use and avoid

Use on one or two key calls to action in a playful design.

Avoid on touch devices, on pages with many buttons, in serious or formal contexts, and when the user prefers reduced motion (render a plain button).

Rules to keep it honest: the button must stay clickable wherever it has moved; keyboard focus must work with no movement at all; give touch users a visible pressed state instead; limit the tracked area to the button; try it on slower machines; check it with a screen reader.
