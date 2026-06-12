# Phase 1: Foundation & Security - Context

**Gathered:** 2026-06-12
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — smart discuss skipped grey areas)

<domain>
## Phase Boundary

A safe, decomposed middleware and a clean repo deliver security headers and long-cache assets on every response path, raising the Mozilla Observatory grade from D to ~A without breaking forms, Keystatic, or the static fallback build.

In scope: security headers (HSTS without preload, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy), CSP Report-Only with `/api/csp-report` sink, `Cache-Control` immutable for `/assets/*`, middleware refactor to `sequence()` (fixing the double-`next()` catch path), self-hosted Fredoka/Poppins fonts, untracking `public/images/generated/` (82MB), deleting `Final images/` and superseded logo originals, deleting dead components (AngeboteSection.astro, TimelineActivities.astro, ProgramCardEnhanced.astro after grep confirmation), relocating the tagesschule-hero to `public/images/programs/`.

Out of scope: CSP enforcement mode (v2), SEO/structured data (Phase 2), image WebP conversion, 404 page, Playwright tests (Phase 3).

</domain>

<decisions>
## Implementation Decisions

### Security headers architecture (locked at project level)
- Headers via Astro middleware + `public/_headers` backstop, NOT Cloudflare Transform Rules — versioned in git, testable on preview deploys
- One source constant (`src/lib/security-headers.ts`) feeds both middleware and `_headers` to prevent drift (the `_headers` file is generated/checked from the constant)
- `public/_headers` is the ONLY mechanism that reaches static assets and prerendered blog HTML — middleware never runs for those on Cloudflare Pages
- Cache-Control for `/assets/*` via `public/_headers` (not middleware, not dashboard Cache Rule)
- HSTS without `preload` directive

### CSP (locked at project level)
- Ships `Content-Security-Policy-Report-Only` only; enforcement deferred to v2 after ~1 week of reports
- Allowlist must cover: Formspree, Instagram embed, inline scripts currently in use; looser policy for `/keystatic`
- Report sink is an in-stack endpoint `/api/csp-report` (Astro API route, SSR)

### Middleware refactor
- Decompose via Astro `sequence()` — separate concerns (security headers / Keystatic HTML injection)
- Fix the fragile double-`next()` call in the existing catch path
- Keystatic injection behavior must be preserved exactly (deploy-button hide, save toasts)

### Fonts
- Self-host Fredoka/Poppins from `design-system-assets/fonts/` into `public/fonts/` via `@font-face`; remove Google Fonts `<link>` from Base.astro (GDPR + render-blocking win)
- Visual parity required — same families/weights as currently loaded from Google Fonts

### Repo hygiene
- Untrack `public/images/generated/` (gitignored but 82MB committed) — move the referenced tagesschule-hero into `public/images/programs/` FIRST, update DE+EN references, then `git rm -r --cached`
- Delete unreferenced `Final images/` (7.2MB) and superseded logo originals
- Delete dead components only after grep confirms zero references
- Untracking removes from HEAD; history rewrite is explicitly NOT in scope

### Claude's Discretion
- Exact CSP directive values (derive from actual page sources/embeds in the codebase)
- Permissions-Policy directive set (sensible deny-by-default for unused features)
- Font subsetting/woff2 details, exact `@font-face` declarations
- `_headers` generation/parity mechanism (build script vs checked-in file + test)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/middleware.ts` exists (Keystatic response wrapper) — the natural injection point; note its fragile double-`next()` catch path
- `design-system-assets/fonts/` already contains Fredoka/Poppins font files
- Codebase maps in `.planning/codebase/` (ARCHITECTURE, CONVENTIONS, CONCERNS, STRUCTURE, STACK, INTEGRATIONS, TESTING)

### Established Patterns
- Dual build: `npm run build` (Cloudflare SSR) and `GITHUB_PAGES=true npm run build` (static, base `/evolea-website`) must BOTH stay green — every change verified against both
- Blog slug pages use `export const prerender = true` → served as static HTML, middleware never touches them → `_headers` must carry their security headers
- `import.meta.env.BASE_URL.replace(/\/$/, '')` prefix pattern for all asset paths (GitHub Pages base)
- Pre-commit: gitleaks + `scripts/check_secrets.py` + `npm run build`; no `--no-verify`

### Integration Points
- `src/layouts/Base.astro` — Google Fonts `<link>` lives here; replace with `@font-face` (likely in `src/styles/global.css`) + preload
- `public/_headers` — new file, Cloudflare Pages native header config
- `src/pages/api/csp-report.ts` — new SSR endpoint (must be excluded from prerender; check GITHUB_PAGES static build handling)
- `wrangler.toml` — `nodejs_compat`, compatibility_date 2025-04-01

</code_context>

<specifics>
## Specific Ideas

- Success criterion demands header parity check on BOTH an SSR route and a prerendered blog route (`curl -I`) — drift between middleware and `_headers` is the named failure mode
- Keystatic, Formspree, and Instagram embed must show zero CSP-blocked-resource console errors under Report-Only
- Verification on a Cloudflare preview deploy, never `astro dev` (middleware/CSP only observable there)

</specifics>

<deferred>
## Deferred Ideas

- CSP enforcement flip (v2, after ≥1 week Report-Only data)
- Git history rewrite to purge the 82MB blob history (BFG/git-filter-repo) — only untracking is in scope

</deferred>
