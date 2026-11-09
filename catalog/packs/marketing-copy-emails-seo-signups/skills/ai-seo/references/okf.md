# Open Knowledge Format (OKF)

A markdown specification from Google, announced as version 0.1 on 2026-06-12 and bundled in its Knowledge Catalog product. A later version is reported, so check the spec repository for the current version and fields before building. It defines a folder of linked markdown files that an agent can read directly, with no scraping.

## Shape

- Every file opens with YAML frontmatter. `type` is mandatory; `title`, `description`, `resource` (the live page URL), `tags` and `timestamp` are advised.
- The body is plain markdown, and a link from one file to another is treated as a relationship between concepts.
- An optional `index.md` lists everything, so an agent can see the whole bundle first.
- Hand it out as a git repository (best), an archive, or a subfolder inside a bigger repository.

Smallest useful file: frontmatter with type Article, title, a one-line description, the resource URL and two tags, then a heading and the post body as clean markdown.

## Say what it really is

Google made it for data teams sharing catalog metadata: tables, endpoints, metrics, playbooks. Exposing a marketing site this way is a community repurposing. Tell founders that plainly.

## Effect today

None you can see. No crawler is known to collect bundles, no AI engine has announced support, and the product that reads them is sold to enterprise data teams. Treat it as an early registration bet, similar to how early schema.org adopters waited years for a return. One gain arrives now: building a bundle maps pages as nodes and internal links as edges, so orphans and disconnected clusters show up.

## Ways to ship

1. A free web generator: give it a URL or sitemap, it crawls a limited number of pages (up to 100 per its own description), returns a bundle and a map of the page graph.
2. A free WordPress plugin (needs WordPress 6.0 and PHP 7.4, as its listing states) that serves the bundle and rebuilds it on every publish; it only reads. Confirm it is approved in the plugin directory, and scan any outside plugin under the studio's vetting rule before installing.
3. Writing files by hand, only sensible for a few pages.

Publish at an okf path on the domain, starting from its index.md. Static hosts: upload the folder. WordPress: the plugin serves it. Closed site builders that refuse custom paths: skip OKF. Then add a line to llms.txt that points to the bundle.

## Skip it if

- Very few pages (fewer than 10 is a starting point, not a measured value).
- The platform blocks custom paths.
- Nothing else machine-readable (llms.txt, schema) is kept up; OKF only adds up alongside those.
- No one can give a short slot each quarter (30 minutes is a starting point) to refresh it.

## Worth watching

A Google statement on AI Overviews or Knowledge Graph use; adoption by ChatGPT, Perplexity or Claude; a 1.0 release (the spec may break before then); public ingestion on the catalog product; who is publishing bundles (search code hosts for index.md files in okf folders).
