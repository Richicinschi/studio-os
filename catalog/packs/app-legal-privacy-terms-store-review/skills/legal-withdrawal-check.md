---
name: legal-withdrawal-check
description: >-
  Use when verifying the EU 14-day right-of-withdrawal waiver for a paid digital
  subscription. Checks the paywall consent UI and the Terms-of-Service withdrawal
  section against CRD 2011/83/EU Art. 16(m): three cumulative conditions — prior
  express consent to immediate performance, acknowledgement of losing the right,
  and a durable-medium confirmation (Art. 8(7)). Confirms an unticked affirmative
  consent checkbox (separate from blanket ToS acceptance), that the app records
  withdrawalConsentAt, that the Annex I(B) model withdrawal form is present, and
  that the Terms do not misattribute the withdrawal right to Apple or Google (the
  app — not the Store — is the CRD trader for the content). Flags the durable-medium
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
  §6 (Art. 14(4)(b) invalid-waiver consequence), §7 (Annex I(B) form), §8 (worked application: example app),
  §9 (sign-off checklist), §10 (jurist open items). Cite article numbers from here; never paraphrase
  the statute from memory.

## App-profile inputs (the caller or the orchestrator's Step 0 fact sheet supplies them; else read the project and ask)

- The per-app facts this check needs: the trader (publisher) and how the subscription is sold
  (stores as merchants of record, or the publisher's own checkout); the ToS withdrawal section path
  (each language); the paywall consent copy and where the consent is recorded in code; and whether
  a trader-controlled durable-medium artefact is actually sent.
- Worked case (the example app, `legal-guardrails.md` §8): trader = Dutch *eenmanszaak*;
  subscriptions sold THROUGH Apple/Google (merchants of record) + RevenueCat + Firebase (EU); ToS
  §6 in `terms.md` + `terms.nl.md`; the paywall consent screen records a `withdrawalConsentAt`
  timestamp (e.g. via a `recordWithdrawalConsent` call).

## WORKFLOW

1. **Locate.** Find (a) the paywall consent UI (the affirmative checkbox + its copy) and (b) the ToS
   withdrawal section (in every language it ships; §6 in the example app). If either is absent, that absence is itself a
   finding (consent UI missing ⇒ 🔴; ToS disclosure missing ⇒ 🟠, re-opens Art. 10 12-month window).
2. **Condition (i) — prior express consent.** Verify the consent is an **affirmative, UNTICKED-by-default**
   control, **separate from** blanket ToS acceptance, whose copy states consent to **begin immediate
   performance during the 14-day window**. Pre-ticked / bundled-into-ToS = invalid. [Art. 16(m)(i) — settled]
3. **Condition (ii) — acknowledgement of loss.** Verify the SAME control's copy explicitly states the
   consumer **thereby loses the 14-day right of withdrawal**. Consent without the loss-of-right wording
   fails (ii) even if (i) passes. Confirm BOTH limbs are present in the live copy (EN + NL). [Art. 16(m)(ii) — settled]
4. **Condition (iii) — durable-medium confirmation.** Verify a **trader-sent** durable-medium artefact
   (email or non-mutable exportable record — NOT a server-mutable in-app screen) reproducing the Art. 6(1)
   info + the recorded consent/acknowledgement is delivered **at the latest before the paid features unlock**.
   Apply the Art. 2(10) test (personally addressed · storable · unchanged reproduction). [Art. 16(m)(iii) / Art. 8(7)]
   - Note `withdrawalConsentAt` is good **internal evidence** but is **not** the consumer-facing Art. 8(7)
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
7. **Merchant-of-record check.** Confirm the ToS do **NOT** misattribute the EU withdrawal right to
   "the Store" / Apple / Google. The CRD trader for the underlying content is the app itself; the
   withdrawal regime is its direct obligation, distinct from Apple/Google **refund** policies.
   Misattribution ⇒ 🟠. (Name the specific store, not "the platform".)
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
| ToS misattribute the withdrawal right to Apple/Google | 🟠 MATERIAL |
| Annex I(B) model form / 14-day disclosure absent from ToS | 🟠 MATERIAL (Art. 10 exposure) |
| Consent copy not mirrored in `.nl.md`, or limbs worded only for 16(m) not 16(a) | 🟡 MINOR |
| Classification digital-content vs digital-service unresolved | 🟡 MINOR note → [low-confidence] jurist |
| `withdrawalConsentAt` logged; all three conditions met with trader-sent durable artefact | 🟢 OK |

A 🔴 resting only on [verify]/[low-confidence] is emitted as a **hard condition** ("confirm X; if confirmed,
blocker"), per verdict-model — never an outright BLOCK on unconfirmed law, never waved through.

## Authority & reservations (de-facto counsel)

Decide and sign the mechanism's validity. Reserve to a **Dutch advocaat** ONLY: the digital-content-vs-service
**classification** and its refund consequence (§4a), the condition-(iii) durable-medium **sufficiency-of-store-receipt**
question (§8.2), and the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills + native-NL legal-idiom review of §6.nl.

## OUTPUT format

```
# Withdrawal-waiver check (WDL) — <app> Terms §<n> + paywall — <date>
Verdict: PASS | CONDITION  ·  waiver mechanism: VALID | AT-RISK | INVALID

## Findings (🔴 → 🟠 → 🟡, finding-format shape; skill-id = WDL)
[WDL-1] <emoji> <title>
  Location:   <terms.md §6 / paywall consent screen / .nl.md>
  Basis:      CRD Art. 16(m)(i) [settled — verified 2026-06-06]   (cite from crd-withdrawal.md)
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
— Basis: CRD 2011/83/EU (CELEX 02011L0083-20220528) via crd-withdrawal.md, verified 2026-06-06 —
```

**Verdict rule:** **PASS / waiver VALID** only when (i)+(ii) are confirmed in the live affirmative-unticked
copy AND a trader-sent durable-medium artefact (iii) is delivered before unlock. If (iii) is unresolved →
**CONDITION / AT-RISK**. If (i) or (ii) fails → **CONDITION / INVALID** (downgraded from BLOCK only while
unconfirmed). Always state the Art. 14(4)(b) full-refund exposure when the mechanism is not VALID.
