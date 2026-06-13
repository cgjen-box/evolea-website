---
phase: 03-performance-a11y-testing
reviewed: 2026-06-13T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - scripts/convert-images.mjs
  - playwright.config.ts
  - tests/budget.spec.ts
  - tests/smoke.spec.ts
  - tests/headers.spec.ts
  - tests/a11y.spec.ts
  - src/components/InnerPageHero.astro
  - src/layouts/Base.astro
  - package.json
  - wrangler.toml
  - astro.config.mjs
findings:
  critical: 0
  warning: 5
  info: 4
  total: 9
status: resolved
resolution: "All 5 warnings + IN-02 fixed (commit pending); suite re-run 39/39 green. IN-01/IN-03/IN-04 accepted (see Resolution)."
---

# Resolution (2026-06-13)

Applied after the review; all 5 Warnings fixed, suite re-run **39/39 green** against a fresh `build:cloudflare` serving path:

- **WR-01 + WR-02 — FIXED.** `tests/headers.spec.ts` now imports `SECURITY_HEADERS` + `CSP_REPORT_ONLY` from `src/lib/security-headers.ts` and asserts EXACT values (`toBe`) on `/`, `/blog/im-spektrum/`, and the 404 route — including the full CSP string, not just the `report-uri` tail. The exact-value tests passing confirms the served headers match the source constant verbatim. (Relative import used; Playwright's esbuild does not resolve the `@/` tsconfig path.) `/keystatic` CSP variant intentionally left unasserted (env/OAuth-gated, host-agnostic rule).
- **WR-03 — FIXED.** `playwright.config.ts` → `reuseExistingServer: !process.env.CI`, so CI never reuses a stale wrangler server.
- **WR-04 — FIXED.** `tests/budget.spec.ts` falls back to actual body length on `206 Partial Content` instead of trusting the (chunk-size) `content-length`.
- **WR-05 — FIXED.** Budget test now counts the hero video UNCONDITIONALLY at disk size (the homepage always references it) instead of gating on autoplay-request timing, and matches by basename so the GitHub Pages base prefix doesn't break it.
- **IN-02 — FIXED.** `InnerPageHero.astro` now omits the breadcrumb `<nav>` landmark entirely when `breadcrumbs=[]` (the 404 case), mirroring the existing JSON-LD guard.
- **IN-01 — accepted/noted:** budget spec brings the suite to 39 tests (was 38); this resolution note records the delta.
- **IN-03 — accepted:** the 404 breadcrumb-label `'de'` resolution is inherent to Astro's i18n fallback (404 always renders the default locale); behavior is correct, documented here.
- **IN-04 — accepted:** `convert-images.mjs` Gate B inputs are a static manifest (no injection surface); `grep -F` deferred as a non-functional robustness nicety.

---

# Phase 3: Code Review Report

**Reviewed:** 2026-06-13
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 03 stood up a Playwright regression net (smoke / header-drift / axe / budget), a manifest-driven WebP converter with a two-way reference gate, and small template additions (`preloadImage`, breadcrumb landmark label). The code is generally well-structured and the comments document intent carefully.

The dominant theme of the defects is **weakened guarantees**: the header-drift guard and the CSP assertion match so loosely that real, dangerous drift in the security headers would not fail the suite — which directly undermines the stated T-3-06 purpose of the test. The Playwright `reuseExistingServer: true` in CI can let tests pass against a stale build. The budget test is undocumented relative to the SUMMARY and has a hard dependency on browser autoplay behavior. None of these are correctness-of-shipped-code bugs (Critical), but several let the test suite pass while the underlying guarantee is broken, which is exactly the failure class this review was asked to surface.

## Warnings

### WR-01: Header-drift guard does not assert header VALUES — it only checks substrings

**File:** `tests/headers.spec.ts:18-25`
**Issue:** The `REQUIRED` map matches loose substrings, not the exact values in `src/lib/security-headers.ts`. The worst offender is `'permissions-policy': /./`, which passes on ANY non-empty value — if the serving path dropped `interest-cohort=()` or shipped `geolocation=*`, the test still passes. `strict-transport-security: /max-age=31536000/` passes even if a wrong/extra directive is appended; `x-frame-options: /DENY/` passes for `SAMEORIGIN, DENY`. `gen-headers.mjs` enforces *source* parity exactly, but this spec is explicitly the **serving-path** guard (workerd `_worker.js` + `_headers`), and it is the only thing catching middleware/runtime drift. As written it cannot catch a value regression on the serving path — defeating its stated T-3-06 purpose ("never assert absence" was the only host-specific carve-out; the rest should be exact).
**Fix:** Assert exact values by importing the source of truth instead of hand-maintaining loose regexes:
```ts
import { SECURITY_HEADERS } from '../src/lib/security-headers';
// ...
for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
  expect(headers[name.toLowerCase()], `${name} on ${route}`).toBe(value);
}
```
Keep the robots header unasserted (host-agnostic rule), but make every header it DOES check an exact-equality assertion.

### WR-02: CSP-Report-Only assertion is effectively vacuous

**File:** `tests/headers.spec.ts:24`
**Issue:** `'content-security-policy-report-only': /report-uri \/api\/csp-report/` only checks that the `report-uri` tail is present. The entire allowlist (`script-src`, `connect-src`, `frame-ancestors 'none'`, etc.) could be deleted or widened to `default-src *` and this test would still pass as long as `report-uri /api/csp-report` survives. The whole point of guarding the serving path is to catch exactly that kind of policy weakening. It also never verifies the `/keystatic/*` variant (`connect-src ... api.github.com`) at the serving layer.
**Fix:** Assert the full CSP string against `CSP_REPORT_ONLY` from `src/lib/security-headers.ts` on `/`, and add a `/keystatic/` request asserting `CSP_REPORT_ONLY_KEYSTATIC`. (Account for the documented `*.pages.dev` host differences only where they actually differ, not by globbing the whole value.)

### WR-03: `reuseExistingServer: true` unconditionally — CI can test a stale build

**File:** `playwright.config.ts:39-46`
**Issue:** `reuseExistingServer: true` is set for all environments including CI. `test:e2e` runs `build:cloudflare` then `test:e2e:served`, but if a `wrangler pages dev` process from a previous job/step is already bound to `:8788` serving an OLD `dist/`, Playwright silently attaches to it and the entire suite (headers, budget, smoke, a11y) validates stale output — a green run against code that was never built. This is the classic false-pass vector for a build-then-serve test flow.
**Fix:** Gate reuse on local dev only:
```ts
reuseExistingServer: !process.env.CI,
```

### WR-04: `responseBytes()` trusts `content-length` and can under-count behind range/compression

**File:** `tests/budget.spec.ts:34-45`
**Issue:** The budget total is summed from the `content-length` header when present (line 36-41), falling back to `response.body()` only when it is absent. For any same-origin resource served as a `206 Partial Content` (range request) the `content-length` is the *chunk* size, not the full asset — so the budget can be silently under-counted and the test passes while the real homepage payload is over budget. The hero video is the only resource special-cased to disk size; any other ranged/streamed asset is not. The budget guard's guarantee can therefore be broken while green.
**Fix:** When `response.status() === 206` (or a `content-range` header is present), fall through to `response.body().byteLength` or read the full size from `content-range`'s total. At minimum, prefer the measured body length over `content-length` for non-`200` responses.

### WR-05: Budget spec depends on browser autoplay firing — brittle hard-fail

**File:** `tests/budget.spec.ts:109`
**Issue:** `expect(countedHeroVideo, ...).toBe(true)` hard-fails the test if the hero video is never requested during `load`. Whether an autoplaying muted `<video>` issues a network request before the `load` event is environment-dependent (Chrome data-saver, `preload` attribute, headless quirks, OS power state). If autoplay does not fire, the test fails for an environmental reason unrelated to the budget — a flaky gate. Conversely, the whole disk-size accounting hinges on the path matching exactly `/videos/hero-mobile.mp4`; a future filename or base-path change (`/evolea-website/videos/...` on the GitHub Pages serving target) silently stops counting the video and the assertion would then hard-fail or under-count depending on ordering.
**Fix:** Either (a) wait explicitly for the video request (`page.waitForResponse(r => new URL(r.url()).pathname === HERO_VIDEO_PATH)` with a bounded timeout) and account for the GitHub Pages base path, or (b) make the video accounting tolerant: always add `HERO_VIDEO_DISK_BYTES` to the total based on the known on-disk file rather than gating on a live request, and drop the brittle `toBe(true)` assertion.

## Info

### IN-01: `budget.spec.ts` is undocumented relative to the suite SUMMARY

**File:** `tests/budget.spec.ts:1-116`
**Issue:** `03-04-SUMMARY.md` describes a "38-test" suite of smoke / headers / a11y and never mentions `tests/budget.spec.ts`, yet the file exists in `tests/` and runs under `playwright test`. Documented topology and actual topology have drifted — a maintainer reading the SUMMARY will not know the budget gate exists or how its disk-size accounting works.
**Fix:** Add `budget.spec.ts` and its measurement contract (disk-size video accounting, same-origin filter) to the suite topology section of the SUMMARY.

### IN-02: Empty `<nav aria-label>` breadcrumb landmark rendered when `breadcrumbs` is empty

**File:** `src/components/InnerPageHero.astro:95-108, 140-153`
**Issue:** The `<nav class="hero-breadcrumb" aria-label={breadcrumbLabel}>` element is always rendered; when `breadcrumbs` is `[]` (the 404 page passes `breadcrumbs={[]}`) the `.map()` produces no children, leaving an empty labelled navigation landmark in the accessibility tree. Some auditors flag empty landmarks as noise. (The axe scan currently passes, so this is non-blocking.)
**Fix:** Wrap the nav in `{breadcrumbs.length > 0 && (...)}` as is already done for the JSON-LD on line 65.

### IN-03: Breadcrumb label logic relies on `getLangFromUrl` always returning `'de'` on 404

**File:** `src/components/InnerPageHero.astro:48-49`
**Issue:** `breadcrumbLabel` is correct for normal DE/EN pages, but on the 404 route it depends on the documented Astro i18n fallback behavior (`/en/` prefix stripped before 404 renders, so `getLangFromUrl` returns `'de'` → "Brotkrumen"). That coupling is undocumented at the call site; if the fallback config changes, a German breadcrumb label would silently appear on EN 404s. Currently moot because breadcrumbs are empty on 404 (see IN-02), but the implicit dependency is worth a one-line comment.
**Fix:** Add a brief comment noting the lang derivation is URL-based and that the 404 route always resolves to `'de'`.

### IN-04: `convert-images.mjs` Gate B grep escaping is fragile (currently safe)

**File:** `scripts/convert-images.mjs:185`
**Issue:** `grep -rq "${name.replace(/[.]/g, '\\.')}" src/` only escapes dots. `name` is derived from the static `MANIFEST` (no user input), so there is no injection or false-match risk today. But if a future filename contained other regex metacharacters (`+`, `[`, `(`) the gate could mis-match. Worth a `grep -F` (fixed-string) to make it robust by construction.
**Fix:** Use `grep -rqF "${name}" src/` to match the literal filename and drop the manual escaping.

---

## Verdict

**REVISE** — no shipped-code Critical bugs, but the security-header drift guard (WR-01/WR-02) and CI server reuse (WR-03) let the suite pass green while the very guarantees they exist to protect are broken; tighten the test assertions to exact values before relying on this net.

---

_Reviewed: 2026-06-13_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
