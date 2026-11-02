---
id: identity-style
module: 07-identity-and-contract
checked: 2026-11-02
tokens:
  light: 89
  standard: 298
  full: 405
---

# STYLE.md: how to write for you

## Why

- **The problem:** Claude hedges what you wanted plain, writes a page where you wanted a line, or answers with a wall of bullet points. You correct it, and the correction is gone the next morning.
- **The reason:** one short file, `identity/STYLE.md`: the tone, the length, the formatting you like and dislike, the words and habits to avoid, and how a result is reported (what was done, what was checked and how, what is still open). Every session gets it before your first message, so a correction written down once holds.
- **The cost of skipping it:** each session rebuilds how it writes for you from what is written, and nothing else carries over, so the same correction is given again in every new session ([module 07, Evidence](../modules/07-identity-and-contract/README.md#evidence)).
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). A correction given in a chat lasts as long as the chat; written in this file, it lasts until you change it.

## Detect

Read-only, at the root of your setup folder. Presence, sizes and counts; no file's content is printed or quoted.

- Whether the file exists: `ls identity/STYLE.md 2>/dev/null`.
- How many lines still hold a template prompt (a `<...>` placeholder): `grep -cE '<(\.\.\.|[a-z][^>]*)>' identity/STYLE.md 2>/dev/null`.
- Its size: `wc -c < identity/STYLE.md`, reported as tokens (an estimate: bytes divided by 4).
- How it loads, counts only: imported, `grep -cE '^@identity/STYLE\.md' CLAUDE.md AGENTS.md 2>/dev/null`; named in the front door, `grep -c 'identity/STYLE.md' AGENTS.md CLAUDE.md 2>/dev/null`; printed by a start-up hook, `grep -c 'identity/STYLE.md' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Whether you named output habits that annoy you: Claude reads "What goes wrong today" in your `adoption/spec.md` and your round 1 answers, and says yes or no.
- Whether style rules already live somewhere else. Claude reads your instruction files (`CLAUDE.md`, `AGENTS.md`, `CLAUDE.local.md`) and your user-level one, `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md`, if it exists, which discovery may do. It reports only "has a section about how to write for you: yes or no", with the file's name, and never quotes the section.
- claude.ai: Claude Code cannot see your account, so Claude asks one yes or no question: "Do the instructions of one of your claude.ai Projects already say how to write for you?"

The menu marks the item **have** when `identity/STYLE.md` exists with no prompts left and loads in one of the three ways above; **partly** when it exists but prompts remain or nothing loads it, or when a section about how to write for you lives in an instruction file or a Project instead; and **not yet** otherwise.

## Ask

This item is optional for every kind of work (data, ml, software or general). It is recommended when you named output habits that annoy you, in round 1 or on the menu: answers too long or too short, too many bullet points, hedging, a lesson where you wanted a line. Then the drill suggests ticking it. How the file loads is asked once for all four identity files, on the [USER.md card](identity-user.md), question 2; when you did not take USER.md, Claude asks that question here instead.

1. **"Size?"** What every session loads when the file is imported, measured on a sample file written for each size (bytes divided by 4, an estimate):
   - Light: the template's five lines (tone, length, formatting, words and habits to avoid, how to report a result), each answered in a short phrase: about 89 tokens. Recommended for a first adoption, and when you named one or two habits.
   - Standard: a short page: how to open an answer, how length follows the stakes, when a table or a numbered list fits, words and habits to avoid, how a mistake is owned, and the shape of a report: about 298 tokens. Recommended when you named several habits, or when others read what Claude writes for you.
   - Full: the standard page, plus a header (who owns the file, how often it may change, its approval, and what does not belong in it) and a closing note of what it was drafted from: about 405 tokens. Recommended when the same file serves several setups or Projects.
   - Not sure: the size recommended above for the habits you named: standard when you named several, or others read what Claude writes for you; full when the same file serves several setups or Projects; light otherwise. Claude offers to grow it after a week, from the corrections you gave twice.
   - Default when skipped: light.

## Needs

- Nothing beyond Claude Code.
- The [front door](front-door.md), which imports or names the file, and the loading answer from the [USER.md card](identity-user.md).
- In claude.ai: a Project ([claude-ai-project](claude-ai-project.md)), whose instructions carry the two or three lines of this file you would miss most.

## Steps

All three sizes take every step; they differ only in what step 2 writes.

1. **Claude:** runs `vet-and-adopt` for this item. It ships one blank text template, `templates/identity/STYLE.md`, which `vet-and-adopt` scans like any shipped file; then it compares it with what Detect found and recommends ADAPT, the default for a practice, or FOLD when Detect found a style section that you want to keep where it is.
2. **Claude:** drafts `identity/STYLE.md` at the size you chose from your answers. It starts with the habits you named in round 1, then asks the rest one question at a time: tone (terse, explained or teaching), length, the formatting you like and dislike, words and habits to avoid, and how a result is reported. It writes only what you said; anything it inferred from how you correct it is marked "(inferred)". Nothing comes from the studio's files.
   - Light: the five template lines, one short phrase each.
   - Standard: a few lines each on how an answer opens (for example the finding first, not the process), how length follows the stakes, when a table or a numbered list fits, the words and habits to avoid, how a mistake is owned, and what a report always says: what was done, what was checked and how, what is still open.
   - Full: the standard page, plus a header comment (owner: you; changed only on a diff you approve, and how often; the date you approved it; its scope, and what does not belong in it) and a closing note of what it was drafted from.
3. **Claude:** when Detect found a section about how to write for you in an instruction file, starts from that section instead of the blank template, and proposes moving it into `STYLE.md` so it does not load twice: one diff for both files.
4. **you:** read the diff and approve it, or change whatever you would not sign. Claude saves only on your yes.
5. **Claude:** loads the file the way you chose on the USER.md card: it adds `STYLE.md` to the import lines, to the front door's read line, or to the start-up hook's command, and adds the diff rule to the front door if it is not there yet: never edit anything in `identity/` without showing the diff first, and never change these files about itself. One diff.
6. **you:** in claude.ai, paste the two or three lines you would miss most into the Project's instructions ([claude-ai-project](claude-ai-project.md)).
7. **you:** after a week of sessions, tell Claude which corrections to tone or format you gave twice. **Claude** proposes the lines as a diff and saves on your yes. From then on, every change to `identity/` is a diff you approve, never an edit Claude makes on its own.
8. **Claude:** records the decision, the scope (the `identity/` folder of your setup), the size, how it loads and the undo in `adoption/decisions.md`.

## Check

1. **you:** start a fresh session in your setup folder (a new terminal, or `/clear` in the open one) and ask as the first message: "Who am I, and what always needs my OK?" Expected: the answer comes from your identity files and names them, and its form follows `STYLE.md`: the length, the formatting and the opening you asked for, and none of the words on your list.
2. **you:** ask for something your file covers, for example "Summarize what you know about this setup." Expected: the same; and when a result is reported, it says what was checked and what is still open, if your file asks for that.
3. **you:** say "Add a line to `identity/STYLE.md`: no exclamation marks." Expected: Claude shows the diff and waits for your yes before saving.

If an answer breaks a line of your file, or step 3 saves without a diff, the item is not done: the plan row stays unticked. Look first at how the file loads (Detect's counts), then at whether the line is specific enough to follow.

## Undo

- **Claude:** removes the `STYLE.md` line from the front door (the import or the name), or the file from the hook's command, with the diff shown. When it is the last identity file, it also removes the hook entry and the diff rule.
- **Claude:** if step 3 moved a section out of an instruction file, puts it back on your yes, with the diff shown.
- **you:** the file is your writing; Claude deletes `identity/STYLE.md` only on your yes.
- **you:** in claude.ai, take the lines out of the Project's instructions.

## Watch out

- **Every session pays for it.** About 89 (light), 298 (standard) or 405 (full) tokens when imported or printed by the hook, and nothing when it is read only when needed; all estimates, bytes divided by 4 of sample files written for these cards. Yours will differ: measure with `wc -c`.
- **Specific lines get followed.** "Be concise" changes little; "one line for a yes or no, a table to compare options" changes what you get. Write the habit you saw, and what you want instead.
- **Style is not the contract.** What needs your OK goes in [RELATIONSHIP.md](identity-relationship.md), not here.
- **A company style guide comes first.** If your company has one, point to it in a line rather than copying it in; copied in, it loads into every session.
- **No self-edits.** Claude never rewrites this file about itself; a change is a diff you approve.
- **claude.ai's memory is not this file.** It builds itself from your chats ([docs/facts.md](../docs/facts.md), "claude.ai: memory and past chats"); keep the lines you rely on in the Project's instructions.
