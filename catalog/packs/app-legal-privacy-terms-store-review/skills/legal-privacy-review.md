---
name: legal-privacy-review
description: >-
  Use when reviewing or signing off a mobile-app Privacy Policy / privacy notice
  under GDPR/AVG (Dutch eenmanszaak, EU/NL-first). Triggers on "review privacy
  policy", "sign off PP", "privacy notice audit", "check the privacy policy",
  "PP compliance". Walks the GDPR Art. 13 twelve-point mandatory-disclosure
  completeness checklist (each item PRESENT or explicit N/A-with-reason), then
  reconciles every (data-type, recipient-entity) flow the app actually performs
  against what the policy says — entity-aware grading (clear / vague / omitted /
  incorrect / ambiguous), naming Apple, Google/Firebase, RevenueCat, Cloudflare,
  never "third parties". Checks EN/NL parity (a flow disclosed in EN but not NL =
  omitted for NL), special-category (Art. 9 health) reasoning, transfer mechanism
  (DPF/SCC), retention, withdrawal rights, and AP complaint route. Emits findings
  in the suite format + a per-document Privacy letter grade + a code-faithfulness
  note. Works for any app (app facts are inputs).
metadata:
  category: legal
  author: Richicinschi (Claude-authored)
  version: 1.0.0
  domain: legal / privacy / GDPR-AVG / mobile-app
  jurisdiction: NL-primary, EU, with Apple/Google platform overlays
---

# legal-privacy-review — Privacy Policy sign-off

Operates under `legal-guardrails` — load its constitution + the references listed below.

This skill adjudicates whether an app's **Privacy Policy** (privacy notice) may ship. It is de-facto counsel: it decides and signs, reserving only the §5 carve-outs for a Dutch advocaat. The subject is the person's app: its Privacy Policy file(s), version and languages, and its facts (publisher, SDKs, data model) come from the orchestrator's Step 0 fact sheet; run alone, read them from the project and ask only for the rest.

## Load these references (by path; do NOT inline their contents)

- `app-legal-privacy-terms-store-review/skills/legal-guardrails.md` — the constitution (severity, tiers, finding format, verdict bands, authority footer).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/attribution-tiering.md` · `finding-format.md` · `verdict-model.md` · `disclosure-grading.md` — output discipline + the 5-grade flow rubric.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/gdpr-articles.md` — **the Art. 13 12-point checklist (load-bearing)**, Art. 6 basis map, Art. 7 consent, Art. 8 age-16, **Art. 9 health judgement**, Art. 12/15–22 rights + 1-month SLA, Art. 33/34 breach.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/transfers-dpf-scc.md` — Art. 44–49 transfers, EU-US DPF, SCC (2021), which Firebase/RC/Apple streams are US.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/ap-guidance.md` — Autoriteit Persoonsgegevens positions (complaint route, analytics, retention).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/data-category-ontology.md` + `sdk-data-map.md` — the canonical (data-type, recipient-entity, on/off-device) flow set per SDK.

## Workflow (5 stages — Scope → Complete → Reconcile → Parity → Report)

1. **SCOPE.** Identify the PP file(s) (EN + NL), the version/`Last updated` stamp, and the publisher facts (controller identity, legal form such as eenmanszaak, DPO or none). Confirm the app's terms-version constant (e.g. `kTermsVersion`) and the version stamps match the live app. If the app targets NL consumers and deliberately ships an NL version, a missing or stale NL file is itself a finding.
2. **COMPLETENESS (Art. 13 12-point gate — the Verify stage).** Walk the 12 mandatory disclosures in order (table below). Each is **PRESENT**, **N/A-with-reason** (explicitly stated, e.g. "no DPO appointed"), or a **gap finding**. Missing any one = incomplete notice (🟠 minimum). Mandate a stated lawful basis **per purpose** (Art. 13(1)(c)) with precise citation ("Art. 6(1)(b)", not "we have a legitimate interest").
3. **DISCLOSURE RECONCILIATION (code-faithfulness).** Take the flow set from `legal-flow-grader` / `legal-data-surface-scan` if available; else build it from `taxonomy/sdk-data-map.md`. Grade **each (data-type, recipient-entity, on/off-device)** flow against the PP using the 5-grade entity-aware rubric in `disclosure-grading.md`. Under-disclosure (app does X, PP silent/denies) is the dangerous direction.
4. **EN/NL PARITY.** Re-run the same grading against `privacy.nl.md`. A flow disclosed in EN but not NL grades **omitted for the NL doc**, because an NL reader relies on the NL text alone. Substantive content must be identical; flag any section in EN absent/weaker in NL.
5. **REPORT.** Emit findings (🔴→🟠→🟡), a confirmed-good 🟢 list (including reasoned decisions), a code-faithfulness summary, a per-document Privacy **letter grade**, the verdict band, and the authority footer.

## Stage 2 — Art. 13 twelve-point completeness checklist

Full rule text + worked model answers (example app) live in `gdpr-articles.md` (§Article 13). Walk all twelve; report the specific gap, not "improve disclosures".

| # | Art. 13 ref | Element | Present? |
|---|---|---|---|
| 1 | 13(1)(a) | Who runs the app and how to reach them: name or trade name, **KvK** number, registered address, email | |
| 2 | 13(1)(b) | How to reach a data protection officer **if one is appointed**; if not, the notice says so ("no DPO appointed; contact controller at …") | |
| 3 | 13(1)(c) | What each processing is for, **and the Art. 6 ground it rests on** (the exact letter; one ground per purpose) | |
| 4 | 13(1)(d) | Where 6(1)(f) is the ground, **which interest** the publisher pursues, spelled out | |
| 5 | 13(1)(e) | Who gets the data, **each by name** (Apple, Google/Firebase, RevenueCat, Cloudflare) | |
| 6 | 13(1)(f) | Whether data leaves the EEA, and on **which footing** (DPF adequacy / SCC 2021 / Art. 49 derogation) | |
| 7 | 13(2)(a) | How long data is kept, **per category**, or the rule that sets the period | |
| 8 | 13(2)(b) | The user's rights over the data: access, rectification, erasure, restriction, objection, portability | |
| 9 | 13(2)(c) | Where processing rests on consent, that the user can **withdraw it at any time** | |
| 10 | 13(2)(d) | That the user can complain to the regulator, with the **Autoriteit Persoonsgegevens** named | |
| 11 | 13(2)(e) | Whether the user is obliged to give the data (by law or by contract), and what follows if they don't | |
| 12 | 13(2)(f) | Whether decisions are automated or the user is profiled (an app that does neither must say **none**) | |

Also confirm 13(3) (notify before a new-purpose use) and that the 1-month rights SLA (Art. 12(3), +2-month extension) is correctly stated, not "instantly" / "within 90 days".

## Stage 3 — app-specific reconciliation checks

Apply against the live PP. Each maps to a flow or an Art. 13 element; cite the provision in the finding. The section numbers (§3, §4 …) follow a common policy layout (data collected, not collected, recipients, transfers, retention, rights); map each check to the matching section of the person's policy. The examples assume the example app's Firebase + RevenueCat stack (`legal-guardrails.md` §8); swap in the app's own SDKs.

- **§3 categories + basis.** Every data category in §3 lists a purpose **and one Art. 6 basis** (core delivery = 6(1)(b); Analytics/Crashlytics = 6(1)(a) consent, **never** 6(1)(f) — ePrivacy 5(3) bites first). Flag any analytics/crash line resting on "legitimate interest".
- **§3.7 Art. 9 health.** The "no health inference → not special-category data" conclusion must be **reasoned and present** (general-wellness posture, no score/mood/stress label). If any scoring/inference exists in the data model or copy → Art. 9(2)(a) explicit separate consent required → 🔴/🟠. Record the reasoned decision as 🟢 if absent. `[low-confidence — fact-specific; the crux of the sign-off]`
- **§4 do-not-collect honesty.** Cross-check every "we do not collect X" against the SDK map. An affirmative "we never collect/share X" contradicted by an SDK = **incorrect** = 🔴.
- **§6 recipients NAMED.** Each processor named (Apple, Google/Firebase, RevenueCat, Cloudflare). Any absolute **"we do not share data with third parties"** line is false (RevenueCat receives the purchase token + app user ID; Crashlytics receives crash logs) → 🔴.
- **§7 transfers.** US streams (Firebase Auth, Analytics/Crashlytics are global/US by architecture) named with the mechanism (EU-US DPF and/or SCC 2021). Do not let a blanket "all data in the EU" sentence stand — incorrect for Auth + Analytics. See `transfers-dpf-scc.md`.
- **§8 retention.** No **phantom deletion-confirmation email** or "365-day inactivity purge" the app does not perform (free-tier history is on-device only; no server copy to purge). Retention stated per category; fiscal records 7 yrs `[verify]`.
- **§9 rights + AP.** All applicable rights listed; a working channel (email + in-app deletion); the AP named (autoriteitpersoonsgegevens.nl); withdrawal = the analytics/crash off-switch.
- **§11 in-app deletion ≠ subscription cancellation.** The PP must state that deleting the account does **not** cancel an Apple/Google auto-renewing subscription (managed in the Store), and vice-versa. Conflating them → 🟠.

## Output format

Use the suite report skeleton (`verdict-model.md`). Findings in the standard shape:

```
[PP-<n>] <emoji> <one-line title>
  Location:   privacy.md §<n> (+ privacy.nl.md §<n> if parity)
  Basis:      <Art. 13(x)/Art. 6/9 …> [tier]   e.g. Art. 13(1)(e) [settled — verified 2026-06-06]
  Issue:      <missing / vague / omitted / incorrect / ambiguous — name the flow + entity>
  Redline:    <exact replacement text; name the entity + the data it receives>
  Confidence: high | medium | low
```

End the report with:
- **Art. 13 completeness table** — 12 rows, PRESENT / N/A-with-reason / GAP.
- **Code-faithfulness flow table** — `| data-type | entity | on/off | EN grade | NL grade | severity |`.
- **Confirmed-good (🟢) + reasoned decisions** — incl. the Art. 9 "not health data" reasoning.
- **Verdict** — SIGN-OFF / FIX-THEN-SIGN-OFF / BLOCK · **Privacy <letter grade>**.
- **Authority footer** (constitution §5) — reserving the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills, native-NL legal-idiom review, and any `[low-confidence]` item for a Dutch advocaat.

**No silent supplement:** if a question outside the Art. 13 checklist arises (e.g. a US-state-law section, a children's-design-code consideration), surface it as a 🟡 note — do not act on it silently or omit it.
