---
id: paywalls
title: Paywalls and upgrade screens
description: Use for in-app paywalls, upgrade screens, upsell modals, feature gates, freemium or trial to paid conversion, trial expiration, limit reached, plan upgrade prompts, in-app pricing, free users who won't upgrade. Pricing pages go to cro, price choice to pricing.
---

## When to use

Typical wordings: "design a paywall", "upgrade screen", "upsell modal", "feature gate", "free users won't upgrade", "trial to paid", "limit reached screen", "how do I get users to pay".

Scope: any moment inside the product where the user is asked to pay or move up a tier, after they have already seen value.

Neighbours:
- Public pricing page: use cro.
- Which prices and plans to offer: use pricing.
- Cancel flow, save offers, churn after upgrade: use churn-prevention.
- Getting people to the first win before any ask: use onboarding.
- Running and reading the experiments: use ab-testing.

## How it works

1. **Load context.** If a product marketing context file exists in the project, read it and ask only for what it lacks.
2. **Assess.** Establish: the kind of upgrade (free to paid, trial to paid, tier change, single feature, usage cap); what is free and what is gated; what triggers prompts today and the current conversion rate; the pricing model (per seat, usage, flat); mobile, web or both; the moment of first real value; what the user is doing when the prompt shows up.
3. **Apply four principles.**
   - Respect a no: never pressure, make staying on the free plan painless, and keep the relationship intact for a later yes.
   - Value first: ask only after the user has felt a benefit, right after the first win.
   - Show the paid value: preview the locked result so the upgrade feels concrete.
   - Short path: nobody should hunt for the price, and payment is a few taps away.
4. **Pick the trigger.**
   - Feature gate: say why it is paid, show what it does, offer a fast unlock and a way to carry on without it.
   - Usage limit: state plainly that the cap is reached, show what the next tier adds, never cut the user off mid-task.
   - Trial ending: warn early, at about 7, 3 and 1 days out, explain exactly what changes at expiry, recap what they built.
   - Time-based: a calm nudge after some days of free use, pointing at paid features they have not tried, easy to close.
5. **Assemble the screen.** Parts, in order: a headline naming the gain; a demonstration of the value (preview, before and after); a short comparison with the current plan marked; clear pricing with monthly and annual side by side; social proof if it is real; a CTA that names the benefit; a visible "not now" or "stay free" exit.
6. **Sketch the layout.** Layout sketches for the lock, limit and trial cases are in [layouts](paywalls/layouts.md).
7. **Set timing and frequency.** Show after activation or at a real limit. Never during onboarding, never mid-flow, never again right after a dismissal. Cap prompts per session, wait days (not hours) after a dismiss, and watch for annoyance signals such as quick closes or support complaints.
8. **Smooth the purchase.** Few steps, stay in context, prefill what is known. After paying: access at once, a confirmation and receipt, and a pointer to what is now unlocked.
9. **Test.** Vary one thing at a time: trigger timing, copy, price display, trial length, which feature leads, layout. Track impressions, click-through to upgrade, completed purchases, revenue per user and churn after upgrade. Idea bank: [experiments](paywalls/references/experiments.md).
10. **Run the avoid list.** Dark patterns (hidden close control, muddled plan choice, guilt copy, fake countdowns) are out. Also avoid asking before value, prompting too often, blocking critical flows and long upgrade paths. Prices, trial rules, and store billing and review rules change, so check the current store rules (and the legal pages for your market) before shipping, and state that in the hand-off. All copy in English.

## Checks before done

- The prompt follows a moment of real value, not onboarding.
- There is a clear way out that keeps the user in the product.
- No dark pattern: close control visible, plan choice plain, copy free of guilt or false urgency.
- The price, trial length and renewal terms are stated honestly and match the store listing.
- Frequency cap and cool-down are written down.
- The test plan names one variable and the metrics above.
- The hand-off says that pricing and store rules change and were checked on the date of delivery.
