# EVOLEA Keystatic Ultimate Plan

## Vision: The Slickest Possible CMS Experience

Transform Keystatic into a **delightful editing experience** that feels intuitive, organized, and powerful - even without visual editing.

---

## Advanced Features We'll Use

| Feature | What It Does | Where We'll Use It |
|---------|--------------|-------------------|
| **Blocks Field** | Mix-and-match content sections | Homepage, About page |
| **Content Components** | Rich text building blocks | Blog posts, Program descriptions |
| **Conditional Fields** | Show/hide based on choices | SEO fields, Featured images |
| **Relationship Fields** | Link content together | Team → Programs, Related posts |
| **Entry Layout: Content** | Sidebar + main content | Blog, Programs (writer mode) |
| **Field Groups** | Visual organization | All complex content |
| **Descriptions** | Help text on every field | Everywhere |

---

## Ultimate CMS Navigation Structure

```
📁 EVOLEA CMS
├── 📄 Inhalte (Content)
│   ├── 📝 Blog Artikel          → Rich editing with components
│   ├── 👥 Team                  → Photos, bios, links to programs
│   ├── 🎯 Angebote (Programs)   → Full program pages
│   └── 💬 Testimonials          → Client quotes (NEW)
│
├── 📑 Seiten (Pages)
│   ├── 🏠 Startseite            → Flexible blocks
│   ├── ℹ️ Über uns              → Mission, vision, principles
│   └── 📧 Kontakt               → Contact info, form settings
│
├── 🔧 Bausteine (Building Blocks)
│   └── ⭐ Grundsätze            → 9 principles (shared component)
│
└── ⚙️ Einstellungen (Settings)
    └── 🌐 Website               → Global settings, navigation, footer
```

---

## Content Components for Rich Text

Users can insert these blocks while writing:

### For Blog & Program Content:

```typescript
// Callout Box - Highlight important info
Hinweis: wrapper({
  label: '📢 Hinweis-Box',
  description: 'Hervorgehobener Hinweis mit farbigem Hintergrund',
  schema: {
    typ: fields.select({
      label: 'Typ',
      options: [
        { label: '💡 Tipp', value: 'tip' },
        { label: 'ℹ️ Info', value: 'info' },
        { label: '⚠️ Wichtig', value: 'warning' },
        { label: '✅ Erfolg', value: 'success' },
      ],
      defaultValue: 'info',
    }),
  },
})

// Quote Block
Zitat: wrapper({
  label: '💬 Zitat',
  description: 'Blockzitat mit optionaler Quellenangabe',
  schema: {
    quelle: fields.text({ label: 'Quelle (optional)' }),
  },
})

// Image with Caption
BildMitBeschriftung: block({
  label: '🖼️ Bild mit Beschriftung',
  schema: {
    bild: fields.image({
      label: 'Bild',
      directory: 'public/images/content',
      publicPath: '/images/content/',
    }),
    beschriftung: fields.text({ label: 'Bildunterschrift' }),
    alt: fields.text({ label: 'Alt-Text für Barrierefreiheit' }),
  },
})

// YouTube Embed
YouTube: block({
  label: '▶️ YouTube Video',
  description: 'YouTube Video einbetten',
  schema: {
    videoId: fields.text({
      label: 'Video ID',
      description: 'Die ID aus der YouTube-URL (z.B. dQw4w9WgXcQ)',
    }),
    titel: fields.text({ label: 'Video-Titel' }),
  },
})

// Feature List
Checkliste: wrapper({
  label: '✓ Checkliste',
  description: 'Liste mit Häkchen',
  schema: {},
})

// Two Column Layout
ZweiSpalten: wrapper({
  label: '📊 Zwei Spalten',
  description: 'Inhalt in zwei Spalten aufteilen',
  schema: {},
})
```

---

## Flexible Page Blocks (for Homepage)

Instead of fixed sections, editors can build pages with blocks:

```typescript
// Homepage uses blocks field for ultimate flexibility
sections: fields.blocks(
  {
    // Hero Section
    hero: {
      label: '🦸 Hero Banner',
      schema: fields.object({
        titel: fields.text({ label: 'Titel' }),
        untertitel: fields.text({ label: 'Untertitel', multiline: true }),
        buttonText: fields.text({ label: 'Button Text' }),
        buttonLink: fields.text({ label: 'Button Link' }),
        hintergrundVideo: fields.checkbox({
          label: 'Video-Hintergrund?',
          defaultValue: true,
        }),
      }),
    },

    // Programs Overview
    angeboteUebersicht: {
      label: '🎯 Angebote-Übersicht',
      schema: fields.object({
        titel: fields.text({ label: 'Titel' }),
        beschreibung: fields.text({ label: 'Beschreibung' }),
        zeigeAlle: fields.checkbox({
          label: 'Alle Programme anzeigen',
          defaultValue: true,
        }),
        ausgewaehltePrograme: fields.conditional(
          fields.checkbox({ label: 'Nur bestimmte auswählen?' }),
          {
            true: fields.array(
              fields.relationship({ label: 'Programm', collection: 'programs' }),
              { label: 'Ausgewählte Programme' }
            ),
            false: fields.empty(),
          }
        ),
      }),
    },

    // Principles Grid
    grundsaetze: {
      label: '⭐ Grundsätze-Grid',
      schema: fields.object({
        titel: fields.text({ label: 'Titel' }),
        beschreibung: fields.text({ label: 'Beschreibung' }),
        anzahl: fields.integer({
          label: 'Anzahl anzeigen',
          defaultValue: 9,
          validation: { min: 3, max: 9 },
        }),
      }),
    },

    // Vision Statement (Dark Section)
    vision: {
      label: '🌟 Vision Statement',
      schema: fields.object({
        titel: fields.text({ label: 'Titel' }),
        text: fields.text({ label: 'Text', multiline: true }),
      }),
    },

    // Team Preview
    teamVorschau: {
      label: '👥 Team-Vorschau',
      schema: fields.object({
        titel: fields.text({ label: 'Titel' }),
        beschreibung: fields.text({ label: 'Beschreibung' }),
        anzahl: fields.integer({
          label: 'Anzahl Mitglieder',
          defaultValue: 4,
        }),
        buttonText: fields.text({ label: 'Button Text' }),
      }),
    },

    // Testimonials
    testimonials: {
      label: '💬 Testimonials',
      schema: fields.object({
        titel: fields.text({ label: 'Titel' }),
        ausgewaehlt: fields.array(
          fields.relationship({ label: 'Testimonial', collection: 'testimonials' }),
          { label: 'Ausgewählte Testimonials' }
        ),
      }),
    },

    // CTA Section
    cta: {
      label: '📢 Call-to-Action',
      schema: fields.object({
        titel: fields.text({ label: 'Titel' }),
        beschreibung: fields.text({ label: 'Beschreibung' }),
        buttonText: fields.text({ label: 'Button Text' }),
        buttonLink: fields.text({ label: 'Button Link' }),
        stil: fields.select({
          label: 'Stil',
          options: [
            { label: 'Gradient (bunt)', value: 'gradient' },
            { label: 'Ruhig (hell)', value: 'calm' },
            { label: 'Dunkel', value: 'dark' },
          ],
          defaultValue: 'gradient',
        }),
      }),
    },

    // Quick Contact
    kontaktSchnell: {
      label: '📧 Schnell-Kontakt',
      schema: fields.object({
        titel: fields.text({ label: 'Titel' }),
        text: fields.text({ label: 'Text' }),
        zeigeEmail: fields.checkbox({ label: 'E-Mail anzeigen', defaultValue: true }),
        zeigeInstagram: fields.checkbox({ label: 'Instagram anzeigen', defaultValue: true }),
      }),
    },

    // Custom HTML/Rich Text
    freitext: {
      label: '📝 Freier Text',
      schema: fields.object({
        inhalt: fields.mdx({ label: 'Inhalt' }),
      }),
    },
  },
  { label: 'Sektionen' }
)
```

---

## Smart Conditional Fields

### Example: SEO Configuration
```typescript
seo: fields.conditional(
  fields.checkbox({
    label: '🔍 Eigene SEO-Einstellungen',
    description: 'Aktivieren für individuelle Meta-Tags (sonst werden Standardwerte verwendet)',
    defaultValue: false,
  }),
  {
    true: fields.object({
      metaTitel: fields.text({
        label: 'Meta-Titel',
        description: 'Wird im Browser-Tab und bei Google angezeigt (max. 60 Zeichen)',
        validation: { length: { max: 60 } },
      }),
      metaBeschreibung: fields.text({
        label: 'Meta-Beschreibung',
        description: 'Wird in Google-Suchergebnissen angezeigt (max. 160 Zeichen)',
        multiline: true,
        validation: { length: { max: 160 } },
      }),
      ogBild: fields.image({
        label: 'Social Media Bild',
        description: 'Wird beim Teilen auf Facebook, LinkedIn etc. angezeigt',
        directory: 'public/images/og',
        publicPath: '/images/og/',
      }),
    }),
    false: fields.empty(),
  }
)
```

### Example: Featured Image Options
```typescript
titelbild: fields.conditional(
  fields.select({
    label: 'Titelbild-Typ',
    options: [
      { label: 'Kein Titelbild', value: 'none' },
      { label: 'Bild hochladen', value: 'upload' },
      { label: 'Generiertes Bild (AI)', value: 'generated' },
    ],
    defaultValue: 'upload',
  }),
  {
    none: fields.empty(),
    upload: fields.object({
      bild: fields.image({
        label: 'Bild',
        directory: 'public/images/blog',
        publicPath: '/images/blog/',
      }),
      alt: fields.text({ label: 'Alt-Text' }),
    }),
    generated: fields.object({
      prompt: fields.text({
        label: 'Bild-Beschreibung',
        description: 'Beschreibung für das KI-generierte Bild',
        multiline: true,
      }),
    }),
  }
)
```

---

## Entry Layout: Writer Mode

For blog posts and programs, use content layout:

```typescript
blog: collection({
  label: 'Blog Artikel',
  slugField: 'title',
  path: 'src/content/blog/*',
  entryLayout: 'content',  // 👈 Enables writer mode
  format: { contentField: 'content' },
  schema: {
    // These appear in the SIDEBAR
    title: fields.slug({ name: { label: 'Titel' } }),
    datum: fields.date({ label: 'Datum' }),
    autor: fields.text({ label: 'Autor' }),
    tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags' }),
    veroeffentlicht: fields.checkbox({
      label: '✅ Veröffentlicht',
      defaultValue: false,
    }),

    // This is the MAIN CONTENT AREA
    content: fields.mdx({
      label: 'Inhalt',
      components: { /* content components */ },
    }),
  },
})
```

---

## Relationship Fields

### Team → Programs
```typescript
// In team collection:
leitetProgramme: fields.array(
  fields.relationship({
    label: 'Programm',
    collection: 'programs',
  }),
  {
    label: 'Leitet Programme',
    description: 'Welche Programme leitet dieses Teammitglied?',
  }
)
```

### Blog → Related Posts
```typescript
// In blog collection:
verwandteArtikel: fields.array(
  fields.relationship({
    label: 'Artikel',
    collection: 'blog',
  }),
  {
    label: 'Verwandte Artikel',
    description: 'Werden am Ende des Artikels angezeigt',
    validation: { length: { max: 3 } },
  }
)
```

---

## Field Descriptions (German, Helpful)

Every field gets a clear German description:

```typescript
titel: fields.slug({
  name: {
    label: 'Titel',
    description: 'Der Titel erscheint als Überschrift und in der URL',
  },
}),

beschreibung: fields.text({
  label: 'Kurzbeschreibung',
  description: 'Wird in Vorschaukarten und bei Google angezeigt (2-3 Sätze)',
  multiline: true,
  validation: { length: { min: 50, max: 300 } },
}),

bild: fields.image({
  label: 'Hauptbild',
  description: 'Empfohlene Grösse: 1200x630px. Wird automatisch optimiert.',
  directory: 'public/images/blog',
  publicPath: '/images/blog/',
}),

reihenfolge: fields.integer({
  label: 'Reihenfolge',
  description: 'Kleinere Zahlen erscheinen zuerst (0 = ganz oben)',
  defaultValue: 0,
}),

aktiv: fields.checkbox({
  label: 'Auf Website anzeigen',
  description: 'Deaktivieren um vorübergehend zu verstecken',
  defaultValue: true,
}),
```

---

## Complete Collection Schemas

### Team Collection
```typescript
team: collection({
  label: '👥 Team',
  slugField: 'name',
  path: 'src/content/team/*',
  format: { data: 'json' },
  schema: {
    name: fields.slug({
      name: {
        label: 'Name',
        description: 'Vollständiger Name',
      },
    }),

    titel: fields.text({
      label: 'Titel/Credentials',
      description: 'z.B. "M.Sc., BCBA" oder leer lassen',
    }),

    rolle: fields.object({
      de: fields.text({ label: 'Rolle (DE)', description: 'z.B. "Mitgründerin, Psychologin"' }),
      en: fields.text({ label: 'Role (EN)' }),
    }, { label: 'Rolle/Position' }),

    foto: fields.image({
      label: 'Foto',
      description: 'Quadratisches Foto empfohlen (min. 400x400px)',
      directory: 'public/images/team',
      publicPath: '/images/team/',
    }),

    beschreibung: fields.object({
      de: fields.text({
        label: 'Beschreibung (DE)',
        description: 'Kurzer Bio-Text (2-3 Sätze)',
        multiline: true,
      }),
      en: fields.text({ label: 'Description (EN)', multiline: true }),
    }, { label: 'Beschreibung' }),

    email: fields.text({
      label: 'E-Mail',
      description: 'Wird nicht öffentlich angezeigt, nur für interne Referenz',
    }),

    linkedin: fields.url({
      label: 'LinkedIn Profil',
      description: 'Optional',
    }),

    leitetProgramme: fields.array(
      fields.relationship({
        label: 'Programm',
        collection: 'programs',
      }),
      { label: 'Leitet Programme' }
    ),

    reihenfolge: fields.integer({
      label: 'Reihenfolge',
      description: 'Bestimmt die Position auf der Team-Seite',
      defaultValue: 0,
    }),

    aktiv: fields.checkbox({
      label: 'Auf Website anzeigen',
      defaultValue: true,
    }),
  },
}),
```

### Programs Collection
```typescript
programs: collection({
  label: '🎯 Angebote',
  slugField: 'slug',
  path: 'src/content/programs/*',
  entryLayout: 'content',
  format: { contentField: 'inhaltDe' },
  schema: {
    slug: fields.slug({
      name: {
        label: 'URL-Slug',
        description: 'Wird in der URL verwendet (z.B. "mini-garten")',
      },
    }),

    // === BASIC INFO (Sidebar) ===
    icon: fields.select({
      label: 'Icon',
      options: [
        { label: '🌱 Sprout', value: 'sprout' },
        { label: '🎨 Palette', value: 'palette' },
        { label: '🏃 Running', value: 'running' },
        { label: '📚 Book', value: 'book' },
        { label: '🏠 Home', value: 'home' },
        { label: '✨ Sparkle', value: 'sparkle' },
      ],
      defaultValue: 'sparkle',
    }),

    farbe: fields.select({
      label: 'Themenfarbe',
      options: [
        { label: '🟢 Grün', value: 'green' },
        { label: '🟠 Orange', value: 'orange' },
        { label: '🔴 Coral', value: 'coral' },
        { label: '🔵 Himmelblau', value: 'sky' },
        { label: '🟣 Lila', value: 'purple' },
      ],
      defaultValue: 'green',
    }),

    // === KEY INFO ===
    alter: fields.text({
      label: 'Altersgruppe',
      description: 'z.B. "3-6 Jahre"',
    }),

    zeitplan: fields.object({
      tag: fields.text({ label: 'Tag', description: 'z.B. "Montag"' }),
      zeit: fields.text({ label: 'Zeit', description: 'z.B. "13:30-16:30"' }),
    }, { label: 'Zeitplan' }),

    gruppengroesse: fields.text({
      label: 'Gruppengrösse',
      description: 'z.B. "4 + 2 Kinder"',
    }),

    standort: fields.text({
      label: 'Standort',
      description: 'z.B. "Zürich"',
    }),

    // === TITLES ===
    titel: fields.object({
      de: fields.text({ label: 'Titel (DE)' }),
      en: fields.text({ label: 'Title (EN)' }),
    }, { label: 'Programmname' }),

    tagline: fields.object({
      de: fields.text({ label: 'Tagline (DE)', description: 'Kurzer Slogan' }),
      en: fields.text({ label: 'Tagline (EN)' }),
    }, { label: 'Tagline' }),

    kurzbeschreibung: fields.object({
      de: fields.text({ label: 'Kurzbeschreibung (DE)', multiline: true }),
      en: fields.text({ label: 'Short Description (EN)', multiline: true }),
    }, { label: 'Kurzbeschreibung' }),

    // === IMAGES ===
    heroImage: fields.image({
      label: 'Hero-Bild',
      description: 'Hauptbild für die Programm-Seite',
      directory: 'public/images/programs',
      publicPath: '/images/programs/',
    }),

    // === MAIN CONTENT ===
    inhaltDe: fields.mdx({
      label: 'Vollständiger Inhalt (DE)',
      description: 'Der komplette Seiteninhalt mit allen Details',
      components: {
        Hinweis: /* callout component */,
        Checkliste: /* checklist component */,
      },
    }),

    inhaltEn: fields.mdx({
      label: 'Full Content (EN)',
    }),

    // === LEARNING GOALS ===
    lernziele: fields.array(
      fields.object({
        de: fields.text({ label: 'Ziel (DE)' }),
        en: fields.text({ label: 'Goal (EN)' }),
      }),
      {
        label: 'Lernziele',
        description: 'Werden als Liste mit Häkchen angezeigt',
        itemLabel: (props) => props.fields.de.value || 'Neues Ziel',
      }
    ),

    // === SETTINGS ===
    reihenfolge: fields.integer({ label: 'Reihenfolge', defaultValue: 0 }),
    aktiv: fields.checkbox({ label: 'Aktiv', defaultValue: true }),

    seo: /* conditional SEO fields */,
  },
}),
```

---

## Edit Link Improvements

### Enhanced EditLink Component

Add section-specific editing:

```astro
---
// Enhanced EditLink with section indicator
interface Props {
  type: 'collection' | 'singleton';
  collection: string;
  slug?: string;
  label?: string;
  section?: string;  // NEW: Jump to specific section
  position?: 'fixed' | 'inline';
}
---
```

### Admin Bar (New Component)

A floating admin bar for logged-in editors:

```astro
<AdminBar>
  <EditButton href="/keystatic/..." label="Diese Seite bearbeiten" />
  <EditButton href="/keystatic/singleton/siteSettings" label="Einstellungen" />
  <EditButton href="/keystatic/collection/blog" label="Blog verwalten" />
</AdminBar>
```

---

## Implementation Order (Optimized)

### Phase 1: Foundation (Critical Path)
1. Update `keystatic.config.ts` with full schema
2. Create content component definitions
3. Set up entry layouts

### Phase 2: Core Collections
4. Team collection + migrate data
5. Programs collection + migrate 7 programs
6. Principles collection + migrate 9 principles

### Phase 3: Page Singletons
7. Homepage singleton with blocks
8. About singleton
9. Contact singleton

### Phase 4: Enhanced Features
10. Testimonials collection (new)
11. Relationship fields (team → programs)
12. Related posts for blog

### Phase 5: UX Polish
13. Enhanced EditLinks on all pages
14. Admin bar component
15. Content components for rich text
16. Preview mode setup

### Phase 6: Cleanup
17. Remove hardcoded content from .astro files
18. Simplify i18n/ui.ts
19. Delete old unused singletons/collections

---

## Success Metrics

After implementation:

- [ ] **100% content editable** via Keystatic
- [ ] **Zero hardcoded text** in .astro files
- [ ] **Every page** has Edit button
- [ ] **German labels** on all fields
- [ ] **Helpful descriptions** on every field
- [ ] **Writer mode** for long content
- [ ] **Flexible homepage** with blocks
- [ ] **Content components** for rich text
- [ ] **Relationships** between content
- [ ] **Draft status** on all content
- [ ] **SEO fields** with validation

---

## File Structure After Implementation

```
keystatic.config.ts          # Single source of truth for CMS schema

src/content/
├── blog/                    # Blog posts (MDX with components)
├── team/                    # Team members (JSON)
├── programs/                # Programs (JSON + MDX content)
├── principles/              # 9 Principles (JSON)
├── testimonials/            # Testimonials (JSON) [NEW]
├── pages/
│   ├── homepage.json        # Homepage blocks config
│   ├── about.json           # About page content
│   └── contact.json         # Contact page content
└── settings/
    └── site.json            # Global settings

src/components/
├── EditLink.astro           # Enhanced edit button
├── AdminBar.astro           # Floating admin bar [NEW]
├── content/                 # MDX content components [NEW]
│   ├── Hinweis.astro
│   ├── Zitat.astro
│   ├── BildMitBeschriftung.astro
│   └── YouTube.astro
└── blocks/                  # Homepage block renderers [NEW]
    ├── HeroBlock.astro
    ├── AngeboteBlock.astro
    ├── GrundsaetzeBlock.astro
    └── CTABlock.astro
```
