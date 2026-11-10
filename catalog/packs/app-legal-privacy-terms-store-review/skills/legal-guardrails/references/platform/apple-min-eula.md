# Apple — Minimum Terms of the Licensed Application EULA (iOS ToS sign-off)

**Scope.** This reference governs whether an iOS app's custom Terms of Service / EULA satisfies Apple's *Minimum Terms of Developer's End-User License Agreement* — the Schedule that every developer-supplied EULA must contain. Use it to adjudicate the "Apple App Store — Licensed Application EULA" section of a ToS.

**Primary sources (fetched this run):**
- Minimum Terms of Developer's EULA — https://www.apple.com/legal/internet-services/itunes/dev/minterms/ [settled — Apple minterms page, verified 2026-06-06]
- App Store Review Guidelines — https://developer.apple.com/app-store/review/guidelines/ [settled — Apple review guidelines, verified 2026-06-06]
- Apple Standard EULA (fallback if no custom EULA) — https://www.apple.com/legal/internet-services/itunes/dev/stdeula/ [verify — referenced, not fetched this run]

**Worked example (the example app, `legal-guardrails.md` §8):** Dutch eenmanszaak, sole controller, EU/NL-first, no medical claims. Subscriptions sold through Apple as merchant of record (RevenueCat + Firebase backend, europe-west). Free = on-device only; paid tier = Firestore sync. Apply each term to the app under review from its fact sheet.

---

## 0. The two-path rule (why these terms are mandatory)

Apple gives the developer two choices [settled — App Store Review Guidelines §3.1.1 / App Store Connect, verified 2026-06-06; exact ASC sentence is verify-pinpoint]:

| Path | Consequence |
|---|---|
| **Use Apple's Standard EULA** | No custom legal text needed; Apple's stdeula auto-applies to the licensed application. |
| **Supply a custom EULA / ToS** | The custom document **MUST contain, at minimum, all of the terms below**. If a required term is missing, the app's EULA is non-conforming and the app can be rejected, or Apple's Standard EULA is deemed to govern instead — meaning the developer's intended custom terms may be unenforceable. |

> When an app ships a custom ToS (the example app does, because it must also satisfy GDPR/AVG, EU consumer law, the Apple Licensed-Application EULA insertion, and the withdrawal/age mechanisms), **all 10 minimum terms below are MANDATORY** and each is a checklist gate. [settled — minterms applies whenever a custom EULA is used, verified 2026-06-06]

**Cross-platform note:** These 10 terms are **Apple-only**. Google Play mandates no equivalent EULA, but requires a Privacy Policy, a Data Safety form, and in-app account deletion. A ToS that satisfies Apple's minterms does **not** automatically satisfy Play — keep the Apple clause clearly scoped ("This section applies only to the version downloaded from the Apple App Store"). [verify — Play has no mandated-EULA equivalent]

---

## 1. The 10 Minimum Terms — checklist

Each row is a gate. "Present?" = the clause must appear (verbatim-equivalent substance) in the ToS's Apple section. All ten are sourced from the minterms page; the "Required substance" column is this suite's summary of each term, and §2 quotes the operative words. [settled — Apple minterms page, verified 2026-06-06]

| # | Minimum Term | Required substance | Application (worked: example app) |
|---|---|---|---|
| 1 | **Acknowledgement** | The EULA is a contract **between the developer and the user only; Apple is not a party**. The developer alone, not Apple, answers for the app and its content. | ToS must name `<publisher>` (for the example app, the eenmanszaak) as the sole counterparty and state Apple is not a party. Most-missed by indies. |
| 2 | **Scope of License** | The user gets a licence they **cannot transfer**, for **Apple-branded devices they own or control**, within the Usage Rules of the Apple Media Services Terms; Family Sharing and volume-purchase accounts may also use it. | State the licence is personal, non-transferable, device-limited per Apple's Usage Rules. |
| 3 | **Maintenance and Support** | Maintenance and support are **the developer's job alone**; **Apple owes none at all**. | Give the developer's support contact (`<contact email>`); state Apple provides no support for `<app name>`. |
| 4 | **Warranty** | Every warranty, express or implied by law and not validly disclaimed, is **the developer's alone**. If the app fails a warranty, **the user may tell Apple, and Apple refunds the price paid** (if any); beyond that, as far as the law allows, **Apple owes no warranty duty at all**. | State the developer bears warranty responsibility; Apple's sole obligation is to refund the purchase price. Do not purport to make Apple a warrantor. |
| 5 | **Product Claims** | Claims by the user or third parties about the app, or about having or using it, are for **the developer, not Apple**, to handle, including (a) product liability; (b) claims that the app breaks a legal or regulatory requirement; and (c) claims under consumer-protection, **privacy or similar law** (incl. HealthKit/HomeKit-type use). | Critical for an EU app: privacy/consumer claims under GDPR/AVG and EU consumer law are the developer's responsibility, not Apple's. |
| 6 | **Intellectual Property Rights** | If a third party claims the app infringes its IP, **the developer, not Apple, investigates, defends, settles and pays**. | State the developer handles all IP-infringement claims. |
| 7 | **Legal Compliance** | The user must **warrant** that they are **not in a country under a U.S. Government embargo** (or one designated "terrorist supporting") **and not on a U.S. Government list of prohibited or restricted parties**. | Include the export/embargo + prohibited-parties-list warranty verbatim in substance. |
| 8 | **Developer Name and Address** | The EULA gives the developer's **name, address and contact details**, for the user's questions, complaints and claims about the app. | **HARD BLOCKER for any app:** requires the real legal name, **registered address**, and (for a Dutch publisher) KvK and, where applicable, BTW. Any `[KVK]` / `[BTW]` / `[REGISTERED ADDRESS]` placeholder fails this gate. |
| 9 | **Third Party Terms of Agreement** | The user must **follow any third-party terms that apply** when using the app. | State that use is also subject to applicable third-party terms (e.g. Apple Media Services Terms). |
| 10 | **Third Party Beneficiary** | **Apple and its subsidiaries are third-party beneficiaries of the EULA**: **once the user accepts it, Apple may enforce it against the user** (and is deemed to have accepted that right). | Include the Apple-third-party-beneficiary enforcement clause verbatim in substance. Most-missed by indies. |

> **Verbatim-equivalence standard:** Apple does not require copy-paste wording, but each term's *substance and effect* must be present. A clause that omits, reverses, or weakens any of the above (e.g. purporting to make Apple a warrantor, or omitting the embargo warranty) **fails**. [verify-pinpoint — "minimum/at least" framing; exact phrasing on minterms]

---

## 2. Verbatim anchors (quote-back evidence for adjudication)

Use these as the evidentiary anchors when scoring a clause as present. Each is a short quote of the operative words of the numbered term in Apple's *Minimum Terms of Developer's End-User License Agreement*, https://www.apple.com/legal/internet-services/itunes/dev/minterms/ [settled — Apple minterms page, verified 2026-06-06]

- **#1 Acknowledgement:** "the EULA is concluded between You and the End-User only, and not with Apple, and You, not Apple, are solely responsible for the Licensed Application and the content thereof."
- **#2 Scope:** "a non-transferable license to use the Licensed Application on any Apple-branded Products that the End-User owns or controls" (Family Sharing / volume purchasing permitted).
- **#3 Support:** "Apple has no obligation whatsoever to furnish any maintenance and support services with respect to the Licensed Application."
- **#4 Warranty:** in the event of any failure to conform to any applicable warranty, "the End-User may notify Apple, and Apple will refund the purchase price for the Licensed Application"; "Apple will have no other warranty obligation whatsoever."
- **#7 Legal Compliance:** End-User represents they are "not located in a country that is subject to a U.S. Government embargo" and "not listed on any U.S. Government list of prohibited or restricted parties."
- **#10 Third Party Beneficiary:** "Apple, and Apple's subsidiaries, are third party beneficiaries of the EULA, and ... Apple will have the right (and will be deemed to have accepted the right) to enforce the EULA against the End-User as a third party beneficiary thereof."

> No effective/last-updated date is displayed on the minterms page as fetched. [settled — observed on page, verified 2026-06-06]

---

## 3. Adjacent Review-Guideline gates that touch the ToS/EULA

These are NOT minterms but co-occur in EULA/ToS sign-off; flag them alongside.

| Guideline | Rule | Application (worked: example app) |
|---|---|---|
| **3.1.1 In-App Purchase** | IAP-unlockable content must use Apple IAP; subscriptions sold through Apple. The EULA/Terms-of-Use link surfaces here. | The paid tier sold via Apple IAP (RevenueCat is middleware, not a payment bypass). [settled — guidelines §3.1.1, verified 2026-06-06] |
| **3.1.2 Auto-Renewable Subscriptions** | Before subscribing, "clearly describe what the user will get for the price" (Apple, App Store Review Guidelines 3.1.2, https://developer.apple.com/app-store/review/guidelines/); meet the disclosure requirements in **Schedule 2 of the Apple Developer Program License Agreement**. | Paywall + ToS §5 must state price, period, auto-renewal, and how to cancel; keep price/trial illustrative. [settled — guidelines §3.1.2(c), verified 2026-06-06] |
| **1.4.1 Medical / Health** | Apps that could diagnose/treat get greater scrutiny; accuracy claims must be substantiated; remind users to consult a doctor. | A wellness app makes **no medical claims** — "supports / may help relax", never "treats/cures/diagnoses/prevents". Keep its health disclaimer (for the example app, breathing exercises only). [settled — guidelines §1.4.1, verified 2026-06-06] |
| **5.1.1(i) Privacy Policy** | Must link to a PP in ASC metadata AND in-app; PP must identify data collected, uses, third-party equal-protection, and **retention/deletion + how to revoke consent / request deletion**. | Check the PP covers this; the Apple section of the ToS should cross-reference the PP. [settled — guidelines §5.1.1(i), verified 2026-06-06] |
| **5.1.1(v) Account Deletion** | If the app supports account creation, it **must offer in-app account deletion**. | The app must ship in-app deletion (the example app: soft-delete + 30-day grace + hard purge). Mandatory; do not regress. [settled — guidelines §5.1.1(v), verified 2026-06-06] |

---

## 4. Adjudication rubric (how to score the Apple section)

1. **All 10 present?** Walk the table in §1. Any missing/weakened term → **FAIL** (gate). Cite the row.
2. **#8 placeholder check:** if name / registered address / KvK / BTW is a placeholder → **HARD BLOCKER** (cannot sign off). [settled — minterms #8, verified 2026-06-06]
3. **No Apple-adverse drafting:** the ToS must not (a) name Apple as a party, (b) make Apple a warrantor/support provider, or (c) strip Apple's third-party-beneficiary enforcement right. Any of these → **FAIL**.
4. **Scoping:** the Apple section should state it applies only to App Store downloads (so Play users aren't bound to Apple-specific terms). Missing scoping → **WARN**, not fail. [verify — best practice, not a minterms requirement]
5. **Standard-EULA fallback acknowledged:** if the developer instead relies on Apple's Standard EULA, confirm the ToS does not contradict it; the 10 terms are then satisfied by reference. [verify]

---

## 5. Common indie failure modes (watch-list)

- Omitting **#1** (the "not a party with Apple" acknowledgement) — the single most-missed clause. [settled — minterms #1, verified 2026-06-06]
- Omitting **#10** (Apple/subsidiaries as third-party beneficiaries) — second most-missed. [settled — minterms #10, verified 2026-06-06]
- **#8** left as `[KVK]` / `[BTW]` / `[REGISTERED ADDRESS]` placeholders — blocks sign-off. [settled — minterms #8, verified 2026-06-06]
- Drafting that accidentally makes Apple a warrantor/support provider (violates #3/#4). [settled — minterms #3/#4, verified 2026-06-06]
- Stating Apple processes refunds beyond the purchase-price-refund obligation — #4 caps Apple's obligation at refunding the purchase price. [settled — minterms #4, verified 2026-06-06]
- Forgetting the embargo / prohibited-parties warranty (#7). [settled — minterms #7, verified 2026-06-06]
