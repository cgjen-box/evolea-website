# Instruction: Redesign "Unsere Angebote" Section

## Context
You are redesigning the "Unsere Angebote" section on the EVOLEA homepage. The current design has issues: cards are misaligned, different widths, no visual hierarchy, and lacks polish. Transform this into a premium, Apple-quality section with smooth animations.

## Current Problems to Fix
1. Cards stack vertically instead of a proper grid
2. Cards have inconsistent widths (some narrow, one very wide)
3. No images showing on cards
4. Third card (Schulberatung) appears empty
5. Spectrum line looks cut off
6. No hover effects or animations
7. Section feels flat and unpolished

---

## Design Requirements

### Breakpoint Reference Table
| Breakpoint | Width | Columns | Container Max | Card Height | Title Size |
|------------|-------|---------|---------------|-------------|------------|
| Mobile | <768px | 1 | 100% | 350px | 2.5rem |
| Tablet | 768-1024px | 2 | 100% | 400px | 3rem |
| Desktop | 1024-1440px | 2 | 1200px | 400px | 3.5rem |
| Large | 1440-1920px | 2 | 1400px | 450px | 4rem |
| Full HD | 1920-2560px | 4 | 1800px | 500px | 4.5rem |
| 2K/QHD | 2560-3840px | 4 | 2400px | 550px | 5.5rem |
| 4K | >3840px | 4 | 3200px | 700px | 7rem |

### Layout Structure
```
[Section Header - centered]
[Spectrum line decoration - animated]
[4 cards in 2x2 grid on desktop, 1 column on mobile]
```

### Card Grid
- 4K+ (>2560px): 4 columns, max-width 2400px centered
- Large Desktop (1920-2560px): 4 columns, max-width 1800px
- Desktop (1440-1920px): 2 columns, max-width 1400px
- Standard (1024-1440px): 2 columns, max-width 1200px
- Tablet (768-1024px): 2 columns
- Mobile (<768px): 1 column, full width
- Gap between cards: 2rem (32px), scales up to 3rem on 4K
- All cards MUST be equal height

### Individual Card Design
Each card should have:
1. **Background image** with gradient overlay (not solid magenta)
2. **Glassmorphism effect** on hover
3. **Icon** (SVG, not emoji) - positioned top-left
4. **Title** - bold, white text
5. **Description** - lighter white text
6. **"Mehr erfahren" link** with arrow that animates on hover

### Card Visual Style
```css
.angebot-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  min-height: 400px;
  background-size: cover;
  background-position: center;
}

.angebot-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(186, 83, 173, 0.7) 0%,
    rgba(221, 72, 224, 0.9) 100%
  );
  transition: opacity 0.5s ease;
}

.angebot-card:hover::before {
  background: linear-gradient(
    180deg,
    rgba(186, 83, 173, 0.5) 0%,
    rgba(221, 72, 224, 0.7) 100%
  );
}
```

---

## Animation Requirements (Apple-style)

### 1. Section Entrance Animation
When the section scrolls into view:
- Header fades in and slides up (0.6s ease-out)
- Spectrum line draws itself from center outward (0.8s)
- Cards fade in with staggered delay (0.15s between each)
- Cards slide up slightly as they appear

```css
/* Intersection Observer triggers these */
.animate-in .section-header {
  animation: fadeSlideUp 0.6s ease-out forwards;
}

.animate-in .card:nth-child(1) { animation-delay: 0.1s; }
.animate-in .card:nth-child(2) { animation-delay: 0.25s; }
.animate-in .card:nth-child(3) { animation-delay: 0.4s; }
.animate-in .card:nth-child(4) { animation-delay: 0.55s; }

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 2. Card Hover Animations
On hover, cards should:
- Lift up with shadow (transform: translateY(-12px))
- Background overlay lightens
- Icon scales up slightly
- Arrow slides right
- Subtle glow effect appears

```css
.angebot-card {
  transition: 
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.4s ease;
}

.angebot-card:hover {
  transform: translateY(-12px);
  box-shadow: 
    0 20px 40px rgba(221, 72, 224, 0.3),
    0 0 80px rgba(221, 72, 224, 0.2);
}

.angebot-card .icon {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.angebot-card:hover .icon {
  transform: scale(1.15);
}

.angebot-card .arrow {
  transition: transform 0.3s ease;
}

.angebot-card:hover .arrow {
  transform: translateX(8px);
}
```

### 3. Spectrum Line Animation
The decorative line should:
- Draw from center on scroll-in
- Shimmer/pulse subtly on loop

```css
.spectrum-line {
  height: 4px;
  background: var(--gradient-spectrum);
  border-radius: 2px;
  transform: scaleX(0);
  animation: drawLine 0.8s ease-out forwards;
  animation-delay: 0.3s;
}

@keyframes drawLine {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* Subtle shimmer */
.spectrum-line::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.4) 50%,
    transparent 100%
  );
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}
```

### 4. Smooth Scroll Behavior
```css
html {
  scroll-behavior: smooth;
}
```

---

## HTML Structure

```html
<section class="angebote-section" id="angebote">
  <div class="container">
    <!-- Header -->
    <div class="section-header">
      <span class="section-label">Angebote</span>
      <h2 class="section-title">Unsere Angebote</h2>
      <p class="section-subtitle">
        Evidenzbasierte Programme, die jedes Kind dort abholen, wo es steht.
      </p>
      <div class="spectrum-line"></div>
    </div>
    
    <!-- Cards Grid -->
    <div class="angebote-grid">
      <!-- Card 1: Mini Garten -->
      <a href="/angebote/mini-garten/" class="angebot-card">
        <div class="card-bg" style="background-image: url('/images/programs/garden.jpg')"></div>
        <div class="card-overlay"></div>
        <div class="card-content">
          <div class="card-icon">
            <!-- SVG sprout icon -->
            <svg>...</svg>
          </div>
          <h3 class="card-title">Mini Garten</h3>
          <p class="card-description">
            Spielerische Vorbereitung auf den Kindergarten in einer kleinen, geschützten Gruppe.
          </p>
          <span class="card-link">
            Mehr erfahren 
            <svg class="arrow">...</svg>
          </span>
        </div>
      </a>
      
      <!-- Card 2: Mini Projekte -->
      <a href="/angebote/mini-projekte/" class="angebot-card">
        <!-- Same structure -->
      </a>
      
      <!-- Card 3: Mini Turnen -->
      <a href="/angebote/mini-turnen/" class="angebot-card">
        <!-- Same structure -->
      </a>
      
      <!-- Card 4: Schulberatung -->
      <a href="/angebote/schulberatung/" class="angebot-card">
        <!-- Same structure -->
      </a>
    </div>
  </div>
</section>
```

---

## Complete CSS

```css
/* Section */
.angebote-section {
  padding: 6rem 0;
  background: var(--evolea-cream);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.section-header {
  text-align: center;
  margin-bottom: 4rem;
  opacity: 0;
  transform: translateY(40px);
}

.section-header.animate {
  animation: fadeSlideUp 0.6s ease-out forwards;
}

.section-label {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: rgba(221, 72, 224, 0.1);
  color: var(--evolea-magenta);
  border-radius: 100px;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.section-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  background: var(--gradient-magenta);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 1.125rem;
  color: var(--evolea-text-light);
  max-width: 600px;
  margin: 0 auto 2rem;
}

.spectrum-line {
  width: 200px;
  height: 4px;
  margin: 0 auto;
  background: var(--gradient-spectrum);
  border-radius: 2px;
  transform: scaleX(0);
}

.spectrum-line.animate {
  animation: drawLine 0.8s ease-out forwards;
}

/* Grid */
.angebote-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

/* Responsive Breakpoints */

/* Mobile */
@media (max-width: 768px) {
  .angebote-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 2.5rem;
  }
  
  .angebot-card {
    min-height: 350px;
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
  
  .section-title {
    font-size: 4rem;
  }
  
  .section-subtitle {
    font-size: 1.25rem;
  }
  
  .angebot-card {
    min-height: 450px;
  }
  
  .card-title {
    font-size: 2rem;
  }
}

/* Full HD+ (1920px+) */
@media (min-width: 1920px) {
  .container {
    max-width: 1800px;
  }
  
  .angebote-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
  }
  
  .section-title {
    font-size: 4.5rem;
  }
  
  .angebot-card {
    min-height: 500px;
  }
  
  .card-content {
    padding: 2.5rem;
  }
  
  .card-icon {
    width: 64px;
    height: 64px;
  }
}

/* 2K/QHD+ (2560px+) */
@media (min-width: 2560px) {
  .container {
    max-width: 2400px;
    padding: 0 4rem;
  }
  
  .angebote-section {
    padding: 8rem 0;
  }
  
  .angebote-grid {
    gap: 3rem;
  }
  
  .section-header {
    margin-bottom: 5rem;
  }
  
  .section-title {
    font-size: 5.5rem;
  }
  
  .section-subtitle {
    font-size: 1.5rem;
    max-width: 800px;
  }
  
  .spectrum-line {
    width: 300px;
    height: 5px;
  }
  
  .angebot-card {
    min-height: 550px;
    border-radius: 32px;
  }
  
  .card-content {
    padding: 3rem;
  }
  
  .card-icon {
    width: 72px;
    height: 72px;
    margin-bottom: 2rem;
  }
  
  .card-title {
    font-size: 2.25rem;
    margin-bottom: 1rem;
  }
  
  .card-description {
    font-size: 1.125rem;
    margin-bottom: 2rem;
  }
}

/* 4K (3840px+) */
@media (min-width: 3840px) {
  .container {
    max-width: 3200px;
    padding: 0 6rem;
  }
  
  .angebote-section {
    padding: 12rem 0;
  }
  
  .angebote-grid {
    gap: 4rem;
  }
  
  .section-header {
    margin-bottom: 6rem;
  }
  
  .section-label {
    font-size: 1.125rem;
    padding: 0.75rem 2rem;
  }
  
  .section-title {
    font-size: 7rem;
  }
  
  .section-subtitle {
    font-size: 1.75rem;
    max-width: 1000px;
  }
  
  .spectrum-line {
    width: 400px;
    height: 6px;
  }
  
  .angebot-card {
    min-height: 700px;
    border-radius: 40px;
  }
  
  .card-content {
    padding: 4rem;
  }
  
  .card-icon {
    width: 96px;
    height: 96px;
    margin-bottom: 2.5rem;
  }
  
  .card-title {
    font-size: 2.75rem;
    margin-bottom: 1.25rem;
  }
  
  .card-description {
    font-size: 1.375rem;
    line-height: 1.7;
    margin-bottom: 2.5rem;
  }
  
  .card-link {
    font-size: 1.125rem;
  }
  
  .card-link .arrow {
    width: 28px;
    height: 28px;
  }
}

/* Cards */
.angebot-card {
  position: relative;
  min-height: 400px;
  border-radius: 24px;
  overflow: hidden;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: 0;
  transform: translateY(40px);
  transition: 
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.4s ease;
}

.angebot-card.animate {
  animation: fadeSlideUp 0.6s ease-out forwards;
}

.angebot-card:hover {
  transform: translateY(-12px);
  box-shadow: 
    0 25px 50px rgba(186, 83, 173, 0.25),
    0 0 100px rgba(221, 72, 224, 0.15);
}

/* Card Background */
.card-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s ease;
}

.angebot-card:hover .card-bg {
  transform: scale(1.05);
}

/* Card Overlay */
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(186, 83, 173, 0.6) 0%,
    rgba(221, 72, 224, 0.9) 100%
  );
  transition: background 0.4s ease;
}

.angebot-card:hover .card-overlay {
  background: linear-gradient(
    180deg,
    rgba(186, 83, 173, 0.4) 0%,
    rgba(221, 72, 224, 0.75) 100%
  );
}

/* Card Content */
.card-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  color: white;
}

.card-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 1.5rem;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-icon svg {
  width: 100%;
  height: 100%;
}

.angebot-card:hover .card-icon {
  transform: scale(1.1);
}

.card-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.card-description {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 0.9375rem;
}

.card-link .arrow {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.angebot-card:hover .card-link .arrow {
  transform: translateX(6px);
}

/* Animations */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes drawLine {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

---

## JavaScript for Scroll Animations

```javascript
// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Animate header
      const header = entry.target.querySelector('.section-header');
      if (header) header.classList.add('animate');
      
      // Animate spectrum line
      const line = entry.target.querySelector('.spectrum-line');
      if (line) {
        setTimeout(() => line.classList.add('animate'), 300);
      }
      
      // Animate cards with stagger
      const cards = entry.target.querySelectorAll('.angebot-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate');
        }, 400 + (index * 150));
      });
      
      // Stop observing after animation
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe the section
document.querySelectorAll('.angebote-section').forEach(section => {
  observer.observe(section);
});
```

---

## SVG Icons to Use

### Sprout (Mini Garten)
```svg
<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M28 48V28" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <path d="M28 28C28 18 18 12 8 15C11 25 21 28 28 28Z" fill="white" fill-opacity="0.9"/>
  <path d="M28 28C28 18 38 12 48 15C45 25 35 28 28 28Z" fill="white" fill-opacity="0.7"/>
</svg>
```

### Palette (Mini Projekte)
```svg
<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="28" cy="28" r="20" stroke="white" stroke-width="3" fill="none"/>
  <circle cx="20" cy="20" r="4" fill="white"/>
  <circle cx="36" cy="20" r="4" fill="white" fill-opacity="0.7"/>
  <circle cx="18" cy="32" r="4" fill="white" fill-opacity="0.8"/>
  <circle cx="38" cy="36" r="6" fill="white" fill-opacity="0.5"/>
</svg>
```

### Ball (Mini Turnen)
```svg
<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="28" cy="28" r="20" stroke="white" stroke-width="3" fill="none"/>
  <path d="M8 28C18 20 38 20 48 28" stroke="white" stroke-width="2" fill="none"/>
  <path d="M28 8C20 18 20 38 28 48" stroke="white" stroke-width="2" fill="none"/>
</svg>
```

### Building (Schulberatung)
```svg
<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="12" y="20" width="32" height="28" rx="2" stroke="white" stroke-width="3" fill="none"/>
  <path d="M28 8L44 20H12L28 8Z" stroke="white" stroke-width="3" fill="none"/>
  <rect x="24" y="32" width="8" height="16" fill="white" fill-opacity="0.5"/>
  <rect x="16" y="26" width="6" height="6" fill="white" fill-opacity="0.7"/>
  <rect x="34" y="26" width="6" height="6" fill="white" fill-opacity="0.7"/>
</svg>
```

### Arrow
```svg
<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

---

## Checklist Before Done

- [ ] Grid shows 2x2 on desktop, 4 columns on 1920px+, 1 column on mobile
- [ ] All 4 cards are equal height
- [ ] Each card has background image OR solid gradient (no empty cards)
- [ ] Icons are SVG, not emojis
- [ ] Hover lifts card with shadow
- [ ] Arrow animates on hover
- [ ] Scroll animations trigger correctly
- [ ] Spectrum line draws on scroll
- [ ] No layout shift during animations
- [ ] Works on mobile
- [ ] Large display (1920px+): content scales proportionally, no excessive whitespace
- [ ] 4K display: readable text, proportional spacing, no tiny elements
- [ ] Container is centered with appropriate max-width at all breakpoints

---

## Final Notes

### Large Display Philosophy
On ultrawide and 4K monitors:
- **Don't stretch**: Use max-width containers to prevent content from becoming too wide
- **Scale proportionally**: Increase font sizes, spacing, and card heights to maintain visual balance
- **4 columns on 1920px+**: Shows all programs at once without scrolling
- **Generous whitespace**: Larger screens need more breathing room between elements
- **Readable at distance**: 4K users often sit further from screen, so scale up text

### Why These Breakpoints?
- **1440px**: Common "large laptop" and external monitor size
- **1920px**: Full HD - most common desktop monitor
- **2560px**: 2K/QHD - increasingly common, especially for developers
- **3840px**: 4K - growing rapidly, needs special attention

- Use `will-change: transform` sparingly for performance
- Test on Safari (different animation behavior)
- Ensure reduced-motion preference is respected:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
