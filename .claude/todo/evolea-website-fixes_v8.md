# EVOLEA Website Fixes

## Repository
https://cgjen-box.github.io/evolea-website

---

## Issue 1: Remove Overview Section

**Priority:** High

**What to remove:** The entire section immediately after the hero that contains:
- Section label "Was wir tun"
- Heading "Jedes Kind hat eine Superkraft"
- Paragraph: "EVOLEA schafft Räume, in denen Kinder im Spektrum ihre einzigartigen Stärken entdecken. Unsere evidenzbasierten Programme ergänzen die Regelschule und fördern jedes Kind individuell."
- "Mehr über uns" button/link
- The 4 stat boxes showing:
  - 4+ Programme
  - 3-8 Jahre
  - ZH Zürich
  - 100% Individuell

**Reason:** This section adds no value.

**Action:** Delete this entire section/component from the homepage.

---

## Issue 2: Fix Mini Turnen Age Range

**Priority:** High

**Location:** Homepage → Angebote section → Mini Turnen card

**Current text:**
```
3–6 Jahre
```

**Replace with:**
```
5–8 Jahre
```

**Note:** Also check and update this on the Mini Turnen detail page (`/angebote/mini-turnen/`) if the age range appears there.

---

## Issue 3: Fix "9 Grundsätze unserer Arbeit" Section

### 3a: Display All 9 Principles

**Location:** Homepage → "Pädagogisches Konzept" section

**Current state:** Only 6 principles are displayed:
1. Evidenzbasiert
2. Individuell
3. Spielerisch
4. Strukturiert
5. Ressourcenorientiert
6. Familienzentriert

**Required:** Display all 9 principles. Find the missing 3 principles from the `/ueber-uns/` page or content files and add them to this section.

### 3b: Update CTA Button Text

**Current CTA text:**
```
Alle 9 Grundsätze entdecken
```

**Replace with:**
```
Unser pädagogisches Konzept im Detail
```

**Keep the same link destination:** `/evolea-website/ueber-uns/`

---

## Issue 4: Move Black Box Section Before Team

**Section to move:** The dark/black box containing:
```
EVOLEA
Wo Kinder im Spektrum aufblühen
EVOLEA schafft Räume, damit sich Kinder im Spektrum entfalten und ihren Weg glücklich und selbstbestimmt gehen können.
```

**Current location:** Near the bottom of the page, before the final CTA

**New location:** Immediately BEFORE the Team section ("Wir sind EVOLEA")

### New Page Order:
1. Hero
2. ~~Overview section~~ (REMOVED - see Issue 1)
3. Angebote ("Unsere Angebote")
4. Pädagogisches Konzept ("9 Grundsätze unserer Arbeit")
5. **Black box "Wo Kinder im Spektrum aufblühen"** ← MOVE HERE
6. Team ("Wir sind EVOLEA")
7. Contact info ("Haben Sie Fragen?")
8. Final CTA ("Bereit für den nächsten Schritt?")
9. Footer

---

## Issue 5: Update Hero Section Text

**Location:** Homepage hero/banner section

### 5a: Update Headline

**Current headline:**
```
Wo Kinder im Spektrum aufblühen
```

**Replace with:**
```
Wo Kinder sich im Spektrum entfalten
```

### 5b: Update Subline/Description

**Current subline:**
```
EVOLEA schafft Räume für Kinder mit Autismus oder ADHS, in denen sie wachsen, lernen und ihre einzigartigen Stärken entdecken können.
```

**Replace with:**
```
Unsere Bildungsangebote schaffen Räume, damit sich Kinder im Spektrum entfalten können.
```

---

## Summary Checklist

- [ ] **Issue 1:** Remove "Was wir tun / Jedes Kind hat eine Superkraft" overview section entirely
- [ ] **Issue 2:** Change Mini Turnen age from "3–6 Jahre" to "5–8 Jahre"
- [ ] **Issue 3a:** Display all 9 Grundsätze (add the missing 3 principles)
- [ ] **Issue 3b:** Change CTA button text to "Unser pädagogisches Konzept im Detail"
- [ ] **Issue 4:** Move black "Wo Kinder im Spektrum aufblühen" box to appear before Team section
- [ ] **Issue 5a:** Change hero headline to "Wo Kinder sich im Spektrum entfalten"
- [ ] **Issue 5b:** Change hero subline to "Unsere Bildungsangebote schaffen Räume, damit sich Kinder im Spektrum entfalten können."

---

## Notes

- After making changes, verify the responsive layout still works on mobile
- Test all navigation links after section reordering
- Commit changes with clear commit messages for each fix
