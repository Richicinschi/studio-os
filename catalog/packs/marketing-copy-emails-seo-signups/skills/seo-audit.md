---
id: seo-audit
title: SEO audit
description: Use when: "my SEO is bad," "help with SEO," "why am I not ranking," "my traffic dropped," "lost rankings," "not showing up in Google," "core web vitals," "crawl errors," "SEO audit," "SEO issues," "SEO health check," "meta tags review," "on-page SEO," "technical SEO," "indexing issues."
---

# SEO audit

## When to use

Typical wordings: "audit my SEO", "why am I not ranking", "my traffic dropped after an update", "Google is not showing my pages", "check my meta tags", "core web vitals are red", "crawl errors in Search Console". A vague "my SEO is bad" or "help with SEO" also lands here: start with an audit, not with advice.

Neighbouring skills take over for these jobs:
- many keyword pages built from a template: programmatic-seo
- writing or adding structured data: schema
- being cited in AI answers and AI overviews: ai-seo
- page hierarchy, navigation and URL design: site-architecture
- turning visits into signups or sales: cro
- measuring the effect: analytics

## How it works

1. **Intake.** If a product marketing context file exists in the project (`.agents/product-marketing.md`, `.claude/product-marketing.md`, or the older `product-marketing-context.md`), read it first and ask only for what it lacks. Then settle: site type and the business goal behind SEO; priority keywords and topics; the most important pages; known problems; recent changes or migrations; organic traffic baseline; main organic competitors; scope (whole site or some pages, technical plus on-page or one area); whether Search Console and analytics access exists.
2. **Work in this order**, because an earlier layer can make a later one moot: crawlability and indexation, technical foundations, on-page, content quality, authority and links.
3. **Pick the right instrument.** A plain fetch or curl cannot see structured data: many plugins inject JSON-LD with JavaScript, and fetch tools often strip script tags. To check schema, render the page in a browser and query `script[type="application/ld+json"]`, or use the rich results test, or read a crawl export from a tool that runs JavaScript. Never report "no schema found" from static HTML alone. Free tools: Search Console, PageSpeed Insights, Bing Webmaster Tools, rich results test, Lighthouse for mobile checks (the standalone mobile-friendly test and its Search Console report were retired in December 2023), a schema validator. Paid, if the user has them: a desktop crawler, a Semrush or Ahrefs style suite, Sitebulb, ContentKing.
4. **Crawlability.**
   - robots.txt blocks nothing important and points to the sitemap.
   - The XML sitemap exists, is submitted, lists only canonical indexable URLs, is kept current and valid.
   - Key pages sit within a few clicks of the home page (3 is a starting point, not a measured value); hierarchy is logical; no orphan pages.
   - Large sites: parameter URLs and faceted navigation are controlled, infinite scroll has paginated links behind it, no session IDs in URLs.
5. **Indexation and canonicals.**
   - Compare indexed pages (a `site:` query, the Search Console page indexing report) to what you expect.
   - Hunt for stray noindex, canonicals pointing the wrong way, redirect chains and loops, soft 404s, duplicates with no canonical.
   - Canonicals exist everywhere and self-reference on unique pages; http redirects to https; www and non-www agree; trailing slash policy is uniform.
6. **Speed, mobile, security, URLs.**
   - Core Web Vitals targets, as published in the search engine's own documentation: LCP under 2.5 s, INP under 200 ms, CLS under 0.1. Look at server response (TTFB), images, JavaScript, CSS delivery, cache headers, CDN, font loading. Measure with PageSpeed Insights, WebPageTest, DevTools and the Search Console report.
   - Mobile: responsive layout (not a separate m. site), tap targets, viewport tag, no sideways scroll, same content as desktop, ready for mobile-first indexing.
   - Security: HTTPS on every page, valid certificate, no mixed content, redirects from http, HSTS as a bonus.
   - URLs: readable, keywords where natural, consistent pattern, few parameters, lowercase with hyphens.
7. **Multi-language or multi-region sites only.** Use [the international checks](seo-audit/references/international-seo.md): hreflang, locale canonicals, sitemaps, URL scheme, translation quality. Studio rule: the studio ships English only, so for its own sites treat any locale request as a decision to confirm first.
8. **On-page.**
   - Titles: unique, primary keyword early, about 50 to 60 characters (a starting point; check truncation in the results), worth clicking, brand last. Faults: duplicates, truncation, too short, stuffing, missing.
   - Meta descriptions: unique, about 150 to 160 characters (a starting point; check truncation), keyword, a clear benefit, a call to action. Faults: duplicates, auto-generated filler, wrong length.
   - Headings: one H1 containing the main keyword, an orderly H1, H2, H3 outline, headings that describe the section and are not used for styling. Faults: several H1s, skipped levels, no H1.
   - Copy: keyword early in the copy (within the first 100 words is a starting point), related terms used naturally, enough depth, matches search intent, better than what ranks now. Thin content means little unique text, empty tag or category pages, doorway pages, near-duplicates.
   - Images: descriptive file names, alt text that describes the image, compressed, modern formats such as WebP, lazy loading, responsive sizes.
   - Internal links: important pages well linked, descriptive anchors, no broken links, a sensible count per page. Faults: orphans, over-optimised anchors, buried pages, bloated footer or sidebar links.
   - Targeting: each page has one primary keyword with title, H1 and URL in line; no two pages compete for it (cannibalisation); a site-wide keyword map without gaps, grouped in topical clusters.
9. **Content quality.**
   - Experience: first-hand material, original data, real examples.
   - Expertise: visible author credentials, accurate and sourced claims.
   - Authority: recognised and cited in the field.
   - Trust: accurate facts, a transparent business, contact details, privacy policy and terms, HTTPS.
   - Depth: covers the topic and its follow-up questions, beats the top results, kept current.
   - Engagement (read in context, not as a verdict): time on page, bounce, pages per session, return visits.
10. **Look for the usual suspects by site type.**
    - SaaS: shallow product and feature pages, blog detached from product pages, no comparison or alternative pages, no glossary.
    - E-commerce: thin categories, duplicated product text, missing product schema, faceted navigation duplicates, mishandled out-of-stock pages.
    - Blog or content: stale posts, cannibalisation, no clusters, weak internal links, no author pages.
    - Multilingual: see the international file; frequent causes are missing return links, cross-language canonicals, translated boilerplate only, IP-based redirects.
    - Local business: inconsistent name, address and phone, no local schema, unoptimised business profile, no location pages, no local content.
11. **Write the report.**
    - Executive summary: overall health, the top 3 to 5 problems, quick wins.
    - Findings grouped as technical, on-page, content. Each one states the issue, its impact (high, medium, low), the evidence (how you found it), the specific fix, and a priority.
    - Action plan in four tiers: critical fixes that block indexing or ranking; high-impact improvements; quick wins; long-term work.
    - Copy you propose (titles, descriptions, headings) follows [the writing tells list](seo-audit/references/ai-writing-tells.md).

## Checks before done

- Every finding has evidence you actually saw, not an assumption; no schema verdict came from static fetch.
- Findings follow the layer order, and the critical tier contains only things that block indexing or ranking.
- Numbers carry units and a source (tool, report, date).
- Intake gaps are listed as open questions, not guessed.
- The report and any proposed copy contain no em or en dashes and no stock AI phrasing.
