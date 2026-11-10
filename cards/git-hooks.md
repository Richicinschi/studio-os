---
id: git-hooks
module: 06-git-and-guardrails
checked: 2026-11-02
tokens:
  light: 0
  standard: 0
  full: 0
---

# The git hook templates

## Why

- **The problem:** an agent that commits can put a token, a conflict marker or a home network address into a commit in one step, and once committed it stays in history: deleting the line later removes it from the files, not from the commits before.
- **The reason:** two git hooks (scripts git runs at each commit) check the commit before it exists. `pre-commit` refuses a conflict marker, a private network address outside test files, and a secret, through gitleaks when it is installed; `commit-msg` refuses an attribution trailer. A check refuses every time; a written rule can be forgotten.
- **The cost of skipping it:** in a studio repository, two real addresses deleted from a config comment were still in 51 commits, and the only way to push the repository without them was to rewrite its whole history ([a real address in history](../examples/real-address-in-history.md)).
- **The principle:** [checks for rules that must never break, prose for judgement](../PRINCIPLES.md#checks-for-rules-that-must-never-break-prose-for-judgement). A leak into history must never happen, so a hook enforces it instead of a sentence.

## Detect

Read-only. Settings as set or not set, presence, counts and versions; no network.

- For each repository in `adoption/inventory.md`, whether it already has hooks:
  - a `.husky/` folder, present or not;
  - a `.pre-commit-config.yaml` file, present or not;
  - files in `<repo>/.git/hooks/` other than git's `.sample` files, counted;
  - `git -C <repo> config --get core.hooksPath >/dev/null && echo set || echo "not set"`.
- Your user setting, which applies to every repository: `git config --global --get core.hooksPath >/dev/null && echo set || echo "not set"`.
- Whether the template is already in your setup: `<your setup>/git-hooks/check-staged.mjs`, present or not.
- Whether git knows who you are, which the canary needs: `git config --global --get user.email >/dev/null && echo set || echo "not set"`.
- Versions: `git --version`, `node --version` (the hooks need Node), and `gitleaks version` (optional; it may not be installed).

The menu marks the item **have** when the repositories you chose run the template's checks, through `core.hooksPath` or a call from their own hook, **partly** when the template is in your setup but on in none or only some of them, and **not yet** otherwise.

## Ask

1. **"Size?"** No size loads anything into a session: the hooks run inside git, so each costs 0 tokens.
   - Light: `pre-commit` only, which refuses a conflict marker and a private network address outside test files. Recommended for a first adoption, and when your company wants AI-assisted commits marked or your Claude adds an attribution trailer you want to keep.
   - Standard: `pre-commit` and `commit-msg`, which also refuses an attribution trailer (a closing line of a commit message that names a tool or a second author), so a commit carries only its author. You can give it your own list of refused trailers. Recommended when your company says nothing about marking AI-assisted commits.
   - Full: standard, plus gitleaks, a secret scanner that `pre-commit` calls when it is installed, and a never-share list: a private file of terms, such as client or internal project names, that `pre-commit` refuses in any staged line ([templates/git-hooks/README.md](../templates/git-hooks/README.md)). Recommended when keys or tokens live near your code, or your work names clients that must never reach a commit.
   - Not sure: light, the size recommended for a first adoption. `commit-msg` encodes the studio's preference, and `pre-commit` carries the safety checks; update mode offers a larger size later.
   - Default when skipped: light.
2. **"Turn the hooks on?"**
   - Yes, through `core.hooksPath`, in one repository first. Recommended when Detect found no `.husky/`, no `.pre-commit-config.yaml`, no hook files and no `core.hooksPath` in that repository.
   - Yes, by calling `check-staged.mjs` from the hook the repository already has. Recommended when Detect found any of those: while `core.hooksPath` points at the template, git looks for hooks there instead of in `.git/hooks`, so the existing hooks stop running ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees").
   - No.
   - Not sure: the option recommended above for what Detect found: through `core.hooksPath` in one repository that has no hooks of its own, or a call from the existing hook where it has one. Either way the canary runs first, in a throwaway repository.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: nothing.
3. **"Which repositories?"**
   - One first, then the others after a week without surprises. Recommended: it is the order the studio used ([hooks on a canary first](../examples/hooks-canary-rollout.md)).
   - Your own repositories only.
   - Company repositories too, when your company allows local tooling there.
   - Not sure: one first, the recommended order, starting with the repository that has the least at stake.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: none; only the canary runs.

## Needs

- Git, with your name and email set; the canary stops without them.
- Node.js on the PATH: the hooks are sh scripts that call `node`. [Tools some items need](../docs/install-reference.md#tools-some-items-need) installs Node.js 22:
  - Windows: `! winget install --id OpenJS.NodeJS.22 -e`;
  - macOS and Linux: through nvm, the three lines in [docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux";
  - then `! node --version`.
- gitleaks, for the full size; without it the secret check is skipped ([docs/facts.md](../docs/facts.md)):
  - Windows: `! winget install --id Gitleaks.Gitleaks -e`;
  - macOS: `! brew install gitleaks` (needs Homebrew);
  - Linux: `! mkdir -p ~/.local/bin && curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz | tar -xz -C ~/.local/bin gitleaks` (the `linux_arm64` file on an ARM machine);
  - then `! gitleaks version`.
- On Windows, Git for Windows. How it runs the sh scripts is not documented in docs/facts.md as of 2026-11-02; the canary (Check step 1) is the proof on your machine.

## Steps

Which steps each size takes: **light** and **standard** every step but 3 and 4, **full** every step. Light and standard differ in what step 2 copies.

1. **Claude:** runs `vet-and-adopt` on `templates/git-hooks/`: a SkillSpector scan, triage, and a recommendation against what Detect found.
2. **Claude:** on your yes, copies the folder into your setup as `<your setup>/git-hooks/`, fitted to your answers:
   - at light, it leaves out `commit-msg` and `check-message.mjs` and removes the trailer check from `canary.mjs`, so the canary still reads PASS or SKIP on every line; at standard or full with your own list of trailers, the canary's trailer check uses one from your list;
   - the test-file patterns in `check-staged.mjs` match how your repositories name their test folders, where that differs;
   - the comments are in your words.
   It shows you the files before saving them.
3. **you:** (full) install gitleaks with the line for your system in Needs, then `! gitleaks version`. Light and standard install nothing, though a gitleaks already on your machine still runs.
4. **Claude:** (full) writes `never-share.local.txt` beside the scripts, one term per line from the terms you name, and shows it to you; then adds `never-share.local.txt` to your setup's `.gitignore`, so the list stays on your machine.
5. **Claude:** on macOS and Linux, makes the hooks executable: `chmod +x "<your setup>/git-hooks/pre-commit" "<your setup>/git-hooks/commit-msg"`. Windows needs nothing.
6. **Claude:** runs the canary (Check, step 1). Nothing goes further until every line reads PASS or SKIP.
7. On your yes, the hooks go on in the first repository:
   - no existing hooks: **Claude** gives you the line with both paths filled in, and **you** run it in a terminal of your own: `git -C <repo> config core.hooksPath <full path to the folder>` ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees"), with the folder written with forward slashes on Windows, as the canary writes it. It is your command because the setting that turns the hooks on can as well point git at an empty folder and turn every hook off: [git-guardrails](git-guardrails.md) refuses it from Claude for that reason (version 1.3.0), and the kit leaves it with you whether that guard is installed or not;
   - existing hooks: **Claude** adds one line in the repository's existing pre-commit hook that runs `node "<your setup>/git-hooks/check-staged.mjs"`, shown to you first. Where that hook file is committed and shared, as a `.husky/` file usually is, Claude asks you before touching it (Watch out).
8. **you:** after a week without surprises, tell Claude which other repositories get them; step 7 is repeated there, the setting by you and the hook line by Claude.
9. **Claude:** records the decision, the size (which says whether `commit-msg` was kept), the repositories, and the undo in `adoption/decisions.md`. It never records the terms of your never-share list.

## Check

1. **Claude:** `node "<your setup>/git-hooks/canary.mjs"`. It works in a throwaway repository in a temporary folder and deletes it afterwards. Expected:

   ```text
   PASS  a plain commit goes through
   PASS  a conflict marker is refused
   PASS  a private address in a normal file is refused
   PASS  a made-up address in a test file is allowed
   PASS  an attribution trailer is refused
   PASS  a leaked token is refused (gitleaks)
   ```

   Without gitleaks, the last line reads `SKIP  the secret scan (gitleaks is not installed)`; at light, the trailer line is not there.
2. **Claude:** for each repository turned on through the setting, `git -C <repo> config --get core.hooksPath` prints the folder from step 7.
3. For the existing-hook route: in that repository, with nothing else staged, Claude stages a new file holding one conflict-marker line (`<<<<<<< check`) and tries `git commit -m "hooks check"`. Expected: `pre-commit refused this commit:` and a line naming the conflict marker. Then it unstages and deletes the file.
4. At full, for the never-share list: Claude makes a throwaway repository in a temporary folder and gives you the line that points its `core.hooksPath` at your folder, which you run as in step 7. Claude then stages a file holding one term from your list and tries `git commit -m "list check"`. Expected: `pre-commit refused this commit:` and a line ending `a term from your never-share list (line <n> of the list)`, which names the line of the list, never the term. Then it deletes the folder.

A `FAIL` line, or a commit that goes through in step 3 or 4, means the item is not done: the plan row stays unticked, and the failing line's message is the next thing to look at. A commit that went through in step 3 is removed only on your yes. If the canary stops with "a plain commit fails here", git cannot commit even in a throwaway repository, often because signing cannot ask for its passphrase; fix that first.

## Undo

- **you:** in each repository turned on through the setting, in a terminal of your own: `git -C <repo> config --unset core.hooksPath` (newer git also accepts `git -C <repo> config unset core.hooksPath`). git-guardrails refuses removing the setting from Claude, as it refuses setting it. **Claude:** then `git -C <repo> config --get core.hooksPath` prints nothing.
- **Claude:** for the existing-hook route, removes the line it added to that hook.
- **Claude:** deletes `<your setup>/git-hooks/` once no repository uses it (your never-share list inside it only on your yes; it is yours to keep or move), removes the list's line from your setup's `.gitignore`, and marks the row in `adoption/decisions.md` as undone.
- **you:** Node.js and gitleaks stay installed; removing them is your decision, and their uninstall commands are not documented in docs/facts.md as of 2026-11-02.

## Watch out

- **A floor, not a wall.** `git commit --no-verify` skips both hooks ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees"). If that matters to you, put "never use `--no-verify` without asking me" on your ask-first list ([templates/identity/RELATIONSHIP.md](../templates/identity/RELATIONSHIP.md), and [its card](identity-relationship.md)).
- **No Node, no commits.** The hooks call `node`; where it is not on the PATH, as in some scheduled jobs, the hook fails and the commit with it. The studio keeps the hooks off where its scheduled jobs commit without Node on their path ([hooks on a canary first](../examples/hooks-canary-rollout.md)); check that path before you turn them on where a job commits.
- **A public address passes.** The address check knows the private ranges only. Before the first push of any repository, search its whole history for addresses and secrets ([a real address in history](../examples/real-address-in-history.md)).
- **Shared hook files.** A `.husky/` file or a `.pre-commit-config.yaml` is usually committed for the whole team; a line there that calls a file in your own setup fails on everyone else's machine and puts your path into the repository. Agree such a change with the team, or keep the call in an unshared hook.
- **A Claude that adds trailers.** If your Claude ends its commit messages with an attribution trailer, a kept `commit-msg` refuses every one of its commits; change one or the other.
- **Signed commits and the canary.** When your commits are signed with a passphrase nobody can type at that moment, the canary's plain commit fails, and it stops and says so ([signed commits](signed-commits.md)).
- **Roll out on a canary first.** A mistake in a shared hook reaches every repository at once; the order in step 8 keeps it to one.
- **gitleaks** v8.30.1 is the current release, and its author has announced security fixes only from here on ([docs/facts.md](../docs/facts.md)).
- **Windows:** write the `core.hooksPath` folder with forward slashes, as the canary does; a canary that reads PASS on your machine shows git found the scripts there.
- **Token cost:** none. The hooks run inside git, not in Claude's context.
