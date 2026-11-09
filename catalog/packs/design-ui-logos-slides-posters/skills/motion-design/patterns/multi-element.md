# Many elements at once

Staggers here use the same measure as the cap: time from the first item starting to the last item starting must stay under 500 ms. The row counts below are worked out from that.

## Rules first

- A group shares an easing family. Durations and delays may differ; secondary or ambient parts may use other curves.
- Motion radiates from the trigger: what is nearer starts sooner, what is farther starts later.
- Overlap between items: 0% is methodical, 25% is brisk (the usual), 50% is fluid, 75% is rapid and energetic.

Counter-motion:

| Hero | Companion |
|---|---|
| slides right | background slides left at 20-30% |
| scales up | shadow spreads |
| lifts | shadow falls away and softens |
| turns clockwise | ambient turns anticlockwise |
| expands | neighbours compress |

## Stagger recipes

### List rows
Each row slides up 20 px and fades (200 ms, ease-out). At a 40 ms gap, eight rows start across 280 ms; at 60 ms, eight rows would need 420 ms, so stay within the cap by limiting how many rows animate and letting the rest appear at once.

| Personality | Row time | Gap | Curve | Most rows that fit under 500 ms |
|---|---|---|---|---|
| Playful | 250 ms | 60 ms | ease-out-back | 9 |
| Premium | 350 ms | 80 ms | cubic-bezier(0.4, 0, 0.2, 1) | 7 |
| Corporate | 200 ms | 50 ms | cubic-bezier(0.2, 0, 0, 1) | 10 |
| Energetic | 150 ms | 30 ms | ease-out-expo | 17 |

Rows past that count should fade in together after the last staggered one starts.

### Grid cards
Each card grows from 95% and fades (250 ms, ease-out), 50-80 ms apart in reading order, plus 20 ms for every new row. The shadow follows 50 ms behind its card. Other orders worth trying: center-out, column by column, random. Count the cap before choosing the gap.

### Navigation items
Slide in from the side and fade (180 ms, ease-out), 30-50 ms apart, under 300 ms in total.

### Dashboard widgets
```
0 ms    skeletons showing
100 ms  hero figure starts (250 ms, ease-out)
200 ms  widgets begin (200 ms each, 60 ms apart)
350 ms  hero done, chart starts drawing (300 ms)
500 ms  everything has landed
650 ms  ambient pulse starts
```

## Sequences

**Modal with content**: at 0 ms the backdrop dims (200 ms); at 50 ms the modal grows 95% to 100% (300 ms); title at 200 ms, body at 280 ms, buttons at 350 ms, close button at 400 ms. Follow reading order.

**Tab change**: at 0 ms the indicator slides (250 ms, ease-in-out) and the old content fades (150 ms); at 100 ms new content comes in from the tab's direction (200 ms); at 150 ms its parts stagger 40 ms apart.

**Accordion**: opening rotates the arrow (150 ms), expands the height (250 ms), and fades the content in at 50 ms (200 ms), while siblings move (200 ms). Closing runs the reverse with ease-in.

**Page change**: the current page slides left and fades (300 ms, ease-in); the next page arrives from the right (400 ms, ease-out, 100 ms delay); the hero scales in; content staggers at 50 ms. A shared element may morph across (400 ms).

**Drag and drop**: lifting scales to 1.03 (150 ms) while others shift (200 ms); dropping settles to 1.0 (200 ms) and the gaps close.
