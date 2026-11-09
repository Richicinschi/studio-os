# Dunning playbook

Recovering failed subscription payments. To size the problem, count in your own billing data how many cancellations followed a failed payment over the last 6 to 12 months, and how many of those failures you later recovered. The day counts in this file are a starting point, not measured values.

## Timeline

```
Day -30 to -7  Prevent: expiry and renewal notices
Day 0          Charge fails: first retry queued, email 1
Day 1-3        Retry 2, email 2
Day 3-5        Retry 3
Day 5-7        Retry 4, email 3
Day 7-10       Last retry, email 4
Day 10-14      Grace ends: account paused or cancelled
Day 14+        Win-back sequence
```

## Prevent failures

### Card expiry
| When | Action |
|---|---|
| 30 days before | Email: the card ends soon |
| 15 days before | Email: update to avoid a gap |
| 7 days before | Email: one week left |
| 3 days before | In-app banner |

Sample email:
```
Subject: Your card ending 0187 expires soon

Hello Dana,

The card we hold for your Acme Notes plan runs out on 31 March.
Add a new one so nothing is interrupted:

[Update payment method]

It takes under a minute.

The Acme Notes team
```

### Card updater programs
The big networks refresh stored card details automatically: Visa Account Updater, Mastercard Automatic Billing Updater, and the American Express service. They reduce hard declines caused by expired or replaced cards; measure the change in your own decline rate before and after turning one on. Support differs by provider (Recurly has an account updater built in; Braintree's is limited to Braintree Direct merchants, mostly in the US), so check each provider's current documentation before relying on it.

### Backup payment method
Ask at signup (few say yes), after the first successful charge (better), or right after a failure was fixed (best, they just felt the cost).

### Renewal notices
For annual or high-value plans, email 7 days before renewal with amount, date, what is included and a link to update the card. Some regions require this for auto-renewals.

## Retry strategy

| Decline code | Type | Action |
|---|---|---|
| `insufficient_funds` | Soft | Retry in 2-3 days |
| `card_declined` (generic) | Soft | Retry 3-4 times |
| `processing_error` | Soft | Retry within 24 hours |
| `expired_card` | Hard | Ask for a new card |
| `stolen_card` | Hard | Ask for a new card |
| `do_not_honor` | Unclear | One more try, then ask for a new card |
| `authentication_required` | Auth | Send the customer to authenticate |

Stripe: Smart Retries lives under Billing, Revenue recovery, Retries in the dashboard. It picks retry moments with a learned model; new accounts get it on by default with up to 8 retries in 2 weeks, and you can set a window of 1 week to 2 months. Check the vendor's current documentation, and compare your recovery rate with and without it. Stripe does not retry hard declines until the customer supplies a new payment method.

Manual schedule for a system you run yourself (Stripe's own custom schedule allows at most three retries):

| Retry | When | Note |
|---|---|---|
| 1 | Day 1 | Morning, same weekday as the original |
| 2 | Day 3 | Different time of day |
| 3 | Day 5 | Just after a common payday (1st or 15th) |
| 4 | Day 7 | Morning of the next business day |
| 5 | Day 10 | Last try before grace ends |

Tips (ideas to test, not proven rules): retry on the same date of the month as the last success; try paydays; avoid weekends; compare mornings with other times in your own retry data.

## Reminder emails

Four messages. Replace the placeholders with your own product facts.

**Day 0, friendly.**
```
Subject: Your payment did not go through

Hello Dana,

We could not charge your Visa ending 0187 for Acme Notes (12.00).
This is common and a card update usually fixes it.

[Update payment method]

Nothing changes for you yet; we will also retry on our own.
Reply to this email if you need a hand.
```

**Day 3, helpful.**
```
Subject: A quick nudge about your Acme Notes payment

Hello Dana,

The 12.00 payment is still pending. Your notebooks are safe, but we need
a working card to keep the plan active.

[Update payment method]
```

**Day 7, direct.**
```
Subject: Acme Notes will pause on 14 March

Hello Dana,

Your Visa ending 0187 keeps being declined. If we cannot take payment by
14 March, the plan pauses and you lose access to:
- your notebooks
- shared folders with 3 teammates

[Update payment method]

Nothing is deleted. Update your card any time and access returns.
```

**Day 10, final.**
```
Subject: Final reminder before your plan pauses

Hello Dana,

Your 12.00 payment is overdue and the plan pauses tomorrow.

[Update payment method]

After a pause your data stays saved for 90 days and one card update
restores everything. If you meant to leave, you need do nothing.
```

Style: no blame, short, plain text, link first, support reply address.

## Grace period

| Setting | Suggestion |
|---|---|
| Length | 7-14 days after the last retry (a starting point, tune it) |
| Retries | Continue in the background |
| Messages | Reminder emails continue plus an in-app banner |

Access during grace:
- Full access (good for business customers): least friction, best recovery, some abuse risk.
- Read-only (good for consumers): creates urgency without fear of loss.
- Immediate lockout: harsh, recovers less; only for very cheap plans.

After grace: pause, do not delete.

| When | Action |
|---|---|
| Grace ends | Pause account |
| Day 1 | "Your plan is paused" email |
| Day 7 | "Your data is still here" email |
| Day 30 | Win-back with a fresh offer |
| Day 60 | Last win-back |
| Day 90 | Deletion warning if you delete |

## Provider setup

**Stripe.** Dashboard, Billing, Revenue recovery: enable Smart Retries, and turn on the failed-payment emails in the billing email settings. Without it use a fixed rule: retries at 3, 5 and 7 days, then mark unpaid. Handle webhook events `invoice.payment_failed` (start dunning), `invoice.paid` (stop dunning, restore access), `customer.subscription.updated` and `customer.subscription.deleted`.

**Chargebee.** Configure retry attempts and intervals in retry settings, edit dunning templates under email notifications, set grace per plan.

**Paddle.** Retries and dunning are managed for you with little customisation. Listen for `transaction.payment_failed`, `subscription.past_due` and `subscription.canceled` (Paddle Billing event names; the older Paddle Classic product used different names). Good for a hands-off setup.

**Recurly.** Dunning management lets you set a retry schedule per plan, a grace period and the final action (pause or cancel). It has learned retry optimisation and a built-in account updater.

## In-app dunning

Do not rely on email alone.

Banner: a strip at the top, for example "Your 12.00 payment failed. Update your card to keep access. [Update] [Dismiss]". Show it on every page load during dunning, let it be dismissed until the next session, link straight to the payment form, and never block the product.

Final modal: "Your plan pauses on 14 March. Update your payment method to keep your projects and teammates." Buttons: update, remind me later.

## Measure it

Set your own baseline first: take the last 3 months of billing data, then track each metric month by month and compare with that baseline. Do not copy outside targets.

| Metric | Formula | How to baseline |
|---|---|---|
| Recovery rate | Recovered / failed | Per month, against your last 3 months |
| Split by cause | Won back per failure category | Soft and hard declines counted apart |
| Speed | Days between failure and success | Median per month |
| Prevention rate | Prevented / expected failures | Failures this period against the same period before the expiry emails |
| Email open rate | Opens / sent | Per email in the sequence |
| Email click rate | Clicks / opens | Per email in the sequence |
| Revenue recovered | Sum per month | Track trend |
| Revenue lost to failures | Failed and unrecovered | Track trend |

Involuntary churn: divide the MRR lost to failed payments in a month by MRR at the start of that month, and watch the trend after each change.

Worked example with made-up figures: 8,000 of MRR fails each month. At 35% recovery you win back 2,800. Raising recovery to 60% wins back 4,800, a gain of 2,000 a month or 24,000 a year. If tooling costs 150-400 a month, the return is roughly 5-13 times.
