# Asset organization

How to file marketing assets so anyone can find them again.

## Folder layout

```
project-root/
├── .assets/                    # metadata, tracked in git
│   ├── manifest.json           # registry of every asset
│   ├── tags.json               # tag vocabulary
│   ├── versions/
│   │   └── {asset-id}/
│   │       └── v{n}.json       # one file per revision
│   └── metadata/               # extra fields by asset type
│       ├── designs.json
│       ├── banners.json
│       ├── logos.json
│       └── videos.json
├── assets/                     # the files themselves
│   ├── designs/
│   │   ├── campaigns/
│   │   ├── web/
│   │   └── print/
│   ├── banners/
│   │   ├── social-media/
│   │   ├── email-headers/
│   │   └── landing-pages/
│   ├── logos/
│   │   ├── full-horizontal/
│   │   ├── icon-only/
│   │   ├── monochrome/
│   │   └── variations/
│   ├── videos/
│   │   ├── ads/
│   │   ├── tutorials/
│   │   └── testimonials/
│   ├── infographics/
│   └── generated/              # AI output
│       └── {YYYYMMDD}/         # one folder per day
```

## File names

Pattern:
```
{type}_{campaign}_{description}_{timestamp}_{variant}.{ext}
```

Filled in from left to right:
- **type**: one lowercase word for the kind of asset (banner, logo, design, video).
- **campaign**: kebab-case campaign slug. Anything outside a campaign takes the slug `evergreen`.
- **description**: kebab-case phrase saying what the file shows.
- **timestamp**: the creation date as eight digits, year first.
- **variant**: optional kebab-case suffix for a theme, ratio or device.

Every part except the variant is required.

Samples:
```
banner_autumn-open-day_main-visual_20260314_4-5.png
logo_rebrand_stacked-full-color_20260314.svg
design_winter-mailer_header_20260314_dark-mode.psd
video_onboarding_first-login-tour_20260314.mp4
infographic_evergreen_plan-comparison_20260314.png
```

## Manifest entry

Each asset gets one object in `manifest.json`:
```json
{
  "id": "uuid-v4",
  "name": "Open Day Main Visual",
  "type": "banner",
  "path": "assets/banners/landing-pages/banner_autumn-open-day_main-visual_20260314_4-5.png",
  "dimensions": { "width": 1080, "height": 1350 },
  "fileSize": 312480,
  "mimeType": "image/png",
  "tags": ["campaign", "visual", "open-day"],
  "status": "approved",
  "source": {
    "model": "example-image-model",
    "prompt": "...",
    "createdAt": "2026-03-14T09:10:00Z"
  },
  "version": 3,
  "createdBy": "agent:copywriter",
  "approvedBy": "user:sam",
  "approvedAt": "2026-03-14T16:45:00Z"
}
```

## Version record

Each revision adds `versions/{id}/v{n}.json`:
```json
{
  "version": 3,
  "previousVersion": 2,
  "path": "assets/banners/landing-pages/banner_autumn-open-day_main-visual_20260314_v3.png",
  "changes": "Headline shortened to fit one line",
  "createdAt": "2026-03-14T13:20:00Z",
  "createdBy": "agent:layout-designer"
}
```

## Tags

Pick tags from five groups:
- **status:** draft, review, approved or archived
- **platform:** instagram, twitter, linkedin, facebook, youtube, email or web
- **content-type:** promotional, educational, brand, product or testimonial
- **format:** 1x1, 4x5, 9x16, 16x9, story, reel or banner
- **source:** where it came from: imagen-4, veo-3, user-upload, canva or figma

Give every asset a status, a platform and a content-type tag. Format, source and campaign tags are optional.

## House rules

1. A file holds one variant. Dark and light versions are two files.
2. Working files (.psd, .fig) sit in the same folder tree as the exports.
3. Generated assets go into a dated folder.
4. Nothing is deleted. Move it to `archived/` and put the date at the front of the name.
5. A very large video (a good default cut-off is 100 MB) lives in cloud storage, and the manifest links to it.

## Finding things

Everything of one kind:
```bash
ls assets/banners/**/*
```

Everything in one campaign:
```bash
grep -l "autumn-open-day" .assets/manifest.json
```

Only approved work:
```bash
jq '.assets[] | select(.status == "approved")' .assets/manifest.json
```

## Tidy-up pass

1. Run the colour extraction script on each new file.
2. Compare the result with the guidelines.
3. Add the files to `manifest.json`.
4. Tag them.
5. Remove duplicates and outdated versions.
