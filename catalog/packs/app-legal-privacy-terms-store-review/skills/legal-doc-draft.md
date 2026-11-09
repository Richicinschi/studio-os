---
name: legal-doc-draft
description: >-
  Use when DRAFTING or UPDATING an app Privacy Policy or Terms of Service (not merely reviewing) —
  authoring, editing, version-bumping, placeholder-filling, or translating legal text. Triggers:
  "draft privacy policy", "write PP", "write ToS", "update terms", "rewrite privacy section",
  "bump kTermsVersion", "fill KvK / BTW / registered address", "add a clause for a data flow",
  "sync the NL privacy policy", "make the privacy policy match the code". Audits the app from its
  code (SDK/data-surface map) so it states what the app ACTUALLY does — names Apple, Google/Firebase,
  RevenueCat, Cloudflare specifically, never "third parties"; preserves validated wording and patches
  only the deltas; fills [KVK]/[BTW]/[REGISTERED ADDRESS] when given (else flags them); bumps
  kTermsVersion + version + date on a MATERIAL change (fires re-consent); ENGLISH-ONLY by default (DECISIONS.md 2026-07-11) — if a product deliberately ships a localized version, keeps it isomorphic to EN;
  inserts inline [LEGAL REVIEW REQUIRED] flags for jurist-only items. Tailored to "Breathe" (Dutch
  eenmanszaak, GDPR/AVG, EU/NL) yet reusable across the portfolio.
metadata:
  category: legal
  author: Richicinschi (Claude-authored)
  version: 1.0.0
  domain: legal / privacy / app-compliance — drafting & document maintenance
  jurisdiction: NL-primary, EU (GDPR/AVG), with Apple/Google platform overlays
---

# legal-doc-draft — author & maintain the PP / ToS

Operates under `legal-guardrails` — load its constitution + the references listed below.

This skill **writes and edits** legal text (the other `legal-*` skills only review). It produces
drafts and surgical patches that are *code-faithful* (what the app actually does), *specific* (named
entities), *version-correct* (re-consent bumped on material change), and *language-coherent* — the studio ships **English-only** by default (DECISIONS.md 2026-07-11); when a product deliberately ships a localized version, that version must be isomorphic to EN and flagged for native legal review. It is a **drafting tool, not a generator from a blank page** — for an existing doc it
preserves sound wording and changes only what is wrong, missing, or stale.

## Load before drafting
- `app-legal-privacy-terms-store-review/skills/legal-guardrails.md` — constitution (tiering, severity, finding format, authority footer, carve-outs).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/*` — attribution-tiering, disclosure-grading (flow→clause), finding-format, verdict-model.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/sdk-data-map.md` — **the audit-from-code source of truth** (every SDK → data, recipient entity, on/off-device, lawful basis, location, transfer). Do NOT invent data behaviour; read it here.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/data-category-ontology.md` — Apple ⇄ Play ⇄ GDPR crosswalk (so doc inventory aligns with the store labels).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/gdpr-articles.md` — Art. 13/14 mandatory-disclosure backbone, lawful bases, rights, retention.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/*` — `apple-min-eula.md` (ToS must carry the Licensed-Application EULA minimum terms), `apple-app-privacy.md`, `play-data-safety.md`, `play-policies.md`, `apple-review-guidelines.md`.

Other `nl-eu-law/*` (crd-withdrawal, bw-unfair-terms, eprivacy-cookiewet, transfers-dpf-scc, mdr-hbnr, adr-bodies, ap-guidance, dsa-trader) are pulled on demand when a draft touches that subject.

## App facts (inputs — defaults are Breathe; override per app)
| Input | Breathe default |
|---|---|
| Live docs | `apps/my-app/app/assets/legal/{privacy,terms}.md` (English-only since 2026-07-11) |
| Version constant | `kTermsVersion` in `lib/shared/legal/disclaimer_text.dart` (currently **6**) |
| Controller | Dutch **eenmanszaak**, sole controller, **no DPO** |
| Identity fills | `[KVK]` / `[BTW]` / `[REGISTERED ADDRESS]` — leave + flag unless provided |
| Stores | Apple + Google = **merchants of record**; RevenueCat reads tokens; Firebase backend (EU `europe-west`) |
| Health stance | general wellness only — "supports / may help relax"; never "treats / cures / diagnoses / prevents" |
| Tier split | Free = **on-device only**; Pro = Firestore sync |

## Workflow (numbered)

1. **Determine mode.** *New doc* → full draft from the section maps below. *Update* → diff intent against the live doc; you are in **patch mode** (step 6). If ambiguous, treat as update — never rewrite a validated clause.

2. **Audit from code (never invent).** Build the flow set `(data-type, recipient-entity, on/off-device)` from `taxonomy/sdk-data-map.md` — the canonical, already-verified map of Firebase Auth (US-only), Firestore (EU; **free = on-device only**), Analytics (consent/cookiewet), Crashlytics (global, 90-day), Cloud Functions (EU), Hosting (IP logs), RevenueCat (**US, App User ID = Firebase UID**), Google Sign-In, and Apple/Play billing (controllers). If the app differs from this map, ask for the delta — do not guess. (Per nisrulz's intake idea, re-authored: an SDK registry drives the doc, but ask only for what the map cannot answer.)

3. **Gap-scan, then ask only for what's genuinely missing.** Compare the flow set + the Art. 13/14 mandatory-disclosure backbone (`gdpr-articles.md`) + the Apple EULA minimum terms (`apple-min-eula.md`) against what the doc already covers. Resolve everything the code + references answer **yourself**. Ask the user **one** focused batch only for true unknowns (identity fills, a new SDK's purpose, a price/trial figure). Don't re-ask what the map settles.

4. **Be SPECIFIC, not generic (anti-generic rule).** Every collection/sharing statement names the **entity** and the **concrete practice**: "RevenueCat, Inc. (US) receives the purchase token and App User ID to validate the subscription" — never "we share data with third parties to improve the product." Use `disclosure-grading.md`: a clause that fails to name the recipient is *vague* and must be rewritten. Tag every legal proposition with its attribution tier ([settled …] / [verify] / [verify-pinpoint] / [low-confidence]) per the constitution.

5. **Placeholders.** Fill `[KVK]` / `[BTW]` / `[REGISTERED ADDRESS]` (and price/trial/VAT figures) **only** when the value is supplied. Otherwise leave the bracket intact and emit an inline **`[LEGAL REVIEW REQUIRED — <what>]`** flag at that spot. These three fills + native-NL idiom + any `[low-confidence]` call are the **only** items reserved for a human advocaat (constitution §5); decide and write everything else.

6. **Patch mode = surgical (preserve validated wording).** For an update, change only the wrong/missing/stale spans. Keep section numbering, the "At a glance" box, the model withdrawal form, and any clause already graded sound. Output a diff or the patched section, not a wholesale rewrite. (lawve-ai rule, re-authored: "preserve validated template wording; only fill placeholders / patch deltas.")

7. **Version bump on MATERIAL change.** If the change alters substantive rights, data practices, recipients, retention, lawful basis, or fees → bump **`kTermsVersion`** (+1 in `disclaimer_text.dart`), the document `version`, and the document `Last updated` date in **all four files**. This is what fires the in-app **re-consent banner** — do not bump for typo/clarity-only edits (MINOR), and never change practices without a bump (would make the doc lie). State the bump explicitly in output. Note: hosted pages on `richicinschi.com` only update after `firebase deploy --only hosting` (owner-side) — flag if relevant.

8. **Localized versions (only when a product deliberately ships one — studio default is English-only, DECISIONS.md 2026-07-11).** "A translation gap is a compliance gap": Every EN change has a mirrored NL change in the same section, and vice-versa. Section count, numbering, and meaning must match across `{privacy,terms}.md` and `.nl.md`. The model withdrawal form pronoun uses statutory **`u`**. Machine-mirrored NL is acceptable to ship as a draft but **must carry a `[LEGAL REVIEW REQUIRED — native-NL idiom]` note** (binding consumer text under Dir. 93/13 Art. 5) — that review is the advocaat's, not yours.

9. **Self-check before emitting.** (a) every scanned flow has a covering, entity-named clause; (b) no `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` silently invented; (c) version + date + `kTermsVersion` consistent across all four files iff material; (d) EN/NL section maps isomorphic; (e) no health over-claim; (f) every legal proposition carries a tier; (g) "no silent supplement" — if you noticed a requirement not in your section map, surface it as a 🟡 MINOR note, don't bake it in unflagged.

## Section maps (skeletons — fill from the audit, don't reproduce reference text)

**Privacy Policy (GDPR Art. 13/14 backbone):** At-a-glance box · Controller identity (`[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]`, no DPO — eenmanszaak) · Data we collect (per-flow, free vs Pro) · Recipients / processors (Google-Firebase, RevenueCat Inc. US, Apple/Google billing, Cloudflare) · Lawful basis per purpose (incl. analytics consent / cookiewet flag) · International transfers (DPF/SCC, RC DPA `[verify]`) · Retention (per-flow; free = on-device, no server copy) · Your rights (access/erasure/object/withdraw/portability + AP supervisory authority) · Age (16+ checkbox, `ageConfirmedAt`) · Consent withdrawal (`withdrawalConsentAt`) · Security · Breach (Art. 33/34) · Changes + re-consent · Contact. → `gdpr-articles.md`, `sdk-data-map.md`, `data-category-ontology.md`.

**Terms of Service:** At-a-glance box · Parties (app provider vs Apple/Google as **merchant of record/seller**) · Eligibility (16+) · Licence (Apple **Licensed-Application EULA minimum terms** — `apple-min-eula.md`) · Subscriptions (auto-renew, price/trial/VAT illustrative, billed by the store) · **Withdrawal** (14-day CRD + the **unticked-paywall-checkbox + `withdrawalConsentAt` immediate-delivery-waiver** mechanism — NOT "captured by the store") · Refunds (store-handled) · Acceptable use · Health disclaimer (breathing-only, no medical claims) · Liability · Governing law (NL) + ADR (ConsuWijzer / Geschillencommissie — **never** the discontinued EU ODR) · Changes + re-consent (`kTermsVersion`) · Contact. → `apple-min-eula.md`, `crd-withdrawal.md`, `bw-unfair-terms.md`, `adr-bodies.md`.

## Output format
Emit, in order:
1. **Mode + verdict line** — `Mode: <draft|patch>` and the band (SIGN-OFF / FIX-THEN-SIGN-OFF / BLOCK) with per-doc letter grade, per the verdict model.
2. **The drafted/patched text** — full doc for a new draft; a **diff or the changed sections** for an update (EN and NL side by side or sequential). Inline `[LEGAL REVIEW REQUIRED — …]` flags stay in the text where they belong.
3. **Inserted-flags list** — every `[LEGAL REVIEW REQUIRED]` flag + every `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` left unfilled, with location.
4. **Version-bump note** — material? → `kTermsVersion N→N+1`, doc version + date in all four files, re-consent will fire; or "MINOR — no bump." Note hosted-deploy is owner-side if pages changed.
5. **Findings** (only where a draft choice resolved a gap/risk) in the constitution's finding format `[legal-doc-draft-<n>] <emoji> …` with Basis (citation + tier), Redline, Confidence — floor severity when overlapping another skill.
6. **Authority footer** (constitution §5 verbatim) — reserving only the identity fills, native-NL idiom review, and `[low-confidence]` items for a Dutch advocaat.
