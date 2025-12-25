# CSS Specifications for EVOLEA Responsive Breakpoints

**Document Version:** 1.0
**Created:** December 2024
**Status:** Ready to Implement

This document provides exact CSS code blocks for implementing responsive breakpoints across the EVOLEA website. All specifications follow the EVOLEA Brand Guide v3.0 and modern responsive design best practices.

---

## Table of Contents

1. [CSS Variables for Global Styles](#1-css-variables-for-global-styles)
2. [Mobile Breakpoint Styles (375px Base)](#2-mobile-breakpoint-styles-375px-base)
3. [Tablet Breakpoint Styles (768px)](#3-tablet-breakpoint-styles-768px)
4. [Desktop Breakpoint Styles (1024px-1440px)](#4-desktop-breakpoint-styles-1024px-1440px)
5. [Large Desktop Breakpoint Styles (1920px)](#5-large-desktop-breakpoint-styles-1920px)
6. [Ultra-Wide Breakpoint Styles (2560px)](#6-ultra-wide-breakpoint-styles-2560px)
7. [Component-Specific Responsive Patterns](#7-component-specific-responsive-patterns)
8. [Animation and Interaction Scaling](#8-animation-and-interaction-scaling)
9. [Accessibility Considerations](#9-accessibility-considerations)
10. [Implementation Order](#10-implementation-order)

---

## 1. CSS Variables for Global Styles

Add these variables to `src/styles/global.css` or create a new `src/styles/breakpoints.css`:

```css
:root {
  /* ============================================
     EVOLEA BREAKPOINT REFERENCE VARIABLES
     ============================================ */
  --bp-sm: 640px;    /* Mobile landscape / Small tablets */
  --bp-md: 768px;    /* Tablets portrait */
  --bp-lg: 1024px;   /* Tablets landscape / Small laptops */
  --bp-xl: 1280px;   /* Standard laptops */
  --bp-2xl: 1440px;  /* Large laptops / Standard desktops */
  --bp-3xl: 1920px;  /* Full HD / 27" displays */
  --bp-4xl: 2560px;  /* 2K / QHD displays */
  --bp-5xl: 3840px;  /* 4K UHD displays */

  /* ============================================
     FLUID TYPOGRAPHY VARIABLES
     ============================================ */

  /* Hero / Display Typography (Fredoka Bold 700) */
  --font-hero: clamp(2.5rem, 4vw + 1rem, 6rem);
  /* Min: 40px mobile, Preferred: 4vw + 16px, Max: 96px desktop */

  /* Heading 1 (Fredoka Bold 700) */
  --font-h1: clamp(2rem, 3vw + 0.75rem, 4rem);
  /* Min: 32px, Preferred: 3vw + 12px, Max: 64px */

  /* Heading 2 (Fredoka SemiBold 600) */
  --font-h2: clamp(1.5rem, 2.5vw + 0.5rem, 3rem);
  /* Min: 24px, Preferred: 2.5vw + 8px, Max: 48px */

  /* Heading 3 (Fredoka SemiBold 600) */
  --font-h3: clamp(1.25rem, 2vw + 0.25rem, 2rem);
  /* Min: 20px, Preferred: 2vw + 4px, Max: 32px */

  /* Body Large (Poppins Regular 400) */
  --font-body-lg: clamp(1.125rem, 0.5vw + 1rem, 1.375rem);
  /* Min: 18px, Preferred: 0.5vw + 16px, Max: 22px */

  /* Body Text (Poppins Regular 400) */
  --font-body: clamp(1rem, 0.3vw + 0.9rem, 1.125rem);
  /* Min: 16px, Preferred: 0.3vw + 14px, Max: 18px */

  /* Small Text (Poppins Regular 400) */
  --font-small: clamp(0.875rem, 0.2vw + 0.8rem, 1rem);
  /* Min: 14px, Preferred: 0.2vw + 13px, Max: 16px */

  /* Micro Text - labels, badges (Poppins Medium 500) */
  --font-micro: clamp(0.75rem, 0.15vw + 0.7rem, 0.875rem);
  /* Min: 12px, Preferred: 0.15vw + 11px, Max: 14px */

  /* ============================================
     FLUID SPACING VARIABLES
     ============================================ */

  /* Section Spacing (between major page sections) */
  --space-section: clamp(4rem, 8vh, 8rem);
  /* Min: 64px, Preferred: 8vh, Max: 128px */

  /* Component Spacing (within sections) */
  --space-component: clamp(2rem, 4vh, 5rem);
  /* Min: 32px, Preferred: 4vh, Max: 80px */

  /* Card Gap (grid/flex gaps) */
  --space-card-gap: clamp(1rem, 2vw, 2.5rem);
  /* Min: 16px, Preferred: 2vw, Max: 40px */

  /* Content Padding (horizontal page padding) */
  --space-content-padding: clamp(1.5rem, 5vw, 4rem);
  /* Min: 24px, Preferred: 5vw, Max: 64px */

  /* Gradient Fade Height (for EVOLEA wave transitions) */
  --gradient-fade-height: clamp(80px, 10vh, 160px);

  /* ============================================
     CONTAINER WIDTH VARIABLES
     ============================================ */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1440px;
  --container-3xl: 1600px;  /* EVOLEA large screens */
  --container-4xl: 1800px;  /* EVOLEA ultra-wide */
  --container-5xl: 2100px;  /* EVOLEA 4K screens */
  --container-fluid: min(92vw, 1800px);
  --container-hero: min(90vw, 1600px);

  /* ============================================
     EVOLEA BRAND COLORS
     ============================================ */

  /* Primary Colors */
  --evolea-magenta: #DD48E0;
  --evolea-purple: #BA53AD;
  --evolea-lavender: #CD87F8;

  /* Spectrum Colors */
  --evolea-mint: #7BEDD5;
  --evolea-sunshine: #FFE066;
  --evolea-coral: #FF7E5D;
  --evolea-sky: #5DADE2;
  --evolea-blush: #EF8EAE;
  --evolea-gold: #E8B86D;

  /* Neutrals */
  --evolea-cream: #FFFBF7;
  --evolea-text: #2D2A32;
  --evolea-text-light: #5C5762;
  --evolea-white: #FFFFFF;
  --evolea-dark: #1A1A2E;

  /* Gradients */
  --gradient-prism: linear-gradient(
    135deg,
    #7BEDD5 0%,      /* Mint */
    #FFE066 20%,     /* Sunshine */
    #FF9ECC 40%,     /* Blush */
    #E97BF1 60%,     /* Magenta */
    #CD87F8 80%,     /* Lavender */
    #BA53AD 100%     /* Deep Purple */
  );

  --gradient-magenta: linear-gradient(
    135deg,
    #BA53AD 0%,
    #DD48E0 50%,
    #E97BF1 100%
  );

  --gradient-spectrum: linear-gradient(
    90deg,
    #7BEDD5,
    #FFE066,
    #FF7E5D,
    #EF8EAE,
    #E97BF1,
    #CD87F8
  );

  /* ============================================
     ANIMATION & TRANSITION EASING
     ============================================ */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
}
```

---

## 2. Mobile Breakpoint Styles (375px Base)

Base mobile-first styles (no media query needed):

```css
/* ============================================
   MOBILE BASE STYLES (375px+)
   ============================================ */

/* Body Typography */
body {
  font-family: 'Poppins', sans-serif;
  font-size: var(--font-body);
  line-height: 1.7;
  color: var(--evolea-text);
  background-color: var(--evolea-cream);
}

/* Headings */
h1, h2, h3 {
  font-family: 'Fredoka', sans-serif;
  line-height: 1.2;
}

h1 {
  font-size: var(--font-h1);
  font-weight: 700;
  color: var(--evolea-purple);
}

h2 {
  font-size: var(--font-h2);
  font-weight: 600;
  color: var(--evolea-purple);
}

h3 {
  font-size: var(--font-h3);
  font-weight: 600;
}

/* Container */
.container {
  width: 100%;
  max-width: var(--container-2xl);
  margin: 0 auto;
  padding: 0 var(--space-content-padding);
}

/* Sections */
.section {
  padding: var(--space-section) var(--space-content-padding);
}

/* Hero Section - Mobile */
.hero-section {
  position: relative;
  min-height: 60vh;
  min-height: 60dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 4rem 1.5rem;
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-prism);
  z-index: -1;
}

.hero-headline {
  font-size: clamp(2rem, 8vw, 2.5rem);
  font-weight: 700;
  font-family: 'Fredoka', sans-serif;
  color: white;
  text-align: center;
  /* BRAND REQUIREMENT: Text shadow on gradients */
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 20px rgba(138, 61, 158, 0.3);
}

.hero-subtitle {
  font-size: clamp(1rem, 4vw, 1.125rem);
  text-align: center;
  max-width: 90vw;
  margin: 1rem auto 0;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Card Grid - Mobile (1 column) */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Evolea Card */
.evolea-card {
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(186, 83, 173, 0.08);
  transition: all 0.4s var(--ease-smooth);
  position: relative;
  overflow: hidden;
}

/* Buttons - Mobile */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.75rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 100px;
  transition: all 0.3s var(--ease-smooth);
  /* Minimum touch target */
  min-height: 44px;
  min-width: 44px;
}

.btn-primary {
  background: var(--gradient-magenta);
  color: white;
  box-shadow: 0 4px 15px rgba(186, 83, 173, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(186, 83, 173, 0.4);
}

/* Navigation - Mobile Menu */
.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 99999;
  /* BRAND REQUIREMENT: Solid background, never transparent */
  background: linear-gradient(
    180deg,
    var(--evolea-white) 0%,
    var(--evolea-cream) 100%
  );
  transform: translateX(100%);
  transition: transform 0.4s var(--ease-smooth);
}

.mobile-menu.open {
  transform: translateX(0);
}

.mobile-nav-link {
  display: block;
  padding: 1rem 1.5rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--evolea-text);
  /* Minimum touch target */
  min-height: 44px;
  border-bottom: 1px solid rgba(186, 83, 173, 0.1);
}

/* Floating Orbs - Mobile (smaller) */
.floating-orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.35;
  animation: float 20s ease-in-out infinite;
}

.orb-mint {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, #7BEDD5, #5DD5C0);
  top: 15%;
  left: -5%;
}

.orb-gold {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #FFE066, #FFC83D);
  bottom: 20%;
  right: -5%;
  animation-delay: -7s;
}

.orb-magenta {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, #E97BF1, #DD48E0);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(10px, -15px) scale(1.05);
  }
  50% {
    transform: translate(-8px, 12px) scale(0.95);
  }
  75% {
    transform: translate(15px, -8px) scale(1.02);
  }
}

/* Wave Fade - Mobile */
.wave-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  pointer-events: none;
  overflow: visible;
}

.wave-layer {
  position: absolute;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(186, 83, 173, 0.7) 0%,
    rgba(205, 135, 248, 0.3) 50%,
    transparent 100%
  );
  clip-path: polygon(
    0% 0%, 0% 40%, 10% 50%, 20% 45%, 30% 55%, 40% 50%,
    50% 60%, 60% 55%, 70% 50%, 80% 55%, 90% 50%, 100% 45%, 100% 0%
  );
  animation: waveDrift 25s ease-in-out infinite;
}

@keyframes waveDrift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
}
```

---

## 3. Tablet Breakpoint Styles (768px)

```css
/* ============================================
   TABLET BREAKPOINT: 768px+
   ============================================ */

@media (min-width: 768px) {
  /* Hero Section - Tablet */
  .hero-section {
    min-height: 70vh;
    min-height: 70dvh;
    padding: 5rem 2rem;
  }

  .hero-headline {
    font-size: clamp(2.5rem, 6vw, 3.5rem);
  }

  .hero-subtitle {
    font-size: clamp(1.125rem, 2.5vw, 1.25rem);
    max-width: 70vw;
  }

  /* Card Grid - Tablet (2 columns) */
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  /* Evolea Card - Tablet */
  .evolea-card {
    padding: 2rem;
  }

  /* Two-Column Layout - Tablet */
  .two-col-layout {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    align-items: center;
  }

  /* Buttons - Tablet */
  .btn {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  /* Navigation - Tablet may still use mobile menu or show desktop nav */
  .nav-links {
    display: none; /* Still use mobile menu */
  }

  /* Floating Orbs - Tablet (slightly larger) */
  .orb-mint {
    width: 200px;
    height: 200px;
  }

  .orb-gold {
    width: 160px;
    height: 160px;
  }

  .orb-magenta {
    width: 230px;
    height: 230px;
  }

  /* Wave Fade - Tablet */
  .wave-fade {
    height: 100px;
  }

  /* Program Cards - Tablet specific */
  .program-card-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Footer - Tablet (2 columns) */
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  /* Team Grid - Tablet (2 columns) */
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}
```

---

## 4. Desktop Breakpoint Styles (1024px-1440px)

```css
/* ============================================
   DESKTOP BREAKPOINT: 1024px+
   ============================================ */

@media (min-width: 1024px) {
  /* Hero Section - Desktop */
  .hero-section {
    min-height: 80vh;
    min-height: 80dvh;
    padding: 6rem 3rem;
  }

  .hero-headline {
    font-size: clamp(3rem, 5vw, 4rem);
  }

  .hero-subtitle {
    font-size: clamp(1.25rem, 2vw, 1.5rem);
    max-width: 60vw;
  }

  /* Card Grid - Desktop (3 columns) */
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }

  /* Evolea Card - Desktop */
  .evolea-card {
    padding: 2.5rem;
  }

  .evolea-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(186, 83, 173, 0.15);
  }

  /* Two-Column Layout - Desktop (with more space) */
  .two-col-layout {
    grid-template-columns: 1fr 1.2fr;
    gap: 3rem;
  }

  .two-col-layout.reverse {
    grid-template-columns: 1.2fr 1fr;
  }

  /* Desktop Navigation (show full nav, hide mobile menu) */
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 0.9375rem;
    color: var(--evolea-text);
    padding: 0.5rem 1rem;
    transition: color 0.3s ease;
    position: relative;
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
    width: 100%;
    height: 3px;
    background: var(--gradient-spectrum);
    border-radius: 2px;
  }

  /* Floating Orbs - Desktop (larger) */
  .orb-mint {
    width: 250px;
    height: 250px;
    filter: blur(70px);
  }

  .orb-gold {
    width: 200px;
    height: 200px;
    filter: blur(70px);
  }

  .orb-magenta {
    width: 300px;
    height: 300px;
    filter: blur(70px);
  }

  /* Wave Fade - Desktop */
  .wave-fade {
    height: 120px;
  }

  /* Program Cards - Desktop (3 columns) */
  .program-card-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Footer - Desktop (4 columns) */
  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 3rem;
  }

  /* Team Grid - Desktop (3 columns) */
  .team-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }

  /* Blog Grid - Desktop (2 columns) */
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
  }
}

/* ============================================
   LARGE DESKTOP: 1440px+
   ============================================ */

@media (min-width: 1440px) {
  /* Container expansion */
  .container {
    max-width: var(--container-2xl);
  }

  /* Hero Section - Large Desktop */
  .hero-headline {
    font-size: clamp(3.5rem, 4.5vw, 4.5rem);
  }

  /* Card Grid - Large Desktop (4 columns) */
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }

  /* Program Cards - Large Desktop (4 columns if content allows) */
  .program-card-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  /* Team Grid - Large Desktop (4 columns) */
  .team-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  /* Floating Orbs - Large Desktop */
  .orb {
    opacity: 0.4;
  }
}
```

---

## 5. Large Desktop Breakpoint Styles (1920px)

```css
/* ============================================
   LARGE DESKTOP: 1920px+ (27" displays)
   ============================================ */

@media (min-width: 1920px) {
  /* Container expansion */
  .container {
    max-width: var(--container-3xl);
  }

  /* Hero Section - Large Desktop */
  .hero-section {
    min-height: 85vh;
    min-height: 85dvh;
    padding: 8rem 4rem;
  }

  .hero-headline {
    font-size: clamp(4rem, 5vw, 5.5rem);
  }

  .hero-subtitle {
    font-size: clamp(1.375rem, 1.5vw, 1.75rem);
    max-width: 50vw;
  }

  /* Buttons - Large Desktop */
  .btn {
    padding: clamp(1rem, 1.2vw, 1.5rem) clamp(2rem, 2.5vw, 3rem);
    font-size: clamp(1rem, 0.9vw, 1.25rem);
  }

  /* Card Grid - Large Desktop (still 4 columns but larger cards) */
  .card-grid {
    gap: 2.5rem;
  }

  /* Evolea Card - Large Desktop */
  .evolea-card {
    padding: 3rem;
  }

  /* Floating Orbs - Large Desktop (much larger) */
  .orb {
    filter: blur(80px);
    opacity: 0.45;
  }

  .orb-mint {
    width: 350px;
    height: 350px;
  }

  .orb-gold {
    width: 280px;
    height: 280px;
  }

  .orb-magenta {
    width: 400px;
    height: 400px;
  }

  /* Wave Fade - Large Desktop */
  .wave-fade {
    height: clamp(120px, 12vh, 180px);
  }

  /* Prism Gradient - Large Desktop (more dramatic) */
  .hero-section::before {
    background-size: 120% 120%;
    animation: prismShift 25s ease infinite;
  }

  @keyframes prismShift {
    0%, 100% { background-position: 0% 50%; }
    25% { background-position: 50% 100%; }
    50% { background-position: 100% 50%; }
    75% { background-position: 50% 0%; }
  }

  /* Section Spacing - Large Desktop */
  .section {
    padding: clamp(5rem, 10vh, 10rem) var(--space-content-padding);
  }

  /* Two-Column Layout - Large Desktop */
  .two-col-layout {
    gap: clamp(4rem, 6vw, 8rem);
  }

  /* Footer - Large Desktop */
  .footer-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 4rem;
  }

  /* Team Grid - Large Desktop */
  .team-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 3rem;
  }

  /* Navigation - Large Desktop */
  .nav-link {
    font-size: 1rem;
    padding: 0.75rem 1.25rem;
  }

  /* Donate Button - Large Desktop (shimmer effect) */
  .nav-donate {
    background: linear-gradient(
      135deg,
      #E8B86D 0%,
      #FFE066 25%,
      #F5D54A 50%,
      #E8B86D 75%,
      #D4A056 100%
    );
    background-size: 200% 200%;
    animation: goldShimmer 4s ease infinite;
  }

  @keyframes goldShimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
}
```

---

## 6. Ultra-Wide Breakpoint Styles (2560px)

```css
/* ============================================
   ULTRA-WIDE: 2560px+ (2K/QHD displays)
   ============================================ */

@media (min-width: 2560px) {
  /* Container expansion */
  .container {
    max-width: var(--container-4xl);
  }

  /* Hero Section - Ultra-Wide */
  .hero-section {
    padding: 10rem 5rem;
  }

  .hero-headline {
    font-size: clamp(5rem, 5vw, 6rem);
  }

  .hero-subtitle {
    font-size: clamp(1.5rem, 1.5vw, 2rem);
  }

  /* Card Grid - Ultra-Wide (5 columns) */
  .card-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 3rem;
  }

  /* Evolea Card - Ultra-Wide */
  .evolea-card {
    padding: 3.5rem;
  }

  /* Floating Orbs - Ultra-Wide (dramatic scale) */
  .orb {
    filter: blur(100px);
  }

  .orb-mint {
    width: 450px;
    height: 450px;
  }

  .orb-gold {
    width: 350px;
    height: 350px;
  }

  .orb-magenta {
    width: 500px;
    height: 500px;
  }

  /* Wave Fade - Ultra-Wide */
  .wave-fade {
    height: clamp(150px, 15vh, 220px);
  }

  /* Section Spacing - Ultra-Wide */
  .section {
    padding: clamp(6rem, 12vh, 12rem) var(--space-content-padding);
  }

  /* Buttons - Ultra-Wide */
  .btn {
    padding: clamp(1.25rem, 1.5vw, 1.75rem) clamp(2.5rem, 3vw, 3.5rem);
    font-size: clamp(1.1rem, 1vw, 1.5rem);
  }

  /* Program Cards - Ultra-Wide (can show 5 if content allows) */
  .program-card-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  /* Team Grid - Ultra-Wide (5 columns) */
  .team-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 3.5rem;
  }

  /* Blog Grid - Ultra-Wide (3 columns) */
  .blog-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
  }
}
```

---

## 7. Component-Specific Responsive Patterns

### Mini Programs Cards

```css
/* Mini Garten, Mini Projekte, Mini Turnen program cards */
.mini-program-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(186, 83, 173, 0.08);
  transition: all 0.4s var(--ease-smooth);
}

.mini-program-card .program-icon {
  width: clamp(60px, 10vw, 100px);
  height: clamp(60px, 10vw, 100px);
  margin: 0 auto 1.5rem;
}

.mini-program-card h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  color: var(--evolea-purple);
  margin-bottom: 1rem;
}

@media (min-width: 1920px) {
  .mini-program-card {
    padding: 3rem;
  }

  .mini-program-card .program-icon {
    width: clamp(80px, 8vw, 120px);
    height: clamp(80px, 8vw, 120px);
  }
}
```

### Team Member Cards

```css
.team-member-card {
  text-align: center;
  padding: 1.5rem;
}

.team-member-photo {
  width: clamp(120px, 20vw, 200px);
  height: clamp(120px, 20vw, 200px);
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 30px rgba(186, 83, 173, 0.15);
  transition: transform 0.4s var(--ease-smooth);
}

.team-member-card:hover .team-member-photo {
  transform: scale(1.05);
}

.team-member-name {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(1.125rem, 1.5vw, 1.5rem);
  color: var(--evolea-purple);
  margin-bottom: 0.5rem;
}

.team-member-role {
  font-size: var(--font-small);
  color: var(--evolea-text-light);
}

@media (min-width: 1920px) {
  .team-member-photo {
    width: clamp(180px, 18vw, 250px);
    height: clamp(180px, 18vw, 250px);
  }
}
```

### Blog Post Cards

```css
.blog-post-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(186, 83, 173, 0.08);
  transition: all 0.4s var(--ease-smooth);
}

.blog-post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(186, 83, 173, 0.15);
}

.blog-post-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.blog-post-content {
  padding: clamp(1.5rem, 3vw, 2.5rem);
}

.blog-post-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  color: var(--evolea-purple);
  margin-bottom: 1rem;
}

.blog-post-excerpt {
  font-size: var(--font-body);
  color: var(--evolea-text-light);
  line-height: 1.7;
}

@media (min-width: 1920px) {
  .blog-post-content {
    padding: 2.5rem;
  }
}
```

### Donation CTA (Gold Button)

```css
.donation-cta {
  background: var(--evolea-gold);
  color: var(--evolea-dark);
  padding: clamp(0.875rem, 1vw, 1.25rem) clamp(1.75rem, 2vw, 2.5rem);
  border-radius: 100px;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: clamp(0.9375rem, 1vw, 1.125rem);
  box-shadow: 0 4px 15px rgba(232, 184, 109, 0.3);
  transition: all 0.3s var(--ease-smooth);
}

.donation-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(232, 184, 109, 0.4);
  background: #D4A056;
}

@media (min-width: 1920px) {
  .donation-cta {
    background: linear-gradient(
      135deg,
      #E8B86D 0%,
      #FFE066 25%,
      #F5D54A 50%,
      #E8B86D 75%,
      #D4A056 100%
    );
    background-size: 200% 200%;
    animation: goldShimmer 4s ease infinite;
  }
}
```

---

## 8. Animation and Interaction Scaling

```css
/* Hover effects scale with viewport */
@media (min-width: 1920px) {
  .evolea-card:hover {
    transform: translateY(-10px);
  }

  .blog-post-card:hover {
    transform: translateY(-10px);
  }

  /* Larger travel distance for animations */
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    25% {
      transform: translate(20px, -25px) scale(1.05);
    }
    50% {
      transform: translate(-15px, 20px) scale(0.95);
    }
    75% {
      transform: translate(25px, -15px) scale(1.02);
    }
  }
}

@media (min-width: 2560px) {
  /* Even larger animations on ultra-wide */
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    25% {
      transform: translate(30px, -35px) scale(1.08);
    }
    50% {
      transform: translate(-20px, 30px) scale(0.92);
    }
    75% {
      transform: translate(35px, -20px) scale(1.05);
    }
  }
}
```

---

## 9. Accessibility Considerations

```css
/* ============================================
   ACCESSIBILITY: ALL BREAKPOINTS
   ============================================ */

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .orb,
  .butterfly,
  .wave-layer {
    animation: none !important;
  }

  .evolea-card:hover,
  .blog-post-card:hover,
  .team-member-card:hover .team-member-photo {
    transform: none !important;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .evolea-card,
  .blog-post-card,
  .mini-program-card {
    border: 2px solid currentColor;
  }

  .btn {
    border: 2px solid currentColor;
  }

  /* Ensure text remains visible */
  .hero-headline,
  .hero-subtitle {
    text-shadow:
      0 0 10px rgba(0, 0, 0, 0.9),
      0 2px 4px rgba(0, 0, 0, 0.8);
  }
}

/* Touch Target Scaling */
@media (min-width: 1920px) and (pointer: fine) {
  .btn,
  .nav-link,
  .mobile-nav-link {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Focus States */
.btn:focus-visible,
.nav-link:focus-visible,
.evolea-card:focus-visible {
  outline: 3px solid var(--evolea-magenta);
  outline-offset: 4px;
}
```

---

## 10. Implementation Order

### Phase 1: Foundation (Global Variables)
1. Add all CSS variables to `src/styles/global.css`
2. Test that variables are accessible across components
3. No visual changes yet - just foundation

### Phase 2: Mobile Base Styles
1. Implement mobile-first base styles (375px)
2. Test on actual mobile devices (iPhone SE, iPhone 14)
3. Verify touch targets meet 44px minimum

### Phase 3: Tablet Breakpoint (768px)
1. Add tablet media query styles
2. Test grid layouts (2-column grids)
3. Verify navigation behavior

### Phase 4: Desktop Breakpoint (1024px-1440px)
1. Add desktop media query styles
2. Test full navigation visibility
3. Verify 3-4 column grids
4. Test hover states

### Phase 5: Large Desktop (1920px)
1. Add large desktop media query styles
2. Test orb and animation scaling
3. Verify container max-widths
4. Test typography scaling

### Phase 6: Ultra-Wide (2560px)
1. Add ultra-wide media query styles
2. Test 5-column grids
3. Verify no excessive stretching
4. Test animation performance

### Phase 7: Component-Specific Patterns
1. Implement program cards
2. Implement team cards
3. Implement blog cards
4. Implement donation CTAs

### Phase 8: Accessibility
1. Add reduced motion support
2. Add high contrast support
3. Verify touch targets at all breakpoints
4. Test keyboard navigation
5. Verify focus states

---

## Quick Reference

### Container Widths
| Breakpoint | Max-Width | Usage |
|------------|-----------|-------|
| Mobile | 100vw | Full width with padding |
| Tablet | 100vw | Full width with padding |
| Desktop | 1440px | Standard container |
| Large Desktop | 1600px | Expanded container |
| Ultra-Wide | 1800px | Maximum container |

### Typography Scale (Headline)
| Breakpoint | Font Size |
|------------|-----------|
| Mobile | 2rem-2.5rem (32-40px) |
| Tablet | 2.5rem-3.5rem (40-56px) |
| Desktop | 3rem-4rem (48-64px) |
| Large Desktop | 4rem-5.5rem (64-88px) |
| Ultra-Wide | 5rem-6rem (80-96px) |

### Card Grid Columns
| Breakpoint | Columns |
|------------|---------|
| Mobile | 1 |
| Tablet | 2 |
| Desktop | 3-4 |
| Large Desktop | 4 |
| Ultra-Wide | 4-5 |

---

## Files to Modify

1. **`src/styles/global.css`**
   - Add all CSS variables
   - Add base mobile styles
   - Add global accessibility styles

2. **Component-specific Astro files** (as needed)
   - Hero sections
   - Card grids
   - Navigation
   - Team sections
   - Blog layouts

---

*Document prepared for the EVOLEA website responsive breakpoint implementation initiative.*
*Always adhere to EVOLEA Brand Guide v3.0 requirements.*
