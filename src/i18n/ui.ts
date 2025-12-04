export const languages = {
  de: 'Deutsch',
  en: 'English',
} as const;

export const defaultLang = 'de' as const;
export const showDefaultLang = false;

export type Lang = keyof typeof languages;

export const ui = {
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.programs': 'Angebote',
    'nav.about': 'Über uns',
    'nav.team': 'Team',
    'nav.blog': 'Blog',
    'nav.contact': 'Kontakt',

    // Programs
    'programs.miniGarten': 'Mini Garten',
    'programs.miniGarten.desc': 'Gruppensetting zur Vorbereitung für den Kindergarten',
    'programs.miniProjekte': 'Mini Projekte',
    'programs.miniProjekte.desc': 'Social Skills Gruppe für Kinder im Spektrum',
    'programs.miniTurnen': 'Mini Turnen',
    'programs.miniTurnen.desc': 'Turngruppe für Kinder im Spektrum oder mit ADHS',
    'programs.schulberatung': 'B+U für Schulen',
    'programs.schulberatung.desc': 'Beratung und Unterstützung für Lehrpersonen',

    // Common
    'common.learnMore': 'Mehr erfahren',
    'common.contact': 'Kontakt aufnehmen',
    'common.readMore': 'Weiterlesen',
    'common.backHome': 'Zurück zur Startseite',

    // Hero
    'hero.title': 'Unsere Bildungsangebote schaffen Räume, damit sich Kinder im Spektrum entfalten können.',
    'hero.subtitle': 'EVOLEA bietet Förderangebote für Kinder im Autismus Spektrum oder mit ADHS an.',

    // About
    'about.title': 'Was wir tun',
    'about.description': 'EVOLEA schafft Räume, damit sich Kinder im Spektrum und mit ADHS entfalten. Unsere Angebote ergänzen die Regelschule. Evidenzbasiert und individuell.',

    // Team
    'team.title': 'Wir sind EVOLEA',
    'team.description': 'Unser Team ist interdisziplinär und erfahren. Wir handeln empathisch, offen und inklusiv.',

    // Footer
    'footer.tagline': 'EVOLEA schafft Räume, damit sich Kinder im Spektrum entfalten und ihren Weg glücklich und selbstbestimmt gehen können.',
    'footer.privacy': 'Datenschutz',
    'footer.imprint': 'Impressum',
    'footer.copyright': '© 2025 EVOLEA Verein',

    // Contact
    'contact.title': 'Interesse?',
    'contact.cta': 'Wir freuen uns!',
    'contact.email': 'hello@evolea.ch',

    // 404
    '404.title': 'Seite nicht gefunden',
    '404.description': 'Die gesuchte Seite existiert leider nicht.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.programs': 'Programs',
    'nav.about': 'About Us',
    'nav.team': 'Team',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',

    // Programs
    'programs.miniGarten': 'Mini Garden',
    'programs.miniGarten.desc': 'Group setting to prepare for kindergarten',
    'programs.miniProjekte': 'Mini Projects',
    'programs.miniProjekte.desc': 'Social skills group for children on the spectrum',
    'programs.miniTurnen': 'Mini Sports',
    'programs.miniTurnen.desc': 'Sports group for children on the spectrum or with ADHD',
    'programs.schulberatung': 'School Consultation',
    'programs.schulberatung.desc': 'Consultation and support for teachers',

    // Common
    'common.learnMore': 'Learn more',
    'common.contact': 'Get in touch',
    'common.readMore': 'Read more',
    'common.backHome': 'Back to home',

    // Hero
    'hero.title': 'Our educational programs create spaces for children on the spectrum to flourish.',
    'hero.subtitle': 'EVOLEA offers support programs for children on the autism spectrum or with ADHD.',

    // About
    'about.title': 'What we do',
    'about.description': 'EVOLEA creates spaces for children on the spectrum and with ADHD to flourish. Our programs complement regular schooling. Evidence-based and individualized.',

    // Team
    'team.title': 'We are EVOLEA',
    'team.description': 'Our team is interdisciplinary and experienced. We act with empathy, openness, and inclusivity.',

    // Footer
    'footer.tagline': 'EVOLEA creates spaces for children on the spectrum to flourish and go their own way happily and self-determined.',
    'footer.privacy': 'Privacy Policy',
    'footer.imprint': 'Legal Notice',
    'footer.copyright': '© 2025 EVOLEA Verein',

    // Contact
    'contact.title': 'Interested?',
    'contact.cta': 'We look forward to hearing from you!',
    'contact.email': 'hello@evolea.ch',

    // 404
    '404.title': 'Page not found',
    '404.description': 'The page you are looking for does not exist.',
  },
} as const;
