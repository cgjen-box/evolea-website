# EVOLEA Animations Skill

> **Apple/Stripe-quality motion with GSAP**

This specialist skill provides patterns for creating smooth, delightful animations that feel premium yet safe for neurodivergent users.

---

## Core Principles

1. **GPU-Only**: Animate ONLY `transform` and `opacity` for 60fps
2. **Respect Motion**: Always handle `prefers-reduced-motion`
3. **Playful Not Overwhelming**: Subtle bounce, not chaos
4. **Predictable**: Consistent timing builds user trust
5. **Purposeful**: Every animation should communicate something

---

## GSAP Setup for Astro

### Required Imports

```astro
---
// In your Astro component or layout
---

<script>
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  
  gsap.registerPlugin(ScrollTrigger);
  
  // CRITICAL: Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    // Your animations here
  }
</script>
```

### Better: Use GSAP matchMedia

```javascript
gsap.matchMedia().add({
  reduceMotion: '(prefers-reduced-motion: reduce)',
  noPreference: '(prefers-reduced-motion: no-preference)',
  isMobile: '(max-width: 768px)',
  isDesktop: '(min-width: 769px)',
}, (context) => {
  const { reduceMotion, isMobile } = context.conditions;
  
  if (reduceMotion) {
    // Instant state, no motion
    gsap.set('.reveal-element', { opacity: 1, y: 0 });
    return;
  }
  
  // Full animations for users who want them
  if (isMobile) {
    // Simpler mobile animations
  } else {
    // Full desktop animations
  }
});
```

---

## Easing Reference

| Use Case | Easing | Code |
|----------|--------|------|
| Cards, icons, playful elements | Back out | `ease: 'back.out(1.4)'` |
| Text reveals, sections | Power 3 out | `ease: 'power3.out'` |
| Button hovers, quick feedback | Power 2 out | `ease: 'power2.out'` |
| Smooth scroll-linked | Sine in-out | `ease: 'sine.inOut'` |
| Elastic bounce (rare) | Elastic out | `ease: 'elastic.out(1, 0.3)'` |

### CSS Equivalents

```css
/* For CSS-only animations */
--ease-smooth: cubic-bezier(0.22, 1, 0.36, 1);      /* power3.out */
--ease-playful: cubic-bezier(0.34, 1.56, 0.64, 1);  /* back.out */
--ease-snappy: cubic-bezier(0.25, 0.1, 0.25, 1);    /* power2.out */
```

---

## Animation Patterns

### 1. Hero Text Reveal (Apple-style)

```javascript
// Staggered word reveal
gsap.from('.hero-title .word', {
  y: 100,
  opacity: 0,
  rotationX: -80,
  stagger: 0.08,
  duration: 1,
  ease: 'power3.out',
  delay: 0.2
});

// Subtitle fade up
gsap.from('.hero-subtitle', {
  y: 30,
  opacity: 0,
  duration: 0.8,
  ease: 'power2.out',
  delay: 0.6
});

// CTA button pop
gsap.from('.hero-cta', {
  scale: 0.8,
  opacity: 0,
  duration: 0.6,
  ease: 'back.out(1.7)',
  delay: 0.9
});
```

### 2. Scroll-Triggered Section Reveal

```javascript
// Fade up on scroll
gsap.from('.reveal-section', {
  y: 60,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.reveal-section',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  }
});
```

### 3. Staggered Card Grid (EVOLEA signature)

```javascript
// Cards appear with playful stagger
gsap.from('.program-card', {
  y: 80,
  opacity: 0,
  scale: 0.9,
  rotation: () => gsap.utils.random(-3, 3), // Subtle random tilt
  duration: 0.7,
  ease: 'back.out(1.4)',
  stagger: {
    each: 0.12,
    from: 'start' // or 'random' for playful effect
  },
  scrollTrigger: {
    trigger: '.program-grid',
    start: 'top 75%',
  }
});
```

### 4. Floating Butterflies (Decorative)

```javascript
// Infinite floating animation
gsap.to('.butterfly-float', {
  y: -15,
  rotation: 5,
  duration: 2.5,
  ease: 'sine.inOut',
  yoyo: true,
  repeat: -1,
  stagger: {
    each: 0.3,
    from: 'random'
  }
});
```

### 5. Navbar Scroll Effect

```javascript
const navbar = document.querySelector('.navbar');

ScrollTrigger.create({
  start: 'top -80',
  onUpdate: (self) => {
    if (self.direction === 1) {
      // Scrolling down - shrink navbar
      gsap.to(navbar, {
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        duration: 0.3
      });
    } else {
      // Scrolling up - restore
      gsap.to(navbar, {
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        boxShadow: 'none',
        duration: 0.3
      });
    }
  }
});
```

### 6. Button Hover (CSS for performance)

```css
.btn-primary {
  transition: transform 0.2s var(--ease-playful),
              box-shadow 0.2s ease-out;
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(221, 72, 224, 0.35);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
}
```

### 7. Info Badge Counter Animation

```javascript
// Animate number counting up
gsap.from('.stat-number', {
  textContent: 0,
  duration: 2,
  ease: 'power2.out',
  snap: { textContent: 1 },
  scrollTrigger: {
    trigger: '.stats-section',
    start: 'top 80%'
  }
});
```

---

## Scroll-Linked Animations (Scrub)

For Apple-style scroll-driven animations:

```javascript
// Parallax hero image
gsap.to('.hero-image', {
  yPercent: 30,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 0.5 // Smooth lag
  }
});

// Section pinning with content reveal
gsap.timeline({
  scrollTrigger: {
    trigger: '.pinned-section',
    start: 'top top',
    end: '+=200%',
    scrub: 1,
    pin: true,
    anticipatePin: 1 // Prevents jump
  }
})
.from('.reveal-1', { opacity: 0, y: 50 })
.from('.reveal-2', { opacity: 0, y: 50 })
.from('.reveal-3', { opacity: 0, y: 50 });
```

---

## Mobile Optimization

**Rule**: Reduce animation complexity on mobile for performance.

```javascript
gsap.matchMedia().add('(max-width: 768px)', () => {
  // Simpler mobile animations
  gsap.from('.program-card', {
    y: 40, // Reduced distance
    opacity: 0,
    duration: 0.5, // Faster
    stagger: 0.08,
    ease: 'power2.out', // Simpler easing
    scrollTrigger: {
      trigger: '.program-grid',
      start: 'top 85%',
    }
  });
});

gsap.matchMedia().add('(min-width: 769px)', () => {
  // Full desktop animations with more flair
  // ...
});
```

---

## Performance Checklist

- [ ] Only animating `transform` and `opacity`
- [ ] Using `will-change` sparingly (only during animation)
- [ ] Not animating `width`, `height`, `margin`, `padding`
- [ ] Mobile has simpler animations
- [ ] `prefers-reduced-motion` is respected
- [ ] Using `gsap.set()` for instant positioning (no animation)
- [ ] ScrollTrigger has `markers: false` in production
- [ ] Not using too many simultaneous animations

---

## Common Mistakes

### ❌ Don't

```javascript
// Animating layout properties
gsap.to('.element', { width: 200, height: 100 }); // BAD

// No reduced motion check
gsap.from('.element', { opacity: 0 }); // BAD without check

// Too many simultaneous animations
document.querySelectorAll('.card').forEach(card => {
  gsap.to(card, { y: -10 }); // BAD: creates many tweens
});
```

### ✅ Do

```javascript
// Transform only
gsap.to('.element', { scale: 1.2, x: 50 }); // GOOD

// With reduced motion check
if (!prefersReducedMotion) {
  gsap.from('.element', { opacity: 0 }); // GOOD
}

// Batch with stagger
gsap.to('.card', { y: -10, stagger: 0.1 }); // GOOD
```

---

## Astro Component Template

```astro
---
interface Props {
  animationType?: 'fade-up' | 'stagger-cards' | 'none';
}

const { animationType = 'fade-up' } = Astro.props;
---

<section class="reveal-section" data-animation={animationType}>
  <slot />
</section>

<script>
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  
  gsap.registerPlugin(ScrollTrigger);
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  document.querySelectorAll('[data-animation]').forEach(section => {
    if (prefersReducedMotion) return;
    
    const type = section.getAttribute('data-animation');
    
    if (type === 'fade-up') {
      gsap.from(section, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        }
      });
    }
    
    if (type === 'stagger-cards') {
      gsap.from(section.querySelectorAll('.card'), {
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: 'back.out(1.4)',
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
        }
      });
    }
  });
</script>
```

---

## Timing Reference Table

| Element | Duration | Delay/Stagger | Easing |
|---------|----------|---------------|--------|
| Hero title | 1000ms | 200ms delay | power3.out |
| Hero subtitle | 800ms | 600ms delay | power2.out |
| Hero CTA | 600ms | 900ms delay | back.out(1.7) |
| Section reveal | 800ms | - | power3.out |
| Card stagger | 600-700ms | 100-150ms each | back.out(1.4) |
| Button hover | 200ms | - | playful (CSS) |
| Navbar transition | 300ms | - | ease-out |
| Floating element | 2500ms | random | sine.inOut |

---

## Related Skills

- **Lead**: `EVOLEA-DESIGN-UX.md`
- **Accessibility**: `accessibility.md` - Motion sensitivity details
- **Responsive**: `responsive.md` - Mobile animation adaptations
