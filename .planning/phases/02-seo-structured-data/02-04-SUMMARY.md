---
phase: 02-seo-structured-data
plan: 04
subsystem: seo
tags: [seo, json-ld, breadcrumbs, service, structured-data, astro]

requires:
  - phase: 02-seo-structured-data (plan 02-02)
    provides: "breadcrumbSchema/serviceSchema builders + JsonLd.astro in src/lib/seo.ts; ORG_ID @graph anchor emitted site-wide from Base.astro"
provides:
  - "BreadcrumbList JSON-LD on every InnerPageHero consumer page (11 pages, DE+EN) via one component edit"
  - "BreadcrumbList + Service JSON-LD on all 7 Angebote program components (DE pages + EN twins)"
  - "Service nodes linked to the site-wide Organization @id (provider linkage)"
affects: [02-05 (Event JSON-LD on CafePage), phase verification (Google Rich Results / validator.schema.org)]

tech-stack:
  added: []
  patterns:
    - "Visible-match BreadcrumbList: schema items built from the SAME expressions the inline nav renders (SEO-06)"
    - "One JsonLd emitted once outside a duplicated-nav layout conditional (InnerPageHero)"
    - "Service.provider references on-page Organization @id rather than re-declaring identity"

key-files:
  created:
    - .planning/phases/02-seo-structured-data/02-04-SUMMARY.md
  modified:
    - src/components/InnerPageHero.astro
    - src/components/programs/MiniGartenPage.astro
    - src/components/programs/MiniProjektePage.astro
    - src/components/programs/MiniTurnenPage.astro
    - src/components/programs/TagesschulePage.astro
    - src/components/programs/MiniAbenteuercampPage.astro
    - src/components/programs/MiniMuseumPage.astro
    - src/components/programs/MiniRestaurantPage.astro

key-decisions:
  - "InnerPageHero emits ONE BreadcrumbList guarded by breadcrumbs.length > 0, placed above the image-vs-no-image layout conditional so the duplicated visible nav yields a single schema block"
  - "BreadcrumbList items reuse each component's own nav expressions verbatim (including hardcoded literals in MiniRestaurant) to satisfy SEO-06 visible-match"
  - "Tagesschule Service omits minAge/maxAge (vision-stage program, no published ages) so serviceSchema emits no audience block"
  - "MiniRestaurant (no content prop) uses bilingual ternary literals for Service name/description consistent with visible page copy"

patterns-established:
  - "Sub-program breadcrumbs include the intermediate Mini Projekte level (4 ListItems) mirroring the deeper visible nav"
  - "Canonical Service url = slash-normalized Astro.url.pathname resolved against Astro.site (same two-line pattern Base.astro uses)"

requirements-completed: [SEO-06, SEO-07]

duration: 7min
completed: 2026-06-12
---

# Phase 2 Plan 4: Breadcrumb & Service JSON-LD Summary

**BreadcrumbList JSON-LD wired into InnerPageHero (covering 11 consumer pages at once) plus BreadcrumbList + Organization-linked Service JSON-LD on all 7 Angebote program components, DE and EN, with strict visible-breadcrumb parity.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-06-12T21:33:00Z
- **Completed:** 2026-06-12T21:40:00Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- InnerPageHero now emits exactly one BreadcrumbList per page (spenden, ueber-uns, kontakt, blog index, team, angebote index + EN twins) from its existing `breadcrumbs` prop — one edit covers all consumers.
- All 7 program body components (MiniGarten, MiniProjekte, MiniTurnen, Tagesschule, MiniAbenteuercamp, MiniMuseum, MiniRestaurant) emit one BreadcrumbList (mirroring their inline nav) plus one Service node.
- Every Service node references the site-wide Organization `@id` (`https://www.evolea.ch/#organization`), areaServed Zürich, with `inLanguage` per page and per-program audience ages (Tagesschule omits audience).
- Both builds green; base path appears exactly once in all breadcrumb `item` URLs (no double-prefix); CafePage left untouched (D3).

## Task Commits

Each task was committed atomically:

1. **Task 1: BreadcrumbList emission in InnerPageHero** - `236adbe` (feat)
2. **Task 2: Breadcrumb + Service JSON-LD in core program components** - `8239c75` (feat)
3. **Task 3: Breadcrumb + Service JSON-LD in sub-program components** - `1ff4790` (feat)

## Files Created/Modified
- `src/components/InnerPageHero.astro` - Imports JsonLd + breadcrumbSchema; emits one BreadcrumbList from the `breadcrumbs` prop, guarded by length, above the layout conditional.
- `src/components/programs/MiniGartenPage.astro` - BreadcrumbList (3 levels) + Service (ages 3/6).
- `src/components/programs/MiniProjektePage.astro` - BreadcrumbList (3 levels) + Service (ages 5/8).
- `src/components/programs/MiniTurnenPage.astro` - BreadcrumbList (3 levels) + Service (ages 5/8).
- `src/components/programs/TagesschulePage.astro` - BreadcrumbList (3 levels) + Service (no audience).
- `src/components/programs/MiniAbenteuercampPage.astro` - BreadcrumbList (4 levels incl. Mini Projekte) + Service (ages 5/10).
- `src/components/programs/MiniMuseumPage.astro` - BreadcrumbList (4 levels incl. Mini Projekte) + Service (ages 5/8).
- `src/components/programs/MiniRestaurantPage.astro` - BreadcrumbList (4 levels, literal labels) + Service (ages 5/8); name/description as bilingual ternaries (no content prop).

## Decisions Made
- See key-decisions in frontmatter. Core call: build schema items from the same expressions the visible nav renders, never from parallel constants, so SEO-06 visible-match is structurally guaranteed.
- For MiniRestaurant the visible nav hardcodes `'Mini Projekte'` and `'Mini Restaurant'` (no ternary) in both languages; the schema labels match those literals verbatim.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. The `en/ueber-uns` fallback page shows 0 BreadcrumbList because it is an Astro i18n fallback whose canonical points at the DE `/ueber-uns/`; the canonical EN about page (`en/about`) correctly emits 1. No page emits 2+ BreadcrumbList despite InnerPageHero's duplicated nav markup.

## Verification Results
- `npm run build` (local static config) → exit 0.
- `GITHUB_PAGES=true npm run build` → exit 0.
- BreadcrumbList count: 26 pages emit exactly one; zero pages emit 2+.
- Service count: exactly 14 pages (7 programs × DE+EN).
- All Service nodes carry `"provider":{"@id":"https://www.evolea.ch/#organization"}`.
- Tagesschule Service has no `audience` key; Mini Garten has `suggestedMinAge:3/suggestedMaxAge:6`.
- EN twins carry `"inLanguage":"en"` and EN breadcrumb labels (Home/Programs).
- MiniRestaurant BreadcrumbList has 4 ListItems matching its 4-level visible nav.
- `dist/angebote/evolea-cafe/index.html` contains zero BreadcrumbList (D3).
- Base path `/evolea-website` appears exactly once in each breadcrumb `item` URL.

**Deferred to phase verification:** Google Rich Results test on a deployed Angebote page should detect BreadcrumbList. The Service node has NO Google rich result (RESEARCH Pitfall 8) and must instead be validated via validator.schema.org. This split is expected and not a defect.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SEO-06 and SEO-07 complete. Ready for 02-05 (Event JSON-LD on CafePage + BlogPosting on blog templates), which owns CafePage and the blog templates this plan deliberately left untouched.

## Self-Check: PASSED

- All 8 modified source files + SUMMARY.md present on disk and committed.
- Commits 236adbe, 8239c75, 1ff4790, a841970 all present in git log.
- STATE.md and ROADMAP.md untouched (parallel-mode: orchestrator owns those writes).
- Blog templates and CafePage.astro untouched (owned by parallel agent this wave).

---
*Phase: 02-seo-structured-data*
*Completed: 2026-06-12*
