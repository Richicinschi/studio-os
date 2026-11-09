---
name: build-local-site
description: Build a full local-business site (80-100+ pages) with Astro 7, Tailwind v4 and Cloudflare Pages: service/area combo pages, blog, schema and internal links, all aimed at local search. Use to build or improve a plumber, HVAC, dentist, roofing or other trade website.
triggers:
  - service area pages
  - build a website for my
  - improve this local business site
  - build a plumber website
  - create service pages for
  - build a roofing website
  - local business site builder
  - build a dentist website
  - programmatic SEO site
  - build an HVAC website
  - create a website for my business
  - build a cleaning website
  - build a local business website
  - build a pest control website
  - build an electrician website
  - build a landscaping website
metadata:
  category: web
  author: Richicinschi
  domain: programmatic local-search sites for trades and restaurants, built for agency clients
---

# Build a local business site

Output: a static Astro site, 80 to 100+ pages, built to rank for searches like "leak repair in Fairmont". Everything is generated from four data files, so the page count grows by editing lists, not pages.

## What gets built

- Home page: hero, service cards, areas, reviews, schema
- One page per service
- One page per area
- One combo page per service and area pair (most of the pages)
- Blog on Markdown content collections
- Contact page with form and opening hours
- About page with owner story and credentials
- Sitemap, robots.txt, canonical URLs
- JSON-LD on every page: LocalBusiness, Service, FAQPage, BreadcrumbList
- A full internal-link mesh across services, areas and combos

## Inputs to collect

Must have:
- business name and owner name
- trade (plumber, HVAC, dentist, electrician and so on)
- phone number
- the services offered (5 to 10 recommended)
- the towns served (8 to 15 recommended)
- street address (city, state, zip)
- year founded
- licence or certification number

Nice to have:
- live site URL (canonical links and schema)
- email, opening hours, price ranges per service
- real customer reviews only; never invent any
- GA4 measurement id
- Gemini key, to generate service pictures
- Cloudflare account, for free hosting

## Starting a job

The owner can open with one sentence, for example: "Build a site for Riverbend Plumbing in Fairmont. We cover three counties and do leak repair, water heaters, drain cleaning, repiping and sewer lines." Ask for whatever from the lists above is still missing, then generate the site.

## Stack

| Tool | Job |
|---|---|
| Astro 7 | static pages, file-based routing |
| Tailwind CSS v4 | tokens in CSS via @theme, @utility, @layer |
| Cloudflare Pages | free hosting on a CDN |
| astro-icon + Lucide | inline SVG icons |
| @astrojs/sitemap | sitemap file |

## How many pages

pages = services x areas + services + areas + 5 fixed pages + blog posts

For example 8 services and 10 areas give 80 combo pages, plus 8 service pages, 10 area pages and 5 fixed pages: **103**, before any posts.

## Files

- `build-local-site/references/local-business-guide.md`: the rulebook (Astro and Tailwind pitfalls, SEO limits, schema types per trade, link rules, design, data shapes, checklist). Read all of it before building.
- `build-local-site/templates/`: ready files to copy, with `scaffold.json` listing each file, its placeholders and its required fields.
