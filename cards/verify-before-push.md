---
id: verify-before-push
module: 03-planning
checked: 2026-11-02
tokens:
  light: 0
  standard: 32
  full: 32
---

# One local check before every push

## Why

- **The problem:** a green signal is taken as proof, or no signal comes at all. A push that breaks the build or the tests is found by whoever pulls next, and when no hosted CI (a service that runs the tests on every push) is running, by nobody until much later.
- **The reason:** one script in the repository runs every test and every lint the project has, in order, and stops at the first failure. Run before each push, by you or by Claude, it finds the break on your machine, and its last line is evidence a report can quote instead of "tests pass".
- **The cost of skipping it:** where no hosted CI runs, nothing between your machine and the shared branch runs the tests. The studio's lesson about checks is in module 03: a run passed every check and was still wrong, so a new check is shown to fail before anyone trusts it ([module 03, Evidence](../modules/03-planning/README.md#evidence)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). "Ready to push" becomes the script's last line, quoted, from a script that has been seen to fail once.

## Detect

Read-only, for each repository in `adoption/inventory.md`. Manifests and CI workflow files may be read; nothing else is opened, and no test is run.

- A verify script already: `ls <repo>/verify.sh <repo>/tools/verify.sh <repo>/scripts/verify.sh 2>/dev/null`.
- The test and lint commands the repository already names, names only:
  - `package.json` scripts: `node -e 'console.log(Object.keys(require(process.argv[1]).scripts || {}).join(" "))' "<repo>/package.json"`;
  - `pyproject.toml` tool sections: `grep -oE '^\[tool\.[A-Za-z0-9_-]+' <repo>/pyproject.toml`;
  - Makefile targets: `grep -oE '^[A-Za-z0-9_-]+:' <repo>/Makefile`.
- Hosted CI: workflow files counted, `ls <repo>/.github/workflows/*.y*ml 2>/dev/null | wc -l`, and the ones that run on a push, `grep -lE '^on:.*push|^ +push:' <repo>/.github/workflows/*.y*ml 2>/dev/null`. Claude reads their steps: a step that no local command runs is a gap.
- Whether the front door tells Claude to run it: `grep -ci 'verify' AGENTS.md CLAUDE.md 2>/dev/null`.
- The shell the script needs: `bash --version | head -1` (on Windows it comes with Git for Windows).

The menu marks the item **have** when a script, or an entry in the repository's task runner, runs every test and lint the repository has, and, where Claude pushes for you, the front door says to run it first; **partly** when tests exist but run only in hosted CI or one at a time, or the script misses a step the workflow files run; and **not yet** otherwise.

## Ask

1. **"Size?"**
   - Light: one script that runs the tests and lint you already have, stopping at the first failure; you run it before you push. Nothing loads every session. Recommended for a first adoption when you push yourself.
   - Standard: light, plus one line in your front door so Claude runs it before every push it makes and quotes its last line. About 32 tokens every session (estimate). Recommended for the `software`, `ml` and `data` profiles when Claude pushes for you.
   - Full: standard, plus everything a hosted CI runs or would run: the build steps, slow tests behind a `--fast` switch, a check that each expected output exists and is not empty, and for `data` and `ml` work a known-answer check, such as a row count or a total that must match its source. About 32 tokens every session (estimate). Recommended when hosted CI is off, or Detect found workflow steps that no local command runs.
   - Not sure: the size recommended above for what Detect found: full when hosted CI is off or Detect found workflow steps that no local command runs; otherwise standard when Claude pushes for you, light when you push yourself.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing. For the `general` profile the item is optional, and skipping it is a sound answer.
2. **"Which repositories?"**
   - The one you push to most, first. Recommended.
   - Every repository in your inventory that has tests or lint.
   - Not sure: the one you push to most, the option recommended above.
   - Default when skipped: the one you push to most.

## Needs

- Git and bash. macOS and Linux have bash. On Windows it comes with Git for Windows, which Claude Code also uses for its shell tool when it is installed ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux"): `! winget install --id Git.Git -e --source winget`, then `! git --version`.
- The tools your tests and lint already need, as they run today. The kit adds none.

## Steps

Light takes steps 1 to 4 and 6; standard takes all six; full takes all six, with full's additions in step 3.

1. **Claude:** runs `vet-and-adopt` for this item. This card is the whole item, so there is no file to scan; Claude compares the card with what Detect found and recommends a size.
2. **Claude:** lists what the script will run in that repository, from Detect: each test and lint command it found, and for full each step of the workflow files and each output the build is meant to produce. It asks you to confirm the list. A step it cannot find in your files is a question to you, never a guess.
3. **Claude:** writes `verify.sh` at the repository root and shows it before saving:
   - `set -euo pipefail` at the top, which makes bash stop at the first command that fails;
   - a change into the script's own folder, so it runs the same from anywhere;
   - one header line per step, then the step: your commands, the fastest first;
   - a last line that says every step passed;
   - for full: a `--fast` switch that skips the slow tests while you work, the build steps, an output check that fails when an expected file is missing or empty, and, for data and ml work, the known-answer check.
   When the repository already has a task runner with test and lint entries, Claude can add a `verify` entry there instead, calling the same commands; it asks you first.
4. **Claude:** shows it can fail (step 2 of the Check), before anything relies on it.
5. **Claude:** for standard and full, adds one line to your front door and shows the change first:

   ```markdown
   - Before any push, run `bash verify.sh` and quote its last line. Never push while it fails; if you could not run it, say so.
   ```

   It is 125 bytes, about 32 tokens every session (estimate).
6. **Claude:** records the decision, the size, the repositories, the steps the script runs and the undo in `adoption/decisions.md`.

## Check

1. **you:** `! bash "<repo>/verify.sh"; echo "exit $?"`. Expected: a header for each step, then the script's last line saying every step passed, then `exit 0`.
2. **Claude:** on your yes, makes one step fail on purpose, for example with a temporary test that expects 1 to equal 2. It runs the script and shows a non-zero exit, with that step's header the last one printed. Then it removes the temporary test, runs the script again, shows `exit 0`, and shows that `git -C <repo> status --short` lists nothing left over from the test.
3. **you:** for standard and full, start a new session and ask, as the first message, "What do you run before a push?" Expected: Claude names the script and says it quotes the last line, from the front door, without opening a file.

If step 1 does not end in `exit 0`, the failing step's header is the next thing to look at. If step 2 never goes red, the script cannot fail and proves nothing. Either way the item is not done, and the plan row stays unticked.

## Undo

- **Claude:** removes the front-door line, with the diff shown.
- **Claude:** deletes `verify.sh`, or the task-runner entry, on your yes. If the script was committed, its removal is a new commit, shown to you first.
- **Claude:** marks the row in `adoption/decisions.md` as undone.

## Watch out

- **Without hosted CI, it is the gate.** Run it before every merge. Where hosted CI exists but is switched off or out of budget, a red mark on a pull request may say nothing about the code; read its message before you look for a bug.
- **Nothing runs it for you.** You or Claude run it. A git hook that runs it before every push is not documented in docs/facts.md as of 2026-11-02, and the kit does not ship one; the kit's [git hook templates](git-hooks.md) run at each commit, not at a push.
- **A check that cannot fail is decoration.** Ask what would have to break for it to go red; step 2 of the Check shows it once ([module 03, The mechanism](../modules/03-planning/README.md#the-mechanism)).
- **Keep it in step with the build.** When a change removes an output or renames a step the script checks, the script fails for a reason that is not a bug, and a script that is always red gets ignored. Change the script in the same commit as the build.
- **Slow tests.** With full, `--fast` is for while you work; a push gets the full run.
- **Output costs tokens.** When Claude runs the script, everything it prints enters the conversation. A test run that prints thousands of lines fills the context; keep the output to a header per step, plus the failures.
- **Windows:** the script runs in Git Bash, and the tools each step calls must be on that shell's PATH. Without Git for Windows, Claude Code's shell tool is PowerShell, and `bash` may not be there at all.
- **Company repositories.** A committed script is a file the whole team sees; ask before you add it, or keep it in your setup and point it at the repository.
- **Token cost.** Light loads nothing. Standard and full load one line, 125 bytes, about 32 tokens every session (estimate, bytes divided by 4). The script itself runs outside Claude's context.
