---
id: pack-web-api-security-login-and-graphql
module: domains
checked: 2026-11-09
tokens:
  light: 45
  standard: 45
  full: 45
---

# Domain: web back ends, API design, security, sign-in and GraphQL

## Why

- **The problem:** a web API that works is not yet one that is safe to put on the internet. Missing security headers, error messages that leak, a sign-in built from guesses, a password reset that leaves old sessions alive and a GraphQL query that hits the database hundreds of times are the gaps a first version leaves, and a non-coder who builds with Claude does not know to ask about them.
- **The reason:** this pack gives Claude four written procedures. Design an API contract and its OpenAPI file, lint it, version it and generate clients from it; harden an HTTP service with a short checklist (headers, CSRF, input limits, TLS, rate limits, error text); add sign-in, sessions, roles and password resets with one checklist; and design or fix a GraphQL schema, including federation and the N+1 problem.
- **The cost of skipping it:** Claude writes each of these from memory, in whatever style it last saw, and the faults show up when strangers use the service.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The skills end in checks you can run, for example the headers read from a real response with `curl -I`, instead of a statement that the service is safe. The security skill says outright that it is a checklist, not a penetration test.

## Detect

Read-only: presence and versions, never the contents of your code. Tools the skills use, printed as found or not found:

- `node --version 2>/dev/null` and `npx --version 2>/dev/null` (only the API lint and client generation steps use them), and `curl --version 2>/dev/null | head -1`.
- The pack, at project and user level: `ls -d .claude/skills/web-api-security-login-and-graphql "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/web-api-security-login-and-graphql 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'openapi|rest api|graphql|sign-in|login|session|csrf|api security'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers web API, security or sign-in work and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you design, secure or add sign-in to a web API or back end, or build a GraphQL API?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names an API, a web service, accounts or sign-in, or GraphQL as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project is the back end.
   - Every project, in your user folder. Recommended when you build back ends in several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- Node and `npx` for the OpenAPI lint and client generation steps (optional; the contract can be designed without them). The other three skills need no program of their own.
- One of the four skills, the API design skill, has a "Without local tools" section for claude.ai: Claude works from the pasted OpenAPI file and gives you the commands to run on your own computer. The security, sign-in and GraphQL skills have none; on claude.ai they work on pasted code and configuration.
- No account or key is required by the pack itself. The sign-in skill may involve a hosted service or an email sender in your own project; it asks before creating either.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/web-api-security-login-and-graphql/`: scans it with SkillSpector (`skillspector scan catalog/packs/web-api-security-login-and-graphql --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude and you:** the pack ships no script or template files, only instructions. The commands those instructions name (`npx` for a linter and a client generator, `curl -I` to read headers) run on your computer only when a task reaches them, and `vet-and-adopt` reads those lines with you.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/web-api-security-login-and-graphql/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the four skill files under `skills/`.
2. **you:** in a new session, say "I am adding sign-in and a password reset to my web app". Expected: Claude opens the pack's entry, picks the sign-in skill, reads it in full, and works through its checklist (tokens or cookies, roles, reset handling, login rate limits) instead of writing its own password hashing.
3. If Claude writes the sign-in code without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `web-api-security-login-and-graphql` folder from `skills/`.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 45 tokens (estimate, bytes divided by 4). Its index, about 332 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **Your code is session content.** Files Claude reads from your service go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you open code that holds customer data or live keys.
- **Approval stays with you.** The skills do not call a live API with real credentials, deploy, publish docs, push a client package, rotate keys or change production settings without saying what it would do and asking first. They ask before creating an account at a paid hosted service, changing a live user table, or sending real email to real users. Keep these stops when you adapt them.
- **Your own servers only.** The security skill works only on code and servers you own or may test in writing, and does not run load or attack tools without your explicit yes. The sign-in skill will not help build a login that collects other people's credentials for a site you do not run.
- **A checklist is not a guarantee.** The security skill says it cannot promise a service is safe, and the sign-in skill gives no legal sign-off on privacy text.
- **Studio-specific names.** Some skills point to other studio skills by name (the Python back-end skill, a Firebase sign-in skill, a dependency risk skill, the legal skills). Those are not in this pack; replace the pointers with your own skills or remove them.
