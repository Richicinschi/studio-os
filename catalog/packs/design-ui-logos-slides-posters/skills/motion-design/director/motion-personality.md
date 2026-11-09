# Motion personality

Four archetypes. Each is a bundle of settings plus a typical home.

## Playful

- Time: 150 to 300 ms
- Curve: ease-out-back, or a springy bounce
- Overshoot: 10 to 20%
- Paths: arcs and curves, never ruler-straight
- Squash and stretch: used when things land

Trademarks: a bounce on landing, squash on press, a wobble in rotation, bright colour pops, uneven stagger timing.
Suits: children's apps, casual games, social products, celebrations, onboarding flows and creative tools.

## Premium (luxury)

- Time: 350 to 600 ms
- Curve: the Premium signature curve listed under brand identity
- Overshoot: none
- Paths: gentle curves with a light parallax
- Squash and stretch: never

Trademarks: slow fades, a slight scale (98% to 100%), generous pauses, only opacity plus one other property, extreme smoothness.
Suits: fashion, finance, luxury goods, premium SaaS, portfolios and editorial sites.

## Corporate (professional)

- Time: 200 to 400 ms
- Curve: the Corporate signature curve listed under brand identity
- Overshoot: 0 to 3%
- Paths: mostly straight, a small arc for emphasis
- Squash and stretch: not used

Trademarks: steady timing, clear state changes, purposeful movement, predictable patterns, even stagger.
Suits: enterprise tools, dashboards, admin screens, health and banking.

## Energetic (dynamic)

- Time: 100 to 250 ms
- Curve: ease-out-expo, or an elastic curve
- Overshoot: 15 to 30%
- Paths: wide arcs, long travel, diagonal lines
- Squash and stretch: used, and exaggerated

Trademarks: scale jumps of 50 to 150%, quick colour changes, particle bursts, staggers that speed up, bold entries from the edge.
Suits: games, sport, music, events, marketing pages and fitness apps.

## Choosing from the brief

Scan the brief for cue words, then match:

- Playful cues: cute, friendly, bouncy, whimsical, fun.
- Premium cues: luxury, sophisticated, elegant, minimal.
- Corporate cues: business, dashboard, professional, clean.
- Energetic cues: bold, exciting, energetic, dynamic.
- No cue given: Corporate for interface work, Playful for illustration.

## Brand motion identity

Fix three constants so the motion is recognisable.

**Signature curve** (use it for about 80% of animations):
- Playful: ease-out-back
- Premium: cubic-bezier(0.4, 0, 0.2, 1)
- Corporate: cubic-bezier(0.2, 0, 0, 1)
- Energetic: ease-out-expo


**Three durations**

Quick, standard and slow lengths for each archetype:

- Playful: 150, 250 and 400 ms.
- Premium: 350, 500 and 800 ms.
- Corporate: 200, 300 and 450 ms.
- Energetic: 100, 180 and 300 ms.

**Entrance style**
- Playful: bounces up from below.
- Premium: a slow fade with scale from 98% to 100%.
- Corporate: slides in from the right with a fade.
- Energetic: snaps in from an edge and overshoots.

## Mixing

Stay about 90% in the main archetype and borrow another only for a special moment. Shift gradually, not abruptly. For instance, a corporate dashboard might take on Playful traits only for its success state.
