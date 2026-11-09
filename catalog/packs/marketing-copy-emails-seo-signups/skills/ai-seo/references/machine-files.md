# Machine-readable files for agents

Google states none of these are needed for AI Overviews or AI Mode. They are worth adding for other AI engines and for agents that shortlist products for buyers. A script-rendered price list or a contact-sales wall makes an agent move on to a rival whose numbers it can read.

## Pricing file

Put a plain markdown (or text) file at the site root, for example pricing.md. One heading per plan, then price, limits, features. Sample shape with invented values:

```markdown
# Pricing: [Product]

## Free
- Price: 0 per month
- Limits: [what is capped, with numbers]
- Features: [list]

## Team
- Price: [x] per month billed yearly, [y] per month billed monthly
- Limits: [numbers]
- Features: [everything included, not only the difference from Free]

## Enterprise
- Price: custom, contact [address]
- Limits: [numbers or "none"]
- Features: [list]
```

Rules: one unit throughout (monthly or yearly, per seat or flat); real limits, not only feature names; list everything each plan includes; keep it in step with the live pricing page, because stale prices are worse than none; link it from the sitemap and from the pricing page. It is trivially parseable by any model: no rendering, no scripts, no login.

## llms.txt

A short file at the root that tells an AI system what the product is, who it serves and where the key pages are, including the pricing file. If the site has none, add one. If the site also publishes an OKF bundle, add one line pointing to it.

## OKF bundle

A directory of cross-linked markdown concept files served under an okf path. Heavier than the two files above and with no confirmed ranking effect. Read the okf file before proposing it.

## Where they sit

sitemap (which URLs exist), robots rules (who may crawl), llms.txt (which pages to read first), pricing file (comparison data), OKF (the content itself), schema (per-page structure). They stack; none replaces another.
