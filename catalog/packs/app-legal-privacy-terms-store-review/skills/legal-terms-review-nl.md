---
name: legal-terms-review-nl
description: >-
  Use when reviewing, auditing, or signing off a mobile-app Terms of Service / general terms
  (algemene voorwaarden) for a Dutch or EU consumer audience. Scans every clause against the
  Dutch black list (BW 6:236, always-void) and grey list (BW 6:237, presumed-unfair) plus the
  Unfair Terms Directive 93/13/EEC backstop, emits a red/amber clause map, and proposes EU-safe
  replacement wording from a clause library. The flagship Terms reviewer in the legal-* suite.
  Trigger on "review terms", "review the ToS", "terms of service", "unfair terms", "void clause",
  "algemene voorwaarden", "zwarte lijst", "grijze lijst", "liability cap", "indemnity / vrijwaring",
  "auto-renewal", "dispute resolution / arbitration", "governing law", "consumer terms",
  "Apple EULA / Licensed Application", "withdrawal right". Works for any app (app facts are
  inputs). Reserves only the [KVK]/[BTW]/[REGISTERED ADDRESS] fills, native-NL
  legal-idiom review, and [low-confidence] calls for a Dutch advocaat.
metadata:
  category: legal
  author: Richicinschi (Claude-authored)
  version: 1.0.0
  domain: legal / consumer-terms / app-compliance
  jurisdiction: NL-primary (BW 6:233/236/237), EU (Dir. 93/13, CRD 2011/83, DCD 2019/770), Apple EULA overlay
---

# legal-terms-review-nl — the flagship ToS reviewer

Operates under **legal-guardrails** — load its constitution + the references listed below.

This skill adjudicates an app's Terms of Service against **Dutch mandatory consumer-protection law**
(BW Afdeling 6.5.3 unfair-terms regime) and the EU baseline, produces a **red/amber clause map**,
emits findings in the suite format, proposes EU-safe replacement wording, and assigns the Terms a
letter grade + verdict band. It acts as **de-facto counsel**: it decides and signs, reserving only
the §5 carve-outs for a Dutch advocaat.

## Load these (by path, on demand — do not inline their contents)

- `app-legal-privacy-terms-store-review/skills/legal-guardrails.md` — the constitution (tiers, severity, verdict, footer).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/finding-format.md` — finding shape (skill-id `TNL`).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/verdict-model.md` — band + grade aggregation.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/bw-unfair-terms.md` — **THE scanner** (6:236 black list, 6:237 grey list, the operational red/amber table §4, auto-renewal §5, liability-cap §6).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/adr-bodies.md` — dispute clause: dead EU-ODR, De Geschillencommissie affiliation rule, ConsuWijzer = guidance, court right.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/crd-withdrawal.md` — **cross-ref** for §6 (14-day right + 16(m) waiver). Don't re-adjudicate the waiver mechanics here; flag and hand to `legal-withdrawal-waiver`. Do confirm §6 *discloses* the right + model form (omission → Art. 10 12-month window).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/apple-min-eula.md` — **cross-ref** for the iOS "Licensed Application EULA" section (the 10 minimum terms). Don't re-adjudicate Apple's 10 gates here; flag the section and hand to `legal-apple-gate`. Do confirm the section exists, is iOS-scoped, and that #8 name/address is not a `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` placeholder.
- `legal-terms-review-nl/assets/eu-safe-clauses.md` (this skill) — the EU-safe replacement clause library for redlines.

## App profile (inputs — from the orchestrator's Step 0 fact sheet; run alone, read the project first and ask only for the rest)

Gather these for the person's app; the bracketed values are the example app's (`legal-guardrails.md` §8), the worked case the references use.
- Trader: the publisher's legal form and size (example: Dutch **eenmanszaak**, sole proprietor, no DPO). Consumers = `natuurlijk persoon, niet handelend in beroep/bedrijf` → **both BW lists apply in full** (the 6:235 large-party exclusion concerns the counterparty, so it is N/A for consumers).
- How it is sold (example: subscriptions **through Apple/Google as merchants of record**; **RevenueCat** middleware; **Firebase** backend — Auth, Firestore, Analytics, Crashlytics, Functions, Hosting; EU `europe-west`).
- Health stance and tiers (example: no medical claims, "supports / may help relax"; free tier on-device only, paid tier Firestore sync).
- Live docs: the Terms file(s), languages and version from the fact sheet (example: `terms.md` + `terms.nl.md`). Map the person's sections to this **example section map**, which the steps below cite: §5 subscription, §6 withdrawal, §13 disclaimers/conformity, §14 liability, §15 indemnity, §17 termination, §22 changes, §23 governing law, §24 dispute resolution, §25 Apple EULA, §26 Google Play.

## Workflow

1. **SCOPE.** Confirm B2C (consumer counterparty) + NL/EU audience → BW lists apply. Identify the
   doc + version (EN and NL), and whether the publisher has actually **affiliated** with any
   geschillencommissie (default: **no**). Note Apple/Google as merchants of record. If B2B-only or
   non-EU, say so and stop (the lists don't bite).
2. **SCAN.** Walk every clause against the **red/amber scanner** in `bw-unfair-terms.md` §4. For
   each clause classify: BLACK-LIST hit (6:236 letter) / GREY-LIST hit (6:237 letter) / 93/13
   backstop concern / OK. Check **both** EN and NL versions; a divergence is itself a finding.
   Apply the poison-pill language scan (below) and the dead-link string scan (below).
3. **ASSESS + cite.** For each hit, pin the **exact BW letter** with its attribution tier from the
   reference (most ToS-critical letters are now `[settled — verified 2026-06-06]`; the `[verify-pinpoint]`
   letters must be confirmed before they drive a hard BLOCK). Set severity: black-list = **🔴 BLOCKER**
   (void — delete/rewrite); grey-list = **🟠 MATERIAL** (presumed unfair — justify-or-soften, and for
   a low-priced consumer app the rebuttal burden rarely discharges, so default to soften);
   93/13 transparency / EN-only / minor = **🟡**.
4. **REDLINE.** For every 🔴/🟠 propose a **specific, entity-named** replacement from
   `legal-terms-review-nl/assets/eu-safe-clauses.md` (name Apple/Google as merchants of record, RevenueCat, Firebase,
   Cloudflare — never "third parties"). Prefer the smallest change that cures the defect.
5. **CROSS-REF the specialists.** Hand §6 withdrawal mechanics to `legal-withdrawal-waiver` and the
   §25 Apple-EULA 10-term gate to `legal-apple-gate`; here, only confirm those sections **exist,
   are scoped, and disclose**. Surface any "question not in my checklist" as a 🟡 (no silent supplement).
6. **MAP + GRADE.** Emit the red/amber clause map (table), the ranked findings, the verdict band
   (BLOCK if any 🔴; FIX-THEN-SIGN-OFF if any 🟠; else SIGN-OFF), and the per-doc Terms grade.
   A 🔴 resting only on `[verify-pinpoint]`/`[low-confidence]` is downgraded to a **hard condition**,
   not an outright BLOCK.

## The core checks (apply each; cite the letter)

### A. BW 6:236 ZWARTE LIJST — any hit = 🔴 VOID (delete/rewrite)

| Check | Letter | Tier |
|---|---|---|
| Consumer **indemnifies / vrijwaart** the trader for third-party claims ("hold us harmless") | 6:236(**h**) | `[settled]` |
| **Foreign / seat / "chosen domicile" forum** against an NL consumer's residence | 6:236(**m**) | `[settled]` |
| **Mandatory arbitration / binding advice / non-court** dispute resolution | 6:236(**n**) | `[settled]` |
| **Claim/limitation window < 1 year** ("claims within 6 months / 90 days") | 6:236(**g**) | `[settled]` |
| **Auto-renewal without easy cancel** / >1-month notice / hard cancel method / trial auto-traps | 6:236(**j**),(**o**),(**r/s**) | `[settled j/o; verify-pinpoint r/s]` |
| **Burden-of-proof reversal** against the consumer | 6:236(**k**) | `[settled]` |
| Price rise within 3 months **with no right to dissolve** | 6:236(**i**) | `[settled]` (usually N/A — store sets price) |
| Excludes consumer's **ontbinding** (dissolution) / **opschorting** (suspension) right | 6:236(**b**)/(**c**) | `[settled b; verify-pinpoint c]` |
| Trader may **assign its obligations** to a third party without a consumer dissolution right | 6:236(**e**) | `[verify-pinpoint]` |

### B. BW 6:237 GRIJZE LIJST — any hit = 🟠 PRESUMED UNFAIR (justify-or-soften)

| Check | Letter | Tier |
|---|---|---|
| **Liability cap / exclusion** ("limited to €X / fees paid / nil / max extent permitted") | 6:237(**f**) | `[settled]` → §1 clause |
| **"We may change / suspend / discontinue any feature at any time"** (unfettered) | 6:237(**c**) (also **b**) | `[settled]` → §5a clause |
| Service "as is", **core paid function** not guaranteed | 6:237(**b**) | `[settled]` (wellness disclaimer is SEPARATE + OK) |
| **Early-termination fee / forfeiture** of the prepaid period beyond actual loss | 6:237(**i**) | `[settled]` |
| **Forfeit rights for any minor breach** of ToS | 6:237(**h**) | `[settled]` |
| **No set-off** allowed | 6:237(**g**) | `[settled]` |
| **Initial term > 1 yr** with no post-year-one exit | 6:237(**k**) | `[settled]` |
| **Asymmetric notice** (consumer must give longer notice than trader) | 6:237(**l**) | `[settled]` |
| **Stricter-than-written form** to cancel (registered post / notarised) | 6:237(**m**) | `[settled]` (also 6:236(o)) |

### C. Liability-cap deep check (6:237(f)) — MUST carry the carve-outs

A cap is presumed unfair, not void — the trader must justify it. Flag 🟠 unless the cap is modest,
proportional, and **carves out all** of: **intent (opzet) + gross negligence (bewuste roekeloosheid)**
(capping these is independently void under BW 6:248 / public policy), **death or personal injury**
(93/13 Annex 1(a)), and **statutory consumer-conformity remedies** (DCD 2019/770). A bare "we exclude
all liability to the maximum extent permitted by law" is presumed unfair and likely unenforceable →
rewrite to the §1 clause in `legal-terms-review-nl/assets/eu-safe-clauses.md`. Mark the cap's reasonableness for a
low-priced consumer app **`[low-confidence]` — jurist to confirm**; do not let it drive a clean
SIGN-OFF on its own.

### D. Dispute / governing-law / dead-link scan

- **String-scan EN + NL + the Firebase-Hosted web ToS** for the **dead EU ODR platform**:
  `ec.europa.eu/consumers/odr`, `consumers/odr`, "ODR platform", "Online Dispute Resolution
  platform", "platform voor onlinegeschillenbeslechting". Any hit → 🟠 **must remove** (platform shut
  down 19/20 Jul 2025) `[settled — ECC Nederland, verified 2026-06-06]`.
- **De Geschillencommissie named without affiliation** → 🟠 (unenforceable/misleading promise).
- **ConsuWijzer described as deciding/arbitrating** → 🟠 (it is ACM guidance only); legacy
  `consuwijzer.nl` link in new copy → 🟡 (use `consument.acm.nl`).
- **Court route excluded or gated behind mandatory ADR** → 🔴 (also 6:236(n)).
- Replace with the §3 ADR clause in `legal-terms-review-nl/assets/eu-safe-clauses.md`.

### E. 93/13 transparency backstop

- Where a clause isn't squarely on a list, apply **Art. 3** (good-faith / significant-imbalance) and
  **Art. 5** (plain intelligible language; ambiguity read **contra proferentem**, in the consumer's
  favour). `[settled — Dir. 93/13 Arts. 3 & 5, verified 2026-06-06]`.
- **English-only ToS for an NL consumer base** → 🟠 (Art. 5 transparency; the binding consumer
  version should be **Dutch**). Note the NL version's legal idiom is a **native-NL review** item
  reserved for the advocaat.

### F. Poison-pill language scan (re-authored from ai-legal-claude — re-target to BW letters)

Flag and map each loaded phrase to the BW letter it usually signals, then adjudicate as above —
the phrase is a **signal, not a verdict**:

| Phrase | Usually signals | Map to |
|---|---|---|
| "to the fullest / maximum extent permitted by law" (on liability) | over-broad cap | 6:237(f) |
| "sole and absolute discretion" / "at our sole discretion" (over core features) | unfettered change | 6:237(c)/(b) |
| "you agree to indemnify and hold us harmless" | consumer indemnity | 6:236(h) |
| "any dispute shall be resolved by binding arbitration" | court ouster | 6:236(n) |
| "courts of [seat] shall have exclusive jurisdiction" | foreign forum | 6:236(m) |
| "claims must be brought within [<1 yr]" | short claim window | 6:236(g) |
| "as amended from time to time" / "deemed to have accepted" | unilateral change by inaction | 6:237(c) + 93/13 Art. 3 |
| "notwithstanding anything to the contrary" | hidden override | 93/13 Art. 5 (transparency) |

### G. Cross-document consistency (re-authored from simota cross-doc matrix)

- ToS ↔ Privacy ↔ paywall must not contradict (e.g. ToS says "no refunds" but §6 grants the
  withdrawal right; ToS retention silent while Privacy states a period). A contradiction is **≥ 🟠**.
- EN ↔ NL ToS must match clause-for-clause; divergence → 🟠.

## Output format

Emit, in order:

1. **Red/amber clause map** — one row per reviewed clause:
   `§ / clause | clause type | list+letter (or 93/13) | 🔴/🟠/🟡/🟢 | redline → legal-terms-review-nl/assets/eu-safe-clauses §`.
2. **Findings** (ranked 🔴 → 🟠 → 🟡), each in the suite shape (`finding-format.md`), skill-id **`TNL`**:
   ```
   [TNL-<n>] <emoji> <one-line title>
     Location:   terms.md §<n> (+ terms.nl.md §<n>)
     Basis:      BW 6:23X(<letter>) <tier>   (e.g. BW 6:236(h) [settled — verified 2026-06-06])
     Issue:      <void clause / presumed-unfair / contradiction / dead link>
     Redline:    "<exact replacement>"  (from legal-terms-review-nl/assets/eu-safe-clauses.md §<n>; entity-named)
     Confidence: high | medium | low
   ```
3. **Confirmed-good (🟢)** + reasoned decisions (e.g. "§11 wellness disclaimer is legitimate, not a
   6:237(b) core-obligation disclaimer").
4. **Verdict + grade:** band (BLOCK / FIX-THEN-SIGN-OFF / SIGN-OFF) + **Terms <letter grade>**, and
   a conditions table for every 🟠 (`Condition | Owner: owner / code / jurist | Sev | Basis`).
5. **Authority footer** verbatim from the constitution §5 — reserve only the
   `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills, native-NL legal-idiom review, and `[low-confidence]`
   items (chiefly the liability-cap reasonableness) for a Dutch advocaat.

## Hard limits (a black-list hit is non-negotiable)

No consumer indemnity (h) · no foreign forum (m) · no arbitration-only (n) · no <1-yr claim window
(g) · no auto-renewal without easy store-native cancel (j/o/r/s) · no burden-of-proof reversal (k) ·
no ousting of the consumer's court right. Any of these present → **BLOCK** until removed/rewritten.

Before final filing, re-pull `wetten.overheid.nl/BWBR0005289` art. 236 + 237 to confirm the literal
wording of any letter still flagged `[verify-pinpoint]`.
