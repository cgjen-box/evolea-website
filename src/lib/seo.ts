/* ============================================================
   EVOLEA SEO constants & schema builders — SINGLE SOURCE OF TRUTH
   ------------------------------------------------------------
   This module is the shared source for SEO/discovery primitives.
   Today's consumers:
     1. src/middleware.ts        — host-keyed X-Robots-Tag (de-indexes
        non-production SSR responses) keyed off PROD_HOST.
     2. src/pages/robots.txt.ts  — default-deny robots endpoint that only
        the exact production host (PROD_HOST) is allowed to crawl.
     3. src/layouts/Base.astro   — emits the site-wide NGO + WebSite @graph
        (siteGraph) on every page so per-page schemas can reference ORG_ID.
     4. src/components/InnerPageHero.astro — breadcrumbSchema for visible
        breadcrumbs (plan 02-04).
     5. src/components/programs/*.astro + CafePage.astro — serviceSchema /
        cafeEventSchema / breadcrumbSchema on program pages (plans 02-04/02-05).
     6. Blog templates (src/pages/blog/[...slug].astro + EN twin) —
        blogPostingSchema (plan 02-05).

   All builders return plain `Record<string, unknown>` (schema-dts is NOT
   installed; the shapes are small enough to hand-type under strict mode).
   Builders are emitted through src/components/JsonLd.astro which escapes
   `<` to < so CMS-sourced strings can never break out via </script>.
   ============================================================ */

/**
 * Canonical production hostname. The single place the "is this the live
 * site?" decision is keyed from — both the robots endpoint (Allow vs
 * Disallow) and the middleware's X-Robots-Tag use this exact-match value
 * so a spoofed/preview host is treated as non-production (fail-safe).
 */
export const PROD_HOST = 'www.evolea.ch';

/**
 * Stable, production-pinned `@id` for the Organization (NGO) node.
 * Pinned to the production URL regardless of build target so every page's
 * per-page schema (BlogPosting.publisher, Service.provider, Event.organizer)
 * resolves to the same identity (RESEARCH Pitfall 7 / Pattern 4).
 */
export const ORG_ID = 'https://www.evolea.ch/#organization';

/**
 * Stable, production-pinned `@id` for the WebSite node (RESEARCH Pattern 4).
 */
export const WEBSITE_ID = 'https://www.evolea.ch/#website';

/** Fallback site URL used when Astro.site is undefined (e.g. some build paths). */
const FALLBACK_SITE = new URL('https://www.evolea.ch');

/**
 * Narrow view of the `settings/site` CMS entry (which is `z.any()` in the
 * content schema) covering only the fields siteGraph reads. Every field is
 * optional; siteGraph supplies literal fallbacks for each.
 */
interface SiteSettingsForSeo {
  kontakt?: { email?: string; telefon?: string };
  adresse?: { strasse?: string; plz?: string; ort?: string };
  social?: { instagram?: string };
}

/**
 * Site-wide JSON-LD `@graph` containing the Organization (NGO) and WebSite
 * nodes. Emitted from Base.astro on every page (SEO-04) so per-page schemas
 * can reference `{ '@id': ORG_ID }` on the same page.
 *
 * @param siteSettings - The `settings/site` CMS entry data (untyped; z.any()).
 * @param lang - Current page language; drives WebSite `inLanguage`.
 * @param site - `Astro.site` (may be undefined); used only for the logo URL.
 * @param base - Base path (`import.meta.env.BASE_URL` without trailing slash);
 *   prefixes the logo asset so it resolves on both Cloudflare (`/`) and
 *   GitHub Pages (`/evolea-website`) builds.
 * @returns A schema.org `@graph` object with the NGO and WebSite nodes.
 */
export function siteGraph(
  siteSettings: unknown,
  lang: 'de' | 'en',
  site: URL | undefined,
  base: string,
): Record<string, unknown> {
  const s = (siteSettings ?? {}) as SiteSettingsForSeo;
  const resolvedSite = site ?? FALLBACK_SITE;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NGO',
        '@id': ORG_ID,
        name: 'EVOLEA Verein',
        alternateName: 'EVOLEA',
        url: 'https://www.evolea.ch/',
        logo: {
          '@type': 'ImageObject',
          url: new URL(`${base}/images/logo/evolea-logo-new.png`, resolvedSite).href,
        },
        email: s.kontakt?.email ?? 'hello@evolea.ch',
        telephone: s.kontakt?.telefon ?? '+41 78 959 19 74',
        address: {
          '@type': 'PostalAddress',
          streetAddress: s.adresse?.strasse ?? 'Germaniastrasse 55',
          postalCode: s.adresse?.plz ?? '8006',
          addressLocality: s.adresse?.ort ?? 'Zürich',
          // Country code, not the German label 'Schweiz'.
          addressCountry: 'CH',
        },
        sameAs: [s.social?.instagram ?? 'https://instagram.com/evolea.verein'],
        // The nonprofit-status property is intentionally OMITTED (RESEARCH A7 — value format unverified).
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: 'https://www.evolea.ch/',
        name: 'EVOLEA',
        inLanguage: lang === 'de' ? 'de-CH' : 'en',
        publisher: { '@id': ORG_ID },
        // No sitelinks-search-box action — that markup was removed by Google 2024-11-21.
      },
    ],
  };
}

/**
 * BreadcrumbList schema matching the visible breadcrumb trail. Items mirror
 * InnerPageHero's `BreadcrumbItem` shape (`{ label; href? }`). The last item
 * (current page) omits `href`, so its `item` property is omitted too, per
 * Google's breadcrumb guidance.
 *
 * @param items - Ordered breadcrumb items; hrefs arrive already
 *   translatePath()-resolved and base-prefixed (do NOT prepend base again).
 * @param site - `Astro.site`; used to absolutize each `href`.
 */
export function breadcrumbSchema(
  items: Array<{ label: string; href?: string }>,
  site: URL | undefined,
): Record<string, unknown> {
  const resolvedSite = site ?? FALLBACK_SITE;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: new URL(item.href, resolvedSite).href } : {}),
    })),
  };
}

/**
 * BlogPosting schema for a single blog article. `datePublished` and `image`
 * are omitted when not provided. The author is modelled as an Organization
 * ('EVOLEA Team' is not a natural person). Publisher references the on-page
 * Organization `@id` emitted by Base.astro's siteGraph.
 */
export function blogPostingSchema(opts: {
  headline: string;
  description: string;
  datePublished?: string;
  authorName: string;
  imageUrl?: string;
  canonicalUrl: string;
  lang: 'de' | 'en';
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.headline,
    description: opts.description,
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    author: { '@type': 'Organization', name: opts.authorName },
    ...(opts.imageUrl ? { image: opts.imageUrl } : {}),
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: opts.canonicalUrl,
    inLanguage: opts.lang === 'de' ? 'de-CH' : 'en',
  };
}

/**
 * Service schema for an EVOLEA program page. The `audience` PeopleAudience
 * block is emitted ONLY when both `minAge` and `maxAge` are supplied.
 * Provider references the on-page Organization `@id`.
 */
export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  lang: 'de' | 'en';
  minAge?: number;
  maxAge?: number;
}): Record<string, unknown> {
  const hasAges = opts.minAge !== undefined && opts.maxAge !== undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'City', name: 'Zürich' },
    ...(hasAges
      ? {
          audience: {
            '@type': 'PeopleAudience',
            suggestedMinAge: opts.minAge,
            suggestedMaxAge: opts.maxAge,
          },
        }
      : {}),
    url: opts.url,
    inLanguage: opts.lang === 'de' ? 'de-CH' : 'en',
  };
}

/**
 * Returns the ISO-8601 string for the next "2nd Wednesday of a month at
 * 20:00 Europe/Zurich" strictly after `now`.
 *
 * The 2nd Wednesday always falls on day-of-month 8–14, which is before the
 * last-Sunday DST switches in March and October — so a fixed month→offset
 * rule is correct: April–October → +02:00 (CEST), November–March → +01:00
 * (CET). Format: `YYYY-MM-DDT20:00:00+0X:00`.
 *
 * @param now - Reference instant (defaults to current time).
 */
export function nextCafeDate(now: Date = new Date()): string {
  // Work in a year/month cursor so we can advance month-by-month.
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed

  for (let i = 0; i < 24; i++) {
    // Weekday of the 1st of this month (0=Sun..6=Sat), computed in UTC to
    // avoid the host timezone shifting the calendar day.
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    // First Wednesday (3) day-of-month, then +7 for the second.
    const firstWed = 1 + ((3 - firstWeekday + 7) % 7);
    const secondWed = firstWed + 7;

    // CEST (Apr–Oct, months 3–9) vs CET (Nov–Mar). month is 0-indexed.
    const offset = month >= 3 && month <= 9 ? '+02:00' : '+01:00';
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(secondWed).padStart(2, '0');
    const candidate = `${year}-${mm}-${dd}T20:00:00${offset}`;

    if (new Date(candidate).getTime() > now.getTime()) {
      return candidate;
    }

    // Advance to the next month.
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  // Unreachable in practice; keeps the function total under strict mode.
  return `${year}-01-08T20:00:00+01:00`;
}

/**
 * Recurring Event schema for the EVOLEA Cafe parent meetup. A SINGLE Event
 * node (one per page, not one per CMS row) carrying a concrete next
 * `startDate` plus an `eventSchedule` for schema.org completeness. The
 * location uses a CITY-LEVEL PostalAddress only (no street / postal-code field)
 * — the venue is "exact location on request" and the street upgrade is
 * deferred (RESEARCH D3). Organizer references the on-page Organization `@id`.
 */
export function cafeEventSchema(opts: {
  lang: 'de' | 'en';
  description: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: opts.lang === 'de' ? 'EVOLEA Cafe – Elterntreff' : 'EVOLEA Cafe – Parent Meetup',
    description: opts.description,
    startDate: nextCafeDate(),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    isAccessibleForFree: true,
    location: {
      '@type': 'Place',
      name: 'EVOLEA',
      address: {
        '@type': 'PostalAddress',
        // City-level only — venue address upgrade deferred (RESEARCH D3).
        addressLocality: 'Zürich',
        addressCountry: 'CH',
      },
    },
    organizer: { '@id': ORG_ID },
    eventSchedule: {
      '@type': 'Schedule',
      byDay: 'https://schema.org/Wednesday',
      repeatFrequency: 'P1M',
      startTime: '20:00',
      scheduleTimezone: 'Europe/Zurich',
    },
  };
}
