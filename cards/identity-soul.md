---
id: identity-soul
module: 07-identity-and-contract
checked: 2026-11-02
tokens:
  light: 68
  standard: 276
  full: 356
---

# SOUL.md: the values Claude works by

## Why

- **The problem:** rules cover the cases you foresaw. For the rest, Claude falls back on its defaults, which can favour sounding helpful over being right: a smooth answer that hides what was not checked, or agreement that costs nothing.
- **The reason:** one short, optional file, `identity/SOUL.md`, with a few values the work is judged by: what you value, what a good result looks like, and what Claude must never pretend. Values, not a personality. Every session gets it before your first message, so the cases no rule names are judged the same way each time.
- **The cost of skipping it:** for most setups, little: `USER.md`, `STYLE.md` and `RELATIONSHIP.md` carry the day-to-day. The studio's evidence is about its own identity file: each session rebuilds the collaborator from what is written, and an agent that rewrites that file about itself, unreviewed, drifts toward self-flattery ([module 07, Evidence](../modules/07-identity-and-contract/README.md#evidence)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The values most worth writing down are the ones about evidence: nothing is called done until it has been checked, and the report says what was not.

## Detect

Read-only, at the root of your setup folder. Presence, sizes and counts; no file's content is printed or quoted.

- Whether the file exists: `ls identity/SOUL.md 2>/dev/null`.
- How many lines still hold a template prompt (a `<...>` placeholder): `grep -cE '<(\.\.\.|[a-z][^>]*)>' identity/SOUL.md 2>/dev/null`.
- Its size: `wc -c < identity/SOUL.md`, reported as tokens (an estimate: bytes divided by 4).
- How it loads, counts only: imported, `grep -cE '^@identity/SOUL\.md' CLAUDE.md AGENTS.md 2>/dev/null`; named in the front door, `grep -c 'identity/SOUL.md' AGENTS.md CLAUDE.md 2>/dev/null`; printed by a start-up hook, `grep -c 'identity/SOUL.md' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Whether stated values already live somewhere else. Claude reads your instruction files (`CLAUDE.md`, `AGENTS.md`, `CLAUDE.local.md`) and your user-level one, `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md`, if it exists, which discovery may do. It reports only "has a section of values: yes or no", with the file's name, and never quotes the section.
- claude.ai: Claude Code cannot see your account, so Claude asks one yes or no question: "Do the instructions of one of your claude.ai Projects already state values for Claude to work by?"

The menu marks the item **have** when `identity/SOUL.md` exists with no prompts left and loads in one of the three ways above; **partly** when it exists but prompts remain or nothing loads it, or when a section of values lives in an instruction file or a Project instead; and **not yet** otherwise.

## Ask

This item is optional for every kind of work (data, ml, software or general), and most setups do without it; it comes unticked. Tick it when you want values written down, not only rules. How the file loads is asked once for all four identity files, on the [USER.md card](identity-user.md), question 2; when you did not take USER.md, Claude asks that question here instead.

1. **"Size?"** What every session loads when the file is imported, measured on a sample file written for each size (bytes divided by 4, an estimate):
   - Light: the template's three lines (values, what a good result looks like, what it must never pretend), each answered in a short phrase: about 68 tokens. Recommended for a first adoption.
   - Standard: a short page: a few lines under each of the three, plus what Claude refuses to become (for example, a yes-machine): about 276 tokens. Recommended when a habit you named comes from a value rather than a rule, such as a smooth answer that hid what was not checked.
   - Full: the standard page, plus a header (who owns the file, how often it may change, its approval, and what does not belong in it) and a closing note of what it was drafted from: about 356 tokens. Recommended when the same file serves several setups or Projects.
   - Not sure: the size recommended above for the problem you named: standard when a habit you named comes from a value rather than a rule; full when the same file serves several setups or Projects; light otherwise. Claude offers to grow it after a week.
   - Default when skipped: light.

## Needs

- Nothing beyond Claude Code.
- The [front door](front-door.md), which imports or names the file, and the loading answer from the [USER.md card](identity-user.md).
- In claude.ai: a Project ([claude-ai-project](claude-ai-project.md)); the kit's Project template has no line for values, so they go into its knowledge, or one line into its instructions.

## Steps

All three sizes take every step; they differ only in what step 2 writes.

1. **Claude:** runs `vet-and-adopt` for this item. It ships one blank text template, `templates/identity/SOUL.md`, which `vet-and-adopt` scans like any shipped file; then it compares it with what Detect found and recommends ADAPT, the default for a practice, or FOLD when Detect found a section of values that you want to keep where it is.
2. **Claude:** drafts `identity/SOUL.md` at the size you chose from your answers, one question at a time: what you want the work judged by, what a good result always has, and what Claude must never pretend. It writes only what you said; anything it inferred is marked "(inferred)". The template's comment, which names the studio's own values, is dropped: your file holds only yours, and nothing comes from the studio's files.
   - Light: the three template lines, one short phrase each.
   - Standard: a few lines under each of the three, and a section on what Claude refuses to become.
   - Full: the standard page, plus a header comment (owner: you; changed only on a diff you approve, and how often; the date you approved it; its scope, and what does not belong in it, such as rules for one task or one project) and a closing note of what it was drafted from.
3. **Claude:** when Detect found a section of values in an instruction file, starts from that section instead of the blank template, and proposes moving it into `SOUL.md` so it does not load twice: one diff for both files.
4. **you:** read the diff and approve it, or change whatever you would not sign. Claude saves only on your yes.
5. **Claude:** loads the file the way you chose on the USER.md card: it adds `SOUL.md` to the import lines, to the front door's read line, or to the start-up hook's command, and adds the diff rule to the front door if it is not there yet: never edit anything in `identity/` without showing the diff first, and never change these files about itself. One diff.
6. **you:** in claude.ai, add the file to the Project's knowledge, or one line of it to the Project's instructions ([claude-ai-project](claude-ai-project.md)).
7. **you:** after a week of sessions, tell Claude where its work fell short of a value you hold. **Claude** proposes the change as a diff and saves on your yes. From then on, every change to `identity/` is a diff you approve, never an edit Claude makes on its own.
8. **Claude:** records the decision, the scope (the `identity/` folder of your setup), the size, how it loads and the undo in `adoption/decisions.md`.

## Check

1. **you:** start a fresh session in your setup folder (a new terminal, or `/clear` in the open one) and ask as the first message: "Who am I, and what always needs my OK?" Expected: Claude answers from your identity files and names them.
2. **you:** then ask "What must you never pretend?" Expected: Claude answers with the line from `SOUL.md`, in your words, and names the file.
3. **you:** say "Add a value to `identity/SOUL.md`: say what was not done." Expected: Claude shows the diff and waits for your yes before saving.

If step 2 gets a generic answer, or step 3 saves without a diff, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** removes the `SOUL.md` line from the front door (the import or the name), or the file from the hook's command, with the diff shown. When it is the last identity file, it also removes the hook entry and the diff rule.
- **Claude:** if step 3 moved a section out of an instruction file, puts it back on your yes, with the diff shown.
- **you:** the file is your writing; Claude deletes `identity/SOUL.md` only on your yes.
- **you:** in claude.ai, take it out of the Project's knowledge or instructions.

## Watch out

- **Every session pays for it.** About 68 (light), 276 (standard) or 356 (full) tokens when imported or printed by the hook, and nothing when it is read only when needed; all estimates, bytes divided by 4 of sample files written for these cards. Yours will differ: measure with `wc -c`.
- **Values, not a personality.** A persona costs tokens every session and changes nothing you can check. Keep each value to one you could point at in a result: "the report says what was not checked" can be seen; "be thoughtful" cannot.
- **No self-edits.** This file describes Claude's side of the work, and Claude never rewrites it about itself; a change is a diff you approve. The studio's own identity file names an agent that edits its identity unreviewed among the things it refuses to become.
- **Most setups do without it.** If you skip it, put the one or two values you care about as lines in [STYLE.md](identity-style.md) or [RELATIONSHIP.md](identity-relationship.md) instead.
- **It is the same values everywhere.** Rules for one task or one project belong in that project's front door, not here, since this file loads in every session.
