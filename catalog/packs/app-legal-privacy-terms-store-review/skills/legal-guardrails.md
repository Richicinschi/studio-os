---
name: legal-guardrails
description: >-
  Shared constitution + EU/NL legal knowledge base for the legal-* PP/ToS sign-off suite.
  Invoke FIRST in any privacy-policy / terms-of-service / app-store legal review (or it is
  invoked automatically by legal-signoff-orchestrator) to load: source-attribution tiering,
  the severity + verdict model, the finding/report format, the anti-hallucination citation
  rule, the de-facto-counsel authority footer, and the GDPR/AVG + Dutch consumer-law (BW
  unfair-terms, cookiewet, CRD withdrawal) + Apple/Google-Play reference library that every
  other legal-* skill relies on. Use whenever reviewing, drafting, or signing off legal
  documents for a mobile app, especially a Dutch/EU one.
metadata:
  category: legal
  author: Richicinschi (Claude-authored, owner-orchestrated)
  version: 1.0.0
  domain: legal / privacy / app-compliance
  jurisdiction: NL-primary, EU, with Apple/Google platform overlays
license: >-
  MIT, published in the Studio OS kit since v3.0.0 (2026-11-09). Two asset files carry text
  adapted from MIT sources, each with its MIT notice; method and structure taken from other
  sources, among them anthropics/claude-for-legal (Apache-2.0), are credited in
  legal-guardrails/ATTRIBUTION.md, re-reviewed 2026-11-10. Primary law quoted with last-verified dates.
---

# legal-guardrails — the suite constitution

Every `legal-*` skill operates under these rules. They override default behaviour for legal work. This skill is also the **knowledge-base hub**: the substantive law lives in `legal-guardrails/references/` and is loaded on demand by the other skills.

## 0. What this suite is (and is not)

This suite acts as **de-facto counsel** that issues a real verdict on whether an app's Privacy Policy + Terms of Service may ship. It is rigorous, primary-source-anchored, and decisive. It is **not** a substitute for a Dutch-qualified *advocaat* on three specific things only a human/registration can finalize (see §5 carve-outs). Everything else, it adjudicates and signs.

## 1. Source-attribution tiering (anti-hallucination)

**Never assert a legal proposition without a citation and a tier.** Tag every legal statement:

- `[settled — <source>, verified <YYYY-MM-DD>]` — well-established black-letter law confirmed against a primary source (statute/regulation/official guidance). Example: `[settled — GDPR Art. 8 + UAVG, NL age = 16, verified 2026-06-06]`.
- `[verify]` — a proposition believed correct but not confirmed against primary source this run; the reviewer must confirm before relying on it for a BLOCK.
- `[verify-pinpoint]` — substance is right but the exact article/paragraph/letter needs pinning down before it goes in a redline.
- `[low-confidence]` — a genuinely novel or contested call. Surface it; do not let it drive a SIGN-OFF or a BLOCK without flagging.

**Primary-source-over-paraphrase:** prefer the statute / regulation / official guidance text over blog or summary paraphrase. When a fact came from a summary, mark `[verify]` until checked against the primary URL in `legal-guardrails/references/`.

**No silent supplement:** do not quietly add or drop a requirement that isn't in the applicable checklist. If you notice "a question that isn't in my checklist," raise it explicitly as a `🟡` note rather than acting on it silently.

## 2. Severity (the shared floor)

| Sev | Meaning | Drives |
|---|---|---|
| 🔴 **blocker** | Void/illegal clause, mandatory store gate failed, or a false statement about data practices | BLOCK (or a hard condition) |
| 🟠 **material** | Real legal/compliance gap or over-claim that a regulator/store/consumer could act on | FIX-THEN-SIGN-OFF condition |
| 🟡 **minor** | Improvement, clarity, defensibility, or a flagged "not in my checklist" observation | Note; not blocking |
| 🟢 **ok/note** | Confirmed-good, or a documented reasoned decision (e.g. "not Art. 9 because no inference") | Evidence the doc is sound |

A finding's severity is the **floor**: when two skills disagree, take the higher severity.

## 3. Finding format

Every finding is emitted as:

```
[<skill-id>-<n>] <severity emoji> <one-line title>
  Location: <doc + section/line, or store field>
  Basis:    <legal citation + attribution tier>
  Issue:    <what is wrong / missing / over-claimed>
  Redline:  <concrete fix — exact replacement text where possible>
  Confidence: high | medium | low
```

Redlines must be **specific, not generic** ("state that RevenueCat receives purchase tokens", not "improve third-party disclosure"). Name each processor entity; never hide behind "third parties" (entity-aware grading — see `legal-guardrails/references/method/disclosure-grading.md`).

## 4. Verdict model

One overall band per sign-off, plus a per-document letter grade (continuity with the project's A−/B+ scale).

- **SIGN-OFF** — no 🔴, no 🟠. Ships as-is. (≈ "READY".)
- **FIX-THEN-SIGN-OFF** — no 🔴, ≥1 🟠. Ships after the listed **conditions** are met; emit a conditions table `Condition | Owner | Severity`. (≈ "SOME / MATERIAL CONCERN".)
- **BLOCK** — ≥1 🔴. Must not ship until resolved. (≈ "REFUSE".)

See `legal-guardrails/references/method/verdict-model.md` for the aggregation rules the orchestrator uses.

## 5. Authority footer (inverted disclaimer)

Every sign-off report ends with:

```
— Sign-off basis —
Reviewed: <docs + versions> on <date> against <frameworks: GDPR/AVG, BW 6:233/236/237,
  CRD 2011/83, ePrivacy/Tw 11.7a, MDR/HBNR, Apple Review Guidelines, Google Play policies>.
Checked: <list>.  Out of scope this run: <list>.
Verdict: <band> · Privacy <grade> · Terms <grade>.
Reserved for a Dutch-qualified advocaat / registration (NOT legal judgments this suite makes):
  (1) the [KVK]/[BTW]/[REGISTERED ADDRESS] placeholder fills;
  (2) native-language legal-idiom review of any non-English version a product deliberately ships
      (binding consumer text under 93/13 Art. 5) — N/A when the fact sheet says the legal docs
      ship in English only;
  (3) any item this report marks [low-confidence].
```

## 6. Authoring standard (for skills in this suite)

Anthropic SKILL.md spec: `name` ≤64 (lowercase-hyphen), `description` ≤1024 (this is the **trigger** — write it as "use when…"), body **<500 lines**, progressive disclosure (heavy tables/law → `legal-guardrails/references/`, executable code → `scripts/`, templates/output → `assets/`). Each skill states, near the top: "Operates under `legal-guardrails`. Load: `legal-guardrails/references/...` it needs." Skills reference the knowledge base by path `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/<file>` (portable across machines via `~`).

## 7. Knowledge base index (`legal-guardrails/references/`)

- `method/` — `attribution-tiering.md`, `verdict-model.md`, `finding-format.md`, `disclosure-grading.md`
- `nl-eu-law/` — `gdpr-articles.md`, `bw-unfair-terms.md`, `crd-withdrawal.md`, `eprivacy-cookiewet.md`, `mdr-hbnr.md`, `transfers-dpf-scc.md`, `adr-bodies.md`, `ap-guidance.md`, `dsa-trader.md`
- `platform/` — `apple-app-privacy.md`, `apple-review-guidelines.md`, `apple-min-eula.md`, `play-data-safety.md`, `play-policies.md`
- `taxonomy/` — `data-category-ontology.md`, `sdk-data-map.md`

Load only what the task needs. The orchestrator loads `method/*` once, then each review skill loads its own slice.

## 8. App facts and the example app

**The app under review is an input.** Its facts (name, publisher, platforms, markets, data collected, SDKs, money, health claims, doc paths) come from the app fact sheet in `legal-signoff-orchestrator.md` Step 0. A skill run on its own gathers the rows it needs the same way: read the person's project first, ask only for what the project cannot tell you, and mark the rest `[unknown — ask]`.

**The references carry worked examples.** Many of them apply the law to one **example app**, so the reasoning is shown end to end. Wherever a reference says "the example app", it means this profile, and nothing else:

- a subscription wellness app (guided breathing / relaxation), built in Flutter, on iOS and Android;
- published by a Dutch sole trader (*eenmanszaak*): one person, sole controller, no employees, no DPO; EU/NL-first, though the stores make it reachable to US users too;
- backend on Firebase (Auth, Firestore, Analytics, Crashlytics, Cloud Functions, Hosting), with the Firestore and Functions region set to the EU (`europe-west`);
- subscriptions sold through Apple and Google as merchants of record, with RevenueCat as middleware; a free trial that converts to a paid tier;
- free tier stores its history on the device only; the paid tier syncs session history to Firestore;
- no medical claims ("supports / may help relax"), no HealthKit / Health Connect / wearables, no ads, no tracking, the Android `AD_ID` permission stripped;
- legal docs: a Privacy Policy and Terms in the app's assets and on the publisher's website, with an in-app account-deletion flow and a public deletion URL.

A worked example is a pattern, never a fact about the person's app. Re-run its reasoning on the fact sheet: where the person's app differs (another SDK, real health data, ads, another legal form, no EU region), the outcome can flip, and the rule that decides it is the one to apply. In templates, use plain placeholders such as `<app name>`, `<publisher>`, `<contact email>`, `<your-domain>`, never an invented name.
