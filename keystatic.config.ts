import { config, fields, collection, singleton } from '@keystatic/core';

// Detect if we're in local mode or GitHub mode
const isLocal = process.env.NODE_ENV === 'development' && !process.env.KEYSTATIC_GITHUB_CLIENT_ID;

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
      'Inhalte': ['blog', 'pages'],
      'Einstellungen': ['siteSettings', 'translations'],
    },
  },

  collections: {
    // Blog Posts Collection
    blog: collection({
      label: 'Blog Artikel',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({
          name: {
            label: 'Titel',
            description: 'Der Titel des Blog-Artikels',
          },
        }),
        description: fields.text({
          label: 'Beschreibung',
          description: 'Kurze Beschreibung für Vorschau und SEO',
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
          label: 'Bild',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value || 'Neuer Tag',
          }
        ),
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
            table: false,
            link: true,
            image: true,
            divider: true,
          },
        }),
      },
    }),

    // Pages Collection for editable page content
    pages: collection({
      label: 'Seiteninhalte',
      slugField: 'pageId',
      path: 'src/content/pages/*',
      format: { data: 'json' },
      schema: {
        pageId: fields.slug({
          name: {
            label: 'Seiten-ID',
            description: 'Eindeutige ID für diese Seite (z.B. homepage, about, contact)',
          },
        }),
        // German content
        de: fields.object({
          title: fields.text({ label: 'Titel (DE)' }),
          subtitle: fields.text({ label: 'Untertitel (DE)', multiline: true }),
          description: fields.text({ label: 'Beschreibung (DE)', multiline: true }),
          heroTitle: fields.text({ label: 'Hero Titel (DE)' }),
          heroSubtitle: fields.text({ label: 'Hero Untertitel (DE)', multiline: true }),
          ctaText: fields.text({ label: 'CTA Button Text (DE)' }),
          sections: fields.array(
            fields.object({
              heading: fields.text({ label: 'Überschrift' }),
              content: fields.text({ label: 'Inhalt', multiline: true }),
            }),
            {
              label: 'Zusätzliche Abschnitte (DE)',
              itemLabel: (props) => props.fields.heading.value || 'Neuer Abschnitt',
            }
          ),
        }, { label: 'Deutsch' }),
        // English content
        en: fields.object({
          title: fields.text({ label: 'Title (EN)' }),
          subtitle: fields.text({ label: 'Subtitle (EN)', multiline: true }),
          description: fields.text({ label: 'Description (EN)', multiline: true }),
          heroTitle: fields.text({ label: 'Hero Title (EN)' }),
          heroSubtitle: fields.text({ label: 'Hero Subtitle (EN)', multiline: true }),
          ctaText: fields.text({ label: 'CTA Button Text (EN)' }),
          sections: fields.array(
            fields.object({
              heading: fields.text({ label: 'Heading' }),
              content: fields.text({ label: 'Content', multiline: true }),
            }),
            {
              label: 'Additional Sections (EN)',
              itemLabel: (props) => props.fields.heading.value || 'New Section',
            }
          ),
        }, { label: 'English' }),
      },
    }),
  },

  singletons: {
    // Site-wide settings
    siteSettings: singleton({
      label: 'Website Einstellungen',
      path: 'src/content/settings/site',
      format: { data: 'json' },
      schema: {
        siteName: fields.text({
          label: 'Website Name',
          defaultValue: 'EVOLEA',
        }),
        siteDescription: fields.object({
          de: fields.text({ label: 'Beschreibung (DE)', multiline: true }),
          en: fields.text({ label: 'Description (EN)', multiline: true }),
        }, { label: 'Website Beschreibung' }),
        contactEmail: fields.text({
          label: 'Kontakt E-Mail',
          defaultValue: 'hello@evolea.ch',
        }),
        socialLinks: fields.object({
          instagram: fields.url({ label: 'Instagram URL' }),
          linkedin: fields.url({ label: 'LinkedIn URL' }),
          facebook: fields.url({ label: 'Facebook URL' }),
        }, { label: 'Social Media Links' }),
        address: fields.object({
          street: fields.text({ label: 'Strasse' }),
          city: fields.text({ label: 'Stadt' }),
          zip: fields.text({ label: 'PLZ' }),
          country: fields.text({ label: 'Land', defaultValue: 'Schweiz' }),
        }, { label: 'Adresse' }),
      },
    }),

    // UI Translations singleton
    translations: singleton({
      label: 'UI Übersetzungen',
      path: 'src/content/settings/translations',
      format: { data: 'json' },
      schema: {
        navigation: fields.object({
          de: fields.object({
            home: fields.text({ label: 'Startseite', defaultValue: 'Startseite' }),
            programs: fields.text({ label: 'Angebote', defaultValue: 'Angebote' }),
            about: fields.text({ label: 'Über uns', defaultValue: 'Über uns' }),
            team: fields.text({ label: 'Team', defaultValue: 'Team' }),
            blog: fields.text({ label: 'Blog', defaultValue: 'Blog' }),
            contact: fields.text({ label: 'Kontakt', defaultValue: 'Kontakt' }),
          }, { label: 'Navigation (DE)' }),
          en: fields.object({
            home: fields.text({ label: 'Home', defaultValue: 'Home' }),
            programs: fields.text({ label: 'Programs', defaultValue: 'Programs' }),
            about: fields.text({ label: 'About Us', defaultValue: 'About Us' }),
            team: fields.text({ label: 'Team', defaultValue: 'Team' }),
            blog: fields.text({ label: 'Blog', defaultValue: 'Blog' }),
            contact: fields.text({ label: 'Contact', defaultValue: 'Contact' }),
          }, { label: 'Navigation (EN)' }),
        }, { label: 'Navigation' }),
        hero: fields.object({
          de: fields.object({
            title: fields.text({ label: 'Titel' }),
            subtitle: fields.text({ label: 'Untertitel', multiline: true }),
            ctaPrimary: fields.text({ label: 'Primärer CTA' }),
            ctaSecondary: fields.text({ label: 'Sekundärer CTA' }),
          }, { label: 'Hero (DE)' }),
          en: fields.object({
            title: fields.text({ label: 'Title' }),
            subtitle: fields.text({ label: 'Subtitle', multiline: true }),
            ctaPrimary: fields.text({ label: 'Primary CTA' }),
            ctaSecondary: fields.text({ label: 'Secondary CTA' }),
          }, { label: 'Hero (EN)' }),
        }, { label: 'Hero Section' }),
        footer: fields.object({
          de: fields.object({
            tagline: fields.text({ label: 'Tagline', multiline: true }),
            privacy: fields.text({ label: 'Datenschutz' }),
            imprint: fields.text({ label: 'Impressum' }),
            copyright: fields.text({ label: 'Copyright' }),
          }, { label: 'Footer (DE)' }),
          en: fields.object({
            tagline: fields.text({ label: 'Tagline', multiline: true }),
            privacy: fields.text({ label: 'Privacy' }),
            imprint: fields.text({ label: 'Imprint' }),
            copyright: fields.text({ label: 'Copyright' }),
          }, { label: 'Footer (EN)' }),
        }, { label: 'Footer' }),
        common: fields.object({
          de: fields.object({
            learnMore: fields.text({ label: 'Mehr erfahren' }),
            contact: fields.text({ label: 'Kontakt aufnehmen' }),
            readMore: fields.text({ label: 'Weiterlesen' }),
            backHome: fields.text({ label: 'Zurück zur Startseite' }),
          }, { label: 'Allgemein (DE)' }),
          en: fields.object({
            learnMore: fields.text({ label: 'Learn more' }),
            contact: fields.text({ label: 'Get in touch' }),
            readMore: fields.text({ label: 'Read more' }),
            backHome: fields.text({ label: 'Back to home' }),
          }, { label: 'Common (EN)' }),
        }, { label: 'Allgemeine Texte' }),
      },
    }),
  },
});
