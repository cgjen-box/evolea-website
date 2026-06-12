# Architecture Research

**Domain:** Astro 5 SSR site quality lift (security headers, SEO discovery, structured data, perf, a11y) on an existing Cloudflare Pages deployment with a static GitHub Pages fallback
**Researched:** 2026-06-12
**Confidence:** HIGH (middleware/prerender behavior verified against official Astro docs + roadmap discussion; existing system facts read directly from the repo)

> This is integration research, not greenfield. It answers *where each work item plugs into the existing architecture, what talks to what, and in what order to build.* It does not re-derive the existing system (see `.planning/codebase/ARCHITECTURE.md`).

---

## Standard Architecture

### The single most important fact

**Astro middleware does NOT run at request time for prerendered routes.** For pages with `export const prerender = true`, middleware runs only at *build time*; the emitted HTML is then served as a static file by Cloudflare with no Worker invocation. For on-demand (SSR) routes, middleware runs per request. This is current, intended Astro behavior (the request to change it, roadmap discussion #869, is unimplemented).

Consequence for this project: any header/redirect logic added to `src/middleware.ts` reaches **only the on-demand routes**, not the prerendered blog slug pages (`src/pages/blog/[...slug].astro` and the EN equivalent, both `prerender = true`). The blog detail pages are the one class of route that will silently miss middleware-injected security headers and Cache-Control. This must shape the design — it is the difference between "headers on every page" and "headers on every page except blog posts."

### Request topology on the Cloudflare build (`output: 'server'`)

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Cloudflare Pages edge                             │
│                                                                        │
│   Request ──► Is path a prerendered static asset / page?               │
│                 │                          │                           │
│            YES (blog/* HTML,          NO (everything else:             │
│             /assets/*, /sitemap-*,     /, /angebote/*, /en/*,          │
│             public/* files)            /keystatic/*, /robots.txt)      │
│                 │                          │                           │
│                 ▼                          ▼                           │
│        Served from dist/ as          Cloudflare Pages Function         │
│        static files.                 (the SSR Worker)                  │
│        Middleware did NOT run            │                             │
│        at request time.                  ▼                             │
│        Headers come from              src/middleware.ts onRequest      │
│        public/_headers (assets        runs HERE, per request:          │
│        only) or Astro adapter           • security headers             │
│        static-header emission.          • Cache-Control                │
│                                          • trailing-slash 301          │
│                                          • Keystatic HTML rewrite       │
│                                          │                             │
│                                          ▼                             │
│                                   Astro route renders → Response        │
└──────────────────────────────────────────────────────────────────────┘
```

### Where each work item attaches

| Work item | Attachment point | Runs on prerendered routes? | Notes |
|-----------|------------------|------------------------------|-------|
| Security headers + CSP-RO | `src/middleware.ts` (response header append) | **No** (blog posts excluded) | Need a static-header backstop for blog (see Pattern 4) |
| `Cache-Control` for `/assets/*` | `src/middleware.ts` *or* `public/_headers` | `/assets/*` are static, so middleware will **not** fire — use `public/_headers` | This is the inverse trap: assets are never SSR'd, so the planned middleware approach silently does nothing |
| Trailing-slash 301 | `src/middleware.ts` (early return Response) | Only catches SSR routes; static routes 404 directly | Prefer `trailingSlash: 'always'` in config as the real fix |
| robots.txt | `src/pages/robots.txt.ts` | n/a — it IS a route | Make it `prerender = true` so it works in both builds |
| JSON-LD (Org/WebSite) | `Base.astro` `<head>` | Renders at build or request, either way | Site-wide, in the shared layout |
| JSON-LD (BlogPosting/Service/Event/Breadcrumb) | per-page / `InnerPageHero.astro` | Renders inside the page | Page-specific data, belongs with the page |
| Canonical / trailing-slash meta | `Base.astro` (`canonicalURL`) | both | Already computed; fix is to *normalize* it |
| WebP conversion | `public/` files (build-time asset swap) | n/a | Template `<img src>` edits + Cache-Control on `/assets` |
| Self-hosted fonts | `public/fonts/` + `global.css` + `Base.astro` | both | Removes the Google Fonts `<link>`; also unblocks a tighter CSP |
| Branded 404 | `src/pages/404.astro` | prerendered | Cloudflare serves `dist/404.html` for unmatched routes |
| a11y fixes | `Header.astro`, program components | both | Pure template edits, no runtime dependency |
| Playwright smoke tests | repo root `tests/` + `playwright.config.ts` | n/a | Runs against `npm run preview` or the deployed URL |

---

## Recommended Project Structure

Changes are additive/edit-in-place on the existing tree. No restructuring.

```
src/
├── middleware.ts            # EXTEND: refactor to sequence(); add headers + trailing-slash branch
├── lib/
│   └── security-headers.ts  # NEW: pure fn returning the header map + CSP-RO string (testable, shared)
├── components/
│   └── seo/
│       ├── OrganizationJsonLd.astro   # NEW: site-wide Org + WebSite (rendered in Base)
│       └── JsonLd.astro               # NEW: thin <script type="application/ld+json"> wrapper
├── layouts/
│   └── Base.astro           # EDIT: add <OrganizationJsonLd>, fix og:url/twitter:url → canonicalURL,
│                            #       swap Google Fonts <link> for self-hosted, add <link rel="sitemap">
├── pages/
│   ├── robots.txt.ts        # NEW: prerendered text/plain route, references sitemap, disallows /keystatic/
│   ├── 404.astro            # NEW: branded DE/EN not-found page
│   ├── blog/[...slug].astro # EDIT: add BlogPosting JSON-LD + og:type=article (note: prerendered!)
│   └── ...
public/
├── _headers                 # NEW: Cache-Control for /assets/* + static fallback headers for blog HTML
├── fonts/                   # NEW: Fredoka/Poppins .woff2 copied from design-system-assets/
└── images/                  # EDIT: PNG → WebP in place
tests/
└── smoke.spec.ts            # NEW: Playwright DE/EN load, forms render, lang switch, program 200s
playwright.config.ts         # NEW
astro.config.mjs             # EDIT: add trailingSlash: 'always' (verify Cloudflare adapter behavior)
```

### Structure Rationale

- **`src/lib/security-headers.ts` as a pure function:** the header map and CSP string must be importable both by the SSR middleware *and* by the static `public/_headers` generation/test, and by Playwright assertions. Keeping it pure (no `context`) makes it unit-testable and keeps the middleware thin.
- **`public/_headers` returns to the design even though PROJECT.md leans middleware-only:** `/assets/*` and prerendered blog HTML are *never* SSR'd, so middleware physically cannot set their headers. `_headers` is the only mechanism that reaches static output on Cloudflare Pages. The two mechanisms are complementary, not alternatives — middleware for on-demand routes, `_headers` for static output.
- **JSON-LD split (`Base` vs per-page):** Organization/WebSite is identity data that is identical on every page → belongs in the one shared layout. BlogPosting/Service/Event/BreadcrumbList depend on the specific entry's fields (title, datePublished, breadcrumb trail) → belongs with the page that already has that data in scope. Putting page-specific schema in `Base` would force prop-drilling structured data through the layout, which is the anti-pattern.

---

## Architectural Patterns

### Pattern 1: `sequence()` to split the monolithic middleware

**What:** Replace the single `onRequest` with `sequence(trailingSlashRedirect, keystaticRewrite, securityHeaders)`. Each handler has one job, runs in order, and either returns early (redirect) or calls `next()` and decorates the result.

**When to use:** As soon as one middleware file owns more than one concern. This project adds three concerns to a file that already does one (Keystatic) — sequence is the correct decomposition.

**Trade-offs:** Slightly more files; in exchange each concern is independently testable and the ordering is explicit rather than buried in `if` nesting. Ordering matters (see Data Flow).

**Example:**
```ts
import { sequence, defineMiddleware } from 'astro:middleware';
import { SECURITY_HEADERS } from '@/lib/security-headers';

const trailingSlash = defineMiddleware((ctx, next) => {
  const { pathname } = ctx.url;
  // only redirect real page paths, never /assets, /keystatic, files with extensions
  if (!pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(pathname) && pathname !== '/') {
    return ctx.redirect(pathname + '/' + ctx.url.search, 301);
  }
  return next();
});

const securityHeaders = defineMiddleware(async (ctx, next) => {
  const res = await next();
  // never re-tag Keystatic's looser policy or non-HTML here
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  if (ctx.url.pathname.startsWith('/assets/')) {
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  return res;
});

export const onRequest = sequence(trailingSlash, keystaticRewrite, securityHeaders);
```

### Pattern 2: Mutate headers on the live `Response`, don't reconstruct it

**What:** `const res = await next(); res.headers.set(...); return res;`. Headers on a `Response` are mutable. There is no need to build a `new Response(...)` for header-only changes.

**When to use:** All header/cache work. Only reconstruct the Response when you must change the *body* (the Keystatic HTML rewrite).

**Trade-offs:** Avoids the body-consumption class of bug entirely. The existing Keystatic path reconstructs the Response (correct, because it rewrites the body) but its `catch` then calls `next()` a second time — that is the fragile path called out in CONCERNS.md and below.

### Pattern 3: Read the body once, never call `next()` twice (fixing the existing bug)

**What:** The current Keystatic branch (`src/middleware.ts:99-117`) does `await response.text()`, and on the `catch` path calls `return next()` again. `next()` re-runs the whole downstream chain and re-renders the page; combined with an already-consumed body this is only "safe" because Cloudflare Workers happen to buffer bodies — it is not guaranteed and will be a latent double-render.

**Why it's wrong:** `next()` is not a retry primitive. Calling it twice means the route renders twice; the catch was reached precisely because something failed, so re-rendering rarely helps and doubles work/cost.

**Do this instead:** Clone before reading, or capture the response and return *that* on failure:
```ts
const res = await next();
if (!ct?.includes('text/html')) return res;
try {
  const html = await res.text();           // consumes res
  return new Response(injected(html), {
    status: res.status, statusText: res.statusText, headers: res.headers,
  });
} catch {
  return new Response(null, { status: 502 }); // or: read from a pre-made res.clone()
}
```
Use `res.clone()` *before* `.text()` if you need a fallback that returns the original bytes.

### Pattern 4: Static-header backstop for prerendered routes via `public/_headers`

**What:** Because middleware does not run at request time for `/assets/*` and the prerendered blog HTML, set those headers in `public/_headers`, which Cloudflare Pages applies to static output.

**When to use:** Mandatory for `/assets/*` cache headers. Strongly recommended for security headers on `/blog/*` and `/en/blog/*` so they aren't the one un-hardened corner of the site.

**Trade-offs:** Two sources of header truth (middleware + `_headers`). Mitigate by generating both from the same `security-headers.ts` constant, or at least cross-checking them in a Playwright test that asserts headers on both an SSR route and a blog route.

**Example:**
```
# public/_headers  (Cloudflare Pages — static output only)
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/blog/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
/en/blog/*
  X-Frame-Options: DENY
  ...
```

### Pattern 5: `trailingSlash: 'always'` over a hand-rolled redirect

**What:** Astro's `trailingSlash: 'always'` config makes the framework canonicalize URLs, rather than implementing the 301 logic by hand in middleware where it can mis-fire on `/assets`, dotted filenames, or `/keystatic`.

**When to use:** As the primary trailing-slash fix. The middleware redirect (Pattern 1) is the secondary net for any SSR route the config doesn't cover.

**Trade-offs:** MEDIUM confidence on the Cloudflare adapter interaction — must be verified in a preview deploy that `/keystatic` and API routes still resolve and that the adapter doesn't double-redirect. Verify before relying on it solely.

### Pattern 6: Dual-build invariance — every change must work under `static` too

**What:** Each change must be classified as "works in both builds" or "Cloudflare-only," and never break the GitHub Pages fallback (`GITHUB_PAGES=true` → `output: 'static'`, `base: '/evolea-website'`, `site: cgjen-box.github.io`).

**Key dual-build implications:**
- **Middleware does nothing in the static build** — there is no Worker. Headers, cache, and trailing-slash redirects from `src/middleware.ts` are absent on GitHub Pages. That's acceptable (GH Pages is a fallback), but it means correctness can't be confirmed on the static build; verify on Cloudflare.
- **`robots.txt.ts` must be `prerender = true`** so it emits a static file in *both* builds. But its `Sitemap:` line and canonical host differ per build: on GH Pages the host is `cgjen-box.github.io/evolea-website`. Derive the URL from `Astro.site`/`import.meta.env.BASE_URL`, never hardcode `www.evolea.ch`, or the fallback build ships a robots.txt pointing at the wrong domain.
- **`base` path prefixing** — any new asset reference (self-hosted fonts, WebP, 404 links, JSON-LD `url`/`logo`) must use `import.meta.env.BASE_URL.replace(/\/$/, '')` or it 404s on GitHub Pages. This is the project's most-repeated existing invariant (see codebase ARCHITECTURE constraint).
- **JSON-LD URLs** must be built from `Astro.site` so they're correct in both builds; a hardcoded `https://www.evolea.ch` in structured data would be wrong on the fallback and is a soft SEO inconsistency even if the fallback is rarely indexed.
- **`public/_headers`** is a Cloudflare-only mechanism; it is inert on GitHub Pages (which has its own, more limited header story). Acceptable for a fallback.

---

## Data Flow

### How a request acquires headers, redirects, and HTML (Cloudflare SSR route)

```
Request /angebote/mini-garten        (no trailing slash)
   │
   ▼  src/middleware.ts → sequence()
   ├─ trailingSlash handler:  not "/", not dotted, no trailing slash
   │                          → return 301 Location: /angebote/mini-garten/   [STOP, no render]
   │
   (client re-requests /angebote/mini-garten/)
   ├─ trailingSlash handler:  ends with "/" → next()
   ├─ keystatic handler:      pathname !startsWith /keystatic → next()
   ├─ securityHeaders handler: res = await next()  ──────────────┐
   │                                                              ▼
   │                                          Astro renders the page:
   │                                          Base.astro <head> emits canonical (normalized),
   │                                          og:url=canonicalURL, OrganizationJsonLd,
   │                                          page emits Service/Breadcrumb JSON-LD
   │                                                              │
   │   ◄──────────────────────────────────────────────────────── res
   │   res.headers.set(security headers); if /assets/* set Cache-Control
   ▼
Response: HTML + security headers + CSP-Report-Only
```

### How a prerendered blog post acquires headers (the exception)

```
Request /blog/exekutive-funktionen/
   │
   ▼  Cloudflare matches a STATIC file in dist/  → middleware NOT invoked
   │
   ▼  public/_headers /blog/* rule applies the security headers
   │
Response: static HTML (JSON-LD + og:type=article were baked in at BUILD time,
          when middleware ran during prerender) + headers from _headers
```

### Key data flows

1. **Header acquisition is route-class-dependent.** On-demand routes get headers from middleware at request time; static routes get them from `public/_headers`. There is no single chokepoint — this is the core integration insight.
2. **Canonical/JSON-LD are render-time, build-or-request agnostic.** They live in the rendered HTML, so they work identically whether a route is prerendered or on-demand. The only requirement is that they be derived from `Astro.site`, not hardcoded.
3. **Trailing-slash normalization happens before render**, so it must run as the first handler in the sequence and must return its Response without calling `next()`.

---

## Scaling Considerations

This is a low-traffic NGO marketing site; classic user-scale concerns don't apply. The relevant axes are build/repo scale and audit-score robustness.

| Axis | Current | Adjustment |
|------|---------|-----------|
| Repo / build artifact size | 124 MB `public/images` (82 MB wrongly-tracked) | Untrack `generated/`, delete unreferenced dirs, WebP-convert → under 10 MB; keeps Cloudflare build under per-file/artifact limits |
| Header maintenance | 0 today | Generate middleware + `_headers` from one constant to prevent drift as routes are added |
| CSP tightening over time | Report-Only at launch | Self-hosting fonts first shrinks the allowlist; review reports ~1 week before flipping to enforce (out of scope here) |

### Scaling priorities

1. **First thing that breaks: header drift between the two mechanisms.** As new SSR routes or static dirs appear, the two header sources diverge. Fix: single source constant + a Playwright header assertion on both a SSR and a static route.
2. **Second: blog-post freshness vs prerender.** New Keystatic posts need a redeploy (existing limitation). Unchanged by this project but worth flagging because the JSON-LD `datePublished` is baked at build time too.

---

## Anti-Patterns

### Anti-Pattern 1: "Set `/assets/*` Cache-Control in middleware"

**What people do:** Add a `/assets/*` branch to `src/middleware.ts` as PROJECT.md's CONCERNS suggested.
**Why it's wrong:** `/assets/*` are prerendered static files served directly by Cloudflare; middleware never runs for them at request time. The branch is dead code and the cache header never ships.
**Do this instead:** Set it in `public/_headers`. Keep middleware for on-demand routes only.

### Anti-Pattern 2: Page-specific JSON-LD in `Base.astro`

**What people do:** Add `BlogPosting`/`Event` schema to the shared layout and prop-drill the data through.
**Why it's wrong:** Couples the layout to every page type's data shape; the layout doesn't have `datePublished`/breadcrumb in scope.
**Do this instead:** Org + WebSite in `Base` (identity, constant); everything entry-specific in the page or in the component that already holds that data (`InnerPageHero` for breadcrumbs).

### Anti-Pattern 3: Reconstructing `new Response` just to add a header

**What people do:** Build a fresh `Response` with copied headers to append one security header.
**Why it's wrong:** Invites the body-consumption / double-`next()` class of bug that already exists in the Keystatic path.
**Do this instead:** Mutate `res.headers` on the response returned by `next()`. Reconstruct only when rewriting the body.

### Anti-Pattern 4: Hardcoding `https://www.evolea.ch` in robots.txt / JSON-LD / canonical

**What people do:** Write the production host as a literal.
**Why it's wrong:** The static fallback build serves from `cgjen-box.github.io/evolea-website`; literals make that build emit wrong sitemap/canonical/structured-data URLs.
**Do this instead:** Derive from `Astro.site` and `import.meta.env.BASE_URL`.

### Anti-Pattern 5: Treating the static build as "verified" for header/redirect work

**What people do:** Run `npm run build` locally (which falls back to static) and assume headers/redirects work.
**Why it's wrong:** Local builds with no Cloudflare adapter produce `output: 'static'` — middleware doesn't run, so the very features under test are absent. Green local build ≠ working headers.
**Do this instead:** Verify header/redirect/CSP behavior on a Cloudflare preview deploy (or `wrangler`/`astro preview` with the adapter) via `curl -I`.

---

## Integration Points

### External services (header/CSP allowlist impact)

| Service | Integration pattern | Notes / CSP impact |
|---------|---------------------|--------------------|
| Formspree | Form POST to `formspree.io` | CSP needs `form-action`/`connect-src formspree.io`; breakage if omitted — start Report-Only |
| Instagram embed | Third-party `<iframe>`/script | `frame-src`/`script-src` for instagram.com/cdninstagram; main reason for Report-Only |
| Google Fonts | `<link>` in `Base.astro` | Self-hosting removes the `fonts.googleapis.com`/`fonts.gstatic.com` allowlist entries → tighter CSP + GDPR win. Do fonts before tightening CSP. |
| Keystatic + GitHub OAuth | `/keystatic/*` SSR route + `api.github.com` PUT | Needs a *looser* CSP (its own UI uses inline styles/scripts); the security-headers handler must skip or relax policy for `/keystatic/*`. The existing Keystatic rewrite branch is where that exception lives. |
| Google Search Console / Bing | Manual sitemap submission | Out of repo; robots.txt `Sitemap:` line + GSC submission are the discovery path |
| @astrojs/sitemap | Build-time `/sitemap-index.xml` | robots.txt references it; add `<link rel="sitemap">` in `Base` head |

### Internal boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| middleware ↔ `security-headers.ts` | direct import of pure constant/fn | Same source feeds `_headers` + tests |
| middleware (sequence) handlers ↔ each other | ordered `next()` chain | trailingSlash → keystatic → securityHeaders |
| `Base.astro` ↔ `OrganizationJsonLd` | component include, data from `settings/site` + `Astro.site` | site-wide identity only |
| page ↔ page-specific JSON-LD | inline in frontmatter or local component | entry data already in scope |
| middleware ↔ `public/_headers` | NO direct link (two mechanisms) | drift risk — guard with a test |

---

## Suggested Build Order (dependencies between work items)

Ordered by dependency and risk. Earlier items unblock or de-risk later ones.

1. **Repo hygiene first (untrack `generated/`, move `tagesschule-hero`, delete dead components/dirs).** Independent, shrinks the build, and removes the fallback-path landmine before image work touches `public/`. No dependency on anything; do it first so later image edits land in a clean tree.
2. **Self-host fonts.** Prerequisite for a tight CSP (removes the Google Fonts origin from the allowlist). Pure `Base.astro` + `global.css` + `public/fonts/` edit. Do before CSP.
3. **Middleware refactor to `sequence()` + fix the double-`next()` Keystatic bug.** Foundational: the seam every header/redirect/cache item plugs into. Fix the existing fragility *before* piling new concerns on. No new behavior yet — pure refactor, verify Keystatic still works.
4. **Security headers + CSP-Report-Only** (in the new `securityHeaders` handler, sourced from `security-headers.ts`), **with the `/keystatic/*` relaxation.** Depends on #2 (fonts) for the allowlist and #3 (sequence) for the seam.
5. **`public/_headers` for `/assets/*` Cache-Control + blog-route security backstop.** Depends on #4 so it shares the same header constant. This closes the prerendered-route gap.
6. **Trailing-slash fix** (`trailingSlash: 'always'` + middleware net) **and canonical/og:url normalization in `Base.astro`.** Independent of headers but touches the same middleware file as #3, so sequence it after the refactor to avoid merge churn. Verify `/keystatic` still resolves.
7. **robots.txt route** (`src/pages/robots.txt.ts`, prerendered, `Astro.site`-derived) **+ `<link rel="sitemap">` in `Base`.** Independent; can run in parallel with headers. Low risk.
8. **JSON-LD: site-wide Org/WebSite in `Base`**, then **per-page BlogPosting/Service/Event/Breadcrumb.** Site-wide first (one place), then fan out to pages. Independent of header work.
9. **WebP conversion + width/height + lazy-loading + LCP preload.** Depends on #1 (clean `public/`) and benefits from #5 (asset cache headers already live). Heaviest perf win.
10. **Branded 404 (`src/pages/404.astro`, DE/EN).** Independent; needs the brand components, prerendered.
11. **a11y fixes (nav aria-labels, contrast).** Independent pure template edits; can slot anywhere, batch near the end before verification.
12. **Playwright smoke tests + header-assertion test (SSR route AND blog route).** Last: needs the routes/headers in place to assert against. The header test is the guard against the #4/#5 drift anti-pattern.

**Critical-path summary:** hygiene → fonts → middleware refactor → headers/CSP → _headers backstop. The SEO (robots, JSON-LD, sitemap link) and perf (WebP) and a11y tracks are largely parallel and depend only on hygiene. Tests come last because they assert the finished behavior.

---

## Sources

- Astro middleware reference & `sequence()` / `next()` / rewrite semantics — https://docs.astro.build/en/guides/middleware/ (via Context7 `/withastro/docs`) — HIGH
- Middleware does NOT run at request time on prerendered pages (build-time only); on-demand routes run per request — https://docs.astro.build/en/guides/on-demand-rendering/ and roadmap discussion https://github.com/withastro/roadmap/discussions/869 — HIGH
- `output: 'server'` + per-page `prerender = true` hybrid behavior — https://docs.astro.build/en/reference/routing-reference/ (via Context7) — HIGH
- Astro built-in `security.csp` / `Astro.csp.insertDirective` (meta-tag CSP, not header-based; informs why this project uses middleware for header-based CSP-RO) — https://docs.astro.build/en/reference/configuration-reference/ (via Context7) — HIGH
- Existing system facts (middleware double-`next()`, prerendered blog, dual-build config, no `_headers`, base-path invariant) — `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md`, `src/middleware.ts`, `astro.config.mjs`, `src/layouts/Base.astro` (read directly, 2026-06-12) — HIGH

---
*Architecture research for: Astro 5 SSR + Cloudflare Pages site quality lift (EVOLEA)*
*Researched: 2026-06-12*
