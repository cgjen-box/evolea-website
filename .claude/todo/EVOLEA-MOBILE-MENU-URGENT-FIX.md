# EVOLEA - URGENT Mobile Menu Fix

## THE PROBLEM (Still Happening)
The mobile menu is transparent. ALL page content shows through:
- "Unsere Angebote" visible behind menu
- Cards (Mini Garten) showing through
- Text overlapping everywhere
- Completely unusable

## THE FIX - Copy This Exactly

### Step 1: Find the mobile menu CSS file
Look for files like:
- `mobile-menu.css`
- `navigation.css`
- `header.css`
- `global.css`
- Or inline styles in layout files

### Step 2: Add/Replace with this CSS

```css
/* ============================================
   MOBILE MENU - BULLETPROOF FIX
   Copy this entire block
   ============================================ */

/* Target ALL possible mobile menu selectors */
.mobile-menu,
.mobile-nav,
.nav-mobile,
.menu-mobile,
.mobile-navigation,
.hamburger-menu,
.slide-menu,
.drawer-menu,
.off-canvas-menu,
[data-mobile-menu],
[class*="mobile-menu"],
[class*="mobile-nav"],
#mobile-menu,
#mobile-nav,
nav.mobile,
.nav.mobile {
  /* CRITICAL: Solid background - NOT transparent */
  background: #FFFFFF !important;
  
  /* Alternative: Soft gradient background */
  /* background: linear-gradient(180deg, #FFFFFF 0%, #FBF7FC 50%, #F5EBF7 100%) !important; */
  
  /* Cover entire screen */
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  height: 100vh !important;
  height: 100dvh !important; /* Dynamic viewport height for mobile */
  
  /* Above everything */
  z-index: 99999 !important;
  
  /* Scrollable if content is long */
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch !important;
  
  /* No transparency */
  opacity: 1 !important;
}

/* When menu is open, ensure visibility */
.mobile-menu.open,
.mobile-menu.is-open,
.mobile-menu.active,
.mobile-menu[aria-expanded="true"],
.mobile-nav.open,
.mobile-nav.is-open,
.mobile-nav.active {
  background: #FFFFFF !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Menu inner container */
.mobile-menu-inner,
.mobile-menu-content,
.mobile-nav-inner,
.mobile-menu > div,
.mobile-nav > div {
  background: #FFFFFF !important;
  min-height: 100% !important;
  padding: 2rem !important;
  padding-top: 5rem !important; /* Space for close button */
}

/* CRITICAL: Hide page content when menu is open */
body.menu-open,
body.mobile-menu-open,
body.nav-open,
body.has-mobile-menu,
html.menu-open {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
}

/* Close button - must be visible */
.mobile-menu-close,
.menu-close,
.close-menu,
.nav-close,
[class*="close"],
.mobile-menu button[aria-label*="close"],
.mobile-menu button[aria-label*="Close"],
.mobile-menu .close {
  position: absolute !important;
  top: 1rem !important;
  right: 1rem !important;
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: rgba(186, 83, 173, 0.1) !important;
  border: none !important;
  border-radius: 50% !important;
  cursor: pointer !important;
  z-index: 100000 !important;
}

/* Navigation links */
.mobile-menu a,
.mobile-nav a,
.mobile-menu-links a,
.mobile-nav-links a {
  display: block !important;
  padding: 1rem 0 !important;
  font-family: 'Fredoka', sans-serif !important;
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  color: #2D2A32 !important;
  text-decoration: none !important;
  border-bottom: 1px solid rgba(186, 83, 173, 0.1) !important;
  background: transparent !important;
}

/* Remove any backdrop/overlay transparency */
.mobile-menu::before,
.mobile-menu::after,
.mobile-nav::before,
.mobile-nav::after,
.menu-overlay,
.nav-overlay,
.menu-backdrop {
  background: #FFFFFF !important;
  opacity: 1 !important;
}

/* ============================================
   END MOBILE MENU FIX
   ============================================ */
```

### Step 3: Add JavaScript (if menu still transparent)

The menu might be using JavaScript to add transparency. Add this:

```javascript
// Force solid background on mobile menu
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenu = document.querySelector('.mobile-menu, .mobile-nav, [class*="mobile-menu"]');
  
  if (mobileMenu) {
    // Force styles
    mobileMenu.style.setProperty('background', '#FFFFFF', 'important');
    mobileMenu.style.setProperty('background-color', '#FFFFFF', 'important');
    
    // Watch for style changes and override
    const observer = new MutationObserver(function() {
      mobileMenu.style.setProperty('background', '#FFFFFF', 'important');
    });
    
    observer.observe(mobileMenu, { attributes: true, attributeFilter: ['style', 'class'] });
  }
});

// Lock body scroll when menu opens
function lockScroll() {
  document.body.classList.add('menu-open');
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
}

function unlockScroll() {
  document.body.classList.remove('menu-open');
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
}
```

### Step 4: Check for Astro/Framework-specific issues

If using Astro, the mobile menu might be in:
- `src/components/Header.astro`
- `src/components/MobileMenu.astro`
- `src/components/Navigation.astro`

Look for inline styles like:
```html
<!-- BAD - Remove these -->
<div class="mobile-menu" style="background: transparent">
<div class="mobile-menu" style="background: rgba(255,255,255,0.5)">
<div class="mobile-menu" style="backdrop-filter: blur(10px)">
```

Replace with:
```html
<!-- GOOD -->
<div class="mobile-menu" style="background: #FFFFFF">
```

---

## DEBUGGING CHECKLIST

If menu is still transparent after applying CSS:

1. **Check for inline styles**
   - Open DevTools (F12)
   - Inspect the mobile menu element
   - Look for `style="..."` attribute overriding CSS
   - Remove any `background: transparent` or `rgba` values

2. **Check CSS specificity**
   - Your fix might be overridden by more specific selectors
   - Add `!important` to all properties
   - Or increase specificity: `body .mobile-menu { ... }`

3. **Check for JavaScript overrides**
   - Some JS might be setting `background: transparent`
   - Search codebase for "transparent" and "rgba"
   - Add the MutationObserver fix above

4. **Check the actual class name**
   - In DevTools, find the exact class name of the menu
   - It might be something like `mobile-nav-drawer` or `slide-out-menu`
   - Add that exact class to the CSS fix

---

## EXACT SELECTOR FINDER

Run this in browser console to find the menu:

```javascript
// Find all fixed/absolute positioned elements (likely menu candidates)
document.querySelectorAll('*').forEach(el => {
  const style = getComputedStyle(el);
  if (style.position === 'fixed' && style.zIndex > 100) {
    console.log('Possible menu:', el.className, el);
  }
});
```

Then add that exact selector to the CSS fix.

---

## NUCLEAR OPTION

If nothing else works, add this to the very end of your main CSS file:

```css
/* NUCLEAR: Force all fixed overlays to be opaque */
body.menu-open *[style*="position: fixed"],
body.menu-open *[style*="position:fixed"],
[class*="mobile"][class*="menu"],
[class*="mobile"][class*="nav"],
[class*="drawer"],
[class*="slide"] {
  background-color: #FFFFFF !important;
  background: #FFFFFF !important;
}

/* Hide EVERYTHING behind menu */
body.menu-open main,
body.menu-open .main-content,
body.menu-open section,
body.menu-open .hero,
body.menu-open .page-content {
  visibility: hidden !important;
}
```

---

## FOR CLAUDE CODE

```
URGENT FIX: Mobile menu is still transparent. Page content shows through.

THE PROBLEM:
When mobile menu opens, you can see the entire page behind it:
- "Unsere Angebote" section visible
- Cards showing through
- All text overlapping

EXACT FIX NEEDED:

1. Find the mobile menu component/CSS (likely in Header.astro or similar)

2. Add these styles to the mobile menu container:
   background: #FFFFFF !important;
   position: fixed !important;
   inset: 0 !important;
   z-index: 99999 !important;
   width: 100% !important;
   height: 100vh !important;

3. Add to body when menu is open:
   body.menu-open {
     overflow: hidden !important;
     position: fixed !important;
     width: 100% !important;
   }

4. Remove ANY of these from mobile menu:
   - background: transparent
   - background: rgba(...)
   - backdrop-filter: blur(...)
   - opacity less than 1

5. Check for inline styles overriding CSS

The menu MUST be completely opaque white. NO page content should show through.
```
