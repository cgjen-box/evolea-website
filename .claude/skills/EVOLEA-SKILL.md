# EVOLEA Design System Skill

## CRITICAL RULES - READ FIRST

### ❌ NEVER DO THIS
1. **NEVER use emojis as icons** - No 🌱 ⚽ 🎨 🏫 📊 etc. Use SVG icons ONLY
2. **NEVER use the butterfly emoji 🦋** - Use the official SVG butterfly (code below)
3. **NEVER place elements that obscure the logo** - The "A" in EVOLEA must always be visible
4. **NEVER use flat/muted colors** - EVOLEA is bold and vibrant
5. **NEVER create white-on-white or invisible elements** - Always verify contrast
6. **NEVER use basic primary colors** (red, blue, yellow) - Use the spectrum palette

### ✅ ALWAYS DO THIS
1. **Always use CSS variables** for colors: `var(--evolea-magenta)`, `var(--gradient-prism)`
2. **Always verify button visibility** - Text must contrast with background
3. **Always use the official butterfly SVG** for decorative elements
4. **Always check both light and dark contexts** for elements

---

## Brand Philosophy

EVOLEA celebrates the **spectrum** - sophisticated, vibrant, energetic colors. NOT a children's book aesthetic. Think: bold gradients, light through a prism, transformation.

---

## Color Palette

### Primary - The Magentas
```css
--evolea-magenta: #DD48E0;        /* Primary accent, CTAs */
--evolea-magenta-light: #EF5EDB;  /* Hover states */
--evolea-magenta-vivid: #E97BF1;  /* Gradients, glows */
```

### Spectrum Colors
```css
--evolea-mint: #7BEDD5;           /* Fresh accents, success */
--evolea-yellow: #FFE066;         /* Joy, warmth */
--evolea-coral: #FF7E5D;          /* Energy, warm highlights */
--evolea-coral-soft: #C96861;     /* Muted earthy warmth */
--evolea-gold: #DCD49F;           /* Luxury accents */
--evolea-lavender: #CD87F8;       /* Calm energy */
--evolea-purple: #BA53AD;         /* Deep accents */
--evolea-sky: #5DADE2;            /* Trust, clarity */
```

### Neutrals
```css
--evolea-white: #FFFFFF;
--evolea-pink-soft: #FFDEDE;
--evolea-blush: #EF8EAE;
--evolea-cream: #FFFBF7;
--evolea-text: #2D2A32;           /* Primary text */
--evolea-text-light: #5C5762;     /* Secondary text */
```

---

## Gradients

### Signature Gradients
```css
/* THE signature gradient - use for hero sections, CTAs */
--gradient-prism: linear-gradient(118deg, #7BEDD5 0%, #FFE066 21%, #FFFFFF 48%, #E97BF1 81%, #CD87F8 100%);

/* More saturated - for buttons, smaller elements */
--gradient-prism-vivid: linear-gradient(118deg, #7BEDD5 0%, #FFE066 15%, #FFDEDE 35%, #E97BF1 65%, #CD87F8 85%, #DD48E0 100%);

/* Full spectrum loop - animated backgrounds, decorative lines */
--gradient-spectrum: linear-gradient(90deg, #7BEDD5 0%, #FFE066 16%, #FF7E5D 32%, #EF8EAE 48%, #E97BF1 64%, #CD87F8 80%, #7BEDD5 100%);

/* Bold magenta - primary buttons, strong CTAs */
--gradient-magenta: linear-gradient(135deg, #BA53AD 0%, #DD48E0 50%, #E97BF1 100%);

/* Cool, calming - mint to sky to lavender */
--gradient-ocean: linear-gradient(135deg, #7BEDD5 0%, #5DADE2 50%, #CD87F8 100%);

/* Warm, energetic - yellow to coral to magenta */
--gradient-sunset: linear-gradient(135deg, #FFE066 0%, #FF7E5D 50%, #E97BF1 100%);
```

---

## Typography

### Fonts
```css
/* Headlines, buttons, accent text */
font-family: 'Fredoka', sans-serif;

/* Body text, UI elements */
font-family: 'Poppins', sans-serif;
```

### Type Scale
| Name | Size | Usage |
|------|------|-------|
| Display XL | 5rem (80px) | Hero headlines |
| Display LG | 3.75rem (60px) | Section headlines |
| Display MD | 3rem (48px) | Sub-headlines |
| Heading | 2.25rem (36px) | Card titles |
| Body LG | 1.125rem (18px) | Lead paragraphs |
| Body | 1rem (16px) | Body text |

---

## Official Butterfly SVG

**USE THIS INSTEAD OF 🦋 EMOJI**

```svg
<svg viewBox="0 0 100 100" class="evolea-butterfly">
  <defs>
    <linearGradient id="wing-left" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5DADE2"/>
      <stop offset="100%" stop-color="#CD87F8"/>
    </linearGradient>
    <linearGradient id="wing-right" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EF8EAE"/>
      <stop offset="100%" stop-color="#DD48E0"/>
    </linearGradient>
  </defs>
  <!-- Left wings -->
  <path d="M48 50 C35 25, 5 20, 10 45 C5 70, 35 75, 48 55 Z" fill="url(#wing-left)"/>
  <path d="M48 55 C35 60, 15 85, 30 90 C45 85, 48 65, 48 55 Z" fill="url(#wing-left)" opacity="0.8"/>
  <!-- Right wings -->
  <path d="M52 50 C65 25, 95 20, 90 45 C95 70, 65 75, 52 55 Z" fill="url(#wing-right)"/>
  <path d="M52 55 C65 60, 85 85, 70 90 C55 85, 52 65, 52 55 Z" fill="url(#wing-right)" opacity="0.8"/>
  <!-- Body -->
  <ellipse cx="50" cy="55" rx="3" ry="15" fill="#2D2A32"/>
</svg>
```

### Butterfly Variants
- **Full Spectrum**: Primary usage (code above)
- **Magenta Mono**: Use `fill="#DD48E0"` for all paths
- **Mint Mono**: Use `fill="#7BEDD5"` for all paths  
- **White**: Use `fill="#FFFFFF"` on dark backgrounds

### Butterfly Usage
- Float in backgrounds at 40-60% opacity
- Use as bullet points or section markers
- Paired with EVOLEA wordmark in logo
- NEVER use butterfly emoji 🦋

---

## Component Patterns

### Buttons

```html
<!-- Primary Button - Magenta Gradient -->
<button class="btn-primary">
  Text Here
</button>

<style>
.btn-primary {
  background: var(--gradient-magenta);
  color: #FFFFFF;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 9999px;
  border: none;
  box-shadow: var(--shadow-soft);
}
</style>

<!-- Outline Button - MUST have visible border and text -->
<button class="btn-outline">
  Text Here
</button>

<style>
.btn-outline {
  background: transparent;
  color: var(--evolea-magenta);
  border: 2px solid var(--evolea-magenta);
  /* ... same padding/radius */
}
</style>
```

**⚠️ BUTTON CHECKLIST:**
- [ ] Text is visible against background
- [ ] On gradient backgrounds, use white or dark text
- [ ] Outline buttons have visible border color
- [ ] Hover state is defined

### Cards

```html
<!-- Feature Card with Butterfly Accent -->
<div class="card-feature">
  <div class="card-icon">
    <!-- USE SVG, NOT EMOJI -->
    <svg><!-- butterfly or custom icon --></svg>
  </div>
  <h3>Title</h3>
  <p>Description</p>
</div>

<style>
.card-feature {
  background: var(--evolea-cream);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: var(--shadow-card);
}
</style>

<!-- Gradient Card -->
<div class="card-gradient">
  <h3>Title</h3>
  <p>Description</p>
</div>

<style>
.card-gradient {
  background: var(--gradient-magenta);
  color: #FFFFFF;
  border-radius: 1.5rem;
  padding: 2rem;
}
</style>
```

**⚠️ CARD CHECKLIST:**
- [ ] No emojis used for icons
- [ ] Text contrasts with background
- [ ] Consistent border-radius (1.5rem standard)
- [ ] Proper padding (2rem standard)

### Shadows
```css
--shadow-soft: 0 4px 20px rgba(186, 83, 173, 0.15);
--shadow-card: 0 8px 30px rgba(186, 83, 173, 0.2);
--shadow-glow-magenta: 0 0 60px rgba(221, 72, 224, 0.5);
--shadow-glow-mint: 0 0 60px rgba(123, 237, 213, 0.5);
```

---

## Logo Rules

### The Logo
- Text "EVOLEA" with gradient + butterfly SVG
- Butterfly sits AFTER the text, NOT overlapping
- The "A" must ALWAYS be fully visible

### Logo Don'ts
- ❌ Don't use butterfly emoji
- ❌ Don't let butterfly cover any letters
- ❌ Don't distort proportions
- ❌ Don't use on low-contrast backgrounds

---

## Icon Guidelines

### Creating Icons for Programs

Instead of emojis, create simple SVG icons:

```html
<!-- Mini Garten - Sprout Icon -->
<svg viewBox="0 0 40 40" fill="none">
  <path d="M20 35V20" stroke="#7BEDD5" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 20C20 14 14 10 8 12C10 18 16 20 20 20Z" fill="#7BEDD5"/>
  <path d="M20 20C20 14 26 10 32 12C30 18 24 20 20 20Z" fill="#5DADE2"/>
  <ellipse cx="20" cy="36" rx="6" ry="2" fill="#C96861"/>
</svg>

<!-- Mini Turnen - Ball Icon -->
<svg viewBox="0 0 40 40" fill="none">
  <circle cx="20" cy="20" r="16" fill="url(#ball-gradient)"/>
  <path d="M8 14C12 18 16 20 20 20C24 20 28 18 32 14" stroke="white" stroke-width="2"/>
  <defs>
    <linearGradient id="ball-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5DADE2"/>
      <stop offset="100%" stop-color="#CD87F8"/>
    </linearGradient>
  </defs>
</svg>
```

### Icon Mapping (Replace Emojis)
| Program | ❌ Don't Use | ✅ Use Instead |
|---------|-------------|----------------|
| Mini Garten | 🌱 | Sprout SVG (mint/teal) |
| Mini Projekte | 🎨 | Palette/brush SVG |
| Mini Turnen | ⚽ | Ball SVG with gradient |
| Schulberatung | 🏫 | Building/book SVG |

---

## Pre-Commit Checklist

Before finalizing any page, verify:

### Visual Checks
- [ ] No emojis used anywhere (search for emoji characters)
- [ ] All buttons have visible text
- [ ] Logo "A" is not covered
- [ ] Cards have proper spacing and alignment
- [ ] Images are properly sized and not distorted
- [ ] Team photos have consistent dimensions

### Color Checks
- [ ] Using CSS variables, not hardcoded colors
- [ ] Text has sufficient contrast (4.5:1 minimum)
- [ ] Gradients render correctly
- [ ] No white-on-white or invisible elements

### Component Checks
- [ ] Buttons have hover states
- [ ] Cards use SVG icons, not emojis
- [ ] Consistent border-radius throughout
- [ ] Proper shadow usage

---

## Tailwind Config Reference

```js
// tailwind.config.mjs
colors: {
  evolea: {
    magenta: '#DD48E0',
    'magenta-light': '#EF5EDB',
    'magenta-vivid': '#E97BF1',
    purple: '#BA53AD',
    'purple-light': '#CD87F8',
    mint: '#7BEDD5',
    yellow: '#FFE066',
    coral: '#FF7E5D',
    gold: '#DCD49F',
    pink: '#EF8EAE',
    sky: '#5DADE2',
    cream: '#FFFBF7',
    text: '#2D2A32',
    'text-light': '#5C5762',
  }
}
```

---

## Quick Reference

### When Building New Components
1. Check this skill file first
2. Use CSS variables for all colors
3. Use SVG for all icons (no emojis)
4. Verify contrast and visibility
5. Test on both light and dark sections

### When Fixing Issues
1. Search for emoji characters and replace with SVG
2. Check button text visibility
3. Verify logo is not obscured
4. Check card alignment and spacing
5. Validate team image dimensions
