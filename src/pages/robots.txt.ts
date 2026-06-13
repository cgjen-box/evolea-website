import type { APIRoute } from 'astro';
import { PROD_HOST } from '@/lib/seo';

// __SSR_BUILD__ is injected by astro.config.mjs (Vite `define`): true only when
// the Cloudflare adapter is active (output: 'server'). In static builds
// (GitHub Pages, or adapter-absent local) it is false.
//
// robots.txt behaviour:
//   - Cloudflare (SSR): prerender=false → live hostname-keyed endpoint. Only the
//     exact production host (www.evolea.ch) serves the Allow + Sitemap variant;
//     every preview host (*.pages.dev) gets the default-deny `Disallow: /`.
//   - Static build: prerender=true → the route emits dist/robots.txt with the
//     deny variant (the GET runs with __SSR_BUILD__=false, so isProd is false).
//     Unlike csp-report.ts (empty 204 body, no file emitted), this body is
//     non-empty so Astro DOES write the file — intended behaviour.
declare const __SSR_BUILD__: boolean;

export const prerender = !__SSR_BUILD__;

export const GET: APIRoute = ({ url, site }) => {
  // Default-deny: only the exact production host (and only on the SSR build) is
  // crawlable. Spoofed/preview hosts fall through to `Disallow: /` — fail-safe.
  const isProd = __SSR_BUILD__ && url.hostname === PROD_HOST;
  const body = isProd
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /keystatic/',
        'Disallow: /api/',
        '',
        `Sitemap: ${new URL('sitemap-index.xml', site)}`,
        '',
      ].join('\n')
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
