# Question bank — drilling patterns per spec dimension

A well to draw from so the drill is rich and non-repetitive. **Every question carries your
recommended answer/hypothesis** (interview-me style) — phrase as "My read: <X>. Agree, or
override?" Adapt to the user's last answer; don't read these verbatim or in order.

## Adaptive rules (recap)
- 2 crisp answers in a row → go deeper: edge cases, tradeoffs, "what breaks this?".
- 2 vague/unsure in a row → simplify: offer a concrete default, narrow to a yes/no, decompose.
- Buzzword / "should-want" answer → probe: "If you didn't have to justify it, what would you
  actually want?"
- Stuck → hint, then a smaller sub-question.
- One question per turn. Never batch.

## By dimension

**Goal / Outcome**
- "In one sentence, what's true after this ships that isn't true today? My read: …"
- "If you could only ship ONE part of this, which earns its keep alone?"

**Users**
- "Who hits this, and in what moment? My read: a signed-in Pro user mid-session."
- "Does a free / anonymous / first-run user see this at all? My default: gated to Pro."

**Scope & non-goals**
- "What's explicitly NOT in this version? My read: no <X>, no <Y> — agree?"
- "Name the thing you're tempted to add but shouldn't yet."

**Architecture**
- "Reuse <existing module/file> or new unit? My read: extend <file_path> because …"
- "Where does this live — which layer/feature folder? My default: `lib/features/<name>/`."
- Trick: "What's the simplest version that's NOT too simple?" (guards over-engineering)

**Components & interfaces**
- "What's the boundary of <unit> — what does it expose vs hide? My read: …"
- "Who calls it, and what does it return on the unhappy path?"

**Data model & flow**
- "Source of truth — local, Firestore, or server? My read: local-per-uid, Firestore mirror
  (matches the streak-decoupling decision)."
- "Does this change `firestore.rules` or a schema? If so, rules deploy BEFORE the client."

**Dependencies / integrations**
- "Any new package or SDK? My default: none — reuse what's in pubspec."
- "Does this touch payments / a hosted backend / an app store / secrets / money?" (flag for confirm)

**Error handling & edge cases**
- "What happens offline / mid-write / on a race? My read: …"
- "List the inputs a hostile or confused user could send here."
- Scenario: "User backgrounds the app at exactly <moment> — then what?"

**Testing & verification**
- "How do we PROVE this works — which test + which on-device check? My read: widget test for
  X + Pixel 6a smoke."
- "What's the one regression you'd be most afraid of?"

**Risks & tradeoffs**
- "We're trading <A> for <B>. Worth it? My read: yes, because …"
- Compare: "Option 1 vs Option 2 — which, and what do we lose?"

**Rollout / migration**
- "Flag-gated or straight to all users? My default: behind a flag until on-device verified."
- "Any re-consent / `kTermsVersion` bump / data migration? Store or legal wording impact?"

**Open questions**
- "What are you least sure about? Let's mark it Open rather than guess."
- "What would a reviewer flag that we haven't discussed?"
