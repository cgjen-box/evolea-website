# EVOLEA Website Redesign: Timeline Activity Section

## Instructions for Claude Code

**Repository:** cgjen-box/evolea-website (GitHub Pages)  
**Live Site:** https://cgjen-box.github.io/evolea-website/  
**Date:** December 2024

---

## 📋 PROJECT CONTEXT

### What is EVOLEA?

EVOLEA is a Swiss organization that creates programs for children with autism or ADHS (ages 3-8). The website serves two audiences:
1. **Parents of current participants** - need program information
2. **Prospective families** - need to discover and register for programs

### The Problem We're Solving

The current homepage has a static "Unsere Angebote" section showing 4 equal program cards. This is problematic because:

- **Mini Projects** (the main business activity) is buried as just one of four cards
- There's no visual distinction between programs with open registration vs. already running
- Parents can't quickly see what they can sign up for NOW
- The user journey to find active projects requires too many clicks

### The Solution

Replace the static program grid with a dynamic **"Was passiert jetzt"** (What's happening now) timeline section that:

1. Prioritizes programs with **OPEN REGISTRATION** (biggest, most prominent)
2. Shows programs where **REGISTRATION OPENS SOON** (medium prominence)
3. Lists **CURRENTLY RUNNING** programs (smaller, informational)

This serves the business goal: **drive new registrations** while still serving existing families.

---

## 🎨 BRAND GUIDELINES

### Colors (Use these exact values)

```css
/* Primary Brand Colors */
--evolea-magenta: #DD48E0;      /* Primary accent - use for CTAs */
--evolea-purple: #BA53AD;        /* Secondary purple */
--evolea-lavender: #CD87F8;      /* Light purple */
--evolea-sage: #7BEDD5;          /* Mint/teal accent */
--evolea-cream: #FFFBF7;         /* Background cream */
--evolea-charcoal: #2D2D2D;      /* Text color */
--evolea-gray: #6B7280;          /* Secondary text */

/* Gradients */
--gradient-magenta: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
--gradient-purple: linear-gradient(135deg, #E9D5F5 0%, #F8F4FF 100%);
```

### Typography

- Headlines: Bold, gradient text effect using brand purple/magenta
- Body: Clean, readable, slightly rounded feel
- Keep existing font family from the site

### Design Principles

- Premium, professional feel (not childish despite being for children)
- Warm and welcoming
- Clean white space
- Soft shadows and rounded corners (1.5rem standard)
- Subtle hover animations

---

## 📊 CURRENT PROGRAM STATUS

**This is critical information - use these exact statuses:**

| Program | Status | Registration | Start Date |
|---------|--------|--------------|------------|
| **Mini Turnen** | Upcoming | OPEN NOW | January 2025 |
| **Mini Gallery** | Upcoming | OPEN NOW | March 2025 |
| **Mini Garten** | Running | Closed | Since Sept 2024 |
| **Mini Restaurant** | Running | Closed | Week 8 of 10 |
| **Schulberatung** | Ongoing | Contact-based | Always available |

### Visual Hierarchy (Most to Least Prominent)

1. **REGISTRATION OPEN** → Mini Turnen, Mini Gallery
   - Largest cards
   - Full magenta gradient background
   - White text
   - Prominent "Jetzt anmelden" button
   - Maximum visual impact

2. **CURRENTLY RUNNING** → Mini Garten, Mini Restaurant  
   - Smaller cards
   - Light green/sage background
   - Dark text
   - "Mehr Infos" button (for existing families)
   - Informational, not promotional

3. **SCHULBERATUNG** → Keep separate
   - Different nature (consultation, not program)
   - Simple text link or small card below main grid

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Locate the Target Section

Find this section in the homepage HTML (likely `index.html` or `_includes/home.html`):

```html
<!-- FIND AND REPLACE THIS ENTIRE SECTION -->
<section class="angebote">
  <!-- Contains "Unsere Angebote" heading -->
  <!-- Contains 4 program cards: Mini Garten, Mini Projekte, Mini Turnen, Schulberatung -->
</section>
```

The section currently shows 4 equal cards with emoji icons (🌱 🎨 ⚽ 🏫).

**DELETE this entire section** and replace with the new implementation below.

---

### Step 2: Add New CSS

Add this CSS to your stylesheet. If using a CSS file, add at the end. If using `<style>` tags, add within them.

```css
/* ===========================================
   EVOLEA TIMELINE ACTIVITIES SECTION
   =========================================== */

/* Section Container */
.timeline-activities {
  padding: 6rem 2rem 8rem;
  background: var(--evolea-cream, #FFFBF7);
  position: relative;
}

.timeline-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Section Header */
.timeline-header {
  text-align: center;
  margin-bottom: 4rem;
}

.timeline-header h2 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.timeline-subtitle {
  font-size: 1.125rem;
  color: #6B7280;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Activity Cards Grid */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

/* Base Card Styles */
.activity-card {
  border-radius: 1.5rem;
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.activity-card:hover {
  transform: translateY(-6px);
}

/* ---- REGISTRATION OPEN (Highest Priority) ---- */
.activity-card.registration-open {
  background: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
  color: white;
  box-shadow: 0 12px 40px rgba(221, 72, 224, 0.25);
  min-height: 340px;
}

.activity-card.registration-open:hover {
  box-shadow: 0 20px 50px rgba(221, 72, 224, 0.35);
}

.activity-card.registration-open .status-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.activity-card.registration-open .activity-title {
  color: white;
}

.activity-card.registration-open .activity-description {
  color: rgba(255, 255, 255, 0.9);
}

.activity-card.registration-open .meta-item {
  color: rgba(255, 255, 255, 0.85);
}

.activity-card.registration-open .btn-primary {
  background: white;
  color: #DD48E0;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.activity-card.registration-open .btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
}

.activity-card.registration-open .btn-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.2s ease;
}

.activity-card.registration-open .btn-link:hover {
  color: white;
}

/* ---- CURRENTLY RUNNING (Lower Priority) ---- */
.activity-card.currently-running {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  border: 1px solid #BBF7D0;
  color: #2D2D2D;
  min-height: 280px;
}

.activity-card.currently-running:hover {
  box-shadow: 0 12px 30px rgba(123, 237, 213, 0.2);
}

.activity-card.currently-running .status-badge {
  background: #7BEDD5;
  color: #2D2D2D;
}

.activity-card.currently-running .btn-info {
  background: transparent;
  color: #0D9488;
  border: 2px solid #7BEDD5;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.activity-card.currently-running .btn-info:hover {
  background: #7BEDD5;
  color: #2D2D2D;
}

/* Card Components */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1.25rem;
  width: fit-content;
}

.activity-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.activity-description {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.meta-icon {
  font-size: 1rem;
}

.activity-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-top: auto;
}

/* Schulberatung Standalone */
.schulberatung-standalone {
  text-align: center;
  margin-top: 3rem;
  padding-top: 3rem;
  border-top: 1px solid #E5E7EB;
}

.schulberatung-card {
  display: inline-block;
  background: white;
  border: 2px solid #BA53AD;
  border-radius: 1.5rem;
  padding: 2rem 3rem;
  max-width: 500px;
  transition: all 0.3s ease;
}

.schulberatung-card:hover {
  box-shadow: 0 8px 30px rgba(186, 83, 173, 0.15);
  transform: translateY(-4px);
}

.schulberatung-card h3 {
  color: #BA53AD;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.schulberatung-card p {
  color: #6B7280;
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

.schulberatung-card a {
  color: #BA53AD;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.schulberatung-card a:hover {
  color: #DD48E0;
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .activity-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .timeline-activities {
    padding: 4rem 1.5rem 5rem;
  }
  
  .activity-card {
    min-height: auto;
    padding: 1.75rem;
  }
  
  .activity-card.registration-open {
    min-height: auto;
  }
}

@media (max-width: 480px) {
  .timeline-header h2 {
    font-size: 1.75rem;
  }
  
  .activity-title {
    font-size: 1.25rem;
  }
  
  .activity-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .activity-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .activity-card.registration-open .btn-primary,
  .activity-card.currently-running .btn-info {
    width: 100%;
    text-align: center;
  }
}
```

---

### Step 3: Add New HTML

Replace the old "Unsere Angebote" section with this complete HTML:

```html
<!-- TIMELINE ACTIVITIES SECTION -->
<section class="timeline-activities" id="aktivitaeten">
  <div class="timeline-container">
    
    <!-- Section Header -->
    <header class="timeline-header">
      <h2>Was passiert jetzt</h2>
      <p class="timeline-subtitle">
        Aktuelle und kommende Programme für Kinder im Spektrum. 
        Melden Sie sich jetzt für unsere neuen Kurse an.
      </p>
    </header>

    <!-- Activity Cards Grid -->
    <div class="activity-grid">
      
      <!-- ============================================
           REGISTRATION OPEN - HIGHEST PRIORITY
           These cards get maximum visual prominence
           ============================================ -->
      
      <!-- Mini Turnen - Registration Open -->
      <article class="activity-card registration-open">
        <div class="status-badge">
          <span class="meta-icon">✨</span>
          <span>Anmeldung offen</span>
        </div>
        <h3 class="activity-title">Mini Turnen</h3>
        <p class="activity-description">
          Bewegung, Spass und motorische Förderung in einer kleinen, verständnisvollen Gruppe. 
          Ihr Kind entwickelt Körperbewusstsein und soziale Fähigkeiten durch spielerische Bewegung.
        </p>
        <div class="activity-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span>Start: Januar 2025</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👶</span>
            <span>3–6 Jahre</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">📍</span>
            <span>Zürich</span>
          </div>
        </div>
        <div class="activity-actions">
          <a href="/evolea-website/kontakt/?programm=mini-turnen" class="btn-primary">Jetzt anmelden</a>
          <a href="/evolea-website/angebote/mini-turnen/" class="btn-link">Mehr erfahren →</a>
        </div>
      </article>

      <!-- Mini Gallery - Registration Open -->
      <article class="activity-card registration-open">
        <div class="status-badge">
          <span class="meta-icon">✨</span>
          <span>Anmeldung offen</span>
        </div>
        <h3 class="activity-title">Mini Gallery</h3>
        <p class="activity-description">
          Kreative Kunstprojekte und gemeinsame Ausstellungen. Kinder entdecken ihre 
          künstlerische Seite und bauen soziale Kompetenzen durch gemeinsames Schaffen auf.
        </p>
        <div class="activity-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span>Start: März 2025</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👶</span>
            <span>4–8 Jahre</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">🎨</span>
            <span>Kreativ</span>
          </div>
        </div>
        <div class="activity-actions">
          <a href="/evolea-website/kontakt/?programm=mini-gallery" class="btn-primary">Jetzt anmelden</a>
          <a href="/evolea-website/angebote/mini-projekte/" class="btn-link">Mehr erfahren →</a>
        </div>
      </article>

      <!-- ============================================
           CURRENTLY RUNNING - LOWER PRIORITY
           Smaller cards for existing families
           ============================================ -->
      
      <!-- Mini Garten - Currently Running -->
      <article class="activity-card currently-running">
        <div class="status-badge">
          <span class="meta-icon">✅</span>
          <span>Laufend</span>
        </div>
        <h3 class="activity-title">Mini Garten</h3>
        <p class="activity-description">
          Spielerische Vorbereitung auf den Kindergarten in einer kleinen, geschützten Gruppe.
        </p>
        <div class="activity-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span>Seit September 2024</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👥</span>
            <span>Aktive Gruppe</span>
          </div>
        </div>
        <div class="activity-actions">
          <a href="/evolea-website/angebote/mini-garten/" class="btn-info">Informationen für Eltern</a>
        </div>
      </article>

      <!-- Mini Restaurant - Currently Running -->
      <article class="activity-card currently-running">
        <div class="status-badge">
          <span class="meta-icon">🔥</span>
          <span>Woche 8 von 10</span>
        </div>
        <h3 class="activity-title">Mini Restaurant</h3>
        <p class="activity-description">
          Soziale Kompetenz durch gemeinsames Kochen und Restaurantspiel. Das Programm läuft sehr erfolgreich!
        </p>
        <div class="activity-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span>10-Wochen-Programm</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👥</span>
            <span>6 Teilnehmer</span>
          </div>
        </div>
        <div class="activity-actions">
          <a href="/evolea-website/angebote/mini-projekte/" class="btn-info">Informationen für Eltern</a>
        </div>
      </article>

    </div>

    <!-- Schulberatung - Separate Section -->
    <div class="schulberatung-standalone">
      <div class="schulberatung-card">
        <h3>🏫 Schulberatung</h3>
        <p>Beratung und Unterstützung für Schulen, Lehrpersonen und Fachkräfte im Umgang mit Kindern im Spektrum.</p>
        <a href="/evolea-website/angebote/schulberatung/">Mehr erfahren →</a>
      </div>
    </div>

  </div>
</section>
```

---

### Step 4: Update Navigation (Optional but Recommended)

Add a direct link to the activities section in your main navigation.

Find your navigation menu and add:

```html
<a href="#aktivitaeten">Aktuell</a>
```

Or update "Angebote" to link directly to this section:

```html
<a href="#aktivitaeten">Angebote</a>
```

---

### Step 5: Create/Update Mini Projects Subpages

The Mini Projekte page should now prominently feature:
1. Mini Restaurant (current project, week 8)
2. Mini Gallery (upcoming, registration open)

Consider updating `/angebote/mini-projekte/` to reflect this structure.

---

## ✅ TESTING CHECKLIST

After implementation, verify these items:

### Visual Hierarchy
- [ ] Mini Turnen and Mini Gallery cards are visually dominant (purple gradient)
- [ ] Mini Garten and Mini Restaurant are clearly smaller/less prominent (green)
- [ ] Registration badges are clearly visible
- [ ] "Jetzt anmelden" buttons stand out on gradient cards

### Responsiveness
- [ ] On desktop: 2-column grid displays correctly
- [ ] On tablet (< 900px): Single column, cards stack
- [ ] On mobile (< 480px): Buttons go full-width, meta items stack

### Functionality
- [ ] "Jetzt anmelden" links go to contact page with program parameter
- [ ] "Mehr erfahren" links go to correct program pages
- [ ] Hover effects work on all cards
- [ ] Status badges display correctly

### Brand Consistency
- [ ] Purple gradient matches evolea brand (#DD48E0 to #BA53AD)
- [ ] Green accent matches evolea sage (#7BEDD5)
- [ ] Typography is consistent with rest of site
- [ ] Rounded corners are 1.5rem (24px)

### Content Accuracy
- [ ] Mini Turnen shows "Januar 2025" start
- [ ] Mini Gallery shows "März 2025" start
- [ ] Mini Restaurant shows "Woche 8 von 10"
- [ ] All program descriptions are accurate

---

## 🚨 IMPORTANT NOTES

### Do NOT:
- Use countdown timers (client specifically removed this)
- Make all cards the same size/prominence
- Hide the currently running programs entirely
- Use emoji icons for the program cards (keep text/SVG only)

### Do:
- Maintain clear visual hierarchy (open registration = biggest)
- Keep Schulberatung separate (different nature)
- Ensure mobile-first responsive design
- Use exact brand colors provided

---

## 📁 FILES TO MODIFY

1. **Homepage HTML** - Replace Angebote section
   - Likely: `index.html` or `_layouts/home.html` or `_includes/programs.html`

2. **CSS File** - Add timeline styles
   - Likely: `assets/css/main.css` or `css/styles.css`

3. **Navigation** (optional) - Add "Aktuell" link
   - Likely: `_includes/header.html` or `_includes/nav.html`

---

## 🎯 SUCCESS CRITERIA

The implementation is complete when:

1. Homepage immediately shows what programs have open registration
2. Parents can register for Mini Turnen or Mini Gallery in 1 click
3. Existing families can still find info about Mini Garten and Mini Restaurant
4. Visual design matches evolea brand guidelines
5. Site is fully responsive on all devices

---

**End of Implementation Guide**
