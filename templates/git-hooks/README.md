# Git hooks (template)

Two hooks that refuse a commit before it lands:
- `pre-commit`: a conflict marker, a real private network address outside test files, or a secret (when gitleaks is installed). Made-up addresses are fine in test files. With a `never-share.local.txt` beside the scripts (one term per line, `#` for comments), it also refuses any staged line holding one of those terms, as a whole word in any case; the refusal names the line of the list, never the term. Add `never-share.local.txt` to your `.gitignore`: the list is yours and stays on your machine.
- `commit-msg`: an attribution trailer naming a tool or a second author. This one encodes the studio's preference (a commit carries only its author). Your company may want the opposite: adapt it or skip it.

They are sh scripts that call Node, so they run the same on Windows (git runs them with its own sh), macOS and Linux. They need `node` on the PATH; `gitleaks` is optional.

## Install, one repository first
The commands use `$HOME`, which PowerShell, bash and zsh all expand; Windows PowerShell passes `~` to a program unexpanded.

1. Copy this folder into your setup, for example to `~/claude-setup/git-hooks/`.
2. macOS and Linux: `chmod +x "$HOME/claude-setup/git-hooks/pre-commit" "$HOME/claude-setup/git-hooks/commit-msg"`. Windows: nothing to do.
3. Try them without touching a real repository: `node "$HOME/claude-setup/git-hooks/canary.mjs"`. Every line must say PASS or SKIP.
4. **If the repository already has hooks** (a `.husky/` folder, a `.pre-commit-config.yaml`, or files in `.git/hooks/`), stop here: pointing it at this folder would switch those off. Call `node "$HOME/claude-setup/git-hooks/check-staged.mjs"` from its existing pre-commit instead.
5. Otherwise turn them on in one repository: `git -C <repo> config core.hooksPath <full path to the folder>` (on Windows, write the path with forward slashes).
6. After a week without surprises, do the same in your other repositories.

To turn them off in a repository: `git -C <repo> config --unset core.hooksPath`.

## What they do not do
They are a floor, not a wall: `git commit --no-verify` skips them. If that is a risk for you, add "never use --no-verify without asking me" to your `RELATIONSHIP.md` (module 07).
