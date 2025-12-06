import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// Check if we're building for GitHub Pages (static)
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// Only import Cloudflare adapter when needed
let cloudflareAdapter;
let keystaticIntegration;
let useCloudflare = false;
if (!isGitHubPages) {
  try {
    cloudflareAdapter = (await import('@astrojs/cloudflare')).default();
    keystaticIntegration = (await import('@keystatic/astro')).default();
    useCloudflare = true;
  } catch {
    // Packages not available locally, fall back to static build
  }
}

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages || !useCloudflare ? 'https://cgjen-box.github.io' : 'https://evolea-website.pages.dev',
  base: isGitHubPages || !useCloudflare ? '/evolea-website' : '/',
  output: useCloudflare ? 'server' : 'static',
  adapter: cloudflareAdapter,
  integrations: [
    sitemap(),
    tailwind(),
    ...(keystaticIntegration ? [keystaticIntegration] : []),
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
