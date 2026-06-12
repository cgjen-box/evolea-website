/* ============================================================
   EVOLEA SEO constants & schema builders — SINGLE SOURCE OF TRUTH
   ------------------------------------------------------------
   This module is the shared source for SEO/discovery primitives.
   Today's consumers:
     1. src/middleware.ts        — host-keyed X-Robots-Tag (de-indexes
        non-production SSR responses) keyed off PROD_HOST.
     2. src/pages/robots.txt.ts  — default-deny robots endpoint that only
        the exact production host (PROD_HOST) is allowed to crawl.

   Plan 02-02 extends this module with the JSON-LD @graph constants and
   schema builders (organizationSchema, websiteSchema, blogPostingSchema,
   breadcrumbSchema, serviceSchema, cafeEventSchema, nextCafeDate). Until
   then this file intentionally exports only PROD_HOST.
   ============================================================ */

/**
 * Canonical production hostname. The single place the "is this the live
 * site?" decision is keyed from — both the robots endpoint (Allow vs
 * Disallow) and the middleware's X-Robots-Tag use this exact-match value
 * so a spoofed/preview host is treated as non-production (fail-safe).
 */
export const PROD_HOST = 'www.evolea.ch';
