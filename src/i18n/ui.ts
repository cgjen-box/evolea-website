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

    // Hero
    'hero.title': 'Wo Kinder im Spektrum aufblühen',
    'hero.subtitle': 'EVOLEA schafft Räume für Kinder mit Autismus oder ADHS, in denen sie wachsen, lernen und ihre einzigartigen Stärken entdecken können.',
    'hero.cta.primary': 'Angebote entdecken',
    'hero.cta.secondary': 'Kontakt aufnehmen',

    // Programs
    'programs.title': 'Unsere Angebote',
    'programs.subtitle': 'Evidenzbasierte Programme, die jedes Kind dort abholen, wo es steht.',
    'programs.miniGarten': 'Mini Garten',
    'programs.miniGarten.desc': 'Spielerische Vorbereitung auf den Kindergarten in einer kleinen, geschützten Gruppe.',
    'programs.miniProjekte': 'Mini Projekte',
    'programs.miniProjekte.desc': 'Soziale Kompetenz durch kreative Projekte und gemeinsames Entdecken.',
    'programs.miniTurnen': 'Mini Turnen',
    'programs.miniTurnen.desc': 'Bewegung, Spass und motorische Förderung für Kinder im Spektrum.',
    'programs.schulberatung': 'Schulberatung',
    'programs.schulberatung.desc': 'Beratung und Unterstützung für Schulen und Lehrpersonen.',

    // About / Mission
    'about.title': 'Was wir tun',
    'about.subtitle': 'Jedes Kind hat eine Superkraft',
    'about.description': 'EVOLEA schafft Räume, in denen Kinder im Spektrum ihre einzigartigen Stärken entdecken. Unsere evidenzbasierten Programme ergänzen die Regelschule und fördern jedes Kind individuell.',
    'about.cta': 'Mehr über uns',

    // Values
    'values.title': 'Unsere Werte',
    'values.safety.title': 'Sicherheit',
    'values.safety.desc': 'Wir schaffen geschützte Räume, in denen Kinder sich sicher fühlen und entfalten können.',
    'values.empower.title': 'Stärkung',
    'values.empower.desc': 'Wir unterstützen Familien dabei, informierte Entscheidungen zu treffen.',
    'values.potential.title': 'Potenzial',
    'values.potential.desc': 'Wir fokussieren auf Stärken und Möglichkeiten, nicht auf Defizite.',

    // Team
    'team.title': 'Wir sind EVOLEA',
    'team.subtitle': 'Ein Team aus erfahrenen Fachpersonen mit Herz und Expertise.',
    'team.description': 'Unser interdisziplinäres Team vereint Erfahrung aus Pädagogik, Psychologie und Therapie.',
    'team.cta': 'Team kennenlernen',

    // Contact
    'contact.title': 'Bereit für den nächsten Schritt?',
    'contact.subtitle': 'Wir freuen uns darauf, Sie und Ihr Kind kennenzulernen.',
    'contact.cta': 'Jetzt Kontakt aufnehmen',
    'contact.email': 'hello@evolea.ch',

    // Footer
    'footer.tagline': 'EVOLEA schafft Räume, damit sich Kinder im Spektrum entfalten und ihren Weg glücklich und selbstbestimmt gehen können.',
    'footer.privacy': 'Datenschutz',
    'footer.imprint': 'Impressum',
    'footer.copyright': '© 2025 EVOLEA Verein. Alle Rechte vorbehalten.',
    'footer.location': 'Zürich, Schweiz',

    // Common
    'common.learnMore': 'Mehr erfahren',
    'common.contact': 'Kontakt aufnehmen',
    'common.readMore': 'Weiterlesen',
    'common.backHome': 'Zurück zur Startseite',
    'common.explore': 'Entdecken',

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

    // Hero
    'hero.title': 'Where Children on the Spectrum Flourish',
    'hero.subtitle': 'EVOLEA creates spaces for children with autism or ADHD where they can grow, learn, and discover their unique strengths.',
    'hero.cta.primary': 'Explore Programs',
    'hero.cta.secondary': 'Get in Touch',

    // Programs
    'programs.title': 'Our Programs',
    'programs.subtitle': 'Evidence-based programs that meet every child where they are.',
    'programs.miniGarten': 'Mini Garden',
    'programs.miniGarten.desc': 'Playful kindergarten preparation in a small, safe group setting.',
    'programs.miniProjekte': 'Mini Projects',
    'programs.miniProjekte.desc': 'Social skills through creative projects and shared discovery.',
    'programs.miniTurnen': 'Mini Sports',
    'programs.miniTurnen.desc': 'Movement, fun, and motor skills development for children on the spectrum.',
    'programs.schulberatung': 'School Consultation',
    'programs.schulberatung.desc': 'Support and consultation for schools and teachers.',

    // About / Mission
    'about.title': 'What We Do',
    'about.subtitle': 'Every Child Has a Superpower',
    'about.description': 'EVOLEA creates spaces where children on the spectrum discover their unique strengths. Our evidence-based programs complement regular schooling and support each child individually.',
    'about.cta': 'Learn More',

    // Values
    'values.title': 'Our Values',
    'values.safety.title': 'Safety',
    'values.safety.desc': 'We create protected spaces where children feel safe and can flourish.',
    'values.empower.title': 'Empowerment',
    'values.empower.desc': 'We support families in making informed decisions.',
    'values.potential.title': 'Potential',
    'values.potential.desc': 'We focus on strengths and possibilities, not deficits.',

    // Team
    'team.title': 'We Are EVOLEA',
    'team.subtitle': 'A team of experienced professionals with heart and expertise.',
    'team.description': 'Our interdisciplinary team combines experience from education, psychology, and therapy.',
    'team.cta': 'Meet the Team',

    // Contact
    'contact.title': 'Ready for the Next Step?',
    'contact.subtitle': 'We look forward to getting to know you and your child.',
    'contact.cta': 'Get in Touch',
    'contact.email': 'hello@evolea.ch',

    // Footer
    'footer.tagline': 'EVOLEA creates spaces for children on the spectrum to flourish and go their own way happily and self-determined.',
    'footer.privacy': 'Privacy Policy',
    'footer.imprint': 'Legal Notice',
    'footer.copyright': '© 2025 EVOLEA Verein. All rights reserved.',
    'footer.location': 'Zürich, Switzerland',

    // Common
    'common.learnMore': 'Learn more',
    'common.contact': 'Get in touch',
    'common.readMore': 'Read more',
    'common.backHome': 'Back to home',
    'common.explore': 'Explore',

    // 404
    '404.title': 'Page not found',
    '404.description': 'The page you are looking for does not exist.',
  },
} as const;
