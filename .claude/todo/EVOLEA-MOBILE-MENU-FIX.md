# EVOLEA - Mobile Menu Fix

## The Problem
The mobile menu overlay is transparent, causing:
- Hero content visible behind menu items
- Text overlapping ("Team" + "Wo Kinder im Spektrum...")
- Buttons from hero showing through
- Confusing, unreadable interface

## The Solution
Solid/frosted background that completely covers the page content.

---

## CSS Fix

```css
/* Mobile Menu Overlay - Complete Fix */
.mobile-menu,
.mobile-nav,
.nav-overlay,
[class*="mobile-menu"],
[class*="nav-mobile"] {
  position: fixed;
  inset: 0;
  z-index: 9999;
  
  /* SOLID BACKGROUND - Option A (Clean) */
  background: linear-gradient(
    180deg,
    #FFFFFF 0%,
    #FBF7FC 50%,
    #F5EBF7 100%
  );
  
  /* OR FROSTED GLASS - Option B (Premium) */
  /*
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  */
  
  /* OR BRAND GRADIENT - Option C (Bold) */
  /*
  background: linear-gradient(
    180deg,
    #FFFBF7 0%,
    #F5E6F5 30%,
    #E9D5F5 60%,
    #CD87F8 100%
  );
  */
  
  /* Ensure it covers everything */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Menu Container */
.mobile-menu-inner,
.mobile-nav-content {
  padding: 2rem;
  padding-top: 6rem; /* Space for close button */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Close Button */
.mobile-menu-close,
.menu-close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(221, 72, 224, 0.1);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  z-index: 10000;
}

.mobile-menu-close svg,
.menu-close-btn svg {
  width: 24px;
  height: 24px;
  color: var(--evolea-purple);
}

/* Logo in Menu */
.mobile-menu .logo,
.mobile-nav .logo {
  margin-bottom: 3rem;
}

.mobile-menu .logo-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--evolea-text);
}

/* Navigation Links */
.mobile-menu-links,
.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-menu-links a,
.mobile-nav-links a {
  display: block;
  padding: 1rem 0;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--evolea-text);
  text-decoration: none;
  border-bottom: 1px solid rgba(186, 83, 173, 0.1);
  transition: all 0.3s ease;
}

.mobile-menu-links a:hover,
.mobile-nav-links a:hover,
.mobile-menu-links a:active,
.mobile-nav-links a:active {
  color: var(--evolea-magenta);
  padding-left: 0.5rem;
}

/* Active Page Indicator */
.mobile-menu-links a.active,
.mobile-nav-links a[aria-current="page"] {
  color: var(--evolea-magenta);
}

/* Language Switcher */
.mobile-menu .language-switch,
.mobile-nav .language-switch {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(186, 83, 173, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-switch span {
  font-size: 0.9rem;
  color: var(--evolea-text-light);
}

.language-switch a {
  padding: 0.5rem 1rem;
  border-radius: 100px;
  font-weight: 500;
  text-decoration: none;
}

.language-switch a.active {
  background: var(--evolea-magenta);
  color: white;
}

.language-switch a:not(.active) {
  color: var(--evolea-text);
  border: 1px solid rgba(186, 83, 173, 0.2);
}

/* CTA Button */
.mobile-menu .cta-button,
.mobile-nav .cta-button {
  margin-top: auto;
  padding-top: 2rem;
}

.mobile-menu .cta-button a,
.mobile-nav .cta-button a {
  display: block;
  width: 100%;
  padding: 1.25rem 2rem;
  background: var(--gradient-magenta);
  color: white;
  text-align: center;
  border-radius: 100px;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(186, 83, 173, 0.3);
}

/* Decorative Elements */
.mobile-menu .butterfly-decoration {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  opacity: 0.2;
}

/* Animation */
.mobile-menu {
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu.is-open,
.mobile-menu.open,
.mobile-menu[aria-hidden="false"] {
  transform: translateX(0);
}

/* Staggered link animation */
.mobile-menu.is-open .mobile-menu-links a {
  animation: slideIn 0.4s ease forwards;
  opacity: 0;
}

.mobile-menu.is-open .mobile-menu-links a:nth-child(1) { animation-delay: 0.1s; }
.mobile-menu.is-open .mobile-menu-links a:nth-child(2) { animation-delay: 0.15s; }
.mobile-menu.is-open .mobile-menu-links a:nth-child(3) { animation-delay: 0.2s; }
.mobile-menu.is-open .mobile-menu-links a:nth-child(4) { animation-delay: 0.25s; }
.mobile-menu.is-open .mobile-menu-links a:nth-child(5) { animation-delay: 0.3s; }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Prevent body scroll when menu is open */
body.menu-open,
body.mobile-menu-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
}
```

---

## HTML Structure (Reference)

```html
<!-- Mobile Menu -->
<div class="mobile-menu" id="mobile-menu" aria-hidden="true">
  <div class="mobile-menu-inner">
    
    <!-- Close Button -->
    <button class="mobile-menu-close" aria-label="Menü schliessen">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 6L18 18M6 18L18 6"/>
      </svg>
    </button>
    
    <!-- Logo -->
    <a href="/" class="logo">
      <span class="logo-text">EVOLEA</span>
      <svg class="logo-butterfly">...</svg>
    </a>
    
    <!-- Navigation Links -->
    <nav class="mobile-menu-links">
      <a href="/angebote/">Angebote</a>
      <a href="/ueber-uns/">Über uns</a>
      <a href="/team/">Team</a>
      <a href="/blog/">Blog</a>
      <a href="/kontakt/">Kontakt</a>
    </nav>
    
    <!-- Language Switcher -->
    <div class="language-switch">
      <span>Sprache</span>
      <a href="/de/" class="active">DE</a>
      <a href="/en/">EN</a>
    </div>
    
    <!-- CTA Button -->
    <div class="cta-button">
      <a href="/kontakt/">Jetzt Kontakt aufnehmen →</a>
    </div>
    
    <!-- Decorative -->
    <svg class="butterfly-decoration">...</svg>
    
  </div>
</div>
```

---

## JavaScript Fix

```javascript
// Ensure proper menu toggle behavior
const mobileMenu = document.getElementById('mobile-menu');
const menuToggle = document.querySelector('.menu-toggle, .hamburger');
const menuClose = document.querySelector('.mobile-menu-close');
const body = document.body;

function openMenu() {
  mobileMenu.classList.add('is-open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle?.addEventListener('click', openMenu);
menuClose?.addEventListener('click', closeMenu);

// Close on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
    closeMenu();
  }
});

// Close when clicking a link
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});
```

---

## Quick Fix Checklist

- [ ] Menu has solid/opaque background (no page content showing through)
- [ ] Menu covers entire viewport (position: fixed, inset: 0)
- [ ] Z-index is high enough (9999+)
- [ ] Body scroll is locked when menu is open
- [ ] Close button is visible and accessible (48x48px minimum)
- [ ] Links have enough padding for touch (44px+ height)
- [ ] Menu animates smoothly (slide in from right)
- [ ] Links have staggered fade-in animation
- [ ] Language switcher is clear
- [ ] CTA button stands out at bottom

---

## Three Style Options

### Option A: Clean White
```css
background: linear-gradient(180deg, #FFFFFF 0%, #FBF7FC 50%, #F5EBF7 100%);
```
Simple, clean, professional.

### Option B: Frosted Glass
```css
background: rgba(255, 255, 255, 0.92);
backdrop-filter: blur(20px);
```
Premium, modern, slight transparency.

### Option C: Brand Gradient
```css
background: linear-gradient(180deg, #FFFBF7 0%, #F5E6F5 40%, #E9D5F5 100%);
```
On-brand, colorful, distinctive.

I recommend **Option A or C** for maximum readability.

---

## Instruction for Claude Code

```
FIX MOBILE MENU:

The mobile menu is transparent and page content shows through it.

REQUIRED CHANGES:

1. Add solid background to mobile menu overlay:
   background: linear-gradient(180deg, #FFFFFF 0%, #FBF7FC 50%, #F5EBF7 100%);

2. Ensure menu covers entire screen:
   position: fixed;
   inset: 0;
   z-index: 9999;

3. Lock body scroll when menu is open:
   body.menu-open { overflow: hidden; position: fixed; width: 100%; }

4. Style menu links:
   - Font: Fredoka, 1.5rem, semibold
   - Color: #2D2A32
   - Padding: 1rem 0
   - Border-bottom: 1px solid rgba(186, 83, 173, 0.1)

5. Add slide-in animation from right

6. Add staggered fade-in for links

7. CTA button at bottom with magenta gradient

8. Close button: 48x48px, top-right, visible

NO page content should be visible behind the menu when it's open.
```
