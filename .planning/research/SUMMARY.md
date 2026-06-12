# Project Research Summary

**Project:** EVOLEA Website Quality Lift (B → A)
**Domain:** Production-site hardening — security, SEO, performance, accessibility on Astro 5 SSR / Cloudflare Pages
**Researched:** 2026-06-12
**Confidence:** HIGH

## Executive Summary

This is a brownfield hardening pass on a live bilingual Swiss NGO website (Astro 5.16.4, `output: 'server'`, Cloudflare Pages), not a greenfield build. No replatforming; every fix ships as config or template edits on the current stack. The recommended approach is a four-track workstream (security, SEO, performance, a11y/UX) in a dependency-safe order: repo hygiene first, then font self-hosting as a CSP prerequisite, then a middleware refactor as the foundation for all header/cache/redirect work, then three content tracks largely in parallel.

The dominant risk is the **dual-path header delivery problem**: Astro middleware does not run for prerendered routes (all blog slugs) or for static `/assets/*` files — those need `public/_headers`. A single source constant (e.g. `src/lib/security-headers.ts`) feeding both mechanisms prevents drift. The existing middleware also has a live double-`next()` body-consumption bug (documented in CONCERNS.md) that must be fixed before any new logic is added.

The secondary risk cluster covers irreversible or live-site-breaking moves: HSTS `preload` subdomain lockout (ship without `preload`), and premature CSP enforcement breaking Formspree/Instagram/Keystatic — CSP ships Report-Only with a working report sink, enforcement is explicitly out of scope.

## Key Findings

### Recommended Stack

No new runtime framework dependencies. All header/CSP work is hand-rolled in `src/middleware.ts` (Astro's native CSP is v6-only and cannot allowlist external domains anyway). Build-time tooling does the heavy lifting for images and JSON-LD typing. Details in `STACK.md`.

**Core technologies:**
- Hand-rolled CSP-RO + security headers in `src/middleware.ts`: only mechanism that reaches SSR responses — paired with `public/_headers` for static assets and prerendered blog HTML
- `sharp` 0.35.1 (dev-only Node script): in-place WebP conversion with explicit sRGB handling — Squoosh CLI is deprecated/dead since 2023
- `schema-dts` 2.0.0 (devDependency): compile-time JSON-LD type safety, zero runtime cost — preferred over `astro-seo-schema` runtime wrapper
- `@playwright/test` 1.60.0: full test runner — existing `playwright-core` has no runner and cannot execute `.spec.ts`
- Self-hosted fonts from `design-system-assets/fonts/` (already in repo): removes Google Fonts origins, simplifies CSP, GDPR win
- CSP report sink as a Cloudflare Pages Function (privacy-clean for a Swiss NGO vs report-uri.com); ship both `report-uri` and `Reporting-Endpoints`

### Expected Features

Details in `FEATURES.md`. Observatory scoring is precise: no CSP = −25, no HSTS = −20, no X-Frame = −20 — headers are the highest-leverage, lowest-risk win (D→A).

**Must have (table stakes):**
- Security headers (HSTS without `preload`, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy)
- CSP Report-Only with Formspree/Instagram/inline/Keystatic allowlist + report endpoint
- robots.txt referencing sitemap + `<link rel="sitemap">`; trailing-slash canonical enforcement; `canonicalURL` on og:url/twitter:url
- Organization/NGO + WebSite JSON-LD in Base.astro; BlogPosting + `og:type=article` on posts; BreadcrumbList on inner pages (highest-ROI rich result)
- WebP conversion + explicit width/height on every `<img>` (7MB → ≤1.5MB homepage; fixes LCP and CLS)
- `loading="lazy"` below-fold; `fetchpriority="high"` on the LCP hero element (never lazy-load the LCP element)
- `Cache-Control: public, max-age=31536000, immutable` for `/assets/*` via `public/_headers` (NOT middleware)
- Self-hosted fonts; 2 axe fixes (nav aria-labels, evolea-green contrast); branded bilingual 404; Playwright smoke tests

**Should have (competitive):**
- `Service` JSON-LD on Angebote pages; keyword-first title tags on commercial-intent pages
- EVOLEA Cafe as ONE `Event` with `eventSchedule` (recurring schedule, no per-occurrence pages) — gated on confirming a physical address

**Defer (v2+ / anti-features):**
- FAQPage JSON-LD — Google removed FAQ rich results 2026-05-07, zero SERP value
- CSP enforcement flip — needs ≥1 week of Report-Only data
- AVIF/`<picture>` pipeline — WebP alone meets the budget; 5–20× slower encodes
- Aggressive HTML edge-caching — dangerous with SSR + Keystatic + i18n
- Public WCAG/EAA conformance claim — Swiss BehiG doesn't bind private NGOs until ~2027; axe catches only 30–50% of issues

### Architecture Approach

Decompose `src/middleware.ts` via `sequence()` into `trailingSlash → keystatic → securityHeaders`, each independently testable; the trailing-slash handler returns early without `next()`. Fix the double-`next()` catch path first (mutate `res.headers` in place for header-only changes; `clone()` before `.text()` for the Keystatic rewrite). All URL-emitting features (robots, JSON-LD, canonicals) must derive from `Astro.site`/`BASE_URL` — never hardcode the domain — or the GitHub Pages static fallback ships wrong-domain metadata. Middleware/CSP can only be verified on a Cloudflare preview deploy (`astro preview` at minimum), never `astro dev`. Details in `ARCHITECTURE.md`.

**Major components:**
1. `src/lib/security-headers.ts` — single source constant for headers, consumed by middleware AND used to generate `public/_headers`
2. `src/middleware.ts` (sequence of 3) — trailing-slash 301, Keystatic wrapper, security/cache headers for SSR responses
3. `public/_headers` — static-asset and prerendered-HTML backstop (`/assets/*` immutable caching lives here)
4. Base.astro head — Organization/WebSite JSON-LD, sitemap link, fixed og:url; per-page JSON-LD components reference the Organization `@id`
5. `scripts/optimize-images.mjs` (sharp) — one-shot in-place WebP conversion of `public/images/`
6. `tests/smoke/*.spec.ts` (Playwright) — regression net asserting finished behavior incl. header drift on SSR + blog routes

### Critical Pitfalls

Top 5 from `PITFALLS.md` (10 documented):

1. **Dual-build trap** — middleware is inert in the GitHub Pages static build; add "GITHUB_PAGES=true npm run build still green" to every phase's success criteria
2. **Middleware body-consumption bug** — fix the double-`next()` catch before adding any header logic; set headers without reading bodies
3. **CSP enforce-before-reading** — Report-Only with a working sink, enforcement out of scope; Keystatic may need `'unsafe-eval'` (confirm from reports)
4. **Trailing-slash redirect loops** — `trailingSlash: 'always'` has open 308/404 issues with the Cloudflare adapter; validate on preview deploy, middleware redirect is the fallback primary
5. **Deleting "grep-unused" images that CMS JSON still references** — grep `src/content/**/*.json` and migrate the tagesschule-hero fallback before untracking `generated/`; sharp strips ICC profiles by default (force sRGB) or brand photos wash out

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Security
**Rationale:** Everything else layers onto a safe middleware and a clean repo; headers are the biggest score jump (Security 45 → ~85)
**Delivers:** Repo hygiene (tagesschule-hero migration, untrack generated/, delete dead components/images), self-hosted fonts, middleware `sequence()` refactor + double-`next()` fix, security headers, CSP Report-Only + report sink, `public/_headers` backstop with `/assets/*` immutable caching
**Addresses:** Security table stakes, GDPR font win, cache table stakes
**Avoids:** Pitfalls 1, 2, 3, 5 (dual-build, body-consumption, CSP breakage, image deletion)

### Phase 2: SEO and Structured Data
**Rationale:** Canonical URL form must be settled before robots.txt and JSON-LD emit URLs; Organization `@id` must exist before BlogPosting/Service reference it
**Delivers:** Trailing-slash canonical fix, robots.txt + sitemap discovery + `/sitemap.xml` redirect, Organization/NGO + WebSite JSON-LD, BlogPosting + og:type, BreadcrumbList, Service JSON-LD, keyword title tags
**Uses:** schema-dts, middleware trailing-slash handler from Phase 1
**Implements:** Components 2 (trailing-slash), 4 (JSON-LD head)

### Phase 3: Performance, A11y, and Testing
**Rationale:** Independent of SEO work; tests come last because they assert the finished state of all prior phases
**Delivers:** sharp WebP conversion with width/height attributes, lazy-loading + LCP fetchpriority, 2 axe fixes, branded bilingual 404, Playwright smoke tests incl. header-drift guard

### Phase Ordering Rationale

- Fonts before CSP: self-hosting removes Google Fonts origins from the allowlist before it is written
- Middleware refactor before headers: the double-`next()` bug becomes a time bomb the moment a second concern is added
- Trailing-slash before robots.txt/JSON-LD: the canonical URL form must be chosen before anything emits URLs
- Site-wide JSON-LD before per-page: `publisher`/`organizer` reference the Organization `@id`
- Hygiene before image conversion: don't optimize images that are about to be deleted/untracked
- Tests last: they assert completed behavior, not work in progress

### Research Flags

Phases likely needing validation during planning/execution:
- **Phase 2:** `trailingSlash: 'always'` adapter compatibility — MEDIUM confidence; validate on a Cloudflare preview deploy before locking the approach (middleware redirect is the fallback)

Phases with standard patterns (skip research-phase):
- **Phase 1:** headers/CSP/middleware — well-documented, primary sources verified
- **Phase 3:** sharp/Playwright/axe fixes — established patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against official docs + npm registry on 2026-06-12; negative findings (Squoosh dead, native CSP unfit) from primary sources |
| Features | HIGH | Observatory scoring, schema.org, Core Web Vitals, Swiss/EU law from official/primary sources; FAQ removal date confirmed |
| Architecture | HIGH | Middleware prerender behavior verified against Astro docs + roadmap discussion #869; dual-build facts read from live repo files |
| Pitfalls | HIGH | Each critical pitfall grounded in repo facts (CONCERNS.md, live middleware code) or official citations |

**Overall confidence:** HIGH

### Gaps to Address

- `trailingSlash: 'always'` adapter behavior: validate on preview deploy in Phase 2 before locking in; middleware redirect is the fallback
- CSP allowlist completeness (esp. Instagram embed and whether Keystatic needs `'unsafe-eval'`): confirm from Report-Only reports after Phase 1 ships
- Staging de-indexing (`evolea-website.pages.dev`): a static robots.txt allows indexing of staging too — decide static vs hostname-keyed dynamic route before robots.txt ships
- EVOLEA Cafe Event JSON-LD: gated on confirming a physical Zurich address and a maintenance owner for `eventStatus`
- `*.evolea.ch` subdomain audit before HSTS `includeSubDomains` (no `preload` either way)

## Sources

### Primary (HIGH confidence)
- Astro official docs — middleware, on-demand rendering, CSP (v6), trailingSlash
- withastro/roadmap discussion #869 — middleware does not run on prerendered pages
- MDN HTTP Observatory scoring docs; MDN CSP implementation guide
- Google Search Central — Event/BlogPosting/BreadcrumbList structured data; FAQ rich-result removal
- sharp official docs (ICC/sRGB behavior); Playwright official docs; npm registry version checks (2026-06-12)

### Secondary (MEDIUM confidence)
- Open Astro/Cloudflare adapter issues on trailing-slash 308/404 behavior
- Level Access EAA compliance overview; Härting BehiG analysis (Swiss a11y law timeline)
- 2026 Core Web Vitals and structured-data industry guides

---
*Research completed: 2026-06-12*
*Ready for roadmap: yes*
