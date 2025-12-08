import { config, fields, collection, singleton } from '@keystatic/core';

// =============================================================================
// EVOLEA CMS - Working Keystatic Configuration
// =============================================================================
// Simplified config that works on Cloudflare Pages.
// Note: content-components (wrapper/block) removed due to Cloudflare compatibility issues.
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

// Icon options
const iconOptions = [
  { label: 'Sprout (Wachstum)', value: 'sprout' },
  { label: 'Palette (Kreativ)', value: 'palette' },
  { label: 'Running (Bewegung)', value: 'running' },
  { label: 'Book (Lernen)', value: 'book' },
  { label: 'Home (Zuhause)', value: 'home' },
  { label: 'Sparkle (Besonders)', value: 'sparkle' },
  { label: 'Heart (Herz)', value: 'heart' },
  { label: 'Target (Ziel)', value: 'target' },
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
  { label: 'Grün', value: 'green' },
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
      Inhalte: ['blog', 'team', 'principles'],
      Seiten: ['homepage', 'about', 'contact'],
      Medien: ['siteImages'],
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
        content: fields.mdx({
          label: 'Inhalt',
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

    // =========================================================================
    // SITE IMAGES SINGLETON
    // =========================================================================
    siteImages: singleton({
      label: 'Bilder verwalten',
      path: 'src/content/settings/images',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            poster: fields.image({
              label: 'Hero Poster (Startseite)',
              description: 'Das Standbild das angezeigt wird bevor das Video lädt. Empfohlen: 1920x1080px',
              directory: 'public/images',
              publicPath: '/images/',
            }),
          },
          { label: 'Hero Bilder' }
        ),

        programme: fields.object(
          {
            miniGarten: fields.image({
              label: 'Mini Garten',
              description: 'Bild für Mini Garten Programm',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
            miniProjekte: fields.image({
              label: 'Mini Projekte',
              description: 'Bild für Mini Projekte Programm',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
            miniTurnen: fields.image({
              label: 'Mini Turnen',
              description: 'Bild für Mini Turnen Programm',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
            miniMuseum: fields.image({
              label: 'Mini Museum',
              description: 'Bild für Mini Museum Programm',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
            miniRestaurant: fields.image({
              label: 'Mini Restaurant',
              description: 'Bild für Mini Restaurant Programm',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
            tagesschule: fields.image({
              label: 'Tagesschule',
              description: 'Bild für Tagesschule Programm',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
          },
          { label: 'Programm-Bilder' }
        ),

        ueberUns: fields.object(
          {
            bild1: fields.image({
              label: 'Über uns Bild 1',
              description: 'Erstes Bild auf der Über uns Seite',
              directory: 'public/images/about',
              publicPath: '/images/about/',
            }),
            bild2: fields.image({
              label: 'Über uns Bild 2',
              description: 'Zweites Bild auf der Über uns Seite',
              directory: 'public/images/about',
              publicPath: '/images/about/',
            }),
          },
          { label: 'Über uns Bilder' }
        ),
      },
    }),
  },
});
