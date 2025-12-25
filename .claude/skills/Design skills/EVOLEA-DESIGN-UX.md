# EVOLEA Design & UX Lead Skill

> **Orchestrator skill for creating breathtaking, accessible experiences**

This is the master skill for implementing design and UX on the EVOLEA website. It coordinates specialist skills for animations, responsive design, program pages, AI illustrations, and accessibility.

---

## Quick Reference: When to Use Which Specialist

| Task | Specialist Skill |
|------|------------------|
| Adding scroll animations, hover effects, page transitions | `animations.md` |
| Breakpoints, fluid typography, mobile optimization | `responsive.md` |
| Building/harmonizing Angebote pages (Mini Projekte, Turnen, etc.) | `angebote-structure.md` |
| Generating images with Gemini/ChatGPT | `illustrations.md` |
| WCAG compliance, neurodivergent-friendly patterns | `accessibility.md` |

---

## CRITICAL: The 10 Brand Commandments

Before ANY design work, verify compliance with these non-negotiables:

| # | Rule | Violation Example |
|---|------|-------------------|
| 1 | **NEVER use emojis** | ❌ "💜 Februar 2026" → ✅ Use SVG icon |
| 2 | **NEVER use transparent mobile menus** | Menu must have solid white or gradient background |
| 3 | **NEVER use text without shadows on gradients** | Add `text-shadow` for readability |
| 4 | **NEVER use AI images for real content** | Team photos, hero videos must be real |
| 5 | **NEVER let butterfly cover the "A"** | Proper spacing on logo |
| 6 | **NEVER use flat/muted colors** | Use bold spectrum palette |
| 7 | **ALWAYS have a prism gradient hero** | Every page needs gradient hero |
| 8 | **ALWAYS have a page closer before footer** | "Helfen Sie Kindern" CTA |
| 9 | **ALWAYS use Fredoka for headlines** | Never substitute fonts |
| 10 | **ALWAYS test on mobile** | Before any deployment |

---

## Design System Quick Reference

### Color Palette

```css
/* Primary - The Magentas */
--evolea-magenta: #DD48E0;      /* CTAs, highlights */
--evolea-magenta-light: #EF5EDB; /* Hover states */
--evolea-magenta-vivid: #E97BF1; /* Gradients */

/* Spectrum Colors */
--evolea-mint: #7BEDD5;          /* Fresh, success */
--evolea-yellow: #FFE066;        /* Joy, warmth */
--evolea-coral: #FF7E5D;         /* Energy */
--evolea-lavender: #CD87F8;      /* Calm energy */
--evolea-purple: #BA53AD;        /* Deep accents */
--evolea-sky: #5DADE2;           /* Trust, calm */
--evolea-gold: #E8B86D;          /* Donate button */

/* Neutrals */
--evolea-cream: #FFFBF7;         /* Page background */
--evolea-text: #2D2A32;          /* Body text */
--evolea-text-light: #5C5762;    /* Secondary text */
```

### Typography

```css
/* Headlines - Fredoka */
font-family: 'Fredoka', sans-serif;

/* Body - Poppins */
font-family: 'Poppins', sans-serif;

/* Fluid Scale */
--text-display: clamp(2.25rem, 3.5vw + 0.875rem, 4rem);  /* H1 */
--text-h2: clamp(1.75rem, 2.5vw + 0.8rem, 3rem);
--text-h3: clamp(1.375rem, 1.25vw + 0.9rem, 2rem);
--text-body: clamp(1rem, 0.33vw + 0.875rem, 1.125rem);
```

### Gradients

```css
/* Signature - Hero sections */
--gradient-prism: linear-gradient(118deg, #7BEDD5 0%, #FFE066 21%, #FFFFFF 48%, #E97BF1 81%, #CD87F8 100%);

/* Bold - Page closers */
--gradient-prism-bold: linear-gradient(135deg, #4ECDC4 0%, #FFE066 18%, #FF9ECC 36%, #E97BF1 54%, #CD87F8 72%, #9B3D9B 100%);

/* Buttons */
--gradient-magenta: linear-gradient(135deg, #9B3D9B 0%, #C44FE0 50%, #E97BF1 100%);
```

---

## Known Issues & Fixes

### 1. Spenden Button Visibility ⚠️

**Problem**: Gold button with white text fails contrast.

**Fix**: Use dark text on gold backgrounds:

```html
<button class="
  bg-gradient-to-r from-amber-400 to-amber-500
  text-amber-950 font-bold
  px-6 py-3 rounded-full
  shadow-lg hover:shadow-xl
  motion-safe:transition-all
">
  Spenden
</button>
```

### 2. Mini Museum Header Inconsistency ⚠️

**Problems identified**:
1. Uses emoji 💜 (violates brand)
2. Missing hero image (visual imbalance)
3. Different structure from Mini Projekte

**Fix**: Follow `angebote-structure.md` for consistent program page layout.

### 3. Mobile Menu Transparency ⚠️

**Problem**: Some mobile menus show transparent backgrounds.

**Fix**: Always use solid background:
```css
.mobile-menu {
  background: white;
  /* Or gradient background */
  background: var(--gradient-prism);
}
```

---

## Page Structure Template

Every EVOLEA page should follow this structure:

```
┌─────────────────────────────────────┐
│  NAVBAR (sticky, solid on scroll)   │
├─────────────────────────────────────┤
│  HERO (prism gradient, animations)  │
│  ├── Breadcrumb (if not homepage)   │
│  ├── Tagline (small, muted)         │
│  ├── Title (H1, Fredoka)            │
│  ├── Subtitle (description)         │
│  ├── CTA button(s)                  │
│  └── Hero image/visual (if any)     │
├─────────────────────────────────────┤
│  CONTENT SECTIONS                   │
│  ├── Section 1 (reveal animation)   │
│  ├── Section 2 (staggered cards)    │
│  └── Section N                      │
├─────────────────────────────────────┤
│  PAGE CLOSER (gradient CTA)         │
│  "Helfen Sie Kindern im Spektrum"   │
├─────────────────────────────────────┤
│  FOOTER                             │
└─────────────────────────────────────┘
```

---

## Animation Philosophy

EVOLEA animations should feel:
- **Delightful** – playful bounce, not corporate stiffness
- **Safe** – predictable, never startling
- **Smooth** – 60fps, GPU-accelerated (transform/opacity only)
- **Respectful** – honor `prefers-reduced-motion`

**Timing Sweet Spots**:
- Micro-interactions: 150-300ms
- Reveals: 600-1000ms
- Page transitions: 400-600ms
- Stagger between elements: 80-150ms

**Easing Curves**:
```javascript
// Playful bounce (cards, icons)
ease: 'back.out(1.4)'

// Smooth deceleration (text, sections)
ease: 'power3.out'

// Snappy response (buttons, hovers)
ease: 'power2.out'
```

---

## Pre-Implementation Checklist

Before implementing any design change:

- [ ] Reviewed relevant specialist skill(s)
- [ ] Verified against 10 Brand Commandments
- [ ] Checked for emoji usage (must be zero)
- [ ] Tested on mobile viewport
- [ ] Verified touch targets ≥ 44px
- [ ] Added `prefers-reduced-motion` handling
- [ ] Checked text contrast ratios (≥ 4.5:1)
- [ ] Hero section has gradient background
- [ ] Page closer CTA present before footer

---

## Deployment Checklist

After implementation:

- [ ] Desktop screenshot captured
- [ ] Mobile screenshot captured
- [ ] No console errors
- [ ] Lighthouse accessibility ≥ 90
- [ ] Animation performance verified (60fps)
- [ ] Both DE and EN routes work
- [ ] Triggered Cloudflare deploy webhook

---

## Related Skills

| Skill | Path | Purpose |
|-------|------|---------|
| Animations | `.claude/skills/Design skills/animations.md` | GSAP patterns, scroll triggers |
| Responsive | `.claude/skills/Design skills/responsive.md` | Breakpoints, fluid design |
| Angebote | `.claude/skills/Design skills/angebote-structure.md` | Program page consistency |
| Illustrations | `.claude/skills/Design skills/illustrations.md` | AI image prompts |
| Accessibility | `.claude/skills/Design skills/accessibility.md` | WCAG, neurodivergent UX |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01 | Initial skill creation |
