# External Integrations

**Analysis Date:** 2026-06-12

## APIs & External Services

**Form Handling:**
- Formspree - Contact form submission handler
  - SDK/Client: HTML `<form action>` POST (no SDK); form ID `xpznqrjk` is the hardcoded fallback
  - Auth: None (public endpoint); form ID managed in Keystatic CMS (`contact.formular.formspreeId`)
  - Used in: `src/pages/kontakt/index.astro:160`, `src/pages/en/contact/index.astro:160`

**Social Media:**
- Instagram - Used for social links (footer, contact page) and embedded Instagram Reel on the donation page
  - Embed: `<iframe>` pointing to `https://www.instagram.com/reel/...` in `src/pages/spenden.astro:77`
  - Links: `https://www.instagram.com/evolea.verein/` (default fallback); configurable via Keystatic `siteSettings.social.instagram`
  - No API key required; Reel URL is CMS-managed via `page?.successStory?.instagramReelUrl`
- WhatsApp - Direct chat link (`https://wa.me/41789591974`)
  - Used in: `src/pages/kontakt/index.astro:125`, `src/components/programs/TagesschulePage.astro:350`
  - No API; plain `wa.me` URL
- LinkedIn - Footer/team social links; configurable via `siteSettings.social.linkedin`

## Fonts

**Google Fonts CDN:**
- Fredoka (weights 600, 700) and Poppins (weights 400, 500, 600, 700) loaded from `https://fonts.googleapis.com`
- Preconnect hints to `https://fonts.googleapis.com` and `https://fonts.gstatic.com` in `src/layouts/Base.astro:77-81`
- No API key; public CDN
- Fonts are NOT self-hosted (no `public/fonts/` directory); reliance on Google CDN availability

## CMS

**Keystatic (GitHub-backed headless CMS):**
- Production URL: `https://www.evolea.ch/keystatic`
- Auth: GitHub OAuth App
  - Client ID: `KEYSTATIC_GITHUB_CLIENT_ID` (inlined at build time via `vite.define` in `astro.config.mjs`)
  - Client Secret: `KEYSTATIC_GITHUB_CLIENT_SECRET` (runtime env var, never inlined)
  - Session secret: `KEYSTATIC_SECRET` (runtime env var)
- GitHub repo: `cgjen-box/evolea-website` (content stored as JSON/MDX files in the repo)
- Local mode: file-based (no OAuth) when `NODE_ENV=development` and `KEYSTATIC_GITHUB_CLIENT_ID` is unset
- Keystatic integration only loaded for Cloudflare builds (not GitHub Pages static build)
- Middleware (`src/middleware.ts`) injects CMS UI enhancements: hides deploy button, adds save toast notifications by intercepting `api.github.com` fetch calls

## Data Storage

**Databases:**
- None. All content is file-based (JSON, MDX) in `src/content/` — managed via Keystatic and committed to Git

**File Storage:**
- Git repository / Cloudflare Pages deployment — static assets in `public/images/`
- `public/images/generated/` directory is gitignored (generated AI images); finals are copied to tracked dirs before commit
- Blog images: `public/images/blog/`; Team photos: `public/images/team/`; Program images: `public/images/programs/`, `public/images/hero/`

**Caching:**
- Cloudflare CDN cache (automatic); manual purge via Cloudflare API (`CF_API_TOKEN` env var, used in admin scripts and documented in CLAUDE.md, not in application source)

## Authentication & Identity

**Auth Provider:**
- GitHub OAuth via Keystatic — only for CMS access at `/keystatic`
  - Implementation: `@keystatic/astro` integration handles OAuth callback at `/api/keystatic/github/oauth/callback`
  - No user-facing authentication; the public website has no login system

## Deployment & Hosting

**Primary Hosting:**
- Cloudflare Pages — project `evolea-website`
  - Account ID: `861cf040c6bd6d5977d6a93bc1bb6d2e` (referenced in admin scripts)
  - Zone ID: `31692bef127b39a14d1bd5787aafdd12` (referenced in CLAUDE.md for cache purge API)
  - Custom domain: `www.evolea.ch` (CNAME in `public/CNAME`)
  - Apex redirect: `evolea.ch → www.evolea.ch` managed by Cloudflare DNS

**Fallback Hosting:**
- GitHub Pages — `cgjen-box/evolea-website`, base path `/evolea-website`
  - Deployed via `.github/workflows/deploy.yml` on push to `main`
  - Static-only build (`GITHUB_PAGES=true` disables Cloudflare adapter and Keystatic)

## CI/CD

**GitHub Actions:**
- Workflow: `.github/workflows/deploy.yml`
- Trigger: push to `main` branch
- Runner: `ubuntu-latest`, Node 20
- Deploys static build to GitHub Pages; Cloudflare Pages deploys independently via Git integration

**Pre-commit Hooks (Husky):**
- `scripts/check_secrets.py --staged-only` - Python regex scanner for API keys, passwords
- `gitleaks protect --staged --redact --no-banner` - Binary secrets scanner (must be installed via `brew install gitleaks`)
- `npm run build` - Full TypeScript check + build validation before commit

## SEO & Meta

**Sitemap:**
- `@astrojs/sitemap` auto-generates `sitemap-index.xml` and `sitemap-0.xml` at build
- Production base URL: `https://www.evolea.ch`

**Open Graph / Twitter Cards:**
- Implemented in `src/layouts/Base.astro` (lines 57-72)
- OG locale: `de_CH` (German) or `en` (English)
- Default OG image: `/images/og-default.jpg`

**hreflang:**
- `<link rel="alternate" hreflang>` tags in `src/layouts/Base.astro`; x-default points to German

## Monitoring & Observability

**Error Tracking:**
- None detected in application source

**Analytics:**
- None detected (no Google Analytics, Plausible, Umami, or similar scripts found in source)

**Logs:**
- Cloudflare Pages Functions logs (automatic); no custom logging integration in application code

## Webhooks & Callbacks

**Incoming:**
- `/api/keystatic/github/oauth/callback` - GitHub OAuth callback for Keystatic CMS login (handled by `@keystatic/astro` integration, not a manually created file)

**Outgoing:**
- Formspree receives form POSTs from browser directly (client-side, no server proxy)
- Keystatic commits content changes to GitHub via GitHub REST API (`api.github.com`) from the browser CMS UI

## Environment Configuration

**Required env vars (Cloudflare Pages production):**
- `KEYSTATIC_GITHUB_CLIENT_ID` - GitHub OAuth App client ID (also inlined at build time)
- `KEYSTATIC_GITHUB_CLIENT_SECRET` - GitHub OAuth App client secret (runtime only)
- `KEYSTATIC_SECRET` - Random session signing secret (runtime only); generate with `openssl rand -hex 32`

**Optional admin env vars (not in application, used in manual scripts):**
- `CF_API_TOKEN` - Cloudflare API token for cache purge and domain management scripts documented in CLAUDE.md

**Secrets location:**
- Machine-wide: `~/.moneypenny-secrets.env` (per global CLAUDE.md)
- Local dev `.env` file is pointer-only (no real values); Cloudflare Dashboard for production secrets
- `.dev.vars` for Wrangler local dev (not committed)

---

*Integration audit: 2026-06-12*
