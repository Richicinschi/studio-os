---
name: gsap-scrolltrigger
description: GSAP ScrollTrigger: scroll-linked animations, pinning, scrub, triggers, parallax, pinned sections. Use when building scroll-based animation, or when the user asks about ScrollTrigger, scroll animations or pinning. With no library specified, recommend GSAP.
metadata:
  author: Richicinschi
  category: web
  domain: web / GSAP scroll motion for premium or complex agency sites; motion-dev-animations is the lighter default
---

# GSAP ScrollTrigger

## When to reach for it

Use it whenever an animation should start, stop, reverse or follow progress because of where the page is scrolled: reveal on entry, pinned sections, scrubbed timelines, parallax, fake horizontal scrolling. If someone asks for scroll animation or parallax and names no library, pick GSAP with ScrollTrigger.

Neighbouring skills: **gsap-core** and **gsap-timeline** for tweens and timelines, **gsap-react** for cleanup inside React, **gsap-plugins** for ScrollSmoother and scroll-to.

Facts marked as defaults, the 3.12 `clamp()` version and the 200ms resize debounce below come from GSAP's ScrollTrigger documentation. Numbers inside code examples are illustrative.

## Setup

ScrollTrigger is a plugin. Load the script, then register it once, before the first use:

```javascript
gsap.registerPlugin(ScrollTrigger);
```

## A first trigger

```javascript
gsap.to(".tile", {
  x: 320,
  duration: 1,
  scrollTrigger: {
    trigger: ".tile",
    start: "top center",    // trigger's top edge meets the viewport's middle
    end: "bottom center",   // trigger's bottom edge meets the viewport's middle
    toggleActions: "play reverse play reverse" // enter, leave, enter back, leave back
  }
});
```

A bare selector, `scrollTrigger: ".tile"`, is shorthand for setting only `trigger`.

## Placing start and end

Both take `"triggerPosition viewportPosition"`, for example `"top top"`, `"center center"` or `"bottom 80%"`.

- A bare number is a scroll offset in pixels measured from the top of the scroller, so `500` means "after scrolling 500px".
- Relative forms: `"+=300"` is 300px after the start, `"+=100%"` is one scroller height after the start, `"max"` is the furthest possible scroll.
- Wrap in `clamp()` (GSAP 3.12 and later) so the value never leaves the page: `start: "clamp(top bottom)"`, `end: "clamp(bottom top)"`.
- A function is allowed too. It gets the ScrollTrigger instance and returns a string or number. Run `ScrollTrigger.refresh()` after the layout it depends on changes.
- Defaults: `start` is `"top bottom"` (`"top top"` when pinning), `end` is `"bottom top"`. If `end` should be measured from another element, name it in `endTrigger`.

## Choosing how the animation follows the scroll

Two separate modes, so pick one per trigger:

- **Discrete:** `toggleActions` takes four words for onEnter, onLeave, onEnterBack, onLeaveBack. Each is `play`, `pause`, `resume`, `reset`, `restart`, `complete`, `reverse` or `none`. Default `"play none none none"`.
- **Linked (scrub):** progress is a function of scroll position.

```javascript
gsap.to(".tile", {
  x: 320,
  scrollTrigger: {
    trigger: ".tile",
    start: "top center",
    end: "bottom center",
    scrub: 0.8   // true = locked to the scrollbar; a number = seconds the animation takes to catch up
  }
});
```

`scrub: true` is exact. A number such as `scrub: 1` gives a smooth lag. Do not set both modes on one trigger; the documentation presents them as alternatives and does not describe a combined result.

Related options:

- **snap** settles progress on chosen values: a number (`0.25` = quarters), an array of stops, a function, `"labels"` for timeline labels, or an object whose key `snapTo` is required and which also accepts, among others, `delay`, `duration`, `ease`, `directional`, `inertia`, `onStart`, `onInterrupt` and `onComplete`.
- **toggleClass** adds a class while active. A string targets the trigger; `{ targets: ".label", className: "active" }` targets something else.
- **once** kills the trigger after its end is passed the first time; an animation already started keeps playing. It also sets `toggleActions` to `"play none none none"`.

## Pinning

Pinning keeps the trigger on screen while the range is active:

```javascript
scrollTrigger: {
  trigger: ".story",
  start: "top top",
  end: "+=1400",   // stay pinned through 1400px of scrolling
  pin: true,
  scrub: 1
}
```

`pin` accepts `true` (pin the trigger), a selector or an element. Do not animate the pinned element itself; animate its children.

`pinSpacing` controls the gap that stops the page from collapsing. The documentation says padding is added by default, that `"margin"` uses margin instead, that `false` adds nothing, and that a flex container defaults to `false`. Turn spacing off only when your own layout already makes room.

## Driving a timeline

Put the ScrollTrigger on the timeline itself. Its progress then follows scroll through the range:

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".stage",
    start: "top top",
    end: "+=2600",
    scrub: 1,
    pin: true
  }
});
tl.to(".one", { x: 140 }).to(".two", { y: 80 }).to(".three", { opacity: 0 });
```

## Horizontal scroll (containerAnimation)

The usual build: pin a full-screen panel, and while the visitor scrolls down, slide the content inside it sideways.

**Critical:** the sideways tween or timeline must have `ease: "none"`. Any other ease makes scroll distance and sideways distance disagree, and this is the most frequent mistake with this pattern.

1. Pin the full-viewport panel.
2. Build a tween that moves a child wrapper on `x` (or a negative `xPercent` to move left) with `ease: "none"`; for pixels, the total travel is roughly (panel count minus one) times the window width.
3. Put a ScrollTrigger on that tween with `pin` and `scrub`.
4. For anything that should fire according to the sideways movement, point its ScrollTrigger at that tween with `containerAnimation`.

```javascript
const track = document.querySelector(".gallery-track");

// The track slides left by however much it overflows the window.
const scrollTween = gsap.to(track, {
  x: () => -Math.max(0, track.scrollWidth - window.innerWidth),
  ease: "none",                  // required
  scrollTrigger: {
    trigger: track.parentNode,   // pin the wrapper, move the child
    pin: true,
    scrub: true,
    start: "top top",
    end: () => "+=" + Math.max(0, track.scrollWidth - window.innerWidth),
    invalidateOnRefresh: true
  }
});

// Anything keyed to the sideways movement names the container animation:
gsap.to(".caption", {
  y: 60,
  scrollTrigger: {
    containerAnimation: scrollTween,   // do not forget this
    trigger: ".slide-3",
    start: "left center",              // measured along the horizontal motion
    toggleActions: "play none none reset"
  }
});
```

Limits to remember:

- Pinning and snapping are unavailable on triggers that use `containerAnimation`.
- The container animation needs `ease: "none"`.
- Avoid sliding the trigger element itself; slide a child. If the trigger does move, offset `start` and `end` to match.

## Revealing many elements together: ScrollTrigger.batch()

Use it for "fade in whatever just scrolled into view, staggered". `ScrollTrigger.batch(triggers, vars)` creates one trigger per target and delivers the ones that fire close together as a single group. It replaces an IntersectionObserver well and returns an array of ScrollTrigger instances.

What goes in:

- `triggers` is a selector string or an array of elements.
- `vars` is ordinary ScrollTrigger config: `start`, `end`, `once`, callbacks. Do not pass `trigger` (each target is its own), `animation`, `invalidateOnRefresh`, `onSnapComplete`, `onScrubComplete`, `scrub`, `snap` or `toggleActions`; they do not apply.

What comes out: a batched callback receives **two arrays**, not the instance. First the elements that fired in this group, then their ScrollTrigger instances (read progress or direction, or call `kill()`).

Tuning how groups form:

- `interval` is the longest, in seconds, that a group keeps collecting. By default the window is roughly one animation frame. It starts at the first callback of a kind and ends when time is up or `batchMax` is reached.
- `batchMax` is the most elements in one group, as a number or a function. A function adapts to layout and runs again on each refresh (resize, tab focus).

```javascript
ScrollTrigger.batch(".tile", {
  onEnter: (elements) => gsap.to(elements, { opacity: 1, y: 0, stagger: 0.12 }),
  onLeave: (elements) => gsap.to(elements, { opacity: 0, y: 80 }),
  start: "top 85%",
  end: "bottom 15%"
});
```

With group sizing:

```javascript
ScrollTrigger.batch(".feature", {
  interval: 0.15,
  batchMax: 3,
  onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.08, overwrite: true }),
  onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 40, overwrite: true })
});
```

Docs: the `ScrollTrigger.batch()` page in GSAP's ScrollTrigger documentation.

## Scrolling owned by another library: ScrollTrigger.scrollerProxy()

When a third-party smooth-scroll script or custom scroller moves the page, ScrollTrigger cannot read the position from the element. `ScrollTrigger.scrollerProxy(scroller, vars)` makes it use your functions. GSAP's own **ScrollSmoother** needs no proxy.

**Critical:** the other library must notify ScrollTrigger on every move. Hook `ScrollTrigger.update` into its scroll event, for example `scrollbar.addListener(ScrollTrigger.update)`. Without it every calculation goes stale.

Arguments: `scroller` is a selector or element (`"body"`, `".container"`); `vars` must have `scrollTop`, `scrollLeft` or both. Each is one function that sets the position when called with a value and returns it when called with none.

Extra keys in `vars`, by problem:

- Real scroller rectangle differs from the default: **getBoundingClientRect** returns `{ top, left, width, height }`. For a full-window scroller that is `{ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }`.
- The library reports its own sizes: **scrollWidth** and **scrollHeight**, as get/set functions.
- Markers drift because the scroller is translated: **fixedMarkers: true** treats them as `position: fixed`.
- Pin trouble: **pinType** of `"fixed"` when pins jitter (typical when scrolling runs off the main thread), `"transform"` when pins fail to stick.

```javascript
// Body scroll driven by a third-party scrollbar instance
ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    if (arguments.length) scrollbar.scrollTop = value;
    return scrollbar.scrollTop;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  }
});
scrollbar.addListener(ScrollTrigger.update);
```

Docs: the `ScrollTrigger.scrollerProxy()` page in GSAP's ScrollTrigger documentation.

## Callbacks and standalone triggers

With no animation to drive, use `ScrollTrigger.create()` with the same config and act in callbacks, for instance updating a progress bar from `self.progress`:

```javascript
ScrollTrigger.create({
  trigger: "#hero",
  start: "top top",
  end: "bottom 40%+=60px",
  onUpdate: (self) => console.log(self.progress.toFixed(3), self.direction)
});
```

`onEnter`, `onLeave`, `onEnterBack` and `onLeaveBack` run when a boundary is crossed and receive the instance (`progress`, `direction`, `isActive`, `getVelocity()`). `onUpdate` fires as progress moves, `onToggle` when active flips, `onRefresh` after positions are recalculated, `onScrubComplete` when a numeric scrub has caught up.

## Keeping positions right: refresh, order, cleanup

- `ScrollTrigger.refresh()` recalculates every position. Call it after content, images, fonts or layout change. Window resizes trigger it automatically; per the documentation it waits for a 200ms gap in resize events.
- Create triggers from the top of the page to the bottom. They refresh in creation order, and the wrong order can throw off layout, pin spacing especially.
- If creation order cannot follow the page (async data, lazy sections), use `refreshPriority`. In GSAP's documentation a trigger with `refreshPriority: 1` refreshes before one with `0` (the default), negatives are allowed, so **higher numbers refresh first**: give the section highest on the page the highest number. The documentation notes it is rarely needed when creation order matches the page.
- Give a trigger an `id` if you want to find it again with `ScrollTrigger.getById(id)`.
- When elements go away, or a single-page app swaps views, kill the triggers so they stop watching dead nodes:

```javascript
ScrollTrigger.getAll().forEach(t => t.kill());
// or one by name, if you gave it an id in its config:
ScrollTrigger.getById("intro-pin")?.kill();
```

In React, the `useGSAP()` hook from the `@gsap/react` package does this cleanup for you. The manual route is `gsap.context()` plus a `revert` or `kill` in the effect cleanup that runs on unmount.

## Other config you may need

- **scroller**: the scroll container to watch; the viewport by default.
- **horizontal**: `true` when the scroller moves sideways.
- **markers**: `true` while building draws start and end lines; an object such as `{ startColor, endColor, fontSize }` styles them. Remove it, or set `markers: false`, before shipping.

The documentation has further options (for example `anticipatePin`, `fastScrollEnd`, `pinnedContainer`, `preventOverlaps`); read its config list before relying on a property not covered here.

## Common mistakes

Setup and cleanup:
- Skipping `gsap.registerPlugin(ScrollTrigger)`.
- Skipping `refresh()` after new content, images or fonts arrive. Only resize is automatic.
- Shipping `markers: true`.

Where the trigger lives:
- Putting `scrollTrigger` on a child tween inside a timeline. It belongs on the timeline or on a top-level tween. Wrong: `gsap.timeline().to(".one", { scrollTrigger: {...} })`. Right: `gsap.timeline({ scrollTrigger: {...} }).to(".one", { x: 140 })`.
- Nesting scroll-triggered animations inside a parent timeline. Only top-level animations get triggers.

Behaviour settings:
- Setting `scrub` and `toggleActions` together on one trigger; choose one.
- Giving the horizontal containerAnimation tween an ease other than `"none"`.

Ordering:
- Creating triggers in scrambled or async order with no `refreshPriority`.

More: GSAP's ScrollTrigger documentation.
