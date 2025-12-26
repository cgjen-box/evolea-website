#!/usr/bin/env node
/**
 * CMS Field Mapper - Extracts all text fields from Keystatic CMS content
 *
 * Usage: node scripts/cms-field-mapper.mjs
 *
 * Output: todo/cms-field-manifest.json
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, relative, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content');
const OUTPUT_DIR = join(ROOT, 'todo');
const OUTPUT_FILE = join(OUTPUT_DIR, 'cms-field-manifest.json');

// Page URL mappings
const PAGE_MAPPINGS = {
  'pages/homepage.json': { de: '/', en: '/en/' },
  'pages/about.json': { de: '/ueber-uns/', en: '/en/about/' },
  'pages/contact.json': { de: '/kontakt/', en: '/en/contact/' },
  'pages/angebote-index.json': { de: '/angebote/', en: '/en/programs/' },
  'pages/mini-garten.json': { de: '/angebote/mini-garten/', en: '/en/programs/mini-garten/' },
  'pages/mini-projekte.json': { de: '/angebote/mini-projekte/', en: '/en/programs/mini-projekte/' },
  'pages/mini-turnen.json': { de: '/angebote/mini-turnen/', en: '/en/programs/mini-turnen/' },
  'pages/mini-museum.json': { de: '/angebote/mini-museum/', en: '/en/programs/mini-museum/' },
  'pages/evolea-cafe.json': { de: '/angebote/evolea-cafe/', en: '/en/programs/evolea-cafe/' },
  'pages/tagesschule.json': { de: '/angebote/tagesschule/', en: '/en/programs/tagesschule/' },
  'settings/site.json': { de: '/', en: '/en/' },
  'settings/translations.json': { de: '/', en: '/en/' },
};

// Fields to skip (non-text)
const SKIP_FIELDS = ['id', 'slug', 'image', 'foto', 'icon', 'link', 'buttonLink', 'href', 'src', 'alt'];

/**
 * Recursively find all JSON files in a directory
 */
function findJsonFiles(dir, files = []) {
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      findJsonFiles(fullPath, files);
    } else if (item.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Check if a value is a bilingual object
 */
function isBilingualObject(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length === 2 && keys.includes('de') && keys.includes('en');
}

/**
 * Extract all text fields from an object recursively
 */
function extractFields(obj, path = '', results = []) {
  if (obj === null || obj === undefined) return results;

  if (typeof obj === 'string') {
    // Skip if this is an image path or URL
    if (obj.startsWith('/') || obj.startsWith('http') || obj.includes('.png') || obj.includes('.jpg') || obj.includes('.svg')) {
      return results;
    }
    if (obj.trim().length > 0) {
      results.push({
        path,
        type: 'string',
        value: obj,
        lang: null
      });
    }
    return results;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      extractFields(item, `${path}[${index}]`, results);
    });
    return results;
  }

  if (typeof obj === 'object') {
    // Check if it's a bilingual object
    if (isBilingualObject(obj)) {
      if (obj.de && typeof obj.de === 'string' && obj.de.trim().length > 0) {
        results.push({
          path: `${path}.de`,
          type: 'bilingual',
          value: obj.de,
          lang: 'de'
        });
      }
      if (obj.en && typeof obj.en === 'string' && obj.en.trim().length > 0) {
        results.push({
          path: `${path}.en`,
          type: 'bilingual',
          value: obj.en,
          lang: 'en'
        });
      }
      return results;
    }

    // Regular object - recurse into each key
    for (const key of Object.keys(obj)) {
      // Skip non-text fields
      if (SKIP_FIELDS.includes(key)) continue;

      const newPath = path ? `${path}.${key}` : key;
      extractFields(obj[key], newPath, results);
    }
  }

  return results;
}

/**
 * Get expected pages for a content file
 */
function getExpectedPages(relativePath) {
  // Check direct mapping
  if (PAGE_MAPPINGS[relativePath]) {
    return PAGE_MAPPINGS[relativePath];
  }

  // Handle collections
  if (relativePath.startsWith('team/')) {
    return { de: '/team/', en: '/en/team/' };
  }
  if (relativePath.startsWith('principles/')) {
    return { de: '/ueber-uns/', en: '/en/about/' };
  }
  if (relativePath.startsWith('blog/')) {
    const slug = basename(relativePath, '.json');
    return { de: `/blog/${slug}/`, en: null };
  }
  if (relativePath.startsWith('blog-en/')) {
    const slug = basename(relativePath, '.json');
    return { de: null, en: `/en/blog/${slug}/` };
  }

  return { de: '/', en: '/en/' };
}

/**
 * Determine suggested DOM selector based on field path
 */
function suggestSelector(fieldPath, type) {
  // Hero titles
  if (fieldPath.includes('hero.titel')) return 'h1, [data-hero-title]';
  if (fieldPath.includes('hero.untertitel')) return '[data-hero-subtitle], .hero-subtitle';
  if (fieldPath.includes('hero.description')) return '[data-hero-description]';

  // Section titles
  if (fieldPath.includes('.titel')) return `[data-section="${fieldPath.split('.')[0]}"] h2`;
  if (fieldPath.includes('.beschreibung')) return `[data-section="${fieldPath.split('.')[0]}"] p`;

  // Team member fields
  if (fieldPath.includes('name')) return '[data-team-member] .team-name';
  if (fieldPath.includes('rolle')) return '[data-team-member] .team-role';

  // Generic text
  return 'body';
}

/**
 * Main function
 */
function main() {
  console.log('CMS Field Mapper - Extracting all text fields from Keystatic content\n');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Find all JSON files
  const jsonFiles = findJsonFiles(CONTENT_DIR);
  console.log(`Found ${jsonFiles.length} content files\n`);

  const manifest = {
    generated: new Date().toISOString(),
    summary: {
      totalFiles: 0,
      totalFields: 0,
      bilingualFields: 0,
      stringFields: 0,
    },
    files: {},
    fieldsByPage: {}
  };

  // Process each file
  for (const filePath of jsonFiles) {
    const relativePath = relative(CONTENT_DIR, filePath).replace(/\\/g, '/');
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));

    const fields = extractFields(content);
    if (fields.length === 0) continue;

    const expectedPages = getExpectedPages(relativePath);

    manifest.files[relativePath] = {
      path: relativePath,
      fullPath: filePath,
      expectedPages,
      fields: fields.map(f => ({
        ...f,
        selector: suggestSelector(f.path, f.type),
        verified: false,
        testMarker: null
      }))
    };

    manifest.summary.totalFiles++;
    manifest.summary.totalFields += fields.length;
    manifest.summary.bilingualFields += fields.filter(f => f.type === 'bilingual').length;
    manifest.summary.stringFields += fields.filter(f => f.type === 'string').length;

    // Group by page for easier testing
    for (const lang of ['de', 'en']) {
      const pageUrl = expectedPages[lang];
      if (!pageUrl) continue;

      if (!manifest.fieldsByPage[pageUrl]) {
        manifest.fieldsByPage[pageUrl] = [];
      }

      const relevantFields = fields.filter(f => f.lang === lang || (f.lang === null && lang === 'de'));
      for (const field of relevantFields) {
        manifest.fieldsByPage[pageUrl].push({
          file: relativePath,
          path: field.path,
          value: field.value,
          selector: suggestSelector(field.path, field.type)
        });
      }
    }

    console.log(`  ${relativePath}: ${fields.length} fields`);
  }

  // Write manifest
  writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files processed: ${manifest.summary.totalFiles}`);
  console.log(`Total text fields: ${manifest.summary.totalFields}`);
  console.log(`  - Bilingual fields: ${manifest.summary.bilingualFields}`);
  console.log(`  - String fields: ${manifest.summary.stringFields}`);
  console.log(`\nManifest written to: ${OUTPUT_FILE}`);

  // Print page summary
  console.log('\nFields by page:');
  for (const [page, fields] of Object.entries(manifest.fieldsByPage)) {
    console.log(`  ${page}: ${fields.length} fields`);
  }

  return manifest;
}

// Run
main();
