import { test, expect } from '@playwright/test';
import { SECURITY_HEADERS, CSP_REPORT_ONLY } from '../src/lib/security-headers';

/**
 * Security-header drift guard (HYG-04, T-3-06).
 *
 * Asserts EXACT header values against the single source constant
 * src/lib/security-headers.ts (same file scripts/gen-headers.mjs parses), so a
 * weakened value (e.g. geolocation=*, a dropped Permissions-Policy directive, or
 * a loosened CSP allowlist) fails the suite — substring matching would not.
 * gen-headers.mjs guards SOURCE parity; this guards the SERVING path:
 *   - `/` is served by _worker.js (middleware sets headers on SSR responses).
 *   - `/blog/im-spektrum/` is a prerendered route, so public/_headers applies them.
 * Both drift directions are covered.
 *
 * HOST-AGNOSTIC RULE: never assert the ABSENCE of the robots header. Staging
 * (*.pages.dev) intentionally sends a noindex robots directive; the suite must
 * pass on staging and production alike, so the robots header is left unasserted.
 */

// Exact expected values, header names lowercased (HTTP/2 / Playwright normalize).
const EXPECTED: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(SECURITY_HEADERS).map(([name, value]) => [name.toLowerCase(), value])
  ),
  'content-security-policy-report-only': CSP_REPORT_ONLY,
};

// SSR/middleware path + prerendered/_headers path.
for (const route of ['/', '/blog/im-spektrum/']) {
  test(`security headers exact on ${route}`, async ({ request }) => {
    const res = await request.get(route);
    const headers = res.headers();
    for (const [name, value] of Object.entries(EXPECTED)) {
      expect(headers[name] ?? '', `header ${name} on ${route}`).toBe(value);
    }
  });
}

// T-3-04: error paths must also carry the security headers (404 was header-less
// before the custom 404.astro routed it through the middleware).
test('404 route carries exact security headers', async ({ request }) => {
  const res = await request.get('/this-page-does-not-exist/');
  expect(res.status()).toBe(404);
  const headers = res.headers();
  expect(headers['x-frame-options'] ?? '').toBe(SECURITY_HEADERS['X-Frame-Options']);
  expect(headers['content-security-policy-report-only'] ?? '').toBe(CSP_REPORT_ONLY);
});
