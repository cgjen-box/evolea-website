# EVOLEA Website

[![Deploy to GitHub Pages](https://github.com/evolea/evolea-website/actions/workflows/deploy.yml/badge.svg)](https://github.com/evolea/evolea-website/actions/workflows/deploy.yml)

Official website for EVOLEA Verein - a Swiss non-profit providing educational programs for children on the autism spectrum or with ADHD.

## 🌐 Live Site

- **Production**: [https://evolea.ch](https://evolea.ch)

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/) 5.x
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom EVOLEA theme
- **i18n**: Bilingual (German default, English)
- **Deployment**: GitHub Pages via GitHub Actions

## 📁 Project Structure

```
src/
├── components/     # Reusable Astro components
├── layouts/        # Page layouts
├── pages/          # German pages (default)
│   └── en/         # English pages
├── i18n/           # Translation files
├── content/        # Content collections
└── styles/         # Global styles
```

## 🧞 Commands

| Command           | Action                                       |
|:------------------|:---------------------------------------------|
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start local dev server at `localhost:4321`   |
| `npm run build`   | Build production site to `./dist/`           |
| `npm run preview` | Preview build locally before deploying       |

## 🌍 Internationalization

- **German (de)**: Default language, no URL prefix (`/angebote/`)
- **English (en)**: URL prefix (`/en/programs/`)

Translations are managed in `src/i18n/ui.ts`.

## 🎨 Design System

See `.github/copilot-instructions.md` for the complete EVOLEA design agent guidelines including:
- Color palette
- Typography
- Accessibility requirements
- Component patterns

## 📝 AI Agents

This project uses AI agents for development:

1. **GitHub Copilot**: See `.github/copilot-instructions.md` for the EVOLEA Design Agent
2. **Claude CLI**: See `CLAUDE.md` for project context and coding standards

## 🚀 Deployment

Automatic deployment via GitHub Actions on push to `main` branch.

### Custom Domain Setup

1. DNS A records pointing to GitHub Pages IPs:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153

2. CNAME record: `www` → `evolea.github.io`

3. Enable HTTPS in repository settings

## 📄 License

© 2025 EVOLEA Verein. All rights reserved.
