# Local site build guide

Read this before touching a local-business site. It is the rulebook for the Astro, Tailwind and schema work in `build-local-site`, and the agent building the site must follow every rule in it exactly, with no exceptions: a break fails the build or costs search visibility. Ready-made files sit in `../templates/`; copy them rather than retyping, and use this guide to decide what goes in them.

On numbers: the title and description lengths in section 6 are rules of this guide, followed exactly like the others; they are SEO conventions the studio has adopted, not search-engine requirements. The remaining counts and sizes (areas and services per site, word targets, image sizes, shade lightness, FAQ counts) are working defaults, not platform requirements, unless a published source is named beside them.

Contents: 1 Copy rules, 2 Stack and layout, 3 Astro rules, 4 Tailwind rules, 5 URLs, 6 On-page SEO, 7 Schema, 8 Internal links, 9 Design, 10 Colour by trade, 11 Data files, 12 Page layouts, 13 Content targets, 14 Images, 15 Deploy, 16 Final checklist.

A note on names: the page templates read the field names listed in section 11. The data templates in `templates/src/data/` use those same names. If you add a field, add it to the interface and to every page that needs it.

---

## 1. Copy rules

- No em dashes. Reach for a colon, comma, brackets or a new sentence.
- Reviews must be real. If none exist yet, leave an empty array and a comment such as `// PLACEHOLDER: add real reviews`. Never make one up.
- Aim at an eighth-grade reading level: short sentences, jargon only when explained.
- Write numbers below ten as words, ten and above as digits.
- Every call to action carries the business's true phone number. No dummy numbers.
- FAQ answers run two or three sentences, and at least two of them name the business and give its phone number.

## 2. Stack and layout

The stack below is fixed (non-negotiable): do not swap in another framework, CSS system or host.

| Piece | Version | Role |
|---|---|---|
| Astro | 7 (the pinned templates) | static pages, file routing |
| Tailwind CSS | 4 | tokens in CSS through `@theme`, `@utility`, `@layer` |
| Cloudflare Pages | n/a | free hosting on a global CDN |
| astro-icon + Lucide | 1.x | inline SVG icons |
| @astrojs/sitemap | 3.x | sitemap generation |

`templates/package.json` is the source of truth for exact versions. Older notes that say "Astro 5" are out of date: the scaffold in `templates/` was built on Astro 7 following the rules in section 3. Cloudflare Pages can also run Workers for any route that must render on the server.

Set up a project by copying `templates/` and running `npm install`. The templates carry sample text that belongs to the sample business and must be replaced: the brand name in `SEO.astro`, `Header.astro`, `Footer.astro`, `BaseLayout.astro` and `content.config.ts`; `TX`, the sample town and the sample county names in page titles and copy (`services/[service].astro`, `areas/index.astro`, `blog/`, `contact.astro`, `index.astro`, `about.astro`); the trade words ("plumbing", "plumber") in `SeoFaq.astro` and the page copy; the `TRADE_NOUN` token in `seoContent.ts`; the sample badges ("BBB A+", "24/7") and sample promises (reply time on the contact page, "repairs finish in a day" on the home page) unless the business can stand behind them; the form `action` on the contact page; and the GA4 id in `BaseLayout.astro`. To start from nothing instead, create a minimal Astro project (`npm create astro@latest -- --template minimal`) and install `@astrojs/cloudflare @astrojs/sitemap @tailwindcss/vite @tailwindcss/typography tailwindcss astro-icon`, plus `@iconify-json/lucide` as a dev dependency.

Folder map of a finished site:

```
astro.config.mjs  tsconfig.json  package.json
public/           favicon.ico, favicon.svg, robots.txt, images/ (hero.webp, <service-slug>.webp)
src/content.config.ts        blog collection schema
src/content/blog/            Markdown posts
src/components/              SEO, Header, Footer, Breadcrumbs, SeoFaq,
                             SeoRelatedLinks, SeoServiceAreas, SeoTestimonials
src/data/                    business.ts, serviceAreas.ts, serviceTypes.ts, seoContent.ts
src/layouts/BaseLayout.astro
src/lib/urls.ts
src/pages/                   index, about, contact,
                             services/index, services/[service], services/[area]/[service],
                             areas/index, areas/[area], blog/index, blog/[slug]
src/styles/global.css
```

`templates/astro.config.mjs` is the working config: static output, `trailingSlash: 'always'`, the Tailwind Vite plugin, the sitemap (with `/admin/` and `/api/` filtered out) and the Cloudflare adapter. Only `site` needs your value.

## 3. Astro rules

These rules are non-negotiable. Break one and the build fails or the site misbehaves.

- Output stays `static`. Astro's version 5 upgrade guide removed the `hybrid` output value; a route that must run on the server opts out with `export const prerender = false`.
- Tailwind goes in through `vite.plugins`, as `tailwindcss()`. It is not an integration any more.
- There is no `tailwind.config.js`. All tokens live in `global.css` under `@theme`.
- Set `trailingSlash: 'always'`.
- The collection config file is `src/content.config.ts`, not `src/content/config.ts`.
- Collections load with `glob()` from `astro/loaders`.
- A post is rendered with `render(entry)` imported from `astro:content`, not `entry.render()`.

The blog schema (full file in `templates/src/content.config.ts`) holds: title, description, publishDate (string), author, category (enum), tags, readingTime (optional), featured. The template's category enum is `emergency | tips | maintenance | news`; change it to suit the trade. (An earlier version of this guide showed `tips | maintenance | news | guides`; either is fine, but the blog pages and the schema must list the same values.)

A post page builds its paths from `getCollection('blog')` using `post.id` as the slug, then renders `<Content />` inside a `prose-editorial` container. See `templates/src/pages/blog/[slug].astro`.

## 4. Tailwind v4 rules

| Do | Don't |
|---|---|
| Put every token in `@theme` inside CSS | Look for or create `tailwind.config.js` |
| Load plugins with `@plugin "@tailwindcss/typography"` | Import plugins from JavaScript |
| Begin the stylesheet with `@import "tailwindcss"` | Use the old `@tailwind` directives |
| Use `@utility` only for plain declarations (delays, glass) | Put `:hover`, `::before` or `::after` inside `@utility` |
| Write hover, focus and pseudo-element styles in `@layer components` | Define hover or focus effects with `@utility` |
| Space children with explicit `mt-*` classes when gaps are large | Rely on `space-y-*` for large gaps (this guide avoids it there) |

`templates/src/styles/global.css` has the whole structure: fonts, the eleven-step brand scale, neutrals, amber, four animations with keyframes, six stagger delays, glass utilities, `editorial-line`, `card-hover` and the `prose-editorial` reading style. Fill in `__FONT_DISPLAY__`, `__FONT_BODY__` and the `__BRAND_*__` shades; leave the rest. The stylesheet also holds an `@source inline(...)` line that makes Tailwind emit the six `stagger-N` classes, which the pages build from a number at render time; the Tailwind CSS v4.1 release announcement introduced that directive.

## 5. URLs

Every URL ends in a slash.

- Home: `/`
- Services list: `/services/`; one service: `/services/<service>/` (for example `/services/leak-repair/`)
- Areas list: `/areas/`; one area: `/areas/<area>/` (for example `/areas/fairmont/`)
- Combo page: `/services/<area>/<service>/` (for example `/services/fairmont/leak-repair/`)
- `/about/`, `/contact/`, `/blog/`, and `/blog/<slug>/`

Build every link with the helpers in `src/lib/urls.ts`: `serviceUrl`, `areaUrl`, `comboUrl(area, service)`, `contactUrl`, `aboutUrl`, `blogUrl(slug?)`. Hand-written paths drift; helpers do not.

## 6. On-page SEO

Titles: at most 60 characters with the brand included (a studio rule):
- combo page: `<Service> in <Area>, <State> | <Brand>`
- service page: `<Service> Services | <Brand>`
- area page: `<Trade> in <Area>, <State> | <Brand>`
- home: `<Brand> | <City> <State> <Trade>`

Meta descriptions: 140 to 155 characters (a studio rule). Each must contain the phone number as the call to action, and must name the area and the service where the page has them. A pattern that works: "Need X in Y? Brand offers Z. Call 555-0100."

Every page needs: exactly one H1, a title, a description, an absolute canonical URL, Open Graph tags, a Twitter card, JSON-LD, and alt text on every image. `templates/src/components/SEO.astro` produces all the head tags; it appends the brand to a title that lacks it, builds the canonical from the request path when none is passed, and supports `noindex`. Change its `SITE_NAME` constant.

## 7. Schema markup

### Type by trade

Use the most specific schema.org type that exists, and put it in `business.schemaType`. Pick the specific type when one exists rather than defaulting to `LocalBusiness`.

Direct types: plumber `Plumber`; heating and cooling `HVACBusiness`; electrician `Electrician`; locksmith `Locksmith`; roofer `RoofingContractor`; dentist `Dentist`; general contractor `GeneralContractor`; car repair `AutoRepair`; removals `MovingCompany`; lawyer `Attorney`; accountant `AccountingService`; estate agent `RealEstateAgent`; vet `VeterinaryCare`; hair and barber shops `HairSalon`; spa `DaySpa`; restaurant `Restaurant`; gym `HealthClub`; painter `HousePainter`.

Closest fit or a parent type:
- house cleaning: no dedicated type, so use `HomeAndConstructionBusiness`, or `LocalBusiness` plus a descriptive `additionalType`
- landscaping: `HomeAndConstructionBusiness` plus `additionalType`
- flooring, garage doors: `HomeAndConstructionBusiness` plus `additionalType`
- handyman: `HomeAndConstructionBusiness`
- photography, pressure washing, window cleaning: `LocalBusiness` plus `additionalType`
- tutoring: `EducationalOrganization` plus `additionalType`

`LocalBusiness` with a descriptive `additionalType` text value, for trades with no type of their own (these strings are descriptions, not schema.org types): pest control `PestControlService`; pet grooming `PetGrooming`; towing `TowingService`; tree work `TreeRemovalService`; carpet cleaning `CarpetCleaningService`; appliance repair `ApplianceRepairService`.

When nothing matches, take `LocalBusiness` and add the most specific `additionalType` you can (a URL from another vocabulary or a plain descriptive string; schema.org says to use text sparingly, when no suitable type exists). Every type name used in this guide and the templates was checked against the schema.org type tree.

### Home page

The home page must carry one `@graph` with three nodes, linked by `@id`:
1. `WebSite`: url, name, description, publisher pointing at the business node.
2. The business, typed from `schemaType`: legal name, url, phone, email, description, founder (a Person), founding year, postal address, geo coordinates, opening hours, `areaServed` (one City per area with its county as `containedInPlace`), and an `OfferCatalog` listing every service.
3. `WebPage`: `isPartOf` the website, `about` the business.

```ts
const ids = { site: `${b.website}/#website`, biz: `${b.website}/#business`, page: `${b.website}/#webpage` };
const graph = [
  { '@type': 'WebSite', '@id': ids.site, url: b.website, name: b.name, publisher: { '@id': ids.biz } },
  { '@type': b.schemaType, '@id': ids.biz, name: b.name /* ...address, geo, hours, areaServed, catalog */ },
  { '@type': 'WebPage', '@id': ids.page, isPartOf: { '@id': ids.site }, about: { '@id': ids.biz } },
];
```

### Combo page

Every combo page needs two nodes: a `Service` and a `BreadcrumbList`. The service names "<Service> in <Area>", gives its `@id` as page URL plus `#service`, sets `provider` to the business (with credential, founder and address), `areaServed` to the single City, and `offers` as an `AggregateOffer` with `lowPrice`, `highPrice` and `priceCurrency`. The breadcrumb has four items: Home, Services, the area, and the service (the last without `item`). The finished version is `templates/src/pages/services/[area]/[service].astro`.

### FAQ

Any page that shows FAQs must also print a `FAQPage` whose `mainEntity` is a list of `Question` objects, each with an `acceptedAnswer` of type `Answer`. `SeoFaq.astro` already does this.

## 8. Internal linking

Internal links are how visitors and search engines reach the many generated pages, so each page type must carry the links below. Follow these rules exactly:

| Page | Must link to |
|---|---|
| Combo page | every other service in the same area, and the same service in each nearby area |
| Service page | every combo page for that service, and the contact page |
| Area page | every combo page for that area, each nearby area, and the contact page |
| Blog post | two or three service pages, one or two area pages, and the contact page at least once |

`SeoRelatedLinks.astro` handles the combo-page pair (siblings and neighbours) and `SeoServiceAreas.astro` handles the "other areas" grid. Neighbours come from each area's `nearby` list of slugs; unknown slugs are dropped.

## 9. Design system

**Fonts.** Two Google fonts: a display face for headings (H1, H2, H3) and a clean sans for paragraphs, labels and interface text. Pairings by tone:

- traditional and professional: DM Serif Display with DM Sans
- modern and tidy: Inter for both
- friendly: Nunito with Open Sans
- premium: Playfair Display with Lato
- industrial and strong: Oswald with Source Sans 3
- clinical: Merriweather with Roboto

Whichever pair you choose, change the `<link>` in `BaseLayout.astro` and the two font tokens in `global.css` together.

**Phone button.** The number is visible on every page through a sticky header button (an icon, the number on wide screens, "Call Now" on narrow ones). `Header.astro` has it.

**Trust signals.** Show four per page, picked from: years in business; licence or certification number; BBB rating or trade accreditation; round-the-clock availability (only if true); jobs completed; satisfaction guarantee; insurance; count of five-star reviews. Do not show a badge the business cannot back up.

**Mobile menu.** A hamburger that toggles a hidden panel and swaps two icons, in plain JavaScript with no framework. Element ids used by the template: `mobile-menu-btn`, `mobile-menu`, `menu-icon-open`, `menu-icon-close`.

**Card hover.** A small lift and shadow, written in `@layer components` (see section 4).

## 10. Colour by trade

Pick the brand hue from what the trade needs to say. The anchor is the `brand-500` shade.

- plumbing: blue `#3b82f6` (trust, water)
- heating and cooling: cyan `#06b6d4` (cool air, technology)
- electrical: amber `#f59e0b` (energy, caution)
- roofing: slate `#64748b` (strength, shelter)
- landscaping: green `#22c55e` (growth)
- pest control: red-orange `#ef4444` (urgency)
- dentist: sky blue `#0ea5e9` (clean, calm)
- vet: warm green `#16a34a` (care)
- cleaning: light blue or teal `#06b6d4` (fresh)
- lawyer: navy `#1e3a5f` (authority)
- accountant: dark teal `#0d9488` (stability)
- auto repair: red `#dc2626` (power)
- locksmith: charcoal `#374151` (security)
- movers: orange `#f97316` (movement)
- hair salon: pink `#ec4899` (style)
- photography: warm grey `#78716c` (focus)
- general contractor: brown-amber `#b45309` (solid, earthy)
- painting: indigo `#6366f1` (creativity)
- garage doors: steel blue `#3b82f6` (industrial)
- tree service: deep green `#15803d` (outdoors)
- pressure washing: bright blue `#2563eb` (power, water)
- handyman: warm orange `#ea580c` (approachable)
- spa: sage `#86efac` (calm)
- restaurant: red `#dc2626` (appetite)
- gym: red or black `#dc2626` (intensity)

**Building the other ten shades.** Hold the hue steady and move lightness from a very light value at shade 50 (start near 97%) down to a very dark one at shade 950 (start near 8%), trimming saturation a little at both ends. These start values are a rule of thumb; adjust by eye. Roles: 50 is a near-white tint; 100 and 200 are backgrounds and hover fills; 300 and 400 are borders and secondary parts; 500 is the anchor; 600 and 700 are text and primary buttons; 800 and 900 are headings and hero backgrounds; 950 is a near-black with a hint of the hue.

**Accent.** Amber is the call-to-action colour on every site whatever the brand hue: 400 `#fbbf24`, 500 `#f59e0b`, 600 `#d97706`. It contrasts with any brand colour and reads as "act here".

## 11. Data files

Four files in `src/data/` drive every page. Fill each with real facts; the templates carry `__TOKENS__` where values go.

**business.ts** (type `Business`). Required fields: `name`, `legalName`, `owner`, `phone`, `phoneHref` (a `tel:` link), `email`, `website` (https, no trailing slash), `address {street, city, state, stateCode, zip, country}`, `coordinates {lat, lng}`, `hours [{days, hours, dayOfWeek, opens, closes}]` (`dayOfWeek` lists schema.org day names, `opens` and `closes` are 24-hour "HH:MM"; rows without them are left out of the opening-hours markup), `license`, `yearEstablished`, `serviceRadius` (words, such as "two named counties"), `schemaType` (from section 7), `description` (one or two sentences), `tagline`. The template also carries `shortName`, social links, certifications, emergency flags and logo paths. `yearsInBusiness()` is exported for copy that quotes experience, and `openingHoursSchema()` builds one OpeningHoursSpecification per row of hours.

**serviceAreas.ts** (type `ServiceArea`). Fields: `slug`, `name`, `county`, `state`, `zipCodes`, `population`, `lat`, `lng`, `description` (two or three sentences on the place and what people there need), `priority` (`primary`, `secondary` or `tertiary`), `responseTime` (text such as "45 minutes"), `featured`, `nearby` (slugs). Aim for eight to fifteen areas. Helpers: `getAreaBySlug`, `getNearbyAreas` (takes an area or a slug), `getAreaName`, `getFeaturedAreas`, `getCounties`.

**serviceTypes.ts** (type `ServiceType`). Fields: `slug`, `name`, `shortName`, `shortDescription` (one sentence), `description` (two or three), `image`, `icon` (as `lucide:name`), `emergency`, `featured`, `processSteps` (exactly four `{title, description}`), `priceRanges` (one or more tiers, each `{label, min, max, unit?}` in dollars), `keywords`, `relatedServices`. Aim for five to ten services. Helpers: `getServiceBySlug`, `getServiceName`, `getPriceSpan` (lowest min and highest max across tiers, used for headlines and schema), `getEmergencyServices`, `getFeaturedServices`, `getRelatedServices`.

**seoContent.ts.** `generateFaqs(area, service?)` returns five questions: cost, arrival time, licence and insurance, out-of-hours service, other nearby towns. `reviews` starts empty. `getReviewsForPage(areaSlug?, serviceSlug?, count = 3)` ranks by two points for an area match and two for a service match. Note the argument order (area first); an earlier template took the service first and defaulted to six. Rating blocks and `aggregateRating` schema are skipped while `reviews` is empty, and price text and price schema are skipped for any service with no prices (`hasPrices`). `getAggregateRating()` feeds rating schema.

## 12. Page layouts

**Combo page, the money page.** Each one targets a "service in area" search. Sections in order: breadcrumbs; hero with the H1, icon and image; emergency banner (only when `service.emergency`); local description; price range; four process steps; four reasons to choose the business; call to action with phone and contact buttons; related links; other-area links; matched reviews; FAQ with schema.

Paths come from nesting the two data lists:

```ts
export const getStaticPaths = () =>
  serviceAreas.flatMap((area) => serviceTypes.map((service) => ({ params: { area: area.slug, service: service.slug }, props: { area, service } })));
```

**Home page.** Hero with gradient, H1, tagline and two buttons; a four-item trust strip; service cards; a four-step "how we work" section with tabs; a scrolling reviews strip; area cards; a full-width call to action.

## 13. Content targets

| Page | Starting word target (a working default, not a ranking guarantee) |
|---|---|
| Home | 500, mostly in hero, services and process sections |
| Combo | 800, description plus FAQ answers add up |
| Service | 600, description, process and FAQ |
| Area | 500, area text, services list and FAQ |
| About | 400, owner bio, credentials, history |
| Contact | 200, form, hours, map embed |
| Blog post | 800 to 1500, long-form teaching content |

Tone by trade (keep the reading level from section 1):
- plumbing, heating, electrical: dependable and direct, such as "We fix it right the first time."
- medical and dental: caring and professional, such as "Your comfort and health are our priority."
- legal and financial: assured and reassuring, such as "Protecting your rights with experienced counsel."
- beauty and spa: warm and personal, such as "Your perfect look starts here."
- fitness: energetic and motivating, such as "Push your limits. We are here to help."
- cleaning and pest control: crisp and efficient, such as "A cleaner home is just a call away."
- landscaping and trees: natural and expert, such as "Bringing your outdoor vision to life."
- auto and mechanical: tough and honest, such as "Honest work at a fair price."

FAQ rules: exactly five questions per block; each question includes the area and service; answers run two or three sentences; at least two answers show the phone number, at least two show the business name, and at least one mentions the licence.

## 14. Images

| File | Path | Size | Use |
|---|---|---|---|
| Hero | `/images/hero.webp` | 2048 x 2048 | home hero |
| One per service | `/images/<service-slug>.webp` | 1024 x 1024 | cards and headers |
| Share image | `/og-default.webp` | 1200 x 630 | Open Graph fallback |
| Icons | `/favicon.svg`, `/favicon.ico` | n/a | browser tab |

All images are WebP. Hero images load `eager`, everything else `lazy`. Always give `width` and `height` so the layout does not jump. Alt text describes the picture and, where it fits, names the service and the area.

Optional: with a Gemini key and the `nano-banana-pro` skill installed, a service picture can be generated:

```bash
python3 ~/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "Tradesperson doing [service] in a [area] home, realistic photo, bright light" \
  --output public/images/[service-slug].webp
```

Without it, drop in placeholder images and leave a comment saying they need replacing.

## 15. Deploy

Cloudflare Pages, steps: push the repo to GitHub; create a Pages project from it; build command `npm run build`; output directory `dist`; no environment variables needed for a static site.

`public/robots.txt` allows everything and points at `<site>/sitemap-index.xml`.

After building, check:

```bash
npm run build
find dist -name index.html | wc -l   # should equal the expected page count
cat dist/sitemap-index.xml   # exists and lists pages
head -50 dist/services/<area>/<service>/index.html   # spot-check one combo page
```

## 16. Final checklist

Run every item before calling a site complete.

Data
- [ ] `business.ts` holds real, complete facts
- [ ] 8 to 15 areas, each with coordinates, nearby slugs and a description
- [ ] 5 to 10 services, each with prices and four process steps
- [ ] the FAQ builder returns five questions for each area and service pair
- [ ] `schemaType` suits the trade

Pages
- [ ] home builds with WebSite, business and WebPage schema
- [ ] every combo, service and area page is generated
- [ ] about page with owner story and credentials
- [ ] contact page with form, hours and phone
- [ ] blog index and at least one post
- [ ] a 404 page

SEO
- [ ] unique titles of 60 characters or fewer
- [ ] descriptions of 140 to 155 characters
- [ ] one H1 per page
- [ ] canonical, Open Graph and Twitter tags everywhere
- [ ] JSON-LD everywhere
- [ ] sitemap lists every page; robots.txt points to it
- [ ] the internal link rules in section 8 are met

Design
- [ ] phone button in the sticky header
- [ ] trust signals on every page
- [ ] mobile menu works without a framework
- [ ] hover effects live in `@layer components`
- [ ] two fonts loaded
- [ ] brand scale 50 to 950 defined in `@theme`
- [ ] amber on call-to-action buttons
- [ ] every image has alt, width, height and a loading mode

Technical
- [ ] `output: 'static'` and `trailingSlash: 'always'`
- [ ] Tailwind loaded through `vite.plugins`
- [ ] no `tailwind.config.js`
- [ ] collection config at `src/content.config.ts`
- [ ] `npm run build` ends with no errors
- [ ] page count equals services x areas + services + areas + static pages
