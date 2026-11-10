---
id: pack-app-legal-privacy-terms-store-review
module: domains
checked: 2026-11-10
tokens:
  light: 53
  standard: 53
  full: 75
---

# Domain: app legal, privacy policy, terms and store review

## Why

- **The problem:** an app that collects any data needs a privacy policy and terms that match what the code does, and both stores check it. A maker without a lawyer on call writes the text from a template, then finds out at review time that it says something the app does not do.
- **The reason:** this pack gives Claude fifteen legal skills for an app, each a short procedure. Representative jobs: draft or update a privacy policy and terms (`legal-doc-draft`), scan the code for what the app really collects (`legal-data-surface-scan`), grade the policy against those findings (`legal-flow-grader`), check the Apple and Google store gates (`legal-apple-gate`, `legal-play-gate`), and run the whole suite for one verdict before submission (`legal-signoff-orchestrator`).
- **The cost of skipping it:** the policy is judged by feel, a store rejects the submission late, or the policy promises something the code does not keep.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The suite checks the policy against what the code collects before it calls a document ready, and it marks every legal statement it has not confirmed against a source.

## Detect

Read-only: presence and versions, never the contents of your files.

- The pack, at project and user level: `ls -d .claude/skills/app-legal-privacy-terms-store-review "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/app-legal-privacy-terms-store-review 2>/dev/null`.
- The standalone stub: `ls -d .claude/skills/legal-signoff-orchestrator "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/legal-signoff-orchestrator 2>/dev/null`.
- Tools the pack's scripts use: `node --version` (the data-surface scripts need Node 16 or newer). Optional, for the binary scans only: `docker --version | head -1`. The skills carry no `requires` list; these are the tools named in the skill files.
- Another skill that already does legal or privacy review, from its front matter only:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'privacy|terms of service|gdpr|legal|store review'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already does legal or privacy review and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you publish an app that collects data or has an account, a subscription or analytics?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names an app, a store listing, a privacy policy or terms of service as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one app needs the review.
   - Every project, in your user folder. Recommended when you publish several apps.
   - Not sure: this project only.
   - Default when skipped: this project only.
3. **"Take the one-word command for the full sign-off?"** (only on a yes)
   - Yes: the stub `legal-signoff-orchestrator`, which sends Claude into the pack's sign-off skill when you call it by name. About 22 tokens at most (estimate). Recommended when you want a single verdict before each submission.
   - No: Claude finds the skill through the pack's entry. Recommended when you only draft documents.
   - Not sure: yes.
   - Default when skipped: no.

## Needs

- Node 16 or newer for the scripts in `legal-data-surface-scan` and `legal-play-gate`. They read your project files and print JSON; no packages to install.
- Docker, only for the two optional binary scans of a built app (`run_exodus.mjs` pulls an image on first use; `run_mobsf.mjs` talks to a MobSF server and needs `MOBSF_API_KEY`). When a tool is missing, the script says it was skipped and the review reports partial coverage; it does not claim full coverage.
- I found no "Without local tools" section in these skills. On claude.ai, without file access or Node, Claude can draft and review documents you paste in, but cannot run the code scan.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/app-legal-privacy-terms-store-review/`: scans it with SkillSpector (`skillspector scan catalog/packs/app-legal-privacy-terms-store-review --no-llm`), triages the findings, and recommends the decision.
2. **Claude and you:** read the scripts the pack ships together before anything is copied. Six files hold code, all `.mjs`: five in `skills/legal-data-surface-scan/scripts/` (`scan_pubspec`, `scan_android_manifest`, `scan_ios_privacy`, `run_exodus`, `run_mobsf`) and one in `skills/legal-play-gate/scripts/` (`emit_play_csv`). `run_exodus` starts Docker and `run_mobsf` calls a server address; `vet-and-adopt` reads those lines with you.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/app-legal-privacy-terms-store-review/`, and, on a yes to question 3, `catalog/packs/app-legal-privacy-terms-store-review/stubs/legal-signoff-orchestrator/SKILL.md` to `<where>/skills/legal-signoff-orchestrator/SKILL.md`. The pack has no agents. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope, the tools found and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including `skills/legal-data-surface-scan/scripts/` with its five scripts.
2. **you:** in a new session, ask "is my privacy policy complete for what the app collects?". Expected: Claude opens the pack's entry, picks the privacy review skill (its use is "whether a privacy policy is complete, correct or ready to sign off"), says what it needs from your project, and answers from your files.
3. If Claude answers from memory without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `app-legal-privacy-terms-store-review` folder from `skills/`, and the `legal-signoff-orchestrator` folder if it was copied.
- **you:** remove the zip from claude.ai's skill settings, if you uploaded one.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **This is an automated review, not legal advice.** The pack's own description says so: a lawyer signs off. The suite reserves some items for a qualified lawyer (company registration fills, native-language legal wording, anything it marks low-confidence). It is written with Dutch and EU law first, plus the Apple and Google rules; for another country, treat its verdicts as a checklist, not a ruling.
- **Your app is an input; the example app is not yours.** Before any review, the sign-off skill builds an app fact sheet from your project (name, publisher, platforms, markets, audience, data collected, SDKs and hosting region, money) and asks only for what the project cannot tell it, marking the rest unknown. A skill run on its own gathers what it needs the same way. The worked verdicts in the references apply the law to one example app, described in `skills/legal-guardrails.md` section 8: they show the reasoning, and Claude re-runs it on your fact sheet, where a different SDK or legal form can flip the outcome. For the Play data-safety form, `legal-play-gate` reads your own answers file, modelled on `skills/legal-play-gate/assets/data-safety-answers.example.json`; without one it emits the example's answers and warns that they are not your app's.
- **Credited text keeps its notices.** Some of the domain's text follows outside work under the MIT licence. Two files carry the copyright line and permission notice beside the passage they took over (`skills/legal-apple-gate/assets/app-privacy-label-template.md` and `skills/legal-terms-review-nl/assets/eu-safe-clauses.md`), and `skills/legal-guardrails/ATTRIBUTION.md` lists the credits ([the domain's SOURCE.md](../catalog/packs/app-legal-privacy-terms-store-review/SOURCE.md)). The licence asks that copies keep those notices, so leave them in those files, also when you fill the label template with your app's facts. For your own Terms of Service, `eu-safe-clauses.md` says you need not copy the MIT notice when you use its clauses §2 and §2a: two stock contract clauses are unlikely to be substantial portions of the software, and a credit line is optional.
- **The entry is the one cost every session:** about 53 tokens (estimate). Its index, about 1,217 tokens (estimate), loads when an app-legal task comes up, and each skill only when it is used. Figures are bytes divided by 4.
- **Your policy and code are session content.** What Claude reads goes over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). The optional Docker scan pulls an image from the internet on first use. Check your company's data rules before you give Claude a client's app.
