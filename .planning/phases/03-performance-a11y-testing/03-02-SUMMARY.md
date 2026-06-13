---
phase: 03-performance-a11y-testing
plan: 02
subsystem: ui
tags: [astro, tailwind, a11y, wcag-aa, design-tokens, i18n, 404, contrast]

requires:
  - phase: 01-foundation-security
    provides: sequence() middleware that attaches security headers to all responses (now reaches 404s)
provides:
  - "evolea-green token darkened to #236247 (WCAG AA contrast on /20 tint and white)"
  - "Branded bilingual 404 page (src/pages/404.astro) with prism hero, page closer, DE+EN link cards"
  - "404 responses now route through the page → Phase 1 security headers present on error responses"
affects: [03-04 test suite (smoke/a11y/headers asserts 404 status + axe + headers), performance-a11y-testing]

tech-stack:
  added: []
  patterns:
    - "Single bilingual page for 404 (DE content + <div lang=en> block) — i18n fallback strips /en/ before 404 renders"
    - "Static link-card markup with base-URL-prefixed hardcoded DE+EN href sets (no translatePath on 404)"
    - "purple-dark (#8A3D7E) for purple text ≤18px on white to satisfy ≥4.5:1"

key-files:
  created:
    - src/pages/404.astro
  modified:
    - tailwind.config.mjs
    - src/styles/global.css
    - src/components/brand/BrandPageBody.astro

key-decisions:
  - "Darkened green token in both token files to #236247 (locked decision 3); hex literal kept in tailwind.config to preserve /10 /20 opacity-modifier classes"
  - "404 is one bilingual page, not /en/404 — Astro i18n fallback 302-strips /en/ before 404 renders (locked decision 4)"
  - "FooterDonationCTA page-closer H2 is an accepted site-wide pattern; body authors exactly one H1 + one H2 per spec"

patterns-established:
  - "Pattern 1: Bilingual single-page 404 with static, non-reflected copy (no Astro.url interpolation)"
  - "Pattern 2: Link-card = whole-card <a> with Tailwind base box + scoped hover/focus/reduced-motion layer"

requirements-completed: [A11Y-02, A11Y-03]

duration: 7min
completed: 2026-06-12
---

# Phase 03 Plan 02: evolea-green Contrast Fix + Branded Bilingual 404 Summary

**Darkened the evolea-green token to #236247 for WCAG AA contrast and shipped a single brand-compliant bilingual 404 page (prism hero, DE+EN link cards, no client JS, no emojis) that builds to dist/404.html.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-06-12T22:35:00Z
- **Completed:** 2026-06-12T22:40:00Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- evolea-green `#2D7A57` → `#236247` in both token files (tailwind.config.mjs + global.css), resolving the axe color-contrast violation on program-page green badges/highlights (verified worst-case 5.14:1 on its own /20 tint over cream)
- Created `src/pages/404.astro`: single bilingual page (DE first, EN block in `<div lang="en">`) with InnerPageHero prism gradient, `breadcrumbs={[]}` (suppresses BreadcrumbList JSON-LD), 6 base-prefixed link cards (sprout/school/book icons), FooterDonationCTA page closer
- Both build modes green; `dist/404.html` produced in static build; on-demand SSR sets HTTP 404 and now carries Phase 1 security headers

## Task Commits

1. **Task 1: Darken evolea-green token in both token files** - `f0461b4` (fix)
2. **Task 2: Create single bilingual 404 page per 03-UI-SPEC.md** - `677c690` (feat)

## Files Created/Modified
- `src/pages/404.astro` (created) - Branded bilingual 404 page; static copy, no Astro.url reflection, no client JS, no emojis
- `tailwind.config.mjs` - `evolea.green` darkened to `#236247` (hex literal preserved for opacity modifiers)
- `src/styles/global.css` - mirrored `--evolea-green: #236247`
- `src/components/brand/BrandPageBody.astro` - two hardcoded `#2D7A57` "do/success-green" demo literals updated to `#236247` to satisfy repo-wide grep gate and keep the brand-guide demo aligned with the token

## Decisions Made
- Green darkened to `#236247` per locked decision 3; kept as hex literal in tailwind.config (memory rule: preserves `/10` `/20` opacity-modifier classes used at MiniGartenPage.astro:63/:153 and kontakt:118-119)
- 404 implemented as one bilingual page (locked decision 4); did NOT create `src/pages/en/404.astro`
- Card link labels use `text-evolea-purple-dark` (#8A3D7E, 6.89:1 on white) because `text-evolea-purple` (#BA53AD) fails 4.5:1 at ≤18px

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Two hardcoded `#2D7A57` literals in BrandPageBody.astro broke the grep gate**
- **Found during:** Task 1 (green token darkening)
- **Issue:** The plan's acceptance gate requires `grep -rni '2D7A57' src/ tailwind.config.mjs` → 0 matches, but `src/components/brand/BrandPageBody.astro:1830,1853` carried two hardcoded `#2D7A57` literals (the brand-guide "do / success-green" demo color, independent of the token). The plan's two-place edit alone would have left the gate at 2 matches.
- **Fix:** Updated both literals to `#236247` so the brand-guide demo matches the live token and the gate passes. BrandPageBody is not in the parallel agent's protected file set (Header/Footer/program components/content/images).
- **Files modified:** src/components/brand/BrandPageBody.astro
- **Verification:** `grep -rni '2D7A57' src/ tailwind.config.mjs` → 0; `npm run build` exits 0
- **Committed in:** `f0461b4` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug/correctness)
**Impact on plan:** Necessary to satisfy the explicit zero-old-hex acceptance gate and keep the brand-guide demo color consistent with the token. No scope creep.

## Issues Encountered
- Initial Edit calls targeted the shared-checkout path and were rejected (worktree isolation); re-pointed all edits to the worktree copy.
- First drafts of token comments and the 404 docblock contained the literal strings `2D7A57` and `prerender`, tripping the literal grep gates; reworded both to remove the tokens while preserving meaning.
- Static build emits `dist/en/404/index.html` as an Astro i18n fallback artifact — harmless build output; no physical `src/pages/en/404.astro` exists (acceptance criterion satisfied).

## Notes on H2 count
The rendered `dist/404.html` has two `<h2>` elements: the EN block "Page not found" (authored, per spec) and the FooterDonationCTA "Helfen Sie Kindern im Spektrum" (the mandatory page closer auto-injected by Base on every page). The body authors exactly one H1 and one H2; the page-closer H2 is the established site-wide pattern (same on kontakt/impressum) at the same heading level — no skipped levels, axe-clean.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 404 page is in 03-04's smoke + axe scan set; HTTP 404 status, both DE/EN link sets, and security-header presence are asserted there.
- evolea-green contrast fix unblocks the axe color-contrast assertions on program pages.

## Self-Check: PASSED

- FOUND: src/pages/404.astro
- FOUND: tailwind.config.mjs (#236247)
- FOUND: src/styles/global.css (--evolea-green: #236247)
- FOUND: .planning/phases/03-performance-a11y-testing/03-02-SUMMARY.md
- FOUND commit: f0461b4 (Task 1)
- FOUND commit: 677c690 (Task 2)

---
*Phase: 03-performance-a11y-testing*
*Completed: 2026-06-12*
