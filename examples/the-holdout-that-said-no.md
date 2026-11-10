---
title: The holdout that said no
studio_sources:
  - .studio/identity/SOUL.md
---

# The holdout that said no

## What happened

A research project in the studio went looking for a repeatable effect in historical data. Before the first run it wrote down a plan that fixed three things.

- **The candidates.** A short list, each one frozen in the plan. There was no parameter search: nothing would be tuned to find its best setting.
- **The bars.** One bar a candidate had to clear on the training data, and a separate bar for the holdout. Each asked for the effect on most slices of the data, not only on the total.
- **The split.** By date: everything before a cut-off for training, everything after it sealed. The code would read the sealed part only with an explicit switch, tied to that exact version of the plan, and only once.

One family of candidates was registered with a control: the same rule, applied at random times.

On the training data, that family did no better than its control, and it was ruled out there. From the other family, one candidate survived. Its result was strong, consistent from one period of the training data to the next, and it held up when each slice of the data was left out in turn.

Then the holdout was opened. The survivor showed no effect: it was negative on every slice. The verdict went into the project's record as its result.

It was not the first time a seal had said no. In an earlier research campaign, the studio's best candidate was judged once on its sealed holdout, with its configuration pinned before the seal was broken, and it failed both of its bars. Under the rules written in advance, its title as the best was withdrawn and the campaign closed with nothing to deploy. The winner joined the list of ideas the evidence had ruled out, and the entry that had announced its win was kept, word for word, marked as superseded.

## What it cost, or would have

The project spent its search and found nothing to use. That is the cost of the method, and the studio records it as a result.

Without the seal, the survivor would have looked like a finding: it had passed every check the training data allowed, including the ones meant to catch a fluke. Only data it had never seen could show that it was not.

## The rule it produced

- **A strong training result can be a condition of its period, not a mechanism.** Consistency over time and robustness to leaving a slice out did not tell the two apart; only the sealed holdout did.
- **Register a control for every mechanism.** The family with a random-time control was ruled out on the training data; the family without one went through to the holdout.
- **A holdout is spent once it is opened.** The next ideas on the project's list wait for new data that can serve as their holdout.
- **A no is a result.** The studio's values put it plainly: a falsified hypothesis stated plainly is worth more than a flattering one left unexamined, and a candidate declared dead is recorded as a real result, not as a failure. If the honest answer is "nothing survived", that is the answer.

## How to apply it

- Write the plan before the first run: the candidates, a bar for the training data and a separate one for the holdout, the split, and a control for each mechanism. Keep it where its date and wording can be checked later, such as a commit.
- Keep the holdout where your code cannot read it without a switch, and pin the configuration you will judge before you open it.
- Search a short, fixed list. A grid scored again and again on the same data finds what fits that data.
- When the answer is no, write it down where a yes would have gone, and add the idea to a list of what was ruled out, with the data it was ruled out on.
- In claude.ai: keep the holdout out of the Project until one final chat, and ask for the verdict against each bar before any explanation.
- The cards: [success criteria before the run](../cards/success-criteria-first.md), [a sealed holdout](../cards/sealed-holdout.md), [a baseline before any claim](../cards/baseline-before-claim.md), [negative results recorded as results](../cards/negative-results.md).
