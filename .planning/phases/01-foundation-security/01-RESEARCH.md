# Phase 1 Research: Foundation & Security

## 1. Middleware Architecture & Security Headers
### Astro Middleware `sequence()` Composition
- **Current State:** `src/middleware.ts` contains a monolithic `onRequest` with a manual `/keystatic` check and HTML injection logic. It has a fragile `try-catch` block that may result in double-`next()` calls or partial response consumption if not careful.
- **Planned Refactor:** Use `sequence()` from `astro:middleware` to decompose logic:
  1. `securityHeadersMiddleware`: Adds standard security headers (HSTS, nosniff, etc.) to all responses.
  2. `keystaticMiddleware`: Handles `/keystatic` specific HTML injection for Deploy-button hiding and Toast notifications.
- **Provenance:** [src/middleware.ts], [Astro 5.0 Middleware Docs]
- **Confidence:** High

### Parity between Middleware and `public/_headers`
- **Mechanism:** A shared constant in `src/lib/security-headers.ts` will define the header values.
- **Middleware:** Applies to SSR responses (all pages by default in `output: 'server'`).
- **`public/_headers`:** Essential for Cloudflare Pages to apply headers to static assets and **prerendered pages** (like `/blog/*`). On Cloudflare, Pages Functions (middleware) do NOT run for static files or prerendered HTML routes.
- **HSTS:** `max-age=31536000; includeSubDomains` (no `preload` per user decision).
- **Confidence:** High

---

## 2. Content Security Policy (Report-Only)
### Dependency Inventory
Based on codebase analysis, the following allowlist is required for `Content-Security-Policy-Report-Only`:
- **`default-src`**: `'self'`
- **`script-src`**: `'self'`, `'unsafe-inline'` (for GSAP init and Keystatic injection), `https://www.instagram.com`, `https://platform.instagram.com`.
- **`style-src`**: `'self'`, `'unsafe-inline'` (Astro injected styles and GSAP-managed inline styles).
- **`img-src`**: `'self'`, `data:`, `blob:`, `https://*.instagram.com`, `https://*.facebook.com` (Instagram embeds).
- **`frame-src`**: `https://www.instagram.com`, `https://formspree.io`.
- **`connect-src`**: `'self'`, `https://formspree.io`, `https://api.github.com` (Keystatic saves).
- **`font-src`**: `'self'` (once self-hosted).
- **`report-uri`**: `/api/csp-report`
- **Provenance:** [src/pages/kontakt/index.astro], [src/pages/spenden.astro], [src/middleware.ts], [src/layouts/Base.astro]
- **Confidence:** High

### CSP Report Sink (`/api/csp-report`)
- **Implementation:** An Astro API route `src/pages/api/csp-report.ts` with `export const prerender = false;`.
- **Behavior:** Accepts POST requests with `application/csp-report` or `application/json`.
- **Cloudflare Static Build:** When `GITHUB_PAGES=true` (static), this route should ideally be skipped or handled gracefully. Since the site is `output: 'server'`, we must ensure the static build doesn't try to crawl/render this endpoint.
- **Confidence:** High

---

## 3. Font Self-Hosting
### Google Fonts Audit
- **Currently requested:** `Fredoka:wght@600;700` and `Poppins:wght@400;500;600;700`.
- **Local assets found in `design-system-assets/fonts/`**:
  - `Fredoka-SemiBold.woff2` (Weight 600)
  - `Fredoka-Bold.woff2` (Weight 700)
  - `Poppins-Regular.woff2` (Weight 400)
  - `Poppins-Medium.woff2` (Weight 500)
  - `Poppins-SemiBold.woff2` (Weight 600)
- **Gap:** `Poppins-Bold` (Weight 700) is missing locally.
- **Mitigation:** Map `Poppins-SemiBold` (600) to `font-weight: 700` for Poppins elements, or verify if Poppins 700 is actually used. Grep shows no explicit `font-family: Poppins; font-weight: 700` in CSS, but Tailwind `font-bold` is used on `font-sans` (Poppins) elements. 600 is usually sufficient for Poppins "bold" in this design language.
- **Confidence:** Medium (Poppins 700 missing, but 600 is a safe fallback).

---

## 4. Repository Hygiene
### Dead Assets & Components
- **`public/images/generated/`**: Contains `tagesschule-hero.png` (82MB blob).
  - *Usage:* Fallback in `src/pages/angebote/tagesschule/index.astro` and `src/pages/en/programs/day-school/index.astro`.
  - *Action:* Move to `public/images/programs/tagesschule-hero.png` and update references before untracking.
- **Dead Components:**
  - `AngeboteSection.astro` (replaced by V3)
  - `TimelineActivities.astro`
  - `ProgramCardEnhanced.astro`
  - *Verification:* Zero imports found in `src/**/*`. Safe to delete.
- **`public/images/Final images/`**: Contains subdirectories like `Programs/`, `Homepage-Hero/`. These appear to be duplicates or superseded versions. 
  - *Action:* Delete after verifying no direct URL references in content JSONs.
- **Provenance:** [grep search results], [directory listings]
- **Confidence:** High

---

## 5. Build & Deployment Constraints
- **Dual Build Requirement:** 
  - `npm run build` (Cloudflare SSR)
  - `GITHUB_PAGES=true npm run build` (Static)
- **Constraint:** Middleware only runs on Cloudflare SSR. CSP Sink only works on SSR. `_headers` is critical for static/prerendered parity.
- **Confidence:** High

## RESEARCH COMPLETE
