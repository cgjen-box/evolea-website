# EVOLEA Website - Claude Project Instructions

## Project Overview
EVOLEA Verein website - a Swiss non-profit providing educational programs for children on the autism spectrum or with ADHD, based in Zurich. Built with Astro, TypeScript, and Tailwind CSS. Bilingual: German (default) and English.

---

## BRAND GUIDE ADHERENCE (MANDATORY)

**The EVOLEA Brand Guide v3.0 is the definitive source of truth.**
Location: `.claude/todo/EVOLEA-BRAND-GUIDE-V3.md`

### The 10 Brand Commandments (NON-NEGOTIABLE)

1. **NEVER use emojis anywhere on the site** - Use SVG icons only
2. **NEVER use transparent mobile menus** - Solid backgrounds always (white or brand gradient)
3. **NEVER use text without shadows on gradients** - Always add depth for readability
4. **NEVER use AI images for real content** - Real photos only for heroes, team, programs
5. **NEVER let the butterfly cover the "A"** - Proper spacing required
6. **NEVER use flat, muted, or corporate colors** - Bold and vibrant spectrum only
7. **ALWAYS have a prism gradient hero** - Every page needs hero gradient
8. **ALWAYS have a page closer** - Before every footer
9. **ALWAYS use Fredoka for headlines** - Brand consistency
10. **ALWAYS test on mobile** - Before deploying

### Color Palette (CURRENT - DO NOT USE OLD COLORS)

**Primary Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| Magenta | #DD48E0 | Primary CTAs, highlights |
| Deep Purple | #BA53AD | Headlines, accents |
| Lavender | #CD87F8 | Secondary accents |

**Spectrum Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| Mint | #7BEDD5 | Fresh accents, success |
| Sunshine | #FFE066 | Joy, warmth, highlights |
| Coral | #FF7E5D | Energy, warm accents |
| Sky Blue | #5DADE2 | Trust, calm |
| Blush | #EF8EAE | Soft pink accents |
| Gold | #E8B86D | Donate button, donation CTAs |

**Neutrals:**
| Name | Hex | Usage |
|------|-----|-------|
| Cream | #FFFBF7 | Page backgrounds |
| Dark Text | #2D2A32 | Body text |
| Light Text | #5C5762 | Secondary text |
| Pure White | #FFFFFF | Cards, overlays |
| Charcoal | #1A1A2E | Dark mode, vision statements |

### Typography
- **Headlines/Display**: Fredoka (Bold 700, SemiBold 600)
- **Body/UI**: Poppins (Regular 400, Medium 500, SemiBold 600)

### Imagery Hierarchy (STRICT)
1. **Real Photography** (Primary) - Heroes, team, programs, blog featured
2. **Illustrations** (Secondary) - Icons, decorative, 404 pages
3. **AI-Generated** (LIMITED) - Only for blog illustrations when no photo available, social media, internal. NEVER for team/hero/real content.

### Image Generation Guidelines (When AI images are allowed)

**Cultural Context:**
- EVOLEA is based in Zurich, Switzerland
- Images should reflect Swiss/Central European demographics
- Avoid religious symbols or head coverings on children
- Show diversity through hair colors, features - not religious attire

**Style Requirements:**
- Warm, soft color palette (cream, pink, purple, mint)
- Watercolor or soft illustration style preferred
- Bright, natural lighting
- Professional but warm feeling
- Not overly "stock photo" or generic

**Always Generate 2 Options:**
When generating images for EVOLEA, ALWAYS provide 2 different versions for the user to choose from.

**Subject Guidelines:**
- Children should appear ages 3-8 (depending on program)
- Show genuine joy and engagement
- Include activities relevant to the program
- Keep backgrounds simple but warm
- Butterflies can be included as brand element

---

## Tech Stack
- **Framework**: Astro 5.x with static site generation
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom EVOLEA theme
- **CMS**: Keystatic (GitHub-based headless CMS)
- **Deployment**: GitHub Pages + Cloudflare Pages
- **i18n**: Astro's built-in i18n routing (DE default, EN with /en/ prefix)

## Project Structure
```
src/
├── components/     # Reusable Astro components
├── layouts/        # Page layouts (Base.astro)
├── pages/          # German pages (default)
│   └── en/         # English pages (prefixed)
├── i18n/           # Translation files and utilities
│   ├── ui.ts       # UI string translations
│   └── utils.ts    # i18n helper functions
├── content/        # Content collections (blog, team, pages, etc.)
└── styles/         # Global CSS
public/
├── images/         # Static images
├── fonts/          # Self-hosted fonts (Fredoka, Poppins)
└── CNAME           # GitHub Pages custom domain
```

## Key Commands
```bash
npm run dev         # Start dev server at localhost:4321
npm run build       # Build for production
npm run preview     # Preview production build
```

## Path Aliases
```typescript
@/            # src/
@components/  # src/components/
@layouts/     # src/layouts/
@i18n/        # src/i18n/
@content/     # src/content/
```

---

## CMS (Keystatic)

### Access
- **CMS URL (Production)**: https://www.evolea.ch/keystatic
- **CMS URL (Staging)**: https://evolea-website.pages.dev/keystatic
- **Local**: http://localhost:4321/keystatic (when running dev server)
- **Authentication**: GitHub OAuth

### Content Collections
| Collection | Type | Description |
|------------|------|-------------|
| `blog` | content (MDX) | German blog posts |
| `blog-en` | content (MDX) | English blog posts |
| `team` | data (JSON) | Team members |
| `programs` | data (JSON) | Program details |
| `principles` | data (JSON) | Founding principles |
| `testimonials` | data (JSON) | Parent testimonials |
| `pages` | data (JSON) | Page-specific content (singletons) |
| `settings` | data (JSON) | Site-wide settings |

### Bilingual Content Pattern
Most content uses bilingual objects:
```typescript
{
  de: "German text",
  en: "English text"
}
```

Helper function to get correct language:
```typescript
const getText = (obj: { de?: string; en?: string }, fallback: string) => {
  return lang === 'de' ? (obj.de || fallback) : (obj.en || obj.de || fallback);
};
```

---

## Icon System

Use the `Icon.astro` component for all icons. NEVER use emojis.

### Usage
```astro
<Icon name="sprout" size="lg" />
<Icon name="heart" size="md" gradient={false} />
```

### Available Icons
`sprout` | `palette` | `ball` | `school` | `chart` | `target` | `gamepad` | `clipboard` | `diamond` | `family` | `rainbow` | `lightning` | `heart` | `book` | `brain` | `handshake` | `teacher` | `running` | `gymnast` | `sparkle` | `leaf` | `people` | `calendar` | `location` | `mail` | `money` | `shield` | `clock` | `child` | `fire` | `cooking` | `coffee` | `rocket` | `museum` | `check`

### Sizes
`xs` (16px) | `sm` (24px) | `md` (32px) | `lg` (48px) | `xl` (64px) | `2xl` (80px)

### Props
- `name` - Icon name (required)
- `size` - Size preset (default: 'md')
- `gradient` - Use brand gradient (default: true)
- `class` - Additional CSS classes

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `Base.astro` | Main layout with head, nav, footer |
| `Header.astro` | Navigation (navbar) |
| `Footer.astro` | Site footer with links and language picker |
| `Icon.astro` | SVG icon system |
| `VideoHero.astro` | Homepage video hero |
| `InnerPageHero.astro` | Inner page hero with gradient |
| `GradientCTA.astro` | Call-to-action sections |
| `FloatingShapes.astro` | Decorative background shapes |
| `FooterDonationCTA.astro` | Gold donation CTA before footer |
| `NavbarFade.astro` | Navbar with scroll fade effect |
| `LanguagePicker.astro` | DE/EN language switcher |

---

## Coding Standards

### TypeScript
- Use strict mode, no `any` types
- Define interfaces for all component props
- Use path aliases (@/, @components/, etc.)

### Astro Components
```astro
---
interface Props {
  title: string;
  variant?: 'purple' | 'cream';
}
const { title, variant = 'cream' } = Astro.props;
---
<article class:list={['card', { 'bg-evolea-purple': variant === 'purple' }]}>
  <h3>{title}</h3>
  <slot />
</article>
```

### Accessibility (WCAG AA Required)
- All images need descriptive alt text
- Color contrast >= 4.5:1
- Keyboard navigation must work
- Use semantic HTML elements
- Include skip links
- Respect prefers-reduced-motion

### i18n Pattern
```typescript
import { getLangFromUrl, useTranslations, useTranslatedPath } from '@i18n/utils';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const translatePath = useTranslatedPath(lang);

// Usage: t('nav.home') -> "Startseite" or "Home"
// Usage: translatePath('/angebote/') -> "/evolea-website/angebote/"
```

---

## Content Guidelines
- Use "Kinder im Spektrum" not "autistische Kinder"
- Focus on abilities, not deficits
- Formal "Sie" in German, warm professional tone
- Keep sentences clear and simple

## Programs (Content)
1. **Mini Garten** - Kindergarten prep (ages 3-6)
2. **Mini Projekte** - Social skills groups (ages 5-8)
3. **Mini Turnen** - Sports/gymnastics group (ages 5-8)
4. **EVOLEA Cafe** - Parent community meetup (every 2nd Wednesday)
5. **Tagesschule** - Day school (vision/future)

---

## Donation Page

### Routes (Special i18n Mapping)
- German: `/spenden/`
- English: `/en/donate/`

The language switcher automatically maps between these paths via `routeMappings` in `src/i18n/utils.ts`.

### Bank Details (DO NOT MODIFY)
```
Account Holder: EVOLEA Verein
Bank: UBS Switzerland AG
IBAN: CH90 0023 0230 9206 9201 G
BIC/SWIFT: UBSWCHZH80A
```

### Components
- `FooterDonationCTA.astro` - Gold gradient CTA shown before footer
- Use `hideFooterCTA={true}` prop on Base layout to hide on donate pages

### Navigation
- Gold "Spenden" button (#E8B86D) in both desktop and mobile nav

---

## Testing Checklist
- [ ] Lighthouse accessibility score >= 90
- [ ] Mobile responsive (test 375px, 768px, 1024px)
- [ ] Both DE and EN routes work
- [ ] Forms submit correctly (Formspree)
- [ ] No console errors
- [ ] Images optimized and lazy-loaded
- [ ] No emojis on any page (SVG icons only)
- [ ] Mobile menu has solid background
- [ ] All text readable on gradients
- [ ] Donate page language switcher works
- [ ] FooterDonationCTA appears on all pages except donate pages
- [ ] Gold Spenden button visible in navigation
- [ ] No secrets in staged files (`python scripts/check_secrets.py --staged-only`)
- [ ] No secrets in git history (`python scripts/check_secrets.py --history`)

### Domain & SEO Verification
- [ ] https://www.evolea.ch loads correctly
- [ ] https://evolea.ch redirects to https://www.evolea.ch (301)
- [ ] Canonical URLs use `www.evolea.ch` (view source: `<link rel="canonical">`)
- [ ] Sitemap at https://www.evolea.ch/sitemap-index.xml shows correct domain
- [ ] SSL certificate valid (green lock)
- [ ] Keystatic CMS accessible at https://www.evolea.ch/keystatic

---

## Deployment

### Deployment Targets
- **Production**: https://www.evolea.ch/ (primary - Cloudflare Pages with custom domain)
- **Staging/Dev**: https://evolea-website.pages.dev/ (Cloudflare Pages default)
- **GitHub Pages**: https://cgjen-box.github.io/evolea-website/ (static fallback)
- **CMS (Keystatic)**: https://www.evolea.ch/keystatic (or https://evolea-website.pages.dev/keystatic)

### Domain Configuration
- **Primary domain**: `www.evolea.ch` (canonical URL for SEO)
- **Apex redirect**: `evolea.ch` → `www.evolea.ch` (301 redirect)
- **DNS**: Managed via Cloudflare (zone: evolea.ch)
- **SSL**: Automatic via Cloudflare
- **Cloudflare Zone ID**: `31692bef127b39a14d1bd5787aafdd12`

### GitHub Account (IMPORTANT)

**Always use the `cgjen-box` GitHub account for this project.**

Before any git operations, verify and switch to the correct account:
```bash
# Check current account
gh auth status

# Switch to cgjen-box if needed
gh auth switch --user cgjen-box
```

### Automatic Deployment

**Both targets deploy automatically on push to main:**

1. **GitHub Pages** - Deployed via `.github/workflows/deploy.yml`
2. **Cloudflare Pages** - Deployed via Git integration (auto-detects push)

**After pushing, verify deployments:**

1. **Check GitHub Actions**: https://github.com/cgjen-box/evolea-website/actions
2. **Check Cloudflare Pages**: https://dash.cloudflare.com/ (Pages > evolea-website > Deployments)
3. **Verify sites are live**:
   - Production: https://www.evolea.ch/
   - Staging: https://evolea-website.pages.dev/
   - GitHub Pages: https://cgjen-box.github.io/evolea-website/

**Common deployment issues:**
- TypeScript errors (unused variables, wrong imports)
- Missing dependencies
- Custom domain deactivated in Cloudflare Pages (see troubleshooting below)

**Never assume a push succeeded - always verify!**

### Cloudflare Troubleshooting

#### Custom Domain Shows Old Content

If www.evolea.ch shows old content but evolea-website.pages.dev shows new content:

1. **Check custom domain status:**
   ```bash
   curl -s "https://api.cloudflare.com/client/v4/accounts/861cf040c6bd6d5977d6a93bc1bb6d2e/pages/projects/evolea-website/domains" \
     -H "Authorization: Bearer $CF_API_TOKEN"
   ```
   Look for `"status": "deactivated"` or `"status": "error"`

2. **Reactivate the domain:**
   ```bash
   curl -s -X PATCH "https://api.cloudflare.com/client/v4/accounts/861cf040c6bd6d5977d6a93bc1bb6d2e/pages/projects/evolea-website/domains/www.evolea.ch" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json"
   ```

3. **Wait for status to change to "active"** (usually 10-30 seconds)

#### Cache Not Clearing

If content is stale even after purging:

1. **Check cache age:**
   ```bash
   curl -sI https://www.evolea.ch/ | grep -i "cf-cache\|age:"
   ```
   High `Age` value (e.g., 200000+ seconds) indicates very stale cache.

2. **Purge entire zone:**
   ```bash
   curl -s -X POST "https://api.cloudflare.com/client/v4/zones/31692bef127b39a14d1bd5787aafdd12/purge_cache" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'
   ```

3. **If still not working**, the issue is likely the Pages custom domain, not caching. Check domain status first.

#### Verify Latest Deployment

Check if the latest Pages deployment has your changes:
```bash
# Get latest deployment preview URL
curl -s "https://api.cloudflare.com/client/v4/accounts/861cf040c6bd6d5977d6a93bc1bb6d2e/pages/projects/evolea-website/deployments?per_page=1" \
  -H "Authorization: Bearer $CF_API_TOKEN" | grep -o '"url": "[^"]*"' | head -1

# Then fetch that URL directly to verify content
```

---

## Security

### Secret Detection (Pre-commit Hook)

A secret detection script runs automatically on every commit via Husky pre-commit hook.

**Location:** `scripts/check_secrets.py`

**Automatic Protection:**
- Runs on `git commit` - blocks commits containing secrets
- Checks only staged files for speed

**Manual Commands:**
```bash
# Scan all tracked files
python scripts/check_secrets.py

# Scan git history for past leaks
python scripts/check_secrets.py --history

# Check specific file
python scripts/check_secrets.py --file path/to/file.py
```

**Detected Patterns:**
| Pattern | Type |
|---------|------|
| `AIza...` | Google API Key |
| `AKIA...` | AWS Access Key |
| `ghp_`, `gho_`, `ghs_` | GitHub Token |
| `xoxb-`, `xoxa-` | Slack Token |
| `-----BEGIN PRIVATE KEY-----` | Private Key |
| Hardcoded passwords/secrets in quotes | Various |

**If a secret is detected:**
1. Commit will be blocked
2. Rotate the exposed credential immediately
3. If in git history, use BFG or git-filter-repo to remove

**False Positives:**
Add to `FALSE_POSITIVES` list in `scripts/check_secrets.py`

---

## Claude Code Skills

Available skills in `.claude/skills/`:
- `/website-review` - QA review using Chrome DevTools MCP
- `/verify-deploy` - Deployment verification
- `/brand` - Brand guidelines reference
- `/image` - Image generation guidance
- `/generate-assets` - Asset generation
- `/cloudflare` - Cloudflare Pages deployment management, cache purging, queue cleanup

---

## Design Skills & Reference Documentation

### Skill Architecture

| Skill | Location | Purpose |
|-------|----------|---------|
| **Design UX Lead** | `.claude/skills/Design skills/EVOLEA-DESIGN-UX.md` | Master orchestrator for all design work |
| Animations | `.claude/skills/Design skills/animations.md` | GSAP patterns, scroll effects, reduced motion |
| Responsive | `.claude/skills/Design skills/responsive.md` | Mobile-first patterns, touch targets |
| Angebote Structure | `.claude/skills/Design skills/angebote-structure.md` | Program page templates (Mini Garten, etc.) |
| Illustrations | `.claude/skills/Design skills/illustrations.md` | AI image prompts for Gemini/ChatGPT |
| Accessibility | `.claude/skills/Design skills/accessibility.md` | WCAG AA, neurodivergent-friendly patterns |
| **Breakpoints** | `.claude/skills/breakpoints/SKILL.md` | Responsive breakpoint system, CSS specs |
| Website Review | `.claude/skills/website-review/SKILL.md` | QA testing with Chrome DevTools MCP |
| **Cloudflare** | `.claude/skills/cloudflare/SKILL.md` | Deployment management, cache purging, API |

### When to Consult Skills

- **Before any design changes** → Start with `EVOLEA-DESIGN-UX.md`
- **Adding animations** → Check `animations.md` for GSAP patterns
- **Responsive issues** → Check both `responsive.md` AND `breakpoints/SKILL.md`
- **New program page** → Follow `angebote-structure.md` template
- **Need illustrations** → Use prompts from `illustrations.md`
- **Accessibility concerns** → Check `accessibility.md` for WCAG standards
- **Deployment issues** → Check `cloudflare/SKILL.md` for queue cleanup, API usage

### CSS Changes Protocol

**IMPORTANT:** Before modifying `src/styles/global.css` or `tailwind.config.mjs`:
1. Consult the relevant skill documentation
2. Check if the pattern already exists in the codebase
3. Ask user for approval before adding new CSS variables or breakpoints
4. Test changes at all breakpoints (375px, 768px, 1024px, 1440px, 1920px)

<!-- GSD:project-start source:PROJECT.md -->
## Project

**EVOLEA Website Quality Lift (B → A)**

A targeted improvement pass on the live EVOLEA website (www.evolea.ch) — a bilingual DE/EN Astro 5.x site for a Swiss non-profit serving children on the autism spectrum or with ADHD. Based on the 2026-06-12 benchmark against eatplanted.com, this project closes the security, SEO, performance, and accessibility gaps to move the site from overall B (~76) to a solid A (90+) and beat eatplanted.com in all four audit categories, plus clears repo hygiene debt found during codebase mapping.

**Core Value:** After this project, independent audits (Mozilla Observatory, axe-core, crawler audit) score evolea.ch ahead of eatplanted.com in **all four** categories — security, SEO, performance, accessibility — without regressing any live functionality (forms, CMS, donations, language switching).

### Constraints

- **Tech stack**: Astro 5.x + Cloudflare Pages SSR — no replatforming; fixes are config/template-level only
- **Brand**: EVOLEA Brand Guide v3.0 is non-negotiable (no emojis, Fredoka headlines, prism gradient heroes, page closers, real photos) — the 404 page and any template edits must comply
- **Bilingual parity**: every user-facing change ships in DE and EN simultaneously; hreflang correctness is an existing advantage to preserve
- **Live site**: production NGO site — changes must not break Formspree forms, Keystatic CMS, donations, or language switching; CSP starts Report-Only for this reason
- **Visual fidelity**: image conversion must not visibly degrade photos (team/program photography is brand-critical)
- **Git**: cgjen-box GitHub account; gitleaks + check_secrets.py pre-commit hooks mandatory; no `--no-verify`
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.3 (installed) / ^5.7.2 (specified) - All source files, Astro frontmatter, config files
- HTML/CSS - Astro component templates and `src/styles/global.css`
- JavaScript (ES modules) - Config files (`astro.config.mjs`, `tailwind.config.mjs`), build scripts
- MDX - Blog content in `src/content/blog/` and `src/content/blogEn/`
- Python 3 - Dev tooling scripts (`scripts/check_secrets.py`, `scripts/generate_image.py`)
- PowerShell - Windows-targeted Cloudflare queue management (`scripts/Cancel-CloudflareDeployments.ps1`)
## Runtime
- Node.js 20 (pinned in CI via `actions/setup-node@v4`); local dev uses Node 26.0.0 (system)
- Cloudflare Workers runtime (production SSR via `@astrojs/cloudflare` adapter)
- npm 11.12.1
- Lockfile: `package-lock.json` present (lockfileVersion 3); `pnpm-lock.yaml` is untracked detritus — use npm
## Frameworks
- Astro 5.16.4 (installed) / ^5.1.1 (specified) - Full-stack static/SSR framework; primary build target
- React 18.3.1 - Used for interactive island components; registered via `@astrojs/react`
- Keystatic 0.5.48 (`@keystatic/core`) + `@keystatic/astro` 5.0.6 - GitHub-backed headless CMS, active only on Cloudflare build
- Tailwind CSS 3.4.18 - Utility-first CSS; custom EVOLEA theme in `tailwind.config.mjs`
- `@astrojs/tailwind` 6.0.2 - Astro integration
- GSAP 3.14.2 - Scroll animations and page transitions; used in `src/scripts/gsap-animations.ts` and `src/layouts/Base.astro`
- `@astrojs/mdx` 4.3.13 - MDX support for rich blog posts
- `@astrojs/check` 0.9.4 - TypeScript type-checking at build time (`astro check`)
- `@astrojs/sitemap` 3.2.1 - Auto-generates sitemap at build
- Husky 9.1.7 - Git hooks (pre-commit)
- `playwright-core` 1.57.0 - Browser automation used in dev QA scripts (`scripts/brand-qa.mjs`, `scripts/cms-qa.mjs`)
## Key Dependencies
- `astro` ^5.1.1 - Everything runs through this; SSR output depends on adapter injection
- `@astrojs/cloudflare` 12.6.13 - NOT in `package.json` dependencies; installed at Cloudflare build time via `npm run build:cloudflare`. The adapter is not available on Windows ARM64 and will silently fall back to static if `CF_PAGES != 1`
- `@keystatic/core` ^0.5.48 - CMS UI + GitHub OAuth content storage; requires three runtime env vars
- `@astrojs/react` ^4.4.2 - React island hydration
- `gsap` ^3.14.2 - Client-side animations
- `tailwindcss` ^3.4.18 - Design token system; hex literals in `tailwind.config.mjs` are duplicated as CSS vars in `src/styles/global.css` (both must be updated together)
- `typescript` ^5.7.2 - Strict mode; `tsconfig.json` extends `astro/tsconfigs/strict`
## Configuration
- `.env.example` documents the three required vars (names only): `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`
- `.env` present locally (pointer-only, no real values)
- Cloudflare Pages: secrets set via Cloudflare Dashboard; `KEYSTATIC_GITHUB_CLIENT_ID` is the only var inlined at build time (public OAuth client ID); all others are read at runtime via `process.env` (requires `nodejs_compat` flag + `compatibility_date >= 2025-04-01`)
- Local dev uses file-based Keystatic mode (no OAuth needed)
- `astro.config.mjs` - Main Astro config; dual-mode (static for GitHub Pages when `GITHUB_PAGES=true`, SSR for Cloudflare otherwise)
- `tailwind.config.mjs` - Full token system; content paths cover `src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}`
- `tsconfig.json` - Strict mode with path aliases: `@/` → `src/`, `@components/` → `src/components/`, `@layouts/` → `src/layouts/`, `@i18n/` → `src/i18n/`, `@content/` → `src/content/`
- `wrangler.toml` - Cloudflare Pages config; `compatibility_date = "2025-04-01"`, `compatibility_flags = ["nodejs_compat"]`
- Astro built-in i18n routing; locales `['de', 'en']`; German is `defaultLocale` with no prefix; English prefixed at `/en/`
- Fallback chain: `en → de`
- `prefixDefaultLocale: false` means German pages live at root paths (`/angebote/`, not `/de/angebote/`)
## Platform Requirements
- Node.js ≥ 20 recommended (CI pins to 20; local runs Node 26)
- Python 3 for `scripts/check_secrets.py` (runs in pre-commit hook)
- gitleaks binary required (pre-commit hook fails without it); install via `brew install gitleaks`
- Windows ARM64: cannot install `@astrojs/cloudflare` locally; static build used for local dev/preview
- Primary: Cloudflare Pages (`evolea-website` project) — SSR mode, custom domain `www.evolea.ch`
- Fallback: GitHub Pages (`cgjen-box/evolea-website`) — static output, base `/evolea-website`
- Build command on Cloudflare: `npm run build:cloudflare` (installs adapter before build)
- Output directory: `./dist`
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Astro components: PascalCase — `InnerPageHero.astro`, `FooterDonationCTA.astro`
- Page files: `index.astro` inside a named directory (e.g. `src/pages/angebote/mini-garten/index.astro`)
- TypeScript modules: camelCase — `gsap-animations.ts`, `utils.ts`, `ui.ts`
- Config files: camelCase — `tailwind.config.mjs`, `astro.config.mjs`
- Component subdirectories: lowercase, plural — `src/components/programs/`, `src/components/brand/`
- Pure utilities: camelCase — `getLangFromUrl`, `useTranslations`, `useTranslatedPath`, `getAlternateLang`
- React-style hooks (returning closures): `use*` prefix — `useTranslations(lang)` returns `t`, `useTranslatedPath(lang)` returns `translatePath`
- Local helpers defined inline inside frontmatter: camelCase — `getText`, `resolveLink`, `getArray`
- Standard camelCase — `siteSettings`, `homepageEntry`, `translatePath`
- Destructured Astro props: `const { title, variant = 'cream' } = Astro.props`
- The `lang` variable is always `'de' | 'en'` (derived from URL, never passed as prop)
- Interfaces: PascalCase — `interface Props { ... }`, `interface BreadcrumbItem { ... }`
- Union string types use string literals — `variant?: 'default' | 'calm' | 'sunset' | 'hero'`
- The `Lang` type is exported from `src/i18n/ui.ts` as `keyof typeof languages`
## Code Style
- No separate Prettier or ESLint config detected — formatting is enforced only by the TypeScript compiler via `astro check` (runs as part of `npm run build`)
- The pre-commit hook runs `npm run build` (`astro check && astro build`), which enforces TypeScript strict mode as the sole pre-commit style gate
- Strict mode via `"extends": "astro/tsconfig/strict"` in `tsconfig.json`
- `any` types are present in CMS-data-consuming code (program page components and `CafePage.astro`) where CMS schema uses `z.any()` — this is a known gap, not policy
- Content collection schemas (`src/content/config.ts`) use `z.any()` for `pages` and `settings` singletons because Keystatic manages those shapes
## Import Organization
- `@/` → `src/`
- `@components/` → `src/components/`
- `@layouts/` → `src/layouts/`
- `@i18n/` → `src/i18n/`
- `@content/` → `src/content/`
## Astro Component Structure
- `interface Props` is ALWAYS defined at the top of the frontmatter (never skipped)
- Default values are set in the destructuring line, not in the interface
- `class:list` is used for conditional class application; plain `class` for static
- `aria-hidden="true"` is mandatory on all decorative elements (orbs, butterflies, wave SVGs)
- `<style>` blocks are scoped per component; global overrides go in `src/styles/global.css`
## i18n Pattern
- ALWAYS derived from `getLangFromUrl(Astro.url)` inside the component
- NEVER passed as a prop from parent — `Base.astro` does not accept a `lang` prop
- Components that need `lang` (e.g. program page components) receive it as an explicit prop from their parent page wrapper
## DE/EN Page Parity Pattern
- The English file lives at a different path (different route slug)
- Fallback strings in `getText()` calls use English
- The `Base` title and description props use English
## Tailwind Usage
- Colors: `bg-evolea-magenta`, `text-evolea-purple`, `border-evolea-coral`
- Opacity modifiers work because hex literals are in `tailwind.config.mjs`: `bg-evolea-magenta/10`
- Custom gradients: `bg-gradient-prism`, `bg-gradient-magenta`
- Custom shadows: `shadow-soft`, `shadow-card`, `shadow-elevated`
- Custom border-radius: `rounded-evolea`, `rounded-evolea-lg`
- Custom z-index: `z-header` (50), `z-modal` (100), `z-float` (10)
## Brand Design Conventions in Code
- All scroll animations use GSAP via `src/scripts/gsap-animations.ts`
- All entrance animations (hero elements) use CSS `@keyframes` defined in component `<style>` blocks
- Both GSAP and CSS animations must include `@media (prefers-reduced-motion: reduce)` overrides that set opacity to 1 and disable transforms
## Error Handling
- Optional chaining (`?.`) is the primary guard against null CMS data — `homepageEntry?.data`, `page?.hero?.titel`
- Fallback values are provided at every getText call, never null-safe cascades left to fail
- The middleware's try/catch silently swallows errors during Keystatic HTML injection to avoid breaking page responses
- No application-level error boundaries or custom error pages beyond Astro's default 404
## Logging
- GSAP animations log prefixed with `[GSAP]` — `console.log('[GSAP] ...')` — kept intentionally for debugging animation issues
- Form copy errors log with `console.error('Failed to copy:', err)` in `/spenden/` and `/en/donate/`
- No logging in production SSR routes or middleware (errors are swallowed silently)
## Comments
- Component docblocks at the top of frontmatter describe non-obvious features
- HTML `<!-- section label comments -->` mark major layout blocks
- `// helper` inline labels on local utility functions
- CSS sections are separated by `/* ===== SECTION NAME ===== */` banners
- Configuration inline comments explain sync requirements (e.g. tailwind.config.mjs)
## Module Design
- `src/i18n/ui.ts` — named exports: `languages`, `defaultLang`, `showDefaultLang`, `ui`, `Lang`
- `src/i18n/utils.ts` — named exports: `getLangFromUrl`, `useTranslations`, `useTranslatedPath`, `getAlternateLang`, `getAlternatePath`, `getLanguageAlternates`
- `src/scripts/gsap-animations.ts` — named export: `initScrollAnimations`
- `src/content/config.ts` — named export: `collections`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
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
- Single `Base.astro` layout wraps every page; no other layouts exist
- DE pages live at root (`/`), EN pages live at `/en/`; DE is the Astro `defaultLocale`
- Program pages use a "thin wrapper + shared body component" pattern: both `src/pages/angebote/mini-garten/index.astro` and `src/pages/en/programs/mini-garden/index.astro` are byte-identical thin wrappers that both render `src/components/programs/MiniGartenPage.astro` — bilingual rendering is handled inside the component via `lang` prop
- CMS content is stored as JSON/MDX under `src/content/`; pages pull it at render time via `getEntry`/`getCollection` from `astro:content`
- React is included (`@astrojs/react`) but Astro components are the primary authoring format
- GSAP is used for scroll animations; initialized in `Base.astro` via `src/scripts/gsap-animations.ts`
## Layers
- Purpose: URL routing. Each file = one route. Thin frontmatter only — no inline business logic.
- Location: `src/pages/` (DE) and `src/pages/en/` (EN)
- Contains: Route entrypoints, `getStaticPaths` for blog dynamic routes (`export const prerender = true`)
- Depends on: Layout, Components, i18n utils, content collections
- Used by: Astro build router
- Purpose: Shared HTML shell for every page
- Location: `src/layouts/Base.astro`
- Contains: `<head>` meta/SEO/hreflang, skip link, Header, Footer, FooterDonationCTA, GSAP bootstrap
- Depends on: i18n utils (lang detection), content `settings/site` singleton, Header, Footer, FooterDonationCTA, global.css
- Props: `title`, `description?`, `image?`, `transparentHeader?`, `hideFooterCTA?`
- Purpose: Reusable UI. Program page bodies are full-page components shared across DE/EN wrappers.
- Location: `src/components/`, `src/components/programs/`, `src/components/brand/`
- Depends on: i18n utils (lang detection from URL), Icon.astro, content collections
- Purpose: Language detection, string translation, path translation, route mappings, hreflang generation
- Location: `src/i18n/ui.ts`, `src/i18n/utils.ts`
- `ui.ts`: Static key-value string table for DE and EN
- `utils.ts`: `getLangFromUrl` strips base URL before language prefix detection; `routeMappings` maps between DE slugs (`/spenden/`, `/angebote/mini-garten/`) and EN slugs (`/en/donate/`, `/en/programs/mini-garden/`) bidirectionally
- Purpose: CMS-managed structured data and MDX blog posts
- Location: `src/content/`
- Collections: `blog` (DE MDX), `blogEn` (EN MDX), `team`, `programs`, `principles`, `testimonials`, `pages` (singletons), `settings`
- Schema: `src/content/config.ts` defines Zod schemas; bilingual fields use `{ de?: string; en?: string }` objects
- Managed via: Keystatic CMS at `/keystatic/` (GitHub OAuth, GitHub-mode storage — commits directly to repo)
- Purpose: Request interception for Keystatic CMS pages only
- Location: `src/middleware.ts`
- Intercepts: All `GET /keystatic/*` HTML responses; injects client-side JS that hides the Deploy button and adds save-success/failure toasts
- All other requests pass through unmodified
## Data Flow
### Standard Page Request (Cloudflare SSR)
### Blog Dynamic Route (prerendered SSR)
### Language Switch
### CMS Edit Flow
### Dual Build Mode
| Variable | Output | Adapter | Site URL | Base Path |
|----------|--------|---------|----------|-----------|
| `GITHUB_PAGES=true` | `static` | None | `https://cgjen-box.github.io` | `/evolea-website` |
| (unset, Cloudflare) | `server` | `@astrojs/cloudflare` | `https://www.evolea.ch` | `/` |
- No client-side state store. All state is URL-driven (lang from `Astro.url.pathname`). CMS content is read at render time from `src/content/` files. GSAP scroll state is ephemeral in-memory.
## Key Abstractions
- Purpose: Represents content that has both a German and English version
- Pattern: `{ de?: string; en?: string }` — used throughout `src/content/config.ts` schemas and CMS JSON files
- Helper: `const getText = (obj, fallback) => lang === 'de' ? (obj.de || fallback) : (obj.en || obj.de || fallback)` — defined inline in each page/component (not centralized)
- Purpose: Tracks DE↔EN slug differences where paths differ by more than a language prefix
- Location: `src/i18n/utils.ts` (`routeMappings` constant)
- Example: DE `/spenden/` ↔ EN `/en/donate/`; DE `/angebote/mini-garten/` ↔ EN `/en/programs/mini-garden/`
- Used by: `useTranslatedPath`, `getAlternatePath`, `getLanguageAlternates`
- Purpose: Each program has a full-page body component shared by both DE and EN wrapper pages
- Location: `src/components/programs/*.astro`
- Pattern: Component receives `content`, `lang`, `translatePath`, `heroImage` as props and handles bilingual rendering internally using `getText(obj, fallback)`
- Purpose: CMS-managed page-level content overrides (hero text, section descriptions)
- Collections: `pages/homepage.json`, `pages/mini-garten.json`, `settings/site.json`, `settings/images.json`
- Access: `await getEntry('pages', 'homepage')` or `await getEntry('settings', 'site')`
- All fields are optional; every use provides a hardcoded fallback string
## Entry Points
- Location: `src/pages/index.astro`
- Triggers: Request to `/` (Cloudflare) or `/evolea-website/` (GitHub Pages)
- Location: `src/pages/en/index.astro`
- Triggers: Request to `/en/`
- Note: This is a physical file, not an Astro i18n fallback
- Location: `src/pages/blog/[...slug].astro` (DE), `src/pages/en/blog/[...slug].astro` (EN)
- Triggers: `getStaticPaths()` over `getCollection('blog')` / `getCollection('blogEn')`
- DE: `src/pages/spenden.astro` → URL `/spenden/`
- EN: `src/pages/en/donate.astro` → URL `/en/donate/`
- Base layout used with `hideFooterCTA={true}`
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
### Hardcoded brand values in Header and Footer
## Error Handling
- CMS entries: `const entry = await getEntry(...); const data = entry?.data;` — missing entries return `undefined`, content falls back to hardcoded strings
- Blog not found: `src/pages/blog/[...slug].astro` redirects to `/blog/` if post not found
- Middleware: Wraps HTML mutation in try/catch; returns original response if modification fails
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| breakpoints | Use this skill when implementing responsive design, optimizing layouts for different screen sizes, or working on responsive components for the EVOLEA website. Provides the EVOLEA breakpoint system, fluid typography scales, and responsive CSS patterns following 2025 best practices with EVOLEA brand adherence. | `.claude/skills/breakpoints/SKILL.md` |
| cloudflare | Use this skill for Cloudflare Pages deployment management, cache purging, and API operations. Includes scripts for cleaning up queued deployments, managing the deployment pipeline, and interacting with Cloudflare APIs. | `.claude/skills/cloudflare/SKILL.md` |
| image | ImageAgent - Generate EVOLEA Brand Images with Reinforcement Learning | `.claude/skills/image-generation-rl/SKILL.md` |
| website-review | Use this skill when performing QA reviews of the EVOLEA website (Astro frontend at localhost:4321), Admin Dashboard V2 (localhost:5175), or production sites (planted.com, admin.planted.com). Orchestrates visual inspection, console/network error detection, accessibility auditing, Core Web Vitals measurement, and interactive testing using Chrome DevTools MCP. (project) | `.claude/skills/website-review/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
