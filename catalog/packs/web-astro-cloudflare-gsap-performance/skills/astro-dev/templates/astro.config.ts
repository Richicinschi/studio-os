import { defineConfig, fontProviders } from 'astro/config'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// Replace the site URL; the sitemap and RSS need it.
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Rubik',
      cssVariable: '--font-rubik',
      weights: ['100 900'],
    },
  ],
})
