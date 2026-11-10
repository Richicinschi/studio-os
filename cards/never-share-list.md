---
id: never-share-list
module: 06-git-and-guardrails
checked: 2026-11-02
---

# A never-share list

## Why

- **The problem:** a client's name, an employer's internal project name or a person's name ends up in a commit, a PR description or a public post, and once committed it stays in history ([module 06, The problem](../modules/06-git-and-guardrails/README.md#the-problem)). A secret scanner looks for the shapes of keys and tokens; it cannot know which names are yours to keep private.
- **The reason:** a private list on your machine, one term per line, read by the pre-commit check of the [git hook templates](git-hooks.md), a script git runs before each commit: a staged line that holds a term, as a whole word in any case, stops the commit. The refusal names the line of the list, never the term, so the refusal itself never repeats it. A line in your front door asks Claude to check the same list before anything leaves your machine.
- **The cost of skipping it:** a line deleted after it was committed is still in every commit before. In a studio repository, two real addresses removed from a comment were still in 51 commits, and the only way out was rewriting the whole history ([a real address in history](../examples/real-address-in-history.md)). A private name on the wrong side of a push costs the same.
- **The principle:** [checks for rules that must never break, prose for judgement](../PRINCIPLES.md#checks-for-rules-that-must-never-break-prose-for-judgement). "Never commit a client's name" becomes a check that refuses, not a sentence to remember.

## Detect

Read-only. Presence, counts, and set or not set; the list's terms are never printed.

- The hook template in your setup, and whether that copy reads a list: `<your setup>/git-hooks/check-staged.mjs`, present or not, and `grep -c never-share "<your setup>/git-hooks/check-staged.mjs"` (`0` means a copy from before the list existed).
- The list: `<your setup>/git-hooks/never-share.local.txt`, present or not, and how many terms it holds, as a count: `grep -cvE '^[[:space:]]*(#|$)' "<your setup>/git-hooks/never-share.local.txt"`.
- Kept out of git, when your setup folder is a git repository: `git -C "<your setup>" check-ignore -q git-hooks/never-share.local.txt && echo ignored || echo "not ignored"`; and whether it was ever committed: `git -C "<your setup>" log --oneline -- git-hooks/never-share.local.txt | wc -l` (`0` is right).
- The repositories that run the hooks: as in the [git hook templates](git-hooks.md) card's Detect.
- Whether your front door asks Claude to check the list: `grep -c never-share CLAUDE.md AGENTS.md 2>/dev/null`.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when the list holds at least one term, is ignored and was never committed, the hook copy reads it and runs in at least one repository, and your front door carries the check; **partly** when only some of these hold; and **not yet** otherwise.

## Ask

1. **"Keep a never-share list?"**
   - Yes, for commits and for anything Claude sends out: the hook stops a commit that holds a term, and Claude checks the list before it publishes or sends. Recommended when Detect finds the hook template in your setup, and for the `software`, `ml` and `data` profiles, whose work for clients or an employer, and whose data about people, carry names that must stay private. Also recommended when Detect says **have**: nothing changes then.
   - Yes, for commits only: the hook checks, and Claude never reads the list. Recommended when you would rather the terms never pass through a session (Watch out).
   - Yes, for what Claude sends out only, with no hook. Recommended when you do not use the git hook templates.
   - No.
   - Not sure: the option recommended above for what Detect found: for commits and for what Claude sends out when the hook template is in your setup, or at **have**; for what Claude sends out only when you do not use the git hook templates. The list starts with comment lines only, kept out of git, and refuses nothing until you add terms.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.

   The item is optional for the `general` profile.

## Needs

- For the commit check: the [git hook templates](git-hooks.md) in your setup, with Node.js on the PATH. [Tools some items need](../docs/install-reference.md#tools-some-items-need) installs Node.js 22:
  - Windows: `! winget install --id OpenJS.NodeJS.22 -e`;
  - macOS and Linux: through nvm, the three lines in [docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux";
  - then `! node --version`.
- A text editor, in which you type the terms yourself.
- Nothing else beyond Claude Code.

## Steps

1. **Claude:** runs `vet-and-adopt` on `templates/git-hooks/check-staged.mjs`: a SkillSpector scan, triage, and a recommendation against what Detect found. When your copy predates the list (Detect printed `0`), it shows you the difference and, on your yes, brings the list check into your copy, keeping your own changes, such as your test-folder patterns.
2. **Claude:** when your setup folder is a git repository, adds the line `never-share.local.txt` to its `.gitignore`, shows it first, and confirms it with `git -C "<your setup>" check-ignore -q git-hooks/never-share.local.txt`.
3. **Claude:** creates `<your setup>/git-hooks/never-share.local.txt` with comment lines only, in your words: one term per line; `#` starts a comment; a term matches as a whole word, in any case; and the kinds of terms that belong there (people who are not public authors, clients and employers, internal project names, personal identifiers such as an email address). It shows the file before saving.
4. **you:** open the file in your editor and type the terms, one per line. Claude does not ask you to say them in the chat. Prefer distinctive terms: a full name rather than a first name that is also a common word, which would stop ordinary commits.
5. **Claude:** for the routes where Claude checks the list, writes the check into your front door, in your words, and shows it before saving. A starting point: "Before you publish, post, upload, push to a public place or send anything outside this machine, check it against `git-hooks/never-share.local.txt` in my setup folder. On a match, stop and tell me the line number in the list, never the term."
6. **Claude:** records the decision, where the list lives (never its terms, nor how many there are) and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** when your setup folder is a git repository, `git -C "<your setup>" check-ignore -q git-hooks/never-share.local.txt && echo ignored`. Expected: `ignored`.
2. **you:** add a made-up word as the last line of the list, such as `nevershare-canary-7`; it can stay there as a permanent canary. **Claude:** makes a throwaway repository in a temporary folder and gives you the line that points its `core.hooksPath` (the git setting that says where the hooks are) at your hooks folder; **you** run it in a terminal of your own, as [git hooks](git-hooks.md) step 7 does and says why. **Claude:** stages a file `notes.txt` holding `NeverShare-Canary-7` (the canary in another case) and tries a commit. Expected:
   ```text
   pre-commit refused this commit:
   - notes.txt: a term from your never-share list (line <n> of the list)
   ```
   where `<n>` is the canary's line, counting comment lines too, as your editor does. Without gitleaks (the secret scanner the hook calls), a line saying the secret scan was skipped comes first. Then it stages a file holding `nevershare-canary-77`, the canary inside a longer word, and that commit goes through: whole words only. It deletes the throwaway folder.
3. **you:** for the routes where Claude checks the list, in a new session say "I want to post this on a public forum: the nevershare-canary-7 results are in." Expected: Claude stops, names the canary's line number in the list, and does not repeat the word.

If step 1 prints nothing, the first commit in step 2 goes through, or Claude repeats the word in step 3, the item is not done: the plan row stays unticked, and that step's output is the next thing to look at. If the second commit in step 2 fails with a signing error, git cannot commit in a throwaway repository at all; see [signed commits](signed-commits.md).

## Undo

- **Claude:** on your yes, deletes `<your setup>/git-hooks/never-share.local.txt`; without it, the hook skips the list and runs its other checks as before.
- **Claude:** removes the `.gitignore` line it added, once the list is gone.
- **Claude:** removes the check from your front door.
- **Claude:** marks the row in `adoption/decisions.md` as undone.
- The list check in `check-staged.mjs` can stay: with no list beside it, it does nothing.

## Watch out

- **The list is the most sensitive file in your setup.** Committed once, it publishes every term at the same moment. Step 2 and Check step 1 are there for that; if Detect ever finds it in history, treat it as a leak and stop.
- **It reads the lines a commit adds, and nothing else.** File names, the commit message and binary files (images, PDFs, office documents) are not read, and lines already in history stay there. Search a repository's whole history before its first push ([a real address in history](../examples/real-address-in-history.md)).
- **Whole words only.** A term inside a longer word passes, so add each form you need: a plural, a short form, the name written together and apart.
- **A floor, not a wall.** `git commit --no-verify` skips the hook ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees"), and a teammate's machine has no copy of your list ([git hook templates](git-hooks.md)).
- **Claude reads the list when it checks.** Its terms then pass through the session like any file Claude reads. If that matters to you, take the commits-only route: the hook's refusals print line numbers only.
- **Your own setup files count too.** A row that names a client's project, in your [project registry](project-registry.md) or your notes, is refused like any other commit; name the project neutrally there.
- **The studio's own export** to this kit runs the same idea as a gate before anything is published: a local list kept out of git, whose findings give the position in the list and never the term. That gate also reads file names, which this hook does not.
- **Token cost:** the front-door check costs about 61 tokens in every session, an estimate (bytes divided by 4). The list loads only when Claude reads it; the hook runs inside git, outside Claude's context.
