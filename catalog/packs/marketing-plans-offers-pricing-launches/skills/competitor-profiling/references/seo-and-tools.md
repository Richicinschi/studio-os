# Market data and tool notes

The names below are the tools a typical crawler plus SEO-data service exposes. Use whatever equivalent is connected. Any paid call needs your user's yes and a stated cost first. If nothing is connected, use public pages, manual searches and the site's own pages, and say which metrics are missing.

## Crawling

- map: lists a site's URLs. Always the first step. Look for pricing, features, about, customers, integrations, blog and changelog paths.
- scrape: one page to clean markdown. Do the homepage first, since it shows positioning, audience and proof together.
- search: web search for reviews, press and funding news about the competitor.
- crawl: many pages in one run. More costly, so set a page limit and target URL patterns.
- extract: pulls fields to a schema (tiers, feature lists). More reliable than parsing markdown by hand when you define the schema clearly.

## Domain-level data

Tool identifiers differ by server and version, so list what is actually connected and map by purpose. The names used below are those of an earlier crawler server (firecrawl_map, firecrawl_scrape, firecrawl_search, firecrawl_crawl, firecrawl_extract) and an earlier SEO-data server (backlinks_summary, backlinks_referring_domains, backlinks_backlinks, backlinks_bulk_ranks; dataforseo_labs_google_domain_rank_overview, _ranked_keywords, _keywords_for_site, _competitors_domain, _domain_intersection, _relevant_pages; domain_analytics_technologies_domain_technologies). The current official SEO-data server is reported to expose a few generic tools that call endpoints by path instead, so check the vendor's current documentation for the exact names. The underlying API's own response fields are: rank, backlinks, referring_domains and backlinks_spam_score for a backlinks summary; metrics.organic with count (keywords), etv (estimated monthly organic traffic) and estimated_paid_traffic_cost (what that traffic would cost to buy) for a rank overview; intersections (shared keywords) for competitors by domain; and rank per target for bulk ranks. A wrapper may rename them, so read the actual response.

| Tool | Gives you |
|------|-----------|
| backlinks summary | domain rank, total backlinks, referring domains, spam score |
| referring domains | strongest linking sites, how links are being won |
| backlinks list | single links with source page, target, anchor text, new or not |
| bulk ranks | ranks for many domains in one call, ideal for the summary table |
| rank overview | keyword count, estimated monthly organic traffic, traffic value |
| ranked keywords | each keyword with position, volume and ranking page; sort by traffic |
| keywords for site | wider keyword set including chances they have not taken |
| competitors by domain | nearest organic rivals by shared keywords, may expose unknown competitors |
| domain intersection | keywords where two domains both rank; run your domain against each rival |
| relevant pages | their top pages by traffic, which shows what content works for them |
| technologies | stack by category: CMS, analytics, marketing, payments |

## Call order

Quick scan, per competitor: map the site; then in one batch fetch homepage and pricing and pull rank overview and backlinks summary; then write the short profile.

Deep profile, per competitor: map; batch 1 fetch homepage, pricing, features, about, customers, integrations; batch 2 rank overview, ranked keywords, backlinks summary, referring domains, relevant pages, competitors by domain; batch 3 (optional) technologies, review search, domain intersection against your own domain; then write the full profile.

Three or more competitors: map all sites, fetch all homepages then all pricing pages, pull rank overview for all, use bulk ranks once, write profiles one by one, summary last.

## When something fails

| Problem | Response |
|---------|----------|
| Empty page from a script-heavy site | Try the rendered text the site serves normally; if still empty, mark not collected |
| Page refuses automated access | Stop on that page, mark not collected, never route around it |
| No pricing path in the map | Test a few other likely paths, then record "pricing not public" |
| No market data for a domain | Too new or too small; write "insufficient data" |
| Rate limit | Slow down, fetch the highest-value items first |
| Review site closed to bots | Skip it and use another public source |
