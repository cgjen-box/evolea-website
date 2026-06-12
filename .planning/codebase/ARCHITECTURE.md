<!-- refreshed: 2026-06-12 -->
# Architecture

**Analysis Date:** 2026-06-12

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    Astro 5 Page Layer                               │
│   src/pages/           src/pages/en/                                │
│   (DE default, no      (EN physical files,                          │
│    prefix)              /en/ prefix)                                │
└────────┬────────────────────────┬───────────────────────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│               Layout + Component Layer                              │
│   src/layouts/Base.astro  (single layout, wraps all pages)          │
│   src/components/         (shared UI, program page bodies)          │
└────────┬────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│               i18n + Content Layer                                  │
│   src/i18n/ui.ts          (static string translations DE/EN)        │
│   src/i18n/utils.ts       (getLangFromUrl, routeMappings, hreflang) │
│   src/content/            (Keystatic-managed JSON + MDX collections)│
└────────┬────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│               Build + Runtime Layer                                 │
│   Cloudflare build:  GITHUB_PAGES unset → output:'server'           │
│   GitHub Pages build: GITHUB_PAGES=true → output:'static'          │
│   src/middleware.ts  (Keystatic CMS enhancements for /keystatic/*)  │
│   public/_redirects  (Cloudflare legacy-URL redirect rules)        │
│   astro.config.mjs   (astro.config redirect: EN cafe route)        │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Base.astro | Single layout: `<head>`, `<Header>`, `<main slot>`, `<FooterDonationCTA>`, `<Footer>`, GSAP bootstrap | `src/layouts/Base.astro` |
| Header.astro | Fixed navbar with scroll-hide/show, prism gradient on scroll, mobile full-screen overlay, gold Spenden button | `src/components/Header.astro` |
| Footer.astro | Site footer, links, language picker | `src/components/Footer.astro` |
| FooterDonationCTA.astro | Gold gradient CTA above footer (hidden on donate pages via `hideFooterCTA` prop on Base) | `src/components/FooterDonationCTA.astro` |
| Icon.astro | SVG icon system (~35 named icons, gradient support) | `src/components/Icon.astro` |
| VideoHero.astro | Homepage video background hero | `src/components/VideoHero.astro` |
| InnerPageHero.astro | Gradient hero for inner pages | `src/components/InnerPageHero.astro` |
| AngeboteSectionV3.astro | Programs grid used on both DE and EN homepages | `src/components/AngeboteSectionV3.astro` |
| FloatingShapes.astro | Decorative SVG background shapes | `src/components/FloatingShapes.astro` |
| GradientCTA.astro | Reusable call-to-action section block | `src/components/GradientCTA.astro` |
| EditLink.astro | Keystatic edit button (only shown on staging, not production) | `src/components/EditLink.astro` |
| LanguagePicker.astro | DE/EN switcher using `getAlternatePath` | `src/components/LanguagePicker.astro` |
| Program page bodies | One component per program page, shared by DE and EN page wrappers | `src/components/programs/*.astro` |
| i18n/utils.ts | `getLangFromUrl`, `useTranslations`, `useTranslatedPath`, `routeMappings`, `getAlternatePath`, `getLanguageAlternates` | `src/i18n/utils.ts` |
| middleware.ts | Injects Keystatic UI enhancements into `/keystatic/*` HTML responses | `src/middleware.ts` |

## Pattern Overview

**Overall:** Island Architecture (Astro) with bilingual static/SSR dual-build and CMS-managed content

**Key Characteristics:**
- Single `Base.astro` layout wraps every page; no other layouts exist
- DE pages live at root (`/`), EN pages live at `/en/`; DE is the Astro `defaultLocale`
- Program pages use a "thin wrapper + shared body component" pattern: both `src/pages/angebote/mini-garten/index.astro` and `src/pages/en/programs/mini-garden/index.astro` are byte-identical thin wrappers that both render `src/components/programs/MiniGartenPage.astro` — bilingual rendering is handled inside the component via `lang` prop
- CMS content is stored as JSON/MDX under `src/content/`; pages pull it at render time via `getEntry`/`getCollection` from `astro:content`
- React is included (`@astrojs/react`) but Astro components are the primary authoring format
- GSAP is used for scroll animations; initialized in `Base.astro` via `src/scripts/gsap-animations.ts`

## Layers

**Page Layer:**
- Purpose: URL routing. Each file = one route. Thin frontmatter only — no inline business logic.
- Location: `src/pages/` (DE) and `src/pages/en/` (EN)
- Contains: Route entrypoints, `getStaticPaths` for blog dynamic routes (`export const prerender = true`)
- Depends on: Layout, Components, i18n utils, content collections
- Used by: Astro build router

**Layout Layer:**
- Purpose: Shared HTML shell for every page
- Location: `src/layouts/Base.astro`
- Contains: `<head>` meta/SEO/hreflang, skip link, Header, Footer, FooterDonationCTA, GSAP bootstrap
- Depends on: i18n utils (lang detection), content `settings/site` singleton, Header, Footer, FooterDonationCTA, global.css
- Props: `title`, `description?`, `image?`, `transparentHeader?`, `hideFooterCTA?`

**Component Layer:**
- Purpose: Reusable UI. Program page bodies are full-page components shared across DE/EN wrappers.
- Location: `src/components/`, `src/components/programs/`, `src/components/brand/`
- Depends on: i18n utils (lang detection from URL), Icon.astro, content collections

**i18n Layer:**
- Purpose: Language detection, string translation, path translation, route mappings, hreflang generation
- Location: `src/i18n/ui.ts`, `src/i18n/utils.ts`
- `ui.ts`: Static key-value string table for DE and EN
- `utils.ts`: `getLangFromUrl` strips base URL before language prefix detection; `routeMappings` maps between DE slugs (`/spenden/`, `/angebote/mini-garten/`) and EN slugs (`/en/donate/`, `/en/programs/mini-garden/`) bidirectionally

**Content Layer:**
- Purpose: CMS-managed structured data and MDX blog posts
- Location: `src/content/`
- Collections: `blog` (DE MDX), `blogEn` (EN MDX), `team`, `programs`, `principles`, `testimonials`, `pages` (singletons), `settings`
- Schema: `src/content/config.ts` defines Zod schemas; bilingual fields use `{ de?: string; en?: string }` objects
- Managed via: Keystatic CMS at `/keystatic/` (GitHub OAuth, GitHub-mode storage — commits directly to repo)

**Middleware Layer:**
- Purpose: Request interception for Keystatic CMS pages only
- Location: `src/middleware.ts`
- Intercepts: All `GET /keystatic/*` HTML responses; injects client-side JS that hides the Deploy button and adds save-success/failure toasts
- All other requests pass through unmodified

## Data Flow

### Standard Page Request (Cloudflare SSR)

1. Request arrives at Cloudflare Pages Worker (`/angebote/mini-garten/`)
2. Middleware (`src/middleware.ts`) checks `url.pathname` — passes through (not `/keystatic/`)
3. Astro routes to `src/pages/angebote/mini-garten/index.astro`
4. Page frontmatter calls `getLangFromUrl(Astro.url)` → `'de'`
5. Page calls `getEntry('pages', 'mini-garten')` and `getEntry('settings', 'images')` from content layer
6. Page renders `<Base>` layout wrapping `<MiniGartenPage content={page} lang={lang} translatePath={...} />`
7. `Base.astro` loads `settings/site` singleton, calls `getLanguageAlternates` for hreflang, outputs full HTML

### Blog Dynamic Route (prerendered SSR)

1. At build time, `src/pages/blog/[...slug].astro` exports `getStaticPaths()` via `getCollection('blog')`
2. Each blog post gets a pre-generated HTML page at `/blog/{slug}/`
3. `export const prerender = true` forces static generation even in SSR mode

### Language Switch

1. User clicks language switcher; `LanguagePicker.astro` calls `getAlternatePath(Astro.url)`
2. `getAlternatePath` strips base path, checks `routeMappings` for DE↔EN slug difference
3. Mapped: `/spenden/` → `/en/donate/`; unmapped: `/blog/` → `/en/blog/`
4. Cloudflare `_redirects` handles legacy `/en/angebote/*` URLs with 301s to `/en/programs/*`

### CMS Edit Flow

1. Editor opens `/keystatic/` on `evolea-website.pages.dev` (staging only — `EditLink.astro` hides button on production)
2. Middleware injects enhancement script to hide Deploy button and add save toasts
3. Keystatic commits JSON/MDX changes directly to the `main` branch on GitHub
4. Cloudflare Pages detects push → triggers new build automatically

### Dual Build Mode

| Variable | Output | Adapter | Site URL | Base Path |
|----------|--------|---------|----------|-----------|
| `GITHUB_PAGES=true` | `static` | None | `https://cgjen-box.github.io` | `/evolea-website` |
| (unset, Cloudflare) | `server` | `@astrojs/cloudflare` | `https://www.evolea.ch` | `/` |

The `astro.config.mjs` dynamically imports the Cloudflare adapter at build time. If `@astrojs/cloudflare` is absent (local dev without it installed) and `CF_PAGES !== '1'`, it silently falls back to static. On actual Cloudflare Pages builds (`CF_PAGES=1`), a missing adapter throws and fails the build intentionally.

**State Management:**
- No client-side state store. All state is URL-driven (lang from `Astro.url.pathname`). CMS content is read at render time from `src/content/` files. GSAP scroll state is ephemeral in-memory.

## Key Abstractions

**Bilingual Text Object:**
- Purpose: Represents content that has both a German and English version
- Pattern: `{ de?: string; en?: string }` — used throughout `src/content/config.ts` schemas and CMS JSON files
- Helper: `const getText = (obj, fallback) => lang === 'de' ? (obj.de || fallback) : (obj.en || obj.de || fallback)` — defined inline in each page/component (not centralized)

**Route Mappings:**
- Purpose: Tracks DE↔EN slug differences where paths differ by more than a language prefix
- Location: `src/i18n/utils.ts` (`routeMappings` constant)
- Example: DE `/spenden/` ↔ EN `/en/donate/`; DE `/angebote/mini-garten/` ↔ EN `/en/programs/mini-garden/`
- Used by: `useTranslatedPath`, `getAlternatePath`, `getLanguageAlternates`

**Program Page Body Components:**
- Purpose: Each program has a full-page body component shared by both DE and EN wrapper pages
- Location: `src/components/programs/*.astro`
- Pattern: Component receives `content`, `lang`, `translatePath`, `heroImage` as props and handles bilingual rendering internally using `getText(obj, fallback)`

**Content Singletons:**
- Purpose: CMS-managed page-level content overrides (hero text, section descriptions)
- Collections: `pages/homepage.json`, `pages/mini-garten.json`, `settings/site.json`, `settings/images.json`
- Access: `await getEntry('pages', 'homepage')` or `await getEntry('settings', 'site')`
- All fields are optional; every use provides a hardcoded fallback string

## Entry Points

**DE Homepage:**
- Location: `src/pages/index.astro`
- Triggers: Request to `/` (Cloudflare) or `/evolea-website/` (GitHub Pages)

**EN Homepage:**
- Location: `src/pages/en/index.astro`
- Triggers: Request to `/en/`
- Note: This is a physical file, not an Astro i18n fallback

**Blog Dynamic Routes:**
- Location: `src/pages/blog/[...slug].astro` (DE), `src/pages/en/blog/[...slug].astro` (EN)
- Triggers: `getStaticPaths()` over `getCollection('blog')` / `getCollection('blogEn')`

**Donation Page:**
- DE: `src/pages/spenden.astro` → URL `/spenden/`
- EN: `src/pages/en/donate.astro` → URL `/en/donate/`
- Base layout used with `hideFooterCTA={true}`

**Keystatic CMS:**
- Entry: `/keystatic/` route (injected by `@keystatic/astro` integration)
- Auth: GitHub OAuth via `KEYSTATIC_GITHUB_CLIENT_ID` / `KEYSTATIC_GITHUB_CLIENT_SECRET`
- Config: `keystatic.config.ts` (87KB — all collections, singletons, field definitions)

## Architectural Constraints

- **Threading:** Astro SSR runs in Cloudflare Workers (single-threaded, no Node.js threads). For static build, Astro uses Node.js with standard async file I/O.
- **Global state:** None at module level. `import.meta.env.BASE_URL` is the only global, set at build time. The `routeMappings` object in `src/i18n/utils.ts` is a module-level constant (read-only).
- **Circular imports:** None detected. The dependency direction is: `pages → layouts → components → i18n`. Content collections are only accessed from pages and components (not from each other).
- **Base URL handling:** Every file that constructs asset or navigation paths must use `import.meta.env.BASE_URL.replace(/\/$/, '')` before prefixing image/video paths. Failure to do so causes 404s on GitHub Pages (`/evolea-website` base). This pattern is repeated in every page file and must be preserved.
- **Blog prerender:** Blog detail pages use `export const prerender = true` so they are statically generated even in SSR mode. This is required because blog content is file-based and does not need runtime data.

## Anti-Patterns

### Inline `getText` helper duplication

**What happens:** The `getText` helper `(obj, fallback) => lang === 'de' ? (obj.de || fallback) : (obj.en || obj.de || fallback)` is defined identically in every page file and every program component.
**Why it's wrong:** Inconsistency risk if the fallback logic needs to change; violates DRY.
**Do this instead:** Import from `@i18n/utils` — but currently no exported `getText` exists there. If adding one, export it from `src/i18n/utils.ts` and replace all inline copies.

### Hardcoded brand values in Header and Footer

**What happens:** `Header.astro` constructs the logo path with a hardcoded filename `evolea-logo-new.png`; donate button color `#E8B86D` is hardcoded in inline CSS.
**Why it's wrong:** CMS `settings/images.json` manages image paths elsewhere, but the nav logo is excluded.
**Do this instead:** Pass logo path through `siteSettings` prop (already threaded from Base → Header), or load it from `settings/images` in `Base.astro`.

## Error Handling

**Strategy:** Defensive with optional chaining and fallbacks throughout. No try/catch in page code except inside `astro.config.mjs` adapter dynamic import.

**Patterns:**
- CMS entries: `const entry = await getEntry(...); const data = entry?.data;` — missing entries return `undefined`, content falls back to hardcoded strings
- Blog not found: `src/pages/blog/[...slug].astro` redirects to `/blog/` if post not found
- Middleware: Wraps HTML mutation in try/catch; returns original response if modification fails

## Cross-Cutting Concerns

**Logging:** `console.log('[GSAP] ...')` in `src/scripts/gsap-animations.ts` during init. No server-side logging framework.
**Validation:** Zod schemas in `src/content/config.ts` validate all CMS data at build time.
**Authentication:** Keystatic uses GitHub OAuth (PKCE flow); handled entirely by `@keystatic/astro` integration. No end-user authentication on the public site.
**Accessibility:** WCAG AA target; skip link in Base.astro; `prefers-reduced-motion` respected in GSAP (`src/scripts/gsap-animations.ts`) and Header scroll animations.

---

*Architecture analysis: 2026-06-12*
