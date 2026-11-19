# legal-* review skill suite — overview

A user-level Claude Code skill suite (`~/.claude/skills/legal-*`) that reviews a mobile app's Privacy Policy + Terms of Service before App Store / Google Play submission and gives one firm verdict: **SHIP**, **FIX FIRST** or **BLOCKED**, each finding tied to its clause and rule. An automated review, not legal advice: a lawyer signs off. Built for a Dutch/EU app (GDPR/AVG, Dutch consumer law, Apple/Google platform rules) and works for any app — app-specific facts (publisher, registration number, data model, SDK list, doc paths) are inputs, gathered in the orchestrator's Step 0 fact sheet. Worked examples in the references use one example app profile (`legal-guardrails.md` §8).

**Start here:** invoke **`legal-signoff-orchestrator`** ("review the privacy policy and terms"). Its first question is where the app is offered; it then runs the whole suite and returns one verdict. For a narrow question, invoke the specific skill.

## The 16 skills

**Governance / hub**
- `legal-guardrails` — the constitution (attribution tiering, 90-day staleness rule, severity floor, finding format, verdict model, review footer, jurisdiction rule) + the EU/NL + platform **knowledge base** (`references/`). Every skill operates under it.
- `legal-signoff-orchestrator` — entry point; fans out, aggregates one verdict + report + store artifacts.

**Substantive review (the core)**
- `legal-privacy-review` — PP vs GDPR Art. 13 + entity-aware disclosure + EN/NL parity.
- `legal-terms-review-nl` — ToS vs BW 6:236 (void) / 6:237 (presumed-unfair) + Dir. 93/13 → red/amber map + EU-safe redlines. *(flagship)*
- `legal-withdrawal-check` — CRD 16(m) 14-day-waiver mechanics.
- `legal-gdpr-audit` — lawful basis, Art. 9 health-data call, DPIA screen, RoPA, Art. 28 DPA, transfers.
- `legal-analytics-consent` — cookiewet / Tw 11.7a → Firebase Analytics opt-in ruling.
- `legal-health-claims` — medical-verb scan + MDR / FTC-HBNR classification.

**Drafting / maintenance**
- `legal-doc-draft` — audit-from-code drafting/updating; placeholder fills; version bump; EN/NL parity.
- `legal-reg-monitor` — law/policy change → diff vs shipped docs → remediation plan.

**Platform (symmetric)**
- `legal-apple-gate` — App Store 5.1.1/3.1.2/1.4.1, Min-EULA, PrivacyInfo.xcprivacy, App Privacy label.
- `legal-play-gate` — Data Safety form (+CSV), web deletion URL, Health Content, AD_ID, IARC/DSA.
- `legal-cross-store` — reconcile Apple label ↔ Play Data Safety ↔ PP ↔ RoPA ↔ SDK inventory.

**Code-faithful verification**
- `legal-data-surface-scan` — pubspec/manifest/iOS-manifest scanners (+ optional Exodus/MobSF) → canonical flow set.
- `legal-flow-grader` — grade the PP against the actual flow set (entity-aware).

## Knowledge base (`legal-guardrails/references/`)
- `method/` — attribution-tiering, verdict-model, finding-format, disclosure-grading.
- `nl-eu-law/` — gdpr-articles, bw-unfair-terms, crd-withdrawal, eprivacy-cookiewet, mdr-hbnr, transfers-dpf-scc, adr-bodies, ap-guidance, dsa-trader.
- `platform/` — apple-app-privacy, apple-review-guidelines, apple-min-eula, play-data-safety, play-policies.
- `taxonomy/` — data-category-ontology, sdk-data-map.

## Scanners (`legal-data-surface-scan/scripts/`, `legal-play-gate/scripts/`)
Node ESM, no deps for the parsers; verified against the real app. `scan_pubspec.mjs`, `scan_android_manifest.mjs`, `scan_ios_privacy.mjs`, `run_exodus.mjs`, `run_mobsf.mjs` (graceful degrade), `emit_play_csv.mjs`.

## Verdict & limits
Gives a firm verdict and signs nothing: a lawyer signs off. The law tables cover the Netherlands and the EU; for an app offered only outside them, the store-rule and data-collection checks still run and there is no verdict on law. Every report ends with a footer stating what was checked, against which law, and the date each cited source was last verified; a finding resting on a source verified more than 90 days before the run is marked "re-check before relying on it". Gives no verdict on the §5 carve-outs (the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` values, native-NL legal-idiom review, any `[low-confidence]` call); they need a lawyer or a registration first. For an app offered in EU states but not the Netherlands, Dutch national-law findings are notes only. See `ATTRIBUTION.md` for licensing of adapted sources. Design spec: `<HUB>/docs/specs/2026-06-06-legal-signoff-skill-suite-design.md`.
