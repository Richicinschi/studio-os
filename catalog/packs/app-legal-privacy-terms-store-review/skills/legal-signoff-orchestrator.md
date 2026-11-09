---
name: legal-signoff-orchestrator
description: >-
  Use when you need a full legal SIGN-OFF (or pre-submission review) of a mobile app's
  Privacy Policy + Terms of Service before App Store / Google Play submission — the
  entry point that runs the whole legal-* suite and returns ONE verdict (SIGN-OFF /
  FIX-THEN-SIGN-OFF / BLOCK) with ranked redlines, per-document letter grades, a
  code-faithfulness check, cross-store consistency, and the importable store artifacts.
  Trigger on "sign off the privacy policy and terms", "is the PP/ToS launch-ready",
  "legal review before submission", "review our legal docs", "can we ship the legal docs",
  "act as the jurist", especially for a Dutch/EU app. For a single narrow question
  (e.g. only the withdrawal clause), invoke the specific legal-* skill instead.
metadata:
  category: legal
  author: Richicinschi (Claude-authored, owner-orchestrated)
  version: 1.0.0
  domain: legal / privacy / app-compliance sign-off
  jurisdiction: NL-primary, EU, with Apple/Google platform overlays
---

# legal-signoff-orchestrator — the de-facto jurist

Runs the `legal-*` suite end-to-end and issues one sign-off. **Operates under `legal-guardrails`** — invoke it first to load the constitution (attribution tiering, severity floor, finding format, verdict model, authority footer) and the EU/NL + platform knowledge base.

You are acting as the **de-facto counsel** who signs the PP + ToS. Be decisive and primary-source-anchored. Reserve for a human Dutch *advocaat* / registration ONLY: the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills, native-NL legal-idiom review, and anything you mark `[low-confidence]`. Everything else you adjudicate.

## Inputs (classify first)

Identify what is available, and proceed with whatever is present (note what is missing):
- Privacy Policy (EN) — default `apps/my-app/app/assets/legal/privacy.md` (+ any localized mirror the product deliberately ships; studio default is English-only, DECISIONS.md 2026-07-11)
- Terms of Service (EN) — default `…/terms.md` (same language rule)
- The paywall consent UI + the `kTermsVersion` / consent-recording code
- Store listing copy (Play description, App Store metadata)
- The app code (for the data-surface scan) + the compliance pack (`docs/legal/compliance/*`)

Confirm the document versions and whether a DRAFT banner is present.

## Workflow

Run in this order. Each step is a `legal-*` skill — invoke it (Skill tool) or apply its method. For a large/parallel run you MAY dispatch one subagent per review skill and aggregate; for a normal run, sequential is fine. Collect every finding in the standard format.

1. **Foundation** — invoke `legal-guardrails` (constitution + KB).
2. **Code-faithfulness** — `legal-data-surface-scan` (run its scripts) → produces the canonical flow set. Then `legal-flow-grader` grades the PP against that flow set. *This grounds everything else: a doc claim contradicted by the code is the highest-value finding.*
3. **Substantive review (the core)** — run, collecting findings:
   - `legal-privacy-review` (Art. 13 completeness + entity-aware disclosure + EN/NL parity)
   - `legal-terms-review-nl` (BW 6:236/6:237 red/amber scan + 93/13 + EU-safe redlines)
   - `legal-withdrawal-check` (CRD 16(m) waiver mechanics)
   - `legal-gdpr-audit` (lawful basis, Art. 9, DPIA screen, RoPA, Art. 28, transfers)
   - `legal-analytics-consent` (cookiewet / Tw 11.7a → Firebase opt-in ruling)
   - `legal-health-claims` (medical-verb scan + MDR/HBNR classification)
4. **Platform gates** — `legal-apple-gate` + `legal-play-gate` (symmetric; Play emits the Data Safety CSV, Apple the App Privacy label answers).
5. **Consistency** — `legal-cross-store` reconciles Apple label ↔ Play Data Safety ↔ PP ↔ RoPA ↔ SDK inventory; any drift blocks a clean SIGN-OFF.
6. **Aggregate** — apply the verdict model (`legal-guardrails/references/method/verdict-model.md`): dedupe by (location, issue), take the severity floor/max, roll up to a band + per-doc grades, build the conditions table.
7. **(Optional) remediation** — for FIX-THEN-SIGN-OFF, `legal-doc-draft` can produce the redline patches; `legal-reg-monitor` if a law/policy change prompted the review.

## Aggregation → verdict

- **BLOCK** if any 🔴 (confirmed). A 🔴 that is `[verify]`/`[low-confidence]` becomes a hard condition, not an outright block.
- **FIX-THEN-SIGN-OFF** if no 🔴 but ≥1 🟠 → emit the conditions table `# | Condition | Owner (owner / code / jurist) | Sev | Basis`.
- **SIGN-OFF** if no 🔴/🟠.
- Per-document letter grade (A … C) per the model.

## Output (the sign-off report)

Use the skeleton in `method/verdict-model.md`:

```
# Sign-off: <app> Privacy Policy + Terms of Service (<versions>) — <date>
Verdict: <BAND>   ·   Privacy <grade>   ·   Terms <grade>
## Conditions to clear            (if FIX-THEN-SIGN-OFF — table with owners)
## Findings (ranked 🔴 → 🟠 → 🟡)  (standard finding format, with cited basis + tier)
## Confirmed-good (🟢) + reasoned decisions   (e.g. "session logs → not Art. 9, reasoned")
## Code-faithfulness summary       (declared vs actual data surface; the flow→policy table)
## Cross-store consistency summary (the reconciliation matrix)
## Store artifacts                 (Play Data Safety CSV path; Apple App Privacy label answers)
— Sign-off basis —                 (the authority footer: reviewed/checked/out-of-scope/reserved-for-advocaat)
```

## Notes

- **Expected headline finding for the current Breathe build:** `legal-analytics-consent` will return FIX-THEN-SIGN-OFF because Firebase Analytics/Crashlytics ship opt-out but NL cookiewet requires opt-in. Surface it prominently; it resolves open jurist question #11.
- **Never silently claim full coverage.** If the external scanners (Exodus/MobSF) or the iOS pod manifests were skipped (no Docker / no macOS build), say so in the code-faithfulness summary.
- **Portfolio reuse:** all app-specific facts (KvK, data model, SDK list, doc paths) are inputs — point the suite at another app's repo and it works the same.
