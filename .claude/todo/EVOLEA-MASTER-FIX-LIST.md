# EVOLEA - Master Fix List

## 🔴 CRITICAL FIXES

### 1. Brand Page - Logo on Prism Gradient Not Visible
**Location:** /brand/ - Logo section "White on Prism Gradient"  
**Issue:** White logo disappears on light parts of gradient

**Fix:**
```css
/* Logo on prism gradient needs shadow/glow */
.logo-prism-demo {
  position: relative;
}

.logo-prism-demo .logo-text {
  color: #FFFFFF;
  text-shadow: 
    0 0 20px rgba(93, 46, 140, 0.6),
    0 0 40px rgba(186, 83, 173, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.15);
  -webkit-text-stroke: 0.5px rgba(186, 83, 173, 0.2);
}

.logo-prism-demo .butterfly {
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8));
}

/* Or use outline version */
.logo-prism-demo.outline .logo-text {
  color: transparent;
  -webkit-text-stroke: 2px #FFFFFF;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
}
```

---

### 2. Brand Page - Logo on Dark Background Not Styled
**Location:** /brand/ - Logo section "On Dark Background"  
**Issue:** Shows plain text, not the rainbow gradient logo

**Fix:**
```css
.logo-dark-demo {
  background: #1A1A2E;
  padding: 3rem;
  border-radius: 16px;
}

.logo-dark-demo .logo-text {
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  background: linear-gradient(
    90deg,
    #7BEDD5 0%,      /* Mint */
    #A8F0E0 15%,
    #FFE066 30%,     /* Gold */
    #FF9ECC 50%,     /* Pink */
    #E97BF1 70%,     /* Magenta */
    #CD87F8 85%,     /* Lavender */
    #B56FE8 100%     /* Purple */
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-dark-demo .butterfly path {
  /* Use gradient fills matching text */
}
```

---

### 3. Mobile Navigation - Still Transparent
**Location:** All pages on mobile  
**Issue:** Menu shows page content through it

**Fix:**
```css
/* NUCLEAR FIX - Add to global CSS */
.mobile-menu,
.mobile-nav,
[class*="mobile-menu"],
[class*="mobile-nav"],
nav[class*="mobile"],
.nav-mobile,
.menu-mobile,
#mobile-menu {
  background: #FFFFFF !important;
  background-color: #FFFFFF !important;
  position: fixed !important;
  inset: 0 !important;
  z-index: 99999 !important;
}

body.menu-open,
body.mobile-menu-open,
html.menu-open {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
}

/* Hide content behind */
body.menu-open main,
body.menu-open section:not(.mobile-menu),
body.menu-open .hero,
body.menu-open .page-content {
  visibility: hidden !important;
}
```

**Also check for:**
- Inline `style="background: transparent"` in HTML
- JavaScript setting background dynamically
- Framework (Astro) component with wrong styles

---

### 4. Brand Page - Still Using Emojis
**Location:** /brand/ - Brand Philosophy section  
**Issue:** Using 🌈 🦋 ⚡ ✨ instead of SVG icons

**Current:**
```
🌈 Spectrum
🦋 Transformation  
⚡ Energy
```

**Fix - Replace with SVGs:**
```html
<!-- Spectrum icon -->
<svg viewBox="0 0 40 40" fill="none">
  <path d="M5 35 Q20 5 35 35" stroke="url(#rainbow)" stroke-width="4" fill="none"/>
  <defs>
    <linearGradient id="rainbow">
      <stop offset="0%" stop-color="#7BEDD5"/>
      <stop offset="50%" stop-color="#FFE066"/>
      <stop offset="100%" stop-color="#CD87F8"/>
    </linearGradient>
  </defs>
</svg>

<!-- Transformation icon (butterfly) -->
<svg viewBox="0 0 40 40"><!-- Official butterfly SVG --></svg>

<!-- Energy icon -->
<svg viewBox="0 0 40 40" fill="none">
  <path d="M22 5L10 22H18L16 35L30 18H22L22 5Z" fill="url(#energy)"/>
  <defs>
    <linearGradient id="energy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="100%" stop-color="#DD48E0"/>
    </linearGradient>
  </defs>
</svg>
```

---

## 🟠 HIGH PRIORITY FIXES

### 5. Blog Posts Missing Images
**Location:** /blog/ and individual posts  
**Issue:** Posts lack featured images, looks bare

**Fix:**
1. Add featured image field to blog post schema
2. Require image for each post
3. Add fallback gradient if no image:

```css
.blog-card-image {
  min-height: 200px;
  background: var(--gradient-prism);
  border-radius: 16px 16px 0 0;
}

.blog-card-image.has-image {
  background-size: cover;
  background-position: center;
}
```

**Image requirements:**
- Minimum 1200px wide
- Real photos preferred
- No AI-generated for main content

---

### 6. Imagery Inconsistency
**Location:** Throughout site  
**Issue:** Mix of AI images, real photos, illustrations without clear hierarchy

**Fix - Implement Imagery Rules:**

| Content Type | Image Type | Example |
|--------------|------------|---------|
| Hero sections | Real photo or video | Unsplash |
| Program cards | Real photos of activities | Stock photos |
| Team | Real headshots | Original photos |
| Blog featured | Real photos | Stock or original |
| Blog inline | Real or illustration | Depends on content |
| Icons | SVG only | Custom icons |
| Decorative | Illustrations/SVG | Butterflies, orbs |

**AI Images - Only allowed for:**
- Conceptual illustrations (clearly not trying to be real)
- Social media graphics
- Internal use

---

### 7. Desktop Navbar - Brand Not Strong Enough
**Location:** Header on all pages  
**Issue:** Logo too subtle, nav doesn't feel branded

**Fix:**
```css
.site-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(186, 83, 173, 0.08);
  padding: 0.75rem 2rem;
}

/* Stronger logo */
.header-logo .logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient-magenta);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Active page indicator with spectrum */
.nav-link.active {
  color: var(--evolea-magenta);
  position: relative;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-spectrum);
  border-radius: 2px;
}

/* CTA button in nav */
.nav-cta {
  background: var(--gradient-magenta);
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 100px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 10px rgba(186, 83, 173, 0.2);
}
```

---

### 8. Dark Section for Vision Statements
**Location:** Should be added to key pages  
**Issue:** Not being used despite being powerful

**Add to these pages:**
- Homepage (before CTA)
- Über uns (mission statement)
- Team (our values)

**Implementation:**
```html
<section class="vision-section">
  <div class="container">
    <div class="vision-logo">EVOLEA</div>
    <h2>Wo Kinder im Spektrum aufblühen</h2>
    <p>
      EVOLEA schafft Räume, damit sich Kinder im Spektrum entfalten 
      und ihren Weg glücklich und selbstbestimmt gehen können.
    </p>
  </div>
</section>
```

```css
.vision-section {
  background: linear-gradient(180deg, #1A1A2E 0%, #2D2A32 100%);
  padding: 8rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Subtle gradient orbs in background */
.vision-section::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(221, 72, 224, 0.15) 0%, transparent 70%);
  top: -200px;
  right: -200px;
}

.vision-logo {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(90deg, #7BEDD5, #FFE066, #FF9ECC, #E97BF1, #CD87F8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
  letter-spacing: 0.1em;
}

.vision-section h2 {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: #FFFFFF;
  margin-bottom: 1.5rem;
}

.vision-section p {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}
```

---

## 🟡 MEDIUM PRIORITY FIXES

### 9. Brand Page - Missing Interactive Examples
**Location:** /brand/  
**Issue:** Code blocks but no live rendered examples

**Fix:** Add live demos next to each code block showing the actual rendered result.

---

### 10. Brand Page - Component Cards Using Emojis
**Location:** /brand/ - Components section  
**Issue:** Cards show ✨ 🦋 instead of real icons

**Fix:** Replace with actual SVG icon components.

---

### 11. Team Photos Inconsistent
**Location:** /team/ and homepage team section  
**Issue:** Different crop ratios, some not circular

**Fix:**
```css
.team-photo {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 8px 30px rgba(186, 83, 173, 0.2);
}
```

---

### 12. WhatsApp Placeholder Link
**Location:** Contact section  
**Issue:** `https://chat.whatsapp.com/your-group-link`

**Fix:** Replace with actual link or remove.

---

### 13. Language Switcher Confusion
**Location:** Header  
**Issue:** Shows "Current language: English" on German pages

**Fix:** Show only the alternate language option:
- On German page: Show "EN"
- On English page: Show "DE"

---

## 🟢 POLISH FIXES

### 14. Add Floating Butterflies to Brand Page
Decorate the brand guide page itself with subtle floating butterflies.

### 15. Add Copy Button to Code Blocks
Make it easy to copy CSS/code from brand guide.

### 16. Add Dark Mode Toggle to Brand Guide
Show how components look in dark mode.

### 17. Add Animation Examples
Show hover states, transitions, scroll animations.

---

## 📋 COMPARISON: evolea.ch vs GitHub Pages

| Element | evolea.ch | GitHub Pages | Winner | Action |
|---------|-----------|--------------|--------|--------|
| Hero | Video background | Static gradient | evolea.ch | Add video support |
| Photos | Real stock photos | Some AI mixed | evolea.ch | Use only real photos |
| Team | Consistent circles | Inconsistent | evolea.ch | Standardize |
| Programs | Image cards | Gradient overlay | Tie | Keep current approach |
| Navigation | Simple, clean | More features | GitHub | Keep, fix mobile |
| Blog | Has images | Missing images | evolea.ch | Add required images |
| Mobile menu | Works | Broken | evolea.ch | Fix urgently |
| Brand page | None | Exists | GitHub | Improve it |
| Colors | Same | Same | Tie | - |
| Dark sections | Not used | Not used | Tie | Add to both |

---

## 🚀 IMPLEMENTATION ORDER

### Day 1 (Critical)
1. Fix mobile menu transparency
2. Fix brand page logo demos
3. Remove emojis from brand page

### Day 2 (High Priority)
4. Add dark vision section
5. Improve navbar branding
6. Add blog featured images

### Day 3 (Medium)
7. Standardize team photos
8. Fix language switcher
9. Add imagery guidelines to brand page

### Day 4 (Polish)
10. Add interactive examples to brand guide
11. Add copy buttons to code
12. Final review and testing

---

## 📝 INSTRUCTION FOR CLAUDE CODE

```
MASTER FIX LIST - Execute in order:

1. MOBILE MENU (URGENT):
   - Add `background: #FFFFFF !important` to mobile menu
   - Add `body.menu-open { overflow: hidden; position: fixed; }`
   - Remove any `background: transparent` or `rgba` values

2. BRAND PAGE LOGO DEMOS:
   - "White on Prism Gradient": Add text-shadow and glow
   - "On Dark Background": Use rainbow gradient text
   - Both need actual styled renders, not placeholder text

3. REMOVE ALL EMOJIS FROM BRAND PAGE:
   - Replace 🌈 🦋 ⚡ ✨ with SVG icons
   - Use brand gradient colors in SVGs

4. ADD DARK VISION SECTION:
   - Add to homepage before CTA
   - Background: #1A1A2E to #2D2A32
   - Rainbow gradient logo text
   - White headline, 80% white subtext

5. ENHANCE NAVBAR:
   - Gradient logo text
   - Spectrum underline on active link
   - Gradient CTA button

6. BLOG IMAGES:
   - Add featured image requirement
   - Add gradient fallback if no image
   - Minimum 1200px wide

7. TEAM PHOTOS:
   - All 180x180px
   - All border-radius: 50%
   - Consistent shadow

Apply brand guide v3.0 to all changes.
```
