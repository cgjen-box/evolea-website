# EVOLEA Brand Guide v3.0
## The Definitive Guide

*"A spectrum of possibilities. Bold, vibrant, full of transformation."*

---

# Part 1: THE SOUL

## Who We Are

EVOLEA creates spaces where children on the spectrum flourish. We're not a clinical service. We're not a charity. We're a movement that sees the brilliance in every child.

## Our Visual Promise

Our brand should feel like:
- **Light through a prism** — not flat, not dull, alive with color
- **Sophisticated energy** — bold but not childish
- **Transformation** — the butterfly emerges in full color
- **Warmth** — approachable, never clinical

## The One Rule

**If it looks like a generic website template, start over.**

---

# Part 2: LOGO

## The Logo System

The EVOLEA logo has two parts:
1. **Wordmark** — "EVOLEA" in gradient or solid color
2. **Butterfly** — Our symbol of transformation

### Logo Versions

| Version | Use Case | Background |
|---------|----------|------------|
| Gradient wordmark + spectrum butterfly | Primary, default | Light backgrounds |
| Rainbow gradient wordmark + gradient butterfly | Hero moments | Dark backgrounds |
| White wordmark + white butterfly | On prism gradient | Gradient backgrounds |
| Purple wordmark + purple butterfly | Simplified | Any light background |

### Logo on Prism Gradient (THE FIX)

**The Problem:** White logo disappears on light parts of prism gradient.

**The Solution:**
```css
/* Logo on prism gradient - add shadow and subtle outline */
.logo-on-prism {
  filter: drop-shadow(0 2px 8px rgba(93, 46, 140, 0.4));
}

.logo-on-prism .logo-text {
  color: #FFFFFF;
  text-shadow: 
    0 0 20px rgba(93, 46, 140, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.1);
  -webkit-text-stroke: 0.5px rgba(186, 83, 173, 0.3);
}
```

**Alternative:** Use the rainbow gradient wordmark (like on dark background) which has enough internal contrast to work on any background.

### Logo on Dark Background

```css
.logo-on-dark .logo-text {
  background: linear-gradient(
    90deg,
    #7BEDD5 0%,      /* Mint */
    #FFE066 20%,     /* Gold */
    #FF9ECC 40%,     /* Pink */
    #E97BF1 60%,     /* Magenta */
    #CD87F8 80%,     /* Lavender */
    #B56FE8 100%     /* Purple */
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Logo Spacing

- Minimum clear space: Height of the "E" on all sides
- Butterfly spacing from text: 8px (0.5rem)
- Never let butterfly overlap or cover any letter

### Logo Don'ts

- ❌ Never use the butterfly emoji 🦋
- ❌ Never let butterfly cover the "A"
- ❌ Never stretch or distort
- ❌ Never use on busy photo backgrounds without container
- ❌ Never use low contrast combinations

---

# Part 3: COLOR

## The Spectrum Palette

### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Magenta | #DD48E0 | 221, 72, 224 | Primary CTAs, highlights |
| Deep Purple | #BA53AD | 186, 83, 173 | Headlines, accents |
| Lavender | #CD87F8 | 205, 135, 248 | Secondary accents |

### Spectrum Colors
| Name | Hex | Usage |
|------|-----|-------|
| Mint | #7BEDD5 | Fresh accents, success states |
| Sunshine | #FFE066 | Joy, warmth, highlights |
| Coral | #FF7E5D | Energy, warm accents |
| Sky Blue | #5DADE2 | Trust, calm |
| Blush | #EF8EAE | Soft pink accents |

### Neutrals
| Name | Hex | Usage |
|------|-----|-------|
| Cream | #FFFBF7 | Page backgrounds |
| Dark Text | #2D2A32 | Body text |
| Light Text | #5C5762 | Secondary text |
| Pure White | #FFFFFF | Cards, overlays |
| Charcoal | #1A1A2E | Dark mode, vision statements |

## Dark Mode / Vision Statements

**Use the dark background for powerful moments:**

```css
.vision-section {
  background: linear-gradient(180deg, #1A1A2E 0%, #2D2A32 100%);
  color: #FFFFFF;
}

/* Rainbow logo on dark */
.vision-section .logo {
  background: linear-gradient(90deg, #7BEDD5, #FFE066, #FF9ECC, #E97BF1, #CD87F8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Use dark sections for:**
- Mission/vision statements
- Key quotes
- Dramatic emphasis
- Footer pre-sections

---

# Part 4: GRADIENTS

## The Prism Gradient (Signature)

```css
--gradient-prism: linear-gradient(
  135deg,
  #7BEDD5 0%,
  #A8F0E0 10%,
  #FFE066 25%,
  #FFEEBB 35%,
  #FFD5E5 45%,
  #F5B8D0 55%,
  #E97BF1 70%,
  #CD87F8 85%,
  #B56FE8 100%
);
```

**Note:** Avoid large white sections in the gradient — they reduce contrast for overlaid text.

## Other Gradients

| Name | CSS | Usage |
|------|-----|-------|
| Magenta Burst | `linear-gradient(135deg, #BA53AD 0%, #DD48E0 50%, #E97BF1 100%)` | Buttons, CTAs |
| Ocean Dream | `linear-gradient(135deg, #7BEDD5 0%, #5DADE2 50%, #CD87F8 100%)` | Cool sections |
| Spectrum Line | `linear-gradient(90deg, #7BEDD5, #FFE066, #FF7E5D, #EF8EAE, #E97BF1, #CD87F8)` | Decorative lines |

---

# Part 5: TYPOGRAPHY

## Fonts

| Font | Weight | Usage |
|------|--------|-------|
| Fredoka | Bold (700) | Headlines, display |
| Fredoka | SemiBold (600) | Subheadings, buttons |
| Poppins | Regular (400) | Body text |
| Poppins | Medium (500) | UI elements |
| Poppins | SemiBold (600) | Emphasis |

## Type Scale

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| Display XL | 5rem (80px) | 1.1 | Hero headlines |
| Display LG | 3.75rem (60px) | 1.15 | Section headlines |
| Display MD | 3rem (48px) | 1.2 | Sub-headlines |
| Heading | 2.25rem (36px) | 1.25 | Card titles |
| Body LG | 1.125rem (18px) | 1.6 | Lead paragraphs |
| Body | 1rem (16px) | 1.7 | Body text |
| Small | 0.875rem (14px) | 1.5 | Captions, meta |

## Text on Gradients

**Always add text shadow for readability:**

```css
.text-on-gradient {
  color: #FFFFFF;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 20px rgba(138, 61, 158, 0.3),
    0 0 60px rgba(186, 83, 173, 0.2);
}
```

---

# Part 6: IMAGERY

## The Imagery Hierarchy

### Tier 1: Real Photography (Primary)

**USE FOR:**
- Hero sections
- Team photos
- Program pages
- Blog featured images
- Any "real" content

**STYLE GUIDELINES:**
- Warm, natural lighting
- Candid moments, not posed
- Children engaged in activities (never looking at camera unless portrait)
- Soft focus backgrounds
- No harsh shadows

**SOURCES:**
- Original photography (preferred)
- High-quality stock (Unsplash: annie-spratt, kristin-brown, vanessa-bucceri)

**TREATMENT:**
```css
/* Photo treatment for consistency */
.photo {
  filter: saturate(1.05) brightness(1.02);
  border-radius: 24px;
}

/* Photo with gradient overlay */
.photo-overlay {
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(186, 83, 173, 0.4) 100%
  );
}
```

### Tier 2: Illustrations (Secondary)

**USE FOR:**
- Icons and UI elements
- Decorative accents
- Concept explanations
- 404 pages, empty states

**STYLE GUIDELINES:**
- Use brand gradient colors
- Simple, geometric shapes
- Soft, rounded corners
- NO detailed realistic illustrations
- NO clip art style

**THE BUTTERFLY:**
Our primary illustration. Use the official SVG only.

### Tier 3: AI-Generated Images (Limited Use)

**USE FOR:**
- Blog post illustrations (when no photo available)
- Social media graphics
- Internal presentations

**NEVER USE FOR:**
- Team photos
- Hero sections
- Any "real" representation of children or services

**IF USING AI:**
- Must match brand color palette
- Must be clearly illustrative, not trying to look real
- Review for quality and appropriateness
- Disclose if required

## Blog Post Images

**Every blog post MUST have:**
1. Featured image (hero) — Real photo or high-quality illustration
2. At least one in-content image per 500 words
3. Images must be minimum 1200px wide

**Blog Image Hierarchy:**
1. Original photography
2. Stock photography (see approved sources)
3. Brand illustrations
4. AI-generated (last resort, illustrative only)

**Approved Stock Sources:**
- Unsplash (free, high quality)
- Pexels (free, good variety)

**Search Terms:**
- "children learning" (NOT "autism")
- "kids playing colorful"
- "child creativity"
- "kindergarten activities"
- "family connection"

## Image Don'ts

- ❌ No images showing children's faces clearly without consent
- ❌ No clinical/medical imagery
- ❌ No stock photos with watermarks
- ❌ No low-resolution images
- ❌ No images that reinforce stereotypes
- ❌ No AI-generated images pretending to be real photos

---

# Part 7: NAVIGATION

## Desktop Navigation

### Structure
```
[LOGO]                [Angebote] [Über uns] [Team] [Blog] [Kontakt]  [ENGLISH]  [CTA Button]
```

### Styling

```css
.nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(186, 83, 173, 0.1);
  padding: 1rem 2rem;
}

.nav-link {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--evolea-text);
  padding: 0.5rem 1rem;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--evolea-magenta);
}

/* Active indicator */
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--gradient-spectrum);
  border-radius: 2px;
}

.nav-cta {
  background: var(--gradient-magenta);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 100px;
  font-weight: 600;
}
```

### Language Switcher

```css
.language-switch {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--evolea-magenta);
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--evolea-magenta);
}
```

## Mobile Navigation (CRITICAL FIX)

### The Problem
Mobile menu is transparent — page content shows through.

### The Solution

```css
/* MOBILE MENU - MUST BE OPAQUE */
.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 99999;
  
  /* SOLID BACKGROUND - NON-NEGOTIABLE */
  background: #FFFFFF;
  
  /* Or brand gradient */
  /* background: linear-gradient(180deg, #FFFFFF 0%, #FBF7FC 50%, #F5EBF7 100%); */
  
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  /* Animation */
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu.open {
  transform: translateX(0);
}

/* Lock body scroll */
body.menu-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
}
```

### Mobile Menu Layout

```html
<div class="mobile-menu">
  <!-- Close button -->
  <button class="mobile-menu-close">✕</button>
  
  <!-- Logo -->
  <a href="/" class="logo">EVOLEA 🦋</a>
  
  <!-- Navigation -->
  <nav class="mobile-nav-links">
    <a href="/angebote/">Angebote</a>
    <a href="/ueber-uns/">Über uns</a>
    <a href="/team/">Team</a>
    <a href="/blog/">Blog</a>
    <a href="/kontakt/">Kontakt</a>
  </nav>
  
  <!-- Language -->
  <div class="language-switch">
    <span>Sprache</span>
    <a href="/de/" class="active">DE</a>
    <a href="/en/">EN</a>
  </div>
  
  <!-- CTA -->
  <a href="/kontakt/" class="mobile-cta">
    Jetzt Kontakt aufnehmen →
  </a>
</div>
```

### Mobile Menu Styling

```css
.mobile-menu-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 48px;
  height: 48px;
  background: rgba(186, 83, 173, 0.1);
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  color: var(--evolea-purple);
}

.mobile-nav-links {
  padding: 5rem 2rem 2rem;
}

.mobile-nav-links a {
  display: block;
  padding: 1rem 0;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--evolea-text);
  border-bottom: 1px solid rgba(186, 83, 173, 0.1);
}

.mobile-nav-links a.active {
  color: var(--evolea-magenta);
}

.mobile-cta {
  display: block;
  margin: 2rem;
  padding: 1.25rem 2rem;
  background: var(--gradient-magenta);
  color: white;
  text-align: center;
  border-radius: 100px;
  font-weight: 600;
}
```

---

# Part 8: COMPONENTS

## Buttons

| Type | Background | Text | Usage |
|------|------------|------|-------|
| Primary | Magenta gradient | White | Main CTAs |
| Secondary | White | Magenta | Secondary actions |
| Outline | Transparent | Magenta | Tertiary actions |
| Ghost | Transparent | Current color | Text links |

```css
.btn-primary {
  background: var(--gradient-magenta);
  color: white;
  padding: 1rem 2rem;
  border-radius: 100px;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(186, 83, 173, 0.3);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(186, 83, 173, 0.4);
}
```

## Cards

```css
.card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(186, 83, 173, 0.08);
  transition: all 0.4s ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(186, 83, 173, 0.15);
}

/* Spectrum accent on hover */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-spectrum);
  border-radius: 24px 24px 0 0;
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.card:hover::before {
  transform: scaleX(1);
}
```

## Icons

**Use custom SVG icons only — NO emojis anywhere on the site.**

```svg
<!-- Example: Sprout icon for Mini Garten -->
<svg viewBox="0 0 40 40" fill="none">
  <path d="M20 35V20" stroke="currentColor" stroke-width="3"/>
  <path d="M20 20C20 14 14 10 8 12C10 18 16 20 20 20Z" fill="currentColor"/>
  <path d="M20 20C20 14 26 10 32 12C30 18 24 20 20 20Z" fill="currentColor" opacity="0.7"/>
</svg>
```

---

# Part 9: PAGE TEMPLATES

## Every Page Must Have

1. **Prism gradient hero** (or dark hero for vision pages)
2. **Floating orbs** (4 blurred gradient circles)
3. **Floating butterflies** (2-3, subtle)
4. **Wave transition** to content
5. **Page closer** (prism gradient before footer)
6. **Consistent footer**

## Hero Section Template

```css
.page-hero {
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 8rem 0 6rem;
}

.prism-bg {
  position: absolute;
  inset: 0;
  background: var(--gradient-prism);
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
}
```

## Dark Vision Section

```css
.vision-section {
  background: linear-gradient(180deg, #1A1A2E 0%, #2D2A32 100%);
  padding: 6rem 0;
  text-align: center;
}

.vision-section h2 {
  font-family: 'Fredoka', sans-serif;
  font-size: 3rem;
  background: linear-gradient(90deg, #7BEDD5, #FFE066, #FF9ECC, #E97BF1, #CD87F8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
}

.vision-section p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto;
}
```

---

# Part 10: COMPARISONS & FIXES

## What evolea.ch Does Better

| Element | evolea.ch | GitHub Pages | Fix |
|---------|-----------|--------------|-----|
| Real photos | Uses authentic stock photos | Some AI images | Use only real photos for programs |
| Hero video | Has video background | Static image | Add video support |
| Team photos | Consistent circle crops | Inconsistent | Standardize to circles |
| Blog images | Each post has imagery | Some posts lack images | Require featured images |
| Mobile nav | Clean and usable | Transparent/broken | Fix with solid background |
| Programs | Clear visual cards | Good but improve hover | Add image zoom on hover |

## Brand Page Specific Fixes

### Fix 1: Logo on Prism Gradient
Currently invisible/low contrast.

**Solution:** Add text shadow and use rainbow gradient version:
```css
.brand-logo-prism .logo-text {
  color: #FFFFFF;
  text-shadow: 
    0 0 20px rgba(93, 46, 140, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.15);
}
```

### Fix 2: Logo on Dark Background Demo
Currently just shows text, not actual styled logo.

**Solution:** Render actual gradient text:
```css
.brand-logo-dark .logo-text {
  background: linear-gradient(90deg, #7BEDD5, #FFE066, #FF9ECC, #E97BF1, #CD87F8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Fix 3: Emojis in Brand Guide
Still using 🌈 🦋 ⚡ ✨ in the brand guide itself.

**Solution:** Replace all emojis with SVG icons.

### Fix 4: Interactive Examples
Brand guide should have copyable code AND live examples.

---

# Part 11: QUICK REFERENCE

## The 10 Commandments

1. **Never use emojis** — SVG icons only
2. **Never use transparent mobile menus** — Solid backgrounds always
3. **Never use text without shadows on gradients** — Add depth
4. **Never use AI images for real content** — Real photos only
5. **Never let the butterfly cover the "A"** — Proper spacing
6. **Never use flat, muted colors** — Bold and vibrant
7. **Always have a hero gradient** — Every page
8. **Always have a page closer** — Before every footer
9. **Always use Fredoka for headlines** — Brand consistency
10. **Always test on mobile** — Before deploying

## CSS Variables (Copy-Paste)

```css
:root {
  /* Colors */
  --evolea-magenta: #DD48E0;
  --evolea-purple: #BA53AD;
  --evolea-lavender: #CD87F8;
  --evolea-mint: #7BEDD5;
  --evolea-yellow: #FFE066;
  --evolea-coral: #FF7E5D;
  --evolea-cream: #FFFBF7;
  --evolea-text: #2D2A32;
  --evolea-text-light: #5C5762;
  --evolea-dark: #1A1A2E;
  
  /* Gradients */
  --gradient-prism: linear-gradient(135deg, #7BEDD5 0%, #FFE066 25%, #FFD5E5 45%, #E97BF1 70%, #CD87F8 100%);
  --gradient-magenta: linear-gradient(135deg, #BA53AD 0%, #DD48E0 50%, #E97BF1 100%);
  --gradient-spectrum: linear-gradient(90deg, #7BEDD5, #FFE066, #FF7E5D, #EF8EAE, #E97BF1, #CD87F8);
  --gradient-rainbow-text: linear-gradient(90deg, #7BEDD5, #FFE066, #FF9ECC, #E97BF1, #CD87F8);
  
  /* Shadows */
  --shadow-soft: 0 4px 20px rgba(186, 83, 173, 0.15);
  --shadow-card: 0 8px 30px rgba(186, 83, 173, 0.2);
  --shadow-glow: 0 0 60px rgba(221, 72, 224, 0.5);
  --shadow-text: 0 2px 4px rgba(0,0,0,0.1), 0 4px 20px rgba(138,61,158,0.3);
}
```

---

# Part 12: CHECKLIST

## Before Launching Any Page

### Content
- [ ] Real photos (not AI) for all real content
- [ ] Featured image for blog posts
- [ ] All text is readable (contrast check)
- [ ] No placeholder content
- [ ] No broken links

### Branding
- [ ] Logo is visible on all backgrounds
- [ ] No emojis used anywhere
- [ ] Colors match brand palette
- [ ] Typography uses Fredoka/Poppins
- [ ] Butterfly used correctly (not emoji)

### Layout
- [ ] Has prism gradient hero
- [ ] Has floating orbs
- [ ] Has wave transition
- [ ] Has page closer
- [ ] Proper spacing throughout

### Mobile
- [ ] Menu has solid background
- [ ] Touch targets are 44px+
- [ ] Text is readable
- [ ] Images scale properly
- [ ] No horizontal scroll

### Accessibility
- [ ] Text contrast minimum 4.5:1
- [ ] Alt text on all images
- [ ] Focus states visible
- [ ] Keyboard navigable

---

*EVOLEA Brand Guide v3.0*  
*Last updated: December 2024*  
*"Where children on the spectrum flourish"*
