---
id: grant-ledger
module: 06-git-and-guardrails
checked: 2026-11-02
tokens:
  light: 47
  standard: 101
  full: 111
---

# The grant ledger for risky acts

## Why

- **The problem:** an agent that can run git can lose work in one step: a force-push (which overwrites a branch on the server and drops the commits that were there), a history rewrite, a merge, a tag, or a commit that skips the git hooks. A yes given in chat is loose. "Go ahead" or "clean up" can be read to cover acts you never named, and the next session has no record of what you allowed.
- **The reason:** a ledger is one file of dated rows. Each risky act gets its own row, written before the act, naming its target and quoting your yes. Claude acts only on a row it has shown you, and one row never covers a second act.
- **The cost of skipping it:** a yes that is not tied to one act covers more than you meant. In the studio, the check in front of risky acts accepted any yes of the same kind dated today or yesterday and never read what it was for, so one recorded yes for a merge could have let every other merge through for up to 48 hours ([a recorded yes before a merge](../examples/grant-before-merge.md)).
- **The principle:** [hard stops for the irreversible, judgement for the rest](../PRINCIPLES.md#hard-stops-for-the-irreversible-judgement-for-the-rest). The ledger keeps the short list of hard stops to one yes per act, written down where the next session can read it.

## Detect

Read-only. Counts and yes/no answers only; the words inside a row are never printed.

- Whether a ledger exists in your setup: `find "<your setup>" -maxdepth 4 -name grants.md | wc -l`.
- If one exists, whether it has the header row, and how many rows it holds, counts only:
  - `grep -c '^| Date | Act | Target | Your words | Reference |' <the file>`;
  - `grep -c '^| [0-9]' <the file>`.
- Whether your contract names the risky acts, a count per file: `grep -ciwE 'force-push|no-verify|merge|tag|rewrite' CLAUDE.md AGENTS.md identity/RELATIONSHIP.md 2>/dev/null` in your setup (a file that does not exist is skipped).
- Whether an instruction file tells Claude to write a row before the act: `grep -c 'grants.md' CLAUDE.md AGENTS.md identity/RELATIONSHIP.md 2>/dev/null`.

The menu marks the item **have** when a ledger with the header row exists and an instruction file tells Claude to write a row before the act, or, when `adoption/decisions.md` records the light size for this item, when your contract names the risky acts; **partly** when only one of the two exists, or when your contract names the risky acts but nothing is recorded; and **not yet** otherwise.

## Ask

1. **"Size?"** Each estimate is what the size adds to files that load every session, from sample lines written for this card, bytes divided by 4. The ledger file itself loads nothing.
   - Light: the yes-list only, in your `RELATIONSHIP.md` ([its card](identity-relationship.md)): Claude asks before each act, and nothing is written down. About 47 tokens (estimate). Recommended when Detect finds no yes-list: a first adoption leans light, and module 06 says you need no ledger to start.
   - Standard: light, plus the ledger, one row per act written before it, and the rule in your front door that says so. About 101 tokens (estimate). Recommended when your contract already names the risky acts (Detect says **partly**) and Claude works in repositories with a remote, where a merge or a force-push reaches other people.
   - Full: standard, with each row committed and pushed before its act, so every session and machine sees it first. About 111 tokens (estimate). Recommended when your setup folder is a repository with a remote that more than one machine or session works from.
   - Not sure: the size recommended above for what Detect found: light when it finds no yes-list; standard when your contract already names the risky acts and Claude works in repositories with a remote; full when your setup folder is a repository with a remote that more than one machine or session works from.
   - Default when skipped: light.
2. **"How should your yes for a risky act be kept?"** Recommended when your work is software, ML or data.
   - Keep what you have. Recommended when Detect says **have**.
   - At the size above. Recommended when Detect says **partly** or **not yet**.
   - Neither.
   - Not sure: the option recommended above for what Detect found: keep what you have at **have**; otherwise at the size above.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
3. **"Where does the ledger live?"** (only at standard or full)
   - In your setup folder, one file for all your work. Recommended when your setup is a folder of its own.
   - Inside one work repository, for that repository's acts only. Recommended only when your setup is that repository and your company allows such a file in it.
   - Not sure: your setup folder, the option recommended above, which keeps the file out of every work repository.
   - Default when skipped: your setup folder.

## Needs

- Nothing beyond Claude Code and a text file in your setup.
- Git, only if your setup folder is a repository you push (START-HERE, "Prepare").

## Steps

Which steps each size takes: **light** 1 and 5; **standard** 1 to 3 and 5; **full** every step.

1. **Claude:** makes sure your `RELATIONSHIP.md` has the yes-list: force-push, history rewrite (a rebase, an amend or a `reset --hard`), merge, tag, `--no-verify` (the flag that skips the git hooks) and deleting branches, plus one line: "name the exact branches and paths when you ask." It shows the lines in your words before saving. At light, this is the last step before the record.
2. **Claude:** creates `grants.md` in the place you chose, with this header. Rename anything you like; the Check below looks for the table's header row.

   ```markdown
   # Grants

   One row for each risky act: a force-push, a history rewrite, a merge, a tag, or a commit that skips the hooks.
   Claude writes the row before the act, never after. A row covers one act on one target, and nothing else.

   | Date | Act | Target | Your words | Reference |
   |---|---|---|---|---|
   ```

   One row per act, in this format (a made-up example):

   ```markdown
   | 2026-11-02 | merge | <repo>, pull request 12 | "Merge 12 with a merge commit." | <link to the pull request> |
   ```

   - **Date:** the day of the act.
   - **Act:** one of the five kinds above.
   - **Target:** what it touches, named first: the repository, then the branch, tag or pull request.
   - **Your words:** your yes, word for word.
   - **Reference:** a link or a short note that leads back to the context.
3. **Claude:** adds the rule to your front door (`AGENTS.md`, or `CLAUDE.md` if that is your only one), in your words, and shows it before saving. A starting point: "Before a force-push, a history rewrite, a merge, a tag or `--no-verify`, ask me for that act on that target, write its row in `grants.md` with my words, show me the row, then act. A row never covers a second act."
4. **Claude:** (full) adds to the rule, in your words: commit and push the row before the act, so that every session and machine sees it first. It needs a setup folder that is a repository with a remote; without one, saving the file is enough, and standard is the size that fits.
5. **Claude:** records the decision, the size, where the ledger lives (or "yes-list only") and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** `grep -c '^| Date | Act | Target | Your words | Reference |' "<your setup>/grants.md"`. Expected: `1`.
2. **you:** in a new session, in a throwaway repository in a temporary folder with one commit, say "This is a check of the ledger: tag this commit v0.0.1." Expected: Claude asks for your yes for that tag in that repository, and after your yes shows the new row, its Reference noting the check, before it creates the tag; at full, it also commits and pushes the row first. Then say "Tag it v0.0.2 as well." Expected: Claude asks again, because the first row covered one tag. Delete the throwaway folder afterwards; the check rows stay in the ledger as a record of the check.

If Claude tags before the row exists, or treats the first yes as cover for the second tag, the item is not done: the plan row stays unticked, and the wording of the rule in your front door is the next thing to look at. At light, check 1 does not apply, and check 2 runs without the rows: Claude asks before each tag.

## Undo

- **Claude:** removes the rule it added to your front door.
- **Claude:** removes the yes-list lines it added to `RELATIONSHIP.md`, only if you no longer want them; they belong to [RELATIONSHIP.md](identity-relationship.md) as well.
- **you:** keep or delete `grants.md`. Its rows are your record of what you allowed; moving it to an archive folder keeps that record. Deleting it is your decision.

## Watch out

- **A ledger is a record, not a lock.** Nothing stops an act that has no row unless a check reads the ledger. The studio has such a guard; the kit does not ship one. The floor you can take is [git-guardrails](git-guardrails.md), which blocks a force-push and other destructive commands before they run, and [the git hook templates](git-hooks.md), which `git commit --no-verify` skips ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees"); that is why the skip is on the list.
- **A row names its target, or it covers too much.** "Merge, today" reads as a yes to every merge. An audit found that the studio's own check could have let one row cover every act of its kind for up to two days; the fix was one row per act with the target first, and a check that reads the target ([a recorded yes before a merge](../examples/grant-before-merge.md)).
- **"Clean up" is not a yes to delete.** A vague ask never covers a branch or a path it did not name; Claude asks for the exact list and a yes to that list.
- **Your company's rules come first.** If your company squashes by policy, or a reviewer must approve every merge, follow that and record it as your decision; a row records your yes, not your company's approval.
- **Your words are quoted as they are,** so keep secrets out of them: no token, password or company detail in a row. The Reference is a link or a short note.
- **Token cost:** the ledger itself loads nothing. Sample lines written for this card measure: the yes-list in `RELATIONSHIP.md` about 47 tokens in every session (light), the rule in your front door about 54 more (standard, about 101 in all), and the clause to push each row about 10 more (full, about 111). All are estimates (bytes divided by 4), and your own wording changes them.
