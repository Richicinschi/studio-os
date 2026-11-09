# Finding format

The single shape every `legal-*` skill emits. Consistency lets the orchestrator dedupe, rank, and aggregate.

```
[<skill-id>-<n>] <emoji> <one-line title>
  Location:   <doc + § / line range, or "Play Console > Data safety > <field>", or "paywall screen">
  Basis:      <citation + attribution tier>     e.g. BW 6:236(h) [settled — verified 2026-06-06]
  Issue:      <what is wrong / missing / over-claimed / contradicted by code>
  Redline:    <concrete fix; exact replacement text in quotes where possible>
  Confidence: high | medium | low
```

`skill-id` examples: `PP` (privacy-review), `TNL` (terms-review-nl), `WDL` (withdrawal), `GDPR`, `COOK` (analytics-consent), `HLT` (health-claims), `APL` (apple-gate), `PLY` (play-gate), `XST` (cross-store), `SCAN` (data-surface), `FLOW` (flow-grader), `DRAFT`, `REG`.

## Quality bar for redlines

- **Specific, not generic.** ✅ "Add to §6: 'You expressly request that we begin providing the subscription immediately and acknowledge you thereby lose your 14-day right of withdrawal once it is fully performed.'" ❌ "Improve the withdrawal section."
- **Entity-named.** ✅ "RevenueCat receives the purchase token and app user ID." ❌ "We share data with third parties."
- **Cite the provision that forces the fix**, at pin-point granularity.
- **Prefer the smallest change** that cures the defect; don't rewrite a sound clause.

## Worked examples

```
[COOK-1] 🟠 Analytics relies on legitimate interest + opt-out; NL requires opt-in
  Location:   privacy.md §3.1 / §9; Settings "Data & privacy" toggle
  Basis:      ePrivacy Art. 5(3) + Telecommunicatiewet 11.7a (fails condition (4): data shared
              with Google) + AP GA4 position [settled — verified 2026-06-06]
  Issue:      Firebase Analytics/Crashlytics read/write device storage; in NL that needs PRIOR
              opt-in consent, not opt-out. 6(1)(f) does not cure the Art. 5(3) device-access gate.
  Redline:    Gate Firebase init behind a first-run consent screen (setAnalyticsCollectionEnabled
              (false) at boot until consent); reword §3.1/§9 from "legitimate interest, you may
              opt out" to "with your consent, which you can withdraw at any time."
  Confidence: high
```

```
[TNL-1] 🔴 Consumer indemnity of the publisher is void against an NL consumer
  Location:   terms.md §15 (Indemnification)
  Basis:      BW 6:236(h) [settled — verify-pinpoint lettering]
  Issue:      A clause making the consumer indemnify the trader for third-party damage beyond
              their legal obligation is on the black list — automatically void.
  Redline:    Limit indemnity to the consumer's own unlawful/infringing use, or remove for
              consumers; keep only the carve-outs allowed by mandatory law.
  Confidence: high
```
