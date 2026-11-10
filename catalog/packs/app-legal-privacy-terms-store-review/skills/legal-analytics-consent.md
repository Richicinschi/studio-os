---
name: legal-analytics-consent
description: >-
  Use when ruling whether an app's analytics/telemetry SDKs (Firebase Analytics, Crashlytics,
  Google Analytics / GA4, Remote Config) may run opt-OUT or must be gated behind PRIOR OPT-IN
  consent under the EU ePrivacy Directive Art. 5(3) and the Dutch cookiewet (Telecommunicatiewet
  Art. 11.7a). Applies the 5-condition NL analytics-exemption test + the AP's GA4 "cookie letter"
  position, rules that Art. 6(1)(f) legitimate interest does NOT cure the device-access gate, and
  checks the implementation (first-run opt-in gate vs opt-out toggle vs pre-init telemetry).
  Produces findings + Privacy-Policy redlines + the Flutter consent-gate pattern. Trigger on
  "analytics consent", "cookiewet", "ePrivacy", "Telecommunicatiewet 11.7a", "Firebase Analytics
  opt-in", "Crashlytics consent", "telemetry consent", "tracking consent", "GA4 consent",
  "legitimate interest analytics", "device storage consent", "SDK consent gate".
metadata:
  category: legal
  author: Richicinschi (Claude-authored)
  version: 1.0.0
  domain: legal / privacy / ePrivacy device-access consent / app-compliance
  jurisdiction: NL-primary (Telecommunicatiewet 11.7a), EU (ePrivacy Art. 5(3) + GDPR)
---

# legal-analytics-consent — the ePrivacy / cookiewet device-access ruling

Operates under `legal-guardrails` — load its constitution + the references listed below.

**Load before ruling** (do not reproduce — read at runtime):
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/*` (attribution-tiering, finding-format, disclosure-grading, verdict-model)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/eprivacy-cookiewet.md` ← **the decisive substantive resolution** (Art. 5(3) text, Tw 11.7a, the 5-condition test, the AP GA4 finding, why 6(1)(f) fails, the Crashlytics analysis, the required remediation)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/ap-guidance.md` ← AP §3 opt-IN position, G2 unbundling, G4 withdrawal
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/gdpr-articles.md` ← Art. 6 basis-selector (analytics = 6(1)(a), not 6(1)(f)), Art. 7 consent mechanics
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/sdk-data-map.md` ← which SDKs read/write device storage (recipients, on/off-device)

This skill governs **Gate 1 — device access** (ePrivacy Art. 5(3) → Tw 11.7a), which is logically **prior to** the GDPR lawful-basis question. Clearing the Art. 6 basis does NOT clear Art. 5(3): consent is the only lawful basis for the device read/write where the exemption fails. (`eprivacy-cookiewet.md` §1.)

**App inputs (from the orchestrator's Step 0 fact sheet; run alone, read the project first and ask only for the rest):** the SDK list (read it from the lockfile / `build.gradle`; e.g. Firebase Analytics, Crashlytics, Remote Config), default telemetry state at boot (on/off — read the init code), the consent UI (none / opt-out toggle / first-run opt-in gate), the PP wording for the analytics basis, and the store-declaration answers (Apple App Privacy / Play Data Safety). The references above work these through for the example app (`legal-guardrails.md` §8), a Firebase app that ships analytics opt-out.

---

## Workflow

1. **Enumerate the device-storage / telemetry SDKs.** From the app's `pubspec.yaml` + Android `build.gradle` (and `sdk-data-map.md`), list every SDK that stores on / reads from terminal equipment: Firebase Analytics, Crashlytics, Remote Config, any GA4 / Mixpanel / Amplitude / Sentry. Art. 5(3) is technology-neutral (EDPB Guidelines 2/2023) — it catches **SDK identifiers, install/app-instance IDs, SharedPreferences, cache**, not just browser cookies. Native ≠ exempt.

2. **Apply the Tw 11.7a 5-condition analytics-exemption test** (§3.1 below). The exemption ("geen of geringe gevolgen voor de persoonlijke levenssfeer") holds only if **ALL FIVE** pass. **Fail any one → prior opt-in consent required.**

3. **Rule per SDK.**
   - **Firebase Analytics / GA4** → **FAILS** conditions 1 and 4 (Google service; data shared with Google for Google's own purposes) per the **AP GA4 "cookie letter"** position → **PRIOR OPT-IN required in NL.** (`eprivacy-cookiewet.md` §3.2; `ap-guidance.md` §3.)
   - **Crashlytics** → cannot safely ride "strictly necessary" (third-party Google SDK; benefits the developer's diagnostics, not the user's requested service; same condition-4 sharing logic). **Recommend opt-in, same gate** `[verify / low-confidence — no AP statement specifically on Crashlytics; flag for jurist]`. (`eprivacy-cookiewet.md` §6.)
   - **Genuinely strictly-necessary (no consent):** Firebase **Auth** session, RevenueCat + store purchase/entitlement, Firestore **sync the Pro user explicitly requested**. Do not gate these. `[verify — document the per-SDK necessity analysis]`

4. **Reject the legitimate-interest escape.** If the PP / DPIA / RoPA bases Firebase Analytics or Crashlytics on **Art. 6(1)(f) legitimate interest**, flag it: Art. 5(3) is lex specialis for the device read/write and lists only two exemptions — LI is not one. A perfect LIA cannot authorise the device-storage step. (`eprivacy-cookiewet.md` §5; `gdpr-articles.md` Art. 6.)

5. **Check the implementation (often the headline finding).** Determine which of these the app ships:
   - ❌ **Telemetry initialises before any consent** (`setAnalyticsCollectionEnabled(true)` / Crashlytics handlers active at boot, or default-ON when the toggle is unset) → 🔴 **BLOCKER** (prior-consent violation, Art. 5(3)).
   - ❌ **Opt-OUT only** (collection on by default; Settings toggle to disable) → 🟠 **MATERIAL** → must become opt-in. *The most common pattern in indie apps, and the example app's.*
   - ❌ **"Legitimate interest" claimed** in PP for analytics → 🟠/🔴 (false/over-claimed basis).
   - ✅ **First-run opt-in gate** (boot OFF; affirmative, granular, no cookie wall; records `analyticsConsentAt`; easy withdrawal) → 🟢 OK.

6. **Validate the consent mechanics** (if a gate exists) against `eprivacy-cookiewet.md` §4 / `gdpr-articles.md` Art. 7: **prior** (no telemetry before the click), **affirmative** (no pre-ticked box, no "by continuing"), **freely given** (no cookie wall — declining must not block the app), **granular / unbundled** (separate from the 16+ age checkbox and the paywall withdrawal-waiver checkbox — AP G2 separate-consent-per-data-type), **reject as easy as accept** (no asymmetric buttons), **withdrawable** as easily as granted (Art. 7(3); Settings → Data & privacy), **informed** (names Google/Firebase, the events/identifiers, the purpose), and **recorded** (timestamp + wording version, Art. 7(1)).

7. **Reconcile cross-surface.** The Privacy Policy, the Apple App Privacy label, and the Google Play Data Safety form must all agree that telemetry is **consent-based / opt-in** — no drift. (`eprivacy-cookiewet.md` §7.6.)

8. **Emit findings + verdict + redlines** (output format below). Surface any consent question outside this checklist as a 🟡 "not in my checklist" note (no silent supplement).

---

## The Tw 11.7a 5-condition analytics-exemption test (§3.1)

Source of truth: `eprivacy-cookiewet.md` §3.1 (`[settled in substance — AP analytics conditions; verify-pinpoint the exact lid/onderdeel + an AP page cite — AP pages 403 to fetchers]`). All five must hold; failing one removes the exemption.

| # | Condition | Firebase / GA4 default status |
|---|---|---|
| 1 | **First-party only** (your own measurement, not a shared/third-party service) | ❌ **FAILS** — Firebase Analytics is a Google service |
| 2 | **IP anonymised / masked** before processing | Not guaranteed in default GA4/Firebase config |
| 3 | **No cross-site / cross-app tracking** | Contributes to Google's cross-property graph by default |
| 4 | **No data shared with third parties for their own purposes** | ❌ **FAILS** — Google uses the data for its own purposes |
| 5 | **Minimal privacy impact** (solely measuring quality/performance of *this* service) | Fails by consequence of 1–4 |

**Decisive AP finding:** standard **GA4 — and by extension Firebase Analytics in default config — does NOT qualify** for the exemption (fails condition 4), so it needs **prior opt-IN consent** in NL. Decision logic re-authored from the lawve-ai *politique-cookies* analytics-consent engine, **CNIL → AP** (AGPL donor: pattern only, no text). The CNIL-anchored ~6-month / max-13-month consent-record/re-ask cadence is applied EU-wide by analogy `[verify — not a hard AP-published number]`.

---

## Flutter consent-gate implementation pattern (the redline for an opt-out / pre-init app)

Boot with telemetry **OFF**; enable only after an affirmative, unbundled, no-cookie-wall consent; record the timestamp; keep an easy withdrawal in Settings. (`eprivacy-cookiewet.md` §7.)

```dart
// main.dart — BEFORE any Firebase telemetry initialises / before logging any boot event.
// Default when the stored consent is UNSET must be OFF (not ON).
final consented = prefs.getBool('analyticsConsent') ?? false;   // unset => false
await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(consented);
await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(consented);

// First-run consent prompt — granular, equal-weight Accept/Decline, declining does NOT block the app.
// Separate surface from the 16+ age checkbox and the paywall withdrawal-waiver checkbox.
Future<void> grantTelemetryConsent() async {
  await prefs.setBool('analyticsConsent', true);
  await prefs.setString('analyticsConsentAt', DateTime.now().toIso8601String()); // Art. 7(1) record
  await prefs.setString('analyticsConsentVersion', kTelemetryConsentVersion);    // wording shown
  await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(true);
  await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
}

// Settings → Data & privacy — withdrawal as easy as the grant (Art. 7(3)); prospective.
Future<void> withdrawTelemetryConsent() async {
  await prefs.setBool('analyticsConsent', false);
  await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(false);
  await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(false);
}
```

If the app already applies a persisted toggle at boot before the Crashlytics handlers (as the example app does), the fix is to make the **default-when-unset OFF** and add the **first-run gate**, not merely an opt-out toggle.

---

## Privacy-Policy redline templates

- **From** "We process analytics/crash data on the basis of our **legitimate interest**; you may **opt out** in Settings."
- **To** "We collect Firebase Analytics and Crashlytics telemetry **only with your consent** (asked on first run, off by default). The recipient is **Google (Firebase)**. You can **withdraw consent at any time** in Settings → Data & privacy, which stops future collection." (Basis = **consent, Art. 6(1)(a)** — never 6(1)(f).)
- Ensure the PP, **Apple App Privacy** label, and **Google Play Data Safety** form all state telemetry is opt-in / consent-based.

---

## Output format

Per-finding (the suite shape from `references/method/finding-format.md`; skill-id = **`COOK`**):

```
[COOK-<n>] <🔴|🟠|🟡|🟢> <one-line title>
  Location:   <doc §/line, or Settings toggle, or main.dart init, or store field>
  Basis:      <ePrivacy Art. 5(3) / Tw 11.7a (which of the 5 conditions) / AP GA4 / GDPR Art. 6–7> [tier]
  Issue:      <opt-out / pre-init / legitimate-interest / bundled / cookie-wall / no withdrawal / no record>
  Redline:    <exact fix — name Google/Firebase + the SDK; the gate code or the PP wording above>
  Confidence: high | medium | low
```

Then a **per-document letter grade** (Privacy, and the implementation as a sub-grade) and the **verdict band**:
- **BLOCK** — telemetry runs before consent, or a false "legitimate interest / no analytics" data statement (🔴).
- **FIX-THEN-SIGN-OFF** — opt-out-only or legitimate-interest claim, no 🔴 (🟠) → emit a `Condition | Owner | Severity` table.
- **SIGN-OFF** — first-run opt-in gate present, mechanics valid, surfaces reconciled (no 🔴/🟠).

End with the `legal-guardrails` §5 authority footer. **Decide and sign** the ruling; reserve **only** for a Dutch advocaat: the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills, native-NL legal-idiom review of the consent copy, and any item marked `[low-confidence]` (notably the Crashlytics "strictly necessary" boundary and the exact Tw 11.7a lid/onderdeel + AP page citation — see `eprivacy-cookiewet.md` §9 open items).

**Typical headline for an app that ships Firebase telemetry opt-out (the example app's case):** `[COOK-1] 🟠 Firebase Analytics/Crashlytics ship opt-OUT (default-ON, legitimate-interest framing) — NL requires prior opt-in` → **FIX-THEN-SIGN-OFF**.
