---
id: commit-and-pr-writing
module: 06-git-and-guardrails
checked: 2026-11-02
---

# Commit messages and PR bodies that say why

## Why

- **The problem:** a commit message that repeats the diff ("update parser") tells a later reader nothing the diff does not, and the reason for the change, which was in the conversation, is gone when the session ends. A pull request (PR) body that says "tests pass" gives the reviewer nothing to check, and what was left undone is forgotten. Once committed, a message stays in history with the change it describes ([module 06, The problem](../modules/06-git-and-guardrails/README.md#the-problem)).
- **The reason:** the message keeps the why beside the change, where `git log` shows it to whoever reads the code next, a future session that never saw this conversation included. A PR body in three parts, what changed, what was verified (the command and its counts) and what was left undone on purpose, lets the reviewer check each claim instead of trusting it.
- **The cost of skipping it:** the kit has no story of a bad message. What skipping means: a history where every line says what and none says why, and PRs that say "done" with nothing to check. In the studio's [green run](../examples/green-run-that-would-have-deleted.md), every check passed while the output had deleted about 190 pages: a body saying only "all checks pass" would have been true, and the count of files changed would have shown the problem.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). A PR body that names what was verified, and what was not, is the report that principle asks for.

## Detect

Read-only. Counts only; no commit message is printed.

- Whether your instruction files carry a rule, a count per file: `grep -ciE 'commit message|PR bod|pull request bod' CLAUDE.md AGENTS.md 2>/dev/null`.
- For each repository in `adoption/inventory.md`, among its last 50 commits:
  - how many first lines start with a type prefix such as `fix:` or `feat(scope):`: `git -C <repo> log -50 --format=%s | grep -cE '^[a-z]+(\([^)]*\))?!?: '`;
  - how many have a body under the first line: `git -C <repo> log -50 --format='%x1e%b' | awk 'BEGIN{RS="\036"} NF{n++} END{print n+0}'`.
- Whether each repository has a remote host, from the inventory: PRs need one.
- Your company's or team's convention, if there is one: **you** say so; Claude cannot see it.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when an instruction file covers both commit messages and PR bodies; **partly** when it covers one of the two, or most recent commits carry a body but no rule asks for one; and **not yet** otherwise.

## Ask

1. **"A rule for commit messages and PR bodies?"**
   - Both: messages say why; PR bodies say what changed, what was verified and what was left undone. Recommended when the inventory shows a remote host, and for the `software`, `ml` and `data` profiles.
   - Commit messages only. Recommended when your repositories have no remote, and so no PRs.
   - FOLD into your team's convention: Claude adds only what it lacks. Recommended when your team has one, or Detect finds a rule already.
   - No.
   - Not sure: the option recommended above for what Detect found: FOLD when your team has a convention or Detect finds a rule; otherwise both when the inventory shows a remote host, and commit messages only when it shows none.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.

   The item is optional for the `general` profile.
2. **"A type prefix on the first line?"** (such as `fix(parser):`, the style called Conventional Commits, which the studio uses)
   - Yes, with your own list of types. Recommended when Detect counts a prefix on most of the last 50 first lines.
   - No prefix. Recommended when Detect counts few or none.
   - Your team's format. Recommended when your team has one.
   - Not sure: the option recommended above, repository by repository: your team's format where it has one; otherwise a prefix where Detect counts one on most of the last 50 first lines, and none where it counts few.
   - Default when skipped: follow each repository.

## Needs

- Nothing beyond Claude Code and git.
- The prefix style's full specification is not in docs/facts.md as of 2026-11-02; this card uses only its first-line prefix.

## Steps

1. **Claude:** runs `vet-and-adopt`'s comparison step. A practice with no files has nothing to scan; it compares with your front door and your team's convention, and recommends FOLD or ADAPT.
2. **Claude:** writes the rule into your front door, in your words, and shows it before saving. A starting point: "Commit messages: the first line says what changed, in a few words; the body says why, which the diff cannot show. Never restate the diff. PR bodies have three parts: what changed; what was verified, with the command and its counts; what was left undone on purpose, and why." For the `data` and `ml` profiles, "verified" names the numbers: rows before and after, a total that matches its source, a query whose answer you already know ([module 03](../modules/03-planning/README.md#apply-it-in-claude-code)).
3. **Claude:** with a prefix, adds one line with your types, for example "Start the first line with a type and a scope, such as `fix(parser):` or `docs(readme):`."
4. **Claude:** records the decision, the prefix choice and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -ciE 'commit message|PR bod' <your front door>`. Expected: `1` or more.
2. **Claude**, in front of you: in a throwaway repository in a temporary folder, it makes one small change (a function and its test), runs the test, and writes the commit message and the PR body it would use. Then it goes through them line by line, saying for each line which part of the rule it meets: the why, what changed, what was verified (with the command and its counts), what was left undone. A line that restates the diff, or a "tests pass" without the command and its counts, it marks as failing. Then it deletes the throwaway folder.
3. **you:** read the judgement, line by line, and say whether you agree.

A failing line Claude did not mark, or a judgement you disagree with, means the item is not done: the plan row stays unticked, and the wording of the rule is the next thing to look at.

## Undo

- **Claude:** removes the rule, and the prefix line, from your front door.
- **Claude:** marks the row in `adoption/decisions.md` as undone.
- Messages already written stay as they are; no history is rewritten.

## Watch out

- **Your team's convention comes first.** A company template for PR bodies, or a ticket number required in the first line, wins over this rule; fold the three parts into it.
- **The why lives in the conversation.** Write the message before the session ends; afterwards nobody has the reason, Claude included.
- **Messages are not checked for private names.** The pre-commit check reads the lines a commit adds, not its message, and the message hook looks only for attribution trailers ([never-share list](never-share-list.md), [git hook templates](git-hooks.md)). A client's name in a message or a PR body is caught only by Claude's own check before it sends.
- **Attribution trailers.** The studio's commits carry only their author, and its message hook refuses a trailer that names a tool or a second author; your company may want AI-assisted commits marked instead ([git hook templates](git-hooks.md)).
- **Signing is a separate item.** The studio signs every commit; that is the [signed commits](signed-commits.md) card.
- **One PR, one piece of work.** A body is easier to keep true when the PR does one thing; the studio keeps one feature to a branch and a PR, even working alone ([worktrees](worktrees.md)).
- **Token cost:** the rule costs about 69 tokens in every session, and the prefix line about 23 more, estimates (bytes divided by 4).
