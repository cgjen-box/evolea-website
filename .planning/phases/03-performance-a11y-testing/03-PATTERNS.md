# Phase 3: Performance, A11y & Testing - Pattern Map

**Mapped:** 2026-06-12
**Files analyzed:** 14 (4 new, 10 modified groups)
**Analogs found:** 12 / 14 (2 no-analog: playwright.config.ts, tests/headers.spec.ts — RESEARCH.md provides skeletons)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `scripts/convert-images.mjs` (new) | build-tooling script | file I/O / batch | `scripts/gen-headers.mjs` | exact (node .mjs tooling style) |
| `src/pages/404.astro` (new) | page (route) | request-response | `src/pages/kontakt/index.astro` | exact (Base + InnerPageHero page) |
| `tests/smoke.spec.ts` (new) | test | request-response | `scripts/brand-qa.mjs` | role-match (playwright-core script → @playwright/test) |
| `tests/a11y.spec.ts` (new) | test | request-response | `scripts/brand-qa.mjs` (reducedMotion block) + RESEARCH Pattern 4 | role-match |
| `tests/headers.spec.ts` (new) | test | request-response | RESEARCH.md Pattern 5 (no codebase analog) | no-analog |
| `playwright.config.ts` (new) | config | — | RESEARCH.md skeleton (no codebase analog) | no-analog |
| `src/content/settings/images.json` + `team/*.json` + `pages/*.json` (modify) | content data | — | themselves (string value edits) | exact |
| `src/content/blog/*.mdx` + `blogEn/*.mdx` frontmatter (modify) | content data | — | `buchtipp-anders-nicht-falsch.mdx` (already `.webp`) | exact |
| Hardcoded fallbacks: program wrappers, index.astro:80, Header.astro:38, Footer.astro, seo.ts:93, BrandPageBody, spenden/donate, ueber-uns/about (modify) | template/source string edits | — | `src/pages/angebote/mini-garten/index.astro` (fallback pattern) | exact |
| `src/components/Header.astro` nav labels (modify) | component | — | Header.astro:150 (existing bilingual aria-label) | exact |
| 7 `src/components/programs/*Page.astro` breadcrumb navs + hero img (modify) | component | — | `InnerPageHero.astro:90` (labeled nav) + `MiniGartenPage.astro:86` (img) | exact |
| `tailwind.config.mjs` + `src/styles/global.css` green token (modify) | design tokens | — | themselves (dual-file token rule) | exact |
| `src/layouts/Base.astro` preloadImage prop (modify) | layout | — | Base.astro existing Props pattern | exact |
| img attribute work: InnerPageHero, VideoHero, blog/team/index pages, Footer (modify) | components/pages | — | `src/pages/blog/index.astro:52` (lazy pattern) | exact |

## Pattern Assignments

### `scripts/convert-images.mjs` (build tooling, batch file I/O)

**Analog:** `scripts/gen-headers.mjs` — the repo's canonical node tooling style.

**Header/doc-comment + imports pattern** (gen-headers.mjs lines 1-29):
```js
#!/usr/bin/env node
/**
 * public/_headers PARITY CHECKER (not a generator).
 *
 * Reads src/lib/security-headers.ts as TEXT (no TS loader — CI is Node 20),
 * ...what it does, why, and the invocation:
 *   node scripts/gen-headers.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONSTANT_PATH = resolve(ROOT, 'src/lib/security-headers.ts');
```
Copy: shebang, multi-line JSDoc explaining purpose + run command, `node:`-prefixed imports, `ROOT`-relative path resolution (script must work from any cwd).

**Error/exit pattern** (gen-headers.mjs lines 184-195):
```js
if (failures.length > 0) {
  console.error('PARITY FAIL: ...');
  for (const f of failures) console.error(`  - ${f}`);
  console.error('\nFix: ...');
  process.exit(1);
}
console.log('OK: ...');
process.exit(0);
```
Copy: accumulate failures into an array, human-readable diff output, exit 1 on any failure / exit 0 with one OK line. The conversion script should do the same for the two-way grep gate (dangling `.png/.jpg` refs and orphan `.webp` files).

**Core conversion loop:** use the RESEARCH.md Pattern 1 manifest-driven sharp snippet (sharp 0.34.5 already in node_modules via Astro):
```js
import sharp from 'sharp';
const MANIFEST = [
  { src: 'public/images/team/annemarie-elias.png', width: 800 },
  // ... explicit list; NO globbing (orphans + generated/ exist in public/images)
];
for (const { src, width } of MANIFEST) {
  const out = src.replace(/\.(png|jpe?g)$/i, '.webp');
  await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
}
```
Resolve manifest paths via `resolve(ROOT, src)` per the gen-headers convention. Document exclusions (og-default.jpg, qr-code.svg, already-webp blog files, favicons, `generated/`) in the manifest as comments.

**Wiring precedent** (package.json lines 9-11): standalone npm script alias like `"gen:headers": "node scripts/gen-headers.mjs"` → add `"convert:images": "node scripts/convert-images.mjs"` (do NOT chain into `build` — it is a one-off).

---

### `src/pages/404.astro` (page, request-response)

**Analog:** `src/pages/kontakt/index.astro` — closest Base + InnerPageHero page. Caveat: 404 is a SINGLE bilingual page (DE + EN content on one page, per RESEARCH Pattern 2 — the i18n fallback 302-strips `/en/` before 404 renders), so skip the `getLangFromUrl`-driven `getText` machinery and write both languages statically.

**Imports + frontmatter pattern** (kontakt/index.astro lines 1-10):
```astro
---
import Base from '@layouts/Base.astro';
import InnerPageHero from '@components/InnerPageHero.astro';
import { getLangFromUrl, useTranslations, useTranslatedPath } from '@i18n/utils';
import { getEntry } from 'astro:content';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const translatePath = useTranslatedPath(lang);
---
```
For 404: keep `Base` + `InnerPageHero` + `Icon` imports; drop `getEntry`/translations (static content only — V5 rule: never interpolate `Astro.url` into the body). Use `const base = import.meta.env.BASE_URL.replace(/\/$/, '')` for any asset/link hrefs (base-URL invariant).

**Base + InnerPageHero invocation pattern** (kontakt/index.astro lines 47-67):
```astro
<Base
  title={lang === 'de' ? 'Kontakt' : 'Contact'}
  description={...}
  transparentHeader={true}
>
  <InnerPageHero
    title={...}
    subtitle={...}
    breadcrumbs={[
      { label: lang === 'de' ? 'Startseite' : 'Home', href: translatePath('/') },
      { label: lang === 'de' ? 'Kontakt' : 'Contact' }
    ]}
    label={lang === 'de' ? 'Kontakt' : 'Contact'}
    size="sm"
  />
  <section class="py-16 md:py-24">
    <div class="container mx-auto max-w-6xl px-4">
      ...
```
For 404: pass `breadcrumbs={[]}` (RESEARCH-verified: suppresses BreadcrumbList JSON-LD). Title like `"Seite nicht gefunden | Page not found"`. Base auto-appends `| EVOLEA` and gives the FooterDonationCTA page closer + middleware security headers for free. No `prerender` export.

**Icon-link card pattern** (MiniGartenPage.astro lines 106-110 — info card with Icon, reuse for Angebote/Blog link cards):
```astro
<div class="bg-evolea-cream rounded-evolea-lg p-6 text-center">
  <div class="flex justify-center mb-3"><Icon name="sparkle" size="lg" /></div>
  <div class="font-display font-bold text-evolea-purple text-lg">...</div>
  <div class="text-evolea-text-light">...</div>
</div>
```
Link hrefs: DE block → `${base}/angebote/`, `${base}/blog/`; EN block → `${base}/en/programs/`, `${base}/en/blog/`. Buttons use existing `btn-primary` / `btn-secondary` classes (see MiniGartenPage.astro:74-82). No emojis — `Icon.astro` only; Fredoka headlines come via `font-display`.

---

### `tests/smoke.spec.ts` (test, request-response)

**Analog:** `scripts/brand-qa.mjs` — translate its patterns into @playwright/test idiom.

**Route inventory pattern** (brand-qa.mjs lines 19-31):
```js
const ROUTES = [
  { path: '/', label: 'home-de' },
  { path: '/en/', label: 'home-en' },
  { path: '/spenden/', label: 'spenden' },
  { path: '/en/donate/', label: 'donate-en' },
  { path: '/angebote/', label: 'angebote' },
  { path: '/kontakt/', label: 'kontakt' },
  { path: '/blog/', label: 'blog' },
];
```
Extend with the 20 program paths from `src/i18n/utils.ts:62-78` (routeMappings) per the RESEARCH route/selector inventory. Note the analog's `BASE` includes `/evolea-website` (dev-server base); the test suite instead targets `wrangler pages dev dist` where base is `/` — baseURL comes from playwright.config.ts.

**Broken-image / network-failure listener pattern** (brand-qa.mjs lines 71-84) — this is the load-bearing pattern for the dangling-image-reference gate (RESEARCH Pitfall 2):
```js
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => {
  consoleErrors.push(`pageerror: ${err.message}`);
});
page.on('requestfailed', (req) => {
  failedRequests.push(`${req.failure()?.errorText} ${req.url()}`);
});
page.on('response', (resp) => {
  const status = resp.status();
  if (status >= 400) failedRequests.push(`HTTP ${status} ${resp.url()}`);
});
```
In @playwright/test: attach listeners before `page.goto(route)`, then `expect(failedRequests).toEqual([])` — asserting no `/images/...` request returns ≥400 on key pages.

**Interaction-test pattern** (brand-qa.mjs lines 186-214, mobile menu check) — model for the donate language-switcher test:
```js
const mctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
await mpage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await mpage.click('#mobile-menu-btn', { timeout: 5_000 });
```
Donate switcher: goto `/spenden/`, click the LanguagePicker EN link, `expect(page).toHaveURL(/\/en\/donate\/$/)`; reverse direction too. Contact form selector: `form[action^="https://formspree.io/f/"]` (kontakt/index.astro:160). 404 test: `GET /this-page-does-not-exist/` → status 404 + branded content + both DE and EN link sets visible.

---

### `tests/a11y.spec.ts` (test, request-response)

**Analog:** brand-qa.mjs reducedMotion context (lines 156-160) + RESEARCH Pattern 4.

**Reduced-motion precedent** (brand-qa.mjs lines 155-160 — note the comment):
```js
// Note: reducedMotion is a *context* option, not a page option in Playwright.
const rmContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
```
In @playwright/test, `page.emulateMedia({ reducedMotion: 'reduce' })` before `goto` works per-page (RESEARCH Pattern 4) — required to freeze the animated prism gradients for deterministic color-contrast sampling.

**Core axe pattern** (RESEARCH Pattern 4 — copy verbatim, adjust if AxeBuilder API differs at install time):
```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no axe violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```
Scan set: `/`, `/en/`, `/angebote/mini-garten/` (green-badge page), `/kontakt/`, the 404 page.

---

### `tests/headers.spec.ts` + `playwright.config.ts` (no codebase analog)

Use RESEARCH.md Pattern 5 (header-drift guard, routes `/` SSR + `/blog/im-spektrum/` prerendered) and the playwright.config.ts skeleton (baseURL `TEST_BASE_URL || http://127.0.0.1:8788`, `channel: 'chrome'`, webServer `npx wrangler pages dev dist --port 8788`, skipped when TEST_BASE_URL set). Header names/values to assert come from `src/lib/security-headers.ts` (same source gen-headers.mjs parses) — keep the test's REQUIRED map aligned with that constant, and do NOT assert absence of `x-robots-tag` (staging sends noindex). System Chrome path precedent: brand-qa.mjs line 53 (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) — `channel: 'chrome'` is the @playwright/test equivalent. New npm scripts follow the `gen:headers` naming style: `"test:smoke": "playwright test"`.

---

### Image reference updates (content data + hardcoded fallbacks)

**Analog A — CMS JSON string values** (`src/content/settings/images.json` lines 6-16):
```json
"programmeHeroes": {
  "miniGarten": "/images/programs/mini-garten-hero.png",
  "miniProjekte": "/images/programs/mini-projekte-hero.png",
  "tagesschule": "/images/programs/tagesschule-hero.png",
  "angeboteIndex": "/images/hero/evolea-schloss.png",
  "evoleaCafe": "/images/hero/evolea-cafe-hero.png",
  "spenden": "/images/hero/kind-schmetterlinge.png"
}
```
Edit extension in place (`.png` → `.webp`); paths stay root-relative without base prefix (templates add `base +`). Note many keys are `null` — only edit non-null values.

**Analog B — MDX frontmatter, target state already exists** (`src/content/blog/buchtipp-anders-nicht-falsch.mdx` line 6):
```yaml
image: "/images/blog/buchtipp-anders-nicht-falsch.webp"
```
This file is already converted — the other 18 frontmatter `image:` entries (e.g. `belohnung-erziehung.mdx:6` → `"/images/blog/belohnung-erziehung.jpg"`) should match this exact shape.

**Analog C — hardcoded template fallback** (`src/pages/angebote/mini-garten/index.astro` lines 17-19, repeated in all 18 program wrappers):
```ts
const heroImage = siteImages?.programmeHeroes?.miniGarten
  ? base + siteImages.programmeHeroes.miniGarten
  : base + "/images/programs/mini-garten-hero.png";
```
Both the CMS value (Analog A) and the string fallback must change in the same commit. Same pattern at `src/pages/index.astro:80` (`base + "/images/hero-poster.jpg"`), `src/pages/en/index.astro:80`, Header.astro:38 (`/images/logo/evolea-logo-new.png`), Footer.astro logoPath, `src/lib/seo.ts:93` (JSON-LD logo URL), and BrandPageBody.astro:454/457/510/519 etc.

**Pre-existing bug to fix while in there:** `/images/about/children-playing-1.jpg` fallback in ueber-uns + en/about points at a nonexistent file (only `children-playing-2.jpg` exists) — repoint during the sweep.

**Gate (from RESEARCH):** `grep -rn '\.\(png\|jpe\?g\)' src/ --include='*.astro' --include='*.ts' --include='*.json' --include='*.mdx'` must return only documented exclusions, two-way.

---

### `src/components/Header.astro` + program breadcrumb nav labels (A11Y-01)

**Analog — existing bilingual aria-label in the SAME file** (Header.astro line 150):
```astro
aria-label={lang === 'de' ? 'Menü öffnen' : 'Open menu'}
```
Apply identically to the two unlabeled navs:
- Header.astro:99 — `<nav class="header-nav container mx-auto px-4 py-4 flex items-center justify-between">` → add `aria-label={lang === 'de' ? 'Hauptnavigation' : 'Main navigation'}`
- Header.astro:206 — `<nav class="flex flex-col gap-2 mb-auto">` → add `aria-label={lang === 'de' ? 'Mobile Navigation' : 'Mobile navigation'}`

**Analog — labeled breadcrumb nav** (`InnerPageHero.astro` line 90):
```astro
<nav class="hero-breadcrumb hero-breadcrumb-left" aria-label="Breadcrumb">
```
The 7 program components have the unlabeled version (`MiniGartenPage.astro:51`):
```astro
<nav class="mb-8 text-sm text-evolea-text-light">
```
Add `aria-label={lang === 'de' ? 'Brotkrumen' : 'Breadcrumb'}` (the `lang` prop is already in scope in every program component — `const { content, lang, translatePath, heroImage } = Astro.props;` at line 7).

---

### `tailwind.config.mjs` + `src/styles/global.css` green token (A11Y-02)

**Exact edit sites (verified):**
```js
// tailwind.config.mjs:37 — current
green: '#2D7A57',                 // success/WhatsApp green; fixes silent-failure of bg-evolea-green/* used in Footer/kontakt/mini-turnen/spenden
```
```css
/* src/styles/global.css:37 — current */
--evolea-green: #2D7A57;                /* spec do/don't success green; success/WhatsApp accents */
```
Replace `#2D7A57` → `#236247` in BOTH files (dual-token rule from CLAUDE.md + memory: hex literal must stay in tailwind config to preserve `/10` `/20` opacity modifiers — visible consumers: `bg-evolea-green/20 text-evolea-green` badge at MiniGartenPage.astro:63, `bg-evolea-green/10 border-evolea-green` highlight at :153, kontakt WhatsApp card at kontakt/index.astro:118-119). Keep the explanatory inline-comment style. Post-edit gate: `grep -rn '2D7A57' .` → 0 hits.

---

### `src/layouts/Base.astro` preloadImage prop (PERF-03 homepage poster)

**Analog — Base's own Props pattern** (Base.astro lines 19-35):
```astro
interface Props {
  title: string;
  description?: string;
  image?: string;
  transparentHeader?: boolean;
  hideFooterCTA?: boolean;
  ogType?: 'website' | 'article';
}

const {
  title,
  description = '...',
  image = '/images/og-default.jpg',
  transparentHeader = false,
  hideFooterCTA = false,
  ogType = 'website',
} = Astro.props;
```
Add `preloadImage?: string;` to the interface and destructuring (no default), then in `<head>`:
```astro
{preloadImage && <link rel="preload" as="image" href={preloadImage} fetchpriority="high" />}
```
Caller passes the already-base-prefixed poster path it computes (index.astro:80): `posterSrc={siteImages?.startseite?.videoPoster ? base + siteImages.startseite.videoPoster : base + "/images/hero-poster.jpg"}` — pass the same expression as `preloadImage` on `<Base>` in index.astro and en/index.astro. Do NOT re-prefix inside Base (unlike the `image` og prop, which Base prefixes itself at line 51 — `const ogImage = new URL(\`${base}${image}\`, Astro.site)`).

---

### `<img>` attribute work (PERF-02/03)

**Target state analog — below-fold lazy img** (`src/pages/blog/index.astro` lines 52-57, already correct except width/height):
```astro
<img
  src={`${base}${post.data.image}`}
  alt={post.data.title}
  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  loading="lazy"
/>
```
Add `width="1200" height="800"` (per-category constants from RESEARCH Pitfall 5: team 800×996, program heroes 1200×670, blog 1200×800, logo 640×173, poster 1920×943). CSS classes win for display sizing; attributes only seed aspect ratio.

**LCP hero img** (`MiniGartenPage.astro` lines 86-90, currently no attrs — same shape in all 7 program components and `InnerPageHero.astro:120-125`):
```astro
<img
  src={heroImage}
  alt={getText(hero.untertitel, ...)}
  class="rounded-evolea-lg shadow-elevated w-full object-cover aspect-card"
/>
```
→ add `fetchpriority="high" width="1200" height="670"`, no `loading` attr (eager default). InnerPageHero's img already has `loading="eager"` — add `fetchpriority="high"` + dimensions.

**Footer logo** (`Footer.astro` lines 75-81): currently no `loading` attr → add `loading="lazy" width="640" height="173"`. Header logo (via `LogoWithSparkles.astro:20`) stays eager + gets dimensions.

**Video poster** (`VideoHero.astro` lines 37-47): `poster={posterSrc}` on the `<video>` — leave untouched (poster can't take fetchpriority; the Base preloadImage link covers it). Never lazy the video.

## Shared Patterns

### Bilingual conditional text (apply to 404 page, aria-labels)
**Source:** ubiquitous — e.g. Header.astro:150, MiniGartenPage.astro:52
```astro
{lang === 'de' ? 'Startseite' : 'Home'}
```

### Base-URL prefix invariant (apply to 404 links, any new asset path)
**Source:** every page, e.g. `src/pages/angebote/mini-garten/index.astro:9`
```ts
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
// then: base + "/images/..."  and  href={`${base}/blog/`}
```

### Tooling script failure accumulation (apply to convert-images grep gate)
**Source:** `scripts/gen-headers.mjs:34,184-195` — `const failures = []` → print all → `process.exit(failures.length > 0 ? 1 : 0)` (brand-qa.mjs:236 uses the same exit convention).

### Decorative elements need aria-hidden (apply to any 404 decoration)
**Source:** VideoHero.astro:51 `<div class="hero-video-overlay" aria-hidden="true"></div>`; MiniRestaurantPage.astro:111 `<img ... aria-hidden="true" />`.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `playwright.config.ts` | config | — | First @playwright/test usage in repo; use RESEARCH.md skeleton (TEST_BASE_URL override, wrangler webServer, channel: 'chrome') |
| `tests/headers.spec.ts` | test | request-response | No HTTP-header tests exist; use RESEARCH.md Pattern 5; header truth source = `src/lib/security-headers.ts` |

## Metadata

**Analog search scope:** `scripts/`, `src/pages/`, `src/components/`, `src/components/programs/`, `src/layouts/`, `src/content/`, `src/lib/`, `src/styles/`, root configs
**Files scanned:** ~25 read/grepped (gen-headers.mjs, brand-qa.mjs, MiniGartenPage.astro, kontakt/index.astro, Header.astro, InnerPageHero.astro, VideoHero.astro, Base.astro, Footer.astro, index.astro, blog/team indexes, mini-garten wrapper, images.json, blog MDX, tailwind.config.mjs, global.css, seo.ts, package.json)
**Pattern extraction date:** 2026-06-12
