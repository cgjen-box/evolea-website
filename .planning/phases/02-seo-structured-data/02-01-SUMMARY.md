---
phase: 02-seo-structured-data
plan: 01
subsystem: seo
tags: [seo, canonical, robots, sitemap, middleware, redirects, astro, cloudflare]

# Dependency graph
requires:
  - phase: 01-foundation-security
    provides: "sequence() middleware (securityHeaders + keystaticEnhancements), src/lib/security-headers.ts single-source pattern, __SSR_BUILD__ Vite define, gen-headers.mjs parity gate, csp-report.ts prerender pattern"
provides:
  - "src/lib/seo.ts module with PROD_HOST constant (consumed by middleware + robots endpoint; extended by 02-02 with JSON-LD builders)"
  - "Trailing-slash 301 middleware (first in sequence) with /api, /keystatic, /_ and file-extension exemptions + leading-slash collapse open-redirect guard"
  - "Host-keyed X-Robots-Tag: noindex on non-production SSR responses"
  - "Hostname-keyed robots.txt SSR endpoint (default-deny; only PROD_HOST crawlable)"
  - "/sitemap.xml -> /sitemap-index.xml 301 redirect (base-path aware)"
  - "/brand/ sitemap filter"
  - "Base.astro head: slash-normalized canonical, og:url/twitter:url mirror canonical, ogType prop, rel=sitemap link, '– EVOLEA' title separator, static-build noindex meta"
affects: [02-02-jsonld, 02-03-titles, 02-05-blog-schema]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Short-circuiting middleware member (returns redirect instead of next()) placed first in sequence()"
    - "PROD_HOST single-source hostname keying shared by middleware + robots endpoint"
    - "Slash-normalized canonical mirrored by og:url/twitter:url"
    - "Static-build noindex meta gated on !__SSR_BUILD__"

key-files:
  created:
    - src/lib/seo.ts
    - src/pages/robots.txt.ts
  modified:
    - src/middleware.ts
    - astro.config.mjs
    - src/layouts/Base.astro

key-decisions:
  - "Trailing-slash enforced via first-in-sequence middleware 301 (not trailingSlash:'always') to preserve /api and /keystatic exemptions (D1)"
  - "robots.txt is a default-deny SSR endpoint keyed on exact PROD_HOST match (fail-safe for spoofed/preview hosts) (D2)"
  - "public/_headers deliberately NOT touched — avoids gen-headers parity churn; preview de-indexing via middleware X-Robots-Tag + deny robots.txt instead"
  - "/sitemap.xml redirect emits a real 301 on Cloudflare and a meta-refresh stub on static builds (D2)"
  - "/brand/ internal style-guide pages filtered out of sitemap (D5)"

patterns-established:
  - "Short-circuit trailingSlash middleware member ordered first in sequence()"
  - "PROD_HOST as the single hostname-keying source for SEO/discovery decisions"

requirements-completed: [SEO-01, SEO-02, SEO-03]

# Metrics
duration: 5min
completed: 2026-06-12
---

# Phase 02 Plan 01: SEO Discovery & Canonical Foundation Summary

**Trailing-slash 301 middleware, hostname-keyed default-deny robots.txt, /sitemap.xml redirect, and Base.astro head unification (slash-normalized canonical mirrored by og:url/twitter:url, rel=sitemap, '– EVOLEA' titles, static noindex) — closing SEO-01/02/03.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-12T19:17:16Z
- **Completed:** 2026-06-12T19:21:55Z
- **Tasks:** 3
- **Files modified:** 5 (2 created, 3 modified)

## Accomplishments
- New `trailingSlash` middleware (first in `sequence()`) 301-redirects slashless GET/HEAD to the canonical slash form, preserving the query string, with `/api/*`, `/keystatic`, `/_`-prefix and file-extension exemptions and a leading-slash collapse that neutralizes the `//evil.com` protocol-relative open-redirect vector.
- `X-Robots-Tag: noindex` now set on every non-production SSR response (*.pages.dev preview hosts).
- New hostname-keyed `robots.txt.ts` SSR endpoint: only the exact production host serves `Allow: /` + `Sitemap:`; every other host (and the static build) serves the `Disallow: /` deny variant.
- `/sitemap.xml` 301-redirects to `/sitemap-index.xml` (base-path aware); `/brand/` pages no longer leak into the generated sitemap.
- `Base.astro` head: canonical is slash-normalized, og:url and twitter:url mirror it (no more raw `Astro.url` duplicate forms), a new `ogType` prop drives `og:type`, a `<link rel="sitemap">` advertises the index, all four title emission points use the `– EVOLEA` en-dash separator, and static (`!__SSR_BUILD__`) builds emit `<meta name="robots" content="noindex, nofollow">`.

## Task Commits

Each task was committed atomically:

1. **Task 1: trailingSlash middleware + host-keyed X-Robots-Tag** - `ad51cff` (feat)
2. **Task 2: hostname-keyed robots.txt + /sitemap.xml 301 + /brand sitemap filter** - `756ac4d` (feat)
3. **Task 3: Base.astro head SEO fixes** - `ae1218a` (feat)

## Files Created/Modified
- `src/lib/seo.ts` - NEW. Single-source `PROD_HOST` constant; banner-doc lists current (middleware, robots endpoint) and future (02-02 JSON-LD builders) consumers.
- `src/middleware.ts` - Added `trailingSlash` member first in `sequence()`; imported `PROD_HOST`; set `X-Robots-Tag: noindex` on non-production hosts.
- `src/pages/robots.txt.ts` - NEW. Default-deny hostname-keyed endpoint using the `__SSR_BUILD__` prerender pattern.
- `astro.config.mjs` - Added `/sitemap.xml` 301 redirect (base-aware) and `sitemap({ filter })` excluding `/brand/`.
- `src/layouts/Base.astro` - Slash-normalized canonical, og:url/twitter:url from canonical, `ogType` prop, `rel=sitemap` link, `– EVOLEA` separator (4 points), static-build noindex meta.

## Decisions Made
- None beyond the locked plan decisions (D1, D2, D5). All implemented as written, including the deliberate choice to leave `public/_headers` untouched.

## Deviations from Plan

None - plan executed exactly as written. All three tasks implemented per the verbatim RESEARCH patterns; no bugs, missing functionality, or blocking issues encountered.

## Issues Encountered
- **Acceptance-criteria path mismatch (not a code issue):** Several Task 2/Task 3 acceptance checks reference `dist/sitemap.xml` as a file and `dist/index.html` as the homepage. The local build is adapter-absent (static, base `/evolea-website`), where (a) Astro emits the `/sitemap.xml` redirect as a directory meta-refresh stub at `dist/sitemap.xml/index.html` (standard Astro static-redirect output), and (b) the bare-base `dist/index.html` is itself a base-redirect stub while the real homepage content lives under the base path. Verification was therefore confirmed against a real page (`dist/angebote/index.html`): canonical, og:url, twitter:url all end in `/angebote/` and are identical; `rel="sitemap"` href ends in `/sitemap-index.xml`; `<meta name="robots" content="noindex, nofollow">` present; `og:type` emits `website`. Source checks: `– EVOLEA` ×4, `| EVOLEA` ×0, `ogType` ×3. `/brand/` count in `dist/sitemap-0.xml` is 0. Both build modes (`npm run build` and `GITHUB_PAGES=true npm run build`) exit 0; `node scripts/gen-headers.mjs` exits 0.

## User Setup Required
None - no external service configuration required.

## Cloudflare-only deferred verification
Per Phase 1 precedent, the runtime behaviors below are only observable on a Cloudflare preview deploy (never `astro dev` or the static build) and are deferred to phase verification:
- `curl -sI <preview>/angebote` → 301 with `location: /angebote/`
- `curl -sI '<preview>//evil.com'` → Location starts with a single `/`, same origin
- `<preview>/robots.txt` → `Disallow: /` and `X-Robots-Tag: noindex` on HTML responses
- production `robots.txt` → `Allow: /` + `Sitemap:` variant
- `/sitemap.xml` → real 301 to `/sitemap-index.xml`
- no redirect loop on any program page; Keystatic login and `POST /api/csp-report` still work

## Next Phase Readiness
- `src/lib/seo.ts` exists with `PROD_HOST`; plan 02-02 extends it with the JSON-LD `@graph` constants and schema builders.
- `Base.astro` now has the `ogType` prop ready for blog templates (`ogType="article"`, plan 02-05).
- Title separator is `– EVOLEA`; plan 02-03 (keyword titles) must audit page `title` props for embedded separators (Pitfall 9, e.g. the cafe fallback title containing `|`).
- No blockers introduced.

## Self-Check: PASSED

- Created files verified present: `src/lib/seo.ts`, `src/pages/robots.txt.ts`.
- Modified files verified present: `src/middleware.ts`, `astro.config.mjs`, `src/layouts/Base.astro`.
- Task commits verified in git log: `ad51cff`, `756ac4d`, `ae1218a`.

---
*Phase: 02-seo-structured-data*
*Completed: 2026-06-12*
