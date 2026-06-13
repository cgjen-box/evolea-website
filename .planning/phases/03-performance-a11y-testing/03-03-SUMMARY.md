---
phase: 03-performance-a11y-testing
plan: 03
subsystem: performance
tags: [cls, lcp, fetchpriority, lazy-loading, aria-label, accessibility, astro, webp]

# Dependency graph
requires:
  - phase: 03-01
    provides: display-size .webp images at known pixel dims (team 800×996, program heroes 1200×670, blog 1200×800, logo 640×173, poster 1920×944)
provides:
  - Every <img> in src/ carries explicit width+height (CLS fix, PERF-02) — 33 img tags across 22 files, 0 undimensioned
  - Per-template lazy/eager/fetchpriority policy (PERF-03): below-fold lazy, LCP heroes fetchpriority=high never lazy
  - Base.astro optional preloadImage prop emitting <link rel=preload as=image fetchpriority=high>; homepage video poster preloaded DE+EN
  - DE/EN-aware aria-labels on 2 Header navs + 7 program breadcrumb navs (A11Y-01)
affects: [03-04-performance-budget, 03-a11y-axe-run, lcp-measurement]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Caller-prefixed preloadImage prop (Base does NOT re-prefix, unlike the og image prop)"
    - "LCP policy: fetchpriority=high + explicit dims, never loading=lazy on the hero candidate"
    - "Attribute dims seed aspect-ratio only; CSS object-cover containers win for display"

key-files:
  created:
    - .planning/phases/03-performance-a11y-testing/03-03-SUMMARY.md
  modified:
    - src/layouts/Base.astro
    - src/pages/index.astro
    - src/pages/en/index.astro
    - src/components/Header.astro
    - src/components/LogoWithSparkles.astro
    - src/components/Footer.astro
    - src/components/InnerPageHero.astro
    - src/components/CafePage.astro
    - src/components/programs/MiniGartenPage.astro
    - src/components/programs/MiniProjektePage.astro
    - src/components/programs/MiniTurnenPage.astro
    - src/components/programs/TagesschulePage.astro
    - src/components/programs/MiniAbenteuercampPage.astro
    - src/components/programs/MiniMuseumPage.astro
    - src/components/programs/MiniRestaurantPage.astro
    - src/components/brand/BrandPageBody.astro
    - src/pages/blog/index.astro
    - src/pages/en/blog/index.astro
    - src/pages/team/index.astro
    - src/pages/en/team/index.astro
    - src/pages/ueber-uns/index.astro
    - src/pages/en/about/index.astro
    - src/pages/spenden.astro
    - src/pages/en/donate.astro

key-decisions:
  - "preloadImage prop is NOT base-prefixed inside Base — caller passes the resolved base-prefixed poster expression (locked decision 6)"
  - "MiniRestaurant hero is a <video>; its decorative poster-fallback <img> received fetchpriority=high + dims so the 7/7 hero gate passes without forcing a fake img hero"
  - "BrandPageBody dynamic-src imgs (thumb/wallpaper/team) seeded with container-aspect dims (4:3, 1:1, 4:5) since CSS object-cover overrides display"

patterns-established:
  - "Every new <img> must ship width+height; LCP heroes add fetchpriority=high and omit loading; below-fold adds loading=lazy"
  - "Bilingual aria-label via lang === 'de' ternary on every nav landmark"

requirements-completed: [PERF-02, PERF-03, A11Y-01]

# Metrics
duration: ~12min
completed: 2026-06-13
---

# Phase 3 Plan 03: Image Dimensions, LCP Priority & Nav Landmark Labels Summary

**Gave all 33 `<img>` tags across 22 src files explicit width/height (CLS fix), applied a per-template fetchpriority/lazy LCP policy, preloaded the homepage video poster via a new Base `preloadImage` prop, and labeled the 2 Header navs plus 7 program breadcrumb navs with DE/EN-aware aria-labels — both build modes green.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-13T07:29Z
- **Completed:** 2026-06-13T07:41Z
- **Tasks:** 3
- **Files modified:** 24 (+ SUMMARY created)

## Accomplishments
- Base.astro `preloadImage` prop emits `<link rel="preload" as="image" fetchpriority="high">`; homepage poster preloaded on DE and EN (LCP acceleration)
- Header desktop + mobile navs and all 7 program breadcrumb navs carry distinguishing bilingual aria-labels (Hauptnavigation/Main navigation, Mobile Navigation/Mobile navigation, Brotkrumen/Breadcrumb) — clears the axe landmark violation
- All 6 program img heroes + InnerPageHero + CafePage hero: fetchpriority="high" + width/height, never lazy (LCP elements)
- Site-wide below-fold sweep: blog cards, team grids, mission images, donate QR + portrait, BrandPageBody (8 imgs) all dimensioned + lazy where appropriate
- node multi-line-aware gate confirms 0 `<img>` in src/ missing width or height; `npm run build` and `GITHUB_PAGES=true npm run build` both exit 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Base preloadImage prop, homepage poster preload, Header nav labels + logo dims, Footer logo lazy** - `179395c` (feat)
2. **Task 2: Program components + InnerPageHero/CafePage — LCP hero img attributes and breadcrumb nav labels** - `63a3997` (feat)
3. **Task 3: Site-wide below-fold img sweep + zero-missing-dimensions gate** - `3717785` (feat)

## Files Created/Modified
- `src/layouts/Base.astro` - added optional `preloadImage?: string` prop + head preload link
- `src/pages/index.astro`, `src/pages/en/index.astro` - pass resolved .webp poster as preloadImage; homepage team imgs dimensioned (800×996)
- `src/components/Header.astro` - bilingual aria-labels on desktop (line ~99) and mobile (line ~206) navs
- `src/components/LogoWithSparkles.astro` - logo img width=640 height=173 (eager)
- `src/components/Footer.astro` - footer logo loading=lazy + 640×173
- `src/components/InnerPageHero.astro` - heroImage gains fetchpriority=high + 1200×670 (keeps loading=eager)
- `src/components/CafePage.astro` - hero img fetchpriority=high + 1200×670
- `src/components/programs/*.astro` (7) - breadcrumb aria-label + LCP hero img attributes (MiniRestaurant: video poster-fallback img instead)
- `src/components/brand/BrandPageBody.astro` - 8 imgs dimensioned (real + container-aspect dims), all below-fold lazy
- `src/pages/blog/index.astro`, `src/pages/en/blog/index.astro` - card imgs 1200×800
- `src/pages/team/index.astro`, `src/pages/en/team/index.astro` - grid imgs 800×996
- `src/pages/ueber-uns/index.astro`, `src/pages/en/about/index.astro` - mission img 1200×1666 (children-playing-2 real dims)
- `src/pages/spenden.astro`, `src/pages/en/donate.astro` - QR svg 420×420 + lazy, gianna portrait 800×996 + lazy

## Decisions Made
- **preloadImage not re-prefixed in Base:** Unlike the og `image` prop (which Base prefixes via `new URL(\`${base}${image}\`)`), `preloadImage` is passed already-base-prefixed by index/en-index using the same resolved poster expression VideoHero gets. Per locked decision 6 / PATTERNS.
- **Poster preload dims:** poster file is actually 1920×944 (constant said 943); irrelevant — the poster is preloaded via a `<link>` (no img attributes), and the video poster attribute is untouched.
- **Dimension constants verified with sips:** logo 640×173, program heroes 1200×670, cafe hero 1200×670, team 800×996, blog 1200×800, mission/children-playing-2 1200×1666, restaurant poster 1280×720, QR svg 420×420, brand thumbs/wallpapers/team in CSS-cover containers seeded with container-aspect dims.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] MiniRestaurant hero is a video, not an img — fetchpriority applied to its poster-fallback img**
- **Found during:** Task 2
- **Issue:** The plan's verify gate expected `fetchpriority="high"` in all 7 program components, but MiniRestaurantPage uses a `<video>` hero (the LCP element) with a decorative `aria-hidden` poster-fallback `<img>`, not an `<img>` hero like the other 6. A naive read would leave the gate at 6/7.
- **Fix:** Added `fetchpriority="high"` + `width="1280" height="720"` (real poster dims) to the above-fold poster-fallback img. It is the hero visual shown before the video paints, so high priority is correct and harmless; no `loading=lazy` (above-fold).
- **Files modified:** src/components/programs/MiniRestaurantPage.astro
- **Verification:** `grep -l 'fetchpriority="high"' src/components/programs/*.astro | wc -l` = 7; build green
- **Committed in:** `63a3997` (Task 2)

**2. [Rule 3 - Blocking] Homepage index.astro + en/index.astro team imgs were undimensioned (outside Task 3's listed files)**
- **Found during:** Task 3 (final gate)
- **Issue:** The plan's Task 3 file list did not include `src/pages/index.astro` / `src/pages/en/index.astro`, but both contain team-member `<img>` tags. The final zero-missing-dimensions gate scans ALL of src/, so these blocked the gate.
- **Fix:** Added `width="800" height="996"` (team category) to the homepage team imgs in both files.
- **Files modified:** src/pages/index.astro, src/pages/en/index.astro
- **Verification:** node multi-line gate reports "OK: all img tags dimensioned"; both builds green
- **Committed in:** `3717785` (Task 3)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both required to satisfy the plan's own verify gates (7/7 fetchpriority, 0 undimensioned imgs). No scope creep — all changes stay inside the width/height + LCP-policy + aria-label surface the plan defines.

## Issues Encountered
- Blog index files contain two structurally distinct `<img>` blocks (featured + grid card) with different indentation — required separate edits rather than a single replace_all. Resolved by editing each block.

## Known Stubs
None. Every `<img>` references a real converted .webp (or the existing qr-code.svg); 03-01's two-way gate already guarantees no dangling references.

## Threat Flags
None. Static attribute and aria-label edits only — no new endpoints, auth paths, or trust boundaries. T-3-05 (preload of attacker-controlled URL) remains accepted: preloadImage is fed only by repo-internal CMS string + hardcoded fallback, same trust level as the existing posterSrc.

## Next Phase Readiness
- CLS surface eliminated (every img dimensioned) and LCP heroes prioritized — ready for 03-04 LCP/CLS budget measurement with the wrangler/Playwright harness.
- Nav landmark labeling complete — ready for the 03 axe 0-violation assertion run.

## Self-Check: PASSED

- Created file exists: `.planning/phases/03-performance-a11y-testing/03-03-SUMMARY.md`
- Commits exist: `179395c` (Task 1), `63a3997` (Task 2), `3717785` (Task 3)
- Base.astro contains `preloadImage`; node multi-line gate reports 0 undimensioned imgs; both build modes exit 0

---
*Phase: 03-performance-a11y-testing*
*Completed: 2026-06-13*
