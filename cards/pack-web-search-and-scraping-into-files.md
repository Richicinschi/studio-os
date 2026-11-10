---
id: pack-web-search-and-scraping-into-files
module: domains
checked: 2026-11-09
tokens:
  light: 52
  standard: 52
  full: 52
---

# Domain: web search and page data saved into files

## Why

- **The problem:** you want prices, a list of businesses or the text of a set of pages in a spreadsheet, and you do not want to copy them by hand. The quick way, a script that hammers a site, hides who is asking or walks past a robots rule, can get you blocked, break a site's terms or collect personal data you had no right to.
- **The reason:** this pack gives Claude one skill that collects web data into files, with the rules of the site first. It saves each result as a file (CSV or JSON) in a working folder, with a source address and fetch date on every row, a `manifest.md` that records the question and the tool versions, and a copy of every fetched page. It tries official sources first: a data download, a free documented API, a feed or sitemap, a request to the site owner, and only then the public pages. A small Python checker reads the site's robots file before the first page.
- **The pack refuses sites that refuse AI agents.** If a site's robots file names an AI-agent token (Claude's own tokens among them), the skill treats that as a refusal for the whole site: it does not fetch, does not rename the agent, and does not go through archives, caches or dataset copies of that site. It offers the official route instead. It also stops at a log-in wall, paywall, captcha, bot check or rate limit, and it leaves out personal data of private people.
- **It is for results that end up in a file.** A single answer from the web is a plain question to Claude, not a job for this pack.
- **The cost of skipping it:** Claude collects data from whatever it can reach, at whatever speed, and nothing records which rules were checked.
- **The principle:** [hard stops for the irreversible, judgement for the rest](../PRINCIPLES.md#hard-stops-for-the-irreversible-judgement-for-the-rest). The skill has a short list of things it will not do on a site, and judgement for the rest.

## Detect

Read-only: presence and versions, never your files. The one program the skill uses, printed as found or not found:

- `python --version 2>/dev/null || python3 --version 2>/dev/null || py --version`. Python is optional; the checker and the short scripts that read saved pages use the standard library only.
- The pack, at project and user level: `ls -d .claude/skills/web-search-and-scraping-into-files "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/web-search-and-scraping-into-files 2>/dev/null`.
- Another skill that already does the same job, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'scrap|crawl|fetch|search the web|robots'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already collects web data and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you collect data, prices, listings or text from web pages into files?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names price lists, lead lists, research from web pages or spreadsheets built from websites as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project does the collecting.
   - Every project, in your user folder. Recommended when you collect data in several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- Python is optional: it runs the robots checker and the short scripts that read saved pages. The pack lists no account and no key. A search service with an API key is named only when you ask for a web search that needs one, and the skill says to ask before any plan or key that costs money.
- The skill has a "Without local tools" section for claude.ai. Without a shell Claude cannot run the checker or fetch in bulk: it asks you to paste the site's robots page, terms page and the page text, works only from what you paste, and says what it did not see.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/web-search-and-scraping-into-files/`: scans it with SkillSpector (`skillspector scan catalog/packs/web-search-and-scraping-into-files --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude and you:** read the one code file the pack ships, together: `skills/web-scrape-and-search-api/robots_check.py`. It is a Python script that fetches a site's robots file over the network and prints ALLOW or DENY per address. Find any others with `find catalog/packs/web-search-and-scraping-into-files -type f \( -name '*.mjs' -o -name '*.py' -o -name '*.sh' -o -name '*.js' -o -name '*.ts' \)`. The skill also tells Claude to run the script's built-in self-test once in a new place; it uses no network.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder, including the checker, to `<where>/skills/web-search-and-scraping-into-files/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including `skills/web-scrape-and-search-api.md` and `skills/web-scrape-and-search-api/robots_check.py`.
2. **you:** in a new session, say "collect the opening hours of the shops listed on this public page into a spreadsheet". Expected: Claude opens the pack's entry, reads the skill in full, writes the question and the date in a `manifest.md`, checks the site's robots file and terms before the first page, and delivers a file with a source address and fetch date per row.
3. If Claude fetches pages without opening the pack, or without a robots result recorded, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `web-search-and-scraping-into-files` folder from `skills/`.
- **you:** remove the zip from claude.ai's skill settings, if you added it there.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 52 tokens (estimate, bytes divided by 4). Its index, about 165 tokens (estimate), loads when a task reaches the pack, and the skill only when it is used.
- **The pack will say no, on purpose.** It refuses sites that refuse AI agents, whether the refusal is a robots token or a clause in the terms, and it does not go round a refusal through a cache or an archive. It also says no to log-in walls, paywalls, captchas, rate limits, hidden identity and personal data of private people. Do not edit those stops out. If you want a site's data and it says no, the skill offers the official data download, a free API or a message to the owner.
- **A one-off web search does not need this pack.** This pack is for results you want saved in a file or a spreadsheet: lists of businesses, prices, text from pages. For a single answer, ask Claude directly and let it use its own web search; the pack's instructions do not cover that case.
- **Fetching is an outside action.** The checker and every page fetch send requests to the sites you name, and the pages and results Claude reads go over the network as session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). The skill asks you first before anything that sends or buys something (a form post, an order, a paid search plan or data download), and before it raises its page cap.
- **It is not legal advice.** The skill says it is not a lawyer and suggests asking the owner for commercial use; terms it cannot read are reported, not guessed.
- **A mismatch to know about.** The skill's text points to two other skills "in this pack", one for API design and one for web security. They are not in this pack. The skill also names a `research-with-sources` skill for weighing sources afterwards, which is a separate skill.
