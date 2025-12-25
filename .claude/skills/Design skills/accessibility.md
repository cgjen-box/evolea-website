# EVOLEA Accessibility Skill

> **WCAG compliance + neurodivergent-friendly design patterns**

This specialist skill covers accessibility requirements (WCAG 2.1 AA) and neurodivergent-friendly design patterns essential for EVOLEA's mission.

---

## Core Philosophy

EVOLEA serves families with neurodivergent children. Our accessibility standards go beyond legal compliance to create experiences that are:

1. **Predictable** – Consistent layouts build trust
2. **Calm** – No overwhelming stimuli
3. **Clear** – Literal language, obvious navigation
4. **Controllable** – Users control motion, sound, pace
5. **Inclusive** – Works for all abilities

---

## WCAG 2.1 AA Requirements

### Color Contrast (1.4.3, 1.4.11)

| Element | Minimum Ratio | Tool |
|---------|---------------|------|
| Normal text (< 18px) | 4.5:1 | [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) |
| Large text (≥ 18px bold, ≥ 24px) | 3:1 | |
| UI components (buttons, inputs) | 3:1 | |
| Focus indicators | 3:1 change | |

### EVOLEA Color Combinations (Pre-checked)

| Text Color | Background | Ratio | Status |
|------------|------------|-------|--------|
| #2D2A32 (Dark) | #FFFBF7 (Cream) | 12.4:1 | ✅ Pass |
| #2D2A32 (Dark) | #FFFFFF (White) | 14.5:1 | ✅ Pass |
| #FFFFFF (White) | #DD48E0 (Magenta) | 3.2:1 | ⚠️ Large only |
| #FFFFFF (White) | #BA53AD (Purple) | 4.6:1 | ✅ Pass |
| #451A03 (Amber-950) | #E8B86D (Gold) | 7.2:1 | ✅ Pass |
| #FFFFFF (White) | #E8B86D (Gold) | 1.8:1 | ❌ Fail! |

### The Spenden Button Fix

Gold/amber backgrounds NEVER pass with white text. Use dark text:

```html
<!-- ❌ WRONG - fails contrast -->
<button class="bg-amber-500 text-white">Spenden</button>

<!-- ✅ CORRECT - passes contrast -->
<button class="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-bold">
  Spenden
</button>
```

---

### Focus Indicators (2.4.7)

All interactive elements must have visible focus states.

```css
/* EVOLEA focus style */
:focus-visible {
  outline: 3px solid var(--evolea-magenta);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default only if custom is defined */
:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid CanvasText;
  }
}
```

### Touch Targets (2.5.5, 2.5.8)

| Level | Minimum Size | EVOLEA Standard |
|-------|--------------|-----------------|
| AAA | 44×44 CSS px | Primary buttons, nav |
| AA | 24×24 CSS px | Secondary links |

```css
/* Ensure adequate touch targets */
.btn,
.nav-link,
.card-link {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
}

/* Inline links - expand clickable area */
.inline-link {
  padding-block: 8px;
  margin-block: -8px;
  display: inline-block;
}

/* Icon buttons */
.icon-btn {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

### Motion & Animation (2.3.3)

Users who prefer reduced motion must be respected.

```css
/* Disable animations for users who request it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```javascript
// GSAP implementation
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  gsap.set('.animated-element', { opacity: 1, y: 0 }); // Instant state
} else {
  gsap.from('.animated-element', { opacity: 0, y: 30 }); // Animated
}
```

### Tailwind Utilities

```html
<!-- Motion-safe: only animate if user hasn't requested reduced motion -->
<div class="motion-safe:animate-fade-in motion-reduce:opacity-100">
  Content
</div>

<!-- Transition only when safe -->
<button class="motion-safe:transition-transform motion-safe:hover:-translate-y-1">
  Button
</button>
```

---

### Keyboard Navigation (2.1.1, 2.1.2)

All functionality must be keyboard accessible.

```html
<!-- Skip link (first element in body) -->
<a 
  href="#main-content" 
  class="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded"
>
  Zum Hauptinhalt springen
</a>

<!-- Proper landmark structure -->
<header role="banner">...</header>
<nav role="navigation" aria-label="Hauptnavigation">...</nav>
<main id="main-content" role="main">...</main>
<footer role="contentinfo">...</footer>
```

### Focus Trap for Modals

```javascript
// Trap focus within modal when open
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}
```

---

### Images & Alt Text (1.1.1)

| Image Type | Alt Text Approach |
|------------|-------------------|
| Informative | Describe content and purpose |
| Decorative | `alt=""` (empty, not missing) |
| Functional (links/buttons) | Describe the action |
| Complex (charts/diagrams) | Detailed description + `aria-describedby` |

```html
<!-- Informative image -->
<img 
  src="/images/team/gianna-spiess.jpg" 
  alt="Gianna Spiess, M.Sc., BCBA - Mitgründerin von EVOLEA"
/>

<!-- Decorative image -->
<img src="/images/butterfly-decoration.svg" alt="" role="presentation" />

<!-- Functional image (in link) -->
<a href="/kontakt/">
  <img src="/icons/email.svg" alt="Kontakt aufnehmen" />
</a>

<!-- Complex image with extended description -->
<figure>
  <img 
    src="/images/program-timeline.png" 
    alt="Übersicht der 6 Halbtage im Mini Museum Programm"
    aria-describedby="timeline-description"
  />
  <figcaption id="timeline-description">
    Das Programm besteht aus 6 Halbtagen: Kunstentdeckung, Naturmaterialien, 
    Farben erforschen, Skulpturen formen, Masken basteln, und die Eröffnungsfeier.
  </figcaption>
</figure>
```

---

### Forms (1.3.1, 3.3.2)

```html
<form>
  <!-- Always associate labels with inputs -->
  <div class="form-group">
    <label for="name" class="form-label">
      Name <span class="text-evolea-magenta">*</span>
    </label>
    <input 
      type="text" 
      id="name" 
      name="name"
      required
      aria-required="true"
      class="form-input"
    />
  </div>
  
  <!-- Error messages linked to input -->
  <div class="form-group">
    <label for="email">E-Mail *</label>
    <input 
      type="email" 
      id="email"
      aria-describedby="email-error"
      aria-invalid="true"
      class="form-input border-red-500"
    />
    <p id="email-error" class="text-red-600 text-sm mt-1" role="alert">
      Bitte geben Sie eine gültige E-Mail-Adresse ein.
    </p>
  </div>
  
  <!-- Submit with loading state -->
  <button 
    type="submit"
    aria-busy="false"
    class="btn btn-primary"
  >
    Absenden
  </button>
</form>
```

---

## Neurodivergent-Friendly Patterns

Beyond WCAG, these patterns specifically support autistic users and those with ADHD.

### 1. Predictable Layouts

**Why**: Consistency reduces cognitive load and anxiety.

```
✅ Same navigation position on every page
✅ Same section structure across program pages
✅ Consistent button styles and placements
✅ Predictable link behaviors (new tab only when indicated)

❌ Varying layouts between similar pages
❌ Unexpected pop-ups or interruptions
❌ Hidden navigation or hamburger menus (on desktop)
```

### 2. Clear, Literal Language

**Why**: Idioms and ambiguity can be confusing.

```
✅ "Submit Form" (literal)
❌ "Let's Go!" (ambiguous)

✅ "Download as PDF" (specific)
❌ "Get it now" (vague)

✅ "Saturdays, 9:00-12:00" (precise)
❌ "Weekend mornings" (imprecise)
```

### 3. No Autoplay Media

**Why**: Unexpected sounds/movement can be startling.

```html
<!-- ✅ CORRECT: No autoplay, muted by default -->
<video 
  src="/videos/intro.mp4" 
  controls 
  muted
  poster="/images/video-poster.jpg"
>
</video>

<!-- ❌ WRONG: Autoplay with sound -->
<video src="/videos/intro.mp4" autoplay></video>
```

### 4. Calm Color Usage

**Why**: Overstimulation from too many bright colors.

```css
/* Use vibrant colors as ACCENTS, not overwhelming backgrounds */
.page {
  background: var(--evolea-cream); /* Calm base */
}

.accent-element {
  color: var(--evolea-magenta); /* Accent only */
}

/* Hero gradients are OK for special sections */
.hero {
  background: var(--gradient-prism);
}

/* But main content areas stay calm */
.content {
  background: white;
}
```

### 5. Progress Indicators

**Why**: ADHD users benefit from clear progress and structure.

```html
<!-- Multi-step form -->
<div class="progress-indicator">
  <span class="step completed">1. Kontakt</span>
  <span class="step current">2. Details</span>
  <span class="step">3. Bestätigung</span>
</div>

<!-- Program timeline -->
<ol class="program-timeline">
  <li class="completed">Woche 1: Kunstentdeckung ✓</li>
  <li class="current">Woche 2: Naturmaterialien ←</li>
  <li>Woche 3: Farben</li>
  <!-- ... -->
</ol>
```

### 6. Chunked Content

**Why**: Long text blocks are overwhelming.

```html
<!-- ❌ WRONG: Wall of text -->
<p>Long paragraph with many sentences covering multiple topics 
without breaks making it hard to scan and process...</p>

<!-- ✅ CORRECT: Chunked with clear structure -->
<div class="space-y-6">
  <section>
    <h3>Was wir bieten</h3>
    <p>Short focused paragraph.</p>
  </section>
  
  <section>
    <h3>Für wen</h3>
    <p>Another short paragraph.</p>
  </section>
</div>
```

### 7. No Time Pressure

**Why**: Arbitrary deadlines create anxiety.

```
✅ "Session expires in 30 minutes" with refresh option
✅ "Take your time" messaging
✅ Form data saved as you go

❌ Countdown timers for no reason
❌ "Hurry! Only 2 spots left!" urgency tactics
❌ Auto-submitting forms
```

### 8. Sensory Considerations

```css
/* Avoid pure black - softer dark colors */
.text {
  color: #2D2A32; /* Slightly warm dark, not #000000 */
}

/* Avoid harsh white - use cream */
.background {
  background: #FFFBF7; /* Warm cream, not #FFFFFF */
}

/* No flickering or flashing (WCAG 2.3.1) */
.no-flash {
  animation: none; /* Never animate with flash effects */
}

/* Subtle shadows, not harsh */
.shadow-soft {
  box-shadow: 0 4px 20px rgba(186, 83, 173, 0.15);
}
```

---

## Testing Checklist

### Automated Testing

- [ ] Run Lighthouse Accessibility audit (target: ≥ 90)
- [ ] Run axe DevTools extension
- [ ] Check with WAVE browser extension
- [ ] Validate HTML (no duplicate IDs)

### Manual Testing

- [ ] Navigate entire site with keyboard only
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Test at 200% zoom
- [ ] Test with `prefers-reduced-motion: reduce`
- [ ] Test with high contrast mode
- [ ] Test all form error states
- [ ] Verify focus order is logical

### EVOLEA-Specific

- [ ] No emojis (screen readers read them aloud awkwardly)
- [ ] Spenden button passes contrast
- [ ] All program pages have consistent structure
- [ ] No autoplay media anywhere
- [ ] Clear, literal button/link labels
- [ ] Progress indicators on multi-step processes

---

## ARIA Reference

### Common Patterns

```html
<!-- Expandable section -->
<button 
  aria-expanded="false" 
  aria-controls="section-content"
>
  Details anzeigen
</button>
<div id="section-content" hidden>
  Content here
</div>

<!-- Loading state -->
<button aria-busy="true" aria-live="polite">
  Wird gesendet...
</button>

<!-- Status messages -->
<div role="status" aria-live="polite">
  Formular erfolgreich gesendet!
</div>

<!-- Error messages -->
<div role="alert" aria-live="assertive">
  Fehler: Bitte füllen Sie alle Pflichtfelder aus.
</div>

<!-- Navigation landmark -->
<nav aria-label="Hauptnavigation">
  ...
</nav>

<!-- Breadcrumb -->
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Start</a></li>
    <li aria-current="page">Angebote</li>
  </ol>
</nav>
```

---

## Screen Reader Testing Script

Test these scenarios:

1. **Homepage**
   - "Can I understand what EVOLEA does within 10 seconds?"
   - "Can I find the main navigation?"
   - "Are program cards announced with their titles?"

2. **Program Page**
   - "Is the program name announced as H1?"
   - "Can I understand prerequisites from the list?"
   - "Is the registration CTA clearly announced?"

3. **Contact Form**
   - "Are all fields properly labeled?"
   - "Are required fields indicated?"
   - "Are error messages announced when they appear?"

---

## Related Skills

- **Lead**: `EVOLEA-DESIGN-UX.md`
- **Animations**: `animations.md` - Reduced motion implementation
- **Responsive**: `responsive.md` - Touch target sizes
