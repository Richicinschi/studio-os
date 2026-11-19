# Fonts

Put the site's font files here, as `.woff2`. Astro copies this folder as it is, so a file saved as `public/fonts/dm-sans-latin.woff2` is served at `/fonts/dm-sans-latin.woff2`.

Then declare each file with `@font-face` at the top of `src/styles/global.css` (a commented example is there) and set the two font tokens in its `@theme` block to the same family names.

Where to get the files: download the families from their source, for example the Google Fonts page for the family or the google-webfonts-helper tool, and keep only the `.woff2` files for the weights and character sets the site uses. Check that each family's licence allows self-hosting; most Google Fonts families use the SIL Open Font License, which does.

Why self-host: when a page loads fonts from a font CDN, each visitor's browser sends its IP address to that third party. Serving the files from the site itself keeps that address between the visitor and the site, and saves a connection to another server.

This README is copied into the built site too; delete it once the fonts are in place if you would rather not publish it.
