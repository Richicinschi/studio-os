# How the adoption flow was tested

This page records how the kit's adoption flow was tried before release, what broke, and what changed. It is a record, not a certificate.

**Invented personas played the adopters, not real people.** A headless Claude Code ran the kit's skills as "the drill". In runs 1 to 6 a second agent answered its questions as an invented persona, from a written script; in runs 7 to 9 the person running the trial wrote each answer from a short persona. No real adopter has run the kit yet, as of this record (2026-11-09).

## What the kit was tried on

Each row is a run someone made, with what it ran on and when. "Not recorded" means the record of that run does not say; it is not a guess left blank.

| What ran | Operating system | Claude Code | Node.js | Date | Where it is recorded |
|---|---|---|---|---|---|
| The tests and the lint, on GitHub's runners, for each release; for v3.0.0 they failed on Ubuntu, and v3.0.1 fixed the tests | Ubuntu, Windows and macOS (`ubuntu-latest`, `windows-latest`, `macos-latest`) | not used | 22 | each release from v2.0.3 (2026-11-03) to v3.4.0 (2026-11-22) | `CHANGELOG.md`, v2.0.3 and v3.0.1; `.github/workflows/test.yml` |
| The tests, the hook canary and START-HERE's Linux install lines (runs 1 to 3) | Windows; macOS on arm64; Linux on arm64, in a fresh container. x64 Linux was not run | not used | not recorded | 2026-11-02: after the v2.0.0 build and before v2.0.1, both of that date in `CHANGELOG.md` | runs 1 to 3, below |
| Adoption runs 1 to 6 | not recorded | not recorded | not recorded | 2026-11-02, the same way | runs 1 to 6, below |
| Adoption runs 7 to 9, the domains | not recorded | 2.1.319 | not recorded | 2026-11-09 | runs 7 to 9, below |
| The deny rules for secret files, headless | Windows | 2.1.319 | not used | 2026-11-09 and 2026-11-10 | [docs/facts.md](facts.md), "Claude Code: permission rules for secret files" |
| The same deny rules, headless | macOS 26.5.1 | 2.1.321 | not used | 2026-11-10 | the same section |
| `claude plugin list --json` in a throwaway config folder | not recorded | 2.1.329 | not used | 2026-11-20 | [docs/facts.md](facts.md), "Claude Code: installed plugins and their skills" |
| A deep review that cloned the kit, ran the tests, the git guard, the hooks and the card commands: 151 tests passed, 2 skipped | Windows 10, in Git Bash and Windows PowerShell 5.1, with git 2.54.0 and gitleaks 8.30.1 | a session of it; version not recorded | 22.23 | 2026-11-10 | public issue #36 |
| The tests and the lint on the newer Node.js line, on a clone in a container (`node:24-trixie`): 438 tests, 432 passed, 0 failed, 6 skipped (two run on Windows only, one needs a user other than root, one needs gitleaks, two need the maintainer's local lists); lint clean | Linux x64 | not used | 24.22.3 | 2026-11-25 | this table; from the next release on, the CI job `test-node-24` |
| A domain on claude.ai | not tried: the zip was built and listed, not uploaded | | | 2026-11-09 | runs 7 to 9, below |

## Setup

- Two invented personas, named here by profile only: the data persona and the ml persona. The kit has four profiles (`data`, `ml`, `software`, `general`); the trials covered two.
- Each trial ran in a separate Claude Code configuration, with a separate git configuration, key folder and GPG folder. Before the first turn and after the last, a script hashed the real machine's global git config and its key folders. Every pair matched, in all six runs.
- The drill's replies were logged turn by turn. A separate judge agent then marked each pass condition PASS or FAIL against the log and the files the drill wrote.
- From run 10 on, each run records its tokens: each turn runs as `claude -p --output-format json` (the first with the opening message, each later one with `--resume <session id>`), and the `usage` field of each turn's JSON output is added up: tokens written to the prompt cache, read from it, sent uncached, and written by the model. The run's section states the four sums and the context at the first reply.
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

## Runs 7 to 9: domains (2026-11-09)

The kit gained domains (packs of skills installed together) and a domain question in the drill. These runs tried that path only, on the kit as built that day, with Claude Code 2.1.319. Each ran in a throwaway folder outside every repository: a fresh clone of the kit, and an empty folder for the adopter's setup. The session loaded project settings only, so none of the author's own skills, agents or memory could reach it. The reply to each question was written by the agent running the trials, a separate Claude Code session, from a short persona; no person typed during the runs. Nothing was judged by a separate agent.

| Run | Persona | Answers fitted | How far it ran |
|---|---|---|---|
| 7 | a weekly podcaster who cuts clips for social media | the audio and video domain | 34 turns, to the handover, then three fresh sessions |
| 8 | a short-story writer | no domain | 17 turns, to the approved plan and the first install row |
| 9 | the same writer, same answers, on the kit after the fixes below | no domain | 18 turns, to the approved plan |

**Run 7 result.** The whole run, turn by turn, with the files it wrote: [examples/adoption-run-7.md](../examples/adoption-run-7.md).

- The domain question offered only the domain that fits the work, with its every-session cost (about 69 tokens, an estimate) and "None of these fit" as a choice.
- The pack was scanned by SkillSpector before anything was copied: 20 out of 100, LOW, SAFE. The drill read the two medium findings, found both to be false alarms, and said what it had not read.
- It landed as 18 files, byte-identical to the kit copy, plus the reviewer agent. This pack has no stubs; the stub copy was not tried.
- A fresh session named the pack; none listed the agent (turn 34 says so). Asked to clean up a recording, it opened the pack, read the matching skill, and applied the adopter's style rules from the style page. It stopped at a plan, as asked.
- Three further fresh questions were answered from the adopter's own files, each with its source file named.
- `node tools/upload-bundle.mjs audio-video-media --out <folder>` wrote a zip of 18 files; `tar -tf` listed them, with no agents or stubs in it.
- Nothing was written into the kit's folder. The only studio-looking text in the adopter's files was a first name, taken from the machine and put in the spec's header unasked. The drill now never writes a person's name unless it is given and asked for; run 9 shows it.

**Run 8 result.** The adopter's work fitted no domain. The drill recorded "none: no domain fits" in `adoption/features.md`, the plan has five rows and none is a pack, and the setup folder has no `.claude` folder. Nothing installed.

**Run 9 result.** The three fixes below were tried against run 8's script, on a fresh clone of the fixed kit.

- **No domain named.** When nothing fit, the question had two choices, "None of these fit" and "Not sure", and named no domain. Run 8 had named both.
- **Plan answers from the facts file.** The persona again said Free plan. The drill quoted "The free claude.ai plan does not include Claude Code" from `docs/facts.md`, with its section, pointed out that the persona was running Claude Code, and asked which account it was. Run 8 had said nothing was documented. The persona then said it was a slip and named Pro.
- **No name in any file.** The spec's header said "Adopter: the adopter", and a search of every file in the setup folder found neither the machine user's name nor the author's.
- **Counts.** The drill said the plan had 6 rows, and a count of the rows in the file gave 6. It did not quote the command it used, which the skill now asks for. One earlier message said "5 items" and the spec said 4 menu items plus the folder step, so the wording still mixes menu items and plan rows.
- Nothing installed: no `.claude` folder, four files in the setup folder.

**What still broke:**

- **Writes under `.claude/` were refused**, as in runs 1 to 6. A permission-bypassing run was refused by the machine's classifier, and was not worked around. The drill handed over a copy line for each file, and the agent running the trial ran it. So the install was the adopter's copy, checked by the drill with a byte comparison, not the drill's own write.
- **Run 8 named the domains it had just said do not fit.** Fixed; run 9 shows it.
- **The kit version in the spec was wrong.** Run 7's spec said v2.0.0, taken from a manifest that a release never updated; run 8 caught it from the changelog, and run 9's spec still said v2.0.0. A release now writes its version into the manifest. Tested, not re-run, because no release has been made since.
- **A file count was off by one.** The drill reported 17 files copied; there were 18. The skill now says counts come from a listing run in the same sitting and are quoted with the command; run 9 reached no install, so this is only partly shown.
- **Run 8's plan answer.** Fixed; run 9 shows it.

**Not tried:** the advisor council domain and its `council` stub; installing a domain on claude.ai (the zip was built and listed, not uploaded); a second operating system; any run past the first handover.

## Run 10: the short path (2026-11-25)

The drill gained a short path, "Start with continuity": the scanner, a front door and a handoff note, then a fresh session that must answer "where did we stop?" from the files. This run tried it once, on the kit as built that day, on Windows 10, with the Claude Code that printed 2.1.332 for `claude --version` on that machine the same evening (the run itself was refused the command). Like runs 7 to 9, it ran in a throwaway folder outside every repository, from a fresh clone of the kit, with an empty folder for the setup, and loaded project settings only. Each turn was a headless `claude -p` call that resumed the conversation, and file writes were allowed in the working folders, nothing more.

**An agent played the adopter.** The agent running the trial wrote each answer after reading the reply, from a short persona: a freelance data analyst with one folder per client, whose problem was that each morning starts from zero. It answered at once, picked the recommended option, and added one rule of its own. When the drill handed over a `!` line, the agent ran the command in a terminal of its own and pasted the output. Nothing was judged by a separate agent.

**Result: passed.**
- **Time:** 7 minutes 1 second from the first message to the fresh session's answer, and 7 minutes 28 seconds to the drill's closing message, measured. That took 17 messages: 15 in the drill's conversation, the last of them the report back, and 2 in the fresh session. The durations Claude Code reported for the 17 turns, its tool runs included, add up to 240 seconds.
- **Tokens,** as Claude Code reported them for the 17 turns (the `usage` of its JSON output), added up: 86,593 written to the prompt cache, 2,785,418 read from it, 120 sent uncached, and 23,745 written by the model. Most of the reading is the same context sent again each turn and read from the cache. The first reply went out with about 60,200 tokens in context, Claude Code's own instructions and tools included. From this run on, each trial records these figures. This run used the drill as one file; it now reads its phases one at a time, as START-HERE's "What the adoption reads" shows.
- **The scanner** at the pinned version was already on the trial's PATH, as a small script that runs it through `uvx`, so it was checked and kept, not installed. Its check (a scan of one kit skill compared with the kit's record) matched.
- **The front door** was written in the persona's words with the rules it chose, and loaded by a one-line `CLAUDE.md`. The handoff template followed, with the two front-door lines and a first note.
- **Every kit template was scanned before use, and again once installed.** Each scan was SAFE, 0 out of 100.
- **The fresh session was started in the setup folder.** It listed the rules when asked what it must never do. Asked "where did we stop?", it named the note, `handoffs/2026-11-25-adoption-short-path.md`, and its next step, "Start the adoption" in the kit folder.
- **Nothing was written into the kit's folder.** No person's name and no path of the author's machine is in the setup files.

**What it did not show:**
- **A person's time.** Reading each reply and running the six handed-over commands takes longer than an agent answering at once.
- **The scanner's install.**
- **The permission prompts of an interactive session.** In this headless run the permission check refused the cards' multi-command Detect lines, the version check and the drill's own clock. The drill handed the version check and the scans over as `!` lines. It left the check for a `CLAUDE.md` in a folder above the setup and the count of user-level skills as "not checked", said so, and wrote it to `adoption/kit-notes.md`. In an interactive session those are permission prompts the person answers. The drill could not measure its own time; the trial's driver did.

## Other reviews

Agents also read the kit cold, as a newcomer, and checked it for private detail, unsourced claims, and the user's point of view. Their findings were fixed before release. Those reviews are in the private development history; they are agent reads, not adopter trials.

## Run 11: a domain as a Claude Code plugin, in a local marketplace (2026-11-26)

Claude Code's plugin system installs, versions, updates and removes skills and agents. This run tried whether a domain fits it, with the advisor council domain, on Windows 10 with Claude Code 2.1.332. Nothing was published: the marketplace was a folder in a throwaway directory. Every command but the first ran with `CLAUDE_CONFIG_DIR` set to a throwaway configuration folder. The first, `claude plugin marketplace list` without it, listed the maintainer's own marketplaces, to compare: the throwaway configuration showed only the built-in directory. The maintainer's own `~/.claude` settings and plugins were the same, file by file, before and after. The run was made twice, the second time keeping every command's output.

**The plugin:** the domain as `vet-and-adopt` places it. The entry and its `skills/` folder became one skill, and its eight agents went beside it. Two manifest files were added: `.claude-plugin/plugin.json` in the plugin, and `.claude-plugin/marketplace.json` in the marketplace folder. The domain's files are the kit's, scanned SAFE, 0 out of 100 (SkillSpector v2.13.6, 2026-11-21).

| Step | Command | Result |
|---|---|---|
| Validate | `claude plugin validate` on the plugin, then the marketplace | Passed; the marketplace with one warning, no marketplace description |
| Install | `claude plugin marketplace add <folder>`, then `claude plugin install <domain>@<marketplace>` | Installed at user scope, version 1.0.0. `claude plugin validate` listed the skill and the eight agents under the plugin's name, such as `advisor-council-for-big-decisions:karen-skeptic`. The plugin was copied into the plugin cache, `cache/<marketplace>/<plugin>/1.0.0/`, 16 files, though [docs/facts.md](facts.md#claude-code-installed-plugins-and-their-skills) says a plugin from a marketplace added from a local folder is not; `claude plugin list --json` named both that folder (`installPath`) and the marketplace folder (`readFromFolder`). Which one a session reads was not tested. |
| Update | version 1.0.1 with one changed line, `claude plugin marketplace update`, then `claude plugin update` | "updated from 1.0.0 to 1.0.1", with "Restart to apply changes"; the new copy held the changed line |
| Remove | `claude plugin uninstall`, then `claude plugin marketplace remove` | Gone from `claude plugin list`; both versions stayed in the plugin cache, each marked `.orphaned_at` |

**What it shows:**
- **Install, update and remove work**, by command and by version. That is what #12 and #5 asked of the kit's own copy route.
- **Every name changes.** A domain's skill and agents load under the plugin's name ([docs/facts.md](facts.md#claude-code-installed-plugins-and-their-skills)). The cards, the drill's menu and the domains' stubs, which exist to give a skill a short name, all use the short names today.
- **Not removed at once.** An update or an uninstall leaves the old copy, marked, until Claude Code removes it 14 days later (the same section). So an undo does not leave the configuration as it was on the day.

**Open:** whether the other domains follow. That is the maintainer's call. The cost is a change to every name the kit uses for a domain's parts.

## Domains on claude.ai (not run yet)

No domain has been uploaded to claude.ai yet: the zip was built and listed, never uploaded. The trial is ready. `node tools/export/claude-ai-trial.mjs build <folder>` writes two zips and a checklist: `advisor-council-for-big-decisions`, one of the nine domains whose front matter a strict YAML reader refused until that was fixed, and whose skill asks for a panel that claude.ai has no agents for; and `marketing-copy-emails-seo-signups`, which has many skills behind one entry. Each gets one task that needs a skill file inside the domain. After each upload, `node tools/export/claude-ai-trial.mjs record` prints the row that goes in this table.

| Date | Domain | Upload | Skill Claude read | Note |
|---|---|---|---|---|

## Reports from adopters

The runs above are the maintainer's. Reports from other people come through the adoption report form (`CONTRIBUTING.md`), each with the receipt the drill writes at the end of phase 5: [every adoption report](https://github.com/Richicinschi/studio-os/issues?q=label%3Aadoption-report). None has been sent yet.

The studio's own use, counted, with how each count was made: [docs/studio-use.md](studio-use.md). It is not adoption evidence: the studio wrote the kit.

## What this does not prove

- **Agents are not people.** A model answering from a script does not get bored, confused or interrupted. Real adopters will fail in ways no log here shows.
- **One plan, one model.** Every run used the same plan and one Claude model. Another model, or a later version of the same one, may follow the skills differently.
- **Scripted answers made some steps easier than real ones.** The persona always had an answer ready, never asked what a term meant, and deferred every command the drill handed over.
- **Runs 4 to 6 reached only the early phases.** Install and Verify were reached in no re-run of those. Run 7 reached them, for one domain only. The last two fixes of that pass were never re-run at all.
- **Two personas, one operating system for the full trial.** The data persona and the ml persona do not cover the software or general profiles.
- **Judged by an agent.** The judge worked from logs and files, and the pass counts above are its marks.

If you try the kit, you become the first real test. Say where it broke.
