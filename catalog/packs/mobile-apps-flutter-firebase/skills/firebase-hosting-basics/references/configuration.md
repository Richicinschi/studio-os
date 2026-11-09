# firebase.json hosting settings

Everything lives under the `hosting` key. Only `public` is mandatory.

## public

The folder whose contents are uploaded, for example `build/web` or `out`. Run the build before deploying.

```json
"hosting": { "public": "build/web" }
```

## ignore

A list of globs left out of the upload. If you set none, the defaults skip `firebase.json`, any dotfile or dot folder, and everything in `node_modules`. If you write your own list, repeat those three entries so they are not uploaded by accident.

## redirects

Send one path to another so old links keep working. `type` is the HTTP code, usually 301 for a permanent move and 302 for a temporary one.

```json
"redirects": [
  { "source": "/pricing-2023", "destination": "/pricing", "type": 301 }
]
```

## rewrites

A rewrite keeps the visible URL and serves other content. Rules are checked in order, so put specific paths before the catch-all.

```json
"rewrites": [
  { "source": "/orders/**", "function": "ordersHandler" },
  { "source": "/reports/**", "run": { "serviceId": "report-svc", "region": "asia-east1" } },
  { "source": "**", "destination": "/index.html" }
]
```

- `destination`: another file in the public folder (the SPA fallback).
- `function`: a Cloud Function name.
- `run`: a Cloud Run service and its region.

## headers

Attach response headers to files matching a glob.

```json
"headers": [
  {
    "source": "**/*.@(svg|webp|avif)",
    "headers": [ { "key": "Cache-Control", "value": "max-age=86400" } ]
  }
]
```

## cleanUrls

`true` serves `/about` for `about.html` and redirects the `.html` form to it.

## trailingSlash

`true` forces a slash at the end of static page URLs, `false` removes it. Leave it unset to keep the default behaviour.

## Complete example

```json
{
  "hosting": {
    "public": "build/web",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "cleanUrls": true,
    "trailingSlash": false
  }
}
```
