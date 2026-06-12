# EVOLEA Website Quality Lift (B → A)

## What This Is

A targeted improvement pass on the live EVOLEA website (www.evolea.ch) — a bilingual DE/EN Astro 5.x site for a Swiss non-profit serving children on the autism spectrum or with ADHD. Based on the 2026-06-12 benchmark against eatplanted.com, this project closes the security, SEO, performance, and accessibility gaps to move the site from overall B (~76) to a solid A (90+) and beat eatplanted.com in all four audit categories, plus clears repo hygiene debt found during codebase mapping.

## Core Value

After this project, independent audits (Mozilla Observatory, axe-core, crawler audit) score evolea.ch ahead of eatplanted.com in **all four** categories — security, SEO, performance, accessibility — without regressing any live functionality (forms, CMS, donations, language switching).

## Requirements

### Validated

<!-- Existing capabilities confirmed by codebase map (.planning/codebase/). -->

- ✓ Bilingual DE/EN site with i18n routing (DE default, /en/ prefix) and hreflang (de/en/x-default) — existing
- ✓ SSR on Cloudflare Pages (`output: 'server'`, @astrojs/cloudflare adapter) with static GitHub Pages fallback build — existing
- ✓ Keystatic CMS (GitHub OAuth) with bilingual content collections, wrapped by `src/middleware.ts` — existing
- ✓ Sitemap generation via @astrojs/sitemap (`/sitemap-index.xml`, 56 URLs) — existing
- ✓ Formspree contact forms (DE + EN), donation page with UBS bank details, brand-compliant design system — existing
- ✓ Fast server baseline: TTFB ~120ms, Brotli, ~45KB JS — existing
- ✓ Near-clean accessibility: only 2 axe-core violations remaining — existing

### Active

<!-- Current scope. Building toward these. -->

**Security (Observatory D → ~85+)**
- [ ] Security headers (HSTS, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy) on every SSR response via `src/middleware.ts`
- [ ] CSP in `Content-Security-Policy-Report-Only` mode with allowlist for Formspree, Instagram embed, Google Fonts/inline scripts, and a looser policy for `/keystatic`

**SEO discovery & structured data (biggest gap vs eatplanted)**
- [ ] robots.txt referencing the sitemap (none exists today; also disallow `/keystatic/`)
- [ ] `/sitemap.xml` → `/sitemap-index.xml` redirect + `<link rel="sitemap">` in head; submit in Google Search Console
- [ ] JSON-LD: site-wide `Organization`/`NGO` + `WebSite`; `BlogPosting` (+ `og:type` article) on blog posts; `Service`/`Event` + `BreadcrumbList` on Angebote pages
- [ ] Fix duplicate canonicals: enforce trailing-slash form, 301 the other; use `canonicalURL` for og:url/twitter:url
- [ ] Title tag pattern `<primary keyword> – EVOLEA` on homepage and /angebote/* pages

**Performance (homepage ~7MB → ≤1.5MB)**
- [ ] Convert team/program/blog/logo PNGs to WebP at display size in place (`public/`), with explicit width/height (team ~50–100KB, heroes ≤200KB, logo ≤60KB or SVG)
- [ ] `loading="lazy"` on below-fold images; preload the hero poster (LCP element)
- [ ] `Cache-Control: public, max-age=31536000, immutable` for `/assets/*` via `public/_headers` (research finding: middleware never runs for static assets)

**Accessibility (axe 2 → 0)**
- [ ] aria-labels distinguishing the two `<nav>` landmarks in Header.astro
- [ ] Fix the serious color-contrast violation (evolea-green on light/translucent backgrounds)

**UX**
- [ ] Branded 404 page (DE/EN) with navigation back to Angebote/Blog

**Repo hygiene (from codebase map)**
- [ ] Untrack `public/images/generated/` (82MB committed despite .gitignore); move the referenced tagesschule-hero out first; delete unreferenced `Final images/` (7.2MB) and superseded logo originals
- [ ] Delete dead components (AngeboteSection.astro, TimelineActivities.astro, ProgramCardEnhanced.astro after grep confirmation)
- [ ] Self-host Fredoka/Poppins from `design-system-assets/fonts/` (removes Google Fonts dependency — GDPR + render-blocking)
- [ ] Playwright smoke tests: DE/EN homepage load, contact forms render, donate language switcher, program pages respond 200

### Out of Scope

- **CSP enforcement mode** — needs ≥1 week of Report-Only data first; flip is a follow-up task, not this project
- **Improvement-plan doc "Phase 3" ongoing work** (blog cadence, monthly benchmark monitoring, CrUX/PSI field data) — recurring operations, not one-shot phases. Note: distinct from GSD roadmap Phase 3 (Performance, A11y & Testing), which IS in scope
- **Hero video re-encode (AV1/H.265 ladder)** — Phase 3 item; revisit after image wins land
- **Migrating images to `src/assets` + `<Image />`** — decided against; convert-in-place is faster and avoids template churn on SSR pages
- **FAQPage markup** — Google removed FAQ rich results (May 2026); no SERP value, deprioritized
- **Legacy Tailwind token migration** — separate design-system effort per existing memory rules; don't entangle with audit fixes
- **Replatforming / output mode changes** — everything ships as config or template changes on the current stack

## Context

- Benchmark source: 2026-06-12 crawler audit + axe-core + Mozilla Observatory + lab timing, documented in `evolea-improvement-plan.md` (repo root)
- Codebase map: `.planning/codebase/` (7 docs, mapped 2026-06-12) — verified audit findings against the repo and added hygiene findings
- Key architectural fact: HTML is served by Cloudflare Pages Functions (SSR), so **`public/_headers` does not apply to pages** — response headers must come from `src/middleware.ts` (chosen) or Cloudflare Transform Rules
- `src/middleware.ts` already exists (Keystatic response wrapper) and is the natural injection point for headers and cache rules; note its fragile double-`next()` catch path when editing
- Blog slug pages use `prerender = true` — new Keystatic posts need a redeploy; known limitation, unchanged by this project
- Verification tooling: the plan references `audit_site.py` which is **not in this repo**; verification falls back to `/website-review` skill (Chrome DevTools MCP), `curl -I` header checks, Mozilla Observatory, and Google Rich Results test unless the benchmark script is provided
- Deployment: push to main auto-deploys GitHub Pages (workflow) + Cloudflare Pages (git integration); always verify per CLAUDE.md; gold-standard manual checks listed in CLAUDE.md testing checklist
- Manual external steps requiring the user: Google Search Console + Bing sitemap submission, and reviewing CSP reports after a week

## Constraints

- **Tech stack**: Astro 5.x + Cloudflare Pages SSR — no replatforming; fixes are config/template-level only
- **Brand**: EVOLEA Brand Guide v3.0 is non-negotiable (no emojis, Fredoka headlines, prism gradient heroes, page closers, real photos) — the 404 page and any template edits must comply
- **Bilingual parity**: every user-facing change ships in DE and EN simultaneously; hreflang correctness is an existing advantage to preserve
- **Live site**: production NGO site — changes must not break Formspree forms, Keystatic CMS, donations, or language switching; CSP starts Report-Only for this reason
- **Visual fidelity**: image conversion must not visibly degrade photos (team/program photography is brand-critical)
- **Git**: cgjen-box GitHub account; gitleaks + check_secrets.py pre-commit hooks mandatory; no `--no-verify`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Security headers via Astro middleware + `public/_headers` backstop, not Cloudflare Transform Rules | Versioned in git, testable on preview deploys; middleware covers SSR responses, `_headers` covers static assets and prerendered blog HTML (middleware never runs for those) — single source constant feeds both | — Pending |
| CSP ships Report-Only first | Formspree/Instagram/inline-script/Keystatic breakage risk; enforce after ~1 week of reports | — Pending |
| Convert images in place (sharp/squoosh → WebP in `public/`) | Avoids touching every template; SSR can't transform at request time anyway | — Pending |
| Scope = improvement-plan doc Phases 1+2 + repo hygiene; the doc's "Phase 3" excluded | The doc's P3 is recurring content/monitoring work, not a one-shot project (GSD roadmap Phase 3 = perf/a11y/testing, in scope) | — Pending |
| Cache-Control for `/assets/*` via `public/_headers` (not middleware, not dashboard Cache Rule) | Middleware never fires for static files on Cloudflare Pages; `_headers` is the only in-repo mechanism that reaches them | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-progress` or `/gsd-verify-work`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-12 after initialization*
