# EVOLEA Website: Comprehensive Update

## Instructions for Claude Code

**Repository:** cgjen-box/evolea-website  
**Live Site:** https://cgjen-box.github.io/evolea-website/  
**Date:** December 2024

---

## 📋 OVERVIEW OF CHANGES

This update includes multiple changes across the website:

| # | Change | Location |
|---|--------|----------|
| 1 | Rename "Mini Gallery" → "Mini Museum" | Entire site |
| 2 | Simplify buttons on homepage cards | Homepage Angebote section |
| 3 | Add time information to cards | Homepage Angebote section |
| 4 | Create new Mini Museum subpage | New page |
| 5 | Update Mini Restaurant page | Mini Restaurant page |
| 6 | Replace Mini Projekte image | Mini Projekte page |
| 7 | Update image generation guidelines | Agent instructions |

---

## 🔧 CHANGE 1: Rename Mini Gallery → Mini Museum

### What to change:
Replace ALL instances of "Mini Gallery" with "Mini Museum" across the entire site.

### Files to update:
- Homepage (index.html)
- Navigation menu
- Footer links
- Any references in other pages

### Search and replace:
```
"Mini Gallery" → "Mini Museum"
"mini-gallery" → "mini-museum"
"mini gallery" → "mini museum"
```

---

## 🔧 CHANGE 2: Simplify Homepage Angebote Buttons

### Current state:
Cards have two buttons: "Jetzt anmelden" + "Mehr →"

### New state:
Cards have only ONE button: "Mehr →"

### Also remove:
- "Kostenlose Erstberatung" button (if present anywhere)
- "Jetzt anmelden" buttons from homepage cards

### Updated HTML for each card:

**Replace the actions section in each card:**

```html
<!-- OLD -->
<div class="angebot-actions">
  <a href="..." class="btn-angebot-primary">Jetzt anmelden</a>
  <a href="..." class="btn-angebot-secondary">Mehr →</a>
</div>

<!-- NEW -->
<div class="angebot-actions">
  <a href="..." class="btn-angebot-primary">Mehr →</a>
</div>
```

### Updated button style:
The "Mehr →" button should now be the primary button (white on gradient cards).

```css
/* Update button for simplified design */
.card-open .btn-angebot-primary {
  background: white;
  color: #DD48E0;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 0.625rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.card-open .btn-angebot-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
}
```

---

## 🔧 CHANGE 3: Add Time Information to Cards

### Add "Zeit" information to each program card:

| Program | Zeit |
|---------|------|
| Mini Turnen | Mittwochs 18:30 |
| Mini Museum | Samstag 09:00, ca. jede zweite Woche |
| Mini Garten | Montag 13:00–17:00 |

### Updated HTML for meta section:

**Mini Turnen:**
```html
<div class="angebot-meta">
  <span>📅 Start: Januar 2025</span>
  <span>🕐 Mittwochs 18:30</span>
  <span>👶 3–6 Jahre</span>
</div>
```

**Mini Museum:**
```html
<div class="angebot-meta">
  <span>📅 Start: Februar 2026</span>
  <span>🕐 Samstag 09:00, ca. jede 2. Woche</span>
  <span>👶 5–8 Jahre</span>
</div>
```

**Mini Garten:**
```html
<div class="angebot-meta">
  <span>📅 Laufend</span>
  <span>🕐 Montag 13:00–17:00</span>
  <span>👶 3–5 Jahre</span>
</div>
```

---

## 🔧 CHANGE 4: Create Mini Museum Subpage

### Create new file: `/angebote/mini-museum/index.html`

### Page structure (same as Mini Restaurant):

```html
<!-- Mini Museum Hero Section -->
<section class="program-hero">
  <div class="hero-video-container">
    <!-- Use same video filter/overlay as homepage -->
    <video autoplay muted loop playsinline>
      <source src="/videos/mini-museum.mp4" type="video/mp4">
    </video>
    <div class="hero-overlay"></div>
  </div>
  
  <div class="hero-content">
    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <a href="/evolea-website/">Startseite</a> / 
      <a href="/evolea-website/angebote/">Angebote</a> / 
      <a href="/evolea-website/angebote/mini-projekte/">Mini Projekte</a> / 
      <span>Mini Museum</span>
    </nav>
    
    <!-- Date Badge -->
    <div class="date-badge">
      <span>💜</span>
      <span>Februar – April 2026</span>
    </div>
    
    <!-- Title -->
    <h1>Mini Museum</h1>
    <p class="subtitle">Wir werden kreativ!</p>
    
    <!-- Description -->
    <p class="description">
      In diesem inklusiven Projekt gestalten Kinder ihr eigenes Museum. 
      Sie wählen Themen, sammeln Kunstwerke, erstellen Ausstellungen und 
      führen Besucher durch ihre Galerie.
    </p>
    
    <!-- Status Box -->
    <div class="status-box">
      <span class="status-dot status-open"></span>
      <div>
        <strong>Anmeldung offen</strong>
        <p>Freie Plätze verfügbar. Melden Sie sich jetzt an.</p>
      </div>
    </div>
    
    <!-- Buttons -->
    <div class="hero-buttons">
      <a href="/evolea-website/kontakt/?programm=mini-museum" class="btn-primary">
        Jetzt anmelden →
      </a>
      <a href="#programm" class="btn-secondary">
        Programm ansehen
      </a>
    </div>
    
    <!-- Stats Badge -->
    <div class="stats-badge">
      <span class="stats-number">6</span>
      <span class="stats-label">Halbtage</span>
    </div>
  </div>
</section>

<!-- Key Facts Section -->
<section class="key-facts">
  <h2>Key Facts</h2>
  <div class="facts-grid">
    <div class="fact">
      <span class="fact-label">Zielgruppe</span>
      <span class="fact-value">Kinder im Spektrum 5–8 Jahre</span>
    </div>
    <div class="fact">
      <span class="fact-label">Intensität</span>
      <span class="fact-value">Alle 1–2 Wochen am Samstagmorgen</span>
    </div>
    <div class="fact">
      <span class="fact-label">Start</span>
      <span class="fact-value">28. Februar 2026</span>
    </div>
  </div>
</section>

<!-- Konzept Section -->
<section class="konzept" id="programm">
  <h2>Das Konzept</h2>
  <p class="intro">Ein Ort an dem Kinder wachsen und Familien aufatmen können.</p>
  
  <div class="konzept-content">
    <p>
      Ein inklusives Projekt für <strong>junge Kunst-Profis.</strong> 
      Viele Freizeitangebote sind für Kinder im Autismus-Spektrum oft schwer 
      zugänglich – zu unübersichtlich, zu laut, zu wenig individuell.
    </p>
    <p>
      Unser Mini Museum bietet einen sicheren, klar strukturierten Rahmen, 
      in dem soziales Lernen spielerisch und alltagsnah gelingt. Die Kinder 
      gestalten gemeinsam ein eigenes kleines Museum: Sie wählen ein Thema, 
      sammeln Gegenstände und eigene Kunstwerke, gestalten Ausstellungsräume, 
      erstellen Beschriftungen und üben, Besucher:innen durch die Ausstellung 
      zu führen.
    </p>
    <p>
      Dabei werden sie individuell von unseren Fachpersonen begleitet, erhalten 
      Orientierung und passende Unterstützung. So können sie soziale Kompetenzen 
      entfalten, Verantwortung übernehmen und sich in neuen Rollen ausprobieren – 
      als Künstler:in, Museumsführer:in oder Kurator:in – mit Freude, Struktur 
      und echten Erfolgserlebnissen.
    </p>
    <p>
      Zum Abschluss öffnen sie ihr Mini Museum für Familie und Freunde, führen 
      durch die Ausstellung und feiern gemeinsam, was sie geschaffen haben.
    </p>
  </div>
</section>

<!-- Projekt Ziele Section -->
<section class="ziele">
  <h2>Projekt Ziele</h2>
  <p class="intro">
    Kinder erleben bei uns, wie sie im Miteinander stark sein können – 
    Schritt für Schritt, mit Freude und Erfolg.
  </p>
  
  <ul class="ziele-list">
    <li>
      <strong>Förderung von Kommunikation und sozialer Interaktion</strong>
      <p>Die Kinder lernen, im Mini Museum miteinander zu sprechen, Fragen zu stellen 
      und zu beantworten, Interessen der „Besucher:innen" zu verstehen und sich bei 
      gemeinsamen Aufgaben abzustimmen.</p>
    </li>
    <li>
      <strong>Training von Alltagsfähigkeiten</strong>
      <p>Sie üben Aufgaben wie Materialien vorbereiten, Ausstellungsstücke sortieren, 
      Räume strukturieren und aufräumen sowie einfache organisatorische Tätigkeiten – 
      Fähigkeiten, die auch im Alltag hilfreich sind.</p>
    </li>
    <li>
      <strong>Stärkung von Feinmotorik, Selbstständigkeit und Selbstwirksamkeit</strong>
      <p>Beim Zeichnen, Basteln, Bauen von kleinen Ausstellungselementen oder beim 
      Schreiben bzw. Malen von Beschriftungen verbessern die Kinder ihre motorischen 
      Fähigkeiten und erleben, dass sie selbst etwas bewirken und gestalten können.</p>
    </li>
    <li>
      <strong>Spielerisches Lernen in einem strukturierten, sicheren Rahmen</strong>
      <p>Durch klare Abläufe, Bildkarten und Rituale gewinnen die Kinder Sicherheit 
      und Orientierung und können sich so auf das gemeinsame Ziel konzentrieren: 
      ihr eigenes Mini Museum.</p>
    </li>
    <li>
      <strong>Einführung in die Welt des Museums</strong>
      <p>Die Kinder schlüpfen in verschiedene Rollen: Sie gestalten Exponate, richten 
      Ausstellungsflächen ein, begrüssen Besucher:innen, erklären ihre Werke und führen 
      durch die Räume. So erleben sie, wie aus vielen kleinen Aufgaben ein grosses 
      Ganzes wird – ihr eigenes Museum.</p>
    </li>
  </ul>
</section>

<!-- Ablauf Section -->
<section class="ablauf">
  <h2>Der Ablauf</h2>
  <p class="intro">Einzelne Tage von unserem Mini Museum.</p>
  
  <div class="ablauf-timeline">
    <div class="ablauf-item">
      <div class="ablauf-number">1</div>
      <div class="ablauf-content">
        <h3>Wir entdecken die Welt der Kunst</h3>
        <p>Die Kinder lernen, was ein Museum ist, besuchen gemeinsam eine Ausstellung 
        und gestalten danach erste eigene Kunstwerke inspiriert von ihren Eindrücken.</p>
      </div>
    </div>
    <div class="ablauf-item">
      <div class="ablauf-number">2</div>
      <div class="ablauf-content">
        <h3>Wir gestalten Kunst aus der Natur</h3>
        <p>Bei einem Spaziergang sammeln die Kinder Naturmaterialien und gestalten 
        daraus kreative Werke wie z.B. Mandalas oder Mobiles.</p>
      </div>
    </div>
    <div class="ablauf-item">
      <div class="ablauf-number">3</div>
      <div class="ablauf-content">
        <h3>Wir erforschen Farben und stellen sie selbst her</h3>
        <p>Die Kinder experimentieren mit Farben, mischen neue Farbtöne und stellen 
        Naturfarben aus Lebensmitteln her, mit denen sie eigene Bilder malen.</p>
      </div>
    </div>
    <div class="ablauf-item">
      <div class="ablauf-number">4</div>
      <div class="ablauf-content">
        <h3>Wir formen Skulpturen aus verschiedenen Materialien</h3>
        <p>Die Kinder entdecken 3D-Kunst und formen Skulpturen aus diversen Materialien. 
        Durch das Formen, Drücken und Modellieren erleben sie Kunst mit ihren Händen.</p>
      </div>
    </div>
    <div class="ablauf-item">
      <div class="ablauf-number">5</div>
      <div class="ablauf-content">
        <h3>Wir gestalten Gesichter und basteln Masken</h3>
        <p>Die Kinder lernen Gesichter und Emotionen kennen, zeichnen verschiedene 
        Gesichtsausdrücke und basteln eigene Masken.</p>
      </div>
    </div>
    <div class="ablauf-item highlight">
      <div class="ablauf-number">6</div>
      <div class="ablauf-content">
        <h3>Unsere eigenes Museum eröffnet</h3>
        <p>Die Kinder richten eine eigene Galerie ein, präsentieren ihre Kunstwerke 
        und feiern die Eröffnung ihres gemeinsamen Projekts.</p>
        <span class="ablauf-note">Mit Eltern, 13:00–17:00</span>
      </div>
    </div>
  </div>
</section>

<!-- Termine Section -->
<section class="termine">
  <h2>Termine</h2>
  <p class="intro">
    Wir treffen uns jeweils um <strong>09:00 Uhr</strong> an der 
    <strong>Stapferstrasse 10, 8006 Zürich</strong>. 
    Bitte seid 5 Minuten vor Beginn vor Ort.
  </p>
  <p class="note">
    <strong>Wichtig:</strong> Tag 6 beginnt um 13:00 Uhr und findet mit 
    Begleitung der Eltern statt, an einem anderen Ort.
  </p>
  
  <div class="termine-grid">
    <div class="termin-card">
      <h4>Tag 1: Wir entdecken die Welt der Kunst</h4>
      <p><strong>Datum:</strong> Samstag 28.02.2026</p>
      <p><strong>Uhrzeit:</strong> 09:00–12:00</p>
      <p><strong>Adresse:</strong> Stapferstrasse 10, 8006 Zürich</p>
    </div>
    <div class="termin-card">
      <h4>Tag 2: Wir gestalten Kunst aus der Natur</h4>
      <p><strong>Datum:</strong> Samstag 14.03.2026</p>
      <p><strong>Uhrzeit:</strong> 09:00–12:00</p>
      <p><strong>Adresse:</strong> Stapferstrasse 10, 8006 Zürich</p>
    </div>
    <div class="termin-card">
      <h4>Tag 3: Wir erforschen Farben</h4>
      <p><strong>Datum:</strong> Samstag 28.03.2026</p>
      <p><strong>Uhrzeit:</strong> 09:00–12:00</p>
      <p><strong>Adresse:</strong> Stapferstrasse 10, 8006 Zürich</p>
    </div>
    <div class="termin-card">
      <h4>Tag 4: Wir formen Skulpturen</h4>
      <p><strong>Datum:</strong> Samstag 11.04.2026</p>
      <p><strong>Uhrzeit:</strong> 09:00–12:00</p>
      <p><strong>Adresse:</strong> Stapferstrasse 10, 8006 Zürich</p>
    </div>
    <div class="termin-card">
      <h4>Tag 5: Wir basteln Masken</h4>
      <p><strong>Datum:</strong> Samstag 25.04.2026</p>
      <p><strong>Uhrzeit:</strong> 09:00–12:00</p>
      <p><strong>Adresse:</strong> Stapferstrasse 10, 8006 Zürich</p>
    </div>
    <div class="termin-card highlight">
      <h4>Tag 6: Museum Eröffnung 🎉</h4>
      <p><strong>Datum:</strong> Sonntag 26.04.2026</p>
      <p><strong>Uhrzeit:</strong> 13:00–17:00</p>
      <p><strong>Adresse:</strong> Kemptpark 34, 8310 Kemptthal</p>
      <p class="special">Mit Familie und Freunden</p>
    </div>
  </div>
</section>

<!-- Aufnahmekriterien Section -->
<section class="aufnahme">
  <h2>Aufnahmekriterien</h2>
  <p>
    Die Teilnahme an einem Mini Projekt erfolgt jeweils projektbezogen und beginnt 
    mit einem persönlichen Gespräch mit den Bezugspersonen, sowie einem Kennenlernen 
    des Kindes.
  </p>
  <p>Zur Orientierung stellen wir eine Checkliste zur Verfügung:</p>
  <ul>
    <li>Funktionale Kommunikation</li>
    <li>Interesse an sozialen Kontakten</li>
    <li>Verständnis zum Befolgen von Anweisungen und Regeln</li>
    <li>Eine gewisse Selbständigkeit (z.B. Händewaschen, An- und Ausziehen)</li>
    <li>Kein selbst- und fremdverletzendes Verhalten</li>
  </ul>
  <p class="note">
    Diese Punkte dienen als Richtlinie und ersetzen keine individuelle Beurteilung. 
    Die endgültige Entscheidung wird stets situationsbezogen und im Sinne des Kindes getroffen.
  </p>
</section>

<!-- CTA Section -->
<section class="cta">
  <h2>Interesse geweckt?</h2>
  <p>Wir freuen uns auf Sie!</p>
  <a href="/evolea-website/kontakt/?programm=mini-museum" class="btn-cta">
    Jetzt anmelden →
  </a>
</section>
```

---

## 🔧 CHANGE 5: Update Mini Restaurant Page

### Remove "Auf Warteliste setzen" button

Find and remove this button:
```html
<!-- REMOVE THIS -->
<a href="..." class="btn-warteliste">Auf Warteliste setzen →</a>
```

### Apply same video filter as homepage

The homepage hero video has a pink/purple gradient overlay. Apply the same to Mini Restaurant.

**Add/Update CSS:**
```css
/* Video overlay filter - same as homepage */
.program-hero .hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(221, 72, 224, 0.3) 0%,
    rgba(186, 83, 173, 0.4) 50%,
    rgba(123, 94, 167, 0.3) 100%
  );
  mix-blend-mode: multiply;
  pointer-events: none;
}

/* Additional pink tint */
.program-hero .hero-video-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 200, 220, 0.15);
  pointer-events: none;
}
```

---

## 🔧 CHANGE 6: Replace Mini Projekte Image

### Current issue:
The current image shows children with head coverings (hijab), which doesn't reflect Swiss demographics.

### Action:
Generate a new image that is more representative of Swiss children.

### Image requirements:
- Children aged 5-8 years
- Diverse but Swiss-appropriate (no religious head coverings)
- Warm, bright, playful setting
- Children doing creative activities (painting, crafting)
- Soft, warm colors matching EVOLEA brand (cream, pink, purple tones)
- Professional quality, not stock-photo feeling

### Prompt for image generation:
```
Swiss children aged 5-8 years sitting around a wooden table doing creative art 
projects together. Diverse group of 4 children - mix of boys and girls with 
different hair colors (blonde, brown, dark). Warm, bright classroom or workshop 
setting with natural light. Children are smiling, painting and crafting together. 
Soft cream and pink tones. Watercolor illustration style. Warm, inclusive, 
professional. EVOLEA brand aesthetic.
```

---

## 🔧 CHANGE 7: Update Image Generation Guidelines

### Add to project documentation / agent instructions:

```markdown
## Image Generation Guidelines for EVOLEA

### Cultural Context
- EVOLEA is based in Zürich, Switzerland
- Images should reflect Swiss/Central European demographics
- Avoid religious symbols or head coverings on children
- Show diversity through hair colors, features - not religious attire

### Style Requirements
- Warm, soft color palette (cream, pink, purple, mint)
- Watercolor or soft illustration style preferred
- Bright, natural lighting
- Professional but warm feeling
- Not overly "stock photo" or generic

### Always Generate 2 Options
When generating images for EVOLEA, ALWAYS provide 2 different versions 
for the user to choose from. This allows for better selection and ensures 
the final image matches the brand perfectly.

### Subject Guidelines
- Children should appear ages 3-8 (depending on program)
- Show genuine joy and engagement
- Include activities relevant to the program
- Keep backgrounds simple but warm
- Butterflies can be included as brand element

### Brand Colors to Incorporate
- Cream: #FFFBF7
- Magenta: #DD48E0
- Purple: #BA53AD
- Mint: #7BEDD5
- Soft pinks and lavenders
```

---

## 📁 FILES TO CREATE/MODIFY

### New Files:
1. `/angebote/mini-museum/index.html` - New Mini Museum subpage

### Files to Modify:
1. `index.html` - Homepage changes (buttons, times, rename)
2. `/angebote/mini-projekte/index.html` - New image, rename Gallery→Museum
3. `/angebote/mini-restaurant/index.html` - Remove button, add video filter
4. CSS file - Add video overlay styles
5. Navigation - Update links from mini-gallery to mini-museum
6. Any hardcoded references to "Mini Gallery"

---

## ✅ COMPLETE CHECKLIST

### Homepage Angebote Section:
- [ ] Mini Gallery renamed to Mini Museum everywhere
- [ ] "Jetzt anmelden" buttons removed
- [ ] Only "Mehr →" button remains
- [ ] "Kostenlose Erstberatung" removed
- [ ] Mini Turnen shows: "Mittwochs 18:30"
- [ ] Mini Museum shows: "Samstag 09:00, ca. jede 2. Woche"
- [ ] Mini Garten shows: "Montag 13:00–17:00"
- [ ] Mini Museum card links to new /angebote/mini-museum/ page

### Mini Museum Page:
- [ ] New page created at /angebote/mini-museum/
- [ ] Same structure as Mini Restaurant page
- [ ] Video with same pink overlay as homepage
- [ ] All content from evolea.ch included
- [ ] Start date: 28. Februar 2026
- [ ] Age: 5-8 Jahre
- [ ] 6 Termine listed with dates
- [ ] Breadcrumb navigation works

### Mini Restaurant Page:
- [ ] "Auf Warteliste setzen" button removed
- [ ] Video has same pink/purple overlay as homepage
- [ ] Page looks consistent with other program pages

### Mini Projekte Page:
- [ ] Image replaced with Swiss-appropriate version
- [ ] References to Mini Gallery updated to Mini Museum

### Navigation:
- [ ] All menu items updated
- [ ] Footer links updated
- [ ] Any internal links updated

### Image Agent:
- [ ] Guidelines updated for Swiss context
- [ ] Agent generates 2 options per request

---

## 🎨 VISUAL CONSISTENCY CHECK

After implementation, verify:

1. **Video overlays match** - Homepage and all program pages should have the same pink/purple gradient overlay on videos

2. **Button styles consistent** - "Mehr →" buttons should look the same across all cards

3. **Time format consistent** - All times shown in same format (e.g., "Mittwochs 18:30")

4. **Colors match brand** - Magenta (#DD48E0), Purple (#BA53AD), Cream (#FFFBF7)

5. **Typography consistent** - Same fonts and sizes across all pages

---

## 🚨 IMPORTANT NOTES

### DO:
- Keep the same page structure as Mini Restaurant for Mini Museum
- Apply video overlay consistently
- Test all navigation links after renaming
- Generate 2 image options for new Mini Projekte image

### DO NOT:
- Leave any references to "Mini Gallery" 
- Keep "Jetzt anmelden" or "Kostenlose Erstberatung" buttons on homepage
- Use images with religious head coverings
- Forget to update breadcrumb navigation

---

**End of Update Document**
