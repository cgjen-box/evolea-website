import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// Check if we're building for GitHub Pages (static)
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages ? 'https://cgjen-box.github.io' : 'https://evolea-website.pages.dev',
  base: isGitHubPages ? '/evolea-website' : '/',
  output: isGitHubPages ? 'static' : 'server',
  adapter: isGitHubPages ? undefined : (await import('@astrojs/cloudflare')).default(),
  integrations: [
    sitemap(),
    tailwind(),
    ...(isGitHubPages ? [] : [(await import('@keystatic/astro')).default()]),
  ],
  i18n: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
    routing: {
      prefixDefaultLocale: false,
    },
    fallback: {
      en: 'de',
    },
  },
  build: {
    assets: 'assets',
  },
});
