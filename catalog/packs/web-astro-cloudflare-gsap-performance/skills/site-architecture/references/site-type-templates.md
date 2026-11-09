# Site Type Templates

For each common kind of site: a page tree, a URL map, and a navigation suggestion. Start from the closest one and prune. All names are placeholders.

---

## SaaS marketing

### Tree

```
Home (/)
├── Product (/product)
│   ├── Booking (/product/booking)
│   ├── Rotas (/product/rotas)
│   └── Deposits (/product/deposits)
├── Plans (/plans)
├── Customers (/customers)
│   ├── Clinic story (/customers/harbor-clinic)
│   └── Salon story (/customers/loft-salon)
├── Learn (/learn)
│   ├── Blog (/blog)
│   │   └── [Post] (/blog/post-slug)
│   ├── Templates (/learn/templates)
│   │   └── [Template] (/learn/templates/template-slug)
│   └── Playbooks (/learn/playbooks)
│       └── [Playbook] (/learn/playbooks/playbook-slug)
├── Integrations (/integrations)
│   └── [Integration] (/integrations/tool-name)
├── Help (/help)
│   ├── Setup (/help/setup)
│   ├── How-tos (/help/how-to)
│   └── HTTP API (/help/api)
├── Team (/team)
│   ├── Jobs (/team/jobs)
│   └── Contact (/contact)
├── Compare (/compare)
│   └── [Rival] (/compare/rival-name)
├── Privacy (/privacy)
└── Terms (/terms)
```

### URL map

| Page | URL | Where linked | Priority |
|------|-----|-------------|----------|
| Home | `/` | Header (logo) | Critical |
| Product | `/product` | Header | High |
| Product pages | `/product/{slug}` | Header dropdown | Medium |
| Plans | `/plans` | Header | Critical |
| Customers | `/customers` | Header | Medium |
| Single story | `/customers/{slug}` | Customers dropdown | Medium |
| Blog | `/blog` | Header (under Learn) | High |
| Blog posts | `/blog/{slug}` | none | Medium |
| Integrations | `/integrations` | Header | Medium |
| Help | `/help` | Header | Medium |
| Compare | `/compare/{slug}` | Footer | High (SEO) |
| Team | `/team` | Footer | Low |

### Navigation

**Header (6 items + CTA)**: Product | Plans | Customers | Learn | Integrations | Help | [Book a demo]

**Footer columns**:
- Product: Booking, Plans, Integrations, Release log, Trust centre
- Learn: Blog, Templates, Playbooks, Customers
- Company: Team, Jobs, Contact, Press kit
- Legal: Privacy, Terms, Cookies

---

## Content or blog

### Tree

```
Home (/)
├── Blog (/blog)
│   ├── [Category: Soil] (/blog/category/soil)
│   ├── [Category: Seeds] (/blog/category/seeds)
│   ├── [Category: Pests] (/blog/category/pests)
│   └── [Posts] (/blog/post-slug)
├── Letter (/letter)
├── Library (/library)
│   ├── Month guides (/library/months)
│   │   └── [Month] (/library/months/month-slug)
│   └── Calculators (/library/calculators)
│       └── [Calculator] (/library/calculators/calc-slug)
├── About (/about)
├── Contact (/contact)
├── Privacy (/privacy)
└── Terms (/terms)
```

### URL map

| Page | URL | Where linked | Priority |
|------|-----|-------------|----------|
| Home | `/` | Header (logo) | Critical |
| Blog home | `/blog` | Header link | High |
| Category pages | `/blog/category/{slug}` | Dropdown under Blog | Medium |
| Single posts | `/blog/{slug}` | none | Medium |
| Letter | `/letter` | Header (CTA) | High |
| Month guides | `/library/months` | Header | Medium |
| About page | `/about` | Header, near the end | Low |

### Navigation

**Header (4 items + CTA)**: Blog | Library | About | Contact | [Join the letter]

**Sidebar on blog pages**: categories, most-read posts, signup box

---

## E-commerce

### Tree

```
Home (/)
├── Gear (/gear)
│   ├── Grinders (/gear/grinders)
│   │   ├── Hand grinders (/gear/grinders/hand)
│   │   │   └── [Item] (/gear/grinders/hand/item-slug)
│   │   └── [Item] (/gear/grinders/item-slug)
│   ├── Kettles (/gear/kettles)
│   │   └── [Item] (/gear/kettles/item-slug)
│   └── Scales (/gear/scales)
│       └── [Item] (/gear/scales/item-slug)
├── Bundles (/bundles)
│   └── [Bundle] (/bundles/bundle-slug)
├── Outlet (/outlet)
├── Blog (/blog)
│   └── [Posts] (/blog/post-slug)
├── About (/about)
│   └── Roastery (/about/roastery)
├── Support (/support)
│   ├── Questions (/support/questions)
│   ├── Delivery (/support/delivery)
│   ├── Returns (/support/returns)
│   └── Contact (/contact)
├── Basket (/basket)
├── Account (/account)
├── Privacy (/privacy)
└── Terms (/terms)
```

### URL map

| Page | URL | Where linked | Priority |
|------|-----|-------------|----------|
| Home | `/` | Header (logo) | Critical |
| Gear | `/gear` | Header | Critical |
| Categories | `/gear/{category}` | Header mega menu | High |
| Items | `/gear/{category}/{item}` | none | High |
| Bundles | `/bundles/{slug}` | Header | Medium |
| Outlet | `/outlet` | Header (highlighted) | High |
| Basket | `/basket` | Basket icon in the header | Critical |
| Account | `/account` | Person icon in the header | Medium |

### Navigation

**Header (5 items + cart/account)**: Gear (mega menu) | Bundles | Outlet | Blog | Support | [Basket icon] [Account icon]

**Gear mega menu**: one column per category, with a photo of a bestseller

---

## Documentation

### Tree

```
Docs Home (/docs)
├── Start (/docs/start)
│   ├── Install (/docs/start/install)
│   ├── First Project (/docs/start/first-project)
│   └── Settings (/docs/start/settings)
├── How-to (/docs/how-to)
│   ├── Task A (/docs/how-to/task-a)
│   ├── Task B (/docs/how-to/task-b)
│   └── Task C (/docs/how-to/task-c)
├── Reference (/docs/reference)
│   ├── CLI (/docs/reference/cli)
│   ├── Config file (/docs/reference/config)
│   └── Plugins (/docs/reference/plugins)
├── Samples (/docs/samples)
│   └── [Sample] (/docs/samples/sample-slug)
├── Release log (/docs/releases)
└── Troubleshooting (/docs/troubleshooting)
```

### URL map

| Page | URL | Where linked | Priority |
|------|-----|-------------|----------|
| Docs home | `/docs` | Header | High |
| Start | `/docs/start` | Sidebar (top) | Critical |
| How-to | `/docs/how-to` | Sidebar | High |
| Reference | `/docs/reference` | Sidebar | High |
| Release log | `/docs/releases` | Sidebar (bottom) | Low |

### Navigation

**Header (5 items + CTA)**: Docs | Reference | Blog | Forum | Source | [Download]

**Sidebar**: fixed on the left with Start, How-to, Reference, Samples, Release log, each expandable

**Page foot**: Previous and Next links on every doc page

---

## SaaS plus content

### Tree

```
Home (/)
├── Platform (/platform)
│   ├── Module A (/platform/module-a)
│   ├── Module B (/platform/module-b)
│   └── Module C (/platform/module-c)
├── Use cases (/use-cases)
│   ├── By job (/use-cases/job-slug)
│   └── By sector (/use-cases/sector-slug)
├── Plans (/plans)
├── Blog (/blog)
│   ├── [Category] (/blog/category/slug)
│   └── [Posts] (/blog/post-slug)
├── Learn (/learn)
│   ├── Playbooks (/learn/playbooks)
│   ├── Templates (/learn/templates)
│   ├── Recordings (/learn/recordings)
│   └── Customer stories (/learn/customer-stories)
├── Help (/help)
│   ├── Setup (/help/setup)
│   └── API (/help/api)
├── Integrations (/integrations)
│   └── [Integration] (/integrations/slug)
├── Compare (/compare)
│   └── [Rival] (/compare/rival-slug)
├── Company (/company)
│   ├── Jobs (/company/jobs)
│   └── Contact (/contact)
├── Privacy (/privacy)
└── Terms (/terms)
```

### Navigation

**Header (7 items + CTA)**: Platform | Use cases | Plans | Learn | Blog | Help | Integrations | [Try it free]

Give Platform (the module list), Use cases (jobs and sectors) and Learn (playbooks, templates, recordings, customer stories) a mega menu each.

---

## Small or local business

### Tree

```
Home (/)
├── Services (/services)
│   ├── Service A (/services/service-a)
│   ├── Service B (/services/service-b)
│   └── Service C (/services/service-c)
├── Our Story (/our-story)
├── Reviews (/reviews)
├── Blog (/blog)
│   └── [Posts] (/blog/post-slug)
├── Find Us (/find-us)
├── Privacy (/privacy)
└── Terms (/terms)
```

### URL map

| Page | URL | Where linked | Priority |
|------|-----|-------------|----------|
| Home | `/` | Header (logo) | Critical |
| Services | `/services` | Header | High |
| Each service | `/services/{slug}` | Dropdown under Services | High |
| Our Story | `/our-story` | Header | Medium |
| Reviews | `/reviews` | Header | Medium |
| Blog | `/blog` | Header | Medium |
| Find Us | `/find-us` | Header (CTA) | High |

### Navigation

**Header (4 items + CTA)**: Services | Our Story | Reviews | Blog | [Find Us]

Stay flat, one or two levels at most. Every page should be reachable from the header.
