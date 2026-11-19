# Dutch / EU Consumer Dispute-Resolution (ADR) — Reference for ToS Review

**Scope:** Adjudicating the "dispute resolution / out-of-court complaints" clause of a consumer Terms of Service for a Dutch publisher (eenmanszaak / sole proprietorship), EU/NL-first, after the EU ODR platform shutdown.

**Worked example:** the applications below use the example app (`legal-guardrails.md` §8) — a Flutter breathing/mindfulness app; publisher is a Dutch sole proprietor (sole data controller, no DPO); subscriptions sold *through* Apple/Google as merchants of record (RevenueCat + Firebase backend, EU `europe-west`); general-wellness, no medical claims. Apply the rules to the app under review from its fact sheet (`legal-signoff-orchestrator.md` Step 0).

**Citation tiers used below:**
- `[settled — <source>, verified 2026-11-18]` confirmed against a primary source fetched on that date
- `[verify]` believed correct, not confirmed this run
- `[verify-pinpoint]` right substance, exact article/§/letter still to pin
- `[low-confidence]` novel / contested / fact-specific

---

## 0. TL;DR adjudication rules (load these first)

| # | Rule | Tier |
|---|---|---|
| R1 | **The EU ODR platform is DEAD.** Any ToS that links or references `ec.europa.eu/consumers/odr` (or "EU ODR platform" / "online dispute resolution platform") is a **FINDING — must be removed.** | `[settled — ECC Nederland, verified 2026-11-18]` |
| R2 | Do **NOT** promise binding ADR via De Geschillencommissie unless the publisher has **actually affiliated** (aangesloten) with a relevant geschillencommissie. Affiliation is voluntary; an unaffiliated trader cannot be compelled into binding advice. | `[settled — degeschillencommissie.nl, verified 2026-11-18]` |
| R3 | If the publisher is **not** affiliated, the correct clause = (a) internal complaints contact + reasonable response window, (b) **ConsuWijzer** (ACM) for free consumer guidance, and (c) the consumer's right to bring the matter before the **competent court**. | `[settled — composite, verified 2026-11-18]` |
| R4 | **ConsuWijzer is NOT a dispute-resolution body** — it is the ACM's information/guidance portal. Never describe it as deciding or arbitrating disputes. | `[settled — consument.acm.nl, verified 2026-11-18]` |
| R5 | **ConsuWijzer's old URL `consuwijzer.nl` now 301-redirects to `consument.acm.nl`.** Prefer citing `consument.acm.nl` (or "ACM ConsuWijzer"); a bare `consuwijzer.nl` link still resolves but is the legacy host. | `[settled — observed redirect, verified 2026-11-18]` |
| R6 | A consumer's right to go to the **competent court** can never be excluded or made contingent on first using ADR. ADR is always **voluntary and additional** to the court route. | `[verify-pinpoint]` (ADR Directive 2013/11/EU principle) |

---

## 1. The EU ODR platform shutdown

### 1.1 What happened

| Fact | Detail | Tier |
|---|---|---|
| Platform | EU Online Dispute Resolution (ODR) platform, formerly at **`ec.europa.eu/consumers/odr`** | `[settled — historic, verified 2026-11-18]` (the URL now redirects to a European Commission notice that the platform is closed) |
| Shutdown date | **Platform shut down 19 July 2025**; user data on the platform **deleted 20 July 2025** | `[settled — ECC Nederland, verified 2026-11-18]` |
| Trader obligation lifted | From **20 July 2025**, businesses are **no longer required** to refer to the ODR platform on their complaints page or in their general terms & conditions | `[settled — ECC Nederland, verified 2026-11-18]` |
| Pending cases | Businesses with cases pending on the platform had to notify the affected customers | `[settled — ECC Nederland, verified 2026-11-18]` |
| Underlying law | The ODR platform existed under **Regulation (EU) No 524/2013** (the "ODR Regulation"), **repealed with effect from 20 July 2025 by Regulation (EU) 2024/3228** (Art. 1); the **ADR Directive 2013/11/EU** was amended in parallel by Directive (EU) 2025/2647 | `[settled — Reg. (EU) 2024/3228 Art. 1, EU Publications Office, verified 2026-11-18]` |
| Future replacement | **Directive (EU) 2025/2647** (amending the ADR Directive, OJ 30 Dec 2025) has the Commission set up, by 20 April 2026, a digital interactive **information** tool on consumer redress and ADR; it is not a dispute platform. Whether the tool is live was not checked | `[settled — Dir. (EU) 2025/2647, verified 2026-11-18]` |
| ECC role | **ECC Nederland** (European Consumer Centre) hosted the NL ODR contact point until 20 July 2025 and is the source of this shutdown notice; for cross-border EU disputes consumers can still turn to **ECC Nederland** (part of **ECC-Net**) for free advice and mediation | `[settled — ECC Nederland, verified 2026-11-18]` |

### 1.2 Scanner action

- **Regex / string scan** the ToS (and any in-app "support"/"complaints" copy, and the Firebase-Hosted web ToS) for:
  - `ec.europa.eu/consumers/odr`
  - `consumers/odr`
  - "ODR platform" / "Online Dispute Resolution platform"
  - "platform voor onlinegeschillenbeslechting" (NL phrasing)
- Any hit → **FINDING (must remove).** Tier `[settled, verified 2026-11-18]`.
- Cross-app caution: this is a *very* common boilerplate leftover in EU consumer ToS templates written before mid-2025. Always check both EN and NL versions.

---

## 2. De Geschillencommissie (SGC)

**Official:** Stichting Geschillencommissies voor Consumentenzaken (SGC), `degeschillencommissie.nl`.

| Attribute | Detail | Tier |
|---|---|---|
| What it is | Dutch out-of-court (ADR) body resolving consumer complaints about products/services; operates ~85 sector "branches" (geschillencommissies) covering 250,000+ affiliated businesses | `[settled — degeschillencommissie.nl, verified 2026-11-18]` |
| Decision type | Issues a **bindend advies** (binding advice / ruling) that both parties must comply with; **no higher appeal** | `[settled — degeschillencommissie.nl, verified 2026-11-18]` |
| Typical timeline | ~25 weeks from filing to binding decision (average) | `[settled — degeschillencommissie.nl, verified 2026-11-18]` |
| Precondition (consumer) | Consumer must **first** lodge the complaint **with the business** before filing with the commission | `[settled — degeschillencommissie.nl, verified 2026-11-18]` |
| Precondition (trader) | The **business must be affiliated (aangesloten)** with the relevant geschillencommissie (directly, or via an affiliated branche-organisatie) for the binding-advice route to apply | `[settled — degeschillencommissie.nl, verified 2026-11-18]` |
| Membership | **Voluntary** ("Aansluiten" = opt-in joining); there is no automatic/universal commission for a generic app subscription | `[settled — degeschillencommissie.nl, verified 2026-11-18]` |
| Filing fee (klachtengeld) | Per-commission fee set in each commission's reglement; commonly cited range **~EUR 27.50 – EUR 340** | `[verify]` — fee *exists* and is per-commission (`[settled, verified 2026-11-18]`), but the **specific EUR 27.50–340 range was NOT visible on the pages fetched this run**; confirm against the relevant commission's reglement |

### 2.1 Application to an app sold through the stores by an unaffiliated sole trader (worked example)

- A digital subscription app (sold through Apple/Google) is **unlikely to fall under any existing sector geschillencommissie by default.** There is no obvious "app subscription" commission, and the publisher is an eenmanszaak that has almost certainly **not** affiliated.
- Therefore: **do not name De Geschillencommissie as the dispute route** unless/until the publisher has formally affiliated with a matching scheme. Naming it without affiliation is misleading and creates an obligation the trader cannot honour.
- **If** the publisher later affiliates: the clause may then state that the consumer may submit the dispute to the named geschillencommissie within the scheme's deadline, after first complaining to the publisher, and that the commission issues a binding advice. Pair with the publisher's own internal-complaints contact.

---

## 3. ConsuWijzer (ACM)

**Official:** ACM ConsuWijzer — `consument.acm.nl` (legacy `consuwijzer.nl` 301-redirects here).

| Attribute | Detail | Tier |
|---|---|---|
| What it is | The ACM's (Autoriteit Consument & Markt) **consumer information & guidance portal** — "praktisch advies voor consumenten" | `[settled — consument.acm.nl, verified 2026-11-18]` |
| What it offers | Rights information across 16+ topics; **voorbeeldbrieven** (template complaint letters); a "meld een probleem met een bedrijf" reporting mechanism; contact for unanswered questions | `[settled — consument.acm.nl, verified 2026-11-18]` |
| What it is NOT | **Not a binding dispute-resolution body**; it does not arbitrate or decide individual disputes. Reports feed the ACM's market supervision, not a per-consumer ruling | `[settled — consument.acm.nl, verified 2026-11-18]` |
| Cost | Free to consumers | `[settled — consument.acm.nl, verified 2026-11-18]` |
| URL | Cite **`consument.acm.nl`** (or "ACM ConsuWijzer"); avoid relying on the legacy `consuwijzer.nl` host in new copy | `[settled — observed 301, verified 2026-11-18]` |

### 3.1 Correct framing in a ToS

> "For information about your consumer rights you can consult **ACM ConsuWijzer** (`consument.acm.nl`), the consumer-information service of the Netherlands Authority for Consumers and Markets."

Do **not** write "submit your dispute to ConsuWijzer" or imply it issues decisions — that is R4 violation.

---

## 4. ADR-Nederland (umbrella) and ECC-Net

| Body | Role | Tier |
|---|---|---|
| **ADR-Nederland** | Umbrella collaboration of Dutch ADR entities; useful as background context, not as the *named* route for a specific app dispute | `[verify]` — named in harvested notes as the umbrella; not re-fetched this run |
| **ECC Nederland / ECC-Net** | European Consumer Centre network — for **cross-border** EU consumer disputes (e.g., an EU consumer vs. a trader in another member state). Still operational post-ODR; was the ODR national contact point | `[settled — ECC Nederland, verified 2026-11-18]` |

---

## 5. Model dispute-resolution clause for an UNAFFILIATED eenmanszaak (the example app's case)

Use this when the publisher has not joined any geschillencommissie (the expected default). EN + NL outline:

**EN:**
> **Complaints & disputes.** If you have a complaint, contact us first at `[support email]`; we aim to respond within `[14]` days. For free information about your consumer rights, see ACM ConsuWijzer (`consument.acm.nl`). For cross-border EU disputes you may contact the European Consumer Centre (ECC Netherlands). If we cannot resolve the matter, you remain entitled to bring the dispute before the competent court. These Terms are governed by Dutch law; mandatory consumer-protection rights of your country of residence are unaffected.

**NL (outline):**
> **Klachten en geschillen.** Neem bij een klacht eerst contact met ons op via `[support e-mail]`; wij streven naar een reactie binnen `[14]` dagen. Voor informatie over uw consumentenrechten kunt u terecht bij ACM ConsuWijzer (`consument.acm.nl`). Voor grensoverschrijdende EU-geschillen kunt u contact opnemen met het Europees Consumenten Centrum (ECC Nederland). Komen we er samen niet uit, dan kunt u het geschil voorleggen aan de bevoegde rechter. Op deze voorwaarden is Nederlands recht van toepassing; dwingendrechtelijke consumentenbescherming van uw woonland blijft van kracht.

**Checklist for this clause:**
- [ ] No reference to the dead EU ODR platform (R1)
- [ ] De Geschillencommissie named **only** if actually affiliated (R2)
- [ ] ConsuWijzer described as guidance, not arbitration (R4)
- [ ] Right to the competent court preserved (R6)
- [ ] Internal-complaints step + response window present
- [ ] EN and NL versions consistent

---

## 6. Interaction with the Apple/Google merchant-of-record reality

When an app's subscriptions are sold through Apple/Google as merchants of record (as in the example app, with RevenueCat as middleware), the *payment* contract for the subscription is with the store. Implications for the dispute clause:

| Point | Guidance | Tier |
|---|---|---|
| Billing/refund disputes | For purchase, billing, and refund issues, the consumer's first recourse is often **Apple/Google** (the store handles the transaction and refunds). The ToS should signpost this without disclaiming the publisher's own statutory duties for the *service*. | `[verify]` |
| Publisher still a trader | The publisher may remain a trader of the *app/service* for consumer-law purposes even though the store contracts in its own name and collects payment; if so, the dispute/complaints clause above still applies to service quality, account, data, and conformity (DCD 2019/770) matters. See `crd-withdrawal.md` §8.3 and R8: whether the publisher is a co-trader for store-billed sales is open. | `[low-confidence — LEGAL REVIEW REQUIRED]` |
| Don't double-promise | Avoid implying the publisher will process refunds it cannot (store-controlled) **or** that the store handles service complaints it won't. Keep the two lanes distinct. | `[low-confidence]` |

---

## 7. Findings catalogue (what to emit during a review)

| Finding ID | Trigger | Severity | Fix |
|---|---|---|---|
| ADR-ODR-DEAD | ToS links/mentions EU ODR platform (`ec.europa.eu/consumers/odr` or equivalents) | **High** (factually wrong since 19 Jul 2025) | Remove; replace with §5 model clause |
| ADR-FALSE-BINDING | ToS promises binding ADR / De Geschillencommissie but publisher is not affiliated | **High** (unenforceable promise / misleading) | Remove the binding-ADR promise; use §5; or affiliate first |
| ADR-CONSUWIJZER-MISLABEL | ConsuWijzer described as deciding/arbitrating disputes | **Medium** | Re-describe as ACM consumer-information/guidance portal |
| ADR-LEGACY-URL | New copy hard-links `consuwijzer.nl` instead of `consument.acm.nl` | **Low** | Update to `consument.acm.nl` |
| ADR-NO-COURT | Court route excluded or gated behind mandatory ADR | **High** | Restore unconditional right to competent court |
| ADR-NO-INTERNAL | No internal-complaints contact / response window | **Low/Medium** | Add publisher complaints contact + timeframe |
| ADR-EN-NL-MISMATCH | EN and NL dispute clauses diverge | **Medium** | Reconcile both versions |

---

## 8. Open items for human / jurist confirmation

These are the propositions left below `[settled]` — a reviewer should pin them:

1. ~~Exact repealing instrument for Regulation (EU) 524/2013.~~ Resolved 2026-11-18: Regulation (EU) 2024/3228, Art. 1 (see §1.1).
2. **De Geschillencommissie klachtengeld figures.** The fee *exists* and is per-commission, but the commonly-cited **EUR 27.50–340** range was not visible on the pages fetched; confirm against the specific commission's reglement (and confirm whether any commission even fits a digital-subscription app). `[verify]`
3. **ADR-Nederland** as the umbrella name/role — from harvested notes, not re-fetched this run. `[verify]`
4. **ADR Directive 2013/11/EU voluntariness / no-mandatory-ADR principle** (R6) — substance correct, pin the article. `[verify-pinpoint]`
5. **Merchant-of-record allocation of refund vs. service complaints** between store and publisher — fact/contract-specific; confirm against current Apple/Google paid-apps agreements. `[low-confidence]`

---

### Primary sources (first fetched 2026-06-06, re-verified 2026-11-18)
- ECC Nederland — "ODR platform shut down 19 July 2025": `https://www.eccnederland.nl/en/news/odr-platform-shut-down-19-july-2025`; cross-border role: `https://www.eccnederland.nl/en/check-your-rights/getting-justice-eu/what-can-i-do-if-ecc-netherlands-cannot-help-me`
- European Commission: `https://ec.europa.eu/consumers/odr/` now redirects to `https://consumer-redress.ec.europa.eu/site-relocation_en` (platform closed)
- Directive (EU) 2025/2647 (CELEX 32025L2647), via the EU Publications Office
- De Geschillencommissie (SGC): `https://www.degeschillencommissie.nl/`, `/over-ons/commissies/`, `/klacht-indienen/aangesloten-ondernemers/`, `/klacht-indienen/kosten/`, `/ondernemers/`
- ConsuWijzer (ACM), via 301 redirect: `https://www.consuwijzer.nl/` → `https://consument.acm.nl/`; also `https://consument.acm.nl/contact`
