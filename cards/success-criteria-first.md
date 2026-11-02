---
id: success-criteria-first
module: 12-experiments-and-evaluation
checked: 2026-11-02
tokens:
  light: 77
  standard: 89
  full: 108
---

# Success criteria before the run

## Why

- **The problem:** criteria chosen after the results are in always fit the results. A run with no written way to fail cannot fail, and "it looks promising" takes the place of a pass or a fail ([module 12, The problem](../modules/12-experiments-and-evaluation/README.md#the-problem)).
- **The reason:** written down before the run, and agreed before it starts, the criteria say what result counts as success, what counts as failure, and what you will do in each case. The run then has a way to fail, and its result can be read against lines nobody moved afterwards.
- **The cost of skipping it:** in the studio's research, the bars were written into the plan before the first run, so when the one candidate that survived the training data showed no effect on the holdout, there was nothing left to argue: the verdict was the result ([the holdout that said no](../examples/the-holdout-that-said-no.md)). Without bars written first, the same run could have been read as a near miss worth tuning.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). Criteria written first are what make a later claim of success checkable.

## Detect

Read-only. Counts only; no note's content is printed, and no data file or notebook is opened.

- Whether your front door carries the rule, a count per file: `grep -ciE 'success criteria|before (the|any) run|criteria first' CLAUDE.md AGENTS.md 2>/dev/null`.
- The habit may not be in any file yet, so Claude asks one question: "Where do you keep a note for each experiment or run?" The answer is `<notes>` below; "nowhere yet" is a fine answer.
- In `<notes>`, how many notes there are and how many have a criteria block written before the run:
  - `find "<notes>" -maxdepth 2 -name '*.md' | wc -l`;
  - `grep -liE '^#+ .*(before the run|success criteria)' "<notes>"/*.md 2>/dev/null | wc -l`.
- Notebooks are counted, never opened, because their saved outputs can hold data: `find "<notes>" -maxdepth 2 -name '*.ipynb' | wc -l`.
- Whether `<notes>` is inside a git repository, which the full size needs: `git -C "<notes>" rev-parse --is-inside-work-tree 2>/dev/null || echo "not a repository"`.

The menu marks the item **have** when the front door carries the rule and at least one note has a criteria block; **partly** when only one of the two is true; and **not yet** when neither is.

## Ask

1. **"Size?"**
   - Light: one rule in your front door. Claude asks for the criteria and writes them into the run's note before any run starts. Recommended for a first adoption, and in the `general` and `software` profiles.
   - Standard: light, plus a "Before the run" block at the top of your experiment-note template, so every note starts with the same lines. Recommended in the `ml` profile, or when Detect finds experiment notes.
   - Full: standard, plus the note committed to git before the run starts, so its date and wording can be checked later and the result quotes that commit. Recommended when other people rely on your results (a paper, a thesis, a team, a client) and Detect finds `<notes>` inside a repository.
   - Not sure: light, the size recommended above for a first adoption; Claude offers standard after your next run.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where does the rule go?"**
   - The front door of the one project where you run experiments. Recommended when your experiments live in one repository.
   - The front door of your setup folder, which Claude Code also loads in every project inside that folder (`CLAUDE.md` loads from the working folder and every folder above it, [docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"). Recommended when your experiments are spread across projects under one folder.
   - Not sure: the option recommended above: your setup folder's front door when your experiments are spread across projects under one folder, otherwise the one project, the narrower choice. You can move it later.
   - Default when skipped: the one project.

## Needs

- Nothing beyond Claude Code for light and standard.
- Git, for full (START-HERE, "Prepare").

## Steps

The sizes: **light** is steps 1, 2, 3 and 6; **standard** adds step 4; **full** adds steps 4 and 5.

1. **Claude:** runs `vet-and-adopt` for this item. This card is the whole item, so there is no file to scan; it compares the practice with what Detect found and recommends ADAPT, written in your words.
2. **you:** tell Claude, in a sentence or two, what a typical run of yours answers and how you judge it today: the metric, the data it is measured on, and what you would call good enough. Claude writes the rule from that.
3. **Claude:** adds the rule to your front door in the place you chose, in your words, and shows it before saving. A starting point: "Before any run whose result I will judge, write in its note the question, the metric and its data, the line that counts as success, the line that counts as failure, and what we do in each case. Start the run only after my yes. Criteria never change once a run starts; a change is a new run with new criteria."
4. **Claude:** (standard and full) adds a "Before the run" block to the top of your experiment-note template, or creates `TEMPLATE.md` in `<notes>` when there is none, and adds one sentence to the rule naming that file. It shows the block first. A starting point, to be reworded:

   ```markdown
   ## Before the run (written <date>; not changed once the run starts)

   - Question:
   - Metric, and the data it is measured on:
   - Success if:
   - Failure if:
   - The reason I expect this result (tested on its own):
   - How many variants would pass by chance alone (when comparing many):
   - If it succeeds, we:
   - If it fails, we:

   ## After the run

   - Result, against each line above:
   ```

5. **Claude:** (full) adds to the rule: "Commit the note before the run starts, and quote that commit in the result." **you:** decide whether these commits go to a shared remote, where others can see them before the result exists.
6. **Claude:** records the decision, the size, where the rule went and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -c '<a phrase from your rule, as saved>' <the front door you chose>`. Expected: `1`.
2. **you:** in a new session, say "This is a check of the criteria rule: run <a short script of yours> on the small data and tell me if it is better." Expected: before running anything, Claude asks for the success line and the failure line, or writes them into a note and asks for your yes. If it runs first, the rule is not working.
3. **you:** (standard and full) `! grep -c '^## Before the run' "<notes>/TEMPLATE.md"`. Expected: `1`.
4. **you:** (full) after the next real run, `! git -C "<notes>" log --oneline -- <that run's note>`. Expected: a commit that existed before the run's output did.

If check 2 fails, or any count prints `0`, the item is not done: the plan row stays unticked, and the wording of the rule in your front door is the next thing to look at.

## Undo

- **Claude:** removes the rule from your front door, from the diff it showed.
- **Claude:** removes the "Before the run" block from your template, or deletes `TEMPLATE.md` if Claude created it.
- Notes already written stay: they are your record of what you expected before each run.
- **you:** (full) the commits stay in your history; removing them would be a history rewrite, and nothing in this item needs that.

## Watch out

- **A clause that cannot fail decides nothing.** For each clause, ask what result would have failed it. The studio once registered a two-part decision rule in which one part was true by construction, so the decision rested on the other part alone, which was met exactly at its floor.
- **A reason beside a prediction is a second prediction.** The studio registered a predicted number with its reason; the number came out, and the findings reported the reason as if it had come out too. Split by event, the change came from somewhere else. Write the number and the reason as two lines, and test the reason on its own.
- **Many comparisons pass by chance.** When you compare many variants or cells, write down before the first look how many would pass by chance alone, and print it beside every count. The studio's research does this; it is what let a long list of passing cells be read as a real but small effect, not as a list of winners.
- **A cut made after looking is a story,** until it is written down and run as a new experiment. In the studio, one such cut reversed when the same data was sorted another way.
- **Changing a criterion during a run** makes it a new run. Note the change, and start again with the new line written first.
- **Token cost:** the rule loads every session. The starting-point line was 308 bytes for light, 354 for standard and 430 for full: about 77, 89 and 108 tokens (estimates, bytes divided by 4). The template and the notes load only when Claude opens them.
- **claude.ai:** there is no front door. Ask for the criteria at the start of the chat, and save them as a file in the Project's knowledge before any analysis ([module 12, Apply it in claude.ai](../modules/12-experiments-and-evaluation/README.md#apply-it-in-claudeai)).
