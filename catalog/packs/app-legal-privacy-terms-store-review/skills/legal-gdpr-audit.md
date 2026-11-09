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
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/gdpr-articles.md` — **the backbone**: Art. 6/7/8/9/28/30/35 tables + the Breathe lawful-basis map + the adjudication cheat-sheet.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/transfers-dpf-scc.md` — Chapter V, DPF adequacy, 2021 SCCs, TIA, per-recipient register.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/ap-guidance.md` — Autoriteit Persoonsgegevens positions (incl. the GA4 opt-in line, the AP DPIA blacklist).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/sdk-data-map.md` — which SDK egresses which data category (feeds the Art. 9 scan + the per-processor transfer check).

## App-facts inputs (this run = "Breathe"; swap per app for the portfolio)

Controller = Dutch **eenmanszaak** (sole controller; **no employees, no DPO**). Stack = Firebase
(Auth, Firestore, Analytics, Crashlytics, Cloud Functions, Hosting; `europe-west`) + RevenueCat +
Apple/Google as merchants of record. **No medical claims** ("supports / may help relax"). Free tier
= on-device data only; Pro = Firestore sync. Live docs:
`apps/my-app/app/assets/legal/{privacy,terms}.md` (+ `.nl.md`), version 6. In-repo compliance
pack: `docs/legal/compliance/{ropa,dpa-subprocessor-register,tia,dpf-verification-log,lia,retention-schedule,sdk-privacy-inventory,dpo-not-required}.md`.

`skill-id` for findings = **`GDPR`** (per `method/finding-format.md`).

---

## WORKFLOW (six determinations, in order)

### 1 — Lawful-basis selector (Art. 6) — ONE basis per purpose

Build the purpose→basis table from the actual data model + Privacy §3, then check it against the
**Breathe lawful-basis map** in `gdpr-articles.md` (Art. 6 section). The model answer:

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
- 🟢 confirm each 6(1)(f) use has an **LIA** (`docs/legal/compliance/lia.md`); flag absence 🟠.

Each finding cites the exact letter, e.g. `Art. 6(1)(a) + ePrivacy 5(3) [settled — verified 2026-06-06]`.

### 2 — Art. 9 special-category (health) determination — **the crux call**

Per `gdpr-articles.md` §Art. 9 + the **Privado adversarial test** (re-authored, see Sources):

1. **Scan** the data model AND all user-facing copy (Privacy + Terms + in-app + store copy +
   `docs/legal/health-disclaimer.md`) for any health/stress/mood **inference, score, label, or
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
  Breathe makes **no** such decisions (Art. 22 N/A) → **fails (a)**.
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
- **Cross-check `docs/legal/compliance/ropa.md` exists** and carries all Art. 30(1)(a)–(g) fields
  (controller+contact / purposes / data-subject + data categories / recipients / transfers +
  safeguards / erasure time-limits / TOMs description). Missing file = 🟠; missing field(s) = 🟡
  each (or 🟠 if a load-bearing field like recipients/transfers is absent).

### 5 — Art. 28 DPA-coverage check (per processor)

Per `gdpr-articles.md` §Art. 28 + the **compliance-anthropic 30-item DPA checklist** (Apache,
lift-with-attribution — see Sources). For **each** sub-processor confirm a signed Art-28 DPA
covering all of **(a)–(h)** + onward-transfer terms:

| Processor | Instrument | Check |
|---|---|---|
| **Google / Firebase / Google Cloud** | Google Cloud Data Processing Addendum (CDPA) | covers (a)–(h); confirm europe-west residency |
| **RevenueCat** | RevenueCat DPA | signed/accepted; sub-processor flow-down |
| **Apple** | DPA where Apple is **processor**; **independent controller** for store/payment | name the role per stream; flag if treated solely as processor where it is a controller `[low-confidence — Apple's role is split]` |
| **Cloudflare** | Cloudflare DPA | covers (a)–(h) (also a RevenueCat sub-processor) |

- **Cross-check `docs/legal/compliance/dpa-subprocessor-register.md`**: every recipient listed with
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
- **Cross-check `docs/legal/compliance/{tia,dpf-verification-log}.md`**: every US recipient appears
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
  + nine-criteria presumption + risk-register schema were re-implemented as Step 3, not lifted.
- **compliance-anthropic DPA checklist** (claude-for-legal, **Apache-2.0 → lift-with-attribution**)
  — the 30-item Art. 28 processor checklist informs Step 5.
- **Privado `health_data` rules** (Commons-Clause overlay → **RE-AUTHORED**) — the adversarial
  "no matching field → not Art. 9" test was re-authored as Step 2, never copied.
