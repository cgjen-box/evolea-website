---
phase: 03-performance-a11y-testing
plan: 04
subsystem: testing
tags: [playwright, axe-core, smoke-test, header-drift, wrangler, performance-budget, ffmpeg, wcag-aa]

# Dependency graph
requires:
  - phase: 03-01
    provides: display-size WebP images (homepage payload basis for the budget measurement)
  - phase: 03-02
    provides: branded bilingual 404.astro + darkened evolea-green token (asserted by the suite)
  - phase: 03-03
    provides: img width/height + LCP fetchpriority + nav aria-labels (asserted by the axe scan)
provides:
  - Permanent Playwright regression net (38 tests) against the real Cloudflare serving path
  - Smoke suite (DE/EN homepages, both Formspree forms, donate switcher both directions, 18 program paths, branded bilingual 404, broken-image guard)
  - Security-header drift guard on SSR (/) + prerendered (/blog/im-spektrum/) + 404 paths, host-agnostic on the robots header
  - axe-core 0-violation gate on /, /en/, /angebote/mini-garten/, /kontakt/, 404 under reduced motion
  - test:e2e npm script + playwright.config.ts (TEST_BASE_URL override, wrangler webServer, system Chrome)
  - PERF-01 ≤1.5MB homepage budget CLOSED with evidence (re-encoded hero video)
affects: [ci-regression-net, deploy-verification, future-perf-budget-checks]

# Tech tracking
tech-stack:
  added:
    - "@playwright/test@1.57.0 (exact pin — matches existing playwright-core, single core in tree)"
    - "@axe-core/playwright ^4.11.3"
    - "wrangler (via npx only — NOT a dependency)"
  patterns:
    - "Two-step test flow: build:cloudflare once, then test:e2e (webServer = npx wrangler pages dev dist; never build inside webServer — Pitfall 7)"
    - "Header-drift guard on the serving path (workerd), not the source — covers both _worker.js middleware and public/_headers"
    - "reducedMotion before every goto to freeze animated gradients for deterministic axe contrast sampling"
    - "Measure-first budget with conditional ffmpeg re-encode gated on SSIM >= 0.95"
    - "AA contrast token precedent extended: darker magenta-aa (#B832BB) for text-on-light; brand #DD48E0 retained for fills/accents"

key-files:
  created:
    - playwright.config.ts
    - tests/smoke.spec.ts
    - tests/headers.spec.ts
    - tests/a11y.spec.ts
    - .planning/phases/03-performance-a11y-testing/03-04-SUMMARY.md
  modified:
    - package.json
    - package-lock.json
    - .gitignore
    - public/videos/hero-mobile.mp4
    - src/styles/global.css
    - tailwind.config.mjs
    - src/components/AngeboteSectionV3.astro
    - src/pages/kontakt/index.astro

key-decisions:
  - "Serving mode = LOCAL wrangler pages dev (workerd ran fine on macOS arm64); TEST_BASE_URL staging fallback documented but unused"
  - "Video re-encode crf 34 (not the plan's crf 28 starting point): the original was already a compact 854x480 H.264, so crf 28 produced a LARGER file — higher crf was required to shrink it; crf 34 = 578 KB, SSIM 0.972"
  - "AA contrast fixes scoped to text-on-light contexts via a new magenta-aa token; brand magenta #DD48E0 and the palette are preserved (parallel to 03-02's green darkening)"

patterns-established:
  - "Every drift in the Phase 1 security-header set, the 404 routing, image refs, or nav labels now fails a permanent test"
  - "Budget verdict is evidence-backed (measured bytes + per-resource breakdown + SSIM) rather than estimated"

requirements-completed: [HYG-04]

# Metrics
duration: ~40min
completed: 2026-06-13
---

# Phase 3 Plan 04: Playwright Regression Net + Homepage Budget Closure Summary

**Stood up a permanent 38-test Playwright suite (smoke + header-drift + axe) running against the real Cloudflare serving path via local `wrangler pages dev`, drove it green against the finished state of all three phases — fixing six pre-existing WCAG-AA contrast defects it surfaced — and closed the PERF-01 ≤1.5MB homepage budget by re-encoding the hero video (1.81MB → 1.078MB, SSIM 0.972 ≥ 0.95).**

## Serving Mode

**LOCAL wrangler** (`npx wrangler pages dev dist --port 8788`). On this machine (macOS arm64), `npm run build:cloudflare` installed `@astrojs/cloudflare@12.6.13 --no-save` and produced `dist/_worker.js/` + `dist/_headers`; wrangler/workerd served it locally with full security headers on SSR (`/`), prerendered (`/blog/im-spektrum/`), and 404 paths. The `TEST_BASE_URL=https://evolea-website.pages.dev` staging fallback is documented in `playwright.config.ts` but was not needed.

## Homepage Budget Verdict

**MET via video re-encode: 1,130,392 bytes (1.078 MB), 405,608 bytes under the 1,536,000-byte budget, SSIM=0.972 (≥ 0.95 gate).**

Measured at 1440×900, `load` event, no scroll (lazy images correctly excluded); hero video counted at full on-disk size (conservative).

| Resource type | Before re-encode | After re-encode |
|---------------|------------------|-----------------|
| video (hero-mobile.mp4) | 1327.6 KB | 578.5 KB |
| stylesheet | 127.5 KB | 127.5 KB |
| script | 113.0 KB | 113.0 KB |
| document (HTML) | 99.8 KB | 99.8 KB |
| image | 96.2 KB | 96.2 KB |
| font | 88.7 KB | 88.7 KB |
| other | 0.3 KB | 0.3 KB |
| **TOTAL** | **1,897,535 B (1.810 MB)** | **1,130,392 B (1.078 MB)** |

Pre-re-encode the total was over budget by 361,535 B; total-minus-video was 525 KB (well under budget), so the overage was entirely attributable to the hero video — matching locked-decision-2 path 3b. Per-resource largest items: hero video, Base island script (113 KB), HTML (99.8 KB), main CSS (75.5 KB), logo WebP (51 KB), poster WebP (45 KB).

### Video re-encode (PERF-V2-01 pulled forward)
- `ffmpeg -i hero-mobile.mp4 -c:v libx264 -crf 34 -preset slow -movflags +faststart -an` → 854×480 H.264, faststart confirmed (moov before mdat)
- 1328 KB → 578 KB; **SSIM All = 0.972** (Y 0.968 / U 0.979 / V 0.979)
- Replaced **in place** (same filename — zero reference churn). `hero.mp4` and the two `mini-restaurant` videos were untouched.
- The plan's crf-28 starting point produced a *larger* file (the original was already compact); crf 32/34/36 were probed and crf 34 chosen (≤700 KB target, comfortably above the SSIM gate).

## Cloudflare Cache-Purge Reminder

After this phase deploys, **purge the Cloudflare zone cache** so the old 1.33MB `hero-mobile.mp4` (and any stale WebP/CSS) is evicted — use the `/cloudflare` skill's zone purge (`POST .../zones/31692bef127b39a14d1bd5787aafdd12/purge_cache` with `{"purge_everything":true}`). This plan does NOT deploy.

## Suite Topology (38 tests, all passing)

- **smoke.spec.ts** — DE/EN homepages (200 + h1); both Formspree contact forms; donate language switcher both directions; 18 program paths (routeMappings); branded bilingual 404 (status 404 + "Seite nicht gefunden" + "Page not found" + both DE and EN link sets); broken-image guard on 5 pages.
- **headers.spec.ts** — 6-header REQUIRED map (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP-Report-Only) on `/` (SSR/middleware) and `/blog/im-spektrum/` (prerendered/_headers); X-Frame-Options DENY on the 404 route. Host-agnostic: the robots header is intentionally never asserted (staging sends noindex).
- **a11y.spec.ts** — AxeBuilder `wcag2a/2aa/21a/21aa`, `reducedMotion: 'reduce'` before every goto, `violations === []` on `/`, `/en/`, `/angebote/mini-garten/` (green-badge / A11Y-02 page), `/kontakt/`, and the 404.

## Task Commits

1. **Task 1: pinned test deps + playwright.config.ts + test:e2e + serving-mode verify** — `1a3af9e` (chore)
2. **Task 2: smoke / headers / a11y spec files** — `f0270a4` (test)
3. **Task 3a: btn-primary fill + purple-text token AA fixes** — `956166c` (fix)
4. **Task 3b: hero video re-encode (budget closure)** — `d37c108` (perf)
5. **Task 3c: remaining axe contrast violations cleared** — `4b26827` (fix)

## Deviations from Plan

### Auto-fixed Issues

The plan's Task 3 explicitly instructed: a failure the suite reveals "is a real defect to fix, not a test to weaken." The axe scan surfaced six pre-existing WCAG-AA color-contrast defects (none was previously caught — Phase 3 had no axe runner until this plan). All are real low-contrast text, fixed at the source. They are localized to two components + two global button classes — not a brand-wide palette change; brand magenta #DD48E0 and the documented palette are preserved.

**1. [Rule 1 - Bug] `.btn-primary` fill failed AA (white on #DD48E0 = 3.46:1)**
- **Found during:** Task 3 (first axe run, all 4 content pages)
- **Fix:** Added scoped `--evolea-magenta-aa` (#B832BB, 4.99:1) as the button fill; hover (`bg-evolea-purple`) still wins via specificity. Brand magenta token unchanged for accents/borders/fills elsewhere.
- **Files:** src/styles/global.css
- **Commit:** 956166c

**2. [Rule 1 - Bug] Purple text token failed AA (#BA53AD on cream = 4.14:1)**
- **Found during:** Task 3
- **Fix:** Darkened `--evolea-deep-purple` (alias of `--evolea-purple`) and the tailwind `purple`/`deep-purple` literals #BA53AD → #AD49A0 (text on cream 4.14→4.81; white-on-purple hover 4.96). Dual-token rule honored (both files).
- **Files:** tailwind.config.mjs, src/styles/global.css
- **Commit:** 956166c

**3-6. [Rule 1 - Bug] Remaining contrast failures (AngeboteSectionV3 hardcoded hex, secondary buttons, kontakt opacity text)**
- **Found during:** Task 3 (second/third axe runs, after #1-2 reduced the surface)
- **Issue + Fix:**
  - `AngeboteSectionV3.astro` `<style>`: `.angebote-label-v3` #BA53AD→#AD49A0 (4.13→4.81 on cream); `.angebote-divider-text-v3` #9CA3AF→#5C5762 (2.47→6.81 on cream); `.badge-ongoing-v3` #78716C→#5C5762 (3.82→5.59 on #E7E5E4); `.btn-angebot-primary-v3` #DD48E0→#B832BB (3.45→4.99 on white).
  - `.btn-secondary` / `.btn-white`: `text-evolea-magenta` → `text-evolea-magenta-aa` (new tailwind token #B832BB); brand magenta retained for the `border-evolea-magenta` border.
  - `kontakt/index.astro`: dropped the `/70` opacity on two `text-evolea-text-light` paragraphs (composited #8d8991 = 3.43:1 → full #5C5762 = 7.01:1).
- **Files:** src/components/AngeboteSectionV3.astro, src/styles/global.css, tailwind.config.mjs, src/pages/kontakt/index.astro
- **Commit:** 4b26827

**Total deviations:** 6 auto-fixed (all Rule 1 contrast bugs). **Impact:** axe now reports 0 violations across the 5-page scan set, satisfying the plan's fixed assertion contract and Roadmap SC-3's axe clause. No test was weakened. The fixes extend the AA-token precedent already set for `evolea-green` (03-02) and stay within the locked brand palette (only text-on-light contexts use the darker magenta-aa / purple).

**On scope/Rule 4:** the full contrast surface initially looked brand-systemic (the locked brand magenta #DD48E0 failed as text). On precise enumeration via the axe JSON the failures were bounded to two components + two button classes + one opacity util, all resolvable as localized AA corrections without redefining the brand palette — so they were treated as Rule 1 bugs rather than escalated as a Rule 4 architectural/brand decision.

## Issues Encountered
- The original hero video was already a compact 854×480 H.264 with no audio, so the plan's crf-28 starting point produced a *larger* file. Resolved by probing higher crf values (32/34/36) and selecting crf 34.
- The first three axe runs each revealed a distinct contrast root cause (button fill → purple token → component hex/grays); each was a separate defect, not repeated thrashing on one issue.

## Known Stubs
None. No placeholder data introduced; every test asserts live behavior.

## Threat Flags
None. No new endpoints, auth paths, or trust boundaries. T-3-SC (supply chain): the two new devDeps were slopcheck-[OK] in RESEARCH, exact-pinned (@playwright/test), lockfile committed, no postinstall scripts on the playwright packages. T-3-06 (header drift): now permanently guarded on SSR + prerendered + 404 paths.

## Next Phase Readiness
- HYG-04 satisfied: permanent smoke + header-drift + axe regression net, runnable offline (local wrangler) or against staging (TEST_BASE_URL).
- PERF-01 budget clause closed with evidence (1.078 MB, video re-encoded).
- Roadmap SC-1/SC-3/SC-5 clauses owned by this plan are green; both `npm run build` and `GITHUB_PAGES=true npm run build` exit 0; single playwright-core@1.57.0 in the tree.
- Deploy step (not in this plan) must purge the Cloudflare zone cache to evict the old video.

## Self-Check: PASSED

- Created files exist: playwright.config.ts, tests/smoke.spec.ts, tests/headers.spec.ts, tests/a11y.spec.ts, public/videos/hero-mobile.mp4 (580 KB), 03-04-SUMMARY.md
- Commits exist: 1a3af9e, f0270a4, 956166c, d37c108, 4b26827
- `npm run test:e2e` = 38 passed; both build modes exit 0; single playwright-core@1.57.0

---
*Phase: 03-performance-a11y-testing*
*Completed: 2026-06-13*
