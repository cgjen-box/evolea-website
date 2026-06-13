---
phase: 01-foundation-security
plan: 02
subsystem: performance / fonts
tags: [fonts, self-hosting, perf, dual-build, base-url, astro]
requires: []
provides:
  - "Self-hosted Fredoka (600/700) + Poppins (400/500/600/700) from public/fonts/"
  - "FontFaces.astro head component emitting base-prefixed @font-face (dual-build-safe)"
  - "Google Fonts <link> + preconnects removed from Base.astro"
affects:
  - src/layouts/Base.astro
  - src/components/FontFaces.astro
tech-stack:
  added: []
  patterns:
    - "import.meta.env.BASE_URL-prefixed font urls emitted from an Astro component (not plain CSS) for dual-build safety"
    - "set:html template-literal <style> block to interpolate base path into @font-face url()"
key-files:
  created:
    - public/fonts/Fredoka-SemiBold.woff2
    - public/fonts/Fredoka-Bold.woff2
    - public/fonts/Poppins-Regular.woff2
    - public/fonts/Poppins-Medium.woff2
    - public/fonts/Poppins-SemiBold.woff2
    - public/fonts/Poppins-Bold.woff2
    - src/components/FontFaces.astro
  modified:
    - src/layouts/Base.astro
decisions:
  - "Downloaded a real Poppins-Bold.woff2 (latin subset, OFL) rather than mapping SemiBold to 700 — true bold, no faux-bold"
  - "Emit @font-face from FontFaces.astro via set:html template literal so urls are base-prefixed and resolve on both build bases (the global.css route cannot interpolate BASE_URL)"
  - "Preload only the 2 critical above-the-fold weights (Fredoka-SemiBold for headlines, Poppins-Regular for body), base-prefixed"
metrics:
  duration: ~4m
  completed: 2026-06-12
  tasks: 2
  files: 8
requirements: [PERF-05]
---

# Phase 01 Plan 02: Self-Host Fredoka & Poppins Fonts Summary

Self-hosted Fredoka (600/700) and Poppins (400/500/600/700) from `public/fonts/` via a base-prefixed `@font-face` block emitted from a new `FontFaces.astro` head component, removed the render-blocking Google Fonts `<link>` and both preconnects from `Base.astro`, and preloaded the two critical weights — all dual-build-safe (no font 404 on either the Cloudflare `/` base or the GitHub Pages `/evolea-website` base), with Poppins 700 backed by a real downloaded `Poppins-Bold.woff2` (no faux-bold).

## What Was Built

### Task 1 — Six real font files in `public/fonts/` (commit `8a74bf7`)
- Copied the 5 source woff2 files from `design-system-assets/fonts/` (README.md NOT copied): Fredoka-SemiBold, Fredoka-Bold, Poppins-Regular, Poppins-Medium, Poppins-SemiBold.
- Downloaded a real `Poppins-Bold.woff2` (weight 700) using the verified mechanism: fetched the `css2?family=Poppins:wght@700` API with a desktop-Chrome User-Agent, took the **latin** `@font-face` block (`unicode-range: U+0000-00FF`), and curled its src url (`.../poppins/v24/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2`) to `public/fonts/Poppins-Bold.woff2`.
- Validated: 7816 bytes, magic bytes `wOF2`. All six weights now backed by their own real file. **No deviation from PERF-05** — the happy path succeeded.

### Task 2 — `FontFaces.astro` + `Base.astro` edits (commit `2fa291c`)
- Created `src/components/FontFaces.astro`: frontmatter computes `const base = import.meta.env.BASE_URL.replace(/\/$/, '')`, builds a CSS string with six `@font-face` declarations (each `font-style: normal`, `font-display: swap`, src url base-prefixed to `${base}/fonts/<file>.woff2`), and injects it via `<style is:inline set:html={fontFaceCss}>`.
- Edited `src/layouts/Base.astro`: imported `FontFaces` (`@components/FontFaces.astro`), rendered `<FontFaces />` in `<head>`, **deleted** the two Google Fonts preconnects and the `css2` stylesheet `<link>`, and added two base-prefixed `rel="preload" as="font" type="font/woff2" crossorigin` links for Fredoka-SemiBold (headlines) and Poppins-Regular (body).

## Verification

| Check | Result |
|-------|--------|
| `grep -c "fonts.googleapis.com\|fonts.gstatic.com" src/layouts/Base.astro` | 0 |
| `grep -c "FontFaces" src/layouts/Base.astro` | 2 (import + render) |
| `grep -c "import.meta.env.BASE_URL" src/components/FontFaces.astro` | 2 |
| `grep -c "@font-face" src/components/FontFaces.astro` | 6 |
| `grep -c "font-display: swap" src/components/FontFaces.astro` | 6 |
| `grep -c 'as="font"' src/layouts/Base.astro` | 2 |
| `grep -c 'base}/fonts/' src/layouts/Base.astro` | 2 |
| `ls public/fonts/*.woff2 \| wc -l` | 6 |
| `head -c 4 public/fonts/Poppins-Bold.woff2` | `wOF2` |
| `ls public/fonts/README.md` | fails (not copied) |
| `npm run build` (Cloudflare/static) | exit 0; dist emits `/fonts/<6 files>.woff2` |
| `GITHUB_PAGES=true npm run build` | exit 0; dist emits `/evolea-website/fonts/<6 files>.woff2` |
| Bare `/fonts/` url under GH base | none (no 404 risk) |
| Google Fonts refs in dist/index.html | 0 |

**DUAL-BUILD URL PARITY (the core issue-5 fix) confirmed:** Cloudflare build renders `/fonts/...` and GitHub Pages build renders `/evolea-website/fonts/...` for all six woff2 files and both preloads.

### Deferred to phase verification (browser-only)
- Visual parity: headlines render in Fredoka, body in Poppins, with **real** bold (not faux-bold) on `font-bold` Poppins elements on the production deploy.
- Network panel: zero requests to `fonts.gstatic.com` and no font 404s.

## Deviations from Plan

None — the happy path executed exactly as written. The Poppins-Bold download succeeded and validated, so no SemiBold-at-700 fallback was needed.

## Threat Surface

Addresses the plan's threat register: removing Google Fonts eliminates the third-party request boundary (T-01-06, GDPR/privacy — no client IP/UA sent to fonts.gstatic.com at runtime); base-prefixed urls mitigate font 404 on a build base path (T-01-07). The only external fetch was the one-time build-machine download of the OFL Poppins-Bold woff2, validated by `wOF2` magic bytes (T-01-SC) — no package installs.

No new security-relevant surface introduced beyond the plan's threat model.

## Known Stubs

None.

## Self-Check: PASSED

- All 6 font files + `src/components/FontFaces.astro` exist on disk (verified).
- Both commits exist: `8a74bf7` (Task 1), `2fa291c` (Task 2).
