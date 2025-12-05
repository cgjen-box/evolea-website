# EVOLEA - Apply Bold Design to All Inner Pages

**Goal:** Bring the same vibrant, prism-gradient energy from the homepage to ALL inner pages (Blog, Team, Über uns, Kontakt, Angebote, etc.)

---

## 🎯 THE TRANSFORMATION

### Current State (Boring)
- Plain cream/white backgrounds
- Simple text headers
- No visual interest
- Feels like a different website from homepage

### Target State (Bold)
- Prism gradient hero on every page
- Floating orbs and butterflies
- Bold typography with shadows
- Consistent premium feel throughout

---

## 📄 INNER PAGE TEMPLATE

Every inner page should follow this structure:

```html
<!-- INNER PAGE TEMPLATE -->
<main class="inner-page">
  
  <!-- HERO SECTION - Prism Gradient -->
  <section class="page-hero">
    <div class="prism-background">
      <!-- Floating orbs -->
      <div class="floating-orb orb-mint"></div>
      <div class="floating-orb orb-gold"></div>
      <div class="floating-orb orb-pink"></div>
      <div class="floating-orb orb-purple"></div>
      
      <!-- Floating butterflies -->
      <svg class="floating-butterfly butterfly-1">...</svg>
      <svg class="floating-butterfly butterfly-2">...</svg>
    </div>
    
    <!-- Hero Content -->
    <div class="hero-content container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <a href="/">Startseite</a>
        <span>/</span>
        <span class="current">Blog</span>
      </nav>
      
      <!-- Page Title -->
      <h1 class="page-title">Blog</h1>
      <p class="page-subtitle">
        Neuigkeiten, Tipps und Einblicke rund um EVOLEA 
        und die Förderung von Kindern im Spektrum.
      </p>
    </div>
    
    <!-- Wave transition -->
    <div class="wave-bottom">
      <svg>...</svg>
    </div>
  </section>
  
  <!-- PAGE CONTENT -->
  <section class="page-content">
    <!-- Content here -->
  </section>
  
  <!-- PAGE CLOSER - Prism Gradient -->
  <section class="page-closer">
    <!-- Same prism background as hero -->
  </section>
  
</main>
```

---

## 🎨 PAGE HERO CSS

```css
/* Inner Page Hero with Prism Background */
.page-hero {
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 8rem 0 6rem;
}

/* Prism Gradient Background */
.prism-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    #7BEDD5 0%,        /* Mint */
    #A8F0E0 10%,       /* Light mint */
    #FFE066 25%,       /* Gold */
    #FFEEBB 35%,       /* Light gold */
    #FFD5E5 45%,       /* Light pink */
    #F5B8D0 55%,       /* Pink */
    #E97BF1 70%,       /* Magenta */
    #CD87F8 85%,       /* Lavender */
    #B56FE8 100%       /* Purple */
  );
}

/* Soft overlay for better text readability */
.prism-background::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
}

/* Floating Orbs */
.floating-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

.orb-mint {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #7BEDD5 0%, #4ECDC4 100%);
  top: -10%;
  left: -5%;
}

.orb-gold {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #FFE066 0%, #FFD84D 100%);
  top: 20%;
  left: 30%;
  animation-delay: -5s;
}

.orb-pink {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #FF9ECC 0%, #E84C82 100%);
  top: -20%;
  right: 10%;
  animation-delay: -10s;
}

.orb-purple {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, #CD87F8 0%, #B56FE8 100%);
  bottom: -15%;
  right: 25%;
  animation-delay: -15s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(20px, 10px) scale(1.02); }
}

/* Floating Butterflies */
.floating-butterfly {
  position: absolute;
  opacity: 0.3;
  animation: butterflyFloat 25s ease-in-out infinite;
}

.butterfly-1 {
  width: 50px;
  height: 50px;
  top: 15%;
  right: 20%;
}

.butterfly-2 {
  width: 35px;
  height: 35px;
  bottom: 25%;
  left: 15%;
  animation-delay: -12s;
  opacity: 0.2;
}

/* Hero Content */
.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.breadcrumb a {
  color: rgba(93, 46, 140, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb a:hover {
  color: var(--evolea-purple);
}

.breadcrumb span {
  color: rgba(93, 46, 140, 0.5);
}

.breadcrumb .current {
  color: var(--evolea-magenta);
  font-weight: 500;
}

/* Page Title - BOLD with shadows */
.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 700;
  color: var(--evolea-purple);
  margin-bottom: 1.5rem;
  text-shadow: 
    0 2px 4px rgba(255, 255, 255, 0.5),
    0 4px 20px rgba(138, 61, 158, 0.2);
}

/* Alternative: White title for darker gradient areas */
.page-title.light {
  color: #FFFFFF;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 20px rgba(138, 61, 158, 0.3),
    0 0 60px rgba(186, 83, 173, 0.2);
}

/* Page Subtitle */
.page-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(93, 46, 140, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Wave Bottom Transition */
.wave-bottom {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 100px;
  overflow: hidden;
}

.wave-bottom svg {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
}

/* Wave SVG */
.wave-bottom svg path {
  fill: #FFFBF7; /* Or white, matches content section */
}
```

---

## 📰 BLOG PAGE SPECIFIC STYLES

```css
/* Blog Content Section */
.blog-content {
  background: var(--evolea-cream);
  padding: 4rem 0 6rem;
}

/* Section Title */
.section-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--evolea-magenta);
  margin-bottom: 2rem;
}

/* Blog Grid */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

/* Blog Card - Enhanced */
.blog-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(186, 83, 173, 0.08);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(186, 83, 173, 0.05);
  position: relative;
  overflow: hidden;
}

/* Card hover effect */
.blog-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 12px 40px rgba(186, 83, 173, 0.15),
    0 0 0 1px rgba(221, 72, 224, 0.1);
}

/* Card gradient accent on hover */
.blog-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-spectrum);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.blog-card:hover::before {
  transform: scaleX(1);
}

/* Tags */
.blog-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.blog-tag {
  padding: 0.35rem 0.85rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(221, 72, 224, 0.1);
  color: var(--evolea-magenta);
  border: 1px solid rgba(221, 72, 224, 0.15);
}

/* Card Title */
.blog-card-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--evolea-purple);
  margin-bottom: 0.75rem;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.blog-card:hover .blog-card-title {
  color: var(--evolea-magenta);
}

/* Card Excerpt */
.blog-card-excerpt {
  font-size: 0.95rem;
  color: var(--evolea-text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Card Meta */
.blog-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--evolea-text-light);
  padding-top: 1rem;
  border-top: 1px solid rgba(186, 83, 173, 0.1);
}

/* Read more arrow */
.blog-card-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--evolea-magenta);
  font-weight: 500;
  text-decoration: none;
}

.blog-card-link svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.blog-card:hover .blog-card-link svg {
  transform: translateX(5px);
}

/* Featured Article (larger) */
.blog-card.featured {
  grid-column: span 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 0;
  overflow: hidden;
}

.blog-card.featured .card-image {
  height: 100%;
  min-height: 300px;
  background-size: cover;
  background-position: center;
}

.blog-card.featured .card-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@media (max-width: 768px) {
  .blog-card.featured {
    grid-column: span 1;
    grid-template-columns: 1fr;
  }
}
```

---

## 🔄 APPLY TO ALL PAGES

### Page-Specific Adjustments

| Page | Hero Height | Special Elements |
|------|-------------|------------------|
| Blog | 50vh | Category filters below hero |
| Team | 50vh | Team grid below |
| Über uns | 60vh | Mission statement overlay |
| Kontakt | 45vh | Contact form below |
| Angebote | 50vh | Program cards below |
| Individual Blog Post | 40vh | Article content below |

### CSS Variables for Consistency

```css
:root {
  /* Inner page hero heights */
  --hero-height-sm: 40vh;
  --hero-height-md: 50vh;
  --hero-height-lg: 60vh;
  
  /* Minimum heights for short content */
  --hero-min-height: 400px;
}

.page-hero.hero-sm { min-height: var(--hero-height-sm); }
.page-hero.hero-md { min-height: var(--hero-height-md); }
.page-hero.hero-lg { min-height: var(--hero-height-lg); }
```

---

## ⚡ ENTRANCE ANIMATIONS

```css
/* Animate elements on page load */
.page-hero .breadcrumb {
  animation: fadeSlideDown 0.6s ease forwards;
  animation-delay: 0.1s;
  opacity: 0;
}

.page-hero .page-title {
  animation: fadeSlideUp 0.8s ease forwards;
  animation-delay: 0.2s;
  opacity: 0;
}

.page-hero .page-subtitle {
  animation: fadeSlideUp 0.8s ease forwards;
  animation-delay: 0.4s;
  opacity: 0;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Blog cards stagger */
.blog-card {
  opacity: 0;
  animation: fadeSlideUp 0.6s ease forwards;
}

.blog-card:nth-child(1) { animation-delay: 0.1s; }
.blog-card:nth-child(2) { animation-delay: 0.2s; }
.blog-card:nth-child(3) { animation-delay: 0.3s; }
.blog-card:nth-child(4) { animation-delay: 0.4s; }
```

---

## 📋 IMPLEMENTATION CHECKLIST

### For Each Inner Page:

- [ ] Add prism gradient background to hero
- [ ] Add 4 floating orbs (mint, gold, pink, purple)
- [ ] Add 2 floating butterflies
- [ ] Style page title with text-shadow
- [ ] Add breadcrumb navigation
- [ ] Add wave transition to content section
- [ ] Add page-closer section before footer
- [ ] Add entrance animations
- [ ] Test on mobile (responsive)
- [ ] Test on large screens (4K)

### Pages to Update:

- [ ] /blog/
- [ ] /blog/[individual posts]
- [ ] /team/
- [ ] /ueber-uns/
- [ ] /kontakt/
- [ ] /angebote/
- [ ] /angebote/[individual programs]
- [ ] /datenschutz/
- [ ] /impressum/

---

## 🚀 QUICK INSTRUCTION FOR CLAUDE CODE

```
INSTRUCTION: Apply Bold Design to Blog Page (and all inner pages)

The Blog page looks boring compared to the homepage. Apply the same 
vibrant prism gradient treatment.

CHANGES NEEDED:

1. HERO SECTION:
   - Add prism gradient background (same as homepage)
   - Add 4 floating blurred orbs (mint, gold, pink, purple)
   - Add 2 subtle floating butterflies
   - Style title with text-shadow for depth
   - Add wave transition at bottom

2. BLOG CARDS:
   - White background with subtle shadow
   - Gradient top border on hover (spectrum)
   - Lift effect on hover (translateY -8px)
   - Tags with pink/magenta styling
   - Title changes color on hover

3. PAGE CLOSER:
   - Add prism gradient section before footer
   - Same floating orbs and butterflies
   - Seamless transition to footer

4. ANIMATIONS:
   - Hero elements fade/slide in on load
   - Blog cards stagger fade in
   - Floating orbs animate continuously

Apply this same treatment to ALL inner pages:
- Team, Über uns, Kontakt, Angebote, etc.

The entire site should feel cohesive and premium, not just the homepage.
```

---

## 🎨 WAVE SVG CODE

```html
<!-- Wave for bottom of hero -->
<svg class="wave-svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
  <path d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z" fill="#FFFBF7"/>
</svg>

<!-- Alternative wave with more curve -->
<svg class="wave-svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
  <path d="M0,60 Q360,120 720,60 T1440,60 L1440,120 L0,120 Z" fill="#FFFBF7"/>
</svg>
```
