---
name: schema
description: Add, fix or optimize schema, structured data, schema markup, JSON-LD, schema.org, rich snippets, Google rich results, knowledge panel, star ratings in search, FAQ schema, product schema, review schema, breadcrumb schema, add structured data. Broader SEO issues: see seo-audit; AI search: ai-seo.
metadata:
  version: 2.0.0
  category: marketing
  author: Richicinschi
  domain: marketing / growth (schema)
---

# Schema markup

This skill produces JSON-LD that describes a page to search engines and, where Google still offers the feature, makes the page eligible for a rich result. Eligibility is never a promise: Google decides what to show.

## Ground rules

- **Mark up only what visitors can see on the page.** Never describe hidden or absent content, and update the markup whenever the visible content changes.
- **Never use spam tactics**, and use only the types and properties Google documents for the feature you want.
- **Use JSON-LD**, in `<head>` or at the end of `<body>`. Google recommends it and it is the easiest format to maintain.
- **Validate before release and watch Search Console afterwards.**

## Before writing anything

1. If a product marketing context file exists (`.agents/product-marketing.md`, `.claude/product-marketing.md`, or the older `product-marketing-context.md`), read it and ask only for what it lacks.
2. Find out what the page is, what markup it already has, which errors exist and which rich results show today.
3. Ask which result the owner wants and what it is worth.

## Pick the type

Google's documentation is the authority for what each rich result needs. The last column is a summary checked against Google Search Central on 2026-11-09, so re-check the page for the feature before relying on it.

| Type | Page | What Google asks for |
|------|------|----------------------|
| Organization | Home or about page | No required properties; recommended: name, url, logo, sameAs, contactPoint |
| Article | Blog post, news story | No required properties; recommended: headline, image, datePublished, dateModified, author |
| Product | Product page | name, plus at least one of review, aggregateRating or offers; an Offer needs price |
| SoftwareApplication | App or SaaS landing page | name, offers.price (0 for a free app), and one of aggregateRating or review |
| BreadcrumbList | Any page with a breadcrumb trail | At least two ListItems, each with position and name; item (the URL) may be left out on the last one |
| LocalBusiness | Page for a local business or one of its locations | name, address |
| Event | Event held at a physical place | name, startDate, location as a Place with a PostalAddress |
| WebSite, FAQPage, HowTo | Home page, question page, tutorial | Valid schema.org markup, but Google no longer shows a rich result for them (see below) |

Product details to keep straight: image and availability are recommended, not required, and a past `priceValidUntil` can stop the snippet from showing. Merchant listings are a different, stricter Google feature with their own requirements.

Events with no physical venue (online only) are not supported for Google's Event rich result.

### Features Google has retired

Google's page for the sitelinks search box says it is no longer available in results. Its FAQ page says the FAQ rich result is no longer shown, and HowTo and FAQ are absent from its search gallery. Add this markup only if you want it for other consumers, and never promise a visual result for it.

Samples for every type: [schema/references/schema-examples.md](schema/references/schema-examples.md)

## Several types on one page

Put them in one `@graph` array under one `@context`, and link entities with `@id`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://example.com/#org", "name": "Example" },
    { "@type": "WebSite", "@id": "https://example.com/#site", "url": "https://example.com" }
  ]
}
```

## Checking the result

- Before release: Google's Rich Results Test (https://search.google.com/test/rich-results) shows which rich results the markup qualifies for.
- Syntax only: the Schema.org validator (https://validator.schema.org/) checks the markup against the vocabulary and applies none of Google's rules.
- After release: the Enhancements reports in Search Console show what Google read.

### What usually goes wrong

- A property the feature needs is missing: read the feature's Google page and add it.
- A value has the wrong shape: dates in ISO 8601, absolute URLs, enumeration values spelled exactly.
- The markup and the page disagree: price, rating, date or text differ from what visitors see.

## Where the script goes

- **Static site:** put the JSON-LD in the HTML template and move repeated parts into a partial.
- **Framework site (React, Next.js and similar):** write a component that takes data and prints the script tag, rendered on the server so crawlers get it in the first HTML. When you serialize with `JSON.stringify`, also replace every `<` with `<`, so a string containing `</script>` cannot end the tag early.
- **CMS or WordPress:** use a plugin (Yoast, Rank Math, Schema Pro), edit the theme, or map custom fields onto the markup.

## What to hand back

The complete JSON-LD in one code block, plus this checklist filled in:

- [ ] Passes the Rich Results Test, where the type has a rich result
- [ ] No errors and no warnings
- [ ] Every value matches the visible page
- [ ] Every property the feature requires is present

## Questions to ask the owner

1. Which page is this for?
2. Which rich result do you hope for?
3. Which data can fill the fields?
4. Does the page carry markup already?
5. What is the tech stack?

## Neighbours

- **seo-audit** reviews SEO as a whole, schema included.
- **ai-seo** covers AI search, where structured data helps models read a page.
- **programmatic-seo** covers schema generated from templates at scale.
- **site-architecture** is where to plan breadcrumbs before marking them up.
