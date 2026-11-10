---
name: stock-research-backtests-trading-safety
description: Use when the user researches a company or stock, values it, asks if a trading result is skill or luck, backtests a rule, paper trades, sets trading limits, finds market data, asks what markets say about an event, or tracks spending.
---

# Stocks, backtests, trading safety and budgets

Find the skill that fits the task in the table, read its file in full before you start, and follow it. If a skill needs a local tool and you are on claude.ai without one, follow that skill's "Without local tools" section.

| Skill | What it does | When to use | File |
|---|---|---|---|
| Research one company with sources | A sourced report on one company: numbers traced to filings, scripted valuation, a bull and a bear case. | Use when the user wants one company or stock researched and written up. | skills/single-stock-research-report.md |
| Value a company | DCF, multiples and a sensitivity table, with every assumption stated in a block. (needs: Python (optional)) | Use when the user asks what a company or asset is worth, or wants a DCF or comparison table. | skills/valuation-models.md |
| Is it skill or luck? | Test a strategy or track record against chance: sample size, costs, holdouts and a many-tries warning. (needs: Python) | Use when the user asks whether a trading result or strategy is real or just luck. | skills/is-it-edge-or-luck.md |
| Backtest honestly | Write the rules before testing, no grid search for a peak, walk-forward, costs and a baseline. (needs: Python) | Use when the user wants a trading rule backtested or a backtest result checked. | skills/backtest-without-fooling-yourself.md |
| Practise on paper before real money | Run a strategy on paper with a journal and a pass mark that must be met before any real order. (needs: a paper account) | Use when the user wants to try a trading idea without risking money, or move from paper to real. | skills/paper-trade-first.md |
| Safety limits for anything that trades or pays | Spend and order caps, approval before every order, a kill switch and key hygiene, failing closed. | Use when the user connects an agent or script to a broker, exchange or payment account. | skills/trading-safety-gates.md |
| Find market data, free first | Find free sources, list their limits and licences, cache what you fetch, and ask before any paid feed. | Use when the user needs prices, filings or economic data for analysis. | skills/market-data-sources.md |
| Screen stocks by stated criteria | Screen by stated criteria such as growth, trend or value: which names pass each, listed alphabetically with evidence, no overall rank. | Use when the user wants to know which stocks pass stated criteria, or a screener explained. It never ranks tickers or gives a buy list. | skills/stock-screen-by-criteria.md |
| Read prediction-market odds | Turn market prices into probabilities, check liquidity and fees, and never treat them as a buy signal. | Use when the user asks what a prediction market says about an event, or wants odds read. | skills/read-the-odds-prediction-markets.md |
| Track personal spending | Categorise bank exports, track spending and give a monthly summary. No tax advice. (needs: Python or a spreadsheet) | Use when the user wants their own spending tracked, bank exports sorted or a monthly summary. Not tax or filing advice. | skills/personal-budget-and-bookkeeping.md |
