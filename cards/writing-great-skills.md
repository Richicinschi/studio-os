---
id: writing-great-skills
module: 05-skills
checked: 2026-11-09
tokens:
  description: 74
  body: 2045
---

# Writing your own skills

## Why

- **The problem:** most first skills are copied from a colleague, a post or a popular repository, and nobody reads them. Copies then multiply, each edited a little, and every description sits in Claude's context on every turn.
- **The reason:** this skill gives you the words and the checks to write your own skill from a task you repeat: a description that holds only the phrases that should start it, steps that each end on a condition Claude can check, long reference moved into a separate file, and one place for each rule. Its aim is predictability: the same process on every run.
- **The cost of skipping it:** copying stays the only way to get a skill. When the studio reviewed an outside framework, it took five ideas and copied no file, which works only when you can write the skill yourself ([the outside-framework review](../examples/outside-framework-review.md)).
- **The principle:** [fit, not copy](../PRINCIPLES.md#fit-not-copy). You write each skill for your tools and your scale instead of installing someone else's.

## Detect

Read-only. Names, descriptions and counts.

- A skill named `writing-great-skills` at project level (`.claude/skills/`) or user level (`~/.claude/skills/`, or under `$CLAUDE_CONFIG_DIR` when that is set).
- Another skill doing the same job: one whose description is about writing, reviewing or improving skills. Names and descriptions only, never a skill's body.
- How many skills you have at each level, counted by folder.
- Whether your front door already holds a checklist for writing skills.

The menu marks the item **have** when `writing-great-skills` or another skill for writing skills exists, **partly** when only a checklist in your front door or notes does that job, and **not yet** otherwise.

## Ask

1. **"Take writing-great-skills?"**
   - ADAPT: install it with its description rewritten in your words and the studio's references replaced. Recommended when Detect found no skill for writing skills and you plan to write some.
   - FOLD: add its five checks (Steps, step 4) to the skill for writing skills you already have. Recommended when Detect found one.
   - ADOPT as it is. Only its description, its front matter and one note in `references/bulletproofing.md` name studio things, so ADAPT costs little more.
   - No: you do not plan to write skills.
   - Not sure: the option recommended above for what Detect found: FOLD when it found a skill for writing skills, otherwise ADAPT.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not installed.
2. **"Where?"** (only when the answer above was ADAPT or ADOPT)
   - Every project on this machine (user level). Recommended: writing skills is not tied to one project.
   - This project only.
   - Not sure: every project on this machine, the option recommended above; moving it later is one folder.
   - Default when skipped: this project only.
3. **"Write your first skill with it now?"**
   - Yes, from a task you repeat every week, such as a dashboard checklist or a SQL review. Recommended when you named such a task in the drill.
   - Later.
   - Not sure: the option recommended above: yes when you named such a task in the drill, otherwise later.
   - Default when skipped: later.

## Needs

Nothing beyond Claude Code.

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/skills/writing-great-skills/`: scans it with SkillSpector, triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers' latest scan result is in `catalog/skills/writing-great-skills/SOURCE.md`; your own scan is the one that decides. Claude shows each finding with its reading and goes on only after you have read them.
2. **Claude:** on your yes, writes it to the place you chose (`.claude/skills/writing-great-skills/` or `~/.claude/skills/writing-great-skills/`), with:
   - a description in your words, holding only the phrases that should start it;
   - the description's reference to the studio's own vetting skill replaced by your route (the kit's `vet-and-adopt`, or your own scan step);
   - `GLOSSARY.md` beside it, since the body points to it;
   - the "Pressure-testing" section and the two files it points to, `references/testing-skills-with-subagents.md` and `references/bulletproofing.md`, kept together or dropped together. The testing reference assumes a test-first skill named `tdd` (the kit's [tdd](tdd.md)); its pointer goes to yours, or the line is cut. `references/bulletproofing.md` has one sentence that says part of the research is "not part of the studio copy"; reword or cut it.
   It shows you the files before saving them. For FOLD, it shows the lines it adds to your existing skill instead.
3. **you:** if you chose to write a skill now, name the task.
4. **Claude:** drafts that skill and, before saving, checks five things (module 05, step 4): the description names the triggers, in your words, and nothing else; each step ends on a condition Claude can check; long reference sits in a separate file the skill points to; no line repeats what another skill or your front door already says; every line changes what Claude would do by default. It shows you the draft and saves it on your yes.
5. **Claude:** records the decision, the place, the first skill's name if there is one, and the undo in `adoption/decisions.md`.

## Check

1. The file exists at the place you chose, `.claude/skills/writing-great-skills/SKILL.md` or `~/.claude/skills/writing-great-skills/SKILL.md`, with `GLOSSARY.md` beside it.
2. In a new session, saying one of the trigger phrases from its new description together with one of your own skills, for example "improve this skill: `<path to a SKILL.md>`", makes Claude use writing-great-skills before it answers, and the answer uses at least one of the skill's terms: one trigger per branch, a completion criterion, a no-op.

If Claude answers without using the skill, the description's triggers do not match how you ask: the plan row stays unticked, and Claude rewrites the triggers with you.

## Undo

- **Claude:** deletes the folder it wrote, at project or user level; for FOLD, it removes the lines it added. It marks the row in `adoption/decisions.md` as undone.
- A skill you wrote with it stays; remove that one on its own if you want.

## Watch out

- **Token cost:** its description, about 74 tokens (estimate), loads every session. The body, about 2,160 tokens (estimate), loads only when it is used, and `GLOSSARY.md`, about 3,760 tokens (estimate), only when Claude follows the pointer to it; so do the two references, about 2,470 and 640 tokens (estimates).
- **The description budget is shared.** All skill descriptions together get 1% of the context window (8,000 characters when that cannot be worked out); past it, the descriptions of the skills you use least are dropped first, and one description is capped at 1,536 characters ([docs/facts.md](../docs/facts.md)). Short descriptions that hold only triggers keep yours in view.
- **One copy of each skill.** A user-level skill wins over a project skill of the same name ([docs/facts.md](../docs/facts.md)); the studio's own audit found stale personal copies hiding the project's newer ones ([the rules audit](../examples/rules-audit.md)).
- **In claude.ai,** a custom skill is uploaded as a zip and needs code execution turned on; on Team and Enterprise an owner can turn skill creation off ([docs/facts.md](../docs/facts.md), "claude.ai: custom skills and the built-in document skills").
