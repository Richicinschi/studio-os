---
id: claim-auditor
module: 09-data-work
checked: 2026-11-02
---

# Claim auditor

## Why

- **The problem:** a number in a dashboard, a report or a slide that nobody can trace back to the query behind it. Once it has left your hands, finding its source is slow, and taking it back is worse.
- **The reason:** the skill lists every claim in a deliverable, axis labels, table headers and units included, names the source of each, re-runs the script or query behind every figure instead of trusting a quoted value, and grades each one GREEN (re-run and matches), AMBER (indirect or stale source) or RED (no source, or it does not match). A claim it cannot trace is itself a finding.
- **The cost of skipping it:** the studio's usage review named unverified claims its most persistent kind of rework: cheap to check before shipping, expensive to retract after ([module 09, The problem](../modules/09-data-work/README.md#the-problem)).
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The audit re-runs what produced each figure and lists what it could not check, so "the numbers are right" becomes a report you can read.

## Detect

Read-only: folder names and the front matter of skills and agents (their name and description), never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/claim-auditor "$U/skills/claim-auditor" 2>/dev/null`.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names and nothing else:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'fact.?check|claims|every number|verify the figures|sourced' && echo "$f"; done`
- A rule already folded into an instruction file: `grep -inE 're-?run|every (number|figure)|source of' CLAUDE.md AGENTS.md 2>/dev/null`. Claude reads the matching lines to judge whether they ask for a source per figure.

The menu marks the item **have** when a skill named `claim-auditor` exists, or another skill's description covers tracing claims to their source; **partly** when only an instruction-file rule asks for sources; **not yet** otherwise.

## Ask

1. **"Take claim-auditor?"** Recommended when your work is ML or data. (ADOPT as it is is not offered: the skill was written in the studio, and its examples and its RED list name the studio's own cases.)
   - ADAPT: rewritten in your words, with your own list of claims that are RED on sight. Recommended when Detect says **not yet** and you ship numbers, charts or reports to other people.
   - FOLD: add its re-run-and-grade steps to the review skill or instruction rule you already have. Recommended when Detect says **partly**.
   - Skip. Recommended when Detect says **have**, or when nothing you make carries numbers.
   - Not sure: the option recommended above for what Detect found: skip for **have**, FOLD for **partly**, ADAPT for **not yet**, with the RED-on-sight list it would write shown to you before anything is saved.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"** (only for ADAPT)
   - This project: `.claude/skills/claim-auditor/` in the repository.
   - Every project: `~/.claude/skills/claim-auditor/`. Recommended when you write reports in more than one repository.
   - Not sure: the option recommended above: every project when you write reports in more than one repository, otherwise this project, the narrower choice; moving it later is one folder.
   - Default when skipped: this project.

## Needs

- Nothing beyond Claude Code for the skill itself.
- Whatever produces your figures, on the machine where Claude runs: the skill re-runs the script or query behind each number, so Claude needs the same interpreter, database client or file you used, with your access. Installing those is not documented in docs/facts.md as of 2026-11-02.
- SkillSpector, for the scan in step 1: row 1 of your plan ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").
- In claude.ai instead: code execution turned on, so Claude can re-run an uploaded file ([docs/facts.md](../docs/facts.md), "claude.ai: custom skills and the built-in document skills").

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/claim-auditor/`: a static scan, `skillspector scan catalog/skills/claim-auditor --no-llm` (on Windows, `$env:PYTHONUTF8=1` first in PowerShell, or `PYTHONUTF8=1` in front of the command in Git Bash), then the triage, then a recommendation of SKIP, FOLD or ADAPT against what Detect found. The studio's scan of this copy on 2026-11-02 said SAFE, 0/100; your own result is the one that counts.
2. **you:** name the claims that are RED on sight in your work: the outward-facing ones that are hardest to take back. The studio's list (licences, partnerships, live deployments, compliance status, what another company's product does) is a starting point, not yours. A data team might name revenue figures, customer counts, or anything said about a named client.
3. **Claude:** for ADAPT, on your yes, writes the skill in your words: a description holding the phrases you would say ("check every number", "audit this report"), your RED-on-sight list, and the six steps (extract every claim, find its grounding, re-run, check what diagrams and paths claim exists, grade, report). It drops the studio's history paragraph and its dated reference to a usage review, and the scope note's pointers to `/code-review` and `ponytail-audit`, which this kit does not ship; in their place goes a line naming the review tools you use, or nothing. It shows you the file before it saves it in the scope you chose.
4. **Claude:** for FOLD, adds the re-run rule, the three grades and the "never soften a finding" rule, in your words, to the skill or instruction file Detect found, and nothing else.
5. **Claude:** asks where the claims list goes. The skill writes `audit/claims.jsonl` in the folder it runs in. When the claims quote figures your company treats as confidential, that folder goes into `.gitignore`, or the list goes into a temporary folder; Claude writes the choice into the skill.
6. **Claude:** records the decision, the scope, the scan result and the undo in `adoption/decisions.md`.

## Check

1. **Claude:** in a temporary folder, writes a short test note with two figures and a one-line script that computes the first; the second figure is wrong on purpose and has no source.
2. **you:** in a new session, say "audit the claims in <the note>". Expected: a report with both claims, the first GREEN with the command Claude re-ran and its output, the second RED, and counts per grade at the end. Then Claude deletes the temporary folder.

If the wrong figure comes back GREEN or AMBER, or the GREEN one has no command beside it, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes `.claude/skills/claim-auditor/` (this project) or `~/.claude/skills/claim-auditor/` (every project). For FOLD, it removes the lines it added, which `adoption/decisions.md` names.
- **Claude:** removes any `audit/` folder the skill left behind, after showing you what is in it, and the `.gitignore` line if it added one.
- **Claude:** adds the removal to `adoption/decisions.md`.

## Watch out

- **Context cost:** its description loads every session, about 140 tokens; the body, about 1,060 tokens, loads only when it runs. Both are estimates (bytes divided by 4).
- **It re-runs your queries.** A figure from a warehouse means a query against that warehouse, with your access. Give Claude read-only access where you can; it runs nothing you have not allowed. In claude.ai, Claude can re-run only what it can execute there, such as an uploaded file with code execution on; a warehouse query you run yourself ([module 09, Apply it in claude.ai](../modules/09-data-work/README.md#apply-it-in-claudeai)).
- **A report full of RED is the point.** The skill's one firm rule is never to soften a finding: not by downgrading a grade, not by leaving out a claim it could not source, not by rewording a number until it needs no support. If you rewrite the skill, keep that rule.
- **"It was in the previous draft" is not a source.** Nor is a figure quoted in a commit message, a chat or Claude's own earlier summary; the skill follows each one back to the original or grades it RED.
- **The studio's RED-on-sight list came from its own retractions:** a licence claim that was not true, evidence of a live deployment that had to be taken out of a deliverable, and figures re-derived after they shipped, as the kit copy's "Why this exists" section tells it.
- **It reports; it does not fix.** Run it last, on what is about to leave your hands, and fix the findings as a separate step.
- **Your scanner is likely newer** than the build that reports 2.2.3, which the studio used ([docs/facts.md](../docs/facts.md), "Installing SkillSpector"), so its findings can differ; triage what yours says.
