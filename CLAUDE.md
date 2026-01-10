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
- **CMS URL**: https://evolea-website.pages.dev/keystatic
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
| `Header.astro` | Navigation with language picker |
| `Footer.astro` | Site footer with links |
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

---

## Deployment

### Deployment Targets
- **GitHub Pages**: https://cgjen-box.github.io/evolea-website/
- **Cloudflare Pages**: https://evolea-website.pages.dev/
- **CMS (Keystatic)**: https://evolea-website.pages.dev/keystatic

### GitHub Account (IMPORTANT)

**Always use the `cgjen-box` GitHub account for this project.**

Before any git operations, verify and switch to the correct account:
```bash
# Check current account
gh auth status

# Switch to cgjen-box if needed
gh auth switch --user cgjen-box
```

### Post-Commit Deployment (MANDATORY)

**After every git push, ALWAYS do the following:**

1. **Trigger Cloudflare Deploy Hook**:
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/3e0b6230-6965-46cf-a7a2-176969101e48"
   ```

2. **Check GitHub Actions**: https://github.com/cgjen-box/evolea-website/actions

3. **Verify both sites are live**:
   - GitHub Pages: https://cgjen-box.github.io/evolea-website/
   - Cloudflare Pages: https://evolea-website.pages.dev/

**Common deployment issues:**
- TypeScript errors (unused variables, wrong imports)
- Missing dependencies
- Cloudflare stuck on old commit (use deploy hook to fix)

**Never assume a push succeeded - always verify!**

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

### When to Consult Skills

- **Before any design changes** → Start with `EVOLEA-DESIGN-UX.md`
- **Adding animations** → Check `animations.md` for GSAP patterns
- **Responsive issues** → Check both `responsive.md` AND `breakpoints/SKILL.md`
- **New program page** → Follow `angebote-structure.md` template
- **Need illustrations** → Use prompts from `illustrations.md`
- **Accessibility concerns** → Check `accessibility.md` for WCAG standards

### CSS Changes Protocol

**IMPORTANT:** Before modifying `src/styles/global.css` or `tailwind.config.mjs`:
1. Consult the relevant skill documentation
2. Check if the pattern already exists in the codebase
3. Ask user for approval before adding new CSS variables or breakpoints
4. Test changes at all breakpoints (375px, 768px, 1024px, 1440px, 1920px)
