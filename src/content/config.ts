import { defineCollection, z } from 'astro:content';

// =============================================================================
// SCHEMA HELPERS
// =============================================================================

// Bilingual text schema (DE + EN)
const bilingualText = z.object({
  de: z.string().optional(),
  en: z.string().optional(),
});

// =============================================================================
// BLOG COLLECTION
// =============================================================================
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('EVOLEA Team'),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    verwandteArtikel: z.array(z.string()).optional(),
  }),
});

const blogEnCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('EVOLEA Team'),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    verwandteArtikel: z.array(z.string()).optional(),
  }),
});

// =============================================================================
// TEAM COLLECTION
// =============================================================================
const teamCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    credentials: z.string().optional(),
    rolle: bilingualText,
    foto: z.string().optional(),
    beschreibung: bilingualText,
    email: z.string().optional(),
    linkedin: z.string().optional(),
    leitetProgramme: z.array(z.string()).optional(),
    veroeffentlicht: z.boolean().default(true),
    reihenfolge: z.number().default(0),
  }),
});

// =============================================================================
// PROGRAMS COLLECTION
// =============================================================================
const programsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    icon: z.string().default('sparkle'),
    farbe: z.string().default('green'),
    keyInfo: z.object({
      alter: z.string().optional(),
      tag: z.string().optional(),
      zeit: z.string().optional(),
      gruppengroesse: z.string().optional(),
      standort: z.string().optional(),
    }).optional(),
    titel: bilingualText,
    tagline: bilingualText.optional(),
    kurzbeschreibung: bilingualText,
    heroImage: z.string().optional(),
    inhalt: z.object({
      de: z.any().optional(), // MDX content
      en: z.any().optional(),
    }).optional(),
    lernziele: z.array(z.object({
      de: z.string().optional(),
      en: z.string().optional(),
    })).optional(),
    praktischeInfos: z.array(z.object({
      icon: z.string().optional(),
      titel: bilingualText,
      text: bilingualText,
    })).optional(),
    seo: z.any().optional(),
    veroeffentlicht: z.boolean().default(true),
    reihenfolge: z.number().default(0),
  }),
});

// =============================================================================
// PRINCIPLES COLLECTION
// =============================================================================
const principlesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    titel: z.string(),
    titelEn: z.string().optional(),
    beschreibung: bilingualText,
    icon: z.string().default('sparkle'),
    farbe: z.string().default('magenta'),
    veroeffentlicht: z.boolean().default(true),
    reihenfolge: z.number().default(0),
  }),
});

// =============================================================================
// TESTIMONIALS COLLECTION
// =============================================================================
const testimonialsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    zitat: bilingualText,
    rolle: bilingualText,
    programm: z.string().optional(),
    foto: z.string().optional(),
    datum: z.coerce.date().optional(),
    veroeffentlicht: z.boolean().default(true),
    reihenfolge: z.number().default(0),
  }),
});

// =============================================================================
// PAGE SINGLETONS (managed by Keystatic)
// =============================================================================
const pagesCollection = defineCollection({
  type: 'data',
  schema: z.any(), // Flexible schema for page singletons
});

// =============================================================================
// SETTINGS (managed by Keystatic)
// =============================================================================
const settingsCollection = defineCollection({
  type: 'data',
  schema: z.any(), // Flexible schema for settings
});

// =============================================================================
// EXPORTS
// =============================================================================
export const collections = {
  blog: blogCollection,
  blogEn: blogEnCollection,
  team: teamCollection,
  programs: programsCollection,
  principles: principlesCollection,
  testimonials: testimonialsCollection,
  pages: pagesCollection,
  settings: settingsCollection,
};
