---
id: skillspector
module: 05-skills
checked: 2026-11-09
other_figures:
  - 60
---

# SkillSpector with the scan-first rule

## Why

- **The problem:** a skill, plugin, MCP server or hook from outside runs inside your session, and most are copied without being read. One can carry a prompt injection (text written to steer Claude against you), a script that sends data out, or a licence that never allowed the copy.
- **The reason:** SkillSpector is a static scanner: it reads an item's files before anything runs, with no API key and no cost. One line in your front door makes every later session scan first, for updates, servers and hooks as well, not only during this adoption.
- **The cost of skipping it:** the studio ran a plugin for months without a scan, because its rule named only the skills it took in; when the plugin was finally scanned, its one call home turned up only in a read of the code ([module 10, Evidence](../modules/10-tools-and-mcp/README.md#evidence)). A scan alone is not enough either: an outside framework scored 100/100, critical, on false positives, while its telemetry produced no finding ([module 05, Evidence](../modules/05-skills/README.md#evidence)).
- **The principle:** [scan before anything runs in a session](../PRINCIPLES.md#scan-before-anything-runs-in-a-session). This item is the scanner, and the rule that sends every later item through it.

## Detect

Read-only. Versions, and present or not; no network.

- `skillspector --version`: a version, or "not found".
- `uv --version`: a version, or "not found". uv is the Python tool manager that SkillSpector installs with.
- The scan-first line: Claude searches your front door (the `CLAUDE.md` or `AGENTS.md` your sessions load, in your setup and in each repository in `adoption/inventory.md`; see [the front door](front-door.md)) for the word SkillSpector, and reports found or not found for each file.

The menu marks the item **have** when `skillspector --version` prints a version and your front door carries the scan-first line, **partly** when only one of the two holds, and **not yet** otherwise.

## Ask

1. **"Install SkillSpector now?"**
   - Install it, with uv first if Detect did not find uv. Recommended when Detect says `skillspector` is not found.
   - Keep the one you have. Recommended when `skillspector --version` prints a version.
   - You are not allowed to install tools on this machine: Claude reads every file of each item by hand instead, points out each network call, and writes "read by hand, not scanned" in each decision row. Recommended only when your company's rules forbid the install.
   - Not sure: the option recommended above for what Detect found: install it when `skillspector` is not found, keep the one you have when it prints a version.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave. Until it is settled, no item that ships files can be adopted, because `vet-and-adopt` stops at its scan step; practices with no files can still go ahead.
   - Default when skipped: not installed.
2. **"Where does the scan-first rule go?"**
   - In the front door of your setup, so every session there reads it. Recommended when Detect found that front door. In an empty folder the front door does not exist yet: row 2 (create mode) makes it right after the scanner, and the line goes in once row 2 has made it.
   - Also in the front door of each repository you start Claude Code in. Recommended when you work inside those repositories and your company allows a line about tools in shared files.
   - Not sure: your setup's front door only, the option recommended above; in an empty folder, once row 2 has made it. You can add it elsewhere later.
   - Default when skipped: your setup's front door.

## Needs

- uv ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux"):
  - Windows: `! powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`;
  - macOS and Linux: `! curl -LsSf https://astral.sh/uv/install.sh | sh`.
- Python 3.12 to 3.15 for SkillSpector; the install line asks uv for 3.13 (`--python 3.13`).
- Network access for the two installs. No account and no API key: the `--no-llm` scan is static and free.
- Licence: Apache-2.0.

## Steps

This is row 1 of every adoption plan, so the scanner arrives right before the first item it checks. The commands are the ones in [the install reference](../docs/install-reference.md#install-task-1-the-scanner), from [docs/facts.md](../docs/facts.md), "Installing SkillSpector".

When Detect already found SkillSpector, Claude runs `skillspector --version` and the one check scan itself, because both only print; steps 1 and 2 are skipped, and nothing goes to you. Only an install, or a step that needs a password, goes to you.

1. **you:** install uv, only if Detect did not find it (the `!` line for your system in Needs). **Claude:** then checks it with `uv --version`, which only prints. If it says not found, **you:** quit Claude Code, open a new terminal so it picks up the new PATH, and start Claude Code again in the same folder; **Claude:** runs the check again.
2. **you:** install SkillSpector, only if Detect did not find it, the same line on every system: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. **Claude:** then runs `skillspector --version` itself, and records the version it prints.
3. **Claude:** on Windows, turns on Python's UTF-8 mode for every scan it runs: `PYTHONUTF8=1 skillspector scan ...` in Git Bash, or `$env:PYTHONUTF8=1` first in PowerShell. Without it, the report crashes with a `charmap` encoding error. When you scan by hand in PowerShell, run `$env:PYTHONUTF8=1` first.
4. **Claude:** writes the scan-first rule as one line, in your words, and shows it to you before saving it to the front door you chose. The line says: anything from outside that runs in a session (a skill, a plugin, an MCP server or a hook), new or updated, is scanned with SkillSpector and its code read for calls that leave the machine before it is installed, and a verdict other than SAFE waits for your decision.
5. **Claude:** records the decision in `adoption/decisions.md`: installed for your user through uv, the version that `skillspector --version` printed, the file that holds the rule line, and the undo.

## Check

1. **Claude:** runs `skillspector --version`; it prints a version.
2. **Claude:** from the kit's folder, scans one kit skill, with the Windows prefix from step 3: `skillspector scan catalog/skills/claim-auditor --no-llm`. Expected: a score from 0 to 100 with a recommendation. The kit's own record of its scans (`tools/export/scans.json`, made with the build that reports 2.2.3) has this skill at `SAFE`, 0/100; a newer version may score it differently, and any printed verdict passes this check.
3. The front door you chose contains the scan-first line. In an empty folder this check waits for row 2, which makes the front door.

If no version prints, the scan prints an error instead of a verdict, or the line is missing, the item is not done: the plan row stays unticked, and every later item that ships files waits. A `charmap` error on Windows means the UTF-8 prefix was missing.

## Undo

- **Claude:** deletes the scan-first line from the front door it went into, and marks the row in `adoption/decisions.md` as undone.
- **you:** remove SkillSpector, and uv if nothing else uses it, with uv's own uninstall command; those commands are not documented in docs/facts.md as of 2026-11-02.
- Removing the scanner does not undo anything it checked; those decisions stay in `adoption/decisions.md`.

## Watch out

- **The scan is a gate, not a judge.** Scores are noisy both ways. An outside workflow plugin the studio once ran was rated 100/100, `DO_NOT_INSTALL`; the studio's triage found most findings in the files a session loads to be false positives, and the one call that leaves your machine produced no finding at all ([the plugin scan the studio ran](../examples/outside-plugin-scan.md)). Read the findings in what a session loads, then read the code for outgoing calls.
- **Windows needs UTF-8 mode** for every scan (`PYTHONUTF8=1`); macOS and Linux terminals are UTF-8 already.
- **Versions move.** The install line names no version, so you get what the repository's main branch holds on the day you install. The kit's numbers come from a build of main from before July 2026 that reports itself as 2.2.3, a number no release carries; the newest release on 2026-11-02 was v2.13.3. A fresh install gets a newer version, so your scores and finding counts can differ from the ones the kit quotes ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").
- **Keep `--no-llm`.** The static scan needs no API key and costs nothing; the LLM pass is paid, and Claude leaves it off unless you choose it.
- **Name updates and all four kinds in the line.** The studio's own gap was a rule that covered the skills it took in, not a plugin it already ran.
- **A work machine** may need your IT department's approval for a tool installed from GitHub; ask before step 2. An install that asks for an administrator password goes in a separate terminal, not through `!`: whether a `!` command can take typed input is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: the ! prefix, /init and local files").
- **Token cost:** SkillSpector loads nothing into a session. The rule line costs about 60 tokens every session (estimate, bytes divided by 4).
