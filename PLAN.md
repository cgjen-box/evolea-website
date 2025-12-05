# EVOLEA Website Launch Plan

## Executive Summary

This plan outlines the work required to transform the current GitHub codebase into a launch-ready website that matches and exceeds the functionality of the current evolea.ch Webflow site.

---

## Gap Analysis: Live Site vs. GitHub Codebase

### Current State Comparison

| Feature | evolea.ch (Live) | GitHub Codebase | Gap |
|---------|-----------------|-----------------|-----|
| Homepage Video Hero | Yes | Yes | None |
| Programs Overview | Yes | Basic | Enhancement needed |
| Mini Garten Page | Yes | Yes | Review content |
| Mini Projekte Page | Yes | Yes | Review content |
| Mini Turnen Page | Yes | Yes | Review content |
| Schulberatung Page | Yes | Yes | Review content |
| Tagesschule Program | Yes (mentioned) | Missing | Create new |
| Team Page | Yes (4 members) | Yes (4 members) | Enhance layout |
| About Page | Comprehensive | Basic | Major expansion |
| Blog Section | Yes | Missing | Create new |
| Contact Page | Program-specific | Generic form | Add program routing |
| Pedagogical Concept | 9 principles | 3 values | Expand significantly |
| WhatsApp Integration | Yes | Missing | Add |
| Instagram Link | Yes | Yes | None |
| Legal Pages | Yes | Yes | Review content |
| i18n (DE/EN) | German only | Full i18n | Advantage |
| Brand Guidelines | N/A | Comprehensive | Advantage |

### Critical Gaps to Close

1. **Blog Section** - Completely missing, needed for content marketing
2. **Tagesschule Program** - New program mentioned on live site
3. **Pedagogical Concept Section** - 9 founding principles (homepage + dedicated section)
4. **About Page Expansion** - Current version too minimal
5. **Program-Specific Contact Pages** - Live site routes to program-specific forms
6. **WhatsApp Chat Link** - Important for parent communication
7. **Enhanced Imagery** - Need brand-consistent generated images throughout

---

## Phase 1: Content & Structure Parity

### 1.1 Homepage Enhancements

**Current Issues:**
- Missing "What We Do" detailed methodology section
- Pedagogical Concept only shows 3 values, live site has 9 principles
- Team section is a teaser, could show actual team members

**Tasks:**
- [ ] Add comprehensive "What We Do" section with methodology explanation
- [ ] Expand Values section to full 9 Pedagogical Principles:
  1. Evidenzbasiert (Evidence-based)
  2. Individuell (Individual)
  3. Spielerisch (Playful)
  4. Strukturiert (Structured)
  5. Partizipativ (Participatory)
  6. Ressourcenorientiert (Strength-focused)
  7. Interdisziplinar (Interdisciplinary)
  8. Familienzentrert (Family-centered)
  9. Inklusiv (Inclusive)
- [ ] Add team member preview cards on homepage (not just text teaser)
- [ ] Add WhatsApp chat link in hero/contact sections

### 1.2 About Page (Uber uns) Overhaul

**Current State:** Basic 3-section page with minimal content

**Required Sections:**
- [ ] Hero with compelling mission statement
- [ ] Our Story / Geschichte section
- [ ] Mission & Vision
- [ ] Full Pedagogical Concept (9 principles with icons/illustrations)
- [ ] "For Whom" section explaining target audience respectfully
- [ ] Association/Verein information
- [ ] Link to Team page

### 1.3 Programs Overview Page Enhancement

**Current State:** Simple grid of 4 cards

**Enhancements:**
- [ ] Add hero section with compelling headline
- [ ] Add introduction paragraph explaining program philosophy
- [ ] Visual bento grid layout (matching homepage style)
- [ ] Add Tagesschule preview/teaser
- [ ] Age group quick reference
- [ ] "Not sure which program?" CTA leading to contact

### 1.4 Create Tagesschule Program Page

**New Page Required:** `/angebote/tagesschule/`

**Content Structure:**
- [ ] Hero explaining the Tagesschule concept
- [ ] Target age group and criteria
- [ ] Curriculum approach
- [ ] Daily schedule overview
- [ ] "Coming Soon" or registration interest form
- [ ] FAQ section

### 1.5 Create Blog Infrastructure

**New Section Required:** `/blog/`

**Implementation:**
- [ ] Create blog index page with post grid
- [ ] Create blog post template/layout
- [ ] Set up content collection for posts
- [ ] Create sample posts (3-5 for launch):
  - "Willkommen bei EVOLEA"
  - "Was ist ABA/VB?" (explaining methodology)
  - "Tipps fur den Kindergarten-Ubergang"
- [ ] Add blog link to navigation
- [ ] Add recent posts widget to homepage (optional)

### 1.6 Contact Page Enhancements

**Current Issues:**
- Generic form, no program-specific routing
- Missing WhatsApp option
- Form action placeholder

**Tasks:**
- [ ] Set up actual Formspree form ID
- [ ] Add program selection that pre-fills subject
- [ ] Add WhatsApp contact option
- [ ] Add Google Maps embed or static map
- [ ] Create thank-you page after submission
- [ ] Add FAQ section addressing common questions

### 1.7 Individual Program Page Reviews

For each program page (Mini Garten, Mini Projekte, Mini Turnen, Schulberatung):

- [ ] Verify all practical information is current (dates, times, locations)
- [ ] Ensure consistent structure across all program pages
- [ ] Add testimonial placeholder sections
- [ ] Add "Related Programs" section at bottom
- [ ] Verify German content matches live site accuracy

---

## Phase 2: Image Generation Campaign

Using the ImageAgent to create brand-consistent imagery throughout the site.

### 2.1 Homepage Images

```
ImageAgent requests:
1. "hero background showing joyful children in colorful environment, warm and welcoming" --aspect 16:9 --size 4K
2. "children discovering nature in a garden setting with butterflies" --aspect 4:3
3. "kids doing creative art projects together, colorful and inclusive" --aspect 4:3
4. "children playing sports in a gymnasium, fun and structured" --aspect 4:3
5. "abstract prism gradient background for sections" --aspect 16:9
```

### 2.2 Program Page Hero Images

```
ImageAgent requests:
1. Mini Garten: "young children exploring a garden with plants, sensory play, ages 3-6" --aspect 16:9
2. Mini Projekte: "children ages 5-8 doing arts and crafts together, creative collaboration" --aspect 16:9
3. Mini Turnen: "children doing gymnastics and sports activities in a safe environment" --aspect 16:9
4. Schulberatung: "professional meeting with teachers, supportive consultation" --aspect 16:9
5. Tagesschule: "children in a classroom setting, structured learning environment" --aspect 16:9
```

### 2.3 About Page Images

```
ImageAgent requests:
1. "diverse group of children flourishing, transformation metaphor with butterflies" --aspect 16:9
2. "safe nurturing environment for children, warm atmosphere" --aspect 4:3
3. "evidence-based learning visualization, professional but warm" --aspect 4:3
```

### 2.4 Supporting Graphics

```
ImageAgent requests:
1. "abstract decorative pattern with EVOLEA colors for backgrounds" --aspect 1:1
2. "butterfly pattern seamless tile for subtle backgrounds" --aspect 1:1
3. "prism light effect abstract for hero overlays" --aspect 16:9
```

### 2.5 Blog Post Images

```
For each blog post, generate relevant header images:
1. Welcome post: "welcoming scene, open doors, butterflies, transformation"
2. Methodology post: "learning through play, evidence-based, professional"
3. Tips post: "kindergarten transition, supportive, parent and child"
```

---

## Phase 3: Enhancements Beyond Live Site

### 3.1 English Translation Completion

**Advantage over live site:** Full bilingual support

- [ ] Review all English translations in ui.ts
- [ ] Create English versions of all new content (blog posts, about page, etc.)
- [ ] Ensure English program pages are complete
- [ ] Add English-specific SEO metadata

### 3.2 Advanced Features

- [ ] Add animated butterfly cursor follower (subtle, optional)
- [ ] Implement smooth page transitions
- [ ] Add reading progress indicator for blog posts
- [ ] Create newsletter signup component
- [ ] Add social sharing buttons for blog posts

### 3.3 Accessibility Enhancements

- [ ] Full keyboard navigation audit
- [ ] Screen reader testing
- [ ] Color contrast verification (WCAG AA minimum)
- [ ] Focus visible states on all interactive elements
- [ ] Alt text review for all images
- [ ] Reduced motion preferences respected

### 3.4 Performance Optimizations

- [ ] Image optimization pipeline (WebP conversion, responsive sizes)
- [ ] Video optimization (multiple formats, lazy loading)
- [ ] Critical CSS inlining
- [ ] Font subsetting
- [ ] Lighthouse performance audit (target: 90+)

---

## Phase 4: Launch Preparation

### 4.1 SEO & Metadata

- [ ] Review all page titles and descriptions
- [ ] Create OG images for social sharing
- [ ] Implement structured data (Organization, LocalBusiness)
- [ ] Generate sitemap.xml
- [ ] Create robots.txt
- [ ] Set up Google Search Console
- [ ] Set up Google Analytics (if desired)

### 4.2 Testing Checklist

- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing (375px, 768px, 1024px, 1440px)
- [ ] Form submission testing
- [ ] All internal links working
- [ ] All external links working (open in new tab)
- [ ] 404 page working correctly
- [ ] Language switching working
- [ ] Video playback on all devices

### 4.3 Content Review

- [ ] Spell check all German content
- [ ] Spell check all English content
- [ ] Legal review of Impressum
- [ ] Privacy policy review (GDPR compliance)
- [ ] Contact information accuracy
- [ ] Team member information accuracy

### 4.4 Deployment

- [ ] DNS configuration for evolea.ch
- [ ] SSL certificate verification
- [ ] GitHub Actions deployment working
- [ ] Redirect from www to non-www (or vice versa)
- [ ] Old Webflow site backup
- [ ] Cutover plan and timing

---

## Execution Priority

### Immediate (Week 1)
1. About page overhaul
2. Homepage pedagogical principles expansion
3. Tagesschule page creation
4. Image generation for program pages

### Short-term (Week 2)
5. Blog infrastructure setup
6. Contact page enhancements
7. Program page content review
8. Image generation for homepage

### Medium-term (Week 3)
9. Blog content creation
10. English translation completion
11. SEO implementation
12. Performance optimization

### Pre-launch (Week 4)
13. Full testing cycle
14. Content review
15. Legal review
16. Deployment preparation

---

## Image Generation Schedule

To avoid API rate limits and ensure quality, generate images in batches:

**Batch 1: Program Heroes (5 images)**
- Mini Garten hero
- Mini Projekte hero
- Mini Turnen hero
- Schulberatung hero
- Tagesschule hero

**Batch 2: Homepage (5 images)**
- Main hero background
- About section illustration
- Values section backgrounds
- Team section background
- CTA section background

**Batch 3: About Page (4 images)**
- Hero image
- Story/history illustration
- Pedagogical concept visuals
- Team philosophy illustration

**Batch 4: Supporting (4 images)**
- Blog default header
- Pattern/texture backgrounds
- Decorative elements
- 404 page illustration

---

## Success Metrics

Launch readiness criteria:

- [ ] All pages from live site replicated or improved
- [ ] Lighthouse scores: Performance 90+, Accessibility 95+, SEO 95+
- [ ] Mobile-first responsive design verified
- [ ] All forms functional
- [ ] Both languages complete
- [ ] Brand consistency across all pages
- [ ] Legal compliance verified
