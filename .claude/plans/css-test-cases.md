# EVOLEA Fluid CSS System - Test Cases

**Version:** 1.0
**Created:** December 25, 2024
**Purpose:** Verification checklist for fluid CSS breakpoint system implementation
**Status:** Ready for QA

---

## Overview

This document provides a comprehensive test checklist for verifying the fluid CSS system implementation across the EVOLEA website. All tests ensure adherence to EVOLEA Brand Guide v3.0, accessibility standards (WCAG 2.1 AA), and modern responsive design best practices.

**Testing Philosophy:**
- Mobile-first verification
- Progressive enhancement validation
- Real device testing required
- Accessibility-first approach
- Brand compliance at every breakpoint

---

## Table of Contents

1. [CSS Variables Verification](#1-css-variables-verification)
2. [Fluid Typography Tests](#2-fluid-typography-tests)
3. [Fluid Spacing Tests](#3-fluid-spacing-tests)
4. [Container Width Tests](#4-container-width-tests)
5. [Breakpoint-Specific Tests](#5-breakpoint-specific-tests)
6. [Cross-Browser Compatibility](#6-cross-browser-compatibility)
7. [Accessibility Tests](#7-accessibility-tests)
8. [Performance Tests](#8-performance-tests)
9. [Brand Compliance Tests](#9-brand-compliance-tests)

---

## 1. CSS Variables Verification

### 1.1 Breakpoint Variables
- [ ] `--bp-sm: 640px` defined in `:root`
- [ ] `--bp-md: 768px` defined in `:root`
- [ ] `--bp-lg: 1024px` defined in `:root`
- [ ] `--bp-xl: 1280px` defined in `:root`
- [ ] `--bp-2xl: 1440px` defined in `:root`
- [ ] `--bp-3xl: 1920px` defined in `:root`
- [ ] `--bp-4xl: 2560px` defined in `:root`
- [ ] `--bp-5xl: 3840px` defined in `:root`

**Verification Method:**
```javascript
// Run in browser console
getComputedStyle(document.documentElement).getPropertyValue('--bp-md')
// Should return: 768px
```

### 1.2 Fluid Typography Variables
- [ ] `--font-hero` clamp(2.5rem, 4vw + 1rem, 6rem)
- [ ] `--font-h1` clamp(2rem, 3vw + 0.75rem, 4rem)
- [ ] `--font-h2` clamp(1.5rem, 2.5vw + 0.5rem, 3rem)
- [ ] `--font-h3` clamp(1.25rem, 2vw + 0.25rem, 2rem)
- [ ] `--font-body-lg` clamp(1.125rem, 0.5vw + 1rem, 1.375rem)
- [ ] `--font-body` clamp(1rem, 0.3vw + 0.9rem, 1.125rem)
- [ ] `--font-small` clamp(0.875rem, 0.2vw + 0.8rem, 1rem)
- [ ] `--font-micro` clamp(0.75rem, 0.15vw + 0.7rem, 0.875rem)

**Verification Method:**
```javascript
// Test at multiple viewport widths
const testViewports = [375, 768, 1024, 1440, 1920, 2560];
testViewports.forEach(width => {
  window.resizeTo(width, 900);
  const h1Size = getComputedStyle(document.querySelector('h1')).fontSize;
  console.log(`${width}px: H1 = ${h1Size}`);
});
```

### 1.3 Fluid Spacing Variables
- [ ] `--space-section` clamp(4rem, 8vh, 8rem)
- [ ] `--space-component` clamp(2rem, 4vh, 5rem)
- [ ] `--space-card-gap` clamp(1rem, 2vw, 2.5rem)
- [ ] `--space-content-padding` clamp(1.5rem, 5vw, 4rem)
- [ ] `--gradient-fade-height` clamp(80px, 10vh, 160px)

**Verification Method:**
```javascript
// Check computed spacing values
const section = document.querySelector('.section');
getComputedStyle(section).padding
```

### 1.4 Container Width Variables
- [ ] `--container-sm: 640px`
- [ ] `--container-md: 768px`
- [ ] `--container-lg: 1024px`
- [ ] `--container-xl: 1280px`
- [ ] `--container-2xl: 1440px`
- [ ] `--container-3xl: 1600px`
- [ ] `--container-4xl: 1800px`
- [ ] `--container-5xl: 2100px`
- [ ] `--container-fluid: min(92vw, 1800px)`
- [ ] `--container-hero: min(90vw, 1600px)`

### 1.5 EVOLEA Brand Color Variables
- [ ] `--evolea-magenta: #DD48E0`
- [ ] `--evolea-purple: #BA53AD`
- [ ] `--evolea-lavender: #CD87F8`
- [ ] `--evolea-mint: #7BEDD5`
- [ ] `--evolea-sunshine: #FFE066`
- [ ] `--evolea-coral: #FF7E5D`
- [ ] `--evolea-sky: #5DADE2`
- [ ] `--evolea-blush: #EF8EAE`
- [ ] `--evolea-gold: #E8B86D`
- [ ] `--evolea-cream: #FFFBF7`
- [ ] `--evolea-text: #2D2A32`
- [ ] `--evolea-text-light: #5C5762`
- [ ] `--evolea-white: #FFFFFF`
- [ ] `--evolea-dark: #1A1A2E`

**Verification Method:**
```javascript
// Check color value
getComputedStyle(document.documentElement).getPropertyValue('--evolea-magenta')
// Should return: #DD48E0
```

### 1.6 Gradient Variables
- [ ] `--gradient-prism` defined with 6 color stops (Mint → Sunshine → Blush → Magenta → Lavender → Purple)
- [ ] `--gradient-magenta` defined with 3 stops (Purple → Magenta → Light Magenta)
- [ ] `--gradient-spectrum` defined with 6 colors

**Verification Method:**
```javascript
// Check gradient definition
getComputedStyle(document.documentElement).getPropertyValue('--gradient-prism')
```

### 1.7 Animation Easing Variables
- [ ] `--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)`
- [ ] `--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)`
- [ ] `--ease-in-out: cubic-bezier(0.4, 0, 0.6, 1)`

---

## 2. Fluid Typography Tests

### 2.1 Hero Typography Scaling

**Test at 375px (Mobile):**
- [ ] Hero headline: 40-50px (2.5rem-3.125rem range)
- [ ] Hero subtitle: 16-18px (1rem-1.125rem range)
- [ ] Fredoka font family applied
- [ ] Font weight 700 (Bold)
- [ ] Text shadow visible on gradient
- [ ] Line height ~1.2

**Test at 768px (Tablet):**
- [ ] Hero headline: 48-60px (3rem-3.75rem range)
- [ ] Hero subtitle: 18-20px (1.125rem-1.25rem range)
- [ ] Smooth scaling from mobile size

**Test at 1440px (Desktop):**
- [ ] Hero headline: 64-72px (4rem-4.5rem range)
- [ ] Hero subtitle: 20-22px (1.25rem-1.375rem range)
- [ ] Scaling maintains proportion

**Test at 1920px (Large Desktop):**
- [ ] Hero headline: 72-88px (4.5rem-5.5rem range)
- [ ] Maximum size not exceeded

**Test at 2560px (Ultra-Wide):**
- [ ] Hero headline: 96px maximum (6rem cap)
- [ ] No excessive scaling beyond max

### 2.2 Heading Typography Scaling

**H1 Tests:**
- [ ] 375px: 32px minimum (2rem)
- [ ] 768px: 40-48px range
- [ ] 1440px: 56-64px range
- [ ] 1920px: 64px maximum (4rem)
- [ ] Fredoka Bold (700) applied
- [ ] EVOLEA purple color (#BA53AD)
- [ ] Line height ~1.2

**H2 Tests:**
- [ ] 375px: 24px minimum (1.5rem)
- [ ] 768px: 32-36px range
- [ ] 1440px: 40-48px range
- [ ] 1920px: 48px maximum (3rem)
- [ ] Fredoka SemiBold (600) applied
- [ ] EVOLEA purple color
- [ ] Line height ~1.2

**H3 Tests:**
- [ ] 375px: 20px minimum (1.25rem)
- [ ] 768px: 24-28px range
- [ ] 1440px: 28-32px range
- [ ] 1920px: 32px maximum (2rem)
- [ ] Fredoka SemiBold (600) applied
- [ ] Line height ~1.2

### 2.3 Body Typography Scaling

**Body Text Tests:**
- [ ] 375px: 16px minimum (1rem)
- [ ] 768px: 16-17px range
- [ ] 1440px: 16-18px range
- [ ] 1920px: 18px maximum (1.125rem)
- [ ] Poppins Regular (400) applied
- [ ] EVOLEA text color (#2D2A32)
- [ ] Line height 1.7

**Body Large Tests:**
- [ ] 375px: 18px minimum (1.125rem)
- [ ] 1920px: 22px maximum (1.375rem)
- [ ] Smooth scaling between breakpoints

**Small Text Tests:**
- [ ] 375px: 14px minimum (0.875rem)
- [ ] 1920px: 16px maximum (1rem)
- [ ] Readable at all sizes

**Micro Text Tests:**
- [ ] 375px: 12px minimum (0.75rem)
- [ ] 1920px: 14px maximum (0.875rem)
- [ ] Poppins Medium (500) applied
- [ ] Used for labels/badges only

### 2.4 Typography Accessibility

- [ ] All text meets WCAG 2.1 AA contrast (4.5:1 for body, 3:1 for large)
- [ ] Text on gradients has shadows for readability
- [ ] No text smaller than 12px anywhere
- [ ] Line length 45-75 characters at all breakpoints
- [ ] Text scales with browser zoom to 200%
- [ ] No horizontal scrolling when zoomed

---

## 3. Fluid Spacing Tests

### 3.1 Section Spacing Tests

**Vertical Section Padding:**
- [ ] 375px: 64px minimum (4rem)
- [ ] 768px: 80-96px range
- [ ] 1440px: 96-128px range
- [ ] 1920px: 128px maximum (8rem)
- [ ] Consistent across all pages
- [ ] Breathing room between sections

**Component Spacing:**
- [ ] 375px: 32px minimum (2rem)
- [ ] 1920px: 80px maximum (5rem)
- [ ] Used within sections consistently

### 3.2 Card Gap Spacing

**Grid Gap Tests:**
- [ ] 375px: 16px minimum (1rem) for 1-column grid
- [ ] 768px: 32px (2rem) for 2-column grid
- [ ] 1024px: 40px (2.5rem) for 3-column grid
- [ ] 1440px: 32px for 4-column grid (tighter)
- [ ] 1920px: 40px (2.5rem) for 4-column grid
- [ ] 2560px: 48px (3rem) for 5-column grid
- [ ] Spacing visually balanced at all breakpoints

### 3.3 Content Padding Tests

**Horizontal Padding:**
- [ ] 375px: 24px minimum (1.5rem)
- [ ] 768px: 32-40px range
- [ ] 1440px: 48-64px range
- [ ] 1920px: 64px maximum (4rem)
- [ ] No content touching viewport edges
- [ ] Consistent left/right padding

### 3.4 Gradient Fade Height

**Wave Fade Tests:**
- [ ] 375px: 80px minimum
- [ ] 768px: 100px
- [ ] 1024px: 120px
- [ ] 1920px: 120-180px range
- [ ] 2560px: 150-220px maximum
- [ ] Proportional to viewport height
- [ ] Wave animation smooth at all sizes

---

## 4. Container Width Tests

### 4.1 Container Max-Width Behavior

**375px (Mobile):**
- [ ] Container: 100% width with padding
- [ ] No fixed max-width applied
- [ ] Content uses full viewport with padding

**768px (Tablet):**
- [ ] Container: 100% width with padding
- [ ] No max-width constraint yet

**1024px (Desktop):**
- [ ] Container max-width: 1440px (--container-2xl)
- [ ] Container centered with auto margins
- [ ] Padding applied within container

**1440px (Large Desktop):**
- [ ] Container max-width: 1440px maintained
- [ ] Content centered
- [ ] Side margins visible

**1920px (Large Desktop):**
- [ ] Container max-width: 1600px (--container-3xl)
- [ ] Proper centering
- [ ] Generous side margins

**2560px (Ultra-Wide):**
- [ ] Container max-width: 1800px (--container-4xl)
- [ ] Content doesn't stretch excessively
- [ ] Visible background on sides

### 4.2 Fluid Container Behavior

**Hero Container:**
- [ ] Uses `min(90vw, 1600px)` formula
- [ ] Never exceeds 90% of viewport width
- [ ] Caps at 1600px on large screens
- [ ] Centered properly

**Fluid Container:**
- [ ] Uses `min(92vw, 1800px)` formula
- [ ] 92% of viewport on smaller screens
- [ ] Caps at 1800px maximum
- [ ] Consistent across sections

---

## 5. Breakpoint-Specific Tests

### 5.1 Mobile (375px) Breakpoint

**Layout:**
- [ ] Single column card grids
- [ ] Hero height minimum 60vh
- [ ] Mobile menu solid background (NOT transparent)
- [ ] Touch targets minimum 44px × 44px
- [ ] No horizontal scrolling

**Typography:**
- [ ] Headings use minimum clamp values
- [ ] Body text 16px minimum
- [ ] Line height 1.7 for body

**Spacing:**
- [ ] Content padding 24px minimum
- [ ] Section padding 64px minimum
- [ ] Card gaps 24px (1.5rem)

**Components:**
- [ ] Floating orbs 150-180px
- [ ] Wave fade 80px height
- [ ] Buttons full-width or centered
- [ ] Forms stack vertically

**Brand Compliance:**
- [ ] Prism gradient visible
- [ ] Text shadows on gradients
- [ ] No emojis anywhere
- [ ] Solid mobile menu background

### 5.2 Tablet (768px) Breakpoint

**Layout:**
- [ ] 2-column card grids
- [ ] Hero height minimum 70vh
- [ ] Two-column content layouts
- [ ] Navigation: mobile menu or desktop nav

**Typography:**
- [ ] Hero headline 2.5rem-3.5rem range
- [ ] Scaled up from mobile proportionally

**Spacing:**
- [ ] Content padding 32-40px
- [ ] Grid gaps 32px (2rem)
- [ ] Section padding 80-96px

**Components:**
- [ ] Floating orbs 200-230px
- [ ] Wave fade 100px height
- [ ] Footer 2-3 column layout

### 5.3 Desktop (1024px) Breakpoint

**Layout:**
- [ ] 3-column card grids
- [ ] Hero height minimum 80vh
- [ ] Desktop navigation visible (mobile menu hidden)
- [ ] Two-column layouts with 1fr 1.2fr ratio

**Typography:**
- [ ] Hero headline 3rem-4rem range
- [ ] Desktop font sizes applied

**Spacing:**
- [ ] Content padding 48-64px
- [ ] Grid gaps 40px (2.5rem)
- [ ] Section padding 96-128px

**Components:**
- [ ] Floating orbs 250-300px with 70px blur
- [ ] Wave fade 120px height
- [ ] Footer 4-column layout
- [ ] Team grid 3-column layout
- [ ] Hover effects: translateY(-8px)

**Navigation:**
- [ ] Full desktop nav visible
- [ ] Nav links properly spaced
- [ ] Active link spectrum underline
- [ ] Donate button gold with shadow

### 5.4 Large Desktop (1440px) Breakpoint

**Layout:**
- [ ] 4-column card grids
- [ ] Container max-width 1440px
- [ ] Proper centering

**Components:**
- [ ] Program cards 4-column grid
- [ ] Team grid 4-column layout

### 5.5 Large Desktop (1920px) Breakpoint

**Layout:**
- [ ] Hero height minimum 85vh
- [ ] Container max-width 1600px
- [ ] 4-column grids maintained (not 5)

**Typography:**
- [ ] Hero headline 4rem-5.5rem range
- [ ] All typography at larger sizes

**Spacing:**
- [ ] Section padding 80-160px (5rem-10rem)
- [ ] Grid gaps 40-48px (2.5rem-3rem)
- [ ] Card padding 48px (3rem)

**Components:**
- [ ] Floating orbs 350-400px with 80px blur
- [ ] Orb opacity 0.45
- [ ] Wave fade 120-180px height
- [ ] Prism gradient animates (prismShift)
- [ ] Donate button shimmer effect (goldShimmer)
- [ ] Card hover: translateY(-10px)

**Animations:**
- [ ] Gradient background-size 120% with animation
- [ ] Float animation larger travel distance
- [ ] All animations smooth 60fps

### 5.6 Ultra-Wide (2560px) Breakpoint

**Layout:**
- [ ] 5-column card grids (where applicable)
- [ ] Container max-width 1800px
- [ ] Content centered with visible side margins

**Typography:**
- [ ] Hero headline 5rem-6rem maximum
- [ ] All typography capped at maximums

**Spacing:**
- [ ] Section padding 96-192px (6rem-12rem)
- [ ] Grid gaps 48px (3rem)
- [ ] Card padding 56px (3.5rem)

**Components:**
- [ ] Floating orbs 450-500px with 100px blur
- [ ] Wave fade 150-220px height
- [ ] Team grid 5-column layout
- [ ] Blog grid 3-column layout

**Checks:**
- [ ] No excessive stretching
- [ ] Cards maintain max-width ~420px
- [ ] Images maintain aspect ratio
- [ ] Visual hierarchy maintained

---

## 6. Cross-Browser Compatibility

### 6.1 Chrome/Edge (Chromium)

- [ ] All CSS variables resolve correctly
- [ ] `clamp()` functions work
- [ ] `min()` functions work
- [ ] Gradients render correctly
- [ ] Animations smooth
- [ ] Grid layouts work
- [ ] Custom properties cascade

### 6.2 Firefox

- [ ] CSS variables supported
- [ ] `clamp()` supported (Firefox 75+)
- [ ] Gradients match Chrome
- [ ] Grid layouts identical
- [ ] Animations perform well
- [ ] `min()`/`max()` functions work

### 6.3 Safari (macOS/iOS)

**Safari Desktop:**
- [ ] CSS variables work
- [ ] `clamp()` supported (Safari 13.1+)
- [ ] Gradients render correctly
- [ ] `-webkit-` prefixes not needed for grid
- [ ] Animations smooth

**Safari iOS:**
- [ ] Mobile viewport units work (vh/vw)
- [ ] `dvh` (dynamic viewport height) supported or fallback works
- [ ] Touch targets 44px minimum
- [ ] No input zoom on focus (font-size ≥ 16px)
- [ ] Smooth scrolling works
- [ ] Pinch zoom enabled

### 6.4 Legacy Browser Fallbacks

**Check for fallbacks:**
- [ ] IE11 not supported (document this)
- [ ] Old Safari versions show graceful degradation
- [ ] Feature detection for `clamp()` if needed
- [ ] Progressive enhancement approach

**Verification Method:**
```css
/* If clamp() not supported, provide fallback */
.heading {
  font-size: 2rem; /* Fallback */
  font-size: clamp(2rem, 3vw + 0.75rem, 4rem); /* Modern */
}
```

### 6.5 Mobile Browser Tests

**Chrome Mobile (Android):**
- [ ] Responsive breakpoints work
- [ ] Touch targets adequate
- [ ] Performance acceptable

**Safari Mobile (iOS):**
- [ ] All breakpoints work
- [ ] No input zoom issues
- [ ] Smooth scrolling
- [ ] Viewport units correct

**Samsung Internet:**
- [ ] CSS variables work
- [ ] Grid layouts work
- [ ] Animations smooth

---

## 7. Accessibility Tests

### 7.1 Reduced Motion Support

**Enable `prefers-reduced-motion: reduce`:**
- [ ] All animations stop or minimal duration (0.01ms)
- [ ] Floating orbs don't animate
- [ ] Wave fade doesn't animate
- [ ] Butterflies don't animate
- [ ] Gradient shift stops
- [ ] Transitions instant
- [ ] Hover effects still apply (no motion)
- [ ] Page remains functional

**Verification Method:**
```css
/* Browser DevTools > Rendering > Emulate CSS media feature prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  /* All animations should stop */
}
```

### 7.2 High Contrast Mode

**Windows High Contrast:**
- [ ] Text remains readable
- [ ] Cards have visible borders (2px solid)
- [ ] Buttons have visible borders
- [ ] Focus states enhanced
- [ ] Brand colors adapted appropriately

**Forced Colors Mode:**
- [ ] `forced-colors: active` media query works
- [ ] Focus outlines use system colors
- [ ] Text contrast maintained

**Verification Method:**
```css
@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid CanvasText;
  }
}
```

### 7.3 Keyboard Navigation

**Tab Order:**
- [ ] Logical tab order throughout page
- [ ] All interactive elements reachable
- [ ] Skip link present and functional
- [ ] No focus traps
- [ ] Modals trap focus correctly

**Focus States:**
- [ ] All interactive elements have visible focus
- [ ] Focus outline 3px solid magenta
- [ ] Focus offset 2-4px
- [ ] Contrast ratio minimum 3:1 vs background
- [ ] Focus visible on all breakpoints

**Verification Method:**
```javascript
// Tab through entire page
// Verify focus visible on all elements
document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
```

### 7.4 Touch Target Sizes

**Mobile (375px-1023px):**
- [ ] All buttons minimum 44px × 44px
- [ ] All links minimum 44px height
- [ ] Nav links minimum 44px touch target
- [ ] Form inputs minimum 44px height
- [ ] Icon buttons exactly 44px × 44px
- [ ] Adequate spacing between targets (8px minimum)

**Desktop (1024px+):**
- [ ] Minimum still 44px for touch screens
- [ ] Mouse targets can be smaller but maintain accessibility
- [ ] Hover states don't require target

**Verification Method:**
```javascript
// Measure touch target sizes
const button = document.querySelector('.btn');
const rect = button.getBoundingClientRect();
console.log(`${rect.width}px × ${rect.height}px`);
// Should be ≥ 44px × 44px
```

### 7.5 Color Contrast

**Text Contrast:**
- [ ] Body text (#2D2A32) on cream (#FFFBF7): ≥ 4.5:1 ✓ (12.4:1)
- [ ] Body text on white (#FFFFFF): ≥ 4.5:1 ✓ (14.5:1)
- [ ] White on purple (#BA53AD): ≥ 4.5:1 ✓ (4.6:1)
- [ ] White on magenta (#DD48E0): ≥ 3:1 for large text only ⚠️ (3.2:1)
- [ ] Dark text (#451A03) on gold (#E8B86D): ≥ 4.5:1 ✓ (7.2:1)
- [ ] All text on gradients has shadows

**UI Component Contrast:**
- [ ] Buttons meet 3:1 contrast vs background
- [ ] Form borders visible (3:1 minimum)
- [ ] Focus indicators 3:1 contrast
- [ ] Active states distinguishable

**Tools:**
- WebAIM Contrast Checker
- Chrome DevTools Lighthouse
- axe DevTools

### 7.6 Screen Reader Compatibility

**Semantic HTML:**
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Landmark regions present (`<nav>`, `<main>`, `<footer>`)
- [ ] Lists use `<ul>`/`<ol>`
- [ ] Tables use proper markup (if any)

**ARIA:**
- [ ] Images have alt text (informative) or `alt=""` (decorative)
- [ ] Buttons have descriptive labels
- [ ] Links describe destination
- [ ] Forms properly labeled
- [ ] Status messages use `role="status"` or `role="alert"`

**Test with Screen Readers:**
- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (macOS/iOS)
- [ ] TalkBack (Android)

### 7.7 Zoom & Text Scaling

**Browser Zoom:**
- [ ] Page scales to 200% without breaking
- [ ] No horizontal scrolling at 200% zoom
- [ ] All content remains accessible
- [ ] No overlapping elements
- [ ] Images scale proportionally

**Text-Only Zoom:**
- [ ] Text scales up to 200%
- [ ] Layout doesn't break
- [ ] Containers expand with text
- [ ] No text truncation

---

## 8. Performance Tests

### 8.1 Lighthouse Performance Audit

**Run Lighthouse in Chrome DevTools:**
- [ ] Performance score ≥ 90
- [ ] Accessibility score ≥ 90
- [ ] Best Practices score ≥ 90
- [ ] SEO score ≥ 90

**Core Web Vitals:**
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### 8.2 Animation Performance

**Monitor Frame Rate:**
- [ ] All animations maintain 60fps
- [ ] Floating orbs smooth
- [ ] Wave animations smooth
- [ ] Gradient shifts smooth
- [ ] No dropped frames during scroll

**Verification Method:**
```javascript
// Chrome DevTools > Performance > Record
// Check for frame drops, long tasks
```

### 8.3 Paint & Layout Performance

**Layout Shifts:**
- [ ] No layout shift during page load
- [ ] Orbs have explicit dimensions (no shift)
- [ ] Images have width/height attributes
- [ ] Fonts preloaded (no FOIT/FOUT)

**Repaint Performance:**
- [ ] Animations use `transform` and `opacity` only
- [ ] No layout thrashing
- [ ] GPU acceleration where appropriate
- [ ] Will-change used sparingly

**Verification Method:**
```javascript
// Monitor layout shifts
new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('Layout shift:', entry);
  });
}).observe({type: 'layout-shift', buffered: true});
```

### 8.4 CSS Loading Performance

- [ ] CSS minified in production
- [ ] Critical CSS inlined (if applicable)
- [ ] Non-critical CSS deferred
- [ ] No unused CSS in production
- [ ] CSS bundled efficiently

### 8.5 Font Loading Performance

- [ ] Fredoka font loads without flash
- [ ] Poppins font loads without flash
- [ ] Fonts preloaded via `<link rel="preload">`
- [ ] Font-display strategy appropriate (`swap` or `fallback`)
- [ ] Fallback fonts defined

---

## 9. Brand Compliance Tests

### 9.1 EVOLEA Brand Guide v3.0 Commandments

**The 10 Commandments (NON-NEGOTIABLE):**
- [ ] 1. NEVER use emojis anywhere (SVG icons only)
- [ ] 2. NEVER use transparent mobile menus (solid backgrounds always)
- [ ] 3. NEVER use text without shadows on gradients
- [ ] 4. NEVER use AI images for real content
- [ ] 5. NEVER let the butterfly cover the "A"
- [ ] 6. NEVER use flat, muted, or corporate colors
- [ ] 7. ALWAYS have a prism gradient hero
- [ ] 8. ALWAYS have a page closer
- [ ] 9. ALWAYS use Fredoka for headlines
- [ ] 10. ALWAYS test on mobile

### 9.2 Color Palette Verification

**Primary Colors:**
- [ ] Magenta #DD48E0 used correctly
- [ ] Deep Purple #BA53AD used for headlines
- [ ] Lavender #CD87F8 used for accents

**Spectrum Colors:**
- [ ] Mint #7BEDD5 used
- [ ] Sunshine #FFE066 used
- [ ] Coral #FF7E5D used
- [ ] Sky Blue #5DADE2 used
- [ ] Blush #EF8EAE used
- [ ] Gold #E8B86D for donate button

**Neutrals:**
- [ ] Cream #FFFBF7 for backgrounds
- [ ] Dark Text #2D2A32 for body
- [ ] Light Text #5C5762 for secondary
- [ ] Pure White #FFFFFF for cards
- [ ] Charcoal #1A1A2E for dark sections

**Gradients:**
- [ ] Prism gradient includes all 6 spectrum colors in order
- [ ] Magenta gradient uses 3 purple shades
- [ ] Spectrum gradient horizontal across 6 colors

### 9.3 Typography Verification

**Fredoka Font:**
- [ ] All H1, H2, H3 use Fredoka
- [ ] Hero headlines use Fredoka Bold 700
- [ ] Subheadings use Fredoka SemiBold 600
- [ ] Font loaded correctly (no fallback shown)

**Poppins Font:**
- [ ] Body text uses Poppins Regular 400
- [ ] UI elements use Poppins Medium 500
- [ ] Navigation uses Poppins SemiBold 600
- [ ] Font loaded correctly

### 9.4 Component Brand Compliance

**Hero Sections:**
- [ ] Prism gradient present on every page
- [ ] Text shadows on white text
- [ ] Floating orbs use brand colors
- [ ] Wave fade at bottom of gradient

**Buttons:**
- [ ] Primary buttons use magenta gradient
- [ ] Donate button uses gold (#E8B86D)
- [ ] Rounded corners (border-radius: 100px)
- [ ] Shadows use brand colors (purple/magenta)

**Cards:**
- [ ] Border-radius 24px
- [ ] Shadows use purple/magenta tones
- [ ] Spectrum accent bar on hover
- [ ] White background

**Mobile Menu:**
- [ ] Solid background (white or cream gradient)
- [ ] NEVER transparent
- [ ] Smooth slide animation

**Footer:**
- [ ] Page closer/gradient before footer
- [ ] FooterDonationCTA present (unless donate page)
- [ ] Gold donation button

### 9.5 Visual Consistency Across Breakpoints

**All Breakpoints:**
- [ ] Brand colors remain vibrant (not washed out)
- [ ] Gradients don't stretch awkwardly
- [ ] Typography hierarchy clear
- [ ] Spacing proportional
- [ ] Components recognizable
- [ ] No jarring changes between breakpoints

---

## Testing Workflow

### Pre-Test Setup
1. [ ] Clear browser cache
2. [ ] Disable browser extensions
3. [ ] Have viewport ruler ready
4. [ ] Open DevTools
5. [ ] Prepare test pages list

### Test Execution Order
1. [ ] **Phase 1:** Verify CSS variables (Section 1)
2. [ ] **Phase 2:** Test fluid typography (Section 2)
3. [ ] **Phase 3:** Test fluid spacing (Section 3)
4. [ ] **Phase 4:** Test container widths (Section 4)
5. [ ] **Phase 5:** Test each breakpoint (Section 5)
6. [ ] **Phase 6:** Cross-browser tests (Section 6)
7. [ ] **Phase 7:** Accessibility tests (Section 7)
8. [ ] **Phase 8:** Performance tests (Section 8)
9. [ ] **Phase 9:** Brand compliance (Section 9)

### Documentation Requirements
- [ ] Screenshot failures
- [ ] Record viewport dimensions
- [ ] Note browser/OS versions
- [ ] Document deviations from expected values
- [ ] Create issue tickets for failures

### Pass/Fail Criteria

**Critical Failures (Must Fix):**
- CSS variables undefined or incorrect
- Typography not scaling (clamp() not working)
- Mobile menu transparent (violates brand)
- Text without shadows on gradients
- Touch targets < 44px on mobile
- WCAG contrast failures
- Broken layout at any breakpoint
- Emojis present anywhere

**High Priority (Should Fix):**
- Spacing inconsistencies
- Animation performance issues
- Browser compatibility issues
- Minor accessibility issues
- Color palette deviations

**Medium Priority (Nice to Fix):**
- Minor visual inconsistencies
- Performance optimizations
- Enhanced hover states

**Low Priority (Future Enhancement):**
- Advanced animations
- Additional breakpoint tweaks
- Progressive enhancements

---

## Test Report Template

```markdown
## EVOLEA Fluid CSS System Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:**
- Browser: [Name + Version]
- OS: [Operating System]
- Screen Resolution: [Resolution]

### Summary
- **Total Tests:** [Number]
- **Passed:** [Number] ✅
- **Failed:** [Number] ❌
- **Partial:** [Number] ⚠️

### Critical Failures
[List any critical issues that must be fixed immediately]

### High Priority Issues
[List high priority issues]

### Brand Compliance
- [ ] All 10 Brand Commandments followed
- [ ] Color palette correct
- [ ] Typography correct
- [ ] Component styles correct

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Reduced motion supported

### Performance
- Lighthouse Performance: [Score]
- LCP: [Time]
- FID: [Time]
- CLS: [Score]

### Browser Compatibility
- Chrome: ✅/❌
- Firefox: ✅/❌
- Safari: ✅/❌
- Mobile Safari: ✅/❌
- Chrome Mobile: ✅/❌

### Screenshots
[Attach screenshots of any issues]

### Recommendations
[List recommendations for fixes and improvements]

### Sign-off
- [ ] All critical issues resolved
- [ ] Brand compliance verified
- [ ] Accessibility verified
- [ ] Performance acceptable
- [ ] Ready for production

**Tester Signature:** _______________
**Date:** _______________
```

---

## Appendix A: Quick Reference Commands

### Browser Console Commands

```javascript
// Check CSS variable
getComputedStyle(document.documentElement).getPropertyValue('--font-h1')

// Check viewport size
console.log(`${window.innerWidth}px × ${window.innerHeight}px`)

// Check computed font size
getComputedStyle(document.querySelector('h1')).fontSize

// Check touch target size
const el = document.querySelector('.btn');
const rect = el.getBoundingClientRect();
console.log(`${rect.width}px × ${rect.height}px`)

// Check for missing alt text
document.querySelectorAll('img:not([alt])').length

// Check contrast ratio (requires extension)
// Use Chrome DevTools > Elements > Styles > Contrast ratio indicator

// Monitor layout shifts
new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (!entry.hadRecentInput) {
      console.log('Layout shift detected:', entry.value);
    }
  });
}).observe({type: 'layout-shift', buffered: true});

// Check animation frame rate
// Chrome DevTools > Performance > Record > Check FPS meter
```

### DevTools Shortcuts

- **Open DevTools:** `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Opt+I` (Mac)
- **Device Mode:** `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)
- **Lighthouse:** DevTools > Lighthouse tab > Generate report
- **Accessibility:** DevTools > Elements > Accessibility pane
- **Color Picker:** Click color swatch in Styles pane
- **Force State:** DevTools > Elements > :hov to force :hover, :focus

---

## Appendix B: Testing Tools

### Required Tools
- **Chrome DevTools** - Built-in browser tools
- **Firefox DevTools** - Built-in browser tools
- **Lighthouse** - Performance/accessibility auditing
- **axe DevTools** - Accessibility testing extension
- **WAVE** - Web accessibility evaluation tool

### Recommended Tools
- **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
- **Responsive Viewer** - Chrome extension for multi-device preview
- **Window Resizer** - Chrome extension for exact viewport sizes
- **ColorZilla** - Color picker extension
- **WhatFont** - Font identification extension

### Screen Readers
- **NVDA** (Windows) - Free, open source
- **JAWS** (Windows) - Commercial, industry standard
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in

---

## Appendix C: Common Issues & Solutions

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| CSS variable not working | Typo or undefined | Check `:root` definition, verify spelling |
| `clamp()` not scaling | Wrong formula | Verify min, preferred, max values |
| Text too small on mobile | clamp() minimum too low | Increase minimum value |
| Text too large on ultra-wide | clamp() maximum too high | Decrease maximum value |
| Layout shift on load | Missing dimensions | Add explicit width/height to orbs |
| Mobile menu transparent | Wrong CSS | Use solid background gradient |
| Touch targets too small | Insufficient sizing | Ensure min 44px × 44px |
| Contrast failure | Wrong color combo | Use pre-approved EVOLEA combinations |
| Animation janky | Layout thrashing | Use transform/opacity only |
| Gradient washed out | Wrong colors or opacity | Use exact EVOLEA hex values |
| Font not loading | Missing preload or wrong path | Check font file paths, add preload |
| Hover not working on mobile | Wrong media query | Use `@media (hover: hover)` |

---

**Last Updated:** December 25, 2024
**Version:** 1.0
**Status:** Ready for QA
**Maintainer:** EVOLEA Development Team

*Always adhere to EVOLEA Brand Guide v3.0 when testing. All tests must pass before deployment.*
