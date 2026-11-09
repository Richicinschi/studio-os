---
name: legal-apple-gate
description: >-
  Use when checking iOS App Store submission-readiness for legal/privacy: the Apple half of
  the platform sign-off gate. Verifies App Store Review Guidelines 5.1.1(i) (privacy-policy
  link in ASC metadata + in-app), 5.1.1(v) (mandatory in-app account deletion), 5.1.2/5.1.3
  (data use, no-HealthKit-for-ads), 3.1.1/3.1.2 (IAP + auto-renewable-subscription paywall
  disclosure), 1.4.1 (no medical claims), the Minimum Licensed-Application EULA 10 clauses in
  the Terms of Service, the PrivacyInfo.xcprivacy manifest (NSPrivacyCollectedDataTypes +
  required-reason APIs), and the App Privacy "nutrition label" reconciled against the Privacy
  Policy + the manifest + Google Play Data Safety. Emits per-guideline PASS/BLOCKER/MATERIAL
  findings plus a ready App Privacy label answer set. Trigger on "App Store review", "Apple
  submission", "App Privacy label", "privacy nutrition label", "PrivacyInfo.xcprivacy",
  "5.1.1", "5.1.1(v)", "3.1.2", "Apple EULA", "Licensed Application EULA", "ITMS-91053".
metadata:
  category: legal
  author: Richicinschi (Claude-authored)
  version: 1.0.0
  domain: legal / privacy / app-store-compliance (Apple / iOS)
  jurisdiction: Apple App Store global policy, with EU/NL substantive law via legal-guardrails
---

# legal-apple-gate — iOS App Store legal/privacy submission gate

Operates under `legal-guardrails` — load its constitution + the references listed below.

This is the **Apple half** of the platform gate (its sibling `legal-play-gate` is the Android
half; `legal-cross-store` reconciles the two). It adjudicates the legal-document + privacy-label
gates Apple reviewers enforce, against the **shipped app state** — never against assumptions.

App facts are **inputs** (defaults are Breathe; override for portfolio apps #2/#3). Breathe:
Flutter breathing/mindfulness app · Dutch eenmanszaak (sole controller, no DPO) · EU/NL-first ·
auto-renewing subscriptions sold **through Apple as merchant of record** via RevenueCat + Firebase
(`europe-west`) · **no HealthKit, no ads, no tracking** · "supports / may help relax" (no medical
claims) · free tier = on-device only, Pro = Firestore sync. Live docs:
`apps/my-app/app/assets/legal/{terms,privacy}.md` (+ `.nl.md`), version 6. Manifest:
`apps/my-app/app/ios/Runner/PrivacyInfo.xcprivacy`.

## Load these references (by path, on demand — do NOT inline them)

- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/{attribution-tiering,finding-format,disclosure-grading,verdict-model}.md` — tiering, finding shape, flow-grading, verdict bands.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/apple-review-guidelines.md` — 5.1.1 / 5.1.2 / 5.1.3 / 3.1.1 / 3.1.2 / 1.4.1 gate text + Breathe verdicts.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/apple-app-privacy.md` — the 15-category label taxonomy, 4-questions-per-type, the §6 Breathe answer table, §11 verdict template.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/apple-min-eula.md` — the 10 Minimum Licensed-Application EULA terms + §2 verbatim anchors + §4 rubric.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/data-category-ontology.md` — Apple⇄Play⇄GDPR crosswalk (map by *meaning*, never by category name).

Consumes the **iOS output of `legal-data-surface-scan`** (the actual `(data-type, recipient-entity,
on/off-device)` flows + the merged `PrivacyInfo.xcprivacy` `NSPrivacyCollectedDataTypes` from the
pods). If that scan has not run, run it (or read the manifest directly) before scoring checks 7–8 —
never score the label/manifest from memory.

## WORKFLOW (Scan → Analyze → Report → Remediate)

Eight atomic checks. Each yields a finding in the standard format (severity emoji + tier). Roll up
per `verdict-model.md`. **Severity floor:** when this skill overlaps another (e.g. `legal-cross-store`
on the label, `legal-health-claims` on 1.4.1), take the higher severity.

1. **Scan.** Gather inputs: ASC "Privacy Policy URL" metadata field (owner-confirmed or noted as
   unconfirmed); in-app `/legal/privacy` route reachability; the live `terms.md` (esp. §25) +
   `privacy.md`; `PrivacyInfo.xcprivacy`; the `legal-data-surface-scan` iOS flow list; the paywall
   screen disclosures + EULA/PP links; the declared App Privacy answers (or derive them).
2. **Analyze.** Run checks A1–A8 (below) against the references. Grade each label/manifest flow with
   the `disclosure-grading.md` 5-category scale (clear / vague / omitted / incorrect / ambiguous);
   `omitted`/`incorrect` = FAIL.
3. **Report.** Emit findings ranked 🔴 → 🟠 → 🟡, a per-guideline PASS/BLOCKER/MATERIAL line, the
   filled App Privacy label answer set (use `legal-apple-gate/assets/app-privacy-label-template.md`), and the
   §11 verdict-template checklist. Surface any "question not in my checklist" as a 🟡 note
   ("no silent supplement").
4. **Remediate.** Each 🟠 → a conditions-table row `Condition | Owner (owner / code / jurist) | Sev | Basis`.
   Owner = "jurist" only for the §5 carve-outs (the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills,
   native-NL idiom, `[low-confidence]` items).

## The eight atomic checks

| ID | Guideline / gate | What must hold | Default verdict | Fail severity |
|---|---|---|---|---|
| **A1** | 5.1.1(i) — PP link & content | PP link in **ASC metadata field** AND in-app, **both reachable**; PP enumerates *all* data collected, uses, retention/deletion, consent-revocation, and **names** every processor (Firebase/Google, RevenueCat, Apple) with the **equal-protection** assurance (5.1.1(i)(2)). | PASS if PP code-faithful + ASC field set | 🔴 missing link / false inventory · 🟠 generic "third parties" |
| **A2** | 5.1.1(v) — account deletion | **In-app** account deletion exists (deactivation/suspension ≠ deletion). | PASS — type-`DELETE` soft-delete → 30-day grace → `purgeExpiredDeletions` hard purge | 🔴 if missing or deactivation-only |
| **A3** | 5.1.2 / 5.1.3 — data use | No undisclosed sharing; no third-party AI (project rule = none); health-context data not used for ads/marketing/mining; no health data in iCloud; no ATT unless a real cross-app tracking SDK exists. | N/A-PASS — no HealthKit, no ads, no tracking | 🔴 affirmative false data statement · 🟠 undisclosed flow |
| **A4** | 3.1.1 / 3.1.2 — IAP + subscription disclosure | Pro unlocks **only** via Apple IAP (RevenueCat = StoreKit middleware, not a bypass); paywall discloses all **six**: (1) title, (2) period length, (3) price/period, (4) content per period, (5) auto-renew terms, (6) **functional EULA + PP links**; trial duration + post-trial price if a trial is offered; ToS routes cancellation/refunds to the **Store** (merchant of record). | VERIFY — confirm all six on the paywall | 🔴 IAP bypass · 🟠 missing disclosure item / link |
| **A5** | 1.4.1 — health claims | No medical/diagnostic/treatment claims in PP/ToS/store-listing/in-app; "consult a doctor" reminder present; general-wellness framing ("supports / may help relax"). **Defer claim-text detail to `legal-health-claims`**; here, gate only the presence of the firewall + disclaimer. | PASS — breathing-only disclaimer ships | 🟠 over-claim language (escalate to health-claims) |
| **A6** | Minimum Licensed-Application EULA | ToS §25 (iOS section) contains all **10** terms (Acknowledgement·Scope·Maintenance/Support·Warranty·Product Claims·IP·Legal Compliance·Developer Name+Address·Third-Party Terms·Apple Third-Party Beneficiary) at verbatim-equivalent substance; scoped to App-Store downloads; does **not** name Apple a party/warrantor/support-provider; #8 has **real** name+registered address (no `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` placeholder). | PASS — §25 has all 10 + scoping + the "Apple not responsible" close | 🔴 missing/weakened term, Apple-adverse drafting, or #8 placeholder |
| **A7** | PrivacyInfo.xcprivacy | Manifest present + every bundled SDK ships a signed manifest (no ITMS-91053 missing-declaration / ITMS-91061 missing-signature); `NSPrivacyTracking=false` matches "no tracking"; `NSPrivacyAccessedAPITypes` declares each required-reason API with a code (e.g. `UserDefaults → CA92.1`); each `NSPrivacyCollectedDataTypes` entry's Linked/Tracking flags are **correct** vs the scan. | VERIFY against merged manifest | 🔴 submission-blocking missing/unsigned manifest · 🟠 wrong Linked/Tracking flag (see watch-list below) |
| **A8** | App Privacy label ⇄ PP ⇄ manifest ⇄ Play | Every actually-collected `(data-type, entity)` flow → matching label type (correct Linked/Tracking/purpose); affirmatively mark Health & Fitness / Sensitive Info / Location / Contacts / Device-Advertising-ID = **Not Collected**; **empty "Data Used to Track You"** + no ATT; purposes limited to **App Functionality / Analytics** (never advertising); label reconciles 3-/4-way with PP, the manifest, and Play Data Safety. | VERIFY — derive via the template + §6 table | 🔴 incorrect (false) declaration · 🟠 omitted flow or cross-artefact drift |

### A7/A8 Breathe watch-list (known discrepancies to check first)
- **Crashlytics `Linked` flag.** The shipped `PrivacyInfo.xcprivacy` declares `NSPrivacyCollectedDataTypeCrashData` with **`Linked=false`**, but the App Privacy reference (apple-app-privacy.md §6 + §10) treats Crashlytics crash data as **identity-synced = Linked** (Crashlytics UID identity sync). Reconcile: either confirm crash logs carry **no** account identifier (then Not-Linked is defensible) or flip the manifest + label to **Linked**. Grade `ambiguous`/`incorrect` until resolved. `[verify]`
- **Performance Data.** Declare `Diagnostics → Performance Data` only if Firebase Performance Monitoring actually ships (`pubspec.lock`/pods). Don't declare a flow the app doesn't perform.
- **Email vs UserID double-count.** Declare email under **Contact Info → Email Address** and the account key under **Identifiers → User ID** — not the same data twice.
- **Name.** Declare `Contact Info → Name` only if a Google-Sign-In display name is **persisted off-device**.
- **Session logs.** Pro Firestore-synced breathing logs map to **Usage Data → Product Interaction** (or User Content → Other), **never** Health & Fitness; keep PP + label + the GDPR-Art.9 section consistent (no over-declaration of health data).
- **Device/Advertising ID.** Android `AD_ID` is stripped; declare Device ID / Advertising Data = **Not Collected** to keep the "no advertising ID" claim honest.

## Common indie failure modes (adjudicator quick-scan)
- Over-declaring **Health & Fitness** because the app is "wellness" → PP↔label drift + false Art. 9 signal. Breathe = **Not Collected**.
- Forgetting **Purchases → Purchase History** (RevenueCat subscription state) or **Diagnostics → Crash** (Crashlytics).
- Marking account-bound analytics **Not Linked** when a UID ties it back → declare **Linked**.
- Declaring **Tracking** without an ATT prompt (Breathe = no tracking, no ATT — correct).
- PP says "third parties" generically → 5.1.1(i)(2) needs **named** entities + equal-protection.
- ToS §25 omits **#1** (not-a-party-with-Apple) or **#10** (Apple third-party beneficiary) — the two most-missed EULA clauses.
- #8 left as `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` → **HARD BLOCKER** (reserved for the human; cannot sign off).

## OUTPUT format

```
# legal-apple-gate — iOS submission gate: <app> (PP v<n> / ToS v<n>, manifest <path>) — <date>
Apple verdict: <SIGN-OFF | FIX-THEN-SIGN-OFF | BLOCK>

## Per-guideline summary
| Check | Guideline / gate              | Result               | Sev |
| A1    | 5.1.1(i) PP link + content    | PASS / BLOCKER / MATERIAL | 🟢/🔴/🟠 |
| A2    | 5.1.1(v) in-app deletion      | ...
| A3    | 5.1.2 / 5.1.3 data use        | ...
| A4    | 3.1.1 / 3.1.2 IAP + paywall   | ...
| A5    | 1.4.1 health claims           | ...
| A6    | Minimum EULA (10 terms)       | ...
| A7    | PrivacyInfo.xcprivacy         | ...
| A8    | App Privacy label reconcile   | ...

## Findings (ranked 🔴 → 🟠 → 🟡)
[APL-1] <emoji> <title>
  Location:   <doc §/line, ASC field, paywall screen, or PrivacyInfo.xcprivacy key>
  Basis:      <citation + tier>  e.g. App Store Review Guidelines 5.1.1(v) [settled — verified 2026-06-06]
  Issue:      <what is wrong / missing / over-claimed / contradicted by manifest>
  Redline:    <specific, entity-named fix — name Apple / Google-Firebase / RevenueCat>
  Confidence: high | medium | low
...

## App Privacy label — answer set
<the filled legal-apple-gate/assets/app-privacy-label-template.md (per-type Collected? / Linked? / Track? / Purposes)>

## §11 verdict-template checklist (PASS/FAIL per line)
<from apple-app-privacy.md §11>

## Conditions to clear (if FIX-THEN-SIGN-OFF)
| # | Condition | Owner | Sev | Basis |

## Confirmed-good (🟢) + reasoned decisions
```

Findings carry the skill-id **`APL`** (per `finding-format.md`). Always end the full sign-off run with
the `legal-guardrails` §5 authority footer; the orchestrator appends it once for the combined report.

— *de-facto counsel: this skill decides and signs the Apple gate. It reserves to a Dutch-qualified
advocaat / registration ONLY the EULA #8 `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills, native-NL
idiom of `terms.nl.md`, and any item it marks `[low-confidence]`.*
