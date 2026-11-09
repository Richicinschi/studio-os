# Emotion to motion

## Feelings and how they move

| Feeling | Movement quality | Route | Curve | Time |
|---|---|---|---|---|
| Joy, delight | bouncy, arcing, overshooting | curved and rising | ease-out-back | 200 to 400 ms |
| Calm, serenity | smooth, flowing | soft curves | sine ease-in-out | 500 to 1000 ms |
| Urgency, alert | sharp, fast, direct | straight | ease-out | 100 to 200 ms |
| Sadness, weight | slow, sinking | drooping | cubic ease-in-out | 600 to 1200 ms |
| Surprise, impact | sudden, expanding | radiating outward | ease-out-expo | 150 to 300 ms |
| Elegance, grace | slow, controlled | long smooth arcs | cubic-bezier(0.4, 0, 0.2, 1) | 400 to 700 ms |
| Playfulness | bouncy, uneven | arcs and squiggles | ease-out-back | 200 to 350 ms |
| Confidence | direct, decisive | straight, horizontal | ease-out | 200 to 400 ms |
| Curiosity | exploring, varied | mixed, circling | varies | 300 to 500 ms |
| Tenderness | soft, gentle | barely curved | soft ease-in-out | 600 to 1000 ms |

## What a route says

| Route | Suggests |
|---|---|
| Angular, sharp | tension, urgency, machinery |
| Smooth curve | ease, friendliness, nature |
| Spiral | whimsy, play |
| Straight diagonal | energy, purpose |
| Up | growth, achievement |
| Down | settling, gravity |
| Horizontal | a journey, progress |
| Outward from a point | burst, release |
| Inward to a point | focus, convergence |

## How loud

| Level | Looks like | Use for |
|---|---|---|
| Low | faint opacity changes, tiny shifts | ambient, routine events |
| Medium | noticeable but not pushy | most interface actions |
| High | big displacement, hard to ignore | errors, celebrations, onboarding |

## Colour and motion

| Colour | Mood | Pair with |
|---|---|---|
| Blue | trust, calm | smooth, middling transitions |
| Green | success, growth | upward expansion, light overshoot |
| Red | alert, urgency | quick, sharp, sideways shakes |
| Orange | energy, warmth | bouncy diagonals |
| Purple | premium, mystery | slow reveals, graceful curves |
| Yellow | optimism, caution | quick pulses |
| Teal | modern, clear | clean, snappy moves |

Colour changes:
- Success: travel to green rather than starting there.
- Error: flash red then relax; do not hold it.
- Warning: pulse yellow or amber for urgency.
- Neutral changes: fade opacity instead of changing colour.

## Default mood by situation

| Situation | Aim for |
|---|---|
| Form submitted | joy and confidence |
| Validation error | mild urgency |
| Page loaded | calm and confidence |
| Navigating | confidence |
| Notification | slight surprise |
| Loading | calm |
| Onboarding | curiosity and delight |
| Dashboard | calm and confidence |
| Purchase finished | joy and confidence |
| Deleting | calm, a respectful exit |
