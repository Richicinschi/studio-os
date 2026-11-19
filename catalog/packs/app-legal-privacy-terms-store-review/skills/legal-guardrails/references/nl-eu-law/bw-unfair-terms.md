# Dutch Unfair Terms in Consumer ToS — BW 6:233 / 6:236 (zwarte lijst) / 6:237 (grijze lijst)

**Scope.** The flagship Terms-of-Service reference for adjudicating an app's general terms (`algemene voorwaarden`) against a **Dutch consumer** (`natuurlijk persoon, die niet handelt in de uitoefening van een beroep of bedrijf`). This regime is **mandatory consumer-protection law** — it cannot be contracted away, and a court must apply it **of its own motion** (`ambtshalve toetsing`) under EU Directive 93/13/EEC as interpreted by the CJEU. For an app sold to consumers — such as the example app in `legal-guardrails.md` §8, a Dutch eenmanszaak selling auto-renewing wellness subscriptions to EU/NL-first consumers via Apple/Google — every standard-form clause in the ToS is in scope. Apply the worked examples below to the app under review from its fact sheet.

**Primary sources (this run).**
- `wetten.overheid.nl` BWBR0005289 (Burgerlijk Wetboek Boek 6, Afdeling 3 — Algemene voorwaarden): the official text, version in force from 16 July 2026, read in full on 2026-11-18 (arts. 233, 234, 236 and 237); it matches the mirror's wording. [settled — wetten.overheid.nl/BWBR0005289, verified 2026-11-18]
- `wetten-overheid.nl` mirror of BW6 art. 236 and art. 237 (names wetten.overheid.nl as its official source; `maxius.nl`, used on 2026-06-06, returned HTTP 500 on 2026-11-18) — confirms art. 236 runs **a–t** (20 letters; **t**, gift-voucher validity under two years, was added by Stb. 2021, 506) and art. 237 runs **a–o** (15 letters). [settled — wetten-overheid.nl mirror of BWBR0005289 + Stb. 2021, 506, verified 2026-11-18]
- `wetboekplus.nl` art. 236/237 summaries — the harvest's original source; substance cross-checked against maxius.nl.

> **CITATION CAVEAT (updated 2026-11-18).** The ToS-relevant letter→rule assignments below were first verified against the maxius.nl mirror on 2026-06-06 and **re-verified against the wetten-overheid.nl mirror of BWBR0005289** on 2026-11-18 — confirming **6:236** b (ontbinding), g (<1-yr claim), h (third-party damage borne by the consumer), i (price-increase-within-3-months), j (tacit renewal, opzegtermijn ≤1 maand), k (burden-of-proof), m (choice of domicile; corrected 2026-11-18), n (non-court dispute resolution); and **6:237** b (core-obligation limit), c (materially different performance), f (liability exclusion/cap), g (set-off), h (forfeiture as a sanction; corrected 2026-11-18), i (termination penalty), k (>1-yr term + post-year-one opzegging), l (asymmetric notice), m (stricter-than-onderhandse-akte form), o (opzegtermijn >1 maand). These are now **[settled]**. On 2026-11-18 the official wetten.overheid.nl text was also read in full and matches; every letter of 236 and 237 below is now pinned against it.

---

## 1. The gateway: BW 6:233 + 6:231/6:234

A clause in general terms is **vernietigbaar** (voidable — the consumer can annul it) on either ground:

| Ground | Rule | Cite |
|---|---|---|
| **6:233(a)** | The clause is **`onredelijk bezwarend`** (unreasonably onerous) to the counterparty, **considering all the circumstances** (nature/content of the contract, the way the terms came about, the mutually apparent interests of the parties). | [settled — BW 6:233(a), wetten-overheid.nl mirror of BWBR0005289, verified 2026-11-18] |
| **6:233(b)** | The user (here: the app's publisher) gave the consumer **no reasonable opportunity to take note** (`redelijke mogelijkheid om kennis te nemen`) of the terms. | [settled — BW 6:233(b), verified 2026-11-18] |

**6:234 — how to satisfy the "opportunity to take note" duty.** The terms must be **handed over** before/at contract conclusion, or — for electronic contracts — **made available electronically** so the consumer can **store them and access them for later reference** (e.g. a downloadable/scrollable ToS shown *before* the purchase confirmation, not a buried link). [settled — BW 6:234(1)–(2), wetten.overheid.nl, verified 2026-11-18] A mere link can suffice for online contracts **if** it is genuinely accessible and the consumer can save it. [verify — this suite's reading]

**6:235 — the lists do NOT apply to "large" parties.** Art. 6:236/6:237 protect **consumers** (and, via 6:235, exclude large companies that publish annual accounts or employ >50). A consumer app's users are consumers → both lists apply in full. [verify]

**6:240/6:241 — abstract review.** Consumer organisations can have terms declared unfair in the abstract before the Gerechtshof Den Haag; irrelevant to a single ToS review but explains why the lists are policed aggressively. [verify]

**Interpretation backstop — Directive 93/13/EEC + transparency.** Where a clause is not squarely on a list, apply the EU baseline test (**Art. 3**: a non-individually-negotiated term is unfair if, contrary to good faith, it causes a **significant imbalance** to the consumer's detriment) and the **plain-language rule** (**Art. 5**: terms in plain, intelligible language; ambiguity construed **in the consumer's favour** — `contra proferentem`). For an NL-first consumer base, plain-language means a **Dutch-language ToS**, not English-only. [settled — Dir. 93/13/EEC Arts. 3 & 5, harvest cross-check, verified 2026-11-18]

---

## 2. BW 6:236 — ZWARTE LIJST (the black list): clauses **ALWAYS** void

Opening line: *"Bij een overeenkomst tussen een gebruiker en een wederpartij, natuurlijk persoon, die niet handelt in de uitoefening van een beroep of bedrijf, wordt als **onredelijk bezwarend aangemerkt** een in de algemene voorwaarden voorkomend beding…"* — i.e. **deemed** unreasonably onerous, **no rebuttal possible**. A clause matching a black-list letter is simply **void against the consumer**; the only fix is **delete or rewrite**.

Full letter range confirmed **a–t** (20 letters; **t** = gift-voucher validity, not app-relevant). ToS-relevant letters:

| Letter | Rule (what is always void) | Confidence |
|---|---|---|
| **a** | **Wholly and unconditionally** takes away the consumer's right to demand the performance the trader promised. | [settled — BW 6:236(a), wetten.overheid.nl, verified 2026-11-18] |
| **b** | Excludes / limits the consumer's right to **ontbinding** (dissolution) of the contract. | [settled — letter b = ontbinding, cross-check, verified 2026-11-18] |
| **c** | Excludes / limits the consumer's statutory right to **suspend** (`opschorting`) its own performance, or gives the trader a wider suspension right than the law does. | [settled — BW 6:236(c), wetten.overheid.nl, verified 2026-11-18] |
| **d** | Leaves it to the **trader** to judge whether the trader itself has failed to perform, or makes the consumer's statutory remedies depend on first suing a third party. | [settled — BW 6:236(d), wetten.overheid.nl, verified 2026-11-18] |
| **e** | Gives advance consent to the trader **transferring its obligations** to a third party, unless the consumer may then dissolve at any time, the trader stays liable for the third party's performance, or the transfer comes with the sale of the business. | [settled — BW 6:236(e), wetten.overheid.nl, verified 2026-11-18] |
| **f** | Where the trader's rights pass to a third party, excludes or limits the powers or **defences** (`verweermiddelen`) the consumer could raise against that third party. | [settled — BW 6:236(f), wetten.overheid.nl, verified 2026-11-18] |
| **g** | **Shortens a statutory limitation or forfeiture period to under ONE YEAR** (`korter dan een jaar`). | [settled — letter g = <1yr claim window, harvest+search cross-check, verified 2026-11-18] |
| **h** | Forces the consumer to **indemnify/vrijwaren** the trader against third-party claims for damage, **beyond what the law requires**. | [settled — letter h = consumer indemnity (vrijwaring), cross-check, verified 2026-11-18] |
| **i** | Grants the trader a **unilateral price increase within 3 months** of conclusion **without** giving the consumer a **right to dissolve** in that case. | [settled — BW 6:236(i), wetten-overheid.nl mirror of BWBR0005289, verified 2026-11-18] |
| **j** | For a contract for the regular delivery of goods (incl. electricity, heat and cold; periodicals excluded) or the regular performance of services ("geregeld doen van verrichtingen"): a clause that leads to (1) **tacit renewal or extension into a fixed-term contract** — black-listed outright — or (2) **tacit continuation into an indefinite-term contract** without the consumer's power to cancel the continued contract at any time with at most one month's notice. | [settled — BW 6:236(j), wetten-overheid.nl mirror of BWBR0005289 (geldig vanaf 01-01-2022), verified 2026-11-19] |
| **k** | **Shifts the burden of proof** against the consumer to its detriment / alters the statutory evidence position. | [settled — letter k = burden-of-proof shift, cross-check, verified 2026-11-18] |
| **l** | **Deviates from BW 3:37** (declarations) to the consumer's detriment, unless it concerns the **form** of the consumer's declarations or lets the trader treat the **address the consumer gave** as valid until a new one is notified. | [settled — BW 6:236(l), wetten-overheid.nl mirror of BWBR0005289, verified 2026-11-18] |
| **m** | Makes a consumer living in the Netherlands **choose a domicile** (`woonplaats kiezen`) other than their actual one (narrow notary exception for registered property). It has no one-month court-choice rule; that is **n**. | [settled — BW 6:236(m), wetten-overheid.nl mirror of BWBR0005289, verified 2026-11-18] |
| **n** | Sends disputes to **arbitration / binding advice / non-court resolution**, depriving the consumer of the right to the **statutorily competent court** — unless the consumer is given ≥1 month after the user invokes it to choose the ordinary court. | [settled — letter n = arbitration/non-court dispute resolution void, cross-check, verified 2026-11-18] |
| **o–s** | **o**: excludes or limits the consumer's power to **cancel in the same way** (orally, in writing or electronically) as the contract was concluded. **p, q**: tacit renewal or continuation of **newspaper, magazine and periodical** subscriptions. **r**: requires notice of cancellation of a **j**, **p** or **q** contract **at a particular moment**. **s**: a limited-term **trial subscription to newspapers or magazines** continuing into a further contract (periodicals only). For an app subscription, **o** and **r** are the relevant ones; whether a free trial converting into a paid term is a **j** continuation is not in the letter text (§5 item 3). | [settled — BW 6:236(o)–(s), wetten-overheid.nl mirror of BWBR0005289, verified 2026-11-18] [low-confidence — trial-to-paid under **j**; LEGAL REVIEW REQUIRED] |

**Hard limits for an app ToS (non-negotiable — a hit = void):**
- **No consumer indemnity** of the publisher for third-party claims (**h**).
- **No foreign or other non-competent forum** clause without the one-month court choice (**n**), and **no forced choice of domicile** for an NL consumer (**m**).
- **No arbitration-only / mandatory binding-advice** dispute clause (**n**).
- **No claim/limitation window under 1 year** (**g**).
- **No auto-renewal without easy cancellation** (**j**, **o**, **r**) — see §5.
- **No burden-of-proof reversal** (**k**).

---

## 3. BW 6:237 — GRIJZE LIJST (the grey list): clauses **PRESUMED** unfair

Opening line: *"…wordt **vermoed onredelijk bezwarend te zijn** een in de algemene voorwaarden voorkomend beding…"* — **presumed** unreasonably onerous. The clause is **not automatically void**, but the **trader bears the burden** to prove it is reasonable in the circumstances (`tegenbewijs` / rebuttal). For a low-priced consumer app, that rebuttal burden is **hard to discharge** for standard one-sided clauses — so treat grey-list hits as **AMBER: justify or soften**.

Full letter range confirmed **a–o** (15 letters). ToS-relevant letters:

| Letter | Rule (presumed unfair) | Confidence |
|---|---|---|
| **a** | Gives the trader an **unusually long or insufficiently determined period** to respond to an offer or other declaration of the consumer. | [settled — BW 6:237(a), wetten.overheid.nl, verified 2026-11-18] |
| **b** | **Materially limits the trader's core obligations** versus what the consumer may **reasonably expect** of the contract. | [settled — letter b = limits core obligations vs reasonable expectation, cross-check, verified 2026-11-18] |
| **c** | Permits the trader to deliver **materially different performance** unless the consumer may dissolve — the **"we may change/discontinue features"** clause. | [settled — letter c = materially different performance / unilateral change, cross-check, verified 2026-11-18] |
| **d** | Lets the trader **free itself** from the contract on grounds other than those stated in it that are serious enough that it can no longer be held to it. | [settled — BW 6:237(d), wetten.overheid.nl, verified 2026-11-18] |
| **e** | Gives the trader an **unusually long or undetermined period** to perform. | [settled — BW 6:237(e), wetten.overheid.nl, verified 2026-11-18] |
| **f** | **Excludes / limits the trader's STATUTORY LIABILITY** for damages — **the classic liability cap/exclusion**. | [settled — letter f = liability cap/exclusion, harvest+search cross-check, verified 2026-11-18] |
| **g** | **Restricts the consumer's statutory right of set-off** (`verrekening`). | [settled — letter g = set-off restriction, cross-check, verified 2026-11-18] |
| **h** | Makes the consumer **forfeit rights or defences** as a sanction for certain conduct, **unless that conduct justifies** the forfeiture. | [settled — BW 6:237(h), wetten-overheid.nl mirror of BWBR0005289, verified 2026-11-18] |
| **i** | On termination, obliges the consumer to **pay a sum disproportionate to the damage** suffered by the trader — i.e. **termination penalties beyond reasonable compensation**. | [settled — letter i = excessive termination penalty, cross-check, verified 2026-11-18] |
| **j** | Obliges the consumer to **conclude a separate agreement** with the trader or a third party, unless that can reasonably be asked given its link to this contract. | [settled — BW 6:237(j), wetten.overheid.nl, verified 2026-11-18] |
| **k** | **Initial term > ONE YEAR** unless the consumer has, after one year, the power to **terminate at any time** (`na een jaar de bevoegdheid... te allen tijde op te zeggen`). | [settled — BW 6:237(k), wetten-overheid.nl mirror of BWBR0005289, verified 2026-11-18] |
| **l** | Sets a **longer notice period for the consumer than for the trader** (asymmetric notice). | [settled — letter l = asymmetric notice periods, cross-check, verified 2026-11-18] |
| **m** | Requires a **stricter form than written/onderhandse akte** for the consumer's declarations (e.g. demanding registered post / notarised form to cancel). | [settled — letter m = stricter-than-written formality for consumer, cross-check, verified 2026-11-18] |
| **n** | Makes a power of attorney from the consumer **irrevocable**, or one that survives death or guardianship (except for delivery of registered property). | [settled — BW 6:237(n), wetten.overheid.nl, verified 2026-11-18] |
| **o** | Binds the consumer to an **opzegtermijn longer than ONE MONTH** (`langer dan een maand`). | [settled — BW 6:237(o), wetten-overheid.nl mirror of BWBR0005289, verified 2026-11-18] |

---

## 4. RED / AMBER CLAUSE-SCANNER (the operational table)

For each clause type in an app ToS: which list it hits, the **verdict**, and what a **compliant** version looks like.

| Clause type (as drafted in app ToS) | List + letter | Verdict | Compliant rewrite |
|---|---|---|---|
| **Consumer indemnifies us** for third-party claims / "you hold us harmless" | 6:236(**h**) | 🔴 **VOID** | **Delete.** Cannot shift third-party-claim liability onto a consumer. |
| **Disputes go to [foreign] courts** / our seat's court / your "chosen domicile is X" | 6:236(**n**) for the court; (**m**) for the chosen domicile | 🔴 **VOID** | "Disputes may be brought before the **competent Dutch court** for the consumer's place of residence." Optionally name **ConsuWijzer / De Geschillencommissie** for ADR (do **not** link the dead EU ODR platform — shut down 19–20 Jul 2025). |
| **Mandatory arbitration / binding advice only** | 6:236(**n**) | 🔴 **VOID** | Remove the arbitration-exclusivity. ADR may be **offered** but the consumer must retain the right to the ordinary court (give ≥1 month to choose). |
| **Claims must be brought within [6 months / 90 days]** | 6:236(**g**) | 🔴 **VOID** (any window <1 yr) | Use **≥ 1 year**, or simply rely on the statutory limitation period. |
| **We may raise the price within 3 months, no exit** | 6:236(**i**) | 🔴 **VOID** | If an early price rise is needed, give the consumer a **right to dissolve** if the price increases. (Most app prices are set by Apple/Google → usually N/A; see §6.) |
| **Auto-renews; cancel only by [hard method / long notice]** | 6:236(**j**), (**o**), (**r**) | 🔴 **VOID** | Renews to an **indefinite term cancellable any time with ≤1-month notice**, cancellation **as easy as sign-up**. Cancellation is store-managed (see §5), but store cancellation stops only the next renewal and gives no monthly exit, so an annual auto-renewal does not meet this fix (§5 item 3). |
| **You bear the burden of proving [our breach / non-delivery]** | 6:236(**k**) | 🔴 **VOID** | Delete; leave the statutory burden untouched. |
| **No / limited right to cancel (ontbinding) for our breach** | 6:236(**b**) | 🔴 **VOID** | Preserve the consumer's statutory `ontbinding` right. |
| **We can swap our obligations to a third party** | 6:236(**e**) | 🔴 **VOID** (unless consumer may then dissolve) | Allow assignment **only** with a consumer dissolution right. |
| **LIABILITY CAP / exclusion** ("our liability is limited to €X / fees paid / nil") | 6:237(**f**) | 🟠 **PRESUMED UNFAIR** | See §7 — modest, mutual where possible, **carve out intent, gross negligence, death/personal injury**, and statutory consumer-conformity remedies. |
| **"We may change, suspend or discontinue any feature at any time"** | 6:237(**c**) (also (b)) | 🟠 **PRESUMED UNFAIR** | Frame with **reasonableness + reasonable notice + a right to cancel/refund the unused term** for material adverse changes; don't reserve unfettered discretion over **core** functionality the consumer paid for. |
| **Service provided "as is", core function not guaranteed** | 6:237(**b**) | 🟠 **PRESUMED UNFAIR** | Don't disclaim the **core** promise (the Pro features the consumer paid for). General-wellness/no-medical-outcome disclaimers are fine and separate (see §8). |
| **Early-termination fee / forfeiture of prepaid period** | 6:237(**i**) | 🟠 **PRESUMED UNFAIR** | Cap any charge at the trader's **actual reasonable loss**; for store-billed subs there is normally no separate fee. |
| **Forfeit rights for any minor breach of ToS** | 6:237(**h**) | 🟠 **PRESUMED UNFAIR** | Reserve account-termination for **material/serious** breach, with notice/cure where feasible. |
| **No set-off allowed** | 6:237(**g**) | 🟠 **PRESUMED UNFAIR** | Drop the blanket bar, or limit to the trader's set-off only. |
| **Initial term >1 yr, no exit after year 1** | 6:237(**k**) | 🟠 **PRESUMED UNFAIR** | Annual/monthly terms with a post-year-one exit (≤1-month notice). |
| **Consumer must give longer notice than we do** | 6:237(**l**) | 🟠 **PRESUMED UNFAIR** | Symmetric notice periods. |
| **Cancellation only by registered letter / notarised form** | 6:237(**m**), 6:236(**o**) | 🟠/🔴 | Allow cancellation by the **same easy electronic means** as sign-up. |
| **English-only ToS for NL consumers** | Dir. 93/13 Art. 5 (transparency) | 🟠 **AMBER** | Provide a **Dutch** version; ambiguity is read `contra proferentem`. |

---

## 5. Auto-renewal — the post-"Wet van Dam" regime (applied to an app sold through the stores)

The **Wet van Dam** (in force **1 Dec 2011**) overhauled the auto-renewal rules and added letters to both lists. Core consumer entitlements, all of which a ToS must respect: [verify-pinpoint — Wet van Dam, exact letter mapping for SaaS]

1. After an initial fixed term, a subscription that **tacitly renews** must become **terminable at any time** with a notice period of **no more than one month** (6:236(j)-line). A clause forcing a fixed renewed term or >1-month notice is **void**.
2. **Cancellation must be as easy as subscribing** (6:236(o)) — the "cancel button is as findable as the buy button" principle; demanding registered post is void.
3. **Free trial → paid.** 6:236(s) covers newspaper and magazine trials only. A trial converting into a **monthly** plan cancellable at any time (effective at the end of the current month) complies on any reading. Every later **annual auto-renewal** is a tacit renewal into a fixed term, black-listed under j where the renewal clause is the publisher's general term (who is "gebruiker" of that clause in store-billed subscriptions is the open point below). Store cancellation stops only the next renewal and gives no monthly exit. At sign-up (the paywall) the consumer must be shown the trial length, the price per billing period and how to cancel (CRD Art 6(1)(e), (o), 8(2)); if so, no second withdrawal right arises at conversion. [settled — BW 6:236(j), (s); CRD Arts 6(1)(e), (o), 8(2); CJEU C-565/22 paras 47–51, verified 2026-11-19] A trial converting into an **annual** plan is black-listed under j on the continuation reading, and compliant if the first paid year counts as the agreed initial term; which reading holds, and who is "gebruiker" of the renewal clause in store-billed subscriptions: [low-confidence — LEGAL REVIEW REQUIRED]

**Store-sold specifics (the example app's case).** When subscriptions are sold **through Apple/Google as merchants of record**, cancellation/auto-renew is **managed in the Apple/Google account**, which already meets the "easy cancellation" standard (store-native cancel). The ToS must therefore:
- **Point the consumer to the store's manage-subscription flow** for cancellation (do not impose an additional/harder publisher-side step — that would re-introduce a 6:236(o) problem).
- **Not** claim any term-lock, renewal penalty, or non-refund of the unused period that the law or the store policy overrides.
- Note that the **Apple/Google receipt** is the consumer's record; this also feeds the CRD withdrawal-waiver durable-medium question (see §8 / cross-ref the CRD-withdrawal reference).

---

## 6. The liability cap — surviving the 6:237(f) rebuttal (clause-library guidance)

A liability cap is **presumed unfair (6:237(f))**, not void — but the trader must **justify it as reasonable**. For a low-priced consumer wellness app, a defensible cap: [low-confidence — no tested NL formulation; jurist sign-off required]

**MUST carve out (never cap/exclude these):**
- **Intent (`opzet`) and gross negligence (`bewuste roekeloosheid`/`grove schuld`)** — capping these is independently void as contrary to good morals / `redelijkheid en billijkheid` (BW 6:248) and reinforces the 6:237(f) presumption. [verify-pinpoint]
- **Death or personal injury** (Dir. 93/13 Annex 1(a); also a public-policy floor).
- **Statutory consumer-conformity / non-conformity remedies** under the **Digital Content Directive 2019/770** (transposed in BW Boek 7 Afd. 9B) — a digital-service trader cannot contract out of the consumer's conformity rights. [verify]

**Reasonable shape:**
- Cap recoverable **direct** damages at the **fees the consumer actually paid in the last 12 months** (small, proportional to a cheap subscription) — and present it as such, not as a near-zero exclusion.
- Keep it **mutual / good-faith** rather than a one-sided trader shield.
- Avoid excluding **all** indirect/consequential loss in absolute terms; frame by reference to foreseeability.

A bare "we exclude all liability to the maximum extent permitted by law" against an NL consumer is **presumed unfair and likely unenforceable** — rewrite.

---

## 7. Health-claim / wellness firewall interaction (wellness apps)

The ToS's disclaimer should state the app is for **general wellbeing / relaxation support** and is **not medical advice, diagnosis, or treatment** — phrased to **support / may help relax**, never **treat/cure/diagnose/prevent**. This disclaimer is **legitimate** and does **not** hit 6:237(b)/(c): it scopes the *purpose*, it does not disclaim the **core paid feature** (e.g. the example app's breathing programs). Keep the two separate:
- ✅ "`<app name>` supports relaxation and general wellbeing; it is not a medical device and does not treat any condition." (allowed; also the MDR out-of-scope firewall)
- 🟠 "We do not guarantee the app will function / Pro features may be removed at our sole discretion." (6:237(b)/(c) — soften per §4)

[settled — wellness vs core-obligation distinction follows from 6:237(b)/(c) + MDR wellness carve-out, harvest cross-check, verified 2026-11-18]

---

## 8. Cross-references (other files in this KB)

- **CRD 2011/83 Art. 9 + 16(m) withdrawal waiver** — the 14-day right and the digital-content waiver mechanics (express consent + acknowledgement of loss + durable-medium confirmation). The auto-renewal/cancellation point here is separate from the withdrawal right; both must be satisfied.
- **Directive 93/13/EEC** — the EU baseline the BW lists transpose; the good-faith/significant-imbalance test and plain-language rule.
- **Dutch ADR post-ODR** — ConsuWijzer / De Geschillencommissie for the dispute clause (never link `ec.europa.eu/consumers/odr`).
- **eenmanszaak identity** — controller/trader identity (KvK, BTW, registered address, personal-liability exposure) for the ToS/PP header.

---

## 9. Review checklist (drop-in)

- [ ] No clause matching a **6:236** letter (indemnity **h**, forum or arbitration **n**, forced domicile **m**, <1yr window **g**, burden-shift **k**, auto-renewal trap **j/o/r**, price-rise-no-exit **i**, ontbinding/suspension limits **b/c**). → any hit = **remove/rewrite**.
- [ ] Each **6:237** clause (liability cap **f**, unilateral change **b/c**, termination penalty **i**, set-off **g**, asymmetric notice **l**, stricter form **m**, >1yr term **k**) is either removed or **softened + justified** to discharge the rebuttal burden.
- [ ] Liability cap carves out intent/gross negligence + death/personal injury + DCD conformity (§6).
- [ ] Auto-renew/cancellation routes the consumer to the **store-native** cancel (when the stores sell it); no harder publisher-side step (§5).
- [ ] ToS is in **Dutch** (plain language) for the NL consumer base.
- [ ] Terms are presented **before** purchase confirmation, storable and accessible for later reference (6:233(b)/6:234).
- [ ] **Re-pull `wetten.overheid.nl/BWBR0005289` art. 236 + 237** before a final SHIP verdict when the version in force has changed since the verified date above (16 July 2026 version, read 2026-11-18).

---

### Verify flags (for a human to confirm against authoritative wetten.overheid.nl text)
- Closed 2026-11-18: the official wetten.overheid.nl text of arts. 234, 236 and 237 was read in full; the i (price rise) vs j (tacit renewal) split, every 236 and 237 letter, and the 6:234 wording are pinned above.
- Liability-cap carve-out for intent/gross negligence as independently void (BW 6:248 / public policy) and the DCD 2019/770 conformity non-waiver — confirm pinpoints. **[verify-pinpoint]**
- Reasonable liability-cap formulation for a low-priced consumer app — no tested NL precedent; needs jurist. **[low-confidence]**
- Wet van Dam exact letter mapping for a SaaS/app subscription (vs the periodicals letters). **[verify-pinpoint]**
