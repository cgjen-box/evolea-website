---
phase: 01-foundation-security
verified: 2026-06-12T15:04:18Z
re_verified: 2026-06-12T15:30:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
gaps: []
---

> **Re-verification (2026-06-12):** The single blocking gap was closed in commit
> `c7ca31a` — `src/content/settings/images.json` `programmeHeroes.tagesschule`
> now points at `/images/programs/tagesschule-hero.png`, so the relocated hero
> resolves at runtime on both DE and EN Tagesschule pages. Roadmap criterion 4
> is now VERIFIED; score 5/5. The original report below is preserved as written.

# Phase 1: Foundation & Security Verification Report

**Phase Goal:** A safe, decomposed middleware and a clean repo deliver security headers and long-cache assets on every response path, raising the Mozilla Observatory grade from D to ~A without breaking forms, Keystatic, or the static fallback build.
**Verified:** 2026-06-12T15:04:18Z
**Status:** gaps_found
**Re-verification:** No - initial verification

## Goal Achievement

### Roadmap Success Criteria

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Security headers on SSR and prerendered blog routes, with no drift | VERIFIED | Live preview evidence confirms `/` and `/blog/im-spektrum/` both return HSTS `max-age=31536000`, nosniff, DENY, strict-origin referrer policy, permissions policy, and CSP-Report-Only. `node scripts/gen-headers.mjs` passes and now checks exact path-scoped parity. |
| 2 | Immutable assets, CSP report sink, Formspree/Instagram/Keystatic allowlist | VERIFIED | Live evidence confirms `/assets/*.js` and `/fonts/*.woff2` return `Cache-Control: public, max-age=31536000, immutable`, POST `/api/csp-report` returns 204, and GET `/keystatic` returns 200. Source CSP includes Formspree, Instagram hosts, and `/keystatic` `api.github.com`. |
| 3 | Google Fonts removed; self-hosted fonts; sequence middleware without double next | VERIFIED | `Base.astro` has no `fonts.googleapis.com` or `fonts.gstatic.com`; `FontFaces.astro` emits six base-prefixed `@font-face` declarations; `src/middleware.ts` exports `sequence(securityHeaders, keystaticEnhancements)` with one `await next()` per middleware and no catch-path `return next()`. |
| 4 | Repo hygiene and Tagesschule hero relocation | FAILED | Git hygiene is clean (`public/images/generated/` and `Final images/` untracked, dead components gone, new hero tracked), but runtime hero resolution is partial: `src/content/settings/images.json` sets `programmeHeroes.tagesschule` to `/images/hero/homepage-hero.png`, so the DE/EN wrapper fallback to `/images/programs/tagesschule-hero.png` is not used. |
| 5 | Both build modes green | VERIFIED | Per orchestrator evidence, `npm run build` and `GITHUB_PAGES=true npm run build` both exit 0. Verifier did not rerun npm builds per instruction. |

**Score:** 4/5 roadmap must-haves verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/lib/security-headers.ts` | Single source for security headers and CSP variants | VERIFIED | Exports `SECURITY_HEADERS`, `CSP_REPORT_ONLY`, and `CSP_REPORT_ONLY_KEYSTATIC`; HSTS is bare `max-age=31536000`; no includeSubDomains/preload directives in emitted values. |
| `src/middleware.ts` | `sequence()` composition, security headers, Keystatic injection | VERIFIED | Imports from `@/lib/security-headers`, sets headers after `next()`, exact-or-slash `/keystatic` matching, `response.clone().text()` for HTML injection, deletes stale `content-length`. |
| `src/pages/api/csp-report.ts` | In-stack CSP report sink | VERIFIED | `POST` always returns 204, reads bodies with a 16 KB cap, sanitizes logged fields, and uses `prerender = !__SSR_BUILD__` for Cloudflare-live/static-safe dual builds. |
| `public/_headers` | Cloudflare static/prerendered header backstop and cache rules | VERIFIED | Contains site-wide headers under `/*`, `/keystatic/*` CSP variant, and immutable cache rules under `/assets/*` and `/fonts/*`. |
| `scripts/gen-headers.mjs` | Parity gate wired into build | VERIFIED | Parses `_headers` by path scope, rejects enforcing CSP and unknown site-wide headers, checks `/assets/*` and `/fonts/*`; `node scripts/gen-headers.mjs` exits 0. |
| `src/components/FontFaces.astro` | Base-prefixed self-hosted font declarations | VERIFIED | Six `@font-face` blocks using `import.meta.env.BASE_URL`; Poppins 700 maps to real `Poppins-Bold.woff2`. |
| `public/fonts/*.woff2` | Six real Fredoka/Poppins font files | VERIFIED | Six `.woff2` files exist; `Poppins-Bold.woff2` magic bytes are `wOF2`. |
| `public/images/programs/tagesschule-hero.png` | Relocated tracked hero asset | VERIFIED | `git ls-files public/images/programs/tagesschule-hero.png` returns the path. |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `src/middleware.ts` | `src/lib/security-headers.ts` | Named import | WIRED | Middleware applies `SECURITY_HEADERS` and CSP variants on responses. |
| `public/_headers` | `src/lib/security-headers.ts` | `scripts/gen-headers.mjs` | WIRED | Parity script passed locally and is build-wired. |
| `package.json` | `scripts/gen-headers.mjs` | `build` and `build:cloudflare` scripts | WIRED | Both build scripts start with `node scripts/gen-headers.mjs`. |
| CSP header | `/api/csp-report` | `report-uri /api/csp-report` | WIRED | CSP variants include the report URI; live POST returns 204. |
| `Base.astro` | `FontFaces.astro` and `public/fonts/*` | Head render + preloads | WIRED | `FontFaces` imported/rendered; two critical font preloads use `${base}/fonts/...`. |
| Tagesschule pages | `public/images/programs/tagesschule-hero.png` | Fallback string | PARTIAL | Both wrappers reference the fallback, but current CMS image data overrides it at runtime. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| `_headers` parity gate | `node scripts/gen-headers.mjs` | `OK: public/_headers is in parity with src/lib/security-headers.ts` | PASS |
| Generated assets untracked | `git ls-files public/images/generated/ \| wc -l` | `0` | PASS |
| Final images removed | `git ls-files "public/images/Final images/" \| wc -l` | `0` | PASS |
| Dead components removed | `ls src/components/AngeboteSection.astro ...` | all three files missing; `rg` found no external references | PASS |
| Google Fonts removed | `rg "fonts.googleapis.com\|fonts.gstatic.com" src public astro.config.mjs` | no matches | PASS |
| Tagesschule runtime hero data | inspect `src/content/settings/images.json` | `programmeHeroes.tagesschule` points to `/images/hero/homepage-hero.png` | FAIL |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| SEC-01 | 01-01 | SSR HTML security headers | SATISFIED | Live SSR route evidence plus middleware applying `SECURITY_HEADERS`. |
| SEC-02 | 01-01 | Static/prerendered security headers with no drift | SATISFIED | Live blog route evidence plus path-scoped parity checker wired into builds. |
| SEC-03 | 01-01 | CSP Report-Only allowlist for Formspree, Instagram, inline scripts, Keystatic | SATISFIED | CSP variants include required directives and scoped `/keystatic` `connect-src`. |
| SEC-04 | 01-01 | In-stack `/api/csp-report` Cloudflare Function | SATISFIED | Source route exists; live POST returns 204. |
| SEC-05 | 01-01 | Double-`next()` fixed and middleware decomposed | SATISFIED | `sequence(securityHeaders, keystaticEnhancements)` and no second `next()` in catch paths. |
| PERF-04 | 01-01 | Immutable `/assets/*` cache | SATISFIED | `_headers` and live asset/font evidence confirm immutable cache. |
| PERF-05 | 01-02 | Self-host Fredoka/Poppins; remove Google Fonts | SATISFIED | Six local fonts, base-prefixed `@font-face`, no Google Fonts references. |
| HYG-01 | 01-03 | Move Tagesschule hero and update DE/EN fallback paths | SATISFIED WITH NOTE | Asset is tracked and both wrappers contain the new fallback; runtime use remains blocked by CMS override, captured as the roadmap gap above. |
| HYG-02 | 01-03 | Untrack generated images and delete old assets | SATISFIED | `git ls-files public/images/generated/` and `Final images/` return 0; logo keep-list remains. |
| HYG-03 | 01-03 | Delete dead components after grep confirmation | SATISFIED | Files are absent and `rg` finds no remaining references. |

All 10 Phase 1 requirement IDs from PLAN frontmatter are present in `REQUIREMENTS.md` and accounted for above. No orphan Phase 1 requirements were found.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---:|---|---|---|
| `src/content/settings/images.json` | 13 | CMS override shadows relocated fallback | BLOCKER | Roadmap SC4 says the Tagesschule hero resolves from `public/images/programs/`; current runtime data resolves it to the homepage hero instead. |
| `astro.config.mjs` | 30 | `not available` comment matched scan | INFO | Benign explanatory comment about local static fallback; not a stub/debt marker. |

No `TBD`, `FIXME`, or `XXX` debt markers were found in the modified Phase 1 source/config files.

### Human Verification Required

None. Live Cloudflare preview evidence supplied by the orchestrator is treated as ground truth for the network-only checks. The remaining failing item is deterministically visible in source data and does not need human testing to classify.

### Gaps Summary

The security-header foundation, CSP Report-Only sink, immutable asset/font caching, self-hosted fonts, and build/static-fallback constraints are verified. The only blocking gap is the Tagesschule hero runtime data path: the cleanup moved and referenced the asset, but the current CMS singleton overrides it, so the relocated hero is not what the DE/EN Tagesschule pages actually resolve.

---

_Verified: 2026-06-12T15:04:18Z_
_Verifier: Claude (gsd-verifier)_
