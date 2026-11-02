---
title: Install reference
checked: 2026-11-02
---

# Install reference

The install steps that come after Prepare. You do not run any of them to start: each is a row of your adoption plan, and Claude hands you its lines when the plan reaches that row, on your yes. They are here so you can read them first, or run them by hand. The sources are in [facts.md](facts.md).

In every block, run one line at a time. After an install, its check prints a version. If a check says the command is not found, open a new terminal, so it picks up the new PATH (the list of folders your terminal looks in for commands), and run the check again. On a company laptop the limits in [START-HERE, Prepare](../START-HERE.md#prepare) apply here too: if an install needs admin rights, or a piped script is blocked, ask your IT team rather than work around it.

## Install task 1: the scanner

Row 1 of every adoption plan: SkillSpector, the security scanner every other item is checked with. It needs uv, a Python tool installer, so uv comes first. Sources: [facts.md](facts.md), "Installing SkillSpector".

### Windows

In PowerShell:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
uv --version
uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git
skillspector --version
```

### macOS

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv --version
uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git
skillspector --version
```

### Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv --version
uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git
skillspector --version
```

Expected, on every system: `uv --version` and `skillspector --version` each print a version number. If either says the command is not found, open a new terminal and run it again.

**Who runs the scans.** Claude does, in the install phase, one scan for each item that ships files, each on your yes, with `--no-llm`: the static scan only, with no API key and no cost. If you run one yourself on Windows, turn on Python's UTF-8 mode first, or the report crashes on the console:

- in PowerShell, run `$env:PYTHONUTF8=1`, then the scan on the next line;
- in Git Bash, which Claude Code uses for its shell on Windows when Git for Windows is installed, put it in front of the scan on one line: `PYTHONUTF8=1 skillspector scan <path> --no-llm`.

macOS and Linux terminals need neither.

## Tools some items need

Only if you take an item that needs them; its card says so, and the plan hands you these lines at that row. Node.js 22 runs the [git hook templates](../cards/git-hooks.md); gitleaks adds their secret check, which is skipped without it. Sources: [facts.md](facts.md), "Installing the tools on Windows, macOS and Linux".

### Windows

```powershell
winget install --id OpenJS.NodeJS.22 -e
node --version
winget install --id Gitleaks.Gitleaks -e
gitleaks version
```

Expected: a Node version that starts with `v22`, and a gitleaks version.

### macOS

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 22
node --version
brew install gitleaks
gitleaks version
```

The first line installs nvm, a tool that installs versions of Node.js; the second loads it into the terminal you have open, so the third works without a new terminal. `brew` is Homebrew, a package manager for macOS. If `brew` is not found, install Homebrew first with the command on its site, brew.sh; that install is not covered in facts.md. Expected: a Node version that starts with `v22`, and a gitleaks version.

### Linux

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 22
node --version
mkdir -p ~/.local/bin
curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz | tar -xz -C ~/.local/bin gitleaks
gitleaks version
```

The first two lines install nvm and load it into the open terminal, as on macOS. On an ARM machine, use the `linux_arm64` file. Expected: a Node version that starts with `v22`, and a gitleaks version.

## Optional: the upstream superpowers plugin

Superpowers is an outside collection of skills for Claude Code, published as a plugin: a bundle Claude Code installs from a marketplace, a list of plugins. The kit already ships the studio's adapted copies of the superpowers skills it uses, so you do not need the plugin. This section is for one case: you prefer the original (upstream) plugin to the kit's copies. Then take the version the studio triaged, 7.0.1, and scan it first. Never install it beside the kit's adapted copies: both would load, and the plugin alone adds about 1,465 tokens to every session (an estimate). Its [card](../cards/superpowers.md) has the details; the facts are in [facts.md](facts.md), "Installing superpowers".

1. **Scan it before you install it.** It needs Git and the scanner above; on Windows, turn on UTF-8 mode first, as above.

   ```bash
   git clone --depth 1 --branch v7.0.1 https://github.com/obra/superpowers.git superpowers-7.0.1
   skillspector scan superpowers-7.0.1 --no-llm
   ```

   Expected: a red verdict. On 2026-11-02, the SkillSpector build that reports version 2.2.3 rated 7.0.1 `DO_NOT_INSTALL` at 100/100 ([facts.md](facts.md), "Installing superpowers"). A fresh install takes a newer version, whose score and finding counts may differ ([facts.md](facts.md), "Installing SkillSpector"). The verdict does not settle it. Most findings come from the repository's plans, release notes and tests, which never load into a session. 52 are in `skills/` and `hooks/`, which do load, and the studio's triage found 47 of those 52 false positives. The scan also misses the one call that leaves your machine: the brainstorming skill's optional browser companion loads a logo from the vendor's website, on by default, which sends your IP address and the plugin's version. Read the loaded findings with your Claude ("Vet superpowers 7.0.1") before you go on; the decision is yours.
2. **Switch the logo request off** before you use the plugin: set `SUPERPOWERS_DISABLE_TELEMETRY=1` in the environment Claude Code starts in, or under the `env` key of a `settings.json`, for example `~/.claude/settings.json` for every project ([facts.md](facts.md), "Installing superpowers" and "Claude Code: measuring context and asking multiple choice"):

   ```json
   { "env": { "SUPERPOWERS_DISABLE_TELEMETRY": "1" } }
   ```

   Merge that key into the file if it already exists; do not replace the file.
3. **Install it,** inside Claude Code; the commands are the same on every system:

   ```text
   /plugin marketplace add obra/superpowers#v7.0.1
   /plugin install superpowers@superpowers-dev
   ```

4. **Confirm it** in a terminal with `claude plugin list`. Expected: `superpowers@superpowers-dev` at `Version: 7.0.1`.
