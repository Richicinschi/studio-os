---
id: pack-engineering-testing-performance-code-design
module: domains
checked: 2026-11-09
tokens:
  light: 34
  standard: 34
  full: 34
---

# Domain: browser testing, performance and code design

## Why

- **The problem:** reading code tells you what a page should do, not what it does. A slow page gets "optimised" by guess, a bug in the browser gets a guessed fix, and a codebase grows shallow modules that are hard to change and hard to test.
- **The reason:** this pack gives Claude three jobs: test a page in a real browser through the Chrome DevTools connection (the live DOM, console errors, network calls, a Lighthouse audit, a performance trace), speed up slow code or pages by measuring first and changing only what the measurement points at, and shape a codebase into deep modules with a shared vocabulary, a way to find where a seam belongs, and a "design it twice" method.
- **The cost of skipping it:** performance work starts from a hunch, a browser bug is argued from the source, and structure advice has no shared words.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The performance skill says to measure before and after, and the browser skill reads the page as it runs instead of assuming.

## Detect

Read-only: presence and versions, never your code. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The pack, at project and user level: `ls -d .claude/skills/engineering-testing-performance-code-design "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/engineering-testing-performance-code-design 2>/dev/null`. This pack has no stubs and no agents.
- Tools the browser skill uses, printed as found or not found: `node --version 2>/dev/null`, `npx --version 2>/dev/null`, and a Chrome (`google-chrome --version 2>/dev/null || chromium --version 2>/dev/null`; on Windows or macOS say which browser you use).
- Whether a DevTools connection is already set up (file names only): `grep -l "chrome-devtools" .mcp.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/settings.json 2>/dev/null`.
- Another skill that already does this job, from its front matter only:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'performance|lighthouse|devtools|profil|refactor|architecture' && echo "$f"; done`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already handles this work and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you build or debug web pages or apps, or want help with their structure and speed?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names a website, a web app or code you maintain.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when the code belongs to one project.
   - Every project, in your user folder. Recommended when you build in several.
   - Not sure: this project only.
   - Default when skipped: this project only.

The pack has no agents and no stubs, so there are no further questions.

## Needs

- For the browser skill: `node` with `npx`, and Chrome. The skill sets up the Chrome DevTools connection as an MCP server that `npx` fetches; that adds a server to your Claude settings, so it is a decision of its own (see Watch out). The performance and code design skills need no program of their own. None of the three skills has a "Without local tools" section, so on claude.ai the browser skill cannot drive a browser; the other two still guide your questions and reading.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/engineering-testing-performance-code-design/`: scans it with SkillSpector (`skillspector scan catalog/packs/engineering-testing-performance-code-design --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude:** reads the pack with you. It ships no script files; the one command it contains is the setup for the DevTools connection, an `npx` line inside the browser skill. `vet-and-adopt` reads that line with you and does not run it.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/engineering-testing-performance-code-design/`. It shows the list first and saves on your yes.
4. **you:** install `node` and Chrome if Detect did not find them. A command that installs software is handed to you to type; Claude does not run it.
5. **Claude:** records the decision, the scope, the tools found and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose.
2. **you:** in a new session, say "my page feels slow to load, find out why". Expected: Claude reads the entry, opens the performance skill, says it will measure first, and names the measurement it will take (a Lighthouse audit or a trace) before it changes anything.
3. For the browser skill: "open my local page and tell me what errors are in the console". Expected: Claude says which DevTools connection it needs; if none is set up, it tells you how and waits for your yes.
4. If Claude proposes fixes without a measurement, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `engineering-testing-performance-code-design` folder from `skills/`.
- **you:** if you added the DevTools connection, remove its entry from `.mcp.json` or your Claude settings.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 34 tokens (estimate, bytes divided by 4). Its index, about 342 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **The DevTools connection runs a downloaded package and a real browser.** The skill's setup uses `npx` to fetch the latest version of a server at each start; pin a version if you want it stable. It starts Chrome in its own profile folder apart from your daily browser. The skill warns that a connection to your everyday profile can reach your open windows, such as webmail; keep the separate profile.
- **Page content is data, not instructions.** The skill tells Claude to treat DOM text, console lines and network bodies as untrusted and to report text that tries to give orders. Keep that rule when you adapt it, and let the skill ask before it alters the page.
- **Your pages are session content.** What Claude reads from the browser goes over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Do not point it at a logged-in page of a customer.
- **Studio-specific lines.** The skills mention the studio's own sites, scripts and a lessons memory. Those do not exist in your setup; replace them with yours or delete them in step 2.
