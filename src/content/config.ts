import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('EVOLEA Team'),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

// Page content collection (managed by Keystatic)
const pagesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    pageId: z.string(),
    de: z.object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      heroTitle: z.string().optional(),
      heroSubtitle: z.string().optional(),
      ctaText: z.string().optional(),
      sections: z.array(z.object({
        heading: z.string(),
        content: z.string(),
      })).optional(),
    }),
    en: z.object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      heroTitle: z.string().optional(),
      heroSubtitle: z.string().optional(),
      ctaText: z.string().optional(),
      sections: z.array(z.object({
        heading: z.string(),
        content: z.string(),
      })).optional(),
    }),
  }),
});

// Settings collection (managed by Keystatic)
const settingsCollection = defineCollection({
  type: 'data',
  schema: z.any(), // Flexible schema for various settings
});

export const collections = {
  blog: blogCollection,
  pages: pagesCollection,
  settings: settingsCollection,
};
