---
id: real-data-seed
module: 12-experiments-and-evaluation
checked: 2026-11-02
---

# A small real-data seed

## Why

- **The problem:** a pipeline tested only on data someone wrote by hand breaks on the first real file. A hand-made fixture can match the real data's shape and still differ in its types, units or formats, and it silently stops matching the source as the source changes ([module 12, The problem](../modules/12-experiments-and-evaluation/README.md#the-problem)).
- **The reason:** a seed is the smallest slice of real data that runs the pipeline from end to end, kept beside the code, never edited by hand. A test runs the pipeline on it and fails, never skips, when it is missing. Because it is real, it carries what the source really sends.
- **The cost of skipping it:** in one of the studio's research tools, a large test suite stayed green while a unit mismatch silently switched off parts of the engine: every fixture built its timestamps in one unit, the real data arrived in another, and the path real data took was never once run under test. It was found only when an archived result failed to reproduce ([module 12, Evidence](../modules/12-experiments-and-evaluation/README.md#evidence)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). A test on made-up data is evidence about the made-up data; a seed makes it evidence about the pipeline.

## Detect

Read-only. Folder names, sizes and counts only. Claude never opens, lists or samples a data file, a seed included.

- Whether your front door mentions a seed or says why there is none, a count per file: `grep -ciE 'seed' CLAUDE.md AGENTS.md 2>/dev/null`.
- Whether the repository has a seed folder: `find "<repo>" -maxdepth 2 -type d -name seeds -not -path '*/.git/*' | wc -l`; if it has, its size only: `du -sh "<repo>/seeds"`.
- Whether it has a folder of hand-made test data, counted, not opened: `find "<repo>" -maxdepth 3 -type d -iname '*fixture*' -not -path '*/.git/*' | wc -l`.
- Claude asks two questions, because the answers are not in any file: "What happens to your tests when the real data is missing: do they fail, skip, or not notice?" and "Who decides what may be done with this data, and have they said anything about copies?"

The menu marks the item **have** when a seed exists, a test runs the pipeline on it, and that test fails when the seed is missing, or when your front door records that your data rules forbid a seed, with the reason; **partly** when only a hand-made fixture exists, or a seed exists that no test needs; and **not yet** otherwise.

## Ask

1. **"What do your data rules allow?"**
   - A small slice of real data may live in the repository: a private repository, and rows that carry nothing your rules protect. Recommended when the data's owner has said yes to that.
   - A slice may exist only on your machine or in a store your organization approved, outside git. The test finds it through a setting on your machine and fails when it is missing. Recommended when copies are allowed but not in a repository.
   - No real data may leave its system: there is no seed, and your front door says so, with the reason and what the real-data test is waiting for. Recommended when Detect cannot tell what the rules allow, until the data's owner says otherwise.
   - Not sure: the option recommended above for what is known: while Detect cannot tell what the rules allow, no seed, with the "no seed" line marked "to confirm with <the data's owner>"; a slice in the repository, or on your machine only, once the data's owner has said yes to that.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no seed, no change.
2. **"Where does the rule go?"** (when there is a seed)
   - The front door of the project that holds the pipeline. Recommended.
   - Your setup folder's front door, for every project inside it that ingests data.
   - Not sure: the project's front door, the option recommended above.
   - Default when skipped: the project's front door.

The `ml` profile makes this item recommended; in the others it is optional.

## Needs

- Git, if the seed lives in the repository (START-HERE, "Prepare").
- Your own test runner, in your language; the kit does not cover a particular one.
- The data owner's yes, for any seed. Only you can get it.

## Steps

For a seed in the repository, steps 1 to 6 and 8. For a seed outside git, the same, with step 3 putting it in the approved place and step 4 reading it through a setting. For no seed, steps 1, 7 and 8.

1. **Claude:** runs `vet-and-adopt` for this item. This card is the whole item, so there is no file to scan; it compares the practice with what Detect found and recommends ADAPT, written in your words.
2. **you:** confirm the rule that applies, and name the data's owner. Claude never reads the data to decide.
3. **you:** make the seed. Pick the slice yourself, or name the source and the filter and let Claude write a short extraction script that you read and then run: `! <your extraction command>`. Claude does not open the rows. A good seed:
   - is real, exactly as the source sent it, never edited and never written by hand;
   - reaches every step of the pipeline: each file type, format and unit the source sends;
   - is as small as that allows. The studio's rule aims at a few megabytes.
4. **Claude:** writes one test that runs the pipeline from end to end on the seed and fails, with a message naming the seed, when the seed is missing. It never skips. Claude shows the test before saving, and states the cost: one run of the pipeline on the seed, each time the tests run.
5. **Claude:** adds the rule to your front door in your words, and shows it first. A starting point: "`seeds/` holds real data: the smallest slice that runs the pipeline end to end. Never edit it by hand, and never call a made-up file a seed. Tests that need it fail when it is missing; they never skip."
6. **you:** prove it from a fresh clone, not by reasoning: `! git clone <repo> <a temporary folder>`, then run your tests inside that folder: `! <your test command>`. Expected: they pass, using nothing from outside the clone. Then delete the temporary folder.
7. **Claude:** (no seed) adds one line to your front door, in your words, and shows it first. A starting point: "No seed: <reason>. The real-data test is blocked on <what would unblock it>."
8. **Claude:** records the decision, where the seed lives (or why there is none), the data owner's answer as you reported it, and the undo in `adoption/decisions.md`.

## Check

1. **you:** (a seed) rename the seed folder for a moment, `! git mv seeds seeds-away` (or move it, outside git), and run `! <your test command>`. Expected: the seed test fails, and its message names the seed. Rename it back and run again. Expected: it passes.
2. **you:** (a seed in the repository) the fresh-clone run in step 6 passed.
3. **Claude:** (no seed) `grep -c '<a phrase from your no-seed line>' <your front door>`. Expected: `1`.

If the test passes or skips while the seed is away, the item is not done: the plan row stays unticked, and the test's check for the seed is the next thing to look at.

## Undo

- **Claude:** removes the test and the line in your front door, from the diffs it showed.
- **Claude:** removes the seed folder from the working tree on your yes (`git rm -r seeds`). The seed stays in the repository's history.
- **you:** if a seed should never have been committed, removing it from history is a history rewrite, which needs your explicit yes and affects everyone who cloned the repository ([a real address in history](../examples/real-address-in-history.md) shows why deleting a file is not enough).

## Watch out

- **A seed in git is in its history for good.** Deleting it later does not remove it; check the rules before the first commit, not after.
- **Never relabel a hand-made fixture as a seed.** A made-up file silently stops matching the source. Hand-made fixtures still have a place, for cases the real data does not contain; they are named as fixtures.
- **A fixture can share the shape and not the type.** The studio's unit mismatch above passed every test because every fixture was built the same way and the real data was not. Ask which data types, units and formats your fixtures hand the code, not only which columns.
- **A hand-built expected value tests nothing about the seam.** In the studio, a report test built its input by hand in the shape the report expected, so its green tests hid a crash that only the real run found, after every number had been computed. A seam test calls the module on the other side and uses what it really returns.
- **An old result that must still reproduce** is a cheap check, written in advance, that can catch what a large suite cannot. The studio's unit mismatch was found that way, and a fingerprint check over a small sample, which never reached the broken code, stayed unchanged across the fix.
- **Personal or confidential data:** the kit cannot judge your organization's rules. The data's owner decides, and "no seed" is a correct answer.
- **Windows line endings:** how git treats a seed's line endings on Windows is not documented in docs/facts.md as of 2026-11-02. Compare the seed's size before the commit and in a fresh clone; a real seed stays byte for byte what the source sent.
- **Token cost:** the rule loads every session. The starting-point line was 201 bytes, about 51 tokens; the no-seed line 76 bytes, about 19 tokens (estimates, bytes divided by 4). The seed itself loads nothing.
- **claude.ai:** upload only what your rules allow. With code execution turned on ([docs/facts.md](../docs/facts.md), "claude.ai: custom skills and the built-in document skills"), ask Claude to run your transformation on the uploaded slice; what code execution can run there is not in docs/facts.md as of 2026-11-02, so compare its result with a run of your own. Keep the slice out of the Project's knowledge unless the rules allow that copy too.
