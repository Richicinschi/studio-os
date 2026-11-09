---
id: using-agent-skills
module: 05-skills
checked: 2026-11-09
tokens:
  description: 56
  body: 1207
---

# A router for your skills

## Why

- **The problem:** once you have many skills, you lose track of which one fits a task, copies of the same skill multiply, and every description costs context on every turn.
- **The reason:** one router skill names each skill you have and when to reach for it, so a task finds its skill through one lookup instead of your memory.
- **The cost of skipping it:** the kit holds no story for this one. Skipping it means you are the index: you must remember every skill's name, and past the description budget Claude no longer sees the descriptions of the skills you use least ([docs/facts.md](../docs/facts.md), "Claude Code: measuring context and asking multiple choice").
- **The principle:** [load only what is needed](../PRINCIPLES.md#load-only-what-is-needed). One short description stands in for the whole map, and the map loads only when it is used.

## Detect

Read-only. Names, descriptions and counts.

- How many skills you have: folders under `.claude/skills/` (project) and `~/.claude/skills/` (user, or under `$CLAUDE_CONFIG_DIR` when that is set), counted; and your plugins, by name, from `claude plugin list`, since a plugin can bring skills too.
- A router already: a skill named `using-agent-skills`, or one whose description says it picks among your skills. Names and descriptions only, never a skill's body.
- A list of skills kept in your front door instead, which a router could replace.
- Near-duplicates: two skills with the same name, or nearly the same description, at project and user level.
- A start-up hook already (for question 3): in `.claude/settings.json`, `.claude/settings.local.json` and `~/.claude/settings.json` (or the one under `$CLAUDE_CONFIG_DIR`), the `hooks.SessionStart` entries: how many, their matchers, and the file name each command prints or runs. Only the hooks part is read.

The menu marks the item **have** when a router exists and every skill it names exists, **partly** when a router or a front-door list exists but names missing skills or leaves some out, and **not yet** otherwise.

## Ask

1. **"Take the router?"**
   - ADAPT: write your own map, keeping the kit copy's shape, a tree from task to skill plus a few rules. Recommended when Detect counts more skills than you can name from memory and finds no router.
   - FOLD: add the missing lines to the router or list you already have. Recommended when Detect found one.
   - No: you have only a handful of skills. Recommended when Detect counts only a few.
   - (There is no ADOPT option: the kit copy is the studio's router, cut at export to the skills the kit ships, but its text still names the studio's own files and rules (`SKILLS.md`, `library/`, `tools/sync-skills.mjs`, the hard rules), which you do not have.)
   - Not sure: the option recommended above for what Detect found: FOLD when it found a router or list, ADAPT when it counts more skills than you can name from memory, otherwise no.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no router.
2. **"Where?"** (only when the answer above was ADAPT)
   - User level, when most of your skills serve every project. Recommended when Detect counts more skills there.
   - Project level, when most of your skills belong to one repository. Recommended when Detect counts more skills there.
   - Not sure: the option recommended above, the level where Detect counts more skills; project level, the narrowest choice, on a tie.
   - Default when skipped: project level.
3. **"Give Claude the rules for skills at every session start?"** (only for ADAPT or FOLD) The kit copy carries `session-start.md`: six short rules (look for a skill before acting, process skills before the rest, say which skill is in use, read it as it is now, your instructions outrank skills, a subagent on one task skips them) that the studio injects at the start of every session through a hook of its own.
   - No: the file is left out, and the router is found through its description alone. Recommended when Detect counts only a handful of skills, or you want nothing more loading every session.
   - A start-up hook: your version of the file, printed by a `SessionStart` hook (a command Claude Code runs when a session begins; what it prints becomes context Claude sees) at each start, after `/clear` and after a compaction ([docs/facts.md](../docs/facts.md), "Claude Code: hooks"). About 479 tokens every session for the kit copy's rules (estimate, bytes divided by 4); yours cost what they weigh. Recommended when Detect counts many skills and Claude often starts work without the one that fits.
   - FOLD the rules into your front door: the same lines in your instruction file, which loads every session anyway and is read again after a compaction ([docs/facts.md](../docs/facts.md), "Claude Code: context commands, subagents, extra folders"). About the same cost, and no hook. Recommended when you keep one front door and want no hooks.
   - Not sure: the option recommended above for what Detect counted: the start-up hook when it counts many skills and Claude often starts work without the one that fits, otherwise no, the router alone.
   - Default when skipped: no.

## Needs

Nothing beyond Claude Code.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/skills/using-agent-skills/`: scans it with SkillSpector, triages, and recommends against what Detect found. The kit's maintainers' latest scan result is in `catalog/skills/using-agent-skills/SOURCE.md`; your own scan is the one that decides, and a newer SkillSpector may score it differently ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").
2. **Claude:** lists every skill you have at both levels, by name and description, and flags near-duplicates. For each pair you choose the copy to keep; on your yes, Claude folds the other copy's good lines into it and moves the dropped copy, never deletes it, to a folder outside the skill folders, such as `<your setup>/archive/skills/`, so it no longer loads.
3. **Claude:** writes the router in your words:
   - the tree names only skills you have; the export has already cut the kit copy's rows to skills the kit ships, and every row for a skill you did not take, and every line about a studio file (`SKILLS.md`, `library/`, `tools/sync-skills.mjs`), the hard rules or a command you do not have, is dropped;
   - the rules keep two ideas: look for a matching skill before non-trivial work, and the chains your own skills form;
   - the description says, in your words, when to use it;
   - `references/claude-code-tools.md`, notes on running a whole plan through one orchestrator subagent, is kept only if you take [subagent-driven-development](subagent-driven-development.md), with its pointer in the rules; otherwise both go. Its claim that subagents can start subagents of their own, three layers deep by default, matches [docs/facts.md](../docs/facts.md) ("Claude Code: where skills, agents and instruction files load from"); the setting it names for that depth is not documented there as of 2026-11-02, and its studio rule on which model the orchestrator runs becomes your own rule or goes;
   It shows you the file before saving it.
4. **Claude:** acts on your answer to question 3, and shows each change before saving it:
   - No: `session-start.md` and the router's line about it are left out.
   - A start-up hook: writes your `session-start.md` beside the router, in your words. The studio's skill names you do not have, its `AGENTS.md` and studio rules, and "the owner" are replaced by your skills, your own instruction files and you. Then it merges a `SessionStart` entry into the settings file at the router's level (`.claude/settings.json` or `~/.claude/settings.json`), keeping every other setting, with one matcher group each for `startup`, `clear` and `compact` and a command that prints the file by its full path, for example `cat "$HOME/.claude/skills/using-agent-skills/session-start.md"`.
   - FOLD: the same rules, in your words, as a short section of your front door.
5. **Claude:** records the decision, the place, the answer to question 3 and the undo in `adoption/decisions.md`, with a note: add a line to the router whenever a skill lands or leaves.

## Check

1. **Claude:** reads every skill name in the router and looks for its folder at both levels. Expected: every name is found.
2. In a new session, asking "which skill should I use to `<a task one of your skills covers>`?" makes Claude use the router and name that skill.
3. With the start-up hook: **you:** type `/hooks`; it lists the `SessionStart` entry and the file it comes from. In a new session, asking "what do your session-start rules say about skills?" makes Claude repeat your first rule.

A name with no folder, or an answer that names another skill or none, means the item is not done: the plan row stays unticked until the router's line is fixed. With the hook, an entry missing from `/hooks`, or a new session that does not know your first rule, means the hook did not run: the row stays unticked too.

## Undo

- **Claude:** deletes the router's folder; for FOLD, it removes the lines it added. The skills it routes to are untouched. It marks the row in `adoption/decisions.md` as undone.
- A copy moved out in step 2 goes back by moving its folder back.
- **Claude:** with the start-up hook, removes its `SessionStart` entry from the settings file it went into, keeping every other setting, and deletes `session-start.md`; for FOLD, removes the section from your front door. Each with the diff shown.

## Watch out

- **A router goes stale.** It names what existed on the day it was written; a line for a skill you removed sends Claude after nothing. Change the router whenever a skill lands or leaves.
- **The kit copy names commands you may not have,** such as `/code-review`, `/verify` and `/run`. Whether a command exists in your Claude Code is not documented in docs/facts.md as of 2026-11-02, so keep a command in your router only after you have seen it work.
- **Some rows may point at skills you did not take.** The kit copy's rows name only skills the kit ships (brainstorming, writing-plans, executing-plans and the rest); keep a row only for the ones you take, and do not go looking for the others.
- **One router, one copy.** If the same router sits at project and user level, the user copy wins ([docs/facts.md](../docs/facts.md)), and the two drift apart.
- **Token cost:** the kit copy's description is about 56 tokens (estimate) every session, and its body about 1,000 tokens (estimate) when used. `session-start.md`, wired as a hook, adds about 479 tokens (estimate) at each session start, and again after each `/clear` and compaction; `references/claude-code-tools.md`, about 450 tokens (estimate), loads only when Claude opens it. Your own router costs what its description and map weigh; Claude tells you the estimate when it writes it.
- **A start-up hook runs for every session at its level.** At user level it prints the rules into every project, including ones whose skills differ; put the hook at the same level as the router it points to.
