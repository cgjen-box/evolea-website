# Feature Research

**Domain:** Production technical quality lift (security headers, SEO/structured data, performance, accessibility) for a bilingual Swiss non-profit content site (Astro 5.x SSR on Cloudflare Pages)
**Researched:** 2026-06-12
**Confidence:** HIGH (Google Search Central, MDN HTTP Observatory, schema.org, EAA/BehiG legal sources, Playwright docs all current 2026)

> Scope note: This is a quality-lift on an existing production site, not a greenfield build. "Table stakes" here means *what an auditor (Mozilla Observatory, axe-core, Google Rich Results, Lighthouse/CrUX) and a 2026 visitor expect*, and what is needed to beat the eatplanted.com benchmark in all four categories. "Differentiators" are where EVOLEA can pull ahead of that benchmark. "Anti-features" are things that look in-scope but should be deliberately excluded.

---

## Feature Landscape

### Table Stakes (Auditors / Visitors Expect These)

Missing these = a measurable penalty in Observatory / Lighthouse / Rich Results, or a visibly broken experience. None of these is optional to hit an A.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy** | Observatory penalizes each missing header (no HSTS −20, no X-Frame-Options −20, no nosniff). Single biggest, lowest-risk score jump (D→A). | LOW | Inject in `src/middleware.ts` on every non-Keystatic HTML response. `public/_headers` does NOT apply to SSR responses (confirmed CONCERNS.md). Values per plan §1.1. |
| **CSP in Report-Only mode** | Observatory weights CSP heaviest (no CSP = −25; A+ requires a CSP). Report-Only is the correct first step for a live site — get violation reports without breaking Formspree/Instagram/Keystatic. | MEDIUM | `Content-Security-Policy-Report-Only`. Allowlist: `form-action`/`connect-src https://formspree.io`, `frame-src https://www.instagram.com`, Google Fonts (dropped once fonts self-hosted), inline scripts in Base.astro. Looser policy for `/keystatic`. Enforcement is OUT of scope (needs ~1wk data). |
| **robots.txt referencing the sitemap** | Crawlers discover the sitemap via robots.txt; none exists today. Also the only place to `Disallow: /keystatic/`. Trivial SEO win. | LOW | `src/pages/robots.txt.ts` (dynamic, `text/plain`) or static `public/robots.txt`. Must include `Sitemap: https://www.evolea.ch/sitemap-index.xml`. Keep any Cloudflare content-signals block. |
| **`/sitemap.xml` discoverability + `<link rel="sitemap">`** | `/sitemap.xml` currently 404s; Astro sitemap docs recommend both head link and redirect. | LOW | Add `<link rel="sitemap" href="/sitemap-index.xml">` in head; redirect `/sitemap.xml → /sitemap-index.xml`. Manual GSC/Bing submission is a user step. |
| **Single canonical per page (trailing-slash enforced)** | `/blog` and `/blog/` both 200 with self-canonicals = split canonical, can suppress pages in Google. | MEDIUM | Enforce one form via `trailingSlash: 'always'` (verify Cloudflare adapter compat) OR middleware 301. Also fix `og:url`/`twitter:url` to use `canonicalURL`, not `Astro.url` (one-line fix, CONCERNS.md). |
| **`Organization`/`NGO` + `WebSite` JSON-LD site-wide** | Establishes canonical brand identity in Google Knowledge Graph; prerequisite for brand mentions in AI answer engines. eatplanted has JSON-LD everywhere — biggest SEO gap. | MEDIUM | Inject once in `Base.astro`. Use `NGO` (Organization subtype) with `name`, `logo`, `url`, `sameAs` (socials), Zurich address. Add `WebSite` with `inLanguage`. |
| **`BlogPosting` JSON-LD + `og:type: article` on posts** | Article schema feeds publication date, author, article carousels. Posts currently emit `og:type: website`. | MEDIUM | In `blog/[...slug].astro`. Required: `headline`, `datePublished`, `dateModified`, `author` (Person), `publisher` (Organization). |
| **`BreadcrumbList` JSON-LD on nested pages** | Highest-ROI schema: breadcrumb trail replaces raw URL in SERP; applies to nearly every deep page; rarely fails validation. Breadcrumbs already render visually but not in structured data. | LOW | Add in `InnerPageHero.astro` (already renders the breadcrumb nav). |
| **Branded bilingual 404 page** | Cloudflare's default unstyled error page breaks brand and offers no navigation back. | LOW | `src/pages/404.astro` via `Base.astro`, DE+EN copy, links to Angebote/Blog/Home. Must comply with brand guide (gradient hero, no emojis). |
| **WebP image conversion + explicit width/height** | Homepage ~7MB (4.4MB in 3 team PNGs alone). 2026 LCP good <2.5s (Google tightened lab target toward 2.0s), CLS <0.1. Missing width/height = CLS spikes. | MEDIUM | Convert in place (sharp/squoosh) — SSR can't transform at request time; convert-in-place avoids template churn (PROJECT.md decision). Targets: team ≤100KB, heroes ≤200KB, logo ≤60KB or SVG. Set `width`/`height` on every `<img>`. |
| **`loading="lazy"` below-fold + preload/`fetchpriority="high"` on LCP** | Lazy-load below-fold is standard; NEVER lazy-load the LCP element. `fetchpriority="high"` on the hero poster is the single highest-impact LCP attribute (Google: 2.6s→1.9s). | LOW | Hero poster (`/images/hero-poster.jpg`) is the LCP element — preload and/or `fetchpriority="high"`, do NOT lazy-load it. |
| **`Cache-Control: immutable` for `/assets/*`** | Hashed assets cache only ~4h (Cloudflare default) → repeat visitors re-download JS/CSS each purge. | LOW | `public, max-age=31536000, immutable` in middleware for `pathname.startsWith('/assets/')`. |
| **Self-hosted fonts** | Removes Google Fonts external dependency (render-blocking + GDPR/Swiss data concern). Files already in `design-system-assets/fonts/`. | LOW | Copy `.woff2` to `public/fonts/`, add `@font-face` in `global.css`, drop the Google `<link>`. Also simplifies CSP. |
| **Final 2 axe-core fixes (0 violations)** | Currently 2 violations (1 nav-landmark, 1 color-contrast). eatplanted has 7 (2 critical) — closing to 0 keeps/extends the accessibility lead. | LOW | aria-labels on the two `<nav>` in Header.astro; darken/weight `text-evolea-green` on translucent badge backgrounds. |
| **Playwright smoke tests** | Zero automated tests today; manual checklist only. 2026 norm for any deploy pipeline is a fast smoke suite (<5min) on critical paths. `playwright-core` already in devDeps. | MEDIUM | DE+EN homepage 200/render, both contact forms render, donate language switcher, all program pages 200. Use `getByRole`/`getByLabel` semantic selectors; rely on auto-waiting. Run post-deploy or on PR. |

### Differentiators (Pull Ahead of the eatplanted.com Benchmark)

Not strictly required to pass an audit, but where EVOLEA can clearly beat the benchmark and future-proof for AI search.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **A stricter CSP than the benchmark (toward enforcement)** | eatplanted runs a 16-script tag stack; EVOLEA has far fewer third parties, so a tight nonce/hash-based CSP is reachable. Hashes/nonces beat `'unsafe-inline'` (browser ignores `unsafe-inline` when a hash is present). | MEDIUM-HIGH | Enforcement flip is OUT of scope this milestone. But *designing* the Report-Only policy to be nonce-ready pays off at the flip. |
| **`EducationalOrganization` semantics (not just generic Organization)** | EVOLEA runs educational programs for children — `EducationalOrganization`/`NGO` is more semantically accurate and richer for Knowledge Graph / AI answers than plain Organization. | LOW | Can combine `NGO` + `EducationalOrganization` typing. Adds specificity competitors using generic `Organization` lack. |
| **`Event` JSON-LD for EVOLEA Cafe (recurring meetup)** | Event rich results show occurrence cards; a recurring parent-cafe ("every 2nd Wednesday") surfaces in search/AI as a real, attendable event. | MEDIUM | Google rich results REQUIRE `name`, `startDate` (ISO 8601 w/ timezone), and a *physical* `location`. Online-only does not qualify. See Anti-features for the recurrence trade-off. |
| **`Service`/`Course` JSON-LD on Angebote/program pages** | Programs (Mini Garten, Mini Turnen, etc.) as `Course`/`Service` entities give richer commercial-intent signals than plain text pages. | MEDIUM | Pairs with BreadcrumbList on the same pages. `Course` may fit educational programs better than `Service`. |
| **Keyword-led title tags** | "Startseite \| EVOLEA" wastes the highest-value SEO real estate. Pattern `<primary keyword> – EVOLEA` (e.g. "Kinderturnen & Bewegungsförderung in Zürich – EVOLEA"). | LOW | Homepage + all `/angebote/*` (commercial intent). DE+EN parity required. |
| **Repo/asset hygiene (untrack 82MB generated/, delete dead components)** | Not visitor-facing, but shrinks repo ~90MB, speeds CI, removes silent-404 fallback risk (tagesschule-hero). Indirectly protects performance and maintainability. | MEDIUM | `git rm -r --cached public/images/generated/`; move tagesschule-hero to `public/images/programs/` first; delete `Final images/` + superseded logo originals + dead components (grep-confirm). |

### Anti-Features (Look In-Scope, Deliberately Exclude)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **`FAQPage` structured data** | Listed in many "2026 schema" guides; site has FAQ-ish content. | Google **removed FAQ rich results on 2026-05-07** — zero SERP feature now. Markup still valid schema.org but earns no visible payoff. | Skip this milestone. May add later purely for AI/answer-engine signal if cheap. Already in PROJECT.md Out of Scope. |
| **Flipping CSP to enforcement now** | "We added CSP, just turn it on." | High breakage risk on a live NGO site (Formspree submit, Instagram embed, inline scripts, Keystatic). Needs ≥1 week Report-Only data to verify the allowlist. | Ship Report-Only this milestone; flip is a follow-up (PROJECT.md Out of Scope). |
| **Per-occurrence `Event` pages for the recurring cafe (12+ dated URLs)** | Google surfaces individual occurrence cards, so "duplicate per date" maximizes coverage. | Heavy content-ops burden for a small volunteer NGO; stale/uncancelled events are worse than none (must update `eventStatus`, keep `startDate`, add `previousStartDate` on reschedule). No CMS workflow for this. | Use one Event with `eventSchedule` (Schedule object) — richer signal than duplicating, far lower maintenance. NOTE: a Schedule-based Event must NOT carry `startDate`/`endDate` (they live in the Schedule), and a bare schedule may not earn the full rich card — accept that trade-off. |
| **Migrating images to `src/assets` + `<Image />`** | "Proper" Astro pipeline with responsive srcset/AVIF. | SSR pages can't transform at request time; touching every template is churn and regression risk on a live site. | Convert-in-place to WebP with explicit dimensions (PROJECT.md decision). AVIF/`<picture>` multi-format is a possible Phase-3 refinement. |
| **Public WCAG/EAA conformance claim ("WCAG AA compliant")** | 0 axe violations feels like "we're compliant." | axe catches only ~30–50% of issues; a public claim without manual keyboard/screen-reader/focus testing is legally and reputationally risky. AND Swiss BehiG does **not** yet bind private non-profits (public bodies since 2025; private actors expected ~2027); EAA binds EU-market economic operators with a microenterprise exemption. No *current legal mandate* forces a claim. | Fix the 2 axe violations + do manual checks (keyboard, focus order, forms, mobile, reduced-motion) as good practice for a neurodivergent audience, but do NOT publish a formal conformance statement this milestone. |
| **Edge-caching HTML aggressively** | "It's basically static, cache the HTML at the edge too." | It's `output: 'server'` (SSR) with language/middleware logic and Keystatic; aggressive HTML edge cache can serve wrong-language/stale CMS content and complicate the canonical/redirect work. | Cache `/assets/*` immutably (in scope). Leave HTML caching to a later deliberate eval. |
| **Hero video re-encode / AV1 ladder** | Hero video is part of homepage weight. | Image wins land first and are lower-risk; video re-encode is a separate, heavier effort. | Phase 3 (PROJECT.md Out of Scope). Honoring `prefers-reduced-motion` is already a brand requirement. |

---

## Feature Dependencies

```
Self-hosted fonts
    └──enables──> simpler CSP (drops fonts.googleapis.com / fonts.gstatic.com from allowlist)

Security headers (HSTS/nosniff/X-Frame/Referrer/Permissions)
    └──same injection point──> CSP Report-Only
            └──same injection point──> Cache-Control /assets/*
                    (all three live in src/middleware.ts)

Trailing-slash canonical fix
    └──must precede / align with──> robots.txt + sitemap discovery
            (canonical form must match the URLs in the sitemap)
    └──pairs with──> og:url/twitter:url = canonicalURL fix

Organization/NGO JSON-LD (Base.astro)
    └──reused by──> BlogPosting publisher field
    └──reused by──> Event organizer field

BreadcrumbList JSON-LD ──co-located with──> Service/Event JSON-LD (Angebote pages)

WebP conversion + width/height
    └──prerequisite for──> meaningful CLS improvement
    └──pairs with──> lazy-loading + LCP preload (do NOT lazy-load LCP)

Untrack generated/ images
    └──requires first──> move tagesschule-hero to public/images/programs/ (avoid silent 404)

Playwright smoke tests ──validate──> all template/route changes above (forms, language switcher, program 200s)

CSP enforcement (OUT of scope)
    └──requires──> ≥1 week of CSP Report-Only violation data
```

### Dependency Notes

- **Self-hosted fonts → simpler CSP:** Removing Google Fonts lets the CSP `style-src`/`font-src` drop two external origins, tightening the policy. Do fonts before finalizing the CSP allowlist.
- **Trailing-slash fix → sitemap discovery:** The canonical form chosen must match the URLs `@astrojs/sitemap` emits; otherwise robots.txt points crawlers at one form while pages canonicalize to another.
- **Organization JSON-LD reused downstream:** `publisher` (BlogPosting) and `organizer` (Event) should reference the same Organization entity defined in Base.astro — define it once, `@id`-link it.
- **WebP + width/height → CLS:** Format conversion alone reduces bytes/LCP; explicit dimensions are what actually fix CLS. Both are needed.
- **Untrack generated/ requires moving tagesschule-hero first:** The program page falls back to `/images/generated/tagesschule-hero.png`; untracking without moving it creates a live silent 404.
- **Smoke tests validate everything:** They are the regression net for the canonical redirect, language switcher, and form changes — write them alongside (not after) the template work.

---

## MVP Definition

This milestone IS the MVP (a defined quality-lift), so "MVP" = the must-ship set to hit A in all four audit categories without regressing live functionality.

### Launch With (this milestone)

- [ ] Security headers via middleware — biggest score jump, lowest risk (Security D→~85)
- [ ] CSP Report-Only with full allowlist — required for A+, ships safe
- [ ] robots.txt + sitemap discovery + `<link rel="sitemap">` — biggest SEO gap, trivial
- [ ] Trailing-slash canonical enforcement + canonicalURL on og/twitter — prevents split canonical
- [ ] Organization/NGO + WebSite + BlogPosting + BreadcrumbList JSON-LD — closes structured-data gap vs eatplanted
- [ ] WebP conversion + explicit width/height + lazy-load + LCP preload — homepage 7MB→≤1.5MB
- [ ] Cache-Control immutable for /assets/*
- [ ] Self-hosted fonts
- [ ] Final 2 axe fixes (→0 violations)
- [ ] Branded bilingual 404
- [ ] Playwright smoke tests
- [ ] Repo/asset hygiene (untrack generated/, delete dead components/originals)

### Add After Validation (follow-up)

- [ ] Flip CSP to enforcement — trigger: ≥1 week clean Report-Only data
- [ ] `Event` (eventSchedule) for EVOLEA Cafe — trigger: confirm physical address + recurrence data + a maintenance owner
- [ ] `Service`/`Course` JSON-LD on Angebote — trigger: after core schema validated in Rich Results test
- [ ] Manual WCAG audit + (optional) accessibility statement — trigger: before BehiG private-actor deadline (~2027) or any public claim

### Future Consideration (Phase 3 / deferred)

- [ ] AVIF / `<picture>` multi-format responsive images — defer: convert-in-place WebP meets the budget now
- [ ] Hero video AV1/H.265 re-encode — defer: image wins first
- [ ] Edge-caching HTML — defer: needs deliberate eval against SSR/i18n/CMS correctness
- [ ] FAQPage markup for AI engines only — defer: no SERP value since 2026-05-07

---

## Feature Prioritization Matrix

| Feature | User/Audit Value | Implementation Cost | Priority |
|---------|------------------|---------------------|----------|
| Security headers (HSTS/nosniff/etc.) | HIGH | LOW | P1 |
| CSP Report-Only | HIGH | MEDIUM | P1 |
| robots.txt + sitemap discovery | HIGH | LOW | P1 |
| Trailing-slash canonical + og/twitter fix | HIGH | MEDIUM | P1 |
| Organization/NGO + WebSite JSON-LD | HIGH | MEDIUM | P1 |
| BlogPosting JSON-LD + og:type article | HIGH | MEDIUM | P1 |
| BreadcrumbList JSON-LD | HIGH | LOW | P1 |
| WebP conversion + width/height | HIGH | MEDIUM | P1 |
| Lazy-load + LCP preload/fetchpriority | HIGH | LOW | P1 |
| Cache-Control /assets/* | MEDIUM | LOW | P1 |
| Self-hosted fonts | MEDIUM | LOW | P1 |
| Final 2 axe fixes | HIGH | LOW | P1 |
| Branded bilingual 404 | MEDIUM | LOW | P1 |
| Playwright smoke tests | HIGH | MEDIUM | P1 |
| Keyword-led title tags | MEDIUM | LOW | P1/P2 |
| Repo/asset hygiene | MEDIUM | MEDIUM | P2 |
| EducationalOrganization typing | MEDIUM | LOW | P2 |
| Event (eventSchedule) for cafe | MEDIUM | MEDIUM | P2 |
| Service/Course JSON-LD on Angebote | MEDIUM | MEDIUM | P2 |
| CSP enforcement flip | HIGH | LOW (gated) | P2 (post-data) |
| Manual WCAG audit / statement | MEDIUM | HIGH | P3 |
| AVIF / `<picture>` | LOW | MEDIUM | P3 |

**Priority key:** P1 = must ship this milestone · P2 = ship if time / follow-up · P3 = deferred.

---

## Competitor Feature Analysis

| Feature | eatplanted.com (benchmark) | 2026 Standard / Google | EVOLEA Approach |
|---------|----------------------------|------------------------|-----------------|
| Security headers | HSTS/CSP/nosniff present; F on cookies/SRI | Observatory A needs CSP + HSTS + nosniff + X-Frame | Match + aim stricter CSP (fewer third parties) |
| CSP | Present but 16-script tag stack | Nonce/hash > `'unsafe-inline'` | Report-Only now, nonce-ready, tighter than benchmark |
| Structured data | JSON-LD everywhere (their clear win) | Organization, Article, BreadcrumbList, Event all render | Match Org/Article/Breadcrumb; add NGO/EducationalOrg + Event to differentiate |
| Sitemap discovery | Valid sitemap referenced | robots.txt + GSC submission | Add robots.txt + head link + redirect + submit |
| Accessibility | 7 axe violations (2 critical) | 0 axe + manual checks | 0 axe violations + manual checks (no public claim) |
| Performance | Heavy: 329 requests, 6.6MB | LCP<2.5s, CLS<0.1, WebP/AVIF | Already fast server; fix images → ≤1.5MB homepage |
| Custom 404 | (typical branded) | Branded, navigable | Branded DE/EN per brand guide |

---

## Sources

- [Google structured data / rich results 2026 — schema types that render](https://www.digitalapplied.com/blog/structured-data-seo-2026-rich-results-guide) (Article, BreadcrumbList, Event, Organization; FAQ removed 2026-05-07)
- [Google Event structured data docs](https://developers.google.com/search/docs/appearance/structured-data/event) and [schema.org eventSchedule](https://schema.org/eventSchedule) (recurring events use a Schedule object, no startDate on the Event; required fields name/startDate/physical location; eventStatus for cancellations)
- [MDN HTTP Observatory — Tests & Scoring](https://developer.mozilla.org/en-US/observatory/docs/tests_and_scoring) and [Mozilla http-observatory scoring.md](https://github.com/mozilla/http-observatory/blob/main/httpobs/docs/scoring.md) (no CSP −25, no HSTS −20, bonus only if base ≥90)
- [MDN CSP practical implementation guide](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSP) (Report-Only first; nonce/hash over unsafe-inline; start `default-src 'none'`)
- [Security Headers Adoption Study 2026](https://appsecsanta.com/research/security-headers-study-2026) (unsafe-inline prevalence; avg Observatory score 58)
- [European Accessibility Act 2026 compliance guide — Level Access](https://www.levelaccess.com/compliance-overview/european-accessibility-act-eaa/) (WCAG 2.1 AA via EN 301 549; enforcement from 2025-06-28; microenterprise exemption)
- [Swiss BehiG revision — Härting Rechtsanwälte](https://haerting.ch/en/insights/accessible-websites-and-apps-new-obligations-under-the-draft-of-the-new-swiss-disability-discrimination-act-behig/) (public bodies bound since 2025; private actors expected ~2027 — not yet binding on private NGOs)
- [Core Web Vitals 2026 — corewebvitals.io](https://www.corewebvitals.io/core-web-vitals) and [MDN: fix image LCP](https://developer.mozilla.org/en-US/blog/fix-image-lcp/) (LCP<2.5s, CLS<0.1, INP<200ms; fetchpriority on LCP, never lazy-load LCP, explicit width/height)
- [Image optimization 2026 playbook](https://logoswebdesigns.com/blog/image-optimization-website-speed-2026/) (AVIF→WebP→JPEG fallback; lazy-load below fold)
- [Playwright best practices — BrowserStack](https://www.browserstack.com/guide/playwright-best-practices) and [Playwright docs](https://playwright.dev/docs/best-practices) (semantic selectors, auto-waiting, <5min smoke suites)
- [UI smoke tests with Playwright — Lincoln Loop](https://lincolnloop.com/blog/ui-smoke-tests-with-playwright/) and [smoke-test deployments — Mike Streety](https://www.mikestreety.co.uk/blog/use-playwright-to-smoke-test-your-deployments/) (what a content-site smoke suite covers)

---
*Feature research for: production technical quality lift, bilingual Swiss NGO content site (Astro 5.x SSR / Cloudflare)*
*Researched: 2026-06-12*
