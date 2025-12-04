import { ui, defaultLang, showDefaultLang, type Lang } from './ui';

/**
 * Get the language from the current URL
 */
export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
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
 */
export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string, l: Lang = lang): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return !showDefaultLang && l === defaultLang
      ? normalizedPath
      : `/${l}${normalizedPath}`;
  };
}

/**
 * Get the alternate language
 */
export function getAlternateLang(lang: Lang): Lang {
  return lang === 'de' ? 'en' : 'de';
}

/**
 * Get the path in the alternate language
 */
export function getAlternatePath(url: URL): string {
  const lang = getLangFromUrl(url);
  const alternateLang = getAlternateLang(lang);
  const translatePath = useTranslatedPath(alternateLang);

  // Remove current language prefix if present
  let path = url.pathname;
  if (lang !== defaultLang) {
    path = path.replace(`/${lang}`, '') || '/';
  }

  return translatePath(path, alternateLang);
}

/**
 * Get all language alternatives for the current path (for hreflang tags)
 */
export function getLanguageAlternates(url: URL): Array<{ lang: Lang; href: string }> {
  const currentLang = getLangFromUrl(url);

  // Get the base path without language prefix
  let basePath = url.pathname;
  if (currentLang !== defaultLang) {
    basePath = basePath.replace(`/${currentLang}`, '') || '/';
  }

  return [
    { lang: 'de', href: basePath },
    { lang: 'en', href: `/en${basePath === '/' ? '' : basePath}` },
  ];
}
