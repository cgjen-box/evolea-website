import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// Check if we're building for GitHub Pages (static)
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// Only import Cloudflare adapter when needed
let cloudflareAdapter;
let keystaticIntegration;
let useCloudflare = false;
if (!isGitHubPages) {
  try {
    const cloudflareModule = await import('@astrojs/cloudflare');
    cloudflareAdapter = cloudflareModule.default({
      // Enable platform proxy for accessing Cloudflare runtime bindings (env vars)
      platformProxy: {
        enabled: true,
        configPath: 'wrangler.toml',
      },
    });
    keystaticIntegration = (await import('@keystatic/astro')).default();
    useCloudflare = true;
  } catch (err) {
    // On Cloudflare Pages a failed adapter import must fail the build —
    // a silent static fallback would deploy with the wrong base/site URLs.
    if (process.env.CF_PAGES === '1') throw err;
    // Packages not available locally, fall back to static build
  }
}

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages || !useCloudflare ? 'https://cgjen-box.github.io' : 'https://www.evolea.ch',
  base: isGitHubPages || !useCloudflare ? '/evolea-website' : '/',
  output: useCloudflare ? 'server' : 'static',
  adapter: cloudflareAdapter,
  integrations: [
    sitemap(),
    tailwind(),
    react(),
    mdx(),
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
  // Keystatic env vars on Cloudflare Pages: with compatibility_date >= 2025-04-01
  // and nodejs_compat (see wrangler.toml), process.env is populated at runtime,
  // so the OAuth/session secrets are no longer inlined into the build artifact.
  // Only the public OAuth client ID stays inlined as a fallback.
  // See: https://github.com/Thinkmill/keystatic/issues/1229
  vite: {
    define: {
      'process.env.KEYSTATIC_GITHUB_CLIENT_ID': JSON.stringify(process.env.KEYSTATIC_GITHUB_CLIENT_ID),
    },
  },
});

// Force Cloudflare rebuild: 2026-01-10T20:15
