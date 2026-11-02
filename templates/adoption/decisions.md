# Adoption decisions

One row per item, never two items in one row, written by `vet-and-adopt` as soon as the item is applied or staged, with Check "pending"; the Check cell gets the result, and the line that showed it, once the check has run. A skipped item gets a row too, with Check "n/a". `drill-to-adopt` reads this file in update mode, so keep the kit version column accurate. The Undo column is the item card's Undo, written for your setup, so anything can be taken out again later.

| Date | Kit version | Item | Decision | Where it went | Why | Scan | Check | Undo |
|---|---|---|---|---|---|---|---|---|
