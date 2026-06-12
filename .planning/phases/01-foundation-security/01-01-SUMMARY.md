---
phase: 01-foundation-security
plan: 01
subsystem: security-headers
tags: [security, csp, middleware, headers, caching, cloudflare]
requires: []
provides:
  - SECURITY_HEADERS constant (single source of truth)
  - CSP_REPORT_ONLY / CSP_REPORT_ONLY_KEYSTATIC values
  - sequence()-composed middleware with security headers + Keystatic injection
  - /api/csp-report SSR sink (returns 204)
  - public/_headers (static/prerendered header backstop + immutable /assets,/fonts cache)
  - scripts/gen-headers.mjs parity gate wired into build
affects:
  - src/middleware.ts
  - astro.config.mjs
  - package.json build pipeline
tech-stack:
  added: []
  patterns:
    - "astro:middleware sequence() composition (new to repo)"
    - "Vite define flag (__SSR_BUILD__) to gate prerender per build mode"
    - "Cloudflare _headers format with constant-parity checker"
key-files:
  created:
    - src/lib/security-headers.ts
    - src/pages/api/csp-report.ts
    - public/_headers
    - scripts/gen-headers.mjs
  modified:
    - src/middleware.ts
    - astro.config.mjs
    - package.json
decisions:
  - "HSTS ships bare max-age=31536000 (no includeSubDomains/preload); subdomain coverage deferred to SEC-V2-02"
  - "CSP ships Report-Only with Instagram embed hosts allowlisted to satisfy SEC-03 even though only plain <a href> links exist today"
  - "prerender gated on __SSR_BUILD__ Vite flag (deviation from plan's bare prerender=false, which errored on static builds in Astro 5.16.4)"
metrics:
  duration: ~5m
  completed: 2026-06-12
  tasks: 3
  files: 7
requirements: [SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, PERF-04]
---

# Phase 01 Plan 01: Security Headers Foundation Summary

Single source-of-truth security header constant feeding a `sequence()`-composed middleware (with the double-`next()` bug fixed via `clone()`), a Report-Only CSP with an in-stack `/api/csp-report` 204 sink, and a hand-written `public/_headers` backstop kept drift-free by a parity checker wired into `npm run build`.

## What Was Built

- **`src/lib/security-headers.ts`** — named-export `as const` module exporting `SECURITY_HEADERS` (bare HSTS `max-age=31536000`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, deny-by-default `Permissions-Policy`), plus `CSP_REPORT_ONLY` and the looser `CSP_REPORT_ONLY_KEYSTATIC` (connect-src `api.github.com`). Both CSP variants include the Instagram embed hosts (SEC-03) and `report-uri /api/csp-report`.
- **`src/middleware.ts`** — refactored from a monolithic `onRequest` into `sequence(securityHeaders, keystaticEnhancements)`. `securityHeaders` applies the constant to every response and sets `Content-Security-Policy-Report-Only` (keystatic-scoped variant under `/keystatic`). `keystaticEnhancements` keeps the deploy-button-hide + save-toast script verbatim, reads the body via `response.clone().text()`, and returns the original response on failure (no second `next()`).
- **`src/pages/api/csp-report.ts`** — SSR-only POST sink that drains the body in a try/catch and always returns `204`, never throws, never logs the untrusted payload (mitigates T-01-01/T-01-02).
- **`public/_headers`** — Cloudflare-native header config for static/prerendered routes: `/*` block with all five headers + site-wide CSP-RO, `/keystatic/*` override with the looser CSP, and `Cache-Control: public, max-age=31536000, immutable` on `/assets/*` and `/fonts/*` (PERF-04).
- **`scripts/gen-headers.mjs`** — reads the `.ts` constant as text (no TS loader; Node 20 safe), regex-extracts the header pairs and both CSP strings, and asserts each appears verbatim in `public/_headers`; exits 1 with a readable diff on drift. Wired into `build` and `build:cloudflare` (so the pre-commit hook enforces no drift). `gen:headers` script added.

## Requirements Satisfied

- **SEC-01** — SSR responses carry HSTS/nosniff/DENY/Referrer-Policy/Permissions-Policy via middleware reading `SECURITY_HEADERS`.
- **SEC-02** — `public/_headers` carries the same values; `gen-headers.mjs` enforces no drift and is wired into the build + pre-commit hook.
- **SEC-03** — `Content-Security-Policy-Report-Only` present with Formspree/inline-script/Instagram-embed allowlist + looser `/keystatic` variant.
- **SEC-04** — `/api/csp-report` SSR endpoint returns 204, never throws.
- **SEC-05** — middleware composed via `sequence()`; double-`next()` fixed via `clone()` + single `next()` per path.
- **PERF-04** — `/assets/*` (and `/fonts/*`) get `Cache-Control: ... immutable`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] prerender gated on a Vite `__SSR_BUILD__` flag instead of bare `export const prerender = false`**
- **Found during:** Task 2
- **Issue:** The plan's locked mechanism — a plain `export const prerender = false` route that Astro 5 "silently excludes" from static builds — does NOT hold in this environment (Astro 5.16.4). Both `npm run build` (adapter-absent → `output: 'static'`) and `GITHUB_PAGES=true npm run build` failed with `[NoAdapterInstalled] Cannot use server-rendered pages without an adapter`, which directly violated the plan's own acceptance criterion that both builds exit 0.
- **Fix:** Added a Vite `define` flag `__SSR_BUILD__` in `astro.config.mjs` set to `useCloudflare`. The route now declares `export const prerender = !__SSR_BUILD__` and adds a no-op `GET` 204 handler so it prerenders harmlessly in static builds. On Cloudflare (`output: 'server'`) the flag is true → `prerender = false` → a live POST SSR endpoint exactly as SEC-04 requires. Behavioural intent is unchanged: live sink on Cloudflare, absent/no-op on GitHub Pages (which has no CSP report-uri source anyway).
- **Why not Rule 4:** This is a config-level guard (one Vite define + a route flag), not an architectural change — no new infrastructure, library, or trust boundary. The plan forbade the env-guard based on a verification that proved false here; the stricter requirement (both builds green) wins.
- **Files modified:** `astro.config.mjs`, `src/pages/api/csp-report.ts`
- **Commit:** 5d43211

## Verification

- `npm run build` → exit 0 (static, adapter-absent locally).
- `GITHUB_PAGES=true npm run build` → exit 0.
- `node scripts/gen-headers.mjs` → exit 0 (parity holds).
- Drift test: changing `Referrer-Policy` in the constant only made both `gen-headers.mjs` and `npm run build` exit 1; reverting restored exit 0.
- `dist/_headers` present after build; `Cache-Control immutable` appears exactly twice; `includeSubDomains`/`preload` absent from `_headers`; site-wide CSP line contains `https://www.instagram.com`.
- Middleware: exactly one `await next()` per middleware, no `return next()` in any catch; `sequence(securityHeaders, keystaticEnhancements)` present; `evolea-toast-container` script preserved (count 1).

### Deferred (phase verification, Cloudflare preview only)
- `curl -I` parity on an SSR route vs a prerendered blog route; live POST to `/api/csp-report` returning 204; zero CSP-blocked-resource console errors on Keystatic/Formspree/Instagram. These are only observable on a Cloudflare deploy, never on `astro dev` or the local static build.

## Notes for Downstream

- Any edit to `src/lib/security-headers.ts` MUST be mirrored in `public/_headers` or the build (and pre-commit hook) fails. This is by design (SEC-02).
- The `__SSR_BUILD__` Vite flag is now available repo-wide for any future server-only route that must opt out of the static build cleanly.

## Self-Check: PASSED

All 6 created/modified files present; all 4 commits (1c80887, 5d43211, c2ac0e5, 3906765) verified in git log.
