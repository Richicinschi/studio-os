---
id: baseline-before-claim
module: 12-experiments-and-evaluation
checked: 2026-11-02
tokens:
  light: 82
  standard: 96
  full: 126
---

# A baseline before any claim

## Why

- **The problem:** a number with nothing beside it proves nothing. "The new model scores well" says nothing until you know what the old one scored, or what chance alone would score. And a passing check can be a broken one: it ran nothing, ran the wrong thing, or could not fail ([module 12, The problem](../modules/12-experiments-and-evaluation/README.md#the-problem)).
- **The reason:** a baseline (a number recorded before the change, or a benchmark frozen before the work began) shown beside every result turns "better" into a difference anyone can check. A control registered with each mechanism, such as the same rule applied at random, shows whether the effect is more than chance. A check proven to fail once is a check that can.
- **The cost of skipping it:** in the studio's research, one family of candidates was registered beside a control that applied the same rule at random times; it did no better than its control and was ruled out on the training data. The family registered without such a control went through to the holdout, where it showed no effect. The studio now registers a control for every mechanism ([the holdout that said no](../examples/the-holdout-that-said-no.md)). A run elsewhere in the studio passed every one of its own checks and would have deleted about 190 generated plan pages; the size of the change, compared with what a correct run changes, is what showed it ([the green run](../examples/green-run-that-would-have-deleted.md)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). A claim of "better" is evidence only beside the number it beat.

## Detect

Read-only. Counts only; no note's content and no data file is printed.

- Whether your front door carries the rule, a count per file: `grep -ciE 'baseline|control' CLAUDE.md AGENTS.md 2>/dev/null`.
- Claude asks one question: "When you say a new version is better, what do you compare it with, and where was that number printed?" Your experiment notes folder, if you have one, is `<notes>` below.
- How many notes record a baseline line: `grep -liE '^- *baseline' "<notes>"/*.md 2>/dev/null | wc -l`.
- Whether a file of recorded baselines exists, names counted only: `find "<repo>" -maxdepth 3 -iname '*baseline*' -not -path '*/.git/*' 2>/dev/null | wc -l`.

The menu marks the item **have** when the front door carries the rule and your notes or a baselines file record baselines; **partly** when only one of the two is true; and **not yet** when neither is.

## Ask

1. **"Size?"**
   - Light: a rule in your front door. No result is called better, fixed or working without its baseline beside it; only baselines someone saw printed are recorded; a new check is broken once on purpose before it is trusted; a cause is marked measured or guessed. Recommended for a first adoption, and in the `general` and `software` profiles.
   - Standard: light, plus a "Baseline" line in your experiment-note template, filled before the run: what the baseline is, its number, and what printed it. Recommended in the `ml` and `data` profiles.
   - Full: standard, plus a baselines file (one row per metric: its value, what printed it, the date) and a small compare script that prints every metric beside its baseline and exits with an error on a drop. Recommended when a model or pipeline runs again and again on a schedule, or when Detect finds a baselines file already.
   - Not sure: light, the size recommended above for a first adoption; Claude offers standard after your next comparison.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"What is your baseline?"** (standard and full)
   - The number your current version printed, recorded before the change. Recommended when you are improving something that exists.
   - A benchmark written down and frozen before the work began. Recommended for a new model or a new question, where there is no current version.
   - A control registered with the mechanism: the same rule, applied at random. Recommended when the claim is that an effect exists at all.
   - Not sure: the option recommended above for your work: the number your current version printed when you are improving something that exists, a frozen benchmark for a new model or question, a control when the claim is that an effect exists at all.
   - Default when skipped: the number recorded before the change.

## Needs

- Nothing beyond Claude Code for light and standard.
- Full: the language your project already uses, for the compare script; the kit does not ship one.

## Steps

The sizes: **light** is steps 1, 2, 3 and 7; **standard** adds step 4; **full** adds steps 4, 5 and 6.

1. **Claude:** runs `vet-and-adopt` for this item. This card is the whole item, so there is no file to scan; it compares the practice with what Detect found and recommends ADAPT, written in your words.
2. **you:** name your main metric and its baseline, and where you saw that number printed. If there is none yet, Claude can run the current version once, on your yes, and record what it prints; that costs one run of your current version. Claude never records a baseline it has not seen printed.
3. **Claude:** adds the rule to your front door in your words, and shows it before saving. A starting point: "Never call a result better, fixed or working without its baseline beside it: a number recorded before the change, or a control registered with the run. Record only baselines you have seen printed, and say whether a cause you write down was measured or guessed. Before trusting a new check, break its input once and see it fail."
4. **Claude:** (standard and full) adds these lines to your experiment-note template, in your words, and one sentence to the rule: "Fill the baseline line of the run's note before the run." It shows both first. A starting point:

   ```markdown
   - Baseline: <what it is>, <its number>, printed by <command or cell> on <date>
   - Control, for a new mechanism (registered before the run): <what it is>
   - Result beside the baseline, every difference named:
   ```

5. **Claude:** (full) creates the baselines file, one row per metric (`| Metric | Value | Printed by | Date | Changed by |`), and writes a short compare script in your project's language that reads the newest result, prints each metric beside its baseline, and exits with an error when one drops. It shows both, and adds to the rule: "Compare every run with `<baselines file>` by running `<compare command>`; a drop is a failure until it is explained."
6. **Claude:** (full) proves the compare can fail: it runs it once against a copy of the baselines file with one value raised above the current result, shows the error, and deletes the copy.
7. **Claude:** records the decision, the size, the baseline you named and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -c '<a phrase from your rule, as saved>' <your front door>`. Expected: `1`.
2. **you:** in a new session, say "This is a check of the baseline rule: the new version scores <a number>. Is it better?" Expected: Claude asks for the baseline, or finds it in your notes, and does not call the result better until the two are side by side.
3. **you:** (standard and full) `! grep -ciE '^- *baseline' "<notes>/TEMPLATE.md"`. Expected: `1` or more.
4. **you:** (full) `! <compare command>` on your current results. Expected: every metric printed beside its baseline, and no error. Step 6 showed the other half: the error on a drop.

If check 2 ends with "better" and no baseline beside it, or the compare in step 6 printed no error, the item is not done: the plan row stays unticked. The wording of the rule, or the script's comparison, is the next thing to look at.

## Undo

- **Claude:** removes the rule from your front door, and the baseline lines from your template, from the diffs it showed.
- **Claude:** (full) deletes the compare script on your yes.
- **you:** keep or delete the baselines file. Its rows are your record of what each number was before each change.

## Watch out

- **A check that cannot fail is decoration.** The studio once recorded a project's health baseline from a test command that only built the project: the whole content could have been destroyed and the check would still have passed. Ask what would have to break for it to go red, and break it once.
- **A measurement can confirm what you expected for the wrong reason.** In the studio, a measurement reproduced the expected numbers almost exactly and was wrong: something else on the page dimmed everything. Only a control the effect could not reach, which came back equally dim, showed it. A reading of zero needs the opposite: a control that proves the instrument fires at all.
- **A control can know the future.** In the studio's research, a control was drawn from inside a period whose end was defined by what happened next, so it sat near the outcome by construction and beat the thing it was meant to test. A control that could not see the end showed no effect at all. Ask of every control: could someone at that moment have picked it?
- **A baseline changes only with the code that moved it.** Never edit a recorded baseline in a change that does not also change what moved it; that is how a drop becomes the new normal.
- **A guessed cause outlives the bug.** The studio once wrote a plausible but unmeasured cause into a project's settings, its memory and a handoff note; the real cause was elsewhere and the original worry was false. Mark every cause you write down as measured or inferred.
- **The write-up is claims too.** Before you hand over findings, point every sentence at a row of a table or a command, including the sentences you write while correcting. In the studio, that pass found sentences stronger than their tables, and an independent reviewer with the raw files found what the tables themselves could not show.
- **Token cost:** the rule loads every session. The starting-point line was 327 bytes for light, 384 for standard and 501 for full: about 82, 96 and 126 tokens (estimates, bytes divided by 4). The template, the baselines file and the script load only when Claude opens them.
- **claude.ai:** paste the baseline numbers before you ask for a result, and ask for each result beside its baseline, every difference named.
