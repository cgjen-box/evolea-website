import { test, expect } from '@playwright/test';

/**
 * Security-header drift guard (HYG-04, T-3-06).
 *
 * REQUIRED map kept aligned with the single source constant
 * src/lib/security-headers.ts (same file scripts/gen-headers.mjs parses).
 * gen-headers.mjs guards SOURCE parity; this guards the SERVING path:
 *   - `/` is served by _worker.js (middleware sets headers on SSR responses).
 *   - `/blog/im-spektrum/` is a prerendered route, so public/_headers applies them.
 * Both drift directions are covered.
 *
 * HOST-AGNOSTIC RULE: never assert the ABSENCE of the robots header. Staging
 * (*.pages.dev) intentionally sends a noindex robots directive; the suite must
 * pass on staging and production alike, so the robots header is left unasserted.
 */

const REQUIRED: Record<string, RegExp> = {
  'strict-transport-security': /max-age=31536000/,
  'x-content-type-options': /nosniff/,
  'x-frame-options': /DENY/,
  'referrer-policy': /strict-origin-when-cross-origin/,
  'permissions-policy': /./,
  'content-security-policy-report-only': /report-uri \/api\/csp-report/,
};

// SSR/middleware path + prerendered/_headers path.
for (const route of ['/', '/blog/im-spektrum/']) {
  test(`security headers present on ${route}`, async ({ request }) => {
    const res = await request.get(route);
    const headers = res.headers();
    for (const [name, re] of Object.entries(REQUIRED)) {
      expect(headers[name] ?? '', `header ${name} on ${route}`).toMatch(re);
    }
  });
}

// T-3-04: error paths must also carry the security headers (404 was header-less
// before the custom 404.astro routed it through the middleware).
test('404 route carries x-frame-options DENY', async ({ request }) => {
  const res = await request.get('/this-page-does-not-exist/');
  expect(res.status()).toBe(404);
  expect(res.headers()['x-frame-options'] ?? '').toMatch(/DENY/);
});
