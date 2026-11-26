---
id: git-guardrails
module: 06-git-and-guardrails
checked: 2026-11-19
tokens:
  description: 64
  body: 2896
---

# A guard on Claude's git commands

## Why

- **The problem:** an agent that can run git can lose work in one command: a `reset --hard` drops uncommitted changes, a force-push replaces what is on the server, a `branch -D` deletes a branch that was never merged.
- **The reason:** a Claude Code hook (a command Claude Code runs at a set moment, here before each Bash or PowerShell command) reads the command as the shell and git read it, and refuses the destructive git ones with exit code 2 before they run: forced and destructive pushes, history rewrites, discarded work and skipped hooks. Plain `push` stays allowed. Version 2.0.0 is a Node script, so it runs the same on Windows, macOS and Linux, with or without Git Bash.
- **The cost of skipping it:** without it, only a sentence in your instructions stands between Claude and those commands, and prose loses: in the studio, a prose rule was broken twice in one day by the same agent that had written it ([module 06, The problem](../modules/06-git-and-guardrails/README.md#the-problem)).
- **The principle:** [hard stops for the irreversible, judgement for the rest](../PRINCIPLES.md#hard-stops-for-the-irreversible-judgement-for-the-rest). The commands that cannot be undone become hard stops; everything else stays Claude's call.

## Detect

Read-only. Presence, settings, names and versions; no network.

- Versions: `node --version` (22 or later runs the guard) and `claude --version` (v2.1.295 or later for `onFailure`).
- Claude's shell tools in this session: Bash, PowerShell or both; Claude says which it has. On Windows, Claude Code uses Git for Windows' Bash when it is installed, and PowerShell without it ([docs/facts.md](../docs/facts.md)).
- A git guard already: in `.claude/settings.json` and `.claude/settings.local.json` (project) and `~/.claude/settings.json` (user, or under `$CLAUDE_CONFIG_DIR` when that is set), the `hooks.PreToolUse` entries: how many, which tools each one's matcher names, whether its `command` or `args` name `block-dangerous-git` or another git guard, and whether it sets `onFailure`. Only the hooks part is read.
- The scripts, present or not: `block-dangerous-git.mjs`, with `guard.mjs`, `rules.mjs` and `lib/` beside it, in `.claude/hooks/git-guardrails/` or `~/.claude/hooks/git-guardrails/`; and version 1.4.0's bash script, `block-dangerous-git.sh` in `.claude/hooks/` or `~/.claude/hooks/`.
- The skill: a skill named `git-guardrails`, or another doing the same job, at project or user level. Names and descriptions only.
- Whether your instruction files put pushing on your ask-first list (for question 2).
- A skill of the same name from a plugin enabled here: run from the project folder, `claude plugin list --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let l;try{l=JSON.parse(s)}catch{}if(!Array.isArray(l))return console.log("plugin check could not run");for(const p of l){const r=p.readFromFolder||p.installPath,f=r&&require("path").join(r,process.argv[1]);if(p.enabled&&f&&require("fs").existsSync(f))console.log(p.id,f)}})' skills/git-guardrails/SKILL.md` prints the plugin's id and the path of each copy, and nothing else. `claude plugin list` reports which plugins are enabled for the current folder and the folder each one loads from, so a disabled plugin, a plugin installed for another repository and an old version left after an update do not count. When it prints `plugin check could not run` or an error such as `claude: command not found`, Detect says the plugin check could not run, and the item gets no plugin mark ([docs/facts.md](../docs/facts.md), "Claude Code: installed plugins and their skills").

The menu marks the item **have** when a git guard runs for every shell tool Claude has, **partly** when a guard is set but one shell tool is not matched, or its entry names a script that is missing, and **not yet** otherwise. When nothing marks it **have** and that plugin line prints a copy, the menu says **a plugin provides one** instead of **not yet**, or **partly (a plugin provides one)** instead of **partly**, so what is missing stays in view, and it does not offer the kit's copy as a second.

## Ask

1. **"Block destructive git commands before Claude runs them?"**
   - Install the hook only: Claude follows the skill's steps from the kit copy; only the hook's scripts folder and its settings entry land in your setup. Recommended when Detect found no git guard, or version 1.4.0's bash script.
   - Install the skill too, so you can put the guard into other projects later.
   - FOLD: add the refusals your guard lacks to the hook you already have. Recommended when Detect found a guard other than this one.
   - No.
   - Not sure: the option recommended above for what Detect found; the hook only comes with the rules as they are.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing.
2. **"May Claude run a plain `git push`?"**
   - Yes: only forced and destructive pushes and the other destructive commands are refused, as in the kit copy. Recommended when your instruction files do not put pushing on your ask-first list.
   - No: plain `git push` is refused too, through a rule added to `rules.mjs`, and you push yourself. Recommended when Detect found pushing on your ask-first list.
   - Not sure: the option recommended above for your ask-first list.
   - Default when skipped: allowed.
3. **"Where?"**
   - This project only: `.claude/settings.json`, with the scripts in `.claude/hooks/git-guardrails/`. Recommended when Claude runs git in one repository.
   - Every project: `~/.claude/settings.json`, with the scripts in `~/.claude/hooks/git-guardrails/`. Recommended when Claude runs git in several.
   - Not sure: the option recommended above for how many repositories Claude runs git in.
   - Default when skipped: this project only.

## Needs

- Node.js 22 or later on the PATH, which runs the guard: the install lines for Windows (winget) and for macOS and Linux (nvm) are in [Tools some items need](../docs/install-reference.md#tools-some-items-need); then `! node --version`.
- Claude Code v2.1.295 or later, for `"onFailure": "block"` in the settings entry ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"): `claude --version`.
- No bash and no jq: the settings entry starts `node` directly, with no shell.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/skills/git-guardrails/` (version 2.0.0). The kit's recorded scan of 2.0.0 (SkillSpector v2.13.6, 2026-11-26) is DO_NOT_INSTALL, 100/100, from 18 findings, each a false positive or by design: the commands the guard quotes in its text, `cases.json`, check and scripts, and the settings file it writes to. The scanner read the scripts and the table only in part, since they are full of quoted commands; the kit read them in full ([the kit's scan triage](../tools/export/scan-triage.md#git-guardrails-do_not_install-100100-18-findings)). Claude shows each finding with its reading and goes on only after you have read them.
2. **Claude:** copies everything in the skill's `scripts/` folder to the place you chose, `.claude/hooks/git-guardrails/` or `~/.claude/hooks/git-guardrails/`:

   Bash or zsh:

   ```bash
   mkdir -p .claude/hooks/git-guardrails
   cp -R <this-skill>/scripts/. .claude/hooks/git-guardrails/
   ```

   PowerShell:

   ```powershell
   New-Item -ItemType Directory -Force .claude/hooks/git-guardrails | Out-Null
   Copy-Item -Recurse -Force <this-skill>/scripts/* .claude/hooks/git-guardrails/
   ```

   The entry script needs `guard.mjs`, `rules.mjs` and `lib/` beside it; copied alone, it refuses every command that names git. When plain pushes are refused (question 2), Claude adds that rule to `rules.mjs` and shows you the change before saving it. When Detect found version 1.4.0's bash script, Claude removes it and its settings entry in the same change, so one guard runs.
3. **Claude:** merges one entry into `hooks.PreToolUse` of the settings file for that place, keeping every other setting, and shows you the change before saving it. For this project:

   ```json
   { "matcher": "Bash|PowerShell", "hooks": [{ "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/git-guardrails/block-dangerous-git.mjs"], "onFailure": "block" }] }
   ```

   For every project, the same entry with the script's full path in `args`, in forward slashes on Windows too, such as `C:/Users/<you>/.claude/hooks/git-guardrails/block-dangerous-git.mjs`. Exec form (`command` plus `args`) starts `node` with the script path as one argument and no shell to expand `~` or `$HOME`; the hooks reference prefers it for a hook that names a path placeholder. `"onFailure": "block"` refuses the command when the guard cannot start or times out (a mistyped path, `node` missing); without it, such a hook lets the command run. The matcher `Bash|PowerShell` is a list of exact tool names, so it covers both shell tools ([docs/facts.md](../docs/facts.md), "Claude Code: hooks").
4. **Claude:** records the decision, the place, the rules changed and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** sends the guard a test force-push, then `git status`, in its shell. Bash, as `tools/check-setup.mjs` runs it without Claude; by hand, or for a guard your settings name, put the guard's path in place of `"$(installed block-dangerous-git.mjs)"`:

   ```check
   run: echo '{"tool_input":{"command":"git push --force origin main"}}' | node "$(installed block-dangerous-git.mjs)" 2>&1; echo "exit $?"
   expect: exit 2
   run: echo '{"tool_input":{"command":"git status"}}' | node "$(installed block-dangerous-git.mjs)" 2>&1; echo "exit $?"
   expect: exit 0
   ```

   PowerShell: `'{"tool_input":{"command":"git push --force origin main"}}' | node <path to block-dangerous-git.mjs>; "exit $LASTEXITCODE"`, then the same with `git status`.

   Expected for the push: a line that starts `BLOCKED: 'git push --force origin main' hit the rule "force-push".`, then `exit 2`.
2. **you:** in a new session, ask Claude to run `git branch -D no-such-branch` in any repository. That branch does not exist, so nothing is lost either way. Expected: Claude reports the command as blocked. If Claude also has PowerShell, ask for the same through PowerShell.

If step 1 prints `exit 0` for the force-push, the rules differ from the kit copy's; a Node error and `exit 1` mean the path is wrong; `exit 2` for `git status` too, after `BLOCKED: the guard could not read this command (Cannot find module ...)`, means a file is missing beside the script. If step 2 shows git's own error that the branch was not found, the hook did not run for that tool. Either way the item is not done, and the plan row stays unticked.

## Undo

- **Claude:** removes the entry from `hooks.PreToolUse` in the same settings file, leaving the rest, and deletes the `git-guardrails` folder under `hooks/`.
- **Claude:** deletes the skill's folder, if you installed the skill too, and marks the row in `adoption/decisions.md` as undone.
- **you:** Node.js stays installed; removing it is your decision.

## Watch out

- **It stops accidents, not attackers.** It reads the command line, not what git will do, so a command written to get around it passes, as the known gaps below do. Keep the acts it refuses on your ask-first list too.
- **Run Check step 1 again after any change** to the scripts, the rules or your PATH: a guard that stopped refusing looks the same as one that works. The [start-of-session status](session-start-status.md) sends that force-push to every guard your settings name at each session start, and prints a line when one lets it through.
- **Every shell tool needs matching.** A PowerShell command passes a guard whose matcher names only Bash. The kit copy names both; a guard you already have may not.
- **When the guard cannot read a command,** it refuses it if it names git (`BLOCKED: the guard could not read this command (<error>); ask the user.`) and lets the others run. `onFailure` (Steps, step 3) covers a guard that cannot start or times out.
- **What it refuses and lets run:** the table under "What is blocked" and "Still allowed" in [the skill](../catalog/skills/git-guardrails/SKILL.md), and `scripts/cases.json`, the commands it must block and must let run. Add what matters to you in `rules.mjs`, and check the change against `cases.json`.
- **Known gaps.** These pass: config set outside the command line, such as an environment variable, a config file or an `include`, which can move the hooks folder ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees"); aliases; `--pathspec-from-file`; scripts that call git, and `gh` and other tools that change a repository without git; `reset --merge` and `reset --keep`; wildcard pathspecs that still match nearly every path, such as `[a-z]*`; and a backslash as a folder separator on Windows. Each, with examples: [SECURITY.md](../SECURITY.md#the-git-guards-gaps-with-examples) and the skill's "Known gaps".
- **It also refuses some harmless commands, on purpose:** a commit message or search that is exactly a refused flag (`git commit -m --no-verify`), any word naming `GIT_CONFIG_KEY_<n>=core.hooksPath`, even inside `echo`, and `:(top,glob)*`, which still discards every top-level file.
- **Setting the hooks folder is your own command.** Version 2.0.0 refuses `git config core.hooksPath <folder>` as well as removing the setting: the line that points git at your hooks can point it at an empty folder and turn every hook off. Where an item turns hooks on that way, such as [the git hook templates](git-hooks.md), you run the line in a terminal of your own, and Claude reads it back with `git config --get core.hooksPath`, which stays allowed. Whether a `!` command goes through Claude Code's hooks is an open question ([docs/facts.md](../docs/facts.md), "Claude Code: the ! prefix, /init and local files"), so a separate terminal works either way.
- **No way through for one approved act.** When you decide a force-push is right, you run it in your own terminal. Beside a guard of yours that lets an approved act through, this one still refuses it: take one guard or the other for a repository, not both.
- **It also refuses [git-cleanup](git-cleanup.md)'s force deletions** (`git branch -D`).
- **A shared repository:** `.claude/settings.json` and `.claude/hooks/` are usually committed, so the guard reaches your team too. Agree it first, or put the entry in `.claude/settings.local.json`, your own settings for one project (a hand-made one goes in `.gitignore`), with the scripts in your user folder and their full path in `args`.
- **Windows:** exec form needs no Git Bash. A shell-form entry such as `node "$CLAUDE_PROJECT_DIR/…"` breaks where Claude Code runs hooks through PowerShell (Windows without Git Bash), which reads `$CLAUDE_PROJECT_DIR` as an unset variable ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"); with `onFailure` set to `block`, every command is then refused. Check step 2 is the proof on your machine.
- **Token cost:** the hook loads nothing into context. A kept skill loads its description every session, about 64 tokens, and its body, about 2,896 tokens, when it runs (estimates, on the kit's copy of version 2.0.0).
- **Other agent tools may load it.** Cursor, GitHub Copilot and Devin also read the hooks in `.claude/settings.json` ([docs/facts.md](../docs/facts.md), "Other agent tools: instruction files, skills and hooks"), but may not run this entry as Claude Code does (its `args`, `${CLAUDE_PROJECT_DIR}` and `onFailure`): where the hook fails to start, the command runs. The kit tested this hook in Claude Code only. If you use one of them on the same folders, repeat Check step 2 in that tool, or stop its import, knowing what else that stops ([docs/other-tools.md](../docs/other-tools.md)).
