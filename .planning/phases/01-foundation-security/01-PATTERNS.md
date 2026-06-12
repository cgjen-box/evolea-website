# Phase 1: Foundation & Security - Pattern Map

**Mapped:** 2026-06-12
**Files analyzed:** 10 (4 new, 4 modified, 1 asset copy, 1 deletion set)
**Analogs found:** 7 / 10 (3 files have no codebase analog — formats are platform-defined)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/middleware.ts` (refactor) | middleware | request-response | itself (`src/middleware.ts`) | exact |
| `src/lib/security-headers.ts` (NEW) | config constant module | n/a (static export) | `src/i18n/ui.ts` | role-match |
| `public/_headers` (NEW) | config | n/a (Cloudflare-parsed) | none | no analog |
| `src/pages/api/csp-report.ts` (NEW) | API route | request-response (POST) | `src/pages/blog/[...slug].astro` (prerender export) + `src/middleware.ts` (Response construction) | partial |
| `src/layouts/Base.astro` (modify) | layout | request-response | itself | exact |
| `src/styles/global.css` (modify) | stylesheet | n/a | itself | exact |
| `public/fonts/*.woff2` (NEW) | static assets | file-I/O | `design-system-assets/fonts/` (source) | exact (copy) |
| `src/pages/angebote/tagesschule/index.astro` (modify) | page wrapper | request-response | itself | exact |
| `src/pages/en/programs/day-school/index.astro` (modify) | page wrapper | request-response | DE twin (byte-identical wrapper pattern) | exact |
| Deletions (components + images) | n/a | n/a | n/a (grep-verified below) | n/a |

## Pattern Assignments

### `src/middleware.ts` (middleware, request-response — REFACTOR)

**Analog:** itself — the existing file is the thing being decomposed. Behavior to preserve exactly: deploy-button hide + save toasts via `keystaticEnhancementsScript` (lines 6–83, a template-literal `<script>` string).

**Current structure** (lines 85–121) — the code being refactored:

```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  const { url } = context;

  // Inject script to hide Deploy button on /keystatic pages
  if (url.pathname.startsWith('/keystatic')) {
    const response = await next();

    // Only modify HTML responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      return response;
    }

    try {
      const html = await response.text();
      let modifiedHtml = html;
      if (html.includes('</body>')) {
        modifiedHtml = html.replace('</body>', keystaticEnhancementsScript + '</body>');
      } else {
        modifiedHtml = html + keystaticEnhancementsScript;
      }
      return new Response(modifiedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });
    } catch {
      // If anything fails, return original
    }

    return next();   // <-- THE BUG: second next() call after body already consumed
  }

  return next();
});
```

**The double-`next()` bug (lines 112–116):** if `response.text()` throws, the `catch` falls through to `return next()` — calling `next()` a second time on a request whose downstream response body was already consumed. The fix: capture `response` before the try, and on failure `return response` is NOT possible (body consumed) — instead clone before reading: `const html = await response.clone().text()` and return the original `response` in the catch path. Never call `next()` twice.

**Target shape — `sequence()` composition** (no existing analog in repo; Astro 5 API):

```typescript
import { defineMiddleware, sequence } from 'astro:middleware';
import { SECURITY_HEADERS } from '@/lib/security-headers';

const securityHeaders = defineMiddleware(async (_context, next) => {
  const response = await next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
});

const keystaticEnhancements = defineMiddleware(async (context, next) => {
  // ... existing /keystatic logic, with clone() fix, single next() call
});

export const onRequest = sequence(securityHeaders, keystaticEnhancements);
```

**Header construction pattern to copy** (line 107–111): `new Response(body, { status, statusText, headers: new Headers(response.headers) })` — this is the established way the codebase rebuilds responses. The Keystatic-rebuilt Response must also carry the security headers; ordering in `sequence()` matters (securityHeaders first means it sets headers on whatever keystaticEnhancements returns, since first-in-sequence wraps outermost — verify direction in plan).

**CSP nuance:** CONTEXT.md requires a "looser policy for `/keystatic`" — the security-headers middleware must branch on `context.url.pathname.startsWith('/keystatic')`, the exact path test used at line 89.

---

### `src/lib/security-headers.ts` (config constant module — NEW)

**Analog:** `src/i18n/ui.ts` — the repo's only pure constant module. `src/lib/` does not exist yet; create it (tsconfig alias `@/` → `src/` already covers `@/lib/...`).

**Named-export `as const` pattern** (`src/i18n/ui.ts` lines 1–9):

```typescript
export const languages = {
  de: 'Deutsch',
  en: 'English',
} as const;

export const defaultLang = 'de' as const;
export const showDefaultLang = false;

export type Lang = keyof typeof languages;
```

Apply the same shape: `export const SECURITY_HEADERS = { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', ... } as const;` plus separate exports for the CSP-Report-Only value (and the looser Keystatic variant). Named exports only — no default exports anywhere in this codebase (see `src/i18n/utils.ts`, `src/scripts/gsap-animations.ts`).

**HSTS value (locked decision):** `max-age=31536000; includeSubDomains` — no `preload`.

**CSP allowlist evidence found in codebase** (for Claude's-discretion directive values):

| Evidence | Location | CSP implication |
|----------|----------|-----------------|
| `<form action={`https://formspree.io/f/${formspreeId}`} method="POST">` | `src/pages/kontakt/index.astro:160` (and EN twin) | `form-action https://formspree.io` |
| Instagram appears only as `<a href>` links | `src/pages/kontakt/index.astro:141`, `Footer.astro`, `spenden.astro`, `en/donate.astro` | Plain links need NO CSP allowance — verify whether an actual embed (iframe/script) exists before adding instagram domains; my grep found none |
| Keystatic saves via `fetch` to `api.github.com` PUT | `src/middleware.ts:46` | `connect-src https://api.github.com` (keystatic-scoped) |
| Injected inline `<script>` on /keystatic | `src/middleware.ts:6` | `'unsafe-inline'` (or hash) in keystatic script-src |
| GSAP init `<script>` in Base.astro (line 106) and `<script>` in `spenden.astro:413` | bundled by Astro (not `is:inline`) | served from `'self'` /assets — no unsafe-inline needed for these unless `is:inline` is used somewhere; grep `is:inline` during planning |
| `report-uri /api/csp-report` | locked decision | both CSP variants |

---

### `public/_headers` (Cloudflare Pages header file — NEW)

**Analog:** none — no `_headers` or `_redirects` file exists in `public/`. Format is Cloudflare-defined, not codebase-defined.

**Critical repo-specific facts:**
- `astro.config.mjs:62–64` sets `build: { assets: 'assets' }` — hashed build assets live under `/assets/*` (NOT Astro's default `/_astro/*`). The immutable cache rule targets `/assets/*`.
- Prerendered routes that middleware never touches on Cloudflare: `/blog/*` and `/en/blog/*` (from `export const prerender = true` in `src/pages/blog/[...slug].astro:12` and `src/pages/en/blog/[...slug].astro:9`).
- `public/_headers` is copied verbatim into `dist/` by both build modes; GitHub Pages ignores it harmlessly.
- Parity mechanism is Claude's discretion: either generate `_headers` from `src/lib/security-headers.ts` via a build script, or check it in + add a parity test. Note: no test infrastructure exists yet (Playwright is Phase 3), and `package.json` scripts are flat `astro` invocations — a `node` prebuild script would be a new pattern. Simplest consistent option: small `scripts/*.mjs` generator (repo already has `scripts/brand-qa.mjs`, `scripts/cms-qa.mjs` as .mjs node scripts).

Skeleton (Cloudflare format):

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: <deny-by-default set>
  Content-Security-Policy-Report-Only: <same value as middleware>

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/keystatic/*
  ! Content-Security-Policy-Report-Only
  Content-Security-Policy-Report-Only: <looser keystatic value>

/fonts/*
  Cache-Control: public, max-age=31536000, immutable
```

(`/fonts/*` immutable is safe only if filenames are versioned or never change in place — flag for planner decision; `public/fonts` files are unhashed.)

---

### `src/pages/api/csp-report.ts` (API route, POST request-response — NEW)

**Analog:** partial — no API routes exist in the repo (`src/pages/api/` does not exist). Compose from two existing patterns:

**Prerender opt-out export pattern** (`src/pages/blog/[...slug].astro:12`, the repo's only prerender flags):

```typescript
export const prerender = true;   // blog uses true; csp-report inverts to false
```

→ in the new file: `export const prerender = false;`

**Response construction pattern** (`src/middleware.ts:107–111`):

```typescript
return new Response(modifiedHtml, {
  status: response.status,
  statusText: response.statusText,
  headers: new Headers(response.headers),
});
```

**Target shape** (Astro APIRoute, standard Astro 5 typing — no repo precedent, keep minimal):

```typescript
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // accept application/csp-report and application/json; never throw
  return new Response(null, { status: 204 });
};
```

**Static-build constraint** (`astro.config.mjs:38`): when `GITHUB_PAGES=true` the output is `static` and `prerender = false` routes are not supported — Astro 5 errors on server endpoints in static output. The dual-build requirement (`npm run build` AND `GITHUB_PAGES=true npm run build` both green) means the planner must verify the static build tolerates this file; if it fails, gate the file or accept GitHub Pages losing the sink (it has no CSP header source anyway since `_headers` is Cloudflare-only). This is the highest-risk unknown in the phase — verify with an actual `GITHUB_PAGES=true npm run build` early.

**Logging convention** (from CONVENTIONS): no logging in SSR routes/middleware; if logging reports, follow `console.error('Failed to copy:', err)` style sparingly. Cloudflare Workers `console.*` goes to the dashboard tail.

---

### `src/layouts/Base.astro` (layout — MODIFY: fonts)

**Analog:** itself.

**Code to REMOVE** (lines 76–82):

```html
<!-- Preload critical assets -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap"
/>
```

**Base-prefixed asset href pattern to COPY for preloads** (lines 32 + 73–74):

```astro
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---
<link rel="icon" type="image/svg+xml" href={`${base}/favicon.svg`} />
<link rel="apple-touch-icon" href={`${base}/apple-touch-icon.png`} />
```

→ font preloads MUST use the same pattern or they 404 on GitHub Pages:

```astro
<link rel="preload" href={`${base}/fonts/Fredoka-SemiBold.woff2`} as="font" type="font/woff2" crossorigin />
<link rel="preload" href={`${base}/fonts/Poppins-Regular.woff2`} as="font" type="font/woff2" crossorigin />
```

(Preload only above-the-fold-critical weights; preloading all 5 wastes bandwidth.)

**Caution:** `@font-face` `url()` in `global.css` cannot use `import.meta.env.BASE_URL` (plain CSS). Use relative-from-root `url('/fonts/...')` — this breaks on GitHub Pages base `/evolea-website`. Options for planner: (a) define `@font-face` in Base.astro's frontmatter-aware `<style is:global>` block won't interpolate either; (b) put `@font-face` in `global.css` with `url('/fonts/...')` and accept GitHub Pages falling back to system fonts (fallback site only); (c) Vite-process fonts by importing from `src/`. Document the chosen tradeoff — dual build green is the hard requirement, visual parity is required on production (Cloudflare, base `/`) only.

---

### `src/styles/global.css` (stylesheet — MODIFY: @font-face)

**Analog:** itself. No `@font-face` exists yet (greps confirm); declarations go ABOVE/inside the existing structure.

**File structure** (lines 1–15) — Tailwind directives first, then `@layer base`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ============================================================
       EVOLEA brand tokens — aligned with brand spec v2.6 (April 2026)
       ...
       SYNC RULE: hex values here are duplicated as literals in
       tailwind.config.mjs ...
       ============================================================ */
```

**Conventions to copy:** `/* ===== SECTION NAME ===== */` banner comments; explanatory sync-rule comments for cross-file coupling. Add a banner like `/* ===== SELF-HOSTED FONTS (Fredoka / Poppins) ===== */` with a comment noting source `design-system-assets/fonts/` and the Poppins-700 gap. `@font-face` must sit OUTSIDE `@layer` or in `@layer base` top — Tailwind 3 convention is inside `@layer base`.

**Font family names must match `tailwind.config.mjs:65–68` exactly:**

```js
fontFamily: {
  sans: ['Poppins', 'system-ui', 'sans-serif'],
  display: ['Fredoka', 'Poppins', 'system-ui', 'sans-serif'],
},
```

→ `font-family: 'Fredoka'` and `font-family: 'Poppins'` in `@font-face` (exact strings).

**@font-face template** (one per file; `font-display: swap` matches the removed Google Fonts `display=swap`):

```css
@font-face {
  font-family: 'Fredoka';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/Fredoka-SemiBold.woff2') format('woff2');
}
```

**Weight map** (from `design-system-assets/fonts/` actual contents):

| File | family | weight |
|------|--------|--------|
| `Fredoka-SemiBold.woff2` | Fredoka | 600 |
| `Fredoka-Bold.woff2` | Fredoka | 700 |
| `Poppins-Regular.woff2` | Poppins | 400 |
| `Poppins-Medium.woff2` | Poppins | 500 |
| `Poppins-SemiBold.woff2` | Poppins | 600 |
| `Poppins-SemiBold.woff2` | Poppins | **700** (gap mitigation — declare SemiBold at weight 700 so Tailwind `font-bold` doesn't trigger faux-bold synthesis) |

---

### `public/fonts/` (static assets — NEW, copy)

**Source:** `design-system-assets/fonts/` (5 woff2 files + README.md — copy the woff2 only, not README). Public assets are committed directly under `public/` (analog: `public/images/`, `public/favicon.svg`). No build step touches `public/` — files are copied verbatim to `dist/`.

---

### `src/pages/angebote/tagesschule/index.astro` + `src/pages/en/programs/day-school/index.astro` (page wrappers — MODIFY: hero path)

**Analog:** themselves; the two files are intentionally near-identical (program-page byte-identical-wrapper pattern).

**Exact line to change in BOTH files** (lines 18–20, identical in both):

```typescript
const heroImage = siteImages?.programmeHeroes?.tagesschule
  ? base + siteImages.programmeHeroes.tagesschule
  : base + "/images/generated/tagesschule-hero.png";
```

→ change fallback to `base + "/images/programs/tagesschule-hero.png"` after moving the file. Note the CMS override path (`siteImages.programmeHeroes.tagesschule` in `src/content/settings/images.json`) — check whether that JSON also points at `/images/generated/` and update it too if so.

**Order of operations (locked):** move file to `public/images/programs/` → update DE+EN references (+ settings/images.json if needed) → `git rm -r --cached public/images/generated/`.

---

## Deletion Verification (grep evidence, 2026-06-12)

| Target | Evidence | Verdict |
|--------|----------|---------|
| `src/components/AngeboteSection.astro` | Only matches are its own docblock; no imports anywhere in `src/` | safe to delete |
| `src/components/TimelineActivities.astro` | Only matches are its own docblock | safe to delete |
| `src/components/ProgramCardEnhanced.astro` | Zero matches anywhere | safe to delete |
| `public/images/Final images/` (7.2MB) | Zero references in `src/` or `public/` (incl. content JSONs) | safe to delete |
| Logo originals: `Evolea Logo.png`, `Evolea New Logo.png`, `evolea-logo-original.png`, `evolea-logo.png` | 0 refs each (in-use: `evolea-logo-new.png` 3 refs, `evolea-logo-circle.png` 1 ref, both butterfly SVGs 1 ref each — KEEP those) | safe to delete the 4 unreferenced |
| `public/images/generated/` (82MB, 26 tracked files) | Only reference is `tagesschule-hero.png` in the two tagesschule pages (moved first) | `git rm -r --cached` after move; already gitignored |

## Shared Patterns

### BASE_URL prefix (dual-build asset paths)
**Source:** `src/layouts/Base.astro:32`, repeated in every page file (e.g. `tagesschule/index.astro:9`)
**Apply to:** font preloads in Base.astro, tagesschule hero fallback, any new asset href
```typescript
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
// usage: `${base}/fonts/...`, base + "/images/programs/..."
```

### Dual-build verification gate
**Source:** `astro.config.mjs:7–38` (GITHUB_PAGES switch), `package.json` scripts (`build` = `astro check && astro build`; `build:cloudflare` installs the adapter first)
**Apply to:** every plan in this phase — both `npm run build` and `GITHUB_PAGES=true npm run build` must pass. The pre-commit hook runs `npm run build` (TypeScript strict gate); `astro check` will fail on unused imports/`any` in new TS files.

### Prerender flag
**Source:** `src/pages/blog/[...slug].astro:12` (`export const prerender = true`)
**Apply to:** `src/pages/api/csp-report.ts` (`= false`). These blog routes are also the mandated `curl -I` parity-check target for `_headers` (prerendered = middleware never runs on Cloudflare).

### Named-export constant modules, no defaults
**Source:** `src/i18n/ui.ts`, `src/i18n/utils.ts`, `src/scripts/gsap-animations.ts`
**Apply to:** `src/lib/security-headers.ts` — named exports, `as const`, camelCase/SCREAMING_CASE constants, path-alias imports (`@/lib/security-headers`).

### Silent-safe error handling in middleware
**Source:** `src/middleware.ts:98–117` (try/catch returns original response, no logging)
**Apply to:** both new middleware functions and the CSP report endpoint — never let header/injection/report failures break a page response.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `public/_headers` | config | n/a | No Cloudflare header/redirect files exist; format is platform-defined (skeleton above) |
| `src/pages/api/csp-report.ts` | API route | POST request-response | No API routes in repo; composed from prerender-flag + Response-construction patterns (above) |
| `sequence()` middleware composition | middleware | request-response | Current middleware is monolithic single-`onRequest`; `sequence()` is new to the repo (Astro 5 API, shape above) |

## Metadata

**Analog search scope:** `src/middleware.ts`, `src/layouts/`, `src/styles/`, `src/pages/` (incl. blog slugs, kontakt, spenden, tagesschule DE+EN), `src/i18n/`, `src/components/`, `astro.config.mjs`, `tailwind.config.mjs`, `wrangler.toml`, `package.json`, `public/images/`, `design-system-assets/fonts/`
**Files scanned:** ~25 read/grepped
**Pattern extraction date:** 2026-06-12
