---
phase: 02-seo-structured-data
verified: 2026-06-12T19:48:50Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Load /angebote/mini-garten/ in the Google Rich Results Test and verify BreadcrumbList detected"
    expected: "Rich result type 'Breadcrumbs' detected with items: Startseite, Angebote, Mini Garten"
    why_human: "Google Rich Results Test requires a live URL and a browser UI; cannot be verified by grep on static build"
  - test: "Load /blog/<any-post>/ in the Google Rich Results Test and verify BlogPosting detected"
    expected: "Rich result type 'Article' detected with headline, publisher, datePublished (when post has pubDate)"
    why_human: "Requires live URL and Google's parser; og:type=article and JSON-LD source-verified but Rich Results rendering needs the tool"
  - test: "Load /angebote/evolea-cafe/ in the Google Rich Results Test and verify Event detected"
    expected: "Rich result type 'Event' detected; startDate is a future 2nd-Wednesday (day-of-month 8-14) at 20:00 +01:00 or +02:00"
    why_human: "Event startDate is computed at SSR/build time; Google's validator is needed to confirm the computed date is accepted and not flagged as past"
  - test: "Open https://www.evolea.ch/robots.txt and verify the Allow + Sitemap variant is served"
    expected: "User-agent: * / Allow: / / Disallow: /keystatic/ / Disallow: /api/ / Sitemap: https://www.evolea.ch/sitemap-index.xml"
    why_human: "The Allow variant is only served by the Cloudflare SSR build on the exact production hostname; production URL required"
  - test: "Open https://a32f5bde.evolea-website.pages.dev/robots.txt (staging) and confirm Disallow: /"
    expected: "User-agent: * / Disallow: /"
    why_human: "Orchestrator live evidence confirms this but formal sign-off recommended; staging URL required"
---

# Phase 2: SEO & Structured Data Verification Report

**Phase Goal:** A single canonical URL form is enforced and every page emits correct discovery metadata and valid structured data, so the site passes Google's Rich Results test and closes the largest SEO gap versus eatplanted.com.
**Verified:** 2026-06-12T19:48:50Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (5 Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Production robots.txt serves Allow + Sitemap + Disallow /keystatic/; staging hosts serve Disallow /; /sitemap.xml 301-redirects to /sitemap-index.xml; rel=sitemap in every head | VERIFIED | `src/pages/robots.txt.ts` line 23: `isProd = __SSR_BUILD__ && url.hostname === PROD_HOST`; lines 27-31: Allow+Sitemap variant; line 34: deny variant; `astro.config.mjs` lines 47-50: `/sitemap.xml` 301 redirect; `src/layouts/Base.astro` line 76: `rel="sitemap"` present |
| 2 | Every page resolves to one trailing-slash canonical (other form 301s, no loop); og:url/twitter:url match canonicalURL | VERIFIED | `src/middleware.ts` lines 101-122: trailingSlash middleware with exemptions and open-redirect collapse (`replace(/^\/+/, '/')`); `src/layouts/Base.astro` lines 45-48: slash-normalized `canonicalPath`; lines 84/92: `og:url` and `twitter:url` both bound to `canonicalURL`; orchestrator live evidence: `/angebote` 301 to `/angebote/`, canonical matches, no loop |
| 3 | Google Rich Results test passes for homepage (NGO/WebSite), blog post (BlogPosting + og:type=article), Angebote page (Service + BreadcrumbList), EVOLEA Cafe page (Event) | VERIFIED (automated) / HUMAN NEEDED (Rich Results UI) | Source-level: `src/lib/seo.ts` exports all 6 schema builders (lines 31-297); `src/layouts/Base.astro` line 98 emits siteGraph; `src/pages/blog/[...slug].astro` line 93: `ogType="article"`; all 7 program components import and emit breadcrumbSchema+serviceSchema; `src/components/CafePage.astro` lines 5-6,50: cafeEventSchema; orchestrator JSON parse check confirmed valid ld+json on /, /angebote/mini-garten/, /angebote/evolea-cafe/, /blog/im-spektrum/, /en/programs/mini-garden/ |
| 4 | Homepage and /angebote/* titles follow `primary keyword – EVOLEA` in both DE and EN | VERIFIED | DE homepage: `src/pages/index.astro` line 71: `title="Förderung für Kinder im Autismus-Spektrum in Zürich"`; EN homepage: `src/pages/en/index.astro` line 71: `title="Programs for Children on the Autism Spectrum in Zurich"`; all 9 program wrappers contain `seoTitle` ternary with locked keywords; `src/layouts/Base.astro` emits `– EVOLEA` suffix (4 occurrences, 0 pipe separators confirmed) |
| 5 | npm run build and GITHUB_PAGES=true npm run build both stay green | VERIFIED | Orchestrator live evidence: both builds exit 0 after final merge; byte-identical wrapper pairs confirmed (angebote/index.astro = en/programs/index.astro; mini-garten = mini-garden; evolea-cafe = evolea-cafe) |

**Score:** 5/5 truths verified (human verification pending for Google Rich Results UI confirmation)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/seo.ts` | PROD_HOST + ORG_ID + WEBSITE_ID + 5 schema builders (298 lines) | VERIFIED | All 8 named exports present (lines 31, 39, 44, 73, 131, 154, 182, 223, 266); 298 lines — substantive; no SearchAction, no nonprofitStatus; streetAddress appears once only in NGO node (line 99) |
| `src/components/JsonLd.astro` | Escaped ld+json emission component | VERIFIED | `application/ld+json` + `is:inline set:html` + `\\u003c` escape pattern all present; `interface Props` defined |
| `src/layouts/Base.astro` | siteGraph emission + ogType prop + canonical fixes + rel=sitemap + noindex guard | VERIFIED | Imports JsonLd + siteGraph; line 98: `<JsonLd schema={siteGraph(...)}`; ogType prop in interface (line 25), destructs with default 'website' (line 34), wires to og:type (line 83); 4x `– EVOLEA` separator, 0x `| EVOLEA`; line 76: rel=sitemap; line 69: `!__SSR_BUILD__` noindex guard |
| `src/pages/robots.txt.ts` | Hostname-keyed robots endpoint | VERIFIED | PROD_HOST imported from `@/lib/seo` (not duplicated); `prerender = !__SSR_BUILD__`; isProd dual-gates on SSR+hostname; production body has Allow+Sitemap; deny body is the fallback |
| `src/middleware.ts` | trailingSlash first in sequence(); X-Robots-Tag for non-prod hosts | VERIFIED | Line 201: `sequence(trailingSlash, securityHeaders, keystaticEnhancements)`; exemptions: /api/, /keystatic, /_prefix; `replace(/^\/+/, '/')` open-redirect guard; lines 141-143: X-Robots-Tag conditioned on `hostname !== PROD_HOST` |
| `astro.config.mjs` | /sitemap.xml 301 redirect + brand filter | VERIFIED | Lines 47-50: `/sitemap.xml` redirect with status 301; line 54: `filter: (page) => !page.includes('/brand/')` |
| `src/components/InnerPageHero.astro` | BreadcrumbList from breadcrumbs prop | VERIFIED | Imports JsonLd + breadcrumbSchema; line 60: `{breadcrumbs.length > 0 && <JsonLd schema={breadcrumbSchema(breadcrumbs, Astro.site)} />}` — emitted ONCE outside image-vs-no-image conditional |
| `src/components/programs/MiniGartenPage.astro` | BreadcrumbList + Service JSON-LD | VERIFIED | Lines 58-59: both JsonLd renders; serviceSchema with minAge:3 maxAge:6; breadcrumb items mirror visible nav |
| `src/components/programs/MiniProjektePage.astro` | BreadcrumbList + Service JSON-LD | VERIFIED | Lines 77-78; minAge:5 maxAge:8 |
| `src/components/programs/MiniTurnenPage.astro` | BreadcrumbList + Service JSON-LD | VERIFIED | Lines 59-60; minAge:5 maxAge:8 |
| `src/components/programs/TagesschulePage.astro` | BreadcrumbList + Service JSON-LD (no audience) | VERIFIED | Lines 56-57; no minAge/maxAge per plan — serviceSchema omits audience block |
| `src/components/programs/MiniAbenteuercampPage.astro` | BreadcrumbList + Service JSON-LD | VERIFIED | Lines 82-83; minAge:5 maxAge:10 |
| `src/components/programs/MiniMuseumPage.astro` | BreadcrumbList + Service JSON-LD | VERIFIED | Lines 82-83; minAge:5 maxAge:8 |
| `src/components/programs/MiniRestaurantPage.astro` | BreadcrumbList + Service JSON-LD | VERIFIED | Lines 128-129; minAge:5 maxAge:8 |
| `src/components/CafePage.astro` | Recurring Event JSON-LD; NO BreadcrumbList | VERIFIED | Lines 5-6: cafeEventSchema imported; line 50: `<JsonLd schema={cafeEventSchema({ lang, description: eventDescription })} />`; no breadcrumbSchema import; city-level address only (no streetAddress in Event node) |
| `src/pages/blog/[...slug].astro` | BlogPosting + BreadcrumbList + ogType=article | VERIFIED | Line 7: both schema imports; lines 72-82: blogPostingSchema with hasValidPubDate gate; lines 85-90: breadcrumbItems mirroring visible nav; line 93: `ogType="article"` |
| `src/pages/en/blog/[...slug].astro` | EN BlogPosting + BreadcrumbList + ogType=article | VERIFIED | Same pattern; line 86: `label: 'Home'` (EN label); line 93: `ogType="article"` |
| All 10 program wrapper pages (DE + EN) | seoTitle keyword titles decoupled from CMS | VERIFIED | All 10 program wrappers contain `const seoTitle = lang === 'de' ? '...' : '...'` with locked title table values; `<Base title={seoTitle} ...>`; no CMS hero.titel feeds the Base title prop |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/middleware.ts` | `src/lib/seo.ts` | PROD_HOST named import | VERIFIED | Line 7: `import { PROD_HOST } from '@/lib/seo'`; used line 141 |
| `src/pages/robots.txt.ts` | sitemap-index.xml | Sitemap: line built from `new URL('sitemap-index.xml', site)` | VERIFIED | Line 31 of robots.txt.ts; pattern `sitemap-index.xml` present |
| `src/layouts/Base.astro` | `canonicalURL` | og:url and twitter:url both render canonicalURL | VERIFIED | Line 84: `content={canonicalURL}`, line 92: `content={canonicalURL}` |
| `src/layouts/Base.astro` | `src/lib/seo.ts` | siteGraph import + JsonLd render | VERIFIED | Line 9 import, line 98 usage |
| `src/components/InnerPageHero.astro` | `src/lib/seo.ts` | breadcrumbSchema import | VERIFIED | Line 17: `import { breadcrumbSchema } from '@/lib/seo'` |
| `src/components/programs/*.astro` | ORG_ID @graph anchor emitted by Base | provider: `{'@id': ORG_ID}` in serviceSchema | VERIFIED | ORG_ID is `https://www.evolea.ch/#organization`; serviceSchema line 196: `provider: { '@id': ORG_ID }` — resolves against Base siteGraph on every page |
| `src/pages/blog/[...slug].astro` | `src/lib/seo.ts` | blogPostingSchema/breadcrumbSchema imports | VERIFIED | Line 7 import; lines 72-90 usage |
| `src/components/CafePage.astro` | ORG_ID @graph anchor emitted by Base | organizer: `{'@id': ORG_ID}` in cafeEventSchema | VERIFIED | cafeEventSchema line 289: `organizer: { '@id': ORG_ID }` |
| blog templates | `src/layouts/Base.astro` | ogType="article" prop (from plan 02-01) | VERIFIED | `ogType="article"` on both DE and EN blog `<Base>` invocations |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `src/layouts/Base.astro` | siteSettings | `await getEntry('settings', 'site')` line 37-38 | Yes — CMS entry with kontakt/adresse/social fields; siteGraph has literal fallbacks for every field | FLOWING |
| `src/components/CafePage.astro` | eventDescription | `getText(hero.tagline, fallback)` line 40-45; `hero = content?.hero` from CMS prop | Yes — CMS text with hardcoded bilingual fallback when absent | FLOWING |
| `src/pages/blog/[...slug].astro` | postSchema.datePublished | `pubDate.toISOString()` gated on `hasValidPubDate` | Yes — from post.data.pubDate; key omitted (not "Invalid Date" string) when date is invalid | FLOWING |
| `src/lib/seo.ts` `nextCafeDate()` | startDate in cafeEventSchema | Pure computation; no CMS dependency | Yes — algorithm verified: for reference date 2026-06-12, June 10 is past, produces 2026-07-08T20:00:00+02:00 (day 8, Wednesday, future) | FLOWING |

### Behavioral Spot-Checks

Step 7b: Behavioral spot-checks skipped — no locally runnable server. Both `npm run build` and `GITHUB_PAGES=true npm run build` exit 0 per orchestrator live evidence. The orchestrator ran JSON parse checks on every ld+json block across 5 representative pages (/, /angebote/mini-garten/, /angebote/evolea-cafe/, /blog/im-spektrum/, /en/programs/mini-garden/) with zero parse errors.

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All ld+json blocks parse as valid JSON | `python json.loads` on every ld+json block | 0 parse errors across 5 pages | PASS (orchestrator evidence) |
| /sitemap.xml redirects | `curl -sI /sitemap.xml` | HTTP/2 301, location: /sitemap-index.xml | PASS (orchestrator evidence) |
| Trailing-slash 301 | `curl -sI /angebote` | HTTP/2 301, location: /angebote/ | PASS (orchestrator evidence) |
| staging robots.txt deny | `/robots.txt` on *.pages.dev | Disallow: / | PASS (orchestrator evidence) |
| staging X-Robots-Tag noindex | `curl -sI /` on staging | x-robots-tag: noindex | PASS (orchestrator evidence) |
| canonical + og:url on /angebote/ | head tag inspection | both = https://www.evolea.ch/angebote/ (trailing slash, production host) | PASS (orchestrator evidence) |
| /api/csp-report exemption | POST /api/csp-report | 204 | PASS (orchestrator evidence) |
| /keystatic exemption | GET /keystatic | 200 | PASS (orchestrator evidence) |

### Probe Execution

Step 7c: No `scripts/*/tests/probe-*.sh` files exist in this repository. No probes declared in PLAN or SUMMARY files. Section skipped.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SEO-01 | 02-01 | Hostname-aware robots.txt | SATISFIED | robots.txt.ts: default-deny, production Allow+Sitemap variant; orchestrator confirm |
| SEO-02 | 02-01 | /sitemap.xml 301 + rel=sitemap in head | SATISFIED | astro.config.mjs redirect + Base.astro rel=sitemap |
| SEO-03 | 02-01 | Canonical trailing slash + og:url unified | SATISFIED | trailingSlash middleware; slash-normalized canonicalURL; og:url/twitter:url wired to canonicalURL |
| SEO-04 | 02-02 | Site-wide NGO + WebSite JSON-LD with stable @id | SATISFIED | siteGraph emitted from Base.astro line 98; ORG_ID/WEBSITE_ID pinned production literals |
| SEO-05 | 02-05 | BlogPosting JSON-LD + og:type=article | SATISFIED | blogPostingSchema on both DE/EN blog templates; ogType="article" prop wired |
| SEO-06 | 02-04 + 02-05 | BreadcrumbList on all InnerPageHero consumers + program pages | SATISFIED | InnerPageHero emits one BreadcrumbList per page; all 7 program components emit matching BreadcrumbList; blog templates emit matching BreadcrumbList; CafePage correctly has none |
| SEO-07 | 02-04 | Service JSON-LD on all program pages | SATISFIED | All 7 program body components emit serviceSchema with provider @id = ORG_ID |
| SEO-08 | 02-05 | EVOLEA Cafe recurring Event JSON-LD | SATISFIED | CafePage emits cafeEventSchema; city-level address only (D3); computed future startDate (nextCafeDate algorithm verified); no BreadcrumbList |
| SEO-09 | 02-03 | Homepage + /angebote/* titles follow keyword – EVOLEA | SATISFIED | All 10 page pairs (homepage + 9 angebote routes) contain hardcoded seoTitle ternaries with locked keywords; Base appends – EVOLEA suffix |

**Coverage:** 9/9 SEO requirements satisfied.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/CafePage.astro` | 12 | `const getText = (value: any, ...)` | INFO | Known repo anti-pattern (documented in CLAUDE.md and MEMORY.md); CMS schema uses z.any(); not introduced by this phase |

No TBD, FIXME, XXX, HACK, or PLACEHOLDER markers found in any file modified by Phase 2. No unreferenced debt markers.

The `any` type in CafePage.astro is a known pre-existing pattern across all program body components where Keystatic CMS content fields use `z.any()` schemas — this was pre-existing before Phase 2 and is not actionable here.

### Human Verification Required

The 5 must-haves are all source-verified. The following items require a live URL and browser-based tools — automated grep cannot substitute:

#### 1. Google Rich Results Test — BreadcrumbList on Angebote

**Test:** Open https://search.google.com/test/rich-results and enter `https://www.evolea.ch/angebote/mini-garten/`
**Expected:** Rich result type "Breadcrumbs" detected; items: Startseite / Angebote / Mini Garten (or similar)
**Why human:** Google's Rich Results Test parses the deployed SSR page including JSON-LD blocks; cannot be verified by static file grep

#### 2. Google Rich Results Test — BlogPosting

**Test:** Open the Rich Results Test and enter a DE blog post URL, e.g. `https://www.evolea.ch/blog/im-spektrum/`
**Expected:** Rich result type "Article" detected; datePublished present (when post has a valid date); publisher and headline present
**Why human:** Requires live URL and Google's parser

#### 3. Google Rich Results Test — Event on Cafe page

**Test:** Open the Rich Results Test and enter `https://www.evolea.ch/angebote/evolea-cafe/`
**Expected:** Rich result type "Event" detected; startDate is a future 2nd Wednesday at 20:00; no "event is in the past" warning
**Why human:** Computed Event startDate is an SSR value; Google's validator needed to confirm acceptance; Search Console should be monitored for RESEARCH Pitfall 6 warnings

#### 4. Production robots.txt Allow variant

**Test:** `curl https://www.evolea.ch/robots.txt`
**Expected:** `User-agent: *`, `Allow: /`, `Disallow: /keystatic/`, `Disallow: /api/`, `Sitemap: https://www.evolea.ch/sitemap-index.xml`
**Why human:** Only observable on the production Cloudflare SSR build (requires merge to main + deployment)

#### 5. Staging robots.txt deny variant (Cloudflare preview confirmation)

**Test:** `curl https://a32f5bde.evolea-website.pages.dev/robots.txt` (or current preview URL)
**Expected:** `User-agent: *`, `Disallow: /`
**Why human:** Orchestrator captured this on a preview deploy; formal human sign-off closes the loop before declaring SEO-01 production-confirmed

### Gaps Summary

No gaps found. All 5 roadmap success criteria are source-verified. All 9 SEO requirements (SEO-01 through SEO-09) are satisfied. Both build modes are green per orchestrator evidence. The phase status is `human_needed` solely because the roadmap success criterion 3 ("Google Rich Results test passes") requires the live Google Rich Results Test tool — this is a verification-method gap, not an implementation gap.

**Notable confirmed implementation decisions:**
- Service schema has no Google Rich Result type (Google dropped it); BreadcrumbList is the supported Rich Result on Angebote pages — this was the planned approach (RESEARCH Pitfall 8, accepted at planning time).
- streetAddress appears in the NGO Organization node only (line 99 of seo.ts); the Event location has city-level address only, no streetAddress — D3 constraint respected.
- nextCafeDate algorithm correctly produces 2026-07-08T20:00:00+02:00 as the next future 2nd Wednesday from reference date 2026-06-12.
- Deferred item (not a gap): street-address upgrade for Cafe Event venue is documented as deferred (D3); no remediation needed in this phase.
- Content todo (not a gap): stale CMS dates in `evolea-cafe.json` need a user CMS update; Event startDate is computed so the JSON-LD is unaffected.

---

_Verified: 2026-06-12T19:48:50Z_
_Verifier: Claude (gsd-verifier)_
