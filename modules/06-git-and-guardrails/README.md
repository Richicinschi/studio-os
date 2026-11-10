---
title: Git and guardrails
pack: way-of-working
checked: 2026-11-10
studio_sources:
  - .studio/rules/hard-rules.md
  - .studio/memory/feedback_no_squash_merges.md
  - .studio/memory/feedback_guardrails_under_concurrency.md
  - .studio/memory/feedback_no_network_info_in_commits.md
  - .studio/memory/project_runtime_neutral_studio.md
  - .studio/guardrails/git-hooks/README.md
  - .studio/guardrails/guards/no-network-info.mjs
  - .claude/skills/git-guardrails/SKILL.md
  - AGENTS.md
questions:
  - "Do you use git for your work, and is there a company remote (GitHub, GitLab, Azure DevOps, other)?"
  - "Do your repositories already have hooks (a `.husky/` folder, a `.pre-commit-config.yaml`, files in `.git/hooks/`)?"
  - "Do you want commits refused when they would carry a leaked secret, a real network address or an attribution trailer?"
  - "Does Claude Code run commands on your work machine, and are there commands that must never run?"
---

# Git and guardrails

## The problem

An agent that can run git and shell commands can lose work or leak a secret in one step: a `reset --hard`, a force-push, a token committed and pushed. Once committed, a leak stays in history.

A rule written once also drifts: what it says, what enforces it and what the routines do stop matching. And prose loses: in the studio, a prose rule was broken twice in one day by the agent that had just written it. So rules that must never break belong in a check; only rules that need judgement belong in a paragraph.

## The mechanism

- **Git hooks that refuse a bad commit before it lands** ([templates/git-hooks/](../../templates/git-hooks/README.md)). `pre-commit` refuses a conflict marker, a private network address outside test files, and a secret (through gitleaks, when installed); `commit-msg` refuses an attribution trailer. They are sh scripts that call Node; the canary below shows whether they work on your machine.
- **One repository first.** [`canary.mjs`](../../templates/git-hooks/canary.mjs) tries every path in a throwaway repository: what must pass, what must be refused. Then one real repository for a week, then the rest.
- **A guard on Claude's own commands.** `git-guardrails` (version 1.4.0) adds a Claude Code hook that runs before each shell command and blocks:
  - force-pushes and remote deletes: `push --force`, `push --force-with-lease`, a `+` refspec, `--mirror`, `--delete` and a `:branch` push;
  - history rewrites: `reset --hard`, `rebase -i`, `commit --amend`, `filter-branch`, `filter-repo`, `update-ref -d`, `commit-tree`, `branch -f`, `checkout -B` and `switch -C`;
  - destructive working-tree commands: `clean -xdf`, `checkout -- .`, `restore .`, `checkout -f`, `branch -D` and `worktree remove --force`;
  - the way back: `stash drop`, `stash clear`, `reflog expire` and `gc --prune`;
  - skipped hooks: `--no-verify` and its prefixes from `--no-v` on, `commit -n`, `-c core.hooksPath=`, `--config-env=core.hooksPath=`, `git config` giving `core.hooksPath` a value or removing it, and the environment variable `GIT_CONFIG_KEY_<n>=core.hooksPath`, with the key in any case.

  Plain `push` stays allowed. Reading the hooks setting stays allowed; setting it does not, because the same command can point git at an empty folder, so turning hooks on through `core.hooksPath` is a command you run yourself. It matches text: `reset --merge`, `reset --keep` and config that reaches git from outside the command's text, such as `GIT_CONFIG_PARAMETERS` or a file named by `GIT_CONFIG_GLOBAL`, still pass ([the card](../../cards/git-guardrails.md) lists them).
- **Risky acts only after an explicit, recorded yes:** force-push, history rewrite, merge, tag, skipping hooks. One yes covers one act. Hooks are a floor, not a wall: `--no-verify` skips them, so a skip needs the same yes.
- **Merge commits, never squash.** A squash folds a branch into one commit and loses its history; a rebase merge on GitHub rewrites every commit with new hashes, and the rewritten commits arrive without signature verification, because GitHub cannot sign them for you ([docs/facts.md](../../docs/facts.md), "GitHub: merge methods").
- **One worktree per parallel session.** Never switch branches, stash or clean under a session that may be live, and never clean up what another session owns.
- **An exact ask.** "Clean up" is not a yes to delete each branch. Name the branches and paths, and get a yes to that list; the shipped `git-cleanup` asks the same way, showing the exact commands before its final yes.
- **Each rule says exactly what it protects.** The address rule bans *real* addresses and allows made-up ones in tests (narrowed 2026-11-02): the harm is a real address reaching a remote.
- **Audit the rules now and then:** a read-only session finds contradictions, enforcement gaps and stale references, quoting both sides with file and line ([templates/audit/rules-audit-brief.md](../../templates/audit/rules-audit-brief.md)).
- **`git-cleanup` for stale branches:** it sorts them into merged, superseded and active, and asks before it deletes.
- **What a commit and a merge say.** [Commit messages and PR bodies](../../cards/commit-and-pr-writing.md) say why, what was verified and what was left undone; [merge commits only](../../cards/merge-commit-only.md) keeps every commit; [a never-share list](../../cards/never-share-list.md) of your own terms is refused by the pre-commit.

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

In a studio repository, a config file carried a comment with two real network addresses. A later commit deleted the comment, but the addresses were still in 51 commits of history, and pushing the repository to GitHub meant rewriting all of it. The rule that followed: no real network details in any committed file, not even in a comment, and a scan of the full history before a first push. It was later narrowed to real addresses only, since a made-up one in a test file carries no risk.

The hooks that enforce it went to one archived repository first, then two more. Seven paths were tried: a plain commit and a new-branch push passed; a conflict marker, a fake token, a private address, a trailer and a tag push without a recorded yes were refused. Only then did every repository get them.

## Apply it in Claude Code

1. **Adopt the hook template** through `vet-and-adopt` (ADAPT: the trailer rule is a studio preference; drop `commit-msg` if your company wants AI attribution). Follow its README: copy the folder into your setup, make the hooks executable on macOS and Linux, and run `node "$HOME/claude-setup/git-hooks/canary.mjs"`. Every line must say PASS or SKIP.
2. **Check for existing hooks** (`.husky/`, `.pre-commit-config.yaml`, files in `.git/hooks/`). Where there are any, never point `core.hooksPath` at the template: git would then look for hooks only in the template's folder, so hooks left in `.git/hooks` stop running ([docs/facts.md](../../docs/facts.md), "Git: hooks and worktrees"). Call `check-staged.mjs` from the existing pre-commit instead.
3. **Install gitleaks** ([install reference, "Tools some items need"](../../docs/install-reference.md#tools-some-items-need)); without it the secret check is skipped.
4. **Adopt `git-guardrails`** (ADAPT the blocked list to your tools). `jq` is optional: the script reads the command with it when it is there, and otherwise matches the raw hook input, so it still blocks. If Claude runs PowerShell on your machine, match that tool too (`Bash|PowerShell`). A fake force-push must exit with code 2. It also refuses Claude's `git config core.hooksPath <folder>`, so where step 1 turns the hooks on through that setting, you run that line yourself, in a terminal of your own.
5. **Write the yes-list** in `RELATIONSHIP.md` (module 07): force-push, history rewrite, merge, tag, `--no-verify`, deleting branches. Add: "name the exact branches and paths when you ask."
6. **Put the audit brief on a calendar,** every few months.
7. **Adopt `git-cleanup`** when stale branches pile up; `git-guardrails` blocks its `branch -D` deletions too.

(studio-specific: the studio records each yes in a grants ledger that a guard reads before the act, and its own hooks also refuse public addresses and machine names. You need neither to start.)

## Apply it in claude.ai

No shell and no hooks, so this reduces to the contract and the audit.

1. Put the "Ask me first" and "Never" lists into the Project instructions ([templates/claude-ai/PROJECT-INSTRUCTIONS.md](../../templates/claude-ai/PROJECT-INSTRUCTIONS.md)).
2. Run the audit brief in a Project whose knowledge holds your instruction files; replace `<your setup>` with "this Project's knowledge".
3. Take real addresses and tokens out of a config or log before you paste it; no hook catches them here.

Catalog items used here: [git-guardrails](../../catalog/skills/git-guardrails/SOURCE.md) · [git-cleanup](../../catalog/skills/git-cleanup/SOURCE.md). Full stories: [the address](../../examples/real-address-in-history.md) · [the canary](../../examples/hooks-canary-rollout.md) · [the rules audit](../../examples/rules-audit.md).
