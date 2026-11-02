---
title: Skills
pack: foundation
sources:
  - .studio/memory/feedback_skill_adoption_disposition.md
  - .studio/memory/reference_skillspector.md
  - .claude/skills/writing-great-skills/SKILL.md
questions:
  - "Do you already reuse skills, saved prompts or templates? Where are they?"
  - "Would you write your own skills for tasks you repeat, such as a dashboard checklist or a SQL review?"
---

# Skills

## The problem

A skill is a set of instructions that loads into Claude's context and steers it, sometimes with scripts that run on your machine. Most first skills are copied from a colleague, a post or a popular repository, and nobody reads them. A copied skill can carry a prompt injection, a script that sends data out, or a licence that never allowed the copy.

The second problem is slower. Copies multiply: the same skill in two projects and in your user folder, each edited a little, until nobody knows which one is right. And every skill costs context, because its description sits in the window on every turn.

## The mechanism

- **Scan first.** Anything from outside that runs inside a session (a skill, a plugin, an MCP server, a hook) goes through SkillSpector before it is installed, updated or adapted: a static scan, no API key, no cost. The scan is a gate, not a judge. Read every finding in what a session actually loads, and check the code by hand for traffic that leaves your machine (`fetch`, `http`, write keys), because the scanner reads prose better than it reads egress.
- **Then decide against what you already have; never copy-and-install.** The studio's four outcomes:
  - **SKIP:** you already have it, or it does not fit. The most common outcome.
  - **FOLD:** take its one good idea into a skill you already own.
  - **NEW SKILL:** only for a real gap.
  - **NEW AGENT:** when the thing is really a role that scans, reports and acts.

  The kit's `vet-and-adopt` runs this decision with the labels SKIP, FOLD, ADAPT and ADOPT; ask it too whether the item should be a skill or an agent. "Adopt zero of N" is a correct result, not a failure. Record why each candidate died, so nobody evaluates it again in six months. Read the licence itself: stars grant no rights, and tooling can report a licence it cannot parse as no assertion at all.
- **One copy of each skill.** It lives in one place, for one project or for all of them, and you improve that copy instead of adding a second.
- **Write your own with `writing-great-skills`.** Its root virtue is predictability, the same process on every run: a description that holds only trigger phrases, steps that end on a condition Claude can check, long reference in separate files, one source of truth for each meaning.
- **Route with `using-agent-skills` once there are many:** one router skill that names the others and when to reach for each.

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

The studio reviewed an outside process framework, published as a Claude Code plugin. Its static scan rated it critical, "do not install", from a large number of findings. The studio checked the high-severity classes by hand, and no finding survived: byte patterns matched inside screenshots, command text telling the agent to use its ordinary tools, and ordinary English words read as malicious package names.

The one real issue produced no finding at all: telemetry, on by default, that sent data about the user and the repository out. It lived in hook code that the scanner's heuristics do not model. The studio took ideas from the framework and copied no file.

The lesson: the scan is a gate, the reading is yours. The full review is in [the worked example](../../examples/outside-framework-review.md).

## Apply it in Claude Code

1. **Learn where skills load.** A project skill sits in the repository's `.claude/skills/<name>/SKILL.md`; a user skill in `~/.claude/skills/<name>/SKILL.md` serves every project. Rules and precedence are in [docs/facts.md](../../docs/facts.md), "Claude Code: where skills, agents and instruction files load from".
2. **List what you have.** Ask Claude to list every skill in both places and flag near-duplicates. Keep the better copy of each pair and fold the other's good lines into it.
3. **Run every new skill through `vet-and-adopt`**, this kit's catalog included. Scan commands are in docs/facts.md, "Installing SkillSpector".
4. **Adopt `writing-great-skills`** and write your first skill from a task you repeat every week, such as a dashboard checklist or a SQL review. Before you save it, check that:
   - the description names the triggers, in your words, and nothing else;
   - each step ends on a condition Claude can check;
   - long reference sits in a separate file the skill points to;
   - no line repeats what another skill or your `AGENTS.md` already says;
   - every line changes what Claude would do by default.
5. **Adopt `using-agent-skills`** once you lose track of your skills (ADAPT, studio-specific: its map routes to the studio's own skills, some of them not in this kit; drop every line for a skill you do not have).

## Apply it in claude.ai

1. **Upload a skill** as docs/facts.md describes ("claude.ai: custom skills and the built-in document skills"). On Team and Enterprise an owner can turn skill creation off, so ask first.
2. **Scan before you upload,** on your own computer, since claude.ai has no terminal. If you cannot install SkillSpector, read the `SKILL.md` and every script and ask Claude to point out each network call.
3. **Keep one copy.** When you change a skill, replace the uploaded one instead of adding a second version.
4. **Write your own in a Project:** add `writing-great-skills` to the Project's knowledge and use the checklist above.

Catalog items used here: [writing-great-skills](../../catalog/skills/writing-great-skills/SOURCE.md) · [using-agent-skills](../../catalog/skills/using-agent-skills/SOURCE.md) · `skillspector` (listed in [the catalog index](../../catalog/INDEX.md), not shipped).
