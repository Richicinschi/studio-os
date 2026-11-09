---
id: pack-marketing-copy-emails-seo-signups
module: domains
checked: 2026-11-09
tokens:
  light: 57
  standard: 57
  full: 57
---

# Domain: marketing copy, emails, search, signups and tests

## Why

- **The problem:** a solo maker writes a landing page, a welcome email or an app store listing once, by feel, and never learns why people leave at the signup form or never find the page. Asking Claude for "better copy" gives smooth text with no method behind it.
- **The reason:** this pack gives Claude sixteen skills, each a written procedure. Grouped by job:
  - Write and edit copy: new page copy (headlines, calls to action, sections), focused editing passes on copy you already have, and a content plan with topic clusters and a priority list.
  - Emails: automated flows (welcome, nurture, win-back) and cold outreach with follow-ups. Both draft only.
  - Be found: a site audit for crawl, index, speed and content problems, content shaped to be cited by AI search, many templated pages from one dataset, and an audit of an App Store or Google Play listing.
  - Fix the path to a customer: page and form conversion, signup flows, the first-run flow after signup, paywalls and upgrade screens, and churn (cancel flows, save offers, failed-payment retries).
  - Measure: A/B tests (hypothesis, sample size, run length, reading the result) and analytics (a tracking plan, events, GA4, tag manager, UTMs).
- **The cost of skipping it:** each piece of marketing work starts from a blank prompt, and the output is judged by how it reads, not by a checklist or a measure.
- **The principle:** [fit, not copy](../PRINCIPLES.md#fit-not-copy). The skills ask for your product, audience and numbers first; they state their own figures as starting points to adjust.

## Detect

Read-only: presence only, never the contents of your files.

- The pack, at project and user level: `ls -d .claude/skills/marketing-copy-emails-seo-signups "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/marketing-copy-emails-seo-signups 2>/dev/null`.
- Whether a product marketing context file already exists, by name only: `ls .agents/product-marketing.md .claude/product-marketing.md 2>/dev/null`. The skills read it first if it is there.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'copywriting|marketing|seo|email|conversion|signup|onboarding|paywall|analytics'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers copy, email or search work and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you write or improve marketing copy, emails, search visibility, signup flows or app store listings?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names a website, a product page, a newsletter, an app, signups, customers or sales as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when the marketing belongs to one product.
   - Every project, in your user folder. Recommended when you market several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- No program is required. None of the sixteen skills lists a required tool, and none has a "Without local tools" section. They read pages you give them and files in your project.
- Some steps use what you already have: a site that Claude can fetch (the site audit and the store-listing audit), exports or a view of your analytics, search tool or keyword tool, and your mail platform when you adapt drafts to its merge fields. No account or key is needed to adopt the pack, and no skill asks for one to be created.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/marketing-copy-emails-seo-signups/`: scans it with SkillSpector (`skillspector scan catalog/packs/marketing-copy-emails-seo-signups --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude:** looks for skill folders that hold scripts or templates (`find catalog/packs/marketing-copy-emails-seo-signups -type f \( -name '*.mjs' -o -name '*.py' -o -name '*.sh' -o -name '*.js' -o -name '*.ts' \)`). The pack is expected to have none: its skill folders hold reference notes in markdown. If the scan or the find lists anything, read it with you before the copy.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/marketing-copy-emails-seo-signups/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the sixteen skill files under `skills/`.
2. **you:** in a new session, say "I want a welcome email series for people who start my free trial". Expected: Claude opens the pack's entry, picks the emails skill, reads it in full, asks about your product and audience, and returns drafts without sending anything.
3. If Claude writes the emails without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `marketing-copy-emails-seo-signups` folder from `skills/`.
- **you:** remove the zip from claude.ai's skill settings, if you added one.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 57 tokens (estimate, bytes divided by 4). Its index, about 1,096 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **This is general practice, not a promise of results.** The skills mark their own figures as starting points: for example "a starting point, not a measured value" for a pilot batch of pages (`skills/programmatic-seo.md`), a cold email sequence length (`skills/cold-email.md`, step 7) and answer length for AI search (`skills/ai-seo.md`), and the AI-search skill says the exact lifts "depend on the test setup, so read the study itself before quoting a number". Your results depend on your product, audience and traffic.
- **Drafts need your approval before they go out.** The email and cold-email skills draft only; they do not send, schedule, scrape or buy addresses without asking first. The onboarding skill says nothing is sent, posted or paid for without asking and stating the cost. Keep that behaviour when you adapt them.
- **Your pages and listings are session content.** Pages Claude fetches for an audit, and customer data you paste into a conversion or churn question, go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your data rules before you paste customer lists or analytics exports with personal data.
- **Law and consent notes are not legal advice.** The analytics and churn skills point out consent rules for tracking and cancellation; have the rules checked for your country before you rely on them.
- **Studio-specific wording.** The skills carry "studio rule" lines (for example, cancelling must stay honest), a pointer to a "studio legal skill" in the tag-manager notes, and read the context file at `.agents/product-marketing.md` or `.claude/product-marketing.md`. Replace the rules with yours, and keep the context file where your setup keeps it.
