# EVOLEA Angebote Structure Skill

> **Consistent, intuitive program page structure**

This specialist skill defines the canonical structure for all Angebote (program) pages: Mini Projekte, Mini Turnen, Mini Garten, Mini Museum, etc. Following this ensures visual harmony and intuitive navigation.

---

## The Problem We're Solving

Currently, program pages have inconsistent structures:

| Page | Has Hero Image | Has Emoji | Structure Consistent |
|------|---------------|-----------|---------------------|
| Mini Projekte | ✅ Yes | ❌ No | ✅ Reference |
| Mini Museum | ❌ No | ⚠️ Yes (💜) | ❌ Different |
| Mini Turnen | ✅ Yes | ❌ No | ⚠️ Mostly |
| Mini Garten | ✅ Yes | ❌ No | ⚠️ Mostly |

**Goal**: All Angebote pages should follow the Mini Projekte pattern.

---

## Canonical Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR (inherited from layout)                              │
├─────────────────────────────────────────────────────────────┤
│  HERO SECTION                                                │
│  ┌─────────────────────────────┬───────────────────────────┐│
│  │  Breadcrumb                 │                           ││
│  │  Tagline (small)            │                           ││
│  │  Title (H1, large)          │      HERO IMAGE           ││
│  │  Subtitle (description)     │      (required!)          ││
│  │  [CTA Button(s)]            │                           ││
│  │                             │                           ││
│  │  INFO BADGES                │                           ││
│  │  [Age] [Schedule] [etc.]    │                           ││
│  └─────────────────────────────┴───────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  SECTION: Für wen ist [Program]?                            │
│  - Target audience description                              │
│  - Prerequisites checklist                                  │
├─────────────────────────────────────────────────────────────┤
│  SECTION: Was macht [Program] besonders?                    │
│  - 3-4 feature cards with icons                             │
│  - Grid layout                                              │
├─────────────────────────────────────────────────────────────┤
│  SECTION: [Program-specific content]                        │
│  - e.g., "Aktuelle Projekte" for Mini Projekte              │
│  - e.g., "Der Ablauf" for Mini Museum                       │
├─────────────────────────────────────────────────────────────┤
│  SECTION: Praktische Informationen                          │
│  - Location, costs, contact                                 │
│  - Grid or 2-column layout                                  │
├─────────────────────────────────────────────────────────────┤
│  PAGE CLOSER CTA                                            │
│  "Helfen Sie Kindern im Spektrum"                           │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Hero Section Template

### Reference: Mini Projekte (Good) ✅

```astro
---
// ProgramHero.astro
interface Props {
  breadcrumb: { label: string; href: string }[];
  tagline: string;
  title: string;
  subtitle: string;
  heroImage: string;
  heroImageAlt: string;
  ctas?: { label: string; href: string; variant: 'primary' | 'outline' }[];
  infoBadges: {
    icon: string;
    label: string;
    value: string;
  }[];
}

const { breadcrumb, tagline, title, subtitle, heroImage, heroImageAlt, ctas, infoBadges } = Astro.props;
---

<section class="hero-section relative bg-gradient-prism py-12 lg:py-20">
  <div class="container">
    <!-- Breadcrumb -->
    <nav class="breadcrumb text-sm text-evolea-text-light mb-4" aria-label="Breadcrumb">
      {breadcrumb.map((item, i) => (
        <>
          {i > 0 && <span class="mx-2">/</span>}
          <a href={item.href} class="hover:text-evolea-magenta transition-colors">
            {item.label}
          </a>
        </>
      ))}
    </nav>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <!-- Content Column -->
      <div class="order-2 lg:order-1">
        <!-- Tagline - NO EMOJIS! -->
        <p class="text-sm font-medium text-evolea-purple mb-2">
          {tagline}
        </p>
        
        <!-- Title -->
        <h1 class="text-fluid-display font-fredoka font-bold text-evolea-text mb-4">
          {title}
        </h1>
        
        <!-- Subtitle -->
        <p class="text-fluid-body text-evolea-text-light mb-6 max-w-xl">
          {subtitle}
        </p>
        
        <!-- CTAs -->
        {ctas && ctas.length > 0 && (
          <div class="flex flex-wrap gap-4 mb-8">
            {ctas.map(cta => (
              <a 
                href={cta.href} 
                class:list={[
                  'btn',
                  cta.variant === 'primary' ? 'btn-primary' : 'btn-outline'
                ]}
              >
                {cta.label}
              </a>
            ))}
          </div>
        )}
        
        <!-- Info Badges -->
        <div class="flex flex-wrap gap-4">
          {infoBadges.map(badge => (
            <div class="info-badge flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-soft">
              <span class="text-evolea-magenta">
                <Icon name={badge.icon} class="w-5 h-5" />
              </span>
              <div>
                <span class="text-xs text-evolea-text-light block">{badge.label}</span>
                <span class="text-sm font-medium text-evolea-text">{badge.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <!-- Image Column -->
      <div class="order-1 lg:order-2">
        <img 
          src={heroImage}
          alt={heroImageAlt}
          class="w-full max-w-md lg:max-w-lg mx-auto rounded-2xl shadow-card"
          loading="eager"
        />
      </div>
    </div>
  </div>
</section>
```

### Anti-Pattern: Mini Museum (Issues) ❌

```html
<!-- DON'T DO THIS -->
<p class="tagline">💜 Februar – April 2026</p>  <!-- EMOJI BAD! -->
<h1>Mini Museum</h1>
<p>Wir werden kreativ!</p>
<!-- Missing hero image - unbalanced -->
```

### Fixed Version:

```html
<!-- DO THIS INSTEAD -->
<p class="tagline">Social Skills Gruppe</p>  <!-- Descriptive tagline -->
<h1>Mini Museum</h1>
<p>Kunst, Kreativität und Ausdruck – gemeinsam wird ein eigenes Museum gestaltet.</p>
<img src="/images/programs/mini-museum-hero.png" alt="Kinder gestalten Kunstwerke" />
<!-- ↑ REQUIRED hero image for visual balance -->
```

---

## Section Components

### Section Header

```astro
---
// SectionHeader.astro
interface Props {
  marker?: string; // e.g., "●"
  title: string;
  description?: string;
}
const { marker = '●', title, description } = Astro.props;
---

<div class="section-header mb-8">
  <h2 class="text-fluid-h2 font-fredoka font-bold text-evolea-text">
    <span class="text-evolea-magenta mr-2">{marker}</span>
    {title}
  </h2>
  {description && (
    <p class="text-fluid-body text-evolea-text-light mt-2 max-w-2xl">
      {description}
    </p>
  )}
</div>
```

### Feature Cards Grid

```astro
---
// FeatureGrid.astro
interface Props {
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
}
const { features } = Astro.props;
---

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {features.map(feature => (
    <div class="feature-card bg-white p-6 rounded-2xl shadow-soft hover:shadow-card transition-shadow">
      <div class="icon-wrapper w-12 h-12 bg-evolea-cream rounded-xl flex items-center justify-center mb-4">
        <Icon name={feature.icon} class="w-6 h-6 text-evolea-magenta" />
      </div>
      <h3 class="text-lg font-fredoka font-semibold text-evolea-text mb-2">
        {feature.title}
      </h3>
      <p class="text-sm text-evolea-text-light">
        {feature.description}
      </p>
    </div>
  ))}
</div>
```

### Prerequisites Checklist

```astro
---
// PrerequisitesList.astro
interface Props {
  items: string[];
}
const { items } = Astro.props;
---

<ul class="space-y-3">
  {items.map(item => (
    <li class="flex items-start gap-3">
      <span class="text-evolea-mint text-lg mt-0.5">✓</span>
      <span class="text-evolea-text">{item}</span>
    </li>
  ))}
</ul>
```

### Practical Info Grid

```astro
---
// PracticalInfo.astro
interface Props {
  items: {
    label: string;
    value: string;
  }[];
}
const { items } = Astro.props;
---

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => (
    <div class="info-item">
      <dt class="text-sm font-medium text-evolea-purple">{item.label}</dt>
      <dd class="text-evolea-text mt-1">{item.value}</dd>
    </div>
  ))}
</div>
```

---

## Info Badge Icons

Use these SVG icons instead of emojis:

| Badge Type | Icon Name | Color |
|------------|-----------|-------|
| Age | `users` or `child` | Magenta |
| Schedule | `calendar` | Purple |
| Duration | `clock` | Coral |
| Cost | `coins` | Gold |
| Location | `map-pin` | Sky |
| Group Size | `users` | Mint |

```astro
<!-- Example Info Badge -->
<div class="info-badge">
  <svg class="w-5 h-5 text-evolea-magenta"><!-- users icon --></svg>
  <div>
    <span class="label">Alter</span>
    <span class="value">5-8 Jahre</span>
  </div>
</div>
```

---

## Program-Specific Sections

### Mini Projekte

```
├── Aktuelle & kommende Projekte (project cards)
├── Was macht Mini Projekte besonders? (4 features)
└── Praktische Informationen
```

### Mini Museum / Mini Restaurant (Sub-projects)

```
├── Das Konzept (long-form description)
├── Der Ablauf (timeline with 6 sessions)
├── Projekt Ziele (learning goals)
├── Aufnahmekriterien (prerequisites)
└── Praktische Informationen
```

### Mini Turnen / Mini Garten

```
├── Für wen ist [Program]? (target audience)
├── Was macht [Program] besonders? (features)
├── Lernziele (learning goals with icons)
└── Praktische Informationen
```

---

## Color Coding by Program

Each program has a theme color for accents:

| Program | Theme Color | Hex | Usage |
|---------|-------------|-----|-------|
| Mini Projekte | Magenta | #DD48E0 | Badges, icons, accents |
| Mini Turnen | Sky | #5DADE2 | Badges, icons, accents |
| Mini Garten | Mint | #7BEDD5 | Badges, icons, accents |
| Mini Museum | Lavender | #CD87F8 | Badges, icons, accents |
| Mini Restaurant | Coral | #FF7E5D | Badges, icons, accents |

```astro
---
// Use color prop to theme the page
const colorMap = {
  'mini-projekte': 'evolea-magenta',
  'mini-turnen': 'evolea-sky',
  'mini-garten': 'evolea-mint',
  'mini-museum': 'evolea-lavender',
  'mini-restaurant': 'evolea-coral',
};
---
```

---

## Checklist: Before Publishing an Angebote Page

### Structure
- [ ] Hero has image (not just text)
- [ ] Hero has breadcrumb navigation
- [ ] Hero has tagline (text, NO emoji)
- [ ] Hero has title (H1)
- [ ] Hero has subtitle/description
- [ ] Hero has info badges (age, schedule, etc.)
- [ ] Has "Für wen" or equivalent section
- [ ] Has "Was macht X besonders" features section
- [ ] Has program-specific content section
- [ ] Has "Praktische Informationen"
- [ ] Has page closer CTA before footer

### Brand Compliance
- [ ] Zero emojis anywhere on page
- [ ] Using SVG icons only
- [ ] Hero has gradient background
- [ ] Using correct program theme color
- [ ] Fredoka for headlines
- [ ] Poppins for body text

### Content
- [ ] All text is bilingual (DE + EN versions)
- [ ] Age range specified
- [ ] Schedule/timing specified
- [ ] Location specified
- [ ] Contact information included
- [ ] Prerequisites listed (if applicable)

### Technical
- [ ] Hero image has alt text
- [ ] All images optimized
- [ ] Page loads in < 3s
- [ ] Mobile layout verified
- [ ] Touch targets ≥ 44px

---

## Migration Checklist: Mini Museum

To fix Mini Museum page:

1. [ ] Remove emoji 💜 from tagline
2. [ ] Add hero image (generate with AI if needed)
3. [ ] Move info badges into hero section
4. [ ] Add proper breadcrumb
5. [ ] Match section structure to Mini Projekte
6. [ ] Use Lavender (#CD87F8) as theme color
7. [ ] Verify mobile layout
8. [ ] Test all links

---

## Astro Layout Template

```astro
---
// src/layouts/ProgramLayout.astro
import BaseLayout from './BaseLayout.astro';
import ProgramHero from '@components/ProgramHero.astro';
import PageCloser from '@components/PageCloser.astro';

interface Props {
  program: {
    slug: string;
    tagline: string;
    title: string;
    subtitle: string;
    heroImage: string;
    themeColor: string;
    infoBadges: any[];
  };
}

const { program } = Astro.props;
---

<BaseLayout title={`${program.title} | EVOLEA`}>
  <ProgramHero {...program} />
  
  <main class="py-fluid-2xl">
    <slot />
  </main>
  
  <PageCloser />
</BaseLayout>
```

Usage:
```astro
---
// src/pages/angebote/mini-museum.astro
import ProgramLayout from '@layouts/ProgramLayout.astro';

const program = {
  slug: 'mini-museum',
  tagline: 'Kreatives Kunstprojekt',  // NO EMOJI!
  title: 'Mini Museum',
  subtitle: 'Kunst, Kreativität und Ausdruck – gemeinsam wird ein eigenes Museum gestaltet.',
  heroImage: '/images/programs/mini-museum-hero.png',
  themeColor: 'lavender',
  infoBadges: [
    { icon: 'users', label: 'Alter', value: '5-8 Jahre' },
    { icon: 'calendar', label: 'Wann', value: 'Samstags' },
    // ...
  ]
};
---

<ProgramLayout {program}>
  <!-- Page content -->
</ProgramLayout>
```

---

## Related Skills

- **Lead**: `EVOLEA-DESIGN-UX.md`
- **Illustrations**: `illustrations.md` - Generate hero images for programs
- **Responsive**: `responsive.md` - Mobile layout patterns
- **Animations**: `animations.md` - Section reveal animations
