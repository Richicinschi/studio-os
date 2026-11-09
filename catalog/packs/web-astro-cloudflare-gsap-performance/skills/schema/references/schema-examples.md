# Schema markup samples

JSON-LD samples with invented values on reserved example domains. Replace the values, and check each feature's current Google page before relying on it. Ellipses never appear inside the samples, so each block is valid JSON.

Order: types with a Google rich result first, then a combined graph, then a framework component, then markup Google no longer rewards.

## Organization

A company or brand, on the home or about page.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Fernhill Works",
  "url": "https://fernhill.example",
  "logo": "https://fernhill.example/img/logo.png",
  "sameAs": [
    "https://social.example/fernhillworks",
    "https://network.example/company/fernhill-works"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+31-20-555-0100",
    "contactType": "customer service"
  }
}
```

---

## Article

A post or news story. BlogPosting is a subtype and works the same way.

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Five Mistakes to Avoid When Adding JSON-LD",
  "image": "https://fernhill.example/img/json-ld-mistakes.jpg",
  "datePublished": "2026-03-02T09:30:00+01:00",
  "dateModified": "2026-03-09T14:00:00+01:00",
  "author": {
    "@type": "Person",
    "name": "Sam Veldt",
    "url": "https://fernhill.example/team/sam"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Fernhill Works",
    "logo": {
      "@type": "ImageObject",
      "url": "https://fernhill.example/img/logo.png"
    }
  },
  "description": "The slips that cost sites their rich results, and how to avoid them.",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://fernhill.example/blog/json-ld-mistakes"
  }
}
```

---

## Product

A product page. Google needs name plus one of offers, aggregateRating or review; the sample has offers and a rating.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Ridgeway Daypack 24L",
  "image": "https://fernhill.example/img/daypack.jpg",
  "description": "A light 24 litre pack with a padded laptop sleeve.",
  "sku": "PACK-24-GRN",
  "brand": {
    "@type": "Brand",
    "name": "Ridgeway"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://fernhill.example/shop/daypack",
    "priceCurrency": "EUR",
    "price": "79.00",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2027-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "212"
  }
}
```

---

## SoftwareApplication

An app or SaaS landing page. Google needs name, offers.price and a rating or review.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "TaskLoop",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "ratingCount": "860"
  }
}
```

---

## BreadcrumbList

Mirrors the visible trail. The last item may drop `item`, as the third one does here.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://fernhill.example"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Guides",
      "item": "https://fernhill.example/guides"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Structured Data"
    }
  ]
}
```

---

## LocalBusiness

One page per location.

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Harbour Bakery",
  "image": "https://harbour-bakery.example/img/front.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "12 Kade Street",
    "addressLocality": "Rotterdam",
    "postalCode": "3011 AB",
    "addressCountry": "NL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "51.9225",
    "longitude": "4.4792"
  },
  "telephone": "+31-10-555-0123",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "07:00",
      "closes": "17:00"
    }
  ],
  "priceRange": "€€"
}
```

---

## Event at a physical venue

Google's Event feature needs name, startDate and a location that is a Place with a PostalAddress. An online-only event is not supported by that feature.

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Web Performance Day",
  "startDate": "2027-09-17T10:00:00+02:00",
  "endDate": "2027-09-17T16:00:00+02:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Fernhill Hall",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "8 Canal Road",
      "addressLocality": "Utrecht",
      "postalCode": "3511 AA",
      "addressCountry": "NL"
    }
  },
  "image": "https://fernhill.example/img/perf-day.jpg",
  "description": "A day of short talks on making sites fast.",
  "offers": {
    "@type": "Offer",
    "url": "https://fernhill.example/perf-day/tickets",
    "price": "49",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "validFrom": "2027-06-01"
  },
  "organizer": {
    "@type": "Organization",
    "name": "Fernhill Works",
    "url": "https://fernhill.example"
  }
}
```

---

## Combined graph

Give each entity an `@id` and refer to it from the others.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://fernhill.example/#org",
      "name": "Fernhill Works",
      "url": "https://fernhill.example"
    },
    {
      "@type": "WebSite",
      "@id": "https://fernhill.example/#site",
      "url": "https://fernhill.example",
      "name": "Fernhill",
      "publisher": { "@id": "https://fernhill.example/#org" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://fernhill.example"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Guides"
        }
      ]
    }
  ]
}
```

---

## Next.js component

Pages Router version. In the App Router, drop the `Head` import and render the script tag directly in the component. The `replace` call escapes `<` so data containing `</script>` cannot break out of the tag.

```jsx
import Head from "next/head";

export default function ProductPage({ product }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    // add the other properties here
  };
  const json = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      </Head>
      {/* page body */}
    </>
  );
}
```

---

## Valid markup with no Google rich result today

Google's pages say the sitelinks search box is gone, that the FAQ rich result is no longer shown, and the search gallery does not list HowTo. The vocabulary is still valid schema.org, which other tools may read. Do not sell these as a way to get a visual result.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Fernhill",
  "url": "https://fernhill.example",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://fernhill.example/find?query={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which format should I use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON-LD, in a script tag in the head of the page."
      }
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Add JSON-LD to a Static Page",
  "totalTime": "PT10M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Pick the type",
      "text": "Match the page to a type Google documents."
    },
    {
      "@type": "HowToStep",
      "name": "Embed and test",
      "text": "Place the object in a script tag, then run the Rich Results Test."
    }
  ]
}
```
