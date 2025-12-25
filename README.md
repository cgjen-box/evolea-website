# EVOLEA Website

Official website for EVOLEA Verein - a Swiss non-profit providing educational programs for children on the autism spectrum or with ADHD, based in Zurich.

## Live Sites

- **Production**: [evolea.ch](https://evolea.ch)
- **GitHub Pages**: [cgjen-box.github.io/evolea-website](https://cgjen-box.github.io/evolea-website/)
- **Cloudflare Pages**: [evolea-website.pages.dev](https://evolea-website.pages.dev/)
- **CMS (Keystatic)**: [evolea-website.pages.dev/keystatic](https://evolea-website.pages.dev/keystatic)

## Tech Stack

- **Framework**: Astro 5.x with static site generation
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom EVOLEA theme
- **CMS**: Keystatic (GitHub-based)
- **i18n**: Bilingual (German default, English with /en/ prefix)
- **Deployment**: GitHub Pages + Cloudflare Pages

## Project Structure

```
src/
├── components/     # Reusable Astro components
├── layouts/        # Page layouts (Base.astro)
├── pages/          # German pages (default)
│   └── en/         # English pages
├── i18n/           # Translation files and utilities
├── content/        # Content collections (blog, team, pages)
└── styles/         # Global CSS
```

## Commands

| Command           | Action                                       |
|:------------------|:---------------------------------------------|
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start local dev server at `localhost:4321`   |
| `npm run build`   | Build production site to `./dist/`           |
| `npm run preview` | Preview build locally before deploying       |

## Internationalization

- **German (de)**: Default language, no URL prefix (`/angebote/`)
- **English (en)**: URL prefix (`/en/programs/`)

Translations are managed in `src/i18n/ui.ts`.

## Programs

1. **Mini Garten** - Kindergarten prep (ages 3-6)
2. **Mini Projekte** - Social skills groups (ages 5-8)
3. **Mini Turnen** - Sports/gymnastics group (ages 5-8)
4. **EVOLEA Cafe** - Parent community meetup
5. **Tagesschule** - Day school (vision)

## Design System

See `.claude/todo/EVOLEA-BRAND-GUIDE-V3.md` for the complete brand guide including:
- Color palette (Magenta, Purple, Mint, etc.)
- Typography (Fredoka for headlines, Poppins for body)
- The 10 Brand Commandments
- Accessibility requirements

## Development

See `CLAUDE.md` for detailed project instructions, coding standards, and deployment procedures.

## Deployment

- **GitHub Pages**: Automatic via GitHub Actions on push to `main`
- **Cloudflare Pages**: Webhook trigger after push (see CLAUDE.md)

## License

Copyright 2025 EVOLEA Verein. All rights reserved.
