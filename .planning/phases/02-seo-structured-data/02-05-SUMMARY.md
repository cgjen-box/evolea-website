---
phase: 02-seo-structured-data
plan: 05
subsystem: seo
tags: [seo, json-ld, structured-data, blog, blogposting, event, schema-org]

# Dependency graph
requires:
  - phase: 02-seo-structured-data
    plan: 01
    provides: "Base.astro ogType prop (website|article); slash-normalized canonical; base + lang computed"
  - phase: 02-seo-structured-data
    plan: 02
    provides: "src/lib/seo.ts blogPostingSchema/breadcrumbSchema/cafeEventSchema/nextCafeDate + ORG_ID @id; JsonLd.astro escaped emission; site-wide NGO+WebSite @graph from Base"
provides:
  - "BlogPosting + BreadcrumbList JSON-LD and og:type=article on both DE and EN blog detail templates"
  - "One recurring Event JSON-LD on the EVOLEA Cafe page (DE + EN) with a computed future 2nd-Wednesday startDate and city-level venue"
affects: [phase-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-page JSON-LD emitted via JsonLd.astro adjacent to content; publisher/organizer reference the on-page Organization @id from the site-wide @graph"
    - "datePublished gated on the existing hasValidPubDate guard (same gate as the visible <time> element) — schema omits the key for invalid dates"
    - "Event startDate is computed via nextCafeDate(), never read from the stale CMS daten[] rows"

key-files:
  created: []
  modified:
    - src/pages/blog/[...slug].astro
    - src/pages/en/blog/[...slug].astro
    - src/components/CafePage.astro

key-decisions:
  - "Cafe Event description sourced from the existing hero.tagline getText expression with a bilingual fallback (no new copy invented)"
  - "Event location stays city-level (addressLocality Zürich, addressCountry CH) per locked decision D3 — street address deferred"
  - "No BreadcrumbList emitted from CafePage (no visible breadcrumb nav exists there, per D3)"

assumptions-carried-forward:
  - "A1: EVOLEA Cafe recurrence is '2nd Wednesday of each month, 20:00 Europe/Zurich' (encoded in nextCafeDate from 02-02) — confirm before the cafe schema is treated as authoritative live."

requirements-completed: [SEO-05, SEO-08]

# Metrics
duration: 3min
completed: 2026-06-12
---

# Phase 02 Plan 05: Blog & Event Structured Data Summary

**BlogPosting + matching BreadcrumbList JSON-LD and og:type=article on both DE and EN blog detail templates, plus one recurring Event JSON-LD with a computed future 2nd-Wednesday startDate and city-level venue on the EVOLEA Cafe page — closing SEO-05 and SEO-08.**

## Performance

- **Duration:** ~3 min
- **Tasks:** 3
- **Files modified:** 3 (0 created, 3 modified)

## Accomplishments
- DE blog template (`src/pages/blog/[...slug].astro`) now emits a `BlogPosting` (headline, description, author as Organization, `publisher` → `{ "@id": ORG_ID }`, `mainEntityOfPage` = trailing-slash canonical, `datePublished` only when `hasValidPubDate`) plus a `BreadcrumbList` mirroring the visible nav (Startseite → Blog → title), and switches the page to `og:type=article` via the Base `ogType` prop. `image` is emitted only when the post supplies one, base-prefixed for dual builds.
- EN blog template (`src/pages/en/blog/[...slug].astro`) received the identical treatment with `lang='en'` and EN nav labels (Home → Blog → title); confirmed `"inLanguage":"en"` in dist. The two frontmatter additions differ only by label/collection/lang.
- CafePage (`src/components/CafePage.astro`) emits exactly ONE `Event` JSON-LD via `cafeEventSchema`: computed future startDate (`2026-07-08T20:00:00+02:00` at build time — a 2nd Wednesday), `eventSchedule` (byDay Wednesday, P1M, 20:00, Europe/Zurich), `organizer` → `{ "@id": ORG_ID }`, and a city-level `PostalAddress` (Zürich / CH) with no street address. No BreadcrumbList (no visible breadcrumb there). The stale CMS `daten[]` rows are deliberately not read for the schema.

## Task Commits

1. **Task 1: BlogPosting + BreadcrumbList + ogType article on the DE blog template** — `cacc2d6` (feat)
2. **Task 2: same treatment for the EN blog template** — `eab0d51` (feat)
3. **Task 3: recurring Event JSON-LD on the EVOLEA Cafe page** — `9a6bb7e` (feat)

## Files Created/Modified
- `src/pages/blog/[...slug].astro` — MODIFIED. Added `JsonLd` + `blogPostingSchema`/`breadcrumbSchema` imports, trailing-slash canonical, BlogPosting + BreadcrumbList schemas, `ogType="article"` on Base, two `<JsonLd>` emissions adjacent to the nav.
- `src/pages/en/blog/[...slug].astro` — MODIFIED. Same pattern with `lang='en'`, EN nav labels, and a new `base` constant for the image URL.
- `src/components/CafePage.astro` — MODIFIED. Added `JsonLd` + `cafeEventSchema` imports, computed bilingual `eventDescription` from `hero.tagline`, one `<JsonLd>` Event emission near the top of the template.

## Decisions Made
- All locked plan/research decisions implemented as written (D3 city-level Event address, no CafePage breadcrumb, computed startDate not CMS dates, A1 recurrence rule inherited from 02-02).
- Event description reuses the existing `hero.tagline` `getText` expression with a bilingual fallback rather than introducing new copy.

## Deviations from Plan

None — plan executed as written. (See the verification note below for one verify-command scoping clarification that is not an implementation deviation.)

## Verification Notes
- `npm run build` exits 0 AND `GITHUB_PAGES=true npm run build` exits 0 (both confirmed).
- **Build-mode note (same as 02-01/02-02):** this machine's `npm run build` is adapter-absent and falls back to STATIC with base `/evolea-website`, so absolute URLs in dist carry the GitHub Pages host/base (e.g. `mainEntityOfPage` ends with `.../evolea-website/blog/<slug>/`). The production Cloudflare build pins these to `www.evolea.ch`. All schema-shape assertions hold regardless of host.
- DE blog (`dist/blog/<slug>/index.html`): one `BlogPosting` (author = `{"@type":"Organization"}`, `publisher` = `{"@id":"https://www.evolea.ch/#organization"}`, `mainEntityOfPage` ends with `/`, `datePublished` present for a valid pubDate), one `BreadcrumbList` (Startseite → Blog → title), `og:type` content="article", no `Invalid Date` strings.
- EN blog (`dist/en/blog/<slug>/index.html`): one `BlogPosting` with `"inLanguage":"en"`, one `BreadcrumbList` with EN labels, `og:type` article, no `Invalid Date`.
- Default pages untouched: `dist/angebote/index.html` still carries `og:type` content="website".
- Cafe (`dist/angebote/evolea-cafe/index.html` AND `dist/en/programs/evolea-cafe/index.html`, plus the `/en/angebote/` redirect mirror): each contains exactly ONE `"@type":"Event"`. startDate `2026-07-08T20:00:00+02:00` matches `/^\d{4}-\d{2}-\d{2}T20:00:00\+0[12]:00$/`, is future, day-of-month 8 (a 2nd Wednesday). `location.address` has `addressLocality` Zürich + `addressCountry` CH and NO `streetAddress`/`postalCode`. `organizer` = `{"@id":"https://www.evolea.ch/#organization"}`; `eventSchedule` present (byDay Wednesday, P1M, Europe/Zurich). No `BreadcrumbList` on the cafe pages.
- **Plan verify-command clarification (not a deviation):** Task 3's automated check uses `! grep -q '"streetAddress"'` against the WHOLE cafe HTML file. That literal grep matches once — but the match comes from the site-wide Organization NGO node in the `@graph` (which legitimately carries the EVOLEA office street address, emitted by Base since 02-02), NOT from the Event's `location.address`. The acceptance criterion that matters ("the Event's `location.address` has no `streetAddress`") is satisfied; I verified the Event node's address block directly. A page-wide `streetAddress` grep can never be 0 on any page now that the org @graph ships site-wide.

## Deferred / Content TODOs (for the user)
- **Deferred (D3): Cafe Event street address.** The Event venue uses a city-level `PostalAddress` only. Upgrading to a full street-level `PostalAddress` is deferred pending user confirmation of the venue address ("exact location on request" today).
- **Content TODO (NOT in scope here): stale visible cafe dates.** The visible cafe dates in `src/content/pages/evolea-cafe.json` `daten[]` are stale (Jan–Mar 2025) and the DE/EN rows disagree. The Event JSON-LD already sidesteps these via the computed `nextCafeDate()`, but the on-page visible list needs a CMS content update by the user.

## Cloudflare-only deferred verification
Observable only on a real Cloudflare preview deploy (not the local static build), deferred to phase verification:
- Google Rich Results test passes for a blog post (BlogPosting) and the cafe page (Event).
- Watch Search Console for any "event is in the past" warning (RESEARCH Pitfall 6 warning sign) — the static fallback build freezes the Event startDate at build time, which is acceptable for the noindexed GitHub Pages mirror but means that mirror's Event date ages until the next deploy.

## Self-Check: PASSED

- Modified files verified present: `src/pages/blog/[...slug].astro`, `src/pages/en/blog/[...slug].astro`, `src/components/CafePage.astro`.
- Task commits verified in git log: `cacc2d6`, `eab0d51`, `9a6bb7e`.

---
*Phase: 02-seo-structured-data*
*Completed: 2026-06-12*
