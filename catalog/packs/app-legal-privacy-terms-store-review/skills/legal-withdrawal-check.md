---
name: legal-withdrawal-check
description: >-
  Use when verifying the EU 14-day right-of-withdrawal waiver for a paid digital
  subscription. Checks the paywall consent UI and the Terms-of-Service withdrawal
  section against CRD 2011/83/EU Art. 16(m): three cumulative conditions — prior
  express consent to immediate performance, acknowledgement of losing the right,
  and a durable-medium confirmation (Art. 8(7)). Confirms an unticked affirmative
  consent checkbox (separate from blanket ToS acceptance), that the app records
  the consent with a timestamp, that the Annex I(B) model withdrawal form is present, and
  that the Terms point to the store's withdrawal route and say where the withdrawal
  function is (for store-billed sales the store contracts in its own name). Flags the durable-medium
  step and the digital-content-vs-digital-service classification for jurist review.
  Trigger on "withdrawal right", "right of withdrawal", "14-day", "herroepingsrecht",
  "cooling off", "cooling-off", "Art 16(m)", "paywall consent", "immediate performance",
  "waiver".
metadata:
  category: legal
  author: "Richicinschi (Claude-authored)"
  version: "1.0.0"
  domain: "EU consumer law — distance-contract right of withdrawal (digital subscriptions)"
  jurisdiction: "EU / NL (CRD 2011/83/EU; NL transposition Boek 6 BW Titel 5 Afd. 2B)"
---

Operates under legal-guardrails — load its constitution + the references listed below.

# legal-withdrawal-check — Art. 16(m) waiver adjudicator

Adjudicates whether a paid digital subscription's **14-day right of withdrawal** has been
**validly waived** at the point of sale, so a subscriber cannot withdraw within 14 days and
demand a full no-offset refund. Scope is narrow: the paywall consent control + the ToS
withdrawal section. It does NOT grade analytics consent, health claims, or general ToS terms.

## References to load at runtime (do not inline their contents)

- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/attribution-tiering.md` — tag every proposition.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/finding-format.md` — the emit shape (`skill-id` = `WDL`).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/verdict-model.md` — severity floor + bands.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/disclosure-grading.md` — letter grade.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/crd-withdrawal.md` — **primary authority.** §4
  (Art. 16(m) three conditions), §4a (16(m) vs 16(a) classification), §5 (Art. 8(7) durable medium),
  §6 (Art. 14(4)(b) invalid-waiver consequence), §7 (Annex I(B) form), §8 (worked application of a paywall waiver checkbox),
  §9 (review checklist), §10 (jurist open items). Cite article numbers from here; never paraphrase
  the statute from memory.

## App-profile inputs (the caller or the orchestrator's Step 0 fact sheet supplies them; else read the project and ask)

- The per-app facts this check needs: the trader (publisher) and how the subscription is sold
  (stores as merchants of record, or the publisher's own checkout); the ToS withdrawal section path
  (each language); the paywall consent copy and where the consent is recorded in code; and whether
  a trader-controlled durable-medium artefact is actually sent.
- Worked case: the worked example (`legal-guardrails/references/worked-example.md` §1 and §5).

## WORKFLOW

1. **Locate.** Find (a) the paywall consent UI (the affirmative checkbox + its copy) and (b) the ToS
   withdrawal section (in every language it ships). If either is absent, that absence is itself a
   finding (consent UI missing ⇒ 🔴; ToS disclosure missing ⇒ 🟠, re-opens Art. 10 12-month window).
2. **Condition (i) — prior express consent.** Verify the consent is an **affirmative, UNTICKED-by-default**
   control, **separate from** blanket ToS acceptance, whose copy states consent to **begin immediate
   performance during the 14-day window**. Pre-ticked / bundled-into-ToS = invalid. [Art. 16(m)(i) — settled, verified 2026-11-18]
3. **Condition (ii) — acknowledgement of loss.** Verify the SAME control's copy explicitly states the
   consumer **thereby loses the 14-day right of withdrawal**. Consent without the loss-of-right wording
   fails (ii) even if (i) passes. Confirm BOTH limbs are present in the live copy (EN + NL). [Art. 16(m)(ii) — settled, verified 2026-11-18]
4. **Condition (iii) — durable-medium confirmation.** Verify a **trader-sent** durable-medium artefact
   (email or non-mutable exportable record — NOT a server-mutable in-app screen) reproducing the Art. 6(1)
   info + the recorded consent/acknowledgement is delivered **at the latest before the paid features unlock**.
   Apply the Art. 2(10) test (personally addressed · storable · unchanged reproduction). [Art. 16(m)(iii) / Art. 8(7)]
   - Note the consent timestamp is good **internal evidence** but is **not** the consumer-facing Art. 8(7)
     confirmation. Logging it does not satisfy (iii).
   - **Flag** [verify]: does the Apple/Google receipt suffice (it is store-sent and omits the consent
     language → probably NOT alone), or must the app send its own confirmation? If no trader-controlled
     artefact ships, mark (iii) **UNMET** → the waiver is at risk (see step 7).
5. **Classification flag.** Surface whether the product is **digital content** (Art. 16(m)) or **digital
   service** (Art. 16(a), lost only when "fully performed" → pro-rata refund mechanism) as a
   **[low-confidence] jurist call**. Recommend the consent copy + ToS be drafted to satisfy **both**
   16(m) and 16(a) acknowledgement wording, so the waiver holds either way.
6. **Annex I(B) + disclosure.** Confirm the ToS **disclose** the 14-day right and **make the Annex I(B)
   model withdrawal form available** (Art. 6(1)(h)). Omission ⇒ 🟠 (Art. 10 extends exposure to ~12 months).
7. **Store-billed route check.** For store-billed sales, confirm the Terms point to the store's withdrawal route and say where the withdrawal function is; describing it as the store's withdrawal process is correct (the store contracts in its own name). Flag 🟠 if the Terms deny a withdrawal right, describe it as a discretionary "refund policy", or (for own-checkout sales) no publisher function exists. [settled — Apple Media Services Terms §B (14 Sep 2026); Google Play Terms; CRD Art 11a, verified 2026-11-19] (Name the specific store, not "the platform".) Limit: whether the publisher is also a CRD trader for store-billed contracts and answers if a store's route falls short of Art 11a or BW 6:230oa is `[low-confidence — LEGAL REVIEW REQUIRED]`; give no verdict on it (`crd-withdrawal.md` R8, §10).
8. **Invalid-waiver consequence.** Where any condition is UNMET, state the Art. 14(4)(b) outcome in the
   finding: the consumer may still withdraw AND **owes nothing** for content already supplied — a defective
   waiver converts a withdrawal into a **full refund with no usage offset**. This is why (iii) is not a formality.
9. **No silent supplement.** Any waiver-adjacent question outside this checklist → surface as a 🟡 MINOR note.
10. **Emit** findings in the `finding-format` shape, then the verdict.

## Severity mapping (this skill)

| Situation | Severity |
|---|---|
| No affirmative consent control, OR consent pre-ticked / bundled into ToS acceptance | 🔴 BLOCKER |
| Consent copy missing limb (i) or (ii) (consent without loss-of-right, or vice-versa) | 🔴 BLOCKER (if confirmed; else hard condition) |
| Condition (iii) durable-medium artefact not delivered before unlock | 🟠 MATERIAL (hard condition — [low-confidence] final call) |
| ToS deny a withdrawal right, call the store's route a discretionary "refund policy", or (own checkout) no publisher withdrawal function | 🟠 MATERIAL |
| Annex I(B) model form / 14-day disclosure absent from ToS | 🟠 MATERIAL (Art. 10 exposure) |
| Consent copy not mirrored in `.nl.md`, or limbs worded only for 16(m) not 16(a) | 🟡 MINOR |
| Classification digital-content vs digital-service unresolved | 🟡 MINOR note → [low-confidence] jurist |
| Consent timestamp logged; all three conditions met with trader-sent durable artefact | 🟢 OK |

A 🔴 resting only on [verify]/[low-confidence] is emitted as a **hard condition** ("confirm X; if confirmed,
blocker"), per verdict-model — never an outright BLOCKED verdict on unconfirmed law, never waved through.

## Verdict & reservations

Give a firm ruling on the mechanism's validity, tied to the clause and the CRD article behind it. An
automated review, not legal advice: a lawyer signs off. It gives no verdict on these; they need a lawyer or a registration first: the digital-content-vs-service
**classification** and its refund consequence (§4a), the condition-(iii) durable-medium **sufficiency-of-store-receipt**
question (§8.2), and the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` values + native-NL legal-idiom review of §6.nl.

**Jurisdiction (`legal-guardrails.md` §9):** the CRD is EU law. Outside the Netherlands and the EU this
check does not run; in EU states other than the Netherlands it runs on the CRD as written, and any
point resting only on Dutch national law is a 🟡 note.

## OUTPUT format

```
# Withdrawal-waiver check (WDL) — <app> Terms §<n> + paywall — <date>
Verdict: PASS | CONDITION  ·  waiver mechanism: VALID | AT-RISK | INVALID

## Findings (🔴 → 🟠 → 🟡, finding-format shape; skill-id = WDL)
[WDL-1] <emoji> <title>
  Location:   <terms.md §6 / paywall consent screen / .nl.md>
  Basis:      CRD Art. 16(m)(i) [settled — verified 2026-11-18]   (cite from crd-withdrawal.md)
  Issue:      <defect vs the three cumulative conditions / disclosure / MoR>
  Redline:    <exact replacement copy in quotes; name Apple/Google/RevenueCat where relevant>
  Confidence: high | medium | low

## Three-condition table
| Cond | Art | Status (MET / UNMET / AT-RISK) | Evidence |
| (i) prior express consent      | 16(m)(i)   | … | … |
| (ii) acknowledgement of loss   | 16(m)(ii)  | … | … |
| (iii) durable-medium confirm   | 16(m)(iii)/8(7) | … | … |

## Conditions to clear (each 🟠 → row: Condition | Owner (owner/code/jurist) | Sev | Basis)
## Reserved for Dutch jurist  ([low-confidence] items only)
— Basis: CRD 2011/83/EU (CELEX 02011L0083-20260927) via crd-withdrawal.md, verified 2026-11-18 —
```

**Verdict rule:** **PASS / waiver VALID** only when (i)+(ii) are confirmed in the live affirmative-unticked
copy AND a trader-sent durable-medium artefact (iii) is delivered before unlock. If (iii) is unresolved →
**CONDITION / AT-RISK**. If (i) or (ii) fails → **CONDITION / INVALID** (downgraded from BLOCKED only while
unconfirmed). Always state the Art. 14(4)(b) full-refund exposure when the mechanism is not VALID.
