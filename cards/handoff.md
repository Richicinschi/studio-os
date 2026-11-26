---
id: handoff
module: 01-continuity
checked: 2026-11-02
tokens:
  description: 73
  body: 1595
  light: 68
  standard: 141
  full: 141
other_figures:
  - 260
---

# The handoff note, and the skill that writes it

## Why

- **The problem:** a new day starts from zero. Yesterday's conversation, resumed, is past every cache lifetime and reprocessed in full ([docs/facts.md](../docs/facts.md), "Prompt cache and why a new day starts cold"); a new one knows nothing until you explain where you stopped. Leftovers pile up unseen: uncommitted changes, unpushed commits, unwritten facts.
- **The reason:** a short note, written while the work is fresh, that the next session reads instead of a long history. In Claude Code, a skill (instructions loaded when your phrase matches) writes it and closes the session in one pass.
- **The cost of skipping it:** in the studio, a session archived its transcript but never updated memory, and the next one worked from state weeks out of date, so the memory sweep became mandatory ([module 01, Evidence](../modules/01-continuity/README.md#evidence)). An earlier clean-up retired about 130 stale branches, 13 forgotten worktrees and 6 working copies with uncommitted changes from 64 sessions, each cheap to fix at the time.
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history): the note and the swept memory hold the work's state, written when it is known best.

## Detect

Read-only, at your setup folder's root: presence, counts and dates, never a note's content or a skill's body.

- The notes: the template, `ls handoffs/TEMPLATE.md 2>/dev/null`; dated notes, `ls handoffs/ 2>/dev/null | grep -cE '^[0-9]{4}-[0-9]{2}-[0-9]{2}'`; the newest one's date, from its name, `ls handoffs/ 2>/dev/null | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort | tail -1 | cut -c1-10`; the front door naming them, `grep -c 'handoffs/' AGENTS.md CLAUDE.md 2>/dev/null`.
- A skill of the same name, here or for every project: `ls -d .claude/skills/handoff "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/handoff" 2>/dev/null`.
- Another skill or agent doing the job, from its front matter only; Claude reads each match's description, as passing mentions match too:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md .claude/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'handoff|wrap(ping)? up|end of (the )?(day|session)' && echo "$f"; done`
- The [memory index](memory-index.md) the sweep writes into: `ls memory/MEMORY.md 2>/dev/null`.
- A `Stop` hook (run when a session stops): `grep -c '"Stop"' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Work left behind, per repository in `adoption/inventory.md`: uncommitted changes, `git -C <repo> status --porcelain | wc -l`, and commits on no remote, `git -C <repo> rev-list --count HEAD --not --remotes`.
- claude.ai, which Claude Code cannot see: Claude asks "Does a claude.ai Project's knowledge hold files named `handoff-YYYY-MM-DD.md`?"
- A skill of the same name from a plugin enabled here: run from the project folder, `claude plugin list --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let l;try{l=JSON.parse(s)}catch{}if(!Array.isArray(l))return console.log("plugin check could not run");for(const p of l){const r=p.readFromFolder||p.installPath,f=r&&require("path").join(r,process.argv[1]);if(p.enabled&&f&&require("fs").existsSync(f))console.log(p.id,f)}})' skills/handoff/SKILL.md` prints the plugin's id and the path of each copy, and nothing else. `claude plugin list` reports which plugins are enabled for the current folder and the folder each one loads from, so a disabled plugin, a plugin installed for another repository and an old version left after an update do not count. When it prints `plugin check could not run` or an error such as `claude: command not found`, Detect says the plugin check could not run, and the item gets no plugin mark ([docs/facts.md](../docs/facts.md), "Claude Code: installed plugins and their skills").

The menu marks the item **have** when notes are in use (the template, a dated note and a front door naming `handoffs/`, or on claude.ai a note in a Project's knowledge) and, in Claude Code, a skill does this job; **partly** when only some of that holds; **not yet** when neither exists. When nothing marks it **have** and that plugin line prints a copy, the menu says **a plugin provides one** instead of **not yet**, or **partly (a plugin provides one)** instead of **partly**, so what is missing stays in view, and it does not offer the kit's copy as a second.

## Ask

Recommended for every kind of work and ticked on the menu. If you untick it, Claude says once what you lose, a cold start with no note of where you stopped, and does not raise it again.

1. **"Size?"** Costs are estimates, bytes divided by 4.
   - Light: the note only, from your template when you say "write a handoff note"; about 68 tokens every session for the two front-door lines of step 3. The only size on claude.ai. Recommended there, or when your only problem is starting each day from zero.
   - Standard: the skill, which writes the note and closes out the session (memory sweep, state refreshed, commit and push as question 3 allows, a last message naming what was left undone): about 141 tokens every session, the two lines plus the kit copy's description. Default in Claude Code; recommended when work or facts get left behind at a session's end.
   - Full: standard plus the [session-end check](session-end-check.md), a `Stop` hook (run each time Claude finishes responding; [docs/facts.md](../docs/facts.md), "Claude Code: hooks") naming each repository with uncommitted or unpushed work. The same 141 tokens every session: the check adds text only when it finds such work. Recommended when Detect found work left behind.
   - Not sure: full when Detect found work left behind; light on claude.ai, or when your only problem is a cold start; standard otherwise. Update mode offers to grow it.
   - Default when skipped: standard in Claude Code, light on claude.ai.
2. **"Where does the skill go?"** Standard and full only.
   - This setup only: `.claude/skills/handoff/`. Recommended when you start your sessions in one setup folder.
   - Every project: `~/.claude/skills/handoff/` (or under `$CLAUDE_CONFIG_DIR`). Recommended for the same close-out in several repositories.
   - Not sure: the option recommended above for how you work.
   - Default when skipped: this setup only.
3. **"What may it do with git?"** Standard and full only. Claude answers it from your data rules in `adoption/spec.md` and asks only when they do not settle it.
   - Commit and push, each push shown first. Recommended when your data rules allow a remote for this setup.
   - Commit only; you push. Recommended for company repositories, and when your data rules are not known (the strictest reading).
   - Nothing with git: the note and the memory sweep only.
   - Not sure: the option recommended above for your data rules.
   - Default when skipped: commit only.

## Needs

- Light: Claude Code or a claude.ai Project ([claude-ai-project](claude-ai-project.md)), and the [front door](front-door.md), so the next session knows to read the newest note.
- Standard: git (`git --version`); to install it, Windows `! winget install --id Git.Git -e --source winget`, macOS `! xcode-select --install`, Debian or Ubuntu `! sudo apt install git`.
- Standard: [SkillSpector](skillspector.md), row 1 of your plan, for the scan in step 1: `! skillspector --version`.
- Standard: the [memory index](memory-index.md); without it the skill says the sweep has nowhere to write, and never writes elsewhere.
- Full: Node.js (the kit uses 22) for the check's script, `templates/hooks/session-end-check.mjs` ([Tools some items need](../docs/install-reference.md#tools-some-items-need): Windows `! winget install --id OpenJS.NodeJS.22 -e`, macOS and Linux through nvm), and what else the [session-end check](session-end-check.md) card lists.

## Steps

Light: steps 1 to 3 and 8 to 10 (on claude.ai, 7 instead of 2 and 3); standard adds 4, or 5 for FOLD; full adds 6.

1. **Claude:** runs `vet-and-adopt`: it scans the template `templates/handoffs/TEMPLATE.md` and, for standard and full, the skill (`skillspector scan catalog/skills/handoff --no-llm`; on Windows, `PYTHONUTF8=1` first), triages the findings and recommends ADAPT, or FOLD into a skill you have that does this job. Not ADOPT as it is: the kit copy's first and last steps call studio tools.
2. **Claude:** writes `handoffs/TEMPLATE.md` in your words with five fields: done (linking files, queries or changes), decided (by whom), open (waiting on what), the first step for next time, and a resume prompt to paste as the next session's first message. Rename them if you like; keep all five. Shown before saving.
3. **Claude:** makes sure the front door says to write a note in `handoffs/`, named `YYYY-MM-DD-<topic>.md`, at a session's end, and to read the newest when a task continues earlier work. A merge, with the diff shown.
4. **Claude:** for ADAPT, writes `SKILL.md` where you chose, in your words and for your tools, keeping the floor in the kit copy's order: memory sweep (the four tests in your `memory/README.md`), state refreshed in your front door, note from your template, commit (and push where question 3 allows), and a last message naming what was left undone. All writing comes first, so nothing is left uncommitted while the checks look clean. Studio parts it replaces:
   - trigger phrases and "the owner" → your closing phrases;
   - the health check (the kit copy's step 1) → `git status --short` and the kit copy's count of commits on no remote per repository touched, `git -C <repo> rev-list --count --ignore-missing --branches $(git -C <repo> worktree list --porcelain | sed -n 's/^HEAD //p') --not --remotes`, which unlike `HEAD` alone sees side branches and worktrees;
   - the end-of-session gate (description, last step) → dropped; the last step reruns both commands, expecting empty output and `0` where it may push;
   - the session log and the kit copy's step 3 session record, where a project keeps them → your note (that step may go); its step 2 sweep stays, written out, pointing at your `memory/README.md`, whose format replaces each memory file's runtime, session and date fields;
   - commit rules (plain `git commit`, no trailers, a commit-msg hook refusing them; a branch and PR where `main` is guarded) → yours: signed if you took [signed commits](signed-commits.md), the hook only with [git hooks](git-hooks.md) at standard or full, your protected branches or none;
   - branch clean-up (list merged branches and finished worktrees, delete on the owner's yes) → the same on your yes to the exact list, or dropped;
   - a corrected memory's old text kept "somewhere it can be found again", and an oversized `AGENTS.md` moving older detail to a linked file → your `memory/vault/MEMORY-VAULT.md` if you took the [vault](vault.md), and your own archive file.
   It shows the whole file before saving.
5. **Claude:** for FOLD, adds the sweep, the note and the last-message rule to your skill, with the diff shown.
6. **Claude:** for full, follows the [session-end check](session-end-check.md) card's steps, which add the `Stop` hook to your settings.
7. **you:** on claude.ai, make sure the Project's instructions say to read the newest note first and carry the note's shape, without the resume prompt that line replaces ([claude-ai-project](claude-ai-project.md)). At each day's end, say "handoff", add the answer to the Project's knowledge as `handoff-YYYY-MM-DD.md`, and start the next day in a new chat there.
8. **Claude:** from here on, the adoption uses the item on itself (the first plan row after the scanners): when an adoption session ends partway, Claude writes a note from your template as `adoption/handoff-YYYY-MM-DD.md`, and the drill's next run reads the newest first and resumes from it.
9. **you:** at the end of your next real working session, say your closing phrase (standard and full) or "write a handoff note" (light) and watch it run once, end to end; correct anything in the note that is an intention, not a fact.
10. **Claude:** records the decision, the size, where the skill went, what it may do with git, the scan result and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** after the first evening, `ls handoffs/ | grep -cE '^[0-9]{4}-[0-9]{2}-[0-9]{2}'` prints at least `1`. On claude.ai, **you:** the Project's knowledge shows today's `handoff-YYYY-MM-DD.md`.
2. **you:** the next working day, in a fresh session (a new terminal, `/clear`, or a new chat in the Project), ask "where did we stop?" first. Expected: Claude reads the newest note, names it, and gives its open items and first step, without you explaining anything.
3. **you:** for standard and full, at the end of step 9's session, say your closing phrase. Expected: Claude loads `handoff` and starts with `git status --short` in each repository touched. At the end, today's note is in `handoffs/`; the sweep reports what it wrote, or that nothing passed the four tests; the last message lists what was left undone; where it may commit, `git status --short` shows nothing the session wrote, the note included; where it may push, step 4's count prints `0`.
4. For full, the [session-end check](session-end-check.md) card's Check passes too.
5. For the adoption itself, the Verify phase's resume test answers from your files, and a run after a partway session resumed from its `adoption/` note; a failure goes into `adoption/handover.md` with what to look at next.

If any of this fails, the item is not done: the plan row stays unticked. Usual causes: a front door that does not name `handoffs/`, or a note whose name does not start with its date.

## Undo

- **Claude:** removes the handoff lines from the front door, with the diff shown.
- **Claude:** deletes `.claude/skills/handoff/` (or `~/.claude/skills/handoff/`) on your yes; for FOLD, removes the lines it added to your skill, with the diff shown.
- **Claude:** for full, follows the [session-end check](session-end-check.md) card's Undo.
- **you:** keep the notes and memory files the skill wrote, the history of your work; Claude deletes `handoffs/` only on your yes.
- **you:** on claude.ai, take notes out of the Project's knowledge only after saving a copy elsewhere.

## Watch out

- **Cost.** The front-door lines come only with this item. The kit copy's description is about 73 tokens every session; its body, about 1,595 tokens, loads only when it runs, and a note only when a task continues earlier work (a filled one for this card: about 260 tokens). Estimates; measure your adapted description with `wc -c`.
- **Facts, not intentions.** "Done" lists what was checked and how; an attempt written up as a success sends the next session off on a false start.
- **Pausing is not ending.** The skill fires on phrases like "end of day"; on a pause, Claude says so and skips it.
- **Never as part of a handoff:** merging a PR, force-pushing, rewriting history or tagging. Keep these lines from the kit copy; each waits for your own yes.
- **Notes quote queries, results and decisions.** Your data rules decide whether one may be pushed off your machine or go into a claude.ai Project; keep customer data out of them.
- **Writing nothing is a valid sweep.** The skill must never invent a memory to look productive, or call a repository clean without checking it.
- **Same-day names collide.** Both name forms sort by date, as "the newest note" needs; two notes on one day named `handoff-YYYY-MM-DD.md` (steps 7 and 8) share a name, so add a letter to the second.
- **Never replace an old note with a shorter summary.** The old notes are your record; on claude.ai they are your vault.
