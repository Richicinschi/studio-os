# Feature choices

**Kit version:** v<X.Y.Z> · **Date:** <YYYY-MM-DD> · **Every session, your choice:** about <N> tokens (estimate)
**Heaviest three:** <id> (about <N>), <id> (about <N>), <id> (about <N>)

Written by `drill-to-adopt` as you answer, one line per item, never two items on one line. You may edit it by hand: tick or untick a box, and the next run reads this file instead of asking again. A box is ticked only when you chose the item; nothing is ticked as "assumed". Tokens are estimates (bytes divided by 4). The kit's `catalog/FEATURES.md` explains the two flags, importance and context cost, and each item's card, `cards/<id>.md` in the kit, says how it is installed, checked and undone. "You have" comes from the audit: **have**, **partly** or **not yet**.

## <Module title> (`<module id>`): <taken / skipped>

- [x] <id>: <what it does for you> · <importance> · <context cost: none / on demand / every session, about N tokens> · you have: <have / partly / not yet> · size: <light / standard / full, when the card has sizes>
- [ ] <id>: <what it does for you> · <importance> · <context cost, about N tokens> · you have: <have / partly / not yet>

<!-- One section per module; a skipped module keeps its heading line only. The proposed set starts ticked: the scanner, handoff, the front door and memory, and the two or three items that answer the problem you named. Every other item starts unticked, whatever its importance. -->

## Single picks

Items taken from a module you did not tick, each on its own line, in the same form.

- [x] <id> (`<module id>`): <what it does for you> · <importance> · <context cost, about N tokens> · you have: <have / partly / not yet>

## Not in this version

- <title> (heavy): <why>
