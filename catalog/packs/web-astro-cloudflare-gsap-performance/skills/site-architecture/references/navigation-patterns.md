# Navigation Patterns

Patterns for headers, footers, sidebars, breadcrumbs and mobile, with notes on when each fits. Sample labels come from an imaginary booking app.

---

## Header

### Simple header (4-6 items)

Fits: small businesses, simple SaaS, portfolios.

```
[Logo]   Product   Plans   Notes   Team   [CTA Button]
```

- The logo goes home.
- The CTA sits furthest right and looks different from the links (filled, contrasting colour).
- Most-used items come first.
- The current page is marked: underline, bold or colour.

### Mega menu

Fits: SaaS with many features, shops with many categories, large content sites.

```
[Logo]   Product ▾   Solutions ▾   Learn ▾   Plans   Help   [CTA]
```

Opening "Product" reveals a panel:

```
┌─────────────────────────────────────────────────┐
│  Scheduling         Money           Integrations │
│  ──────────         ─────           ───────────  │
│  Booking page        Deposits       Calendar sync │
│  Team rotas          Invoices       Zoom          │
│  Waitlists           Refunds        Mailchimp     │
│  Buffers                            Xero          │
│                                                   │
│  [See every feature →]                            │
└─────────────────────────────────────────────────┘
```

- A good default is two to four columns; avoid more.
- Group by feature area, use case or audience.
- End with a "See all" link.
- Never put a dropdown inside the panel.
- Where a bare label is unclear, add a one-line description.

### Split header

Fits: products that mix a marketing site and a logged-in app.

```
[Logo]   Product   Plans   Notes        [Sign in]   [Start trial]
├── Site links (left) ─────────┘          └── Account actions (right) ──┤
```

Page links stay on the left; account actions go on the right.

---

## Footer

### Column footer (default)

Fits: most sites. Three to five themed columns.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Product          Learn            Company       Legal   │
│  ─────────        ─────            ───────       ─────   │
│  Booking          Notes            Team          Privacy │
│  Plans            Playbooks        Jobs          Terms   │
│  Integrations     Templates        Contact       Cookies │
│  Release log      Customers        Press kit             │
│  Trust centre     Events           Affiliates            │
│                                                          │
│  [Logo]  © Company Name                                  │
│  Social: [Mastodon] [YouTube] [Bluesky]                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Minimal footer

Fits: small sites and landing pages.

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]                                                  │
│  © Company  ·  Privacy  ·  Terms  ·  Say hello            │
└──────────────────────────────────────────────────────────┘
```

### Expanded footer

Fits: sites that use the footer to carry SEO pages such as comparisons, locations and resources.

```
┌──────────────────────────────────────────────────────────┐
│  Product     Learn        Compare          Who it is for │
│  Booking     Notes        Rival One        Clinics       │
│  Plans       Playbooks    Rival Two        Salons        │
│  Developers  Templates    Rival Three      Tutors        │
│                                                          │
│  Integrations             Top Reads                      │
│  Zoom        Xero         Cutting no-shows               │
│  Stripe      Mailchimp    Pricing a session              │
│                           Template: intake form          │
│                                                          │
│  [Logo]  ©  ·  Privacy  ·  Terms  ·  Trust centre        │
└──────────────────────────────────────────────────────────┘
```

---

## Sidebar

### Docs sidebar

A fixed left column of collapsible groups.

```
Start Here
  ├── Install
  ├── First Run
  └── Settings

How-to
  ├── Sign-in
  ├── Storage
  └── Going Live

Reference
  ├── HTTP API
  │   ├── Customers
  │   ├── Bookings
  │   └── Events
  └── CLI

Samples
  ├── Astro
  ├── Django
  └── Go

Release log
```

- Highlight the page being read.
- Groups collapse; the group holding the current page starts open.
- Search box at the top.
- Previous and Next links under the content.
- The sidebar stays in view while the page scrolls.

### Blog sidebar

```
Topics
  ├── Pricing (31)
  ├── Retention (12)
  ├── Hiring (8)
  ├── Tools (5)
  └── Interviews (3)

Most Read
  ├── Pricing a first session
  ├── Cutting no-shows
  └── Setting up reminders

Newsletter
  └── [Email signup form]
```

---

## Breadcrumbs

```
Home > Product > Booking
Home > Notes > Pricing > Pricing a First Session
Home > Help > Reference > Customers
```

- Use `>` or `/`, and use only one of them across the site.
- All steps are links except the page you are on, which is plain text.
- Leave the current page out of the trail when the H1 already names it.

### Breadcrumb markup

Microdata version:

```html
<nav aria-label="Breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/"><span itemprop="name">Home</span></a>
      <meta itemprop="position" content="1" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/product"><span itemprop="name">Product</span></a>
      <meta itemprop="position" content="2" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">Booking</span>
      <meta itemprop="position" content="3" />
    </li>
  </ol>
</nav>
```

JSON-LD is the better choice:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://shop.example/" },
    { "@type": "ListItem", "position": 2, "name": "Product", "item": "https://shop.example/product" },
    { "@type": "ListItem", "position": 3, "name": "Booking" }
  ]
}
```

---

## Mobile

### Hamburger

The usual choice on phones: every link folds into one icon.

- Icon (three bars) at a top corner.
- Menu opens as a full-screen layer or a slide-in panel.
- Keep the CTA visible in a sticky header so it needs no tap to reach.
- Offer search inside the menu.
- Nested items expand as an accordion.

### Bottom tab bar

Fits: web apps, PWAs, mobile-first products.

```
┌──────────────────────────────────────┐
│                                      │
│           [Page Content]             │
│                                      │
├──────────────────────────────────────┤
│  Today   Find     Add      Me        │
│   ◉       ◎        ＋      ☺         │
└──────────────────────────────────────┘
```

- A good default is three to five tabs; avoid more.
- An icon plus a text label on each.
- Make the active tab obvious.
- Put the main action in the middle.

---

## Anti-patterns

- **A crowded header** (eight or more items is a warning sign). It is hard to scan and breaks on narrow screens.
- **Dropdowns inside dropdowns inside dropdowns.**
- **Icons with no label.** Everyone has to guess what they mean.
- **Main nav hidden behind a hamburger on desktop.**
- **Navigation that changes from page to page.** It should be identical everywhere, apart from app versus marketing areas.
- **A desktop menu with no mobile plan.**
- **A footer used as a dump.** Dozens of unsorted links help no one.
- **Breadcrumbs that disagree with the URL.** The trail says "Gear > Lamp" while the address is `/store/desk-lamp-v2`.

### Quick fixes

| Symptom | Remedy |
|---|---|
| Too many nav items | Fold them into dropdowns or a mega menu |
| People cannot find pages | Add search, rename vague labels |
| Many leave right after using the nav | Offer fewer choices, label them plainly |
| SEO pages have no links | Put them in the footer or a resources section |
| Mobile nav broken | Test on actual phones, use a hamburger |

---

## Navigation and SEO

Navigation is also how crawlers find your pages, so place links on purpose. Where a page sits in the menus is a studio judgement about importance, not a published ranking rule.

- Put the pages that matter most in the header, where every visitor and crawler meets them.
- Use the footer for secondary pages such as comparison and location pages.
- Use sidebars to group a section's pages, such as blog topics or doc groups.
- Add breadcrumb markup as shown above; Google Search Central's breadcrumb structured data documentation describes it.
- Build menus from real `<a href>` links. Google Search Central's link best practices page says Google can reliably follow only those, so do not build navigation in JavaScript alone.
- Write anchors that describe the target: "Booking Features", not just "Features". The same Google page recommends descriptive anchor text.
