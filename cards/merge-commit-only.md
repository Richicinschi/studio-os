---
id: merge-commit-only
module: 06-git-and-guardrails
checked: 2026-11-02
---

# Merge commits only

## Why

- **The problem:** a pull request (PR) can land in three ways, and two of them lose history. A squash folds the branch into one commit; a rebase merge on GitHub makes new commits, with new hashes and new committer information, and adds them without signature verification, since GitHub cannot sign them on your behalf ([docs/facts.md](../docs/facts.md), "GitHub: merge methods"; [module 06, The mechanism](../modules/06-git-and-guardrails/README.md#the-mechanism)). A rule about it written only in prose drifts and gets broken ([module 06, The problem](../modules/06-git-and-guardrails/README.md#the-problem)).
- **The reason:** a merge commit keeps every commit of the branch as it was made, hashes and signatures included, and records where the branch joined. With squash and rebase switched off in the repository's settings, the server offers the merge commit alone, so the rule holds by a setting, not by memory.
- **The cost of skipping it:** in the studio, 21 pull requests were merged with a squash during one migration, before the rule existed. Each branch's commits became one, and they were left as they are ([a recorded yes before a merge](../examples/grant-before-merge.md)).
- **The principle:** [one task, one branch, one PR, full history](../PRINCIPLES.md#one-task-one-branch-one-pr-full-history). The merge method decides whether the full history survives the merge.

## Detect

Read-only and offline. The settings live on the server, so they are read in Steps, on your yes.

- The `gh` command line: `gh --version` (it may not be installed).
- Each repository's remote host, from `adoption/inventory.md` (the host only, never the full address). This card covers GitHub.
- Merge commits on each repository's main branch, counted: `git -C <repo> rev-list --count --merges <main branch>`. Zero in a repository whose work lands through PRs points to squash or rebase merges.
- Whether your instruction files carry the rule, a count per file: `grep -ciE 'squash|merge commit' CLAUDE.md AGENTS.md 2>/dev/null`.
- Whether an earlier run recorded the settings: `grep -c merge-commit-only adoption/decisions.md`.
- A local guard: when [git-guardrails](git-guardrails.md) is in your setup, whether its script names squash: `grep -c squash .claude/hooks/block-dangerous-git.sh "$HOME/.claude/hooks/block-dangerous-git.sh" 2>/dev/null`.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when an instruction file carries the rule and `adoption/decisions.md` records each GitHub repository's settings as merge commit only; **partly** when only one of the two holds; and **not yet** otherwise.

## Ask

1. **"How do your PRs merge?"**
   - Merge commits only, set in each repository's settings (squash and rebase off) and written in your front door. Recommended for your own repositories on GitHub, and for the `software`, `ml` and `data` profiles.
   - Merge commits only, as a rule in your front door, with the settings left as they are. Recommended when you cannot change a repository's settings, as in most company repositories.
   - Your company's or team's method. Recommended when they set one: follow it, and record it as your decision.
   - No change.
   - Not sure: the option recommended above for what Detect found: your company's or team's method when they set one; otherwise merge commits only, through the settings for your own repositories on GitHub, and as a rule alone where you cannot change the settings. Claude reads and shows each repository's settings (read-only, over the network) before it changes any.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.

   The item is optional for the `general` profile.
2. **"Which repositories?"** (only for the settings route)
   - Your own repositories on GitHub. Recommended when the inventory lists them.
   - Only the ones you name.
   - Not sure: your own repositories on GitHub, the option recommended above; Claude reads and shows their settings first, and changes each on your yes.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: none.

## Needs

- A GitHub account that may change each repository's settings. Which permission that takes is not documented on GitHub's page as of 2026-11-02 ([docs/facts.md](../docs/facts.md), "GitHub: merge methods").
- The `gh` command line, signed in to that account. How to install it and sign in is not documented in docs/facts.md as of 2026-11-02; without it, the web route in step 4 does the same.
- Other hosts (GitLab, Azure DevOps and the rest) have their own settings, not documented in docs/facts.md; there, the rule in your front door is the part this card covers.

## Steps

1. **Claude:** runs `vet-and-adopt`'s comparison step. A practice with no files has nothing to scan; it compares with any merge rule you or your company have, and recommends FOLD or ADAPT.
2. **Claude:** on your yes, reads each chosen repository's three settings. This uses the network and changes nothing:
   ```bash
   gh api repos/<owner>/<repo> --jq '.allow_merge_commit, .allow_squash_merge, .allow_rebase_merge'
   ```
   It prints three lines, `true` or `false`, in that order. Claude keeps them for the undo.
3. **Claude:** for each repository where squash or rebase is on, shows you the command and runs it on your yes:
   ```bash
   gh api -X PATCH repos/<owner>/<repo> -F allow_squash_merge=false -F allow_rebase_merge=false
   ```
   When step 2 printed `false` for the merge commit, it adds `-F allow_merge_commit=true`, so one method stays on. `-F` sends `true` and `false` as real yes-or-no values, where `-f` would send them as text; and Claude names the repository instead of gh's `{owner}/{repo}` placeholders ([docs/facts.md](../docs/facts.md), "GitHub: merge methods").
4. **you:** where `gh` is missing or refused, the repository's Settings, "General", the "Pull Requests" section: leave merge commits allowed, and switch off squash merging and rebase merging. In a company repository, ask its administrator.
5. **Claude:** writes the rule into your front door, in your words, and shows it before saving. A starting point: "Merge a pull request only with a merge commit (`gh pr merge <number> --merge`), never with a squash or a rebase. If a merge commit is truly impossible for one PR, ask me first, for that PR only, with the reason. When you create a repository for me on GitHub, switch squash and rebase merges off in its settings."
6. **Claude:** when [git-guardrails](git-guardrails.md) is in your setup, offers to add squash and rebase merges to its blocked patterns (FOLD), for example `pr merge.*--squash`, `pr merge.*--rebase`, `merge --squash` and `pull --squash`, and shows the change first. A pattern list catches only the forms written in it.
7. **Claude:** records the repositories, each one's settings before and after, and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** for each repository changed:
   ```bash
   gh api repos/<owner>/<repo> --jq '.allow_merge_commit, .allow_squash_merge, .allow_rebase_merge'
   ```
   Expected:
   ```text
   true
   false
   false
   ```
2. **Claude:** `grep -ciE 'squash|merge commit' <your front door>`. Expected: `1` or more.
3. **you:** in a new session, ask "How would you merge PR <number>?" Expected: Claude names `gh pr merge <number> --merge`, and no squash or rebase.

Any other output means the item is not done: the plan row stays unticked. A refused change in step 3 of Steps prints gh's error; read it first, and the web route in step 4 is the next thing to try.

## Undo

- **Claude:** on your yes, puts each repository's settings back to the values step 2 recorded, for example `gh api -X PATCH repos/<owner>/<repo> -F allow_squash_merge=true -F allow_rebase_merge=true`; or **you:** switch them back on the web.
- **Claude:** removes the rule from your front door, and the patterns it added to git-guardrails.
- **Claude:** marks the row in `adoption/decisions.md` as undone.
- Merges made in the meantime stay as they are; the settings change only how later PRs can land.

## Watch out

- **Your company's rule comes first.** If your company squashes by policy, follow it and record that as your decision; a setting in your own repositories does not touch theirs.
- **The setting covers the server only.** A squash made on your own machine and pushed is not stopped by it. The studio enforces the rule twice: by the setting, and by a local guard on Claude's commands ([a recorded yes before a merge](../examples/grant-before-merge.md)).
- **A pattern list cannot say "only with `--merge`".** The studio's guard also refuses a `gh pr merge` that names no method ([module 06](../modules/06-git-and-guardrails/README.md#the-mechanism)); blocking `--squash` and `--rebase` by pattern leaves that form open.
- **What `gh pr merge --squash` does on a repository with squash switched off** is not documented as of 2026-11-02 ([docs/facts.md](../docs/facts.md)). The setting is documented as preventing the method; Check step 1 is what confirms it is set.
- **A new repository has its own settings.** The rule's last sentence covers repositories Claude creates; one you create on the web needs step 3 or 4 as well.
- **The one exception.** When a merge commit is truly impossible for one PR, the studio switches the method on for that repository, for that one merge, after a recorded yes with the reason, and switches it off again right after ([a recorded yes before a merge](../examples/grant-before-merge.md)).
- **When to merge stays yours.** The setting decides how a PR lands, not when; put merging on your ask-first list ([the grant ledger](grant-ledger.md), [the working contract](identity-relationship.md)).
- **Token cost:** the rule costs about 78 tokens in every session, an estimate (bytes divided by 4). The settings cost nothing.
