# Raw data and updates

## Folder layout

Keep everything under `competitor-profiles/` in the project root.

```
competitor-profiles/
  raw/
    acme-tools/
      2027-03-14/
        scrapes/     home.md, pricing.md, about.md
        seo/         rank-overview.json, ranked-keywords.json
        reviews/     review-site-a.md
  acme-tools.md      the finished profile
  _summary.md        cross-competitor summary
```

## Naming rules

- The competitor slug is lowercase with hyphens.
- The date folder is the day the data was pulled. A new run gets a new folder, so snapshots can be compared later. Never write into an old date.
- One file per fetched page, one JSON file per market-data call, one file per review source (cleaned text or raw JSON).
- Save before you analyse. If a fetch fails, write a short note file saying what was tried and why it was skipped.
- The profile's last section lists which raw folder it came from and the date of each pull (home, pricing, market data, reviews).

## Updating a profile

Work in this order, because volatility falls from top to bottom:
1. Pricing page: re-fetch and compare tiers, prices, trial terms.
2. Market data: traffic and rankings move monthly, so re-pull them.
3. Changelog and release notes: look for new features and a shifted direction.
4. Refresh the generated date at the top.
5. Append a change-log table at the bottom.

Change-log format:

```markdown
## Change Log

| Date | What changed | Source |
|------|--------------|--------|
| 2027-06-02 | Entry plan went from 19 to 24 per month | Pricing page, new fetch |
| 2027-06-02 | Added a webhook integration | Integrations page, new fetch |
| 2027-06-02 | Domain rank moved from 41 to 44 | Market data re-pull |
```
