---
name: legal-gdpr-audit
description: >-
  Use when auditing the GDPR/AVG SUBSTANTIVE compliance behind a Privacy Policy (the legal engine,
  not the prose) for an EU/NL mobile app. Runs six determinations: (1) the lawful-basis selector —
  one Art. 6 basis per purpose (core delivery = 6(1)(b); Firebase Analytics + Crashlytics = CONSENT
  6(1)(a) NOT legitimate interest, ePrivacy/cookiewet bites first; fiscal = 6(1)(c)); (2) the Art. 9
  special-category (health) determination on breathing/mood/stress data; (3) the Art. 35 DPIA
  threshold screen; (4) the Art. 30(5) RoPA-mandatory assertion; (5) the Art. 28 DPA-coverage check
  per processor (Google/Firebase, RevenueCat, Apple, Cloudflare); (6) the Chapter V transfer check
  (DPF cert vs SCC + TIA per US sub-processor). Reconciles against the in-repo compliance pack
  (ropa, dpa-subprocessor-register, tia, dpf-verification-log). Trigger on "GDPR audit", "AVG",
  "lawful basis", "Article 6", "DPIA", "RoPA", "special category", "Article 9 health data", "DPA",
  "processor agreement", "Article 28", "lawful-basis selector".
metadata:
  category: legal
  author: Richicinschi (Claude-authored)
  version: 1.0.0
  domain: legal / privacy / GDPR-AVG substantive compliance
  jurisdiction: NL-primary, EU (GDPR/AVG + UAVG), US-transfer overlay (DPF/SCC)
---

# legal-gdpr-audit — the substantive GDPR/AVG engine behind the Privacy Policy

Operates under `legal-guardrails` — load its constitution + the references listed below.

This skill audits the **substance** a Privacy Policy must rest on: the lawful basis for each
purpose, whether the data is Art. 9 health data, whether a DPIA/RoPA is required, and whether the
processor + transfer mechanics hold. It is the *engine* check; the prose/notice-completeness review
(Art. 13 12-point) is `privacy-review`'s job. When the two overlap, severity floor = the higher.

## Load at runtime (by path, do not inline)

- `app-legal-privacy-terms-store-review/skills/legal-guardrails.md` — the constitution (tiers, severity, finding/verdict format, authority footer).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/*` — attribution-tiering, finding-format, verdict-model, disclosure-grading.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/gdpr-articles.md` — **the backbone**: Art. 6/7/8/9/28/30/35 tables + the worked lawful-basis map (example app) + the adjudication cheat-sheet.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/transfers-dpf-scc.md` — Chapter V, DPF adequacy, 2021 SCCs, TIA, per-recipient register.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/ap-guidance.md` — Autoriteit Persoonsgegevens positions (incl. the GA4 opt-in line, the AP DPIA blacklist).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/sdk-data-map.md` — which SDK egresses which data category (feeds the Art. 9 scan + the per-processor transfer check).

## App-facts inputs (from the orchestrator's Step 0 fact sheet; run alone, read the project first and ask only for the rest)

This audit needs: the **controller** (legal form, employees, DPO yes/no); the **stack** (every SDK
and backend service, with its hosting region); who sells the product (store as merchant of record,
or the publisher); the **health stance** (claims made, health integrations); what each tier
stores **where** (on-device vs server); the **live docs** (paths, languages, version); and the
project's **compliance pack**, if it keeps one: RoPA, DPA / sub-processor register, TIA, DPF
verification log, LIA, retention schedule, SDK privacy inventory, DPO-not-required memo. Where a
check below names one of these files (e.g. `ropa.md`), read the project's own equivalent; a
missing record is itself a finding.

The determinations below show the **example app** (`legal-guardrails.md` §8) as the worked case:
Dutch eenmanszaak (sole controller, no employees, no DPO); Firebase (Auth, Firestore, Analytics,
Crashlytics, Cloud Functions, Hosting; `europe-west`) + RevenueCat + Apple/Google as merchants of
record; no medical claims; free tier on-device only, paid tier Firestore sync. Re-run each one on
the person's facts.

`skill-id` for findings = **`GDPR`** (per `method/finding-format.md`).

---

## WORKFLOW (six determinations, in order)

### 1 — Lawful-basis selector (Art. 6) — ONE basis per purpose

Build the purpose→basis table from the actual data model + the Privacy Policy's data section, then
check it against the **worked lawful-basis map** in `gdpr-articles.md` (Art. 6 section). The model
answer for the example app (add a row for every purpose the person's app has that it lacks):

| Purpose | Correct basis |
|---|---|
| Account, auth, subscription delivery, Pro Firestore sync | **6(1)(b)** contract |
| RevenueCat / Apple-Google receipt validation & entitlement | **6(1)(b)** contract |
| Crash diagnostics (Crashlytics) | **6(1)(a) consent** — device-read → ePrivacy 5(3) → opt-in |
| Product analytics (Firebase Analytics) | **6(1)(a) consent** — **NOT 6(1)(f)** |
| Fiscal record-keeping (subscription invoices) | **6(1)(c)** legal obligation |
| Server-side security / fraud (logs) | **6(1)(f)** legit interest — server-only, **LIA on file** |

**Flag (per the §gdpr-articles cheat-sheet items 1–2):**
- 🟠 any purpose stated with **no Art. 6 basis** (Art. 13(1)(c) makes stating it mandatory).
- 🔴/🟠 **device-side analytics or crash on 6(1)(f) / "legitimate interest"** — wrong; ePrivacy
  5(3) + Telecommunicatiewet 11.7a force prior consent. 6(1)(f) cannot launder the device-access
  gate. (This overlaps `analytics-consent`/`COOK`; take the higher severity.)
- 🟠 **basis-stacking** (two bases hedged on one purpose) — pick one.
- 🟢 confirm each 6(1)(f) use has an **LIA** on file (the project's LIA record, e.g. `lia.md`); flag absence 🟠.

Each finding cites the exact letter, e.g. `Art. 6(1)(a) + ePrivacy 5(3) [settled — verified 2026-06-06]`.

### 2 — Art. 9 special-category (health) determination — **the crux call**

Per `gdpr-articles.md` §Art. 9 + the **Privado adversarial test** (re-authored, see Sources):

1. **Scan** the data model AND all user-facing copy (Privacy + Terms + in-app + store copy +
   any health-disclaimer document the project keeps) for any health/stress/mood **inference, score, label, or
   trend** — e.g. "calm score", "anxiety down 20%", mood graph, stress trend, wellbeing rating.
   The adversarial framing: *if no code field and no copy matches a health-inference pattern, that
   is positive evidence the app does NOT process Art. 9 data.*
2. **If found** → Art. 9 triggers → require **Art. 9(2)(a) explicit, SEPARATE consent** (a distinct
   interaction, never bundled into ToS/privacy acceptance) **and** a dual basis (Art. 6 + 9(2)(a))
   surfaced in Privacy §3. Missing = **🔴 BLOCKER**; present-but-only-ordinary-consent = **🟠**.
3. **If absent** → emit the **reasoned 🟢 determination**: *"bare session logs (technique,
   duration, timestamp), no health/mood/stress inference, no scoring → NOT Art. 9; defensible on
   the no-medical-claims posture."* Record it for the LIA/DPIA; cross-check the health disclaimer
   stays inference-free. Mark the conclusion `[low-confidence — fact-specific]` per the reference.

> Health-claim language ("treats/cures/diagnoses/prevents") is BOTH an Art. 9 trigger risk and a
> medical-device/HBNR risk — flag 🔴 and hand the claim itself to `health-claims`.

### 3 — DPIA threshold screen (Art. 35) — produce a memo, never a silent skip

Walk **Art. 35(3)(a)/(b)/(c)** (the DPIA-Sentinel routing, re-authored — see Sources):
- (a) systematic + extensive **automated evaluation/profiling** with legal-or-similar effect →
  an app that makes **no** such decisions (Art. 22 N/A, as for the example app) → **fails (a)**.
- (b) **large-scale Art. 9** processing → only if Step 2 found inference; with the no-inference
  posture → **fails (b)**.
- (c) **systematic monitoring of a publicly accessible area** → N/A → **fails (c)**.

Also apply the **EDPB WP248 nine-criteria presumption**: meeting **2+** → strong presumption a
DPIA is needed. A single-dev wellness app with no profiling/no Art. 9/no public monitoring → **no
mandatory trigger likely** `[low-confidence — fact-specific]`. **Output a screening / threshold
MEMO** (Art. 35(7) skeleton: description → necessity & proportionality → risk → measures), not a
skip. If Step 2 ever flips, **35(3)(b) can mandate a full DPIA** + possible Art. 36 prior
consultation. Cross-check the **AP published 35(4) blacklist** via `ap-guidance.md` for any NL
jurisdiction trigger.

### 4 — RoPA-mandatory assertion (Art. 30(5))

Per `gdpr-articles.md` §Art. 30: a one-person eenmanszaak is far under 250 employees, **but** a
continuously-running app processes data **routinely, not occasionally** → **carve-out (ii) "not
occasional" defeats the exemption** → **RoPA is MANDATORY**. (If Step 2 found Art. 9 inference,
carve-out (iii) independently requires it too.)

- **Reject** any "small publisher, no RoPA needed" reasoning → 🟠 (cite carve-out (ii)).
- **Cross-check the project's RoPA (e.g. `ropa.md`) exists** and carries all Art. 30(1)(a)–(g) fields
  (controller+contact / purposes / data-subject + data categories / recipients / transfers +
  safeguards / erasure time-limits / TOMs description). Missing file = 🟠; missing field(s) = 🟡
  each (or 🟠 if a load-bearing field like recipients/transfers is absent).

### 5 — Art. 28 DPA-coverage check (per processor)

Per `gdpr-articles.md` §Art. 28. For **each** sub-processor confirm a signed Art-28 DPA
covering all of **(a)–(h)** + onward-transfer terms:

| Processor | Instrument | Check |
|---|---|---|
| **Google / Firebase / Google Cloud** | Google Cloud Data Processing Addendum (CDPA) | covers (a)–(h); confirm europe-west residency |
| **RevenueCat** | RevenueCat DPA | signed/accepted; sub-processor flow-down |
| **Apple** | DPA where Apple is **processor**; **independent controller** for store/payment | name the role per stream; flag if treated solely as processor where it is a controller `[low-confidence — Apple's role is split]` |
| **Cloudflare** | Cloudflare DPA | covers (a)–(h) (also a RevenueCat sub-processor) |

- **Cross-check the project's DPA / sub-processor register (e.g. `dpa-subprocessor-register.md`)**: every recipient listed with
  a DPA on file. Any recipient with **no DPA** = 🔴. A DPA missing the **(g) delete/return** or
  **(h) audit** clause = 🟠. Name the entity in every redline — never "third parties".

### 6 — Chapter V transfer check (per US sub-processor)

Per `transfers-dpf-scc.md` §6 decision tree, for **each** non-EEA recipient record **either** a
verified-active **DPF certification** **or** **2021 SCCs + a TIA**:

| Recipient | Mechanism to record |
|---|---|
| **Google LLC** (Firebase/Analytics) | **DPF-certified** → adequacy; + SCC Module 2 belt-and-braces. Confirm europe-west residency claim isn't overstated. |
| **Apple Inc.** | **DPF-listed** where processor; independent-controller flows ride Apple's own policy. |
| **RevenueCat** | **NOT DPF-certified** — relies **exclusively on 2021 SCCs** (+ UK Addendum / Swiss). Must be named with **SCCs, NOT DPF**. |
| **Cloudflare, Inc.** | **DPF-certified** (verify on list); or SCC + TIA. |

- 🔴 a PP/register that lists **RevenueCat as "DPF-certified"** — factually false.
- 🔴 any US recipient with **neither** active DPF **nor** SCC+TIA — unlawful transfer.
- 🟠 SCCs cited but **no TIA** on file (Schrems II).
- 🟠 names **Privacy Shield** (invalidated 2020) or the **old 2010/2004 SCCs** (repealed).
- **Cross-check the project's TIA and DPF verification log (e.g. `tia.md`, `dpf-verification-log.md`)**: every US recipient appears
  with a recorded mechanism. Each DPF entity must be marked `[verify]` against the live list at
  dataprivacyframework.gov (exact legal entity + **Active** + **EU-US** scope) before sign-off.

---

## Checks → severity (quick map)

| Condition | Sev |
|---|---|
| Device analytics/crash on 6(1)(f) instead of consent | 🔴/🟠 (floor with COOK) |
| Purpose with no stated Art. 6 basis | 🟠 |
| Art. 9 health inference + no explicit separate consent | 🔴 |
| Art. 9 inference + only ordinary consent | 🟠 |
| Health-claim language present | 🔴 (→ health-claims) |
| No DPIA screening memo at all | 🟡 (absence of documented reasoning) |
| "Too small for a RoPA" | 🟠 (carve-out (ii)) |
| `ropa.md` missing / missing a 30(1) field | 🟠 / 🟡 |
| Sub-processor with no Art. 28 DPA | 🔴 |
| DPA missing (g) or (h) | 🟠 |
| RevenueCat labelled DPF / US recipient with no mechanism | 🔴 |
| SCCs cited, no TIA | 🟠 |
| Reasoned "not Art. 9 / no mandatory DPIA / RoPA maintained" | 🟢 (evidence the engine is sound) |

**No silent supplement:** if Step 1–6 surfaces a question outside this checklist (e.g. an Art. 14
indirect-collection angle, an Art. 6(4) re-purposing question), raise it as a **🟡 note** — do not
silently act on or drop it.

---

## OUTPUT format

1. **Findings** — each as the `method/finding-format.md` shape:
   `[GDPR-<n>] <emoji> <title> / Location / Basis (citation + tier) / Issue / Redline
   (entity-named — Google-Firebase / RevenueCat / Apple / Cloudflare, never "third parties") /
   Confidence`.
2. **Lawful-basis table** — purpose → Art. 6 basis (+ Art. 9(2)(a) where applicable), as adjudicated.
3. **Screening determinations** (recorded, not skipped):
   - Art. 9: *triggered / not triggered* + the one-line reasoning + tier.
   - DPIA: *mandatory / no mandatory trigger* + the 35(3)(a/b/c) + 9-criteria reasoning → memo.
   - RoPA: *mandatory via 30(5) carve-out (ii)* (+ (iii) if Art. 9).
4. **Compliance-pack reconciliation table** — `Artifact | Present? | Covers required fields? | Gap`
   over `ropa.md`, `dpa-subprocessor-register.md`, `tia.md`, `dpf-verification-log.md`, `lia.md`.
5. **Per-document letter grade** (Privacy engine) + **verdict band**: SIGN-OFF / FIX-THEN-SIGN-OFF
   (emit the `Condition | Owner | Severity` table) / BLOCK, per `method/verdict-model.md`.
6. The **authority footer** (`legal-guardrails` §5) — reserving ONLY: the
   `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills, native-NL legal-idiom review, and any item this
   report marks `[low-confidence]` (notably the Art. 9 fact-specific call) for a Dutch advocaat.

---

## Sources adapted (provenance)

- **DPIA Sentinel** (lawve-ai, **AGPL-3.0 → RE-AUTHORED, no text copied**) — the Art. 35(3) routing
  + nine-criteria presumption informed Step 3, re-expressed, not lifted.
- **Privado `health_data` rules** (Commons-Clause overlay → **RE-AUTHORED**) — the adversarial
  "no matching field → not Art. 9" test was re-authored as Step 2, never copied.
