# Editorial workflow, roles and platforms

## Publishing cycle

1. Draft: an author writes or edits.
2. Review: an editor checks accuracy, brand voice and SEO.
3. Approve: a stakeholder signs off.
4. Schedule: set the date and time.
5. Publish: the content goes live through the API.

## Draft preview

The big platforms can all show unpublished content.
- Sanity: draft preview through its Presentation tool (visual editing). For Next.js the current route is the `defineLive` helper from the next-sanity package; the older `useLiveQuery` hook from the preview-kit package is no longer actively developed, so check the vendor's current documentation before using it.
- Contentful: the Preview API at `preview.contentful.com`, which takes its own access token.
- Strapi (version 5): the draft and publish system, queried with `status=draft`. This replaces the `publicationState` parameter of version 4.

Add a preview route in the front end (for example `/api/preview`) that authenticates the visitor and renders drafts.

## Roles

- Author: can create entries, edit only their own, cannot publish, can remove their own drafts.
- Editor: can create, edit any entry, publish, and remove drafts.
- Admin: full rights, including removing published entries.

Exact models differ. Sanity uses role-based access, Contentful uses roles per space, Strapi offers fine-grained role control.

## Three platforms compared

| | Sanity | Contentful | Strapi |
|---|---|---|---|
| Hosting | managed cloud | managed cloud | self-hosted or cloud |
| Queries | GROQ | REST or GraphQL | REST or GraphQL |
| Free plan | generous | limited | open source, free |
| Live co-editing | yes | limited | no |
| Best for | developer freedom | multi-language enterprises | tight budgets, self-hosting |
| Modelling | schema in code | web interface | web interface or code |
| Media | built-in asset manager | built-in | via plugins |

**Sanity.** Strong: flexible query language, schema kept in version control, live collaboration, portable rich text, free plan. Watch: harder for non-developers, studio customization needs React, queries tie you to the vendor. Fits teams where developers and marketers work side by side on content-heavy sites with complex models.

**Contentful.** Strong: mature, excellent multi-language support, many integrations, well-documented APIs. Watch: cost rises with content types and locales, there are several APIs (delivery, preview and management, plus GraphQL), rate limits are tight on low plans. Fits enterprises serving several markets that want an established vendor.

**Strapi.** Strong: open source, self-hostable, you own the data, no per-seat fee, customizable admin, plugins, REST by default and GraphQL by plugin. Watch: you run the infrastructure, the ecosystem is smaller, moving from version 4 to 5 can be big work. Fits teams with operations skills who want control and no lock-in on a budget.

## Others to know

- Hygraph: built on GraphQL, good for combining several sources.
- Keystatic: stores content in Git, suits developer-and-writer hybrids.
- Payload: TypeScript first, self-hosted, configured in code.
- Builder.io: visual editor on a headless backend, friendly to non-technical marketers.
- Prismic: slice-based modelling, strong with Next.js.

Any paid plan, hosting purchase or account creation needs the user's go-ahead, with the cost stated first.
