# Security

## Reporting a vulnerability

Use GitHub's private vulnerability reporting: open the repository's Security tab, then "Report a vulnerability". Please do not open a public issue for a vulnerability, and do not put one in a pull request.

A useful report holds:

- the file and line;
- what an attacker can do with it;
- how to reproduce it.

A fix ships in the next release; `CHANGELOG.md` records it. No response time is promised.

## Scope

In scope:

- the kit's own skills (`.claude/skills/`);
- the templates (`templates/`), above all `templates/git-hooks/` and `templates/hooks/`;
- the export tooling (`tools/`);
- the shipped copies in `catalog/`;
- advice in the cards or modules that would lead an adopter into an unsafe setup.

Out of scope:

- the upstream projects behind the third-party skills: report to them (`docs/THIRD_PARTY_NOTICES.md` lists them);
- Claude Code itself;
- an adopter's own setup.

## What is enforced and what is asked

The kit offers two kinds of protection, and they are not the same.

- **Enforced by code:** a script or a setting refuses or reports, whatever Claude intends. It still has gaps, listed below.
- **Asked:** an instruction Claude follows. An instruction is not a lock: Claude Code can read and edit every file in a folder you add, as `START-HERE.md` says of the audit. Treat an asked rule as a habit that Claude keeps, and check it when it matters.

### Enforced by code

| Mechanism | Kind | Where it runs | What it stops | Known gaps |
|---|---|---|---|---|
| `templates/git-hooks/pre-commit` (calls `check-staged.mjs`) | Enforced | A git hook, at each commit, once `core.hooksPath` points at the folder | On the lines a commit adds: a conflict marker; an IPv4 address in the ranges 10.x, 172.16-31.x or 192.168.x outside test files; a whole-word term from `never-share.local.txt`, if you keep one; a secret, through `gitleaks` | `git commit --no-verify` and `-c core.hooksPath=` skip it. If `gitleaks` is not installed, it prints that the secret scan was skipped and the commit goes on. It reads added lines only: not file names, the message, or binary files; lines already in history stay. No other address form is checked. Hooks are per clone: a teammate's machine has none |
| The never-share list (`never-share.local.txt`, read by `check-staged.mjs`) | Enforced | Inside `pre-commit` | A staged line holding a listed term, as a whole word in any case; the refusal names the list line, never the term | Whole words only: a plural or a short form needs its own line. The list is on your machine only. It must stay out of git (`cards/never-share-list.md`) |
| `templates/git-hooks/commit-msg` (calls `check-message.mjs`) | Enforced | A git hook, at each commit | After the subject line, a `Co-authored-by`, `Generated-by`, `Generated-with` or `Assisted-by` trailer, and a line of the form "generated with ... claude". This is the studio's preference; adapt or skip it | Same skips as `pre-commit`. It checks those spellings only |
| `templates/git-hooks/canary.mjs` | Enforced (a test) | By hand, in a throwaway repository | Nothing: it proves the hooks above refuse what they should | It tests the cases it lists, not your repository. It stops with a message if git cannot make a plain commit there |
| `catalog/skills/git-guardrails/scripts/block-dangerous-git.sh` | Enforced | A Claude Code PreToolUse hook, before each `Bash` or `PowerShell` command, once you add it to settings | Exit code 2 for command text matching the script's list: force-push and remote delete, `reset --hard`, `clean -f`, `branch -D`/`-f`, `checkout`/`switch` with `-B`/`-C`/`-f`, `checkout .`/`restore .`, `commit-tree`, `stash drop`/`clear`, `reflog expire`, `gc --prune`, `worktree remove --force`, `commit --amend`, `filter-branch`/`filter-repo`, `update-ref -d`, `--no-verify`, `commit -n`, `-c core.hooksPath`, and any `rebase` except `--abort`, `--continue`, `--skip`, `--quit` | It matches text, not meaning, and lists spellings. Anything not on the list passes, by design: for example `git reset --merge`. Plain `git push` is allowed. It runs only inside Claude Code, and only for the tools its matcher names. It has no way through for an approved act: you run that yourself. Without `jq` it matches the raw hook input |
| `templates/hooks/session-end-check.mjs` | Enforced (it tells, never changes) | A Claude Code Stop hook, after each reply | Exit 2, once, when a commit exists on no remote and is older than the active window (60 minutes by default). Fresher unpushed commits and uncommitted changes are listed with it, never alone | It reads only the setup folder and the repositories named in `registry/PROJECTS.md` or `adoption/inventory.md`. A repository with no remote is not checked for unpushed commits. The second stop in a row passes. It never pushes, commits or cleans |
| `templates/hooks/session-start-status.mjs` | Enforced (it tells, never changes) | A Claude Code SessionStart hook, at session start | Nothing: it prints at most ten lines into the session when it finds uncommitted changes, commits on no remote, local branches idle over 14 days, or a front-door "current state" date over 14 days older than the last commit | Information only; Claude may ignore it. Same repository list as the Stop hook |
| Merge method (`cards/merge-commit-only.md`) | Enforced by a GitHub repository setting, once you set it | GitHub, on the server | A squash or rebase merge of a PR, when those methods are switched off | The setting covers the server only: a squash made on your machine and pushed is not stopped. Whether `gh pr merge --squash` is refused on such a repository is not documented as of 2026-11-02 (`docs/facts.md`). A new repository has its own settings. A guard cannot say "only with `--merge`" |
| Signed commits (`cards/signed-commits.md`) | A git setting plus the server's check | Your git configuration; GitHub shows "verified" | Nothing is refused by the kit: signing proves who made a commit | An unsigned commit still lands unless your own rules refuse it. A passphrase prompt stops an agent that cannot answer it |
| Export gates `tools/export/gates.mjs` | Enforced, for the kit's own publishing | The maintainer's export run, before anything is published | A finding fails the export: a secret pattern (`rules.mjs`) or one found by `gitleaks`; a privacy term, in text or in a file name; a path pattern; a file the export did not produce and no hand-written location holds; a third-party skill without a licence file; a menu item without its card; a broken link; a diagram link that differs from its `.drawio` | Protects the kit, not the adopter. The term lists are local files kept out of git. They catch what they list and nothing more. `--no-gitleaks` is allowed for a local dry run |
| `tools/export/history-check.mjs` | Enforced, for the kit's own publishing | The maintainer, before a push to the public repository | Exit 1 when a commit's message, any file in its tree, or a file name holds a private term. It prints counts and term numbers, never a term | Exit 2 when the local lists are missing. It finds listed terms only. Binary files are skipped |

### Asked

| Mechanism | Kind | Where it runs | What it stops | Known gaps |
|---|---|---|---|---|
| The adoption protocol (`ADOPT.md`, `drill-to-adopt`) | Asked | In the session, as Claude follows the skill | Aims to change nothing in your setup without your yes, one question at a time; "Not sure" is never a yes to a change to your files | Nothing checks it. Claude Code can edit any file in a folder it has access to |
| The read-only audit (`drill-to-adopt`) | Asked | In the session | Aims never to open `.env*`, keys, files named credential or secret, or data files (`.csv`, `.parquet`, `.xlsx`, `.db`, `.sqlite`), or a notebook's contents. It reads manifests, existing Claude files and git state | A rule Claude follows, not a lock. If a folder holds anything you must not expose, answer with a subfolder that holds none of it, or answer no |
| Scan before installing (`vet-and-adopt`, `cards/skillspector.md`) | Asked | In the session, around each item that ships files | Claude runs SkillSpector first; a result other than `SAFE` stops until you have read the findings. A prompt injection, data exfiltration or an unexpected network call is a hard stop | The scan is code, but nothing makes Claude run it. A scanner misses things: a call home was found only by reading code (`cards/skillspector.md`, `cards/mcp-least-access.md`). Read the code too |
| The data rules (`drill-to-adopt`) | Asked | In the session | Claude asks for your company's data rules before it recommends anything; an unclear answer is not a yes | Claude follows what you tell it; it cannot see rules you did not state |
| The grant ledger (`cards/grant-ledger.md`) | Asked | A file of dated rows, read by Claude | One row per risky act (force-push, rewrite, merge, tag, skipping hooks), written before the act | The card says it plainly: a ledger is a record, not a lock. The kit ships no guard that reads it. `git-guardrails` blocks without reading it |
| Least access for MCP servers (`cards/mcp-least-access.md`) | Asked | In the session, when you add a server | Advice: the vendor's read-only mode where one exists, a narrow credential, scan and read the code first | Nothing limits a server you connect without following it |

## Reading this list

- A hook is a floor, not a wall. Git hooks do nothing when skipped; a Claude Code hook runs only in Claude Code, so a terminal you open yourself is outside it.
- Run `canary.mjs` and the guard's own test (`git-guardrails` SKILL.md, step 5) after any change, as a guard that silently stopped matching looks like one that works.
