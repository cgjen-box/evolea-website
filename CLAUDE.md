# EVOLEA Website - Claude Project Instructions

## Project Overview
EVOLEA Verein website - a Swiss non-profit providing educational programs for children on the autism spectrum or with ADHD, based in Zürich. Built with Astro, TypeScript, and Tailwind CSS. Bilingual: German (default) and English.

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
- Color contrast ≥ 4.5:1
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

// Usage: t('nav.home') → "Startseite" or "Home"
```

## Brand Colors
```
evolea-purple: #6B4C8A
evolea-purple-light: #8B6CAA
evolea-purple-dark: #4A3460
evolea-cream: #FDF8F3
evolea-green: #7CB97C
evolea-orange: #E8A858
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
- [ ] Lighthouse accessibility score ≥ 90
- [ ] Mobile responsive (test 375px, 768px, 1024px)
- [ ] Both DE and EN routes work
- [ ] Forms submit correctly (Formspree)
- [ ] No console errors
- [ ] Images optimized and lazy-loaded

## Deployment
GitHub Actions automatically builds and deploys on push to `main` branch. Custom domain: evolea.ch

## Image Generation
Use ImageAgent to create pictures with google nano banana pro. He has the API key. 
