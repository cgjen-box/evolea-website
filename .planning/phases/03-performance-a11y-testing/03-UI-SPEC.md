---
phase: 3
slug: performance-a11y-testing
status: draft
shadcn_initialized: false
preset: not applicable (Astro + Tailwind with in-repo EVOLEA design system)
created: 2026-06-12
---

# Phase 3 — UI Design Contract: Bilingual 404 Page

> The only new UI surface in Phase 3 is `src/pages/404.astro` (A11Y-03). Everything else in the phase is attribute/token/test work with no new visuals. This contract is scoped to that single page.

**Why one bilingual page:** verified live (03-RESEARCH.md, Pattern 2), Astro's `fallback: { en: 'de' }` 302-strips the `/en/` prefix from unmatched URLs before the 404 renders, so `getLangFromUrl` always returns `de`. The page therefore carries DE content first and EN content below it on the same page. Do NOT create `src/pages/en/404.astro`.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (existing EVOLEA design system — no shadcn; not a React app surface) |
| Component library | In-repo Astro components: `Base.astro`, `InnerPageHero.astro`, `Icon.astro` |
| Icon library | `src/components/Icon.astro` (35 named SVG icons, gradient default) |
| Fonts | Fredoka (headlines, 600/700), Poppins (body/UI, 400/500/600) — self-hosted, already preloaded by Base |
| Tokens | `tailwind.config.mjs` `evolea.*` colors + `bg-gradient-*`; CSS vars mirrored in `global.css` — **no new tokens needed for this page** |

Brand commandments satisfied structurally: prism gradient hero (#7), page closer (#8), Fredoka headlines (#9), SVG icons only / no emojis (#1), text shadows on gradient (#3 — built into `InnerPageHero` title styles).

---

## Layout Structure

```
Base (title="Seite nicht gefunden", description=bilingual meta, NO hideFooterCTA)
│
├── InnerPageHero                       ← prism gradient hero (commandment #7)
│     size="md", breadcrumbs={[]}       ← empty array suppresses BreadcrumbList JSON-LD (verified)
│     label="404"                       ← glass pill above title
│     title="Seite nicht gefunden"      ← H1, Fredoka 700, built-in text shadow
│     subtitle=DE one-liner (below)
│
├── <section> Content (bg-evolea-cream, py-16 md:py-24, container max-w-4xl px-4)
│     ├── DE block
│     │     ├── intro paragraph (Poppins, text-evolea-text)
│     │     └── 3 link cards (grid: 1-col mobile → 3-col ≥768px)
│     │           Startseite · Angebote · Blog
│     └── EN block — white card, rounded-evolea-lg, shadow-soft, p-6 md:p-8,
│           wrapped in <div lang="en"> (screen-reader language switch)
│           ├── H2 "Page not found" (Fredoka 700, text-evolea-purple)
│           ├── intro paragraph
│           └── 3 link cards (same grid)
│                 Home · Programs · Blog
│
├── FooterDonationCTA                   ← page closer, automatic via Base (commandment #8)
└── Footer                              ← automatic via Base
```

Implementation notes:
- **No `export const prerender`** — on-demand in SSR (Astro auto-sets status 404), builds to `dist/404.html` on static builds. No client JS.
- **No `Astro.url` interpolation anywhere in the body** (research security note: never reflect the requested path into 404 HTML).
- File follows the `impressum.astro` shared single-file pattern, but uses `InnerPageHero` instead of a plain heading (404 must carry the gradient hero).

### Link card component (inline markup, no new component file)

Whole card is one `<a>` block:
- `bg-white rounded-evolea shadow-soft p-6 flex flex-col items-center gap-3 text-center`
- `<Icon name={...} size="lg" />` (48px, gradient default)
- Label: Fredoka 600 (`font-display font-semibold`), `1.125rem`, color `text-evolea-purple-dark` (#8A3D7E — see Color, contrast-driven choice)
- Hover: `translateY(-4px)` lift + `shadow-card`, `transition` 0.3s ease
- Focus: `focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-evolea-magenta focus-visible:outline-offset-2` (or scoped CSS equivalent)
- Reduced motion: `@media (prefers-reduced-motion: reduce)` → no transform, no transition
- Min touch target trivially met (full card ≥ 44×44px)

---

## Copywriting (exact, final)

EVOLEA voice: warm not clinical, "Sie" form, Swiss orthography, short sentences, ability-focused, butterfly metaphor available. No emojis.

### Meta (Base props)

| Element | Copy |
|---------|------|
| `title` | `Seite nicht gefunden` (Base auto-suffixes "– EVOLEA") |
| `description` | `Diese Seite wurde nicht gefunden. Entdecken Sie die Angebote von EVOLEA für Kinder im Spektrum. This page was not found.` |

### Hero (German, primary)

| Element | Copy |
|---------|------|
| Label pill | `404` |
| H1 | `Seite nicht gefunden` |
| Subtitle | `Diese Seite ist weitergeflattert. Hier finden Sie schnell zurück.` |

### DE content block

| Element | Copy |
|---------|------|
| Intro paragraph | `Die gesuchte Seite existiert nicht oder wurde verschoben. Entdecken Sie stattdessen unsere Angebote für Kinder im Spektrum oder lesen Sie Neues aus unserem Blog.` |
| Link 1 | `Zur Startseite` |
| Link 2 | `Unsere Angebote` |
| Link 3 | `Zum Blog` |

### EN content block (inside `<div lang="en">`)

| Element | Copy |
|---------|------|
| H2 | `Page not found` |
| Intro paragraph | `This page has fluttered on. The page you are looking for does not exist or has moved. Discover our programs for children on the spectrum or read the latest from our blog.` |
| Link 1 | `Back to home` |
| Link 2 | `Our programs` |
| Link 3 | `To the blog` |

No CTAs beyond the link cards — the gold donation CTA arrives automatically via the page closer and must NOT be duplicated in the body (gold is reserved for donation CTAs only).

---

## Link Targets

All hrefs base-prefixed: `const base = import.meta.env.BASE_URL.replace(/\/$/, '')` (GitHub Pages `/evolea-website` invariant). **Do not use `translatePath()` for the EN set** — lang context is always `de` on 404s; hardcode both sets.

| Link | href |
|------|------|
| Zur Startseite | `${base}/` |
| Unsere Angebote | `${base}/angebote/` |
| Zum Blog | `${base}/blog/` |
| Back to home | `${base}/en/` |
| Our programs | `${base}/en/programs/` |
| To the blog | `${base}/en/blog/` |

(Angebote + Blog links in both languages satisfy A11Y-03.)

---

## Icon Choices (Icon.astro, size="lg", gradient default)

| Link | Icon | Rationale |
|------|------|-----------|
| Startseite / Home | `sprout` | Growth/Entfaltung, brand's core metaphor |
| Angebote / Programs | `school` | Educational programs |
| Blog | `book` | Reading/articles |

Same three icons for DE and EN sets (visual parity). No emojis anywhere (commandment #1). Butterflies/orbs come free from `InnerPageHero` and `FooterDonationCTA` — do not add extra decorative elements.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FFFBF7` cream (`bg-evolea-cream`) | Content section background (via body default) |
| Secondary (30%) | `#FFFFFF` (`bg-white`) | Link cards, EN block card |
| Accent (10%) | Prism gradient + `#BA53AD`/`#8A3D7E` purple | Hero background, headlines, icon gradients, focus outlines (magenta `#DD48E0`) |
| Reserved | `#E8B86D` gold | NOT used in page body — appears only in the automatic FooterDonationCTA |

Text colors with verified contrast:

| Text | Token | Hex | Background | Ratio | AA |
|------|-------|-----|-----------|-------|-----|
| H1 hero | built-in | `#BA53AD` + white text shadow | gradient | n/a (shadowed, axe-verified under reduced motion) | per existing pattern |
| H2 EN (large, ≥1.75rem bold) | `text-evolea-purple` | `#BA53AD` | white | 4.08:1 | PASS (large text ≥3:1) |
| Body | `text-evolea-text` | `#2D2A32` | cream/white | ≈13:1 | PASS |
| Card link labels (1.125rem) | `text-evolea-purple-dark` | `#8A3D7E` | white | 6.89:1 | PASS |

**Rule:** purple text at ≤18px on white MUST use `text-evolea-purple-dark` (#8A3D7E), not `text-evolea-purple` (#BA53AD fails 4.5:1 at body size). This is why card labels use purple-dark.

---

## Typography

| Role | Font | Size | Weight | Line Height |
|------|------|------|--------|-------------|
| H1 (hero) | Fredoka | built-in `clamp(2.5rem, 7vw, 4.5rem)` | 700 | 1.1 |
| Hero subtitle | Poppins | built-in `clamp(1rem, 2vw, 1.25rem)` | 400 | 1.7 |
| H2 (EN block) | Fredoka | `clamp(1.75rem, 4vw, 2.25rem)` | 700 | 1.2 |
| Body paragraphs | Poppins | `1.0625rem` (`text-[1.0625rem]` or `text-lg` at md+) | 400 | 1.7 |
| Card link labels | Fredoka | `1.125rem` | 600 | 1.3 |
| Hero label pill | Poppins | built-in `0.875rem` | 600 | — |

3 sizes beyond the hero built-ins, 2 weights per family — within budget. No new font files or weights.

---

## Spacing Scale

Existing site rhythm, all multiples of 4:

| Token | Value | Usage |
|-------|-------|-------|
| Section vertical | `py-16 md:py-24` (64→96px) | Content section |
| Container | `max-w-4xl px-4` | Content width |
| Card padding | `p-6` (24px), EN block `p-6 md:p-8` | Cards |
| Grid gap | `gap-4 md:gap-6` (16→24px) | Link card grid |
| Block separation | `mt-12 md:mt-16` (48→64px) | DE block → EN block |
| Paragraph → cards | `mt-8` (32px) | Intro → link grid |

Exceptions: none.

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| 375px (mobile) | Hero `hero-md` (stacks naturally, H1 clamps to 2.5rem). Link cards stack 1-col, full width. EN card full width, `p-6`. All touch targets ≥44px (full-width cards). |
| 768px (`md:`) | Link cards → `grid-cols-3`. Section padding grows to `py-24`. Body text may step to `text-lg`. |
| 1024px (`lg:`) | No structural change; container `max-w-4xl` centers with more whitespace. Hero orbs scale per built-in styles. |

Test per checklist at 375 / 768 / 1024 (and 1440 sanity check for orb scaling — handled by InnerPageHero).

---

## Accessibility Notes (WCAG AA)

1. **Language switching:** `<html lang="de">` (automatic via Base). EN block MUST be wrapped in `<div lang="en">` so screen readers switch pronunciation. EN link card labels live inside that wrapper.
2. **Heading hierarchy:** exactly one H1 (hero title), one H2 (EN "Page not found"). No skipped levels.
3. **Decorative elements:** orbs/butterflies/wave are `aria-hidden="true"` (built into InnerPageHero and FooterDonationCTA — do not duplicate).
4. **Focus indicators:** visible 3px outline on link cards (`outline-evolea-magenta`, offset 2px). Never `outline: none` without replacement.
5. **Reduced motion:** InnerPageHero and FooterDonationCTA already carry `prefers-reduced-motion` overrides; the only NEW animation (card hover lift/transition) must add its own reduce override.
6. **Contrast:** see Color table — all combos verified ≥4.5:1 (normal) / ≥3:1 (large).
7. **Keyboard:** link cards are plain `<a>` elements — natively focusable/activatable; skip link comes from Base.
8. **Status code:** smoke test asserts `GET /this-page-does-not-exist/` → HTTP 404 with branded content and BOTH DE and EN link sets visible (per 03-RESEARCH.md smoke inventory).
9. **axe scan:** 404 page is in the AxeBuilder scan set; run under `reducedMotion: 'reduce'` emulation.
10. **Security:** never interpolate the requested URL/path/query into the page body (reflected-content sink). Copy is fully static.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none (no shadcn, no third-party registries) | — | not applicable |

---

## Pre-Populated From

| Source | Decisions Used |
|--------|---------------|
| 03-RESEARCH.md | 6 (single bilingual page, no `/en/404`, Base+InnerPageHero+Icon composition, no prerender, no URL reflection, smoke/axe assertions) |
| EVOLEA-CLAUDE-DESIGN-SYSTEM.md + Brand Guide v3 | 8 (gradient hero, page closer, Fredoka/Poppins, color tokens, voice/tone, icon-only rule, gold reservation, SVG-illustration tier for 404) |
| Codebase (components, tailwind.config.mjs, impressum pattern) | 7 (token names, hero props, card/shadow/radius tokens, base-URL invariant) |
| User input | 0 (no open questions — layout was explicitly Claude's discretion) |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
