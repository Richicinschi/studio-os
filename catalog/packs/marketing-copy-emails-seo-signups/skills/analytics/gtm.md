# Tag manager notes

## The three parts

- Tags: code that runs. Typical: GA4 configuration, GA4 event, ads conversion, other vendor pixels, custom HTML.
- Triggers: when a tag runs. Built in: page view variants, clicks, form submission, scroll depth, timer, element visibility. Custom: an event name pushed to the data layer, or a group of conditions.
- Variables: values for tags and triggers. Built in (enable what you use): click text, URL, id, classes; page path, URL, hostname; referrer; form fields. Yours: data layer values, JavaScript, lookup tables, regex tables, constants.

## Naming

Pattern: kind, then purpose, then detail.
- Tags: `GA4 - Event - Quote Requested`, `GA4 - Config - Base`.
- Triggers: `Click - Hero Button`, `Custom - quote_requested`.
- Variables: `DL - customer_type`, `LT - Campaign Map`.

## Data layer

Create the array before the container snippet loads, then push.

```javascript
window.dataLayer = window.dataLayer || [];
dataLayer.push({ pageType: 'service', user: { loggedIn: false } });

document.querySelector('#quote-form').addEventListener('submit', function () {
  dataLayer.push({ event: 'form_submitted', formName: 'quote', formLocation: 'sidebar' });
});

document.querySelector('.book-btn').addEventListener('click', function () {
  dataLayer.push({ event: 'cta_clicked', ctaText: this.innerText, ctaLocation: 'header' });
});
```

Shop events use the same shape as in the GA4 notes: clear `ecommerce` with null, then push the event with `transaction_id`, `value`, `currency`, optional `tax` and `shipping`, and an `items` array.

## Common tags

- GA4 configuration: measurement id, send page view on, user properties if any; trigger All Pages.
- GA4 event: pick the configuration tag, set the event name (hard coded or from a variable), map parameters from data layer variables; trigger is a custom event with the same name.
- Third-party ad pixels via custom HTML: load only after the matching consent is granted, fire the base tag on pages and conversion calls on the custom event trigger. Review what each vendor script collects before adding it.

## Preview

Open Preview, enter the site address, and read the panel for each event: tags fired, tags not fired and why, variable values, data layer contents. If a tag does not fire, check trigger conditions, the push itself and sequencing. A wrong value usually means a wrong path into a nested object or a push that happens later than the read. Multiple firings mean duplicate tags or a trigger matching twice.

## Workspaces and versions

Keep production in the default workspace; use separate workspaces for big changes and merge when tested. Name each version and write notes: what was added, which tags, triggers and variables, which browsers were checked. Review the change list before publishing and note which version is live.

## Consent

Set defaults before any tag runs:

```javascript
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
function onOptIn() {
  gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  });
}
```

The last two signals (`ad_user_data`, `ad_personalization`) belong to Google's second version of consent mode, which Google requires for ads features with EEA and UK visitors; check the vendor's current documentation. Many consent banners send these calls for you.

In the container, enable the consent overview and set required consent per tag so tags respect the state. Ask the studio legal skill `legal-analytics-consent` whether the setup is sufficient.

## Advanced

- Sequencing: run the configuration tag before event tags, or initialize a pixel before its events (tag settings, advanced).
- Exceptions: block a tag on chosen pages, internal traffic or test hosts.
- Custom JavaScript variables: read a query parameter with a fallback of "(not set)", read a first-party cookie value, or parse a number from a page element. Keep them short and never read personal data.
