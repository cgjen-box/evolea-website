import { config, fields, collection, singleton } from '@keystatic/core';
// Note: Temporarily disabled content-components to test Cloudflare compatibility
// import { block, wrapper } from '@keystatic/core/content-components';

// =============================================================================
// EVOLEA CMS - Ultimate Keystatic Configuration
// =============================================================================
// This config maximizes Keystatic's features for the best editing experience:
// - German labels with helpful descriptions
// - Content components for rich text
// - Conditional fields for smart forms
// - Entry layouts for writer mode
// - Relationship fields to link content
// - Flexible blocks for homepage
// =============================================================================

// Detect if we're in local mode or GitHub mode
const isLocal = process.env.NODE_ENV === 'development' && !process.env.KEYSTATIC_GITHUB_CLIENT_ID;

// =============================================================================
// REUSABLE FIELD HELPERS
// =============================================================================

// Bilingual text field (DE + EN)
const bilingualText = (labelDe: string, labelEn: string, options?: { multiline?: boolean; description?: string }) =>
  fields.object(
    {
      de: fields.text({
        label: `${labelDe} (DE)`,
        multiline: options?.multiline,
      }),
      en: fields.text({
        label: `${labelEn} (EN)`,
        multiline: options?.multiline,
      }),
    },
    {
      label: labelDe,
      description: options?.description,
    }
  );

// SEO fields (conditional - only shown when enabled)
const seoFields = fields.conditional(
  fields.checkbox({
    label: 'Eigene SEO-Einstellungen',
    description: 'Aktivieren für individuelle Meta-Tags (sonst werden Standardwerte verwendet)',
    defaultValue: false,
  }),
  {
    true: fields.object({
      metaTitel: fields.text({
        label: 'Meta-Titel',
        description: 'Wird im Browser-Tab und bei Google angezeigt (max. 60 Zeichen)',
      }),
      metaBeschreibung: fields.text({
        label: 'Meta-Beschreibung',
        description: 'Wird in Google-Suchergebnissen angezeigt (max. 160 Zeichen)',
        multiline: true,
      }),
      ogBild: fields.image({
        label: 'Social Media Bild',
        description: 'Wird beim Teilen auf Facebook, LinkedIn etc. angezeigt (1200x630px)',
        directory: 'public/images/og',
        publicPath: '/images/og/',
      }),
    }),
    false: fields.empty(),
  }
);

// Status fields (published, order)
const statusFields = {
  veroeffentlicht: fields.checkbox({
    label: 'Veröffentlicht',
    description: 'Deaktivieren um Inhalt zu verstecken ohne zu löschen',
    defaultValue: true,
  }),
  reihenfolge: fields.integer({
    label: 'Reihenfolge',
    description: 'Kleinere Zahlen erscheinen zuerst (0 = ganz oben)',
    defaultValue: 0,
  }),
};

// =============================================================================
// CONTENT COMPONENTS (for MDX fields)
// =============================================================================
// Note: Content components (Hinweis, Zitat, BildMitBeschriftung, YouTube, InfoKarte)
// temporarily disabled to test Cloudflare compatibility.
// The wrapper/block from @keystatic/core/content-components may not work in workers.

const contentComponents = {};

// =============================================================================
// ICON OPTIONS (reused across collections)
// =============================================================================

const iconOptions = [
  { label: 'Sprout (Wachstum)', value: 'sprout' },
  { label: 'Palette (Kreativ)', value: 'palette' },
  { label: 'Running (Bewegung)', value: 'running' },
  { label: 'Book (Lernen)', value: 'book' },
  { label: 'Home (Zuhause)', value: 'home' },
  { label: 'Sparkle (Besonders)', value: 'sparkle' },
  { label: 'Heart (Herz)', value: 'heart' },
  { label: 'Target (Ziel)', value: 'target' },
  { label: 'Chart (Daten)', value: 'chart' },
  { label: 'Gamepad (Spielerisch)', value: 'gamepad' },
  { label: 'Clipboard (Struktur)', value: 'clipboard' },
  { label: 'Handshake (Zusammenarbeit)', value: 'handshake' },
  { label: 'Diamond (Wertvoll)', value: 'diamond' },
  { label: 'People (Menschen)', value: 'people' },
  { label: 'Family (Familie)', value: 'family' },
  { label: 'Rainbow (Vielfalt)', value: 'rainbow' },
  { label: 'Brain (Denken)', value: 'brain' },
];

const colorOptions = [
  { label: 'Magenta', value: 'magenta' },
  { label: 'Coral', value: 'coral' },
  { label: 'Gelb', value: 'yellow' },
  { label: 'Himmelblau', value: 'sky' },
  { label: 'Mint', value: 'mint' },
  { label: 'Lila', value: 'purple' },
  { label: 'Rosa', value: 'pink' },
  { label: 'Gold', value: 'gold' },
  { label: 'Grün', value: 'green' },
  { label: 'Orange', value: 'orange' },
];

// =============================================================================
// MAIN CONFIG
// =============================================================================

export default config({
  storage: isLocal
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: 'cgjen-box/evolea-website',
        branchPrefix: 'keystatic/',
      },

  ui: {
    brand: {
      name: 'EVOLEA CMS',
    },
    navigation: {
      Inhalte: ['blog', 'team', 'programs', 'principles', 'testimonials'],
      Seiten: ['homepage', 'about', 'contact'],
      Einstellungen: ['siteSettings'],
    },
  },

  // ===========================================================================
  // COLLECTIONS
  // ===========================================================================
  collections: {
    // =========================================================================
    // BLOG COLLECTION
    // =========================================================================
    blog: collection({
      label: 'Blog Artikel',
      slugField: 'title',
      path: 'src/content/blog/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({
          name: {
            label: 'Titel',
            description: 'Der Titel erscheint als Überschrift und in der URL',
          },
        }),
        description: fields.text({
          label: 'Kurzbeschreibung',
          description: 'Wird in Vorschaukarten und bei Google angezeigt (2-3 Sätze)',
          multiline: true,
        }),
        pubDate: fields.date({
          label: 'Veröffentlichungsdatum',
        }),
        author: fields.text({
          label: 'Autor',
          defaultValue: 'EVOLEA Team',
        }),
        image: fields.image({
          label: 'Titelbild',
          description: 'Empfohlene Grösse: 1200x630px',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          description: 'Kategorien für den Artikel',
          itemLabel: (props) => props.value || 'Neuer Tag',
        }),
        featured: fields.checkbox({
          label: 'Empfohlen',
          description: 'Diesen Artikel auf der Blog-Übersicht hervorheben',
          defaultValue: false,
        }),
        verwandteArtikel: fields.array(
          fields.relationship({
            label: 'Artikel',
            collection: 'blog',
          }),
          {
            label: 'Verwandte Artikel',
            description: 'Werden am Ende des Artikels angezeigt (max. 3)',
          }
        ),
        content: fields.mdx({
          label: 'Inhalt',
          components: contentComponents,
          options: {
            bold: true,
            italic: true,
            strikethrough: true,
            code: true,
            heading: [2, 3, 4],
            blockquote: true,
            orderedList: true,
            unorderedList: true,
            table: true,
            link: true,
            image: true,
            divider: true,
          },
        }),
      },
    }),

    // =========================================================================
    // TEAM COLLECTION
    // =========================================================================
    team: collection({
      label: 'Team',
      slugField: 'name',
      path: 'src/content/team/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({
          name: {
            label: 'Name',
            description: 'Vollständiger Name der Person',
          },
        }),
        credentials: fields.text({
          label: 'Titel/Credentials',
          description: 'z.B. "M.Sc., BCBA" - leer lassen wenn keine',
        }),
        rolle: bilingualText('Rolle', 'Role', {
          description: 'z.B. "Mitgründerin, Psychologin"',
        }),
        foto: fields.image({
          label: 'Foto',
          description: 'Quadratisches Foto empfohlen (min. 400x400px)',
          directory: 'public/images/team',
          publicPath: '/images/team/',
        }),
        beschreibung: bilingualText('Beschreibung', 'Description', {
          multiline: true,
          description: 'Kurzer Bio-Text (2-3 Sätze)',
        }),
        email: fields.text({
          label: 'E-Mail (intern)',
          description: 'Wird nicht öffentlich angezeigt',
        }),
        linkedin: fields.url({
          label: 'LinkedIn Profil',
        }),
        leitetProgramme: fields.array(
          fields.relationship({
            label: 'Programm',
            collection: 'programs',
          }),
          {
            label: 'Leitet Programme',
            description: 'Welche Programme leitet diese Person?',
          }
        ),
        ...statusFields,
      },
    }),

    // =========================================================================
    // PROGRAMS COLLECTION
    // =========================================================================
    programs: collection({
      label: 'Angebote',
      slugField: 'slug',
      path: 'src/content/programs/*',
      format: { data: 'json' },
      schema: {
        slug: fields.slug({
          name: {
            label: 'URL-Slug',
            description: 'Wird in der URL verwendet (z.B. "mini-garten")',
          },
        }),
        icon: fields.select({
          label: 'Icon',
          options: iconOptions,
          defaultValue: 'sparkle',
        }),
        farbe: fields.select({
          label: 'Themenfarbe',
          description: 'Bestimmt die Akzentfarbe der Seite',
          options: colorOptions,
          defaultValue: 'green',
        }),

        // Key Info
        keyInfo: fields.object(
          {
            alter: fields.text({
              label: 'Altersgruppe',
              description: 'z.B. "3-6 Jahre"',
            }),
            tag: fields.text({
              label: 'Wochentag',
              description: 'z.B. "Montag"',
            }),
            zeit: fields.text({
              label: 'Uhrzeit',
              description: 'z.B. "13:30-16:30"',
            }),
            gruppengroesse: fields.text({
              label: 'Gruppengrösse',
              description: 'z.B. "4 + 2 Kinder"',
            }),
            standort: fields.text({
              label: 'Standort',
              description: 'z.B. "Zürich"',
            }),
          },
          { label: 'Eckdaten' }
        ),

        // Titles
        titel: bilingualText('Programmname', 'Program Name'),
        tagline: bilingualText('Tagline', 'Tagline', {
          description: 'Kurzer Slogan unter dem Titel',
        }),
        kurzbeschreibung: bilingualText('Kurzbeschreibung', 'Short Description', {
          multiline: true,
          description: 'Für Vorschaukarten (2-3 Sätze)',
        }),

        // Images
        heroImage: fields.image({
          label: 'Hero-Bild',
          description: 'Hauptbild für die Programm-Seite',
          directory: 'public/images/programs',
          publicPath: '/images/programs/',
        }),

        // Full Content
        inhalt: fields.object(
          {
            de: fields.mdx({
              label: 'Vollständiger Inhalt (DE)',
              description: 'Der komplette Seiteninhalt',
              components: contentComponents,
            }),
            en: fields.mdx({
              label: 'Full Content (EN)',
              components: contentComponents,
            }),
          },
          { label: 'Seiteninhalt' }
        ),

        // Learning Goals
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

        // Practical Info
        praktischeInfos: fields.array(
          fields.object({
            icon: fields.select({
              label: 'Icon',
              options: iconOptions,
              defaultValue: 'info',
            }),
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
          }),
          {
            label: 'Praktische Informationen',
            description: 'Standort, Zeiten, Transport etc.',
            itemLabel: (props) => (props.fields.titel.fields.de.value as string) || 'Neue Info',
          }
        ),

        seo: seoFields,
        ...statusFields,
      },
    }),

    // =========================================================================
    // PRINCIPLES COLLECTION
    // =========================================================================
    principles: collection({
      label: 'Pädagogische Grundsätze',
      slugField: 'titel',
      path: 'src/content/principles/*',
      format: { data: 'json' },
      schema: {
        titel: fields.slug({
          name: {
            label: 'Titel (DE)',
            description: 'z.B. "Evidenzbasiert"',
          },
        }),
        titelEn: fields.text({
          label: 'Title (EN)',
        }),
        beschreibung: bilingualText('Beschreibung', 'Description', {
          multiline: true,
          description: 'Kurze Erklärung des Grundsatzes',
        }),
        icon: fields.select({
          label: 'Icon',
          options: iconOptions,
          defaultValue: 'sparkle',
        }),
        farbe: fields.select({
          label: 'Farbe',
          options: colorOptions,
          defaultValue: 'magenta',
        }),
        ...statusFields,
      },
    }),

    // =========================================================================
    // TESTIMONIALS COLLECTION
    // =========================================================================
    testimonials: collection({
      label: 'Testimonials',
      slugField: 'name',
      path: 'src/content/testimonials/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({
          name: {
            label: 'Name',
            description: 'Name der Person (kann anonymisiert sein)',
          },
        }),
        zitat: bilingualText('Zitat', 'Quote', {
          multiline: true,
          description: 'Das Testimonial-Zitat',
        }),
        rolle: bilingualText('Rolle', 'Role', {
          description: 'z.B. "Mutter eines Kindes im Mini Garten"',
        }),
        programm: fields.relationship({
          label: 'Programm',
          collection: 'programs',
          description: 'Welches Programm betrifft dieses Testimonial?',
        }),
        foto: fields.image({
          label: 'Foto (optional)',
          directory: 'public/images/testimonials',
          publicPath: '/images/testimonials/',
        }),
        datum: fields.date({
          label: 'Datum',
        }),
        ...statusFields,
      },
    }),
  },

  // ===========================================================================
  // SINGLETONS
  // ===========================================================================
  singletons: {
    // =========================================================================
    // HOMEPAGE SINGLETON
    // =========================================================================
    homepage: singleton({
      label: 'Startseite',
      path: 'src/content/pages/homepage',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            untertitel: bilingualText('Untertitel', 'Subtitle', { multiline: true }),
            buttonText: bilingualText('Button Text', 'Button Text'),
            buttonLink: fields.text({
              label: 'Button Link',
              description: 'z.B. "/angebote/"',
            }),
          },
          { label: 'Hero-Bereich' }
        ),

        angeboteSection: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
          },
          { label: 'Angebote-Sektion' }
        ),

        grundsaetzeSection: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            anzahl: fields.integer({
              label: 'Anzahl anzeigen',
              description: 'Wie viele Grundsätze sollen gezeigt werden?',
              defaultValue: 9,
            }),
          },
          { label: 'Grundsätze-Sektion' }
        ),

        visionSection: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
          },
          { label: 'Vision-Sektion (dunkel)' }
        ),

        teamSection: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            buttonText: bilingualText('Button Text', 'Button Text'),
            anzahl: fields.integer({
              label: 'Anzahl Teammitglieder',
              defaultValue: 4,
            }),
          },
          { label: 'Team-Sektion' }
        ),

        kontaktSection: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text'),
          },
          { label: 'Kontakt-Sektion' }
        ),

        cta: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            buttonText: bilingualText('Button Text', 'Button Text'),
            buttonLink: fields.text({ label: 'Button Link' }),
          },
          { label: 'Call-to-Action (Ende)' }
        ),

        seo: seoFields,
      },
    }),

    // =========================================================================
    // ABOUT SINGLETON
    // =========================================================================
    about: singleton({
      label: 'Über uns',
      path: 'src/content/pages/about',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            untertitel: bilingualText('Untertitel', 'Subtitle', { multiline: true }),
          },
          { label: 'Hero-Bereich' }
        ),

        mission: fields.object(
          {
            label: bilingualText('Label', 'Label', { description: 'z.B. "Unsere Mission"' }),
            titel: bilingualText('Titel', 'Title'),
            text1: bilingualText('Absatz 1', 'Paragraph 1', { multiline: true }),
            text2: bilingualText('Absatz 2', 'Paragraph 2', { multiline: true }),
            bild: fields.image({
              label: 'Bild',
              directory: 'public/images/about',
              publicPath: '/images/about/',
            }),
            bildAlt: bilingualText('Bild Alt-Text', 'Image Alt Text'),
          },
          { label: 'Mission-Sektion' }
        ),

        vision: fields.object(
          {
            label: bilingualText('Label', 'Label'),
            titel: bilingualText('Titel', 'Title'),
            zitat: bilingualText('Zitat', 'Quote', { multiline: true }),
          },
          { label: 'Vision-Sektion (dunkel)' }
        ),

        fuerWen: fields.object(
          {
            label: bilingualText('Label', 'Label'),
            titel: bilingualText('Titel', 'Title'),
            gruppen: fields.array(
              fields.object({
                icon: fields.select({
                  label: 'Icon',
                  options: iconOptions,
                  defaultValue: 'sparkle',
                }),
                farbe: fields.select({
                  label: 'Farbe',
                  options: colorOptions,
                  defaultValue: 'magenta',
                }),
                titel: bilingualText('Titel', 'Title'),
                beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
              }),
              {
                label: 'Zielgruppen',
                itemLabel: (props) => (props.fields.titel.fields.de.value as string) || 'Neue Gruppe',
              }
            ),
            hinweis: bilingualText('Hinweis', 'Note', { multiline: true }),
          },
          { label: '"Für wen"-Sektion' }
        ),

        verein: fields.object(
          {
            label: bilingualText('Label', 'Label'),
            titel: bilingualText('Titel', 'Title'),
            text1: bilingualText('Absatz 1', 'Paragraph 1', { multiline: true }),
            text2: bilingualText('Absatz 2', 'Paragraph 2', { multiline: true }),
            kartenTitel: bilingualText('Karten-Titel', 'Card Title'),
            kartenText: bilingualText('Karten-Text', 'Card Text', { multiline: true }),
            gruendung: fields.text({ label: 'Gründungsjahr' }),
            standort: fields.text({ label: 'Standort' }),
          },
          { label: 'Verein-Sektion' }
        ),

        cta: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            buttonText: bilingualText('Button Text', 'Button Text'),
            buttonLink: fields.text({ label: 'Button Link' }),
          },
          { label: 'Call-to-Action' }
        ),

        seo: seoFields,
      },
    }),

    // =========================================================================
    // CONTACT SINGLETON
    // =========================================================================
    contact: singleton({
      label: 'Kontakt',
      path: 'src/content/pages/contact',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            untertitel: bilingualText('Untertitel', 'Subtitle', { multiline: true }),
          },
          { label: 'Hero-Bereich' }
        ),

        kontaktInfo: fields.object(
          {
            sectionTitel: bilingualText('Sektion-Titel', 'Section Title'),
            email: fields.text({ label: 'E-Mail' }),
            telefon: fields.text({ label: 'Telefon' }),
            whatsapp: fields.text({
              label: 'WhatsApp Link',
              description: 'z.B. "https://wa.me/41789591974"',
            }),
            instagram: fields.text({ label: 'Instagram Handle', description: 'z.B. "@evolea.verein"' }),
            instagramUrl: fields.url({ label: 'Instagram URL' }),
          },
          { label: 'Kontaktdaten' }
        ),

        adresse: fields.object(
          {
            strasse: fields.text({ label: 'Strasse' }),
            plz: fields.text({ label: 'PLZ' }),
            ort: fields.text({ label: 'Ort' }),
            land: fields.text({ label: 'Land' }),
            hinweis: bilingualText('Hinweis', 'Note', { description: 'z.B. "Nähe Seilbahn Rigiblick"' }),
          },
          { label: 'Adresse' }
        ),

        erstgespraech: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
          },
          { label: 'Erstgespräch-Box' }
        ),

        formular: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            formspreeId: fields.text({
              label: 'Formspree ID',
              description: 'Die ID aus Formspree (z.B. "xpznqrjk")',
            }),
            betreffs: fields.array(
              fields.object({
                value: fields.text({ label: 'Wert (für Code)' }),
                label: bilingualText('Anzeige-Text', 'Display Text'),
              }),
              {
                label: 'Betreff-Optionen',
                itemLabel: (props) => (props.fields.label.fields.de.value as string) || 'Neue Option',
              }
            ),
          },
          { label: 'Kontaktformular' }
        ),

        seo: seoFields,
      },
    }),

    // =========================================================================
    // SITE SETTINGS SINGLETON
    // =========================================================================
    siteSettings: singleton({
      label: 'Website Einstellungen',
      path: 'src/content/settings/site',
      format: { data: 'json' },
      schema: {
        siteName: fields.text({
          label: 'Website Name',
          defaultValue: 'EVOLEA',
        }),
        siteDescription: bilingualText('Website-Beschreibung', 'Site Description', {
          multiline: true,
          description: 'Standard-Beschreibung für SEO',
        }),

        kontakt: fields.object(
          {
            email: fields.text({ label: 'E-Mail', defaultValue: 'hello@evolea.ch' }),
            telefon: fields.text({ label: 'Telefon' }),
            whatsapp: fields.url({ label: 'WhatsApp URL' }),
          },
          { label: 'Kontaktdaten' }
        ),

        adresse: fields.object(
          {
            strasse: fields.text({ label: 'Strasse' }),
            plz: fields.text({ label: 'PLZ' }),
            ort: fields.text({ label: 'Ort' }),
            land: fields.text({ label: 'Land', defaultValue: 'Schweiz' }),
          },
          { label: 'Adresse' }
        ),

        social: fields.object(
          {
            instagram: fields.url({ label: 'Instagram' }),
            linkedin: fields.url({ label: 'LinkedIn' }),
            facebook: fields.url({ label: 'Facebook' }),
          },
          { label: 'Social Media' }
        ),

        navigation: fields.object(
          {
            de: fields.object({
              home: fields.text({ label: 'Startseite', defaultValue: 'Startseite' }),
              programs: fields.text({ label: 'Angebote', defaultValue: 'Angebote' }),
              about: fields.text({ label: 'Über uns', defaultValue: 'Über uns' }),
              team: fields.text({ label: 'Team', defaultValue: 'Team' }),
              blog: fields.text({ label: 'Blog', defaultValue: 'Blog' }),
              contact: fields.text({ label: 'Kontakt', defaultValue: 'Kontakt' }),
            }),
            en: fields.object({
              home: fields.text({ label: 'Home', defaultValue: 'Home' }),
              programs: fields.text({ label: 'Programs', defaultValue: 'Programs' }),
              about: fields.text({ label: 'About', defaultValue: 'About Us' }),
              team: fields.text({ label: 'Team', defaultValue: 'Team' }),
              blog: fields.text({ label: 'Blog', defaultValue: 'Blog' }),
              contact: fields.text({ label: 'Contact', defaultValue: 'Contact' }),
            }),
          },
          { label: 'Navigation' }
        ),

        footer: fields.object(
          {
            tagline: bilingualText('Tagline', 'Tagline', { multiline: true }),
            copyright: fields.text({
              label: 'Copyright',
              defaultValue: '© 2025 EVOLEA Verein. Alle Rechte vorbehalten.',
            }),
            datenschutzText: bilingualText('Datenschutz-Link', 'Privacy Link'),
            impressumText: bilingualText('Impressum-Link', 'Imprint Link'),
          },
          { label: 'Footer' }
        ),
      },
    }),
  },
});
