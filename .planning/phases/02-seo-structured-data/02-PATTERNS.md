# Phase 2: SEO & Structured Data - Pattern Map

**Mapped:** 2026-06-12
**Files analyzed:** 14 (3 new, 11 modified)
**Analogs found:** 13 / 14 (only the `nextCafeDate()` date computation has no codebase precedent)

## File Classification

| New/Modified File | Change | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|--------|------|-----------|----------------|---------------|
| `src/middleware.ts` (trailingSlash member) | MODIFIED | middleware | request-response | `securityHeaders` member in same file | exact |
| `src/pages/robots.txt.ts` | NEW | route/endpoint | request-response | `src/pages/api/csp-report.ts` | exact |
| `src/lib/seo.ts` | NEW | utility/constants | transform | `src/lib/security-headers.ts` | role-match |
| `src/components/JsonLd.astro` | NEW | component | transform | `src/components/FontFaces.astro` | exact |
| `src/layouts/Base.astro` (head fixes + @graph) | MODIFIED | layout | request-response | itself (existing head block) | exact |
| `astro.config.mjs` (redirect + sitemap filter) | MODIFIED | config | batch | itself (existing cafe redirect + vite.define) | exact |
| `src/components/InnerPageHero.astro` (BreadcrumbList) | MODIFIED | component | transform | itself (existing breadcrumbs prop + nav) | exact |
| `src/components/programs/*.astro` (7 files: Breadcrumb + Service JSON-LD) | MODIFIED | component | transform | `src/components/programs/MiniGartenPage.astro` | exact |
| `src/components/CafePage.astro` (Event JSON-LD) | MODIFIED | component | transform | `MiniGartenPage.astro` (props/getText) — NOTE: CafePage has NO inline breadcrumb nav | role-match |
| `src/pages/blog/[...slug].astro` + `src/pages/en/blog/[...slug].astro` (BlogPosting, ogType) | MODIFIED | route | request-response | itself (frontmatter already computes `pubDate`, passes Base props) | exact |
| `src/pages/index.astro` + `src/pages/en/index.astro` (titles) | MODIFIED | route | request-response | `src/pages/angebote/index.astro` (title prop pattern) | exact |
| `src/pages/angebote/index.astro` + program wrappers (titles) | MODIFIED | route | request-response | itself | exact |
| `public/_headers` (optional X-Robots-Tag blocks) | MODIFIED | config | batch | itself + `scripts/gen-headers.mjs` parity gate | exact |

## Pattern Assignments

### `src/middleware.ts` — new `trailingSlash` member (middleware, request-response)

**Analog:** the existing `securityHeaders` member in the same file.

**Member definition pattern** (`src/middleware.ts` lines 90-110) — comment block above, `defineMiddleware`, destructure `context.url`, silent-safe try/catch:
```typescript
// Security headers middleware: applies the SECURITY_HEADERS constant to every
// response and sets Content-Security-Policy-Report-Only (looser variant under
// /keystatic). Silent-safe: header failures never break a page response.
const securityHeaders = defineMiddleware(async (context, next) => {
  const response = await next();
  try {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value);
    }
    const { pathname } = context.url;
    const isKeystatic = pathname === '/keystatic' || pathname.startsWith('/keystatic/');
    ...
  } catch {
    // If header mutation fails, return the response untouched — never break a page.
    return response;
  }
  return response;
});
```

**Path-exemption pattern** (lines 100-102 and 120-122) — exact-or-slash match, copy for the new middleware's `/keystatic` exemption:
```typescript
const isKeystatic = pathname === '/keystatic' || pathname.startsWith('/keystatic/');
```

**Sequence registration + ordering comment** (lines 1, 157-159):
```typescript
import { defineMiddleware, sequence } from 'astro:middleware';
// ...
// securityHeaders runs first in the sequence so it wraps outermost (applies its
// headers on the way out, after keystaticEnhancements has rebuilt the Response).
export const onRequest = sequence(securityHeaders, keystaticEnhancements);
```
New order per RESEARCH Pattern 1: `sequence(trailingSlash, securityHeaders, keystaticEnhancements)`. Update the ordering comment — `trailingSlash` short-circuits with a 301 BEFORE `securityHeaders` runs, so redirect responses won't carry the security headers (acceptable: 301s have no body; if the planner wants headers on redirects, place it after `securityHeaders` returns — but the roadmap design is first-in-sequence). The trailingSlash member differs from `securityHeaders` in one structural way: it returns `context.redirect(...)` INSTEAD of calling `next()` (short-circuit), whereas all existing members are post-processing (`await next()` first). The complete redirect logic is given in RESEARCH Pattern 1 including the `//`-collapse open-redirect guard — copy it verbatim.

Imports already in file (line 2-6) show the `@/lib/...` alias convention for pulling constants:
```typescript
import { SECURITY_HEADERS, CSP_REPORT_ONLY, CSP_REPORT_ONLY_KEYSTATIC } from '@/lib/security-headers';
```
If the middleware needs `PROD_HOST` or noindex constants, import them from `@/lib/seo` the same way.

---

### `src/pages/robots.txt.ts` (route/endpoint, request-response)

**Analog:** `src/pages/api/csp-report.ts` — the proven `__SSR_BUILD__` dual-build endpoint.

**Prerender flag pattern** (`src/pages/api/csp-report.ts` lines 1-16) — copy this header block structure including the explanatory comment style:
```typescript
import type { APIRoute } from 'astro';

// __SSR_BUILD__ is injected by astro.config.mjs (Vite `define`): true only when
// the Cloudflare adapter is active (output: 'server'). In static builds
// (GitHub Pages, or adapter-absent local) it is false.
declare const __SSR_BUILD__: boolean;

export const prerender = !__SSR_BUILD__;
```

**Handler signature + Response construction** (lines 66, 102, 107):
```typescript
export const POST: APIRoute = async ({ request }) => { ... return new Response(null, { status: 204 }); };
export const GET: APIRoute = async () => new Response(null, { status: 204 });
```
robots.txt destructures `{ url, site }` from the APIRoute context instead of `{ request }`, and returns `text/plain` with an explicit `Content-Type` header. Full endpoint body is in RESEARCH Pattern 2 — it is already written in this repo's style (default-deny exact-hostname compare). One difference from the analog: csp-report's static-build prerender emits NO file (empty 204 body); robots.txt's prerender DOES emit a file (the `Disallow: /` deny variant) because the body is non-empty — that is the intended behavior.

---

### `src/lib/seo.ts` (utility/constants module, transform)

**Analog:** `src/lib/security-headers.ts` — the single-source-of-truth constants module created in Phase 1.

**File-header documentation pattern** (`src/lib/security-headers.ts` lines 1-24) — banner comment naming every consumer of the module:
```typescript
/* ============================================================
   EVOLEA security headers — SINGLE SOURCE OF TRUTH
   ------------------------------------------------------------
   These values are consumed by BOTH emission paths:
     1. src/middleware.ts        — sets them on every SSR response ...
     2. public/_headers          — Cloudflare-native config for static ...
   ============================================================ */
```
seo.ts should open with the same style, listing its consumers: `Base.astro` (siteGraph, canonical), blog templates (blogPostingSchema), `InnerPageHero.astro` + program components (breadcrumbSchema), program wrappers (serviceSchema), `CafePage`/cafe wrappers (cafeEventSchema, nextCafeDate), `robots.txt.ts`/middleware (PROD_HOST if shared).

**Typed `as const` export pattern** (lines 26-34):
```typescript
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  ...
} as const;

export type SecurityHeaderName = keyof typeof SECURITY_HEADERS;
```
Named exports only, no default export — matches `src/i18n/utils.ts` module convention too. Builder-function bodies (ORG_ID/WEBSITE_ID, siteGraph, breadcrumbSchema, serviceSchema, cafeEventSchema) are specified in RESEARCH Patterns 4 + Code Examples.

**JSDoc-per-export pattern** (lines 36-40):
```typescript
/**
 * Site-wide Content-Security-Policy-Report-Only value.
 * Report-Only means it never blocks resources — ...
 */
export const CSP_REPORT_ONLY = ...
```

---

### `src/components/JsonLd.astro` (component, transform)

**Analog:** `src/components/FontFaces.astro` — the repo's only "compute string in frontmatter, emit via `is:inline set:html`" component.

**Component structure** (`src/components/FontFaces.astro` lines 1-17, 66-68):
```astro
---
/**
 * FontFaces.astro
 *
 * Emits the self-hosted font-face declarations for the EVOLEA brand fonts.
 * ... built here from a template literal and injected with set:html, the same
 * dual-build-safe pattern Base.astro already uses for icon hrefs.
 */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const fontFaceCss = `...`;
---
<style is:inline set:html={fontFaceCss}></style>
```
JsonLd.astro follows exactly this shape: docblock, frontmatter computation, single `is:inline set:html` element. Two repo conventions to apply that FontFaces doesn't need: an `interface Props` at the top of frontmatter (mandatory per repo convention — FontFaces takes no props) and the `<` escape from RESEARCH Pattern 3:
```astro
---
interface Props {
  schema: Record<string, unknown>;
}
const { schema } = Astro.props;
const json = JSON.stringify(schema).replace(/</g, '\\u003c');
---
<script type="application/ld+json" is:inline set:html={json} />
```

---

### `src/layouts/Base.astro` (layout, request-response) — head fixes + site-wide @graph

**Analog:** itself — every line being changed already exists; this is surgical edits to a 148-line file.

**Current canonical computation** (`src/layouts/Base.astro` lines 30-36) — the lines to modify:
```typescript
const lang = getLangFromUrl(Astro.url);
const alternates = getLanguageAlternates(Astro.url);
const canonicalURL = new URL(Astro.url.pathname, Astro.site);   // ← replace per RESEARCH Pattern 5 (slash-normalize)
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
// OG/Twitter image must honor the configured base path (e.g. /evolea-website
// on GitHub Pages) — same base-URL invariant as fonts/favicons below.
const ogImage = new URL(`${base}${image}`, Astro.site);
```

**Props interface to extend** (lines 11-25) — add `ogType?: 'website' | 'article'` with default in the destructure, matching existing style:
```typescript
interface Props {
  title: string;
  description?: string;
  image?: string;
  transparentHeader?: boolean;
  hideFooterCTA?: boolean;
}
const { title, description = '...', image = '/images/og-default.jpg', transparentHeader = false, hideFooterCTA = false } = Astro.props;
```

**Title suffix — FOUR emission points to change `| EVOLEA` → `– EVOLEA`** (lines 47-48, 64, 72):
```astro
<title>{title} | EVOLEA</title>
<meta name="title" content={`${title} | EVOLEA`} />
...
<meta property="og:title" content={`${title} | EVOLEA`} />
...
<meta property="twitter:title" content={`${title} | EVOLEA`} />
```

**og:url / twitter:url — switch from `{Astro.url}` to `{canonicalURL}`** (lines 62-63, 70-71):
```astro
<meta property="og:type" content="website" />          <!-- becomes content={ogType} -->
<meta property="og:url" content={Astro.url} />          <!-- becomes content={canonicalURL} -->
...
<meta property="twitter:url" content={Astro.url} />     <!-- becomes content={canonicalURL} -->
```

**Where `<link rel="sitemap">` goes** — next to the canonical block (lines 54-59), using the `${base}` prefix pattern from the favicon lines (77-78):
```astro
<link rel="icon" type="image/svg+xml" href={`${base}/favicon.svg`} />
```

**siteSettings already loaded** (lines 27-28) — pass to `siteGraph()` per RESEARCH Pattern 4:
```typescript
const siteSettingsEntry = await getEntry('settings', 'site');
const siteSettings = siteSettingsEntry?.data;
```

**Component import convention** (lines 4-7) for adding `import JsonLd from '@components/JsonLd.astro';`:
```typescript
import Header from '@components/Header.astro';
import Footer from '@components/Footer.astro';
```

---

### `astro.config.mjs` (config, batch) — `/sitemap.xml` redirect + sitemap filter

**Analog:** itself.

**Redirect pattern with base-path handling** (`astro.config.mjs` lines 40-44) — copy this exact shape for `/sitemap.xml`:
```javascript
redirects: {
  // The EN cafe page moved under /en/programs/ to match the other program routes.
  // The target must carry the base path explicitly — Astro does not prefix redirect targets.
  '/en/angebote/evolea-cafe/': `${isGitHubPages || !useCloudflare ? '/evolea-website' : ''}/en/programs/evolea-cafe/`,
},
```

**Sitemap integration to extend with a filter** (line 46):
```javascript
integrations: [
  sitemap(),   // becomes sitemap({ filter: (page) => !page.includes('/brand/') }) — confirm A5 first
  ...
```

**`__SSR_BUILD__` define already in place** (lines 70-80) — robots.txt.ts consumes it with zero config changes:
```javascript
vite: {
  define: {
    'process.env.KEYSTATIC_GITHUB_CLIENT_ID': JSON.stringify(process.env.KEYSTATIC_GITHUB_CLIENT_ID),
    '__SSR_BUILD__': JSON.stringify(useCloudflare),
  },
},
```

---

### `src/components/InnerPageHero.astro` (component, transform) — BreadcrumbList emission

**Analog:** itself — the breadcrumbs data structure is already typed and rendered.

**Existing `BreadcrumbItem` shape** (lines 17-30) — `breadcrumbSchema()` in seo.ts must accept exactly this shape (`label` + optional `href`; current page omits `href`):
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
}
interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  ...
}
```

**Visible breadcrumb render to match** (lines 80-93; duplicated at 122-135 for the no-image layout — emit ONE JsonLd, not two):
```astro
<nav class="hero-breadcrumb hero-breadcrumb-left" aria-label="Breadcrumb">
  {breadcrumbs.map((item, index) => (
    <>
      {item.href ? (
        <a href={item.href} class="breadcrumb-link">{item.label}</a>
      ) : (
        <span class="breadcrumb-current">{item.label}</span>
      )}
      ...
```
The `href` values passed in by consumers are already `translatePath()`-resolved relative paths (see `AngeboteIndexPage.astro` line 81: `{ label: ..., href: translatePath('/') }`) — `breadcrumbSchema` absolutizes them with `new URL(href, Astro.site)`, which is why it takes `site` as a parameter (Pitfall 7: do NOT prepend `${base}` again; translatePath output already carries the base).

**Consumers covered by this one edit** (verified by grep): `spenden.astro`, `ueber-uns/index.astro`, `kontakt/index.astro`, `blog/index.astro`, `team/index.astro`, `en/donate.astro`, `en/contact/index.astro`, `en/about/index.astro`, `en/blog/index.astro`, `en/team/index.astro`, plus `AngeboteIndexPage.astro` (the angebote index body component).

---

### `src/components/programs/*.astro` (7 files, component, transform) — Breadcrumb + Service JSON-LD

Files (all verified to contain the inline breadcrumb nav): `MiniGartenPage.astro`, `MiniProjektePage.astro`, `MiniTurnenPage.astro`, `MiniAbenteuercampPage.astro`, `MiniMuseumPage.astro`, `MiniRestaurantPage.astro`, `TagesschulePage.astro`. (`AngeboteIndexPage.astro` uses InnerPageHero instead — covered above.)

**Analog:** `src/components/programs/MiniGartenPage.astro` (the canonical program body component).

**Props + getText convention** (lines 1-17) — untyped CMS props (`z.any()` known gap), inline bilingual helper:
```typescript
import FloatingShapes from '@components/FloatingShapes.astro';
import Icon from '@components/Icon.astro';

const { content, lang, translatePath, heroImage } = Astro.props;

// Helper to get bilingual text
const getText = (obj: { de?: string; en?: string } | undefined, fallback: string = '') => {
  if (!obj) return fallback;
  return lang === 'de' ? (obj.de || fallback) : (obj.en || obj.de || fallback);
};
```
Note: these components do NOT receive `Astro.site` indirection problems — `Astro.site` and `Astro.url` are available inside any component. Canonical/site URLs for the Service schema can be computed inline the same way Base does.

**The visible inline breadcrumb nav the JSON-LD must mirror** (lines 35-41 in MiniGartenPage; line numbers vary slightly per file — `MiniProjektePage` 56, `MiniTurnenPage` 38, `MiniAbenteuercampPage` 57, `MiniMuseumPage` 57, `MiniRestaurantPage` 100, `TagesschulePage` 34):
```astro
<nav class="mb-8 text-sm text-evolea-text-light">
  <a href={translatePath('/')} class="hover:text-evolea-purple transition-colors">{lang === 'de' ? 'Startseite' : 'Home'}</a>
  <span class="mx-2">/</span>
  <a href={translatePath('/angebote/')} class="hover:text-evolea-purple transition-colors">{lang === 'de' ? 'Angebote' : 'Programs'}</a>
  <span class="mx-2">/</span>
  <span class="text-evolea-purple font-medium">{hero.titel || 'Mini Garten'}</span>
</nav>
```
SEO-06 requires the BreadcrumbList items to match these exact labels/links — build the items array from the same expressions (`translatePath('/')`, `lang === 'de' ? 'Startseite' : 'Home'`, `hero.titel || '<fallback>'`), then render `<JsonLd schema={breadcrumbSchema(items, Astro.site)} />` adjacent to the nav. Body placement of JSON-LD is valid per RESEARCH.

Service schema (RESEARCH Code Examples) goes in the same components; `provider: { '@id': ORG_ID }` resolves against the @graph Base emits in `<head>` of the same page.

---

### `src/components/CafePage.astro` (component, transform) — Event JSON-LD

**Analog:** `MiniGartenPage.astro` for props/getText (CafePage uses the identical `{ content, lang, translatePath, heroImage }` props + `getText`/`getArray` helpers, lines 1-30).

**IMPORTANT divergence:** CafePage has NO inline breadcrumb nav (verified — its hero is a custom `<section class="cafe-hero">` at line 37 with no `<nav>`). Do not emit a BreadcrumbList from CafePage unless a visible breadcrumb is also added — SEO-06 mandates markup matches visible breadcrumbs. The Event JSON-LD (RESEARCH Code Examples, with the user-checkpoint on venue address) goes in CafePage or its two thin wrappers (`src/pages/angebote/evolea-cafe/index.astro`, `src/pages/en/programs/evolea-cafe/index.astro`).

**CMS schedule data access** (line 30): `const scheduleDates = getArray(schedule.daten);` — the stale Jan–Mar 2025 dates live here; `nextCafeDate()` in seo.ts computes the next occurrence instead (Pitfall 6).

---

### `src/pages/blog/[...slug].astro` + `src/pages/en/blog/[...slug].astro` (route, request-response) — BlogPosting + ogType

**Analog:** itself — all inputs the schema needs are already computed in frontmatter.

**Existing date guard to reuse** (`src/pages/blog/[...slug].astro` lines 40-43):
```typescript
const tags = Array.isArray(post.data.tags) ? post.data.tags : [];
const pubDate =
  post.data.pubDate instanceof Date ? post.data.pubDate : new Date(post.data.pubDate);
const hasValidPubDate = !Number.isNaN(pubDate.getTime());
```
Gate `datePublished` on `hasValidPubDate` the same way the visible `<time>` element is gated (lines 88-95).

**Base invocation to extend with `ogType="article"`** (line 63):
```astro
<Base title={post.data.title} description={post.data.description}>
```

**Base-prefix pattern for the image URL** (line 10 + RESEARCH BlogPosting example):
```typescript
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
// image: new URL(`${base}${post.data.image}`, Astro.site).href
```

**Prerender note** (line 12): `export const prerender = true;` — these pages are static even on Cloudflare, so the JSON-LD and og:type are baked at build time; the trailing-slash middleware never sees these routes (platform 308s them, Pitfall 2).

The blog detail hero also contains an inline breadcrumb nav (lines 68-74, same shape as program components) — if the planner extends SEO-06 to blog posts, the same breadcrumbSchema pattern applies; otherwise BlogPosting alone satisfies SEO-05.

---

### Title changes — `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/angebote/index.astro`, program wrappers (route, request-response)

**Analog:** `src/pages/angebote/index.astro` — the cleanest example of a computed, CMS-backed, bilingual title prop.

**Current keyword-less homepage titles** (the bug SEO-09 fixes): `src/pages/index.astro` line 71 `title="Startseite"`; `src/pages/en/index.astro` line 71 `title="Home"`.

**Title prop pattern to copy** (`src/pages/angebote/index.astro` lines 25-31):
```typescript
const pageTitle = getText(page?.hero?.titel, lang === 'de' ? 'Angebote' : 'Programs');
const pageDescription = lang === 'de'
  ? 'EVOLEA bietet verschiedene Förderprogramme für Kinder im Autismus Spektrum oder mit ADHS an: ...'
  : 'EVOLEA offers a range of support programs for children on the autism spectrum or with ADHD: ...';
---
<Base title={pageTitle} description={pageDescription} transparentHeader={true}>
```
Note `getText(page?.hero?.titel, ...)`: CMS values override the hardcoded fallback. For keyword titles, either change the FALLBACK only (CMS empty today → fallback shows) or decouple the `<title>` from `hero.titel` — the planner must decide; if CMS `hero.titel` is populated it wins over any new fallback. Keyword strings themselves are an Open Question (RESEARCH §Open Questions 2) pending user lock. Remember Base auto-appends `– EVOLEA` (after the separator change) — audit for embedded separators (Pitfall 9, cafe fallback title contains `|`).

---

### `public/_headers` (config, batch) — optional host-scoped X-Robots-Tag

**Analog:** itself — current structure is per-path-pattern blocks (16 lines):
```
/*  ← implicit site-wide block (lines 1-7: security headers + CSP)
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/keystatic/*
  Content-Security-Policy-Report-Only: ...
```

**Hard constraint:** `scripts/gen-headers.mjs` (runs in `npm run build`) asserts TWO-WAY parity per path-pattern block against `src/lib/security-headers.ts` — including "`/*` carries no security header that is absent from the constant" (gen-headers.mjs lines 1-21). The new host-scoped blocks (`https://:project.pages.dev/*`) use a URL-pattern syntax the checker's block parser has never seen — any plan touching `_headers` MUST run `node scripts/gen-headers.mjs` locally and likely extend the checker to tolerate (or assert) host-scoped blocks (Pitfall 5).

---

## Shared Patterns

### `__SSR_BUILD__` dual-build switch
**Source:** `astro.config.mjs` lines 70-80 (define) + `src/pages/api/csp-report.ts` lines 1-16 (consumption)
**Apply to:** `robots.txt.ts` (prerender flip), Base.astro noindex meta on static builds (Pitfall 4)
```typescript
declare const __SSR_BUILD__: boolean;
export const prerender = !__SSR_BUILD__;
```

### Base-URL invariant for absolute URLs
**Source:** `src/layouts/Base.astro` lines 33-36
**Apply to:** every JSON-LD `image`/`logo`/breadcrumb `item` URL; never double-prefix (Pitfall 7)
```typescript
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const ogImage = new URL(`${base}${image}`, Astro.site);
```
Exception: `ORG_ID`/`WEBSITE_ID` are pinned to `https://www.evolea.ch` literals regardless of build (stable identity).

### Inline bilingual `getText` helper
**Source:** `src/components/programs/MiniGartenPage.astro` lines 8-11 (duplicated per component — known anti-pattern, follow it anyway for consistency)
```typescript
const getText = (obj: { de?: string; en?: string } | undefined, fallback: string = '') => {
  if (!obj) return fallback;
  return lang === 'de' ? (obj.de || fallback) : (obj.en || obj.de || fallback);
};
```

### Silent-safe middleware (never break a page)
**Source:** `src/middleware.ts` lines 93-110 and 151-154
**Apply to:** any new middleware member — wrap mutations in try/catch, return the untouched response on failure, never call `next()` twice.

### Single-source constant + parity checker
**Source:** `src/lib/security-headers.ts` (banner doc listing consumers) + `scripts/gen-headers.mjs` (build-time gate)
**Apply to:** `src/lib/seo.ts` structure; `_headers` edits must keep the checker green.

### Thin wrapper + shared body component (DE/EN parity)
**Source:** `src/pages/angebote/index.astro` (33-line wrapper) → `AngeboteIndexPage.astro` body
**Apply to:** all program-page changes — edit the SHARED component once, both DE and EN routes pick it up; title/description props stay in the wrappers (byte-identical DE/EN wrapper pairs).

### Exact-or-slash path matching
**Source:** `src/middleware.ts` lines 101, 121
```typescript
pathname === '/keystatic' || pathname.startsWith('/keystatic/')
```

## No Analog Found

| File / Logic | Role | Data Flow | Reason |
|--------------|------|-----------|--------|
| `nextCafeDate()` helper in `src/lib/seo.ts` | utility | transform | No date-computation logic exists anywhere in the codebase (only `toLocaleDateString` formatting in blog templates). "2nd Wednesday of month, 20:00 Europe/Zurich" recurrence must be written fresh — RESEARCH Pitfall 6 specifies the contract (returns e.g. `'2026-07-08T20:00:00+02:00'`); recurrence rule needs user confirmation (Assumption A1) |

## Metadata

**Analog search scope:** `src/middleware.ts`, `src/pages/` (api, blog, angebote, index, en twins), `src/lib/`, `src/layouts/`, `src/components/` (incl. `programs/`), `astro.config.mjs`, `public/_headers`, `scripts/gen-headers.mjs`
**Files scanned:** 18 read/grepped
**Pattern extraction date:** 2026-06-12
