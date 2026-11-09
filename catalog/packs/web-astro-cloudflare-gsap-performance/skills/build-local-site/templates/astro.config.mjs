// Static output, Tailwind v4 through Vite, sitemap, icons, Cloudflare adapter.
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// Keep private routes out of the sitemap.
const isPublic = (url) => !['/admin/', '/api/'].some((p) => url.includes(p));

export default defineConfig({
  // Replace __SITE_URL__ with the live address, https included.
  site: '__SITE_URL__',
  output: 'static',
  trailingSlash: 'always',
  integrations: [icon(), sitemap({ filter: isPublic, changefreq: 'weekly', priority: 0.7 })],
  vite: { plugins: [tailwindcss()] },
  adapter: cloudflare(),
});
