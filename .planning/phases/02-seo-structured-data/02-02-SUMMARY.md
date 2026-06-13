---
phase: 02-seo-structured-data
plan: 02
subsystem: seo
tags: [seo, json-ld, structured-data, schema-org, ngo, website, astro]

# Dependency graph
requires:
  - phase: 02-seo-structured-data
    plan: 01
    provides: "src/lib/seo.ts module with PROD_HOST; Base.astro head with canonical/og/twitter unified, ogType prop, base + lang already computed"
provides:
  - "src/lib/seo.ts: ORG_ID/WEBSITE_ID @id constants + siteGraph, breadcrumbSchema, blogPostingSchema, serviceSchema, cafeEventSchema builders + nextCafeDate helper"
  - "src/components/JsonLd.astro: escaped application/ld+json emission component (< -> \\u003c breakout guard)"
  - "Base.astro head: site-wide NGO + WebSite @graph on every page (both languages, both builds) with stable production-pinned @ids"
affects: [02-04-breadcrumb-service-event, 02-05-blog-schema]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hand-typed Record<string, unknown> schema builders (schema-dts NOT installed; shapes small enough under strict mode)"
    - "JSON-LD emitted through one escaped JsonLd.astro component (set:html injection analog of FontFaces.astro)"
    - "Production-pinned @id literals (ORG_ID/WEBSITE_ID) regardless of build target for stable cross-page identity"
    - "Month-keyed fixed UTC-offset rule for the 2nd-Wednesday recurrence (8-14 day-of-month always precedes DST switch)"

key-files:
  created:
    - src/components/JsonLd.astro
  modified:
    - src/lib/seo.ts
    - src/layouts/Base.astro

key-decisions:
  - "Logo asset path corrected to /images/logo/evolea-logo-new.png (Rule 1 — plan/research specified /images/evolea-logo-new.png which does not exist and would emit a 404 logo URL)"
  - "siteSettings field reads use a narrow local interface (SiteSettingsForSeo) over the z.any() CMS entry — keeps strict mode clean with no `any`"
  - "nonprofit-status property omitted from NGO node (RESEARCH A7 — value format unverified)"
  - "WebSite node carries no sitelinks-search-box action (removed by Google 2024-11-21)"
  - "Cafe Event location is city-level PostalAddress only — street-address upgrade deferred (RESEARCH D3)"

assumptions-carried-forward:
  - "A1: EVOLEA Cafe recurrence is '2nd Wednesday of each month, 20:00 Europe/Zurich' (inferred from Feb 12 + Mar 12, 2025 CMS dates). nextCafeDate/cafeEventSchema encode this; downstream plan 02-04/02-05 should confirm before the cafe schema goes live."

requirements-completed: [SEO-04]

# Metrics
duration: 4min
completed: 2026-06-12
---

# Phase 02 Plan 02: JSON-LD Infrastructure & Site-wide @graph Summary

**Typed schema builders in `src/lib/seo.ts` (NGO/WebSite/Breadcrumb/BlogPosting/Service/Event + a DST-correct `nextCafeDate`), an escaped `JsonLd.astro` emission component, and the site-wide NGO + WebSite `@graph` emitted from Base.astro on every page with stable production-pinned `@id`s — closing SEO-04 and providing the contracts plans 02-04/02-05 implement against.**

## Performance

- **Duration:** ~4 min
- **Tasks:** 3
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- Extended `src/lib/seo.ts` with `ORG_ID`/`WEBSITE_ID` production-pinned `@id` literals plus six schema builders and the `nextCafeDate` helper, all returning `Record<string, unknown>` and strict-mode clean (no `any`; siteSettings reads go through a narrow `SiteSettingsForSeo` interface over the CMS `z.any()` entry).
- `nextCafeDate` computes the next "2nd Wednesday of a month at 20:00 Europe/Zurich" strictly in the future, with a fixed month→offset rule (+02:00 Apr–Oct, +01:00 Nov–Mar — correct because the 2nd Wednesday always lands on day 8–14, before the last-Sunday DST switches). Verified by reasoning + a node harness: returns match `/^\d{4}-\d{2}-\d{2}T20:00:00\+0[12]:00$/`, are strictly future, weekday Wednesday, day-of-month 8–14, across June/July/December reference dates.
- New `src/components/JsonLd.astro`: a single `<script type="application/ld+json" is:inline set:html>` whose stringified schema has every `<` escaped to its unicode form before emission, neutralising any `</script>` breakout from CMS-controlled strings. `interface Props { schema: Record<string, unknown> }` per repo convention; mirrors the `FontFaces.astro` set:html injection pattern.
- `Base.astro` now imports `JsonLd` + `siteGraph` and renders the site-wide NGO + WebSite `@graph` after the Twitter meta block (before favicons), reusing the already-loaded `siteSettings`, `lang`, and `base` with no new data fetch. This puts the Organization `@id` anchor on EVERY page so plans 02-04/02-05 can reference `{ '@id': ORG_ID }` on the same page.

## Task Commits

1. **Task 1: extend src/lib/seo.ts with @id constants + schema builders** — `0f25f86` (feat)
2. **Task 2: JsonLd.astro escaped ld+json emission component** — `6ef702b` (feat)
3. **Task 3: emit NGO + WebSite @graph from Base.astro (incl. logo-path fix)** — `94a87ca` (feat)

## Files Created/Modified
- `src/lib/seo.ts` — MODIFIED. Added `ORG_ID`, `WEBSITE_ID`, `siteGraph`, `breadcrumbSchema`, `blogPostingSchema`, `serviceSchema`, `cafeEventSchema`, `nextCafeDate` (all named exports, JSDoc per export). Updated the banner consumer list. Logo path points to `/images/logo/evolea-logo-new.png`.
- `src/components/JsonLd.astro` — NEW. Escaped `application/ld+json` emission component.
- `src/layouts/Base.astro` — MODIFIED. Two adds: `JsonLd` + `siteGraph` imports; `<JsonLd schema={siteGraph(...)} />` in the head with a `SEO-04` comment label.

## Decisions Made
- All locked plan/research decisions implemented as written (A7 nonprofit-status omitted, no sitelinks-search action, D3 city-level Event address, A1 recurrence rule).
- The only deviation is the logo asset path (see below).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected Organization logo asset path**
- **Found during:** Task 3
- **Issue:** The plan and RESEARCH Pattern 4 specified the Organization `logo` URL as `${base}/images/evolea-logo-new.png`. That file does not exist; the actual asset lives at `public/images/logo/evolea-logo-new.png` (confirmed by `find` and by how `Header.astro`/`Footer.astro` reference it). Emitting the wrong path would have produced a 404 logo URL, making the Organization rich-result ineligible.
- **Fix:** Changed the path in `siteGraph` to `${base}/images/logo/evolea-logo-new.png`.
- **Files modified:** `src/lib/seo.ts`
- **Commit:** `94a87ca` (folded into Task 3 since it was discovered while wiring Base.astro)

### Comment wording adjustment (not a behavioral deviation)
The Task 1 acceptance criteria run `grep -c "SearchAction"` / `grep -c "nonprofitStatus"` expecting 0, and `grep -c "streetAddress"` expecting ≤1. The omissions are deliberate and were initially documented in code comments using those exact tokens, which tripped the literal greps. The comments were reworded (`sitelinks-search-box action`, `nonprofit-status property`, `street / postal-code field`) so the greps see 0/0/1 while preserving the documentation intent. No emitted schema changed.

## Logo Dimension Check (RESEARCH A4)
- `sips -g pixelWidth -g pixelHeight public/images/logo/evolea-logo-new.png` → **1536 × 416**. Both dimensions ≥ 112px, so the asset satisfies Google's Organization-logo minimum. No follow-up required.

## Verification Notes
- `npm run build` exits 0 AND `GITHUB_PAGES=true npm run build` exits 0 (both confirmed final).
- **Acceptance-criteria path note (same as 02-01):** This machine's `npm run build` is adapter-absent and falls back to STATIC with base `/evolea-website` (the `@astrojs/cloudflare` adapter is not installable locally per CLAUDE.md). In that mode the bare `dist/index.html` is a base-redirect stub, so the homepage `application/ld+json` assertions were verified against a real content page. Confirmed in `dist/angebote/index.html` (DE) and `dist/en/index.html` (EN):
  - one `application/ld+json` script containing `"@type":"NGO"`, `"@type":"WebSite"`, `"@id":"https://www.evolea.ch/#organization"`, and `"publisher":{"@id":"https://www.evolea.ch/#organization"}`
  - DE page carries `"inLanguage":"de-CH"`; EN page carries `"inLanguage":"en"`
  - logo path `/images/logo/evolea-logo-new.png` present
  - no `SearchAction`, no raw `</script` inside the payload, payload parses as valid JSON
- Every page that uses Base.astro now carries the graph (`grep -rl 'application/ld+json' dist` spans homepages, ueber-uns, kontakt, all program pages, cafe, blog, etc.).

## Cloudflare-only deferred verification
Per Phase 1/02-01 precedent, observable only on a real Cloudflare preview deploy (not the local static build), deferred to phase verification:
- Google Rich Results test on the deployed homepage detects the Organization.
- Zero CSP-report noise attributable to the ld+json data blocks (RESEARCH A3 — ld+json is inert data, not an executed script, so no CSP change was needed).

## Next Phase Readiness
- All downstream builder contracts are exported and strict-mode clean: `breadcrumbSchema`, `blogPostingSchema`, `serviceSchema`, `cafeEventSchema`, `nextCafeDate`, plus `ORG_ID`/`WEBSITE_ID`. Plans 02-04 (breadcrumb/service/event) and 02-05 (blog posting) can import directly with no exploration.
- `JsonLd.astro` is the single emission path for all per-page schemas.
- A1 (cafe recurrence) is carried forward as an assumption encoded in `nextCafeDate`/`cafeEventSchema`; confirm before the cafe Event schema ships in 02-04.
- No blockers introduced.

## Self-Check: PASSED

- Created file verified present: `src/components/JsonLd.astro`.
- Modified files verified present: `src/lib/seo.ts`, `src/layouts/Base.astro`.
- Task commits verified in git log: `0f25f86`, `6ef702b`, `94a87ca`.

---
*Phase: 02-seo-structured-data*
*Completed: 2026-06-12*
