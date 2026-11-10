# DSA Trader Status — App-Store Traceability Obligation (Reference)

**Scope of this file.** How the EU Digital Services Act (DSA) trader-traceability rules bind a commercial app publisher distributed through Apple's App Store and Google Play, and how a reviewer signs off that the app under review satisfies them (worked example: the example app in `legal-guardrails.md` §8, a Dutch *eenmanszaak*, EU/NL-first). The legal duty in the DSA falls on the *store* (the online platform), but its practical effect is a hard precondition on the *publisher*: register correct trader contact details in both consoles, and make them match the Privacy Policy / Terms "who we are / contact" block and the KvK record.

**Citation tiers** (see suite convention):
`[settled — <source>, verified 2026-06-06]` confirmed against a primary/quasi-primary source fetched this run · `[verify]` believed correct, unconfirmed this run · `[verify-pinpoint]` right substance, exact pin still to confirm · `[low-confidence]` novel/contested/fact-specific.

---

## 1. The instrument

| Item | Value | Tier |
|---|---|---|
| Name | Digital Services Act (DSA) | [settled — digital-strategy.ec.europa.eu, verified 2026-06-06] |
| Regulation number | Regulation (EU) **2022/2065** | [settled — EUR-Lex eli/reg/2022/2065, verified 2026-06-06] |
| OJ publication | OJ L 277/1, **27.10.2022** | [settled — EUR-Lex, verified 2026-06-06] |
| Entry into force | **16 November 2022** | [settled — search corroboration, verified 2026-06-06] |
| Full application (all providers) | **17 February 2024** | [settled — search corroboration, verified 2026-06-06] |
| Directly effective? | Yes — a Regulation, no NL transposition needed; applies uniformly across the EU/EEA | [verify] |
| NL enforcement authority (Digital Services Coordinator) | **ACM** (Autoriteit Consument & Markt) | [verify-pinpoint] |

The DSA expressly lists **app stores** among covered online platforms (alongside marketplaces, social networks, travel/accommodation platforms, search engines). `[settled — digital-strategy.ec.europa.eu, verified 2026-06-06]`

---

## 2. Who is a "trader" — does the app's publisher qualify? (YES for any monetised app, including the example app)

**Art. 3, point (f) — "trader"**: *"any natural person, or any legal person irrespective of whether it is privately or publicly owned, who is acting, including through any person acting in his or her name or on his or her behalf, for purposes relating to his or her trade, business, craft or profession."* `[settled — eu-digital-services-act.com Art.3 + search, verified 2026-06-06]`

**Art. 3, point (e/c) — "consumer"**: a natural person acting *outside* his/her trade, business, craft or profession. `[settled — eu-digital-services-act.com Art.3, verified 2026-06-06]` (Note: the consumer definition is at point **(e)** in the enacted DSA numbering; some mirrors show (c) — pin the letter if quoted verbatim. `[verify-pinpoint]`)

**Art. 3, point (i) — "online platform"**: a hosting service that, at the request of a recipient, **stores and disseminates information to the public** (subject to the de-minimis carve-out). An app store meets this. `[settled — eu-digital-services-act.com Art.3, verified 2026-06-06]`

**Art. 3, point (l) — "distance contract"**: as defined in Art. 2(7) of Directive 2011/83/EU (Consumer Rights Directive). `[settled — eu-digital-services-act.com Art.3, verified 2026-06-06]`

### Application to a monetised app sold through the stores (worked: the example app)
A Dutch **eenmanszaak** is a *natural person acting for purposes relating to a trade/business* → squarely a **trader** under Art. 3(f). The app is commercial: it sells auto-renewing subscriptions (Pro) and is VAT-registerable. Apple's own self-assessment guidance treats exactly this profile as a trader: *"you're likely a trader if your app generates revenue (In-App Purchases, paid apps), you engage in commercial practices toward consumers, you're VAT-registered, or you develop the app in connection with your trade/business."* `[settled — developer.apple.com DSA trader help, verified 2026-06-06]`

> **The "merchant of record" point does not save you.** Apple/Google are the merchants of record for the IAP transaction, but the DSA trader duty attaches to the *publisher distributing products/services to EU consumers through the store* — not to who collects the money. The app's publisher is the trader regardless of billing intermediation (RevenueCat/Apple/Google in the example app). `[low-confidence]` (substance solid; no single fetched line states it this precisely)

**Hobbyist exception:** a non-commercial hobbyist with no monetization is *unlikely* to be a trader. Not available to an app that sells subscriptions or otherwise monetises (the example app). `[settled — developer.apple.com, verified 2026-06-06]`

---

## 3. The platform's duties (Arts. 30–32) — the substance behind the console prompts

These articles bind the **store**, but determine exactly what data the publisher must supply and what gets shown to EU consumers.

### Art. 30 — Traceability of traders ("Know Your Business Customer")
Providers of online platforms **allowing consumers to conclude distance contracts with traders** must ensure a trader can only use the platform to promote/offer products or services to EU-located consumers **if, prior to such use, the platform has obtained** the following (where applicable): `[settled — eu-digital-services-act.com Art.30 + WebSearch, verified 2026-06-06]`

| Para 1 | Information the platform must obtain | Tier |
|---|---|---|
| (a) | **Name, address, telephone number and email address** of the trader | [settled — Art.30, verified 2026-06-06] |
| (b) | A copy of the **identification document** of the trader, or other electronic identification per Art. 3 of Reg. (EU) 910/2014 (eIDAS) | [settled — Art.30, verified 2026-06-06] |
| (c) | **Payment account details** | [settled — Art.30, verified 2026-06-06] |
| (d) | Where the trader is in a **trade register or similar public register** — the register and the **registration number** (or equivalent ID). *For NL = the KvK register + KvK number.* | [settled — Art.30, verified 2026-06-06] |
| (e) | A **self-certification** by the trader committing to offer only products/services that comply with applicable EU rules | [settled — Art.30, verified 2026-06-06] |

- **Para 2 — best-efforts verification:** before allowing use, the platform must *"make best efforts to assess whether the information … is reliable and complete,"* through freely accessible **official online databases** or by requesting supporting documents from reliable sources. `[settled — Art.30(2), verified 2026-06-06]`
- **Para 3 — correction & suspension:** if information appears **inaccurate, incomplete or out of date**, the platform must request the trader remedy it *without delay*; failing remedy, the platform *"shall swiftly suspend the provision of its service"* until corrected. `[settled — Art.30(3), verified 2026-06-06]`
- **Para 5 — retention:** the platform stores the information securely for **6 months after the end of the contractual relationship**, then deletes it. `[settled — Art.30(5), verified 2026-06-06]`
- **Para 7 — public disclosure:** the platform must make **points (a), (d) and (e)** available to recipients of the service in a **clear, easily accessible and comprehensible manner** — i.e. the trader's **name, address, phone, email + register/KvK number + compliance self-certification are PUBLISHED on the store listing** to EU consumers. `[settled — Art.30(7), verified 2026-06-06]`

> Reviewer takeaway: items **(a)** and **(d)** are the ones that become **publicly visible** on the App Store product page / Play listing and therefore MUST be consistent with the Privacy Policy + Terms contact block and the KvK record. (b) and (c) are held privately by the store.

### Art. 31 — Compliance by design
*"Providers of online platforms allowing consumers to conclude distance contracts with traders shall ensure that its online interface is designed and organised in a way that enables traders to comply with their obligations regarding pre-contractual information, compliance and product safety information under applicable Union law."* `[settled — eu-digital-services-act.com Art.31, verified 2026-06-06]` This is why App Store Connect / Play Console expose the trader-info fields at all — it is the store discharging Art. 31.

### Art. 32 — Right to information
Where a platform becomes aware that an **illegal product/service** was offered, it must inform affected consumers of the trader's identity and any means of redress. Title/substance confirmed by index; full text not fetched this run. `[verify-pinpoint]` Practical relevance to a lawful consumer app is low (no illegal product), but it underpins why accurate trader identity is mandatory.

---

## 4. Penalties (Art. 52) — why stores enforce hard

| Breach | Max fine | Tier |
|---|---|---|
| Non-compliance with DSA obligations | **6 % of annual worldwide turnover** of the provider | [settled — eu-digital-services-act.com Art.52, verified 2026-06-06] |
| Supplying incorrect/incomplete/misleading info, or failing to reply/correct/submit to inspection | **1 % of annual income or worldwide turnover** | [settled — Art.52, verified 2026-06-06] |
| Ongoing non-compliance (periodic penalty payment) | **5 % of average daily worldwide turnover** per day, until compliance | [settled — Art.52, verified 2026-06-06] |

Real-world signal: the Commission fined **Temu €200 million** for a DSA breach (illustrates active enforcement, not a trader-traceability case). `[settled — digital-strategy.ec.europa.eu news, verified 2026-06-06]` Penalties land on the *platform*; the platform pushes the duty downstream to the trader via mandatory registration + suspension power (Art. 30(3)). That is why a non-registered trader gets **removed / de-listed**, not fined directly.

---

## 5. How the two stores actually enforce it

### Apple — App Store Connect (the strict one)
- Developer must **self-declare trader status**; once declared a trader, must provide **email, phone, address** (org address auto-pulled from the **D-U-N-S Number**), **payment account details**, and an **EU-compliance self-certification**; identity verified via 2FA on email + phone plus **document upload** (business records). `[settled — developer.apple.com DSA trader help, verified 2026-06-06]`
- Apple **publishes the trader contact information on the App Store product page** in all 27 EU territories once verified. `[settled — developer.apple.com, verified 2026-06-06]`
- **Removal enforcement:** Apple **removed apps without designated trader status from the EU storefronts** — the publicly reported deadline was **17 February 2025** (one year after full DSA application). Apps with no trader info are not distributed in the EU. `[verify]` (the help page wording fetched this run says trader disclosure is required "to stay compliant across territories when distributing on the App Store" and is requested on new submissions — it did not state the Feb-2025 removal date verbatim; the removal action is well-reported but pin the exact date/scope `[verify-pinpoint]`)

### Google — Play Console
- Play requires developers to declare an **account type** and, for apps that need it, provide a **verified developer name + physical address + contact details (email/phone)** that are shown on the store listing; commercial/trader status drives DSA trader-info display. `[verify]`
- **Enforcement style:** Google has enforced primarily through **discoverability/eligibility limits and listing restrictions** for accounts that have not completed required verification, rather than a single hard cut-off date. Outcome for an unverified trader = reduced visibility / blocked EU distribution. `[verify]` / `[low-confidence]` (harvested notes assert this; not confirmed against a Play primary source this run)

> The two consoles use different mechanics (Apple = removal; Google = discoverability/verification gating) but the *legal driver is identical*: DSA Art. 30 traceability.

---

## 6. Sign-off rule for the legal review (the operative checklist)

A reviewer adjudicating the app's PP/ToS sign-off should treat DSA trader status as a **prerequisite gate**, not a clause to draft. Confirm ALL of the following:

1. **Both consoles registered as TRADER.**
   - [ ] App Store Connect: trader status declared = *trader*; email, phone, address, payment account, EU self-certification submitted and **verified**.
   - [ ] Play Console: developer/account verified with trader-grade name, physical address, contact details.
2. **Contact details are KvK-consistent.**
   - [ ] Console name = registered KvK trade name (`<publisher>`, exactly as in the trade register).
   - [ ] Console address = the **registered KvK address** (`[REGISTERED ADDRESS]`).
   - [ ] Trade-register field (Art. 30(1)(d)) = **KvK** + the **KvK number** (`[KVK]`).
   - [ ] (VAT/`[BTW]` is not a DSA Art. 30 field, but consistency with the same identity is expected, and supports the Apple "VAT-registered ⇒ trader" self-assessment.)
3. **Cross-document match (the critical legal-review check).** The publicly displayed trader block (Art. 30(7): name + address + register no.) MUST match, character-for-character on the load-bearing fields:
   - [ ] Privacy Policy "Who we are / Data controller / Contact" section.
   - [ ] Terms of Service "Who we are / Contact / Provider identity" section.
   - [ ] Apple App Store product-page trader block.
   - [ ] Play Console store-listing developer block.
   - [ ] (and the same identity used for the GDPR controller designation — the eenmanszaak owner is the sole data controller).
4. **Phone + email are real and monitored** (Art. 30 requires them; they become public, and consumer-law / GDPR contactability piggy-backs on them).
5. **No drift** between the displayed trader email and the legal-docs contact email (`<contact email>`, and any sending address on the same domain) — flag if the store shows a different address than the PP/ToS.

### Dependency flag (BLOCKING)
> Items 2–3 cannot be completed until the publisher's **KvK registration** (or its own trade-register entry) exists; ask whether it does. The placeholders **`[KVK]` / `[BTW]` / `[REGISTERED ADDRESS]`** in the Privacy Policy / Terms are the *same* values that must populate the App Store Connect + Play Console trader blocks. Therefore DSA trader sign-off is **gated on the KvK fill** and must be marked **OPEN / BLOCKED** until: (a) KvK number issued, (b) both consoles registered + verified as trader, (c) the four documents reconciled. Until then the correct sign-off verdict is **CANNOT PASS — admin prerequisite outstanding**, not a documentary defect to fix in the clause text.

---

## 7. Common findings the reviewer should raise

| Finding | Severity | Why |
|---|---|---|
| Trader status not declared in App Store Connect | 🔴 Critical | App removed from EU App Store (Art. 30 via Apple enforcement) |
| Play developer account unverified for trader info | 🔴 Critical | EU discoverability/distribution loss |
| Console address ≠ KvK registered address | 🟠 High | Art. 30(7) public info inaccurate → Art. 30(3) suspension risk; PP/ToS controller mismatch |
| KvK number absent or wrong in trade-register field | 🟠 High | Art. 30(1)(d)/(7) breach |
| Store trader email ≠ PP/ToS contact email | 🟡 Medium | Cross-doc inconsistency; undermines GDPR/consumer contactability |
| `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` still placeholder in PP/ToS | 🟡 Medium (🔴 at submission) | Cannot verify Art. 30 consistency; blocks final sign-off |
| Trader info present but stale after a move/rename | 🟡 Medium | Art. 30(3) "without delay" correction duty; can trigger suspension |

---

## 8. Scope boundaries / what this file does NOT decide

- Whether the DSA's **distance-contract** framing perfectly fits an app sold via store IAP (merchant-of-record nuance) — substance is that the publisher is a trader regardless; the precise contractual mapping is `[low-confidence]` and is a Dutch-jurist question if challenged.
- **Google Play's exact enforcement mechanics and any hard deadline** — `[verify]`; confirm against a current Play Console / Play policy primary source before relying on specifics.
- **Apple's exact EU-removal deadline (reported 17 Feb 2025) and current re-listing path** — `[verify-pinpoint]`.
- The DSA trader duty is **separate from and additional to**: GDPR Art. 13/14 controller-identity disclosure, Consumer Rights Directive Art. 6 pre-contractual identity, and BW 6:230m (NL CRD transposition) trader-identity duties. Trader contact data should be the *same identity* across all of them, but each has its own legal basis — do not conflate them in the write-up.

---

## Primary sources fetched this run (2026-06-06)
- EU Commission DSA package overview — https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package
- EUR-Lex, Regulation (EU) 2022/2065 — https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng
- DSA Art. 30 (Traceability of traders), Art. 31 (Compliance by design), Art. 3 (Definitions), Art. 52 (Penalties) — eu-digital-services-act.com mirror + WebSearch corroboration
- Apple, "Manage EU DSA trader requirements" — https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/
