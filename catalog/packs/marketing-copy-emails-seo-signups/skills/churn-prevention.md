---
id: churn-prevention
title: Churn prevention
description: Use when losing subscribers: churn, prevent, cancel flow, offboarding, save offer, exit survey, pause subscription, dunning, involuntary churn, failed payment recovery, retention, win-back, canceling, keep users, customers leaving. Post-cancel email sequences: emails. In-app upgrade: paywalls.
---

## When to use

Typical wordings: "people keep canceling", "our churn rate is too high", "how do we keep users", "customers are leaving", "design a cancel page", "what should a save offer be", "recover failed card payments", "set up dunning".

Use it for any subscription business that loses payers, whether they choose to leave or their card fails.

Neighbours:
- Win-back email sequences sent after someone has cancelled: the emails skill takes over.
- In-app upgrade moments and trial-end screens: the paywalls skill.
- Plan structure and annual discounts: the pricing skill. Activation work that stops early churn: onboarding. Churn events and dashboards: analytics. Statistically sound tests of flow variants: ab-testing.

Studio rule for everything here: cancelling must stay easy and honest. No hidden buttons, no guilt copy, no fake countdowns, no extra steps meant to wear people down.

## How it works

1. **Load context.** If a stored product marketing context file exists in the project, read it and ask only for what it lacks.
2. **Collect the facts** you do not already have:
   - Churn: monthly rate, split into voluntary and involuntary if known, number of subscribers, average MRR per customer, and whether cancelling today is one click or a flow.
   - Billing: provider (Stripe, Chargebee, Paddle, Recurly, Braintree), monthly or annual or both, whether pause or downgrade exists, any retention tool already in use.
   - Data: is feature usage tracked per user, can you see engagement falling, are past cancel reasons stored, what is the activation action that retained users do and churned users skip.
   - Constraints: B2B or B2C, whether the law or platform demands self-serve cancel, the brand tone for goodbyes.
3. **Pick the work.** There are two kinds of churn. Voluntary (the customer decides) is fought with a cancel flow, offers and a survey. Involuntary (the payment fails) is fought with retries, reminders and card updaters. Split your own cancellations into the two kinds first; the larger share, or the one with the cheaper fix, goes first. Then choose a mode: build a flow from nothing, tune an existing flow from its data, or set up failed-payment recovery.
4. **Lay out the flow** as five stages: the cancel click in account settings; a one-question survey that decides which offer appears; one targeted offer; a plain confirmation that says when access ends; a post-cancel stage that explains what happens next, makes coming back easy and starts win-back. Without a flow every would-be cancellation is lost; count how many your own survey and offer save over a fixed window so you know what a missing flow costs.
5. **Write the survey.** One single-choice question with an optional free-text box and no more than 8 options (5 at least), the commonest first (re-check the order every quarter). Frame it as learning, never as a guilt trip.

   | Reason | What it signals |
   |---|---|
   | Too expensive | Price pressure: discount or cheaper plan |
   | Not using it enough | Low engagement: pause or setup help |
   | Missing a feature | Product gap: roadmap or workaround |
   | Moving to a competitor | Rival pull: learn what they offer |
   | Bugs or technical trouble | Quality issue: route to support |
   | Temporary or seasonal need | Usage rhythm: pause |
   | Business closed or changed | Nothing to fix: let them go gracefully |
   | Other | Catch-all with free text |

6. **Match the offer to the reason.** A discount does not rescue someone who never opens the product, and a roadmap does not help someone who cannot pay.

   | Reason | First offer | Fallback |
   |---|---|---|
   | Too expensive | 20-30% off for 2-3 months | Cheaper plan |
   | Not using it | Pause for 1-3 months | Free setup session |
   | Missing feature | Roadmap preview with dates | Workaround guide |
   | Competitor | Side-by-side comparison plus a discount | Feedback chat |
   | Technical trouble | Hand to support at once | Credit and a prioritised fix |
   | Temporary | Pause | Temporary downgrade |
   | Business closed | No offer, respect the situation | none |

7. **Apply the offer rules.**
   - Discount: a starting point is 20-30% for 2-3 months, then test depth and length. Avoid 50% or more, it teaches customers to cancel for deals. Put a deadline on it and state the money saved, not only the percentage.
   - Pause: 1-3 months at most; longer pauses seldom come back, so track how many of your pausers return to active. Warn them by email before auto-resume and keep their data and settings.
   - Downgrade: offer a lower tier, list what they keep and what they lose, call it right-sizing, and keep a simple path back up.
   - Feature unlock or longer trial of a higher tier: best when the complaint is not enough value.
   - Personal outreach: for the top 10-20% of accounts by MRR, via a customer success call, or a founder email in a small company.
8. **Shape the screens.** Screen one: a short apology line, the survey question, a Continue button and a clearly labelled button to stay subscribed. Screen two: one headline offer with a concrete amount (for example "Pay 15 less per month for 3 months"), at most one fallback link such as a cheaper plan, and a visible "No thanks, continue cancelling" control. Principles: the way out is always visible, one primary plus one fallback rather than a wall of choices, specific money amounts, use the customer's name and account data, and make it work on a phone because many cancellations happen there. Deeper patterns by business type and billing interval are in [cancel flow patterns](churn-prevention/references/cancel-flow-patterns.md).
9. **Watch early signals** so you act before the cancel click. The lead times below are this skill's own starting points; tune them with the person's data:

   | Signal | Risk | Typical lead time |
   |---|---|---|
   | Logins fall by 50% or more | High | 2-4 weeks |
   | A key feature stops being used | High | 1-3 weeks |
   | Support tickets spike, then stop | High | 1-2 weeks |
   | Email opens decline | Medium | 2-6 weeks |
   | Visits to the billing page rise | High | Days |
   | Team seats removed | High | 1-2 weeks |
   | Data export started | Critical | Days |
   | NPS below 6 | Medium | 1-3 months |

10. **Score account health** from 0 to 100 (the weights are this skill's own starting point; tune them with the person's data): login frequency 30%, feature usage 25%, support sentiment 15%, billing health 15%, engagement 15%. Bands and responses: a score of 80 or more is healthy, so look for upsell; 60 to 79 needs a friendly check-in; 40 to 59 is at risk, so run a targeted campaign; under 40 is critical and gets a human contact.
11. **Intervene early.** Usage down over 50% for 2 weeks: a helpful "need a hand with this feature" email. Near a plan limit: a gentle upgrade nudge, handled by the paywalls skill. No login for 14 days: a re-engagement note with product news. A low NPS score from a detractor (0-6): reach out personally within 24 hours. A support ticket still unresolved after 48 hours: escalate it and send a status update. Annual renewal in 30 days: a value recap plus renewal confirmation.
12. **Close the loop after a cancel.** Confirm by email with the access end date, make reactivation one click, and hand the win-back sequence to the emails skill.
13. **Build the failed-payment stack** in this order: pre-dunning, smart retries, reminder emails, grace period, final cancel. Pre-dunning means card-expiry emails at 30, 15 and 7 days, asking for a backup payment method, using the card-network updater programs (they refresh stored cards that expired or were replaced, so measure the drop in your own hard declines), and for annual plans a heads-up email 3-5 days before the charge.
14. **Retry by decline type.** Soft declines (low balance, processor timeout): retry 3-5 times over 7-10 days. Hard declines (stolen card, closed account): do not retry, ask for a new card. Authentication required (3D Secure, SCA): send the customer to confirm or update payment. A workable schedule is 24 hours, 3 days, 5 days, 7 days (with a stronger email), then cancel with a way back. One idea to test is retrying on the day of month the payment first succeeded. Stripe Smart Retries chooses retry moments with its own model rather than that rule; for new Stripe accounts it is on by default at up to 8 retries within 2 weeks (check the vendor's current documentation), and a custom Stripe schedule allows at most three retries.
15. **Send four reminder emails** at day 0 (friendly alert), 3 (helpful nudge), 7 (clear deadline, warn of a pause in 3 days), 10 (last notice). Each has a direct payment-update link that needs no login if you can manage it, names what they would lose, never blames the customer, offers a support contact, and is best as plain text. Full templates are in [dunning playbook](churn-prevention/references/dunning-playbook.md).
16. **Measure your own recovery baseline.** Over the last few months count failed payments by kind (soft decline, hard decline, expired card), how many were recovered, how many failed before any dunning mail, and how many days recovery took. Compare each later change against that baseline, not against a published average.

17. **Track these metrics.** Monthly churn (churned divided by customers at month start). Net revenue churn ((lost MRR minus expansion MRR) divided by starting MRR; negative is the goal). Cancel-flow save rate, offer acceptance, pause return and dunning recovery, each against your own earlier months. Days from first churn signal to cancel (watch the trend). Count a save only if the person is still paying after a fixed window you choose in advance (for example 90 days); a saved customer who leaves within weeks was not saved.
18. **Cut cohorts** by acquisition channel, plan, tenure (when do cancels cluster: day 30, 60, 90?), cancel reason and offer type.
19. **Test one variable at a time**: discount depth (20% against 30%), pause length (1 against 3 months), survey before or after the offer, modal against full page, empathetic against direct tone. Design the experiment with the ab-testing skill. PostHog suits it: feature flags split users into flows and funnels show survey, offer, accept or decline, confirm.
20. **Pick tools.** Retention platforms: Churnkey (AI-adaptive offers), ProsperStack (rules engine, Stripe and Chargebee), Raaft (simple builder for early stage), Chargebee Retention (native for Chargebee users). Billing providers differ: Stripe, Chargebee, Paddle and Recurly retry and send dunning mail themselves, while Braintree needs manual setup. Card-updater support also differs (Recurly has one built in; Braintree's is limited to Braintree Direct merchants, mostly in the US), so check each provider's current documentation before relying on it. Handy CLIs and services: stripe, customer-io, posthog, mixpanel or ga4, segment.
21. **Avoid the usual failures:** no cancel flow at all; a hidden cancel button; one offer for every reason; discounts of 50%+; ignoring involuntary churn; no dunning mail so failed cards cancel silently; guilt-trip copy; pauses longer than 3 months; no way back after cancelling.
22. **Law and consent.** In the US the FTC click-to-cancel rule expects cancellation to be as easy as signup, with no phone call required when signup was online and no needless steps; save offers are allowed if "continue cancelling" is obvious. That federal rule was vacated by the US Eighth Circuit on 8 July 2025 on procedural grounds and is not in force, and the FTC opened a new rulemaking in March 2026, so check its current state; the older online-subscription law (ROSCA) still requires clear terms and a simple way to cancel; consumer-protection and auto-renewal laws in the US, the EU and the UK still push the same way. Tell people how long their data is kept after cancelling, offer an export before deleting it, and send win-back mail only where you have consent or another lawful basis. Treat this as guidance, not legal advice. Process the cancel even if the save logic errors, and email a receipt.

## Checks before done

- The cancel path is visible at every screen and needs no more steps than signup did.
- No guilt copy, fake urgency or hidden controls anywhere in the flow or the emails.
- Each survey reason maps to exactly one primary and at most one fallback offer, and "business closed" gets none.
- Discounts stay in the 20-30% range (never 50% or more) and have a real end date; pauses stay at 3 months or below.
- Hard declines are not retried; every dunning email has a one-step payment link.
- Grace behaviour and data retention after cancel are stated to the customer.
- The metrics list names how a "save" is counted (still paying after the window you fixed in advance).
- Hand-offs are noted: win-back to emails, upgrade screens to paywalls, tests to ab-testing.
- All customer-facing copy is in English.
- Anything that spends money or sends mail to customers has been confirmed with the owner first.
