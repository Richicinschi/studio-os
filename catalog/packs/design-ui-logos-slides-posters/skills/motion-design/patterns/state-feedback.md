# State and feedback

Grouped by what the user is waiting to learn: did my input land, what is it doing, did it work, and is it available.

## Input landed

### Pressing a button
- Playful: down to 0.95 (60 ms, ease-out), up to 1.05 on release (80 ms), settle at 1.0 (120 ms, spring). The shadow shrinks and grows back; colour darkens then brightens. About 260 ms.
- Premium: down to 0.98 (80 ms), back to 1.0 (150 ms) with no overshoot; opacity eases to 90% while pressed. About 230 ms.
- Corporate: down to 0.97 (60 ms), back to 1.0 (100 ms), overshoot up to 2%; the background darkens 10%. About 160 ms.

### Hover
Enter in under 100 ms, leave in 150-200 ms; the slower exit looks refined.

| Item | Effect | Enter time |
|---|---|---|
| Button | grows 1.02-1.05 | under 100 ms |
| Card | grows 1.01-1.02, shadow lifts | under 100 ms |
| Link | colour change and underline | under 100 ms |
| Icon | grows 1.1, turns 2-5 degrees | under 100 ms |
| Image | grows 1.03 inside a clipped frame | 150 ms (a larger surface, so a longer ease is acceptable) |

### Focus
- A focus ring grows from 95% to 100% while fading in (150 ms).
- A focused card scales 1.01 and deepens its shadow (150 ms).
- Keyboard focus must show in under 100 ms and still work under reduced motion.

## It is working

- Spinner: full turns, linear, 1000-1500 ms each; an optional slow breathing pulse (2-3 seconds).
- Skeleton: a gradient sweeps left to right in 1500-2000 ms; base opacity 10-20%, peak 30-40%.
- Progress bar: animate width or transform with ease-in-out; milestone colours and a shimmer are optional.
- Indeterminate: position or width oscillates over 1500-2500 ms, ease-in-out; steady, never frantic.

## It worked

**Checkmark**
1. The container grows from 0.9 to 1.0 (200 ms, ease-out-back, 5-10% overshoot).
2. The tick draws as a stroke after 100 ms (150 ms, ease-out).
3. Colour turns green (200 ms); a glow or particles follow (300 ms).
4. 400-500 ms overall.

**Confirmation badge**
1. The badge grows from nothing (200 ms, ease-out-back).
2. Its text fades in after 50 ms (150 ms).
3. The background pulses once (300 ms, sine).

**Payment**
1. The spinner crossfades into a check (200 ms).
2. The check draws (200 ms) while the container takes the success colour (200 ms).
3. Text fades in after 100 ms (200 ms); confetti is optional (300-500 ms).

## It did not work

**Shake**: swing 10-15 px each way two or three times, amplitude shrinking. Ease-in-out, 300-400 ms, red tint, no overshoot, ending exactly where it began.

**Inline validation**
1. The message slides down and fades (200 ms).
2. The border turns red (150 ms); an icon grows in after 50 ms (150 ms).
3. One short shake (200 ms) is optional.

**Failed form submit**
1. The button returns to normal (200 ms).
2. The error message slides in (250 ms).
3. Affected fields turn red, 30 ms apart (150 ms each).
4. Scroll smoothly to the first error (300 ms, ease-in-out).

**Warning**
1. Border turns yellow or amber (150 ms).
2. The warning icon grows in with slight overshoot (150 ms).
3. An optional slow icon pulse (2-3 seconds, sine); the text fades in after 50 ms (200 ms).

## Available or not

- Toggle: the thumb slides 120-180 ms on ease-in-out while the track recolours at the same moment, with a touch of squash along the direction of travel. Playful versions bounce at the end; premium ones glide.
- Disabling: fade to 50-60% opacity (200 ms), optionally shrinking to 98%.
- Enabling: back to full opacity (200 ms), optionally with a 98% to 100% scale pulse.
