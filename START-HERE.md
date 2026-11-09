---
title: Start here
checked: 2026-11-02
sources:
  - .claude/skills/drill-to-plan/SKILL.md
  - .claude/skills/vet-external-skill/SKILL.md
---

# Start here

This kit is the way one solo studio works with Claude, written down for others to adopt. Four habits carry it: work survives the night, plans come before code, a skill (a set of instructions Claude loads when a task matches it) is trusted only after a security scan, and agents (separate Claude workers, each given one task) check each other's work. Why each one matters, and what it cost when the studio ignored it, is in [PRINCIPLES.md](PRINCIPLES.md). A word you do not know is probably in [Words used in this kit](#words-used-in-this-kit), at the end of this page.

It is not an installer. Nothing here changes your setup on its own: you adopt it piece by piece, your own Claude walks you through each piece, and you decide every one, "no" included. Your setup is the folder that holds your Claude files; you choose where it lives in [Your first session](#your-first-session).

**How long it takes (estimates).** Reading this page: about 10 minutes. The adoption has two parts. Deciding takes about an hour: Claude looks at your setup, asks you questions one at a time, and writes a spec and a plan. Installing the plan's first wave, at most about 8 items, and seeing it work comes after, and takes longer when steps wait on you. The drill does both in one sitting when you have the time; if you stop after the plan, a second sitting installs the first wave.

**What you leave with.** At the end of the first wave: those items installed and checked, and a new session in your setup answering "where did we stop?" from your own files, not from the chat. If you stop after the plan: three files in your setup's `adoption/` folder (what your setup holds today, what you chose, and the plan), with nothing installed yet.

## What it fixes

- **Every new day, or every new chat, starts from zero.** → [Module 01](modules/01-continuity/README.md)
- **Long chats get slow, forgetful or costly, and the choice of model is a guess.** → [Module 02](modules/02-context-and-models/README.md)
- **Work starts before anyone has said what "done" means.** → [Module 03](modules/03-planning/README.md)
- **Claude does everything in one long thread.** → [Module 04](modules/04-delegation/README.md)
- **A skill from the internet might not be safe.** → [Module 05](modules/05-skills/README.md)
- **Claude runs commands and git with nothing to stop a mistake.** → [Module 06](modules/06-git-and-guardrails/README.md)
- **Claude doesn't know who you are or what needs your OK.** → [Module 07](modules/07-identity-and-contract/README.md)
- **Big decisions get one opinion.** → [Module 08](modules/08-agents-and-council/README.md)
- **Data work: numbers nobody can trace, agents that call tools, dashboards.** → [Module 09](modules/09-data-work/README.md)
- **Connecting Claude to your tools and databases safely.** → [Module 10](modules/10-tools-and-mcp/README.md)
- **Your folders are scattered, or you are starting from nothing.** → [Module 11](modules/11-workspace-layout/README.md)
- **Your experiments look better than they are.** → [Module 12](modules/12-experiments-and-evaluation/README.md)

Every item you can take, with how important it is and what it costs in context (the room it takes up in every session), is on [the feature menu](catalog/FEATURES.md).

## How adoption works

The adoption is run by the kit's own skill `drill-to-adopt`, called "the drill" on these pages. It has five phases, in this order. Prepare comes before them, and update runs come later, once per kit version ([the diagram](docs/adoption-sequence.svg); its editable source is `docs/adoption-sequence.drawio`). Each phase writes its result into an `adoption/` folder in your setup, so you can stop after any phase and pick up there next time ([Stopping and picking up](#stopping-and-picking-up)).

**Before: Prepare** (you, about 10 minutes on your own computer, an estimate; longer if your IT team installs the tools): install Claude Code and Git, get the kit, and say "Start the adoption". Nothing in your setup is read or touched yet.

1. **Audit** (Claude, read-only, only on your yes): it looks at what your setup already has, estimates what loads into every session today, and lists what the kit covers, partly covers or misses. It never opens secrets or data files; step 5 of [Your first session](#your-first-session) says what counts as one. Writes `adoption/inventory.md`.
2. **Decide** (you answer, one question at a time): your work and your company's data rules first; then what you already have and how it relates to the kit; then the feature menu, where you tick whole modules or single items, each flagged with its importance for your kind of work and its context cost; then a few questions about the items you ticked, including how big each should be. Each question has a recommended option. "Not sure" always takes it, except where you are asked to approve a change to your files: there "Not sure" is not a yes, and nothing changes. "Skip for now" appears only where it means something different: the question stays open for a later wave or run. Writes `adoption/features.md`.
3. **Spec and plan** (Claude writes, you approve): what you chose and how it fits your work, then one plan row per item, in waves. The first wave holds at most about 8 items; the rest wait for a later wave, and nothing you chose is dropped. Writes `adoption/spec.md` and `adoption/plan.md`.
4. **Install** (the first wave, row by row, each on your yes): row 1 is always the scanner, SkillSpector, so it arrives right before the first thing it checks. If your setup folder is empty or new, row 2 builds it from the kit's templates (`setup-workspace`). If you already have skills or plugins that were never scanned, a row scans them, read-only. Then `handoff`, so your next session starts where this one stopped. Then each item is scanned, you decide, and it goes into your setup, written in your words for your tools. Once the basics are in, Claude asks you to open a second terminal, start Claude Code in your setup, and ask the question you came with, so you see it work. Writes `adoption/decisions.md`.
5. **Verify** (at the end of the first wave, in the same sitting, and again after each later wave): every item is shown working; a fresh session, started in your setup folder, is asked "where did we stop?" and must answer from your files; and what loads into every session is estimated again. Writes `adoption/handover.md`: what you have now, what still waits on you, and how to resume tomorrow.

At each change of phase, Claude says where you are, for example "Phase 2 of 5, Decide", with the time left in the sitting (an estimate).

**Later: update runs** (once per kit version): Claude reads the kit's changelog and your `adoption/decisions.md`, and asks only about new or changed items. Nothing you decided is asked again.

**Steps that are yours.** Claude hands some steps to you as a command with `!` in front. Typed in Claude Code, a `!` command runs as a shell command, and its output goes into the conversation, so Claude sees the result ([docs/facts.md](docs/facts.md), "Claude Code: the ! prefix, /init and local files"). Which folder it runs in is not documented, so a command that depends on its folder names the folder in full. Whether a `!` command can take typed input is not documented either, so a step that asks for a password, opens a browser to sign in, or goes through your company's single sign-on is not a `!` command: you do it in a separate terminal, tell Claude when it is done, and run its check line with `!` so Claude sees the result.

## Prepare

You need two things before your first session:

- **A plan that includes Claude Code.** Claude Code runs on the Pro, Max, Ultra, Team and Enterprise plans and on the API; the free claude.ai plan does not include it ([docs/facts.md](docs/facts.md), "Models: which for what", "Installing the tools on Windows, macOS and Linux" and "Claude Code: plans, account, attribution and where session content goes"). Pro is a plan for individuals; for company work, ask your admin which plan you are on and whether Claude Code is turned on for you.
- **Claude Code and Git on your computer:** the block for your operating system below.

Run the block one line at a time, in a terminal (PowerShell on Windows). After each install, its check prints a version. If a check says the command is not found, open a new terminal and run the check again. Sources and alternatives are in `docs/facts.md`, under "Installing the tools on Windows, macOS and Linux".

**On a company laptop**, an install may need admin rights, `winget` may be missing, or scripts piped from the internet (the `irm ... | iex` and `curl ... | bash` lines) may be blocked. Do not work around a block: ask your IT team to install Claude Code and Git for you, or for the company's approved way. The other installers the vendors document (a winget package on Windows, Homebrew on macOS) are in the same section of `docs/facts.md`.

### Windows

In PowerShell:

```powershell
winget install --id Git.Git -e --source winget
git --version
irm https://claude.ai/install.ps1 | iex
claude --version
```

### macOS

```bash
xcode-select --install
git --version
curl -fsSL https://claude.ai/install.sh | bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
claude --version
```

### Linux

```bash
sudo apt update && sudo apt install git curl
git --version
curl -fsSL https://claude.ai/install.sh | bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
claude --version
```

On Fedora, the first line is `sudo dnf install git curl`. The later lines need `curl`, which a minimal system may not have, so the first line installs it with Git.

Then get the kit and start, as "Your first session" describes. The scanner and the tools some items need come later, at their rows of your plan ([Install steps that come later](#install-steps-that-come-later)).

## Your first session

Plan about an hour for deciding, and more time for installing the first wave (estimates); you can stop after the plan and install in a second sitting. **Expect permission questions:** Claude Code may stop and ask whether it may run a command or change a file. Read what it names. Say yes when it is the step you agreed to a moment ago in the chat; say no to anything else, and ask Claude why it wanted it.

1. **Get the kit.** In a terminal, go to the folder where you want the kit, for example your home folder, and clone it:

   ```bash
   cd "$HOME"
   git clone https://github.com/Richicinschi/studio-os.git
   ```

   Expected: a new folder, `studio-os`, inside the folder you were in. The kit is public, so you need no GitHub account for this.
2. **Choose where your setup lives.** Your setup holds your Claude files: the front door (the one instruction file every session reads first), memory, handoff notes and your `adoption/` record. Where it lives decides where you start Claude Code for daily work:
   - **in your work repository:** you start Claude Code in that repository, and it reads your setup there. Your company may not allow these files in a shared repository; [module 11](modules/11-workspace-layout/README.md) has a way to keep them local.
   - **in a folder of its own,** such as `~/claude-setup` (`~` is your home folder): nothing goes into your work repository. For daily work you start Claude Code in this folder and add the folder you work in with `--add-dir`. That order matters: Claude Code reads instruction files from the folder it starts in and the folders above it, and from a folder added with `--add-dir` only when a setting is on ([docs/facts.md](docs/facts.md), "Claude Code: where skills, agents and instruction files load from" and "Claude Code: context commands, subagents, extra folders").

   If you are not sure what your company allows, say so; the drill asks about your data rules before anything is stored.
3. **Open Claude Code in the kit, with your setup beside it.** During the adoption, Claude Code starts in the kit folder, so the kit's own skills load, and your setup is added with `--add-dir`. Create the setup folder if it is new, then start Claude Code. These lines run in PowerShell, bash and zsh alike, because they use `$HOME`, your home folder; use your own folders if they differ:

   ```bash
   mkdir "$HOME/claude-setup"
   cd "$HOME/studio-os"
   claude --add-dir "$HOME/claude-setup"
   ```

   **The first start.** Claude Code may ask you to sign in, and whether you trust the files in this folder. Sign in with the account your plan is on; on a company plan, the one your admin set up. The kit folder holds text files and the kit's three skills, and trusting it is what lets the adoption run. Then Claude Code waits for your first message. These first screens are not described in `docs/facts.md`; if you see something else, read it before you answer.
4. **Say "Start the adoption."** Expected: Claude loads `drill-to-adopt`, and its first reply is one question: may it look around your setup folder, read-only, with the choices yes, no, or only one subfolder you name. That question tells you the drill is running. If Claude replies with anything else, say "Use the drill-to-adopt skill."
5. **Before you answer the audit question.** The drill reads only manifests (files such as `package.json`, `pyproject.toml` or `requirements.txt` that list what a project uses), your existing Claude files and hooks, and git's state. It never opens secrets (`.env` files, keys, anything named credential or secret) or data files (`.csv`, `.parquet`, `.xlsx`, `.db`, `.sqlite`, data folders), and never reads a notebook's contents, because output cells can hold data. Everything else, SQL files and notebooks included, it only counts by type. That is a rule Claude follows, not a lock: Claude Code can read and edit every file in a folder you add ([docs/facts.md](docs/facts.md), "Claude Code: context commands, subagents, extra folders"). If a folder holds anything you must not expose, answer with one subfolder that holds none of it, or answer no; no is fine.
6. **Answer one question at a time.** Besides the choices, you can type `skip` (move on and leave this one open), `why` (Claude explains the question), `coverage` (a checklist of what is covered so far), `draft` (Claude writes the spec now from what you have) or `stop`. The feature menu comes as one question: you pick from lists of choices, or, when Claude Code does not offer its multiple-choice tool, you answer a numbered checklist with the numbers you want ([docs/facts.md](docs/facts.md), "Claude Code: measuring context and asking multiple choice").
7. **Approve the spec, then the plan.** Both land in your setup's `adoption/` folder; nothing is installed before your explicit yes. If you need to stop today, this is the place.
8. **Install the first wave, row by row.** Row 1 is the scanner. If your setup folder is empty or new, row 2 is `setup-workspace`, which builds it from the kit's templates; if you asked for existing work to be reorganized, a later row is `setup-workspace` in its restructure mode. Each item goes through `vet-and-adopt`, the kit's skill that takes one item at a time: scan, decide, apply, check, record.
9. **Verify,** at the end of the first wave. Every item's check runs again, and a fresh session, started in a second terminal in your setup folder, must find where you stopped from your files alone. "Next wave" later takes the next items the same way.
10. **End with a handoff note** ([module 01](modules/01-continuity/README.md)), so the next session starts where this one stopped.

## Stopping and picking up

Say `stop` whenever you like: Claude writes a note in `adoption/` that says where you are. To pick up, open a terminal and run the same lines as in step 3, without `mkdir`:

```bash
cd "$HOME/studio-os"
claude --add-dir "$HOME/claude-setup"
```

Then say the same sentence: "Start the adoption." Claude reads your `adoption/` folder, the newest note first, and says in one line where it picks up. "Update my adoption" is for a new kit version ([When the kit changes](#when-the-kit-changes)), not for picking up.

## Daily work after the adoption

Start Claude Code where your setup is read. If your setup lives in your work repository, start it there. If it is a folder of its own, start it in that folder and add the folder you work in:

```bash
cd "$HOME/claude-setup"
claude --add-dir "<the folder you work in>"
```

The kit folder is only for the adoption, its updates, and taking one more item later: start Claude Code in the kit as in step 3 and say "adopt <item>", which runs `vet-and-adopt`. Your `adoption/handover.md` repeats this for your own folders.

## Install steps that come later

Your plan hands you each of these at its row, on your yes, so you do not need them to start. They are on their own page, [docs/install-reference.md](docs/install-reference.md), so you can read them first or run them by hand: [Install task 1: the scanner](docs/install-reference.md#install-task-1-the-scanner), [Tools some items need](docs/install-reference.md#tools-some-items-need) (Node.js and gitleaks).

## If you only use claude.ai

What carries over: modules 01, 02, 03 and 07 as practices, a Project's instructions from `templates/claude-ai/PROJECT-INSTRUCTIONS.md`, and skills through the upload described in `docs/facts.md` ("claude.ai: custom skills and the built-in document skills").

What does not: the git hooks, subagents (agents Claude Code starts for one task) and the scanner need Claude Code or a terminal on your own computer. So does vetting a skill: a skill you upload on claude.ai has not been scanned unless someone ran the scanner on it first.

To run the drill without Claude Code, you still need the kit's files: clone it as in step 1 on any computer with Git, or download it from its GitHub page. Then make a Project, add `ADOPT.md`, `catalog/FEATURES.md`, `catalog/INDEX.md`, every `modules/*/README.md` page, the cards you are interested in from `cards/`, and the `SKILL.md` files from `.claude/skills/` to its knowledge, and ask Claude to follow `drill-to-adopt`. It writes the spec and the plan as text for you to keep in the Project.

### Domains on claude.ai

A domain is a set of skills for one kind of job, such as audio and video or a panel for big decisions; the [feature menu](catalog/FEATURES.md) lists the ones this kit ships, with what each costs. To use one on claude.ai:

1. Pick the domains that fit your work. `drill-to-adopt` asks which ones fit; "none of these" is a valid answer.
2. In the kit folder, on a computer with Node.js, build each one's zip: `node tools/upload-bundle.mjs <domain-id> --out <a folder of your choice>`. It writes `<domain-id>.zip` with the domain's entry and its skills, and no agents, because agents need Claude Code.
3. Upload each zip as a skill, as in [docs/facts.md](docs/facts.md), "claude.ai: custom skills and the built-in document skills": Customize > Skills > "+" > "+ Create skill" > "Upload a skill". Custom skills need code execution turned on.

A skill that needs a program on your computer (`ffmpeg` for video, for example) says so, and its "Without local tools" section says what it does on claude.ai instead. A zip you built from the kit has not been scanned on your machine: scan it first if you can ([SkillSpector](cards/skillspector.md)).

## When the kit changes

Pull the kit (`git pull` in its folder), read the top of `CHANGELOG.md`, open Claude Code in it as in step 3, and say "Update my adoption." The drill reads your `adoption/` folder and asks only about what is new or changed.

## What is in this repo

| Path | What it is |
|---|---|
| `START-HERE.md` | This page. |
| `PRINCIPLES.md` | How the studio works, and why: each principle with its reasoning, what ignoring it cost, and the items that carry it. |
| `ADOPT.md` | The protocol your Claude follows. You do not need to read it; this page tells you what to expect. |
| `modules/` | The practices, one folder each, with the problem, the mechanism, the evidence, and how to apply it in Claude Code and in claude.ai. |
| `cards/` | One adoption card per menu item: why, how it is detected, what you are asked, what it needs, the steps, the check, the undo, and what to watch out for. |
| `catalog/` | The feature menu (`FEATURES.md`, and `features.json` for Claude), and every skill and agent the studio uses, listed in `INDEX.md`; the ones shipped here carry a `SOURCE.md` with origin, licence and last scan. |
| `.claude/skills/` | The kit's own skills: `drill-to-adopt`, `vet-and-adopt` and `setup-workspace`. They run from this folder during the adoption and are never installed into your setup. |
| `templates/` | Blank files to start from: front door, memory, handoffs, identity, claude.ai, adoption, git hooks, rules audit. |
| `examples/` | Stories from the studio, with the names taken out. |
| `docs/` | `facts.md` (dated facts with their sources), `install-reference.md` (the install steps that come later), the adoption-sequence diagram, the third-party notices. |
| `CHANGELOG.md` | What changed in each version. |
| `LICENSE` | MIT, for the whole kit except the third-party skills in `catalog/skills/`, which keep their own licences ([docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md)). |
| `tools/` | How the kit is built from the studio, and the diagram's generator (maintainers only), plus `upload-bundle.mjs`, which builds a domain's zip for claude.ai. |

## Words used in this kit

- **Claude Code:** Claude in a terminal on your computer; it reads and changes files in the folders you give it. **claude.ai:** Claude in the browser and the apps.
- **session:** one conversation in Claude Code, or one chat in claude.ai. A new session knows only what it reads from files.
- **context, tokens, context cost:** context is everything Claude has in view in a session: your messages, the files it read, and what loaded before your first message; it has a limit. Tokens are the units Claude reads text in, roughly pieces of words; the kit estimates a file's tokens as its size in bytes divided by 4. An item's context cost is the tokens it adds; "every session" means before your first message, each time.
- **cache lifetime, compacting:** Claude Code keeps a conversation's start ready for cheap reuse for a while; after a longer gap it reads the whole conversation again. Compacting summarizes a long conversation to free room ([docs/facts.md](docs/facts.md), "Prompt cache and why a new day starts cold").
- **setup:** the folder that holds your Claude files: the front door, memory, handoff notes, your `adoption/` record and the skills you adopt.
- **front door:** the one instruction file every session reads first: `AGENTS.md`, loaded through a `CLAUDE.md` that holds the line `@AGENTS.md`.
- **memory, index, vault:** one fact per file in `memory/`; the index, `memory/MEMORY.md`, has one line per file; the vault keeps old text word for word when the index grows too long.
- **handoff note:** a short note at the end of a session: what was done, decided and left open, the first step for next time, and a prompt to start the next session with. `handoff` is the skill that writes it.
- **skill:** a folder with a `SKILL.md`: instructions Claude loads when a task matches the skill's description. Only the description loads every session ([docs/facts.md](docs/facts.md), "Claude Code: measuring context and asking multiple choice").
- **agent, subagent:** a second Claude that Claude Code starts for one task, in its own context; only its summary comes back ([docs/facts.md](docs/facts.md), "Claude Code: context commands, subagents, extra folders"). **seat:** one of the kit's reviewer agents, each with one point of view, such as the skeptic or the architect.
- **plugin, marketplace, upstream:** a plugin bundles skills, agents or hooks for Claude Code; a marketplace is a list of plugins to install from; upstream is the original project a copy came from.
- **MCP server:** a program that connects Claude to an outside system, such as a database or a ticket tracker ([module 10](modules/10-tools-and-mcp/README.md)).
- **hook:** a command that runs by itself at a set moment: a git hook before a commit, a Claude Code hook when a session starts or stops, or before a tool runs.
- **scan, SkillSpector, uv:** SkillSpector is a security scanner. A scan reads every file of a skill, plugin, MCP server or hook and gives a score from 0 to 100 with a recommendation, `SAFE` when clean ([docs/facts.md](docs/facts.md), "Installing SkillSpector"). It flags much that is harmless, so its findings are read, not obeyed. uv is the Python tool installer SkillSpector is installed with.
- **module, pack, item, card:** a module is one practice area, with its page in `modules/`; a pack groups modules for one kind of work; an item is one thing you can adopt (a skill, an agent or a practice), one line of [the feature menu](catalog/FEATURES.md); a card, `cards/<item>.md`, is an item's adoption page. **Detect** is the card's read-only check of whether you already have the item.
- **shipped, listed:** a shipped item comes with its files in the kit, under `catalog/skills/<item>/`; a listed one is only named. Link-only points to where it lives; catalog-only has nothing to take.
- **profile, gap:** a profile is the kind of work the audit infers from your files: data, ml, software or general. A gap is a part of your work no item covers.
- **the drill:** `drill-to-adopt`, the kit's skill that runs the adoption, one question at a time.
- **spec, plan, row, wave:** the spec says what you chose and why; the plan has one row per item, ticked when its check has passed; a wave is the rows done together, at most about 8 in the first.
- **SKIP, FOLD, ADAPT, ADOPT:** the four decisions `vet-and-adopt` recommends for an item: leave it out; take its ideas into something you already have; take it rewritten in your words, for your tools; take it as it ships.
- **`!` command:** a command typed after `!` in Claude Code; it runs in the shell, and Claude sees its output. Passwords and sign-ins go into a separate terminal instead.
- **git words:** a **repository** is a folder whose history git keeps; a **commit** is one saved change; a **branch** is a line of work; a **remote** is the shared copy, such as on GitHub; a **PR** (pull request) asks for a branch to be reviewed and merged; a **merge** brings a branch's commits into another; **squash** and **rebase merge** are two other ways to merge, which fold or rewrite the commits; a **force-push** overwrites the shared copy of a branch; a **history rewrite** changes commits already made; a **tag** is a fixed name on one commit, such as a version; a **hook skip** commits with the hooks' checks turned off; a **worktree** is a second checkout of the same repository in its own folder; a **hash** is a commit's ID; a **signature** shows a commit was made with your key.
- **canary, sealed holdout:** a canary is a test that a check really refuses, run in a throwaway place before you rely on it. A sealed holdout is data set aside and left unseen until the final test.
- **grant ledger, RELATIONSHIP.md:** the grant ledger is a file with one row per yes you gave for a risky act. `RELATIONSHIP.md` is your identity file that says what needs your OK ([module 07](modules/07-identity-and-contract/README.md)).
