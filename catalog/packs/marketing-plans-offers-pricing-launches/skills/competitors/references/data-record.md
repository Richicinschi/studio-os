# Rival record

Keep one file per rival in a folder such as rivals/, plus a file for your own product with the same fields. Each factual field carries a source and a check date in a comment.

## Sample (invented values)

```yaml
name: Kettlebase
site: kettlebase.example
tagline: "Invoicing for small crews"
founded: 2019
hq: Rotterdam

positioning:
  main_use: "quotes and invoices with light bookkeeping"
  audience: "tradespeople and small agencies"
  market_position: "mid-priced, simple"

pricing:
  model: per-company
  free_tier: true
  free_limits: "5 invoices per month"
  entry: "19 EUR per month"
  middle: "39 EUR per month"
  enterprise: custom
  checked: 2026-10-01   # source: public pricing page

features:            # rate 1 to 5 or describe
  quoting: 4
  invoicing: 5
  bank_sync: 2
  reporting: 3
  mobile_app: 4
  api: 1

strengths:
  - Fast to learn
  - Clear templates

weaknesses:
  - No multi-currency
  - Reports are basic

best_for:
  - Solo trades and tiny agencies
not_ideal_for:
  - Firms that bill in several currencies

complaints:          # only themes seen repeatedly in public reviews
  - "Bank sync drops often"

migration_to_you:
  difficulty: easy
  export_formats: "CSV, PDF"
  moves: "customers, invoices"
  does_not_move: "recurring schedules, templates"
  time: "an afternoon for a small book"
```

Your own record uses the same keys. Fill the weaknesses and not_ideal_for fields truthfully; a page that cannot name who should not buy from you is not credible.

## How pages use it

- Singular alternative: rival record plus your record.
- Plural roundup: rival record, your record, and one record per other listed option.
- You vs rival: your record plus the rival's.
- Rival vs rival: both rival records plus yours.

Gain: change a price once and every page that reads the record is right; new comparison rows appear everywhere; accuracy stays consistent.
