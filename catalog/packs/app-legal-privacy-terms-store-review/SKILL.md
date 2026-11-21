---
name: app-legal-privacy-terms-store-review
description: "Use when the user needs a privacy policy or terms of service for an app drafted or reviewed, or a legal check before Apple or Google store submission. An automated review, not legal advice: a lawyer signs off."
---

# App legal: privacy policy, terms and store review

Find the skill that fits the task in the table, read its file in full before you start, and follow it.

Script paths in this domain start at this domain's folder, the base directory Claude Code names when it loads this skill.

| Skill | What it does | When to use | File |
|---|---|---|---|
| Legal analytics consent | Rule on whether an app's analytics or tracking SDKs need user consent under EU law. | Use when asked if analytics, tracking or telemetry (Firebase Analytics, crash reporting) needs a consent popup in the EU. | skills/legal-analytics-consent.md |
| Legal apple gate | Use when checking iOS App Store submission-readiness for legal/privacy: the Apple half of the platform store gate. | Use when checking iOS App Store submission-readiness for legal/privacy: the Apple half of the platform store gate. | skills/legal-apple-gate.md |
| Legal cross store | Use when reconciling an app's data declarations across every surface — building ONE source of truth and flagging any DRIFT between them. | Use when reconciling an app's data declarations across every surface — building ONE source of truth and flagging any DRIFT between them. | skills/legal-cross-store.md |
| Legal data surface scan | Use when verifying an app's privacy CLAIMS against what the code ACTUALLY collects (code-faithful verification). | Use when verifying an app's privacy CLAIMS against what the code ACTUALLY collects (code-faithful verification) — the truth-source that feeds legal-flow-grader and legal-cross-store. | skills/legal-data-surface-scan.md |
| Legal doc draft | Use when DRAFTING or UPDATING (not merely reviewing) an app Privacy Policy or Terms of Service: authoring, editing, version bumps, placeholders, translation. | Use when a privacy policy or terms of service must be written or updated for an app. | skills/legal-doc-draft.md |
| Legal flow grader | Use when grading a Privacy Policy against the app's ACTUAL data flows. | Use when grading a Privacy Policy against the app's ACTUAL data flows. | skills/legal-flow-grader.md |
| Legal GDPR audit | Audit the substance behind a privacy policy: lawful basis per purpose, health data, DPIA, processors, transfers. | Use when asked if an app is GDPR-compliant, which legal basis to use, or whether a DPIA is needed. | skills/legal-gdpr-audit.md |
| Legal guardrails | The legal suite's shared rules and EU/NL knowledge base, read by the other legal skills. | Use when another legal skill points here, or when you need the suite's rules, severity model or reference law. | skills/legal-guardrails.md |
| Legal health claims | Use when checking app copy for medical/health claims as BOTH a marketing guardrail AND a regulatory classification gate. | Use when checking app copy for medical/health claims as BOTH a marketing guardrail AND a regulatory classification gate. | skills/legal-health-claims.md |
| Legal play gate | Use when checking Google Play submission-readiness for legal/privacy/store-config. | Use when checking Google Play submission-readiness for legal/privacy/store-config. | skills/legal-play-gate.md |
| Legal privacy review | Review a mobile app's privacy policy against what GDPR requires it to say and the app's real data flows. | Use when the user asks whether a privacy policy is complete, correct or ready to ship. | skills/legal-privacy-review.md |
| Legal reg monitor | Use when a legal/regulatory or platform-policy change might affect already-shipped legal docs: the law moved AFTER review and you need only the delta. | Use when a legal/regulatory or platform-policy change might affect already-shipped legal docs — the law moved AFTER review and you need the delta, not a full re-review. | skills/legal-reg-monitor.md |
| Legal signoff orchestrator | Legal review of an app's privacy policy and terms before store submission: one verdict, SHIP, FIX FIRST or BLOCKED. An automated review, not legal advice. | Use for a pre-submission legal review that runs the whole legal suite and returns one verdict. | skills/legal-signoff-orchestrator.md |
| Legal terms review NL | Use when reviewing or auditing a mobile-app Terms of Service / general terms (algemene voorwaarden) for a Dutch or EU consumer audience. | Use when reviewing or auditing a mobile-app Terms of Service / general terms (algemene voorwaarden) for a Dutch or EU consumer audience. | skills/legal-terms-review-nl.md |
| Legal withdrawal check | Use when verifying the EU 14-day right-of-withdrawal waiver for a paid digital subscription. | Use when verifying the EU 14-day right-of-withdrawal waiver for a paid digital subscription. | skills/legal-withdrawal-check.md |
