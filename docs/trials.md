# How the adoption flow was tested

This page records how the kit's adoption flow was tried before release, what broke, and what changed. It is a record, not a certificate.

**Agents played the adopters, not real people.** A headless Claude Code ran the kit's skills as "the drill". A second agent answered its questions as an invented persona, from a written script. No real adopter has run the kit yet, as of this record (2026-11-03).

## Setup

- Two invented personas, named here by profile only: the data persona and the ml persona. The kit has four profiles (`data`, `ml`, `software`, `general`); the trials covered two.
- Each trial ran in a separate Claude Code configuration, with a separate git configuration, key folder and GPG folder. Before the first turn and after the last, a script hashed the real machine's global git config and its key folders. Every pair matched, in all six runs.
- The drill's replies were logged turn by turn. A separate judge agent then marked each pass condition PASS or FAIL against the log and the files the drill wrote.
- The drill ran headless: writes under `.claude/` were refused, and the persona deferred every `!` command (a command the adopter types themselves). Both limited how far the first runs got. The judge did not count them against the kit by themselves.

## Pass conditions

| # | Condition |
|---|---|
| 1 | One question per message |
| 2 | Data rules asked before any storage is proposed |
| 3 | Two modules skipped on the persona's answers, one line each |
| 4 | The spec is tailored and written only after an explicit yes |
| 5 | One plan task per adoption item |
| 6 | Three items adopted: scanned first, asked first, recorded in the decision log |
| 7 | Nothing written into the kit repository; no placeholder or studio path in the adopter's files |
| 8 | Tests and the hook canary pass on Windows, macOS and Linux |
| 9 | Discovery: asked first; inventory complete; secrets and data files noted, never opened |
| 10 | Gap report: uncovered tools marked, one route each, outside candidates scanned first |
| 11 | Existing work: clean check, restructure plan with undo, merge not replace |
| 12 | Empty folder: tree from the templates; `git init` only on its own yes |
| 13 | The five phases in order; inventory with a labelled estimate before the first decision |
| 14 | Feature menu: both flags on every item, skips recorded, total shown before the spec |
| 15 | Verify: handover written, a check per item, a fresh session resumes from the files |
| 16 | Cards and signing: signing question with recommendation, no key details printed, real keys untouched |
| 17 | The ml persona gets a different, fitted menu (profile, module 12, no app items) |
| 18 | No studio terms, paths or copied identity lines in the adopter's files |
| 19 | Kind and true: Not sure and Skip options, terms explained, claims sourced, small first plan |
| 20 | Skills the adopter already has are listed by name only, and left alone |

Conditions 1 to 16 come from the original trial task. Conditions 13 to 16 test the install sequence and feature menu (build task 14b). Conditions 17 and 18 test profiles and fitting (build task 14c); 19 and 20 test the question rules and existing skills.

Tasks 14b and 14c were build tasks, not trials: they added the five-phase sequence, the feature menu, per-profile importance, sizes and module 12. The trial then tested what they built.

## Runs 1 to 3: the full trial

All three ran on the kit as of the v2.0.0 build plus one later commit, before any fix.

| Run | Persona | Start | How far it ran |
|---|---|---|---|
| 1 | data | existing work: a small repository, a notebook, a hook, a secrets file and a data folder | 89 turns, then one fresh session. 6 of 34 plan rows ticked |
| 2 | data | an empty folder, create mode | 34 turns. 3 of 34 plan rows ticked |
| 3 | ml | existing work, a training repository | 18 turns. Stopped at the first install row, by design |

**Judged result: 6 PASS, 14 FAIL, out of 20.**
PASS: 3, 4, 7, 8, 18, 20. FAIL: 1, 2, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19.

What broke, by kind:

- **Asking too much at once.** Extra optional asks attached to a question (1); an options list that described storage before the data rules were known (2).
- **Plans too big and too bundled.** Every first plan had 34 rows, so no run reached Verify (13, 15). Some rows folded two items into one (5).
- **Records not written.** Items were scanned and asked about, but the decision log had no row until a check had run, and the checks waited on commands the persona deferred (6).
- **Skipped steps.** The layout question was never asked, so no restructure happened (11). Create mode left most of the template tree to later rows, and `git init` was folded into another question (12). The signing question dropped options or was skipped (16).
- **Reading too much.** The drill listed every file name in the folder before the adopter agreed, which also lists secrets and data file names. File contents stayed closed (9).
- **Wrong coverage.** A practice card was counted as coverage for a database connector that was not vetted (10).
- **Menu grouping.** Items were grouped on one line, and one unchosen item was marked "assumed" (14).
- **Fit.** The ml persona's own word for its framework never reached the spec (17).
- **Kind and true.** Missing Not sure and Skip options, terms never explained, claims with no source in `docs/facts.md`, and unlabelled estimates (19).

Operating systems (condition 8) passed: 75 of 75 tests on all three systems; the hook canary passed 6 of 6 on Windows and macOS, and 5 of 5 plus one skip (no secret scanner in the image) on Linux; every install line in START-HERE's Linux blocks ran in a fresh container, 16 of 16. macOS and Linux were arm64; x64 Linux was not run.

**Fixed in v2.0.1** (the first public release after the build): the first plan comes in waves of about 8 rows and the rest wait under Later; `git init` is its own question; the data rules come before storage; question rules (one question, a recommended option, what Not sure does); the signing question follows its card; `docs/facts.md` gained dated facts for claims the drill had made without a source. See `CHANGELOG.md`.

## Runs 4 to 6: re-runs after the fix pass

Only the data persona was re-run. The ml persona, the empty folder and the operating systems were not repeated.

**Run 4: existing work, start to the first plan rows.** 78 turns, including one fresh session. The spec was approved at turn 74. The first plan had 8 wave-1 rows and 19 later rows. The adopter stopped it at turn 77, after wave 1 had started.

Judged result: **10 PASS, 3 FAIL, 2 partial, 5 n/a (scope).**
PASS: 2, 3, 4, 5, 7, 9, 10, 13, 18, 20. FAIL: 1, 14, 19. Partial (the reached part passed): 15 (resume from files), 16 (signing question and real keys untouched). n/a (scope): 6, 8, 11, 12, 17. Condition 11 was n/a because execution comes in later rows, though the layout question was asked and carried into the plan.

What still broke:

- **1:** one message restated the whole picture and asked for approval of the spec as two questions.
- **14:** ten council seats on one menu line.
- **19:** no recommended option on some questions; Not sure not taking the recommended option in four places; Skip for now repeating Not sure; token terms explained after first use; running token totals repeated; one count stated wrongly (19 items against 20).

The judge also recorded that row 1 could never be ticked before the front-door row in an existing-work plan, and that a read-only scan of the adopter's own skills ran without a word to the adopter.

**Run 5: existing work, start to spec only.** 24 turns. The adopter approved the spec at turn 24. The plan showed 9 wave-1 rows; 32 items wait for later. The three phase lines appeared at turns 1, 2 and 23. No message clearly asked two questions; one was borderline. This run had no separate judge; the figures are the driver's own summary. The drill corrected its own item count (29 to 32) in its last message.

**Run 6: existing work, start to the end of the feature menu.** 17 turns. The first menu message listed 12 module lines, not every item; the adopter opened one module and named two single items. Three picks and one refusal were written to `adoption/features.md` as asked. No message asked two questions. This run had no separate judge either. Its note: the end-of-session check was never offered, so the persona's refusal went unused.

**Fixed after run 4, in v2.0.1:** Decide tailors only the first wave (before run 5); the menu shows modules first (before run 6); every question has a recommendation and the spec is asked for once; a card offers Skip for now only where it leaves the question open. The last two came after run 4's judgement and were not re-run. v2.0.2 changed the README and added the banner and the maintainers' publishing routine; nothing in the adoption flow.

## Other reviews

Agents also read the kit cold, as a newcomer, and checked it for private detail, unsourced claims, and the user's point of view. Their findings were fixed before release. Those reviews are in the private development history; they are agent reads, not adopter trials.

## What this does not prove

- **Agents are not people.** A model answering from a script does not get bored, confused or interrupted. Real adopters will fail in ways no log here shows.
- **One plan, one model.** Every run used the same plan and one Claude model. Another model, or a later version of the same one, may follow the skills differently.
- **Scripted answers made some steps easier than real ones.** The persona always had an answer ready, never asked what a term meant, and deferred every command the drill handed over.
- **Runs 4 to 6 reached only the early phases.** Install and Verify were reached in no re-run. The last two fixes were never re-run at all.
- **Two personas, one operating system for the full trial.** The data persona and the ml persona do not cover the software or general profiles.
- **Judged by an agent.** The judge worked from logs and files, and the pass counts above are its marks.

If you try the kit, you become the first real test. Say where it broke.
