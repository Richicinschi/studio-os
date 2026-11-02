---
title: Scanning a plugin the studio already ran
sources:
  - docs/audits/2026-11-02-superpowers-6.0.3-triage.md
  - docs/audits/2026-11-02-superpowers-7.0.1-triage.md
  - .claude/skills/vendored.json
  - .studio/rules/hard-rules.md
  - .studio/memory/reference_vendored_skills.md
---

# Scanning a plugin the studio already ran

## What happened

For months the studio ran the superpowers plugin without having scanned it. Its scan rule then named only skills it forked or adapted, and an installed plugin was neither. On the day of the scan below, the studio widened the rule to everything that runs inside a session, and the rule cites this scan.

**The first triage, of the installed version.** SkillSpector's static scan of 6.0.3 said 100 out of 100, critical, do not install, from 270 findings. The studio sorted every finding by where it sat. 217 were in material Claude Code never loads: the project's own plans, its tests, its release notes, its GitHub templates, other tools' folders. 53 were in the two folders a session does load, `skills/` and `hooks/`, and each of those was read and judged by hand: 49 false positives, such as the start-up hook flagged for reading the plugin's own file, and four real but low items, such as a debugging example that would print signing details into the conversation.

The finding that mattered was not among the 270. Reading the code turned up one outgoing request: the brainstorming skill's optional browser companion showed a logo loaded from the vendor's website, on by default, so opening it told the vendor the user's IP address and the plugin's version. The project's README disclosed it; no skill file did, and the scanner did not flag it. One environment variable, `SUPERPOWERS_DISABLE_TELEMETRY=1`, switches it off ([docs/facts.md](../docs/facts.md), "Installing superpowers").

**The second triage, of the newest version.** Before deciding anything, the studio scanned 7.0.1 the same way: the same verdict, from 195 findings, 52 of them in loaded folders. 47 were false positives and five were real: the companion's detached local server (by design, listening only on the machine itself with a per-session key), the same debugging example, and a new skill for diagnosing the plugin itself, which reads session transcripts and can search the vendor's public issues with the user's symptom terms without asking first. The logo request was unchanged, and again unflagged.

**The decision, skill by skill.** The studio decided from a table that compared each of the fifteen skills with what it already had:

| Decision | Skills | What it means |
|---|---|---|
| Skip | 1 | The plugin's own diagnosing skill: it reads transcripts and talks to the vendor's issue tracker, and a copy kept by the studio is no longer the vendor's to debug. |
| Adopt | 3 | Kept as they ship: dispatching parallel agents, receiving a code review, verification before completion. |
| Fold | 4 | The good parts taken into the studio's own skills: debugging into `diagnosing-bugs`, test-driven development into `tdd`, skill writing into `writing-great-skills`, and the plugin's start-up rules into the studio's own start-up text and `using-agent-skills`. |
| Adapt | 7 | Kept with the studio's changes: brainstorming (the logo request removed), writing and executing plans, subagent-driven development, requesting a code review, git worktrees, finishing a branch. |

**The adapted copy.** The studio copied the chosen skills into its own repository at the exact release it had triaged, each with its licence and a `VENDORED.md` listing every change, and scanned its copies again: the logo request was gone, the debugging example and the diagnosing skill were not carried over, the local server was kept as upstream, and no new real finding appeared. Then it uninstalled the plugin. For the time between the copy arriving and the plugin leaving, both were installed: every session loaded both sets of descriptions, and Claude saw two skills for each job.

## What it cost, or would have

Months of a request nobody had decided to allow, from a tool whose start-up hook ran in every session. Its cost was small, an address and a version number, but the point is that nobody chose it.

Without the hand reading, the scan alone would have left two wrong answers. Taken at its word, "do not install" would have thrown away fifteen useful skills over findings that were almost all false positives. Taken as noise and ignored, it would have let the one real request through, because the scanner never saw it.

## The rule it produced

- **Everything that runs in a session is scanned before it is installed or updated**: skills, plugins, MCP servers and hooks, not only what you copy.
- **The scan is a gate, not a judge.** Sort findings by whether a session loads the file, read every loaded one, and check the code by hand for anything that leaves the machine.
- **Decide per skill, against what you already have**: skip, adopt, fold or adapt. A plugin is a bundle, and the bundle does not have to be taken whole.
- **Keep one copy of each skill.** Two copies of the same job cost context every session and leave Claude to choose between them.

## How to apply it

- Run `vet-and-adopt` on anything you already have installed that was never scanned; the adoption plan's row 2 does this, read-only, and changes nothing.
- When a scan says do not install, open the findings in loaded folders before you decide, and read the code for network calls yourself.
- If you take the upstream plugin rather than the kit's adapted copies, follow its [card](../cards/superpowers.md): the pinned version, the scan, and the switch for the logo request. Do not install it beside the kit's copies.
- The kit's adapted skills each carry a `VENDORED.md` with every change the studio made, and their cards say what to change for your setup.
