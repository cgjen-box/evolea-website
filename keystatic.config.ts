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
  { label: 'Ball (Sport)', value: 'ball' },
  { label: 'School (Schule)', value: 'school' },
  { label: 'Chart (Evidenz)', value: 'chart' },
  { label: 'Target (Ziel)', value: 'target' },
  { label: 'Gamepad (Spielerisch)', value: 'gamepad' },
  { label: 'Clipboard (Strukturiert)', value: 'clipboard' },
  { label: 'Diamond (Ressourcen)', value: 'diamond' },
  { label: 'Family (Familie)', value: 'family' },
  { label: 'Rainbow (Vielfalt)', value: 'rainbow' },
  { label: 'Heart (Herz)', value: 'heart' },
  { label: 'Book (Lernen)', value: 'book' },
  { label: 'Brain (Denken)', value: 'brain' },
  { label: 'Handshake (Miteinander)', value: 'handshake' },
  { label: 'Running (Bewegung)', value: 'running' },
  { label: 'Gymnast (Turnen)', value: 'gymnast' },
  { label: 'Leaf (Natur)', value: 'leaf' },
  { label: 'People (Menschen)', value: 'people' },
  { label: 'Calendar (Termin)', value: 'calendar' },
  { label: 'Clock (Zeit)', value: 'clock' },
  { label: 'Location (Ort)', value: 'location' },
  { label: 'Mail (Kontakt)', value: 'mail' },
  { label: 'Money (Kosten)', value: 'money' },
  { label: 'Coffee (Cafe)', value: 'coffee' },
  { label: 'Check (Haken)', value: 'check' },
  { label: 'Sparkle (Besonders)', value: 'sparkle' },
];

const colorOptions = [
  { label: 'Magenta', value: 'magenta' },
  { label: 'Orange', value: 'orange' },
  { label: 'Coral', value: 'coral' },
  { label: 'Gelb', value: 'yellow' },
  { label: 'Gold', value: 'gold' },
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
      },

  ui: {
    brand: {
      name: 'EVOLEA CMS',
    },
    navigation: {
      Inhalte: ['blog', 'blogEn', 'team', 'principles'],
      Seiten: ['homepage', 'about', 'contact'],
      Programme: ['angeboteIndex', 'miniGarten', 'miniProjekte', 'miniMuseum', 'miniTurnen', 'evoleaCafe', 'tagesschule'],
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
    // BLOG COLLECTION (EN)
    // =========================================================================
    blogEn: collection({
      label: 'Blog Articles (EN)',
      slugField: 'title',
      path: 'src/content/blogEn/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'The title appears as heading and in the URL',
          },
        }),
        description: fields.text({
          label: 'Description',
          description: 'Used in preview cards and search (2-3 sentences)',
          multiline: true,
        }),
        pubDate: fields.date({
          label: 'Publish date',
        }),
        author: fields.text({
          label: 'Author',
          defaultValue: 'EVOLEA Team',
        }),
        image: fields.image({
          label: 'Cover image',
          description: 'Recommended size: 1200x630px',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          description: 'Categories for the article',
          itemLabel: (props) => props.value || 'New tag',
        }),
        featured: fields.checkbox({
          label: 'Featured',
          description: 'Highlight on the blog overview',
          defaultValue: false,
        }),
        content: fields.mdx({
          label: 'Content',
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
        leitetProgramme: fields.array(fields.text({ label: 'Programm' }), {
          label: 'Leitet Programme',
          description: 'Optional: Programme die diese Person leitet',
          itemLabel: (props) => props.value || 'Neues Programm',
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
            label: bilingualText('Label', 'Label', { description: 'z.B. "Angebote"' }),
            titel: bilingualText('Titel', 'Title'),
            intro1: bilingualText('Intro Absatz 1', 'Intro Paragraph 1', { multiline: true }),
            intro2: bilingualText('Intro Absatz 2', 'Intro Paragraph 2', { multiline: true }),
            listItems: fields.array(
              bilingualText('Listenpunkt', 'List Item'),
              {
                label: 'Angebots-Liste',
                itemLabel: (props) => (props.fields.de.value as string) || 'Neuer Punkt',
              }
            ),
            outro: bilingualText('Outro', 'Outro', { multiline: true }),
            funding: bilingualText('Finanzierung', 'Funding', { multiline: true }),
            weitereAngeboteLabel: bilingualText('Weitere Angebote Label', 'More Programs Label'),
          },
          { label: 'Angebote-Sektion Einleitung' }
        ),

        // Individual program cards
        angeboteCards: fields.object(
          {
            miniTurnen: fields.object(
              {
                status: bilingualText('Status Badge', 'Status Badge'),
                titel: bilingualText('Titel', 'Title'),
                beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
                startDatum: bilingualText('Start Datum', 'Start Date'),
                zeit: bilingualText('Zeit', 'Time'),
                alter: bilingualText('Alter', 'Age'),
                buttonText: bilingualText('Button Text', 'Button Text'),
              },
              { label: 'Mini Turnen' }
            ),
            miniMuseum: fields.object(
              {
                status: bilingualText('Status Badge', 'Status Badge'),
                titel: bilingualText('Titel', 'Title'),
                beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
                startDatum: bilingualText('Start Datum', 'Start Date'),
                zeit: bilingualText('Zeit', 'Time'),
                alter: bilingualText('Alter', 'Age'),
                buttonText: bilingualText('Button Text', 'Button Text'),
              },
              { label: 'Mini Museum' }
            ),
            miniGarten: fields.object(
              {
                status: bilingualText('Status Badge', 'Status Badge'),
                titel: bilingualText('Titel', 'Title'),
                beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
                startDatum: bilingualText('Start Datum', 'Start Date'),
                zeit: bilingualText('Zeit', 'Time'),
                alter: bilingualText('Alter', 'Age'),
                buttonText: bilingualText('Button Text', 'Button Text'),
              },
              { label: 'Mini Garten' }
            ),
            miniRestaurant: fields.object(
              {
                status: bilingualText('Status Badge', 'Status Badge'),
                titel: bilingualText('Titel', 'Title'),
                beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
                detail: bilingualText('Detail', 'Detail'),
                buttonText: bilingualText('Button Text', 'Button Text'),
              },
              { label: 'Mini Restaurant' }
            ),
            evoleaCafe: fields.object(
              {
                status: bilingualText('Status Badge', 'Status Badge'),
                titel: bilingualText('Titel', 'Title'),
                beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
                detail: bilingualText('Detail', 'Detail'),
                buttonText: bilingualText('Button Text', 'Button Text'),
              },
              { label: 'EVOLEA Cafe' }
            ),
            tagesschule: fields.object(
              {
                status: bilingualText('Status Badge', 'Status Badge'),
                titel: bilingualText('Titel', 'Title'),
                beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
                detail: bilingualText('Detail', 'Detail'),
                buttonText: bilingualText('Button Text', 'Button Text'),
              },
              { label: 'Tagesschule' }
            ),
          },
          { label: 'Angebote Karten' }
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
    // SITE IMAGES & VIDEOS SINGLETON
    // =========================================================================
    siteImages: singleton({
      label: 'Bilder & Videos',
      path: 'src/content/settings/images',
      format: { data: 'json' },
      schema: {
        // ===========================================
        // STARTSEITE / HOMEPAGE
        // ===========================================
        startseite: fields.object(
          {
            videoPoster: fields.image({
              label: 'Video Poster (Startseite)',
              description: 'Standbild vor Video-Start. Empfohlen: 1920x1080px. Aktuell: /images/hero-poster.jpg',
              directory: 'public/images',
              publicPath: '/images/',
            }),
            ogImage: fields.image({
              label: 'Social Media Vorschaubild',
              description: 'Wird bei Links auf Facebook/WhatsApp etc. angezeigt. Empfohlen: 1200x630px',
              directory: 'public/images',
              publicPath: '/images/',
            }),
          },
          { label: 'Startseite' }
        ),

        // ===========================================
        // PROGRAMME / ANGEBOTE HEROES
        // ===========================================
        programmeHeroes: fields.object(
          {
            miniGarten: fields.image({
              label: 'Mini Garten Hero',
              description: 'Hero-Bild für Mini Garten Seite. Aktuell: /images/generated/mini-garten-hero.png',
              directory: 'public/images/generated',
              publicPath: '/images/generated/',
            }),
            miniProjekte: fields.image({
              label: 'Mini Projekte Hero',
              description: 'Hero-Bild für Mini Projekte Seite. Aktuell: /images/generated/mini-projekte-hero.png',
              directory: 'public/images/generated',
              publicPath: '/images/generated/',
            }),
            miniTurnen: fields.image({
              label: 'Mini Turnen Hero',
              description: 'Hero-Bild für Mini Turnen Seite. Aktuell: /images/generated/mini-turnen-hero.png',
              directory: 'public/images/generated',
              publicPath: '/images/generated/',
            }),
            miniMuseum: fields.image({
              label: 'Mini Museum Hero',
              description: 'Hero-Bild für Mini Museum Seite (nutzt CSS-Gradient als Standard)',
              directory: 'public/images/generated',
              publicPath: '/images/generated/',
            }),
            miniRestaurantPoster: fields.image({
              label: 'Mini Restaurant Video Poster',
              description: 'Standbild für Mini Restaurant Video. Aktuell: /images/mini-restaurant-poster.jpg',
              directory: 'public/images',
              publicPath: '/images/',
            }),
            tagesschule: fields.image({
              label: 'Tagesschule Hero',
              description: 'Hero-Bild für Tagesschule Seite. Aktuell: /images/generated/tagesschule-hero.png',
              directory: 'public/images/generated',
              publicPath: '/images/generated/',
            }),
            angeboteIndex: fields.image({
              label: 'Angebote Übersicht Hero',
              description: 'Hero-Bild für die Angebote-Übersichtsseite',
              directory: 'public/images/hero',
              publicPath: '/images/hero/',
            }),
            evoleaCafe: fields.image({
              label: 'EVOLEA Cafe Hero',
              description: 'Hero-Bild für EVOLEA Cafe Seite',
              directory: 'public/images/hero',
              publicPath: '/images/hero/',
            }),
            spenden: fields.image({
              label: 'Spenden Hero',
              description: 'Hero-Bild für Spenden-Seite',
              directory: 'public/images/hero',
              publicPath: '/images/hero/',
            }),
          },
          { label: 'Programm Hero-Bilder' }
        ),

        // ===========================================
        // ANGEBOTE ÜBERSICHT KARTEN
        // ===========================================
        programmeKarten: fields.object(
          {
            miniGarten: fields.image({
              label: 'Mini Garten Karte',
              description: 'Kartenbild für Angebote-Übersicht',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
            miniProjekte: fields.image({
              label: 'Mini Projekte Karte',
              description: 'Kartenbild für Angebote-Übersicht',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
            miniTurnen: fields.image({
              label: 'Mini Turnen Karte',
              description: 'Kartenbild für Angebote-Übersicht',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
            tagesschule: fields.image({
              label: 'Tagesschule Karte',
              description: 'Kartenbild für Angebote-Übersicht',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
            fallback: fields.image({
              label: 'Standard Kartenbild',
              description: 'Fallback wenn kein spezifisches Bild',
              directory: 'public/images/programs',
              publicPath: '/images/programs/',
            }),
          },
          { label: 'Programm Kartenbilder' }
        ),

        // ===========================================
        // ÜBER UNS SEITE
        // ===========================================
        ueberUns: fields.object(
          {
            mission: fields.image({
              label: 'Mission Bild',
              description: 'Bild im Mission-Bereich. Aktuell: /images/about/children-playing-1.jpg',
              directory: 'public/images/about',
              publicPath: '/images/about/',
            }),
            childrenPlaying1: fields.image({
              label: 'Kinder spielen 1',
              description: 'Erstes Aktivitätsbild. Aktuell: /images/about/children-playing-1.jpg',
              directory: 'public/images/about',
              publicPath: '/images/about/',
            }),
            childrenPlaying2: fields.image({
              label: 'Kinder spielen 2',
              description: 'Zweites Aktivitätsbild. Aktuell: /images/about/children-playing-2.jpg',
              directory: 'public/images/about',
              publicPath: '/images/about/',
            }),
          },
          { label: 'Über uns Bilder' }
        ),

        // ===========================================
        // LOGOS
        // ===========================================
        logos: fields.object(
          {
            butterfly: fields.image({
              label: 'Schmetterling Logo',
              description: 'EVOLEA Schmetterling (farbig)',
              directory: 'public/images/logo',
              publicPath: '/images/logo/',
            }),
            butterflyWhite: fields.image({
              label: 'Schmetterling Logo (weiss)',
              description: 'EVOLEA Schmetterling für dunkle Hintergründe',
              directory: 'public/images/logo',
              publicPath: '/images/logo/',
            }),
            full: fields.image({
              label: 'Vollständiges Logo',
              description: 'EVOLEA Logo mit Text',
              directory: 'public/images/logo',
              publicPath: '/images/logo/',
            }),
          },
          { label: 'Logos' }
        ),
      },
    }),

    // =========================================================================
    // ANGEBOTE INDEX SINGLETON
    // =========================================================================
    angeboteIndex: singleton({
      label: 'Angebote Übersicht',
      path: 'src/content/pages/angebote-index',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            untertitel: bilingualText('Untertitel', 'Subtitle'),
          },
          { label: 'Hero-Bereich' }
        ),

        intro: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
          },
          { label: 'Einführung (Unser Ansatz)' }
        ),

        aktuelleAngebote: fields.object(
          {
            label: bilingualText('Label', 'Label', { description: 'z.B. "Aktuelle Angebote"' }),
            titel: bilingualText('Titel', 'Title', { description: 'z.B. "Jetzt anmelden"' }),
          },
          { label: 'Aktuelle Angebote Überschrift' }
        ),

        hauptProgramme: fields.array(
          fields.object({
            titel: fields.text({ label: 'Titel' }),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            icon: fields.select({
              label: 'Icon',
              options: iconOptions,
              defaultValue: 'sparkle',
            }),
            farbe: fields.select({
              label: 'Farbe',
              options: colorOptions,
              defaultValue: 'green',
            }),
            alter: bilingualText('Altersgruppe', 'Age Group', { description: 'z.B. "3-5"' }),
            link: fields.text({ label: 'Link', description: 'z.B. "/angebote/mini-garten/"' }),
            status: bilingualText('Status', 'Status', { description: 'z.B. "Anmeldung offen"' }),
          }),
          {
            label: 'Hauptprogramme (farbige Karten)',
            description: 'Programme mit offener Anmeldung',
            itemLabel: (props) => props.fields.titel.value || 'Neues Programm',
          }
        ),

        weitereAngeboteLabel: bilingualText('Weitere Angebote Label', 'More Programs Label'),

        weitereProgramme: fields.array(
          fields.object({
            titel: fields.text({ label: 'Titel' }),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            icon: fields.select({
              label: 'Icon',
              options: iconOptions,
              defaultValue: 'sparkle',
            }),
            farbe: fields.select({
              label: 'Farbe',
              options: colorOptions,
              defaultValue: 'purple',
            }),
            alter: bilingualText('Zielgruppe', 'Target Group', { description: 'z.B. "Eltern" oder "4-12"' }),
            link: fields.text({ label: 'Link' }),
            status: bilingualText('Status', 'Status'),
            istVision: fields.checkbox({
              label: 'Ist Vision/Zukunft',
              description: 'Aktivieren für Programme die noch in Planung sind',
              defaultValue: false,
            }),
          }),
          {
            label: 'Weitere Programme',
            description: 'Zusätzliche Angebote wie EVOLEA Café, Tagesschule etc.',
            itemLabel: (props) => props.fields.titel.value || 'Neues Programm',
          }
        ),

        cta: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            buttonText: bilingualText('Button Text', 'Button Text'),
          },
          { label: 'Call-to-Action (unten)' }
        ),

        labels: fields.object(
          {
            mehrErfahren: bilingualText('Mehr erfahren', 'Learn more'),
            jahre: bilingualText('Jahre', 'Years', { description: 'Text nach Alter, z.B. "Jahre"' }),
          },
          { label: 'Wiederkehrende Texte' }
        ),
      },
    }),

    // =========================================================================
    // MINI GARTEN SINGLETON
    // =========================================================================
    miniGarten: singleton({
      label: 'Mini Garten',
      path: 'src/content/pages/mini-garten',
      format: { data: 'json' },
      schema: {
        // --- HERO ---
        hero: fields.object(
          {
            badge: bilingualText('Badge', 'Badge', { description: 'z.B. "Kindergartenvorbereitung"' }),
            titel: fields.text({ label: 'Titel', defaultValue: 'Mini Garten' }),
            untertitel: bilingualText('Untertitel', 'Subtitle'),
            buttonText: bilingualText('Button Text', 'Button Text'),
            buttonLink: fields.text({ label: 'Button Link', defaultValue: '#anmeldung' }),
            zweitButtonText: bilingualText('Zweiter Button', 'Second Button'),
            zweitButtonLink: fields.text({ label: 'Zweiter Button Link' }),
            alter: fields.text({ label: 'Altersanzeige', description: 'z.B. "3-6"' }),
          },
          { label: 'Hero-Bereich' }
        ),

        // --- INFO KARTEN ---
        infoKarten: fields.array(
          fields.object({
            icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'sparkle' }),
            label: bilingualText('Label', 'Label'),
            wert: bilingualText('Wert', 'Value'),
          }),
          {
            label: 'Info-Karten (4 Stück)',
            description: 'Die 4 Karten unter dem Hero (Alter, Gruppengrösse, Wann, Wo)',
            itemLabel: (props) => props.fields.label.fields.de.value as string || 'Neue Karte',
          }
        ),

        // --- FÜR WEN ---
        fuerWen: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            highlightTitel: bilingualText('Highlight Titel', 'Highlight Title'),
            highlightText: bilingualText('Highlight Text', 'Highlight Text', { multiline: true }),
          },
          { label: 'Für wen ist Mini Garten?' }
        ),

        // --- TYPISCHER NACHMITTAG ---
        typischerTag: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            aktivitaeten: fields.array(
              fields.object({
                icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'sparkle' }),
                name: bilingualText('Name', 'Name'),
              }),
              {
                label: 'Aktivitäten',
                itemLabel: (props) => props.fields.name.fields.de.value as string || 'Neue Aktivität',
              }
            ),
          },
          { label: 'Ein typischer Nachmittag' }
        ),

        // --- LERNZIELE ---
        lernziele: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            ziele: fields.array(
              fields.object({
                titel: bilingualText('Titel', 'Title'),
                beschreibung: bilingualText('Beschreibung', 'Description'),
              }),
              {
                label: 'Lernziele Liste',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neues Ziel',
              }
            ),
          },
          { label: 'Lernziele' }
        ),

        // --- ANMELDUNG ---
        anmeldung: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            infoTitel: bilingualText('Info-Box Titel', 'Info Box Title'),
            infos: fields.array(
              fields.object({
                icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'target' }),
                label: bilingualText('Label', 'Label'),
                wert: bilingualText('Wert', 'Value'),
              }),
              {
                label: 'Praktische Infos',
                itemLabel: (props) => props.fields.label.fields.de.value as string || 'Neue Info',
              }
            ),
          },
          { label: 'Anmeldung & Ablauf' }
        ),

        // --- CTA ---
        cta: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            buttonText: bilingualText('Button Text', 'Button Text'),
          },
          { label: 'Call-to-Action (unten)' }
        ),
      },
    }),

    // =========================================================================
    // MINI PROJEKTE SINGLETON
    // =========================================================================
    miniProjekte: singleton({
      label: 'Mini Projekte',
      path: 'src/content/pages/mini-projekte',
      format: { data: 'json' },
      schema: {
        // --- HERO ---
        hero: fields.object(
          {
            badge: bilingualText('Badge', 'Badge', { description: 'z.B. "Social Skills Gruppe"' }),
            titel: fields.text({ label: 'Titel', defaultValue: 'Mini Projekte' }),
            untertitel: bilingualText('Untertitel', 'Subtitle'),
            beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
            buttonText: bilingualText('Button Text', 'Button Text'),
            buttonLink: fields.text({ label: 'Button Link', defaultValue: '#projekte' }),
            alter: fields.text({ label: 'Altersanzeige', description: 'z.B. "5-8"' }),
          },
          { label: 'Hero-Bereich' }
        ),

        // --- INFO KARTEN ---
        infoKarten: fields.array(
          fields.object({
            icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'sparkle' }),
            label: bilingualText('Label', 'Label'),
            wert: bilingualText('Wert', 'Value'),
          }),
          {
            label: 'Info-Karten (4 Stück)',
            itemLabel: (props) => props.fields.label.fields.de.value as string || 'Neue Karte',
          }
        ),

        // --- FÜR WEN ---
        fuerWen: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            voraussetzungenTitel: bilingualText('Voraussetzungen Titel', 'Prerequisites Title'),
            voraussetzungen: fields.array(
              bilingualText('Voraussetzung', 'Prerequisite'),
              {
                label: 'Voraussetzungen Liste',
                itemLabel: (props) => props.fields.de.value as string || 'Neue Voraussetzung',
              }
            ),
          },
          { label: 'Für wen ist Mini Projekte?' }
        ),

        // --- WAS MACHT BESONDERS ---
        besonderheiten: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            features: fields.array(
              fields.object({
                icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'sparkle' }),
                titel: bilingualText('Titel', 'Title'),
                text: bilingualText('Text', 'Text', { multiline: true }),
              }),
              {
                label: 'Besonderheiten',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neue Besonderheit',
              }
            ),
          },
          { label: 'Was macht Mini Projekte besonders?' }
        ),

        // --- AKTUELLE PROJEKTE ---
        projekte: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            liste: fields.array(
              fields.object({
                titel: fields.text({ label: 'Titel' }),
                beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
                zeitraum: bilingualText('Zeitraum', 'Period', { description: 'z.B. "Oktober - Dezember 2025"' }),
                status: bilingualText('Status', 'Status', { description: 'z.B. "Ausgebucht" oder "Anmeldung offen"' }),
                statusFarbe: fields.select({
                  label: 'Status Farbe',
                  options: [
                    { label: 'Magenta (ausgebucht)', value: 'magenta' },
                    { label: 'Grün (offen)', value: 'green' },
                    { label: 'Orange (bald)', value: 'orange' },
                  ],
                  defaultValue: 'green',
                }),
                link: fields.text({ label: 'Link (optional)', description: 'Falls eigene Seite vorhanden' }),
                farbe: fields.select({ label: 'Karten-Farbe', options: colorOptions, defaultValue: 'orange' }),
              }),
              {
                label: 'Projekte Liste',
                itemLabel: (props) => props.fields.titel.value || 'Neues Projekt',
              }
            ),
          },
          { label: 'Aktuelle & kommende Projekte' }
        ),

        // --- PRAKTISCHE INFOS ---
        praktischeInfos: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            infos: fields.array(
              fields.object({
                icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'target' }),
                label: bilingualText('Label', 'Label'),
                wert: bilingualText('Wert', 'Value'),
              }),
              {
                label: 'Infos Liste',
                itemLabel: (props) => props.fields.label.fields.de.value as string || 'Neue Info',
              }
            ),
          },
          { label: 'Praktische Informationen' }
        ),

        // --- CTA ---
        cta: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            buttonText: bilingualText('Button Text', 'Button Text'),
          },
          { label: 'Call-to-Action (unten)' }
        ),
      },
    }),

    // =========================================================================
    // EVOLEA CAFE SINGLETON
    // =========================================================================
    evoleaCafe: singleton({
      label: 'EVOLEA Cafe',
      path: 'src/content/pages/evolea-cafe',
      format: { data: 'json' },
      schema: {
        seo: fields.object(
          {
            title: bilingualText('SEO Titel', 'SEO Title'),
            description: bilingualText('SEO Beschreibung', 'SEO Description', { multiline: true }),
          },
          { label: 'SEO' }
        ),

        hero: fields.object(
          {
            badge: bilingualText('Badge', 'Badge'),
            titel: bilingualText('Titel', 'Title'),
            tagline: bilingualText('Tagline', 'Tagline', { multiline: true }),
          },
          { label: 'Hero' }
        ),

        about: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            abschnitte: fields.array(
              bilingualText('Absatz', 'Paragraph', { multiline: true }),
              {
                label: 'Absaetze',
                itemLabel: (props) => props.fields.de.value as string || 'Neuer Absatz',
              }
            ),
            hinweis: bilingualText('Hinweis', 'Note', { multiline: true }),
          },
          { label: 'About' }
        ),

        aboutCards: fields.array(
          fields.object({
            icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'people' }),
            text: bilingualText('Text', 'Text'),
          }),
          {
            label: 'Info-Karten',
            itemLabel: (props) => props.fields.text.fields.de.value as string || 'Neue Karte',
          }
        ),

        schedule: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            cards: fields.array(
              fields.object({
                icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'calendar' }),
                titel: bilingualText('Titel', 'Title'),
                text: bilingualText('Text', 'Text'),
                variant: fields.select({
                  label: 'Variante',
                  options: [
                    { label: 'Standard', value: 'standard' },
                    { label: 'Primary', value: 'primary' },
                    { label: 'Highlight', value: 'highlight' },
                  ],
                  defaultValue: 'standard',
                }),
              }),
              {
                label: 'Karten',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neue Karte',
              }
            ),
            datenTitel: bilingualText('Termine Titel', 'Dates Title'),
            daten: fields.array(
              fields.object({
                datum: bilingualText('Datum', 'Date'),
                uhrzeit: bilingualText('Uhrzeit', 'Time'),
              }),
              {
                label: 'Naechste Termine',
                itemLabel: (props) => props.fields.datum.fields.de.value as string || 'Neuer Termin',
              }
            ),
          },
          { label: 'Wann & Wo' }
        ),

        expect: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            items: fields.array(
              fields.object({
                typ: fields.select({
                  label: 'Typ',
                  options: [
                    { label: 'Ja', value: 'yes' },
                    { label: 'Nein', value: 'no' },
                  ],
                  defaultValue: 'yes',
                }),
                text: bilingualText('Text', 'Text'),
              }),
              {
                label: 'Erwartungen',
                itemLabel: (props) => props.fields.text.fields.de.value as string || 'Neuer Punkt',
              }
            ),
          },
          { label: 'Was Sie erwartet' }
        ),

        quote: fields.object(
          {
            text: bilingualText('Zitat', 'Quote', { multiline: true }),
            autor: bilingualText('Autor', 'Author'),
          },
          { label: 'Zitat' }
        ),

        faq: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            items: fields.array(
              fields.object({
                frage: bilingualText('Frage', 'Question'),
                antwort: bilingualText('Antwort', 'Answer', { multiline: true }),
              }),
              {
                label: 'FAQ',
                itemLabel: (props) => props.fields.frage.fields.de.value as string || 'Neue Frage',
              }
            ),
          },
          { label: 'FAQ' }
        ),

        cta: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
            buttonText: bilingualText('Button Text', 'Button Text'),
            buttonLink: bilingualText('Button Link', 'Button Link', {
              description: 'z.B. "/kontakt/" (DE) und "/contact/" (EN)',
            }),
          },
          { label: 'Call-to-Action' }
        ),
      },
    }),

    // =========================================================================
    // MINI MUSEUM SINGLETON
    // =========================================================================
    miniMuseum: singleton({
      label: 'Mini Museum',
      path: 'src/content/pages/mini-museum',
      format: { data: 'json' },
      schema: {
        // --- HERO ---
        hero: fields.object(
          {
            badge: bilingualText('Badge', 'Badge', { description: 'z.B. "Kreatives Kunstprojekt"' }),
            titel: fields.text({ label: 'Titel', defaultValue: 'Mini Museum' }),
            untertitel: bilingualText('Untertitel', 'Subtitle'),
            beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
            buttonText: bilingualText('Button Text', 'Button Text'),
            buttonLink: fields.text({ label: 'Button Link', defaultValue: '#anmeldung' }),
            zweitButtonText: bilingualText('Zweiter Button', 'Second Button'),
            zweitButtonLink: fields.text({ label: 'Zweiter Button Link' }),
            alter: fields.text({ label: 'Altersanzeige', description: 'z.B. "5-8"' }),
          },
          { label: 'Hero-Bereich' }
        ),

        // --- INFO KARTEN ---
        infoKarten: fields.array(
          fields.object({
            icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'sparkle' }),
            label: bilingualText('Label', 'Label'),
            wert: bilingualText('Wert', 'Value'),
          }),
          {
            label: 'Info-Karten (4 Stück)',
            itemLabel: (props) => props.fields.label.fields.de.value as string || 'Neue Karte',
          }
        ),

        // --- KONZEPT ---
        konzept: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            untertitel: bilingualText('Untertitel', 'Subtitle'),
            absaetze: fields.array(
              bilingualText('Absatz', 'Paragraph', { multiline: true }),
              {
                label: 'Textabsätze',
                itemLabel: (props) => (props.fields.de.value as string)?.slice(0, 40) + '...' || 'Neuer Absatz',
              }
            ),
            faehigkeiten: fields.array(
              fields.object({
                icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'handshake' }),
                titel: bilingualText('Titel', 'Title'),
                beschreibung: bilingualText('Beschreibung', 'Description'),
                farbe: fields.select({
                  label: 'Farbe',
                  options: [
                    { label: 'Mint', value: 'mint' },
                    { label: 'Coral', value: 'coral' },
                    { label: 'Purple', value: 'purple' },
                    { label: 'Orange', value: 'orange' },
                  ],
                  defaultValue: 'mint'
                }),
              }),
              {
                label: 'Fähigkeiten-Karten',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neue Fähigkeit',
              }
            ),
          },
          { label: 'Das Konzept' }
        ),

        // --- ABLAUF / SCHEDULE ---
        ablauf: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            untertitel: bilingualText('Untertitel', 'Subtitle'),
            termine: fields.array(
              fields.object({
                tag: fields.integer({ label: 'Tag Nummer', defaultValue: 1 }),
                titel: bilingualText('Titel', 'Title'),
                datum: bilingualText('Datum', 'Date'),
                zeit: fields.text({ label: 'Zeit', defaultValue: '09:00 - 12:00' }),
                fokus: bilingualText('Fokus', 'Focus'),
                standort: bilingualText('Standort', 'Location'),
                istBesonders: fields.checkbox({ label: 'Besonderer Termin (Eröffnung)', defaultValue: false }),
              }),
              {
                label: 'Termine',
                itemLabel: (props) => `Tag ${props.fields.tag.value}: ${props.fields.titel.fields.de.value}` || 'Neuer Termin',
              }
            ),
            hinweis: fields.object(
              {
                titel: bilingualText('Titel', 'Title'),
                text: bilingualText('Text', 'Text', { multiline: true }),
              },
              { label: 'Hinweis-Box' }
            ),
          },
          { label: 'Der Ablauf' }
        ),

        // --- ZIELE ---
        ziele: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            untertitel: bilingualText('Untertitel', 'Subtitle'),
            liste: fields.array(
              fields.object({
                titel: bilingualText('Titel', 'Title'),
                text: bilingualText('Text', 'Text', { multiline: true }),
              }),
              {
                label: 'Ziele Liste',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neues Ziel',
              }
            ),
          },
          { label: 'Projekt Ziele' }
        ),

        // --- AUFNAHME ---
        aufnahme: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            einleitung: bilingualText('Einleitung', 'Introduction', { multiline: true }),
            kriterien: fields.array(
              fields.object({
                titel: bilingualText('Titel', 'Title'),
                text: bilingualText('Text', 'Text'),
              }),
              {
                label: 'Kriterien Liste',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neues Kriterium',
              }
            ),
            hinweis: bilingualText('Hinweis', 'Note', { multiline: true }),
          },
          { label: 'Aufnahmekriterien' }
        ),

        // --- PRAKTISCHE INFOS ---
        praktischeInfos: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            standorte: fields.object(
              {
                hauptstandort: fields.object(
                  {
                    label: bilingualText('Label', 'Label'),
                    adresse: bilingualText('Adresse', 'Address', { multiline: true }),
                  },
                  { label: 'Hauptstandort' }
                ),
                eroeffnung: fields.object(
                  {
                    label: bilingualText('Label', 'Label'),
                    adresse: bilingualText('Adresse', 'Address', { multiline: true }),
                  },
                  { label: 'Eröffnungsstandort' }
                ),
              },
              { label: 'Standorte' }
            ),
            kontakt: fields.object(
              {
                titel: bilingualText('Titel', 'Title'),
                text: bilingualText('Text', 'Text'),
                email: fields.text({ label: 'E-Mail', defaultValue: 'hello@evolea.ch' }),
              },
              { label: 'Kontakt' }
            ),
            wichtig: bilingualText('Wichtiger Hinweis', 'Important Note', { multiline: true }),
          },
          { label: 'Praktische Informationen' }
        ),
      },
    }),

    // =========================================================================
    // MINI TURNEN SINGLETON
    // =========================================================================
    miniTurnen: singleton({
      label: 'Mini Turnen',
      path: 'src/content/pages/mini-turnen',
      format: { data: 'json' },
      schema: {
        // --- HERO ---
        hero: fields.object(
          {
            badge: bilingualText('Badge', 'Badge', { description: 'z.B. "Inklusives Sportangebot"' }),
            titel: fields.text({ label: 'Titel', defaultValue: 'Mini Turnen' }),
            untertitel: bilingualText('Untertitel', 'Subtitle'),
            beschreibung: bilingualText('Beschreibung', 'Description', { multiline: true }),
            buttonText: bilingualText('Button Text', 'Button Text'),
            buttonLink: fields.text({ label: 'Button Link', defaultValue: '#anmeldung' }),
            zweitButtonText: bilingualText('Zweiter Button', 'Second Button'),
            zweitButtonLink: fields.text({ label: 'Zweiter Button Link' }),
            alter: fields.text({ label: 'Altersanzeige', description: 'z.B. "5-8"' }),
          },
          { label: 'Hero-Bereich' }
        ),

        // --- INFO KARTEN ---
        infoKarten: fields.array(
          fields.object({
            icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'sparkle' }),
            label: bilingualText('Label', 'Label'),
            wert: bilingualText('Wert', 'Value'),
          }),
          {
            label: 'Info-Karten (4 Stück)',
            itemLabel: (props) => props.fields.label.fields.de.value as string || 'Neue Karte',
          }
        ),

        // --- FÜR WEN ---
        fuerWen: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            voraussetzungenTitel: bilingualText('Voraussetzungen Titel', 'Prerequisites Title'),
            voraussetzungen: fields.array(
              bilingualText('Voraussetzung', 'Prerequisite'),
              {
                label: 'Voraussetzungen Liste',
                itemLabel: (props) => props.fields.de.value as string || 'Neue Voraussetzung',
              }
            ),
          },
          { label: 'Für wen ist Mini Turnen?' }
        ),

        // --- WAS TRAINIEREN WIR ---
        training: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            aktivitaeten: fields.array(
              fields.object({
                icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'running' }),
                titel: bilingualText('Titel', 'Title'),
                beschreibung: bilingualText('Beschreibung', 'Description'),
              }),
              {
                label: 'Trainings-Aktivitäten',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neue Aktivität',
              }
            ),
          },
          { label: 'Was trainieren wir?' }
        ),

        // --- WARUM MINI TURNEN ---
        vorteile: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            liste: fields.array(
              fields.object({
                icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'sparkle' }),
                titel: bilingualText('Titel', 'Title'),
                text: bilingualText('Text', 'Text'),
              }),
              {
                label: 'Vorteile Liste',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neuer Vorteil',
              }
            ),
          },
          { label: 'Warum Mini Turnen?' }
        ),

        // --- PRAKTISCHE INFOS ---
        praktischeInfos: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            infos: fields.array(
              fields.object({
                icon: fields.select({ label: 'Icon', options: iconOptions, defaultValue: 'target' }),
                label: bilingualText('Label', 'Label'),
                wert: bilingualText('Wert', 'Value'),
              }),
              {
                label: 'Infos Liste',
                itemLabel: (props) => props.fields.label.fields.de.value as string || 'Neue Info',
              }
            ),
          },
          { label: 'Praktische Informationen' }
        ),

        // --- CTA ---
        cta: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            buttonText: bilingualText('Button Text', 'Button Text'),
          },
          { label: 'Call-to-Action (unten)' }
        ),
      },
    }),

    // =========================================================================
    // TAGESSCHULE SINGLETON
    // =========================================================================
    tagesschule: singleton({
      label: 'Tagesschule',
      path: 'src/content/pages/tagesschule',
      format: { data: 'json' },
      schema: {
        // --- HERO ---
        hero: fields.object(
          {
            badge: bilingualText('Badge', 'Badge'),
            titel: fields.text({ label: 'Titel', defaultValue: 'Tagesschule' }),
            untertitel: bilingualText('Untertitel', 'Subtitle', { multiline: true }),
            buttonText: bilingualText('Button Text', 'Button Text'),
            buttonLink: fields.text({ label: 'Button Link', defaultValue: '#interesse' }),
            zweitButtonText: bilingualText('Zweiter Button', 'Second Button'),
            zweitButtonLink: fields.text({ label: 'Zweiter Button Link' }),
            alter: fields.text({ label: 'Altersanzeige', description: 'z.B. "6-12"' }),
          },
          { label: 'Hero-Bereich' }
        ),

        // --- STATUS BANNER ---
        statusBanner: fields.object(
          {
            aktiv: fields.checkbox({ label: 'Banner anzeigen', defaultValue: true }),
            text: bilingualText('Banner Text', 'Banner Text'),
          },
          { label: 'Status-Banner (lila Leiste)' }
        ),

        // --- INFO KARTEN ---
        infoKarten: fields.array(
          fields.object({
            label: bilingualText('Label', 'Label'),
            wert: bilingualText('Wert', 'Value'),
          }),
          {
            label: 'Info-Karten (4 Stück)',
            itemLabel: (props) => props.fields.label.fields.de.value as string || 'Neue Karte',
          }
        ),

        // --- WAS IST TAGESSCHULE ---
        wasIst: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            konzeptTitel: bilingualText('Konzept Titel', 'Concept Title'),
            konzeptText: bilingualText('Konzept Text', 'Concept Text', { multiline: true }),
          },
          { label: 'Was ist die EVOLEA Tagesschule?' }
        ),

        // --- FÜR WEN ---
        fuerWen: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            kriterien: fields.array(
              bilingualText('Kriterium', 'Criterion'),
              {
                label: 'Zielgruppen-Kriterien',
                itemLabel: (props) => props.fields.de.value as string || 'Neues Kriterium',
              }
            ),
          },
          { label: 'Für wen ist die Tagesschule?' }
        ),

        // --- UNSER ANSATZ ---
        ansatz: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            features: fields.array(
              fields.object({
                titel: bilingualText('Titel', 'Title'),
                text: bilingualText('Text', 'Text'),
              }),
              {
                label: 'Ansatz-Features',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neues Feature',
              }
            ),
          },
          { label: 'Unser Ansatz' }
        ),

        // --- TYPISCHER TAG ---
        typischerTag: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            ablauf: fields.array(
              fields.object({
                zeit: fields.text({ label: 'Zeit', description: 'z.B. "08:30"' }),
                aktivitaet: bilingualText('Aktivität', 'Activity'),
              }),
              {
                label: 'Tagesablauf',
                itemLabel: (props) => `${props.fields.zeit.value} - ${props.fields.aktivitaet.fields.de.value}` || 'Neuer Eintrag',
              }
            ),
          },
          { label: 'Ein typischer Tag' }
        ),

        // --- INTERESSE ANMELDEN ---
        interesse: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            schritteTitel: bilingualText('Schritte Titel', 'Steps Title'),
            schritte: fields.array(
              fields.object({
                titel: bilingualText('Titel', 'Title'),
                text: bilingualText('Text', 'Text'),
              }),
              {
                label: 'Nächste Schritte',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neuer Schritt',
              }
            ),
            kontaktTitel: bilingualText('Kontakt Titel', 'Contact Title'),
            kontaktText: bilingualText('Kontakt Text', 'Contact Text', { multiline: true }),
          },
          { label: 'Interesse anmelden' }
        ),

        // --- WEITERE ANGEBOTE ---
        weitereAngebote: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            angebote: fields.array(
              fields.object({
                titel: fields.text({ label: 'Titel' }),
                beschreibung: bilingualText('Beschreibung', 'Description'),
                link: fields.text({ label: 'Link' }),
                farbe: fields.select({ label: 'Farbe', options: colorOptions, defaultValue: 'green' }),
              }),
              {
                label: 'Verlinkte Angebote',
                itemLabel: (props) => props.fields.titel.value || 'Neues Angebot',
              }
            ),
          },
          { label: 'Weitere Angebote (unten)' }
        ),

        // --- CTA ---
        cta: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            buttonText: bilingualText('Button Text', 'Button Text'),
          },
          { label: 'Call-to-Action (unten)' }
        ),
      },
    }),

    // =========================================================================
    // SPENDEN (DONATION) SINGLETON
    // =========================================================================
    spenden: singleton({
      label: 'Spenden / Donate',
      path: 'src/content/pages/spenden',
      format: { data: 'json' },
      schema: {
        // --- HERO ---
        hero: fields.object(
          {
            label: bilingualText('Label', 'Label'),
            titel: bilingualText('Titel', 'Title'),
            untertitel: bilingualText('Untertitel', 'Subtitle', { multiline: true }),
          },
          { label: 'Hero-Bereich' }
        ),

        // --- SUCCESS STORY ---
        successStory: fields.object(
          {
            label: bilingualText('Label', 'Label'),
            titel: bilingualText('Titel', 'Title'),
            text1: bilingualText('Absatz 1', 'Paragraph 1', { multiline: true }),
            text2: bilingualText('Absatz 2', 'Paragraph 2', { multiline: true }),
            instagramReelUrl: fields.text({
              label: 'Instagram Reel URL',
              description: 'z.B. https://www.instagram.com/reel/ABC123/embed/',
            }),
            impactItems: fields.array(
              fields.object({
                icon: fields.select({
                  label: 'Icon',
                  options: [
                    { label: 'Menschen', value: 'people' },
                    { label: 'Kalender', value: 'calendar' },
                    { label: 'Sparkle', value: 'sparkle' },
                    { label: 'Herz', value: 'heart' },
                    { label: 'Check', value: 'check' },
                  ],
                  defaultValue: 'people',
                }),
                text: bilingualText('Text', 'Text'),
              }),
              {
                label: 'Impact-Punkte',
                itemLabel: (props) => props.fields.text.fields.de.value as string || 'Neuer Punkt',
              }
            ),
          },
          { label: 'Erfolgsgeschichte' }
        ),

        // --- WHY DONATE ---
        whyDonate: fields.object(
          {
            label: bilingualText('Label', 'Label'),
            titel: bilingualText('Titel', 'Title'),
            karten: fields.array(
              fields.object({
                titel: bilingualText('Titel', 'Title'),
                text: bilingualText('Text', 'Text', { multiline: true }),
                farbe: fields.select({
                  label: 'Farbe',
                  options: [
                    { label: 'Lila', value: 'purple' },
                    { label: 'Mint', value: 'mint' },
                    { label: 'Coral', value: 'coral' },
                  ],
                  defaultValue: 'purple',
                }),
              }),
              {
                label: 'Warum-Karten',
                itemLabel: (props) => props.fields.titel.fields.de.value as string || 'Neue Karte',
              }
            ),
          },
          { label: 'Warum Ihre Hilfe zählt' }
        ),

        // --- UPCOMING PROJECTS ---
        upcomingProjects: fields.object(
          {
            label: bilingualText('Label', 'Label'),
            titel: bilingualText('Titel', 'Title'),
            intro: bilingualText('Intro', 'Intro', { multiline: true }),
          },
          { label: 'Was kommt als Nächstes' }
        ),

        // --- HOW TO DONATE ---
        howToDonate: fields.object(
          {
            label: bilingualText('Label', 'Label'),
            titel: bilingualText('Titel', 'Title'),
            intro: bilingualText('Intro', 'Intro', { multiline: true }),
            bankSectionTitle: bilingualText('Bankverbindung Titel', 'Bank Details Title'),
            kontoinhaber: bilingualText('Kontoinhaber Label', 'Account Holder Label'),
            ibanLabel: bilingualText('IBAN Label', 'IBAN Label'),
            bankLabel: bilingualText('Bank Label', 'Bank Label'),
            bicLabel: bilingualText('BIC Label', 'BIC Label'),
            verwendungszweckLabel: bilingualText('Verwendungszweck Label', 'Reference Label'),
            verwendungszweck: bilingualText('Verwendungszweck', 'Payment Reference'),
            gutZuWissenTitel: bilingualText('Gut zu wissen Titel', 'Good to Know Title'),
            taxInfo: fields.array(
              fields.object({
                label: bilingualText('Label', 'Label'),
                text: bilingualText('Text', 'Text'),
              }),
              {
                label: 'Steuer-Infos',
                itemLabel: (props) => props.fields.label.fields.de.value as string || 'Neuer Punkt',
              }
            ),
          },
          { label: 'So können Sie helfen' }
        ),

        // --- DONATION AMOUNTS ---
        donationAmounts: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            buttonText: bilingualText('Button Text', 'Button Text'),
            betraege: fields.array(
              fields.object({
                betrag: fields.text({ label: 'Betrag', description: 'z.B. "CHF 50"' }),
                beschreibung: bilingualText('Beschreibung', 'Description'),
                highlighted: fields.checkbox({ label: 'Hervorgehoben (gold)', defaultValue: false }),
              }),
              {
                label: 'Spenden-Beträge',
                itemLabel: (props) => props.fields.betrag.value || 'Neuer Betrag',
              }
            ),
          },
          { label: 'Was Ihre Spende bewirkt' }
        ),

        // --- CONTACT PERSON ---
        contactPerson: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            name: fields.text({ label: 'Name', defaultValue: 'Gianna Spiess' }),
            rolle: bilingualText('Rolle', 'Role'),
            text: bilingualText('Text', 'Text', { multiline: true }),
            email: fields.text({ label: 'E-Mail', defaultValue: 'hello@evolea.ch' }),
            foto: fields.text({
              label: 'Foto Pfad',
              description: 'z.B. /images/team/gianna-spiess.png',
              defaultValue: '/images/team/gianna-spiess.png',
            }),
          },
          { label: 'Kontaktperson' }
        ),

        // --- CTA ---
        cta: fields.object(
          {
            titel: bilingualText('Titel', 'Title'),
            beschreibung: bilingualText('Beschreibung', 'Description'),
            buttonText: bilingualText('Button Text', 'Button Text'),
          },
          { label: 'Page Closer CTA' }
        ),
      },
    }),
  },
});
