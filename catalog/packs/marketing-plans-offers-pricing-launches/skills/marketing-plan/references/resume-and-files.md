# Resume rules, folder layout, research record

How a plan survives interruptions. Read this at the start of every run.

## Folder per plan

One folder per client, named with a short slug, under a `marketing-plans` folder in the user's home (or in the project, if the user prefers):

```
marketing-plans/<slug>/
  materials/     files the client handed over (decks, voice doc, analytics exports, prior audit)
  research.md    written once intake is done
  progress.md    the state file, the only source of truth for resuming
  sections/      01.md to 13.md, one approved section each
  final_plan.md  the compiled plan
```

Section files are zero-padded so they sort. Section 01 is written last but stored first.

## progress.md

```
# <Client> plan progress
phase: init | review | finalize | finalized
current_section: <number, used in review only>
plan_version: v1
last_updated: <date and time>

## Sections approved
- [ ] 02 Strategic frame   ... through 13
- [ ] 01 Executive summary (tick last)

## Approved files
sections/02.md, sections/03.md ...

## Notes
Blockers and open items that do not belong in research.md.
```

Update `phase` and `last_updated` on every state change.

## Which state are we in

Check in this order and stop at the first match:

1. No client folder: new plan. Create the folder, `materials/` and an empty `sections/`, then run intake.
2. Folder but no `research.md`: intake was cut short. Resume intake.
3. `research.md` but no `progress.md`: create the progress file and begin review at section 2.
4. `phase: review`: continue at `current_section`, or at the first unticked box.
5. `phase: finalize`: compilation was interrupted. Run the finalize steps again.
6. `phase: finalized`: stop. Never overwrite. Ask: "This plan is final (v N). Revise it as v N+1, start a fresh plan in a new folder, or reopen one section?"

Two user phrases: "start over" means ask whether to delete the folder or move it to an `archive` folder first. "Redo section X" means untick it, delete its file, draft it again.

## research.md layout

Header with date and author, then these blocks in order: company snapshot (one sentence, stage, beta or live); ICP (primary, stated versus real problem, firmographics); funnel today (numbers, shape, biggest leak); funding (raised, round status, runway); team (founders, marketing surface by person, gaps); current marketing budget (monthly total, lines, tier); channels active by funnel stage; work already done to acknowledge; in flight and stuck, each with its blocker; strategic posture (top priority, top thing to ignore, investor pressure, constraints); rubric scores (17 rows, or "scored from materials"); materials read with dates.

## Failure patterns to avoid

- A plan written without intake is generic and collapses on first contact with the founder. Waive intake only when the user says so.
- A number you cannot confirm is not guessed. Write `[TBD, confirm with team]` in the plan and add it to the open decisions.
- Voice rules not read before drafting copy-adjacent text.
- A padded idea bank. It is complete only if the skip list carries reasons.
- Soft-pedalled bad metrics. Churn or activation problems are named in current state.
- A plan with no funding logic when a raise is in progress.
