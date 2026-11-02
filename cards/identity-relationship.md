---
id: identity-relationship
module: 07-identity-and-contract
checked: 2026-11-02
tokens:
  light: 113
  standard: 351
  full: 457
---

# RELATIONSHIP.md: what needs your OK

## Why

- **The problem:** with nothing written down, what Claude may do without asking changes from session to session. It asks permission for the obvious and skips asking for the risky: a deletion, a push, a message that leaves your machine.
- **The reason:** one short file, `identity/RELATIONSHIP.md`, the working contract: what Claude decides itself, what it asks you first, what it never does, and what it does when it is unsure or when something fails. Every session gets it before your first message, so the same acts wait for your yes every time.
- **The cost of skipping it:** risky acts happen on a guess. In the studio, 21 pull requests were merged with a squash, each branch folded into one commit, before a rule against it was written down; the story's own advice is to put merges on your "ask me first" list ([a recorded yes before a merge](../examples/grant-before-merge.md)).
- **The principle:** [hard stops for the irreversible, judgement for the rest](../PRINCIPLES.md#hard-stops-for-the-irreversible-judgement-for-the-rest). The file holds the short list of acts that wait for your yes, and leaves everything else to Claude's judgement, reported after.

## Detect

Read-only, at the root of your setup folder. Presence, sizes and counts; no file's content is printed or quoted.

- Whether the file exists: `ls identity/RELATIONSHIP.md 2>/dev/null`.
- How many lines still hold a template prompt (a `<...>` placeholder): `grep -cE '<(\.\.\.|[a-z][^>]*)>' identity/RELATIONSHIP.md 2>/dev/null`.
- Its size: `wc -c < identity/RELATIONSHIP.md`, reported as tokens (an estimate: bytes divided by 4).
- How it loads, counts only: imported, `grep -cE '^@identity/RELATIONSHIP\.md' CLAUDE.md AGENTS.md 2>/dev/null`; named in the front door, `grep -c 'identity/RELATIONSHIP.md' AGENTS.md CLAUDE.md 2>/dev/null`; printed by a start-up hook, `grep -c 'identity/RELATIONSHIP.md' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Whether the front door protects the identity files with a diff rule: `grep -ciE 'identity/.*diff|diff.*identity/' AGENTS.md CLAUDE.md 2>/dev/null`.
- Whether a contract already lives somewhere else. Claude reads your instruction files (`CLAUDE.md`, `AGENTS.md`, `CLAUDE.local.md`) and your user-level one, `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md`, if it exists, which discovery may do. It reports only "has a section about what needs your OK: yes or no", with the file's name, and never quotes the section.
- claude.ai: Claude Code cannot see your account, so Claude asks one yes or no question: "Do the instructions of one of your claude.ai Projects already list what needs your OK and what must never happen?"

The menu marks the item **have** when `identity/RELATIONSHIP.md` exists with no prompts left and loads in one of the three ways above; **partly** when it exists but prompts remain or nothing loads it, or when a section about what needs your OK lives in an instruction file or a Project instead; and **not yet** otherwise.

## Ask

This item is recommended for every kind of work (data, ml, software or general) and comes ticked on the menu. How the file loads is asked once for all four identity files, on the [USER.md card](identity-user.md), question 2; when you did not take USER.md, Claude asks that question here instead.

1. **"Size?"** What every session loads when the file is imported, measured on a sample file written for each size (bytes divided by 4, an estimate):
   - Light: the template's five lines (decide yourself, ask me first, never, when unsure, when something fails), each answered in a short phrase: about 113 tokens. Recommended for a first adoption, and whenever the problem you named is that Claude asks too much or too little.
   - Standard: a short page: who decides what, as a two-column table; how much initiative you want; how disagreement works; how mistakes are reported; and that a result is done only with the check that showed it: about 351 tokens. Recommended when you named that Claude argues too long or gives in too fast, or reports work as done before checking it.
   - Full: the standard page, plus a header (who owns the file, how often it may change, its approval, and what does not belong in it) and a closing note of what each line was drafted from: about 457 tokens. Recommended when someone else reads your contract too, such as a colleague who reviews your setup.
   - Not sure: the size recommended above for the problem you named: standard when you named that Claude argues too long, gives in too fast, or reports work as done before checking it; full when someone else reads your contract too; light otherwise. Claude offers to grow it after a week, from the corrections you gave twice.
   - Default when skipped: light.

## Needs

- Nothing beyond Claude Code.
- The [front door](front-door.md), which imports or names the file, and the loading answer from the [USER.md card](identity-user.md).
- Round 1 of the drill, recorded in `adoption/spec.md` (your profile and your data rules): Claude pre-fills from it.
- In claude.ai: a Project ([claude-ai-project](claude-ai-project.md)), whose instructions carry the "ask me first" and "never" lists.

## Steps

All three sizes take every step; they differ only in what step 2 writes.

1. **Claude:** runs `vet-and-adopt` for this item. It ships one blank text template, `templates/identity/RELATIONSHIP.md`, which `vet-and-adopt` scans like any shipped file; then it compares it with what Detect found and recommends ADAPT, the default for a practice, or FOLD when Detect found a contract section that you want to keep where it is.
2. **Claude:** pre-fills `identity/RELATIONSHIP.md` at the size you chose from round 1 of the drill and your data rules in `adoption/spec.md`. "Never" starts with your data rules, for example nothing that may not leave your company goes to a personal account or an outside service. "Ask me first" starts with deleting, pushing, sending, spending and anything that leaves your machine, plus each act your data rules restrict. "Decide yourself" starts from the work in your profile. Then it asks only what is missing, one question at a time: what Claude may decide alone, what it does when unsure, what it does when something fails. It writes only what you said; anything it inferred is marked "(inferred)". Nothing comes from the studio's files.
   - Light: the five template lines, one short phrase each.
   - Standard: a two-column table of what Claude decides and what you decide; how much initiative you want; how disagreement works (for example: state the concern once, with its evidence and its cost, recommend one way, then do what you decided); how a mistake is reported; and that "done" comes with the check that showed it.
   - Full: the standard page, plus a header comment (owner: you; changed only on a diff you approve, and how often; the date you approved it; its scope, and what does not belong in it) and a closing note saying what each line came from: an answer in the drill, a data rule, or something that happened, with its date.
3. **Claude:** when Detect found a section about what needs your OK in an instruction file, starts from that section instead of the blank template, and proposes moving it into `RELATIONSHIP.md` so it does not load twice: one diff for both files.
4. **you:** read the diff and approve it, or change whatever you would not sign. Claude saves only on your yes.
5. **Claude:** loads the file the way you chose on the USER.md card: it adds `RELATIONSHIP.md` to the import lines, to the front door's read line, or to the start-up hook's command, and adds the diff rule to the front door if it is not there yet: never edit anything in `identity/` without showing the diff first, and never change these files about itself. One diff.
6. **Claude:** for each "never" line that a check could enforce (a push to a protected branch, a commit that carries a secret), names the kit item that would enforce it, such as the [git hook templates](git-hooks.md) or [git-guardrails](git-guardrails.md). Taking one is its own plan row and its own yes.
7. **you:** in claude.ai, paste the "ask me first" and "never" lists into the Project's instructions ([claude-ai-project](claude-ai-project.md)).
8. **you:** after a week of sessions, tell Claude what it asked about needlessly, or did without asking, twice. **Claude** proposes the lines as a diff and saves on your yes. From then on, every change to `identity/` is a diff you approve, never an edit Claude makes on its own.
9. **Claude:** records the decision, the scope (the `identity/` folder of your setup), the size, how it loads and the undo in `adoption/decisions.md`.

## Check

1. **you:** start a fresh session in your setup folder (a new terminal, or `/clear` in the open one) and ask as the first message: "Who am I, and what always needs my OK?" Expected: Claude answers the second half with your "ask me first" list from `RELATIONSHIP.md` and names the file; the first half comes from `USER.md` when you took it.
2. **you:** have Claude create an empty file, `scratch.txt`, then ask it to delete the file. Expected, when deleting is on your "ask me first" list: Claude asks before it deletes, and waits. (Pick another harmless act from your list if deleting is not on it.)
3. **you:** say "Add a line to `identity/RELATIONSHIP.md`: ask me before installing anything." Expected: Claude shows the diff and waits for your yes before saving.

If step 1 gets a generic answer, step 2 acts without asking, or step 3 saves without a diff, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** removes the `RELATIONSHIP.md` line from the front door (the import or the name), or the file from the hook's command, with the diff shown. When it is the last identity file, it also removes the hook entry and the diff rule.
- **Claude:** if step 3 moved a section out of an instruction file, puts it back on your yes, with the diff shown.
- **you:** the file is your writing; Claude deletes `identity/RELATIONSHIP.md` only on your yes.
- **you:** in claude.ai, take the two lists out of the Project's instructions.

## Watch out

- **Every session pays for it.** About 113 (light), 351 (standard) or 457 (full) tokens when imported or printed by the hook, and nothing when it is read only when needed; all estimates, bytes divided by 4 of sample files written for these cards. Yours will differ: measure with `wc -c`.
- **Prose is forgotten.** In the studio, a prose rule was broken twice in one day by the same agent that wrote it. A stop that must never break belongs in a hook or a test as well ([module 06](../modules/06-git-and-guardrails/README.md)); that is what step 6 is for.
- **Keep the "ask me first" list short.** Asking about everything trains you to say yes without reading; the list is for what cannot be undone.
- **One yes covers one act.** A yes to "clean up" is not a yes to a deletion you did not name. If you want each yes written down before the act, take the [grant ledger](grant-ledger.md).
- **Your company's rules come first.** Where they say what may be pushed, sent or stored, they win over this file; when you do not know them, the drill assumes the strictest reading, and so does the pre-fill.
- **No self-edits.** Claude never rewrites this file about itself; a change is a diff you approve.
- **claude.ai's memory is not the contract.** It builds itself from your chats ([docs/facts.md](../docs/facts.md), "claude.ai: memory and past chats"); keep the lists in the Project's instructions, which you wrote and review.
