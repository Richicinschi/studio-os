# Health-App Classification Gates — EU MDR (medical device) & US FTC HBNR (health breach)

**Scope.** Reference for adjudicating whether the breathing/mindfulness app **"Breathe"** (Dutch *eenmanszaak*; EU/NL-first; auto-renewing subs sold through Apple/Google; RevenueCat + Firebase `europe-west`; **no medical claims**, general-wellness framing only) is (a) a **medical device** under EU MDR 2017/745, and (b) a **PHR vendor** under the US FTC Health Breach Notification Rule. Both gates pivot on the same firewall the project already enforces — **no medical-purpose claims** and **no multi-source health-data import** — but they must be *ruled on and recorded*, not assumed.

**This is not legal advice.** It supports a clause/scope sign-off; a Dutch jurist (MDR) and US counsel (HBNR) make the binding determination. Last-verified date for [settled] tags: **2026-06-06**.

**Citation tiers used below:** `[settled — <source>, verified 2026-06-06]` = confirmed against primary/authoritative source this run · `[verify]` = believed correct, not confirmed this run · `[verify-pinpoint]` = right substance, exact article/§ to pin · `[low-confidence]` = novel/contested/fact-specific.

> **Fetch note:** The two PRIMARY URLs in the brief failed this run (EC `download/related_documents/...` → 404; `ftc.gov/business-guidance/...` → 403, and FTC.gov blocks WebFetch generally). MDCG 2019-11 was instead verified against the EC primary PDF at `health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_en_0.pdf`. HBNR §318.2 text was verified against **Cornell LII** (16 CFR §318.2) plus the FTC **Federal Register** 2024 final-rule record (via search). Treat MDCG **Rev.1 (June 2025)** specifics as `[verify]` — the EC PDF fetched is the 2019 base text; Rev.1 changes were confirmed only via secondary commentary this run.

---

## 0. Decision (record this in the sign-off output)

> **EU MDR — OUT OF SCOPE.** Breathe is **not a medical device**: it serves a *lifestyle/well-being* purpose, makes **no medical claim** (diagnosis/prevention/monitoring/prediction/prognosis/treatment/alleviation of disease), and its software functions do not go beyond delivering breathing exercises + logging sessions. The no-medical-claims guardrail ("supports / may help relax", never "treats/cures/diagnoses/prevents") IS the MDR firewall. Reasoning recorded per §1–2.
>
> **US FTC HBNR — NOT A PHR VENDOR.** Breathe lacks the **"technical capacity to draw information from multiple sources"** that defines a *personal health record*: it imports **no** external health data (no HealthKit, no Google Fit, no wearable, no third-party health API). On the current self-contained design it is outside the HBNR's "vendor of personal health records" definition. Reasoning recorded per §3–4.
>
> **Both determinations are CONDITIONAL on the current design.** Re-run this gate on any change to: (a) marketing/in-app/store/PP/ToS copy introducing a medical-purpose verb (→ MDR risk); or (b) integration of HealthKit / Google Fit / a wearable / any external health-data import (→ HBNR PHR-vendor risk). See §5 trigger lists.

---

# PART A — EU MDR 2017/745: Medical-Device Software (MDSW) screen

## 1. The "medical purpose" gate (Article 2(1))

A product is a **medical device** only if the manufacturer assigns it an intended **MEDICAL PURPOSE**. The exhaustive purpose list in MDR Art. 2(1) is:

| Medical purpose (Art. 2(1), 1st indent) | In Breathe? |
|---|---|
| diagnosis | No |
| prevention | No |
| monitoring | No (session logging ≠ monitoring of a disease/physiological process for medical purpose) |
| prediction | No |
| prognosis | No |
| treatment | No |
| alleviation of disease | No |

`[settled — MDCG 2019-11 §"medical purpose" / MDR Art. 2(1), verified 2026-06-06]` Software qualifies as a medical device (**MDSW**) only where it has one of these medical purposes; absent a medical purpose it is excluded regardless of healthcare context. `[verify-pinpoint]` exact MDCG section/paragraph numbering (Decision Steps figure + §3 definitions) to pin against Rev.1 pagination.

**Application:** Breathe markets relaxation/general wellbeing and never names a disease or a clinical outcome → **no medical purpose → not a device.** A single claim like *"reduces your anxiety disorder"*, *"treats insomnia"*, *"lowers your blood pressure"*, *"prevents panic attacks"* would assign a medical purpose and could pull it into MDR scope. `[settled — MDR Art. 2(1) + Recital 19, verified 2026-06-06]`

## 2. The lifestyle/well-being carve-out (Recital 19) + the "mere processing" rule

`[settled — MDCG 2019-11 (citing MDR Recital 19), verified 2026-06-06]` Verbatim carve-out reproduced in MDCG 2019-11:

> "software for general purposes, even when used in a healthcare setting, or software intended for **lifestyle and well-being purposes is not a medical device**."

`[settled — MDCG 2019-11, verified 2026-06-06]` **Functional-limitation exclusion:** software whose action is limited to **storage, archival, communication, simple search, or lossless compression** is **NOT** MDSW. **Merely processing/digitising health information does not make software MDSW** unless it serves a medical purpose. (The June-2025 Rev.1 is reported to reinforce this "processing health info ≠ MDSW absent medical purpose" point and to expand the borderline-wellness decision tree — `[verify]` against Rev.1 text.)

**Application:** Breathe (a) is squarely "lifestyle and well-being"; (b) its data handling = storing/logging session metadata locally (free) or syncing to Firestore (Pro) → storage/communication only, not a medical-purpose computation. Both prongs keep it out.

## 3. MDCG 2019-11 qualification decision steps

`[settled — MDCG 2019-11 Figure 1 / Decision Steps, verified 2026-06-06]` `[verify-pinpoint]` exact step lettering vs Rev.1. The qualification flow (paraphrase):

1. **Is it software?** (a set of instructions processing input → output). Yes for Breathe.
2. **Is it an accessory / driving-or-influencing a medical device?** No.
3. **Does it perform an action beyond storage/archival/communication/simple search/lossless compression?** Breathe: essentially no (it presents timed breathing visuals + logs). 
4. **Is the action for the benefit of *individual* patients with a *medical purpose* (Art. 2(1))?** **No** → exits as **not MDSW**.
5. (If yes →) classify under Annex VIII Rule 11.

Breathe exits at step 4 (no medical purpose) → **not MDSW**.

## 4. Annex VIII Rule 11 (what would happen IF it qualified)

`[settled — MDCG 2019-11 §classification / MDR Annex VIII Rule 11, verified 2026-06-06]` Once software qualifies as a device, **Rule 11** governs class:

| Rule 11 outcome | Class | Trigger |
|---|---|---|
| Information used for **diagnosis/therapy decisions** | **IIa** (default floor) | escalates to **IIb** if a wrong decision could cause **serious deterioration / surgical intervention**; **III** if it could cause **death / irreversible deterioration** |
| Monitoring **vital physiological processes** | **IIb** | (III if variations could cause immediate danger) |
| All other software (information not for the above) | **I** | |

**Consequence if Breathe ever scoped-in via a medical claim:** most-likely **Class IIa** (information informing a clinical/therapeutic decision), triggering **CE marking**, a Notified Body conformity assessment, technical documentation, clinical evaluation, QMS, PMS, and EUDAMED registration. This is a launch-blocking burden — hence the claim-language firewall is a *regulatory*, not merely a marketing, control. `[verify-pinpoint]` exact Rule 11 sub-paragraph lettering.

## 5. MDR claim-scanner trigger list (red flags → re-run the gate)

Scan **store listings, in-app copy, PP, ToS, the health disclaimer, and all marketing** for any medical-purpose verb tied to a condition. Any hit = potential scope-in → escalate to jurist.

- **Banned verbs:** *treats · cures · heals · diagnoses · prevents · monitors · screens · detects · reduces/relieves [a named disorder] · clinically proven · therapeutic · medically prevents · prognoses* `[settled — MDR Art. 2(1), verified 2026-06-06]`
- **Banned condition pairings:** anxiety **disorder**, panic **disorder**, clinical depression, insomnia (as a diagnosis), hypertension / blood pressure, PTSD, ADHD, asthma/COPD, arrhythmia.
- **SAFE wellness framing (keep):** "supports relaxation", "may help you relax / unwind / feel calmer", "general wellbeing", "a mindfulness/breathing practice", "not a medical device", "not a substitute for professional medical advice — consult a doctor". `[settled — MDR Recital 19, verified 2026-06-06]`
- **Output:** `MDR out-of-scope — wellness framing intact` OR a list of offending phrases + which surface they appear on.

> **Cross-reference (platform):** Apple Guideline **1.4.1** (medical claims must be substantiated or are rejected) and Google Play **Health Content & Services** policy reinforce the same firewall. Keeping clean of MDR also keeps clean of these. See `references/app-stores/` for those.

---

# PART B — US FTC Health Breach Notification Rule (16 CFR Part 318)

> **US relevance:** HBNR is US law; it bites only if Breathe has **US users** (it will, via the App Store). It is **not** the same as HIPAA — HBNR covers health apps **not** subject to HIPAA. `[settled — 16 CFR §318.1 / FTC, verified 2026-06-06]`

## 6. The PHR-vendor gate — the "multiple sources" element is decisive

`[settled — 16 CFR §318.2 (Cornell LII), verified 2026-06-06]` Key definitions (the gating ones):

- **Personal health record (PHR):** "an electronic record of PHR identifiable health information on an individual that **has the technical capacity to draw information from multiple sources** and that is managed, shared, and controlled by or primarily for the individual."
- **Vendor of personal health records:** an entity that "offers or maintains a personal health record" (and is **not** a HIPAA-covered entity / business associate to the extent it acts as one).
- **PHR identifiable health information:** information relating to past/present/future physical or mental health, provision of health care, or payment for health care, that identifies (or can reasonably be used to identify) the individual; created or received by a covered health-care provider, health plan, employer, or clearinghouse; **and** includes information provided by or on behalf of the individual.
- **Breach of security:** "**acquisition** of [unsecured PHR identifiable health information] **without the authorization of the individual**" — and the rule treats this as **including unauthorized acquisition that results from a data breach OR an unauthorized disclosure** (acquisition is **presumed** unless there is reliable evidence none occurred). `[settled — 16 CFR §318.2, verified 2026-06-06]` `[verify-pinpoint]` exact wording of the acquisition-presumption clause.
- **PHR related entity:** offers products/services through a PHR vendor's or HIPAA-covered entity's website, or accesses/sends unsecured PHR identifiable health info to/from a PHR.

`[settled — FTC 2024 Final Rule, Federal Register 89 FR (2024-10855), verified 2026-06-06]` The FTC explains: because the statute requires a PHR to be "an electronic record … that can be **drawn from multiple sources**", **health apps likely qualify as PHRs covered by the Rule *if they are capable of drawing information from multiple sources*.** This capability is the hinge.

**Application to Breathe:** Breathe records breathing-session data the **user generates inside the app only**. It does **not** import from HealthKit, Google Fit, a wearable, or any external health source. → It lacks the "technical capacity to draw information from **multiple sources**" → it is **not a "personal health record"** → its publisher is **not a "vendor of personal health records"** → **HBNR does not apply.** `[low-confidence]` on the ultimate classification — this is a fact-specific call US counsel should confirm; the FTC has read "multiple sources" broadly (e.g., app + device APIs + user input can together count), so the *absence of any external health integration* is what carries the conclusion. Record the integration inventory as evidence.

## 7. 2024 final-rule amendments (why wellness apps are now on the radar)

`[settled — FTC Final Rule, effective 2024-07-29; Federal Register 2024-05-30, verified 2026-06-06]`

- **Effective date:** July 29, 2024.
- Added/modified definitions to make clear the Rule **covers health apps and connected devices**: new **"health care provider"** and **"health care services or supplies"** definitions; a health/wellness app can be a "health care provider" by furnishing "health care services or supplies" (e.g., a service that provides mechanisms to track health/wellness). `[verify-pinpoint]` exact §318.2 sub-definitions text.
- Clarified **"breach of security"** to expressly capture **unauthorized disclosures** (e.g., sharing covered data with advertisers/SDKs without authorization), not only outside hacks. `[settled — FTC Final Rule, verified 2026-06-06]`
- **In-scope health categories the FTC names** (illustrative; confirms a mindfulness/wellness app is the *type* of product the FTC targets, even though the "multiple sources" gate may still exclude it): **mental health, sleep, fitness, fertility/reproductive health, diet, vital signs, symptoms, bodily functions, diagnoses, medications, genetic data**. `[settled — FTC 2024 rulemaking, verified 2026-06-06]`

## 8. Notification obligations (apply ONLY if Breathe ever becomes in-scope)

`[settled — 16 CFR §§318.3–318.5, verified 2026-06-06]` `[verify-pinpoint]` exact section split for media/FTC timing.

| Recipient | Trigger | Timing |
|---|---|---|
| **Affected individuals** | any breach of unsecured PHR identifiable health info | "without unreasonable delay and **in no case later than 60 calendar days**" after discovery |
| **The FTC** | breach involving **500+ individuals** | **within 10 business days** of discovery |
| **The FTC** | breach involving **<500 individuals** | may log and report **annually**, no later than **60 calendar days after the end of the calendar year** |
| **Prominent media** | **500+ residents** of a State/jurisdiction | without unreasonable delay, ≤ 60 calendar days |
| **Third-party service providers** | a breach they suffer | must notify the PHR vendor / related entity they serve |

## 9. Civil penalty

`[settled — FTC inflation-adjusted CMP, 2025 figure, verified 2026-06-06]` Each violation of the Rule is treated as an unfair/deceptive act → civil penalty of up to **$53,088 per violation** (2025 inflation-adjusted; brief's older **$51,744** was the prior year's figure). `[verify]` the **2026** inflation-adjusted figure — FTC published a 2026 CMP adjustment (Federal Register, Jan 2026); the exact updated HBNR amount was not pinned this run. The FTC has read "per violation" expansively (potentially per-individual / per-day), so exposure scales with affected-user count. `[low-confidence]` on per-day/per-individual multiplier — confirm with counsel.

---

## 10. Sign-off output template

```
HEALTH-APP CLASSIFICATION GATE — Breathe — <date>

EU MDR 2017/745:  OUT OF SCOPE
  - No medical purpose (Art. 2(1)); lifestyle/well-being carve-out (Recital 19).
  - Claim-scan result: [PASS — wellness framing intact] / [FAIL — phrases: ...]
  - Software functions limited to delivery + storage/sync (not MDSW).
  - If scoped-in: likely Class IIa (Annex VIII Rule 11) → CE marking. ESCALATE.

US FTC HBNR (16 CFR 318):  NOT A PHR VENDOR
  - No "technical capacity to draw from multiple sources":
    HealthKit? NO. Google Fit? NO. Wearable/3P health API? NO.
  - Integration inventory attached as evidence.
  - Conditional: adding any external health import → re-run; HBNR may apply
    (60-day individual notice; FTC 10-day if 500+; penalty ~$53,088+/violation).

Re-run triggers logged: [§5 medical-verb scan] [HealthKit/Fit/wearable integration]
Adjudicated by: <skill/agent> — binding determination deferred to: jurist (MDR) / US counsel (HBNR)
```

---

## 11. Open items for a human to confirm (verify flags)

- `[verify]` MDCG 2019-11 **Rev.1 (June 2025)** specific changes (the fetched EC PDF was the 2019 base text; Rev.1 deltas came from secondary commentary). Confirm the lifestyle carve-out + "processing ≠ MDSW" wording survives unchanged and pin the Rev.1 decision-step lettering.
- `[verify-pinpoint]` Exact MDCG section/figure numbers, MDR Annex VIII **Rule 11** sub-paragraph lettering, and the precise §318.2 sub-definitions ("health care provider", "health care services or supplies", acquisition-presumption clause).
- `[low-confidence]` Ultimate **HBNR PHR-vendor** classification for Breathe — the "multiple sources" test is fact-specific and the FTC reads it broadly; US counsel should confirm a purely self-contained app stays out.
- `[verify]` **2026** FTC inflation-adjusted civil-penalty figure for HBNR (2025 = $53,088 confirmed).
- `[low-confidence]` Whether "per violation" multiplies per-individual/per-day for HBNR penalties.
