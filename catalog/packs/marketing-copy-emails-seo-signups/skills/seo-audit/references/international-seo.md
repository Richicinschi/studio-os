# International SEO checks

Run this only when the site serves more than one language or region. A single bad setting here can hide a whole set of locale pages from the index.

## Hreflang

Three ways to declare alternates: link elements in the page head, HTTP Link headers, or alternate entries in the XML sitemap. Google documents them as equivalent, and using several adds no benefit and makes upkeep harder, so pick one. If you do run more than one, make sure they say the same thing: conflicting annotations for one language-region pair can cause that pair to be ignored (the vendor does not state the exact resolution, so check its current documentation). With many locales (ten or more is a rule of thumb), the sitemap route is cheaper because it adds no weight to each page.

Checks for each page:
- It lists itself in its own set. Without the self entry the whole set may be ignored.
- Every link is returned. If the German page names the Dutch page, the Dutch page must name the German one. Without the return link, both annotations may be ignored.
- Codes are a two-letter language, optionally followed by a two-letter region. A region alone is invalid. Use `en-GB`, not `en-UK`.
- An `x-default` entry points to the fallback: a language chooser or the default locale.
- Each target answers 200, is indexable, and is its own canonical.
- One code never points at two different URLs.

Typical failures: missing self entry, one-way links, bad codes, targets that redirect, 404 or are blocked, and head markup that contradicts the sitemap.

At scale: alternate entries do not count against the sitemap protocol's cap of 50,000 URLs per file, but the protocol's 50 MB uncompressed cap does bite. With a full set of alternates per URL, plan fewer URLs per file (roughly 2,000 to 5,000 is a starting point, not a measured value). You do not need hreflang on every page; start with pages that already receive visitors in the wrong language. Declare it only for locales that have real content and real search demand. Bing leans on the page language attribute and a content-language meta tag more than on hreflang, so set both if Bing traffic matters.

## Canonicals on multilingual sites

- Each locale page names itself as canonical.
- Never point a translated page's canonical at another language. That tells the engine to drop the translation.
- The canonical URL must belong to the hreflang set, otherwise the set is ignored. When canonical and hreflang conflict, canonical wins.
- Scheme and host must match across canonical, hreflang and sitemap (same https, same www choice).
- Paginated pages each get their own self canonical, in every locale. Do not canonical page 3 to page 1.
- Near-identical regional variants (for example a UK and an Irish English page that differ only in a phone number) may be folded into one by the engine before hreflang is even read. Give each real regional content differences or accept one page.

Watch for: every locale canonicalised to English, canonical missing from the hreflang set, http versus https mismatch, and a CMS rule that canonicals deep pages to the home page.

## International sitemaps

- The urlset declares the xhtml namespace (take the exact namespace string from the sitemap protocol docs).
- Each url entry carries alternates for all locales, including its own, plus x-default.
- All URLs are absolute, with scheme and host.
- Submit the sitemap index in Search Console and name it in robots.txt.
- Split files by content type (articles, products), not by locale, because each locale file would otherwise have to repeat every other locale.
- Next.js metadata API: `alternates.languages` is reported not to add the self entry for the page's own URL, so include the current locale yourself and check the framework's current documentation.

## URL structure per locale

- Best: a folder per locale (`/de/`, `/nl/`). Acceptable: subdomains or country domains. Avoid a query parameter such as `?lang=de`.
- Prefix every locale, including the default. If one locale has no prefix, the engine cannot tell the versions apart. In next-intl style routers use the always-prefix mode; the never-prefix mode turns alternate links off.
- The root URL either redirects to a locale and is marked `x-default`, or serves the default locale.
- No switching by visitor IP or Accept-Language. The crawler comes from US addresses and sends no language header, so it would only ever see one version.
- Trailing slash and letter case are the same everywhere: paths, canonicals, hreflang, sitemaps. Redirect the other form with a 301.
- The old International Targeting report in Search Console is retired; targeting now comes from hreflang, the language of the content and link patterns. Add a property per folder if you want per-locale reports.

## Quality across locales

- Machine translation is not spam in itself. Mass-producing low-value translated pages can fall under the scaled content abuse policy.
- Language is judged from visible text, so translate everything: title, description, headings, body. Translating only menus and footers leaves duplicates.
- Quality is judged for the whole site. Many thin locale pages can pull down strong ones.
- Do not noindex thin locales (wastes crawl) and do not canonical them to another language (conflicts with hreflang). Better not to publish a locale page you cannot make useful.
- Crawl budget matters mainly on very large sites or sites whose pages change daily (read the search engine's crawl budget guidance for its current thresholds), but alternate URLs do use it, and broken hreflang targets waste it and void the cluster.
- Add local signals where real: currency, phone format, postal address, local links.

Findings to look for in Search Console: "Duplicate, Google chose different canonical" on locale pairs, and hreflang targets reporting errors.
