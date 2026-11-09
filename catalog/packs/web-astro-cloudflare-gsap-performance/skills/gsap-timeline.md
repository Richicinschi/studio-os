---
name: gsap-timeline
description: GSAP timelines: gsap.timeline(), position parameter, labels, nesting, playback. Use to sequence animations or choreograph keyframes; also when the user asks how to order or time animations, or when a library that supports timelines is being recommended.
metadata:
  category: web
  author: Richicinschi
  domain: web motion with GSAP timelines, for rich agency work (motion-dev-animations is the lighter default)
---

# GSAP timelines

A timeline is one container that holds tweens and other timelines on a shared clock, so you steer a whole sequence with a single handle.

Defaults and behaviours below (tweens added to the end of the timeline unless a position says otherwise, `tweenFromTo()` being linear) follow the official GSAP documentation for timelines and its position parameter page. All durations, offsets and coordinates in the examples are illustrative.

## Reach for it when

- an animation has several steps that must run in order, overlap, or run together;
- someone asks about sequencing, keyframe-style motion, or the order things animate in.

## Neighbouring skills

- One tween, or choosing an ease: **gsap-core**.
- Tying a timeline to scrolling: **gsap-scrolltrigger**.
- Using GSAP inside React: **gsap-react**.

## Build one

```javascript
const tl = gsap.timeline();
tl.from(".banner", { y: -80, duration: 0.8 })
  .to(".menu", { x: 240, duration: 0.4 })
  .to(".footer", { opacity: 1, duration: 0.6 });
```

With no position given, each tween goes at the end of the timeline, so this plays banner, then menu, then footer.

## Placing tweens

The position goes in the third argument of the call, after the target and the vars. When it is left out, the default is `"+=0"`: the end of the timeline, with no gap and no overlap.

| Value | Meaning |
|---|---|
| `3` | start at exactly 3 seconds |
| `"+=1"` | 1s after the timeline's current end |
| `"-=0.4"` | 0.4s before the current end (overlap) |
| `"reveal"` | at the label called reveal |
| `"reveal+=0.25"` | 0.25s after that label |
| `"<"` | when the most recently added animation starts |
| `">"` | when the most recently added animation ends (this can differ from the timeline's end once tweens overlap) |
| `"<0.1"` | 0.1s after the most recently added animation starts |

```javascript
tl.to(".logo", { rotation: 90 }, 0);    // pinned to time 0
tl.to(".nav", { height: 60 }, "+=1");   // a one second gap after the end
tl.to(".badge", { autoAlpha: 1 }, "<"); // starts together with .nav
tl.to(".cta", { scale: 1.2 }, "<0.1");  // starts 0.1s after .badge starts
```

## Shared defaults

Anything in `defaults` is applied to every child tween, so you write it once:

```javascript
const tl = gsap.timeline({ defaults: { duration: 0.7, ease: "back.out(1.4)" } });
tl.to(".card", { x: 150 }).to(".tag", { y: -30 }); // both run 0.7s with back.out
```

## Constructor options

- `paused: true` builds it stopped; start it later with `.play()`.
- `repeat` and `yoyo` behave as on a tween but cover the whole sequence.
- `onStart`, `onUpdate`, `onComplete` fire for the timeline itself.
- `defaults` is copied into each child's vars.

## Labels

Named points keep a long sequence legible and simple to retime.

```javascript
tl.addLabel("reveal", 0);
tl.to(".photo", { scale: 1.1 }, "reveal");
tl.addLabel("exit", "+=2");
tl.to(".caption", { autoAlpha: 0 }, "exit");
tl.play("exit");                  // jump to the label and play
tl.tweenFromTo("reveal", "exit"); // see below
```

`tweenFromTo()` hands back a new linear tween that scrubs the playhead from the first label to the second and then stops.

## Nesting

Put a timeline inside another to build a scene from reusable parts.

```javascript
const scene = gsap.timeline();
const dawn = gsap.timeline();
dawn.to(".sun", { y: 120 }).to(".moon", { x: -60 });
scene.add(dawn, 0);                       // dawn starts at 0
scene.to(".sky", { opacity: 0.5 }, "+=0.5"); // then continue on scene
```

## Playback

- `tl.play()` and `tl.pause()`
- `tl.reverse()`; if the playhead is still at the start (never played), call `tl.progress(1)` first, then `tl.reverse()`
- `tl.restart()` goes back to the start and plays
- `tl.time(4)` seeks to the 4 second mark
- `tl.progress(0.25)` seeks to the quarter mark
- `tl.kill()` stops the timeline at once and removes it from its parent timeline

## Do

1. Order steps with a timeline, not by hand-timing separate tweens.
2. Place each tween by position: a time, an offset from the end or from the previous tween, or a label.
3. Add labels with `addLabel()` to keep sequences readable and easy to retime.
4. Put values the children share into the constructor `defaults`.
5. Attach a ScrollTrigger to the timeline itself (or a top-level tween), never to a tween inside it.

## Avoid

1. Chaining steps with `delay` when a timeline and a position would do it.
2. Repeating the same duration or ease on many children when `defaults` exists.
3. Treating `duration` in the constructor like a tween's duration. A timeline's length comes from what it contains.
4. Nesting animations that carry their own ScrollTrigger. Only top-level tweens and timelines should have one.
