# Git hooks (template)

Two hooks that refuse a commit before it lands:
- `pre-commit`: a conflict marker, a real private network address outside test files, or a secret (when gitleaks is installed). Made-up addresses are fine in test files. A UTF-16 text file with a byte-order mark, which git takes for binary, is decoded and checked like the rest, and so is a file that was one and is staged as plain text. A text file that `.gitattributes` marks `-diff` or `binary`, such as a lockfile, is checked like plain text too: git leaves its lines out of the diff, so the hook reads the staged file itself. With a `never-share.local.txt` beside the scripts (one term per line, saved as UTF-8, or as UTF-16 with a byte-order mark; a line starting with `# ` is a comment, and so is ` # ...` after a term; `\#` anywhere in a term is a literal `#`, as in `\#proj-falcon` or `C \#`), it also refuses any staged line holding one of those terms, as a whole word in any case; the refusal names the line of the list, never the term. Add `never-share.local.txt` to your `.gitignore`: the list is yours and stays on your machine.
- `commit-msg`: an attribution trailer naming a tool or a second author. This one encodes the studio's preference (a commit carries only its author). Your company may want the opposite: adapt it or skip it.

They are sh scripts that call Node, so they run the same on Windows (git runs them with its own sh), macOS and Linux. They need `node` on the PATH; `gitleaks` is optional.

## Install, one repository first
The commands use `$HOME`, which PowerShell, bash and zsh all expand; Windows PowerShell passes `~` to a program unexpanded.

1. Copy this folder into your setup, for example to `~/claude-setup/git-hooks/`.
2. macOS and Linux: `chmod +x "$HOME/claude-setup/git-hooks/pre-commit" "$HOME/claude-setup/git-hooks/commit-msg"`. Windows: nothing to do.
3. Try them without touching a real repository: `node "$HOME/claude-setup/git-hooks/canary.mjs"`. Every line must say PASS or SKIP.
4. **If the repository already has hooks** (a `.husky/` folder, a `.pre-commit-config.yaml`, or files in `.git/hooks/`), stop here: pointing it at this folder would switch those off. Call the checks from its own hooks instead, each line straight after the hook's first line, so an `exit` or `exec` further down cannot skip it:
   - in its `pre-commit`: `node "$HOME/claude-setup/git-hooks/check-staged.mjs" || exit 1`;
   - in its `commit-msg`, when you keep the trailer check: `node "$HOME/claude-setup/git-hooks/check-message.mjs" "$1" || exit 1`. If it has none, create the file with `#!/bin/sh` as its first line and that line below it, and on macOS and Linux `chmod +x` it. Without the `#!/bin/sh` line, git on Windows cannot start the hook and every commit fails.

   Without `|| exit 1`, a refusal is printed and the commit still goes through whenever the hook runs another command after it.
5. Otherwise turn them on in one repository. **You** run this line in a terminal of your own; Claude can give you the line with both paths filled in: `git -C "<repo>" config core.hooksPath "<full path to the folder>"` (on Windows, write the path with forward slashes). Keep the quotes: without them, a path with a space is cut at the space, git stores the first part, and no hook runs. It is your command because the setting that turns the hooks on can as well point git at an empty folder and turn every hook off: the kit's git-guardrails refuses it from Claude for that reason (version 2.0.0), and the kit leaves it with you whether that guard is installed or not.
6. Either way, try it in that repository, with nothing else staged: stage a new file holding the line `<<<<<<< check` and run `git commit -m "hooks check"`. It must be refused with `pre-commit refused this commit:`; then unstage and delete the file. When you keep the trailer check, also run `git commit --allow-empty -m x -m "Co-authored-by: Check <check@example.invalid>"`; it must be refused with `commit-msg refused`.
7. After a week without surprises, do the same in your other repositories.

To turn them off in a repository: `git -C "<repo>" config --unset core.hooksPath`, which you also run in your own terminal (git-guardrails refuses removing the setting from Claude, as it refuses setting it), or remove the lines you added to its own hooks.

## What they do not do
They are a floor, not a wall: `git commit --no-verify` skips them. If that is a risk for you, add "never use --no-verify without asking me" to your `RELATIONSHIP.md` (module 07).

Known gaps, where a check refuses too much or too little:
- When a merge is concluded, `pre-commit` checks only the lines new against both parents, but gitleaks scans the lines from the other branch as well: a secret already on that branch refuses the merge commit.
- A cherry-pick and a `git merge --squash` are checked as ordinary commits, so the lines they bring from the other branch count as new. A line a merge commit would pass can be refused there.
- A four-part number straight after a version word (`<AssemblyVersion>`, `Version=`, `"version": "`) is taken for a version, so a real address written as `version: <address>` passes. Other version forms are still refused when the version starts with `10.`, such as a makefile's `VERSION ?=` line and the `VALUE "FileVersion"` line of a Windows resource file.
- gitleaks does not read UTF-16 files: `pre-commit` decodes them for its own checks only, so a secret in one passes. A UTF-16 file with no byte-order mark is not decoded at all, and one over 64 MB is skipped with a warning that names it.
- `commit-msg` stops reading at the scissors line of `git commit -v` only when the comment character is a single character. With a longer `core.commentString`, the diff below that line is read as message text, and a commit whose diff holds a refused trailer is refused.
- `gitleaks could not run (exit N)`: gitleaks started and failed, as it does on a broken `.gitleaks.toml`. That refusal stops every commit in the repository until the config is fixed.
