# EU-safe clause library — drop-in replacements for an NL/EU consumer app ToS

Re-authored from primary law (BW 6:233/6:236/6:237, Dir. 93/13/EEC, CRD 2011/83, DCD 2019/770,
BW 6:248) plus two donor patterns: the **miketromba** savings clauses (MIT — adapted and changed;
licence notice after §2a) and the **nisrulz** enforceable-cap *retain-list* structure (AGPL — pattern re-authored,
no text copied). The aggressive US liability/indemnity/arbitration shapes in **ai-legal-claude**
(no licence) and miketromba's protective-clauses were used **only as a red-flag list of what to
strip**, never as donor text.

**How to use.** When the ToS-scan emits a 🔴/🟠 on a clause, paste the matching replacement below
into the Redline, entity-named and tailored to the app's facts (the fact sheet). The wording below
is written for the example app in `legal-guardrails.md` §8 — Apple/Google as merchants of record,
RevenueCat middleware, Firebase EU backend — so swap in the app's own sellers and processors, and
`<app name>` / `<publisher>` for the names. Each replacement carries its basis + tier. The
**liability-cap reasonableness is `[low-confidence]`** — propose it, but reserve the final
"is this cap reasonable" call for a Dutch advocaat.

---

## 1. Liability cap with the mandatory carve-outs (replaces a 6:237(f) hit)

A cap is **presumed unfair** under 6:237(f), not void — the trader must justify it. A bare "we
exclude all liability to the maximum extent permitted by law" is presumed unfair and likely
unenforceable against an NL consumer; rewrite to a modest, proportional cap **with** the
carve-outs intent/gross-negligence + death/personal-injury + statutory consumer remedies (a cap
that purported to cover those is independently void under BW 6:248 / public policy and the 93/13
Annex).

> **Limitation of liability.** Nothing in these Terms limits or excludes our liability for: (a)
> death or personal injury caused by our negligence; (b) **intent (opzet) or gross negligence
> (bewuste roekeloosheid)**; (c) fraud or fraudulent misrepresentation; (d) your statutory
> consumer-conformity rights for digital content and services; or (e) any other liability that
> cannot lawfully be limited or excluded. **Subject to the above**, and to the extent permitted by
> mandatory law, our total liability for direct damages arising out of or in connection with the
> subscription is limited to the **fees you actually paid us (via Apple or Google) for the
> subscription in the twelve (12) months** before the event giving rise to the claim.

- Basis: BW 6:237(f) `[settled — verified 2026-06-06]`; carve-outs BW 6:248 + Dir. 93/13 Annex 1(a)
  + DCD 2019/770 conformity non-waiver `[verify-pinpoint]`. Reasonableness of the 12-month figure
  for a low-priced app: **`[low-confidence]` — jurist to confirm.**
- Carve-out retain-list shape re-authored from the nisrulz `tnc` pattern (AGPL — not copied).
- Note the merchant-of-record nuance: when the app sells through the stores, the consumer pays
  **Apple/Google**, not the publisher directly; phrase the cap by reference to "fees you paid (via
  Apple or Google)" rather than implying the publisher is the payment counterparty.

---

## 2. Mandatory-consumer-law savings clause (always include; cures over-broad disclaimers)

The single most useful EU hedge. Insert near the disclaimer/limitation block and again in the
governing-law clause. **Adapted from miketromba/skills (MIT) and changed** — licence notice after §2a.

> **Your statutory rights.** Nothing in these Terms shall limit or exclude any rights you may have
> under applicable consumer-protection law that cannot lawfully be limited or excluded. Where any
> provision of these Terms conflicts with a mandatory consumer right, that mandatory right prevails.

- Basis: BW 6:233/6:236/6:237 are mandatory consumer law applied `ambtshalve`; Rome I Art. 6 keeps
  the consumer's habitual-residence protections despite a choice of Dutch law `[verify-pinpoint]`.
- Pair it with the severability clause below so a struck term does not collapse the contract.

## 2a. Severability (replaces a "whole agreement falls" or absent clause)

> **Severability.** If any provision of these Terms is found unenforceable or invalid, that
> provision will be limited or removed to the minimum extent necessary, and the remaining Terms
> stay in full force and effect.

- Basis: standard; BW 6:233 voidability is per-clause, not whole-contract. Adapted from
  miketromba/skills (MIT) and changed — licence notice below.

### Licence notice for §2 and §2a

The clauses in §2 and §2a are adapted from the "Consumer Rights Acknowledgment" and "Severability
with Reformation" clauses in `skills/legal-tos-privacy/references/compliance-checklist.md` of
[miketromba/skills](https://github.com/miketromba/skills), under the MIT licence, and changed: both
were reworded and given a heading, §2 gained a sentence that lets a mandatory consumer right prevail,
and §2a was shortened. The other clauses in this file are not taken from that source. Its copyright
line and permission notice:

```text
MIT License

Copyright (c) 2026 Michael Tromba

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 3. Dispute-resolution / ADR clause (replaces forum 6:236(m), arbitration 6:236(n), dead EU-ODR)

Three hits this cures: a foreign/seat forum (6:236(m), void), mandatory arbitration or binding
advice that ousts the court (6:236(n), void), and any link to the **dead EU ODR platform**
(`ec.europa.eu/consumers/odr` — shut down 19/20 Jul 2025, must be removed). Do **not** name
De Geschillencommissie as the route unless the publisher has actually affiliated (ask; an
unaffiliated sole trader, like the example app's publisher, has not). Describe
ConsuWijzer as guidance, never as a body that decides disputes.

> **Complaints and disputes.** If you have a complaint, contact us first at `[support email]`; we
> aim to respond within `[14]` days. For free information about your consumer rights you can consult
> **ACM ConsuWijzer** (`consument.acm.nl`), the consumer-information service of the Netherlands
> Authority for Consumers and Markets (ConsuWijzer provides information; it does not decide
> disputes). For cross-border EU disputes you may contact the **European Consumer Centre (ECC
> Netherlands)**. If we cannot resolve the matter, you remain entitled to bring the dispute before
> the **competent court for your place of residence**. These Terms are governed by Dutch law; the
> mandatory consumer-protection rights of your country of residence are unaffected.

- Basis: BW 6:236(m)/(n) `[settled — verified 2026-06-06]`; EU-ODR shutdown `[settled — ECC
  Nederland, verified 2026-06-06]`; ConsuWijzer = guidance not arbitration `[settled — consument.acm.nl,
  verified 2026-06-06]`; right to competent court not ousted by ADR `[verify-pinpoint — ADR Dir. 2013/11/EU]`.
- NL mirror: see `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/adr-bodies.md` §5.

---

## 4. Narrowed indemnity (replaces a consumer-indemnity 6:236(h) VOID hit)

A clause making the consumer indemnify/`vrijwaren` the trader against third-party claims **beyond
what the law requires** is on the black list — automatically void. Do not soften a broad consumer
indemnity; **narrow it to the consumer's own unlawful/infringing conduct** or delete it for
consumers. The "you hold us harmless for all claims" pattern from US templates is void here.

> **Indemnity.** To the extent permitted by mandatory law, you are responsible for loss we suffer
> that is caused by **your own unlawful use of the app or your breach of these Terms** (for example,
> infringing a third party's rights through content you submit). This does not require you to
> indemnify us beyond your liability under the applicable law, and it does not affect your statutory
> consumer rights.

- Basis: BW 6:236(h) `[settled — verified 2026-06-06]`. Do not name the consumer as indemnitor of
  third-party claims generally.

---

## 5. Auto-renewal / cancellation clause (replaces 6:236(j)/(o)/(r-s) and stricter-form 6:237(m))

The Wet van Dam regime: after the initial term a tacitly-renewing subscription must be terminable
**at any time with notice ≤ 1 month**, cancellation **as easy as sign-up**, and a free trial must
not trap the consumer into a rolling paid term without an easy opt-out. For an app sold through
the stores the cancel route is **store-native** (Apple/Google manage subscription) — that already
meets "easy cancel"; the ToS must point there and **not** impose any harder publisher-side step (a registered-letter or
longer-notice requirement is void/presumed-unfair).

> **Auto-renewal and cancellation.** Your subscription renews automatically at the end of each
> period unless you cancel. You can cancel at any time, with no more than one month's notice, **in
> your Apple App Store or Google Play account** (Settings › your name › Subscriptions on iOS;
> Play Store › Payments & subscriptions on Android) — cancellation is as easy as subscribing and
> requires no special form. If you cancel during a free trial before it ends, you will not be
> charged. After cancellation you keep Pro access until the end of the paid period already started.

- Basis: BW 6:236(j)/(o), trial-trap (r/s) `[settled letters j/o; verify-pinpoint r/s — verified
  2026-06-06]`; stricter-form 6:237(m) `[settled]`. Store-native cancel meets "easy cancellation"
  `[verify]`. Cross-ref `bw-unfair-terms.md` §5.

## 5a. Unilateral-change clause (replaces an unfettered 6:237(c)/(b) "we may change anything" hit)

> **Changes to the service.** We may improve, change, or discontinue features over time. For a
> **material change that significantly reduces the Pro features you have paid for**, we will give
> reasonable prior notice and you may cancel and receive a **pro-rata refund of the unused paid
> period**. We will not exercise unfettered discretion over the core functionality you subscribed
> to.

- Basis: BW 6:237(c) (also (b)) `[settled — verified 2026-06-06]`. The wellness/health disclaimer
  is separate and legitimate — do not conflate it with disclaiming the core paid feature.

---

## Donor attribution

- **miketromba/skills — legal-tos-privacy** (MIT, © 2026 Michael Tromba): the savings clause (§2)
  and severability clause (§2a) are adapted from its consumer-rights and severability clauses and
  changed; the copyright line and MIT permission notice are reproduced after §2a.
- **nisrulz/app-privacy-policy-generator** (AGPLv3, © 2017 Nishant Srivastava): the §1
  carve-out **retain-list structure** was re-authored from its `tnc` pattern; **no text copied**.
- **simota/agent-skills** (MIT): the EU enforceability table (liability-cap floor: cannot exclude
  death/personal-injury/gross-negligence/intent; B2C choice-of-law via Rome I Art. 6) informed §1
  and §3; structure adapted, not lifted verbatim.
- **zubair-trabzada/ai-legal-claude** (no licence): its US clause library was used **only** as a
  red-flag list of terms to strip for EU consumers; **no text copied**.
