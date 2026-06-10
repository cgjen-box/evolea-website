# EVOLEA Responsive Breakpoint Testing Manual

**Document Version:** 1.0
**Created:** December 2024
**Status:** Ready for Use

## Overview

This manual provides comprehensive test cases for validating the responsive breakpoint implementation across the EVOLEA website. All tests ensure adherence to EVOLEA Brand Guide v3.0 and accessibility standards (WCAG 2.1 AA).

### Target Viewports

| Viewport | Width | Device Category | Common Devices | EVOLEA Priority |
|----------|-------|-----------------|----------------|-----------------|
| Mobile S | 375px | Mobile | iPhone SE, iPhone 12/13 Mini | **Critical** |
| Mobile L | 428px | Mobile | iPhone 14 Pro Max | High |
| Tablet | 768px | Tablet | iPad Mini, iPad | **Critical** |
| Tablet L | 1024px | Tablet | iPad Pro 11" | High |
| Desktop | 1440px | Desktop | MacBook Pro 14", Standard monitors | **Critical** |
| Desktop L | 1920px | Large Desktop | Full HD monitors, iMac 27" | High |
| Desktop XL | 2560px | Ultra-wide | QHD monitors, ultra-wide displays | Medium |
| 4K | 3840px | 4K UHD | 4K monitors | Low |

### Testing Tools

- **Chrome DevTools** - Device Mode (Ctrl+Shift+M / Cmd+Shift+M)
- **Firefox** - Responsive Design Mode
- **Real Devices** - Always test on actual devices when possible
- **Lighthouse** - Performance and accessibility metrics
- **Website Review Skill** - Automated visual inspection

### Pass/Fail Criteria

- **Pass**: Component meets all expected results and brand requirements
- **Partial**: Component mostly works but has minor issues (document findings)
- **Fail**: Component does not meet expected results

---

## EVOLEA Brand Requirements Checklist

Before testing individual components, verify these brand requirements at **every** breakpoint:

### Brand Commandments Testing

- [ ] **NO emojis anywhere** - Only SVG icons used
- [ ] **Solid mobile menu background** - Never transparent
- [ ] **Text shadows on gradients** - All gradient text has shadows
- [ ] **Real photos only** - No AI images in hero/team/programs
- [ ] **Butterfly spacing** - Never covers the "A" in EVOLEA
- [ ] **Bold, vibrant colors** - No muted/flat colors
- [ ] **Prism gradient hero** - Every page has gradient hero
- [ ] **Page closer present** - Before every footer
- [ ] **Fredoka headlines** - All headlines use Fredoka font
- [ ] **Mobile tested** - All breakpoints tested before deployment

---

## Test Cases

---

## Mobile (375px) - Critical Priority

### EV-BP-M001: Hero Section Mobile Layout
**Preconditions:** Viewport set to 375x812
**Steps:**
1. Navigate to homepage
2. Inspect hero section
3. Verify prism gradient visibility
4. Check floating orbs visibility
5. Verify text readability

**Expected Results:**
- Hero height minimum 60vh
- Prism gradient visible and vibrant (not washed out)
- Floating orbs visible but subtle (opacity ~0.35)
- Hero headline font size 2rem-2.5rem (32-40px)
- Text shadow visible on white text
- No horizontal overflow
- Touch targets minimum 44px

**Brand Requirements:**
- ✓ Prism gradient present
- ✓ Text has shadows
- ✓ No emojis

---

### EV-BP-M002: Mobile Navigation Menu
**Preconditions:** Viewport set to 375x812
**Steps:**
1. Navigate to any page
2. Tap mobile menu button
3. Verify menu opens
4. Check menu background
5. Test all navigation links

**Expected Results:**
- Menu opens with slide animation
- Background is **solid white or cream** (NEVER transparent)
- All links have minimum 44px touch targets
- Links use Fredoka font for headings
- Donate button visible with gold color (#E8B86D)
- Menu closes when link clicked

**Brand Requirements:**
- ✓ Solid background (NOT transparent)
- ✓ Touch targets >= 44px
- ✓ No emojis in navigation

---

### EV-BP-M003: Mini Program Cards Mobile
**Preconditions:** Viewport set to 375x812
**Steps:**
1. Navigate to /angebote/ page
2. Scroll to Mini Garten, Mini Projekte, Mini Turnen cards
3. Verify card layout
4. Check icon sizing
5. Verify touch targets

**Expected Results:**
- Cards stack vertically (1 column)
- Card padding 1.5rem minimum
- Program icons 60-100px
- Card titles use Fredoka font
- Spectrum accent bar appears on hover (if hoverable)
- Each card minimum 44px touch target height

**Brand Requirements:**
- ✓ Fredoka font for card titles
- ✓ No emojis (SVG icons only)
- ✓ Cards have brand gradient accents

---

### EV-BP-M004: Mobile Typography Readability
**Preconditions:** Viewport set to 375x812
**Steps:**
1. Navigate through all pages
2. Check headline sizes
3. Verify body text readability
4. Check line lengths
5. Verify spacing

**Expected Results:**
- H1: 2rem-2.5rem (Fredoka Bold)
- H2: 1.5rem-2rem (Fredoka SemiBold)
- Body: 1rem-1.125rem (Poppins Regular)
- Line height body text: 1.7
- Maximum 45-50 characters per line on mobile
- Text color contrast minimum 4.5:1

**Brand Requirements:**
- ✓ Fredoka for all headlines
- ✓ Poppins for body text
- ✓ No flat/muted colors

---

### EV-BP-M005: Floating Elements Mobile Performance
**Preconditions:** Viewport set to 375x812
**Steps:**
1. Navigate to hero section
2. Observe floating orbs animation
3. Check for butterflies if present
4. Monitor performance
5. Test reduced motion preference

**Expected Results:**
- Orbs animate smoothly (60fps)
- Orbs are smaller on mobile (150-180px)
- Butterflies present but subtle
- No performance lag during scroll
- Animations stop when `prefers-reduced-motion: reduce`

**Brand Requirements:**
- ✓ Orbs use EVOLEA brand colors
- ✓ Animations respect accessibility

---

### EV-BP-M006: Mobile Container Padding
**Preconditions:** Viewport set to 375x812
**Steps:**
1. Navigate through all sections
2. Measure left/right padding
3. Check for content touching edges
4. Verify no horizontal scroll

**Expected Results:**
- Consistent padding 1.5rem (24px) minimum
- Content never touches viewport edges
- No horizontal scrollbar appears
- Images scale within container

**Brand Requirements:**
- ✓ Cream background color visible
- ✓ Proper whitespace maintained

---

### EV-BP-M007: Mobile Wave Fade Effect
**Preconditions:** Viewport set to 375x812
**Steps:**
1. Navigate to page with wave fade (hero sections)
2. Verify wave fade visible at bottom of gradient
3. Check wave animation
4. Verify colors match brand

**Expected Results:**
- Wave fade height 80-100px
- Wave colors: purple/lavender gradient
- Wave animates smoothly (25s duration)
- No stuttering or jank

**Brand Requirements:**
- ✓ Wave uses EVOLEA purple/lavender colors
- ✓ Wave animation respects reduced motion

---

### EV-BP-M008: Mobile Footer Layout
**Preconditions:** Viewport set to 375x812
**Steps:**
1. Scroll to footer
2. Verify layout stacking
3. Check link spacing
4. Test donation CTA visibility

**Expected Results:**
- Footer links stack vertically
- Footer sections clearly separated
- FooterDonationCTA visible (if not on donate page)
- Social icons minimum 44px touch targets
- Copyright text readable

**Brand Requirements:**
- ✓ Gold donation CTA present (unless donate page)
- ✓ Footer gradient or page closer present

---

### EV-BP-M009: Mobile Form Inputs
**Preconditions:** Viewport set to 375x812
**Steps:**
1. Navigate to /kontakt/ page
2. Test form inputs
3. Verify input sizing
4. Check button sizing

**Expected Results:**
- Input fields minimum 44px height
- Input text minimum 16px (prevents zoom on iOS)
- Submit button minimum 44px height
- Labels clearly associated with inputs
- Form validates appropriately

**Brand Requirements:**
- ✓ Form buttons use EVOLEA gradient
- ✓ Error messages use EVOLEA colors

---

### EV-BP-M010: Mobile Image Loading
**Preconditions:** Viewport set to 375x812, throttle to 3G
**Steps:**
1. Navigate to image-heavy pages
2. Monitor image loading
3. Check for lazy loading
4. Verify image quality

**Expected Results:**
- Images lazy load as user scrolls
- Proper image sizes loaded for mobile
- No broken images
- Images have border-radius: 24px (EVOLEA brand)
- Alt text present on all images

**Brand Requirements:**
- ✓ Real photos used (not AI for real content)
- ✓ Images use EVOLEA border radius

---

## Tablet (768px) - Critical Priority

### EV-BP-T001: Hero Section Tablet Layout
**Preconditions:** Viewport set to 768x1024
**Steps:**
1. Navigate to homepage
2. Inspect hero section
3. Verify gradient and orbs
4. Check typography scaling

**Expected Results:**
- Hero height minimum 70vh
- Hero headline 2.5rem-3.5rem
- Floating orbs 200-230px
- Gradient remains vibrant
- Text shadows visible
- Balanced layout (text centered or two-column)

**Brand Requirements:**
- ✓ Prism gradient vibrant
- ✓ Text shadows on gradient
- ✓ Orbs use brand colors

---

### EV-BP-T002: Tablet Card Grid Layout
**Preconditions:** Viewport set to 768x1024
**Steps:**
1. Navigate to pages with card grids
2. Count cards per row
3. Verify card spacing
4. Check hover states

**Expected Results:**
- 2 cards per row
- Grid gap 2rem (32px)
- Cards have equal heights
- Hover effects work smoothly
- Spectrum accent bar appears on hover

**Brand Requirements:**
- ✓ Cards use EVOLEA gradient accents
- ✓ Fredoka font for card titles

---

### EV-BP-T003: Tablet Navigation
**Preconditions:** Viewport set to 768x1024
**Steps:**
1. Check if desktop nav shows or mobile menu still used
2. Test navigation interaction
3. Verify spacing and sizing

**Expected Results:**
- Either mobile menu OR desktop nav visible
- If mobile menu: solid background
- If desktop nav: proper spacing between links
- Donate button clearly visible (gold color)
- Touch targets minimum 44px

**Brand Requirements:**
- ✓ If mobile menu: solid background
- ✓ Donate button uses gold (#E8B86D)

---

### EV-BP-T004: Tablet Two-Column Layouts
**Preconditions:** Viewport set to 768x1024
**Steps:**
1. Navigate to pages with two-column content
2. Verify column arrangement
3. Check image/text balance

**Expected Results:**
- Two columns displayed side-by-side
- Columns aligned vertically centered
- Gap between columns 2rem minimum
- Images scale proportionally
- Text remains readable

**Brand Requirements:**
- ✓ Images use 24px border radius
- ✓ Text uses Poppins font

---

### EV-BP-T005: Tablet Footer Layout
**Preconditions:** Viewport set to 768x1024
**Steps:**
1. Scroll to footer
2. Check column arrangement
3. Verify link grouping

**Expected Results:**
- 2-3 column layout
- Footer links grouped by category
- Social icons inline
- Copyright text visible
- FooterDonationCTA visible

**Brand Requirements:**
- ✓ Footer closer/gradient present before footer
- ✓ Gold donation CTA present

---

## Desktop (1440px) - Critical Priority

### EV-BP-D001: Hero Section Desktop Layout
**Preconditions:** Viewport set to 1440x900
**Steps:**
1. Navigate to homepage
2. Inspect hero section layout
3. Verify gradient and orbs
4. Check typography
5. Verify wave fade

**Expected Results:**
- Hero height minimum 80vh
- Hero headline 3.5rem-4.5rem
- Floating orbs 250-300px
- Prism gradient animated (background-position shift)
- Wave fade 120px height
- Text shadows clearly visible
- Butterflies present and animated

**Brand Requirements:**
- ✓ Prism gradient with animation
- ✓ All brand colors visible
- ✓ Text shadows on gradients

---

### EV-BP-D002: Desktop Navigation Full Width
**Preconditions:** Viewport set to 1440x900
**Steps:**
1. Inspect header navigation
2. Verify all nav links visible
3. Test hover states
4. Check donate button

**Expected Results:**
- Full desktop navigation visible
- Nav links spaced evenly
- Active link has spectrum underline
- Hover states change color to magenta
- Donate button gold color with shadow
- Language picker visible

**Brand Requirements:**
- ✓ Active link spectrum underline
- ✓ Fredoka font for logo
- ✓ Gold donate button

---

### EV-BP-D003: Desktop Card Grid (3-4 Columns)
**Preconditions:** Viewport set to 1440x900
**Steps:**
1. Navigate to card grid pages
2. Count columns
3. Verify spacing
4. Test hover effects

**Expected Results:**
- 3-4 cards per row
- Grid gap 2rem-2.5rem
- Cards lift on hover (translateY(-8px))
- Spectrum accent bar animates on hover
- Box shadow increases on hover

**Brand Requirements:**
- ✓ Spectrum gradient accent
- ✓ EVOLEA shadow colors

---

### EV-BP-D004: Desktop Team Grid
**Preconditions:** Viewport set to 1440x900
**Steps:**
1. Navigate to /team/ page
2. Count team members per row
3. Verify photo sizing
4. Test hover effects

**Expected Results:**
- 3-4 team members per row
- Photos circular (border-radius: 50%)
- Photos 120-200px diameter
- Photos scale on hover (1.05)
- Names use Fredoka font
- Roles use Poppins font

**Brand Requirements:**
- ✓ Circular photos (brand style)
- ✓ Fredoka for names
- ✓ Proper EVOLEA colors

---

### EV-BP-D005: Desktop Footer (4-5 Columns)
**Preconditions:** Viewport set to 1440x900
**Steps:**
1. Scroll to footer
2. Count columns
3. Verify link organization
4. Check FooterDonationCTA

**Expected Results:**
- 4 columns minimum
- Footer links organized by category
- Social icons inline
- Newsletter form inline (if present)
- FooterDonationCTA visible before footer

**Brand Requirements:**
- ✓ Gold donation CTA before footer
- ✓ Page closer/gradient before footer

---

### EV-BP-D006: Desktop Typography Hierarchy
**Preconditions:** Viewport set to 1440x900
**Steps:**
1. Navigate through pages
2. Inspect H1, H2, H3 sizes
3. Verify font families
4. Check line heights

**Expected Results:**
- H1: 3.5rem-4rem (Fredoka Bold 700)
- H2: 2.5rem-3rem (Fredoka SemiBold 600)
- H3: 1.75rem-2rem (Fredoka SemiBold 600)
- Body: 1rem-1.125rem (Poppins Regular 400)
- Line heights appropriate (1.1-1.2 headings, 1.7 body)
- Clear visual hierarchy

**Brand Requirements:**
- ✓ Fredoka for all headlines
- ✓ Poppins for body
- ✓ Bold, vibrant text colors

---

## Large Desktop (1920px) - High Priority

### EV-BP-L001: Large Desktop Hero Section
**Preconditions:** Viewport set to 1920x1080
**Steps:**
1. Navigate to homepage
2. Inspect hero scaling
3. Verify orb sizing
4. Check gradient animation

**Expected Results:**
- Hero height minimum 85vh
- Hero headline 4rem-5.5rem
- Floating orbs 350-400px
- Orbs have 80px blur
- Prism gradient animates (prismShift)
- Wave fade 120-180px height
- No excessive whitespace

**Brand Requirements:**
- ✓ Gradient animation smooth
- ✓ Orbs use brand colors
- ✓ Text shadows visible

---

### EV-BP-L002: Large Desktop Card Grid
**Preconditions:** Viewport set to 1920x1080
**Steps:**
1. Navigate to card grid pages
2. Verify 4 column layout
3. Check card sizing
4. Test animations

**Expected Results:**
- 4 cards per row
- Grid gap 2.5rem-3rem
- Cards lift 10px on hover (larger than desktop)
- Card padding 3rem
- Animations smooth (60fps)

**Brand Requirements:**
- ✓ Spectrum accent animates
- ✓ EVOLEA shadow colors

---

### EV-BP-L003: Large Desktop Navigation
**Preconditions:** Viewport set to 1920x1080
**Steps:**
1. Inspect navigation bar
2. Check logo sizing
3. Verify link spacing
4. Test donate button effect

**Expected Results:**
- Nav links font-size 1rem
- Link spacing 1.25rem
- Logo properly sized
- Donate button has shimmer effect (goldShimmer animation)
- Active link spectrum underline visible

**Brand Requirements:**
- ✓ Donate button gold shimmer animation
- ✓ Spectrum underline on active links

---

### EV-BP-L004: Large Desktop Floating Elements
**Preconditions:** Viewport set to 1920x1080
**Steps:**
1. Navigate to hero sections
2. Observe floating orbs
3. Check butterflies
4. Monitor performance

**Expected Results:**
- Orbs dramatically larger (350-400px)
- Orbs have larger float animation travel
- Butterflies 60-100px
- All animations at 60fps
- No performance degradation

**Brand Requirements:**
- ✓ Orbs use EVOLEA gradient colors
- ✓ Animations respect reduced motion

---

### EV-BP-L005: Large Desktop Section Spacing
**Preconditions:** Viewport set to 1920x1080
**Steps:**
1. Navigate through sections
2. Measure vertical spacing
3. Check for breathing room

**Expected Results:**
- Section padding 5rem-10rem vertical
- Generous whitespace between sections
- No cramped feeling
- Content doesn't touch viewport edges

**Brand Requirements:**
- ✓ Cream background visible
- ✓ Proper visual hierarchy

---

## Ultra-Wide (2560px) - Medium Priority

### EV-BP-X001: Ultra-Wide Hero Section
**Preconditions:** Viewport set to 2560x1440
**Steps:**
1. Navigate to homepage
2. Check hero scaling
3. Verify orb sizing
4. Check for excessive stretching

**Expected Results:**
- Hero headline 5rem-6rem maximum
- Content remains centered
- Container max-width 1800px
- Orbs 450-500px
- Wave fade 150-220px
- No awkward empty spaces

**Brand Requirements:**
- ✓ Gradient doesn't stretch awkwardly
- ✓ Content centered properly

---

### EV-BP-X002: Ultra-Wide Card Grid (5 Columns)
**Preconditions:** Viewport set to 2560x1440
**Steps:**
1. Navigate to card grid pages
2. Count columns (should be 5 if content allows)
3. Verify card max-width
4. Check spacing

**Expected Results:**
- 5 cards per row (if applicable)
- Cards maintain max-width (~420px)
- Grid gap 3rem
- No stretched cards
- Images maintain aspect ratio

**Brand Requirements:**
- ✓ Cards don't lose visual impact
- ✓ Brand colors remain vibrant

---

### EV-BP-X003: Ultra-Wide Container Behavior
**Preconditions:** Viewport set to 2560x1440
**Steps:**
1. Navigate through all sections
2. Verify container max-widths
3. Check centering
4. Verify side margins visible

**Expected Results:**
- Container max-width 1800px
- Content centered horizontally
- Visible side margins
- Consistent across all sections
- No section spans full viewport width

**Brand Requirements:**
- ✓ Background colors visible on sides
- ✓ Visual flow consistent

---

### EV-BP-X004: Ultra-Wide Typography Cap
**Preconditions:** Viewport set to 2560x1440
**Steps:**
1. Check all heading sizes
2. Verify they don't exceed maximums
3. Check body text
4. Verify readability

**Expected Results:**
- H1 caps at 6rem (96px)
- Body text caps at 1.125rem (18px)
- Line lengths capped at 75 characters
- Text remains readable
- No excessive scaling

**Brand Requirements:**
- ✓ Fredoka headings readable
- ✓ Poppins body readable

---

## Cross-Viewport Tests

### EV-BP-CV001: Responsive Image Scaling
**Preconditions:** Test across all viewports
**Steps:**
1. Navigate to image-heavy pages
2. Resize viewport from mobile to ultra-wide
3. Observe image scaling behavior

**Expected Results:**
- Images scale proportionally
- No pixelation or blur
- Proper srcset/sizes attributes
- Images maintain 24px border-radius
- Lazy loading works

**Brand Requirements:**
- ✓ Real photos used (not AI)
- ✓ Images use EVOLEA border radius

---

### EV-BP-CV002: Gradient Consistency
**Preconditions:** Test across all viewports
**Steps:**
1. Navigate to pages with prism gradient
2. Resize viewport
3. Verify gradient remains visible and vibrant

**Expected Results:**
- Gradient colors remain vibrant at all sizes
- Gradient doesn't wash out on large screens
- Gradient animation smooth
- No color banding

**Brand Requirements:**
- ✓ Prism gradient uses exact EVOLEA colors
- ✓ Gradient visible and vibrant

---

### EV-BP-CV003: Text Shadow Consistency
**Preconditions:** Test across all viewports
**Steps:**
1. Navigate to gradient backgrounds
2. Check all text on gradients
3. Verify shadows visible

**Expected Results:**
- All text on gradients has shadows
- Shadows visible at all viewport sizes
- Text remains readable
- Minimum contrast 4.5:1

**Brand Requirements:**
- ✓ NEVER text without shadows on gradients
- ✓ Text readable on all gradients

---

### EV-BP-CV004: Touch Target Consistency
**Preconditions:** Test across all viewports
**Steps:**
1. Navigate through interactive elements
2. Measure touch targets
3. Verify minimum sizes

**Expected Results:**
- All interactive elements minimum 44px height
- All interactive elements minimum 44px width
- Adequate spacing between touch targets
- Works on touch and pointer devices

**Brand Requirements:**
- ✓ Accessibility standards met
- ✓ Mobile-friendly interactions

---

## Accessibility Testing (All Viewports)

### EV-BP-A001: Reduced Motion Support
**Preconditions:** Enable `prefers-reduced-motion: reduce` in browser
**Steps:**
1. Navigate through all pages
2. Verify animations stop/reduce
3. Check floating elements

**Expected Results:**
- All animations stop or reduce to minimal movement
- Orbs don't float
- Butterflies don't animate
- Wave fade doesn't animate
- Page remains functional

**Brand Requirements:**
- ✓ Accessibility respected
- ✓ Brand experience still recognizable

---

### EV-BP-A002: High Contrast Mode
**Preconditions:** Enable high contrast mode in OS/browser
**Steps:**
1. Navigate through pages
2. Verify text readability
3. Check borders appear

**Expected Results:**
- Text contrast minimum 7:1 (AAA)
- Cards have visible borders
- Buttons have visible borders
- Text shadows enhanced
- Brand colors still distinguishable

**Brand Requirements:**
- ✓ EVOLEA colors adapted appropriately
- ✓ Brand recognizable in high contrast

---

### EV-BP-A003: Keyboard Navigation
**Preconditions:** Navigate using keyboard only (no mouse)
**Steps:**
1. Tab through entire page
2. Verify all interactive elements reachable
3. Check focus states visible

**Expected Results:**
- All interactive elements keyboard accessible
- Focus states clearly visible (3px outline)
- Tab order logical
- No focus traps
- Skip link available

**Brand Requirements:**
- ✓ Focus states use EVOLEA magenta
- ✓ Accessibility standard met

---

### EV-BP-A004: Screen Reader Compatibility
**Preconditions:** Enable screen reader (NVDA, JAWS, VoiceOver)
**Steps:**
1. Navigate page with screen reader
2. Verify all content announced
3. Check image alt text
4. Verify landmark regions

**Expected Results:**
- All text content readable
- Images have descriptive alt text
- Proper heading hierarchy (H1 → H2 → H3)
- Landmark regions present (nav, main, footer)
- Forms properly labeled

**Brand Requirements:**
- ✓ No emojis (screen reader friendly)
- ✓ Semantic HTML used

---

## Performance Testing

### EV-BP-P001: Lighthouse Performance Audit
**Preconditions:** Run Lighthouse in Chrome DevTools
**Steps:**
1. Navigate to homepage
2. Run Lighthouse audit (Performance category)
3. Review metrics

**Expected Results:**
- Performance score >= 90
- LCP (Largest Contentful Paint) < 2.5s
- CLS (Cumulative Layout Shift) < 0.1
- FID (First Input Delay) < 100ms
- No layout shifts during load

**Brand Requirements:**
- ✓ Gradient loads quickly
- ✓ Floating elements don't cause layout shift

---

### EV-BP-P002: Animation Performance
**Preconditions:** Open DevTools Performance monitor
**Steps:**
1. Navigate to pages with animations
2. Scroll through page
3. Monitor frame rate

**Expected Results:**
- Animations maintain 60fps
- No dropped frames during scroll
- CPU usage reasonable
- No memory leaks

**Brand Requirements:**
- ✓ Orb animations smooth
- ✓ Wave animations smooth

---

## Testing Workflow

### Pre-Test Setup
1. Clear browser cache
2. Disable browser extensions
3. Set device pixel ratio appropriately
4. Enable DevTools if needed
5. Have viewport ruler ready

### Per-Viewport Testing Sequence
1. Set viewport to exact dimensions
2. Navigate to test page
3. Execute all relevant test cases
4. Document any failures with screenshots
5. Note actual measurements vs expected
6. Record browser/OS version

### Post-Test Actions
1. Compile results into summary report
2. Prioritize failures:
   - **Critical**: Breaks functionality or violates brand requirement
   - **High**: Significant visual issue or accessibility problem
   - **Medium**: Minor visual issue
   - **Low**: Enhancement opportunity
3. Create tickets for issues found
4. Schedule regression testing after fixes

---

## Chrome DevTools Commands Reference

```javascript
// Check viewport size
console.log(`${window.innerWidth}x${window.innerHeight}`);

// Check computed font size
getComputedStyle(document.querySelector('h1')).fontSize;

// Check touch target size
const el = document.querySelector('.btn');
const rect = el.getBoundingClientRect();
console.log(`${rect.width}x${rect.height}`);

// Check for missing alt text
document.querySelectorAll('img:not([alt])').length;

// Check gradient background
getComputedStyle(document.querySelector('.hero-section')).background;

// Check animation performance
performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd;

// Check for layout shifts
new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.hadRecentInput) return;
    console.log('Layout shift:', entry);
  });
}).observe({type: 'layout-shift', buffered: true});
```

---

## Test Report Template

```markdown
## EVOLEA Responsive Breakpoint Test Report

**Date:** [Date]
**Tester:** [Name]
**Browser:** [Browser + Version]
**OS:** [Operating System]

### Test Summary
- Total Tests: [Number]
- Passed: [Number]
- Partial: [Number]
- Failed: [Number]

### Critical Failures
[List any critical issues]

### Brand Requirement Violations
[List any violations of EVOLEA Brand Guide v3.0]

### Accessibility Issues
[List any WCAG violations]

### Performance Metrics
- Lighthouse Score: [Score]
- LCP: [Time]
- CLS: [Score]
- FID: [Time]

### Screenshots
[Attach screenshots of issues]

### Recommendations
[List recommendations for fixes]
```

---

## Appendix A: EVOLEA Brand Colors Reference

```css
/* Quick copy-paste for testing */
--evolea-magenta: #DD48E0;
--evolea-purple: #BA53AD;
--evolea-lavender: #CD87F8;
--evolea-mint: #7BEDD5;
--evolea-sunshine: #FFE066;
--evolea-coral: #FF7E5D;
--evolea-sky: #5DADE2;
--evolea-blush: #EF8EAE;
--evolea-gold: #E8B86D;
--evolea-cream: #FFFBF7;
--evolea-text: #2D2A32;
--evolea-text-light: #5C5762;
```

---

## Appendix B: Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Text unreadable on gradient | Missing text shadow | Add text-shadow as per brand guide |
| Mobile menu transparent | Wrong background CSS | Use solid white/cream background |
| Touch targets too small | Insufficient sizing | Ensure min 44px x 44px |
| Orbs cause layout shift | Missing dimensions | Set explicit width/height |
| Gradient washed out | Wrong colors or opacity | Use exact EVOLEA colors |
| Emojis in navigation | Wrong implementation | Replace with SVG icons |
| Animations janky | Layout thrashing | Use transform/opacity only |
| Butterfly covers "A" | Wrong spacing | Adjust butterfly position |

---

**Last Updated:** December 2024
**Version:** 1.0
**Maintainer:** EVOLEA Development Team

*Always adhere to EVOLEA Brand Guide v3.0 requirements when testing.*
