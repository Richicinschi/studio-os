---
name: legal-cross-store
description: >-
  Use when reconciling an app's data declarations across every surface — building ONE
  source of truth (data categories, recipient entities, purposes, retention, trader
  contact, SDK inventory) and flagging any DRIFT between the Apple App Privacy label,
  the Google Play Data Safety form, the Privacy Policy (data-inventory + recipients),
  the in-repo RoPA, and the SDK inventory. Applies the Apple⇄Google⇄GDPR ontology
  crosswalk so categories are mapped by meaning (Apple "Diagnostics" == Google "App
  info & performance > Crash logs"), never by name. Enforces EN/NL parity on the policy
  side. Produces a reconciliation matrix; a clean matrix is a precondition for an
  overall SIGN-OFF. Trigger on "cross-store consistency", "label drift", "Apple vs Play
  vs policy", "reconcile data declarations", "consistency matrix", "data label drift",
  "single source of truth for data", "RoPA vs label", "SDK inventory vs policy".
metadata:
  category: legal
  author: "Richicinschi (Claude-authored)"
  version: "1.0.0"
  domain: "Cross-surface data-declaration reconciliation (Apple App Privacy ⇄ Play Data Safety ⇄ Privacy Policy ⇄ RoPA ⇄ SDK inventory)"
  jurisdiction: "Apple/Google store policy; EU/NL (GDPR/AVG Art. 13/30); Dutch eenmanszaak publisher"
---

Operates under legal-guardrails — load its constitution + the references listed below.

The cross-cutting consistency gate. Every other surface declares the app's data behaviour in its own ontology; this skill builds **one source of truth** and proves the five surfaces agree. It owns no statute of its own — its findings are drift between artefacts. A clean matrix is a precondition for the orchestrator's SIGN-OFF. App facts are inputs (the orchestrator's Step 0 fact sheet; run alone, read them from the project and ask for the rest), so it works for any app.

## Load before adjudicating (by path; do not reproduce)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/attribution-tiering.md` — tag every legal proposition.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/finding-format.md` — the `[XST-n]` finding shape.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/disclosure-grading.md` — clear/vague/omitted/incorrect/ambiguous; entity-awareness; over- vs under-disclosure direction.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/verdict-model.md` — bands, per-doc grade, rule 4 (cross-store drift is 🟠+ and blocks a clean SIGN-OFF).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/data-category-ontology.md` — **the canonical crosswalk.** §1 master table = the source-of-truth rows; §2 per-store axes; §5 recipients; §6 three-way invariant + name-mapping rule.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/sdk-data-map.md` — which SDK emits which data type / recipient / on-off-device (the SDK-inventory surface).

## The five surfaces (gather all; if one is missing, say so and downgrade its drift findings to a `[verify]` condition)
1. **Apple App Privacy label** — from `legal-apple-gate` output / the iOS data-surface scan (categories → types, Linked state, purpose, tracking=No).
2. **Google Play Data Safety** — from `legal-play-gate` (the CSV answers: the app's own answers file, modelled on `legal-play-gate/assets/data-safety-answers.example.json`): per type collected/shared, required/optional, purpose, app-level encryption + deletion.
3. **Privacy Policy data-inventory + recipients** — the app's Privacy Policy (path from the fact sheet): its data-collected section + its recipients/subprocessors section, **and** every localized version it ships (e.g. `privacy.nl.md`) for parity.
4. **RoPA** — the project's Records of Processing (Art. 30), wherever the project keeps them: categories of data subjects/data, purposes, recipients, retention, transfers.
5. **SDK inventory** — `sdk-data-map.md` reconciled with `legal-data-surface-scan` (actual SDKs in the merged manifest / pubspec → data each emits).

## Workflow
1. **Build the source of truth.** Take the ontology §1 master table as the canonical row set, keyed by **Canonical category**. For each row the app collects (from the fact sheet and `legal-data-surface-scan`; for the example app in `legal-guardrails.md` §8: account email, account/user ID, purchase/subscription history, crash data, performance/diagnostics, analytics/usage; conditional: name, customer-support; paid-tier-only: session metadata; minimal: device/installation IDs), record the expected representation on **all five surfaces** — resolving each store's verbatim name through the Canonical column (never copy a name store-to-store). Pull recipient entities from §5 and the SDK inventory (for a Firebase + RevenueCat app: Google/Firebase, RevenueCat, Apple/Google Play billing).
2. **Project each surface onto the matrix.** For every (canonical category × recipient entity) cell, read what each of the five surfaces actually says. Apply the §2 per-store axes (Apple: Linked? purpose? tracking? · Play: collected/shared? required/optional? purpose? + app-level encryption/deletion). Apply the §1 crosswalk so "Diagnostics" / "Purchases" / "Usage Data" / "Identifiers" map by meaning.
3. **Detect drift.** For each cell, classify: **AGREE** (all surfaces consistent) / **GAP** (declared on ≥1 surface, missing on another) / **CONTRADICTION** (a surface affirmatively states the opposite — e.g. one says "not collected", another collects it). Use the disclosure-grading direction rule: under-disclosure (app/SDK does it, surface hides it) is the dangerous direction.
4. **Check the affirmative NOT-COLLECTED set.** Health & Fitness, Sensitive Info, Location, Contacts, Messages, Photos/Audio recordings, Advertising ID, Files/Calendar/Browsing/Search/Phone (ontology §1 "Data Not Collected" list) must be **absent** from both labels and not implied in the PP/RoPA, while the SDK inventory must show no SDK producing them. A surface that declares one of these (esp. Health & fitness) is a CONTRADICTION.
5. **EN/NL parity.** Every flow disclosed in `privacy.md` must hold in `privacy.nl.md` — a flow the NL text leaves out grades omitted for the NL doc, because an NL reader relies on the NL text alone. Recipients list must match across EN/NL.
6. **Trader-contact consistency.** The controller-identity / trader block (name, registered address, KvK, BTW, contact email) must read identically across PP, Terms, RoPA, Play Console DSA trader, and the Apple support contact. `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills are jurist/owner-reserved — note them but adjudicate the rest of the block's consistency.

## Severity (apply the ontology §6 invariant + verdict-model rule 4)
- 🔴 **BLOCKER — CONTRADICTION:** one surface affirmatively contradicts another (most severe: a NOT-COLLECTED category declared on a label, or "we never collect X" in the PP while an SDK emits X, or Health & fitness marked collected on either store).
- 🟠 **MATERIAL — GAP:** a collected row present on one/some surfaces but missing from another (e.g. RevenueCat in the PP recipients but not the RoPA; analytics on the Apple label but omitted from Play; a recipient named in EN but not NL). **Any drift blocks a clean SIGN-OFF.**
- 🟡 **MINOR:** harmless over-disclosure (a surface lists a type the app doesn't do), inconsistent wording that isn't a substantive gap, retention-period phrasing mismatch.
- 🟢 **OK:** the cell agrees across all five surfaces.
- Floor rule: when overlapping with `legal-apple-gate` / `legal-play-gate` / `legal-privacy-review`, take the **higher** severity; dedupe by (location, issue) but keep this skill's matrix coordinate.

## Attribution & authority
Tag every legal basis: GDPR Art. 13(1)(e) recipients · Art. 30 RoPA · Apple 5.1.1(i) equal-protection · Play User Data "parties data is shared with" — cite from the ontology with the tier it carries there (`[settled — verified 2026-06-06]` / `[verify]` / `[verify-pinpoint]` / `[low-confidence]`). The drift facts themselves are observations, not law — state them as observed, cite the law that makes the drift a defect. A 🔴 resting only on `[verify]`/`[low-confidence]` becomes a hard condition ("confirm X; if confirmed, blocks"), never a silent pass. **No silent supplement:** any consistency question outside this matrix → surface as a MINOR note. **De-facto counsel:** decide and sign each cell; reserve for a human Dutch advocaat ONLY the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills, native-NL legal-idiom review, and items you mark `[low-confidence]` (e.g. whether breathing logs become Art. 9 by inference — ontology §3).

## Output (per verdict-model.md)
- **Header:** `Cross-store consistency: <app name> — Apple ⇄ Play ⇄ Privacy ⇄ RoPA ⇄ SDK — <date>` · Verdict band · matrix grade.
- **The consistency MATRIX** — one row per (canonical category × recipient), columns: `Canonical | Apple label | Play Data Safety | PP §3/§6 (EN) | PP NL | RoPA | SDK inventory | Status (AGREE/GAP/CONTRADICTION) | Sev`. Then the **NOT-COLLECTED assertion** sub-table (each must be absent everywhere).
- **Drift findings** (`[XST-n]`, ranked 🔴→🟠→🟡) in the standard format: Location (matrix cell + the two surfaces that disagree) / Basis (citation + tier) / Issue (what each surface says) / Redline (specific, entity-named — name Apple, Google-Firebase, RevenueCat, Cloudflare; give the exact value to put on the lagging surface) / Confidence.
- **Conditions table** (every 🟠): `Condition | Owner (owner/code/jurist) | Sev | Basis`.
- **Precondition verdict:** state explicitly whether the matrix is clean enough for the orchestrator to issue an overall SIGN-OFF (clean matrix = yes; any GAP/CONTRADICTION = no, surface to FIX-THEN-SIGN-OFF or BLOCK).
- Authority footer with verified date.
