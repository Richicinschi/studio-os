## Phase 5: Verify

At the end of wave 1, or when the sitting ends with rows still waiting, and again after each later
wave:

1. **Run each ticked row's check again** and record the result, with the line that showed it. Name
   each row still waiting, and what it waits on.
2. **The fresh-session proof**, if phase 4 has not run it: a fresh session in a second terminal is
   asked the question that names their problem, then "where did we stop?". The answers must come
   from their files (the front door, memory, the newest handoff note), not from this conversation.
   Record which file each came from.
3. **Measure again** what loads into every session, the same way as in phase 1: the size of each
   instruction file from a file listing, plus the `description` of every skill and agent, divided by
   4, never opening a data or secret file (`.claude/skills/drill-to-adopt/phases/1-audit.md`,
   "Estimate what loads into every session today", has the details). Compare it with the phase 2
   total.
4. **Write `adoption/handover.md`** from `templates/adoption/handover.md`: what they have now and
   where it lives, what still waits on them, how to resume tomorrow, the before / chosen / now
   totals, what they skipped and why, and what to do when the kit changes.
5. **Write the receipt,** at the end of the adoption's first wave, and again after a later wave on
   their ask: `node tools/installed.mjs receipt <setup>` from the kit's folder prints it from
   `adoption/installed.json`. Save it as `adoption/receipt.md`, adding one line of your own, "Messages
   in the first sitting: about N (Claude's count)"; when an earlier `adoption/receipt.md` has that
   line, carry it over as it is. It names kit items, counts and a duration only, never a path, a
   name, a date or an item from outside the kit; keep it so. Show it to them, then ask once: "Would
   you send it to the kit as an adoption report? A form on GitHub takes the receipt as it is, and
   asks what broke and what you kept, in your words. Nothing is sent unless you submit the form."
   Options: "Not now", recommended as the answer that changes least (the receipt stays in
   `adoption/`, to send later or never); "Not sure: the same as Not now"; "Show me the form". On the
   last, give the link
   `https://github.com/Richicinschi/studio-os/issues/new?template=adoption-report.yml` and tell them
   to paste the receipt and leave out anything private; never open or fill the form yourself. Without
   Node.js 22 there is no receipt: say so in one line.

Call nothing working before its check has run. A failed check is reported as failed, with what to
look at next.
