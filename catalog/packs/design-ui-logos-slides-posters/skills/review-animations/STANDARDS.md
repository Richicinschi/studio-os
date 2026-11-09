# Animation Standards Reference

The values and patterns behind the review; quote them in findings rather than estimating. The figures are working values, tune per product, and they are still the bar the review enforces: the gates stay gates. Three kinds of figure are plainly tunable starting points and are marked as such: the drag velocity threshold, the stagger spacing and spring bounce. Where a public source supports a figure, it is named in place.

## Contents, in the order a reviewer needs them

1. What the browser can animate cheaply
2. Transform tricks and clip-path
3. Curves and timing
4. Shape: start state, interruption, springs, gestures
5. Polish: blur and stagger
6. Judgement: frequency, accessibility, fit, checking

---

## 1. What the browser can animate cheaply

- **Animate `transform` and `opacity`.** Browsers can usually run these on the compositor, without layout or paint. `padding`, `margin`, `height`, `width`, `top` and `left` force layout, paint and composite every frame.
- **Paint-cost exceptions.** `clip-path` and `filter` are not compositor properties in every browser, yet the techniques below depend on them. They are acceptable when a profile shows they stay smooth; check rather than assume.
- **Do not push a child's transform through a parent CSS variable.** It makes the browser recalculate styles for every child. Write `transform` on the element itself.
  ```js
  element.style.setProperty('--drag-offset', `${dy}px`); // bad: restyles all children
  element.style.transform = `translateY(${dy}px)`;        // good: touches one element
  ```
- **JavaScript-driven transform props can drop frames on a busy page.** Current Motion documentation says its independent transform shorthands (`x`, `y`, `scale`) are hardware accelerated, and that acceleration of some transforms (for instance percentage-based ones) has depended on the browser. Do not assume either way: confirm in the browser's performance panel. If frames drop, pass a full transform string or use CSS or WAAPI:
  ```jsx
  <motion.div animate={{ x: 60 }} />                          // verify it stays smooth under load
  <motion.div animate={{ transform: "translateX(60px)" }} />  // full transform string alternative
  ```
- **Compositor-run CSS usually holds up better than requestAnimationFrame code under load.** Main-thread JavaScript animation stutters while the page loads, scripts and paints; compositor-run `transform`/`opacity` animation mostly does not. Use CSS for motion known in advance and JavaScript for dynamic or interruptible motion.
- **WAAPI** gives JavaScript the controls with CSS-style playback (interruptible, no library). Whether a given property is accelerated is the same question as above.
  ```js
  element.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    { duration: 700, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
  ```

## 2. Transform tricks and clip-path

- **`translate` percentages** refer to the element's own size, so `translateY(100%)` moves it by its own height whatever that is. Prefer it to fixed pixels, but test it in the browsers you support, since percentage transforms were not accelerated in some older Chrome versions according to the Motion documentation.
- **`scale()` scales the contents too** (text, icons), which is handy for press feedback.
- **3D**: `rotateX`/`rotateY` with `transform-style: preserve-3d` gives depth, orbits and flips with no JavaScript.
- **`clip-path: inset(t r b l)`**: each number trims from that side. Uses: scroll reveals (`inset(0 0 100% 0)` to `inset(0 0 0 0)`), hold-to-delete overlays, tab colour changes (stack a copy and clip the active one) and comparison sliders. See the paint-cost note above.

## 3. Curves and timing

### Easing

Choose by situation:
- Entering or leaving the screen: **`ease-out`** (fast start, feels responsive)
- Moving or morphing while visible: **`ease-in-out`**
- Hover or colour change: **`ease`**
- Constant motion (marquee, progress bar): **`linear`**
- Unsure: **`ease-out`**

**Never use `ease-in` in UI.** It begins slowly, wasting the moment the user is watching. An `ease-out` of 200ms feels quicker than an `ease-in` of 200ms.

The stock CSS keywords are too soft. Define stronger curves:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for movement on screen */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-style drawer curve (Ionic) */
```

Pick curves from an online easing-curve picker instead of inventing them.

### Duration

| Element | Duration |
| --- | --- |
| Button press feedback | 100 to 160ms |
| Tooltips, small popovers | 125 to 200ms |
| Dropdowns, selects | 150 to 250ms |
| Modals, drawers | 200 to 500ms |
| Marketing or explanatory pieces | May run longer |

**Interface motion stays under 300ms**, except where this table gives that element a longer range, and except deliberate holds (see "Uneven timing"). A 180ms dropdown feels snappier than a 400ms one. A faster spinner makes loading feel shorter even though the wait is identical. Skipping the delay and animation on every tooltip after the first makes a toolbar feel quicker.

### Uneven timing

Be slow where the user is deciding and quick where the system answers. A deliberate hold is the one case where a long duration is correct.

```css
.fill { transition: clip-path 180ms ease-out; }            /* letting go: quick */
.hold-btn:active .fill { transition: clip-path 1.5s linear; }  /* holding: slow and deliberate */
```

## 4. Shape: start state, interruption, springs, gestures

### Start state and origin

- **No `scale(0)`.** Begin at `scale(0.9)` to `scale(0.97)` with `opacity: 0`. Objects do not materialise from a point.
- **Popovers grow from their trigger**, not the centre:
  ```css
  .menu { transform-origin: var(--radix-popover-content-transform-origin); } /* Radix */
  .menu { transform-origin: var(--transform-origin); }                       /* Base UI: exposed on the Positioner */
  ```
  Base UI sets `--transform-origin` on its Positioner part; the popup inherits it, so read it from the positioner or from a popup nested inside it.
  **Modals are exempt.** They open in the middle of the viewport, so `transform-origin: center` is right.
- **Press feedback.** Use `transform: scale(0.97)` on `:active` with `transition: transform 160ms ease-out`. Stay subtle (0.95 to 0.98). Any pressable element can use it.

### Interruption

A CSS **transition** can be retargeted mid-flight; a **keyframe** animation restarts from zero. For anything triggered in quick succession (stacking toasts, toggles), use transitions.

```css
/* Retargets smoothly: use for dynamic UI */
.snackbar { transition: transform 350ms ease; }

/* Restarts from the beginning: avoid for dynamic UI */
@keyframes riseUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
```

`@starting-style` gives entry motion without any JavaScript:

```css
.snackbar {
  opacity: 1; transform: translateY(0);
  transition: opacity 350ms ease, transform 350ms ease;
  @starting-style { opacity: 0; transform: translateY(100%); }
}
```

For browsers without it, set a `data-mounted` attribute from `useEffect(() => setMounted(true), [])` and key the styles off that.

### Springs

A spring is driven by physics, so it has no set duration; it settles according to its parameters. Good for drag with momentum, elements that should feel alive (Dynamic Island style), gestures that can be interrupted, and decorative pointer following.

```js
// Duration and bounce (simpler to reason about) - preferred
{ type: "spring", duration: 0.5, bounce: 0.2 }

// Mass, stiffness, damping (finer control)
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

Bounce is tunable: start small (0.1 to 0.3) and skip it in most UI; save it for drag-to-dismiss and playful moments. A spring carries its velocity when interrupted, whereas a keyframe animation restarts at zero, so springs suit gestures the user might reverse halfway.

For pointer tracking, run the value through `useSpring` rather than binding it straight to the pointer position, which feels mechanical and has no inertia. Do this only when the effect is decorative.

### Gestures and dragging

- **Dismiss on momentum.** Do not demand a minimum distance. Compute velocity as `Math.abs(distance)/elapsedMs` and dismiss above a threshold; about 0.11 pixels per millisecond is a tunable starting point. A flick should be enough.
- **Damp at the edges.** Beyond a natural boundary, move less the further the pointer goes, since real objects slow before they stop. Allow over-drag with growing resistance instead of an invisible wall.
- **Capture the pointer** once the drag starts, so it keeps tracking outside the element's bounds.
- **Guard against extra touches.** After the drag begins, ignore additional touch points (`if (isDragging) return`) to avoid jumps.

## 5. Polish: blur and stagger

- **Hiding a rough crossfade.** If two states visibly overlap even after tuning easing and duration, add a light `filter: blur(2px)` during the change so they read as one transformation. Keep blur under 20px; heavy blur is expensive to render.
- **Stagger.** Offset a group's entrance by 30 to 80ms per item (tunable); longer gaps feel sluggish. Stagger is decoration, so never block interaction while it runs.
  ```css
  .row { opacity: 0; transform: translateY(6px); animation: appear 260ms ease-out forwards; }
  .row:nth-child(2) { animation-delay: 40ms; }
  .row:nth-child(3) { animation-delay: 80ms; }
  @keyframes appear { to { opacity: 1; transform: translateY(0); } }
  ```

## 6. Judgement: frequency, accessibility, fit, checking

### Should it move at all?

| How often the user sees it | Decision |
| --- | --- |
| 100+ times a day (keyboard shortcuts, command palette toggle) | No motion, ever |
| Tens of times a day (hover effects, list navigation) | Remove, or cut way down |
| Occasionally (modals, drawers, toasts) | Normal motion |
| Rarely or once (onboarding, feedback, celebrations) | Room for delight |

Never animate keyboard-triggered actions. They repeat all day, and motion makes them feel laggy and detached. Legitimate reasons to move: keep spatial context, show state, explain, give feedback, soften an abrupt change. "It looks cool" on something seen constantly is not one.

### Accessibility

```css
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .panel { animation: fade 0.15s ease; } /* keep opacity and colour, drop transform movement */
}
@media (hover: hover) and (pointer: fine) {
  .panel:hover { transform: scale(1.03); } /* gate hover motion: touch screens fire phantom hovers on tap */
}
```

```jsx
const reduce = useReducedMotion();
const hiddenX = reduce ? 0 : '-100%';
```

Reduced motion means fewer and softer animations, not none. Keep the ones that help people follow what happened and remove travel and position changes.

### Fit with the product

Motion should match the component's character: playful can bounce more, a professional dashboard stays brisk. A gentler `ease` and slightly longer timing can suit a refined, calm component. For opacity plus height in lists that enter and leave, there is no formula, so adjust by trial until it feels right.

### Checking by eye (suggest this when feel is uncertain)

- **Slow motion**: multiply durations by 2 to 5, or use the DevTools animation inspector. Look for clean colour crossfades, easing that does not halt abruptly, the right `transform-origin`, and linked properties staying in step.
- **Frame by frame**: the Chrome DevTools Animations panel shows timing drift between properties that should move together.
- **Real hardware** for gestures such as drawers and swipes: connect a phone, open the dev server by its network address and use Safari's remote devtools.
- **Look again tomorrow.** Flaws that hide while you build show up later.
