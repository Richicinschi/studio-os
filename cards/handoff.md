---
id: handoff
module: 01-continuity
checked: 2026-11-02
tokens:
  description: 73
  body: 1816
  light: 68
  standard: 197
  full: 197
other_figures:
  - 260
---

# The handoff note, and the skill that writes it

## Why

- **The problem:** a new day starts from zero. Yesterday's conversation, picked up again, is past every cache lifetime, so its first request reprocesses all of it ([docs/facts.md](../docs/facts.md), "Prompt cache and why a new day starts cold"); a brand-new one knows nothing, and you spend the first half hour explaining where you stopped. Meanwhile small leftovers pile up unseen: uncommitted changes, unpushed commits, facts learned and never written down.
- **The reason:** a short note, written while the work is fresh: what was done, what was decided, what is open, the first step for next time, and a prompt to resume with. The next session reads one small file instead of a long history. In Claude Code, a skill (a set of instructions Claude loads when your phrase matches) writes the note for you and, in the same pass, sweeps memory, refreshes the state, commits and pushes, and ends with a message naming what was left undone. Each leftover is cheap to fix in the session that made it.
- **The cost of skipping it:** a session works from what is written where it reads, and nothing else. The studio made its memory sweep mandatory after a session archived its transcript but never updated memory, and the next one worked from state that had drifted for weeks ([module 01, Evidence](../modules/01-continuity/README.md#evidence)).
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). The note, and the memory the skill sweeps, are the state of the work, written down at the moment it is known best.

## Detect

Read-only, at the root of your setup folder. Presence, counts and dates; no note's content and no skill's body is read.

- The notes: whether the template exists, `ls handoffs/TEMPLATE.md 2>/dev/null`; how many dated notes there are, `ls handoffs/ 2>/dev/null | grep -cE '^[0-9]{4}-[0-9]{2}-[0-9]{2}'`; the date of the newest, from its name only, `ls handoffs/ 2>/dev/null | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort | tail -1 | cut -c1-10`; and whether the front door points at them, `grep -c 'handoffs/' AGENTS.md CLAUDE.md 2>/dev/null`.
- A skill of the same name, in this project or for every project: `ls -d .claude/skills/handoff "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/handoff" 2>/dev/null`.
- Another skill or agent doing the same job, found from its front matter (the block between the first two `---` lines) only:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md .claude/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'handoff|wrap(ping)? up|end of (the )?(day|session)' && echo "$f"; done`
  The words also match skills that only mention a handoff in passing, so Claude reads each match's description and says whether it does this job.
- The memory index the sweep writes into: `ls memory/MEMORY.md 2>/dev/null` ([memory index](memory-index.md)).
- A check that runs when a session stops (a `Stop` hook) already in place: `grep -c '"Stop"' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Work left behind today, as counts, in each repository listed in `adoption/inventory.md`: `git -C <repo> status --porcelain | wc -l` (uncommitted changes) and `git -C <repo> rev-list --count HEAD --not --remotes` (commits on no remote).
- claude.ai: Claude Code cannot see your account, so Claude asks one yes or no question: "Does a claude.ai Project's knowledge hold files named `handoff-YYYY-MM-DD.md`?"

The menu marks the item **have** when notes are in use (the template, at least one dated note, and a front door that names `handoffs/`; or, on claude.ai only, a note in a Project's knowledge) and, in Claude Code, a skill named `handoff` or another whose description covers ending a session exists; **partly** when only some of that is true, such as notes without a skill, or a skill without notes; and **not yet** when there is no note anywhere and no skill doing this job.

## Ask

This item is recommended for every kind of work (data, ml, software or general) and comes ticked on the menu. If you untick it, Claude says once what you lose: the next session starts from zero, with nothing written about where you stopped. Then it respects your answer and does not raise it again.

1. **"Size?"** Each size's cost every session is an estimate (bytes divided by 4):
   - Light: the note only, written from your template when you say "write a handoff note": about 68 tokens every session, for the two front-door lines that say when to write a note and when to read the newest. The only size on claude.ai. Recommended when you use claude.ai only, or when the only problem you named is starting each day from zero.
   - Standard: the skill that writes the note and does the rest of the close-out: the memory sweep, the current state refreshed, everything committed and pushed where your data rules allow, and a last message naming what was left undone: about 197 tokens every session, the two lines plus the skill's description (measured on the kit copy). The default in Claude Code. Recommended when the problem you named includes work or facts left behind at the end of a session.
   - Full: standard plus the [session-end check](session-end-check.md), a `Stop` hook (a command Claude Code runs each time Claude finishes responding, [docs/facts.md](../docs/facts.md), "Claude Code: hooks") that names every repository holding uncommitted or unpushed work: about 197 tokens every session, the same as standard, because the check adds text to the conversation only when it finds work left behind (its card says how often that is). Recommended when Detect counted uncommitted changes or commits on no remote in your repositories.
   - Not sure: the size recommended above for what Detect found and the problem you named: full when Detect counted uncommitted changes or commits on no remote; light on claude.ai, or when the only problem you named is starting each day from zero; standard otherwise. Update mode offers to grow it.
   - Default when skipped: standard in Claude Code, light on claude.ai.
2. **"Where does the skill go?"** Standard and full only.
   - This setup only: `.claude/skills/handoff/`. Recommended when you start your sessions in one setup folder.
   - Every project: `~/.claude/skills/handoff/` (or under `$CLAUDE_CONFIG_DIR`). Recommended when you work in several repositories and want the same close-out in each.
   - Not sure: the option recommended above: this setup only when you start your sessions in one setup folder, every project when you work in several repositories and want the same close-out in each.
   - Default when skipped: this setup only.
3. **"What may it do with git?"** Standard and full only. Claude fills the answer in from your data rules in `adoption/spec.md`, and asks only when they do not settle it.
   - Commit and push, each push shown first. Recommended when your data rules allow a remote for this setup.
   - Commit only; you push. Recommended for company repositories, where a push leaves your machine, and when your data rules are not known (the strictest reading).
   - Nothing with git: the note and the memory sweep only.
   - Not sure: the option recommended above: commit and push when your data rules allow a remote for this setup; commit only for company repositories, or when your data rules are not known.
   - Default when skipped: commit only.

## Needs

- Light: nothing beyond Claude Code, or a claude.ai Project ([claude-ai-project](claude-ai-project.md)); and the [front door](front-door.md), so the next session knows to read the newest note.
- Standard: git (`git --version`). Its install, when it is missing:
  - Windows: `! winget install --id Git.Git -e --source winget`;
  - macOS: `! xcode-select --install`;
  - Debian or Ubuntu: `! sudo apt install git`.
- Standard: SkillSpector, for the scan in step 1, row 1 of your plan ([SkillSpector](skillspector.md)): `! skillspector --version`.
- Standard: the [memory index](memory-index.md), which the sweep writes into. Without it the sweep has nowhere to write, and the skill says so instead of writing elsewhere.
- Full: Node.js, which runs the check's script, `templates/hooks/session-end-check.mjs`; the kit uses version 22, installed with the lines in [Tools some items need](../docs/install-reference.md#tools-some-items-need) (Windows: `! winget install --id OpenJS.NodeJS.22 -e`; macOS and Linux: through nvm). The [session-end check](session-end-check.md) card lists anything else it needs.

## Steps

Light takes steps 1 to 3 and 8 to 10; on claude.ai, step 7 takes the place of steps 2 and 3. Standard adds step 4 (or 5, when you fold it into a skill you have). Full adds step 6 as well.

1. **Claude:** runs `vet-and-adopt` for this item. It ships a text template, `templates/handoffs/TEMPLATE.md`, which `vet-and-adopt` scans like any shipped file; for standard and full it also scans the skill: `skillspector scan catalog/skills/handoff --no-llm` (on Windows, `PYTHONUTF8=1` first). It triages the findings and recommends against what Detect found: ADAPT when nothing does this job, FOLD when a skill you have does. Not ADOPT as it is: the kit copy's first and last steps call studio tools that your setup does not have.
2. **Claude:** writes `handoffs/TEMPLATE.md` in your words, with five fields: done (with links to the files, queries or changes), decided (and by whom), open (and what it waits on), the first step for next time, and a resume prompt to paste as the next session's first message. Rename the fields if you like; keep all five. Shown before saving.
3. **Claude:** makes sure the front door says to write a note in `handoffs/`, named `YYYY-MM-DD-<topic>.md`, at the end of a session, and to read the newest one when a task continues earlier work. A merge, with the diff shown.
4. **Claude:** for ADAPT, writes `SKILL.md` in the place you chose, in your words, for your tools. It keeps the floor, in the kit copy's order: the memory sweep against the four tests in your `memory/README.md`, the current state refreshed in your front door, the note written from your template, then everything committed, and pushed where your data rules and question 3 allow, and a last message naming what was left undone. Everything is written before the commit, so nothing written at the end is left uncommitted while the checks look clean. It replaces each studio-specific part of the kit copy:
   - the trigger phrases and "the owner" → the phrases you actually say at the end of a session;
   - the studio's health check before closing (its first step) → `git status --short`, and the kit copy's count of commits that exist only on this disk, on any branch or worktree, in each repository the session touched: `git -C <repo> rev-list --count --ignore-missing --branches $(git -C <repo> worktree list --porcelain | sed -n 's/^HEAD //p') --not --remotes` (the copy's own reason: `HEAD` alone misses side branches and worktrees);
   - the studio's end-of-session gate (its description and last step) → dropped; the last step runs the same two git commands again and expects empty output, and `0` where it may push;
   - the studio's wiki log → your handoff note;
   - the call to the studio's transcript archiver, and its reference to that archiver's sweep step → dropped; the sweep stays, written out in the skill itself and pointing at your `memory/README.md`;
   - the studio's memory provenance fields and its memory lint → the format in your `memory/README.md`;
   - the studio's rule that memory is written in its root folder and committed from a separate worktree branch → dropped; memory is committed where your memory folder lives;
   - the studio's commit rules (signed, no trailers, a hook that refuses them) and its list of repositories that take changes only through a PR → your own: signing only if you took [signed commits](signed-commits.md), and your own list of protected branches, or none;
   - the branch clean-up, which in the kit copy lists every merged branch and finished worktree and deletes only what the studio says yes to, with pointers to a studio memory note, its record of approvals and its rule numbers → the same list-ask-delete, on your yes to the exact list, with those pointers dropped; or dropped;
   - the links to the studio's vault rule and to its curator → your `memory/vault/MEMORY-VAULT.md`.
   It shows the whole file before saving.
5. **Claude:** for FOLD, adds the sweep, the note and the last-message rule to your existing skill, with the diff shown.
6. **Claude:** for full, follows the [session-end check](session-end-check.md) card's steps, which add the check as a `Stop` hook in your settings; that card has its own check and undo.
7. **you:** on claude.ai: make sure the Project's instructions carry the note's shape and the line to read the newest note first ([claude-ai-project](claude-ai-project.md)). At the end of each day, say "handoff", save the answer as `handoff-YYYY-MM-DD.md`, add it to the Project's knowledge, and start the next day in a new chat in the same Project. Keep the old notes there.
8. **Claude:** from this row on, the adoption uses the item on itself. This item is the first row of your plan after the scanner rows, so when an adoption session ends partway, Claude writes a note from your template in `adoption/`, named `handoff-YYYY-MM-DD.md`, and the next run of the drill reads the newest one first and resumes from it.
9. **you:** at the end of your next real working session, say your closing phrase (standard and full), or "write a handoff note" (light), and watch it run once, end to end. Correct anything in the note that is an intention rather than a fact.
10. **Claude:** records the decision, the size, where the skill went, what it may do with git, the scan result and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** after the first evening, `ls handoffs/ | grep -cE '^[0-9]{4}-[0-9]{2}-[0-9]{2}'` prints at least `1`. On claude.ai, **you:** the Project's knowledge shows today's `handoff-YYYY-MM-DD.md`.
2. **you:** the next working day, in a fresh session (a new terminal, `/clear` in the open one, or a new chat in the Project), ask "where did we stop?" as the first message. Expected: Claude reads the newest note, names it, and answers with its open items and its first step, without you explaining anything.
3. **you:** for standard and full, at the end of a working session, say "let's wrap up" (or your own phrase). Expected: Claude loads `handoff` and starts with `git status --short` in each repository the session touched. At the end, a note dated today is in `handoffs/`; the memory sweep reports what it wrote, or says that nothing passed the four tests; the last message lists what was left undone; where it may commit, `git status --short` shows nothing the session wrote, the note included; and, where it may push, the count of commits from step 4 prints `0`.
4. For full, the [session-end check](session-end-check.md) card's Check passes too.
5. For the adoption itself, the proof comes in the Verify phase: its resume test, a fresh session asked "where did we stop?", must answer from your files. If an adoption session ended partway, the next run named its note in `adoption/` and resumed from it. A failure there is recorded in `adoption/handover.md`, with what to look at next.

If Claude guesses, asks you, or reads an older note; or if the skill does not start, skips the memory sweep without saying so, or ends without a note, the item is not done: the plan row stays unticked. The usual causes are a front door that does not name `handoffs/`, or a note whose name does not start with its date.

## Undo

- **Claude:** removes the handoff lines from the front door, with the diff shown.
- **Claude:** deletes `.claude/skills/handoff/` (or `~/.claude/skills/handoff/`) on your yes; for FOLD, removes the lines it added to your skill, with the diff shown.
- **Claude:** for full, follows the [session-end check](session-end-check.md) card's Undo.
- **you:** keep the notes and the memory files the skill wrote: they are the history of your work. Claude deletes `handoffs/` only on your yes.
- **you:** on claude.ai, take the notes out of the Project's knowledge only after you have saved a copy elsewhere.

## Watch out

- **Cost.** The two front-door lines are 272 bytes, about 68 tokens every session; the front door card leaves them out until you take this item. The kit copy's description is about 73 tokens every session, and its body, about 1,816 tokens, loads only when it runs. A note loads only when a task continues earlier work: a filled one written for this card was 1,039 bytes, about 260 tokens. All estimates, bytes divided by 4; your adapted copy differs, so measure its description with `wc -c`.
- **Facts, not intentions.** "Done" lists what was checked and how. A note that records what was attempted as if it worked sends the next session off on a false start.
- **Pausing is not ending.** The skill fires on phrases like "end of day". When you are only pausing, Claude says so and skips it: a close-out on a session that is about to continue is wasted.
- **Never as part of a handoff:** merging a PR, force-pushing, rewriting history or tagging. Keep these lines from the kit copy; each is a separate act that waits for your own yes.
- **A push leaves your machine,** and a note quotes queries, results and decisions. Your data rules decide whether Claude may push at all, and whether a note may go into a claude.ai Project; keep customer data out of the notes.
- **Writing nothing is a valid sweep.** The skill must never invent a memory to look productive, and must never call a repository clean without having checked it.
- **The studio's own failure.** Before the skill, one clean-up pass had to retire about 130 stale branches, 13 forgotten worktrees and 6 working copies with uncommitted changes, piled up over 64 sessions. Each was cheap to fix in the session that made it. The kit copy of the skill records this at its top.
- **Two naming schemes.** `YYYY-MM-DD-<topic>.md` in `handoffs/`, and `handoff-YYYY-MM-DD.md` on claude.ai and in `adoption/`. Both sort by date, which is what "newest" relies on; two notes on one day under the second scheme share a name, so add a letter to the second. The claude.ai shape has four fields: the Project's instructions already tell a new chat to read the newest note, so it leaves out the resume prompt.
- **Never replace an old note with a shorter summary.** The old notes are your record; on claude.ai they are your vault.
