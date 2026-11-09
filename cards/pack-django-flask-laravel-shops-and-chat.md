---
id: pack-django-flask-laravel-shops-and-chat
module: domains
checked: 2026-11-09
tokens:
  light: 45
  standard: 45
  full: 45
---

# Domain: Django, Flask and Laravel back ends, shops, chat and jobs

## Why

- **The problem:** a web back end that runs for you alone breaks when real people use it. A migration changes the wrong table, two buyers get the last item, a payment is marked paid because a browser reached a success page, a chat message arrives twice, and a job that retries sends the same email again. A non-coder who builds with Claude does not know to ask about these.
- **The reason:** this pack gives Claude three skills, each a written procedure: layout, migrations, tests, secrets and one-version-at-a-time upgrades for Django, Flask and Laravel; orders, stock reservation, the payment boundary, content models, admin roles and restored backups for a shop or content system; and chat, live updates and background jobs, with a choice of polling, server-sent events or WebSocket, safe retries and a test with two clients.
- **The cost of skipping it:** Claude writes each of these from memory, and the gaps (money stored as decimals, webhooks that are not checked, jobs with no dead-letter list) show up with real orders and real users.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The skills take a test baseline before a change, compare after it, and list what was not run instead of saying it works.

## Detect

Read-only: presence and versions, never the contents of your code. Tools the skills use, printed as found or not found:

- `python --version 2>/dev/null || python3 --version`, `php --version | head -1` and `composer --version`. Which ones matter depends on your framework.
- The pack, at project and user level: `ls -d .claude/skills/django-flask-laravel-shops-and-chat "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/django-flask-laravel-shops-and-chat 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'django|flask|laravel|shop|checkout|payment|chat|websocket|queue'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers one of these frameworks, shops or chat and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you build or run a Django, Flask or Laravel site, an online shop, a chat or a job queue?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names one of these frameworks, a shop, a content system, live updates or background jobs as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project is the back end.
   - Every project, in your user folder. Recommended when you build back ends in several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- The framework you work in (Django or Flask with Python, or Laravel with PHP and `composer`), a database, and the framework's test runner. The conventions skill lists the framework as its requirement; the other two skills name no program. A payment provider account in test mode is needed only if you build a shop.
- Only the conventions skill has a "Without local tools" section. On claude.ai it asks you to paste the lock file, the settings with secrets removed, the failing traceback and the test output, and to run the commands it gives you. The other two skills have no such section, so there Claude can plan and write code and you run it.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/django-flask-laravel-shops-and-chat/`: scans it with SkillSpector (`skillspector scan catalog/packs/django-flask-laravel-shops-and-chat --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude and you:** look for code files in the pack with `find catalog/packs/django-flask-laravel-shops-and-chat -type f \( -name '*.mjs' -o -name '*.py' -o -name '*.sh' -o -name '*.js' -o -name '*.ts' -o -name '*.php' \)`. It found none in the version this card was written against: the skills are written procedures with commands for you to run. If it finds any in your copy, read them together before the copy.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/django-flask-laravel-shops-and-chat/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the three skill files under `skills/`.
2. **you:** in a new session, say "two people can buy the last item in my shop at the same time". Expected: Claude opens the pack's entry, picks the shop and CMS skill, reads it in full, and builds a reserve-then-commit step for stock that it tests with two simultaneous purchases.
3. If Claude answers from memory without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `django-flask-laravel-shops-and-chat` folder from `skills/`.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 45 tokens (estimate, bytes divided by 4). Its index, about 297 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **Your code and data are session content.** Files, error logs and fixtures that Claude reads go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you open code or a database dump that holds customer data. The shop skill says never to paste real card numbers or live secret keys into the chat; keep that rule.
- **Real databases, money and people need your approval.** The skills say to ask first before a migration on real data, a deploy, a delete, a refund, a charge, or mail and notifications to real recipients, and to work in test mode or on a copy by default. Keep that behaviour when you adapt them.
- **Tax and law stay with a person.** The shop skill gives no tax or legal advice and points to an accountant and a legal review; live payments and tax correctness are outside what it can verify.
- **Neighbouring skills are not in this pack.** The skills point to separate skills for API design, login and web security. Those are in a different pack; without them Claude works from the notes in these three.
- **Sample names.** The skills mention files called `CONVENTIONS-NOTES.md`, `shop-notes.md` and `realtime-notes.md`, an `AGENTS.md` rules file, and the studio's own legal skills. Replace those names with yours.
