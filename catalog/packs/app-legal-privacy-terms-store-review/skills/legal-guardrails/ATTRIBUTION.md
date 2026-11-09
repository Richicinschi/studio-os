# ATTRIBUTION — legal-* sign-off skill suite

This suite was built by harvesting **methodology, structure, and checklists** (not substantive legal text) from open-source projects, plus authoring the Dutch/EU + platform substance from primary law. This file records what was adapted from where and how each source's licence is honoured.

## Handling by licence

### Lift-with-attribution (permissive — Apache-2.0 / MIT)
Structure, methodology, checklists, and (where noted) clause wording adapted with credit:

| Source | Licence | What was adapted |
|---|---|---|
| [anthropics/claude-for-legal](https://github.com/anthropics/claude-for-legal) | Apache-2.0 | The governance layer / "constitution": source-attribution tiering, severity floor, anti-hallucination cite rule, the verdict-band model, the legal-disclaimer convention (inverted into our authority footer). The `compliance-anthropic` DPA-review checklist informs `legal-gdpr-audit`. |
| [simota/agent-skills](https://github.com/simota/agent-skills) (`clause`) | MIT | The SCOPE→SCAN→ASSESS→REPORT→SUGGEST structure, finding-ID convention, EULA enforceability table, and cross-doc consistency-matrix idea (→ `legal-terms-review-nl`, `legal-cross-store`). |
| [cruisediary/apple-app-review-skills](https://github.com/cruisediary/apple-app-review-skills) | MIT | The atomic-check → composed-agent → Scan/Analyze/Report/Remediate architecture + severity tiers, cloned symmetrically for `legal-apple-gate` and `legal-play-gate`. |
| [miketromba/skills](https://github.com/miketromba/skills) (`legal-tos-privacy`) | MIT | Audit-from-code methodology (→ `legal-doc-draft`); EU-safe savings-clause wording adapted into `legal-terms-review-nl/assets/eu-safe-clauses.md`. |
| [rshankras/claude-code-apple-skills](https://github.com/rshankras/claude-code-apple-skills) | MIT | The Apple App Privacy nutrition-label mapping table + Guideline 5.1 pre-flight (→ `legal-apple-gate`). |
| [mukul975/Privacy-Data-Protection-Skills](https://github.com/mukul975/Privacy-Data-Protection-Skills) | Apache-2.0 | The SKILL.md frontmatter/`references`+`scripts`+`assets` house layout convention. |
| VoltAgent/awesome-claude-code-subagents · rohitg00/awesome-claude-code-toolkit | MIT / Apache-2.0 | The read-only-auditor tool-scoping pattern and the falsifiable-assertion finding shape (Severity/Location/Impact/Remediation). |

### Re-authored only — NEVER copied (AGPL-3.0 / no-licence / Commons Clause)
Ideas and patterns were independently re-expressed; **no file or template text from these was copied** into this (non-AGPL) suite:

| Source | Licence | Pattern re-authored (not copied) |
|---|---|---|
| [lawve-ai/awesome-legal-skills](https://github.com/lawve-ai/awesome-legal-skills) | AGPL-3.0 | DPIA-Sentinel risk-register schema + Art. 35(3) routing (→ `legal-gdpr-audit`); the gdpr-privacy-notice-eu Verify-stage + Art. 13 checklist + EN/NL-parity rule (→ `legal-privacy-review`, `legal-doc-draft`); the politique-cookies analytics-consent decision logic, CNIL→AP (→ `legal-analytics-consent`). |
| [zubair-trabzada/ai-legal-claude](https://github.com/zubair-trabzada/ai-legal-claude) | none (all rights reserved) | The weighted multi-agent → synthesis orchestration pattern and the "poison-pill" red-flag idea (retargeted to BW 6:236/237). |
| [nisrulz/app-privacy-policy-generator](https://github.com/nisrulz/app-privacy-policy-generator) | AGPL-3.0 | The intake-wizard question set + SDK registry idea + enforceable-liability-cap retain-list pattern. |
| [Privado-Inc/privado](https://github.com/Privado-Inc/privado) (`rules/`) | LGPL + Commons Clause | Data-category taxonomy *structure* + the "no matching field → not Art. 9" adversarial-test idea only; no YAML copied. |
| [phuryn/pm-skills](https://github.com/phuryn/pm-skills) · [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | mixed | The `[LEGAL REVIEW REQUIRED]` inline-flag convention + anti-generic rule; the regex/keyword code-scan idea (re-implemented in our Dart-aware scanners). |

### External CLIs — invoked, not linked (GPL family)
Run as separate processes by `legal-data-surface-scan/scripts/run_*.mjs`; their copyleft does not reach this suite's code:
- [Exodus Privacy `exodus-standalone`](https://github.com/Exodus-Privacy/exodus-standalone) (Android tracker/SDK scan)
- [MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF) (GPLv3; static/dynamic APK + IPA analysis)
- Methodology only (no dependency): PoliCheck/PolicyLint/PoliGraph (disclosure-grading rubric); datenanfragen label-vs-traffic; AppCensus.

### Primary law / official docs
Freely citable; quoted per the attribution tiering with last-verified dates: GDPR/AVG, Dutch BW 6:233/236/237, CRD 2011/83, Dir. 93/13, ePrivacy 2002/58 + Telecommunicatiewet 11.7a, MDR 2017/745 + MDCG 2019-11, FTC HBNR, EU-US DPF decision 2023/1795, AP guidance, Apple App Store Review Guidelines, Google Play developer policies.

## Note
This suite is suite-internal (not redistributed). If it is ever published, re-review the AGPL/no-licence rows — they constrain redistribution, not internal use.
