---
title: "Adopting an outside framework: a review that took no files"
studio_sources:
  - .studio/memory/feedback_skill_adoption_disposition.md
  - .studio/memory/reference_skillspector.md
---

# Adopting an outside framework: a review that took no files

The adoption loop run on an outside framework: scan, read, decide, record.

## 1. What it was

An outside process framework, published as one Claude Code plugin, with many commands, skills and agents. Every document it produces passes a generate step, then an automatic validation, then a human review.

## 2. The scan

SkillSpector's static pass rated the plugin critical, do not install, from a large number of findings. Every high-severity finding checked by hand was a false positive:

- command files telling the agent to use its tools, flagged as tool abuse;
- HTML comments in Markdown, flagged as hidden instructions;
- docs saying where an API key lives, flagged as credential access;
- ordinary English words read as the names of malicious packages.

To static heuristics, a process framework looks like a malicious skill.

The scan missed the one real egress. The plugin's hook code, written in a language the heuristics do not model, sent usage data about the user and the repository out by default. An option turned it off. The scan is a gate; the reading is yours.

## 3. The licence

The licence was source-available: it allowed most uses and ruled out one commercial use. The studio took ideas, not files, so it carried no obligation. Before you copy any file from a source-available project, read its licence yourself. The git host's API reported this one as unknown (`NOASSERTION`), so read the licence text, not the badge.

## 4. The disposition

Adopt 0 files. Fold 5 ideas into what the studio already had. Build 2 small tools. Defer 1. Skip the rest.

| Folded idea | Where it went |
|---|---|
| Decisions waiting on the person, listed first in every session | the session-start context |
| A gate whose override is named and recorded | a grants ledger, one row per yes, before the act ([grant-before-merge](grant-before-merge.md)) |
| State written automatically, replacing a close command nobody ran | a draft session archive at every stop |
| Generate, validate, then review, for documents | a plan check before a person reads the plan |
| A third-party manifest checked by a test | a skill front-matter check and one notices file |

The two tools: a drift check of the studio's record against git and disk, and a local record of tokens, cost and duration per session, with nothing leaving the machine. Deferred: routing work to models by tier, until there is measured data. Skipped: the rest of the framework and, actively, its telemetry. The review also lists four smaller folds, taken whenever their surface is next edited.

## 5. Running `vet-and-adopt` on such a skill today

Say you want one skill from a plugin like it. Follow [vet-and-adopt](../.claude/skills/vet-and-adopt/SKILL.md):

1. **Identify.** The skill ships inside a plugin with hooks, and plugins release often. Take the version you would really use.
2. **Scan** the whole plugin from its git URL, not only the skill folder, because hooks run in your session too. The command and the Windows encoding fix are in [docs/facts.md](../docs/facts.md), "Installing SkillSpector". Expect a verdict other than SAFE.
3. **Triage.** Read the findings with Claude, quoting each line. Then read the hook code yourself for outbound calls; the scanner missed one here.
4. **Compare and decide.** What in your setup already does this job? A skill for a tool fits only if you use that tool. Recommend SKIP, FOLD, ADAPT or ADOPT; settle the licence question before you copy any file.
5. **Apply.** An adapted skill goes into `.claude/skills/<id>/` with the upstream's licence file and a note that you changed it. If you install the plugin itself, turn its telemetry off first.
6. **Record** one row in `adoption/decisions.md`: the upstream, its licence, the version, the scan result, and why.
