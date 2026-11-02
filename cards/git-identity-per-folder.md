---
id: git-identity-per-folder
module: 06-git-and-guardrails
checked: 2026-11-02
---

# One git identity per folder

## Why

- **The problem:** git writes the name and email from your settings into every commit. With one address for everything, company work goes out under your personal address, or your own work under the company's, and once a commit is pushed it keeps that address.
- **The reason:** git can include a second config file for every repository under a folder (`includeIf "gitdir:<folder>/"`, a conditional include). Put the company name and address in that file, and every repository in the company folder, new ones included, commits with them, while the rest keep your usual address. The address follows the folder, not your memory or Claude's.
- **The cost of skipping it:** commits under the wrong address stay in history under that address; changing them means rewriting history, which this card does not do. The kit has no story of it; the facts are in [docs/facts.md](../docs/facts.md), "Git: signed commits and identity per folder".
- **The principle:** [checks for rules that must never break, prose for judgement](../PRINCIPLES.md#checks-for-rules-that-must-never-break-prose-for-judgement). "Use the company address for company work" stops being a sentence to remember and becomes a setting git applies every time.

## Detect

Read-only. These commands never print an email address (one prints the part after the `@`, and no more); they use no network.

- Your global address, as one word only:
  - `git config --global --get user.email >/dev/null && echo set || echo unset`;
  - when set, `git config --global --get user.email | sed 's/.*@//'` prints the part after the `@` only. Claude writes it down as `company` when it is your company's domain (from your spec, or it asks you), or `personal` for any other, and keeps the domain itself out of every file.
- Whether conditional includes exist in your user config, yes or no: `git config --global --name-only --get-regexp '^[Ii]nclude[Ii]f\.' >/dev/null && echo yes || echo no`. It prints nothing else, since the setting names carry folder paths.
- For each repository in `adoption/inventory.md`, whether the address it commits with matches what its folder is meant for, yes or no: `git -C <repo> config --get user.email | grep -qi '@<domain>$' && echo yes || echo no`, where `<domain>` is your company's domain for a company folder and your personal one elsewhere. When nobody has said yet which folders hold company work, the repositories are marked "not checked".

The menu marks the item **have** when conditional includes exist and every repository answers yes; **partly** when includes exist but a repository answers no or is not checked, or when there are no includes but every repository answers yes; and **not yet** when there are no includes and a repository answers no.

## Ask

1. **"Which folders hold company work?"** Recommended when your work is software, ML or data.
   - Name the folders, one or more. Each gets its own include and the address it should use. Recommended when Detect finds a repository that answers no, or a company remote host in the inventory.
   - None: all my work here is of one kind, so one address is right. Recommended when every repository answers yes and they all hold the same kind of work.
   - Keep what you have. Recommended when Detect says **have**.
   - Not sure: the option recommended above for what Detect found. When that is naming folders, Claude proposes them from your inventory, the folders whose repositories use your company's remote host (the host only, never the full address), and you confirm the list before anything is set.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.

## Needs

- Git, from START-HERE's "Prepare":
  - Windows: `! winget install --id Git.Git -e --source winget`;
  - macOS: `! xcode-select --install`;
  - Debian or Ubuntu: `! sudo apt install git`.
- The minimum git version for conditional includes: not documented in docs/facts.md as of 2026-11-02. The Windows run recorded there used git 2.54.0.
- Nothing else beyond Claude Code.

## Steps

1. **you:** tell Claude the name and address each folder should use: `<your name>` and `<your company email>`. Claude never searches your files for them. The include goes on the side that differs from your global address: when your global address is personal, the company folders get it; when it is the company's, your personal folders do, and you name those instead. When no global address is set, each kind of folder gets its own include and its own file.
2. **Claude:** shows both files as they will read, before saving anything.
   - The new per-folder file, outside every repository so the address is never committed, for example `~/.config/git/company.gitconfig`:

     ```ini
     [user]
         name = <your name>
         email = <your company email>
     ```

   - The block added to your user git config, one for each folder:

     ```ini
     [includeIf "gitdir:<full path to the folder>/"]
         path = <full path to the per-folder file>
     ```

     The trailing `/` makes it match the folder and everything inside it. On Windows, both paths take forward slashes, with the drive letter, like `<drive>:/<folder>/`. Write `gitdir/i:` in place of `gitdir:` to match without regard to case.
3. **Claude:** on your yes, writes the per-folder file, and adds the block with `git config --global "includeIf.gitdir:<full path to the folder>/.path" "<full path to the per-folder file>"`, so it never opens your user config, which can hold other settings.
4. **Claude:** records the folders, the scope (your user config), and the undo in `adoption/decisions.md`. It never records an address.

## Check

1. **you:** `! git -C <a company repository> config user.email` and `! git -C <your setup repository> config user.email`. Expected: two different addresses, the company one first.

If the company repository still shows your other address, the include did not match: look at the folder's path, its trailing `/`, forward slashes on Windows, and the case of the letters (`gitdir/i`). Until the two differ, the item is not done, and the plan row stays unticked.

## Undo

- **Claude:** removes each block from your user config: `git config --global --unset "includeIf.gitdir:<full path to the folder>/.path"` (newer git also accepts `git config unset`).
- **Claude:** deletes the per-folder file.
- Commits already made keep the address they were made with.

## Watch out

- **Old commits stay as they are.** Commits already made under the wrong address keep it. Rewriting history to change them is out of scope here; it is one of the acts that wait for your explicit yes ([the grant ledger](grant-ledger.md)).
- **Windows wants forward slashes.** The `gitdir` path uses forward slashes. The docs say nothing about drive letters; in the Windows run recorded in [docs/facts.md](../docs/facts.md), a pattern with a drive letter and forward slashes worked.
- **Case can break the match.** `gitdir/i` matches without regard to case; on Windows it matched a drive letter typed in lower case.
- **Only repositories under the folder are covered.** A company clone somewhere else, such as your downloads folder, keeps your global address; move it under the folder, or add that folder too.
- **Your company may set the identity itself,** with its own name format or a managed setting. Ask before you override it. Where it expects its own identity for signing too, the same per-folder file is the place for that folder's signing settings ([signed commits](signed-commits.md)).
- **Token cost:** none. This is git's configuration; nothing loads into a Claude session.
