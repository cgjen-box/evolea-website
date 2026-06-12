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
  redirects: {
    // The EN cafe page moved under /en/programs/ to match the other program routes.
    // The target must carry the base path explicitly — Astro does not prefix redirect targets.
    '/en/angebote/evolea-cafe/': `${isGitHubPages || !useCloudflare ? '/evolea-website' : ''}/en/programs/evolea-cafe/`,
    // /sitemap.xml → /sitemap-index.xml (the @astrojs/sitemap index name). Real
    // 301 on the Cloudflare adapter; a meta-refresh stub on the static build
    // (acceptable for the de-indexed mirror). Base-path explicit like above.
    '/sitemap.xml': {
      status: 301,
      destination: `${isGitHubPages || !useCloudflare ? '/evolea-website' : ''}/sitemap-index.xml`,
    },
  },
  integrations: [
    // Exclude internal /brand/ style-guide pages from the sitemap (SEO-05/D5).
    sitemap({ filter: (page) => !page.includes('/brand/') }),
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
      // SSR-mode flag consumed by server-only routes (e.g. /api/csp-report).
      // True only when the Cloudflare adapter is active (output: 'server').
      // In static builds (GitHub Pages, or adapter-absent local) this is false
      // so prerender=false server endpoints opt out of the static output and
      // avoid the NoAdapterInstalled build error.
      '__SSR_BUILD__': JSON.stringify(useCloudflare),
    },
  },
});

// Force Cloudflare rebuild: 2026-01-10T20:15
