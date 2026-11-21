# Health-App Classification Gates — EU MDR (medical device) & US FTC HBNR (health breach)

**Scope.** Reference for adjudicating whether a health, wellness or fitness app is (a) a **medical device** under EU MDR 2017/745, and (b) a **PHR vendor** under the US FTC Health Breach Notification Rule. Worked examples use one app, the worked example (`worked-example.md` §1 has its profile, §4 its decision); apply each gate to the app under review from its fact sheet. Both gates pivot on the same firewall a wellness app has to enforce — **no medical-purpose claims** and **no multi-source health-data import** — but they must be *ruled on and recorded*, not assumed.

**This is not legal advice.** It supports a clause/scope review; a Dutch jurist (MDR) and US counsel (HBNR) make the binding determination. Each [settled] tag carries the date its source was last checked (last re-check: **2026-11-18**).

**Citation tiers used below:** `[settled — <source>, verified <date>]` = confirmed against the primary/authoritative source on that date · `[verify]` = believed correct, not confirmed this run · `[verify-pinpoint]` = right substance, exact article/§ to pin · `[low-confidence]` = novel/contested/fact-specific.

> **Fetch note:** The two PRIMARY URLs in the brief failed this run (EC `download/related_documents/...` → 404; `ftc.gov/business-guidance/...` → 403, and FTC.gov blocks WebFetch generally). MDCG 2019-11 was instead verified against the EC primary PDF at `health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_en_0.pdf`. HBNR §318.2 text was verified against **Cornell LII** (16 CFR §318.2) plus the FTC **Federal Register** 2024 final-rule record (via search). **Re-check 2026-11-18:** MDCG 2019-11 **Rev.1 (June 2025)** was read from the EC download (`health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en?filename=mdcg_2019_11_en.pdf`, listed on the EC page of MDCG-endorsed guidance); the 2020-09 PDF above still answers but holds the 2019 base text. The MDR was read on EUR-Lex (original text for the recitals; consolidated version of 9 Nov 2026 for Art. 2(1) and Annex VIII). HBNR text was read on eCFR (16 CFR part 318, current) and Cornell LII; the 2024 final rule (89 FR 47028) and the 2026 penalty notice on federalregister.gov.

---

## 0. Decision (record the app's own decision in the review output; one app's decision: `worked-example.md` §4)

> **EU MDR.** Record whether the app is a medical device: whether it serves a *lifestyle/well-being* purpose, makes any **medical claim** (diagnosis/prevention/monitoring/prediction/prognosis/treatment/alleviation of disease), and whether its software functions go beyond delivering its content + logging sessions. The no-medical-claims guardrail ("supports / may help relax", never "treats/cures/diagnoses/prevents") IS the MDR firewall. Reasoning recorded per §1–2.
>
> **US FTC HBNR.** Record whether the app has the **"technical capacity to draw information from multiple sources"** that defines a *personal health record*: whether it imports any external health data (HealthKit, Google Fit, a wearable, a third-party health API). Reasoning recorded per §3–4.
>
> **Both determinations are CONDITIONAL on the current design.** Re-run this gate on any change to: (a) marketing/in-app/store/PP/ToS copy introducing a medical-purpose verb (→ MDR risk); or (b) integration of HealthKit / Google Fit / a wearable / any external health-data import (→ HBNR PHR-vendor risk). See §5 trigger lists.

---

# PART A — EU MDR 2017/745: Medical-Device Software (MDSW) screen

## 1. The "medical purpose" gate (Article 2(1))

A product is a **medical device** only if the manufacturer assigns it an intended **MEDICAL PURPOSE**. MDR Art. 2(1) lists the medical purposes in four indents (the others cover injury or disability; investigation, replacement or modification of the anatomy or of a physiological or pathological process or state; and in vitro examination of specimens). The first indent, the one a wellness app is most likely to touch, is:

| Medical purpose (Art. 2(1), 1st indent) | In the app under review? (one app's answers: `worked-example.md` §4) |
|---|---|
| diagnosis | |
| prevention | |
| monitoring | (session logging ≠ monitoring of a disease/physiological process for medical purpose) |
| prediction | |
| prognosis | |
| treatment | |
| alleviation of disease | |

The third indent of Art 2(1) — "investigation, replacement or modification of the anatomy or of a physiological or pathological process or state" — is the one an app that guides a physiological process (paced respiration, for example) is closest to. It scopes in only with a medical purpose; a wellness aim ("relax", "focus") stays outside (Recital 19). [settled — MDR Art 2(1) third indent, Art 2(12), Art 7(d), verified 2026-11-19]

`[settled — MDCG 2019-11 Rev.1 §3.1 / MDR Art. 2(1), verified 2026-11-18]` Software qualifies as a medical device (**MDSW**) only where it has one of these medical purposes; absent a medical purpose it is excluded regardless of healthcare context.

**Application:** an app that markets relaxation/general wellbeing and never names a disease or a clinical outcome → **no medical purpose → not a device.** A single claim like *"reduces your anxiety disorder"*, *"treats insomnia"*, *"lowers your blood pressure"*, *"prevents panic attacks"* would assign a medical purpose and could pull it into MDR scope. `[settled — MDR Art. 2(1) + Recital 19, verified 2026-11-18]`

## 2. The lifestyle/well-being carve-out (Recital 19) + the "mere processing" rule

`[settled — MDR Recital 19; MDCG 2019-11 Rev.1 §3.1, verified 2026-11-18]` The carve-out is in MDR Recital 19 itself (MDCG 2019-11 does not reproduce it):

> "software for general purposes, even when used in a healthcare setting, or software intended for **life-style and well-being purposes is not a medical device**."

MDCG 2019-11 Rev.1 §3.1 names **wellness or fitness apps** among software for non-medical purposes that does not qualify as MDSW.

`[settled — MDCG 2019-11 Rev.1 §3.1 and §3.3 decision step 3, verified 2026-11-18]` **Functional-limitation exclusion:** software whose action is limited to **storage, archival, communication, simple search, or lossless compression** is **NOT** MDSW (Rev.1 adds that a search feature counts as more than "simple search" when it contributes to a medical purpose). **Merely processing health information does not make software MDSW** unless it serves a medical purpose: Rev.1 §3.1 says software that processes, analyses, interprets, calculates, creates or modifies medical information may be MDSW where that is governed by a medical intended purpose.

**Application:** an app that (a) is squarely "lifestyle and well-being" and (b) whose data handling is storing/logging session metadata locally or syncing it to a backend (storage/communication only, not a medical-purpose computation) is kept out by both prongs.

## 3. MDCG 2019-11 qualification decision steps

`[settled — MDCG 2019-11 Rev.1 §3.3, Figure 1 decision steps 1–5, verified 2026-11-18]` The qualification flow (paraphrase):

1. **Is it software?** (a set of instructions processing input → output). Yes for any app.
2. **Is it an MDR Annex XVI device, an accessory, or software driving or influencing a medical device?** No.
3. **Does it perform an action on data beyond storage/archival/communication/simple search/lossless compression?**
4. **Is the action for the benefit of *individual* patients?**
5. **Is it MDSW under the definition, i.e. does it have a *medical purpose* (Art. 2(1))?** **No** → exits as **not MDSW**.

If it is MDSW, it is then classified under Annex VIII Rule 11 (Rev.1 §4). An app with no medical purpose exits at step 5 at the latest → **not MDSW**.

## 4. Annex VIII Rule 11 (what would happen IF it qualified)

`[settled — MDR Annex VIII §6.3 (Rule 11); MDCG 2019-11 Rev.1 §4.2.1 (sub-rules 11a–11c), verified 2026-11-18]` Once software qualifies as a device, **Rule 11** governs class:

| Rule 11 outcome | Class | Trigger |
|---|---|---|
| 11a: Information used for **diagnosis/therapy decisions** | **IIa** (default floor) | escalates to **IIb** if a wrong decision could cause **serious deterioration / surgical intervention**; **III** if it could cause **death / irreversible deterioration** |
| 11b: Monitoring **physiological processes** | **IIa** | **IIb** if it monitors **vital physiological parameters** whose variations could result in **immediate danger** to the patient (MDCG Rev.1 names respiration among vital parameters) |
| 11c: All other software | **I** | |

**Consequence if a wellness app ever scopes in via a medical claim:** most-likely **Class IIa** (information informing a clinical/therapeutic decision), triggering **CE marking**, a Notified Body conformity assessment, technical documentation, clinical evaluation, QMS, PMS, and EUDAMED registration. This is a launch-blocking burden — hence the claim-language firewall is a *regulatory*, not merely a marketing, control.

## 5. MDR claim-scanner trigger list (red flags → re-run the gate)

Scan **store listings, in-app copy, PP, ToS, the health disclaimer, and all marketing** for any medical-purpose verb tied to a condition. Any hit = potential scope-in → escalate to jurist.

- **Banned verbs:** *treats · cures · heals · diagnoses · prevents · monitors · screens · detects · reduces/relieves [a named disorder] · clinically proven · therapeutic · medically prevents · prognoses* `[settled — MDR Art. 2(1) names diagnosis, prevention, monitoring, prediction, prognosis, treatment and alleviation of disease, verified 2026-11-18; the other verbs are a scanner heuristic, not Art. 2(1) terms]`
- **Banned condition pairings:** anxiety **disorder**, panic **disorder**, clinical depression, insomnia (as a diagnosis), hypertension / blood pressure, PTSD, ADHD, asthma/COPD, arrhythmia.
- **Physiological-process claims:** respiration or heart-rate claims tied to a health outcome ("lowers blood pressure", "regulates breathing/respiration for [condition]"); evidence notes that cite clinical outcomes in a condition population. Respiration is a vital physiological parameter in MDCG 2019-11 Rev.1, so such a claim would also raise the Rule 11 class. [settled — MDCG 2019-11 Rev.1 §4.2.1, verified 2026-11-18; MDR Art 2(1), verified 2026-11-19]
- **Limit of the out-of-scope verdict:** it holds only while no copy assigns a medical purpose. Once any copy does, MDR qualification and class are for a lawyer and a notified body: `[low-confidence — LEGAL REVIEW REQUIRED]`; the suite gives no verdict on them (`legal-guardrails.md` §5).
- **SAFE wellness framing (keep):** "supports relaxation", "may help you relax / unwind / feel calmer", "general wellbeing", "a `<app category>` practice" (e.g. mindfulness), "not a medical device", "not a substitute for professional medical advice — consult a doctor". `[settled — MDR Recital 19, verified 2026-11-18]`
- **Output:** `MDR out-of-scope — wellness framing intact` OR a list of offending phrases + which surface they appear on.

> **Cross-reference (platform):** Apple Guideline **1.4.1** (medical claims must be substantiated or are rejected) and Google Play **Health Content & Services** policy reinforce the same firewall. Keeping clean of MDR also keeps clean of these. See `references/app-stores/` for those.

---

# PART B — US FTC Health Breach Notification Rule (16 CFR Part 318)

> **US relevance:** HBNR is US law; it bites only if the app has **US users** (an app listed worldwide on the App Store will). It is **not** the same as HIPAA — HBNR covers health apps **not** subject to HIPAA. `[settled — 16 CFR §318.1(a) (eCFR), verified 2026-11-18]`

## 6. The PHR-vendor gate — the "multiple sources" element is decisive

`[settled — 16 CFR §318.2 (Cornell LII; eCFR), verified 2026-11-18]` Key definitions (the gating ones):

- **Personal health record (PHR):** "an electronic record of PHR identifiable health information on an individual that **has the technical capacity to draw information from multiple sources** and that is managed, shared, and controlled by or primarily for the individual."
- **Vendor of personal health records:** an entity that "offers or maintains a personal health record" (and is **not** a HIPAA-covered entity / business associate to the extent it acts as one).
- **PHR identifiable health information:** information relating to past/present/future physical or mental health, provision of health care, or payment for health care, that identifies (or can reasonably be used to identify) the individual; created or received by a covered health-care provider, health plan, employer, or clearinghouse; **and** includes information provided by or on behalf of the individual.
- **Breach of security:** "**acquisition** of [unsecured PHR identifiable health information] **without the authorization of the individual**" — and the rule treats this as **including unauthorized acquisition that results from a data breach OR an unauthorized disclosure** (unauthorized **access** is **presumed** to include acquisition unless the entity has reliable evidence that there was none, or could reasonably have been none). `[settled — 16 CFR §318.2 "breach of security", verified 2026-11-18]`
- **PHR related entity:** offers products/services through a PHR vendor's or HIPAA-covered entity's website, or accesses/sends unsecured PHR identifiable health info to/from a PHR.

`[settled — FTC 2024 Final Rule, 89 FR 47028 (FR doc. 2024-10855), background section, verified 2026-11-18]` The FTC explains: because the statute requires a PHR to be "an electronic record … that can be **drawn from multiple sources**", **health apps likely qualify as PHRs covered by the Rule *if they are capable of drawing information from multiple sources*.** This capability is the hinge.

**Application:** an app that records session data the **user generates inside the app only**, and does **not** import from HealthKit, Google Fit, a wearable, or any external health source, lacks the "technical capacity to draw information from **multiple sources**" → it is **not a "personal health record"** → its publisher is **not a "vendor of personal health records"** → **HBNR does not apply.** `[low-confidence]` on the ultimate classification — this is a fact-specific call US counsel should confirm; the FTC has read "multiple sources" broadly (e.g., app + device APIs + user input can together count), so the *absence of any external health integration* is what carries the conclusion. Record the integration inventory as evidence.

## 7. 2024 final-rule amendments (why wellness apps are now on the radar)

`[settled — FTC Final Rule, effective 2024-07-29; Federal Register 2024-05-30 (89 FR 47028), verified 2026-11-18]`

- **Effective date:** July 29, 2024.
- Added/modified definitions to make clear the Rule **covers health apps and connected devices**: new **"covered health care provider"** and **"health care services or supplies"** definitions; a health/wellness app can be a "covered health care provider" by furnishing "health care services or supplies" (e.g., a service that provides mechanisms to track health/wellness). `[settled — 16 CFR §318.2, verified 2026-11-18]`
- Clarified **"breach of security"** to expressly capture **unauthorized disclosures** (e.g., sharing covered data with advertisers/SDKs without authorization), not only outside hacks. `[settled — FTC Final Rule; 16 CFR §318.2, verified 2026-11-18]`
- **In-scope health categories the FTC names** (illustrative; confirms a mindfulness/wellness app is the *type* of product the FTC targets, even though the "multiple sources" gate may still exclude it): **mental health, sleep, fitness, fertility/reproductive health, diet, vital signs, symptoms, bodily functions, diagnoses, medications, genetic data**. `[settled — 16 CFR §318.2 "health care services or supplies", verified 2026-11-18]`

## 8. Notification obligations (apply ONLY if the app is, or becomes, in-scope)

`[settled — 16 CFR §318.3(a)–(b), §318.4(a)–(b), §318.5(b)–(c) (eCFR, as amended 2024), verified 2026-11-18]`

| Recipient | Trigger | Timing |
|---|---|---|
| **Affected individuals** | any breach of unsecured PHR identifiable health info | "without unreasonable delay and **in no case later than 60 calendar days**" after discovery |
| **The FTC** | breach involving **500+ individuals** | **at the same time as** the notice to individuals ("contemporaneously", §318.4(b)), so ≤ 60 calendar days after discovery |
| **The FTC** | breach involving **<500 individuals** | may log and report **annually**, no later than **60 calendar days after the end of the calendar year** |
| **Prominent media** | **500+ residents** of a State/jurisdiction | without unreasonable delay, ≤ 60 calendar days |
| **Third-party service providers** | a breach they suffer | must notify the PHR vendor / related entity they serve |

## 9. Civil penalty

`[settled — 16 CFR §318.7 and §1.98(d) (eCFR, $53,088 from 90 FR 5581, 17 Jan 2025); FTC notice FR doc. 2026-18853 (15 Sep 2026), verified 2026-11-18]` Each violation of the Rule is treated as an unfair/deceptive act → civil penalty of up to **$53,088 per violation** (2025 inflation-adjusted; brief's older **$51,744** was the 2024 figure). The FTC made **no** adjustment for 2026: its notice of 15 Sep 2026 keeps the 2025 levels. The FTC has read "per violation" expansively (potentially per-individual / per-day), so exposure scales with affected-user count. `[low-confidence]` on per-day/per-individual multiplier — confirm with counsel.

---

## 10. Classification output template (fill in the app's own; one app's filled-in block: `worked-example.md` §4)

```
HEALTH-APP CLASSIFICATION GATE — <app name> — <date>

EU MDR 2017/745:  OUT OF SCOPE | AT RISK → ESCALATE
  - Medical purpose (Art. 2(1)): none | <phrase>; lifestyle/well-being carve-out (Recital 19): applies | does not apply
  - Claim-scan result: [PASS — wellness framing intact] / [FAIL — phrases: ...]
  - Software functions limited to delivery + storage/sync (not MDSW): yes | no
  - If scoped-in: likely Class IIa (Annex VIII Rule 11) → CE marking. ESCALATE.

US FTC HBNR (16 CFR 318):  NOT A PHR VENDOR | AT RISK → ESCALATE
  - "Technical capacity to draw from multiple sources": none | <source>
    HealthKit? <yes/no>. Google Fit? <yes/no>. Wearable/3P health API? <yes/no>.
  - Integration inventory attached as evidence.
  - Conditional: adding any external health import → re-run; HBNR may apply
    (60-day individual notice; FTC at the same time if 500+; penalty up to $53,088/violation).

Re-run triggers logged: [§5 medical-verb scan] [HealthKit/Fit/wearable integration]
Adjudicated by: <skill/agent> — binding determination deferred to: jurist (MDR) / US counsel (HBNR)
```

---

## 11. Open items for a human to confirm (verify flags)

- **Closed 2026-11-18:** MDCG 2019-11 Rev.1 (June 2025) read on the EC site: §3.1 names wellness or fitness apps as non-MDSW and keeps the "processing ≠ MDSW without a medical purpose" point; Figure 1 has five decision steps (§3.3). The life-style carve-out is MDR Recital 19's own wording, not MDCG's.
- **Closed 2026-11-18:** pins added: MDCG Rev.1 §§3.1, 3.3, 4.2.1; Rule 11 = MDR Annex VIII §6.3 (MDCG sub-rules 11a–11c); §318.2 "covered health care provider", "health care services or supplies" and the access-presumption sentence of "breach of security".
- `[low-confidence]` Ultimate **HBNR PHR-vendor** classification for a self-contained wellness app — the "multiple sources" test is fact-specific and the FTC reads it broadly; US counsel should confirm a purely self-contained app stays out.
- **Closed 2026-11-18:** no 2026 adjustment; the FTC keeps the 2025 figure of $53,088 (FR doc. 2026-18853).
- `[low-confidence]` Whether "per violation" multiplies per-individual/per-day for HBNR penalties.
