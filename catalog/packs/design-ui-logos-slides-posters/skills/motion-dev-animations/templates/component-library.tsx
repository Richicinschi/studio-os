/**
 * Ten small animated components. Copy the ones you need; they only share the two
 * constants EASE and SPRING at the top, so bring those along.
 * Reduced motion: wrap the app in <MotionConfig reducedMotion="user"> to switch off transform and
 * layout animations globally; components that animate height or loop (Accordion, LoadingSpinner)
 * also check useReducedMotion themselves.
 */

import { AnimatePresence, motion, useMotionValue, useSpring, useReducedMotion } from "motion/react"
import { useRef, type MouseEvent, type ReactNode } from "react"

const EASE = [0.22, 1, 0.36, 1] as const
const SPRING = { type: "spring", stiffness: 300, damping: 20 } as const

// 1. FadeUp: entrance on mount ----------------------------------------------

export function FadeUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

// 2. ScrollReveal: plays once when scrolled into view ---------------------------

const FROM = {
  up: { y: 50 },
  down: { y: -50 },
  left: { x: 50 },
  right: { x: -50 },
} as const

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
}: {
  children: ReactNode
  direction?: keyof typeof FROM
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, ...FROM[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

// 3. HoverCard: lifts on hover and on keyboard focus ---------------------------

export function HoverCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const lifted = { y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }
  return (
    <motion.div
      tabIndex={0}
      className={`bg-white rounded-2xl p-6 cursor-pointer ${className}`}
      initial={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      whileHover={lifted}
      whileFocus={{ ...lifted, outline: "2px solid #3b82f6", outlineOffset: "2px" }}
      transition={SPRING}
    >
      {children}
    </motion.div>
  )
}

// 4. MagneticButton: leans toward the pointer ------------------------------

export function MagneticButton({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING)
  const sy = useSpring(y, SPRING)

  function follow(e: MouseEvent<HTMLButtonElement>) {
    const b = ref.current?.getBoundingClientRect()
    if (!b) return
    x.set((e.clientX - (b.left + b.width / 2)) * 0.3)
    y.set((e.clientY - (b.top + b.height / 2)) * 0.3)
  }

  return (
    <motion.button
      ref={ref}
      className={`px-8 py-4 bg-blue-500 text-white rounded-full font-medium ${className}`}
      style={{ x: sx, y: sy }}
      onMouseMove={follow}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

// 5. StaggeredList: children enter one after another -------------------------

const LIST = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const ROW = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function StaggeredList({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  return (
    <motion.ul variants={LIST} initial="hidden" animate="visible" className={className}>
      {items.map((item, i) => (
        <motion.li key={i} variants={ROW}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}

// 6. ScaleButton: grows on hover, shrinks on press ---------------------------

export function ScaleButton({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.button
      className={`px-6 py-3 bg-blue-500 text-white rounded-lg font-medium ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}

// 7. Accordion: height animates to and from auto -----------------------------
// Height is a layout property, so this one trades a little performance for
// convenience. Keep panels short.

export function Accordion({
  title,
  children,
  isOpen,
  onToggle,
}: {
  title: string
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
}) {
  const reduce = useReducedMotion()
  return (
    <div className="border-b border-gray-200">
      <motion.button
        className="w-full py-4 text-left font-medium flex justify-between items-center"
        aria-expanded={isOpen}
        onClick={onToggle}
        whileHover={{ color: "#3b82f6" }}
      >
        <span>{title}</span>
        <motion.span aria-hidden animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          ▼
        </motion.span>
      </motion.button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={
          reduce
            ? { duration: 0 }
            : {
                height: { duration: 0.3, ease: EASE },
                opacity: { duration: 0.2, delay: isOpen ? 0.1 : 0 },
              }
        }
        className="overflow-hidden"
      >
        <div className="pb-4 text-gray-600">{children}</div>
      </motion.div>
    </div>
  )
}

// 8. Modal: backdrop plus panel. Takes isOpen and owns its AnimatePresence,
// so the exit animation plays when isOpen turns false.
// The panel wrapper ignores pointer events and the card re-enables them, so a
// click on the dim area reaches the backdrop and calls onClose.

export function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 bg-black/50 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.div
          key="panel"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 grid place-items-center z-50 p-4 pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl pointer-events-auto">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 9. LoadingSpinner: endless rotation -------------------------------------

export function LoadingSpinner() {
  const reduce = useReducedMotion()
  return (
    <motion.div
      role="status"
      aria-label="Loading"
      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      // reduced motion: a pulse of opacity instead of a spin
      animate={reduce ? { opacity: [1, 0.4, 1] } : { rotate: 360 }}
      transition={
        reduce
          ? { duration: 1.6, repeat: Infinity }
          : { duration: 1, repeat: Infinity, ease: "linear" }
      }
    />
  )
}

// 10. ToggleSwitch: knob slides on a spring ---------------------------------

export function ToggleSwitch({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <motion.button
      role="switch"
      aria-checked={isOn}
      className="relative w-14 h-8 rounded-full p-1"
      onClick={onToggle}
      animate={{ backgroundColor: isOn ? "#3b82f6" : "#e5e7eb" }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        animate={{ x: isOn ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
      />
    </motion.button>
  )
}

/*
Usage

  import { FadeUp, ScrollReveal, HoverCard, ToggleSwitch } from "./component-library"

  <FadeUp delay={0.1}><h1>Hello</h1></FadeUp>
  <ScrollReveal direction="left"><HoverCard>Feature</HoverCard></ScrollReveal>
  <ToggleSwitch isOn={on} onToggle={() => setOn(v => !v)} />

  <Modal isOpen={open} onClose={() => setOpen(false)}>Hi</Modal>
*/
