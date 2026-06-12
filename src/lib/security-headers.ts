/* ============================================================
   EVOLEA security headers — SINGLE SOURCE OF TRUTH
   ------------------------------------------------------------
   These values are consumed by BOTH emission paths:
     1. src/middleware.ts        — sets them on every SSR response
        (and the CSP-Report-Only header, with a looser /keystatic variant).
     2. public/_headers          — Cloudflare-native config for static /
        prerendered routes (e.g. /blog/*) that the middleware never touches.

   scripts/gen-headers.mjs is a PARITY CHECKER (wired into `npm run build`
   and `build:cloudflare`) that reads this file as text and asserts every
   value also appears verbatim in public/_headers. ANY edit here MUST be
   mirrored in public/_headers or the build (and the pre-commit hook) fails.

   Instagram embed hosts (www.instagram.com, *.cdninstagram.com, *.fbcdn.net)
   are included to satisfy SEC-03 even though only plain <a href> links exist
   on the site today — no iframe/script embed is present yet (per PATTERNS
   evidence 2026-06-12). They are harmless under Report-Only (the policy blocks
   nothing) and future-proof an eventual embed.

   HSTS: bare `max-age=31536000` only. The subdomain-coverage directive is
   DEFERRED to SEC-V2-02 (pending a *.evolea.ch DNS audit); the browser
   HSTS-list opt-in directive is intentionally omitted.
   ============================================================ */

export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
} as const;

export type SecurityHeaderName = keyof typeof SECURITY_HEADERS;

/**
 * Site-wide Content-Security-Policy-Report-Only value.
 * Report-Only means it never blocks resources — it only reports violations
 * to /api/csp-report, so the allowlist can be tightened safely over time.
 */
export const CSP_REPORT_ONLY =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://www.instagram.com; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: blob: https://*.cdninstagram.com https://*.fbcdn.net; " +
  "font-src 'self'; " +
  'frame-src https://www.instagram.com; ' +
  "form-action 'self' https://formspree.io; " +
  "connect-src 'self' https://formspree.io; " +
  "frame-ancestors 'none'; " +
  'report-uri /api/csp-report';

/**
 * Looser /keystatic variant: allows Keystatic's GitHub PUT saves
 * (connect-src https://api.github.com) on top of the site-wide allowlist.
 */
export const CSP_REPORT_ONLY_KEYSTATIC =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://www.instagram.com; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: blob: https://*.cdninstagram.com https://*.fbcdn.net; " +
  "font-src 'self'; " +
  'frame-src https://www.instagram.com; ' +
  "form-action 'self' https://formspree.io; " +
  "connect-src 'self' https://api.github.com; " +
  "frame-ancestors 'none'; " +
  'report-uri /api/csp-report';
