# EVOLEA Keystatic Content Strategy

## Executive Summary

This plan transforms the EVOLEA website from a mostly-hardcoded site to a fully CMS-editable site using Keystatic. Currently, ~80% of content is hardcoded in `.astro` files, making updates require developer involvement. After implementation, editors can update all content directly through Keystatic.

---

## Current State Analysis

### Content Sources (PROBLEM: 4 Scattered Sources)

| Source | What's There | Problem |
|--------|--------------|---------|
| `.astro` files | Team members, programs, principles, page content | Hardcoded, needs dev to change |
| `i18n/ui.ts` | Navigation, hero text, labels | Duplicates Keystatic content |
| Keystatic `blog` | 10 blog posts | ✅ Working correctly |
| Keystatic singletons | Site settings, translations | Exists but pages don't use it |

### Pages Audit

| Page | Editable via Keystatic? | Hardcoded Content |
|------|------------------------|-------------------|
| Homepage | ❌ No | Hero text, principles, vision, team preview |
| About (Über uns) | ❌ No | Mission, vision, principles, association info |
| Team | ❌ No | All 4 team members, philosophy quote, values |
| Contact | ❌ No | Address, email, WhatsApp, form labels |
| Programs Overview | ❌ No | All program cards |
| Mini Garten | ❌ No | All content (age, schedule, learning goals) |
| Mini Projekte | ❌ No | All content |
| Mini Turnen | ❌ No | All content |
| Schulberatung | ❌ No | All content |
| Mini Museum | ❌ No | All content |
| Tagesschule | ❌ No | All content |
| Blog Listing | ⚠️ Partial | Uses blog collection, but headers hardcoded |
| Blog Posts | ✅ Yes | Fully editable |
| Privacy/Legal | ❌ No | Static legal text |

### Critical Issues

1. **Duplication**: 9 Principles defined in BOTH `index.astro` AND `ueber-uns/index.astro`
2. **Unused Collections**: `pages` collection exists with `homepage.json` but no page uses it
3. **Scattered Translations**: `ui.ts` and Keystatic `translations` singleton overlap
4. **No Edit Links**: Only 2 pages have them (homepage, blog posts)

---

## Target Architecture

### Collections (Content that has multiple items)

```
collections/
├── blog/          ✅ Keep (working)
├── team/          🆕 NEW - Team members
├── programs/      🆕 NEW - All 7 programs
└── principles/    🆕 NEW - 9 pedagogical principles
```

### Singletons (Single pages/global settings)

```
singletons/
├── siteSettings/    ✅ Keep (expand)
├── homepage/        🆕 NEW - Homepage content
├── about/           🆕 NEW - About page content
├── contact/         🆕 NEW - Contact page content
└── navigation/      🔄 REPLACE translations singleton
```

### Remove/Simplify

- **DELETE**: Most of `i18n/ui.ts` content (move to Keystatic)
- **DELETE**: `translations` singleton (overly complex)
- **DELETE**: `pages` collection (replace with specific singletons)

---

## Implementation Plan

### Phase 1: Team Collection (Priority: HIGH)
**Why First**: Simple, high-value, proves the pattern

**Tasks:**
1. Create `team` collection in `keystatic.config.ts`
   - Fields: name, credentials, role, image, description, order, isActive
2. Create content files for 4 team members
3. Update `team/index.astro` to fetch from collection
4. Update `en/team/index.astro` (English version)
5. Add EditLink to team page

**Keystatic Schema:**
```typescript
team: collection({
  label: 'Team',
  slugField: 'name',
  path: 'src/content/team/*',
  format: { data: 'json' },
  schema: {
    name: fields.slug({ name: { label: 'Name' } }),
    credentials: fields.text({ label: 'Credentials (e.g., M.Sc., BCBA)' }),
    role: fields.object({
      de: fields.text({ label: 'Role (DE)' }),
      en: fields.text({ label: 'Role (EN)' }),
    }),
    image: fields.image({
      label: 'Photo',
      directory: 'public/images/team',
      publicPath: '/images/team/',
    }),
    description: fields.object({
      de: fields.text({ label: 'Description (DE)', multiline: true }),
      en: fields.text({ label: 'Description (EN)', multiline: true }),
    }),
    order: fields.integer({ label: 'Display Order', defaultValue: 0 }),
    isActive: fields.checkbox({ label: 'Show on Website', defaultValue: true }),
  },
})
```

---

### Phase 2: Programs Collection (Priority: HIGH)
**Why**: 7 programs with similar structure, currently all hardcoded

**Tasks:**
1. Create `programs` collection in `keystatic.config.ts`
2. Create content files for all 7 programs
3. Create dynamic route `angebote/[slug].astro`
4. Update English routes
5. Add EditLinks to all program pages

**Keystatic Schema:**
```typescript
programs: collection({
  label: 'Angebote / Programs',
  slugField: 'slug',
  path: 'src/content/programs/*',
  format: { data: 'json' },
  schema: {
    slug: fields.slug({ name: { label: 'URL Slug' } }),
    icon: fields.select({
      label: 'Icon',
      options: [
        { label: 'Sprout', value: 'sprout' },
        { label: 'Palette', value: 'palette' },
        { label: 'Running', value: 'running' },
        { label: 'Book', value: 'book' },
        // ... more options
      ],
      defaultValue: 'sparkle',
    }),
    color: fields.select({
      label: 'Theme Color',
      options: [
        { label: 'Green', value: 'green' },
        { label: 'Orange', value: 'orange' },
        { label: 'Coral', value: 'coral' },
        { label: 'Sky', value: 'sky' },
      ],
      defaultValue: 'green',
    }),
    ageRange: fields.text({ label: 'Age Range (e.g., 3-6)' }),
    schedule: fields.object({
      day: fields.text({ label: 'Day' }),
      time: fields.text({ label: 'Time' }),
    }),
    groupSize: fields.text({ label: 'Group Size' }),
    location: fields.text({ label: 'Location' }),
    title: fields.object({
      de: fields.text({ label: 'Title (DE)' }),
      en: fields.text({ label: 'Title (EN)' }),
    }),
    tagline: fields.object({
      de: fields.text({ label: 'Tagline (DE)' }),
      en: fields.text({ label: 'Tagline (EN)' }),
    }),
    description: fields.object({
      de: fields.text({ label: 'Description (DE)', multiline: true }),
      en: fields.text({ label: 'Description (EN)', multiline: true }),
    }),
    image: fields.image({
      label: 'Hero Image',
      directory: 'public/images/programs',
      publicPath: '/images/programs/',
    }),
    content: fields.object({
      de: fields.mdx({ label: 'Full Content (DE)' }),
      en: fields.mdx({ label: 'Full Content (EN)' }),
    }),
    learningGoals: fields.array(
      fields.object({
        de: fields.text({ label: 'Goal (DE)' }),
        en: fields.text({ label: 'Goal (EN)' }),
      }),
      { label: 'Learning Goals' }
    ),
    isActive: fields.checkbox({ label: 'Show on Website', defaultValue: true }),
    order: fields.integer({ label: 'Display Order', defaultValue: 0 }),
  },
})
```

---

### Phase 3: Principles Collection (Priority: MEDIUM)
**Why**: Used on homepage AND about page (currently duplicated)

**Tasks:**
1. Create `principles` collection
2. Migrate 9 principles to collection
3. Update homepage to fetch principles
4. Update about page to fetch principles
5. Remove duplicated code

**Keystatic Schema:**
```typescript
principles: collection({
  label: 'Pädagogische Grundsätze',
  slugField: 'title',
  path: 'src/content/principles/*',
  format: { data: 'json' },
  schema: {
    title: fields.slug({
      name: { label: 'Title (DE)' },
    }),
    titleEn: fields.text({ label: 'Title (EN)' }),
    description: fields.object({
      de: fields.text({ label: 'Description (DE)', multiline: true }),
      en: fields.text({ label: 'Description (EN)', multiline: true }),
    }),
    icon: fields.select({
      label: 'Icon',
      options: [
        { label: 'Chart', value: 'chart' },
        { label: 'Target', value: 'target' },
        { label: 'Gamepad', value: 'gamepad' },
        { label: 'Clipboard', value: 'clipboard' },
        { label: 'Handshake', value: 'handshake' },
        { label: 'Diamond', value: 'diamond' },
        { label: 'People', value: 'people' },
        { label: 'Family', value: 'family' },
        { label: 'Rainbow', value: 'rainbow' },
      ],
      defaultValue: 'sparkle',
    }),
    color: fields.select({
      label: 'Color',
      options: [
        { label: 'Magenta', value: 'magenta' },
        { label: 'Coral', value: 'coral' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'Sky', value: 'sky' },
        { label: 'Mint', value: 'mint' },
        { label: 'Purple', value: 'purple' },
        { label: 'Pink', value: 'pink' },
        { label: 'Gold', value: 'gold' },
        { label: 'Teal', value: 'teal' },
      ],
      defaultValue: 'magenta',
    }),
    order: fields.integer({ label: 'Order', defaultValue: 0 }),
  },
})
```

---

### Phase 4: Page Singletons (Priority: MEDIUM)

#### 4a. Homepage Singleton
```typescript
homepage: singleton({
  label: 'Startseite',
  path: 'src/content/pages/homepage',
  schema: {
    hero: fields.object({
      title: fields.object({
        de: fields.text({ label: 'Title (DE)' }),
        en: fields.text({ label: 'Title (EN)' }),
      }),
      subtitle: fields.object({
        de: fields.text({ label: 'Subtitle (DE)', multiline: true }),
        en: fields.text({ label: 'Subtitle (EN)', multiline: true }),
      }),
    }),
    vision: fields.object({
      title: fields.object({
        de: fields.text({ label: 'Vision Title (DE)' }),
        en: fields.text({ label: 'Vision Title (EN)' }),
      }),
      description: fields.object({
        de: fields.text({ label: 'Vision Text (DE)', multiline: true }),
        en: fields.text({ label: 'Vision Text (EN)', multiline: true }),
      }),
    }),
    cta: fields.object({
      title: fields.object({
        de: fields.text({ label: 'CTA Title (DE)' }),
        en: fields.text({ label: 'CTA Title (EN)' }),
      }),
      description: fields.object({
        de: fields.text({ label: 'CTA Description (DE)' }),
        en: fields.text({ label: 'CTA Description (EN)' }),
      }),
      buttonText: fields.object({
        de: fields.text({ label: 'Button Text (DE)' }),
        en: fields.text({ label: 'Button Text (EN)' }),
      }),
    }),
  },
})
```

#### 4b. About Singleton
```typescript
about: singleton({
  label: 'Über uns',
  path: 'src/content/pages/about',
  schema: {
    hero: fields.object({ /* ... */ }),
    mission: fields.object({
      title: fields.object({ de, en }),
      content: fields.object({ de, en }), // multiline
    }),
    vision: fields.object({
      title: fields.object({ de, en }),
      quote: fields.object({ de, en }),
    }),
    forWhom: fields.array(
      fields.object({
        icon: fields.select({ /* ... */ }),
        title: fields.object({ de, en }),
        description: fields.object({ de, en }),
      }),
      { label: 'Target Groups' }
    ),
    association: fields.object({
      title: fields.object({ de, en }),
      content: fields.object({ de, en }),
      founded: fields.text({ label: 'Year Founded' }),
      location: fields.text({ label: 'Location' }),
    }),
  },
})
```

#### 4c. Contact Singleton
```typescript
contact: singleton({
  label: 'Kontakt',
  path: 'src/content/pages/contact',
  schema: {
    hero: fields.object({
      title: fields.object({ de, en }),
      subtitle: fields.object({ de, en }),
    }),
    info: fields.object({
      email: fields.text({ label: 'Email' }),
      phone: fields.text({ label: 'Phone' }),
      whatsapp: fields.text({ label: 'WhatsApp Link' }),
      address: fields.object({
        street: fields.text({ label: 'Street' }),
        zip: fields.text({ label: 'ZIP' }),
        city: fields.text({ label: 'City' }),
        note: fields.text({ label: 'Location Note' }),
      }),
    }),
    form: fields.object({
      title: fields.object({ de, en }),
      subjects: fields.array(
        fields.object({
          value: fields.text({ label: 'Value' }),
          label: fields.object({ de, en }),
        }),
        { label: 'Form Subject Options' }
      ),
    }),
  },
})
```

---

### Phase 5: Simplify Site Settings (Priority: MEDIUM)

**Expand siteSettings singleton:**
```typescript
siteSettings: singleton({
  label: 'Website Einstellungen',
  path: 'src/content/settings/site',
  schema: {
    siteName: fields.text({ label: 'Site Name' }),
    siteDescription: fields.object({
      de: fields.text({ label: 'Description (DE)', multiline: true }),
      en: fields.text({ label: 'Description (EN)', multiline: true }),
    }),
    contact: fields.object({
      email: fields.text({ label: 'Email' }),
      phone: fields.text({ label: 'Phone' }),
      whatsapp: fields.url({ label: 'WhatsApp URL' }),
    }),
    address: fields.object({
      street: fields.text({ label: 'Street' }),
      zip: fields.text({ label: 'ZIP' }),
      city: fields.text({ label: 'City' }),
      country: fields.text({ label: 'Country' }),
    }),
    social: fields.object({
      instagram: fields.url({ label: 'Instagram' }),
      linkedin: fields.url({ label: 'LinkedIn' }),
      facebook: fields.url({ label: 'Facebook' }),
    }),
    footer: fields.object({
      tagline: fields.object({
        de: fields.text({ label: 'Tagline (DE)', multiline: true }),
        en: fields.text({ label: 'Tagline (EN)', multiline: true }),
      }),
      copyright: fields.text({ label: 'Copyright Text' }),
    }),
    navigation: fields.object({
      de: fields.object({
        home: fields.text({ label: 'Home' }),
        programs: fields.text({ label: 'Programs' }),
        about: fields.text({ label: 'About' }),
        team: fields.text({ label: 'Team' }),
        blog: fields.text({ label: 'Blog' }),
        contact: fields.text({ label: 'Contact' }),
      }),
      en: fields.object({ /* same */ }),
    }),
  },
})
```

---

### Phase 6: Edit Links on All Pages (Priority: HIGH)

Add EditLink component to every page:

| Page | EditLink Target |
|------|----------------|
| Homepage | `singleton/homepage` |
| About | `singleton/about` |
| Team | `collection/team` |
| Contact | `singleton/contact` |
| Programs Overview | `collection/programs` |
| Individual Program | `collection/programs/item/{slug}` |
| Blog Listing | `collection/blog` |
| Blog Post | `collection/blog/item/{slug}` ✅ Done |

---

### Phase 7: Cleanup (Priority: LOW)

1. **Delete `translations` singleton** - Merged into siteSettings
2. **Delete `pages` collection** - Replaced by specific singletons
3. **Simplify `i18n/ui.ts`** - Keep only:
   - Language definitions
   - Technical labels (form validation, etc.)
   - Remove all content strings

---

## Timeline Estimate

| Phase | Description | Complexity |
|-------|-------------|------------|
| 1 | Team Collection | Simple |
| 2 | Programs Collection | Medium |
| 3 | Principles Collection | Simple |
| 4 | Page Singletons | Medium |
| 5 | Simplify Settings | Simple |
| 6 | Edit Links | Simple |
| 7 | Cleanup | Simple |

---

## Success Criteria

After implementation:
- [ ] All text content editable via Keystatic
- [ ] No content duplication
- [ ] Every page has an Edit button (on Cloudflare deployment)
- [ ] Adding a new team member requires no code changes
- [ ] Adding a new program requires no code changes
- [ ] Bilingual content managed in one place per item
- [ ] `i18n/ui.ts` contains only technical strings

---

## Keystatic UI Organization

```typescript
ui: {
  navigation: {
    'Inhalte': ['blog', 'team', 'programs', 'principles'],
    'Seiten': ['homepage', 'about', 'contact'],
    'Einstellungen': ['siteSettings'],
  },
}
```

---

## File Structure After Implementation

```
src/content/
├── blog/                    # Blog posts (existing)
│   ├── cafe-evolea.md
│   └── ...
├── team/                    # Team members (new)
│   ├── gianna-spiess.json
│   ├── annemarie-elias.json
│   ├── christoph-jenny.json
│   └── alexandra-aleksic.json
├── programs/                # Programs (new)
│   ├── mini-garten.json
│   ├── mini-projekte.json
│   ├── mini-turnen.json
│   ├── schulberatung.json
│   ├── mini-museum.json
│   ├── tagesschule.json
│   └── mini-restaurant.json
├── principles/              # Pedagogical principles (new)
│   ├── evidenzbasiert.json
│   ├── individuell.json
│   └── ... (9 total)
├── pages/                   # Page singletons (new structure)
│   ├── homepage.json
│   ├── about.json
│   └── contact.json
└── settings/
    └── site.json            # Global settings (expanded)
```
