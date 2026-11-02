---
id: superpowers
module: 03-planning
checked: 2026-11-02
---

# superpowers, the upstream plugin

## Why

- **The problem:** two failures bracket most work that goes wrong. Building starts before anyone has written down what "done" means, and at the end a green check is taken as proof.
- **The reason:** superpowers is the skill library behind module 03's chain: brainstorm a design, write a plan, carry it out, verify before saying done. Installed as a plugin, it brings its 15 skills at once, and a start-up hook tells Claude to look for a matching skill before it acts. The kit ships the studio's adapted copies of the skills it uses, one card each; this card is the optional alternative, the plugin itself, pinned to the version the studio checked, 7.0.1.
- **The cost of skipping it:** little, if you take the kit's copies. They cover ten of the fifteen skills at the same version: three kept as they ship, and seven with the studio's changes, each listed in the folder's `VENDORED.md` (the logo request removed from brainstorming is one of them). Four more were folded into other kit skills and one was skipped, and the studio itself uninstalled the plugin for its copies ([the superpowers scan](../examples/superpowers-scan.md); [docs/facts.md](../docs/facts.md), "Installing superpowers"). Skipping both leaves module 03's steps to habit, and the end-of-work failure looks like [the green run](../examples/green-run-that-would-have-deleted.md).
- **The principle:** [scan before anything runs in a session](../PRINCIPLES.md#scan-before-anything-runs-in-a-session). A plugin runs inside every session, so it is scanned and its code read before it is installed; reading found the one call the scanner did not flag.

## Detect

Read-only: versions, settings as set or not set, and counts. Nothing uses the network.

- Claude Code: `claude --version`.
- The plugin: `claude plugin list`, reading only a `superpowers@...` entry: its marketplace (`superpowers-dev` is the pinned route; `claude-plugins-official` and `superpowers-marketplace` install the newest release), its `Version`, `Scope` and `Status`.
- The logo switch, as Claude's own shell sees it, which is what the companion it starts inherits: `printenv SUPERPOWERS_DISABLE_TELEMETRY >/dev/null && echo set || echo "not set"`, and the same for `DISABLE_TELEMETRY` and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`.
- The kit's adapted copies, at project and user level, counted: how many of these ten folders exist in `.claude/skills/` and `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/"`: `brainstorming`, `writing-plans`, `executing-plans`, `verification-before-completion`, `dispatching-parallel-agents`, `subagent-driven-development`, `using-git-worktrees`, `finishing-a-development-branch`, `requesting-code-review`, `receiving-code-review`. The plugin and any of these together is a double load.
- The scanner, for step 1: `skillspector --version`.

The menu marks the item **have** when the plugin is installed at 7.0.1, one of the three switches is set, and none of the kit's copies sits beside it; **partly** when it is installed at another version, without a switch, or beside the kit's copies; and **not yet** when it is not installed, which is the expected state when you take the kit's copies.

## Ask

1. **"The plugin, or the kit's adapted copies?"**
   - The kit's copies, one card each. Recommended when Detect says **not yet**, or finds the copies already installed.
   - The plugin, pinned to 7.0.1, scanned first, with the logo switch set. Recommended when you want all 15 skills from one source, including those the kit has no copy of.
   - Keep what you have. Recommended when Detect says **have**.
   - Neither.
   - Not sure: the option recommended above for what Detect found: keep what you have when Detect says **have**, otherwise the kit's copies.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing changes.
2. **"Both are installed: which goes?"** (only when Detect finds the plugin and any of the kit's copies)
   - Remove the plugin, keep the copies. Recommended when no logo switch is set.
   - Remove the copies, keep the plugin. Recommended when you rely on plugin skills the kit has no copy of.
   - Keep both, and load both sets of descriptions in every session.
   - Not sure: remove the plugin and keep the copies, the first option, unless you rely on plugin skills the kit has no copy of; it is also the route the studio took.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: both stay.

## Needs

- Claude Code, in which the plugin commands are typed.
- git, for the copy you scan, and network access to GitHub for it and for the marketplace.
- SkillSpector, for the scan: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`, the same on every system once uv is installed ([SkillSpector](skillspector.md)). uv itself: Windows `! powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`; macOS and Linux `! curl -LsSf https://astral.sh/uv/install.sh | sh`.
- bash, for the plugin's start-up hook and the brainstorming companion. Windows: Git for Windows, `! winget install --id Git.Git -e --source winget`; macOS and Linux: check with `bash --version`. The companion also needs Node.js ([brainstorming](brainstorming.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on exactly the version you would install. In a temporary folder it clones the tag and scans it (in Windows PowerShell, run `$env:PYTHONUTF8=1` first; in Git Bash, put `PYTHONUTF8=1` in front of the scan):
   ```bash
   git clone --depth 1 --branch v7.0.1 https://github.com/obra/superpowers.git superpowers-7.0.1
   skillspector scan superpowers-7.0.1 --no-llm
   ```
   Expect the scan to say no. On 2026-11-02, the build of SkillSpector that reports 2.2.3 rated 7.0.1 at 100/100, CRITICAL, `DO_NOT_INSTALL`, from 195 findings: 143 in material Claude Code never loads (the repository's plans, tests, release notes, GitHub templates and other tools' folders), and 52 in what loads, 50 in `skills/` and 2 in `hooks/`. The studio's triage found 47 of those 52 to be false positives. A fresh install of SkillSpector is a newer version, so its counts may differ ([docs/facts.md](../docs/facts.md), "Installing SkillSpector"). Claude reads the 52 with you, then reads two things the scan does not weigh: the companion's `skills/brainstorming/scripts/server.cjs`, for the logo request, and `skills/diagnosing-superpowers/`. It recommends against what Detect found, then deletes the temporary folder.
2. **you:** set the logo switch in the environment Claude Code starts in, before you install:
   - macOS: `! echo 'export SUPERPOWERS_DISABLE_TELEMETRY=1' >> ~/.zshrc`;
   - Linux: `! echo 'export SUPERPOWERS_DISABLE_TELEMETRY=1' >> ~/.bashrc`;
   - Windows PowerShell: `$env:SUPERPOWERS_DISABLE_TELEMETRY=1` in the terminal you start `claude` from. That lasts for that terminal only. To make it last on any system, put it under the `env` key of `~/.claude/settings.json` (`"SUPERPOWERS_DISABLE_TELEMETRY": "1"`), which Claude Code applies to every session however it was started ([docs/facts.md](../docs/facts.md), "Claude Code: measuring context and asking multiple choice").

   Then quit Claude Code and start it again from a new terminal.
3. **you:** install it, typed inside Claude Code:
   ```text
   /plugin marketplace add obra/superpowers#v7.0.1
   /plugin install superpowers@superpowers-dev
   ```
   or from a terminal: `! claude plugin marketplace add obra/superpowers#v7.0.1`, then `! claude plugin install superpowers@superpowers-dev`. The `#v7.0.1` pins the marketplace to that tag, and with it the plugin.
4. **Claude:** when question 2 chose to remove the kit's copies, shows the list of folders and deletes them on your yes. (Removing the plugin instead is in Undo.)
5. **Claude:** on your yes, adds one line to your `CLAUDE.md`: "Ask me before using diagnosing-superpowers." It is a prose rule, not a check, so it can be missed; Claude shows the line first.
6. **Claude:** records the decision, the version, the scope from `claude plugin list`, the switch, the scan result and the undo in `adoption/decisions.md`.

## Check

1. `claude plugin list` lists `superpowers@superpowers-dev` at `Version: 7.0.1`.
2. In a new session, Claude runs `printenv SUPERPOWERS_DISABLE_TELEMETRY` in its shell (in PowerShell, `$env:SUPERPOWERS_DISABLE_TELEMETRY`), and it prints `1`.

If the entry is missing, the version differs, or the switch prints nothing, the item is not done: the plan row stays unticked.

## Undo

- **you:** remove the plugin with Claude Code's `/plugin` commands. The uninstall and marketplace-removal commands are not documented in docs/facts.md as of 2026-11-02; afterwards `claude plugin list` no longer lists `superpowers@superpowers-dev`.
- **you:** remove the `SUPERPOWERS_DISABLE_TELEMETRY` line from `~/.zshrc` or `~/.bashrc` if you want; it is harmless to keep.
- **Claude:** removes the `diagnosing-superpowers` line from your `CLAUDE.md`, if step 5 added it.
- **Claude:** on your yes, deletes the `.superpowers/` folders the plugin's skills left in your repositories: brainstorming mockups and plan workspaces.
- **Claude:** adds a row to `adoption/decisions.md` saying the item was removed.

## Watch out

- **The logo request, on by default.** The brainstorming skill's optional browser companion loads the vendor's logo from the vendor's website, which sends your IP address and the superpowers version. The scan does not flag it; the studio's triage of 6.0.3 and 7.0.1 found it by reading the code. `SUPERPOWERS_DISABLE_TELEMETRY=1` in the environment Claude Code starts in switches it off, and so do Claude Code's own `DISABLE_TELEMETRY` and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, which have wider effects inside Claude Code. The kit's adapted brainstorming has the request removed.
- **diagnosing-superpowers, new in 7.0.1,** reads your session transcripts and can search the vendor's GitHub issues with your symptom terms without asking first (docs/facts.md). Its own text says it files an issue only after you approve the exact text. The studio skipped it: it reads whole transcripts and sends search terms out, and a copy kept by the studio is no longer the vendor's to debug ([the superpowers scan](../examples/superpowers-scan.md)). If your transcripts hold anything that must not leave your machine, step 5 is for you.
- **Heavy at start-up:** about 1,465 tokens in every session on 7.0.1, an estimate (bytes divided by 4): the start-up text its hook injects, about 800, plus 15 skill descriptions, about 667.
- **The double load.** With the kit's copies installed too, both load their descriptions in every session, so you pay twice and Claude sees two skills for each job; the studio had this for a while itself ([the superpowers scan](../examples/superpowers-scan.md)).
- **Pin the version.** The README's own install routes take the newest release; this card pins 7.0.1, the version the studio scanned. Plugins from third-party marketplaces do not update themselves by default, and a version argument on `claude plugin install` is not documented. Scan any newer version before you move to it.
- **Windows needs Git Bash for the hook.** The start-up hook looks for Git Bash and skips the WSL launchers; with no bash found it exits without a word, so the start-up text never loads (the plugin's `hooks/run-hook.cmd` at v7.0.1; read it in the clone from step 1).
- **The companion's local server** runs detached from the session, on loopback (an address only your machine can reach) behind a key for each session. On macOS and Linux it stops within 60 seconds of the process that started it ending, or after four hours idle; on Windows that first check is off, so only the four-hour idle stop applies ([brainstorming](brainstorming.md)). Its `--host` option, for remote and container setups, can expose it to your network.
- **A company machine:** a plugin from a third-party marketplace may need your company's approval. Ask before you install it there.
