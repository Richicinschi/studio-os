# Disclosure grading (flow-to-policy reconciliation)

The rubric for checking what a Privacy Policy *says* against what the app *actually does*. Methodology re-implemented (not copied) from the PoliCheck / PolicyLint / PoliGraph research line — the value is the **5-category, entity-aware** grading, applied by an LLM rather than their dated pretrained models.

## The unit of analysis: a flow

A flow is a tuple: **(data-type, recipient-entity, on/off-device)**. Produced by `legal-data-surface-scan` from the code, and asserted (or not) by the Privacy Policy. Examples:
- `(purchase token, RevenueCat, off-device)`
- `(crash log, Google/Firebase Crashlytics, off-device)`
- `(reminder time, —, on-device only)`
- `(session metadata, Google/Firebase Firestore [free tier: local only], depends)`

## The 5 grades (per flow)

| Grade | Meaning | Typical severity |
|---|---|---|
| **clear** | Policy discloses this exact (data-type, entity) flow | 🟢 |
| **vague** | Policy mentions the data-type or "third parties" but not the named entity | 🟡/🟠 |
| **omitted** | Code performs the flow; policy is silent | 🟠 (🔴 if sensitive) |
| **incorrect** | Policy affirmatively states the opposite of what the code does (e.g. "we never share X" while an SDK sends X) | 🔴 |
| **ambiguous** | Policy contradicts itself, or two sections disagree, on the flow | 🟠 |

## Entity-awareness (the key lesson)

"We share data with third parties" does **not** clear a flow to a *named* processor. Each recipient must be named (Apple, Google/Firebase, RevenueCat, Cloudflare). A policy that lists "service providers" generically grades **vague**, not **clear**, for every specific SDK the scanner finds. This mirrors GDPR Art. 13(1)(e) (recipients/categories) and the Play User Data policy ("the parties with which data is shared").

## Direction matters

- **Over-disclosure** (policy claims a flow the app doesn't do) → 🟡/🟠: harmless to users but erodes accuracy and can mislead the store label. Flag for tightening.
- **Under-disclosure** (app does a flow the policy hides) → 🟠/🔴: the dangerous direction, and in practice the most common finding-type.

## Output

A flow table feeding `legal-privacy-review` and `legal-cross-store`:

```
| data-type | entity | on/off | policy grade | store-label match | severity |
```

EN/NL parity: the same grading must hold for `privacy.nl.md`; a flow disclosed in EN but not NL grades **omitted** for the NL doc, because an NL reader relies on the NL text alone.
