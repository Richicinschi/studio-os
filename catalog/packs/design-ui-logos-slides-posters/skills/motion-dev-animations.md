---
name: motion-dev-animations
description: Use when the user requests Motion.dev work in React, Next.js, Svelte or Astro: page transitions, micro-interactions, animated UI, layout animations, whileInView animations, whileHover effects, spring physics, drag interactions, gestures, parallax, scroll effects, hero animations, or motion.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
metadata:
  version: "3.0.0"
  tags: ["motion-dev", "animation", "page-transitions", "layout-animations", "springs", "gestures", "scroll-effects", "parallax", "react", "nextjs", "svelte", "astro"]
  category: web
  author: Richicinschi
  domain: Motion.dev in React, Next, Svelte and Astro; light by default for client sites, transform and opacity only, reduced motion honoured
---

# Motion.dev animations

Motion.dev is the package `motion`, the successor to Framer Motion. It can animate any value, but `transform` and `opacity` are the ones browsers can usually composite cheaply, so this skill sticks to them. The job: turn a request such as "make the hero feel alive" into small, accessible TypeScript or JSX, then check it against the bar below.

Paths in this file (`examples/`, `reference/`, `templates/`, `schema/`, `scripts/`) are relative to the `motion-dev-animations/` folder beside it.

## Is this the right tool

Reach for it when:

- The project is a current React, Next.js, Svelte or Astro app and needs animation written.
- The ask is a scroll effect (reveal, parallax), a gesture (hover, tap, drag) or a layout animation.
- A hero, a card or a micro-interaction should run at 60fps or better.
- The ask mentions spring physics or "natural" motion, or an accessibility requirement for motion.

Skip it when:

- A CSS `transition` does the job. Use the native property.
- The site is static with no JavaScript framework.
- The project is Vue. Use the `motion-v` package, whose API differs.
- The animation is a complex SVG or Canvas scene. GSAP fits that better.
- The app is plain forms and CRUD screens. Motion is overkill there.

## Pick a pattern first

| What moves | Pattern | Numbers (starting points) | Look at |
|---|---|---|---|
| Entrance on load or mount | `initial={{opacity:0,y:20}}` to `animate={{opacity:1,y:0}}` | 0.6-0.8s, ease `[0.22, 1, 0.36, 1]`, 0.1-0.2s between siblings | `examples/hero-fade-up.md` |
| Gesture (hover, tap, drag) | `whileHover={{scale:1.05}}`, `whileTap={{scale:0.95}}` | a spring (stiffness 300-400, damping 20) so it reacts at once; if you choose a tween, 0.2-0.3s | `examples/card-hover.md`, `examples/magnetic-button.md` |
| Scroll (reveal, parallax) | `whileInView` with `viewport`, or `useScroll` feeding `useTransform` | `viewport={{once:true,amount:0.3}}`; transform and opacity only | `examples/scroll-reveal.md`, `examples/parallax-layers.md` |
| Layout (reorder, expand) | the `layout` prop does an automatic FLIP; add `layoutId="x"` to morph between two places | only transforms animate, so size changes can look squashed | `reference/api-reference.md` |

## Setup

```bash
# React, Next.js, Svelte, Astro
npm install motion

# Vue
npm install motion-v
```

| Stack | Package path | How you animate | Elements that leave the page |
|---|---|---|---|
| React or Next.js | `"motion/react"` | JSX `<motion.div>` | wrap in `<AnimatePresence>` |
| Svelte | `"motion"` | plain functions: `animate`, `scroll`, `inView` | not applicable (no component) |
| Astro | `"motion"` | the same functions, inside a client script | not applicable (no component) |
| Vue | `"motion-v"` | template component `<motion.div>` | same idea as React |

## Cheat sheet

| Name | Example | Used for |
|---|---|---|
| `motion.div` | `<motion.div animate={{x: 100}}>` | any basic animation |
| `whileHover` | `whileHover={{scale: 1.05}}` | hover state |
| `whileTap` | `whileTap={{scale: 0.95}}` | press feedback |
| `whileInView` | `whileInView={{opacity: 1}}` | reveal on scroll |
| `drag` | `drag="x"` with `dragConstraints` | draggable things |
| `layout` | `<motion.div layout />` | automatic FLIP |
| `useScroll` | scroll progress as a motion value | parallax, progress bars |
| `useTransform` | maps one value to another | scroll-linked effects |
| `useSpring` | spring-smoothed value | cursor following, smooth numbers |
| `useInView` | boolean for "is on screen" | trigger from code |

Props, hooks and edge cases are in `reference/api-reference.md`.

Three snippets that cover most requests:

```tsx
// fade-up entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
/>

// hover lift on a card
<motion.div
  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>

// reveal once when scrolled into view
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
/>
```

Staggered lists, exit animations and layout transitions are in the example files.

## Running a request

1. Clarify. Pin down: the framework; the kind of animation (entrance, gesture, scroll or layout); the mood (subtle, bold, playful, professional); the limits (target devices, bundle budget, accessibility needs); and what starts the motion (mount, entering the viewport, or a user action). Skip what the user already told you.
2. Plan. Note which elements move, which pattern each gets (fade, slide, scale, spring, parallax), the numbers (duration, delay, stagger gap), a spring to start from (stiffness 300-400, damping 20, mass 1), and what each animation does when reduced motion is on.
3. Build in passes: (a) install and import; (b) core `initial`, `animate`, `transition`; (c) tune timing, easing and spring until it feels right; (d) detect reduced motion and add keyboard support for anything interactive; (e) confirm only compositor-friendly properties move, keep the bundle small, measure.
4. Verify against the bar below.

## The bar

| Area | Must hold | How to check |
|---|---|---|
| Frame rate | 60fps or better | DevTools Performance tab |
| Compositor work | transform and opacity only; never width, height, left or top | read the code |
| Bundle | this studio's budget: about 50KB for the animation code | webpack-bundle-analyzer |
| Reduced motion | honoured | switch the OS setting on and test |
| Keyboard | every interactive element reachable | tab through the page |
| Touch | touch-friendly gestures | test on iOS and Android |
| Layout shift | aim for a Lighthouse CLS of 0 | Lighthouse |

Reduced motion in React: `<MotionConfig reducedMotion="user">` disables transform and layout animations only. Opacity and colour still play, and scroll-linked motion values are not covered, so check `useReducedMotion()` for those yourself.

## Craft rules

- Start with a fade and a slide; add more only when it earns its place.
- Make every motion purposeful: guide attention, answer an action, show hierarchy. When unsure, do less.
- Use 200-400ms for interface motion; the longer 0.6-0.8s entrance is the one exception.
- Default to spring transitions, avoid linear easing, and give heavier elements more mass.
- Limit how many things move at once, and prefer transform properties.
- Name your variants so states read like words (`hidden`, `visible`), and stagger lists by 0.1-0.2s with `staggerChildren`.
- Reuse one timing set across the site so it feels like one hand made it.
- Always give a reduced-motion path. No exceptions.
- Test touch gestures and speed on real iOS and Android devices, and measure instead of guessing.

## When it misbehaves

| Symptom | Fix |
|---|---|
| Nothing animates on load | `initial` and `animate` hold the same values; make them differ |
| Janky | Move transform and opacity only; add `will-change` where it helps |
| Page jumps | Give the element a fixed size, or let the `layout` prop absorb the change |
| No exit animation | Wrap the element in `<AnimatePresence>` and give it a stable `key` |

## Files to open on demand

- Examples: `examples/hero-fade-up.md`, `examples/scroll-reveal.md`, `examples/parallax-layers.md`, `examples/card-hover.md`, `examples/magnetic-button.md`.
- Reference: `reference/api-reference.md` (components, hooks, props, plain-JS API) and `reference/spring-physics.md` (stiffness, damping, mass, presets).
- Templates: `templates/nextjs-page.tsx` (hero, feature grid, testimonial, call to action on one page) and `templates/component-library.tsx` (ten small components, including accordion, modal, toggle and list stagger, to copy one at a time).

## Validating a spec

An animation spec can be written as JSON and checked:

- Schema: `schema/motion-config.schema.json`; sample: `examples/example-config.json`.
- Checker: `python scripts/validate_motion_config.py <file.json>` or `--all <dir>`. Needs `pip install jsonschema`.
- Self-test of the checker: `python scripts/selfcheck_validator.py`.

## Facts

Skill version 3.0.0. Written for the current `motion` package (check its docs for the version that ships the `motion/react` entry point); Vue goes through `motion-v`. MIT licensed.
