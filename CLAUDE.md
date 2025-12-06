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
When generating images for EVOLEA, ALWAYS provide 2 different versions for the user to choose from. This allows for better selection and ensures the final image matches the brand perfectly.

**Subject Guidelines:**
- Children should appear ages 3-8 (depending on program)
- Show genuine joy and engagement
- Include activities relevant to the program
- Keep backgrounds simple but warm
- Butterflies can be included as brand element

**Brand Colors to Incorporate:**
- Cream: #FFFBF7
- Magenta: #DD48E0
- Purple: #BA53AD
- Mint: #7BEDD5
- Soft pinks and lavenders

---

## Tech Stack
- **Framework**: Astro 5.x with static site generation
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom EVOLEA theme
- **Deployment**: GitHub Pages via GitHub Actions
- **i18n**: Astro's built-in i18n routing (DE default, EN with /en/ prefix)

## Project Structure
```
src/
├── components/     # Reusable Astro components
├── layouts/        # Page layouts (Base.astro, etc.)
├── pages/          # German pages (default)
│   └── en/         # English pages (prefixed)
├── i18n/           # Translation files and utilities
│   ├── ui.ts       # UI string translations
│   └── utils.ts    # i18n helper functions
├── content/        # Content collections (programs, team, blog)
└── styles/         # Global CSS and Tailwind config
public/
├── images/         # Static images
├── fonts/          # Self-hosted fonts
└── CNAME           # GitHub Pages custom domain
```

## Key Commands
```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Coding Standards

### TypeScript
- Use strict mode, no `any` types
- Define interfaces for all component props
- Use path aliases (@/, @components/, etc.)

### Astro Components
```astro
---
// Frontmatter: imports, props, logic
interface Props {
  title: string;
  variant?: 'purple' | 'cream';
}
const { title, variant = 'cream' } = Astro.props;
---
<!-- Template: semantic HTML -->
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
// src/i18n/utils.ts
import { getLangFromUrl, useTranslations } from '@i18n/utils';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);

// Usage: t('nav.home') -> "Startseite" or "Home"
```

## Content Guidelines
- Use "Kinder im Spektrum" not "autistische Kinder"
- Focus on abilities, not deficits
- Formal "Sie" in German, warm professional tone
- Keep sentences clear and simple

## Programs (Content)
1. **Mini Garten** - Kindergarten prep (ages 3-6)
2. **Mini Projekte** - Social skills groups (ages 5-8)
3. **Mini Turnen** - Sports/gymnastics group (ages 5-8)
4. **B+U Schulberatung** - School consultation

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

## Deployment
GitHub Actions automatically builds and deploys on push to `main` branch. Custom domain: evolea.ch
