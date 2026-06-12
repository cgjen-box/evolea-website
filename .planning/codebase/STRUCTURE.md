# Codebase Structure

**Analysis Date:** 2026-06-12

## Directory Layout

```
evolea/                               # Repo root
├── src/                              # All source code
│   ├── components/                   # Reusable Astro components
│   │   ├── programs/                 # Full-page program body components (shared DE/EN)
│   │   └── brand/                    # Brand showcase components
│   ├── layouts/                      # Page layouts
│   │   └── Base.astro                # The only layout — wraps every page
│   ├── pages/                        # DE routes (default locale, no prefix)
│   │   ├── index.astro               # DE homepage → /
│   │   ├── spenden.astro             # Donation page → /spenden/
│   │   ├── datenschutz.astro         # Privacy policy → /datenschutz/
│   │   ├── impressum.astro           # Legal notice → /impressum/
│   │   ├── angebote/                 # Program pages → /angebote/*
│   │   ├── blog/                     # Blog → /blog/, /blog/[slug]/
│   │   ├── brand/                    # Brand guide page → /brand/
│   │   ├── kontakt/                  # Contact → /kontakt/
│   │   ├── team/                     # Team → /team/
│   │   ├── ueber-uns/                # About → /ueber-uns/
│   │   └── en/                       # EN routes (physical files, /en/ prefix)
│   │       ├── index.astro           # EN homepage → /en/
│   │       ├── donate.astro          # Donation → /en/donate/
│   │       ├── legal.astro           # → /en/legal/
│   │       ├── privacy.astro         # → /en/privacy/
│   │       ├── about/                # → /en/about/
│   │       ├── blog/                 # → /en/blog/, /en/blog/[slug]/
│   │       ├── brand/                # → /en/brand/
│   │       ├── contact/              # → /en/contact/
│   │       ├── programs/             # EN program pages → /en/programs/*
│   │       └── team/                 # → /en/team/
│   ├── content/                      # CMS content collections
│   │   ├── config.ts                 # Zod schemas for all collections
│   │   ├── blog/                     # DE blog posts (MDX)
│   │   ├── blogEn/                   # EN blog posts (MDX)
│   │   ├── pages/                    # Page singleton JSON files
│   │   ├── principles/               # Pedagogical principle JSON files
│   │   ├── programs/                 # Program data JSON files
│   │   ├── settings/                 # Site-wide settings JSON (site.json, images.json, translations.json)
│   │   ├── team/                     # Team member JSON files
│   │   └── testimonials/             # Testimonial JSON files
│   ├── i18n/                         # Internationalisation
│   │   ├── ui.ts                     # All static UI strings DE + EN
│   │   └── utils.ts                  # Lang detection, path translation, route mappings, hreflang
│   ├── scripts/                      # Client-side TypeScript
│   │   └── gsap-animations.ts        # GSAP ScrollTrigger init
│   ├── styles/
│   │   └── global.css                # Tailwind directives + all CSS custom properties (brand tokens)
│   └── middleware.ts                 # Astro middleware (Keystatic enhancements)
├── public/                           # Static assets (copied verbatim to dist)
│   ├── images/                       # Images (logo/, programs/, team/, blog/, hero/, about/, Final images/)
│   ├── videos/                       # Hero video (hero-mobile.mp4)
│   ├── fonts/                        # (empty — fonts loaded from Google Fonts CDN)
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── CNAME                         # GitHub Pages custom domain (unused for Cloudflare)
│   └── _redirects                    # Cloudflare Pages redirect rules (ignored by GitHub Pages)
├── .github/
│   └── workflows/deploy.yml          # GitHub Pages static build CI/CD
├── .husky/
│   └── pre-commit                    # Runs scripts/check_secrets.py before every commit
├── scripts/                          # Dev/ops utilities (Python + shell + PowerShell)
│   ├── check_secrets.py              # Secret scanner (runs in pre-commit hook)
│   └── ...                           # CMS QA scripts, image generation, Cloudflare queue management
├── .planning/
│   └── codebase/                     # GSD codebase map documents (this file)
├── .claude/                          # Claude Code skills and project instructions
│   └── skills/                       # Design, breakpoints, cloudflare, website-review skills
├── .agents/                          # Agent skills (mirrors .claude/skills/)
├── design-system-assets/             # Fonts and social media design files (not served)
├── astro.config.mjs                  # Astro config: dual-build, i18n, integrations, redirect
├── keystatic.config.ts               # Full Keystatic CMS schema (87KB)
├── tailwind.config.mjs               # Tailwind theme with all evolea-* color tokens
├── tsconfig.json                     # TypeScript strict mode + path aliases
├── wrangler.toml                     # Cloudflare Pages build config (nodejs_compat, compatibility_date)
├── package.json                      # npm scripts; @astrojs/cloudflare installed via build:cloudflare
├── package-lock.json                 # Lockfile (npm — NOT pnpm)
├── CLAUDE.md                         # Project instructions for Claude Code
├── AGENTS.md                         # Agent instructions (mirrors CLAUDE.md)
└── EVOLEA-CLAUDE-DESIGN-SYSTEM.md    # Brand/design spec (current truth for tokens)
```

## Directory Purposes

**`src/components/`:**
- Purpose: All reusable Astro components
- Key files: `Header.astro`, `Footer.astro`, `Base.astro` (in layouts), `Icon.astro`, `VideoHero.astro`, `FloatingShapes.astro`, `GradientCTA.astro`, `FooterDonationCTA.astro`, `EditLink.astro`, `LanguagePicker.astro`

**`src/components/programs/`:**
- Purpose: Full-page body components for each program, consumed by both DE and EN page wrappers
- Contains: `MiniGartenPage.astro`, `MiniProjektePage.astro`, `MiniTurnenPage.astro`, `TagesschulePage.astro`, `CafePage.astro` (in parent components dir), `MiniMuseumPage.astro`, `MiniAbenteuercampPage.astro`, `MiniRestaurantPage.astro`, `AngeboteIndexPage.astro`
- Key pattern: Each receives `content`, `lang`, `translatePath`, `heroImage` as props

**`src/pages/angebote/`:**
- Purpose: German-language program route wrappers
- Pattern: Each subdirectory contains only `index.astro` — a ~40-line thin wrapper that loads CMS content and renders the matching `src/components/programs/*Page.astro`
- Routes: `/angebote/`, `/angebote/mini-garten/`, `/angebote/mini-projekte/`, `/angebote/mini-projekte/mini-restaurant/`, `/angebote/mini-turnen/`, `/angebote/mini-abenteuercamp/`, `/angebote/mini-museum/`, `/angebote/evolea-cafe/`, `/angebote/tagesschule/`

**`src/pages/en/programs/`:**
- Purpose: English-language program route wrappers (identical structure and content to DE wrappers)
- Routes: `/en/programs/`, `/en/programs/mini-garden/`, `/en/programs/mini-projects/`, `/en/programs/mini-projects/mini-restaurant/`, `/en/programs/mini-sports/`, `/en/programs/mini-adventure-camp/`, `/en/programs/mini-museum/`, `/en/programs/evolea-cafe/`, `/en/programs/day-school/`
- Note: EN wrappers are byte-identical to their DE counterparts — same `getEntry` calls, same component, same `getText` helper

**`src/content/`:**
- Purpose: All CMS-managed content, read at render time via `astro:content` APIs
- `blog/` and `blogEn/`: MDX files with frontmatter (`title`, `description`, `pubDate`, `author`, `image`, `tags`, `featured`)
- `pages/`: One JSON singleton per page (e.g., `homepage.json`, `mini-garten.json`) — contains bilingual `{ de, en }` content overrides for heroes, sections, etc.
- `settings/site.json`: Site name, description, navigation labels, social links
- `settings/images.json`: Paths to hero/program images managed via CMS
- `team/`, `principles/`, `testimonials/`: Individual JSON files per entity

**`src/i18n/`:**
- Purpose: All internationalisation logic
- `ui.ts`: exports `ui` object (flat key-value map), `defaultLang = 'de'`, `showDefaultLang = false`, `type Lang`
- `utils.ts`: exports `getLangFromUrl`, `useTranslations`, `useTranslatedPath`, `getAlternateLang`, `getAlternatePath`, `getLanguageAlternates`; contains `routeMappings` (the single source of truth for DE↔EN slug differences)

**`public/images/`:**
- Contains subdirectories: `logo/`, `programs/`, `team/`, `blog/`, `hero/`, `about/`, `Final images/`
- Logo: `evolea-logo-new.png` is the active logo file (hardcoded in `Header.astro`)
- Generated images: `public/images/generated/` is gitignored (AI-generated drafts)

**`scripts/`:**
- `check_secrets.py`: Mandatory pre-commit secret scanner (regex-based; runs via Husky hook)
- `cms-qa.mjs`, `cms-batch-qa.mjs`: Keystatic content QA
- `cancel-cloudflare-deployments.sh` + PowerShell equivalent: Queue management for Cloudflare Pages build queue
- Image generation scripts: `generate_image.py`, `generate-asset.py`, `image_agent.py`

## Key File Locations

**Entry Points:**
- `src/pages/index.astro`: DE homepage
- `src/pages/en/index.astro`: EN homepage
- `src/pages/blog/[...slug].astro`: DE blog detail (dynamic, prerendered)
- `src/pages/en/blog/[...slug].astro`: EN blog detail (dynamic, prerendered)

**Configuration:**
- `astro.config.mjs`: Dual-build mode, i18n, integrations, single Astro-level redirect
- `wrangler.toml`: Cloudflare Pages build command, `nodejs_compat` flag, `compatibility_date`
- `tailwind.config.mjs`: All `evolea-*` color tokens (hex literals — required for opacity modifiers)
- `tsconfig.json`: Strict mode + path aliases (`@/`, `@components/`, `@layouts/`, `@i18n/`, `@content/`)
- `keystatic.config.ts`: Full CMS schema — all collections, singletons, field types
- `public/_redirects`: Cloudflare legacy-URL 301 redirects (EN program/page slug migrations)
- `.github/workflows/deploy.yml`: GitHub Pages static build pipeline

**Core Logic:**
- `src/layouts/Base.astro`: The only layout; all pages use it
- `src/i18n/utils.ts`: All language routing logic including `routeMappings`
- `src/i18n/ui.ts`: All static UI strings
- `src/content/config.ts`: All content collection schemas (Zod)
- `src/middleware.ts`: Only active middleware — Keystatic UI enhancements

**Brand/Styling:**
- `src/styles/global.css`: CSS custom properties for all brand tokens; Tailwind base/components/utilities directives
- `tailwind.config.mjs`: Tailwind theme extension with all `evolea-*` tokens as hex literals
- `EVOLEA-CLAUDE-DESIGN-SYSTEM.md`: Brand spec (current source of truth for token values)

## Naming Conventions

**Files:**
- Pages: `index.astro` inside a named directory (kebab-case directory name), or `name.astro` for flat pages
- Components: PascalCase `.astro` (e.g., `VideoHero.astro`, `MiniGartenPage.astro`)
- Content files: kebab-case `.json` or `.mdx` (e.g., `mini-garten.json`, `belohnung-erziehung.mdx`)
- Scripts: kebab-case `.ts` or `.mjs` (e.g., `gsap-animations.ts`, `cms-qa.mjs`)

**Directories:**
- Page routes: kebab-case matching the URL slug (e.g., `angebote/mini-garten/`, `en/programs/mini-garden/`)
- Content collections: camelCase matching the `collections` export key (e.g., `blogEn/`)

**TypeScript:**
- Component prop interfaces: PascalCase `Props` interface, local to each component's frontmatter
- i18n types: `Lang` type alias exported from `src/i18n/ui.ts`
- Collection entry types: `CollectionEntry<'blog'>` from `astro:content`

**CSS classes:**
- Tailwind utilities only; scoped `<style>` blocks inside Astro components for component-specific CSS
- Scroll-reveal: `.reveal`, `.reveal-section`, `.reveal-card`, `.reveal-fade`, `.reveal-badge` (consumed by GSAP and legacy IntersectionObserver)
- Brand utility: `btn-primary`, `btn-secondary`, `section-padding`, `section-header`, `section-label`, `spectrum-line` defined in `src/styles/global.css`

## Where to Add New Code

**New German page:**
- Create `src/pages/{slug}/index.astro`
- Use `<Base title="..." description="...">` wrapper
- Call `getLangFromUrl(Astro.url)` and `useTranslatedPath` at the top
- If page has bilingual content, add a matching English page at `src/pages/en/{en-slug}/index.astro`

**New English page with different URL slug:**
- Add `src/pages/en/{en-slug}/index.astro`
- Add the mapping to `routeMappings` in `src/i18n/utils.ts` (both `de` and `en` directions)
- Add a 301 entry to `public/_redirects` if an old URL exists that should redirect

**New program page:**
- Create body component: `src/components/programs/{ProgramName}Page.astro`
  - Accept props: `content`, `lang`, `translatePath`, `heroImage`
  - Use inline `getText` helper for bilingual field rendering
- Create DE wrapper: `src/pages/angebote/{de-slug}/index.astro` (thin, ~40 lines)
- Create EN wrapper: `src/pages/en/programs/{en-slug}/index.astro` (byte-identical to DE wrapper)
- Add route mapping to `src/i18n/utils.ts`
- Add redirect to `public/_redirects` if needed
- Add page singleton JSON: `src/content/pages/{slug}.json`
- Add Keystatic collection entry in `keystatic.config.ts`

**New blog post:**
- DE: add `src/content/blog/{slug}.mdx` with required frontmatter
- EN: add `src/content/blogEn/{slug}.mdx` with same slug

**New reusable component:**
- Implementation: `src/components/{ComponentName}.astro`
- Define `interface Props` in frontmatter
- Use path alias `@components/ComponentName.astro` when importing

**New content collection:**
- Add Zod schema to `src/content/config.ts`
- Add to `collections` export
- Add collection definition to `keystatic.config.ts`
- Create `src/content/{collectionName}/` directory with a `.gitkeep` if empty

**New utility function:**
- If i18n-related: add to `src/i18n/utils.ts`
- If general: create `src/scripts/{name}.ts`

**New CMS singleton:**
- Add JSON file: `src/content/pages/{name}.json`
- Add singleton definition to `keystatic.config.ts`
- Access in pages via `await getEntry('pages', '{name}')`

## Special Directories

**`dist/`:**
- Purpose: Build output (Cloudflare SSR worker bundle or GitHub Pages static files)
- Generated: Yes
- Committed: No (gitignored)

**`public/images/generated/`:**
- Purpose: AI-generated image drafts (working directory)
- Generated: Yes (by `scripts/generate_image.py` etc.)
- Committed: No (gitignored)

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents (architecture, structure, conventions, etc.)
- Generated: Yes (by `/gsd:map-codebase` agent)
- Committed: Yes

**`.claude/skills/` and `.agents/skills/`:**
- Purpose: Project-specific Claude agent skill definitions (mirrors — same content in both)
- Contains: `Design skills/`, `breakpoints/`, `cloudflare/`, `website-review/`, `image-generation-rl/`
- Committed: Yes
- Note: Load relevant `SKILL.md` files before making design, deployment, or QA changes

**`.astro/`:**
- Purpose: Astro internal cache (type definitions, content collection manifests)
- Generated: Yes
- Committed: No (gitignored)

**`node_modules/`:**
- Generated: Yes
- Committed: No
- Note: `@astrojs/cloudflare` is NOT in `package-lock.json` (not installable on Windows ARM64 locally). It is installed on-demand during the Cloudflare build via `npm run build:cloudflare`.

---

*Structure analysis: 2026-06-12*
