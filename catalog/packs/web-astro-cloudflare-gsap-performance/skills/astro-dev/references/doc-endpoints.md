# Where to Read the Astro Docs

Astro's build-with-AI guide is the authority on how to connect AI tools to the docs. If anything below disagrees with it, trust the guide:
```
https://docs.astro.build/en/guides/build-with-ai/
```

## The docs MCP

Per that guide, Astro runs a free, open-source docs MCP server that is hosted for you, so nothing is installed locally.

```
address:  https://mcp.docs.astro.build/mcp
```

Once connected, search with:
```
search_astro_docs({ query: "your topic" })
```
Tool names vary by client (Claude Code shows `mcp__astro-docs__search_astro_docs`); read your own tool list.

## Without the MCP

Earlier versions of this skill pointed at plain-text dumps of the docs (llms-full and similar). When checked on 2026-11-09 every one of those addresses returned 404 and the build-with-AI guide mentions none of them, so they are not listed here. Fetch single pages instead; the ones below all answered when checked.

Pick a page by job:

- Starting from nothing or upgrading: the upgrade guides (last block below), then the configuration reference.
- Content collections: the content collections guide, then the `astro:content` module page.
- A blog: the routing guide (dynamic routes, pagination) and the content collections guide.
- Server rendering, sessions, Actions: the matching pages in the second block.
- Styling and themes: the fonts guide, and Tailwind's own documentation for Tailwind questions.
- Deploying: the Cloudflare integration guide, or the adapter's page in the integrations area.

Routing and navigation:
```
https://docs.astro.build/en/guides/routing/
https://docs.astro.build/en/guides/middleware/
https://docs.astro.build/en/guides/internationalization/
https://docs.astro.build/en/guides/view-transitions/
```

Server side:
```
https://docs.astro.build/en/guides/on-demand-rendering/
https://docs.astro.build/en/guides/server-islands/
https://docs.astro.build/en/guides/actions/
https://docs.astro.build/en/guides/sessions/
```

Configuration:
```
https://docs.astro.build/en/reference/configuration-reference/
https://docs.astro.build/en/reference/cli-reference/
https://docs.astro.build/en/reference/error-reference/
```

Features that arrived in Astro 6 (fonts, font providers, CSP, live collections, Cloudflare):
```
https://docs.astro.build/en/guides/fonts/
https://docs.astro.build/en/reference/font-provider-reference/
https://docs.astro.build/en/reference/configuration-reference/#securitycsp
https://docs.astro.build/en/guides/content-collections/#live-content-collections
https://docs.astro.build/en/guides/integrations-guide/cloudflare/
```

Virtual modules (`astro:content`, `astro:assets`, `astro:env`, `astro:transitions`, `astro:middleware`, `astro/zod`):
```
https://docs.astro.build/en/reference/modules/astro-content/
https://docs.astro.build/en/reference/modules/astro-assets/
https://docs.astro.build/en/reference/modules/astro-env/
https://docs.astro.build/en/reference/modules/astro-transitions/
https://docs.astro.build/en/reference/modules/astro-middleware/
https://docs.astro.build/en/reference/modules/astro-zod/
```

Upgrade guides, newest first:
```
https://docs.astro.build/en/guides/upgrade-to/v7/
https://docs.astro.build/en/guides/upgrade-to/v6/
https://docs.astro.build/en/guides/upgrade-to/v5/
```
