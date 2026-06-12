# Coding Conventions

**Analysis Date:** 2026-06-12

## Naming Patterns

**Files:**
- Astro components: PascalCase — `InnerPageHero.astro`, `FooterDonationCTA.astro`
- Page files: `index.astro` inside a named directory (e.g. `src/pages/angebote/mini-garten/index.astro`)
- TypeScript modules: camelCase — `gsap-animations.ts`, `utils.ts`, `ui.ts`
- Config files: camelCase — `tailwind.config.mjs`, `astro.config.mjs`
- Component subdirectories: lowercase, plural — `src/components/programs/`, `src/components/brand/`

**Functions:**
- Pure utilities: camelCase — `getLangFromUrl`, `useTranslations`, `useTranslatedPath`, `getAlternateLang`
- React-style hooks (returning closures): `use*` prefix — `useTranslations(lang)` returns `t`, `useTranslatedPath(lang)` returns `translatePath`
- Local helpers defined inline inside frontmatter: camelCase — `getText`, `resolveLink`, `getArray`

**Variables:**
- Standard camelCase — `siteSettings`, `homepageEntry`, `translatePath`
- Destructured Astro props: `const { title, variant = 'cream' } = Astro.props`
- The `lang` variable is always `'de' | 'en'` (derived from URL, never passed as prop)

**Types:**
- Interfaces: PascalCase — `interface Props { ... }`, `interface BreadcrumbItem { ... }`
- Union string types use string literals — `variant?: 'default' | 'calm' | 'sunset' | 'hero'`
- The `Lang` type is exported from `src/i18n/ui.ts` as `keyof typeof languages`

## Code Style

**Formatting:**
- No separate Prettier or ESLint config detected — formatting is enforced only by the TypeScript compiler via `astro check` (runs as part of `npm run build`)
- The pre-commit hook runs `npm run build` (`astro check && astro build`), which enforces TypeScript strict mode as the sole pre-commit style gate

**TypeScript:**
- Strict mode via `"extends": "astro/tsconfig/strict"` in `tsconfig.json`
- `any` types are present in CMS-data-consuming code (program page components and `CafePage.astro`) where CMS schema uses `z.any()` — this is a known gap, not policy
- Content collection schemas (`src/content/config.ts`) use `z.any()` for `pages` and `settings` singletons because Keystatic manages those shapes

## Import Organization

**Order (as observed in page files):**
1. Framework/layout imports — `import Base from '@layouts/Base.astro'`
2. Component imports — `import Icon from '@components/Icon.astro'`
3. i18n utilities — `import { getLangFromUrl, useTranslations, useTranslatedPath } from '@i18n/utils'`
4. Astro content APIs — `import { getCollection, getEntry } from 'astro:content'`

**Path Aliases (defined in `tsconfig.json`):**
- `@/` → `src/`
- `@components/` → `src/components/`
- `@layouts/` → `src/layouts/`
- `@i18n/` → `src/i18n/`
- `@content/` → `src/content/`

Never use relative `../` paths when an alias is available.

## Astro Component Structure

Every component must follow this structure:

```astro
---
/**
 * Optional JSDoc block describing purpose and notable features
 */
import SomeComponent from '@components/SomeComponent.astro';

interface Props {
  title: string;
  variant?: 'purple' | 'cream';
  someOptional?: boolean;
}

const { title, variant = 'cream', someOptional = false } = Astro.props;

// Derived values / helpers
const someClass = variant === 'purple' ? 'bg-evolea-purple' : 'bg-evolea-cream';
---

<section class:list={['base-class', someClass]}>
  <slot />
</section>

<style>
  /* Component-scoped CSS */
</style>
```

Key rules:
- `interface Props` is ALWAYS defined at the top of the frontmatter (never skipped)
- Default values are set in the destructuring line, not in the interface
- `class:list` is used for conditional class application; plain `class` for static
- `aria-hidden="true"` is mandatory on all decorative elements (orbs, butterflies, wave SVGs)
- `<style>` blocks are scoped per component; global overrides go in `src/styles/global.css`

## i18n Pattern

**The canonical pattern used in every page and most components:**

```typescript
import { getLangFromUrl, useTranslations, useTranslatedPath } from '@i18n/utils';

const lang = getLangFromUrl(Astro.url);       // returns 'de' | 'en'
const t = useTranslations(lang);              // returns t(key) -> string
const translatePath = useTranslatedPath(lang); // returns translatePath('/path/') -> prefixed string
```

**Bilingual text helper (defined inline in each page/component that needs it):**

```typescript
const getText = (obj: { de?: string; en?: string } | undefined, fallback: string = '') => {
  if (!obj) return fallback;
  return lang === 'de' ? (obj.de || fallback) : (obj.en || obj.de || fallback);
};
```

This helper is duplicated across every page and program component — it is not centrally exported. Always use this exact signature when adding it to a new file.

**Route mapping:** Special slug-different routes (e.g. `/spenden/` ↔ `/en/donate/`) are defined in `src/i18n/utils.ts` `routeMappings` object, NOT in `astro.config.mjs`. Add new bilingual slug pairs there.

**The `lang` variable:**
- ALWAYS derived from `getLangFromUrl(Astro.url)` inside the component
- NEVER passed as a prop from parent — `Base.astro` does not accept a `lang` prop
- Components that need `lang` (e.g. program page components) receive it as an explicit prop from their parent page wrapper

## DE/EN Page Parity Pattern

Every German page at `src/pages/<route>/index.astro` has a byte-identical English counterpart at `src/pages/en/<en-route>/index.astro`. The only differences are:
- The English file lives at a different path (different route slug)
- Fallback strings in `getText()` calls use English
- The `Base` title and description props use English

Both DE and EN wrappers render the **same shared component** (e.g. `MiniGartenPage.astro`), passing `lang` and `translatePath` as props. The shared component handles bilingual rendering internally.

```astro
<!-- src/pages/angebote/mini-garten/index.astro  AND  src/pages/en/programs/mini-garden/index.astro -->
<Base title={pageTitle} description={pageDescription}>
  <MiniGartenPage content={page} lang={lang} translatePath={translatePath} heroImage={heroImage} />
</Base>
```

## Tailwind Usage

**Brand tokens use the `evolea-*` prefix:**
- Colors: `bg-evolea-magenta`, `text-evolea-purple`, `border-evolea-coral`
- Opacity modifiers work because hex literals are in `tailwind.config.mjs`: `bg-evolea-magenta/10`
- Custom gradients: `bg-gradient-prism`, `bg-gradient-magenta`
- Custom shadows: `shadow-soft`, `shadow-card`, `shadow-elevated`
- Custom border-radius: `rounded-evolea`, `rounded-evolea-lg`
- Custom z-index: `z-header` (50), `z-modal` (100), `z-float` (10)

**Color token rule:** Hex values must be kept in sync between `tailwind.config.mjs` and `src/styles/global.css` `:root` block. When updating a color, update both. See the SYNC RULE comment in `tailwind.config.mjs` line 14.

**Avoid:** CSS variables (`var(--evolea-magenta)`) inside Tailwind class strings — use the Tailwind class name instead. CSS variables are for use in `<style>` blocks and inline styles only.

## Brand Design Conventions in Code

**No emojis — ever.** Use `<Icon name="..." size="..." />` from `src/components/Icon.astro`.

**Every hero must have a prism gradient background.** Use `InnerPageHero.astro` for inner pages. Never a flat colored hero.

**Text on gradients requires text-shadow.** See `InnerPageHero.astro` `.hero-title` for the canonical shadow value:
```css
text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5), 0 4px 20px rgba(138, 61, 158, 0.2);
```

**Mobile menus must have solid backgrounds.** No `backdrop-blur` or semi-transparent backgrounds for mobile navigation overlays.

**`FooterDonationCTA` before every footer** — the `Base.astro` layout renders it automatically. Suppress only on `/spenden/` and `/en/donate/` by passing `hideFooterCTA={true}` to `<Base>`.

**Animation convention:**
- All scroll animations use GSAP via `src/scripts/gsap-animations.ts`
- All entrance animations (hero elements) use CSS `@keyframes` defined in component `<style>` blocks
- Both GSAP and CSS animations must include `@media (prefers-reduced-motion: reduce)` overrides that set opacity to 1 and disable transforms

## Error Handling

**Patterns in production code:**
- Optional chaining (`?.`) is the primary guard against null CMS data — `homepageEntry?.data`, `page?.hero?.titel`
- Fallback values are provided at every getText call, never null-safe cascades left to fail
- The middleware's try/catch silently swallows errors during Keystatic HTML injection to avoid breaking page responses
- No application-level error boundaries or custom error pages beyond Astro's default 404

**Video autoplay:**
```typescript
playPromise.catch(() => {
  // Silently ignore autoplay rejection (browser policy)
});
```

## Logging

**Framework:** `console` (no logging library)

**Patterns:**
- GSAP animations log prefixed with `[GSAP]` — `console.log('[GSAP] ...')` — kept intentionally for debugging animation issues
- Form copy errors log with `console.error('Failed to copy:', err)` in `/spenden/` and `/en/donate/`
- No logging in production SSR routes or middleware (errors are swallowed silently)

## Comments

**When to Comment:**
- Component docblocks at the top of frontmatter describe non-obvious features
- HTML `<!-- section label comments -->` mark major layout blocks
- `// helper` inline labels on local utility functions
- CSS sections are separated by `/* ===== SECTION NAME ===== */` banners
- Configuration inline comments explain sync requirements (e.g. tailwind.config.mjs)

**Avoid:** Commented-out code left in place — remove it. TODO/FIXME comments are not present in current source.

## Module Design

**Exports (TypeScript modules):**
- `src/i18n/ui.ts` — named exports: `languages`, `defaultLang`, `showDefaultLang`, `ui`, `Lang`
- `src/i18n/utils.ts` — named exports: `getLangFromUrl`, `useTranslations`, `useTranslatedPath`, `getAlternateLang`, `getAlternatePath`, `getLanguageAlternates`
- `src/scripts/gsap-animations.ts` — named export: `initScrollAnimations`
- `src/content/config.ts` — named export: `collections`

**No barrel files.** Import components directly by path.

**Astro components export nothing** — they are consumed via path import only.

---

*Convention analysis: 2026-06-12*
