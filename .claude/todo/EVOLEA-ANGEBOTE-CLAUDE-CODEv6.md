# EVOLEA Website: Angebote Section Redesign

## Implementation Guide for Claude Code

**Repository:** cgjen-box/evolea-website  
**Live Site:** https://cgjen-box.github.io/evolea-website/  
**Date:** December 2024

---

## 📋 OVERVIEW

### What We're Building

Replace the current static "Unsere Angebote" section with a new dynamic layout that shows:

1. **TOP ROW (3 cards, prominent magenta gradient):** Programs with open registration
2. **BOTTOM ROW (3 cards, smaller):** Ongoing programs + future plans

### Final Structure

| Position | Program | Status | Style |
|----------|---------|--------|-------|
| Top Left | Mini Turnen | Anmeldung offen | Magenta gradient |
| Top Center | Mini Gallery | Anmeldung offen | Magenta gradient |
| Top Right | Mini Garten | Anmeldung offen | Magenta gradient |
| Bottom Left | Mini Restaurant | Läuft · Keine Anmeldung | Grey background |
| Bottom Center | EVOLEA Cafe | Offen für alle | Grey background |
| Bottom Right | Tagessonderschule | In Planung | Dashed purple border |

---

## 🎨 BRAND COLORS

Use these exact values:

```css
/* Primary */
--evolea-magenta: #DD48E0;
--evolea-purple: #BA53AD;
--evolea-cream: #FFFBF7;
--evolea-charcoal: #2D2D2D;
--evolea-gray: #6B7280;

/* Card Backgrounds */
--gradient-open: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
--gradient-ongoing: linear-gradient(135deg, #F5F5F4 0%, #E7E5E4 100%);
--gradient-coming: linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 100%);

/* Borders */
--border-ongoing: #D6D3D1;
--border-coming: #E879F9;
```

---

## 🔧 STEP 1: ADD CSS

Add this CSS to your stylesheet (e.g., `assets/css/main.css` or `css/styles.css`):

```css
/* ===========================================
   EVOLEA ANGEBOTE SECTION - NEW DESIGN
   =========================================== */

/* Section Container */
.angebote-section {
  padding: 5rem 2rem 6rem;
  background: #FFFBF7;
}

.angebote-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Section Header */
.angebote-header {
  text-align: center;
  margin-bottom: 3rem;
}

.angebote-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #BA53AD;
  margin-bottom: 1rem;
}

.angebote-title {
  font-size: clamp(2rem, 5vw, 2.25rem);
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.2;
  background: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.angebote-subtitle {
  font-size: 1.05rem;
  color: #6B7280;
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.7;
}

/* Card Grids */
.angebote-grid-top {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 0.5rem;
}

.angebote-grid-bottom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

/* Divider */
.angebote-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0 1.5rem;
}

.angebote-divider-line {
  flex: 1;
  height: 1px;
  background: #E5E7EB;
}

.angebote-divider-text {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #9CA3AF;
}

/* ========== CARD STYLES ========== */

/* Base Card */
.angebot-card {
  border-radius: 1.25rem;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Open Registration Cards (Top Row) */
.angebot-card.card-open {
  background: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
  color: white;
  box-shadow: 0 12px 32px rgba(221, 72, 224, 0.2);
  min-height: 290px;
}

.angebot-card.card-open:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 48px rgba(221, 72, 224, 0.35);
}

/* Ongoing Cards (Bottom Row - Grey) */
.angebot-card.card-ongoing {
  background: linear-gradient(135deg, #F5F5F4 0%, #E7E5E4 100%);
  border: 1px solid #D6D3D1;
  color: #2D2D2D;
  border-radius: 1rem;
  padding: 1.5rem;
}

.angebot-card.card-ongoing:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

/* Coming Soon Card (Bottom Row - Dashed) */
.angebot-card.card-coming {
  background: linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 100%);
  border: 1.5px dashed #E879F9;
  color: #2D2D2D;
  border-radius: 1rem;
  padding: 1.5rem;
}

.angebot-card.card-coming:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(232, 121, 249, 0.15);
  border-style: solid;
}

/* ========== CARD COMPONENTS ========== */

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
  margin-bottom: 1rem;
}

.status-badge.badge-open {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
}

.status-badge.badge-ongoing {
  background: #E7E5E4;
  color: #78716C;
  border: 1px solid #D6D3D1;
  font-size: 0.65rem;
  padding: 0.3rem 0.65rem;
  margin-bottom: 0.875rem;
}

.status-badge.badge-coming {
  background: #FAE8FF;
  color: #A21CAF;
  border: 1px solid #E879F9;
  font-size: 0.65rem;
  padding: 0.3rem 0.65rem;
  margin-bottom: 0.875rem;
}

/* Card Icon */
.angebot-icon {
  font-size: 1.75rem;
  margin-bottom: 0.625rem;
}

.card-open .angebot-icon {
  filter: grayscale(100%) brightness(10);
}

.card-ongoing .angebot-icon,
.card-coming .angebot-icon {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

/* Card Title */
.angebot-title {
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.card-open .angebot-title {
  font-size: 1.25rem;
}

.card-ongoing .angebot-title,
.card-coming .angebot-title {
  font-size: 1.05rem;
  color: #2D2D2D;
  margin-bottom: 0.4rem;
}

/* Card Description */
.angebot-description {
  line-height: 1.55;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.card-open .angebot-description {
  font-size: 0.9rem;
  opacity: 0.9;
}

.card-ongoing .angebot-description,
.card-coming .angebot-description {
  font-size: 0.825rem;
  color: #6B7280;
  margin-bottom: 0.75rem;
}

/* Card Meta */
.angebot-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  font-size: 0.8rem;
}

.card-open .angebot-meta {
  opacity: 0.85;
}

.card-ongoing .angebot-detail,
.card-coming .angebot-detail {
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-bottom: 1rem;
}

.card-coming .angebot-detail {
  color: #A21CAF;
  font-weight: 500;
}

/* Card Actions */
.angebot-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
}

/* ========== BUTTONS ========== */

/* Primary Button (White on gradient) */
.btn-angebot-primary {
  background: white;
  color: #DD48E0;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 0.625rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-angebot-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
}

/* Secondary Button (Underline) */
.btn-angebot-secondary {
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 0.875rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.btn-angebot-secondary:hover {
  color: white;
}

/* Info Button (Grey outline) */
.btn-angebot-info {
  background: transparent;
  color: #6B7280;
  border: 1.5px solid #D1D5DB;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-angebot-info:hover {
  border-color: #BA53AD;
  color: #BA53AD;
}

/* Notify Button (Purple outline) */
.btn-angebot-notify {
  background: transparent;
  color: #C026D3;
  border: 1.5px solid #E879F9;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-angebot-notify:hover {
  background: #FAE8FF;
}

/* ========== RESPONSIVE ========== */

@media (max-width: 900px) {
  .angebote-grid-top,
  .angebote-grid-bottom {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .angebote-section {
    padding: 3rem 1.5rem 4rem;
  }
  
  .angebot-card.card-open {
    min-height: auto;
  }
}

@media (max-width: 480px) {
  .angebote-title {
    font-size: 1.75rem;
  }
  
  .angebot-card {
    padding: 1.5rem;
  }
  
  .angebot-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .angebot-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-angebot-primary,
  .btn-angebot-info,
  .btn-angebot-notify {
    width: 100%;
    text-align: center;
  }
}
```

---

## 🏗️ STEP 2: REPLACE HTML

Find the current "Unsere Angebote" section in your homepage HTML and **replace it entirely** with:

```html
<!-- ANGEBOTE SECTION - NEW DESIGN -->
<section class="angebote-section" id="angebote">
  <div class="angebote-container">
    
    <!-- Header -->
    <header class="angebote-header">
      <span class="angebote-label">Angebote</span>
      <h2 class="angebote-title">Unsere Angebote</h2>
      <p class="angebote-subtitle">
        Evidenzbasierte Programme, die jedes Kind dort abholen, wo es steht.
      </p>
    </header>

    <!-- ===== TOP ROW: Registration Open (3 cards) ===== -->
    <div class="angebote-grid-top">
      
      <!-- Mini Turnen -->
      <article class="angebot-card card-open">
        <div class="status-badge badge-open">
          <span>✨</span>
          <span>Anmeldung offen</span>
        </div>
        <div class="angebot-icon">⚽</div>
        <h3 class="angebot-title">Mini Turnen</h3>
        <p class="angebot-description">
          Bewegung, Spass und motorische Förderung in einer kleinen, verständnisvollen Gruppe.
        </p>
        <div class="angebot-meta">
          <span>📅 Start: Januar 2025</span>
          <span>👶 3–6 Jahre</span>
        </div>
        <div class="angebot-actions">
          <a href="/evolea-website/kontakt/?programm=mini-turnen" class="btn-angebot-primary">Jetzt anmelden</a>
          <a href="/evolea-website/angebote/mini-turnen/" class="btn-angebot-secondary">Mehr →</a>
        </div>
      </article>

      <!-- Mini Gallery -->
      <article class="angebot-card card-open">
        <div class="status-badge badge-open">
          <span>✨</span>
          <span>Anmeldung offen</span>
        </div>
        <div class="angebot-icon">🎨</div>
        <h3 class="angebot-title">Mini Gallery</h3>
        <p class="angebot-description">
          Kreative Kunstprojekte und gemeinsame Ausstellungen. Soziale Kompetenz durch Schaffen.
        </p>
        <div class="angebot-meta">
          <span>📅 Start: März 2025</span>
          <span>👶 4–8 Jahre</span>
        </div>
        <div class="angebot-actions">
          <a href="/evolea-website/kontakt/?programm=mini-gallery" class="btn-angebot-primary">Jetzt anmelden</a>
          <a href="/evolea-website/angebote/mini-projekte/" class="btn-angebot-secondary">Mehr →</a>
        </div>
      </article>

      <!-- Mini Garten -->
      <article class="angebot-card card-open">
        <div class="status-badge badge-open">
          <span>✨</span>
          <span>Anmeldung offen</span>
        </div>
        <div class="angebot-icon">🌱</div>
        <h3 class="angebot-title">Mini Garten</h3>
        <p class="angebot-description">
          Spielerische Vorbereitung auf den Kindergarten in einer kleinen, geschützten Gruppe.
        </p>
        <div class="angebot-meta">
          <span>📅 Laufend</span>
          <span>👶 3–5 Jahre</span>
        </div>
        <div class="angebot-actions">
          <a href="/evolea-website/kontakt/?programm=mini-garten" class="btn-angebot-primary">Jetzt anmelden</a>
          <a href="/evolea-website/angebote/mini-garten/" class="btn-angebot-secondary">Mehr →</a>
        </div>
      </article>

    </div>

    <!-- Divider -->
    <div class="angebote-divider">
      <div class="angebote-divider-line"></div>
      <span class="angebote-divider-text">Weitere Angebote</span>
      <div class="angebote-divider-line"></div>
    </div>

    <!-- ===== BOTTOM ROW: Ongoing + Coming Soon (3 cards) ===== -->
    <div class="angebote-grid-bottom">
      
      <!-- Mini Restaurant - Ongoing -->
      <article class="angebot-card card-ongoing">
        <div class="status-badge badge-ongoing">
          <span>🔥</span>
          <span>Läuft · Keine Anmeldung</span>
        </div>
        <div class="angebot-icon">🍳</div>
        <h3 class="angebot-title">Mini Restaurant</h3>
        <p class="angebot-description">
          Soziale Kompetenz durch gemeinsames Kochen und Restaurantspiel.
        </p>
        <div class="angebot-detail">Woche 8 von 10</div>
        <div class="angebot-actions">
          <a href="/evolea-website/angebote/mini-projekte/" class="btn-angebot-info">Für Teilnehmer</a>
        </div>
      </article>

      <!-- EVOLEA Cafe - Ongoing -->
      <article class="angebot-card card-ongoing">
        <div class="status-badge badge-ongoing">
          <span>☕</span>
          <span>Offen für alle</span>
        </div>
        <div class="angebot-icon">☕</div>
        <h3 class="angebot-title">EVOLEA Cafe</h3>
        <p class="angebot-description">
          Austausch und Gemeinschaft für Eltern. Jeden 2. Mittwoch im Monat um 20:00 Uhr.
        </p>
        <div class="angebot-detail">Keine Anmeldung nötig</div>
        <div class="angebot-actions">
          <a href="/evolea-website/kontakt/" class="btn-angebot-info">Mehr erfahren</a>
        </div>
      </article>

      <!-- Tagessonderschule - Coming Soon -->
      <article class="angebot-card card-coming">
        <div class="status-badge badge-coming">
          <span>🚀</span>
          <span>In Planung</span>
        </div>
        <div class="angebot-icon">🏫</div>
        <h3 class="angebot-title">Tagessonderschule</h3>
        <p class="angebot-description">
          Sonderschule Typ A für Kinder im Spektrum. Kindergarten bis Primarschulalter.
        </p>
        <div class="angebot-detail">📅 2025/2026</div>
        <div class="angebot-actions">
          <a href="/evolea-website/ueber-uns/" class="btn-angebot-notify">Mehr erfahren</a>
        </div>
      </article>

    </div>

  </div>
</section>
```

---

## 📁 FILES TO MODIFY

1. **Homepage HTML**
   - Location: `index.html` or `_layouts/home.html` or `_includes/angebote.html`
   - Action: Replace entire "Unsere Angebote" section

2. **CSS File**
   - Location: `assets/css/main.css` or `css/styles.css`
   - Action: Add all new CSS at the end of file

3. **If using Jekyll/includes:**
   - Check `_includes/` folder for any partial files
   - May need to update `_data/` files if content is data-driven

---

## ✅ TESTING CHECKLIST

After implementation, verify:

### Visual
- [ ] Top 3 cards have magenta gradient background
- [ ] Top 3 cards have "Anmeldung offen" badge with ✨
- [ ] Bottom left 2 cards have grey background
- [ ] Bottom right card has dashed purple border
- [ ] Divider line shows "Weitere Angebote"
- [ ] All hover effects work (cards lift up)

### Content
- [ ] Mini Turnen: "Start: Januar 2025", "3–6 Jahre"
- [ ] Mini Gallery: "Start: März 2025", "4–8 Jahre"
- [ ] Mini Garten: "Laufend", "3–5 Jahre"
- [ ] Mini Restaurant: "Läuft · Keine Anmeldung", "Woche 8 von 10"
- [ ] EVOLEA Cafe: "Offen für alle", "Jeden 2. Mittwoch im Monat um 20:00 Uhr"
- [ ] Tagessonderschule: "In Planung", "2025/2026"

### Buttons
- [ ] "Jetzt anmelden" buttons are white with magenta text
- [ ] "Mehr →" links are underlined white text
- [ ] "Für Teilnehmer" / "Mehr erfahren" have grey outline
- [ ] "Mehr erfahren" on Tagessonderschule has purple outline

### Responsive
- [ ] On mobile (< 900px): Cards stack in single column
- [ ] On mobile (< 480px): Buttons go full width
- [ ] All text remains readable on small screens

### Links
- [ ] "Jetzt anmelden" links go to contact page with program parameter
- [ ] "Mehr →" links go to correct program pages
- [ ] All links work correctly

---

## 🚨 IMPORTANT NOTES

### DO:
- Keep the section ID as `angebote` for anchor links
- Use exact brand colors provided
- Maintain the visual hierarchy (open > ongoing > coming)
- Test on mobile devices

### DO NOT:
- Add countdown timers
- Change the card order
- Use different icons/emojis
- Remove the divider section

---

## 🔄 FUTURE UPDATES

When program status changes, update these elements:

1. **When Mini Restaurant ends:**
   - Remove Mini Restaurant card
   - Or move to a "Vergangene Programme" section

2. **When new program opens for registration:**
   - Move card to top row
   - Change class from `card-ongoing` or `card-coming` to `card-open`
   - Update badge to "Anmeldung offen"

3. **When Tagessonderschule launches:**
   - Update status badge
   - Change card style as appropriate

---

**End of Implementation Guide**
