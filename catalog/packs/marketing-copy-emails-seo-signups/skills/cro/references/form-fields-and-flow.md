# Form fields and flow

Used when a form is the page, or sits on it. The goal: more people finish the form, while you still collect what follow-up truly needs.

## Assess first

Check for saved product context (`.agents/product-marketing.md`, or the older `.claude/product-marketing.md`) before asking anything; ask only what it leaves open.

Establish:
- Form type: lead capture (gated content, newsletter), contact, demo or sales request, application, survey or feedback, checkout, quote request.
- Current state: number of fields, completion rate, split of mobile and desktop visitors, the step where people quit.
- Business side: what happens to a submission, which fields the follow-up actually uses, any legal or compliance duty.

Questions to put to the user: current completion rate; whether field-level analytics exist; what is done with the data; which fields are really used; compliance needs; the mobile/desktop split.

## Principles

1. Every field costs completions. Completion tends to fall as fields are added, but the size of the drop differs by audience and offer; measure your own form by comparing completion rate across versions with different field counts over the same period. For each field ask: is it needed before we can help, can we get it another way, can we ask later?
2. What the visitor gets must outweigh the work. State the reward above the form, and make the form look small.
3. Keep the mind light: one question per field, plain conversational labels, sensible grouping and order, defaults where they are safe.

## Fields

- Email: one box, no "repeat email" box, validate while moving on, flag likely typos ("did you mean outlook.com?"), show the email keyboard on phones.
- Name: one "Name" box or first plus last is worth testing. One box is easier; split only if you personalise messages with the first name.
- Phone: optional when possible; if required, say why; format as the person types; handle country codes.
- Company: suggest from a list, fill in after submit via enrichment, or work it out from the email domain.
- Job title: dropdown when categories matter, free text when answers vary a lot; consider optional.
- Free-text message: optional, give a sense of how much to write, let the box grow when focused.
- Dropdown: start with a "Choose..." prompt, make long lists searchable, use radio buttons for a short list (a starting point is up to about 4 options, not a measured value), offer "Other" with a text box.
- Checkbox group: parallel wording, a manageable number of choices, a hint such as "select all that apply".

## Layout

Order: easy fields first (name, email), build a little commitment, put sensitive fields (phone, company size) last, group related ones when the form is long.

Labels and placeholders: keep the label visible at all times, because a placeholder vanishes once typing starts and people forget what the box wants. Use the placeholder for an example value. Add help text only where it earns its space.

Good: label "Email" with the example jan@bakery.example inside the box.
Bad: only the placeholder "Enter your email address", which disappears on focus.

Visual: space between fields, a clear hierarchy, a button that stands out, tap targets sized to the platform's published interface guidelines (check the minimum for your platform).

Columns: single column completes better and suits phones. Two columns only for short, related pairs such as first and last name. If unsure, one column.

## Multi-step forms

Use when the form is long (a starting point is more than about 5 or 6 fields, not a measured value), the content falls into separate topics, answers change the path, or the form is heavy (applications, quotes).

Practice: show "step X of Y"; go from easy to sensitive; one topic per step; allow going back; keep entries when the page reloads; mark required against optional.

Progressive commitment sequence: 1) just the email, 2) name and company, 3) qualifying questions, 4) how they want to be contacted.

## Errors

While filling in: validate when the person leaves a field, not on every keystroke; show state clearly (green tick, red outline).

Messages: say what is wrong, say how to fix it, place it by the field, never wipe what was typed. Helpful: tell them the address looks incomplete and show the expected shape, for example a name, an at sign, a domain. Unhelpful: a bare "Invalid input".

On submit: move focus to the first error, summarise if there are several, keep every entered value.

## Submit button

Copy: avoid "Submit" and "Send" alone. Write the action plus the payoff, for instance "Begin My Trial" for a trial, "Write to Us" for a contact form, "Book a Walkthrough" for sales, or a phrase naming the thing received such as the price list or the checklist.

Placement: directly under the last field, left-aligned with the fields, large with strong contrast, and sticky or plainly visible on mobile.

States after clicking: loading (button disabled, spinner), success (with clear next steps), error (clear message, focus on the problem).

## Trust and effort

Near the form: a privacy line such as "Your details stay with us", security badges when data is sensitive, a testimonial or other proof, the time to expect a reply.

Make it feel light: say how long it takes ("Takes about two minutes"), show how many fields remain, strip clutter, leave white space.

Short reassurance lines that answer a worry: that mail can be stopped at any time, that a phone number stays private, that no payment card is needed.

## By form type

- Lead capture: fewest fields (often email only), a clear statement of what they receive, ask enrichment questions after the download, test email only against email plus name.
- Contact: email or name plus a message; phone optional; state when they will hear back; offer chat or phone as alternatives.
- Demo request: name, email and company required; phone optional with a preferred-contact choice; a goal or use-case question helps personalise; an embedded calendar can raise show-up rates.
- Quote or estimate: multi-step usually works; easy questions first, technical detail later; save progress on long ones.
- Survey: progress bar is essential; one question per screen; skip logic to keep it relevant; consider a reward for finishing.

## Mobile

Tap targets at least the minimum in the platform's published interface guidelines; the right keyboard per field (email, tel, number); autofill working; one column only; a sticky submit button; less typing through dropdowns and buttons.

## Measurement

Metrics: form start rate (views to started), completion rate (started to submitted), drop-off per field, error rate per field, time to complete overall and per field, completion split by device.

Events to log: form view, first field focus, each field completed, errors by field, submit attempts, successful submissions.

## Deliverables

Form audit, one entry per issue: the issue, its likely effect on conversions, the specific fix, priority (high, medium, low).

Recommended design: required fields with justification, optional fields with reasons, field order, copy (labels, placeholders, button), error messages for each field, layout notes.

Test hypotheses: ideas to A/B test with the outcome you expect.

## Experiment ideas

Structure
- One step against several steps with a progress bar.
- One column against two.
- Form on the page against on its own page.
- Labels above fields against beside them.
- Form high up against after the content.

Fields
- Cut to the minimum.
- Add or remove phone; add or remove company.
- Balance of required and optional.
- Enrichment to prefill what you know.
- Hide fields for known or returning visitors.

Smart behaviour
- Live checks on email and phone.
- Progressive profiling: ask more on later visits.
- Conditional fields driven by earlier answers.
- Suggestion list for company names.

Words and look
- Label clarity and length.
- Placeholder text.
- Help text always shown, hidden, or on hover.
- Error tone: friendly or direct.
- Button text ("Send", "Show My Price", something specific), colour, size, and position.

Trust
- Privacy assurance, badges beside submit, a testimonial, expected response time.

Per form type
- Demo: phone required or not; preferred contact method; a "biggest challenge" question; calendar embed against plain submission.
- Lead capture: email only against email plus name; value message above the form; gated against open content; questions after submission.
- Contact: topic or department routing menu; message required or not; alternative contact methods; response-time wording.

Mobile and UX
- Bigger touch targets, keyboard type per field, sticky submit button, autofocus on the first field, card-style against minimal container.

## Neighbours

Signup for account-creation forms; popups for forms inside modals; cro for the page around the form; ab-testing for running the tests.
