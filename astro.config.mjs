import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

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
    react(),
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
  // Fix for Keystatic environment variables on Cloudflare Pages
  // See: https://github.com/Thinkmill/keystatic/issues/1229
  vite: {
    define: {
      'process.env.KEYSTATIC_GITHUB_CLIENT_ID': JSON.stringify(process.env.KEYSTATIC_GITHUB_CLIENT_ID),
      'process.env.KEYSTATIC_GITHUB_CLIENT_SECRET': JSON.stringify(process.env.KEYSTATIC_GITHUB_CLIENT_SECRET),
      'process.env.KEYSTATIC_SECRET': JSON.stringify(process.env.KEYSTATIC_SECRET),
    },
    // Fix for React 19 + Cloudflare Workers (MessageChannel not defined)
    // Use workerd-compatible resolve conditions for SSR
    ssr: useCloudflare ? {
      resolve: {
        conditions: ['workerd', 'worker', 'browser'],
        externalConditions: ['workerd', 'worker'],
      },
    } : {},
    resolve: useCloudflare ? {
      conditions: ['workerd', 'worker', 'browser', 'module', 'import', 'require'],
    } : {},
  },
});
