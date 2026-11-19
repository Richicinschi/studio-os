# CRD Withdrawal Right & the Digital-Content Waiver — Directive 2011/83/EU

**Scope of this file.** The EU Consumer Rights Directive (CRD) 14-day withdrawal right, the 12-month
extension, and the conditions for validly waiving the right when an app unlocks paid digital
content/services immediately. Worked examples use the **example app** (`legal-guardrails.md` §8:
Dutch *eenmanszaak*; auto-renewing subscriptions sold THROUGH Apple/Google as merchants of record,
RevenueCat middleware, Firebase EU backend; general wellness, no medical claims). The rules apply to
any EU/NL distance-sold app subscription: apply them to the app under review from its fact sheet.

**Primary source (first fetched 2026-06-06 as the 2022-05-28 consolidation; re-verified 2026-11-18):**
Directive 2011/83/EU, consolidated text as amended to 2026-09-27 (CELEX `02011L0083-20260927`), EUR-Lex.
URL: `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02011L0083-20260927`
Material amendments referenced: **Directive (EU) 2019/2161** ("Omnibus"/"Modernisation") and the
**Digital Content Directive (EU) 2019/770** ("DCD", which the CRD now cross-references for definitions).
Since the 2022 consolidation, **Directive (EU) 2023/2673** (applies from 19 June 2026) added **Art 11a**, a
"withdraw from contract here" **withdrawal function** for distance contracts concluded through an online
interface, and extended **Art 6(1)(h)** to cover it; **Directive (EU) 2024/825** added guarantee and
durability information duties. The other articles cited below read the same in the 2026-09-27 text.

**Citation tiers used below:**
`[settled]` = confirmed against the primary text on the date given (`verified <date>`) · `[verify]` = believed correct, not
re-confirmed this run · `[verify-pinpoint]` = right substance, exact cite to pin · `[low-confidence]` =
novel / contested / fact-specific jurist call.

---

## 0. TL;DR adjudication rules

| # | Rule | Tier |
|---|------|------|
| R1 | A distance-sold subscription gives the consumer a **14-day** withdrawal right, no reason needed (Art 9). | [settled — Art 9(1), verified 2026-11-18] |
| R2 | For a **service/digital-content** contract the 14 days run **from the day the contract is concluded** (purchase), not from delivery. | [settled — Art 9(2), verified 2026-11-18] |
| R3 | If the trader never informed the consumer of the withdrawal right, the period **extends to 12 months** (+ the original 14 days), shrinking to 14 days once the info is given. | [settled — Art 10, verified 2026-11-18] |
| R4 | The right can be **lost** for digital content not on a tangible medium **only if THREE cumulative conditions** are met: (i) prior express consent, (ii) acknowledgement of loss, (iii) durable-medium confirmation. | [settled — Art 16(m), verified 2026-11-18] |
| R5 | If any of the three fails, the consumer can still withdraw AND **owes nothing** for content already supplied (Art 14(4)(b)). The trader eats the cost. | [settled — Art 14(4)(b), verified 2026-11-18] |
| R6 | The trader must publish the **model withdrawal form** (Annex I(B)) and inform of the right and, where applicable, of the existence and placement of the **Art 11a withdrawal function** (from 19 June 2026); otherwise R3 applies. | [settled — Annex I(B) + Art 6(1)(h), verified 2026-11-18] |
| R7 | **Common gap to verify (the example app's):** an unticked paywall checkbox satisfies (i)+(ii); whether the Apple/Google receipt or a publisher-sent email satisfies (iii) durable-medium confirmation is the **open item**. | [low-confidence] |
| R8 | **Withdrawal function (Art 11a; NL BW 6:230oa).** For a distance contract concluded through an online interface where a withdrawal right exists, the trader provides a "withdraw from contract here" function (or equivalent wording), available throughout the withdrawal period, with a "confirm withdrawal" step and an acknowledgement on a durable medium. Directive applies from 19 June 2026; BW 6:230oa in force 25 June 2026. **Store-billed sales:** Apple Distribution International sells as the developer's commissionaire in its own name, is merchant of record, and takes withdrawals via Apple Account › Purchase History › "Withdraw Transaction"; Google Commerce Limited is the seller on Google Play and takes withdrawal notices and its model form. For these sales the function is the store's; the Terms must say where it is (Art 6(1)(h); BW 6:230m(1)(h)). **Own checkout (web, EU alternative payment, link-out):** the publisher is the trader and must build the function itself. | [settled — Dir. (EU) 2023/2673 Arts 1–2; CRD Arts 6(1)(h), 11a; BW 6:230oa, 6:230m(1)(h) (Stb. 2026, 153); ADPLA Sch. 2 §1.1 + Exhibit A §2; Apple Media Services Terms (14 Sep 2026); Google Play Terms of Service, verified 2026-11-19] Whether the publisher is also a "trader" for store-billed contracts (Art 2(2), "on his behalf") and answers if a store's function falls short: [low-confidence — LEGAL REVIEW REQUIRED]. Whether Apple's and Google's routes meet Art 11a(2)–(4): [verify — not tested 2026-11-19] |

---

## 1. Who and what the right applies to

- **Applies to:** "distance and off-premises contracts" with a **consumer** (natural person acting
  outside trade/profession). An app subscription bought in-app is a **distance contract**.
  [settled — Art 9(1) + Art 2 defs, verified 2026-11-18]
- **A subscription is a contract under the CRD even if "paid" only with personal data**, except where
  the data is processed solely to perform the contract or meet a legal duty. Art 3(1a) (added by
  2019/2161) extends the CRD to digital content/services supplied against personal data.
  [settled — Art 3(1a), verified 2026-11-18] — *for a paid subscription (as in the example app) this is moot
  for the paid tier; relevant only if a "free for data" tier is offered.*
- **Definitions (Art 2, as amended by 2019/2161):**
  - **'service contract'** = any contract other than a sales contract under which the trader supplies a
    service, **including a digital service**. [settled, verified 2026-11-18]
  - **'sales contract'** = transfer of ownership of goods (incl. goods + services). [settled, verified 2026-11-18]
  - **'digital content'** = takes the definition in **Art 2(1) of Directive (EU) 2019/770** (DCD): data
    produced and supplied in digital form. [settled — Art 2 CRD cross-ref, verified 2026-11-18]
  - **'durable medium'** = any instrument that lets the consumer or the trader **store
    information addressed personally to him**, **accessible for future reference** for a period
    adequate for the purposes of the information, and that allows the **unchanged reproduction** of the
    stored information. [settled — Art 2(10), verified 2026-11-18]

---

## 2. Article 9 — the 14-day period and when it starts

**Art 9(1):** save where the **Art 16 exceptions** apply, "the consumer shall have a period of **14 days**
to withdraw from a distance or off-premises contract, **without giving any reason** […]." [settled, verified 2026-11-18]

**Art 9(2) — start of the clock:**

| Contract type | Withdrawal period runs from | Tier |
|---|---|---|
| **Service contract** (incl. digital service) | the **day of conclusion of the contract** | [settled — Art 9(2)(a), verified 2026-11-18] |
| **Digital content NOT on a tangible medium** | the **day of conclusion of the contract** | [settled — Art 9(2)(c), verified 2026-11-18] |
| Sales contract (goods) | the day the consumer acquires physical possession | [settled — Art 9(2)(b), verified 2026-11-18] |

> **App subscriptions (the example app's case):** whether a paid-tier unlock is "digital service" or "digital content," **the clock starts at
> purchase** — there is no delivery event. So absent a valid waiver, a subscriber could withdraw within
> 14 days of buying and demand a refund.

**Art 9(1a)** (added 2019/2161): Member States MAY extend to **30 days** for unsolicited home visits /
organised excursions only. Not relevant to in-app purchases. [settled, verified 2026-11-18]

---

## 3. Article 10 — the 12-month extension for failure to inform

- **Art 10(1):** if the trader does not provide the withdrawal-right information required by
  **Art 6(1)(h)**, the withdrawal period **expires 12 months after the end of the initial 14-day
  period** (i.e. up to ~12 months + 14 days). [settled, verified 2026-11-18]
- **Art 10(2):** if the trader supplies the missing information within those 12 months, the period
  expires **14 days** after the consumer receives it (or 30 days where Art 9(1a) applies).
  [settled, verified 2026-11-18]

> **Adjudication hook:** if the Terms/paywall do not clearly state the withdrawal right (and the model
> form), the practical refund-exposure window balloons to ~12 months. This is a strong reason to keep
> the Terms' withdrawal-section disclosure explicit (§6 in the example app) even though the waiver is intended to extinguish the right.

---

## 4. Article 16(m) — losing the withdrawal right for digital content (THE WAIVER)

**Art 16(m)** (as amended by 2019/2161) — the exception that removes the withdrawal right for
**"the supply of digital content which is not supplied on a tangible medium"**, available
**only if** performance has begun and, where the contract obliges the consumer to pay, **all three** of:

1. **(i) prior express consent** of the consumer to **begin performance during the withdrawal period**;
2. **(ii) acknowledgement** by the consumer that **he thereby loses his right of withdrawal**; **and**
3. **(iii) confirmation by the trader** in accordance with **Art 7(2)** (off-premises) **or Art 8(7)**
   (distance) — i.e. confirmation **on a durable medium**.

[settled — Art 16(m)(i)–(iii), verified 2026-11-18]

**These conditions are CUMULATIVE.** Missing any one ⇒ the waiver is invalid ⇒ the 14-day (or extended)
right survives. [settled — read with Art 14(4)(b), verified 2026-11-18]

### 4a. Digital CONTENT vs digital SERVICE — the 2019/2161 split

The 2019/2161 modernisation introduced a distinction the CRD did not previously draw cleanly:

- **Digital content not on a tangible medium → Art 16(m)** (the three conditions above).
  [settled, verified 2026-11-18]
- **Service contract (incl. a "digital service") → Art 16(a):** the right is lost **after the service has
  been fully performed**, and (if paid) only if performance **began with the consumer's prior express
  consent AND acknowledgement** that he will lose the right **once the contract has been fully
  performed**. [settled — Art 16(a), verified 2026-11-18]

> **CLASSIFICATION IS A [low-confidence] JURIST CALL.** A recurring, ongoing subscription that streams
> features/voice cues over time looks more like a **digital service** (Art 16(a)) than one-shot **digital
> content** (Art 16(m)). The distinction MATTERS:
> - Under **16(m)** the right is lost as soon as supply begins with valid consent + acknowledgement +
>   durable-medium confirmation.
> - Under **16(a)** the right is only fully lost once the service is **"fully performed"** — for an
>   ongoing subscription that is arguably never, mid-term; the cleaner reading is that the consumer can
>   still withdraw but must **pay a pro-rata amount** for what was used (Art 14(3) mechanism), rather
>   than the right being wholly extinguished.
> The app's Terms should **draft to satisfy BOTH** Art 16(m) and Art 16(a) acknowledgement wording so
> the waiver holds however a Dutch court/jurist classifies the product.
> [low-confidence — classification + consequence are fact-specific; pin against DCD 2019/770 Art 2(1)–(2)
> and national case-law before relying]

### 4b. Art 16(m)(iii) cross-reference precision

Art 16(m)(iii) requires confirmation under **"Article 7(2) or Article 8(7)."** For a **distance**
contract (an in-app purchase), the operative provision is **Art 8(7)** (Art 7(2) is the off-premises
analogue). The harvested shorthand "(Art 8(7))" is correct for the app context.
[settled — Art 16(m)(iii) verbatim references both; 8(7) is the distance branch, verified 2026-11-18]

---

## 5. Article 8(7) — the durable-medium confirmation (condition (iii))

**Art 8(7):** the trader must give the consumer **confirmation of the concluded contract, on a durable
medium**, within a reasonable time after conclusion and **at the latest before performance of the
service begins** (for goods, at latest at delivery). The confirmation must include:
- **(a)** all the Art 6(1) pre-contract information (unless already given on a durable medium); and
- **(b)** **where applicable, confirmation of the consumer's prior express consent and acknowledgement
  under Art 16(m).** [settled, verified 2026-11-18]

**So condition (iii) is satisfied by:** a durable-medium artefact, sent **at the latest before the Pro
features unlock**, that records the contract AND the consumer's (i) consent + (ii) acknowledgement.

**Durable-medium test (Art 2(10)):** personally addressed · storable for future reference · unchanged
reproduction. Email is the canonical example. A purely in-app, server-mutable confirmation screen is
**weaker** (the trader can change it). [settled — Art 2(10) def, verified 2026-11-18]

### 5a. Art 8(8) — express request to begin early (the service-side mirror)

**Art 8(8)** (as amended): where the consumer asks for a **service** (or utilities) to begin during the
withdrawal period, the trader must require an **express request** and ask the consumer to **acknowledge
that, once the contract has been fully performed, he will no longer have the right of withdrawal**. This
is the service-contract analogue of the 16(m) consent step; satisfy it in the same paywall checkbox.
[settled — Art 8(8), verified 2026-11-18]

---

## 6. Article 14(4)(b) — what happens if the waiver is invalid

If the consumer withdraws and the digital content waiver conditions were **not** met, **the consumer
bears NO cost** for the digital content supplied where **any** of these is true:
- **(i)** no prior express consent to begin before the end of the 14/30-day period; **or**
- **(ii)** the consumer did not acknowledge losing the right when consenting; **or**
- **(iii)** the trader failed to provide the Art 7(2)/8(7) confirmation.

[settled — Art 14(4)(b)(i)–(iii), verified 2026-11-18]

> **Risk framing for the review:** a defective waiver doesn't just preserve the right — it converts a
> withdrawal into a **full refund with no offset** for usage. Condition (iii) (durable medium) is
> therefore not a formality; failing it is independently fatal.

---

## 7. Annex I(B) — model withdrawal form

The CRD **Annex I(B)** prescribes a **model withdrawal form** the trader must make available
(Art 6(1)(h) requires the form + instructions). The form text:
> "I/We hereby give notice that I/We withdraw from my/our contract of sale of the following goods/for
> the provision of the following service […]" — with trader name/address/email, order/receipt date,
> consumer name/address, and date (signature if on paper).

[settled — Annex I(B) text, verified 2026-11-18]

The consumer is **not obliged to use the model form** (any unequivocal statement of withdrawal suffices,
Art 11), but the trader **must provide it / make it available**. Omitting it triggers the Art 10
12-month extension via the Art 6(1)(h) information failure. [verify-pinpoint — Art 11(1) unambiguous-statement
rule + Art 6(1)(h) consequence chain]

---

## 8. Worked application (the example app; re-run it on the app under review)

### 8.1 The mechanism (as the example app implements it)
- **Paywall checkbox, UNTICKED by default**, that the user must affirmatively tick to subscribe; the
  copy captures (i) **prior express consent** to begin immediate performance during the 14-day window
  **and** (ii) **acknowledgement** that doing so **forfeits the 14-day withdrawal right**.
- The app records the timestamp **`withdrawalConsentAt`** (Firestore) as evidence of (i)+(ii).

**Assessment:**
- Unticked-by-default + affirmative tick = a proper **active opt-in** (no pre-ticked box) → satisfies
  the *form* of (i) and (ii) under Art 16(m). [verify — conditions (i)/(ii) are about substance of the
  wording; confirm the checkbox copy actually states BOTH consent-to-begin AND loss-of-right, not just one]
- `withdrawalConsentAt` is good **internal evidence** but is **not itself** the durable-medium
  confirmation owed **to the consumer** under Art 8(7)/16(m)(iii). [settled — 8(7) is a trader→consumer
  artefact, verified 2026-11-18]

### 8.2 THE OPEN ITEM — condition (iii) durable medium [low-confidence]

The waiver is only valid if the trader (for store-billed sales, see §8.3: whether the publisher is a co-trader is open) **provides the consumer** a durable-medium
confirmation that includes the Art 6(1) info AND the recorded consent/acknowledgement, **at the
latest before the paid tier unlocks**. Candidates and their problems:

| Candidate artefact | Counts as durable-medium confirmation of consent+acknowledgement? | Note |
|---|---|---|
| **Apple App Store / Google Play receipt** (email/Wallet) | **Probably NOT, alone** — it confirms the *transaction* and is sent by the **store (merchant of record)**, not by the publisher, and does **not** record the consent + acknowledgement language. | [low-confidence — store is a different legal person; receipt content is outside the publisher's control] |
| **Publisher-sent confirmation email** containing the Art 6(1) info + the consent/acknowledgement recap | **Most defensible.** Personally addressed, storable, unchanged-reproduction → meets Art 2(10); and the publisher controls its content to include 16(m)(i)+(ii). | [verify — requires the backend (e.g. Firebase Cloud Functions) to actually send such an email before the unlock] |
| In-app, server-mutable "purchase successful" screen | **Weak** — fails "unchanged reproduction"; trader can alter it. | [low-confidence] |

**Recommended review position:** treat the **store receipt as insufficient on its own** for condition
(iii) and require a **publisher-controlled durable artefact** (email, or an in-app **non-mutable**
PDF/exportable record) that restates the consent + acknowledgement and the Art 6(1) terms, delivered
**at the latest before paid features unlock**. Until that exists, mark condition (iii) **UNMET** and the
waiver **at risk**. [low-confidence — final call is a Dutch jurist's; flag for review]

### 8.3 Merchant-of-record wrinkle

For store-billed sales the store contracts in its own name: Apple Distribution International as the developer's commissionaire and merchant of record (ADPLA Sch. 2 §1.1, Exhibit A §2), Google Commerce Limited as seller. Each store takes the consumer's withdrawal and refunds it (Apple: Purchase History › "Withdraw Transaction"; Google: notice or model form to Google Commerce Limited). The Terms should point to that route and must not describe it as a discretionary "store refund policy". Whether the publisher is in addition a CRD trader for the same contract is open. [settled on the store terms — ADPLA Sch. 2; Apple Media Services Terms §B, §P (14 Sep 2026); Google Play Terms of Service, verified 2026-11-19] [low-confidence — publisher-as-co-trader, LEGAL REVIEW REQUIRED]

### 8.4 Disclosure (don't drop it even with a waiver)
Even when relying on the 16(m) waiver, **still disclose** the existence of the 14-day right, the
conditions under which it is lost, **make the Annex I(B) model form available**, and, where applicable,
say that the **Art 11a withdrawal function** exists and where it is (Art 6(1)(h)).
Omission re-opens the Art 10 12-month window. Keep this in the Terms' withdrawal section (**§6** in the example app). [settled — Art 6(1)(h)
+ Art 10 chain, verified 2026-11-18]

---

## 9. Review checklist (paste into a clause adjudication)

1. [ ] Terms/paywall **disclose** the 14-day withdrawal right and **link the Annex I(B) model form**,
   and, where applicable, say where the **Art 11a withdrawal function** is
   (Art 6(1)(h)). — *omission ⇒ Art 10 12-month extension.* [settled, verified 2026-11-18]
2. [ ] Waiver consent is captured via an **affirmative, unticked-by-default** control (no pre-tick).
   [settled — Art 16(m)(i), verified 2026-11-18]
3. [ ] The consent copy states **both** (a) consent to **begin immediate performance** in the 14-day
   window **and** (b) **acknowledgement of loss of the right**. [settled — Art 16(m)(i)+(ii), verified 2026-11-18]
4. [ ] A **durable-medium confirmation** (email / non-mutable record), **sent by the trader** (for store-billed sales, see §8.3: whether the publisher is a co-trader is open), reproducing the
   Art 6(1) info + the consent/acknowledgement, is delivered **before performance begins**.
   **← the part to VERIFY for an app sold through the stores.** [low-confidence — Art 16(m)(iii)/Art 8(7)]
5. [ ] Terms draft acknowledgement wording to satisfy **both Art 16(m)** (digital content) **and
   Art 16(a)** (digital service, "fully performed") given the classification ambiguity. [low-confidence]
6. [ ] For store-billed sales, the Terms name the store's withdrawal route (Apple: Purchase History › Withdraw Transaction; Google: notice or form to Google Commerce Limited) and say where the Art 11a function is; for own-checkout sales, the publisher's own function exists. [settled — CRD Art 6(1)(h), 11a; BW 6:230m(1)(h), 6:230oa, verified 2026-11-19]
7. [ ] Internal evidence (`withdrawalConsentAt`) is logged — note it is evidence, **not** the consumer's
   Art 8(7) confirmation. [settled, verified 2026-11-18]

---

## 10. Open items for the human / Dutch jurist (verify_flags)

- **[low-confidence] Classification:** is the paid subscription "digital content" (Art 16(m)) or "digital
  service" (Art 16(a)) — and does that change the validity/extent of the waiver and any pro-rata refund?
- **[low-confidence] Condition (iii) durable medium:** does the Apple/Google receipt satisfy Art 8(7),
  or must the publisher send its own durable-medium confirmation reproducing the consent + acknowledgement
  before unlock? (An implementation that only logs a consent timestamp such as `withdrawalConsentAt`, as
  the example app does, may not deliver a consumer-facing durable artefact.)
- **[verify] Checkbox copy substance:** confirm the live paywall wording captures **both** consent-to-begin
  and loss-of-right (Art 16(m)(i) AND (ii)), not just one.
- **[low-confidence — LEGAL REVIEW REQUIRED] Publisher as co-trader:** for store-billed sales the store
  contracts in its own name and runs the withdrawal (§8.3, settled on the store terms 2026-11-19); whether
  the publisher is in addition a CRD trader (Art 2(2), "on his behalf") and answers if a store's withdrawal
  route falls short of Art 11a or BW 6:230oa is open. No verdict is given on it (`legal-guardrails.md` §5).
- **[verify-pinpoint] Annex I(B) / model-form must-provide:** pin Art 11(1) (unambiguous-statement) and
  the exact Art 6(1)(h) → Art 10 consequence chain.
- **NL transposition:** Boek 6 BW Titel 5 Afd. 2B. Withdrawal ("ontbinding") 6:230o; withdrawal function 6:230oa (Stb. 2026, 153, in force 25 June 2026); the information duty 6:230m(1)(h) now includes "de beschikbaarheid en de plaats van de functie". [settled — Stb. 2026, 153; wetten-overheid.nl mirror, verified 2026-11-19] Whether the Dutch digital-content exception matches Art 16(m): [verify]
