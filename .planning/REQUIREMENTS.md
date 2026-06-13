# Requirements: EVOLEA Website Quality Lift (B → A)

**Defined:** 2026-06-12
**Core Value:** Independent audits score evolea.ch ahead of eatplanted.com in all four categories — security, SEO, performance, accessibility — without regressing any live functionality.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Security

- [ ] **SEC-01**: Every SSR HTML response carries security headers (HSTS without `preload`, X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy) via `src/middleware.ts`
- [ ] **SEC-02**: Static assets and prerendered blog pages carry the same security headers via `public/_headers`, generated/sourced from the same single constant as the middleware (no drift)
- [ ] **SEC-03**: CSP ships in `Content-Security-Policy-Report-Only` mode with a working allowlist for Formspree, Instagram embed, inline scripts, and a scoped looser policy for `/keystatic`
- [ ] **SEC-04**: CSP violation reports are collected by an in-stack `/api/csp-report` Cloudflare Pages Function (no third-party service)
- [ ] **SEC-05**: The middleware double-`next()` body-consumption bug is fixed and middleware is decomposed via `sequence()` (trailing-slash → Keystatic → headers) before new logic lands

### SEO

- [x] **SEO-01**: Hostname-aware robots.txt (`src/pages/robots.txt.ts`): production gets `Allow` + `Sitemap:` line and `Disallow: /keystatic/`; staging/GitHub Pages hosts get `Disallow: /`
- [x] **SEO-02**: `/sitemap.xml` 301-redirects to `/sitemap-index.xml` and `<link rel="sitemap">` is present in the head
- [x] **SEO-03**: One canonical URL form (trailing slash) enforced via 301; `og:url`/`twitter:url` use `canonicalURL` instead of raw `Astro.url`
- [ ] **SEO-04**: Site-wide `Organization` (NGO) + `WebSite` JSON-LD emitted from Base.astro with a stable `@id`
- [ ] **SEO-05**: Blog posts emit `BlogPosting` JSON-LD (headline, datePublished, author, image, publisher → Organization `@id`) and `og:type` switches to `article`
- [ ] **SEO-06**: Nested pages emit `BreadcrumbList` JSON-LD matching the visible breadcrumbs
- [ ] **SEO-07**: Angebote program pages emit `Service` JSON-LD
- [ ] **SEO-08**: EVOLEA Cafe emits one recurring `Event` JSON-LD with `eventSchedule` and physical venue address (address to be confirmed with user during execution)
- [ ] **SEO-09**: Homepage and `/angebote/*` title tags follow `<primary keyword> – EVOLEA` pattern (DE and EN)

### Performance

- [ ] **PERF-01**: Team, program-hero, blog, and logo images converted to WebP at display size in place under `public/` (sRGB preserved); homepage total weight ≤1.5MB
- [ ] **PERF-02**: Every `<img>` on the site has explicit `width`/`height` attributes (CLS fix)
- [ ] **PERF-03**: Below-fold images use `loading="lazy"`; the LCP hero element gets `fetchpriority="high"` and is never lazy-loaded
- [ ] **PERF-04**: `/assets/*` served with `Cache-Control: public, max-age=31536000, immutable` via `public/_headers`
- [ ] **PERF-05**: Fredoka/Poppins self-hosted from `public/fonts/` with `@font-face`; Google Fonts `<link>` removed from Base.astro

### Accessibility & UX

- [ ] **A11Y-01**: The two `<nav>` landmarks in Header.astro carry distinguishing `aria-label`s (DE/EN aware) — axe landmark violation resolved
- [ ] **A11Y-02**: The `evolea-green` color-contrast violation is fixed to ≥4.5:1 on affected program pages — axe contrast violation resolved
- [ ] **A11Y-03**: A branded, bilingual 404 page exists with navigation back to Angebote/Blog (brand-guide compliant)

### Hygiene & Testing

- [ ] **HYG-01**: `tagesschule-hero.png` moved to a tracked location (`public/images/programs/`) with both DE/EN fallback paths updated, before any generated-image cleanup
- [ ] **HYG-02**: `public/images/generated/` untracked from git; `public/images/Final images/` and superseded logo originals deleted — each deletion gated on a `src/content/**/*.json` + source grep
- [ ] **HYG-03**: Dead components deleted after grep confirmation (AngeboteSection.astro, TimelineActivities.astro, ProgramCardEnhanced.astro)
- [ ] **HYG-04**: Playwright smoke tests pass: DE/EN homepage load, both contact forms render, donate-page language switcher works, all program pages respond 200, header-drift guard on one SSR route and one prerendered blog route

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Security

- **SEC-V2-01**: CSP flipped from Report-Only to enforcing after ≥1 week of violation reports analyzed
- **SEC-V2-02**: HSTS `includeSubDomains` decision after a `*.evolea.ch` DNS audit (never `preload`)

### Performance

- **PERF-V2-01**: Hero video compressed (~1.36MB mobile mp4 → ~600KB) or `prefers-reduced-motion` honored
- **PERF-V2-02**: AVIF/`<picture>` ladder if WebP budget proves insufficient

### Accessibility

- **A11Y-V2-01**: Manual WCAG audit (keyboard, screen reader, focus order, forms, mobile) before any public conformance claim

### Monitoring

- **MON-V2-01**: Monthly benchmark re-runs; PSI API key for CrUX field data once traffic accrues

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| FAQPage JSON-LD | Google removed FAQ rich results 2026-05-07 — zero SERP value |
| CSP enforcement in this milestone | Needs Report-Only data first; flipping blind risks breaking Formspree/Instagram/Keystatic on a live site |
| Aggressive HTML edge-caching | Dangerous with SSR + Keystatic edits + i18n content negotiation |
| Migrating images to `src/assets` + `<Image />` | Convert-in-place chosen; avoids template churn on SSR pages |
| Legacy Tailwind token migration | Separate design-system effort per existing memory rules |
| Public WCAG/EAA conformance claim | Swiss BehiG doesn't bind private NGOs until ~2027; axe covers only 30–50% of issues |
| Replatforming / output mode changes | Everything ships as config or template changes on the current stack |
| Blog content cadence / topical depth | Plan Phase 3 — recurring editorial work, not an engineering milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 1 | Pending |
| SEC-02 | Phase 1 | Pending |
| SEC-03 | Phase 1 | Pending |
| SEC-04 | Phase 1 | Pending |
| SEC-05 | Phase 1 | Pending |
| PERF-04 | Phase 1 | Pending |
| PERF-05 | Phase 1 | Pending |
| HYG-01 | Phase 1 | Pending |
| HYG-02 | Phase 1 | Pending |
| HYG-03 | Phase 1 | Pending |
| SEO-01 | Phase 2 | Complete |
| SEO-02 | Phase 2 | Complete |
| SEO-03 | Phase 2 | Complete |
| SEO-04 | Phase 2 | Pending |
| SEO-05 | Phase 2 | Pending |
| SEO-06 | Phase 2 | Pending |
| SEO-07 | Phase 2 | Pending |
| SEO-08 | Phase 2 | Pending |
| SEO-09 | Phase 2 | Pending |
| PERF-01 | Phase 3 | Pending |
| PERF-02 | Phase 3 | Pending |
| PERF-03 | Phase 3 | Pending |
| A11Y-01 | Phase 3 | Pending |
| A11Y-02 | Phase 3 | Pending |
| A11Y-03 | Phase 3 | Pending |
| HYG-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 26 total (enumerated count; the earlier "21 total" footer was stale — likely predated the SEO expansion to 9 items)
- Mapped to phases: 26
- Unmapped: 0 ✓

**By phase:**
- Phase 1 (Foundation & Security): SEC-01..05, PERF-04, PERF-05, HYG-01..03 (10)
- Phase 2 (SEO & Structured Data): SEO-01..09 (9)
- Phase 3 (Performance, A11y & Testing): PERF-01..03, A11Y-01..03, HYG-04 (7)

---
*Requirements defined: 2026-06-12*
*Last updated: 2026-06-12 after roadmap creation*
