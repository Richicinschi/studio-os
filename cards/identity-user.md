---
id: identity-user
module: 07-identity-and-contract
checked: 2026-11-02
tokens:
  light: 104
  standard: 408
  full: 511
other_figures:
  - 306
  - 2000
  - 1000
---

# USER.md: who you are

## Why

- **The problem:** every session starts by guessing who you are: your role, what you already know, whether you want one line or a lesson. The guess changes from session to session, so Claude explains what you know well and skips what you are still learning, and the corrections you gave are gone the next morning.
- **The reason:** one short file, `identity/USER.md`, in your own words: your role and your work, what you know well and what you are learning, how you like information, and your constraints. Every session gets it before your first message, so each one starts from the same picture of you.
- **The cost of skipping it:** nothing carries from one session to the next. Each session rebuilds its picture of you from what is written, so the quality of the work depends on these files, and without this one the picture is a guess ([module 07, Evidence](../modules/07-identity-and-contract/README.md#evidence)).
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). Who you are is written down once, where every session reads it, instead of being explained again in each chat.

## Detect

Read-only, at the root of your setup folder. Presence, sizes and counts; no file's content is printed or quoted.

- Whether the file exists: `ls identity/USER.md 2>/dev/null`.
- How many lines still hold a template prompt (a `<...>` placeholder): `grep -cE '<(\.\.\.|[a-z][^>]*)>' identity/USER.md 2>/dev/null`.
- Its size, and the four identity files together for question 2: `wc -c < identity/USER.md` and `cat identity/*.md 2>/dev/null | wc -c`, each reported as tokens (an estimate: bytes divided by 4).
- How the identity files load today, counts only:
  - imported (a line starting with `@` in an instruction file loads that file at launch): `grep -cE '^@identity/' CLAUDE.md AGENTS.md 2>/dev/null`;
  - named in the front door for Claude to read: `grep -c 'identity/' AGENTS.md CLAUDE.md 2>/dev/null`;
  - printed by a start-up hook (a command Claude Code runs when a session starts): `grep -c 'identity/' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Whether text about who you are already lives somewhere else. Claude reads your instruction files (`CLAUDE.md`, `AGENTS.md`, `CLAUDE.local.md`) and your user-level one, `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md`, if it exists, which discovery may do. It reports only "has a section about who you are: yes or no", with the file's name, and never quotes the section.
- claude.ai: Claude Code cannot see your account, so Claude asks one yes or no question: "Do the instructions of one of your claude.ai Projects already say who you are?"

The menu marks the item **have** when `identity/USER.md` exists with no prompts left and loads in one of the three ways above; **partly** when it exists but prompts remain or nothing loads it, or when a section about who you are lives in an instruction file or a Project instead; and **not yet** otherwise.

## Ask

This item is recommended for every kind of work (data, ml, software or general) and comes ticked on the menu.

1. **"Size?"** What every session loads when the file is imported, measured on a sample file written for each size (bytes divided by 4, an estimate):
   - Light: the template's five lines, each answered in a short phrase: about 104 tokens. Recommended for a first adoption, and whenever the problem you named is only that Claude does not know who you are.
   - Standard: a short page with a few lines each on your background, what you know and what you are learning, how you decide, your constraints, and how you learn and review: about 408 tokens. Recommended when you named that Claude explains what you already know, or misses what you are still learning.
   - Full: the standard page, plus a header (who owns the file, how often it may change, its approval, and what does not belong in it) and a closing note of what it was drafted from: about 511 tokens. Recommended when the same file serves several setups or Projects, so each copy says who changes it and where it came from.
   - Not sure: the size recommended above for the problem you named: standard when you named that Claude explains what you already know or misses what you are learning; full when the file serves several setups or Projects; light otherwise. Claude offers to grow it after a week, from the corrections you gave twice.
   - Default when skipped: light.
2. **"How do your identity files load?"** One answer for all four: this file, [RELATIONSHIP.md](identity-relationship.md), [STYLE.md](identity-style.md) and [SOUL.md](identity-soul.md). The other three cards do not ask it again. Each option's cost is the sum of the sizes you chose on the four cards: about 306 tokens for USER, STYLE and RELATIONSHIP at light, about 1,057 for the same three at standard, and about 1,729 for all four at full (estimates). On claude.ai none of the three applies: the lines go into a Project's instructions (step 6).
   - Imported into every session: one `@identity/<file>` line per file in your front door, so they load at launch with it, every session, for certain ([docs/facts.md](../docs/facts.md), "Claude Code: measuring context and asking multiple choice"). Costs your sum every session. Recommended while the files together stay under about 2,000 tokens (estimate), which every combination of sizes on these cards does.
   - Read when needed: one line in the front door names the files and says when to read them (when a task asks who you are, writes for you, or might need your OK). Costs nothing every session, and your sum each time a session reads them; but a session may skip reading them and guess. Recommended when the files together pass about 2,000 tokens, or when your front door with its imports is already at 1,000 tokens or more (estimates).
   - A start-up hook (Claude Code only): a `SessionStart` hook whose command prints the files; Claude Code adds what such a hook prints to the session's context ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"). Costs your sum every session, like an import. Recommended when you start Claude Code in many folders and want the same files in each: the hook goes in `~/.claude/settings.json`, which applies to all your projects.
   - Not sure: the option recommended above: imported, the way that loads for certain; read when needed when your front door with its imports is already at 1,000 tokens or more; a start-up hook when you start Claude Code in many folders. Claude measures again after a week.
   - Default when skipped: imported.

## Needs

- Nothing beyond Claude Code. The start-up hook needs nothing more: its command uses `cat`, which Git Bash has on Windows (Git for Windows brings it, from START-HERE's "Prepare").
- The [front door](front-door.md), which imports or names the files.
- Round 1 of the drill, recorded in `adoption/spec.md` (your profile and your data rules): Claude pre-fills from it.
- In claude.ai: a Project ([claude-ai-project](claude-ai-project.md)), whose instructions carry two lines from this file.

## Steps

All three sizes take every step; they differ only in what step 2 writes.

1. **Claude:** runs `vet-and-adopt` for this item. It ships one blank text template, `templates/identity/USER.md`, which `vet-and-adopt` scans like any shipped file; then it compares it with what Detect found and recommends ADAPT, the default for a practice, or FOLD when Detect found a section about who you are that you want to keep where it is.
2. **Claude:** pre-fills `identity/USER.md` at the size you chose from what round 1 of the drill already recorded in `adoption/spec.md`: your work from the profile, where you use Claude, and your data rules as constraints (for example, what may not leave your company). It asks only what round 1 did not cover, one question at a time: what you know well and what you are learning, how you like information, your languages, time zone and working hours. It writes only what you said; anything it inferred is marked "(inferred)". Nothing comes from the studio's files, and the template's comment is replaced by one that matches how the file loads.
   - Light: the five template lines, one short phrase each.
   - Standard: a short section each for your background, what you know and are learning, how you decide, your constraints, and how you learn and review.
   - Full: the standard sections, plus a header comment (owner: you; changed only on a diff you approve, and how often; the date you approved it; its scope, and what does not belong in it: paths, project state, task lists) and a closing note of what it was drafted from.
3. **Claude:** when Detect found a section about who you are in an instruction file, starts from that section instead of the blank template, and proposes moving it into `USER.md` so it does not load twice: one diff for both files.
4. **you:** read the diff and approve it, or change whatever you would not sign. Claude saves only on your yes.
5. **Claude:** sets up the loading you chose in question 2, for every identity file you took, as one diff:
   - imported: one `@identity/<file>` line each in your front door;
   - read when needed: one line in the front door naming the files and when to read them;
   - start-up hook: a `SessionStart` entry under the `hooks` key of the settings file you chose (`~/.claude/settings.json` for all your projects; `.claude/settings.json` or `.claude/settings.local.json` for one), with one matcher group each for `startup`, `resume`, `clear`, `compact` and `fork` ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"), and a command that prints the files by their full path, for example `cat "$HOME/<your setup>/identity/USER.md" "$HOME/<your setup>/identity/RELATIONSHIP.md"`.
   In the same diff it adds one rule to the front door, in your words: never edit anything in `identity/` without showing the diff first, and never change these files about itself.
6. **you:** in claude.ai, paste two lines from `USER.md` into the Project's instructions ([claude-ai-project](claude-ai-project.md)), and add the full file to the Project's knowledge where your data rules allow.
7. **you:** after a week of sessions, tell Claude what you corrected twice about who you are. **Claude** proposes the lines as a diff and saves on your yes. From then on, every change to `identity/` is a diff you approve, never an edit Claude makes on its own.
8. **Claude:** records the decision, the scope (the `identity/` folder of your setup), the size, the loading for all four files and the undo in `adoption/decisions.md`.

## Check

1. **you:** start a fresh session in your setup folder (a new terminal, or `/clear` in the open one) and ask as the first message: "Who am I, and what always needs my OK?" Expected: Claude answers the first half from `USER.md`, with your role and what you use Claude for in your words, and names the file; the second half comes from `RELATIONSHIP.md` when you took it. With "read when needed", Claude says it is reading the files before it answers.
2. **you:** then say "Add a line to `identity/USER.md`: I am learning Python." Expected: Claude shows the diff and waits for your yes before saving.
3. **Claude:** `wc -c < identity/USER.md`, divided by 4, lands near the estimate for the size you chose. With the start-up hook, **you:** type `/hooks`; it lists the `SessionStart` entry and where it comes from.

If step 1 gets a generic answer or a guess, or step 2 saves without a diff, the item is not done: the plan row stays unticked. The usual causes are a missing import line, a hook in a settings file this session does not read, or a path in the hook's command that does not match.

## Undo

- **Claude:** removes the `USER.md` line from the front door (the import or the name), or the file from the hook's command, with the diff shown. When it is the last identity file, it also removes the hook entry and the diff rule.
- **Claude:** if step 3 moved a section out of an instruction file, puts it back on your yes, with the diff shown.
- **you:** the file is your writing; Claude deletes `identity/USER.md` only on your yes.
- **you:** in claude.ai, take the two lines out of the Project's instructions, and the file out of its knowledge.

## Watch out

- **Every session pays for it.** About 104 (light), 408 (standard) or 511 (full) tokens when imported or printed by the hook, and nothing when it is read only when needed; all estimates, bytes divided by 4 of sample files written for these cards. Yours will differ: measure with `wc -c`.
- **Twice is waste.** A section about who you are in an instruction file and an imported `USER.md` load the same facts twice; keep one.
- **It describes you.** `USER.md` holds personal details: keep it in your own setup, out of company repositories and public remotes, and in a claude.ai Project only where your data rules allow.
- **No self-edits.** Claude never rewrites this file about itself; a change is a diff you approve. The studio lists an agent that edits its own identity unreviewed among the things it refuses to become.
- **Keep it to its job.** Paths, project state and task lists belong in memory and handoff notes; every extra line here loads into every session.
- **The hook on Windows.** Hooks run through Git Bash, or through PowerShell when Git Bash is not installed ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"); the `cat` command in step 5 is written for Git Bash.
- **claude.ai's memory is not this file.** It builds itself from your chats ([docs/facts.md](../docs/facts.md), "claude.ai: memory and past chats"); keep who you are in the Project's instructions, which you wrote and review.
