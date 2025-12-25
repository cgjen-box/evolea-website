# EVOLEA Harmonization Project - Use Cases & Acceptance Criteria

**Project**: EVOLEA Website Harmonization
**Version**: 1.0
**Date**: December 25, 2024
**Purpose**: Detailed acceptance criteria and test cases for implementation agents

---

## Table of Contents

1. [UC-1: Mini Museum Hero Rendering](#uc-1-mini-museum-hero-rendering)
2. [UC-2: Image Generation Pipeline](#uc-2-image-generation-pipeline)
3. [UC-3: Hover Guards for Touch Devices](#uc-3-hover-guards-for-touch-devices)
4. [UC-4: GSAP Scroll Animations](#uc-4-gsap-scroll-animations)
5. [UC-5: Site-Wide Emoji Audit](#uc-5-site-wide-emoji-audit)
6. [UC-6: Build & Regression Testing](#uc-6-build--regression-testing)

---

## UC-1: Mini Museum Hero Rendering

**Priority**: HIGH
**Dependencies**: None
**Estimated Complexity**: Medium

### Description
The Mini Museum page (`/angebote/mini-museum/`) currently uses an emoji in the hero badge and lacks a proper hero image. It must be updated to match the Mini Projekte reference implementation with a gradient hero background and proper visual hierarchy.

### Preconditions
- Mini Museum page exists at `src/pages/angebote/mini-museum/index.astro`
- Mini Projekte reference page exists at `src/pages/angebote/mini-projekte/index.astro`
- Icon.astro component is available with 'museum' or 'palette' icons
- CMS entry for site images exists at `content/settings/images.json`

### Steps to Test

#### Test 1.1: Emoji Removal
1. Navigate to `/angebote/mini-museum/` (local or staging)
2. Inspect the hero badge (top section, above title)
3. Verify no emoji characters appear (specifically no 💜 purple heart)
4. Verify badge uses `<Icon name="palette" />` or `<Icon name="museum" />` instead

**Expected Result**:
- Badge shows SVG icon, not emoji
- Badge text reads "Februar – April 2026" with icon
- Badge has `bg-white/20 backdrop-blur-sm` styling

#### Test 1.2: Hero Image Display (Mobile 375px)
1. Set browser width to 375px (iPhone SE)
2. Navigate to `/angebote/mini-museum/`
3. Scroll to hero section
4. Inspect the `<img>` element in hero

**Expected Result**:
- Image loads successfully (check Network tab)
- Image source is either:
  - `${base}/images/generated/mini-museum-hero.png`, OR
  - CMS-configured path from `siteImages.programmeHeroes.miniMuseum`
- Image has descriptive alt text: "Kinder gestalten kreative Kunstwerke für ihr eigenes Museum"
- Image has rounded corners (`rounded-evolea-lg` class)
- Aspect ratio is 4:3 (`aspect-4/3` class)
- Image is visible and not cut off

#### Test 1.3: Hero Image Display (Tablet 768px)
1. Set browser width to 768px
2. Navigate to `/angebote/mini-museum/`
3. Verify image scales proportionally
4. Check that layout switches to 2-column grid if applicable

**Expected Result**:
- Image maintains aspect ratio
- No pixelation or stretching
- Grid layout adapts to medium breakpoint

#### Test 1.4: Hero Image Display (Desktop 1440px)
1. Set browser width to 1440px
2. Navigate to `/angebote/mini-museum/`
3. Verify full hero layout

**Expected Result**:
- Two-column layout with text on left, image on right
- Image max-width constrained appropriately
- Age badge (6 Halbtage) visible in bottom-right corner
- Gradient background visible behind content

#### Test 1.5: Age Badge Rendering
1. At any viewport width, inspect bottom-right corner of hero
2. Verify age/duration badge appears

**Expected Result**:
- Badge shows "6" in large display font
- Label shows "Halbtage"
- Badge has white background with shadow
- Badge is `hidden md:block` (mobile hidden, tablet+ visible)
- Badge positioned with `absolute bottom-8 right-8`

#### Test 1.6: Screen Reader Announcement
1. Enable screen reader (NVDA on Windows, VoiceOver on Mac)
2. Navigate to `/angebote/mini-museum/`
3. Tab through hero section

**Expected Result**:
- H1 reads: "Mini Museum"
- Hero tagline reads: "Wir werden kreativ!"
- Image alt text is announced clearly
- Badge icon is `aria-hidden="true"` (not announced)
- No emoji characters read aloud

#### Test 1.7: Gradient Background Visibility
1. Navigate to `/angebote/mini-museum/`
2. Inspect hero section background
3. Use DevTools to check computed styles

**Expected Result**:
- Hero section has `::before` pseudo-element OR direct `background` with prism gradient
- Gradient colors visible: Purple (#BA53AD) → Magenta (#DD48E0) → Coral (#FF7E5D)
- Text has proper shadow for readability on gradient
- Gradient `z-index: -1` or `z-index: 0` (behind text)

### Edge Cases

**EC-1.1**: Missing hero image in CMS
- If `siteImages.programmeHeroes.miniMuseum` is undefined
- Fallback to `/images/generated/mini-museum-hero.png`
- If that also fails, show placeholder or skip image (no broken image icon)

**EC-1.2**: Very long program title
- If title exceeds 3 lines on mobile
- Text should wrap gracefully
- Font size may scale down slightly via `clamp()`

**EC-1.3**: High contrast mode
- Enable Windows High Contrast mode
- Verify text remains readable on gradient
- Border may appear around elements

**EC-1.4**: Reduced motion
- Set `prefers-reduced-motion: reduce`
- No animations on hero elements
- Gradient and image appear instantly

### Accessibility Requirements
- [ ] Image alt text is descriptive (not "hero image")
- [ ] Heading hierarchy correct (H1 for page title)
- [ ] Color contrast ≥ 4.5:1 for all text on gradient
- [ ] Text shadow applied to all text on gradient backgrounds
- [ ] Focus indicators visible on all interactive elements
- [ ] Breadcrumbs provide context

### Files to Modify
- `src/pages/angebote/mini-museum/index.astro`
- Potentially `public/images/generated/mini-museum-hero.png` (if new image generated)
- Potentially `src/content/settings/images.json` (CMS config)

### Reference Implementation
- Use `src/pages/angebote/mini-projekte/index.astro` lines 60-110 as template

---

## UC-2: Image Generation Pipeline

**Priority**: MEDIUM
**Dependencies**: None
**Estimated Complexity**: Medium

### Description
Create a standardized script and workflow for generating EVOLEA brand-compliant images using AI tools (Gemini/ChatGPT), with proper directory structure and documentation.

### Preconditions
- Node.js environment available
- `scripts/` directory exists
- Access to AI image generation tools (Gemini Flash Thinking/ChatGPT)
- EVOLEA Brand Guide v3.0 available at `.claude/todo/EVOLEA-BRAND-GUIDE-V3.md`

### Steps to Test

#### Test 2.1: Script Existence
1. Check if file exists: `scripts/generate-images.mjs` or `scripts/image-generator.mjs`
2. Verify file is executable JavaScript/TypeScript

**Expected Result**:
- Script file exists
- File has `.mjs` or `.js` extension
- Shebang or npm script defined

#### Test 2.2: Script Execution (Dry Run)
1. Open terminal in project root
2. Run: `node scripts/generate-images.mjs --help`
3. Verify help output appears

**Expected Result**:
```
Usage: node scripts/generate-images.mjs [options]

Options:
  --subject <name>     Subject for image (e.g., "mini-museum-hero")
  --prompt <text>      Custom prompt text
  --output <path>      Output path (default: public/images/generated/)
  --dry-run            Show prompt without generating
  --help               Show this help
```

#### Test 2.3: Directory Structure
1. Check if `public/images/generated/` exists
2. Check if `.gitignore` includes generated images OR if they're committed

**Expected Result**:
- Directory structure:
  ```
  public/
    images/
      generated/
        mini-museum-hero.png
        mini-restaurant-hero.png
        blog/
        social/
  ```
- Either:
  - Files committed to git (small, optimized), OR
  - `public/images/generated/` in `.gitignore` with README explaining regeneration

#### Test 2.4: Prompt Generation
1. Run: `node scripts/generate-images.mjs --subject mini-museum-hero --dry-run`
2. Verify generated prompt follows EVOLEA brand guidelines

**Expected Result**:
Prompt includes:
- Style: "Warm, soft watercolor illustration"
- Colors: "Cream (#FFFBF7), Pink (#FF9ECC), Purple (#BA53AD), Mint (#7BEDD5)"
- Cultural context: "Swiss/Central European children"
- No religious symbols or head coverings on children
- Subject-specific details (e.g., "children ages 5-8 creating art in museum")
- Lighting: "Bright, natural lighting"
- Mood: "Joyful, warm, professional but approachable"

#### Test 2.5: Mock API Integration
1. Create a mock API response (JSON file or stub)
2. Run script with `--mock` flag
3. Verify image would be saved to correct location

**Expected Result**:
- Script would save to `public/images/generated/mini-museum-hero.png`
- Image would be in PNG or WebP format
- File naming convention: lowercase, hyphen-separated

#### Test 2.6: Brand Compliance Check
1. Review generated prompts for all use cases:
   - Hero images (programs)
   - Blog post illustrations
   - Social media graphics
2. Verify adherence to EVOLEA Brand Guide

**Expected Result**:
- No AI-generated images for team photos, real program photos, or heroes (use real photos)
- AI images ONLY for:
  - Blog post illustrations (when no photo available)
  - Social media graphics
  - Decorative/supplementary content
- All prompts follow color palette
- All prompts specify "no emojis, no text overlays"

### Edge Cases

**EC-2.1**: API rate limiting
- If image generation API is rate-limited
- Script should handle gracefully with retry logic or clear error message

**EC-2.2**: Large image file sizes
- Generated images may be > 1MB
- Script should include optimization step (sharp, imagemin)
- Target: < 300KB for hero images

**EC-2.3**: Missing API key
- If no API key configured
- Script should fail with helpful message: "Set GEMINI_API_KEY or OPENAI_API_KEY in .env"

**EC-2.4**: Multiple variations
- Generate 2 options per request (per brand guidelines)
- Script should save both: `mini-museum-hero-option-1.png`, `mini-museum-hero-option-2.png`

### Accessibility Requirements
- [ ] README explains how to add alt text for generated images
- [ ] Default alt text suggestions included in script output
- [ ] Images optimized for performance (lazy loading compatible)

### Files to Create
- `scripts/generate-images.mjs` (main script)
- `scripts/prompts/evolea-image-prompts.json` (reusable prompts)
- `public/images/generated/README.md` (explains regeneration)
- `.env.example` (API key template)

### Documentation Required
```markdown
# Image Generation Pipeline

## Setup
1. Copy `.env.example` to `.env`
2. Add your API key: `GEMINI_API_KEY=your_key`

## Usage
Generate hero image:
```bash
npm run generate:image -- --subject mini-museum-hero
```

Generate blog illustration:
```bash
npm run generate:image -- --subject blog-autism-friendly-spaces
```

## Brand Guidelines
- Always generate 2 options
- Use warm, soft color palette
- No emojis or text overlays
- Swiss/Central European context
- Review output for brand compliance before using

## Allowed Use Cases
✅ Blog post illustrations
✅ Social media graphics
✅ Decorative elements
❌ Team photos (use real photos)
❌ Program hero images (use real photos)
❌ Testimonial images (use real photos)
```

---

## UC-3: Hover Guards for Touch Devices

**Priority**: HIGH
**Dependencies**: None
**Estimated Complexity**: Medium

### Description
Implement CSS and/or JavaScript guards to prevent hover states from becoming "sticky" on touch devices. Cards and interactive elements should respond properly to touch without requiring a second tap to dismiss hover states.

### Preconditions
- Site has hover effects on cards, buttons, links
- Testing devices available: iPhone/Android phone, iPad/Android tablet
- Site uses Tailwind CSS with custom styles

### Steps to Test

#### Test 3.1: Card Hover on Desktop (Mouse)
1. Use desktop browser with mouse pointer
2. Navigate to homepage program cards OR blog cards
3. Hover over a card without clicking
4. Move mouse away from card

**Expected Result**:
- Card lifts/scales on hover (e.g., `translateY(-8px)`)
- Shadow increases on hover
- Spectrum gradient bar animates in (if applicable)
- Hover effect immediately reverses when mouse leaves
- Cursor changes to pointer if card is clickable

#### Test 3.2: Card Touch on Mobile (Touch)
1. Use real iPhone or Android phone (or Chrome DevTools touch emulation)
2. Navigate to homepage program cards
3. Tap a card once
4. Observe behavior

**Expected Result**:
- Card navigation happens immediately on first tap (if clickable)
- No "sticky" hover state remains after navigation
- OR if card requires explicit tap to activate:
  - First tap shows hover state briefly
  - Card immediately returns to normal state (no second tap needed)

#### Test 3.3: Focus State Independence
1. Use desktop browser
2. Tab to a card using keyboard
3. Press Enter to activate
4. Observe focus vs. hover behavior

**Expected Result**:
- Focus state (outline) is distinct from hover state
- Focus ring visible at all times when element has focus
- Hover effects do NOT trigger on keyboard focus alone
- `:focus-visible` used instead of `:focus`

#### Test 3.4: CSS Pointer Media Query
1. Inspect stylesheet or computed styles
2. Check for `@media (hover: hover) and (pointer: fine)` usage

**Expected Result**:
Hover effects wrapped in media query:
```css
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(186, 83, 173, 0.15);
  }
}
```

Touch devices receive simpler interaction:
```css
/* Touch devices - active state only */
@media (hover: none) and (pointer: coarse) {
  .card:active {
    transform: scale(0.98);
  }
}
```

#### Test 3.5: Button Hover vs. Active
1. On mobile, tap a primary button (e.g., "Jetzt anmelden")
2. Observe visual feedback during tap

**Expected Result**:
- Desktop: Hover state on mouseover, active state on click
- Mobile: Active state on touch, no hover state
- Mobile active state: `scale(0.98)` or similar
- Transition is immediate (< 200ms)

#### Test 3.6: Navigation Link Hover
1. Desktop: Hover over navigation links in header
2. Mobile: Tap navigation links

**Expected Result**:
- Desktop: Underline or color change on hover
- Mobile: No hover effect, link activates on tap
- Mobile menu (if hamburger): Opens/closes on tap, no hover required

### Edge Cases

**EC-3.1**: Hybrid devices (Surface Pro, iPad with mouse)
- Device supports both touch and mouse
- Hover effects should work with mouse
- Touch should not trigger hover

**EC-3.2**: Apple Pencil on iPad
- Pencil hover (iPadOS 16+) may trigger hover states
- Behavior should match mouse, not finger touch

**EC-3.3**: Slow network on mobile
- Hover effects should not delay navigation
- CSS transitions should be performant (GPU-only: transform, opacity)

### Accessibility Requirements
- [ ] Focus states work independently of hover
- [ ] `:focus-visible` used to prevent mouse-focus outlines
- [ ] Active states provide visual feedback
- [ ] Touch targets minimum 44x44px
- [ ] No hover-only content (must be accessible via keyboard/touch)

### Implementation Patterns

**Pattern A: CSS-Only (Recommended)**
```css
/* Default (no hover) */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Desktop: Hover enabled */
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(186, 83, 173, 0.15);
  }
}

/* Mobile: Active state only */
@media (hover: none) and (pointer: coarse) {
  .card:active {
    transform: scale(0.98);
  }
}

/* Focus (keyboard) */
.card:focus-visible {
  outline: 3px solid var(--evolea-magenta);
  outline-offset: 2px;
}
```

**Pattern B: Tailwind Utilities**
```html
<div class="
  transition-transform duration-300
  hover:md:-translate-y-2
  hover:md:shadow-elevated
  active:scale-98
  focus-visible:outline-magenta
">
  Card content
</div>
```

**Pattern C: JavaScript Detection (if needed)**
```javascript
// Detect if device supports hover
const hasHover = window.matchMedia('(hover: hover)').matches;

if (hasHover) {
  document.body.classList.add('has-hover');
} else {
  document.body.classList.add('no-hover');
}
```

```css
.has-hover .card:hover {
  transform: translateY(-8px);
}

.no-hover .card:active {
  transform: scale(0.98);
}
```

### Files to Modify
- `src/styles/global.css` (add media query patterns)
- `tailwind.config.mjs` (extend with hover variants if needed)
- Component files with hover effects:
  - Card components
  - Button components
  - Navigation components

---

## UC-4: GSAP Scroll Animations

**Priority**: MEDIUM
**Dependencies**: GSAP library installed
**Estimated Complexity**: High

### Description
Implement scroll-triggered animations for key sections and card grids using GSAP and ScrollTrigger plugin. Animations must respect `prefers-reduced-motion` and maintain 60fps performance.

### Preconditions
- GSAP installed: `npm install gsap`
- ScrollTrigger plugin available
- Animations skill reference: `.claude/skills/Design skills/animations.md`
- Target pages identified (homepage, program pages, blog)

### Steps to Test

#### Test 4.1: Library Installation
1. Check `package.json` for GSAP dependency
2. Verify version is 3.12+ (latest stable)

**Expected Result**:
```json
{
  "dependencies": {
    "gsap": "^3.12.5"
  }
}
```

#### Test 4.2: Section Fade-Up Animation (Desktop)
1. Navigate to homepage
2. Scroll slowly to "Unsere Programme" section
3. Observe section entrance animation

**Expected Result**:
- Section starts with `opacity: 0` and `translateY(60px)`
- As section enters viewport (80% mark), animation triggers
- Section fades in and slides up over 800ms
- Easing: `power3.out` (smooth deceleration)
- Animation plays ONCE (not on scroll up/down repeat)

#### Test 4.3: Staggered Card Animation (Desktop)
1. Navigate to homepage program cards section
2. Scroll to trigger cards entrance
3. Observe stagger effect

**Expected Result**:
- Cards appear sequentially, not all at once
- Stagger delay: 120ms between each card
- Each card animates with:
  - `opacity: 0 → 1`
  - `translateY(80px → 0)`
  - `scale(0.9 → 1)`
  - Optional: slight rotation variance (`rotate(-3deg to 3deg)`)
- Duration: 700ms per card
- Easing: `back.out(1.4)` (playful bounce)

#### Test 4.4: Reduced Motion Compliance
1. Open browser DevTools
2. Toggle "Emulate CSS media feature": `prefers-reduced-motion: reduce`
3. Navigate to homepage
4. Scroll through all sections

**Expected Result**:
- NO animations play
- All content appears instantly at `opacity: 1, y: 0`
- Sections are visible and readable immediately
- GSAP uses `gsap.set()` instead of `gsap.from()` for reduced motion users

#### Test 4.5: Mobile Animation Simplification
1. Set viewport to 375px (mobile)
2. Scroll through homepage
3. Observe animations (if enabled)

**Expected Result**:
- Animations are SIMPLER on mobile:
  - Reduced travel distance: `translateY(40px)` instead of `60px`
  - Faster duration: 500ms instead of 800ms
  - Simpler easing: `power2.out` instead of `back.out`
  - Shorter stagger: 80ms instead of 120ms
- OR animations disabled entirely on mobile for performance

#### Test 4.6: Performance (60fps Check)
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Scroll through homepage slowly
4. Stop recording and analyze

**Expected Result**:
- Frame rate stays at/near 60fps during scroll
- No long tasks (> 50ms) during animation
- GPU layers visible for animated elements (check Layers panel)
- Animations use ONLY `transform` and `opacity` (check paint flashing)

#### Test 4.7: ScrollTrigger Configuration
1. Inspect ScrollTrigger instances in console:
   ```javascript
   console.log(ScrollTrigger.getAll());
   ```
2. Verify trigger points are correct

**Expected Result**:
Example configuration:
```javascript
scrollTrigger: {
  trigger: '.reveal-section',
  start: 'top 80%',        // Start when top of element is 80% down viewport
  end: 'top 20%',          // Optional end point
  toggleActions: 'play none none none',  // Only play once
  markers: false,          // No debug markers in production
  once: true               // Animation plays once
}
```

#### Test 4.8: Hero Text Reveal (if applicable)
1. Load homepage (or program page)
2. Observe hero title entrance
3. Time the sequence

**Expected Result**:
- Title words appear one by one (stagger)
- Stagger: 80ms per word
- Effect: Words slide up and fade in
- Total sequence duration: ~1 second
- Delay before start: 200ms (after page load)

### Edge Cases

**EC-4.1**: Slow scrolling
- User scrolls very slowly through trigger points
- Animations should trigger smoothly, not jitter

**EC-4.2**: Fast scrolling / scrolling back up
- User scrolls quickly past multiple trigger points
- Animations may be skipped (OK) or play instantly
- Scrolling back up should NOT re-trigger animations (use `once: true`)

**EC-4.3**: Viewport resize during animation
- User resizes browser window mid-animation
- ScrollTrigger should refresh positions (`ScrollTrigger.refresh()`)

**EC-4.4**: Loading with anchor link
- User loads page with `#programm` anchor
- Scroll position jumps immediately
- Animations above fold should skip (already visible)

**EC-4.5**: Low-end device performance
- Test on older Android phone (< 2GB RAM)
- Animations may need to be disabled or simplified
- Detect via `navigator.hardwareConcurrency` or performance API

### Accessibility Requirements
- [ ] `prefers-reduced-motion: reduce` fully respected
- [ ] No essential content hidden behind animations
- [ ] Animations do not interfere with screen readers
- [ ] Focus order is logical regardless of animation state
- [ ] Keyboard navigation works during animations

### Implementation Checklist

**Setup**:
- [ ] GSAP installed via npm
- [ ] ScrollTrigger plugin imported and registered
- [ ] `prefers-reduced-motion` detection in place

**Animations to Implement**:
- [ ] Hero text reveal (homepage)
- [ ] Section fade-up (all major sections)
- [ ] Staggered cards (program cards, blog cards)
- [ ] Testimonials carousel (if applicable)
- [ ] Navbar scroll effect (optional)

**Performance**:
- [ ] Only animate `transform` and `opacity`
- [ ] Use `will-change` sparingly
- [ ] Mobile animations simpler/disabled
- [ ] ScrollTrigger uses `scrub` for smooth scroll-linked effects (if needed)

### Code Example (Reference)

```astro
---
// src/components/ProgramCards.astro
interface Props {
  cards: any[];
}
const { cards } = Astro.props;
---

<section class="program-cards-section" data-animate="stagger-cards">
  <div class="card-grid">
    {cards.map((card) => (
      <div class="program-card">
        <!-- Card content -->
      </div>
    ))}
  </div>
</section>

<script>
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    // Staggered card animation
    gsap.from('.program-card', {
      y: 80,
      opacity: 0,
      scale: 0.9,
      duration: 0.7,
      ease: 'back.out(1.4)',
      stagger: 0.12,
      scrollTrigger: {
        trigger: '.program-cards-section',
        start: 'top 75%',
        once: true
      }
    });
  } else {
    // Instant state for reduced motion
    gsap.set('.program-card', { opacity: 1, y: 0, scale: 1 });
  }
</script>

<style>
  /* Default state before animation */
  .program-card {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .program-card {
      opacity: 1;
    }
  }
</style>
```

### Files to Modify
- `package.json` (add GSAP dependency)
- `src/layouts/Base.astro` (global GSAP setup if needed)
- `src/pages/index.astro` (homepage animations)
- Component files for cards, sections
- `src/styles/global.css` (animation utilities)

---

## UC-5: Site-Wide Emoji Audit

**Priority**: HIGH
**Dependencies**: None
**Estimated Complexity**: Low

### Description
Audit all pages and components to ensure ZERO emojis are used anywhere on the site (Brand Requirement #1). All visual indicators must use the Icon.astro component with SVG icons.

### Preconditions
- Icon.astro component exists with full icon set
- Source code access to all `.astro`, `.md`, `.mdx`, `.json` files

### Steps to Test

#### Test 5.1: Grep Source Code
1. Open terminal in project root
2. Run emoji search command:
   ```bash
   grep -r "💜\|🎨\|🏛️\|✨\|❤️\|🌟\|🦋\|🌈\|📅\|📍\|✓\|✅" src/ --include="*.astro" --include="*.md" --include="*.mdx"
   ```
3. Review results

**Expected Result**:
- ZERO matches found in source files
- If matches found, note file paths and line numbers for replacement

#### Test 5.2: Grep CMS Content
1. Search content collections:
   ```bash
   grep -r "💜\|🎨\|🏛️\|✨\|❤️\|🌟\|🦋\|🌈\|📅\|📍\|✓\|✅" src/content/ --include="*.json" --include="*.md" --include="*.mdx"
   ```
2. Check Keystatic schema for emoji fields

**Expected Result**:
- ZERO emojis in blog posts, team bios, program descriptions
- CMS fields use plain text or Icon references

#### Test 5.3: Visual Inspection (Homepage)
1. Navigate to homepage at all breakpoints (375px, 768px, 1440px)
2. Scroll through entire page
3. Look for any emoji characters

**Expected Result**:
- Hero section: No emojis (✅ Icon.astro used)
- Program cards: No emojis (✅ Icon.astro used)
- Features section: No emojis (✅ Icon.astro used)
- Testimonials: No emojis (✅ plain text or Icon.astro)
- Footer: No emojis (✅ Icon.astro for social links)

#### Test 5.4: Visual Inspection (Program Pages)
1. Visit each program page:
   - `/angebote/mini-garten/`
   - `/angebote/mini-projekte/`
   - `/angebote/mini-turnen/`
   - `/angebote/mini-museum/` ⚠️ Known issue
   - `/angebote/mini-restaurant/` (if exists)
2. Check badges, icons, bullet points

**Expected Result**:
- All pages use `<Icon name="..." />` for visual indicators
- Badges (age, duration, location) use icons, not emojis
- Checklists use checkmark icon, not ✓ emoji

#### Test 5.5: Visual Inspection (Blog)
1. Visit `/blog/` listing page
2. Open 3-5 individual blog posts
3. Check post content and meta information

**Expected Result**:
- Category badges use icons, not emojis
- Tag indicators use icons or plain text
- Post content (MDX) contains no emojis
- If decorative elements needed, use illustrations or Icon.astro

#### Test 5.6: Screen Reader Test
1. Enable screen reader (NVDA/VoiceOver)
2. Navigate homepage
3. Listen for emoji announcements

**Expected Result**:
- Screen reader does NOT announce emoji names
  - ❌ BAD: "Purple heart emoji"
  - ✅ GOOD: "Heart icon" (if icon has accessible label)
- Decorative icons are `aria-hidden="true"`
- Meaningful icons have proper `aria-label` or surrounding text

#### Test 5.7: Mobile Menu Check
1. Open site on mobile (375px viewport)
2. Open hamburger menu (if applicable)
3. Check navigation items

**Expected Result**:
- Menu items use icons or plain text
- Donate button uses "Spenden" text, not 💰 emoji
- Close button uses × icon or "Schließen" text

### Edge Cases

**EC-5.1**: Emojis in user-generated content
- If testimonials or comments include emojis from users
- Strip emojis on import OR display as plain text fallback

**EC-5.2**: Third-party integrations
- Social media embeds may include emojis
- Blog RSS feeds from external sources
- Document that these are acceptable (outside control)

**EC-5.3**: Copy-paste accidents
- Developers may copy-paste content with emojis
- Pre-commit hook or linter to catch emojis before commit

### Replacement Guide

| Emoji | Icon Replacement | Usage |
|-------|------------------|-------|
| 💜 | `<Icon name="heart" />` | Favorites, love |
| 🎨 | `<Icon name="palette" />` | Art, creativity, Mini Projekte |
| 🏛️ | `<Icon name="museum" />` | Museum, Mini Museum |
| ✨ | `<Icon name="sparkle" />` | Magic, special features |
| ❤️ | `<Icon name="heart" />` | Love, support |
| 🌟 | `<Icon name="sparkle" />` | Stars, highlights |
| 🦋 | Butterfly SVG component | Brand element |
| 🌈 | `<Icon name="rainbow" />` | Spectrum, diversity |
| 📅 | `<Icon name="calendar" />` | Dates, schedule |
| 📍 | `<Icon name="location" />` | Location, address |
| ✓/✅ | `<Icon name="check" />` | Checkmarks, completed |

### Implementation Example

**Before** (Mini Museum, line 92):
```astro
<div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
  <span>💜</span>
  <span>Februar – April 2026</span>
</div>
```

**After**:
```astro
<div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
  <Icon name="palette" size="sm" gradient={false} />
  <span>Februar – April 2026</span>
</div>
```

### Accessibility Benefits
- [ ] Screen readers announce meaningful labels, not emoji names
- [ ] Icons scale properly with text zoom (emojis may not)
- [ ] Consistent brand appearance across all platforms
- [ ] Better print stylesheet support (emojis may not print)

### Files to Check
- `src/pages/**/*.astro`
- `src/components/**/*.astro`
- `src/content/**/*.md`
- `src/content/**/*.mdx`
- `src/content/**/*.json`
- `src/i18n/ui.ts` (translation strings)

---

## UC-6: Build & Regression Testing

**Priority**: CRITICAL
**Dependencies**: All other use cases complete
**Estimated Complexity**: Low

### Description
Comprehensive build verification and regression testing to ensure all changes integrate correctly without breaking existing functionality.

### Preconditions
- All UC-1 through UC-5 implementations complete
- Clean working tree (all changes committed)
- Node.js and npm installed

### Steps to Test

#### Test 6.1: Clean Build
1. Open terminal in project root
2. Clear any existing build:
   ```bash
   rm -rf dist/ .astro/
   ```
3. Run build command:
   ```bash
   npm run build
   ```
4. Observe output

**Expected Result**:
- Build completes without errors
- No TypeScript errors
- No unused variable warnings (or only minor warnings)
- Output: `dist/` directory created
- Build time: < 60 seconds (depending on site size)
- Console shows:
  ```
  ✓ Built in XXXms
  ✓ X pages generated
  ```

#### Test 6.2: TypeScript Type Checking
1. Run type check:
   ```bash
   npm run astro check
   ```
2. Review output

**Expected Result**:
- ZERO type errors
- Warnings (if any) are documented and acceptable
- All props interfaces correctly defined
- No `any` types used (or minimal, documented exceptions)

#### Test 6.3: Dev Server Start
1. Start development server:
   ```bash
   npm run dev
   ```
2. Wait for server to start
3. Open browser to `http://localhost:4321`

**Expected Result**:
- Server starts without errors
- Homepage loads in < 3 seconds
- No console errors in browser DevTools
- Hot Module Replacement (HMR) works (edit a file, page updates)

#### Test 6.4: Route Accessibility
1. With dev server running, visit each route:
   - `/` (homepage)
   - `/angebote/`
   - `/angebote/mini-garten/`
   - `/angebote/mini-projekte/`
   - `/angebote/mini-turnen/`
   - `/angebote/mini-museum/` ✨ Modified
   - `/blog/`
   - `/ueber-uns/`
   - `/kontakt/`
   - `/spenden/`
   - `/en/` (English homepage)
   - `/en/donate/`

**Expected Result**:
- All routes return 200 OK
- No 404 errors
- No redirect loops
- Content renders correctly
- i18n language switching works (DE ↔ EN)

#### Test 6.5: Lighthouse Audit (Mobile)
1. Open Chrome DevTools
2. Navigate to Lighthouse tab
3. Select:
   - Mode: Navigation
   - Device: Mobile
   - Categories: Accessibility, Performance, Best Practices
4. Run audit on homepage

**Expected Result**:
- **Accessibility**: ≥ 90 (target: 95+)
- **Performance**: ≥ 70 (target: 80+)
- **Best Practices**: ≥ 90
- No critical issues flagged
- No emojis detected in rendered HTML

#### Test 6.6: Lighthouse Audit (Desktop)
1. Repeat Lighthouse audit with Device: Desktop
2. Run on Mini Museum page specifically

**Expected Result**:
- **Accessibility**: ≥ 90
- Image has proper alt text
- Color contrast passes
- No missing ARIA labels

#### Test 6.7: Console Error Check
1. Open DevTools Console
2. Visit each major page
3. Filter for Errors (hide warnings)

**Expected Result**:
- ZERO console errors
- No 404s for images, fonts, scripts
- No CORS errors
- No deprecation warnings for critical APIs

#### Test 6.8: Network Performance
1. Open DevTools Network tab
2. Refresh homepage
3. Check waterfall and summary

**Expected Result**:
- Page load time: < 3 seconds (Fast 3G)
- Total size: < 2MB (uncompressed)
- Images lazy-loaded (not all loaded upfront)
- Fonts loaded efficiently (preload or font-display: swap)
- No blocking resources > 500KB

#### Test 6.9: Responsive Breakpoint Test
1. Open DevTools responsive mode
2. Test at each breakpoint:
   - 375px (Mobile)
   - 768px (Tablet)
   - 1024px (Laptop)
   - 1440px (Desktop)
   - 1920px (Large Desktop)
3. Navigate to Mini Museum page at each size

**Expected Result**:
- Layout adapts smoothly at each breakpoint
- No horizontal scrollbars
- Touch targets ≥ 44px on mobile
- Text remains readable (no overflow)
- Images scale proportionally
- Gradient backgrounds visible and not washed out

#### Test 6.10: i18n Language Switching
1. Start on German homepage (`/`)
2. Click language picker → Switch to English
3. Verify URL changes to `/en/`
4. Navigate to Programs page
5. Switch back to German

**Expected Result**:
- Language switcher visible in nav
- URL updates correctly (`/` ↔ `/en/`)
- Content switches to correct language
- Routes map correctly (e.g., `/spenden/` ↔ `/en/donate/`)
- No broken links after language switch

#### Test 6.11: Form Functionality
1. Navigate to contact page (`/kontakt/`)
2. Fill out form with test data
3. Submit form

**Expected Result**:
- Form submission works (Formspree endpoint configured)
- Validation errors display correctly
- Success message appears after submission
- No console errors during submission

#### Test 6.12: Production Build Preview
1. Build for production:
   ```bash
   npm run build
   ```
2. Preview production build:
   ```bash
   npm run preview
   ```
3. Test on preview server (usually `http://localhost:4321`)

**Expected Result**:
- Preview server starts successfully
- Site behaves identically to dev server
- All assets load correctly
- No differences between dev and production

### Regression Tests (Ensure Nothing Broke)

#### RT-1: Navigation Links
- [ ] All nav links work (desktop and mobile)
- [ ] Hamburger menu opens/closes (mobile)
- [ ] Dropdown menus work (if applicable)
- [ ] Donate button visible and links to `/spenden/`

#### RT-2: Footer
- [ ] Footer displays on all pages
- [ ] Social media links work
- [ ] FooterDonationCTA appears (except on `/spenden/`)
- [ ] Copyright year is current

#### RT-3: Images
- [ ] All images load (no broken images)
- [ ] Hero images display correctly
- [ ] Team photos load
- [ ] Blog featured images load
- [ ] Icon.astro renders SVGs correctly

#### RT-4: Animations (if UC-4 implemented)
- [ ] Animations play smoothly on desktop
- [ ] Reduced motion respected
- [ ] No layout shift during animation
- [ ] Performance remains acceptable

#### RT-5: Hover States (if UC-3 implemented)
- [ ] Desktop hover effects work
- [ ] Mobile doesn't have sticky hovers
- [ ] Focus states visible

#### RT-6: Accessibility
- [ ] Keyboard navigation works site-wide
- [ ] Focus indicators visible
- [ ] Skip links functional
- [ ] Screen reader announces pages correctly

### Edge Cases

**EC-6.1**: Build on different OS
- Test build on Windows, Mac, Linux
- Verify no path-separator issues (use `path.join()`, not manual concatenation)

**EC-6.2**: Node version compatibility
- Test with Node 18.x and 20.x
- Verify package.json has `"engines"` field

**EC-6.3**: First-time setup
- Fresh clone of repo
- Run `npm install` and `npm run build`
- Should work without manual intervention

**EC-6.4**: Large viewport (4K)
- Test at 3840px width
- Verify content doesn't look ridiculously spaced out
- Container max-widths prevent over-stretching

### Deployment Verification (Post-Deploy)

#### Deploy-1: GitHub Pages
1. After deploy, visit: `https://cgjen-box.github.io/evolea-website/`
2. Test:
   - Homepage loads
   - All routes accessible
   - Images load (check absolute vs. relative paths)

#### Deploy-2: Cloudflare Pages
1. After deploy, visit: `https://evolea-website.pages.dev/`
2. Test same as GitHub Pages
3. Verify Keystatic CMS works: `/keystatic`

#### Deploy-3: Production Domain (if applicable)
1. Visit production domain
2. Run full smoke test
3. Check analytics/monitoring for errors

### Success Criteria

All of the following must be true:
- [ ] `npm run build` completes without errors
- [ ] `npm run astro check` passes with 0 errors
- [ ] All routes return 200 OK
- [ ] Lighthouse Accessibility ≥ 90
- [ ] No console errors on any page
- [ ] All regression tests pass
- [ ] Mini Museum page fully functional (UC-1 complete)
- [ ] No emojis anywhere (UC-5 complete)
- [ ] Hover guards implemented (UC-3 complete)
- [ ] Scroll animations working (UC-4 complete, if implemented)
- [ ] Image pipeline documented (UC-2 complete)

### Files to Verify
- `package.json` (dependencies up to date)
- `astro.config.mjs` (build settings correct)
- `tsconfig.json` (strict mode enabled)
- `.gitignore` (build artifacts ignored)
- `dist/` directory (after build, all pages present)

---

## Testing Matrix Summary

| Use Case | Mobile (375px) | Tablet (768px) | Desktop (1440px) | Large (1920px) | Accessibility | Performance |
|----------|----------------|----------------|------------------|----------------|---------------|-------------|
| UC-1 Hero | ✓ Required | ✓ Required | ✓ Required | ○ Optional | ✓ Required | ✓ Required |
| UC-2 Images | ○ N/A | ○ N/A | ○ N/A | ○ N/A | ✓ Alt text | ✓ File size |
| UC-3 Hover | ✓ Touch test | ✓ Touch test | ✓ Mouse test | ○ Optional | ✓ Focus states | ○ N/A |
| UC-4 Animations | ✓ Simplified | ✓ Required | ✓ Full | ○ Optional | ✓ Reduced motion | ✓ 60fps |
| UC-5 Emoji | ✓ Visual check | ✓ Visual check | ✓ Visual check | ○ Optional | ✓ Screen reader | ○ N/A |
| UC-6 Build | ✓ Lighthouse | ○ Optional | ✓ Lighthouse | ○ Optional | ✓ Audit | ✓ Load time |

**Legend**:
- ✓ Required: Must be tested
- ○ Optional: Should test if time permits
- ○ N/A: Not applicable

---

## Appendix: Testing Tools

### Required Tools
- **Browser**: Chrome/Edge (latest)
- **DevTools**: Chrome DevTools
- **Screen Reader**: NVDA (Windows) or VoiceOver (Mac)
- **Lighthouse**: Built into Chrome DevTools
- **Terminal**: bash/zsh/PowerShell

### Optional Tools
- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: WebAIM accessibility evaluation tool
- **Responsively**: Desktop app for multi-device testing
- **BrowserStack**: Cloud device testing (if available)

### Test Devices (Ideal)
- **Mobile**: iPhone 13/14 OR Android (Samsung Galaxy)
- **Tablet**: iPad OR Android tablet
- **Desktop**: Windows 10/11 OR macOS
- **Monitor**: 1920x1080 or higher

### Commands Quick Reference

```bash
# Development
npm run dev                  # Start dev server
npm run build                # Build for production
npm run preview              # Preview production build
npm run astro check          # TypeScript type checking

# Testing
grep -r "emoji" src/         # Search for emojis
npm run astro info           # Show Astro environment info

# Deployment
# (Trigger Cloudflare deploy hook)
curl -X POST "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/3e0b6230-6965-46cf-a7a2-176969101e48"
```

---

## Sign-Off Checklist

Before marking project complete:

- [ ] All 6 use cases implemented and tested
- [ ] All "Expected Results" achieved
- [ ] All "Accessibility Requirements" met
- [ ] All "Edge Cases" documented or handled
- [ ] Build passes without errors
- [ ] Lighthouse Accessibility ≥ 90
- [ ] No emojis in codebase (grep verification)
- [ ] Documentation updated (if applicable)
- [ ] Changes committed to git with clear messages
- [ ] Deployed to staging and verified
- [ ] Client/stakeholder approval received (if applicable)

---

**Document Version**: 1.0
**Last Updated**: December 25, 2024
**Maintained By**: EVOLEA Development Team
**Questions?**: Refer to `.claude/skills/` or CLAUDE.md for guidance
