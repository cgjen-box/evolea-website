import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// Check if we're building for GitHub Pages (static) or CMS (hybrid on Cloudflare)
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// Dynamic imports for optional dependencies (only available on Cloudflare)
let cloudflareAdapter = undefined;
let keystatic = undefined;

if (!isGitHubPages) {
  try {
    const cloudflareModule = await import('@astrojs/cloudflare');
    cloudflareAdapter = cloudflareModule.default;
    const keystaticModule = await import('@keystatic/astro');
    keystatic = keystaticModule.default;
  } catch (e) {
    // Dependencies not available locally - will work on Cloudflare
    console.log('Note: Cloudflare/Keystatic modules not available locally. Using static mode.');
  }
}

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages ? 'https://cgjen-box.github.io' : 'https://evolea-cms.pages.dev',
  base: isGitHubPages ? '/evolea-website' : '/',
  // Astro 5: use 'server' instead of 'hybrid', with static pages prerendered by default
  output: isGitHubPages || !cloudflareAdapter ? 'static' : 'server',
  adapter: cloudflareAdapter ? cloudflareAdapter() : undefined,
  integrations: [
    sitemap(),
    tailwind(),
    ...(keystatic ? [keystatic()] : []),
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
