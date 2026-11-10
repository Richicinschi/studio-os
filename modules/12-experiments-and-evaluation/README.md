---
title: Experiments and evaluation
pack: data-work
studio_sources:
  - .studio/memory/feedback_green_can_be_a_lie.md
  - .studio/memory/feedback_research_search_design.md
  - .studio/memory/feedback_docker_long_tasks.md
  - .studio/rules/hard-rules.md
  - .studio/identity/SOUL.md
questions:
  - "Do you write down what result would count as success before a run starts, or decide once you see it?"
  - "Is part of your data held back until the final evaluation, and what stops your code from reading it earlier?"
  - "May a small slice of your real data be kept beside your code under your organization's data rules?"
---

# Experiments and evaluation

Decide what would count as success before the run, judge the result on data the work never saw, and keep the answer when it is no. This module is how the studio runs its research.

## The problem

An experiment can go wrong in ways that all look like success.

- The criteria are chosen after the results are in, so they fit the results. A run with no written way to fail cannot fail.
- The test data is looked at while tuning. Each look leaks a little of it into the choices, and a parameter search scored on it finds whatever fits that one set. The final number then measures the search, not the model.
- A number stands alone, with nothing recorded beside it to compare against, or the check behind it could not have failed.
- The pipeline was tested only on data someone wrote by hand. It matches the real data's shape but not its types, so the path real data takes is never run under test, and it can fail there without an error.
- A long run sits in a terminal, dies with the session, and takes its log with it.
- A search finds only what its filter lets through, and nobody stated the filter.
- A failed idea is not written down, so it is tried again, and the record holds only the wins.

In the studio's experience these failures report success or silence, never an obvious error. Nothing tells you to go looking.

## The mechanism

- **Success criteria before the run.** Before a run, write down the question, the metric and the data it is measured on, the line that counts as success, the line that counts as failure, and what you will do in each case. Then test the criteria themselves:
  - for each clause, ask what result would have failed it; a clause that is true by construction decides nothing;
  - write each expectation as two lines, the number and the reason you expect it, and test the reason on its own: a reason written beside a prediction is a second prediction;
  - when many variants or cells are compared, write down before the first look how many would pass by chance alone, and print that beside every count;
  - a cut you think of after looking at the results is a new run, written down before it is read.
- **A sealed holdout.** Split part of the data off before any work begins, and keep it where the working code cannot read it without an explicit switch. The studio splits by date, with everything after a cut-off sealed, and ties the switch to the written plan, so the holdout is opened once, for the configuration fixed beforehand. It is never tuned on and never used to choose between variants. There is no grid search: the candidates are a short, fixed list written into the plan. Once opened, a holdout is spent; the next idea needs new data to be judged on.
- **A baseline before any claim.** Every result is shown beside a baseline: a number recorded before the change. Every mechanism gets a control registered with it, such as the same rule applied at random times. A control must be one you could have picked at that moment: one drawn from a period whose end is defined by what happened later knows the future. Measure one control the effect cannot reach; if it moves too, the instrument is measuring something else. Never record a baseline you have not seen printed, and prove a new check can fail by breaking its input once.
- **A small real-data seed.** Keep the smallest slice of real data that runs the pipeline end to end beside the code. A hand-written fixture is never relabelled as a seed: a made-up file silently stops matching the source. A test that needs real data fails when the data is missing; it never skips. The test of a seed is a fresh clone that runs the pipeline with nothing from outside the repository, proven by running it, not by reasoning. The seed stays inside your data rules: where they forbid one, there is none. The studio exempts a project from its seed rule only by name and with the reason, so a missing seed is a recorded decision, not a gap nobody noticed.
- **Long runs in named containers.** A run longer than a few minutes goes into a named container whose log outlives the session, writing its progress as plain lines every so often, not as a redrawn progress bar. The data stays on the host, outside the container. Heavy compute gets a resource cap. Module 04 has the card: [long jobs in containers](../../cards/long-jobs-in-containers.md).
- **Sweeps that demand a mechanism.** The filter decides what a search can find. State it, ask what it makes invisible, and run a second lane against that. A finding names its mechanism precisely enough to rebuild it from the sentence; "it looks promising" is not a finding. A skeptic with a fresh context, one that owes the search nothing, attacks each finding first, and anything fabricated is struck out by name.
- **Negative results recorded as results.** A run that fails its criteria is written down in the same place, and with the same care, as one that passes: the criteria, the outcome, and whether any cause you give was measured or guessed. Ruled-out ideas go on a list that later work reads first and does not retry without a new reason. A claim that a later result overturns is kept word for word, marked as superseded.
- **The write-up is claims too.** Before handing over findings, point every sentence at a row of a generated table or at a command. Then give the raw files, not the conclusions, to one independent reviewer: checking sentences against tables finds what the tables say; a reviewer with the raw files finds what they could not show.

Why the studio works this way: [evidence before claims](../../PRINCIPLES.md#evidence-before-claims).

## Evidence

A research project in the studio wrote its plan down before the first run. It fixed a short list of candidates, each frozen. It set a bar each candidate had to clear on the training data and a separate bar for the holdout, both asking for the effect on most slices of the data and not only overall. And it split the data by date, with everything after the cut-off sealed behind a switch that could be used once, for that exact plan. One family of candidates was registered with a control that applied the same rule at random times.

On the training data, that family did no better than its control and was ruled out there. One candidate from the other family survived. Its result was strong, consistent from one period of the training data to the next, and it held up when each slice of the data was left out in turn. Then the holdout was opened. The survivor showed no effect, and it was negative on every slice. The verdict went into the project's record as its result.

The studio wrote down two lessons. A strong, consistent result on training data was a condition of its period, not a mechanism, and the sealed holdout is what caught it. And the family that survived training had been registered without a random-time control, so the studio now registers a control for every mechanism. The full story: [the holdout that said no](../../examples/the-holdout-that-said-no.md).

A second story shows why a seed must be real data. In another of the studio's research tools, a large test suite stayed green while a unit mismatch silently switched off parts of the engine. Every test fixture built its timestamps in one unit and the real data arrived in another, so the path the real data took was never once run under test. A fingerprint check over a small sample stayed unchanged across the fix, because its sample never reached the affected code. The bug was found only because an archived result had to reproduce and did not; the fix restored it exactly. The studio now asks which data type its fixtures hand the code, not only which shape, and keeps a cheap check, written in advance, that an old recorded result still reproduces.

## Apply it in Claude Code

1. **Decide where experiment notes live:** one note per run, named with its date, in a folder Claude can read. Write the place into your front door. The cards in this module add their blocks to that note's template.
2. **Adopt the practices** through your adoption plan, each with its card. A practice defaults to ADAPT: Claude writes it into your files in your words. For the `ml` profile all five are recommended; for `data`, the baseline is.
3. **Before a run,** say "criteria first". Claude fills the note's "before the run" block and waits for your yes. At the full size, the note is committed before the run starts, so its date and wording can be checked later.
4. **Seal the holdout before any work.** Say what it is and who may open it; Claude does not open the data to find out. When the time comes, write the configuration to judge into the note, then open the holdout once.
5. **Show every result beside its baseline,** and register a control with every new mechanism, before the run.
6. **Keep a seed** if your data rules allow one; otherwise write one line in the front door that says there is none, and why.
7. **Run long jobs in a named container** (the module 04 card). Ask Claude to write the container's setup and to log progress as plain lines.
8. **Brief sweeps through subagents** (papers, datasets, model variants) with the filter stated and the question of what it hides; run a second lane against it; give each finding a required "mechanism" field; and hand a separate skeptic subagent, with a fresh context, the raw finds rather than the summary. The studio's own sweep, filtered for what a script could verify, could not reach the kind of finding it was after; a second sweep, filtered the other way, found it.
9. **Write the result either way,** against each criterion, and add a failed idea to the ruled-out list. Before handing over findings, point every sentence at a table row or a command, then ask one reviewer subagent to check the findings against the raw files.

## Apply it in claude.ai

1. **Put the rules in the Project's instructions,** in your words: criteria before any run, a baseline beside every number, results recorded either way.
2. **Start each experiment chat with the criteria:** "Before anything else, write the question, the metric, the success line, the failure line and what we do in each case. Ask me one question at a time until you can." Save the answer as `criteria-<topic>.md` in the Project's knowledge before any analysis.
3. **Keep the holdout out of the Project's knowledge.** Upload it in one final chat, after the configuration to judge is written down, and ask for the verdict against each criterion before any explanation.
4. **Give the baseline with every result:** paste the baseline numbers first, and ask for each result beside its baseline, with every difference named.
5. **Upload only what your data rules allow.** Running code on an uploaded file needs code execution turned on ([docs/facts.md](../../docs/facts.md), "claude.ai: custom skills and the built-in document skills"); a long run belongs on your own machine, not in a chat.
6. **Keep `ruled-out.md` in the Project's knowledge,** and start each new experiment chat with "Read ruled-out.md and tell me which entries touch this idea."

Practices with cards: [success criteria before the run](../../cards/success-criteria-first.md) · [a sealed holdout](../../cards/sealed-holdout.md) · [a baseline before any claim](../../cards/baseline-before-claim.md) · [a small real-data seed](../../cards/real-data-seed.md) · [negative results recorded as results](../../cards/negative-results.md).
