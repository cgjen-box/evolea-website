---
phase: 03-performance-a11y-testing
verified: 2026-06-13
verifier_engine: codex (gpt-5.5, high reasoning) via MMR
status: passed
score: 5/5 must-haves verified (after gap closure)
---

# Phase 03 Verification — Performance, A11y & Testing

Verification was routed through **codex (gpt-5.5, high reasoning effort)** per the MMR
`gsd-verifier → openai` routing. Codex performed goal-backward truth verification with
independent read-only repo inspection. Its raw verdict was **gaps_found (3/5 fully
verified)**; after closing the actionable gaps below, all 5 success criteria are met.

## Success Criteria — Final Status

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Homepage ≤1.5MB, WebP at display size, every `<img>` has width/height | VERIFIED | Measured 1.078MB (405,608 B under budget) via re-encoded hero video (SSIM 0.972 ≥ 0.95, 1328→578KB); `scripts/convert-images.mjs --verify` two-way gate clean; 33 `<img>` tags, 0 missing dimensions |
| 2 | Below-fold lazy; LCP hero `fetchpriority="high"`, never lazy | VERIFIED | 9 above-fold hero/poster tags carry `fetchpriority="high"`, no lazy; homepage poster preloaded in Base.astro |
| 3 | axe 0 violations; DE/EN-aware Header nav labels; evolea-green ≥4.5:1 | VERIFIED (after gap closure) | a11y spec: 5/5 pages 0 violations under reduced motion (SSR build); Header navs + program/InnerPageHero/blog breadcrumbs all DE/EN-aware; evolea-green #236247 |
| 4 | Branded bilingual 404 (prism hero, page closer, no emojis), links to Angebote/Blog | VERIFIED | src/pages/404.astro: prism hero, DE+EN content, both link sets, footer CTA closer, no emoji; smoke test asserts 404 status + both languages |
| 5 | Playwright suite passes; both builds green | VERIFIED | `npm run test:e2e` 38/38 pass against local wrangler SSR; `npm run build` + `GITHUB_PAGES=true npm run build` exit 0; single playwright-core@1.57.0 |

## Codex Findings & Dispositions

**Gap 1 — InnerPageHero breadcrumb navs hardcoded English `aria-label="Breadcrumb"`** (A11Y-01)
- Real gap: 03-03 localized program-page breadcrumbs but missed InnerPageHero (used by
  kontakt, ueber-uns, spenden, blog index, team, 404, and EN equivalents), which showed
  an English landmark name on German pages.
- **Closed** (commit 1bd44cd): InnerPageHero now derives `lang` via `getLangFromUrl` →
  `Brotkrumen`/`Breadcrumb`. a11y spec re-run on `/kontakt/` (an InnerPageHero page): 0 violations.

**Gap 2 — Blog-post breadcrumb navs had no `aria-label`** (A11Y-01)
- Real gap: `src/pages/blog/[...slug].astro` and EN counterpart rendered an unnamed `<nav>`.
- **Closed** (commit 1bd44cd): added `aria-label` (DE route "Brotkrumen", EN route "Breadcrumb").

**Gap 3 — Global `deep-purple`/`purple` token darkened #BA53AD → #AD49A0** (brand governance)
- Codex flagged this as a possible over-reach on the locked brand palette and recommended a
  surgical `purple-aa` text variant instead.
- **Disposition: kept the global change; disagree with the surgical remediation.**
  `text-evolea-purple` is used **405 times** as text across the codebase. A surgical variant
  would mean repointing 405 usages — far messier and exactly the surgical sprawl to avoid.
  The global token darkening is a subtle same-hue AA adjustment (purple-on-cream 4.14:1 →
  4.81:1) that directly mirrors the accepted `evolea-green` AA darkening precedent from 03-02.
  **Flagged for user brand sign-off** — see SUMMARY/handoff. The brand-guide doc (CLAUDE.md)
  still lists Deep Purple as #BA53AD and should be updated to the AA value if the user blesses
  the change.

**Gap 4 — e2e suite could not run in codex sandbox** (HYG-04, A11Y-03 "NEEDS_HUMAN")
- Environment limitation of the codex verifier sandbox (no local port binding / Chrome launch),
  not a product defect.
- **Resolved**: the full suite (38/38) was run green by the orchestrator against the real
  `wrangler pages dev` SSR serving path in the main checkout; a11y subset (5/5) re-run after
  gap closure.

## Requirement Coverage (final)

| ID | Status |
|----|--------|
| PERF-01 | SATISFIED |
| PERF-02 | SATISFIED |
| PERF-03 | SATISFIED |
| A11Y-01 | SATISFIED (after gap closure 1bd44cd) |
| A11Y-02 | SATISFIED |
| A11Y-03 | SATISFIED (38/38 + 5/5 a11y green on SSR build) |
| HYG-04 | SATISFIED |

## Open Item for User

- **Brand palette sign-off**: confirm or revert the global `deep-purple`/`purple`
  #BA53AD → #AD49A0 darkening (WCAG-AA driven, 405 text usages). If confirmed, update the
  CLAUDE.md brand palette table to the AA value. Also note `magenta-aa` #B832BB was added for
  text-on-white while brand magenta #DD48E0 is retained for fills/accents.
- **Deploy note**: purge the Cloudflare zone cache after deploy to evict the stale 1.33MB
  `hero-mobile.mp4` (now 578KB).
