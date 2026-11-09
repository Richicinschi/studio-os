# Platform limits and indexing

These numbers come from the stores' published developer documentation and guidelines as read in early 2026. Stores change them without notice, so confirm against the current documentation before telling anyone to ship an edit.

## Fields to capture

Apple: name, subtitle, description, promotional text, primary and secondary category, screenshots (count, order, captions), preview video, rating and count, visible reviews, price and in-app purchases, developer, last update, version notes, age rating, size, languages, in-app events.

Google Play: title, short description, full description, category and tags, feature graphic, screenshots, video, rating and count, visible reviews, price and in-app purchases, developer, last update, what's new text, download range, content rating, data safety section, languages.

## What each store indexes

| Field | Apple | Google Play |
|---|---|---|
| Title | Yes | Yes, strongest signal |
| Subtitle / short description | Yes | Yes |
| Hidden keyword field | Yes | No such field |
| Long description | No | Yes, strongly |
| Screenshot captions | Reported by ASO vendors since mid 2025; Apple has not confirmed it and tests are mixed, so write captions for conversion first | No |
| In-app events | Yes | Not applicable |
| Developer name | No | Partly |
| In-app purchase names | Yes | Yes |

## Apple

- Limits: name 30 characters (minimum 2, must be unique; no trademarks, rival names or pricing), subtitle 30 (no claims that cannot be verified), keyword field 100 bytes (hidden), description 4,000 (plain text, not indexed), promotional text 170 (not indexed, editable without a release), what's new 4,000 (required for every version after the first), purchase name 35, purchase description 55, event name 30 (title case), event short description 50 (sentence case), event long description 120 (sentence case).
- The keyword field counts bytes. Arabic, Chinese, Japanese and Korean characters take 2 to 3 bytes each, so fewer terms fit.
- Separate keywords with commas and no spaces. Each word is indexed once, so never repeat a word across name, subtitle and keyword field.
- Screenshots: 1 to 10 per device. At least one screenshot per device size is required. For the large iPhone display Apple lists 1320 by 2868, 1290 by 2796 and 1260 by 2736 (portrait; landscape is the reverse), and for the 13 inch iPad 2064 by 2752 or 2048 by 2732; the iPad set is required if the app runs on iPad, and other sizes scale from the ones you upload. Which iPhone size counts as the required one has changed between releases, so read Apple's screenshot specification page before building assets. Mac, Apple Watch, Apple TV and Vision Pro sets are needed only where the app supports them. JPEG or PNG, no alpha channel or transparency. Only the first 3 show in search results.
- Preview video: up to 3, 15 to 30 seconds, 500 MB cap, H.264 (10 to 12 Mbps, up to 30 fps) or ProRes 422 HQ, stereo AAC at 256 kbps or PCM at 44.1 or 48 kHz, in .mov, .m4v or .mp4, autoplays muted on the product page.
- Custom product pages: up to 70 beyond the default. They can change screenshots, promotional text, previews and deep links (iOS 18 and later), and go through App Review separately from app updates. A page appears in organic search only when you assign keywords to it and it is approved and visible. Each keyword combination may belong to only one page.
- Product page tests: up to 3 treatments against the original, one test at a time, up to 90 days. Icons, screenshots and videos can be tested; title, subtitle, description and keywords cannot. Every icon variant must already ship in the published binary. Apple suggests a 90% confidence threshold. A running test cannot be edited.
- In-app events: up to 15 approved and 10 live at once, each at most 31 days, promotable up to 14 days ahead. Seven badge types exist, such as premiere, live event and major update. Event card image 16:9, 1920 by 1080 up to 3840 by 2160; details image 9:16, 1080 by 1920 up to 2160 by 3840. Poor fits: daily chores, price cuts with nothing new, broad awareness pushes.
- Review prompts through the system dialog: at most 3 in 365 days. Never build a custom button that asks for a rating. The system may show fewer prompts than the cap. Developers can reply to every review in App Store Connect, and the summary rating is per territory.
- Metadata that draws rejection: hidden features or false pricing, undisclosed purchases, screenshots showing only a splash or login, preview video with non-app footage, wrong category, keyword stuffing (trademarks, rival names, prices, unrelated terms), content unfit for a 4+ audience, mentions of other platforms, generic notes for big changes, inaccurate event details.
- Apple also curates by hand, so design quality counts.

## Google Play

- Limits: title 30 characters, short description 80, full description 4,000 (indexed in full), developer name 64 (same emoji and caps limits as the title). Google's asset page confirmed the short description limit; check the vendor's current documentation for the title, full description and developer name limits.
- As the skill's own guideline (a starting point, not a published or measured value), aim for the main terms to appear naturally at roughly 2 to 3% density in the full description. Semantic analysis catches stuffing and can demote it.
- Banned in title, icon and developer name: emojis and emoticons, repeated special characters, all caps (unless a registered brand), ranking or price claims such as "top", "best", "#1", "free", "no ads", misleading claims of store performance or endorsement, and calls to action like "update now" or "download now". The short description follows the same claim and call-to-action rule and the description fields in general should avoid user testimonials, accolades and awards (Google's help page states this for the short description; check the store's current help page for the full description). Screenshots, feature graphic and video may not carry time-limited taglines or calls to action, and must show the app's real functions.
- Screenshots: phones need 2 to 8, tablets and Chromebooks 4 to 8, aspect 9:16 or 16:9, each side between 320 and 3,840 px for phones. Google also limits how long the long side may be compared with the short side; check the store's current help page for that ratio. 7 inch and 10 inch tablets and Chromebooks: shortest side at least 1,080 px, long edge up to 7,680 px. Wear OS needs 1 to 8 square 1:1 shots (at least 384 by 384); Android TV needs 1 to 8 at 16:9 (at least 1920 by 1080). Recommended phone size 1080 by 1920. JPEG or 24-bit PNG without alpha, 8 MB each.
- Feature graphic: exactly 1024 by 500, JPEG or 24-bit PNG without alpha, required, and shown at the top of the listing and in featured placements.
- Icon: 512 by 512, 32-bit PNG, under 1,024 KB, full square (the store rounds corners). No ranking claims, download counts, deal text or emoji.
- Video: a public or unlisted YouTube link, embeddable, not age-restricted, no ads and not monetized; Google advises showing the real app in the first 10 seconds and keeping it short, because only the first 30 seconds autoplay.
- Listing experiments: reports differ on whether the variant cap is 2 or 3 against the control, so read the setup screen in the console; many assets testable (icon, feature graphic, screenshots, video, descriptions), only for signed-in users, run at least 7 days so weekdays and weekends both count. Only one default-graphics experiment may run at a time, results count first-time installers and those retained after 1 day, and tests can span up to 5 languages.
- Custom store listings: up to 50 per app; title, descriptions, icon, screenshots, feature graphic and video can differ; targetable by country, pre-registration, ads traffic, churned and lapsed users, and further segments Google lists on its custom store listings help page, so check the store's current help page for the full set.
- Promotional content: offers (up to 28 days), time-limited events, major updates (up to a week), and crossover collaborations for games. Submit at least 4 days ahead, and at least 14 days ahead when asking to be featured.
- Android Vitals: Google's published bad-behavior thresholds are a user-perceived crash rate of 1.09% or more and a user-perceived ANR rate of 0.47% or more across all devices, and 8% on a single phone model; crossing them can cut search visibility and add warning labels. Google also tracks excessive partial wake locks; check the vendor's current Android vitals documentation for that threshold, the window used and the watch-model figures.
- Ranking inputs Google names on its help page about how Play ranks apps: ratings, reviews, downloads, user behaviour and feedback, and store listing quality (title, description, screenshots); translations are also listed in Google's material, so check the store's current help page. Google does not publish the weights. Other factors such as install speed, retention and update frequency are widely believed to matter but are unconfirmed.
