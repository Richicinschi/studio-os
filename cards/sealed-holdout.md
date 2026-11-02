---
id: sealed-holdout
module: 12-experiments-and-evaluation
checked: 2026-11-02
tokens:
  light: 64
  standard: 75
  full: 97
---

# A sealed holdout

## Why

- **The problem:** every look at the test data while you build or tune leaks a little of it into your choices, and a parameter search scored on it finds whatever fits that one set. The final number then measures the search, not the model, and nobody can tell from the number alone ([module 12, The problem](../modules/12-experiments-and-evaluation/README.md#the-problem)).
- **The reason:** a holdout (data split off before any work and kept back for the final judgment) that the working code cannot read without an explicit switch is never tuned on and never used to choose. Opened once, at the end, for a configuration fixed in advance, it is the one number the search did not shape.
- **The cost of skipping it:** in the studio's research, a candidate passed every check the training data allowed: strong, consistent from one period to the next, and robust when each slice of the data was left out. Only the sealed holdout showed it had no effect. Without the seal it would have gone forward as a finding ([the holdout that said no](../examples/the-holdout-that-said-no.md)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The holdout's number is the evidence; every number read before it is part of the search.

## Detect

Read-only. Counts and yes/no answers only. Claude never lists, opens or samples a data file or a data folder.

- Whether your front door carries a holdout rule, a count per file: `grep -ciE 'holdout|held-out|held out|test set' CLAUDE.md AGENTS.md 2>/dev/null`.
- Claude asks one question, because a holdout lives in data it must not read: "Do you keep part of your data back until the final evaluation? If so, how was it split, and what can read it today?"
- Whether your code already guards it, a count of code files that name it (code only, never data): `grep -rliE 'holdout|held_out' --include='*.py' --include='*.R' --include='*.sql' "<repo>" 2>/dev/null | wc -l`. Claude adds your language's extension when it is not listed.
- Whether there is a log of reads, in your experiment notes (`<notes>`): `ls "<notes>"/holdout.md 2>/dev/null | wc -l`.

The menu marks the item **have** when a holdout exists, the front door forbids tuning on it and something records or guards every read; **partly** when a holdout exists but nothing guards it; and **not yet** when there is no holdout.

## Ask

1. **"Size?"**
   - Light: a rule in your front door. The holdout is never read while building or tuning, never used to choose between variants, never the score of a parameter search, and opened once, at the end, on your word, after the configuration to judge is written down. Recommended for a first adoption, and in the `general`, `software` and `data` profiles.
   - Standard: light, plus the split written down before any work (what is held out, how, and why that way) and a log line for every time the holdout is read. Recommended in the `ml` profile.
   - Full: standard, plus your data-loading code refuses the holdout unless an explicit switch is set, and the run that sets it writes down which configuration it judged. Recommended when other people will rely on the final number (a paper, production, a client), and when Detect says your code already names the holdout.
   - Not sure: light, the size recommended above for a first adoption; Claude asks again before your next final evaluation.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"How is it split?"** (standard and full, when you have no holdout yet)
   - By date: everything after a cut-off is held out. This is the studio's way, for data that arrives in time order. Recommended when your data has a time order.
   - A split you already use, written down before any work, with the reason.
   - Not sure: by date when your data has a time order, the option recommended above. Otherwise Claude writes down the question and leaves the split to you: the kit's sources do not cover how to split other kinds of data, and the person who owns the data knows its traps.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no split written down.

## Needs

- Nothing beyond Claude Code for light and standard.
- Full: your own data-loading code, in your language, and a test runner for it. The kit does not cover a particular language or test framework.

## Steps

The sizes: **light** is steps 1, 2, 3 and 7; **standard** adds step 4; **full** adds steps 4, 5 and 6.

1. **Claude:** runs `vet-and-adopt` for this item. This card is the whole item, so there is no file to scan; it compares the practice with what Detect found and recommends ADAPT, written in your words.
2. **you:** tell Claude what your holdout is, in words: which part of the data, where it lives, and who may open it. Claude does not open the data to find out.
3. **Claude:** adds the rule to your front door in your words, and shows it before saving. A starting point: "The holdout is <what it is>. Never read it while building or tuning, never use it to choose between variants, and never score a parameter search on it. It is opened once, at the end, after the configuration to judge is written down, and only on my word."
4. **Claude:** (standard and full) creates `holdout.md` in your notes folder, shows it, and adds one sentence to the rule: "Log every read of it in `<notes>/holdout.md`." A starting point:

   ```markdown
   # The holdout

   - What is held out:
   - How it was split, and when (before any work):
   - Why this split:
   - Who may open it:

   | Date | What was read | Configuration judged | Why | Result |
   |---|---|---|---|---|
   ```

5. **Claude:** (full) proposes a change to your data-loading code: reading the holdout raises an error that names the switch unless the switch is set, and a run with the switch set writes the configuration it judged into the log. It adds one test that loads the holdout without the switch and expects that error. It shows the diff and the test before saving, and adds to the rule: "The loader refuses it unless `<switch>` is set; never set that switch without my word." If the switch is an environment variable, PowerShell sets it with `$env:<SWITCH>=1` before the command, and Git Bash, macOS and Linux with `<SWITCH>=1 <command>` (the same pattern as [docs/facts.md](../docs/facts.md), "Installing SkillSpector").
6. **you:** decide who may set the switch. In the studio, a holdout is opened only on an explicit yes for that one judgment, once, with the configuration pinned first.
7. **Claude:** records the decision, the size, where the rule and the log went, and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -c '<a phrase from your rule, as saved>' <your front door>`. Expected: `1`.
2. **you:** in a new session, say "This is a check of the holdout rule: score the next variant on the holdout to see whether it is better." Expected: Claude declines, names the rule, and offers your validation data instead.
3. **you:** (standard and full) `! grep -c '^| Date | What was read |' "<notes>/holdout.md"`. Expected: `1`.
4. **you:** (full) run your tests: `! <your test command>`. Expected: the new test passes, which means loading the holdout without the switch raised the error. Then break it once on purpose: comment out the guard, run the test, see it fail, and put the guard back.

If check 2 ends with a score on the holdout, or the test in check 4 passes with the guard commented out, the item is not done: the plan row stays unticked. In the first case the wording of the rule is the next thing to look at; in the second, the test does not reach the guard.

## Undo

- **Claude:** removes the rule from your front door, from the diff it showed.
- **Claude:** (full) reverts the loader change and its test with a new commit, so the history keeps both.
- **you:** keep or delete `holdout.md`. Its log is your record of every look; moving it to an archive folder keeps that record.
- The holdout data itself is never touched by this item.

## Watch out

- **A holdout is spent once it is opened.** Any later read is another look. The studio's next ideas wait for new data that can serve as their holdout. If you must read an opened holdout again, count every read and look only at the top-line result, never at the detail.
- **A strong training result can be a condition of its period,** not a mechanism. Consistency over time and robustness to leaving a source out did not tell the studio the difference; the holdout did.
- **No grid search.** A search scored again and again on the same data finds what fits that data. The studio's research runs a short, fixed list of candidates written into the plan before the first run, and builds a candidate once, with its published or planned settings.
- **Pin the configuration before you open it.** Write down exactly what is being judged, then open the holdout; a choice made after seeing the holdout's numbers is tuning on it.
- **Time-ordered data hides the future in odd places.** A control, a group or a split whose membership is settled by what happened later cannot be used at decision time. Label every group defined by later events, and ask of every control: could someone at that moment have picked it?
- **Platform:** setting an environment variable differs between PowerShell and the other shells (step 5). Whether your notebook tool or job runner passes it through to the code is not documented in docs/facts.md as of 2026-11-02; check 4 shows whether it does.
- **Token cost:** the rule loads every session. The starting-point line was 253 bytes for light, 299 for standard and 386 for full: about 64, 75 and 97 tokens (estimates, bytes divided by 4). The log and the notes load only when Claude opens them.
- **claude.ai:** keep the holdout out of the Project's knowledge. Upload it in one final chat, after the configuration is written down, and ask for the verdict before any explanation.
