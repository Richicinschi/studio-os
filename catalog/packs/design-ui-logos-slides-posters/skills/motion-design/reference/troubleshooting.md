# Troubleshooting

Organised by the lever you pull, not by the symptom. Find the lever, then check which complaints it cures.

## Lever: easing and paths
- Linear easing makes spatial moves robotic. Use ease-out for entries, ease-in-out otherwise.
- Straight lines look mechanical. Bend the path 10-20 px at its midpoint.
- A stiff, uniform curve everywhere feels cheap. Give secondary parts a different curve from the primary.
- An abrupt halt feels jarring. Add a 50-100 ms settle after the main move.
- A long overshoot that drags feels slow. Raise the damping.
- Missing overshoot makes things feel dead. Add 3-10%.

## Lever: timing
- Too slow: compare against the duration table; ease-out feels faster than ease-in-out for the same length.
- Too fast: modals need 300 ms or more, pages 400 ms or more; with no easing at all, use at least ease-out.
- Too much wind-up makes a move feel late. Trim anticipation to 10% of the time or drop it.
- A big move with no wind-up is jarring. Add 100-200 ms of anticipation.
- Everything in lockstep reads as robotic. Shift starts and stops by 50-150 ms.
- Children that stop with their parent look glued on. Let them trail by 50-150 ms.
- A stagger that totals over 500 ms is a limit break, not a style. Shorten it.
- Pauses matter: with none, the scene feels busy. Leave 100-200 ms between beats.

## Lever: layers and amount
- A primary-only scene is flat. Add a secondary layer (shadow, icon reaction) and an ambient one.
- Opacity alone is too weak. Combine it with position or scale.
- Too many things moving: apply the one-third rule.
- Amplitude too big: shrink it to the least that still reads.
- Several heroes compete: allow one per moment and dim the rest.
- Ambient too loud: drop it to 10-20% of the primary and slow it down.

## Lever: personality and consistency
- Generic feel: use the archetype's signature curve.
- Same duration for everything: switch to the personality's duration palette.
- Entries come from all directions: choose one origin.
- Entrances with no shared style: define one for the project.
- Same kind of move on different curves or lengths: standardise per type.
- Overshoot applied unevenly: set one rule and follow it.
- Mixed archetypes: stay with one for 90% or more.

## Lever: rendering cost
- Animating width, height or margin: switch to transform.
- More than about 20 animated elements in view: cut back.
- Heavy shadows or filters: simplify or pre-render them.
- Not on the GPU: stick to transform and opacity.
- Everything starting at once: stagger to spread the work.

## Ten-point diagnostic

1. No linear easing on spatial moves.
2. Duration fits the element.
3. Primary and secondary layers present.
4. One personality throughout.
5. Easing direction correct.
6. One-third screen rule respected.
7. One-third element rule respected.
8. Follow-through present.
9. Every motion has a purpose.
10. Fine on the hundredth viewing.

## Typical errors per personality

- Playful: overshoot past 25% looks broken; not everything should bounce; short plus bouncy looks glitchy.
- Premium: too subtle becomes invisible; too slow feels like waiting; no motion at all feels broken.
- Corporate: too restrained is dull; playful curves break trust; identical timing everywhere is monotonous.
- Energetic: maximum everywhere means nothing stands out; too many particles; no settling is chaos.
