# ATTRIBUTION — legal-* sign-off skill suite

This suite takes method, structure and checklists from open-source projects, and a small amount of text from two MIT projects; the Dutch/EU and platform substance is written from primary law. This file records, for each source, its licence as found, its copyright line, and what was really taken: **text**, **structure**, **method**, or **nothing**.

## Status

Published in the Studio OS kit (MIT) since v3.0.0 (2026-11-09). Re-reviewed on 2026-11-10 by text comparison: every text file of this suite was compared with every version in the git history of each source named below (MobSF at its latest commit only; datenanfragen and AppCensus were not compared), looking for shared runs of 10 or more words, shared runs of 6 to 9 words with the files named as idea sources, and near-copied sentences, with a clause known to be taken over as the positive control. That comparison cannot see paraphrase, translations, or text in binary files.

## Text taken over (MIT)

These two sources gave text. Each file that holds it carries, next to the text, the source's copyright line and the MIT permission notice, and says that the text was adapted and changed.

| Source | Licence | Copyright | What was taken | Where |
|---|---|---|---|---|
| [miketromba/skills](https://github.com/miketromba/skills) (`legal-tos-privacy`) | MIT | Copyright (c) 2026 Michael Tromba | **Text**, adapted and changed: the consumer-rights savings clause and the severability clause. **Method**: auditing the app's code before drafting (→ `legal-doc-draft`). | `legal-terms-review-nl/assets/eu-safe-clauses.md` §2 and §2a |
| [rshankras/claude-code-apple-skills](https://github.com/rshankras/claude-code-apple-skills) | MIT | Copyright (c) 2025 Ravishankar | **Text**, adapted and changed: the app-practice → Apple data-type table. **Method**: the Guideline 5.1 pre-flight (→ `legal-apple-gate`). | `legal-apple-gate/assets/app-privacy-label-template.md`, "App-practice → Apple data-type quick map" |

## Structure or method only, text not copied (permissive licences)

| Source | Licence | Copyright | What was taken |
|---|---|---|---|
| [anthropics/claude-for-legal](https://github.com/anthropics/claude-for-legal) | Apache-2.0 | Copyright 2026 Anthropic PBC (in its README; its LICENSE file has no copyright line) | **Method and structure**: the governance layer — source-attribution tiering (`references/method/attribution-tiering.md`), the severity floor, the anti-hallucination cite rule, the verdict-band model, and the legal-disclaimer convention (turned into our authority footer); the requirement table and per-requirement diff of its `reg-gap-analysis` skill (→ `legal-reg-monitor`); the per-phrase pattern of its `marketing-claims-review` skill (→ `legal-health-claims`). No text. |
| [simota/agent-skills](https://github.com/simota/agent-skills) (`clause`) | MIT | Copyright (c) 2025 (no name given) | **Structure and method**: the SCOPE→SCAN→ASSESS→REPORT→SUGGEST flow, the finding-ID convention, and the EULA enforceability table and cross-document consistency matrix as ideas (→ `legal-terms-review-nl`, `legal-cross-store`); its Compliance Delta pattern and effort taxonomy (→ `legal-reg-monitor`). No text. |
| [cruisediary/apple-app-review-skills](https://github.com/cruisediary/apple-app-review-skills) | MIT | Copyright (c) 2026 Cruz | **Structure**: atomic check → composed agent → Scan/Analyze/Report/Remediate, and the severity tiers, mirrored for `legal-apple-gate` and `legal-play-gate`. No text. |
| [mukul975/Privacy-Data-Protection-Skills](https://github.com/mukul975/Privacy-Data-Protection-Skills) | Apache-2.0 | Copyright 2025 Mahipal | **Structure**: the SKILL.md frontmatter and the `references` + `scripts` + `assets` folder layout. No text; the long runs both share are quotations of EU law. |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) · [rohitg00/awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit) | MIT / Apache-2.0 | Copyright (c) 2025 VoltAgent / Copyright 2026 Rohit Ghumare | **Method**: the read-only-auditor tool-scoping pattern and the falsifiable-assertion finding shape (Severity/Location/Impact/Remediation). No text. |
| [phuryn/pm-skills](https://github.com/phuryn/pm-skills) · [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | MIT / MIT (repository root licence of each) | Copyright (c) 2026 Pawel Huryn / Copyright (c) 2025 Alireza Rezvani | **Method**: the `[LEGAL REVIEW REQUIRED]` inline-flag convention and the anti-generic rule; the regex/keyword code-scan idea, re-implemented in our Dart-aware scanners. No text. |

## Ideas only, never copied (AGPL-3.0, no licence, Commons Clause)

Ideas and patterns were re-expressed in the suite's own words; **no file or template text from these sources is in this suite.**

| Source | Licence | Copyright | What was taken |
|---|---|---|---|
| [lawve-ai/awesome-legal-skills](https://github.com/lawve-ai/awesome-legal-skills): the skills `dpia-sentinel-oliver-schmidt-prietz`, `gdpr-privacy-notice-eu-oliver-schmidt-prietz` and `politique-cookies-malik-taiar` | AGPL-3.0 (each skill's own licence). The repository root licence changed: Apache-2.0 from 2025-12-24, AGPL-3.0 from 2026-01-28, CC BY-NC-ND 4.0 from 2026-02-12. | No copyright line; each skill names its author in its metadata | **Method**: the Art. 35(3) routing and the nine-criteria presumption (→ `legal-gdpr-audit` Step 3); a Verify stage with an Art. 13 checklist, and the EN/NL parity rule (→ `legal-privacy-review`, `legal-doc-draft`); a patch-only drafting rule (→ `legal-doc-draft`); the analytics-consent decision logic, CNIL → AP (→ `legal-analytics-consent`). No text: a short maxim and condensed Art. 13 item wording that were close to its text were reworded on 2026-11-10. |
| [zubair-trabzada/ai-legal-claude](https://github.com/zubair-trabzada/ai-legal-claude) | none (no licence file: all rights reserved) | No copyright line | **Method**: the weighted multi-agent → synthesis orchestration pattern and the "poison-pill" red-flag idea (retargeted to BW 6:236/237); its US clause library served only as a list of terms to strip. No text. |
| [nisrulz/app-privacy-policy-generator](https://github.com/nisrulz/app-privacy-policy-generator) | AGPL-3.0 | Copyright 2017 Nishant Srivastava (in its LICENSE notice) | **Method and structure**: the intake-wizard question set, the SDK-registry idea, and the liability-cap retain-list pattern. No text. |
| [Privado-Inc/privado](https://github.com/Privado-Inc/privado) (`rules/`) | LGPL-3.0 with the Commons Clause (`rules/LICENSE`) | No copyright line in its licence file | **Structure**: the data-category taxonomy structure and the "no matching field → not Art. 9" adversarial-test idea. No YAML, no text. |

## External tools, invoked as separate programs (not linked, not copied)

`legal-data-surface-scan/scripts/run_*.mjs` run these as separate processes and read their output; their copyleft does not reach this suite's code.

| Tool | Licence | Copyright | How it is used |
|---|---|---|---|
| [Exodus Privacy `exodus-standalone`](https://github.com/Exodus-Privacy/exodus-standalone) | AGPL-3.0 | No copyright line in its licence file | Android tracker/SDK scan, run in Docker by `run_exodus.mjs`. Nothing taken. |
| [MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF) | GPL-3.0 | No copyright line in its licence file | Static/dynamic APK and IPA analysis, driven over its REST API by `run_mobsf.mjs`. Nothing taken. |

## Method only, no dependency (not copied)

| Source | Licence | Copyright | What was taken |
|---|---|---|---|
| PolicyLint and PoliCheck ([benandow/PrivacyPolicyAnalysis](https://github.com/benandow/PrivacyPolicyAnalysis)) · [PoliGraph](https://github.com/UCI-Networking-Group/PoliGraph) | BSD-3-Clause-style (university wording) / MIT | Copyright (c) 2019, North Carolina State University / Copyright (c) 2023 UCI Networking Group | **Method**: the disclosure-grading rubric. No text. |
| datenanfragen (label versus traffic) · AppCensus | not checked | not checked | **Method**: comparing a store label with the app's observed traffic. Not compared in the 2026-11-10 check. |

## Primary law / official docs

Freely citable; quoted per the attribution tiering with last-verified dates: GDPR/AVG, Dutch BW 6:233/236/237, CRD 2011/83, Dir. 93/13, ePrivacy 2002/58 + Telecommunicatiewet 11.7a, MDR 2017/745 + MDCG 2019-11, FTC HBNR, EU-US DPF decision 2023/1795, AP guidance.

Apple's and Google's store rules (the App Store Review Guidelines, App Privacy Details, the minimum EULA terms, App Store Connect Help, Google Play policies and Play Console Help) are copyright of Apple Inc. and Google LLC. Quotations from them are short extracts used to review an app against the rule, each with the owner, the rule or article number and the URL; elsewhere the suite paraphrases them. It holds no copy of their pages and no script fetches them. Check the live pages for the current text. App Store, Apple, Google Play and Google are trademarks of their owners, used here only to name them.

## Corrections on 2026-11-10

- Removed a credit to a "compliance-anthropic" DPA-review checklist in claude-for-legal, marked lift-with-attribution here and in `legal-gdpr-audit`: no file of that name exists in any commit of that repository, and none of its text is in this suite.
- Removed the claim in `legal-gdpr-audit` that a lawve-ai risk-register schema was re-implemented as its Step 3: the suite has no risk register.
- Licences corrected: exodus-standalone is AGPL-3.0 (was "GPL family"); phuryn and alirezarezvani are MIT at the repository root (was "mixed"); the lawve-ai root licence history was added.
- The Apache-2.0 sources left the taken-over table: no Apache-2.0 text is in this suite.
- Reworded in the suite's own words: an EN/NL parity maxim (five places), a quoted paraphrase of a lawve-ai drafting rule (`legal-doc-draft`), and the Art. 13 item wording in `legal-privacy-review` and `references/nl-eu-law/gdpr-articles.md`. The twelve Art. 13 items and their order are the statute's and stay.
- The two files that hold taken-over text now carry the source's copyright line and the MIT permission notice.
