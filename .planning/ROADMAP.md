# Roadmap: EVOLEA Website Quality Lift (B → A)

## Overview

A brownfield hardening pass on the live bilingual EVOLEA site (Astro 5 SSR / Cloudflare Pages) that closes the security, SEO, performance, and accessibility gaps versus eatplanted.com. The journey runs in dependency-safe order: first a clean repo and a safe, refactored middleware deliver the security and caching foundation (the biggest score jump, D → A); then SEO discovery and structured data emit correct, canonical URLs onto that foundation; finally image optimization, the two axe fixes, a branded 404, and a Playwright regression net lock in the finished state. CSP ships Report-Only (enforcement deferred to v2), nothing replatforms, and DE/EN parity plus the GitHub Pages static fallback build stay green throughout.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Security** - Clean repo, self-hosted fonts, refactored middleware, security headers + CSP Report-Only + cache backstop (completed 2026-06-12)
- [x] **Phase 2: SEO & Structured Data** - Canonical URL form, robots/sitemap discovery, and full JSON-LD coverage (completed 2026-06-12)
- [x] **Phase 3: Performance, A11y & Testing** - WebP/CLS/LCP image work, two axe fixes, branded 404, Playwright smoke net (completed 2026-06-13)

## Phase Details

### Phase 1: Foundation & Security
**Goal**: A safe, decomposed middleware and a clean repo deliver security headers and long-cache assets on every response path, raising the Mozilla Observatory grade from D to ~A without breaking forms, Keystatic, or the static fallback build.
**Depends on**: Nothing (first phase)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, PERF-04, PERF-05, HYG-01, HYG-02, HYG-03
**Success Criteria** (what must be TRUE):
  1. `curl -I` shows HSTS (no `preload`), X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy, and Permissions-Policy on an SSR route AND on a prerendered blog route (middleware + `public/_headers` parity, no drift)
  2. `curl -I` on an `/assets/*` file returns `Cache-Control: public, max-age=31536000, immutable`; `Content-Security-Policy-Report-Only` is present and POSTs land at `/api/csp-report`; Formspree, Instagram embed, and `/keystatic` still load with zero CSP-blocked-resource console errors
  3. Base.astro emits no Google Fonts `<link>` — Fredoka/Poppins load from `public/fonts/` via `@font-face`; the middleware no longer double-calls `next()` and is composed via `sequence()`
  4. `git ls-files public/images/generated/` returns nothing, `Final images/` and superseded logo originals are gone, dead components are deleted, and the tagesschule-hero resolves from `public/images/programs/` in both DE and EN with no broken-image references
  5. `npm run build` and `GITHUB_PAGES=true npm run build` both stay green
**Plans**: 3 plans
  - [x] 01-01-PLAN.md — Security headers constant, sequence() middleware refactor + double-next() fix, CSP Report-Only sink, public/_headers + immutable /assets cache
  - [x] 01-02-PLAN.md — Self-host Fredoka/Poppins via @font-face, remove Google Fonts link, base-prefixed preloads
  - [x] 01-03-PLAN.md — Relocate tagesschule hero, untrack generated/, delete Final images + logo originals + dead components
**UI hint**: yes

### Phase 2: SEO & Structured Data
**Goal**: A single canonical URL form is enforced and every page emits correct discovery metadata and valid structured data, so the site passes Google's Rich Results test and closes the largest SEO gap versus eatplanted.com.
**Depends on**: Phase 1 (trailing-slash handler in the refactored middleware; URLs derive from `Astro.site`/`BASE_URL`)
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08, SEO-09
**Success Criteria** (what must be TRUE):
  1. Production `robots.txt` serves `Allow` + `Sitemap:` + `Disallow: /keystatic/`, while staging/GitHub Pages hosts serve `Disallow: /`; `/sitemap.xml` 301-redirects to `/sitemap-index.xml` and `<link rel="sitemap">` is in the head
  2. Every page resolves to one trailing-slash canonical (the other 301s, no redirect loop on a Cloudflare preview deploy); `og:url`/`twitter:url` match the `canonicalURL`, not raw `Astro.url`
  3. Google Rich Results test passes for the homepage (Organization/NGO + WebSite with a stable `@id`), a blog post (`BlogPosting` with `og:type=article`, publisher referencing the Organization `@id`), an Angebote page (`Service` + `BreadcrumbList`), and the EVOLEA Cafe page (one recurring `Event`)
  4. Homepage and `/angebote/*` titles follow `<primary keyword> – EVOLEA` in both DE and EN
  5. `npm run build` and `GITHUB_PAGES=true npm run build` both stay green
**Plans**: 5 plans
  - [x] 02-01-PLAN.md — Trailing-slash 301 middleware, hostname-keyed robots.txt, /sitemap.xml redirect + brand filter, Base head fixes (canonical/og:url/ogType/rel=sitemap/separator/noindex)
  - [x] 02-02-PLAN.md — JSON-LD foundation: seo.ts schema builders + JsonLd.astro + site-wide NGO/WebSite @graph from Base
  - [x] 02-03-PLAN.md — Keyword titles ('<primary keyword> – EVOLEA') on homepage + all Angebote pages, DE/EN, CMS-decoupled
  - [x] 02-04-PLAN.md — BreadcrumbList (InnerPageHero + 7 program components) + Service JSON-LD on program pages
  - [x] 02-05-PLAN.md — BlogPosting + og:type article + blog breadcrumbs (DE/EN) and recurring Cafe Event JSON-LD
**UI hint**: yes

### Phase 3: Performance, A11y & Testing
**Goal**: Image weight, layout shift, and LCP are fixed, the two remaining axe violations are resolved, a brand-compliant bilingual 404 exists, and a Playwright smoke net asserts the finished state of all prior phases.
**Depends on**: Phase 2 (tests assert completed behavior from all phases; image work follows hygiene cleanup in Phase 1)
**Requirements**: PERF-01, PERF-02, PERF-03, A11Y-01, A11Y-02, A11Y-03, HYG-04
**Success Criteria** (what must be TRUE):
  1. Homepage total transfer weight is ≤1.5MB with team/program/blog/logo images served as WebP at display size (sRGB preserved, no visible photo degradation); every `<img>` carries explicit `width`/`height`
  2. Below-fold images use `loading="lazy"`, the LCP hero element carries `fetchpriority="high"` and is never lazy-loaded
  3. axe-core reports 0 violations: the two Header `<nav>` landmarks carry distinguishing DE/EN-aware `aria-label`s and the `evolea-green` contrast is ≥4.5:1 on affected program pages
  4. A branded, bilingual 404 page (prism hero, page closer, no emojis) links back to Angebote/Blog and renders in both DE and EN
  5. Playwright smoke suite passes (DE/EN homepage load, both contact forms render, donate language switcher, all program pages 200, header-drift guard on one SSR and one prerendered blog route) and `npm run build` + `GITHUB_PAGES=true npm run build` stay green
**Plans**: 4 plans
  - [x] 03-01-PLAN.md — Convert images in place to WebP (manifest-driven sharp script), flip all CMS/MDX/hardcoded references, two-way grep gate, delete originals
  - [x] 03-02-PLAN.md — Darken evolea-green to #236247 in both token files + brand-compliant bilingual 404 page per 03-UI-SPEC.md
  - [x] 03-03-PLAN.md — width/height on every img, lazy/fetchpriority LCP policy, Base preloadImage poster preload, Header + breadcrumb nav aria-labels
  - [x] 03-04-PLAN.md — Playwright smoke/a11y/headers suite (@playwright/test 1.57.0, wrangler pages dev), homepage budget measurement + conditional SSIM-gated video re-encode
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Security | 3/3 | Complete   | 2026-06-12 |
| 2. SEO & Structured Data | 5/5 | Complete   | 2026-06-12 |
| 3. Performance, A11y & Testing | 4/4 | Complete   | 2026-06-13 |
