# Phase 3: Performance, A11y & Testing - Research

**Researched:** 2026-06-12
**Domain:** Astro 5 image optimization (WebP/CLS/LCP), axe-core accessibility remediation, custom 404 in dual-build (Cloudflare Pages SSR + GitHub Pages static), Playwright smoke testing
**Confidence:** HIGH (most claims verified empirically against this repo and live production)

## Summary

This phase is almost entirely template/config/asset work on a codebase that was directly inspected for this research. The image problem is well-bounded: ~25 referenced images totaling ~18MB shrink to ~1.2MB as display-sized WebP (empirically probed with the `sharp` already in `node_modules`: team photo 1433KB→73KB, blog PNG 2780KB→75KB, logo 704KB→51KB, poster 265KB→45KB). All referenced images are already sRGB (verified via sharp metadata), so the "sRGB preserved" constraint is trivially met. The reference-update surface for the `.png/.jpg → .webp` rename is fully enumerated below (CMS JSON, 20 MDX frontmatter entries, ~30 hardcoded fallback strings) — missing any one of them silently breaks an image, so a two-way grep gate is mandatory.

Two empirical discoveries change the obvious plan. First, **the i18n fallback 302-redirects any unmatched `/en/*` URL to the de-prefixed path before the 404 renders** (verified live: `curl /en/does-not-exist-xyz/` → `302 location: /does-not-exist-xyz/` → 404). A language-detecting 404 page therefore never sees an `/en/` URL — the 404 must be a single page carrying both DE and EN content. Second, **the current default 404 response carries none of the Phase 1 security headers** (verified live) — adding `src/pages/404.astro` routes 404s through the middleware and fixes that for free. Production also proves unmatched routes reach the Astro worker (it returns Astro's default 404 page on-demand), so a custom 404.astro will render on demand under Cloudflare SSR and build to `404.html` for GitHub Pages.

The A11y items are precisely located: Header.astro has two unlabeled `<nav>` landmarks (lines 99 and 206), seven program components have a third unlabeled breadcrumb `<nav>`, and the `evolea-green` token (#2D7A57) measures **3.86:1** on its own `/20` tint over cream (verified computationally) — darkening the token to ~#236247 fixes every usage (worst case becomes 5.14:1) with a two-file edit (tailwind.config.mjs + global.css, per the dual-token rule). For testing, add `@playwright/test@1.57.0` (pinned to the existing playwright-core) + `@axe-core/playwright`, run against `npx wrangler pages dev dist` after `npm run build:cloudflare` so the header-drift guard exercises both the middleware path and the `_headers` path locally, with a `TEST_BASE_URL` override for preview deploys. **Biggest risk:** the ≤1.5MB homepage budget is tight because the 1.33MB hero video is in-scope traffic but its compression is deferred to v2 (PERF-V2-01) — post-image-work homepage lands at ~1.6–1.7MB estimated; the plan needs a measure-first task and a decision path (see Open Questions).

**Primary recommendation:** Convert in place with a committed manifest-driven sharp script + grep-gated reference updates; single bilingual 404.astro (both languages on one page); darken `evolea-green` to #236247 in both token files; label the three nav landmarks; smoke suite on @playwright/test 1.57.0 + @axe-core/playwright against `wrangler pages dev dist`.

<user_constraints>
## User Constraints (no CONTEXT.md exists — sourced from orchestrator prompt + PROJECT.md locked decisions)

### Locked Decisions
- Convert images IN PLACE to WebP using sharp; NO `src/assets`/`<Image />` migration (PROJECT.md Key Decisions, Phase 1)
- Brand Guide v3.0 non-negotiable for the 404 page: prism gradient hero, page closer, Fredoka headlines, SVG icons only, no emojis
- Bilingual parity mandatory (DE and EN ship simultaneously)
- Playwright: `playwright-core` 1.57.0 already installed; header-drift guard may run against `wrangler pages dev` or be scoped to preview deploys — pick a pragmatic approach; tests must NOT require Cloudflare-only behavior elsewhere
- Tech stack frozen: Astro 5.x + Cloudflare Pages SSR; config/template-level fixes only
- Git: cgjen-box account; gitleaks + check_secrets.py pre-commit hooks; no `--no-verify`
- Visual fidelity: image conversion must not visibly degrade photos (team/program photography is brand-critical)

### Claude's Discretion
- Exact WebP quality/dimensions per image category
- Test runner choice (@playwright/test vs playwright-core scripts) and suite topology
- Exact darker green hex (must stay a recognizable "success green")
- 404 page layout within brand rules

### Deferred Ideas (OUT OF SCOPE)
- Hero video compression (PERF-V2-01 — but see Open Questions: conflicts with the 1.5MB budget)
- AVIF/`<picture>` ladder (PERF-V2-02)
- Manual WCAG audit (A11Y-V2-01)
- CSP enforcement, legacy Tailwind token migration, replatforming
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PERF-01 | Team/program/blog/logo images → WebP at display size in place, sRGB preserved; homepage ≤1.5MB | Full referenced-image inventory + empirical conversion probe + complete reference-update surface (below); budget risk flagged |
| PERF-02 | Every `<img>` has explicit width/height | All 33 `<img>` sites cataloged; none currently carry width/height; per-category dimension constants strategy |
| PERF-03 | Below-fold `loading="lazy"`; LCP hero `fetchpriority="high"`, never lazy | LCP element identified per template (poster on homepage via preload link; hero `<img>` on program/inner pages); current lazy/eager state cataloged |
| A11Y-01 | Two Header `<nav>` landmarks get DE/EN-aware aria-labels | Exact locations: Header.astro:99 (desktop) and :206 (mobile); plus 7 program-component breadcrumb navs need labels for a true 0-violation axe run |
| A11Y-02 | evolea-green contrast ≥4.5:1 on program pages | Verified failing combo (3.86:1) and verified passing replacement token (#236247, worst case 5.14:1); dual-file edit |
| A11Y-03 | Branded bilingual 404 with links to Angebote/Blog | Dual-build 404 mechanics verified empirically; i18n-fallback redirect constraint discovered → single bilingual page design |
| HYG-04 | Playwright smoke suite incl. header-drift guard on SSR + prerendered routes | Test stack verified on registry + slopcheck; local SSR serving topology (`wrangler pages dev`) verified viable; route/selector inventory provided |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- No emojis anywhere on the site — SVG icons via `Icon.astro` only (404 page included)
- Fredoka for headlines; prism gradient hero + page closer on every page (`FooterDonationCTA` via Base covers the closer)
- WCAG AA: contrast ≥4.5:1, alt text, keyboard nav, prefers-reduced-motion respected
- `bg-evolea-*` hex literals live in tailwind.config.mjs AND are duplicated as CSS vars in `src/styles/global.css` — both must be updated together (memory rule: keep hex literals to preserve `/10` opacity modifiers)
- Base-URL invariant: every asset path must be `import.meta.env.BASE_URL`-prefixed (GitHub Pages `/evolea-website` base)
- DE/EN parity; program pages = byte-identical thin wrappers + shared body component (preserve when editing wrappers)
- GitHub account `cgjen-box`; verify `gh auth status` before push; both `npm run build` and `GITHUB_PAGES=true npm run build` must stay green
- Pre-commit: gitleaks + `python scripts/check_secrets.py` + `npm run build` (astro check) all run on commit — TypeScript strict, no `any` in new code
- Testing checklist: mobile 375/768/1024, no console errors, forms submit (Formspree)

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Image conversion (one-off) | Build tooling (node script, committed) | — | Assets live in `public/`; no runtime pipeline by locked decision |
| Image reference updates | Content data (CMS JSON/MDX) + templates | — | Paths are stored strings, not computed |
| width/height + lazy/fetchpriority | Templates (Astro components/pages) | — | Static attributes on `<img>`/`<link rel=preload>` |
| evolea-green token | Design tokens (tailwind.config.mjs + global.css) | — | Single token feeds all failing usages |
| nav aria-labels | Templates (Header.astro, program components) | — | DE/EN-aware via existing `lang` derivation |
| 404 page | SSR route (`src/pages/404.astro`, on-demand) | Static build (`dist/404.html` for GitHub Pages) | Cloudflare worker renders unmatched routes; GH Pages auto-serves 404.html |
| Smoke tests | Dev tooling (`tests/`, @playwright/test) | Local Cloudflare emulation (`wrangler pages dev`) | Header-drift guard needs the real `_worker.js` + `_headers` serving path |
| axe verification | Test tier (@axe-core/playwright inside smoke suite) | — | Same browser context as smoke tests |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `sharp` | 0.34.5 (already in node_modules as Astro's dependency — verified) | One-off WebP conversion script | libvips-backed, the de-facto Node image tool; Astro itself depends on `sharp ^0.34.0` so the exact version is already resolved in the lockfile [VERIFIED: local node_modules] |
| `@playwright/test` | **1.57.0 (pin exact)** | Test runner for smoke suite | Matches the existing `playwright-core@1.57.0` devDependency exactly, avoiding dual playwright-core versions; brings fixtures, retries, webServer, reports [VERIFIED: npm registry; latest is 1.60.0 — do NOT use ^, see Pitfall 6] |
| `@axe-core/playwright` | ^4.11.3 | axe-core a11y scans inside Playwright tests | Official Deque integration; deps `axe-core ~4.11.4`, peer `playwright-core >= 1.0.0` — compatible with 1.57.0 [VERIFIED: npm registry] |
| `wrangler` | ^4.x via `npx` (4.100.0 current) | Local Cloudflare Pages emulation (`wrangler pages dev dist`) | Serves `dist/_worker.js` + `public/_headers` + static assets exactly like Pages; reads `wrangler.toml` (`pages_build_output_dir = "./dist"` already set) [VERIFIED: npm registry + wrangler.toml inspected] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| System Google Chrome | installed at `/Applications/Google Chrome.app` (verified) | Browser for Playwright via `channel: 'chrome'` | Avoids playwright browser downloads; repo precedent in `scripts/brand-qa.mjs` |
| `ffmpeg` | 8.0.1 (installed, verified) | Hero video re-encode contingency ONLY | Only if the 1.5MB budget fails after image work AND user approves pulling PERF-V2-01 forward |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @playwright/test | Extend playwright-core scripts (brand-qa.mjs style) | No assertions framework, retries, parallelism, or HTML report; HYG-04 is a permanent regression net — runner is worth one devDependency |
| wrangler pages dev | astro dev as test target | Middleware runs in dev so most tests pass, but `_headers` (static-route header path) is never exercised — the header-drift guard would be theater; build-time `scripts/gen-headers.mjs` parity already covers source drift, the Playwright guard must cover the *serving* path |
| wrangler pages dev | Preview-deploy-only header tests | Works (Phase 1/2 did this) but makes the suite non-runnable offline; keep as `TEST_BASE_URL` override mode, not the default |
| Token darkening (#236247) | Per-usage class changes (e.g., swap badge backgrounds) | ~12 scattered edits vs 2; token fix also improves white-on-green (5.21→7.22) and survives future CMS-driven usage |

**Installation:**
```bash
npm install --save-dev --save-exact @playwright/test@1.57.0
npm install --save-dev @axe-core/playwright
# wrangler used via npx (cached after first run); sharp already resolved via astro
```

**Version verification (performed 2026-06-12):** `npm view @playwright/test version` → 1.60.0 (we pin 1.57.0 — exists, matches lockfile's playwright-core); `npm view @axe-core/playwright version` → 4.11.3; `npm view wrangler version` → 4.100.0; `sharp` 0.34.5 confirmed installed locally.

## Package Legitimacy Audit

slopcheck 0.6.1 run on 2026-06-12 against npm (probe manifest in /tmp):

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| @playwright/test | npm | years (Microsoft) | tens of M/wk | github.com/microsoft/playwright | [OK] | Approved |
| @axe-core/playwright | npm | years (Deque) | high | github.com/dequelabs/axe-core-npm | [OK] | Approved |
| sharp | npm | 10+ yrs | tens of M/wk | github.com/lovell/sharp | [OK] | Approved (already installed transitively) |
| wrangler | npm | years (Cloudflare) | high | github.com/cloudflare/workers-sdk | [OK] | Approved (npx, not a dependency) |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
**Postinstall check:** `@playwright/test` and `playwright` have no install scripts (verified `npm view ... scripts`); browsers are NOT auto-downloaded (and we use system Chrome anyway). `sharp` has the well-known `install: node install/check.js || npm run build` prebuilt-binary check — legitimate. `@axe-core/playwright`'s `prepare` script only runs for git installs, not registry tarballs.

## Architecture Patterns

### System Architecture Diagram

```
IMAGE PIPELINE (one-off, commit-time)
  public/images/*.{png,jpg}  ──>  scripts/convert-images.mjs (sharp, manifest-driven)
                                      │ resize to display-size, webp q~82, sRGB kept
                                      ▼
  public/images/*.webp  +  delete originals (same commit)
                                      │
  reference update sweep ──> src/content/**/*.json + blog MDX frontmatter
                          ──> hardcoded fallbacks in .astro/.ts (enumerated below)
                                      │
  grep gate (two-way) ──> zero dangling .png/.jpg refs, zero orphan .webp

REQUEST FLOW (per-template LCP)
  / (DE,EN)            VideoHero: <video autoplay poster=hero-poster.webp>
                       └─ head: <link rel=preload as=image fetchpriority=high href=poster>
  /angebote/* program  shared body component hero <img fetchpriority=high width height>
  inner pages          InnerPageHero <img fetchpriority=high width height> (when heroImage)
  below-fold imgs      loading=lazy + width/height (team grids, blog cards, footer logo)

404 FLOW (verified live)
  GET /unknown/        ─> CF worker ─> middleware (headers) ─> renders 404.astro (status 404)
  GET /en/unknown/     ─> i18n fallback 302 ─> /unknown/ ─> 404.astro  ⚠ lang context lost
  GH Pages mirror      ─> dist/404.html served automatically (project-site behavior)

TEST FLOW
  npm run build:cloudflare  ─>  dist/ (_worker.js + _headers + static)
  npx wrangler pages dev dist --port 8788   (playwright webServer)
  @playwright/test (channel: chrome) ──> smoke specs + AxeBuilder scans + header-drift guard
  TEST_BASE_URL=https://evolea-website.pages.dev  ─> same suite vs staging (override mode)
```

### Recommended Project Structure
```
scripts/
└── convert-images.mjs        # committed one-off: manifest of {src, width, category}
src/pages/
└── 404.astro                 # single bilingual page; Base + InnerPageHero + Icon links
tests/
├── smoke.spec.ts             # routes 200, forms render, donate language switcher, 404
├── a11y.spec.ts              # AxeBuilder scans (0 violations)
└── headers.spec.ts           # header-drift guard (SSR route + prerendered blog route)
playwright.config.ts          # baseURL from TEST_BASE_URL, webServer = wrangler pages dev
```

### Pattern 1: Manifest-driven in-place conversion (don't glob blindly)
**What:** The conversion script lists exact files + target widths per category instead of globbing `public/images/**`.
**When to use:** Always here — `public/images/` contains orphans (projects.jpg 3MB, sports.png, school.jpg, garden.jpg, tagesschule.jpg, hero-main.jpg, homepage-hero.png — all verified unreferenced) and exclusions (og-default.jpg, qr-code.svg, already-webp blog files, untracked generated/).
**Example:**
```js
// scripts/convert-images.mjs — sharp 0.34 (already in node_modules via astro)
import sharp from 'sharp';
const MANIFEST = [
  { src: 'public/images/team/annemarie-elias.png', width: 800 },   // 1000x1245 -> 800x996
  { src: 'public/images/programs/mini-garten-hero.png', width: 1200 },
  { src: 'public/images/hero-poster.jpg', width: 1920 },           // 5046x2480 source
  { src: 'public/images/logo/evolea-logo-new.png', width: 640 },   // alpha preserved by webp
  // ... full list in Reference Inventory below
];
for (const { src, width } of MANIFEST) {
  const out = src.replace(/\.(png|jpe?g)$/i, '.webp');
  await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
}
```
All referenced images verified sRGB already (sharp metadata `space:srgb`); sharp's default sRGB output pipeline preserves this — no ICC handling needed. Logo has alpha (4 channels) — WebP supports alpha natively.

### Pattern 2: Single bilingual 404 page (forced by verified i18n behavior)
**What:** One `src/pages/404.astro` rendering DE content first, EN content below (or side-by-side sections), with both Angebote/Blog and Programs/Blog links.
**Why not lang-detection:** Verified live — `/en/<unknown>/` is 302-redirected by Astro's `fallback: { en: 'de' }` to the de-prefixed path *before* the 404 renders, so `getLangFromUrl(Astro.url)` always returns 'de' on 404s. (All EN routes have physical files — verified by tree comparison — so the fallback only ever fires for unmatched paths.)
**Structure:** `Base` (gives FooterDonationCTA page closer + headers via middleware) + `InnerPageHero` (gives the mandatory prism gradient hero — pass `breadcrumbs={[]}`, which correctly suppresses the BreadcrumbList JSON-LD) + `Icon.astro` links. No `prerender` export: on-demand in SSR (status set via `Astro.response.status = 404` is NOT needed — Astro sets 404 automatically for the 404 route), prerendered to `dist/404.html` automatically in static builds.
**Bonus verified win:** today's default 404 carries zero security headers (verified live curl); a custom 404.astro routes through `sequence(trailingSlash, securityHeaders, keystaticEnhancements)` and fixes that.

### Pattern 3: LCP handling per template
- **Homepage (DE/EN):** LCP candidate is the `<video poster>` image (`hero-poster.jpg`, CMS-overridable via `settings/images.json startseite.videoPoster`). `poster` cannot take `fetchpriority` — add `<link rel="preload" as="image" href={poster} fetchpriority="high">` to the homepage head (Base has no head slot today; simplest: add an optional `preloadImage` prop to Base, or emit the link from index.astro via a named slot — planner's choice, but Base prop is least invasive). Video itself: leave `autoplay` untouched, never lazy.
- **Program pages:** the hero `<img>` inside each of the 7 shared program body components (e.g., MiniGartenPage.astro:86) → `fetchpriority="high"`, explicit `width`/`height`, no `loading` attr (eager default).
- **InnerPageHero / CafePage:** the optional `heroImage` `<img>` already `loading="eager"` → add `fetchpriority="high"` + `width`/`height`.
- **Below fold:** team grids and blog cards already `loading="lazy"` (verified); footer logo should become `loading="lazy"`; header logo stays eager with `width`/`height`.

### Pattern 4: axe scan inside the smoke suite
```ts
// Source: official @axe-core/playwright README (Deque), registry-verified package
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no axe violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); // freeze gradient/orb animations
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```
Scan set: `/`, `/en/`, `/angebote/mini-garten/` (green badge page), `/kontakt/`, and the 404 page. `reducedMotion: 'reduce'` is important — the site's animated prism gradients otherwise make color-contrast sampling nondeterministic.

### Pattern 5: Header-drift guard (serving-path, not source-path)
```ts
const REQUIRED = {
  'strict-transport-security': /max-age=31536000/,
  'x-content-type-options': /nosniff/,
  'x-frame-options': /DENY/,
  'referrer-policy': /strict-origin-when-cross-origin/,
  'permissions-policy': /./,
  'content-security-policy-report-only': /report-uri \/api\/csp-report/,
};
for (const route of ['/', '/blog/im-spektrum/']) {   // SSR route + prerendered blog route
  test(`security headers on ${route}`, async ({ request }) => {
    const res = await request.get(route);
    for (const [h, re] of Object.entries(REQUIRED)) expect(res.headers()[h] ?? '').toMatch(re);
  });
}
```
Under `wrangler pages dev`, `/` is served by `_worker.js` (middleware path) and prerendered/static files get `_headers` applied — both drift directions covered locally. Build-time `scripts/gen-headers.mjs` already guards source parity; this guards the serving path.

### Anti-Patterns to Avoid
- **Globbing `public/images/**` for conversion:** converts 6MB of verified orphans and the untracked `generated/` dir; manifest only.
- **Converting `og-default.jpg` to WebP:** keep social-card images as JPEG (WhatsApp/legacy scraper compatibility); exclude from manifest. (Blog `post.data.image` also feeds JSON-LD `imageUrl` — Google accepts WebP for structured data, fine.)
- **`^1.57.0` for @playwright/test:** resolves to 1.60.x and drags a second playwright-core into the tree; pin exact or bump playwright-core in lockstep.
- **Creating `src/pages/en/404.astro`:** produces a literal `/en/404/` route, never used as an error handler; the i18n fallback makes it unreachable for real 404s.
- **Asserting absence of `x-robots-tag` in header tests:** staging (`*.pages.dev`) intentionally sends `noindex`; the suite must stay host-agnostic on that header.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Contrast/a11y checking | Custom contrast math in tests | @axe-core/playwright | axe samples *rendered* colors incl. alpha compositing over gradients; hand math misses stacking contexts |
| Image encoding | ImageMagick shell-outs / manual ffmpeg stills | sharp (already installed) | Consistent libvips encoder, alpha + sRGB handled, no new system deps |
| Local SSR serving for tests | Express server replaying `_headers` | `npx wrangler pages dev dist` | Real workerd runtime + real `_headers`/`_worker.js` semantics; anything else re-implements Cloudflare behavior badly |
| Test orchestration | Bespoke playwright-core runner scripts | @playwright/test webServer + projects | Retries, parallelism, baseURL, reporters for free; brand-qa.mjs stays as-is for its own job |
| 404 routing | Middleware that sniffs 404s and rewrites | `src/pages/404.astro` | Astro's documented mechanism; verified the worker already routes unmatched requests to the 404 renderer |

**Key insight:** every "infrastructure" need in this phase has a first-party answer already inside the repo's toolchain (sharp via Astro, wrangler via Cloudflare, axe via Deque's Playwright package).

## Runtime State Inventory (image rename = reference migration)

This is a rename phase for ~25 asset filenames. Verified surfaces holding the old `.png/.jpg` strings:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| CMS data (git-tracked JSON) | `src/content/settings/images.json` (8 paths: 6 program heroes + evolea-cafe-hero + kind-schmetterlinge + evolea-schloss); `src/content/team/*.json` (4 photos); `src/content/pages/spenden.json` (gianna-spiess.png); `src/content/pages/about.json` (mission/bild.jpg) | Data migration: edit JSON values in the same commit as conversion |
| Blog MDX frontmatter | 20 `image:` entries across `src/content/blog/*.mdx` + `src/content/blogEn/*.mdx` (10 unique files; 2 already `.webp`) | Data migration: frontmatter edits |
| Hardcoded template/source fallbacks | Header.astro:38 + Footer.astro:31 (logo); `src/lib/seo.ts:93` (JSON-LD logo); index.astro:80 + en/index.astro:80 (hero-poster); all 18 program wrapper pages (heroImage fallbacks); angebote/index + en/programs/index (evolea-schloss); evolea-cafe pages ×2; mini-restaurant pages ×2 (poster); spenden.astro + en/donate.astro (kind-schmetterlinge + gianna fallback); ueber-uns + en/about (mission fallback); BrandPageBody.astro (~12 refs) | Code edits, same commit |
| Broken pre-existing fallback | `/images/about/children-playing-1.jpg` referenced as final fallback in ueber-uns + en/about — **file does not exist** (only children-playing-2.jpg does); currently masked by CMS value | Fix while editing (point at existing file) |
| Keystatic CMS (live GitHub-mode) | Keystatic stores paths as strings in the tracked JSON above — no external DB. Future CMS uploads will be PNG/JPG again (acceptable; out of scope to enforce) | None beyond the JSON edits — verified Keystatic has no separate store |
| OS-registered state | None — static website assets | None (verified: no schedulers/services reference image paths) |
| Secrets/env vars | None reference image paths (verified `.env.example`) | None |
| Build artifacts | `dist/` is regenerated every build; Cloudflare cache may serve stale originals post-deploy | Purge zone cache after deploy (existing `/cloudflare` skill command) |
| Excluded from rename | og-default.jpg (social scrapers), qr-code.svg, favicon.svg, apple-touch-icon.png, buchtipp-anders-nicht-falsch.webp + spektrum-kreis.webp (already webp), `generated/` (untracked), videos | State explicitly in the manifest as exclusions |

**Canonical check after rename:** `grep -rn '\.\(png\|jpe\?g\)' src/ --include='*.astro' --include='*.ts' --include='*.json' --include='*.mdx'` must return only the documented exclusions, AND every new `.webp` on disk must be referenced (two-way).

## Common Pitfalls

### Pitfall 1: i18n fallback eats the `/en/` prefix on 404s
**What goes wrong:** A lang-detecting 404 page always renders German.
**Why:** `fallback: { en: 'de' }` 302-redirects unmatched `/en/*` to `/*` before 404 rendering (verified live on production).
**How to avoid:** Single bilingual 404 page (Pattern 2). Do NOT flip `routing.fallbackType` to `'rewrite'` to "fix" this — it changes site-wide i18n semantics Phase 2 just locked, and rewrite behavior for doubly-unmatched paths is unverified.
**Warning signs:** Smoke test `GET /en/unknown/` follows to a German-only page.

### Pitfall 2: A dangling image reference renders as silent 404
**What goes wrong:** One missed `.png` string (e.g., the seo.ts JSON-LD logo or a program wrapper fallback) breaks an image only when the CMS value is absent.
**How to avoid:** Manifest + two-way grep gate (above) + smoke-test assertion that no `<img>` on key pages returns ≥400 (brand-qa.mjs already has the response-listener pattern to copy).
**Warning signs:** `requestfailed`/HTTP 404 entries for `/images/...` in the Playwright network log.

### Pitfall 3: Token darkening must hit two files and only two files
**What goes wrong:** Editing only tailwind.config.mjs leaves `--evolea-green: #2D7A57` in global.css:37 (used by any `var(--evolea-green)` consumers) — colors drift.
**How to avoid:** Change both; grep `#2D7A57` afterward (expect 0). Note `program-card-green` uses `border-evolea-teal`, not green — unaffected. White-text-on-green usages (spenden copy-button success state) *improve* with darkening (5.21→7.22).

### Pitfall 4: axe nondeterminism on animated gradients
**What goes wrong:** Color-contrast results vary run-to-run because prism gradients animate.
**How to avoid:** `page.emulateMedia({ reducedMotion: 'reduce' })` before `goto` — the site has thorough reduced-motion CSS (verified in Header/InnerPageHero/VideoHero), freezing backgrounds deterministically.
**Warning signs:** Flaky color-contrast violations pointing at hero text.

### Pitfall 5: width/height vs CSS sizing
**What goes wrong:** Fear that `width`/`height` attributes break `w-full h-full object-cover` layouts.
**Reality:** CSS wins; the attributes only seed intrinsic aspect-ratio for layout reservation. Set them to the *converted file's* real pixel dimensions (per-category constants after standardization: team 800×996, program heroes 1200×670, blog 1200×800, logo 640×173, poster 1920×943). For CMS-variable images, the category constant is correct because containers fix both dimensions anyway.

### Pitfall 6: Playwright version skew
**What goes wrong:** `@playwright/test@^1.57` installs 1.60.x → second playwright-core; `channel: 'chrome'` API differences across versions are minor but dual versions confuse imports.
**How to avoid:** `--save-exact @playwright/test@1.57.0` (its dependency chain pins playwright-core 1.57.0, identical to the existing devDep).

### Pitfall 7: wrangler pages dev needs a built dist, not a build inside webServer
**What goes wrong:** Putting `npm run build:cloudflare && wrangler pages dev` inside Playwright's `webServer.command` hits timeouts and re-runs `npm install --no-save @astrojs/cloudflare` (network) every test run.
**How to avoid:** Document a two-step flow: `npm run build:cloudflare` once, then `npm run test:smoke` whose webServer only runs `npx wrangler pages dev dist --port 8788` (fail fast if `dist/_worker.js` missing). No Cloudflare auth needed for local pages dev; Keystatic env vars absent only affects `/keystatic`, which the suite doesn't touch.

### Pitfall 8: The 1.5MB homepage budget vs the deferred video
**What goes wrong:** After all image work, homepage ≈ 1.33MB video + ~45KB poster + ~51KB logo + ~96KB fonts + HTML/CSS/JS — estimated 1.6–1.7MB, over budget, and video compression is explicitly deferred to v2.
**How to avoid:** Plan a measure-first task (Playwright: sum `response.body().length` or transfer sizes at load event, 1440×900, no scroll — lazy images correctly excluded). If over: see Open Question 1 before touching the video.

### Pitfall 9: Don't forget the third nav
**What goes wrong:** Labeling only Header's two navs leaves program pages with an unlabeled breadcrumb `<nav>` (e.g., MiniGartenPage.astro:51) → axe `landmark-unique` may still flag.
**How to avoid:** Add `aria-label={lang === 'de' ? 'Brotkrumen' : 'Breadcrumb'}` to the 7 program-component breadcrumb navs (InnerPageHero already has `aria-label="Breadcrumb"`).

## Code Examples

### A11Y-01: distinguishing nav labels (Header.astro)
```astro
<!-- line 99, desktop -->
<nav class="header-nav ..." aria-label={lang === 'de' ? 'Hauptnavigation' : 'Main navigation'}>
<!-- line 206, mobile overlay -->
<nav class="flex flex-col gap-2 mb-auto" aria-label={lang === 'de' ? 'Mobile Navigation' : 'Mobile navigation'}>
```

### A11Y-02: token fix (both files, verified ratios)
```js
// tailwind.config.mjs — was '#2D7A57' (3.86:1 on bg-evolea-green/20 over cream — FAILS)
green: '#236247',  // 7.22:1 on white; 5.14:1 worst-case on its own /20 tint; 6.54:1 on mint/20
```
```css
/* src/styles/global.css :root */
--evolea-green: #236247;
```
(#1F5E43 / #275C44 also verified passing if a different shade is preferred; all three keep white-text-on-green ≥7:1.)

### PERF-03: homepage poster preload (Base.astro optional prop)
```astro
---
interface Props { /* ...existing... */ preloadImage?: string; }
---
{preloadImage && <link rel="preload" as="image" href={preloadImage} fetchpriority="high" />}
```
index.astro passes the same resolved poster path it already computes on line 80.

### playwright.config.ts skeleton
```ts
import { defineConfig } from '@playwright/test';
const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:8788';
export default defineConfig({
  testDir: 'tests',
  use: { baseURL: BASE, channel: 'chrome' },
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: 'npx wrangler pages dev dist --port 8788',
    url: 'http://127.0.0.1:8788',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

### Smoke route/selector inventory (verified against source)
- Homepages: `/`, `/en/` — `h1` visible, 200
- Contact forms: `/kontakt/`, `/en/contact/` — `form[action^="https://formspree.io/f/"]` visible (kontakt/index.astro:160)
- Donate switcher: `/spenden/` → LanguagePicker EN link → expect URL `/en/donate/` (routeMappings verified); reverse direction too
- Program pages (200 + h1): 9 DE (`/angebote/...` incl. `mini-projekte/mini-restaurant`) + 9 EN (`/en/programs/...`) + 2 index pages — all 20 paths enumerated in routeMappings (src/i18n/utils.ts:62-78)
- 404: `GET /this-page-does-not-exist/` → status 404, branded content present, both DE and EN link sets visible
- Headers: `/` and `/blog/im-spektrum/` per Pattern 5

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS lazy-load libraries | Native `loading="lazy"` | universal since ~2020 | attribute-only fix |
| `<link rel=preload>` without priority | `fetchpriority="high"` on img/preload | Chrome 102+, Safari 17.2+, Firefox 132+ | LCP hint is now cross-browser [ASSUMED: Firefox version from training] |
| PNG/JPEG photos | WebP baseline (AVIF as enhancement) | WebP universal since 2020 | AVIF correctly deferred to v2 |
| Pages `_routes.json` tuning | n/a here | — | **Caution:** current @astrojs/cloudflare docs describe v13/Astro 6 (Workers-only, "no longer supports Pages"); this repo pins adapter **12.6.13** which is the Pages-supporting line — do not consult v13 docs for behavior, and do not upgrade the adapter in this phase |

**Deprecated/outdated:** none relevant; `playwright-core` script style (brand-qa.mjs) is not deprecated, just unsuited for a regression suite.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Homepage CSS/JS/HTML weight ≈ 150–250KB compressed (not yet measured; drives the 1.6–1.7MB estimate) | Pitfall 8 | Budget verdict flips; mitigated by the measure-first task |
| A2 | `@axe-core/playwright` AxeBuilder API shape (constructor `{ page }`, `.withTags()`, `.analyze()`) per training + README knowledge; package itself registry-verified | Pattern 4 | Minor API adjustments at implementation time |
| A3 | GitHub Pages project sites auto-serve `404.html` from the published root | 404 flow | EN/DE mirror would show GH default 404; mirror is noindexed fallback — low impact |
| A4 | `wrangler pages dev` applies `_headers` to static assets exactly as production Pages does | Pattern 5 | Header guard gives false signal locally; `TEST_BASE_URL` staging mode is the backstop |
| A5 | Astro auto-sets status 404 when rendering `404.astro` on demand (no manual `Astro.response.status` needed) | Pattern 2 | One-line fix; smoke test asserts status anyway |
| A6 | fetchpriority browser-support versions | State of the Art | None material — attribute is ignored gracefully |

## Open Questions (RESOLVED)

> Resolution (2026-06-12, orchestrator, autonomous run): Q1 (budget vs deferred
> video) → locked decision 2: measure-first in 03-04 T3, SSIM >= 0.95 gated
> conditional re-encode, budget documented as video-excluded if the gate fails.
> Q2 (og:image WebP) → JPEG retained for og:image feeders (03-01 T2 keep-list).
> Q3 (logo WebP tuning) → executor discretion q82/q75 rule in 03-01 T1.


1. **The ≤1.5MB homepage budget vs the 1.33MB hero video (deferred PERF-V2-01)**
   - What we know: video alone is 1330KB; converted poster+logo ≈ 96KB; fonts 96KB on disk; CSS/JS unmeasured. Estimate 1.6–1.7MB total.
   - What's unclear: exact CSS/JS transfer; whether the user intends the budget to include the streaming video.
   - Recommendation: measure first. If over budget, present the user a one-time choice: (a) pull PERF-V2-01 forward (ffmpeg 8.0.1 is installed; ~600KB target re-encode is low-risk and brings total to ~1.0MB), or (b) record the criterion as "≤1.5MB excluding the deferred hero video". Do not silently re-encode — it's an explicitly deferred v2 item.
2. **Blog/og images as WebP for social scrapers**
   - What we know: Base og:image default stays `og-default.jpg` (excluded). Blog posts' `post.data.image` feeds JSON-LD (Google: WebP fine).
   - What's unclear: whether any template passes blog images to Base's `image` prop for og:image (not observed in `[...slug].astro`, which only uses it for JSON-LD — but planner should confirm during implementation).
   - Recommendation: if blog og:image usage is found, keep a JPEG copy for og only; otherwise proceed.
3. **Logo at 640w is 51KB WebP (sparkle gradients compress poorly)**
   - Recommendation: planner may try 480w or quality 75 for the logo specifically; visual check at 2× header size (112px tall) is the gate. Discretionary.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build + scripts | ✓ | 26.0.0 (CI pins 20) | — |
| sharp | conversion script | ✓ (node_modules, via astro) | 0.34.5 | — |
| Google Chrome (system) | Playwright `channel: 'chrome'` | ✓ | /Applications/Google Chrome.app | `npx playwright install chromium` |
| playwright-core | existing QA scripts | ✓ | 1.57.0 | — |
| @playwright/test | smoke suite | ✗ (to install) | pin 1.57.0 | — |
| @axe-core/playwright | a11y tests | ✗ (to install) | ^4.11.3 | — |
| wrangler | local SSR test server | ✗ binary; ✓ via npx | 4.100.0 | TEST_BASE_URL → staging deploy |
| @astrojs/cloudflare | build:cloudflare locally | ✗ (installed --no-save by script; macOS arm64 OK) | 12.6.13 pinned | preview-deploy test mode |
| ffmpeg | video contingency only | ✓ | 8.0.1 | n/a (contingency) |
| gitleaks | pre-commit | ✓ | 8.30.1 | — |
| Python 3 | check_secrets.py hook | ✓ | 3.14.2 | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** wrangler/adapter local flow falls back to running the suite against `https://evolea-website.pages.dev` via `TEST_BASE_URL`.

## Security Domain

(`security_enforcement` not set in config → treated enabled; phase adds no endpoints or input surfaces.)

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — (no auth surfaces touched) |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no new surfaces | 404 page must not reflect the requested URL/query into HTML (avoid `Astro.url` echo — reflected-content sink); static content only |
| V6 Cryptography | no | — |
| V14 Config | yes | New devDependencies pinned (exact for @playwright/test, per SR-5 spirit); no `npx --yes` of unverified packages; wrangler is a known Cloudflare package |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Reflected path in 404 ("'/foo' not found") | Tampering/XSS | Don't interpolate the requested path into the 404 body; Astro auto-escapes expressions anyway — just keep the copy static |
| Supply-chain via new devDeps | Tampering | slopcheck [OK] ×4; no postinstall scripts on playwright packages (verified); lockfile committed |
| Header regression on error paths | Info disclosure | Adding 404.astro restores security headers on 404s (verified missing today) — net security improvement |

## Sources

### Primary (HIGH confidence — verified in this session)
- This repository: Header.astro, Base.astro, VideoHero.astro, InnerPageHero.astro, CafePage.astro, 7 program components, tailwind.config.mjs, global.css, astro.config.mjs, wrangler.toml, src/i18n/utils.ts, all content JSON/MDX, package.json, scripts/brand-qa.mjs — read directly
- Live production probes: `curl https://www.evolea.ch/does-not-exist-xyz/` (404 via worker, no security headers), `/en/does-not-exist-xyz/` (302 strip), redirect chain follow
- Local empirical: sharp conversion probe (6 images), sharp metadata (sRGB/alpha), WCAG contrast computation script, sips profile checks, image size inventory (`du`/`sips`)
- npm registry: `npm view` for @playwright/test, @axe-core/playwright, axe-core, wrangler, playwright dependency chain, install scripts
- slopcheck 0.6.1 scan (4 packages [OK])
- docs.astro.build/en/basics/astro-pages/ (custom 404 builds to 404.html; 500.astro on-demand only) [CITED]

### Secondary (MEDIUM confidence)
- docs.astro.build/en/guides/integrations-guide/cloudflare/ — **current page documents adapter v13 (Workers-only)**; v12.6.13 Pages behavior inferred from the pinned version + live production evidence [CITED with caveat]
- GitHub Pages 404.html auto-serving for project sites (training knowledge, widely documented)

### Tertiary (LOW confidence — flagged)
- Homepage CSS/JS weight estimate (A1) — measure during execution

## Metadata

**Confidence breakdown:**
- Image inventory & reference surface: HIGH — exhaustively grepped and size-probed
- A11y root causes & fixes: HIGH — exact lines located; contrast ratios computed and replacement verified
- 404 dual-build behavior: HIGH for SSR (live-verified), MEDIUM for GH Pages auto-serving (training)
- Test topology: MEDIUM-HIGH — packages verified; `wrangler pages dev` `_headers` fidelity assumed (A4) with staging fallback
- 1.5MB budget feasibility: MEDIUM — video conflict flagged, measure-first required

**Research date:** 2026-06-12
**Valid until:** ~2026-07-12 (stable stack; re-check @playwright/test latest if bumping)
