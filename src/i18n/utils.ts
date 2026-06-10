import { ui, defaultLang, showDefaultLang, type Lang } from './ui';

/**
 * Get the base URL without trailing slash
 */
function getBase(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '');
}

/**
 * Get the language from the current URL
 */
export function getLangFromUrl(url: URL): Lang {
  const base = getBase();
  // Remove base path from pathname before checking language
  const pathWithoutBase = url.pathname.replace(base, '') || '/';
  const [, lang] = pathWithoutBase.split('/');
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

/**
 * Get translation function for the given language
 */
export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

/**
 * Get a translated path for the given language
 * Includes the base path for deployment to subdirectories (e.g., GitHub Pages)
 */
export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string, l: Lang = lang): string {
    const base = getBase();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    // Routes with different slugs per language (e.g. /spenden/ -> /en/donate/)
    // must resolve to the real translated page, not the fallback redirect stub
    if (l !== defaultLang) {
      const mapped = routeMappings[defaultLang]?.[normalizedPath];
      if (mapped) return `${base}${mapped}`;
    }
    const langPath = !showDefaultLang && l === defaultLang
      ? normalizedPath
      : `/${l}${normalizedPath}`;
    return `${base}${langPath}`;
  };
}

/**
 * Get the alternate language
 */
export function getAlternateLang(lang: Lang): Lang {
  return lang === 'de' ? 'en' : 'de';
}

/**
 * Special route mappings for pages with different paths in different languages
 */
const routeMappings: Record<string, Record<string, string>> = {
  de: {
    '/spenden/': '/en/donate/',
    '/ueber-uns/': '/en/about/',
    '/kontakt/': '/en/contact/',
    '/impressum/': '/en/legal/',
    '/datenschutz/': '/en/privacy/',
    '/angebote/': '/en/programs/',
    '/angebote/mini-garten/': '/en/programs/mini-garden/',
    '/angebote/mini-projekte/': '/en/programs/mini-projects/',
    '/angebote/mini-projekte/mini-restaurant/': '/en/programs/mini-projects/mini-restaurant/',
    '/angebote/mini-turnen/': '/en/programs/mini-sports/',
    '/angebote/mini-abenteuercamp/': '/en/programs/mini-adventure-camp/',
    '/angebote/mini-museum/': '/en/programs/mini-museum/',
    '/angebote/evolea-cafe/': '/en/programs/evolea-cafe/',
    '/angebote/tagesschule/': '/en/programs/day-school/',
  },
  en: {
    '/donate/': '/spenden/',
    '/about/': '/ueber-uns/',
    '/contact/': '/kontakt/',
    '/legal/': '/impressum/',
    '/privacy/': '/datenschutz/',
    '/programs/': '/angebote/',
    '/programs/mini-garden/': '/angebote/mini-garten/',
    '/programs/mini-projects/': '/angebote/mini-projekte/',
    '/programs/mini-projects/mini-restaurant/': '/angebote/mini-projekte/mini-restaurant/',
    '/programs/mini-sports/': '/angebote/mini-turnen/',
    '/programs/mini-adventure-camp/': '/angebote/mini-abenteuercamp/',
    '/programs/mini-museum/': '/angebote/mini-museum/',
    '/programs/evolea-cafe/': '/angebote/evolea-cafe/',
    '/programs/day-school/': '/angebote/tagesschule/',
  },
};

/**
 * Get the path in the alternate language
 */
export function getAlternatePath(url: URL): string {
  const lang = getLangFromUrl(url);
  const alternateLang = getAlternateLang(lang);
  const translatePath = useTranslatedPath(alternateLang);
  const base = getBase();

  // Remove base path and current language prefix if present
  let path = url.pathname.replace(base, '') || '/';
  if (lang !== defaultLang) {
    path = path.replace(`/${lang}`, '') || '/';
  }

  // Check for special route mappings
  const langMappings = routeMappings[lang];
  if (langMappings) {
    for (const [sourcePath, targetPath] of Object.entries(langMappings)) {
      if (path === sourcePath || path === sourcePath.replace(/\/$/, '')) {
        return `${base}${targetPath}`;
      }
    }
  }

  return translatePath(path, alternateLang);
}

/**
 * Get all language alternatives for the current path (for hreflang tags)
 */
export function getLanguageAlternates(url: URL): Array<{ lang: Lang; href: string }> {
  const currentLang = getLangFromUrl(url);
  const base = getBase();

  // Get the base path without language prefix
  let basePath = url.pathname.replace(base, '') || '/';
  if (currentLang !== defaultLang) {
    basePath = basePath.replace(`/${currentLang}`, '') || '/';
  }

  // Check for special route mappings
  const langMappings = routeMappings[currentLang];
  if (langMappings) {
    for (const [sourcePath, targetPath] of Object.entries(langMappings)) {
      if (basePath === sourcePath || basePath === sourcePath.replace(/\/$/, '')) {
        // Return the special mapped paths
        if (currentLang === 'de') {
          return [
            { lang: 'de', href: `${base}${sourcePath}` },
            { lang: 'en', href: `${base}${targetPath}` },
          ];
        } else {
          return [
            { lang: 'de', href: `${base}${targetPath}` },
            { lang: 'en', href: `${base}/en${sourcePath}` },
          ];
        }
      }
    }
  }

  return [
    { lang: 'de', href: `${base}${basePath}` },
    { lang: 'en', href: `${base}/en${basePath === '/' ? '' : basePath}` },
  ];
}
