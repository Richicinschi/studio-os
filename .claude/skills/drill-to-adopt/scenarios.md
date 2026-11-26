## Scenarios this skill must handle

Read these when you change the skill; each is a way the run can go wrong.

- **No domain fits.** The adopter's work is writing and note-taking, and nothing in `domains` matches.
  Ask the domain question with only "None of these fit" and "Not sure". The right result is a
  recorded "no domain" row in `adoption/features.md`, no pack in the plan, and no pack installed. It
  is a finding, not a failure ([Voice and honesty](SKILL.md#voice-and-honesty)).
- **A domain they have in part.** They already keep a skill that runs a panel. The card's Detect marks
  the domain **partly**; the route question offers keep, fold, replace or both with the warning.
- **A pack the kit does not ship.** They ask for a domain the studio uses that is not in `domains`.
  Say it is not in this kit, and offer the gap report's routes: an outside candidate through
  `vet-and-adopt`, or a skill they write themselves.
- **claude.ai only.** No agents install; the zip carries the entry and the skills, and a skill that
  needs a local tool says so in its "Without local tools" section.
- **A setup folder inside a shared work repository.** The `adoption/` question recommends keeping it
  out. An explicit yes adds `/<prefix>adoption/` to the repository's own exclude file, never to the
  tracked `.gitignore`; a Not sure writes nothing and puts the line in wave 1.
- **An undo after another item wrote the same file.** The front door was edited by two items. The
  install record names both, so the undo takes out only this item's lines and leaves the other's.
- **No receipt.** On claude.ai only, or without Node.js, there is no record and no receipt: say so,
  and the form still takes what they adopted and how long it took, in their words.
