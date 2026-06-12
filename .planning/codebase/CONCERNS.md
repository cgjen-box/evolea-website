# Codebase Concerns

**Analysis Date:** 2026-06-12

---

## Security Considerations

### No Security Headers on SSR Responses

**Risk:** Browsers receive no Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, or Permissions-Policy headers on any server-rendered response. The site is fully clickjackable and has no XSS mitigation layer.

**Files:** `src/middleware.ts`, `public/_headers` (absent), `wrangler.toml`

**Root cause:** `public/_headers` does not exist. Even if it were created, Cloudflare Pages only applies `_headers` rules to static assets served from `dist/`. All SSR responses (which is every page on the Cloudflare build due to `output: 'server'` in `astro.config.mjs`) bypass `_headers` entirely and go through the Cloudflare Worker. The only place to inject response headers for SSR is inside `src/middleware.ts` or via a `_routes.json` + Worker configuration.

**Current mitigation:** None.

**Fix approach:** Add a `onRequest` branch in `src/middleware.ts` that appends security headers to every non-Keystatic HTML response before returning it. The middleware already wraps Keystatic responses; extend the same pattern to all other routes. Example headers to add: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`.

---

### Formspree Endpoint ID Hardcoded as Fallback in Two Pages

**Risk:** The Formspree form ID `xpznqrjk` is hardcoded as a fallback string in both `src/pages/kontakt/index.astro:44` and `src/pages/en/contact/index.astro:44`. If the CMS entry is ever missing, form submissions still go to a specific endpoint — which is correct — but the value is duplicated rather than sourced from one place, creating a risk of the pages diverging silently.

**Files:** `src/pages/kontakt/index.astro`, `src/pages/en/contact/index.astro`, `src/content/pages/contact.json`

**Current mitigation:** The canonical value is in `src/content/pages/contact.json:47`. Both pages read it correctly when the CMS entry exists.

**Fix approach:** Remove the hardcoded fallback from both page files, or extract the fallback to a shared constant in `src/i18n/utils.ts`.

---

## Performance Bottlenecks

### Uncompressed Team PNGs Served as-is (~4.4 MB total, 3 files)

**Problem:** Three team member photos are served as unoptimized PNGs directly from `public/images/team/`. They are loaded via raw `<img>` tags with no Astro image optimization pipeline. No WebP conversion, no responsive `srcset`, no width/height hints.

**Files:** `src/pages/team/index.astro:63`, `public/images/team/annemarie-elias.png` (1.6 MB), `public/images/team/gianna-spiess.png` (1.4 MB), `public/images/team/christoph-jenny.png` (1.4 MB)

**Cause:** Images were placed in `public/` rather than `src/assets/`, which bypasses Astro's `<Image>` component optimization. The team page renders a 2-column grid of aspect-square cards — all three PNGs are fetched on page load.

**Improvement path:** Move images to `src/assets/images/team/` or keep in `public/` and use `<Image>` from `astro:assets` with `width`, `height`, and `format="webp"`. Target output size per image: under 100 KB at 800×800px.

---

### Active Logo PNG is 704 KB; Two Superseded 2.2 MB Originals Still Committed

**Problem:** `public/images/logo/evolea-logo-new.png` (704 KB) is the active logo loaded in both `src/components/Header.astro:38` and `src/components/Footer.astro:31` on every page. Two older originals — `Evolea New Logo.png` (2.2 MB) and `Evolea Logo.png` (2.1 MB) — remain committed and served from `public/images/logo/` even though no source file references them.

**Files:** `public/images/logo/evolea-logo-new.png`, `public/images/logo/Evolea New Logo.png`, `public/images/logo/Evolea Logo.png`

**Improvement path:** (1) Convert `evolea-logo-new.png` to WebP (target: under 60 KB at display dimensions). (2) Delete the two unreferenced originals (`Evolea New Logo.png`, `Evolea Logo.png`) — confirmed unused by grep.

---

### Program Hero Images Are Unoptimized PNGs (831 KB – 1.6 MB each)

**Problem:** Five program hero images in `public/images/programs/` are large unoptimized PNGs. They are used via raw `<img>` or inline style references in program page components.

**Files:**
- `public/images/programs/sports.png` (1.6 MB)
- `public/images/programs/mini-abenteuercamp-hero.png` (1.0 MB)
- `public/images/programs/mini-projekte-hero.png` (980 KB)
- `public/images/programs/mini-museum-hero.png` (940 KB)
- `public/images/programs/mini-garten-hero.png` (902 KB)
- `public/images/programs/mini-turnen-hero.png` (831 KB)

**Improvement path:** Convert to WebP, apply responsive `srcset`, target under 200 KB per hero at full desktop width. Move to `src/assets/` to use Astro's image pipeline.

---

### Blog Images Include Unoptimized PNGs (2.7 MB, 2.5 MB)

**Problem:** Two blog images are very large uncompressed PNGs that are loaded as featured images on the blog listing page and individual post pages.

**Files:** `public/images/blog/exekutive-funktionen.png` (2.7 MB), `public/images/blog/soziale-kompetenzen.png` (2.5 MB)

**Improvement path:** Convert to WebP or JPEG with quality 80. These are used as 16:9 thumbnails (h-48 card thumbnail), so even 600×340px at 80% quality would suffice.

---

### Google Fonts External Load Dependency (Render-Blocking Risk)

**Problem:** `src/layouts/Base.astro:81` loads Fredoka and Poppins from `fonts.googleapis.com` on every page. Self-hosted font files for both families already exist in `design-system-assets/fonts/` but are not deployed to `public/fonts/`. This creates a privacy dependency on Google (GDPR consideration for Swiss/EU users) and a potential render-blocking request.

**Files:** `src/layouts/Base.astro:77-83`, `design-system-assets/fonts/` (Fredoka-Bold.woff2, Fredoka-SemiBold.woff2, Poppins-Medium.woff2, Poppins-Regular.woff2, Poppins-SemiBold.woff2)

**Improvement path:** Copy `design-system-assets/fonts/*.woff2` to `public/fonts/`, add `@font-face` declarations in `src/styles/global.css`, and remove the Google Fonts `<link>` tags from `Base.astro`. Adds GDPR compliance and eliminates the external render-blocking request.

---

### Hashed /assets/* Cache TTL is ~4 Hours (Cloudflare Default)

**Problem:** Astro emits hashed asset filenames (e.g., `/assets/index.XXXXXXXX.js`) which are safe to cache indefinitely. However, without explicit `Cache-Control` headers in middleware or a Cloudflare cache rule, these assets default to Cloudflare's short TTL (~4 hours). This means repeat visitors re-download all JS/CSS on every cache purge or deployment.

**Files:** `src/middleware.ts` (no cache header logic), `wrangler.toml` (no cache rules)

**Improvement path:** In `src/middleware.ts`, add `Cache-Control: public, max-age=31536000, immutable` for any request where `url.pathname.startsWith('/assets/')`. Alternatively, create a Cloudflare Cache Rule in the dashboard for `evolea.ch/assets/*` with `Edge Cache TTL: 1 year`.

---

## Technical Debt

### No robots.txt (Sitemap Not Referenced by Crawlers)

**Problem:** No `robots.txt` file exists anywhere in the repo. The sitemap (`/sitemap-index.xml`) is generated by `@astrojs/sitemap` and confirmed present in `dist/`, but search engines discover it only if referenced in `robots.txt` or submitted manually. Without `robots.txt`, there is also no way to disallow crawling of `/keystatic/`, `/brand/`, or other non-public paths.

**Files:** `public/` (no robots.txt), `dist/sitemap-0.xml`, `dist/sitemap-index.xml`

**Fix approach:** Create `src/pages/robots.txt.ts` as a dynamic route that returns a `text/plain` response with `Sitemap: https://www.evolea.ch/sitemap-index.xml` and `Disallow: /keystatic/` at minimum. Alternatively, place a static `public/robots.txt`.

---

### No JSON-LD Structured Data Anywhere

**Problem:** No page includes `application/ld+json` structured data. The site is for a registered Swiss non-profit (Verein) offering educational programs. Relevant schema types that are entirely absent: `Organization`, `LocalBusiness` / `EducationalOrganization`, `Event` (for EVOLEA Cafe), `BlogPosting` (blog posts), `BreadcrumbList` (breadcrumbs are rendered visually but not in structured data).

**Files:** `src/layouts/Base.astro` (no JSON-LD injection), all page files

**Fix approach:** Add `Organization` + `EducationalOrganization` schema in `Base.astro` for site-wide presence. Add `BlogPosting` schema in `src/pages/blog/[...slug].astro`. Add `BreadcrumbList` in `src/components/InnerPageHero.astro` since it already renders breadcrumb nav.

---

### og:url and twitter:url Use Astro.url (Request URL) Instead of canonicalURL

**Problem:** In `src/layouts/Base.astro:59` and `:67`, `og:url` and `twitter:url` are set to `{Astro.url}` — the raw request URL including any query parameters or Cloudflare-injected context. The canonical URL is already computed on line 31 as `new URL(Astro.url.pathname, Astro.site)`. Using `Astro.url` means OG previews may contain non-canonical URLs (e.g., with `?via=cf-worker` parameters).

**Files:** `src/layouts/Base.astro:59, :67`

**Fix approach:** Change both to `{canonicalURL}`. One-line fix.

---

### Hardcoded Brand Values in Header and Footer (Not Token-Driven)

**Problem:** The gold donate button gradient in `src/components/Header.astro` hardcodes `#E8B86D` four times (lines 764, 767, 801, 804) in inline `<style>` blocks rather than referencing the Tailwind token `evolea-gold` or the CSS variable `--evolea-gold`. If the gold spec value changes, these inline styles would silently diverge from the design system.

**Files:** `src/components/Header.astro:764, 767, 801, 804`

**Fix approach:** Replace hex literals with `var(--evolea-gold)` in the `<style>` block. The CSS variable `--evolea-gold` is defined in `src/styles/global.css`.

---

### Legacy Dead Component: AngeboteSection.astro

**Problem:** `src/components/AngeboteSection.astro` (756 lines) is a superseded version of the programs section. The active version is `AngeboteSectionV3.astro`. `AngeboteSection.astro` is not imported anywhere in `src/pages/` or any active component. It remains committed at 756 lines with no consumers.

**Files:** `src/components/AngeboteSection.astro`

**Fix approach:** Confirm zero usages with grep (verified: only self-referencing comment), then delete the file.

---

### Legacy Dead Component: ProgramCardEnhanced.astro

**Problem:** `src/components/ProgramCardEnhanced.astro` contains a hardcoded German string (`Mehr erfahren`) and has no confirmed active consumers. No page or component imports it.

**Files:** `src/components/ProgramCardEnhanced.astro`

**Fix approach:** Verify with grep, delete if confirmed unused.

---

### Legacy Design Tokens in tailwind.config.mjs

**Problem:** The Tailwind config declares 10 "LEGACY" tokens explicitly marked for removal: `magenta-light`, `mint-light`, `coral-light`, `coral-dark`, `yellow-vivid`, `pink-light`, `sky-vivid`, `teal`, `orange`, `charcoal-light`. These are still actively used in components (34 usages found), preventing cleanup. `evolea-teal` and `evolea-coral-dark` are used in `src/components/ValuePillar.astro:15-21`; `evolea-orange` is used heavily in `src/components/programs/MiniProjektePage.astro` and `src/components/Footer.astro`.

**Files:** `tailwind.config.mjs:53-67`, `src/components/ValuePillar.astro`, `src/components/programs/MiniProjektePage.astro`, `src/components/Footer.astro`

**Fix approach:** Per the "conservative token migration" memory rule: map each legacy token to its spec canonical equivalent (e.g., `teal` → `mint`, `coral-dark` → `coral`, `orange` → `coral`), update all usages in one pass, then remove the legacy entries from `tailwind.config.mjs`. Do not delete tokens before confirming zero usages via grep.

---

### Unicode Checkmark ✓ Used Instead of SVG Icon Component

**Problem:** `src/components/programs/MiniGartenPage.astro` uses literal `✓` unicode characters as bullet checkmarks (lines 199–226). `src/components/programs/MiniMuseumPage.astro:297` and `src/components/programs/MiniTurnenPage.astro:145-150` also use `✓`. This violates Brand Commandment #1 (NEVER use emojis anywhere; use SVG icons only). While `✓` is not an emoji, it is a unicode symbol rather than an SVG icon.

**Files:** `src/components/programs/MiniGartenPage.astro:199-226`, `src/components/programs/MiniMuseumPage.astro:297`, `src/components/programs/MiniTurnenPage.astro:145-150`

**Fix approach:** Replace `<span>✓</span>` with `<Icon name="check" size="xs" />`. The `check` icon is available in `src/components/Icon.astro`.

---

### Arrow → Used as Decorative Element in Button Text

**Problem:** `src/components/TimelineActivities.astro:67,98` and `src/components/AngeboteSectionV3.astro:82,103,124` use `→` as decorative suffix in link/button text (`Mehr →`, `Mehr erfahren →`). This is a unicode character rather than an SVG arrow icon, and the TimelineActivities component hardcodes German strings (`Mehr erfahren`, `Informationen für Eltern`) without using `t()` translations, meaning the component renders German text on the English homepage.

**Files:** `src/components/TimelineActivities.astro:67,98,128,153`, `src/components/AngeboteSectionV3.astro:82,103,124`

**Severity:** The TimelineActivities component is no longer imported anywhere (confirmed), making this a dead-code issue. `AngeboteSectionV3.astro` uses `getText()` for button text via CMS so the `→` there is cosmetic.

---

### TimelineActivities.astro is a Dead Component with Hardcoded German

**Problem:** `src/components/TimelineActivities.astro` (646 lines) has hardcoded German strings not wrapped in `t()` or `getText()`, and it is not imported or used by any active page. The homepage uses `AngeboteSectionV3.astro` directly.

**Files:** `src/components/TimelineActivities.astro`

**Fix approach:** Confirm zero imports with grep (verified), then delete.

---

### Generated Images Committed to Git Despite .gitignore Entry

**Problem:** `public/images/generated/` is listed in `.gitignore`, but 26 files in that directory are committed and tracked in git (confirmed via `git ls-files`). This is a gitignore bypass from a past `git add --force` or `git add -f`. The directory contains AI-generated working images (timestamped variants, logo experiments) that add ~82 MB to the repository and are served publicly as static assets.

**Files:** `public/images/generated/` (26 tracked files, 82 MB on disk)

**Cause:** The `.gitignore` rule was added after the files were committed, or files were force-added. The gitignore has no effect on already-tracked files.

**Fix approach:** Run `git rm -r --cached public/images/generated/` to untrack the directory while keeping files on disk. Only final images that are actively referenced by source files should be re-committed to tracked locations.

---

### Tagesschule Page References Generated Image as Fallback

**Problem:** `src/pages/angebote/tagesschule/index.astro:20` and `src/pages/en/programs/day-school/index.astro:20` fall back to `/images/generated/tagesschule-hero.png` if the CMS settings entry is missing. The file exists currently (committed despite the gitignore), but if the generated/ directory is ever cleaned, the fallback path would silently 404.

**Files:** `src/pages/angebote/tagesschule/index.astro:20`, `src/pages/en/programs/day-school/index.astro:20`

**Fix approach:** Move `tagesschule-hero.png` to `public/images/programs/` alongside the other program heroes, update the fallback path, and remove the generated/ reference.

---

### Public Image Directory Contains Unreferenced "Final images" Folder

**Problem:** `public/images/Final images/` (7.2 MB) contains subdirectories (`Evolea-Cafe-Hero/`, `Homepage-Hero/`, `Programs/`, `Spenden-Hero/`) that appear to be intermediate production candidates. No source file references any path within this directory (confirmed by grep). These files are served publicly as static assets at URLs containing spaces.

**Files:** `public/images/Final images/` (7.2 MB, entirely unreferenced)

**Fix approach:** Verify all contents are unused, then delete the directory.

---

## Known Bugs

### /blog and /blog/ May Return Duplicate Content (No Trailing-Slash Redirect)

**Problem:** Astro's default output mode does not enforce a trailing-slash redirect. On the Cloudflare SSR build, `/blog` (no trailing slash) and `/blog/` (trailing slash) are served as separate routes. The canonical URL computed in `Base.astro:31` always uses `Astro.url.pathname`, so a request to `/blog` produces `canonical: https://www.evolea.ch/blog` while `/blog/` produces `canonical: https://www.evolea.ch/blog/`. This is a split-canonical issue that can suppress the page in Google Search.

**Files:** `src/layouts/Base.astro:31`, `src/pages/blog/index.astro`

**Fix approach:** Add a redirect rule in `src/middleware.ts` that redirects any path matching `/[a-z]` (no trailing slash) to `path + '/'`, or configure Cloudflare redirect rules for the domain. Alternatively, add `trailingSlash: 'always'` to `astro.config.mjs` (but verify compatibility with the Cloudflare adapter).

---

### No Custom 404 Page

**Problem:** There is no `src/pages/404.astro` file. No 404 page exists anywhere in the source tree or dist. Cloudflare Pages falls back to its default unstyled error page when a route is not found, which breaks brand experience and provides no navigation back to the site.

**Files:** `src/pages/` (absent), `dist/` (absent)

**Fix approach:** Create `src/pages/404.astro` using `Base.astro` layout with the EVOLEA brand hero, a friendly "page not found" message in both DE and EN, and links back to the homepage and programs page.

---

## Accessibility Concerns

### Two Nav Elements Without Distinguishing aria-label

**Problem:** `src/components/Header.astro` contains two `<nav>` elements (line 99: desktop nav, line 206: mobile menu nav). Neither has an `aria-label` attribute. Screen readers announce both as "navigation" with no way to distinguish them. This is likely one of the axe-core landmark violations.

**Files:** `src/components/Header.astro:99, :206`

**Fix approach:** Add `aria-label={lang === 'de' ? 'Hauptnavigation' : 'Main navigation'}` to the desktop nav (line 99) and `aria-label={lang === 'de' ? 'Mobilmenü' : 'Mobile menu'}` to the mobile nav (line 206).

---

### Color Contrast: evolea-green (#2D7A57) on Light Backgrounds

**Problem:** Several program components use `text-evolea-green` (`#2D7A57`) on white or cream backgrounds for small badge text and bullet symbols. At small font sizes (text-sm, 14px), this combination may fail WCAG AA 4.5:1 contrast ratio depending on exact background color. The axe-core audit flagged one color-contrast violation.

**Files:** `src/components/programs/MiniGartenPage.astro:45,74,128,199-226`, `src/components/programs/MiniMuseumPage.astro:68,100,142`, `src/content/pages/mini-abenteuercamp.json:85-86`

**Fix approach:** Check `text-evolea-green` on `bg-evolea-green/20` (badge background) — the reduced opacity background lowers the effective contrast of the text. Use a darker green or increase font weight (font-semibold) to meet contrast requirements. Run axe-core on `/angebote/mini-garten/` to confirm the exact violation.

---

## Fragile Areas

### Middleware Mutates HTML String with String Replacement

**Problem:** `src/middleware.ts:102-106` injects the Keystatic enhancement script by doing a string `.replace('</body>', script + '</body>')` on the raw HTML text. This fails silently if the `</body>` tag is missing, minified differently, or contains unexpected whitespace. The fallback on line 115 (`return next()`) re-calls `next()` after the response has already been consumed via `.text()`, which may return a consumed-stream error in some Cloudflare runtime versions.

**Files:** `src/middleware.ts:99-117`

**Why fragile:** Double `next()` call on catch path (lines 113-116) — a consumed body is re-read; this is only safe because Cloudflare Workers buffer the body, but it's not guaranteed behavior.

**Safe modification:** Wrap the catch block to return the already-failed response rather than calling `next()` again. Or use a `Response` clone before calling `.text()`.

---

### SSR + prerender = true on Blog Slug Pages

**Problem:** `src/pages/blog/[...slug].astro:12` and `src/pages/en/blog/[...slug].astro:9` set `export const prerender = true` in a `server` output build. This is valid in Astro's hybrid mode, but the project's `output: 'server'` in `astro.config.mjs` (line 38) means these pages are expected to be statically prerendered at build time. If a new blog post is added via Keystatic CMS, the static prerender means the new post is not served until the next full Cloudflare Pages build is triggered.

**Files:** `src/pages/blog/[...slug].astro:12`, `src/pages/en/blog/[...slug].astro:9`, `astro.config.mjs:38`

**Why fragile:** Content editors using Keystatic CMS expect live content updates, but prerendered pages require a new deployment. There is no incremental static regeneration (ISR) on Cloudflare Pages.

**Safe modification:** Either document this limitation in the CMS (editors must trigger a deployment after publishing), or remove `prerender = true` and serve blog posts dynamically from the SSR worker.

---

## Scaling Limits

### Public Image Directory is 124 MB (Including 82 MB Untracked Generated Images)

**Current state:** `public/images/` total is 124 MB on disk, of which ~82 MB is in `public/images/generated/` (tracked in git despite `.gitignore`). This inflates the repository size and Cloudflare Pages build artifact size.

**Limit:** Cloudflare Pages has a 25 MB limit per file and a build artifact limit. Very large repos slow CI build cache hydration.

**Scaling path:** Untrack `public/images/generated/`, delete `public/images/Final images/` (7.2 MB, unreferenced), and convert PNGs to WebP. Expected result: repository drops by ~90 MB, `public/images/` shrinks to under 10 MB.

---

## Test Coverage Gaps

### No Automated Tests at All

**What's not tested:** There are no unit tests, integration tests, or E2E tests anywhere in the repository. `playwright-core` is in `devDependencies` but there is no `playwright.config.ts` or test file. The testing checklist in `CLAUDE.md` is entirely manual.

**Files:** Entire `src/` directory (zero `.test.` or `.spec.` files)

**Risk:** Component regressions, i18n route breakage, and form submission failures go undetected until manual QA or user reports.

**Priority:** High — at minimum, Playwright smoke tests for (1) homepage loads in DE and EN, (2) both contact forms render, (3) donate page language switcher works, (4) all program pages respond 200.

---

*Concerns audit: 2026-06-12*
