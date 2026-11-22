---
title: Install reference
checked: 2026-11-02
---

# Install reference

The install steps that come after Prepare. You do not run any of them to start, except Node.js, which the audit needs (below): each is a row of your adoption plan, and Claude hands you its lines when the plan reaches that row, on your yes. They are here so you can read them first, or run them by hand. The sources are in [facts.md](facts.md).

In every block, run one line at a time. After an install, its check prints a version. If a check says the command is not found, open a new terminal, so it picks up the new PATH (the list of folders your terminal looks in for commands), and run the check again. On a company laptop the limits in [START-HERE, Prepare](../START-HERE.md#prepare) apply here too: if an install needs admin rights, or a piped script is blocked, ask your IT team rather than work around it.

## Install task 1: the scanner

Row 1 of every adoption plan: SkillSpector, the security scanner every other item is checked with. It needs uv, a Python tool installer, so uv comes first, through a package manager. The SkillSpector line installs SkillSpector v2.13.6, pinned by its full commit, so every install gets the same code. Sources: [facts.md](facts.md), "Installing SkillSpector".

### Windows

In PowerShell:

```powershell
winget install --id=astral-sh.uv -e
uv --version
uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git@e2674da339b0bddc6e565d059c0577c6d9cd25da
skillspector --version
```

Without winget, put `pipx install uv` in place of the first line if you have pipx; otherwise uv's own piped script, `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`. This runs a script from the network before you have read it.

### macOS

```bash
brew install uv
uv --version
uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git@e2674da339b0bddc6e565d059c0577c6d9cd25da
skillspector --version
```

Without Homebrew (https://brew.sh), put `pipx install uv` in place of the first line if you have pipx; otherwise uv's own piped script, `curl -LsSf https://astral.sh/uv/install.sh | sh`. This runs a script from the network before you have read it.

### Linux

```bash
pipx install uv
uv --version
uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git@e2674da339b0bddc6e565d059c0577c6d9cd25da
skillspector --version
```

Without pipx, put uv's own piped script in place of the first line, `curl -LsSf https://astral.sh/uv/install.sh | sh`. This runs a script from the network before you have read it.

Expected, on every system: `uv --version` prints a version number, and `skillspector --version` prints `SkillSpector v2.13.6`, the version the kit pins. If either says the command is not found, open a new terminal and run it again.

**Who runs the scans.** Claude does, in the install phase, one scan for each item that ships files, each on your yes, with `--no-llm`: the static scan only, with no API key and no cost. If you run one yourself on Windows, turn on Python's UTF-8 mode first, or the report crashes on the console:

- in PowerShell, run `$env:PYTHONUTF8=1`, then the scan on the next line;
- in Git Bash, which Claude Code uses for its shell on Windows when Git for Windows is installed, put it in front of the scan on one line: `PYTHONUTF8=1 skillspector scan <path> --no-llm`.

macOS and Linux terminals need neither.

## Tools some items need

Node.js 22 is recommended before your first session: the adoption's audit (phase 1) runs a kit script with it, and without it the audit lists file and folder names only ([START-HERE, Prepare](../START-HERE.md#prepare)). The rest only if you take an item that needs them; its card says so, and the plan hands you these lines at that row. Node.js 22 also runs the [git hook templates](../cards/git-hooks.md); gitleaks adds their secret check, which is skipped without it. Sources: [facts.md](facts.md), "Installing the tools on Windows, macOS and Linux".

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

