---
id: negative-results
module: 12-experiments-and-evaluation
checked: 2026-11-02
---

# Negative results recorded as results

## Why

- **The problem:** a failed idea that is not written down gets tried again, by you next month or by a session that never heard of it. A record that holds only the wins misleads everyone who reads it, and a run that missed its criteria invites tuning until it passes ([module 12, The problem](../modules/12-experiments-and-evaluation/README.md#the-problem)).
- **The reason:** a run that fails its criteria is written down in the same place, and with the same care, as one that passes: the criteria, the outcome, and whether any cause you give was measured or guessed. Ruled-out ideas go on one list that later work reads first and does not retry without a new reason. A "no" written down saves the next run and keeps the record honest.
- **The cost of skipping it:** the studio's research keeps a list of the ideas its evidence ruled out. When a sealed holdout failed the studio's best candidate, the candidate joined that list, and the entry that had announced its win was kept word for word, marked as superseded ([the holdout that said no](../examples/the-holdout-that-said-no.md)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). A record of what was checked includes what failed; a list of wins alone claims more than the evidence showed.

## Detect

Read-only. Counts only; no entry's content is printed.

- Whether your front door carries the rule, a count per file: `grep -ciE 'negative result|ruled[- ]out|falsified|failed run' CLAUDE.md AGENTS.md 2>/dev/null`.
- Claude asks one question: "Where do you keep notes on your experiments, and where does an idea go when it did not work?" The notes folder is `<notes>` below.
- Whether a list of ruled-out ideas exists, and how many entries it holds:
  - `find "<notes>" -maxdepth 2 \( -iname '*ruled*out*' -o -iname '*negative*' -o -iname '*falsified*' \) | wc -l`;
  - in that file, `grep -c '^## ' <the file>`.
- How many notes have a result section, written whichever way the run went: `grep -liE '^#+ .*(after the run|result)' "<notes>"/*.md 2>/dev/null | wc -l`, beside the number of notes, `find "<notes>" -maxdepth 2 -name '*.md' | wc -l`.

The menu marks the item **have** when the front door carries the rule and a ruled-out list exists; **partly** when your notes record results but failed ideas have no list, or the list exists and no rule sends Claude to it; and **not yet** otherwise.

## Ask

1. **"Where do ruled-out ideas go?"**
   - Keep what you have. Recommended when Detect says **have**.
   - A ruled-out list: one file, one entry per idea, read before any new experiment is planned, plus a result section in every note. Recommended in the `ml` profile, or when Detect finds more than a handful of experiment notes.
   - The result section in each note only, written whichever way the run went. Recommended when you run few experiments, or for a first adoption.
   - Not sure: the option recommended above for what Detect found: keep what you have for **have**; the ruled-out list in the `ml` profile or when Detect finds more than a handful of experiment notes; otherwise the result section only, and Claude offers the list after your first failed run.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Does an entry block a retry?"** (when you chose the list)
   - Yes: a retry needs a reason written beside the entry first, such as new data or a mechanism the entry did not test. Recommended when more than one person or session works on the same questions.
   - No: the list is advice; Claude names the matching entries and goes on.
   - Not sure: the option recommended above: yes when more than one person or session works on the same questions, otherwise advice only.
   - Default when skipped: advice only.

## Needs

- Nothing beyond Claude Code and a text file in your notes folder.

## Steps

1. **Claude:** runs `vet-and-adopt` for this item. This card is the whole item, so there is no file to scan; it compares the practice with what Detect found and recommends ADAPT, written in your words.
2. **Claude:** adds the rule to your front door in your words, and shows it before saving. A starting point: "A run that fails its criteria is a result: record it in its note against each criterion, and say whether any cause you give was measured or guessed. Never tune a failed run until it passes; a new attempt is a new run with its criteria written first. Before planning an experiment, read `<notes>/ruled-out.md` and name the entries that touch it." Without the list, the last sentence is left out.
3. **Claude:** adds an "After the run" section to your experiment-note template, or checks that the one from [success criteria before the run](success-criteria-first.md) is there: the result against each criterion, written whichever way it went, and the verdict before any explanation.
4. **Claude:** (the list) creates `ruled-out.md` in your notes folder, in your words, and shows it first. A starting point:

   ```markdown
   # Ruled out

   One entry per idea that failed its criteria. Read before planning a new experiment.
   An entry is retried only with a new reason written beside it: new data, or a mechanism it did not test.

   ## <date>: <the idea, in a few words>

   - Tried, on which data:
   - Criteria, from the note (written before the run):
   - Result, against each criterion:
   - Cause, if known (measured or guessed):
   - Note: <link to the experiment note>
   ```

5. **Claude:** when a later result overturns a claim already written down, keeps the old text word for word, marks it superseded with the date, and links it to the new entry. It never rewrites the old claim.
6. **Claude:** records the decision, whether entries block a retry, where the list lives and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -c '<a phrase from your rule, as saved>' <your front door>`. Expected: `1`.
2. **you:** (the list) add one real entry, or a check entry marked as one, then in a new session say "This is a check of the ruled-out list: let's try <the idea in that entry> again." Expected: Claude names the entry before planning anything, and, if you chose blocking, asks what is new.
3. **you:** after your next run that misses its criteria, open its note. Expected: the result against each criterion, written down, with the verdict first.

If Claude plans the retry without naming the entry, the item is not done: the plan row stays unticked, and the last sentence of the rule is the next thing to look at.

## Undo

- **Claude:** removes the rule from your front door and the section from your template, from the diffs it showed.
- **you:** keep or move `ruled-out.md`. It is your record of what did not work; moving it to an archive folder keeps that record. Deleting it is your decision.

## Watch out

- **An entry rules out what was tested, on the data it was tested on.** So an entry names its data, and a retry on new data is a fair reason.
- **Write the verdict before the explanation.** A reason written beside a result is a second claim, and it reads as tested when it was not. Mark every cause measured or guessed.
- **A guessed cause written down as fact outlives the bug.** In the studio, an unmeasured cause was written into settings, memory and a handoff note, and pinned a project to a version it never needed.
- **Never soften a no.** If the honest answer is "nothing survived", that is the answer. A finding softened to look better cannot be checked.
- **Keep a superseded claim word for word.** Rewriting it loses what was believed and why; the studio keeps the old entry, marked, beside the new one ([nothing freed by loss](../PRINCIPLES.md#nothing-freed-by-loss)).
- **Tuning a failed run until it passes,** and reporting only the pass, turns the criteria into decoration. A new attempt gets its own criteria, written first.
- **Token cost:** the rule loads every session. The starting-point line was 344 bytes, about 86 tokens (estimate, bytes divided by 4). The list loads only when Claude opens it, which the rule asks for before each new experiment.
- **claude.ai:** keep `ruled-out.md` in the Project's knowledge, and start each new experiment chat by asking Claude to read it and name the entries that touch the idea.
