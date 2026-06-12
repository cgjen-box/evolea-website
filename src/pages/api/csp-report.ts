import type { APIRoute } from 'astro';

// __SSR_BUILD__ is injected by astro.config.mjs (Vite `define`): true only when
// the Cloudflare adapter is active (output: 'server'). In static builds
// (GitHub Pages, or adapter-absent local) it is false.
//
// SEC-04 endpoint behaviour:
//   - Cloudflare (SSR): prerender=false → live POST sink for CSP violation reports.
//   - Static build: prerender=true → the route is prerendered to a harmless
//     static 204 response and the server endpoint is excluded, so the build
//     does NOT hit NoAdapterInstalled. GitHub Pages has no CSP report-uri source
//     anyway (public/_headers is Cloudflare-only), so losing the live sink there
//     is acceptable.
declare const __SSR_BUILD__: boolean;

export const prerender = !__SSR_BUILD__;

// Accepts CSP violation reports (application/csp-report or application/json).
// Silent-safe: reads the body inside a try/catch, never throws, never logs the
// (untrusted) payload, and always returns 204 No Content with an empty body so
// attacker-controlled content is never stored, processed, or reflected.
export const POST: APIRoute = async ({ request }) => {
  try {
    // Drain the body so the connection closes cleanly; the payload is discarded.
    await request.text();
  } catch {
    // Ignore malformed bodies — the response is 204 regardless.
  }

  return new Response(null, { status: 204 });
};

// GET handler so the route is prerenderable in static builds (returns the same
// empty 204). On Cloudflare this is also a valid no-op for accidental GETs.
export const GET: APIRoute = async () => new Response(null, { status: 204 });
