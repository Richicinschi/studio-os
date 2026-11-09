# Quality checklist

Work down by severity. Fix every Critical item before looking at High, and High before Medium.

## Critical (blocks shipping)
- [ ] Spatial movement is not linear
- [ ] Important state changes use more than opacity
- [ ] No move runs past a third of the container without a change in direction, speed or arc
- [ ] A primary layer exists
- [ ] The full stagger is under 500 ms
- [ ] No layout property is animated in a way that janks

## High
- [ ] A secondary layer exists
- [ ] Duration suits the element type
- [ ] Ease-out on entry, ease-in on exit
- [ ] One personality throughout
- [ ] Follow-through: children trail by 50-150 ms
- [ ] A prefers-reduced-motion version exists

## Medium
- [ ] An ambient layer exists
- [ ] There is an anticipation step where the move is large
- [ ] Overshoot suits the personality
- [ ] Paths arc naturally where they can
- [ ] Counter-motion balances the scene

## Supporting checks

**Reads well**
- [ ] Moving parts over 40 px, detail parts over 100 px
- [ ] Reads at full speed, not only in slow motion
- [ ] At most a third of the elements move at once

**Fits the feeling**
- [ ] Target emotion chosen before properties
- [ ] Personality suits the brand
- [ ] Setup, action, resolution all present
- [ ] Intensity matches how important the interaction is
- [ ] Same interaction, same motion, every time
- [ ] Still fine on the hundredth view

**Technical**
- [ ] Longer trips take proportionally longer
- [ ] Entrance is at least as long as the exit
- [ ] Main motion uses transform and opacity
- [ ] Fewer than about 20 animated elements in view
- [ ] Items are staggered, not simultaneous
- [ ] Holds 60fps (30fps is fine for ambient)

**Accessible**
- [ ] Vestibular triggers have an alternative
- [ ] Nothing important is conveyed by motion alone
- [ ] Moving content that starts automatically, lasts over five seconds and sits alongside other content can be paused, stopped or hidden, unless the motion is essential (WCAG 2.2 success criterion 2.2.2)
