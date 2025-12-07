# EVOLEA Website Fixes

## Repository
https://cgjen-box.github.io/evolea-website
(Production: https://evolea-website.pages.dev/)

---

# HOMEPAGE FIXES

---

## Issue 1: Remove Overview Section

**Priority:** High  
**Location:** Homepage → Section immediately after hero

**What to remove:** The entire section containing:
- Section label "Was wir tun"
- Heading "Jedes Kind hat eine Superkraft"
- Paragraph: "EVOLEA schafft Räume, in denen Kinder im Spektrum ihre einzigartigen Stärken entdecken. Unsere evidenzbasierten Programme ergänzen die Regelschule und fördern jedes Kind individuell."
- "Mehr über uns" button/link
- The 4 stat boxes (4+ Programme, 3-8 Jahre, ZH Zürich, 100% Individuell)

**Reason:** This section adds no value.

**Action:** Delete this entire section/component.

---

## Issue 2: Fix Mini Turnen Age Range

**Priority:** High  
**Location:** Homepage → Angebote section → Mini Turnen card

**Current:** `3–6 Jahre`  
**Replace with:** `5–8 Jahre`

**Note:** Also update on the Mini Turnen detail page (`/angebote/mini-turnen/`).

---

## Issue 3: Fix "9 Grundsätze unserer Arbeit" Section

**Priority:** High  
**Location:** Homepage → "Pädagogisches Konzept" section

### 3a: Display All 9 Principles

**Current state:** Only 6 principles displayed:
1. Evidenzbasiert
2. Individuell
3. Spielerisch
4. Strukturiert
5. Ressourcenorientiert
6. Familienzentriert

**Action:** Find and display the missing 3 principles from `/ueber-uns/` page or content files.

### 3b: Update CTA Button Text

**Current:** `Alle 9 Grundsätze entdecken`  
**Replace with:** `Unser pädagogisches Konzept im Detail`

Keep the same link destination.

---

## Issue 4: Move Black Box Section Before Team

**Priority:** High  
**Location:** Homepage

**Section to move:**
```
EVOLEA
Wo Kinder im Spektrum aufblühen
EVOLEA schafft Räume, damit sich Kinder im Spektrum entfalten...
```

**Current location:** Near bottom, before final CTA  
**New location:** Immediately BEFORE the Team section ("Wir sind EVOLEA")

### New Page Order:
1. Hero
2. ~~Overview section~~ (REMOVED)
3. Angebote ("Unsere Angebote")
4. Pädagogisches Konzept ("9 Grundsätze unserer Arbeit")
5. **Black box** ← MOVE HERE
6. Team ("Wir sind EVOLEA")
7. Contact info ("Haben Sie Fragen?")
8. Final CTA ("Bereit für den nächsten Schritt?")
9. Footer

---

## Issue 5: Update Hero Section Text

**Priority:** High  
**Location:** Homepage → Hero/banner section

### 5a: Update Headline

**Current:** `Wo Kinder im Spektrum aufblühen`  
**Replace with:** `Wo Kinder sich im Spektrum entfalten`

### 5b: Update Subline

**Current:** `EVOLEA schafft Räume für Kinder mit Autismus oder ADHS, in denen sie wachsen, lernen und ihre einzigartigen Stärken entdecken können.`  
**Replace with:** `Unsere Bildungsangebote schaffen Räume, damit sich Kinder im Spektrum entfalten können.`

---

# ANGEBOTE PAGE FIXES

---

## Issue 6: Update "Unser Ansatz" Text

**Priority:** High  
**Location:** Angebote page (`/angebote/`) → "Unser Ansatz" section

**Current text:**
```
Alle unsere Programme basieren auf Applied Behavior Analysis (ABA) und Verbal Behavior (VB) - wissenschaftlich fundierte Methoden, die nachweislich wirksam sind. In kleinen Gruppen mit hohem Betreuungsschluessel schaffen wir einen geschuetzten Rahmen fuer individuelle Entwicklung.
```

**Replace with:**
```
Wir bestärken Erfolge und motivieren die Kinder, neue Herausforderungen anzunehmen. Wir setzen auf wissenschaftlich fundierte Methoden, die nachweislich wirksam sind. In kleinen Gruppen mit hohem Betreuungsschlüssel schaffen wir einen geschützten Rahmen für individuelle Entwicklung.
```

**Reason:** Remove explicit ABA/VB mention, focus on positive child-centered approach.

---

## Issue 7: Highlight Main Programs

**Priority:** High  
**Location:** Angebote page → Program cards section

**Action:** Visually highlight/feature these three programs:
- **Mini Garten** (3-6 Jahre)
- **Mini Projekte** (5-8 Jahre)
- **Mini Turnen** (5-8 Jahre)

Display with purple gradient cards and "ANMELDUNG OFFEN" badges (like homepage style).

---

## Issue 8: Remove Schulberatung from Entire Site

**Priority:** High  
**Reason:** Service no longer offered.

**Action:** Remove "Schulberatung" completely:
1. Angebote page card
2. Navigation/menus
3. Footer links (under "Angebote")
4. Detail page (`/angebote/schulberatung/`)
5. Any other references (search codebase for "Schulberatung")

---

## Issue 9: Update Tagesschule Status

**Priority:** High  
**Location:** Angebote page → Tagesschule card

**Current status:** "IN PLANUNG" / "Neues Angebot - Interesse anmelden"  
**New status:** `Vision - wir arbeiten noch daran`

---

## Issue 10: Add "Aktuelle Angebote" Section Header

**Priority:** Medium  
**Location:** Angebote page → Above main program cards

**Action:** Add section header creating this hierarchy:
1. **"Aktuelle Angebote"** ← ADD THIS
2. Mini Garten, Mini Projekte, Mini Turnen (highlighted)
3. **"Weitere Angebote"** (existing)
4. EVOLEA Cafe, Tagesschule (secondary)

---

## Issue 11: Simplify Angebote Hero Subline

**Priority:** Medium  
**Location:** Angebote page → Hero section

**Current:**
```
Evidenzbasierte Programme, die jedes Kind dort abholen, wo es steht. Entwickelt für Kinder im Spektrum und mit ADHS.
```

**Replace with:**
```
Programme, die jedes Kind dort abholen, wo es steht.
```

**Reason:** Too clinical, leads with methodology instead of emotional connection.

---

## Issue 12: Remove Age Pills

**Priority:** Medium  
**Location:** Angebote page → Below hero

**Remove these three floating elements:**
- "3-6 Jahre: Kindergartenvorbereitung"
- "5-8 Jahre: Soziale Kompetenzen"
- "6-12 Jahre: Tagesstruktur"

**Reason:** Orphaned UI elements that don't connect to anything. Age ranges already shown on cards.

---

## Issue 13: Fix Umlaut Encoding

**Priority:** Low  
**Location:** Site-wide

**Fix these instances:**
- `Beratungsgespraech` → `Beratungsgespräch`
- `geschuetzten` → `geschützten`
- `fuer` → `für`

**Action:** Search entire codebase for `ue`, `ae`, `oe` patterns and fix German umlauts.

---

# SUMMARY CHECKLIST

## Homepage
- [ ] **#1:** Remove "Was wir tun / Jedes Kind hat eine Superkraft" overview section
- [ ] **#2:** Change Mini Turnen age from "3–6 Jahre" to "5–8 Jahre"
- [ ] **#3a:** Display all 9 Grundsätze (add missing 3 principles)
- [ ] **#3b:** Change CTA to "Unser pädagogisches Konzept im Detail"
- [ ] **#4:** Move black box to appear before Team section
- [ ] **#5a:** Hero headline → "Wo Kinder sich im Spektrum entfalten"
- [ ] **#5b:** Hero subline → "Unsere Bildungsangebote schaffen Räume, damit sich Kinder im Spektrum entfalten können."

## Angebote Page
- [ ] **#6:** Update "Unser Ansatz" text (remove ABA/VB)
- [ ] **#7:** Highlight Mini Garten, Mini Projekte, Mini Turnen
- [ ] **#8:** Remove Schulberatung from entire site
- [ ] **#9:** Tagesschule status → "Vision - wir arbeiten noch daran"
- [ ] **#10:** Add "Aktuelle Angebote" section header
- [ ] **#11:** Simplify Angebote hero (remove "Evidenzbasierte")
- [ ] **#12:** Remove floating age pills below hero

## Site-wide
- [ ] **#13:** Fix umlaut encoding throughout

---

# NOTES

- Verify responsive layout on mobile after changes
- Test all navigation links after section reordering
- Commit with clear messages for each fix
- After removing Schulberatung, check for broken links
