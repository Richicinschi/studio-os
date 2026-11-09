---
id: programmatic-seo
title: Programmatic SEO
description: Use when making SEO pages: "pSEO," "generate 100 pages," "programmatic SEO," "location pages," "[keyword] + [city] pages," "directory pages," "template pages," "pages at scale," "integration pages," "comparison pages," "data-driven pages," "building many pages for SEO," "templated landing pages."
---

# Programmatic SEO

## When to use
Typical wordings: "make a page for every city", "generate 100 pages", "[keyword] + [city] pages", "comparison pages for each competitor", "integration pages", "templated landing pages", "directory pages".

Neighbours: auditing SEO problems on existing pages goes to seo-audit; planning content strategy goes to content-strategy; structured data goes to schema; page hierarchy and URL design goes to site-architecture; head-to-head frameworks go to competitors. This skill covers designing a family of many similar pages from one template and one dataset.

Goal: pages that rank, help the reader, and do not trigger thin-content action.

## How it works
1. **Gather context.** If a product marketing context file exists (`.agents/product-marketing.md`, `.claude/product-marketing.md`, or the older `product-marketing-context.md`), read it and ask only for what it lacks. Then settle: what the product is, who the audience is, what each page should convert. Also ask which keyword patterns are targeted, what data exists or can be obtained, how many pages are planned, how strong the site is, who ranks today, and what the tech stack is.
2. **Find the pattern and test demand.** Write the repeating query shape, name its variables, and count the combinations. Check total search volume, how it splits between a few big terms and a long tail, and the trend. Look at who ranks now and what their pages hold; decide whether you can realistically compete. The page must answer what the searcher actually wants, not just contain the words.
3. **Rank your data.** Strongest first: data you created, data derived from your product, data from your community, exclusively licensed data, public data (weakest, anyone can copy it). Record what fills each page, whether it is first-party, scraped, licensed or public, and how it stays current.
4. **Pick a family.** Choose from the twelve in [playbooks.md](programmatic-seo/playbooks.md), using the table there that maps what you own to a family. Layer two families only when each adds a real fact.
5. **Set the URL structure.** Use subfolders, not subdomains: the usual advice is that a subfolder keeps authority on one domain while a subdomain can be treated as a separate site (search engines say either can work, so prefer subfolders unless the platform forces a subdomain). Good: `example.com/guides/budget/`. Bad: `guides.example.com/budget/`.
6. **Design the template.** Page parts: heading carrying the target keyword, an intro written for that page, sections fed by the data, links to related pages, and a call to action that suits the intent. Uniqueness comes from conditional blocks driven by the data and an original observation per page; swapped variables alone do not count. Studio rule: English only, no em or en dashes in generated copy.
7. **Plan internal links.** Hub and spoke: a category hub, one spoke per page, and cross-links between related spokes. No orphan pages: every page reachable from the main site, listed in an XML sitemap, with breadcrumbs carrying structured data.
8. **Plan indexation and guard against thin or duplicate output.** This is the main risk of the method. Start with a pilot batch (for example 15 pages; a starting point, not a measured value), read a sample by hand, and compare pages in pairs: if two differ only by the swapped term, the template is too thin. Index high-volume patterns first; noindex variants that stay thin; do not create pages without demand; never let two pages target one keyword. Never ship doorway pages, keyword stuffing or duplicate text. A modest set of strong pages beats a huge set of weak ones. Manage crawl budget and keep a separate sitemap per page type.
9. **Monitor after launch.** Track indexation rate, rankings, traffic, engagement and conversion. Watch for thin-content warnings, ranking drops, manual actions and crawl errors. Retire or merge pages that never get indexed.
10. **Deliver.** A strategy document (opportunity analysis, implementation plan, content guidelines) and a page template (URL pattern, title and meta templates, content outline, schema markup).

Common failures: swapping only a city name; cannibalizing your own keywords; generating pages nobody searches for; stale or wrong data; building for the crawler instead of the reader.

## Checks before done
- Every page holds value specific to it and answers the search intent; text is readable.
- A hand-read sample and a pair comparison show no near-duplicates.
- Titles and meta descriptions are unique; headings are in order; schema is present; speed is acceptable.
- Each page is linked from the site, related pages are linked, none are orphans.
- Pages are in the sitemap, crawlable, with no conflicting noindex.
- Demand exists for every pattern kept; the data source and refresh plan are written down.
