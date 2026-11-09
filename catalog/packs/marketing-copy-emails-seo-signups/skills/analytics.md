---
id: analytics
title: Analytics and tracking
description: Set up tracking, analytics implementation, track conversions, "how do I measure this", "are my events firing", "analytics isn't working": plan, GA4, Google Analytics, GTM, tag manager, conversion tracking, event tracking, UTM parameters, attribution, Mixpanel, Segment, results; ab-testing.
---

# Analytics and tracking

## When to use

Typical wordings: "set up tracking", "write me a tracking plan", "are my events firing", "how do I know if the campaign works", "add UTMs", "connect GA4 to the tag manager", "my conversions show zero".

Neighbours: experiment design and reading test results belong to `ab-testing`. Organic traffic diagnosis belongs to `seo-audit`. Using the numbers to lift a page belongs to `cro`. Pipeline, CRM and revenue attribution belong to `revops`.

## How it works

1. **Frame the job.** If a product marketing context file exists in the project, read it first and ask only what it leaves open. Then pin down: which decisions the data must support, which actions count as conversions, which tools are already installed, what is already tracked, who will implement (developer or marketer), the tech stack, and any consent or privacy constraint.
2. **Work backwards from questions.** Write the questions the owner needs answered ("which channel brings paying customers?"), then the action each answer would trigger. An event that changes no decision is not tracked. Prefer a few trustworthy events over many noisy ones, and skip vanity counts.
3. **Draft the tracking plan.** One row per event: name, category, properties, trigger, notes. Event kinds: page views (enriched), user actions (clicks, form submits, feature use), system events (signup finished, payment, plan change) and custom conversions (goal or funnel stage). Starter lists per business type are in [events.md](analytics/events.md).
4. **Name things before building.** Use object then action, lowercase with underscores: `quote_requested`, `booking_confirmed`, `guide_downloaded`. Be specific (`hero_cta_clicked`, not `click`). Put context in properties, not in the name. No spaces or special characters. Record the convention in the plan.
5. **Define properties and campaign tags.**
   - Common property groups: page (title, location, referrer), user (id, type, account, plan), campaign (source, medium, campaign, content, term), product (id, name, category, price).
   - Use the same property name for the same fact everywhere. Never repeat what the tool collects automatically. Never put personal data (names, emails, phone numbers) in a property.
   - UTM: `utm_source` (who sends), `utm_medium` (channel type), `utm_campaign` (initiative), `utm_content` (variant), `utm_term` (paid keyword). Lowercase, one separator style, descriptive values such as `newsletter_footer_link`, and every tagged link logged in one shared sheet.
   - Minimum events. Site: `signup_completed` (method, source), `demo_requested`, `form_submitted` (form_type), `cta_clicked` (location, button_text). App: `purchase_completed` (value, plan), `subscription_cancelled` (reason), `feature_used` (feature_name), and one event per onboarding stage carrying its index and label.
6. **Implement.** GA4 route: create the property and a data stream per platform, install the tag directly or through a tag manager, switch on enhanced measurement, send custom events, then mark the ones that matter as key events (GA4's current name for conversions). Tag manager route: tags run code, triggers decide when, variables supply values; pages push events into the data layer and the manager forwards them. Details: [ga4.md](analytics/ga4.md) and [gtm.md](analytics/gtm.md). Example call:
   ```javascript
   gtag('event', 'booking_confirmed', { service: 'tyre_swap', slot_days_ahead: 3 });
   ```
   Product-analytics tools (Mixpanel, Amplitude, PostHog) and a customer data platform such as Segment use the same plan; only the send call differs.
7. **Test before trusting.** Use the tool's live debug view, the tag manager's preview mode and a tag-inspector extension. Walk each row of the plan: right trigger, values filled, no duplicate sends, same result on another browser and on a phone, conversions counted once as intended, no personal data leaking. When an event is missing, check trigger rules and whether the container loads; for wrong values, check the variable path and data layer shape; for doubles, look for two containers or a trigger that fires twice. Standard reports lag behind collection, so judge by the debug view first, and repeat this walk after any site, container or consent change so the data stays clean.
8. **Consent and privacy.** Where the law requires it (EU, UK, California and others), no analytics or advertising tag fires before the visitor agrees. Set consent defaults to denied, update them on opt-in, connect the banner or consent platform to the tag manager, anonymize IPs where the tool allows, collect the minimum, set a data retention period and keep a way to delete a person's data. Studio rule: for the actual legal judgement, run `legal-analytics-consent`, and for a wider privacy check `legal-privacy-review` or `legal-gdpr-audit`; the orchestrator is `legal-signoff-orchestrator`. Do not state a legal conclusion yourself.
9. **Deliver the plan.** Use this layout:
   ```markdown
   # <Site or product> tracking plan
   Tools: <list>   Updated: <date>

   ## Events
   | Event | Meaning | Properties | Trigger |
   | quote_requested | Visitor sends the quote form | service, source | Thank-you view |

   ## Custom dimensions
   | Name | Scope | Parameter |
   | customer_type | User | customer_type |

   ## Conversions
   | Conversion | Event | Counting |
   | Quote | quote_requested | Once per session |
   ```
   Add the naming convention, the UTM sheet link placeholder, and open questions.

## Checks before done

- Every event maps to a decision named in step 2.
- Names follow the convention; properties hold no personal data.
- Each plan row was seen firing once, in debug or preview, with correct values.
- Conversions are marked with the right counting method.
- Consent defaults are denied and nothing fires before opt-in where the law demands it; the legal skill was named to the owner.
- Internal and test traffic is excluded.
- The plan document is saved where the team can find it.
