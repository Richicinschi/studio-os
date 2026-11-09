# Content models for marketing

## Four modelling rules

1. Model kinds of thing, not individual pages. A landing page is a recipe of fields; the parts inside it can then be reused elsewhere.
2. Store words, not styling. Keep the text of a headline in the CMS and leave fonts, colours and spacing to the front end.
3. Make shared items their own entries. A customer quote that appears on five pages should be one Testimonial entry that each page points at.
4. Prefer links between entries over deep nesting, which makes queries slow to write and models hard to change.

## Starter types

| Type | Fields to start with | Note |
|---|---|---|
| Landing page | title, slug, hero, ordered sections, SEO block | Sections can be rearranged per page |
| Blog post | title, slug, body, author link, category, tags, publish date, SEO block | Body as rich text |
| Case study | title, customer, challenge, solution, results, numbers list, logo | Link to the features it used |
| Testimonial | quote, person, job title, company, photo, rating | Pointed at by landing pages |
| FAQ | question, answer, category | Category lets you build themed pages |
| Author | name, bio, photo, social links | Pointed at by posts |
| Call-to-action block | heading, body, button label, button link, variant | Dropped into any page |

## SEO block for any type that becomes a page

- Meta title (`metaTitle`): keep it short enough not to be cut off in results (about 50 to 60 characters is a starting point, not a measured value; truncation varies by search engine).
- Meta description (`metaDescription`): about 150 to 160 characters is a starting point, not a measured value.
- Share image (`ogImage`) for social cards: check each platform's current published image size before exporting.
- Slug (`slug`): the final part of the URL.
- Canonical URL (`canonicalUrl`): optional, to override the default.
- No-index switch (`noIndex`): removes a page from search results.
- Structured data (`structuredData`): optional JSON-LD that replaces the generated one.

## Before launch

- [ ] Derive the types from your page kinds and the blocks they share.
- [ ] Give each page-level type its SEO block.
- [ ] Connect a draft preview route into the site.
- [ ] Assign roles to everyone on the team.
- [ ] Fill in sample entries for each type before building templates.
- [ ] Add webhooks so edits trigger a rebuild.
- [ ] Write guidance for editors: what each field is for and its length limit.
- [ ] Measure delivery speed with the CDN, caching and regeneration settings in place.
- [ ] If content is coming from an older CMS, plan the migration up front.
