---
id: pack-dependency-supply-chain-risk-checks
module: domains
checked: 2026-11-09
tokens:
  light: 43
  standard: 43
  full: 82
---

# Domain: dependency supply-chain risk checks

## Why

- **The problem:** an app is mostly other people's packages, and one of them can be maintained by a single person, left to rot, or taken over. You find out when it breaks or turns malicious, not before.
- **The reason:** this pack gives Claude one skill, `supply-chain-risk-auditor`. It lists a project's direct dependencies, finds each one's repository, and judges them against six criteria: a lone maintainer, no upkeep, low popularity, risky features, past serious CVEs, and no security contact. It writes one short report of only the flagged packages, each with a safer replacement. The same method answers "is this package risky before I add it?".
- **The cost of skipping it:** a package gets picked by name and popularity alone, and nobody looks at who stands behind it.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). Every figure in the report comes from the `gh` command, never from an estimate.

## Detect

Read-only: presence and versions, never your files' contents.

- The pack, at project and user level: `ls -d .claude/skills/dependency-supply-chain-risk-checks "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/dependency-supply-chain-risk-checks 2>/dev/null`.
- The standalone stub: `ls -d .claude/skills/supply-chain-risk-auditor "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/supply-chain-risk-auditor 2>/dev/null`.
- The tool the skill requires, and whether it is signed in: `gh --version | head -1`, then `gh auth status 2>&1 | head -2`.
- Which package files your project has, by name only: `ls package.json pubspec.yaml requirements.txt pyproject.toml 2>/dev/null`.
- Another skill that already checks dependencies, from its front matter only:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'dependenc|supply.chain|vulnerab|package'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already checks dependencies and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Does your project depend on packages from npm, pub or pip, and do you want them checked for risk?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names an app, a website or a Python tool that you build and ship.
   - No: skip it. Recommended when you write no code with packages.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project needs it.
   - Every project, in your user folder. Recommended when you ship several.
   - Not sure: this project only.
   - Default when skipped: this project only.
3. **"Take the one-word command?"** (only on a yes)
   - Yes: the stub `supply-chain-risk-auditor`, which sends Claude into the pack's skill when you call it by name. About 39 tokens at most (estimate). Recommended when you will run the audit before each release.
   - No: Claude finds the skill through the pack's entry. Recommended when you will run it rarely.
   - Not sure: yes.
   - Default when skipped: no.

## Needs

- The `gh` command (GitHub's command-line tool), signed in. The skill checks for it first and stops until you install it. It uses `gh` for every number in the report.
- Network access to GitHub for those lookups.
- I found no "Without local tools" section in this skill. Without `gh` and a shell, for instance on claude.ai, it cannot produce the figures it requires, so do not expect the audit there.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/dependency-supply-chain-risk-checks/`: scans it with SkillSpector (`skillspector scan catalog/packs/dependency-supply-chain-risk-checks --no-llm`), triages the findings, and recommends the decision.
2. **Claude and you:** read the scripts the pack ships. A search of the pack found no `.mjs`, `.py` or `.sh` files; the skill is instructions plus one report template (`resources/results-template.md`). The skill does tell Claude to run `gh` commands and to write a folder `.supply-chain-risk-auditor` into your project; `vet-and-adopt` reads those lines with you.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/dependency-supply-chain-risk-checks/`, and, on a yes to question 3, `catalog/packs/dependency-supply-chain-risk-checks/stubs/supply-chain-risk-auditor/SKILL.md` to `<where>/skills/supply-chain-risk-auditor/SKILL.md`. The pack has no agents. It shows the list first and saves on your yes.
4. **you:** install `gh` and run `gh auth login` if Detect did not find them. A command that installs software or signs you in is handed to you to type; Claude does not run it.
5. **Claude:** records the decision, the scope, the tools found and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including `skills/supply-chain-risk-auditor/resources/results-template.md`.
2. **you:** in a new session, say "check my project's dependencies for supply-chain risk" (the skill's use is "auditing a project's dependencies, or checking whether a package is risky before adding it"). Expected: Claude opens the pack, checks that `gh` is installed, creates `.supply-chain-risk-auditor/results.md` from the template, and lists only flagged packages with a reason and an alternative.
3. If Claude answers from memory, with no `gh` figures and no report file, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `dependency-supply-chain-risk-checks` folder from `skills/`, and the `supply-chain-risk-auditor` folder if the stub was copied.
- **you:** delete the `.supply-chain-risk-auditor` folder in a project where an audit ran, if you no longer want the report.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 43 tokens (estimate). Its index, about 199 tokens (estimate), loads when a dependency task comes up, and the skill only when it is used. Figures are bytes divided by 4.
- **It is not a vulnerability scanner.** The skill says to use `npm audit`, `pip-audit` or similar for live scanning, and it does not check licences. It flags risk factors; it does not prove a package is safe or hostile.
- **The wording names the author's own apps.** The skill says "across our apps and Python tools"; read that as your own projects.
- **Package names leave your machine.** Claude sends the repository names it looks up to GitHub through `gh`, and what Claude reads in your project is session content that goes over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you audit a private project.
- **Rate limits on a long run:** a project with many dependencies means many `gh` calls; a signed-in `gh` has a higher limit than an anonymous one.
