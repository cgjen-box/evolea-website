# Stack Research

**Domain:** Quality lift (security/SEO/performance/a11y) on an existing Astro 5 + Cloudflare Pages SSR site
**Researched:** 2026-06-12
**Confidence:** HIGH

> **Framing.** This is a brownfield hardening pass, not a greenfield build. The PROJECT.md constraint is explicit: "everything ships as config or template changes on the current stack — no replatforming, no output mode changes." The site is pinned to **Astro 5.16.4** (`^5.1.1`) with **`@astrojs/cloudflare` 12.6.13** and `output: 'server'`. The dominant theme of this research is therefore: **the newest, prettiest 2026 tools (Astro 6 native CSP, Astro 6 native Fonts API) require an Astro 6 upgrade that is out of scope.** Most of these jobs are done with build-time CLI tooling or hand-rolled code in the existing `src/middleware.ts`, deliberately avoiding new framework-coupled abstractions.

---

## Recommended Stack

### Core Technologies (the decisions that shape the work)

| Area | Choice | Version | Why Recommended |
|------|--------|---------|-----------------|
| **Security headers + CSP** | Hand-rolled in `src/middleware.ts` (no library) | n/a (uses existing Astro middleware API) | The static `X-*` / HSTS / Referrer / Permissions headers are 5 lines of `response.headers.set()`. CSP must be **`Content-Security-Policy-Report-Only`** with a hand-written allowlist (Formspree, Instagram, Google Fonts/inline) + a *separate looser policy for `/keystatic`*. Astro's native CSP (5.9 experimental / 6.0 stable) **cannot express any of these requirements** — see "What NOT to Use." Middleware already exists and is the documented injection point for SSR responses; `public/_headers` does not apply to Pages-Function-rendered HTML. |
| **Image conversion to WebP** | **`sharp` (Node API)** via a one-off script (`sharp-cli` optional) | `sharp` 0.35.1 / `sharp-cli` 5.2.0 | sharp is the maintained, fast (libvips, 4–5× ImageMagick), native WebP/AVIF encoder. Convert-in-place under `public/` as a build-time/manual step — SSR cannot transform at request time and the project explicitly rejected moving images to `src/assets` + `<Image>`. A tiny `scripts/convert-images.mjs` using the sharp Node API is the cleanest, most controllable approach (per-file quality, resize-to-display-size, keep originals). |
| **JSON-LD structured data** | **Hand-rolled `<script type="application/ld+json">`** typed with **`schema-dts`** (dev-only) | `schema-dts` 2.0.0 | The site needs ~5 schema types across 3 templates (`Organization`/`NGO` + `WebSite` in `Base.astro`, `BlogPosting` on blog slugs, `BreadcrumbList`/`Service`/`Event` on Angebote). A bare `set:html={JSON.stringify(schema)}` in the layout is zero-runtime-cost and fully under control. `schema-dts` adds compile-time type-checking of the objects with **no runtime footprint** (it is types-only). |
| **robots.txt** | **Static `public/robots.txt`** | n/a | A non-profit marketing site has one stable robots policy. A static file is simpler than a dynamic route and is served correctly by Cloudflare as a static asset (it is *not* SSR-rendered, so no header/middleware concern). Must reference the sitemap (`Sitemap: https://www.evolea.ch/sitemap-index.xml`) and `Disallow: /keystatic/`. (See variant below for the staging-de-index caveat.) |
| **Playwright smoke tests** | **`@playwright/test`** | 1.60.0 | The de-facto Astro E2E recommendation. Drives a built `preview` server, asserts DE/EN homepage 200s, both contact forms render, donate language switcher works, program pages 200. The repo already has `playwright-core` 1.57.0 for QA scripts; add the **full `@playwright/test`** runner (test runner + fixtures + assertions). `playwright-core` alone has no runner and no browsers and cannot run `.spec.ts` files. |
| **Self-hosted fonts** | **Plain `@font-face` in `src/styles/global.css` + local `.woff2`** | n/a | The `.woff2` files already exist in `design-system-assets/fonts/`. Copy to `public/fonts/`, write `@font-face` rules with `font-display: swap`, preload the 1–2 critical faces with `crossorigin`, drop the Google Fonts `<link>`. No library needed. (Astro 6's native `experimental.fonts` API would do this, but requires the out-of-scope upgrade.) |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sharp` | 0.35.1 | WebP/AVIF/resize encoder (Node API) | Required. Use the Node API in `scripts/convert-images.mjs` for full control; needs Node ≥20.9 (CI pins Node 20 — OK). Dev/build-time only — never imported by the SSR worker. |
| `sharp-cli` | 5.2.0 | Thin CLI wrapper over sharp | Optional. Use only if you prefer `npx sharp -i in.png -o out.webp` one-liners over a script. The script approach is recommended for repeatable, reviewable conversions of the ~16 files. |
| `schema-dts` | 2.0.0 | TypeScript types for schema.org objects | `devDependencies`. Types-only, zero runtime. Gives autocomplete + type errors on JSON-LD objects so `BlogPosting`/`Organization` shapes stay valid. |
| `@playwright/test` | 1.60.0 | E2E test runner + browser fixtures | `devDependencies`. Run against `astro preview` (built output) so SSR/middleware headers are exercised the same way they ship. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `astro preview` | Serve the built SSR output locally for Playwright + header checks | CSP/middleware do **not** run in `astro dev` (Vite dev server) — always test headers/CSP against `astro build && astro preview`. |
| Mozilla Observatory | Verify security header grade | Manual external check (per PROJECT.md verification fallback). |
| Google Rich Results Test / Schema Markup Validator | Validate JSON-LD | Manual; the benchmark `audit_site.py` is not in this repo. |
| `curl -I` | Spot-check response headers (HSTS, CSP-RO, Cache-Control) | Run against the deployed Cloudflare URL, not localhost. |
| Optional CSP report collector | Receive CSP-RO violation reports during the dry run | See "CSP report collection" below. |

## Installation

```bash
# Image conversion (dev-time)
npm install -D sharp@^0.35.1
# optional CLI wrapper instead of a script:
# npm install -D sharp-cli@^5.2.0

# JSON-LD typing (dev-only, types-only, zero runtime)
npm install -D schema-dts@^2.0.0

# E2E smoke tests
npm install -D @playwright/test@^1.60.0
npx playwright install --with-deps chromium

# Security headers, CSP, robots.txt, self-hosted fonts: NO packages.
#   - headers/CSP -> edit src/middleware.ts
#   - robots.txt  -> add public/robots.txt
#   - fonts       -> copy design-system-assets/fonts/*.woff2 -> public/fonts/, add @font-face
```

## CSP Report Collection (decision detail)

CSP-RO needs somewhere to POST violation reports during the ≥1-week dry run. Three options, in order of fit:

1. **Cloudflare Pages Function endpoint (recommended, in-stack).** Add `functions/csp-report.ts` (or an Astro API route) that accepts the POST and `console.log`s the report (visible in Cloudflare Pages logs / Logpush). Free, no third party, no GDPR data-sharing concern for a Swiss NGO. Point `report-uri /csp-report;` + a `Reporting-Endpoints` header at it. **Confidence: HIGH.**
2. **report-uri.com or Csper free tier (managed).** Zero code, good dashboards/aggregation. Downsides: sends violation data (URLs, possibly user-context) to a third party (GDPR review needed for an EU/CH NGO), and report spikes from browser extensions can hit free-tier limits. **Confidence: HIGH** that they work; **MEDIUM** as the right fit given the privacy posture.
3. **No collector — eyeball the browser console.** Acceptable only for a quick manual check, not for a "≥1 week of data" flip-to-enforce decision. Not recommended as the sole method.

**Header note:** use **both** `report-uri` (broad support; Firefox still lacks `report-to` for CSP as of early 2026) and `report-to` + a `Reporting-Endpoints` response header (Chrome/Edge/Safari). `report-uri` is technically deprecated but still the widest-compatibility directive — ship both.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Hand-rolled CSP in middleware | **Astro 6 native CSP** (`csp: true`, stable in 6.0) | Only after a (separately scoped) Astro 6 upgrade — *and even then* native CSP does not support external scripts/styles out of the box, has no first-class Report-Only external-allowlist mode, and is incompatible with `<ClientRouter />` view transitions. For an allowlist-of-external-domains use case it is the wrong tool regardless of version. |
| Hand-rolled CSP in middleware | **Cloudflare Transform Rule / dashboard header** | If you wanted the rule outside git. PROJECT.md explicitly chose middleware (versioned, testable, no dashboard dependency). Keep it in middleware. |
| `sharp` (Node script) | `sharp-cli` one-liners | Fine for a handful of ad-hoc conversions; the script wins for the ~16 files here (reviewable, re-runnable, per-image quality). |
| `sharp` | **Cloudflare Images / Image Resizing** | If you wanted on-the-fly transforms at the edge. Overkill + recurring cost for a fixed set of static brand photos; convert-in-place is free and was the chosen path. |
| Hand-rolled JSON-LD + `schema-dts` | **`astro-seo-schema`** (6.0.0) | A thin `<Schema>` wrapper around the same `<script>` tag. Adds a runtime dependency for ~5 static blobs. Fine if you want the ergonomic component, but it buys little over `set:html` and adds a maintained-by-one-person dependency. `schema-dts` (types-only) gives you the safety without the runtime. |
| Static `public/robots.txt` | Dynamic `src/pages/robots.txt.ts` route | Use the dynamic route only if robots content must vary by env (e.g., `Disallow: /` on the staging `pages.dev` host to keep it out of the index). That is a real consideration here — if you want staging de-indexed, a dynamic route keyed on hostname is the better choice. **Flag for roadmap.** |
| `@playwright/test` | Vitest + `@astrojs/test` container | Unit/component testing. The need here is browser-level smoke (forms render, routes 200, switcher works), which is E2E — Playwright is correct. |
| Self-hosted `@font-face` | Astro 6 `experimental.fonts` (Fontsource/local) | Only post-upgrade. The manual `@font-face` approach is the standard, dependency-free pattern and matches the existing `design-system-assets/fonts/` reality. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Astro native CSP** (`experimental.csp` / Astro 6 `csp`) | (1) Built for hashing/nonce-ing *Astro's own* inline scripts, not allowlisting third parties (Formspree/Instagram/Fonts). (2) "External scripts and styles are not supported out of the box." (3) Not compatible with `<ClientRouter />` view transitions. (4) Stable only in Astro **6**; project is pinned to Astro 5.16 and replatforming is out of scope. (5) Does not run in `astro dev`. | Hand-written CSP-RO string in `src/middleware.ts`. |
| **`@squoosh/cli`** | Officially deprecated and removed from the repo in **January 2023**; unmaintained, build failures on modern Node. | `sharp` (Node API) or `sharp-cli`. |
| **`public/_headers`** for page headers/CSP | Cloudflare Pages applies `_headers` only to **static assets**, not to SSR/Pages-Function-rendered HTML. Every page here is SSR (`output: 'server'`), so `_headers` would silently miss all pages. | `src/middleware.ts` for all response headers. |
| **`astro-seo` / broad SEO meta libraries** for JSON-LD | Pulls in a wide meta-tag abstraction to solve a 5-blob structured-data need; the layout already manages its own canonical/OG tags. | `set:html={JSON.stringify(schema)}` + `schema-dts` types. |
| **Writing tests against `playwright-core`** | `playwright-core` (already installed) has **no test runner and no bundled browsers** — it cannot run `.spec.ts` smoke tests. | Add `@playwright/test` (runner + assertions) and run `npx playwright install`. |
| **AVIF as the primary format for the brand photos** | AVIF compresses 20–50% better but encodes 5–20× slower and the success metric is "no visible degradation of brand-critical photography." WebP q80–85 hits the size targets (team ≤100KB, hero ≤200KB) with safer, faster, universal decoding. | WebP q80–85 in place. (AVIF optional later via `<picture>`, out of scope now.) |
| **`trailingSlash: 'always'` in `astro.config.mjs` as a blind fix** | CONCERNS.md flags "verify compatibility with the Cloudflare adapter" — config-level trailing-slash on the Cloudflare SSR adapter can behave inconsistently for the 301. | Handle the trailing-slash 301 in `src/middleware.ts` alongside the other header logic (one place, testable), OR a Cloudflare redirect rule — test whichever against `astro preview` + the deployed worker. |

## Stack Patterns by Variant

**If you want CSP violation reports aggregated without writing code:**
- Use report-uri.com / Csper free tier as the `report-uri`/`report-to` target.
- Because it gives dashboards immediately — but do a quick GDPR check first (Swiss NGO sending violation data to a third party).

**If you want to keep all data in-stack (recommended for the NGO privacy posture):**
- Add a Cloudflare Pages Function `csp-report` endpoint that logs reports.
- Because it avoids third-party data sharing and free-tier spike limits, and dry-run volume is low.

**If the staging `evolea-website.pages.dev` host must stay out of Google's index:**
- Switch robots.txt from static to a dynamic `src/pages/robots.txt.ts` route returning `Disallow: /` when `Astro.url.hostname` is the pages.dev host, and the real policy on `www.evolea.ch`.
- Because a static `public/robots.txt` ships identically to both hosts and would otherwise allow staging to be crawled. **Real risk worth flagging in the roadmap.**

**If `astro dev` shows no headers/CSP and you think it's broken:**
- It's not — middleware response mutation and any CSP only run in the built server. Always `astro build && astro preview` (or test the deployed worker) for header verification.

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `sharp@0.35.1` | Node ≥ 20.9.0 | CI pins Node 20, local runs Node 26 — both satisfy. Dev-only; never imported by SSR runtime (Cloudflare Workers can't run sharp's native binary anyway). |
| `@playwright/test@1.60.0` | Node ≥ 18; coexists with `playwright-core@1.57.0` | Align the two on the same minor when convenient to avoid two browser downloads; not required to coexist. v1.57+ runs Chrome-for-Testing builds. |
| `schema-dts@2.0.0` | TypeScript 5.x (project on 5.9) | Types-only, no runtime/version coupling to Astro. |
| Hand-rolled CSP middleware | `@astrojs/cloudflare@12.6.13`, Astro 5.16.4 | Uses the stable `onRequest`/`MiddlewareHandler` API — no version risk. Mind the existing fragile double-`next()` catch path in `src/middleware.ts` (CONCERNS.md) when adding the header branch; set headers on the returned `Response`, don't re-run `next()`. |
| Self-hosted `@font-face` | any | Pure CSS; no toolchain coupling. Serve `/fonts/*.woff2` with the same long-cache `Cache-Control` you add for `/assets/*`. |
| **Astro 6 native CSP / Fonts API** | Astro **6.x only** | **Out of scope** — documented so the roadmap doesn't reach for it. Astro latest is 6.4.6; project stays on 5.16. `@astrojs/cloudflare` latest is 13.7.0 (project on 12.6.13) — also tied to the upgrade. |

## Sources

- https://docs.astro.build/en/reference/experimental-flags/csp/ — Astro experimental CSP: external scripts/styles unsupported, ClientRouter incompatible, dev-mode unsupported (HIGH)
- https://astro.build/blog/astro-590/ — CSP introduced 5.9 experimental; hashing/nonce of Astro's own inline assets, not external allowlists (HIGH)
- https://www.infoq.com/news/2026/02/astro-v6-beta-cloudflare/ + https://alexbobes.com/programming/a-deep-dive-into-astro-build/ — CSP stable in Astro 6; `strictDynamic` added in 6.0 (HIGH)
- https://developers.cloudflare.com/pages/configuration/headers/ — `_headers` does not apply to SSR/Pages-Function responses; set headers in Function code (HIGH)
- https://www.npmjs.com/package/sharp + https://sharp.pixelplumbing.com/ — sharp 0.35.1, Node ≥20.9, native WebP/AVIF (HIGH)
- https://www.npmjs.com/package/@squoosh/cli + Squoosh repo history — Squoosh CLI deprecated/removed Jan 2023 (HIGH)
- https://pixotter.com/blog/webp-vs-avif/ — AVIF 20–50% smaller but 5–20× slower to encode (MEDIUM)
- https://www.npmjs.com/package/astro-seo-schema (6.0.0) + https://www.npmjs.com/package/schema-dts (2.0.0) — JSON-LD options for Astro (HIGH on versions)
- https://www.npmjs.com/package/@playwright/test (1.60.0) + https://docs.astro.build/en/guides/testing/ — Astro recommends Playwright for E2E; `playwright-core` lacks runner/browsers (HIGH)
- https://playwright.dev/docs/release-notes — v1.57+ uses Chrome-for-Testing builds (HIGH)
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Reporting-Endpoints + report-to/report-uri MDN pages — use both directives; Firefox lacks report-to for CSP (HIGH)
- https://www.codemzy.com/blog/cloudflare-function-csp-report — self-hosted CSP report endpoint via Cloudflare Function (MEDIUM)
- https://fonts.google.com/knowledge/using_type/self_hosting_web_fonts + https://www.corewebvitals.io/pagespeed/self-host-google-fonts — woff2-only, `font-display: swap`, preload 1–2 faces with `crossorigin` (HIGH)
- npm registry (`npm view`) on 2026-06-12 — sharp 0.35.1, @playwright/test 1.60.0, astro-seo-schema 6.0.0, schema-dts 2.0.0, sharp-cli 5.2.0, astro 6.4.6, @astrojs/cloudflare 13.7.0 (HIGH)

---
*Stack research for: Astro 5 + Cloudflare Pages SSR quality lift*
*Researched: 2026-06-12*
