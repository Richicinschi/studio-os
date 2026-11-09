# Cancel flow patterns

How the flow changes with business type, billing interval and customer segment. Cancellation stays easy and honest in every pattern. Every number below (offer sizes, day counts, thresholds) is this skill's own starting point, not a measured value: tune it to your product and measure your own results.

## By business type

### Consumer or self-serve product

High volume, no human in the loop, so the flow must run alone.
- Shape: cancel button, one-question survey, one offer, confirmation, post-cancel.
- 2-3 screens at most, one offer plus one fallback, phone-friendly, and a clear "continue cancelling" control on every screen.
- Measure your own save rate: saves divided by cancel attempts, per month, per segment.
- Sample for a 12-dollar-a-month note-taking app: survey with 6 reasons; "Too expensive" shows "20% off for 3 months, you save 2.40 a month"; if declined, a cheaper "Lite" plan at 6 a month; if declined again, a goodbye line stating access lasts until the paid-through date.

### Team or business plan

Fewer cancellations, more money at stake, so people are worth the effort.
- Shape: cancel button, survey, offer or hand-off to customer success, confirmation, post-cancel.
- Show the team impact ("11 colleagues lose access"). Let only the owner or an admin cancel. Offer "book a call" as an optional save beside the cancel button, never as a requirement. Measure your own save rate the same way, split by plan.
- Route by monthly revenue per account (example thresholds, set yours from your own pricing):

| Account MRR | Handling |
|---|---|
| under 100 | Automated flow with offers |
| 100 to 500 | Automated flow, flag for a follow-up |
| 500 to 2,000 | Customer success speaks to them before the cancel completes |
| over 2,000 | Self-serve cancel stays available; show an optional "talk to a person" call offer beside the cancel button, never in place of it |

### Freemium

These people are stepping down, not leaving.
- Shape: cancel button, "Move to Free instead?" screen, survey if they still cancel, offer, confirmation.
- Show what stays on Free and what goes. Keeping them on Free is the save. Mark them for a later upgrade campaign.

## By billing interval

### Monthly payers
Price sensitive, low commitment. Order of offers: discount (when the reason is price), pause (not using it, or temporary), annual plan at a discount (engaged but cost-conscious).

### Annual payers
Larger commitment and usually stronger reasons, and a longer window to save because they have paid already. Order of offers: pause the rest of the term (temporary need), plan change plus renewal credit, personal outreach, partial refund with downgrade (better than full refund plus loss).
Refunds: prorate when much time remains; if under 3 months remain, offer a pause until renewal. Be fair, a bad refund experience creates loud critics.

## Offer patterns

### Discount ladder
The numbers here are a starting point, not measured values.
Do not open with the biggest number. Example: first 15% off, if they still cancel 25% off, then let them go.
- At most two discount offers per session, never above 30%, each limited to 2-3 months.
- Remember who took a discount; if they cancel again at full price, do not offer it again.

### Pause settings
A starting point, not measured values.

| Setting | Recommendation |
|---|---|
| Lengths offered | 1, 2 or 3 months |
| Default | 1 month |
| Cap | 3 months |
| While paused | Data kept, access removed |
| Return | Automatic, with an email 7 days ahead |
| Repeat pauses | One per 12 months |

Return emails: 7 days before, a short "what changed" update; 1 day before, what is waiting; on the day, a quick tour. A pause often beats a discount because it does not cheapen the product.

### Downgrade path
For products with tiers, this is the strongest save. Screen idea: "Before you go: would a smaller plan fit?", the current plan and price, the lower plan and price, a short list marked keep and lose, a "Switch" button and the usual "No thanks, continue cancelling". Show exact keep and lose lists, preserve their data on the lower plan, and show no upgrade prompts for 30 days after a downgrade.

### Competitor switch
Optionally ask which rival (never force it), show a comparison if you have one, offer to match their price for 3 months, request a 15-minute feedback call. The answers are valuable to product and marketing.

## After the cancel

The schedule below is a starting point, not a measured value.

Confirmation page content: the subscription is cancelled; access continues to the end date; data is kept for a stated period (for example 90 days); reactivation is available from account settings, with a visible button.

| When | Action |
|---|---|
| Immediately | Confirmation email with the access end date |
| Day 1 | Nothing; do not look desperate |
| Day 7 | Short satisfaction survey about the whole experience |
| Day 30 | "What is new" email |
| Day 60 | Tell them if their stated reason has been fixed |
| Day 90 | One last win-back offer |

Sequence writing belongs to the emails skill.

## Segmentation

| Dimension | Why |
|---|---|
| Plan or MRR | Bigger accounts get people |
| Tenure | Long-standing customers merit more generous offers |
| Usage | Active and dormant users need different words |
| Billing interval | Monthly and annual need different offers |
| Earlier saves | No repeat discounts |
| Reason | Chooses the offer |

Four common segments:
- **Under 30 days old:** not activated yet. The save is help, not money: a setup call, guided steps, a longer trial. Ask what they hoped to achieve.
- **Engaged but price-bound:** loves it, cannot justify the cost. Discount, annual switch or downgrade. Best odds.
- **Dormant 30+ days:** a discount will not wake them. Offer pause and ask what changed. Low odds, so focus on learning.
- **Heavy user leaving for a rival:** a deliberate choice. Price match, feedback call, roadmap look. Medium odds.

## Build order

Phase 1 (week 1): a cancel flow with survey, one offer and confirmation; 5-7 reasons, one offer each; track reasons and save rate; turn on card-expiry emails.
Phase 2 (weeks 2-4): add a fallback offer per reason; add pause; set up a four-email reminder sequence over 10 days; turn on smart retries; route high-MRR accounts to a person.
Phase 3 (month 2 onward): health score from usage; automatic early interventions; tests on discount depth and offer type; segment flows by plan, tenure and usage; a win-back sequence with the emails skill; cohort analysis by channel, plan and tenure.

## Compliance notes

- US click-to-cancel: the FTC rule of 2024 was vacated by the Eighth Circuit in July 2025 and the FTC began a new rulemaking in 2026, so check the current state. The direction stays the same under the older online-subscription law and state rules: cancel as easy as signing up, no required phone call when signup was online, no pile of extra steps; save offers are fine if "continue cancelling" is plain.
- EU data protection: tell users how long data is kept after cancelling, offer an export before deletion, honour deletion requests within the legal deadline, and do not use post-cancel data for marketing without consent.
- General: always leave a clear path to finish cancelling, never hide the button, complete the cancel even if the save logic fails, and send an email receipt. This is guidance, not legal advice.
