---
id: git-guardrails
module: 06-git-and-guardrails
checked: 2026-11-02
tokens:
  description: 75
  body: 910
---

# A guard on Claude's git commands

## Why

- **The problem:** an agent that can run git can lose work in one command: a `reset --hard` drops uncommitted changes, a force-push replaces what is on the server, a `branch -D` deletes a branch that was never merged.
- **The reason:** a Claude Code hook (a command that Claude Code runs at a set moment, here before each shell command) checks the command against a list and blocks it, exit code 2, before it runs. Force-pushes, history rewrites, `reset --hard`, `clean -f`, `branch -D`, `checkout .`, `restore .` and skipped hooks are blocked (the full list is under Watch out); plain `push` stays allowed.
- **The cost of skipping it:** without it, only a sentence in your instructions stands between Claude and those commands, and prose loses: in the studio, a prose rule was broken twice in one day by the same agent that had written it ([module 06, The problem](../modules/06-git-and-guardrails/README.md#the-problem)).
- **The principle:** [hard stops for the irreversible, judgement for the rest](../PRINCIPLES.md#hard-stops-for-the-irreversible-judgement-for-the-rest). The commands that cannot be undone become hard stops; everything else stays Claude's call.

## Detect

Read-only. Presence, settings and names; no network.

- `jq`: present or not on the PATH (`command -v jq` in bash, `Get-Command jq` in PowerShell). The script reads the command with it when it is there; without it, it matches the raw hook input instead and still blocks.
- Claude's shell tools in this session: Bash, PowerShell or both; Claude says which it has. On Windows, Claude Code uses Git for Windows' Bash when it is installed, and PowerShell without it ([docs/facts.md](../docs/facts.md)).
- A git guard already: in `.claude/settings.json` (project) and `~/.claude/settings.json` (user, or under `$CLAUDE_CONFIG_DIR` when that is set), the `hooks.PreToolUse` entries: how many, which tools each one's matcher names, and whether its command names `block-dangerous-git` or another git guard. Only the hooks part is read.
- The script: `.claude/hooks/block-dangerous-git.sh` or `~/.claude/hooks/block-dangerous-git.sh`, present or not.
- The skill: a skill named `git-guardrails`, or another doing the same job, at project or user level. Names and descriptions only.
- Whether your instruction files put pushing on your ask-first list (for question 2).

The menu marks the item **have** when a git guard runs for every shell tool Claude has, **partly** when a guard is set but one shell tool is not matched, and **not yet** otherwise.

## Ask

1. **"Block destructive git commands before Claude runs them?"**
   - Install the hook only: Claude follows the skill's steps from the kit copy, and only the hook script and its settings entry land in your setup. Recommended when Detect found no git guard.
   - Install the skill too, so you can put the guard into other projects later.
   - FOLD: add the patterns your guard lacks to the hook you already have. Recommended when Detect found one.
   - No.
   - Not sure: the option recommended above for what Detect found: the hook only, with the list as it is, when Detect found no git guard; FOLD when it found one.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing.
2. **"May Claude run a plain `git push`?"**
   - Yes: only force-push and the other destructive commands are blocked, as in the kit copy. Recommended when your instruction files do not put pushing on your ask-first list.
   - No: plain `git push` is blocked too, as in the skill's upstream, and you push yourself. Recommended when Detect found pushing on your ask-first list.
   - Not sure: the option recommended above for what Detect found: allowed when pushing is not on your ask-first list, blocked when it is.
   - Default when skipped: allowed.
3. **"Where?"**
   - This project only: `.claude/settings.json`, with the script in `.claude/hooks/`. Recommended when Claude runs git in one repository.
   - Every project: `~/.claude/settings.json`, with the script in `~/.claude/hooks/`. Recommended when Claude runs git in several.
   - Not sure: the option recommended above: this project only when Claude runs git in one repository, every project when it runs git in several.
   - Default when skipped: this project only.

## Needs

- `jq` is optional: with it the script reads the command exactly; without it, it matches the raw hook input. Its install commands are not documented in docs/facts.md as of 2026-11-02. Check step 1 proves the guard works either way.
- bash, since the script is a bash script. macOS and Linux have it; on Windows it comes with Git for Windows: `! winget install --id Git.Git -e --source winget`.
- Nothing else beyond Claude Code.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/skills/git-guardrails/` (version 1.2.0). Expect a verdict other than SAFE. The kit's scan of version 1.2.0, with the build that reports SkillSpector 2.2.3 ([docs/facts.md](../docs/facts.md), "Installing SkillSpector"), rated it 100/100, `DO_NOT_INSTALL`, from seven findings, each a false positive or by design: the commands it blocks and the fake force-push its own test sends to the script, read as commands it runs; its description and its licence text; and the settings file it writes to ([the kit's scan triage](../tools/export/scan-triage.md), the v2.0.1 run). A newer SkillSpector can count differently. Claude shows each finding with its reading and goes on only after you have read them.
2. **Claude:** copies the script to the place you chose, `.claude/hooks/block-dangerous-git.sh` or `~/.claude/hooks/block-dangerous-git.sh`, with the list fitted to your answers: `git push` added when plain pushes are blocked, and the studio's policy comment replaced by your own reason. On macOS and Linux it makes the script executable (`chmod +x`). It shows you the script before saving it. If you install the skill too, Claude rewrites its description and its two notes in your words the same way: they name the studio's own wider guard, its record of approved acts and its rule numbers, none of which your setup has.
3. **Claude:** merges one entry into `hooks.PreToolUse` of the settings file for that place, in the shape the skill shows, keeping every other setting. The entry's matcher is `Bash|PowerShell`, as the kit copy ships it: a matcher of names joined by `|` is a list of exact tool names, so it covers both shell tools ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"). Check step 2 is the proof on your machine. It shows you the change before saving it.
4. **Claude:** records the decision, the place, the blocked list and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** in bash, sends a fake force-push to the script:
   `echo '{"tool_input":{"command":"git push --force origin main"}}' | <path to the script>; echo "exit $?"`
   Expected: one line that starts `BLOCKED: 'git push --force origin main' matches dangerous pattern`, then the pattern it matched as the script writes it, and ends `The user has prevented you from doing this.` (or the message you wrote in its place), then `exit 2`. The same line with `git status` in place of the push prints `exit 0`.
2. **you:** in a new session, ask Claude to run `git branch -D no-such-branch` in any repository. That branch does not exist, so nothing is lost either way. Expected: Claude reports the command as blocked. If Claude also has PowerShell, ask for the same through PowerShell.

If step 1 prints `exit 0` for the force-push, the script differs from the one in the settings; if step 2 shows git's own error that the branch was not found, the hook did not run for that tool. Either way the item is not done, and the plan row stays unticked.

## Undo

- **Claude:** removes the entry from `hooks.PreToolUse` in the same settings file, leaving the rest, and deletes the script.
- **Claude:** deletes the skill's folder, if you installed the skill too, and marks the row in `adoption/decisions.md` as undone.
- **you:** jq and Git for Windows stay installed; removing them is your decision.

## Watch out

- **Run Check step 1 again after any change** to the script or to your PATH: a guard that silently stopped matching looks the same as one that works.
- **Every shell tool needs matching.** A PowerShell command passes a guard whose matcher names only Bash. The kit copy names both; a guard you already have may not.
- **It matches text, not meaning.** Version 1.2.0 blocks force-pushes and remote deletes (`push --force`, `--force-with-lease`, a `+` refspec, `--mirror`, `--delete`, `push origin :branch`); history rewrites (`reset --hard`, `rebase` and `rebase -i`, `commit --amend`, `branch -f`, `checkout -B`, `switch -C`, `commit-tree`, `filter-branch`, `filter-repo`, `update-ref -d`); `clean` with an `f` in its flags, such as `clean -xdf`; `branch -D`, `checkout -f`, `checkout -- .`, `restore .` and `worktree remove --force`; the way back (`stash drop`, `stash clear`, `reflog expire`, `gc --prune`); and skipped hooks (`commit --no-verify`, `commit -n`, `-c core.hooksPath=`). Finishing a rebase with `--continue`, `--abort`, `--skip` or `--quit` stays allowed. In a run of 33 sample commands through that version, the one risky command that still passed was `reset --merge`, allowed by design. Add what matters to you to its list, and keep those acts on your ask-first list too; the studio's own guard missed similar spellings until an audit found them ([the rules audit](../examples/rules-audit.md)). It also blocks a command that only mentions a pattern, such as a commit message containing "reset --hard".
- **No way through for one approved act.** When you decide a force-push is right, you run it yourself in your own terminal; the guard cannot let one through. Beside a guard of yours that does let an approved act through, this one still blocks it, so the studio keeps it out of the places its own guard covers: take one guard or the other for a repository, not both.
- **It also blocks [git-cleanup](git-cleanup.md)'s force deletions** (`git branch -D`).
- **A shared repository:** `.claude/settings.json` and `.claude/hooks/` are usually committed, so the guard reaches your team too. Agree it first, or put the entry in `.claude/settings.local.json`, your own settings for one project (a hand-made one goes in `.gitignore`), with the script in your user folder.
- **Windows:** the script is bash. Claude Code runs hook commands through Git Bash on Windows, or through PowerShell when Git Bash is not installed ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"), so install Git for Windows (Needs); Check step 2 is the proof on your machine.
- **Token cost:** the hook loads nothing into context. If you keep the skill, its description loads every session, about 75 tokens, and its body about 950 tokens when it runs: estimates (bytes divided by 4) measured on version 1.2.0 before the kit's rewrite of its notes, so your copy may be a little smaller.
