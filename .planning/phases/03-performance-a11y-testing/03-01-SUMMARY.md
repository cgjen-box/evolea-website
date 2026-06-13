---
phase: 03-performance-a11y-testing
plan: 01
subsystem: performance
tags: [sharp, webp, image-optimization, astro, perf-01]

# Dependency graph
requires:
  - phase: 01-security-headers
    provides: dual-build (Cloudflare SSR + GitHub Pages static) green-build gate, base-URL invariant
provides:
  - 27 referenced team/program-hero/inner-hero/blog/logo/about images served as display-size WebP (sRGB preserved, alpha kept on logos)
  - committed manifest-driven sharp conversion script with re-runnable two-way reference gate (--verify)
  - npm run convert:images standalone tooling alias
  - ~18MB of referenced PNG/JPG reduced to ~2.6MB WebP
affects: [03-04-performance-budget, 03-02-a11y, image-references]

# Tech tracking
tech-stack:
  added: [sharp (already resolved via Astro; no install)]
  patterns:
    - "Manifest-driven in-place WebP conversion (no globbing — orphans + generated/ excluded explicitly)"
    - "Two-way grep gate as a re-runnable --verify mode on the conversion script (gen-headers.mjs failure-array style)"

key-files:
  created:
    - scripts/convert-images.mjs
  modified:
    - src/content/settings/images.json
    - src/content/team/*.json
    - src/content/pages/spenden.json
    - src/content/pages/about.json
    - src/content/blog/*.mdx
    - src/content/blogEn/*.mdx
    - src/components/Header.astro
    - src/components/Footer.astro
    - src/components/brand/BrandPageBody.astro
    - src/lib/seo.ts
    - src/pages/**/index.astro (all program wrappers DE+EN, index, spenden/donate, ueber-uns/about)
    - package.json

key-decisions:
  - "Logo wordmark kept at q82 (51KB < 60KB threshold) — q75 fallback never triggered"
  - "Added evolea-logo-circle.png to the manifest (referenced from BrandPageBody; plan manifest-derivation rule = grep all referenced png/jpg — circle was an overlooked grep hit)"
  - "BrandPageBody download labels corrected PNG->WEBP with accurate dimensions so the brand-asset download page stays honest"
  - "No og-feeder originals kept — no template passes a converted image to Base's image prop; og-default.jpg is the only og:image surface and was excluded from the manifest"

patterns-established:
  - "Conversion script self-verifies srgb + byte-size + alpha-channel per output"
  - "Reference flip (CMS JSON value + hardcoded fallback) lands in one commit; deletion of originals is a separate post-flip commit so every intermediate state renders"

requirements-completed: [PERF-01]

# Metrics
duration: ~25min
completed: 2026-06-13
---

# Phase 3 Plan 01: WebP Image Conversion + Reference Flip Summary

**Converted 27 referenced team/program/blog/logo/about images to display-size sRGB WebP via a committed manifest-driven sharp script, flipped every reference surface (CMS JSON, 18 blog MDX frontmatter, ~30 hardcoded fallbacks, JSON-LD logo) in one commit, then deleted originals behind a two-way grep gate — shrinking ~18MB of PNG/JPG to ~2.6MB WebP with both build modes green.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-06-13T07:20Z
- **Completed:** 2026-06-13T07:25Z
- **Tasks:** 3
- **Files modified:** 52 (+ 27 webp created, 27 originals deleted)

## Accomplishments
- Manifest-driven `scripts/convert-images.mjs` converting 27 referenced images at per-category display widths (team 800, heroes/blog/about 1200, posters 1920, logo 640, circle 1024), self-verifying sRGB + size reduction + alpha
- Single-commit reference flip across CMS JSON, 18 blog MDX entries (DE+EN), all program wrappers, Header/Footer/seo.ts logo, BrandPageBody, and spenden/donate/ueber-uns/about fallbacks
- Two-way grep gate (`--verify` mode): Gate A = zero dangling old-extension refs (allowlist: og-default.jpg, apple-touch-icon.png), Gate B = all 27 webp referenced
- Converted originals removed from git; both `npm run build` and `GITHUB_PAGES=true npm run build` exit 0

## Per-Category Before → After (representative)

| Category | Example | Before | After (q82) |
|----------|---------|--------|-------------|
| Team (800w) | annemarie-elias | 1594KB | 73KB |
| Team (800w) | christoph-jenny | 1402KB | 51KB |
| Program hero (1200w) | mini-projekte-hero | 980KB | 157KB |
| Program hero (1200w) | tagesschule-hero | 2613KB | 59KB |
| Inner hero (1200w) | evolea-schloss | 1083KB | 183KB |
| Blog (1200w) | exekutive-funktionen | 2780KB | 75KB |
| Blog (1200w) | soziale-kompetenzen | 2559KB | 104KB |
| Poster (1920w) | hero-poster | 265KB | 45KB |
| Logo (640w, alpha) | evolea-logo-new | 704KB | 51KB |
| Logo (1024w, alpha) | evolea-logo-circle | 225KB | 70KB |

Manifest size: 27 images. All outputs sRGB; logo PNGs preserved 4-channel alpha. Total referenced-image payload ~18MB → ~2.6MB.

## Task Commits

1. **Task 1: sharp conversion script + convert images** - `d601806` (feat)
2. **Task 2: flip all image references in one commit** - `0c04019` (feat)
3. **Task 3: delete converted originals after two-way gate** - `d86d1fd` (chore)

## Files Created/Modified
- `scripts/convert-images.mjs` - manifest-driven sharp converter + `--verify` two-way reference gate
- `package.json` - added `convert:images` script alias
- `src/content/settings/images.json`, `src/content/team/*.json`, `src/content/pages/{spenden,about}.json` - CMS path values → .webp
- `src/content/blog/*.mdx`, `src/content/blogEn/*.mdx` - 18 frontmatter `image:` entries → .webp
- `src/components/{Header,Footer}.astro`, `src/lib/seo.ts` - logo references → .webp
- `src/components/brand/BrandPageBody.astro` - thumbs, galleries, download URLs → .webp; download labels corrected
- `src/pages/**` - all program wrappers (DE+EN), index posters, cafe, mini-restaurant, spenden/donate, ueber-uns/about fallbacks → .webp
- `public/images/**` - 27 .webp created; 27 PNG/JPG originals deleted

## Decisions Made
- **Logo quality:** evolea-logo-new at q82 = 51KB (under the 60KB threshold), so the q75 fallback path never triggered. Kept q82.
- **evolea-logo-circle added to manifest:** It is referenced from BrandPageBody (download + thumb). The plan's manifest-derivation rule is "grep every referenced png/jpg"; circle was a grep hit not enumerated in the plan's prose. Converting it keeps the two-way gate satisfiable (Gate A would otherwise flag a dangling ref, or Gate B an orphan). Width 1024 (native square avatar/social asset).
- **og-feeders:** none kept. No template passes a converted image to Base's `image` prop (verified `grep image= src/` returns no Base callers). og-default.jpg is the sole og:image surface and was excluded from the manifest from the start.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed broken children-playing-1.jpg fallback**
- **Found during:** Task 2 (reference flip)
- **Issue:** `src/pages/ueber-uns/index.astro` and `src/pages/en/about/index.astro` had a final image fallback pointing at `/images/about/children-playing-1.jpg`, which does not exist on disk (only children-playing-2.jpg exists). Pre-existing latent bug, masked by the CMS `mission.bild` value.
- **Fix:** Repointed both to the converted `/images/about/children-playing-2.webp` (added children-playing-2.jpg to the manifest so the target exists).
- **Files modified:** src/pages/ueber-uns/index.astro, src/pages/en/about/index.astro, scripts/convert-images.mjs
- **Verification:** `grep -rc children-playing-1 src/` = 0; build green; Gate B confirms children-playing-2.webp referenced
- **Committed in:** 0c04019 (Task 2)

**2. [Rule 1 - Bug] Corrected BrandPageBody download labels**
- **Found during:** Task 2 (BrandPageBody flip)
- **Issue:** Brand-asset download cards advertised `label: 'PNG'` with sizes `'2400 × 920'` (logo-new) and `'1024 × 1024'` (logo-circle), but the download URLs now point at WebP files at different dimensions. The labels would have lied about the downloaded format/size.
- **Fix:** Changed labels to `'WEBP'` with accurate dimensions (logo-new 640×173, circle 1024×1024), matching the existing `spektrum-kreis` 'WEBP'/'Web' precedent on the same page.
- **Files modified:** src/components/brand/BrandPageBody.astro
- **Verification:** build green; visual inspection of DOWNLOADS array
- **Committed in:** 0c04019 (Task 2)

**3. [Rule 3 - Blocking] Added evolea-logo-circle.png to the manifest**
- **Found during:** Task 1 (manifest construction)
- **Issue:** `evolea-logo-circle.png` is referenced from BrandPageBody but was not enumerated in the plan's prose manifest. The plan's two-way gate (Task 3 Gate A/B) cannot pass if it is left as a PNG (dangling ref) or flipped without a converted target (orphan).
- **Fix:** Added `{ src: 'public/images/logo/evolea-logo-circle.png', width: 1024 }` to the manifest per the plan's literal manifest-derivation rule ("grep every referenced png/jpg").
- **Files modified:** scripts/convert-images.mjs
- **Verification:** converted to 70KB 4ch webp; Gate B confirms referenced
- **Committed in:** d601806 (Task 1)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All three were required to satisfy the plan's own two-way-gate invariant and to avoid shipping broken images / dishonest download labels. No scope creep — every change stays inside the image-rename surface the plan defines.

## Issues Encountered
None. All conversions succeeded on first run; both build modes green throughout.

## Threat Flags
None. This is an asset/content rename phase — no new endpoints, auth paths, or trust-boundary surfaces introduced. T-3-02 (dangling image refs → DoS) is mitigated by the two-way grep gate as planned.

## Known Stubs
None. Every reference flip points at a real converted file; Gate B enforces this.

## Next Phase Readiness
- All referenced images are WebP at display size; PERF-01 image work complete.
- Homepage ≤1.5MB budget measurement is intentionally deferred to plan 03-04 (locked decision 2: measure-first AFTER image work with the wrangler/Playwright harness; conditional video re-encode lives there).
- The conversion script's `--verify` mode is re-runnable and can back a future regression check.

---
*Phase: 03-performance-a11y-testing*
*Completed: 2026-06-13*
