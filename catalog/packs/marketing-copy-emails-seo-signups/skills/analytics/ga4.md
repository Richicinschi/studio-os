# GA4 setup notes

## Streams and automatic events

Defaults and limits named here are the vendor's documented values; confirm them in the vendor's current documentation before relying on them.

- One data stream per platform: web, iOS, Android.
- Retention for event-level data defaults to 2 months and can be raised to 14 months. Set it deliberately.
- Google signals (cross-device) only for visitors who consented.
- Enhanced measurement collects page views, 90 percent scrolls, outbound clicks, site search, embedded video plays and file downloads. Toggle each as needed.
- Prefer Google's recommended event names where one fits: `login`, `sign_up`, `share`, `search`; shop: `purchase`, `refund`, `begin_checkout`, `add_payment_info`, `add_to_cart`, `remove_from_cart`, `view_item`, `view_item_list`; games: `level_up`, `unlock_achievement`, `post_score`, `spend_virtual_currency`. Recommended names unlock built-in reports.

## Sending events

```javascript
gtag('event', 'guide_downloaded', { guide: 'chain_care', format: 'pdf' });

gtag('event', 'purchase', {
  transaction_id: 'ORD-8841',
  value: 42.5,
  currency: 'EUR',
  items: [{ item_id: 'BELL-02', item_name: 'Brass bell', price: 42.5 }]
});

gtag('set', 'user_properties', { customer_type: 'member' });
gtag('config', 'MEASUREMENT_ID', { user_id: 'opaque-user-id' });
```

Through a tag manager, push the same fields to the data layer. For shop events clear the previous payload first with `dataLayer.push({ ecommerce: null })`, then push the new one.

## Conversions (key events)

Google renamed GA4 "conversions" to "key events" in 2024; "conversion" now means what Google Ads counts. Menu names change, so confirm the path in the vendor's current documentation.

1. Confirm the event arrives.
2. In Admin, open Data display, Events, and mark it as a key event.
3. Choose counting (once per event or once per session; the default for new key events is once per event): once per session suits leads and signups; once per event suits purchases that carry a unique transaction id.
4. Import into the ads account if bidding should optimize on it.
5. A fixed value can be sent with the event (`value`, `currency`) or set as a default when marking.

## Custom dimensions and metrics

Use a dimension for something to filter or split by (customer type, author, category). Use a metric for a number to add up (score, count, duration). Path: Admin, Data display, Custom definitions. Pick the scope: event, user or item. The parameter name must match the one in the event exactly, and the definition only applies to data collected after it exists.

## Audiences

Built under Admin, Data display, Audiences. Uses: remarketing lists, segment analysis, triggering events. Ideas (examples): pricing viewers who did not convert in the last 7 days; people with 3 or more sessions; buyers (to exclude or to seed lookalikes). Check consent before exporting any list to an ad platform.

## Debugging

- Debug view: set `debug_mode: true` on the config call (or on single events), set it in the Google tag inside the tag manager, or use Tag Assistant preview on your own device. Find it in Admin, Data display, DebugView. Removing the parameter turns it off; setting it to false does not.
- The real-time report shows events within minutes; standard reports lag.
- Nothing shows: check debug view, then whether the tag loads, then data filters.
- Parameter empty in reports: the custom definition is missing, the name differs, or processing is still running (standard reports lag; see the vendor's documentation for how long).
- Conversion stays at zero: event not marked, name mismatch, or the counting method hides repeats.

## Data quality

- Define internal traffic (office addresses, developers, staging hosts) under the stream's tag settings, then activate the filter.
- Cross-domain: list every domain that should share one session in the tag settings.
- Session timeout defaults to 30 minutes; engaged session threshold defaults to 10 seconds.

## Ads link

Admin, Product links, link the ads account, turn on auto-tagging there, import the conversions. Audiences built here can then drive remarketing and customer-match campaigns.
