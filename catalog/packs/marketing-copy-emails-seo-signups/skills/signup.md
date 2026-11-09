---
id: signup
title: Signup flow optimisation
description: Use when: signup conversions, too many steps to sign up, nobody completes registration, trial conversion rate, signup abandonment, people aren't signing up, account creation flow, reduce signup dropoff, free trial signup, signup form optimization, registration friction, simplify our signup.
---

# Signup flow optimisation

## When to use

Typical wordings: "people aren't signing up", "nobody completes registration", "reduce signup dropoff", "too many steps to sign up", "simplify our signup", "improve trial conversion rate", "review our account creation flow".

Neighbours: what happens after the account exists goes to onboarding. Lead capture and contact forms (no account) and the landing page that leads into signup go to cro. Running a proper split test of a change goes to ab-testing.

## How it works

You act as a conversion specialist for account creation: fewer abandoned forms, and new users who reach first value.

1. **Load context.** If a product marketing context file exists in the project (look under the agent or Claude config folders), read it first and ask only for what it does not cover.
2. **Diagnose.** Establish: the flow type (free trial, freemium, paid, waitlist; business or consumer); the number of screens and required fields; the current completion rate and where people leave; whether field-level analytics exist; which data is truly needed before first use; compliance or verification duties; what the user sees the moment signup ends.
3. **Cut fields.** For each field ask: needed before first use? Can it be collected later (progressive profiling)? Can it be inferred? Priority: email or phone and a password are essential; name is often useful; company, role, team size, phone and address are usually deferrable.
4. **Lead with value, lower effort, remove doubt.** Let visitors see or try something before the form. Show progress, group related fields, use sensible defaults and pre-fill. State what happens next and roughly how long it takes; hide no step.
5. **Tune each field.**
   - Email: one box, format check as they type, suggest fixes for common domain typos, plain error text.
   - Password: reveal toggle, rules visible before typing and ticking off live, paste always allowed, a passphrase hint can help strength, a strength meter beats rigid rules, consider passwordless.
   - Name: one box or two is a test; ask only if you use it at once, and consider making it optional.
   - Social sign in: prominent and visually separate, and worth making the primary route when your audience favours one; consumers lean on Google, Apple, Facebook, businesses on Google, Microsoft and SSO.
   - Phone: skip unless needed (SMS check, sales calls); if asked, explain why, use a country-aware input, format as typed.
   - Company: skip, or suggest while typing, or infer from the email domain.
   - Role or use case: move to first use; if kept, one question, shown progressively.
6. **Choose the shape.** Count the fields first. Three or fewer, a simple consumer product, or high-intent visitors (from ads or a waitlist): keep it on one screen. More than 3 or 4 fields, a need to segment, or mixed kinds of questions: split it. A split flow needs a progress indicator, a back button, progress that survives a refresh, steps that take seconds, and the easy questions up front with harder ones once the visitor has started. The commitment ladder to aim for: email, then password and name, then optional personalisation. See [patterns](signup/patterns.md).
7. **Build trust.** Near the form: "no card needed" or "free forever" only if true, trial length, a privacy line, security marks where relevant, a testimonial. Errors appear inline, say what is wrong with a recovery path ("this email is already registered, sign in or reset"), keep what was typed and focus the faulty field. Keep labels visible; placeholders are for example values only; help text sits next to the field and only where needed.
8. **Check mobile.** Touch targets at least 44 by 44 CSS pixels on the web (native guidance differs: Apple suggests 44 points, Material 48 dp; check the vendor's current guidance), the right keyboard per field, autofill working, less typing, one column, a sticky submit button, tried on real devices.
9. **Fix the moment after submit.** Confirm clearly and give one next action. If email verification is needed: say what to do, offer resend, mention the spam folder, allow correcting the address. Consider delaying verification until required, offering a magic link, letting people explore while they wait, and re-engaging if they stall.
10. **Measure.** Form start rate (landed to started), completion rate (started to submitted), drop-off per field, time to complete, error rate per field, mobile against desktop. Track focus, blur and error per field, step progression, social against email ratio, and time between steps.
11. **Report.** For each finding: issue, impact (estimate if possible), fix, priority (high, medium, low). Group the recommendations as quick wins (same day), high-impact changes (about a week), and hypotheses to test; ideas live in [experiments](signup/experiments.md). If a redesign is requested, give the field set with reasons, the order, copy for labels, placeholders, buttons and errors, and a layout sketch.
12. **Keep accounts deletable.** Any flow you design or change must leave the user a working way to delete the account and its data, and the privacy line should say where.

## Checks before done

- Every field kept has a stated reason; every deferred field has a later home.
- Claims near the form (no card, trial length, privacy) are true for the real billing and data setup.
- Mobile, error and verification states were covered, not only the happy path.
- Findings carry priority and a metric to judge the fix.
- Account deletion remains possible.
- Output is English only.
