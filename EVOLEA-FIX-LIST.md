# EVOLEA Website - Comprehensive Fix List

Generated: December 2024  
Based on: Live site audit, screenshots, brand guide comparison

---

## 🔴 CRITICAL (Fix Immediately)

### 1. Hero Section - Invisible Button
**Location:** Homepage hero  
**Issue:** "Kontakt aufnehmen" button is invisible/white-on-white  
**Screenshot:** Image 1 shows only "Angebote entdecken" button visible, second button missing  
**Fix:** 
```css
/* Option A: Outline style */
.btn-outline-white {
  background: transparent;
  color: var(--evolea-purple);
  border: 2px solid var(--evolea-purple);
}

/* Option B: Filled style */
.btn-secondary {
  background: white;
  color: var(--evolea-magenta);
}
```

### 2. Logo - Butterfly Covers "A"
**Location:** Header, Footer  
**Issue:** Using butterfly emoji 🦋 which overlaps/covers the "A" in EVOLEA, making it read "EVOLE 🦋"  
**Screenshot:** Image 3 shows "EVOLE" with butterfly emoji covering the A  
**Fix:** 
- Replace emoji with SVG butterfly
- Position butterfly AFTER the full "EVOLEA" text with proper spacing
- Use the official butterfly SVG from brand guide

### 3. Emoji Icons Throughout Site
**Location:** Angebote cards, Grundsätze section, Brand philosophy  
**Issue:** Using emojis instead of proper SVG icons  
**Found emojis:**
| Location | Emoji | Replace With |
|----------|-------|--------------|
| Mini Garten | 🌱 | Sprout SVG |
| Mini Projekte | 🎨 | Palette SVG |
| Mini Turnen | ⚽ | Ball SVG |
| Schulberatung | 🏫 | Building SVG |
| Evidenzbasiert | 📊 | Chart SVG |
| Individuell | 🎯 | Target SVG |
| Spielerisch | 🎮 | Gamepad SVG |
| Strukturiert | 📋 | Clipboard SVG |
| Ressourcenorientiert | 💎 | Diamond SVG |
| Familienzentriert | 👨‍👩‍👧 | Family SVG |
| Brand - Spectrum | 🌈 | Rainbow gradient SVG |
| Brand - Transformation | 🦋 | Official butterfly SVG |
| Brand - Energy | ⚡ | Lightning SVG |

**Fix:** Create or source SVG icons using brand colors (mint, magenta, purple gradients)

---

## 🟠 HIGH PRIORITY (Fix This Week)

### 4. Angebote Cards - Layout Issues
**Location:** "Unsere Angebote" section  
**Issue:** Cards appear misaligned, inconsistent sizing  
**Screenshot:** Image 2 shows cards stacked oddly with inconsistent widths  
**Fix:**
```css
.angebote-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.angebote-card {
  height: 100%; /* Equal heights */
  display: flex;
  flex-direction: column;
}
```

### 5. Card Image Placeholders
**Location:** Angebote cards  
**Issue:** Images showing broken paths or placeholders (`/images/programs/garden.jpg`)  
**From HTML:** `[![Kinder im Garten beim spielerischen Lernen](/images/programs/garden.jpg)`  
**Fix:** 
- Verify all images exist at correct paths
- Should be `/evolea-website/images/programs/garden.jpg` for GitHub Pages
- Add fallback background colors if images fail to load

### 6. Team Photos - Inconsistent Display
**Location:** Team section  
**Issue:** Photos likely have inconsistent dimensions/cropping  
**Fix:**
```css
.team-photo {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 50%; /* or 1rem for rounded square */
}
```

### 7. Spectrum Line Decoration
**Location:** "Unsere Angebote" section header  
**Issue:** Orange/coral line appears cut off or misaligned  
**Screenshot:** Image 2 shows horizontal line that looks incomplete  
**Fix:**
```css
.spectrum-line {
  width: 100%;
  max-width: 400px;
  height: 4px;
  background: var(--gradient-spectrum);
  border-radius: 2px;
}
```

---

## 🟡 MEDIUM PRIORITY (Fix This Month)

### 8. Button Styling Consistency
**Location:** Throughout site  
**Issue:** Multiple button styles that may not follow brand guide  
**Fix:** Standardize to these variants only:
- `.btn-primary` - Magenta gradient, white text
- `.btn-outline` - Transparent, magenta border/text
- `.btn-white` - White background, magenta text
- `.btn-prism` - Prism gradient background

### 9. Hero Background
**Location:** Homepage hero  
**Issue:** Gradient background with floating colored dots  
**Screenshot:** Image 1 shows soft pink/lavender gradient with colored orbs  
**Recommendation:** Ensure floating elements don't interfere with text readability. Consider:
```css
.hero-bg-orb {
  opacity: 0.4;
  filter: blur(40px);
  pointer-events: none;
}
```

### 10. Mobile Navigation
**Location:** Header  
**Issue:** Hamburger menu behavior unknown - needs testing  
**Fix:** Verify mobile menu:
- Opens/closes properly
- Logo visible and not cut off
- All links accessible
- Proper touch targets (min 44px)

### 11. Footer Logo
**Location:** Footer  
**Issue:** Same butterfly emoji issue as header  
**Fix:** Same as #2 - replace with SVG, ensure "A" visible

### 12. Language Switcher
**Location:** Header  
**Issue:** Shows "Current language: English" but site is in German  
**From HTML:** `[Current language:  English](/evolea-website/en/)`  
**Fix:** Update to show correct current language or fix link logic

---

## 🟢 LOW PRIORITY (Polish)

### 13. Hover States
**Location:** All interactive elements  
**Issue:** Verify all buttons/cards have proper hover feedback  
**Fix:**
```css
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-magenta);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}
```

### 14. Focus States (Accessibility)
**Location:** All interactive elements  
**Issue:** Need visible focus indicators for keyboard navigation  
**Fix:**
```css
:focus-visible {
  outline: 3px solid var(--evolea-magenta);
  outline-offset: 2px;
}
```

### 15. Loading States
**Location:** Images, videos  
**Issue:** Hero has video poster image - ensure smooth loading  
**Fix:**
```css
.hero-video {
  background: var(--evolea-cream);
}

img {
  background: var(--evolea-cream);
}
```

### 16. Scroll Indicator
**Location:** Hero section  
**Issue:** "Entdecken" text at bottom - could be enhanced  
**Fix:** Add animated scroll indicator with butterfly or chevron

### 17. WhatsApp Link
**Location:** Contact section  
**Issue:** Placeholder link `https://chat.whatsapp.com/your-group-link`  
**Fix:** Replace with actual WhatsApp group/chat link

### 18. Card "Mehr erfahren" Links
**Location:** Angebote cards  
**Issue:** Arrow styling and hover state  
**Fix:** Ensure consistent arrow icon and hover animation

---

## 📋 Page-by-Page Checklist

### Homepage (/)
- [ ] Hero button visibility
- [ ] Logo butterfly fix
- [ ] Angebote cards layout
- [ ] Angebote emoji icons → SVG
- [ ] Grundsätze emoji icons → SVG
- [ ] Team photo consistency
- [ ] Footer logo fix

### Angebote (/angebote/)
- [ ] All card images loading
- [ ] Grid layout consistency
- [ ] Icon replacements
- [ ] Hover states

### Team (/team/)
- [ ] Photo dimensions
- [ ] Photo cropping
- [ ] Card alignment

### Über uns (/ueber-uns/)
- [ ] 9 Grundsätze icons
- [ ] Content layout

### Kontakt (/kontakt/)
- [ ] Form styling
- [ ] WhatsApp link
- [ ] Map if applicable

### Brand Guide (/brand/)
- [ ] Emoji usage (even here!)
- [ ] Keep as internal reference

---

## 🛠️ Implementation Order

**Phase 1 - Critical (Day 1)**
1. Fix invisible hero button
2. Replace logo butterfly emoji with SVG
3. Replace all program icons (🌱⚽🎨🏫) with SVG

**Phase 2 - Layout (Day 2-3)**
4. Fix Angebote card grid
5. Fix image paths
6. Standardize team photos

**Phase 3 - Polish (Day 4-5)**
7. Replace remaining emojis
8. Add hover/focus states
9. Test mobile responsive
10. Fix minor issues

---

## 🔧 Quick Commands for Claude Code

```
"Fix the hero section: make the second button visible with outline style using var(--evolea-purple)"

"Replace the butterfly emoji in the logo with the official SVG butterfly from the brand guide. Position it after EVOLEA with 8px spacing."

"Replace all emoji icons in the Angebote cards with SVG icons. Use mint-to-purple gradients matching the brand."

"Fix the Angebote grid layout: use CSS grid with equal-height cards and 2rem gap"

"Standardize all team photos to 200x200px with object-fit: cover and border-radius: 50%"
```

---

## ✅ Definition of Done

A page is complete when:
- [ ] Zero emojis used (search: no emoji characters found)
- [ ] All buttons visible and clickable
- [ ] Logo "A" fully visible
- [ ] All images load correctly
- [ ] Cards aligned and equal height
- [ ] Hover states work
- [ ] Mobile responsive
- [ ] Passes contrast check (4.5:1)
