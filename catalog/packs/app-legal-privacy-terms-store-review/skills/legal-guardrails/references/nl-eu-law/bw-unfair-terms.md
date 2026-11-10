# Dutch Unfair Terms in Consumer ToS — BW 6:233 / 6:236 (zwarte lijst) / 6:237 (grijze lijst)

**Scope.** The flagship Terms-of-Service reference for adjudicating an app's general terms (`algemene voorwaarden`) against a **Dutch consumer** (`natuurlijk persoon, die niet handelt in de uitoefening van een beroep of bedrijf`). This regime is **mandatory consumer-protection law** — it cannot be contracted away, and a court must apply it **of its own motion** (`ambtshalve toetsing`) under EU Directive 93/13/EEC as interpreted by the CJEU. For an app sold to consumers — such as the example app in `legal-guardrails.md` §8, a Dutch eenmanszaak selling auto-renewing wellness subscriptions to EU/NL-first consumers via Apple/Google — every standard-form clause in the ToS is in scope. Apply the worked examples below to the app under review from its fact sheet.

**Primary sources (this run).**
- `wetten.overheid.nl` BWBR0005289 (Burgerlijk Wetboek Boek 6, Afdeling 3 — Algemene voorwaarden): the official text. The full-document fetch repeatedly **timed out / truncated before art. 236–237** this run, so the canonical wetten.overheid.nl wording was **not** rendered directly. [verify]
- `maxius.nl` mirror of BW6 art. 236 and art. 237 — fetched successfully this run; confirms art. 236 runs **a–s** (19 letters) and art. 237 runs **a–o** (15 letters), reflecting the post-"Wet van Dam" additions. [settled — maxius.nl mirror of BWBR0005289, verified 2026-06-06]
- `wetboekplus.nl` art. 236/237 summaries — the harvest's original source; substance cross-checked against maxius.nl.

> **CITATION CAVEAT (updated 2026-06-06).** The ToS-relevant letter→rule assignments below were **re-verified against the maxius.nl mirror of BWBR0005289 with the verbatim Dutch statutory text** on 2026-06-06 — confirming **6:236** g (<1-yr claim), h (vrijwaring/indemnity), i (price-increase-within-3-months), j (tacit renewal, opzegtermijn ≤1 maand), k (burden-of-proof), m (chosen domicile/forum), n (non-court dispute resolution); and **6:237** b (core-obligation limit), c (materially different performance), f (liability exclusion/cap), g (set-off), h (forfeiture on default), i (termination penalty), k (>1-yr term + post-year-one opzegging), l (asymmetric notice), m (stricter-than-onderhandse-akte form), o (opzegtermijn >1 maand). These are now **[settled]**. The wetten.overheid.nl primary still renders only a ToC via fetch; a manual pull is advisable for the absolute-final filing, but the lettering is confirmed. Items still marked **[verify-pinpoint]** below (a, c–f, l, o–s in 236; a, d, e, j, n in 237) are the non-ToS-critical letters whose verbatim phrasing was not separately pulled.

---

## 1. The gateway: BW 6:233 + 6:231/6:234

A clause in general terms is **vernietigbaar** (voidable — the consumer can annul it) on either ground:

| Ground | Rule | Cite |
|---|---|---|
| **6:233(a)** | The clause is **`onredelijk bezwarend`** (unreasonably onerous) to the counterparty, **considering all the circumstances** (nature/content of the contract, the way the terms came about, the mutually apparent interests of the parties). | [settled — BW 6:233(a), wetboekplus/maxius cross-check, verified 2026-06-06] |
| **6:233(b)** | The user (here: the app's publisher) gave the consumer **no reasonable opportunity to take note** (`redelijke mogelijkheid om kennis te nemen`) of the terms. | [settled — BW 6:233(b), verified 2026-06-06] |

**6:234 — how to satisfy the "opportunity to take note" duty.** The terms must be **handed over** before/at contract conclusion, or — for electronic contracts — **made available electronically** so the consumer can **store and reproduce** them (e.g. a downloadable/scrollable ToS shown *before* the purchase confirmation, not a buried link). A mere link can suffice for online contracts **if** it is genuinely accessible and the consumer can save it. [verify-pinpoint — BW 6:234, exact electronic-availability wording]

**6:235 — the lists do NOT apply to "large" parties.** Art. 6:236/6:237 protect **consumers** (and, via 6:235, exclude large companies that publish annual accounts or employ >50). A consumer app's users are consumers → both lists apply in full. [verify]

**6:240/6:241 — abstract review.** Consumer organisations can have terms declared unfair in the abstract before the Gerechtshof Den Haag; irrelevant to a single ToS sign-off but explains why the lists are policed aggressively. [verify]

**Interpretation backstop — Directive 93/13/EEC + transparency.** Where a clause is not squarely on a list, apply the EU baseline test (**Art. 3**: a non-individually-negotiated term is unfair if, contrary to good faith, it causes a **significant imbalance** to the consumer's detriment) and the **plain-language rule** (**Art. 5**: terms in plain, intelligible language; ambiguity construed **in the consumer's favour** — `contra proferentem`). For an NL-first consumer base, plain-language means a **Dutch-language ToS**, not English-only. [settled — Dir. 93/13/EEC Arts. 3 & 5, harvest cross-check, verified 2026-06-06]

---

## 2. BW 6:236 — ZWARTE LIJST (the black list): clauses **ALWAYS** void

Opening line: *"Bij een overeenkomst tussen een gebruiker en een wederpartij, natuurlijk persoon, die niet handelt in de uitoefening van een beroep of bedrijf, wordt als **onredelijk bezwarend aangemerkt** een in de algemene voorwaarden voorkomend beding…"* — i.e. **deemed** unreasonably onerous, **no rebuttal possible**. A clause matching a black-list letter is simply **void against the consumer**; the only fix is **delete or rewrite**.

Full letter range confirmed **a–s** (19 letters). ToS-relevant letters:

| Letter | Rule (what is always void) | Confidence |
|---|---|---|
| **a** | Wholly **excludes / limits the consumer's right to demand performance** (`nakoming`). | [verify-pinpoint] |
| **b** | Excludes / limits the consumer's right to **ontbinding** (dissolution) of the contract. | [settled — letter b = ontbinding, cross-check, verified 2026-06-06] |
| **c** | Excludes / limits the consumer's right to **suspend** (`opschorting`) its own performance. | [verify-pinpoint] |
| **d** | Lets the **user (trader) determine** whether the consumer's performance conforms / whether the user is in default — i.e. self-judging breach. | [verify-pinpoint] |
| **e** | Allows the user to **transfer/assign** its obligations to a third party without consumer consent (unless the consumer may then dissolve). | [verify-pinpoint] |
| **f** | Cuts off the consumer's **defences** (`verweermiddelen`) / waives them. | [verify-pinpoint] |
| **g** | **Shortens a statutory limitation or forfeiture period to under ONE YEAR** (`korter dan een jaar`). | [settled — letter g = <1yr claim window, harvest+search cross-check, verified 2026-06-06] |
| **h** | Forces the consumer to **indemnify/vrijwaren** the trader against third-party claims for damage, **beyond what the law requires**. | [settled — letter h = consumer indemnity (vrijwaring), cross-check, verified 2026-06-06] |
| **i** | Grants the trader a **unilateral price increase within 3 months** of conclusion **without** giving the consumer a **right to dissolve** in that case. | [settled — BW 6:236(i), maxius.nl verbatim mirror of BWBR0005289, verified 2026-06-06] |
| **j** | **Tacit renewal / extension** (`stilzwijgende verlenging of vernieuwing`) without the consumer's power to **terminate the continued contract at any time with an opzegtermijn of at most 1 month** (post-Wet van Dam). | [settled — BW 6:236(j), maxius.nl verbatim mirror, verified 2026-06-06] |
| **k** | **Shifts the burden of proof** against the consumer to its detriment / alters the statutory evidence position. | [settled — letter k = burden-of-proof shift, cross-check, verified 2026-06-06] |
| **l** | Excludes/limits the consumer's right to have **the contract dissolved or damages** where the user invokes force majeure improperly (deviation from statutory regime). | [verify-pinpoint] |
| **m** | Imposes a **forum / chosen domicile** other than the consumer's actual residence — **unless** the consumer is given ≥1 month to opt for the legally-competent court. | [settled — letter m = forum/domicile against consumer's real one, cross-check, verified 2026-06-06] |
| **n** | Sends disputes to **arbitration / binding advice / non-court resolution**, depriving the consumer of the right to the **statutorily competent court** — unless the consumer is given ≥1 month after the user invokes it to choose the ordinary court. | [settled — letter n = arbitration/non-court dispute resolution void, cross-check, verified 2026-06-06] |
| **o–s** | **Post-"Wet van Dam" additions** on **termination method** (o), **auto-renewal of newspapers/magazines/periodicals** (p, q), **timing restrictions on giving notice** (r), and **trial subscriptions auto-continuing into a paid contract** (s). For a SaaS/app subscription, **o** (no harder-than-the-conclusion-method cancellation) and **r/s** (no trap converting a trial into a rolling paid term without an easy out) are the relevant ones. | [verify-pinpoint — letters o–s, Wet van Dam additions] |

**Hard limits for an app ToS (non-negotiable — a hit = void):**
- **No consumer indemnity** of the publisher for third-party claims (**h**).
- **No foreign forum / non-consumer-domicile** clause against an NL consumer (**m**).
- **No arbitration-only / mandatory binding-advice** dispute clause (**n**).
- **No claim/limitation window under 1 year** (**g**).
- **No auto-renewal without easy cancellation** (**j**, **o–s**) — see §5.
- **No burden-of-proof reversal** (**k**).

---

## 3. BW 6:237 — GRIJZE LIJST (the grey list): clauses **PRESUMED** unfair

Opening line: *"…wordt **vermoed onredelijk bezwarend te zijn** een in de algemene voorwaarden voorkomend beding…"* — **presumed** unreasonably onerous. The clause is **not automatically void**, but the **trader bears the burden** to prove it is reasonable in the circumstances (`tegenbewijs` / rebuttal). For a low-priced consumer app, that rebuttal burden is **hard to discharge** for standard one-sided clauses — so treat grey-list hits as **AMBER: justify or soften**.

Full letter range confirmed **a–o** (15 letters). ToS-relevant letters:

| Letter | Rule (presumed unfair) | Confidence |
|---|---|---|
| **a** | Gives the trader an **unusually long or insufficiently determined period** to respond to an offer/acceptance. | [verify-pinpoint] |
| **b** | **Materially limits the trader's core obligations** versus what the consumer may **reasonably expect** of the contract. | [settled — letter b = limits core obligations vs reasonable expectation, cross-check, verified 2026-06-06] |
| **c** | Permits the trader to deliver **materially different performance** unless the consumer may dissolve — the **"we may change/discontinue features"** clause. | [settled — letter c = materially different performance / unilateral change, cross-check, verified 2026-06-06] |
| **d** | Lets the trader **discharge itself** from its obligations on **grounds it alone defines** / not in the contract. | [verify-pinpoint] |
| **e** | Gives the trader an **unusually long or undetermined period** to perform. | [verify-pinpoint] |
| **f** | **Excludes / limits the trader's STATUTORY LIABILITY** for damages — **the classic liability cap/exclusion**. | [settled — letter f = liability cap/exclusion, harvest+search cross-check, verified 2026-06-06] |
| **g** | **Restricts the consumer's statutory right of set-off** (`verrekening`). | [settled — letter g = set-off restriction, cross-check, verified 2026-06-06] |
| **h** | Makes the consumer **forfeit rights/defences** as a sanction for a **minor default** (acts/omissions other than serious failure). | [settled — letter h = forfeiture on minor default, cross-check, verified 2026-06-06] |
| **i** | On termination, obliges the consumer to **pay a sum disproportionate to the damage** suffered by the trader — i.e. **termination penalties beyond reasonable compensation**. | [settled — letter i = excessive termination penalty, cross-check, verified 2026-06-06] |
| **j** | Obliges the consumer to **conclude a separate/ancillary agreement** with the trader or a third party. | [verify-pinpoint] |
| **k** | **Initial term > ONE YEAR** unless the consumer has, after one year, the power to **terminate at any time** (`na een jaar de bevoegdheid... te allen tijde op te zeggen`). | [settled — BW 6:237(k), maxius.nl verbatim mirror, verified 2026-06-06] |
| **l** | Sets a **longer notice period for the consumer than for the trader** (asymmetric notice). | [settled — letter l = asymmetric notice periods, cross-check, verified 2026-06-06] |
| **m** | Requires a **stricter form than written/onderhandse akte** for the consumer's declarations (e.g. demanding registered post / notarised form to cancel). | [settled — letter m = stricter-than-written formality for consumer, cross-check, verified 2026-06-06] |
| **n** | Grants the trader an **irrevocable / death-surviving power of attorney** from the consumer. | [verify-pinpoint] |
| **o** | Binds the consumer to an **opzegtermijn longer than ONE MONTH** (`langer dan een maand`). | [settled — BW 6:237(o), maxius.nl verbatim mirror, verified 2026-06-06] |

---

## 4. RED / AMBER CLAUSE-SCANNER (the operational table)

For each clause type in an app ToS: which list it hits, the **verdict**, and what a **compliant** version looks like.

| Clause type (as drafted in app ToS) | List + letter | Verdict | Compliant rewrite |
|---|---|---|---|
| **Consumer indemnifies us** for third-party claims / "you hold us harmless" | 6:236(**h**) | 🔴 **VOID** | **Delete.** Cannot shift third-party-claim liability onto a consumer. |
| **Disputes go to [foreign] courts** / our seat's court / your "chosen domicile is X" | 6:236(**m**) | 🔴 **VOID** | "Disputes may be brought before the **competent Dutch court** for the consumer's place of residence." Optionally name **ConsuWijzer / De Geschillencommissie** for ADR (do **not** link the dead EU ODR platform — shut down 19–20 Jul 2025). |
| **Mandatory arbitration / binding advice only** | 6:236(**n**) | 🔴 **VOID** | Remove the arbitration-exclusivity. ADR may be **offered** but the consumer must retain the right to the ordinary court (give ≥1 month to choose). |
| **Claims must be brought within [6 months / 90 days]** | 6:236(**g**) | 🔴 **VOID** (any window <1 yr) | Use **≥ 1 year**, or simply rely on the statutory limitation period. |
| **We may raise the price within 3 months, no exit** | 6:236(**i**) | 🔴 **VOID** | If an early price rise is needed, give the consumer a **right to dissolve** if the price increases. (Most app prices are set by Apple/Google → usually N/A; see §6.) |
| **Auto-renews; cancel only by [hard method / long notice]** | 6:236(**j**), (**o**), (**r/s**) | 🔴 **VOID** | Renews to an **indefinite term cancellable any time with ≤1-month notice**, cancellation **as easy as sign-up**. In practice store-managed (see §5). |
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
3. A **trial subscription** must **not auto-convert** into an ongoing paid contract without a clean, easy opt-out (6:236(r/s)). For a **free trial → auto-charged paid tier** (as in the example app), the consumer must be able to cancel the trial before charge through the normal store flow.

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

[settled — wellness vs core-obligation distinction follows from 6:237(b)/(c) + MDR wellness carve-out, harvest cross-check, verified 2026-06-06]

---

## 8. Cross-references (other files in this KB)

- **CRD 2011/83 Art. 9 + 16(m) withdrawal waiver** — the 14-day right and the digital-content waiver mechanics (express consent + acknowledgement of loss + durable-medium confirmation). The auto-renewal/cancellation point here is separate from the withdrawal right; both must be satisfied.
- **Directive 93/13/EEC** — the EU baseline the BW lists transpose; the good-faith/significant-imbalance test and plain-language rule.
- **Dutch ADR post-ODR** — ConsuWijzer / De Geschillencommissie for the dispute clause (never link `ec.europa.eu/consumers/odr`).
- **eenmanszaak identity** — controller/trader identity (KvK, BTW, registered address, personal-liability exposure) for the ToS/PP header.

---

## 9. Sign-off checklist (drop-in)

- [ ] No clause matching a **6:236** letter (indemnity **h**, forum **m**, arbitration **n**, <1yr window **g**, burden-shift **k**, auto-renewal trap **j/o/r/s**, price-rise-no-exit **i**, ontbinding/suspension limits **b/c**). → any hit = **remove/rewrite**.
- [ ] Each **6:237** clause (liability cap **f**, unilateral change **b/c**, termination penalty **i**, set-off **g**, asymmetric notice **l**, stricter form **m**, >1yr term **k**) is either removed or **softened + justified** to discharge the rebuttal burden.
- [ ] Liability cap carves out intent/gross negligence + death/personal injury + DCD conformity (§6).
- [ ] Auto-renew/cancellation routes the consumer to the **store-native** cancel (when the stores sell it); no harder publisher-side step (§5).
- [ ] ToS is in **Dutch** (plain language) for the NL consumer base.
- [ ] Terms are presented **before** purchase confirmation, storable/reproducible (6:233(b)/6:234).
- [ ] **Re-pull `wetten.overheid.nl/BWBR0005289` art. 236 + 237** and verify literal wording of every flagged `[verify-pinpoint]` letter before final sign-off.

---

### Verify flags (for a human to confirm against authoritative wetten.overheid.nl text)
- Authoritative wetten.overheid.nl rendering of art. 236/237 not obtained this run (fetch timeout) — letter→rule mapping corroborated via maxius.nl + wetboekplus + harvest, exact phrasing **not** confirmed. **[verify]**
- The **price-increase-within-3-months** vs **tacit-renewal** split (236 letters **i** vs **j**) — confirm which letter is which. **[verify-pinpoint]**
- Black-list letters **a, c, d, e, f, l, o–s** exact wording/scope (esp. the Wet van Dam additions o–s). **[verify-pinpoint]**
- Grey-list letters **a, d, e, j, k, n, o** exact wording — esp. **k** (>1yr term + post-year-one exit + notice cap) and **o** (one-month max notice). **[verify-pinpoint]**
- 6:234 electronic-availability ("store and reproduce") exact wording. **[verify-pinpoint]**
- Liability-cap carve-out for intent/gross negligence as independently void (BW 6:248 / public policy) and the DCD 2019/770 conformity non-waiver — confirm pinpoints. **[verify-pinpoint]**
- Reasonable liability-cap formulation for a low-priced consumer app — no tested NL precedent; needs jurist. **[low-confidence]**
- Wet van Dam exact letter mapping for a SaaS/app subscription (vs the periodicals letters). **[verify-pinpoint]**
