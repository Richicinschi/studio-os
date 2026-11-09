---
name: legal-health-claims
description: >-
  Use when checking app copy for medical/health claims as BOTH a marketing guardrail AND a
  regulatory classification gate. Scans every surface (Play / App Store description, in-app
  strings, About, PP/ToS health disclaimer, marketing) for medical verbs (treats / cures /
  diagnoses / prevents / heals / monitors / "clinically proven" / "reduces your <condition>") and
  either confirms wellness framing intact ("supports / may help relax") or lists each offending
  phrase + surface. Then rules the app IN or OUT of EU MDR 2017/745 (Art. 2(1) medical purpose +
  MDCG 2019-11 + Annex VIII Rule 11) and the US FTC Health Breach Notification Rule (16 CFR Part
  318 — the "draws from multiple sources" PHR-vendor gate). Verifies the MANDATORY "not a medical
  device / consult a healthcare professional" disclaimer is in the Play STORE DESCRIPTION (not only
  in-app) and judges whether the Play Health apps declaration form is needed. Trigger on "health
  claims", "medical claims", "MDR", "medical device", "HBNR", "treats cures diagnoses".
metadata:
  category: legal
  author: Richicinschi (Claude-authored)
  version: 1.0.0
  domain: legal / health-claims / regulatory-classification (MDR + HBNR)
  jurisdiction: EU/NL-primary (MDR), US-overlay (FTC HBNR), Apple/Google platform overlays
---

# legal-health-claims — wellness-framing guardrail + MDR/HBNR classification gate

Operates under **legal-guardrails** — load its constitution + the references listed below.

This skill does two jobs at once: (1) a **marketing guardrail** — scan every copy surface for medical claims; (2) a **regulatory classification gate** — rule the app in/out of EU MDR and US FTC HBNR scope, *reasoned and recorded*, not assumed. The same firewall powers both: **no medical-purpose claims** and **no multi-source health-data import**.

## Load these references first

- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/attribution-tiering.md` — tier every legal proposition
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/finding-format.md` — the finding shape (skill-id `HLT`)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/verdict-model.md` — SIGN-OFF / FIX-THEN-SIGN-OFF / BLOCK + grade
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/disclosure-grading.md` — entity-named redlines
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/mdr-hbnr.md` — **the substantive engine**: MDR Art. 2(1) purpose table, Recital 19 carve-out, MDCG 2019-11 decision steps, Annex VIII Rule 11, the §5 medical-verb trigger list, the HBNR §318.2 PHR-vendor "multiple sources" gate, the §10 sign-off output template
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/play-policies.md` — Module 3 Health Content & Services (3B declaration form, 3C prohibited claims, **3D mandatory store-description disclaimer**)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/apple-review-guidelines.md` — **1.4.1** medical-claim gate (the Apple-side mirror)

Do not reproduce their tables here — read them at runtime and cite by pinpoint.

## App-profile inputs (THIS run = Breathe; treat as variables for the portfolio)

Supply per app: `{app_name}`, the **claim surfaces** (Play description, App Store description, in-app strings/ARB, About screen, PP/ToS health disclaimer, any marketing/landing copy), and the **health-integration inventory** (HealthKit? Google Fit / Health Connect? wearable? any external health API?). For Breathe: general-wellness breathing app, no medical claims, **no** HealthKit / Google Fit / Health Connect / wearable / external health import; free = on-device only, Pro = Firestore sync; live docs `apps/my-app/app/assets/legal/{privacy,terms}.md` (+ `.nl.md`) v6.

---

## WORKFLOW

1. **Inventory the surfaces.** Enumerate every copy surface above. Grep the in-app strings (ARB / Dart constants), the bundled legal markdown, the About screen, and — critically — both **store descriptions** (Play + App Store). Record which surfaces were and were not available this run (a missing store description is a 🟡 "not in evidence" note, not a silent pass).

2. **Medical-verb scan (the guardrail).** Across ALL surfaces, flag any medical-purpose verb tied to a condition. Use the §5 trigger list in `mdr-hbnr.md`:
   - **Banned verbs:** treats · cures · heals · diagnoses · prevents · monitors · screens · detects · reduces/relieves [a named disorder] · clinically proven · therapeutic · medically prevents · prognoses.
   - **Banned condition pairings:** anxiety **disorder**, panic **disorder**, clinical depression, insomnia (as a diagnosis), hypertension / blood pressure, PTSD, ADHD, asthma/COPD, arrhythmia.
   - **SAFE framing (keep, do not flag):** "supports relaxation", "may help you relax / unwind / feel calmer", "general wellbeing", "a mindfulness/breathing practice", plus the disclaimer negations ("not a medical device", "not a substitute for professional medical advice — consult a doctor").
   - For each hit, emit a **per-phrase block** (re-authored from the claude-for-legal marketing-claims-review pattern, Apache-2.0 — adapted, not copied): quote the offending phrase · name the surface · grade severity · give a **fix that keeps the energy** (rewrite to safe wellness framing, don't just delete). Output `MDR-claim-scan: PASS — wellness framing intact` OR the offending-phrase list.

3. **EU MDR Rule-11 / MDCG-2019-11 screen.** Walk the medical-purpose gate (Art. 2(1) — diagnosis/prevention/monitoring/prediction/prognosis/treatment/alleviation) + the Recital 19 lifestyle/well-being carve-out + the MDCG 2019-11 decision steps (exits at "no medical purpose → not MDSW"). Record the decision: **`MDR — OUT OF SCOPE`** with reasoning, OR — if the scan in step 2 found a medical-purpose phrase — flag the risk that the app could scope IN (most-likely **Class IIa** under Annex VIII Rule 11 → CE marking, Notified Body, EUDAMED = launch-blocking) and **escalate to the Dutch jurist** (binding MDR determination is reserved).

4. **US FTC HBNR screen.** Apply the 16 CFR §318.2 PHR-vendor gate: a "personal health record" must have the **technical capacity to draw information from multiple sources**. Read off the integration inventory: HealthKit? Google Fit / Health Connect? wearable? third-party health API? If **none**, record **`HBNR — NOT A PHR VENDOR`** (no multi-source import → not a PHR → publisher is not a vendor of PHRs → HBNR does not apply), attaching the inventory as evidence. If ANY external health import exists, flag that HBNR may apply (60-day individual notice; FTC within 10 business days if 500+; penalty ~$53,088+/violation) and escalate to US counsel. The ultimate HBNR classification is `[low-confidence]` per the constitution — surface it for human confirmation.

5. **Mandatory store-description disclaimer check.** Confirm the **"not a medical device and does not diagnose, treat, cure, or prevent any medical condition" + "consult a healthcare professional"** wording appears in the **Play store-listing description itself** (Module 3D — a Google Play requirement, NOT satisfied by the in-app About alone). Verify BOTH placements (store description AND in-app). Missing from the store description = 🟠 MATERIAL (store-gate). Confirm the Apple 1.4.1 mirror is also clean.

6. **Play Health apps declaration form — judgment, documented.** Module 3 scopes in any app with "health-related features" by framing alone; Module 3B says "all developers must complete the Health apps declaration form." A breathing/mindfulness app is in scope by framing even with no health data. Decide and **document the call** (conservative: file it; whether a purely on-device no-health-data app is strictly *required* vs *eligible* is `[verify]`). Note it as a condition with Owner = owner/Play Console.

7. **No silent supplement.** Any health-claim question outside this checklist (e.g. an FTC HBNR per-day-penalty multiplier, an MDCG 2019-11 Rev.1 wording delta) → raise as a 🟡 MINOR note, do not act on it silently.

8. **Verdict.** Aggregate per the verdict model; emit the §10 sign-off template from `mdr-hbnr.md`, the finding list, and the authority footer.

---

## Checks this skill applies

| # | Check | Source (cite at pinpoint) | Fail → severity |
|---|---|---|---|
| HLT-a | Medical-verb scan across ALL surfaces clean | MDR Art. 2(1) + §5 trigger list `[settled — verified 2026-06-06]` | claim present → 🔴 (store/MDR risk) or 🟠 (borderline) |
| HLT-b | MDR medical-purpose gate → out of scope, reasoned | MDR Art. 2(1) + Recital 19 + MDCG 2019-11 `[settled]` | medical purpose found → 🔴 ESCALATE jurist |
| HLT-c | HBNR PHR-vendor "multiple sources" gate → not a vendor | 16 CFR §318.2 `[settled — Cornell LII]` / FTC 2024 Final Rule `[low-confidence]` on ultimate call | external health import exists → 🟠 ESCALATE US counsel |
| HLT-d | "Not a medical device / consult a professional" in the **Play store description** | Google Play Module 3D `[settled — answer/16679511]` | missing from store description → 🟠 MATERIAL |
| HLT-e | In-app About health disclaimer present + breathing-tailored | Apple 1.4.1 `[settled]` + Module 3D | missing/over-generic → 🟡 |
| HLT-f | Play Health apps declaration form filed (or reasoned-deferred) | Module 3B `[settled — "all developers"]` / `[verify]` strict requirement | not filed, no reasoning → 🟠 |
| HLT-g | PP Art. 9 GDPR not over-declaring "health data" (no HealthKit/clinical source) | Apple 5.1.3 note + GDPR Art. 9 `[verify]` | over-declared → 🟡 (consistency) |

Severity is a **floor**: where this overlaps another skill (e.g. PP over-declaring health data, or a store-gate also caught by the play-gate skill), take the higher severity.

---

## OUTPUT format

Findings use the `legal-guardrails` finding shape with `skill-id = HLT`:

```
[HLT-n] <emoji> <title>
  Location:   <surface — e.g. "Play store description", "app_en.arb key xyz", "privacy.md §health disclaimer">
  Basis:      <MDR Art./MDCG step/16 CFR §318.2/Play Module 3D/Apple 1.4.1 + attribution tier>
  Issue:      <offending phrase quoted, or missing disclaimer, or scope risk>
  Redline:    <keep-the-energy rewrite to safe wellness framing, OR exact disclaimer text to add — name Apple / Google Play>
  Confidence: high | medium | low
```

Then emit the classification block (the §10 template from `mdr-hbnr.md`, filled for this app):

```
HEALTH-APP CLASSIFICATION GATE — {app_name} — <date>

EU MDR 2017/745:  OUT OF SCOPE | AT RISK → ESCALATE
  - Medical purpose (Art. 2(1)): none | <phrase>
  - Claim-scan: [PASS — wellness framing intact] / [FAIL — phrases + surfaces: ...]
  - Functions limited to delivery + storage/sync (not MDSW): yes | no
  - If scoped-in: likely Class IIa (Annex VIII Rule 11) → CE marking. ESCALATE jurist.

US FTC HBNR (16 CFR 318):  NOT A PHR VENDOR | AT RISK → ESCALATE
  - "Draw from multiple sources": HealthKit? <Y/N>  Google Fit/Health Connect? <Y/N>
    Wearable? <Y/N>  3P health API? <Y/N>
  - Integration inventory attached as evidence.
  - Conditional: adding any external health import → re-run.

Store disclaimer (Play Module 3D): in store description? <Y/N>  in-app About? <Y/N>
Play Health apps declaration form: <filed | reasoned-deferred | needed>
Re-run triggers: [§5 medical-verb introduced] [HealthKit/Fit/Health Connect/wearable integration added]
```

End with the verdict band, per-doc letter grade, and the constitution's authority footer.

## Authority & carve-outs

Decide and sign the wellness-vs-medical call, the MDR out-of-scope determination (for a clean-claim self-contained app), the store-disclaimer check, and the declaration-form judgment. **Reserve for a human** only: the binding MDR determination if a medical-purpose phrase is found (Dutch jurist); the binding HBNR PHR-vendor classification (US counsel — the "multiple sources" test is fact-specific and `[low-confidence]`); the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills; native-NL legal-idiom review of any Dutch disclaimer wording; anything you mark `[low-confidence]`.
