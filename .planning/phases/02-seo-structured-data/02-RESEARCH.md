# Phase 2: SEO & Structured Data - Research

**Researched:** 2026-06-12
**Domain:** Astro 5 SSR (Cloudflare Pages) SEO — canonical URLs, robots/sitemap discovery, schema.org JSON-LD
**Confidence:** HIGH (most findings verified by live production probes + official docs)

## Summary

This phase is entirely config/template-level work on the existing stack — **zero new runtime dependencies are required** (one optional dev-only types package, `schema-dts`, verified legitimate). The work splits into five areas: (1) a trailing-slash 301 middleware added first in the existing `sequence()` (the architecture SEC-05 already anticipated); (2) a hostname-keyed `robots.txt.ts` SSR endpoint reusing the proven `__SSR_BUILD__` prerender pattern from `src/pages/api/csp-report.ts`, plus a `/sitemap.xml → /sitemap-index.xml` redirect via the already-proven `astro.config.mjs redirects` mechanism; (3) head corrections in `Base.astro` (trailing-slash-normalized `canonicalURL`, `og:url`/`twitter:url` from canonical, `og:type` prop, `<link rel="sitemap">`, title separator `–`); (4) JSON-LD via a small `JsonLd.astro` component — site-wide `NGO`+`WebSite` `@graph` from Base, `BlogPosting` in the two blog templates, `BreadcrumbList` from the two places visible breadcrumbs live (InnerPageHero + inline navs in program components), `Service` on program pages, one recurring `Event` on the cafe pages; (5) keyword-first titles on homepage and Angebote pages.

Live probes confirmed the exact bugs this phase fixes: `https://www.evolea.ch/angebote` (no slash) returns **200** with `canonical=https://www.evolea.ch/angebote` (duplicate content, two canonical forms); `robots.txt` and `/sitemap.xml` both 404; `*.pages.dev` staging serves indexable content. Prerendered blog routes are already platform-normalized (Cloudflare 308s `/blog/x` → `/blog/x/`), so the middleware only needs to cover SSR routes. Two material risks were resolved: Astro 5 docs now confirm `trailingSlash: 'always'` redirects on-demand pages in production, but it applies globally (would break the slash-less `/api/csp-report` CSP `report-uri` POST and Keystatic's injected `/api/keystatic/*` OAuth routes) — so **middleware with explicit exemptions is the recommended mechanism**, matching the roadmap's stated design. The EVOLEA Cafe venue is publicly "Genauer Ort auf Anfrage" (exact location on request); the org address (Germaniastrasse 55, 8006 Zürich) exists in `settings/site.json` but is unconfirmed as the venue — Google requires `location.address` for Event rich results, so this needs a user checkpoint, with a city-level `PostalAddress` as the validating fallback.

**Primary recommendation:** Implement trailing-slash enforcement as a new first-in-sequence middleware (not `trailingSlash: 'always'`), reuse the `__SSR_BUILD__` pattern for a hostname-keyed robots endpoint, and emit all JSON-LD through one escaped `JsonLd.astro` component with the Organization/WebSite `@graph` in Base so per-page schemas can reference the stable `@id`s.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Trailing-slash 301 (SSR routes) | Cloudflare worker (middleware, first in `sequence()`) | — | `_redirects` cannot add trailing slashes (documented self-loop gotcha in repo); platform doesn't normalize worker routes |
| Trailing-slash (prerendered/static) | Hosting platform | — | Cloudflare already 308s slashless static routes (verified live); GitHub Pages 301s directory indexes |
| `robots.txt` | SSR endpoint `src/pages/robots.txt.ts` (hostname-keyed) | Prerendered static file on `GITHUB_PAGES` build | Only SSR can distinguish `www.evolea.ch` from `*.pages.dev` at runtime |
| Staging de-indexing (defense-in-depth) | `public/_headers` host-scoped `X-Robots-Tag` rule (static assets) + middleware header (SSR) | `<meta name="robots" content="noindex">` on `GITHUB_PAGES` builds | `_headers` does not apply to Functions responses; GH Pages robots.txt at `/evolea-website/robots.txt` is never read by crawlers |
| Sitemap generation | Build-time (`@astrojs/sitemap`, already installed & working in prod) | — | Verified: production sitemap includes SSR file-based routes |
| `/sitemap.xml` → `/sitemap-index.xml` 301 | `astro.config.mjs` `redirects` (real 301 with adapter) | Meta-refresh stub on static build (acceptable for de-indexed fallback) | Mechanism already proven in repo (cafe redirect) |
| Canonical / OG / hreflang / `rel=sitemap` | `Base.astro` `<head>` | — | Single layout wraps every page |
| Site-wide JSON-LD (NGO + WebSite) | `Base.astro` | — | SEO-04 mandates Base emission; gives per-page schemas a same-page `@id` to reference |
| Page-specific JSON-LD | Page templates / shared components (body placement is valid for Google) | — | BlogPosting in blog templates; BreadcrumbList where visible breadcrumbs render; Service/Event in program wrappers |
| Title pattern | `Base.astro` (separator) + per-page `title` props (keywords) | — | Base auto-suffixes; pages own keyword content |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | Hostname-aware robots.txt | `robots.txt.ts` endpoint pattern (§Code Examples); `__SSR_BUILD__` prerender pattern verified in `src/pages/api/csp-report.ts`; staging/GH-Pages caveats in §Pitfalls 3–4 |
| SEO-02 | `/sitemap.xml` 301 + `<link rel="sitemap">` | `astro.config.mjs redirects` verified (301 with adapter, meta-refresh static); head link pattern per official @astrojs/sitemap docs |
| SEO-03 | One trailing-slash canonical, og/twitter:url = canonical | Live probe proved the bug; middleware redirect pattern (§Code Examples); canonical normalization in Base |
| SEO-04 | Site-wide NGO + WebSite JSON-LD, stable `@id` | Google Organization docs verified (subtypes allowed, logo ≥112px); `@graph` pattern; NO SearchAction (deprecated Nov 2024) |
| SEO-05 | BlogPosting JSON-LD + `og:type=article` | Blog frontmatter has all needed fields (title, description, pubDate, author, image); Base needs `ogType` prop |
| SEO-06 | BreadcrumbList matching visible breadcrumbs | Two visible-breadcrumb sources found: `InnerPageHero.astro` (breadcrumbs prop) + inline `<nav>` in `src/components/programs/*.astro`; shared builder util recommended |
| SEO-07 | Service JSON-LD on Angebote pages | Service has NO Google rich result — Rich Results test passes via BreadcrumbList on the same page; Service validates via schema.org validator (see Pitfall 8) |
| SEO-08 | Recurring Event JSON-LD for EVOLEA Cafe | Google Event requirements verified (location.address required, eventSchedule NOT consumed by Google — emit concrete `startDate` + `eventSchedule` for schema.org completeness); venue address unconfirmed → user checkpoint; CMS dates stale (Jan–Mar 2025) |
| SEO-09 | `<primary keyword> – EVOLEA` titles (DE+EN) | Base currently suffixes `\| EVOLEA`; homepage title is "Startseite"/"Home" (no keywords); separator change + per-page keyword titles; keyword proposals in §Open Questions |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Bilingual parity:** every user-facing change ships DE and EN simultaneously; hreflang correctness is an existing advantage to preserve.
- **Dual build:** `npm run build` AND `GITHUB_PAGES=true npm run build` must stay green. Note `npm run build` now runs `scripts/gen-headers.mjs` (a `_headers` ↔ `security-headers.ts` parity CHECKER) first — any `public/_headers` change must keep it passing.
- **No replatforming:** config/template changes only; `output: 'server'` (Cloudflare) and static fallback stay as-is.
- **Live site:** must not break Formspree forms, Keystatic CMS (`/keystatic`, `/api/keystatic/*`), donations, or language switching. CSP `report-uri /api/csp-report` is a slash-less POST endpoint — trailing-slash logic must exempt it.
- **Brand:** no emojis anywhere; content language "Kinder im Spektrum" not "autistische Kinder" (applies to title/description copy).
- **Base-URL invariant:** every constructed path must respect `import.meta.env.BASE_URL` (GitHub Pages serves under `/evolea-website`).
- **Git:** `cgjen-box` account; gitleaks + `check_secrets.py` pre-commit hooks; `--no-verify` forbidden.
- **GSD memory:** Astro i18n fallback auto-generates `/en/<route>/` from DE pages — don't create physical EN files for fallback routes; `Base.astro` derives `lang` from URL (never a prop) and auto-suffixes titles.

## Standard Stack

### Core (all already installed — no new runtime dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | 5.16.4 (installed) | Middleware, endpoints, redirects, head templates | Existing stack [VERIFIED: package.json + node_modules] |
| `@astrojs/sitemap` | 3.2.1 installed (3.7.3 latest) | sitemap-index.xml + sitemap-0.xml generation | Already integrated and working in production (verified by live fetch of `https://www.evolea.ch/sitemap-0.xml`) [VERIFIED: live probe] |
| `@astrojs/cloudflare` | 12.6.13 (build-time install) | SSR adapter; real 301s for config redirects | Existing stack |

### Supporting (optional)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `schema-dts` | 2.0.0 | TypeScript types for schema.org JSON-LD (`devDependencies`, zero runtime cost) | Optional type safety for the ~6 schema builders. Google-maintained (`github.com/google/schema-dts`, published 2018, maintainer `google-wombot`). [VERIFIED: npm registry + slopcheck OK] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Middleware trailing-slash 301 | `trailingSlash: 'always'` config | Astro 5 docs confirm on-demand pages redirect in production [CITED: docs.astro.build/en/reference/configuration-reference], BUT it applies to ALL routes including Keystatic's injected `/api/keystatic/*` OAuth callbacks and the slash-less `/api/csp-report` CSP sink (POST redirects lose reports). Middleware gives explicit exemptions; matches roadmap design. Use config only if a preview-deploy test proves it exempts endpoints. |
| Hand-written JSON-LD objects | `astro-seo-schema` / community SEO packages | Community packages add a dependency for what is ~6 small typed objects; not worth it. Hand-write with optional `schema-dts` types. |
| `astro.config redirects` for `/sitemap.xml` | `public/_redirects` line | `_redirects` is Cloudflare-only (GH Pages ignores it) and adds a second redirect mechanism; config redirects already proven in this repo (cafe redirect) and emits a static stub for the fallback build too. |
| `@astrojs/sitemap` `i18n` option | (skip it) | The i18n option assumes locale-prefix mapping only; it cannot model the custom DE↔EN slug pairs (`/spenden/`↔`/en/donate/`) in `routeMappings` and would emit wrong alternates. Head hreflang already covers this correctly. |

**Installation (only if planner opts into schema-dts):**
```bash
npm install --save-dev schema-dts
```

**Version verification:** `npm view schema-dts version` → 2.0.0 [VERIFIED: npm registry, 2026-06-12]. `npm view @astrojs/sitemap version` → 3.7.3 (installed 3.2.1 is sufficient; upgrading is optional and out of scope).

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| schema-dts | npm | 7.5 yrs (created 2018-12-05) | high (Google-maintained) | github.com/google/schema-dts | [OK] | Approved (optional devDependency) |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
**Postinstall check:** `npm view schema-dts scripts.postinstall` → none [VERIFIED]

> Note: slopcheck's `install` subcommand side-effect-installed schema-dts during research; this was reverted (`npm uninstall` + `git checkout package.json package-lock.json`). The working tree is clean. The planner must add an explicit install task if schema-dts is used.

## Architecture Patterns

### System Architecture Diagram

```
                      Request (any host)
                            │
        ┌───────────────────┴────────────────────┐
        │ Cloudflare Pages platform              │
        │  • static asset? ──► serve (308 adds   │
        │    trailing slash; _headers applies,   │
        │    incl. host-scoped X-Robots-Tag      │
        │    for *.pages.dev)                    │
        │  • else ──► SSR worker                 │
        └───────────────────┬────────────────────┘
                            │
              sequence( trailingSlash ─► securityHeaders ─► keystaticEnhancements )
                  │ NEW: GET/HEAD without trailing slash,
                  │ no file extension, not /api/* or /keystatic*
                  │ ──► 301 pathname + '/' (+ query)
                  ▼
        ┌──────────────────────────────────────────────┐
        │ Route render                                 │
        │  /robots.txt ──► robots.txt.ts (hostname-    │
        │     keyed: www.evolea.ch=Allow+Sitemap,      │
        │     anything else=Disallow: /)               │
        │  /sitemap.xml ──► config redirect 301 ──►    │
        │     /sitemap-index.xml (build artifact)      │
        │  pages ──► Base.astro head:                  │
        │     canonical (slash-normalized) = og:url    │
        │     = twitter:url; <link rel=sitemap>;       │
        │     og:type from prop; title `X – EVOLEA`;   │
        │     <JsonLd> NGO+WebSite @graph              │
        │   └─ page body: <JsonLd> BlogPosting /       │
        │      BreadcrumbList / Service / Event        │
        └──────────────────────────────────────────────┘

GITHUB_PAGES=true static build: robots.txt prerendered (Disallow: /),
/sitemap.xml = meta-refresh stub, + <meta name="robots" content="noindex">
(recommended — see Pitfall 4).
```

### Recommended Project Structure

```
src/
├── lib/
│   ├── security-headers.ts   # exists (Phase 1)
│   └── seo.ts                # NEW: ORG_ID/WEBSITE_ID constants, schema builders
│                             #   (organizationSchema, websiteSchema, blogPostingSchema,
│                             #    breadcrumbSchema, serviceSchema, cafeEventSchema,
│                             #    nextCafeDate helper), canonical helper
├── components/
│   └── JsonLd.astro          # NEW: escaped <script type="application/ld+json">
├── middleware.ts             # MODIFIED: sequence(trailingSlash, securityHeaders, keystaticEnhancements)
├── layouts/Base.astro        # MODIFIED: canonical/og:url/og:type/rel=sitemap/title separator + NGO/WebSite JsonLd
└── pages/
    └── robots.txt.ts         # NEW: hostname-keyed endpoint (__SSR_BUILD__ prerender pattern)
astro.config.mjs              # MODIFIED: redirects['/sitemap.xml'], sitemap filter (/brand/)
public/_headers               # MODIFIED (optional hardening): host-scoped X-Robots-Tag for *.pages.dev
```

### Pattern 1: Trailing-slash middleware (first in sequence)

**What:** 301 GET/HEAD requests whose pathname lacks a trailing slash, with explicit exemptions.
**When to use:** SSR routes only — Cloudflare already 308s static/prerendered routes (verified live).
**Example:**

```typescript
// src/middleware.ts — Source: pattern derived from astro:middleware docs + repo conventions
const trailingSlash = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;
  const method = context.request.method;
  const hasExtension = /\.[^/]+$/.test(pathname);
  const exempt =
    pathname.startsWith('/api/') ||
    pathname === '/keystatic' || pathname.startsWith('/keystatic/') ||
    pathname.startsWith('/_'); // /_image, /_astro etc.
  if (
    (method === 'GET' || method === 'HEAD') &&
    !pathname.endsWith('/') &&
    !hasExtension &&
    !exempt
  ) {
    // Collapse duplicate leading slashes — `//evil.com` would otherwise become a
    // protocol-relative open redirect (see Security Domain).
    const safePath = pathname.replace(/^\/+/, '/');
    return context.redirect(`${safePath}/${search}`, 301);
  }
  return next();
});

export const onRequest = sequence(trailingSlash, securityHeaders, keystaticEnhancements);
```

Loop-safety: the guard only ever ADDS a slash and never removes one — a redirect loop is structurally impossible (success criterion 2).

### Pattern 2: Hostname-keyed robots.txt endpoint (reuses proven `__SSR_BUILD__` pattern)

**What:** SSR text endpoint; production host gets Allow+Sitemap, every other host gets `Disallow: /`. Static build prerenders the deny variant.
**Source pattern:** `src/pages/api/csp-report.ts` (Phase 1, verified working in both builds).

```typescript
// src/pages/robots.txt.ts
import type { APIRoute } from 'astro';

declare const __SSR_BUILD__: boolean;
export const prerender = !__SSR_BUILD__; // SSR endpoint on Cloudflare; prerendered file on static build

const PROD_HOST = 'www.evolea.ch';

export const GET: APIRoute = ({ url, site }) => {
  // Default-deny: only the exact production host is crawlable.
  const isProd = __SSR_BUILD__ && url.hostname === PROD_HOST;
  const body = isProd
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /keystatic/',
        'Disallow: /api/',
        '',
        `Sitemap: ${new URL('sitemap-index.xml', site)}`,
        '',
      ].join('\n')
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

### Pattern 3: Escaped JSON-LD component

```astro
---
// src/components/JsonLd.astro
interface Props {
  schema: Record<string, unknown>;
}
const { schema } = Astro.props;
// Escape `<` so attacker/CMS content can never break out via `</script>`.
const json = JSON.stringify(schema).replace(/</g, '\\u003c');
---
<script type="application/ld+json" is:inline set:html={json} />
```

Google accepts JSON-LD in `<head>` or `<body>` — body placement inside InnerPageHero/program components is valid. The current CSP includes `script-src 'unsafe-inline'`, and `type="application/ld+json"` data blocks are not executed scripts, so no CSP change is needed [ASSUMED — verify zero CSP-report noise on preview deploy].

### Pattern 4: Site-wide `@graph` with stable `@id`s (Base.astro)

```typescript
// src/lib/seo.ts — IDs are absolute production-stable anchors
export const ORG_ID = 'https://www.evolea.ch/#organization';
export const WEBSITE_ID = 'https://www.evolea.ch/#website';

// Emitted from Base.astro on every page so page-level schemas
// (BlogPosting.publisher, Service.provider, Event.organizer) can
// reference { '@id': ORG_ID } on the same page.
export function siteGraph(siteSettings: SiteSettings, lang: 'de' | 'en', site: URL) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NGO', // schema.org subtype of Organization; Google: "use the most specific subtype"
        '@id': ORG_ID,
        name: 'EVOLEA Verein',
        alternateName: 'EVOLEA',
        url: 'https://www.evolea.ch/',
        logo: { '@type': 'ImageObject', url: new URL('/images/evolea-logo-new.png', site).href }, // must be ≥112x112px
        email: siteSettings?.kontakt?.email,        // hello@evolea.ch
        telephone: siteSettings?.kontakt?.telefon,  // +41 78 959 19 74
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Germaniastrasse 55',
          postalCode: '8006',
          addressLocality: 'Zürich',
          addressCountry: 'CH',
        },
        sameAs: ['https://instagram.com/evolea.verein'],
        nonprofitStatus: 'https://schema.org/NonprofitType', // optional; verify or omit
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: 'https://www.evolea.ch/',
        name: 'EVOLEA',
        inLanguage: lang === 'de' ? 'de-CH' : 'en',
        publisher: { '@id': ORG_ID },
        // NO SearchAction — sitelinks search box removed by Google Nov 21, 2024
      },
    ],
  };
}
```

All values above come from `src/content/settings/site.json` [VERIFIED: codebase grep] — read them from the `siteSettings` entry Base already loads, with these literals as fallbacks.

### Pattern 5: Canonical normalization + OG alignment (Base.astro)

```typescript
// Replace: const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const canonicalPath = Astro.url.pathname.endsWith('/')
  ? Astro.url.pathname
  : `${Astro.url.pathname}/`;
const canonicalURL = new URL(canonicalPath, Astro.site);
// og:url and twitter:url both switch from {Astro.url} to {canonicalURL} (SEO-03).
// og:type comes from a new prop: ogType?: 'website' | 'article' (default 'website').
// New head line: <link rel="sitemap" type="application/xml" href={`${base}/sitemap-index.xml`} />
// Title separator: `${title} – EVOLEA` replaces `${title} | EVOLEA` (title, meta name=title, og:title, twitter:title).
```

### Anti-Patterns to Avoid

- **`_redirects` for trailing slashes:** Cloudflare strips the trailing slash before matching, so `/path /path/ 301` self-loops — documented in this repo's `public/_redirects` header comment (it previously 404'd the EN homepage). [VERIFIED: dist/_redirects comment]
- **SearchAction on WebSite:** Google removed the sitelinks search box Nov 21, 2024 — dead markup. [CITED: developers.google.com/search/blog/2024/10/sitelinks-search-box]
- **FAQPage JSON-LD:** explicitly out of scope (Google removed FAQ rich results).
- **One Event per CMS date row:** Google guidelines say one event per page, not multiple schedule entries — emit a single Event with the next occurrence. [CITED: Google Event docs]
- **`@astrojs/sitemap` i18n option:** cannot model the custom slug mappings; would emit wrong hreflang alternates in the sitemap.
- **Editing `public/_headers` without updating the parity checker mindset:** `npm run build` runs `scripts/gen-headers.mjs`, which asserts two-way parity per path-pattern block — see Pitfall 5.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap XML | Custom sitemap endpoint | `@astrojs/sitemap` (installed, working in prod) | Already emits sitemap-index.xml + sitemap-0.xml with all SSR file-based routes (verified live) |
| schema.org types | Hand-typed interfaces | `schema-dts` (optional) | Google-maintained, exhaustive, dev-only |
| Trailing-slash for static routes | Anything | Platform behavior | Cloudflare 308s and GitHub Pages 301s these already (verified live probes) |
| Per-build SSR/static switching | New env plumbing | Existing `__SSR_BUILD__` Vite define | Proven in `csp-report.ts`; `export const prerender = !__SSR_BUILD__` works because define-replacement happens before Astro's prerender analysis |
| hreflang generation | New logic | Existing `getLanguageAlternates()` | Already handles `routeMappings` slug pairs correctly |

**Key insight:** Everything in this phase composes existing, proven repo mechanisms (sequence() middleware, `__SSR_BUILD__`, config redirects, settings/site.json content). The only genuinely new surface is the JSON-LD builder module.

## Common Pitfalls

### Pitfall 1: `trailingSlash: 'always'` breaks slash-less endpoints
**What goes wrong:** CSP `report-uri /api/csp-report` (slash-less POST) and Keystatic's injected `/api/keystatic/*` OAuth routes stop matching or get 308'd; CSP reports are silently lost; CMS login can break on the live site.
**Why:** the config option applies to ALL on-demand routes with no exemption mechanism.
**How to avoid:** use the middleware (Pattern 1) with `/api/` + `/keystatic` + file-extension exemptions; leave `trailingSlash` at default `'ignore'`.
**Warning signs:** CSP report volume drops to zero; Keystatic OAuth redirect loop on preview deploy.

### Pitfall 2: Middleware never sees prerendered blog routes on Cloudflare
**What goes wrong:** assuming the new middleware covers `/blog/<slug>` — it doesn't; those are static assets served before the worker.
**Why:** Pages serves static files first (Phase 1 research finding, re-verified: `/blog/im-spektrum` → platform 308).
**How to avoid:** rely on the platform 308 for those routes (already correct behavior); the canonical fix in Base covers their head at build time. Verify success criterion 2 against BOTH an SSR route (`/angebote`) and a prerendered route (`/blog/im-spektrum`).

### Pitfall 3: `*.pages.dev` robots alone doesn't de-index already-known URLs
**What goes wrong:** `Disallow: /` blocks crawling but Google can still index URLs discovered via links.
**How to avoid:** defense-in-depth — add host-scoped X-Robots-Tag blocks to `public/_headers` (officially documented Cloudflare syntax) for static assets, and set the same header from middleware when `url.hostname !== 'www.evolea.ch'` for SSR responses:
```
https://:project.pages.dev/*
  X-Robots-Tag: noindex

https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex
```
[CITED: developers.cloudflare.com/pages/configuration/headers/ — exact example from docs]
Note: `_headers` does NOT apply to Functions (SSR) responses — that's what the middleware branch is for.

### Pitfall 4: GitHub Pages robots.txt is at a subpath and therefore inert
**What goes wrong:** the static build prerenders robots.txt to `/evolea-website/robots.txt`; crawlers only read `cgjen-box.github.io/robots.txt` (host root, not controllable from this repo). SEO-01's "GitHub Pages hosts serve Disallow: /" is satisfiable as written but has no crawler effect.
**How to avoid:** the effective mechanism is `<meta name="robots" content="noindex">` emitted by Base when the build is static/GitHub Pages (key off `__SSR_BUILD__` or `import.meta.env`). Recommended as part of SEO-01's intent; cheap and dual-build-safe.
**Warning signs:** GH Pages mirror appearing in `site:cgjen-box.github.io` searches.

### Pitfall 5: `gen-headers.mjs` parity checker fails the build on `_headers` edits
**What goes wrong:** the Phase 1 checker asserts per-path-pattern block parity (e.g., "`/*` carries no security header absent from the constant") and exits 1 on mismatch — adding the host-scoped `X-Robots-Tag` blocks may trip it.
**How to avoid:** any plan touching `public/_headers` must run `node scripts/gen-headers.mjs` locally and, if needed, extend the checker to tolerate (or assert) the new host-scoped blocks. [VERIFIED: scripts/gen-headers.mjs source]

### Pitfall 6: Stale + inconsistent EVOLEA Cafe dates in CMS
**What goes wrong:** `pages/evolea-cafe.json` `daten[]` contains Jan–Mar 2025 dates (in the past) and the DE/EN rows disagree ("Mi, 14. Januar 2025" vs "Wed, January 15, 2025" — Jan 14, 2025 was a Tuesday). An Event with a past `startDate` earns no rich result.
**How to avoid:** compute the next occurrence programmatically (evidence — Feb 12 & Mar 12, 2025 — suggests "2nd Wednesday of the month", 20:00). Emit `startDate` with a Zurich UTC offset (e.g. `2026-07-08T20:00:00+02:00`). On the static fallback build the date freezes at build time — acceptable for a de-indexed mirror. Separately flag the stale visible dates as a CMS content fix.
**Warning signs:** Rich Results test shows the Event but Search Console reports "event is in the past".

### Pitfall 7: Double base-prefix / wrong host in absolute URLs
**What goes wrong:** JSON-LD `image`/`logo`/breadcrumb `item` URLs built with both `${base}` and `new URL(..., Astro.site)` double-prefix on GH Pages, or canonicals point at `cgjen-box.github.io`.
**How to avoid:** follow the existing `ogImage` pattern in Base (`new URL(`${base}${path}`, Astro.site)`); keep the `@id` constants pinned to `https://www.evolea.ch` regardless of build (stable identity is the point of `@id`).

### Pitfall 8: Expecting a "Service" rich result
**What goes wrong:** verification fails because the Rich Results test reports nothing for Service — Google has no Service rich result type.
**How to avoid:** success criterion 3 passes via the BreadcrumbList on the same Angebote page (a supported rich result); validate the Service node with the schema.org validator (validator.schema.org) instead. Document this split in the plan's verification steps.

### Pitfall 9: Title changes ripple into og:title/twitter:title and the cafe page double-brands
**What goes wrong:** Base appends the suffix in four places; the cafe fallback title already contains a `|` ("EVOLEA Cafe | Parent Community") producing "EVOLEA Cafe | Parent Community – EVOLEA".
**How to avoid:** change the separator once in Base; audit page `title` props for embedded separators/brand names (cafe page, any CMS `seo.title` values); keep titles ≤ ~60 chars.

## Code Examples

### BlogPosting (blog templates — both `src/pages/blog/[...slug].astro` and `src/pages/en/blog/[...slug].astro`)

```typescript
// Frontmatter fields verified present in src/content/config.ts blog schema:
// title, description, pubDate (coerced Date), author (default 'EVOLEA Team'), image
const blogPostingSchema = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.data.title,
  description: post.data.description,
  datePublished: pubDate.toISOString(),
  author: { '@type': 'Organization', name: post.data.author }, // 'EVOLEA Team' is not a person
  ...(post.data.image && { image: new URL(`${base}${post.data.image}`, Astro.site).href }),
  publisher: { '@id': ORG_ID }, // resolves against the @graph Base emits on the same page
  mainEntityOfPage: canonicalURL.href,
  inLanguage: lang === 'de' ? 'de-CH' : 'en',
};
// Pass ogType="article" to Base (SEO-05).
```

### BreadcrumbList (shared builder; emit in InnerPageHero AND program components' inline navs)

```typescript
// src/lib/seo.ts
export function breadcrumbSchema(
  items: Array<{ label: string; href?: string }>,
  site: URL | undefined,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      // Last item (current page) may omit `item` per Google docs.
      ...(item.href && { item: new URL(item.href, site).href }),
    })),
  };
}
```
Visible breadcrumbs live in TWO places [VERIFIED: grep]: `InnerPageHero.astro` (`breadcrumbs` prop — used by spenden, ueber-uns, kontakt, blog index, team, angebote index + EN twins) and inline `<nav>` markup inside `src/components/programs/*.astro` + `CafePage.astro`. Emitting from InnerPageHero covers the first group with one edit; program components need the `<JsonLd>` added next to their inline nav (must match its labels/links — SEO-06's "matching the visible breadcrumbs").

### Service (Angebote program wrappers)

```typescript
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: pageTitle,                       // e.g. 'Mini Garten'
  description: pageDescription,
  provider: { '@id': ORG_ID },
  areaServed: { '@type': 'City', name: 'Zürich' },
  audience: {
    '@type': 'PeopleAudience',
    suggestedMinAge: 3, suggestedMaxAge: 6, // per program from CMS keyInfo.alter
  },
  url: canonicalURL.href,
  inLanguage: lang === 'de' ? 'de-CH' : 'en',
};
```

### Event (EVOLEA Cafe — DE `/angebote/evolea-cafe/` + EN `/en/programs/evolea-cafe/`)

```typescript
// Google REQUIRED: name, startDate, location (Place with name + address). [CITED: Google Event docs]
// eventSchedule is schema.org-valid but NOT consumed by Google — emit it (SEO-08 demands it)
// alongside a concrete next startDate, which is what makes the rich result eligible.
const cafeEventSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: lang === 'de' ? 'EVOLEA Cafe – Elterntreff' : 'EVOLEA Cafe – Parent Meetup',
  description: pageDescription,
  startDate: nextCafeDate(),             // e.g. '2026-07-08T20:00:00+02:00' (computed; see Pitfall 6)
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  isAccessibleForFree: true,
  location: {
    '@type': 'Place',
    name: 'EVOLEA',
    address: {
      '@type': 'PostalAddress',
      // OPEN: venue unconfirmed — page says 'Genauer Ort auf Anfrage'.
      // Option A (user confirms org address as venue): streetAddress 'Germaniastrasse 55', postalCode '8006'
      // Option B (safe fallback): city-level only — validates, but Google warns on missing street detail
      addressLocality: 'Zürich',
      addressCountry: 'CH',
    },
  },
  organizer: { '@id': ORG_ID },
  eventSchedule: {
    '@type': 'Schedule',
    byDay: 'https://schema.org/Wednesday',
    repeatFrequency: 'P1M',              // '2nd Wednesday of each month' (inferred from CMS dates)
    startTime: '20:00',
    scheduleTimezone: 'Europe/Zurich',
  },
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WebSite + SearchAction (sitelinks search box) | Plain WebSite node, no SearchAction | Removed by Google 2024-11-21 | Don't add SearchAction [CITED: Google Search Central blog] |
| FAQPage rich results | None (markup ignored for most sites) | Google removed (project notes 2026-05-07 final removal) | Already out of scope |
| `trailingSlash` 404s non-matching SSR URLs | Astro 5 redirects on-demand pages to the correct form in production | Astro 5.x | Raises config-option viability, but endpoint-exemption risk keeps middleware preferred [CITED: docs.astro.build configuration reference] |
| robots.txt as static `public/` file | Dynamic route reusing `site` config — Astro's own docs recommendation | Astro docs current | Matches SEO-01's hostname-keyed requirement |

**Deprecated/outdated:**
- Sitelinks search box (`potentialAction: SearchAction`): removed — zero SERP value.
- `speakable`, `HowTo` rich results: removed/limited by Google — irrelevant here.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | EVOLEA Cafe recurrence is "2nd Wednesday of each month, 20:00" (inferred from Feb 12/Mar 12, 2025 CMS dates; DE label says "Jeden 2. Mittwoch" which could also mean every other Wednesday) | Event schema | Wrong `startDate`/`eventSchedule` published; needs user confirmation |
| A2 | Germaniastrasse 55, 8006 Zürich (org address in settings/site.json) is usable as the Cafe venue | Event schema | Wrong venue published on Google; page itself says "location on request" — MUST be user-confirmed before shipping street-level address |
| A3 | `type="application/ld+json"` data blocks are not blocked/reported by the current CSP | JsonLd pattern | CSP report noise; harmless in Report-Only mode, verify on preview deploy |
| A4 | `evolea-logo-new.png` is ≥112×112px and suitable as the Organization `logo` | NGO schema | Logo rich-feature ineligible; check the file's dimensions during execution |
| A5 | `/brand/` pages are internal style-guide pages that should be excluded from the sitemap (currently included — verified in both prod and static sitemaps) | Sitemap filter | If intentional public pages, skip the filter; one-line decision |
| A6 | GitHub Pages 301-normalizes slashless directory URLs | Responsibility map | If wrong, fallback mirror has duplicate forms — but it's de-indexed anyway (noindex meta), so impact ~zero |
| A7 | `nonprofitStatus` property value format | NGO schema | Validator warning; safe to omit if unverified |

## Open Questions (RESOLVED)

> Resolution (2026-06-12, plan-phase orchestrator, autonomous run): Q1 → locked
> decision D3 — city-level PostalAddress ships (02-02/02-05); street-address
> upgrade recorded as a deferred item pending user confirmation. Q2 → locked
> decision D4 — the researcher's DE/EN title proposals are adopted as-is (02-03).
> Q3 → no action beyond the noindex meta, implemented in 02-01 T3.

1. **EVOLEA Cafe venue address (blocks SEO-08 final form)**
   - What we know: page publishes "Genauer Ort auf Anfrage"; org address Germaniastrasse 55, 8006 Zürich exists in `settings/site.json`; Google requires `location` with `address` (street-level detail recommended, city-level validates with warnings).
   - What's unclear: whether the Cafe meets at Germaniastrasse 55 and whether the user wants the street published.
   - Recommendation: plan a `checkpoint:human-verify` — ship Option B (city-level Place) by default; upgrade to street address only on explicit user confirmation. Also confirm A1 (recurrence rule) at the same checkpoint.

2. **Primary keywords for SEO-09 titles (content decision)**
   - What we know: homepage title is "Startseite"/"Home" (no keyword value); program pages use CMS `hero.titel` (program names only); pattern must be `<primary keyword> – EVOLEA` in DE and EN; brand language rules apply ("Kinder im Spektrum").
   - Proposals to put to the user (or take as discretion): DE home "Förderung für Kinder im Autismus-Spektrum in Zürich"; EN home "Programs for Children on the Autism Spectrum in Zurich"; programs as "`<Name>` – `<function>` für Kinder im Spektrum" e.g. "Mini Garten – Kindergartenvorbereitung" (Base appends "– EVOLEA"). Watch total length ≤ ~60 chars — a `<name> – <function>` + "– EVOLEA" can exceed it; prefer keyword-bearing program titles without a second clause where needed.
   - Recommendation: lock keyword strings during discuss-phase/checkpoint; the mechanical changes (separator, prop threading) are unambiguous and can proceed regardless.

3. **Canonicals on the GitHub Pages mirror**
   - What we know: static build canonicals point at `cgjen-box.github.io/evolea-website/...` — the mirror competes with production in principle.
   - Recommendation: the noindex meta (Pitfall 4) neutralizes this; cross-domain canonicals to `www.evolea.ch` would conflict with the differing base path and are NOT recommended. No action beyond noindex.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | builds | ✓ | 26.0.0 local / 20 CI | — |
| npm | installs/builds | ✓ | 11.12.1 | — |
| `@astrojs/sitemap` | SEO-02 | ✓ (installed) | 3.2.1 | — |
| `curl` | verification probes | ✓ | system | — |
| Cloudflare preview deploy | verifying middleware 301s, hostname-keyed robots, staging headers | ✓ (push to branch → Pages preview) | — | `wrangler pages dev` partially; NOT `astro dev` (known cross-cutting constraint) |
| Google Rich Results test | success criterion 3 | ✓ (manual, browser at search.google.com/test/rich-results) | — | schema.org validator for Service; requires deployed/public URL or pasted code |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none — note Rich Results testing of a *preview* URL works by pasting rendered HTML/code if the preview host blocks the fetcher.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — (no auth surface changes) |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes | Hostname compare in robots.txt is exact-match default-deny (`hostname === 'www.evolea.ch'`, anything else → `Disallow: /`); CMS strings entering JSON-LD pass through `JSON.stringify` + `<` escaping in `JsonLd.astro` |
| V6 Cryptography | no | — |

### Known Threat Patterns for this change set

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect via `//host` pathname in trailing-slash middleware (`//evil.com` → `Location: //evil.com/` is protocol-relative) | Spoofing | Collapse leading slashes before redirecting (Pattern 1 `safePath`), or build `new URL` against `context.url.origin` and assert same-origin |
| `</script>` breakout from CMS-sourced strings inside JSON-LD | Tampering/XSS | `<` escaping in `JsonLd.astro` (Pattern 3) — mandatory, CMS editors control these strings |
| Host-header keying trust | Spoofing | On Cloudflare Pages only bound hostnames route to the worker; default-deny means a spoofed host gets the `Disallow: /` variant — fail-safe |
| Header drift between middleware and `_headers` | Tampering (config) | Existing `gen-headers.mjs` parity gate; extend it if `_headers` gains host-scoped blocks (Pitfall 5) |

## Sources

### Primary (HIGH confidence)
- Live production probes (2026-06-12): `www.evolea.ch/angebote` 200 + mismatched canonical; `/robots.txt` & `/sitemap.xml` 404; `/blog/im-spektrum` → 308; `sitemap-0.xml` contents incl. `/brand/`; `evolea-website.pages.dev` 200
- Codebase: `src/middleware.ts`, `src/layouts/Base.astro`, `src/i18n/utils.ts`, `astro.config.mjs`, `src/pages/api/csp-report.ts` (`__SSR_BUILD__` pattern), `scripts/gen-headers.mjs`, `public/_redirects` (trailing-slash loop gotcha), `src/content/settings/site.json`, `src/content/pages/evolea-cafe.json`, `src/content/config.ts`
- docs.astro.build/en/reference/configuration-reference — `trailingSlash` SSR redirect behavior; `redirects` status codes (301 with adapter, meta-refresh static)
- docs.astro.build/en/guides/integrations-guide/sitemap — SSR dynamic-route limitation, `filter`/`customPages`/`i18n`, `<link rel="sitemap">` + robots.txt guidance
- developers.google.com/search/docs/appearance/structured-data/event — required props (name, startDate, location+address), recurring-event guidance, eligibility
- developers.google.com/search/docs/appearance/structured-data/organization — subtypes, logo ≥112px, placement guidance
- developers.cloudflare.com/pages/configuration/headers — host-scoped `_headers` rules with exact `X-Robots-Tag` pages.dev example
- developers.google.com/search/blog/2024/10/sitelinks-search-box — SearchAction removal (Nov 21, 2024), confirmed via Brave search cross-check
- npm registry: `schema-dts` 2.0.0, repo google/schema-dts, no postinstall; slopcheck verdict [OK]

### Secondary (MEDIUM confidence)
- Phase 1 research (`01-RESEARCH.md`): middleware doesn't run for static/prerendered files on Cloudflare (re-confirmed by live 308 probe)

### Tertiary (LOW confidence / flagged)
- JSON-LD data blocks not subject to CSP script-src (A3) — spec-based, verify via report noise on preview
- `nonprofitStatus` value format (A7) — omit if not verified during execution

## Metadata

**Confidence breakdown:**
- Canonical/trailing-slash approach: HIGH — live probes + official docs + repo-documented `_redirects` gotcha
- robots/sitemap mechanics: HIGH — proven repo patterns + official docs + live verification of current 404s
- JSON-LD shapes: HIGH for Organization/BlogPosting/Breadcrumb (Google docs verified); MEDIUM for Event (venue + recurrence need user confirmation); Service has no rich result (verification nuance documented)
- Title strategy: HIGH mechanics / MEDIUM content (keyword strings are a user decision)

**Research date:** 2026-06-12
**Valid until:** ~2026-07-12 (stable domain; Google structured-data policies are the fastest-moving part)
