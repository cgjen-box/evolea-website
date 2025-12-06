import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';

// Check if we're building for GitHub Pages (static) or CMS (hybrid)
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// https://astro.build/config
export default defineConfig({
  site: 'https://cgjen-box.github.io',
  base: isGitHubPages ? '/evolea-website' : '/',
  output: isGitHubPages ? 'static' : 'hybrid',
  adapter: isGitHubPages ? undefined : node({ mode: 'standalone' }),
  integrations: [
    sitemap(),
    tailwind(),
    ...(isGitHubPages ? [] : [keystatic()]),
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
