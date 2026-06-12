# Technology Stack

**Analysis Date:** 2026-06-12

## Languages

**Primary:**
- TypeScript 5.9.3 (installed) / ^5.7.2 (specified) - All source files, Astro frontmatter, config files
- HTML/CSS - Astro component templates and `src/styles/global.css`

**Secondary:**
- JavaScript (ES modules) - Config files (`astro.config.mjs`, `tailwind.config.mjs`), build scripts
- MDX - Blog content in `src/content/blog/` and `src/content/blogEn/`
- Python 3 - Dev tooling scripts (`scripts/check_secrets.py`, `scripts/generate_image.py`)
- PowerShell - Windows-targeted Cloudflare queue management (`scripts/Cancel-CloudflareDeployments.ps1`)

## Runtime

**Environment:**
- Node.js 20 (pinned in CI via `actions/setup-node@v4`); local dev uses Node 26.0.0 (system)
- Cloudflare Workers runtime (production SSR via `@astrojs/cloudflare` adapter)

**Package Manager:**
- npm 11.12.1
- Lockfile: `package-lock.json` present (lockfileVersion 3); `pnpm-lock.yaml` is untracked detritus — use npm

## Frameworks

**Core:**
- Astro 5.16.4 (installed) / ^5.1.1 (specified) - Full-stack static/SSR framework; primary build target
- React 18.3.1 - Used for interactive island components; registered via `@astrojs/react`

**CMS:**
- Keystatic 0.5.48 (`@keystatic/core`) + `@keystatic/astro` 5.0.6 - GitHub-backed headless CMS, active only on Cloudflare build

**Styling:**
- Tailwind CSS 3.4.18 - Utility-first CSS; custom EVOLEA theme in `tailwind.config.mjs`
- `@astrojs/tailwind` 6.0.2 - Astro integration

**Animation:**
- GSAP 3.14.2 - Scroll animations and page transitions; used in `src/scripts/gsap-animations.ts` and `src/layouts/Base.astro`

**Content:**
- `@astrojs/mdx` 4.3.13 - MDX support for rich blog posts

**Build/Dev:**
- `@astrojs/check` 0.9.4 - TypeScript type-checking at build time (`astro check`)
- `@astrojs/sitemap` 3.2.1 - Auto-generates sitemap at build
- Husky 9.1.7 - Git hooks (pre-commit)
- `playwright-core` 1.57.0 - Browser automation used in dev QA scripts (`scripts/brand-qa.mjs`, `scripts/cms-qa.mjs`)

## Key Dependencies

**Critical:**
- `astro` ^5.1.1 - Everything runs through this; SSR output depends on adapter injection
- `@astrojs/cloudflare` 12.6.13 - NOT in `package.json` dependencies; installed at Cloudflare build time via `npm run build:cloudflare`. The adapter is not available on Windows ARM64 and will silently fall back to static if `CF_PAGES != 1`
- `@keystatic/core` ^0.5.48 - CMS UI + GitHub OAuth content storage; requires three runtime env vars

**Infrastructure:**
- `@astrojs/react` ^4.4.2 - React island hydration
- `gsap` ^3.14.2 - Client-side animations
- `tailwindcss` ^3.4.18 - Design token system; hex literals in `tailwind.config.mjs` are duplicated as CSS vars in `src/styles/global.css` (both must be updated together)
- `typescript` ^5.7.2 - Strict mode; `tsconfig.json` extends `astro/tsconfigs/strict`

## Configuration

**Environment:**
- `.env.example` documents the three required vars (names only): `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`
- `.env` present locally (pointer-only, no real values)
- Cloudflare Pages: secrets set via Cloudflare Dashboard; `KEYSTATIC_GITHUB_CLIENT_ID` is the only var inlined at build time (public OAuth client ID); all others are read at runtime via `process.env` (requires `nodejs_compat` flag + `compatibility_date >= 2025-04-01`)
- Local dev uses file-based Keystatic mode (no OAuth needed)

**Build:**
- `astro.config.mjs` - Main Astro config; dual-mode (static for GitHub Pages when `GITHUB_PAGES=true`, SSR for Cloudflare otherwise)
- `tailwind.config.mjs` - Full token system; content paths cover `src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}`
- `tsconfig.json` - Strict mode with path aliases: `@/` → `src/`, `@components/` → `src/components/`, `@layouts/` → `src/layouts/`, `@i18n/` → `src/i18n/`, `@content/` → `src/content/`
- `wrangler.toml` - Cloudflare Pages config; `compatibility_date = "2025-04-01"`, `compatibility_flags = ["nodejs_compat"]`

**i18n:**
- Astro built-in i18n routing; locales `['de', 'en']`; German is `defaultLocale` with no prefix; English prefixed at `/en/`
- Fallback chain: `en → de`
- `prefixDefaultLocale: false` means German pages live at root paths (`/angebote/`, not `/de/angebote/`)

## Platform Requirements

**Development:**
- Node.js ≥ 20 recommended (CI pins to 20; local runs Node 26)
- Python 3 for `scripts/check_secrets.py` (runs in pre-commit hook)
- gitleaks binary required (pre-commit hook fails without it); install via `brew install gitleaks`
- Windows ARM64: cannot install `@astrojs/cloudflare` locally; static build used for local dev/preview

**Production:**
- Primary: Cloudflare Pages (`evolea-website` project) — SSR mode, custom domain `www.evolea.ch`
- Fallback: GitHub Pages (`cgjen-box/evolea-website`) — static output, base `/evolea-website`
- Build command on Cloudflare: `npm run build:cloudflare` (installs adapter before build)
- Output directory: `./dist`

---

*Stack analysis: 2026-06-12*
