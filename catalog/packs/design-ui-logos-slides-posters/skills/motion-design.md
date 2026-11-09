---
name: motion-design
description: >
  Use when creating animations, loading states, micro-interactions, page transitions, scroll-triggered
  effects, or any motion work. Sets timing, easing, choreography and Disney-style principles.
  Works across CSS, Framer Motion, GSAP, Lottie, Spring and other systems.
metadata:
  author: Richicinschi
  version: "1.0.0"
  category: design
  domain: motion principles for any stack (timing, easing, choreography, reduced motion), used on apps, agency sites and game interfaces
---

# Motion design

Motion is a decision about feeling first and a decision about CSS second. This page holds the limits you must respect and the values you will reach for most; the subfolders hold the reasoning and the recipes.

## Limits and defaults

Two kinds of number live in this skill. Do not mix them up.

- **Limits.** The four "never break" rules and the stagger cap below are fixed. Do not tune them.
- **Defaults.** Every duration, distance, percentage, count and element cap in the tables is a starting point from animation craft, to be tuned by eye; none is a measured fact. The few that come from a published source name it where they appear.

Never break:
1. Spatial movement is never linear. Linear belongs to spinners and progress bars only.
2. A meaningful state change is never opacity alone; pair it with position or scale.
3. Nothing travels past a third of the screen without a change in direction, speed or arc along the way.
4. A scene always has a primary layer. The secondary layer is expected (leaving it out is a High miss) and the ambient layer is wanted (leaving it out is a Medium miss).

Fixed cap: the total stagger stays under 500 ms, whatever the style. "Total stagger" means the time from the first item starting to the last item starting.

Follow closely: fit duration to the element, ease out on the way in and ease in on the way out, use anticipation and follow-through, hold one personality across the scene. The full severity ranking is in [the pre-ship checklist](motion-design/reference/quality-checklist.md).

## When to reach for this

- Buttons, cards, modals and page transitions that move
- Micro-interactions and feedback after a tap or click
- Loading, success and error states
- Illustrations or decorative pieces that should have life
- Animation tied to scroll or to progress
- A brand's motion identity
- Sequences where several things move together

Route by the job: feedback that answers the user starts at the duration limits; brand character starts at personality; storytelling or steering the eye starts at the Disney and choreography files; crowded scenes start at the one-third rules and stagger.

## Eight questions before you animate

1. What should the viewer feel: joy, calm, urgency, elegance?
2. Which personality fits: Playful, Premium, Corporate or Energetic?
3. Which single property carries the change?
4. How long, by the duration table?
5. Which easing family: decelerate when entering, accelerate when leaving?
6. Which element is the hero, and how is it staged?
7. What are the supporting and background layers?
8. Do the one-third limits hold for distance and for how many things move at once?

## Durations

| Element | Time | Why |
|---|---|---|
| Tooltip, tiny feedback | 80-120 ms | has to feel instant |
| Button press, toggle | 120-180 ms | answers the finger |
| Icon swap | 150-250 ms | the change must be readable |
| Card in or out | 200-350 ms | the eye needs to place it |
| Modal, dialog | 300-400 ms | attention moves |
| Page transition | 400-600 ms | context changes |
| Dramatic reveal | 600-1200 ms | a staged build |

- Longer trips take longer: take 100 px as 1.0x, 200 px as 1.3x, 400 px as 1.6x.
- Entrances run 30-50% longer than exits, because people watch what arrives.
- Response ceilings: hover under 100 ms, press under 150 ms, release or settle 200-300 ms, an error shake 300-400 ms with two or three swings.

Detail: [timing and easing tables](motion-design/reference/timing-easing-tables.md)

## Easing

By direction: entering decelerates (ease-out family); leaving accelerates (ease-in family); moving while visible uses ease-in-out; a repeating loop uses a sine-based ease-in-out so the seam is invisible.

Curves worth keeping to hand (the Material rows match the Material easing constants in the Flutter API reference, the CSS ease row is from the CSS Easing Functions specification, the rest are common curves from easing libraries):

| Curve | cubic-bezier | Good for |
|---|---|---|
| Material standard | cubic-bezier(0.2, 0, 0, 1) | default on-screen moves; also the quick, decisive "snappy" feel |
| Material emphasized decelerate | cubic-bezier(0.05, 0.7, 0.1, 1) | entrances and attention |
| Material standard accelerate | cubic-bezier(0.3, 0, 1, 1) | dismissals |
| CSS ease keyword | cubic-bezier(0.25, 0.1, 0.25, 1) | the browser default |
| Gentle float | cubic-bezier(0.4, 0, 0.2, 1) | background drift, premium feel |
| Bounce settle | cubic-bezier(0.175, 0.885, 0.32, 1.275) | playful overshoot |

Names used in this skill without values, with the usual easing-library equivalents (unsourced starting points, check against your library):

| Name | cubic-bezier |
|---|---|
| ease-out-back | cubic-bezier(0.34, 1.56, 0.64, 1) |
| ease-out-expo | cubic-bezier(0.16, 1, 0.3, 1) |
| ease-out-cubic | cubic-bezier(0.33, 1, 0.68, 1) |
| sine ease-in-out | cubic-bezier(0.37, 0, 0.63, 1) |
| cubic ease-in-out | cubic-bezier(0.65, 0, 0.35, 1) |

An imagined material changes pace and bounce together:

| Feels like | Time multiplier | Overshoot |
|---|---|---|
| Smoke, fog | 2.0x | none |
| Water, paint | 1.5x | 5% |
| Metal, stone | 1.2x | none |
| Paper | 1.0x | 3-5% |
| Glass | 0.9x | none |
| Rubber, gel | 0.8x | 15-25% |

## Personality

Choose one archetype for the whole project and stay with it. With no brief, use Corporate for interface work and Playful for illustration.

| Archetype | Cues in the brief | Speed | Curve | Overshoot |
|---|---|---|---|---|
| Corporate | clean, business, dashboard, professional | 200-400 ms | cubic-bezier(0.2, 0, 0, 1) | 0-3% |
| Playful | fun, whimsical, cute, bouncy | 150-300 ms | ease-out-back | 10-20% |
| Premium | elegant, minimal, luxury, sophisticated | 350-600 ms | cubic-bezier(0.4, 0, 0.2, 1) | none |
| Energetic | dynamic, energetic, bold, exciting | 100-250 ms | ease-out-expo | 15-30% |

A brand's motion identity is three fixed choices: one signature curve for about 80% of moves, three durations (quick, standard, slow), and one entrance style every new element repeats.

Detail: [motion personality](motion-design/director/motion-personality.md)

Weight also shapes timing:

| Weight | Typical items | Time | Overshoot | Feel |
|---|---|---|---|---|
| Heavy | modals, overlays | 300-500 ms | none | soft, well damped |
| Medium | cards, panels | 200-350 ms | 3-5% | balanced |
| Light | tooltips, badges, icons | 80-200 ms | 5-15% | quick to respond |

## Pillars and layers

Settle these before any technical choice.

| Pillar | Ask yourself | It decides |
|---|---|---|
| Emotional intent | What do I want them to feel? | curve, speed, size of the move |
| Visual narrative | What is the tiny story? | setup, then action, then resolution |
| Motion craft | Does it look physically plausible? | weight, secondary motion, paths |

Layers: primary is the move the eye follows; secondary is supporting detail such as a shadow or an icon that shifts; ambient is slow background life such as a drifting gradient or a soft pulse. A flat scene is missing a layer.

Detail: [core philosophy](motion-design/director/core-philosophy.md)

## Properties

| What you want to say | Lead with | Add lightly |
|---|---|---|
| Something arrives or leaves | position | opacity, scale |
| Look here | scale | a faint rotation, an opacity pulse |
| The state changed | opacity or colour | a press-down scale |
| This way | position | rotation along the path |
| Depth | scale with a shadow | parallax position |
| Working on it | rotation (spinner) | scale, opacity pulse |
| It worked | scale pop | colour, a drawn checkmark |
| Something is wrong | horizontal shake | colour, a small wobble |

Use as few properties as will do the job: one is plain, two is polished, three or more tends to clutter.

Detail: [property selection](motion-design/reference/property-selection.md)

## Four worked recipes

**Playful button press**
1. Anticipate: shrink to 0.97 over 50 ms, ease-out.
2. Squash to 1.04 wide by 0.96 tall over 100 ms, ease-in.
3. Follow through: pass 1.02, settle at 1.0 with a spring (about 200 ms).
4. Secondary: the shadow tightens while pressed and the icon drops 2 px.
5. Budget: roughly 150 ms down plus 200 ms to settle.

**Premium card entrance**
1. Start 20 px low and fully transparent.
2. Travel on a shallow curve (about 10 px sideways at the midpoint).
3. Decelerate with ease-out-cubic.
4. The shadow lands 50 ms after the card; the card's content fades in 100 ms after it lands.
5. Neighbouring cards dim to 80% while it arrives.

**Playful success**
1. The badge pops in with ease-out-back.
2. A checkmark draws itself.
3. A small particle burst sits in the background.
4. Fill goes green.
5. All of it in 300-400 ms.

**Corporate error shake**
1. Swing 10-15 px each way, two or three times.
2. Ease-in-out so each stop is crisp.
3. Tint red.
4. 300-400 ms in total, no overshoot, because errors should feel firm.

More recipes: [entrances and exits](motion-design/patterns/entrance-exit.md), [state feedback](motion-design/patterns/state-feedback.md)

## Choreography

- The hero moves first or most boldly, and everything enters from the same side.
- Give the background a gentle counter-move at 20-30% of the hero's speed.
- With three or more animated pieces, at most a third move at the same instant.

Stagger styles. The cap above applies to all of them:

| Style | Gap between items | Whole sequence | Typical use |
|---|---|---|---|
| Micro cascade | 20-40 ms | under 200 ms | list rows, grid cells |
| Standard | 50-100 ms | under 400 ms | cards, panels, nav |
| Dramatic | 100-200 ms | up to the 500 ms cap | hero sections |
| Wave | 30-60 ms | under 500 ms | charts and other data visualisations |

Detail: [choreography](motion-design/director/choreography.md)

## Emotion map

| Feeling | Shape of motion | Path | Curve | Time |
|---|---|---|---|---|
| Joy | bouncy, rising | curved, upward | ease-out-back | 200-400 ms |
| Calm | smooth, flowing | gentle curves | sine ease-in-out | 500-1000 ms |
| Urgency | sharp | straight lines | ease-out | 100-200 ms |
| Sadness | slow, sinking | drooping curves | cubic ease-in-out | 600-1200 ms |
| Surprise | sudden, spreading | radiating outward | ease-out-expo | 150-300 ms |
| Elegance | slow, controlled | long arcs | cubic-bezier(0.4, 0, 0.2, 1) | 400-700 ms |
| Playfulness | irregular, bouncy | arcs, squiggles | ease-out-back | 200-350 ms |

Paths speak too: angular reads tense, curved reads friendly, spiral reads whimsical, diagonal reads purposeful, vertical suggests growth or weight, horizontal suggests progress.

Detail: [emotion mapping](motion-design/director/emotion-mapping.md)

## Quick fixes

| Symptom | Probable cause | Remedy |
|---|---|---|
| Robotic | linear easing, straight paths | real curves, arced paths |
| Sluggish | duration too long for the element | consult the table, prefer ease-out |
| Cheap or flat | no secondary or ambient layer | animate shadows, add background life |
| Distracting | too much moving | one-third rule, smaller amplitude |
| Characterless | one default curve everywhere | use the archetype's signature consistently |

Detail: [troubleshooting](motion-design/reference/troubleshooting.md)

## Where the detail lives

Philosophy, in motion-design/director/:
- [Philosophy](motion-design/director/core-philosophy.md): the pillars and layers in depth
- [Decision framework](motion-design/director/decision-framework.md): the full decision path
- [Disney principles](motion-design/director/disney-principles.md): twelve principles for UI
- [Personality](motion-design/director/motion-personality.md): four archetypes and brand identity
- [Emotion map](motion-design/director/emotion-mapping.md): feeling to motion, plus colour
- [Choreography](motion-design/director/choreography.md): coordinating many elements
- [Narrative](motion-design/director/narrative-structure.md): the micro-story
- [Context](motion-design/director/context-adaptation.md): platform, accessibility, performance

Lookup tables, in motion-design/reference/:
- Times and curves: [timing-easing-tables.md](motion-design/reference/timing-easing-tables.md)
- What each property says: [property-selection.md](motion-design/reference/property-selection.md)
- Symptoms and fixes: [troubleshooting.md](motion-design/reference/troubleshooting.md)
- Pre-ship ticks: [quality-checklist.md](motion-design/reference/quality-checklist.md)

Recipes, in motion-design/patterns/:
- [Entrances and exits](motion-design/patterns/entrance-exit.md)
- [State feedback](motion-design/patterns/state-feedback.md)
- [Ambient loops](motion-design/patterns/ambient-continuous.md)
- [Many elements](motion-design/patterns/multi-element.md)
