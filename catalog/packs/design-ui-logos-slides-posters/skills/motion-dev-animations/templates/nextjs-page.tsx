/**
 * One-page Next.js template: hero, feature grid, parallax testimonial, closing call to action.
 *
 * - Transform and opacity carry the motion; shadows and button background colour also change on hover.
 * - MotionConfig with reducedMotion="user" switches off transform and layout animations when the
 *   OS asks for less motion. Opacity and colour animations still play, and scroll-linked motion
 *   values (the Testimonial parallax) are not covered, so that one checks useReducedMotion itself.
 * - Replace the copy, then split the sections into their own files.
 */
"use client"

import { motion, MotionConfig, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"

const EASE = [0.22, 1, 0.36, 1] as const
const SPRING = { type: "spring", stiffness: 300, damping: 20 } as const

function Hero() {
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  })

  return (
    <section className="relative min-h-screen grid place-items-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black" />
      <div className="relative z-10 max-w-4xl px-8 text-center">
        <motion.h1 className="text-6xl md:text-8xl font-bold mb-6" {...rise(0)}>
          Your product name
        </motion.h1>
        <motion.p className="text-xl md:text-2xl text-gray-400 mb-8" {...rise(0.1)}>
          One sentence on what it does for whom
        </motion.p>
        <motion.button
          className="px-8 py-4 bg-white text-black rounded-full font-medium"
          {...rise(0.2)}
          whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6", transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
        >
          Get started
        </motion.button>
      </div>
    </section>
  )
}

const FEATURES = [
  { icon: "⚡", title: "Fast", description: "Light motion that never blocks the page" },
  { icon: "🎨", title: "Considered", description: "Small details, applied consistently" },
  { icon: "♿", title: "Inclusive", description: "Honours the reduced-motion setting" },
]

const GRID = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
}
const TILE = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

function Features() {
  return (
    <section className="py-24 px-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4">Why choose us</h2>
        <p className="text-xl text-gray-600">Three reasons</p>
      </motion.div>

      <motion.div
        variants={GRID}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        {FEATURES.map(f => (
          <motion.article
            key={f.title}
            variants={TILE}
            className="bg-white rounded-2xl p-8"
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
            transition={SPRING}
          >
            <div className="text-4xl mb-4" aria-hidden>{f.icon}</div>
            <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
            <p className="text-gray-600">{f.description}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}

function Testimonial() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const reduce = useReducedMotion()
  const glowY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "20%"])
  const fade = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])

  return (
    <section ref={ref} className="relative overflow-hidden py-24 px-8 bg-black text-white">
      <motion.div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent" style={{ y: glowY }} />
      <motion.div className="relative z-10 max-w-4xl mx-auto text-center" style={{ opacity: fade }}>
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-3xl md:text-4xl font-light italic mb-8"
        >
          “A sentence from a real customer goes here.”
        </motion.blockquote>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400"
        >
          Name, role, company
        </motion.p>
      </motion.div>
    </section>
  )
}

function Closing() {
  return (
    <section className="py-24 px-8 bg-white">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <h2 className="text-5xl font-bold mb-6">Ready when you are</h2>
        <p className="text-xl text-gray-600 mb-8">A line that lowers the stakes</p>
        <motion.button
          className="px-12 py-5 bg-blue-500 text-white rounded-full font-bold text-lg"
          whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          Start now
        </motion.button>
      </motion.div>
    </section>
  )
}

export default function AnimatedPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main>
        <Hero />
        <Features />
        <Testimonial />
        <Closing />
      </main>
    </MotionConfig>
  )
}
