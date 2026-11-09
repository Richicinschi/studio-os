---
id: pack-stock-research-backtests-trading-safety
module: domains
checked: 2026-11-09
tokens:
  light: 58
  standard: 58
  full: 58
---

# Domain: stock research, backtests, trading safety and budgets

## Why

- **The problem:** money questions invite two mistakes: believing a result because it looks good (a backtest tuned until it peaks, a lucky streak), and handing an agent the power to place real orders with no limits. A non-coder who asks Claude about a stock or a trading rule has no way to tell a careful answer from a confident one.
- **The reason:** this pack gives Claude ten written procedures. Representative jobs: research one company in a sourced report with numbers traced to filings and a bull and a bear case; value a company with a stated-assumption range; ask whether a trading result is skill or luck; backtest a rule with the rules written first, costs and a baseline; practise on paper with a pass mark before real money; and set spend caps, order approval and a kill switch for anything that connects to a broker or payment account. The rest find market data, screen stocks by stated criteria, read prediction-market odds and track personal spending.
- **No advice, no scores, no tax advice.** The pack gives no buy or sell advice, no ticker scores and no tax advice. Its skills say so themselves, (Watch out names which skill), and they refuse to rank or score tickers or to name a buy. What they do instead is method: research with sources, backtests with checks, and trading safety.
- **The cost of skipping it:** an answer to "is this strategy good" comes from whatever Claude last saw, and an order-placing script has no limits you chose.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The skills end in a checked report with the unknowns listed, and a result is stated as passed, failed or not enough data against pass marks set in advance.

## Detect

Read-only: presence and versions, never your data, statements or keys. Tools the skills use, printed as found or not found:

- `python --version 2>/dev/null || python3 --version` (three skills ship a small Python script).
- The pack, at project and user level: `ls -d .claude/skills/stock-research-backtests-trading-safety "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/stock-research-backtests-trading-safety 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'stock|trading|backtest|valuation|broker|budget|portfolio'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers stock research, trading or budgets and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you research stocks, test trading ideas, connect a script to a broker or exchange, or track your own spending?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names investing, trading, market data or personal finance as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when the finance work belongs to one project.
   - Every project, in your user folder. Recommended when you do this work in several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- Python for the skill that tests skill against luck and the one that backtests; Python is optional for valuation and, with a spreadsheet as the other route, for the spending summary. The three scripts use only the Python standard library. The paper-trading skill needs a practice account that you open yourself at your broker or exchange.
- Five of the ten skills carry a "Without local tools" section for claude.ai (backtest, skill or luck, paper trading, spending, valuation). On claude.ai they do the arithmetic in the reply or hand you a script to run on your own computer.
- No key or account is required to install the pack. Skills that touch a broker, exchange or payment account (see Watch out) take keys only from your environment and never ask you to paste one into the chat.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/stock-research-backtests-trading-safety/`: scans it with SkillSpector (`skillspector scan catalog/packs/stock-research-backtests-trading-safety --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude and you:** read the scripts the pack ships, together, before anything is saved. They are in these skill folders: `is-it-edge-or-luck` (`bootstrap_check.py`), `personal-budget-and-bookkeeping` (`summarise_spending.py`) and `valuation-models` (`dcf_grid.py`). Claude says what each does; they read local files you point them at and, as far as the imports show, open no network connection.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/stock-research-backtests-trading-safety/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **you:** install Python if Detect did not find it and you want the scripts. A command that installs software is handed to you to type; Claude does not run it.
5. **Claude:** records the decision, the scope, the tools found and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the ten skill files under `skills/` and the three scripts.
2. **you:** in a new session, say "my trading bot made 40 percent last year, is that skill or luck?". Expected: Claude opens the pack's entry, picks the skill-or-luck skill, reads it in full, asks for the trade list and costs, and answers with a verdict that carries numbers, a look-ahead warning and the statement that it is not investment advice. It does not place an order or ask for a broker key.
3. On claude.ai, upload the pack's zip first ([START-HERE](../START-HERE.md), "If you only use claude.ai"); the same request works there, with the limits the skill states.
4. If Claude answers without opening the pack, or the answer says buy, sell or hold, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `stock-research-backtests-trading-safety` folder from `skills/`.
- **you:** remove the zip from claude.ai's skill settings.
- **you:** revoke any paper-account or broker key you created while trying the pack; the pack never stores one, but the provider's own control is the real way to cancel it.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **No buy or sell advice, no ticker scores, no tax advice.** The pack gives none of the three. The company-report skill never says buy, sell or hold; the screening skill lists names that pass stated criteria alphabetically with no rank, score or price target; the spending skill leaves out tax, filings and deductions and points to a qualified adviser. The backtest, valuation, skill-or-luck and odds skills state in each answer that they are method, not investment advice. They cover the method only: research with sources, backtests with checks, and trading safety. Keep these limits when you adapt the skills, and note that they do not replace a licensed adviser.
- **The entry is the one cost every session:** about 58 tokens (estimate, bytes divided by 4). Its index, about 803 tokens (estimate), loads when a finance task comes up, and each skill only when it is used.
- **Orders and keys need your yes.** The trading-safety skill requires a plain-language preview and a clear yes before every real order (one yes covers one order; silence or "whatever you think" is not approval), spend and order caps, a kill switch and a paper mode by default; keys live in environment variables, never in files or chat. The paper-trading skill sets a pass mark that must be met before any real order and never asks for your password or keys. The odds skill places no bet without your explicit yes naming the amount and worst-case loss. The data skill asks before any paid feed, never signs up or creates keys for you, and refuses to scrape a site whose terms forbid it. Keep all of these stops.
- **Your finances are session content.** Bank exports, trade lists and filings that Claude reads go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules, and remove account numbers from a bank export before you hand it over.
- **Outside text is data.** The skills treat prices, news and filings as data and report text such as "buy now" instead of following it; keep that rule.
- **Studio-specific wording.** The screening skill says "the studio never scores or ranks tickers"; replace "the studio" with your own name. Some skills point to other skills by name; replace or remove those pointers.
