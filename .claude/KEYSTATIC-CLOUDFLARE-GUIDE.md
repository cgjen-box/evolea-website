# Keystatic + Cloudflare Pages: Comprehensive Guide

This guide documents all learnings, fixes, and best practices for running Keystatic CMS on Cloudflare Pages with Astro.

## Quick Troubleshooting Checklist

When Keystatic is not working, check these in order:

### 1. Environment Variables
```bash
# Required env vars in Cloudflare Pages Dashboard:
KEYSTATIC_GITHUB_CLIENT_ID      # 20 characters
KEYSTATIC_GITHUB_CLIENT_SECRET  # 40 characters
KEYSTATIC_SECRET               # 64 characters (generate with: openssl rand -hex 32)
```

**Test with debug endpoint:**
```
https://your-site.pages.dev/api/debug-env
```

Expected response: All three vars should show "SET" with correct lengths.

### 2. Vite.define Configuration (astro.config.mjs)
```javascript
vite: {
  define: {
    'process.env.KEYSTATIC_GITHUB_CLIENT_ID': JSON.stringify(process.env.KEYSTATIC_GITHUB_CLIENT_ID),
    'process.env.KEYSTATIC_GITHUB_CLIENT_SECRET': JSON.stringify(process.env.KEYSTATIC_GITHUB_CLIENT_SECRET),
    'process.env.KEYSTATIC_SECRET': JSON.stringify(process.env.KEYSTATIC_SECRET),
  },
},
```

### 3. Wrangler.toml Configuration
```toml
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]
command = "npm run build:cloudflare"
```

### 4. Package.json Build Script
```json
"build:cloudflare": "npm install @astrojs/cloudflare --no-save && astro check && astro build"
```

---

## Known Compatibility Issues

### Features That DON'T Work on Cloudflare Pages

| Feature | Import | Issue |
|---------|--------|-------|
| Content Components | `@keystatic/core/content-components` | Worker compatibility |
| `wrapper()` | From content-components | Causes 500 errors |
| `block()` | From content-components | Causes 500 errors |
| `fields.conditional()` | Built-in but problematic | May cause parsing errors |
| `fields.relationship()` | Built-in but problematic | May cause issues |

### Features That DO Work

| Feature | Notes |
|---------|-------|
| `fields.text()` | Works fine |
| `fields.slug()` | Works fine |
| `fields.object()` | Works fine, including nested |
| `fields.array()` | Works fine |
| `fields.select()` | Works fine |
| `fields.checkbox()` | Works fine |
| `fields.integer()` | Works fine |
| `fields.date()` | Works fine |
| `fields.image()` | Works fine |
| `fields.url()` | Works fine |
| `fields.mdx()` | Works WITHOUT components param |
| `collection()` | Works fine |
| `singleton()` | Works fine |

---

## Common Errors and Solutions

### Error: 500 on /api/keystatic/github/login

**Symptoms:**
- Login endpoint returns 500
- Page shows only JavaScript (no UI)

**Solutions:**
1. Check environment variables are set
2. Check vite.define configuration
3. Simplify keystatic.config.ts (remove content-components)

### Error: Conditional Field Mismatch

**Symptoms:**
- Singleton pages don't load
- Error parsing JSON data

**Cause:** JSON files have `"discriminant": false, "value": {}` format from `fields.conditional()` but schema doesn't have conditional field.

**Solution:** Remove the conditional field data from JSON files:
```json
// REMOVE this:
"seo": {
  "discriminant": false,
  "value": {}
}
```

### Error: Collection/Singleton Not Found

**Symptoms:**
- 404 on collection/singleton pages
- Empty list in Keystatic

**Cause:** Path mismatch between config and actual files.

**Check:**
```javascript
// Config path
path: 'src/content/pages/homepage'
// Actual file should be
// src/content/pages/homepage.json (for format: { data: 'json' })
// src/content/pages/homepage/index.mdx (for format: { contentField: 'content' })
```

---

## Working Configuration Template

```typescript
import { config, fields, collection, singleton } from '@keystatic/core';
// DO NOT import from @keystatic/core/content-components

const isLocal = process.env.NODE_ENV === 'development' && !process.env.KEYSTATIC_GITHUB_CLIENT_ID;

// Bilingual helper (works fine)
const bilingualText = (labelDe: string, labelEn: string, options?: { multiline?: boolean }) =>
  fields.object({
    de: fields.text({ label: `${labelDe} (DE)`, multiline: options?.multiline }),
    en: fields.text({ label: `${labelEn} (EN)`, multiline: options?.multiline }),
  }, { label: labelDe });

export default config({
  storage: isLocal
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: 'your-org/your-repo',
        branchPrefix: 'keystatic/',
      },

  ui: {
    brand: { name: 'Your CMS' },
    navigation: {
      Content: ['blog', 'team'],
      Pages: ['homepage', 'about'],
    },
  },

  collections: {
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.mdx({
          label: 'Content',
          // DO NOT use components: {} here
          options: {
            bold: true,
            italic: true,
            heading: [2, 3, 4],
            link: true,
            image: true,
          },
        }),
      },
    }),
  },

  singletons: {
    homepage: singleton({
      label: 'Homepage',
      path: 'src/content/pages/homepage',
      format: { data: 'json' },
      schema: {
        hero: fields.object({
          title: bilingualText('Titel', 'Title'),
        }),
      },
    }),
  },
});
```

---

## Debug Endpoint

Add this file to check environment variables:

**`src/pages/api/debug-env.ts`**
```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const envInfo = {
    viteDefine: {
      KEYSTATIC_GITHUB_CLIENT_ID: process.env.KEYSTATIC_GITHUB_CLIENT_ID
        ? 'SET (length: ' + process.env.KEYSTATIC_GITHUB_CLIENT_ID.length + ')'
        : 'NOT SET',
      KEYSTATIC_GITHUB_CLIENT_SECRET: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET
        ? 'SET (length: ' + process.env.KEYSTATIC_GITHUB_CLIENT_SECRET.length + ')'
        : 'NOT SET',
      KEYSTATIC_SECRET: process.env.KEYSTATIC_SECRET
        ? 'SET (length: ' + process.env.KEYSTATIC_SECRET.length + ')'
        : 'NOT SET',
    },
    cloudflareRuntime: {},
    hasRuntime: !!(locals as any).runtime,
    hasRuntimeEnv: !!(locals as any).runtime?.env,
  };

  try {
    const runtime = (locals as any).runtime;
    if (runtime?.env) {
      envInfo.cloudflareRuntime = {
        KEYSTATIC_GITHUB_CLIENT_ID: runtime.env.KEYSTATIC_GITHUB_CLIENT_ID ? 'SET' : 'NOT SET',
        KEYSTATIC_GITHUB_CLIENT_SECRET: runtime.env.KEYSTATIC_GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET',
        KEYSTATIC_SECRET: runtime.env.KEYSTATIC_SECRET ? 'SET' : 'NOT SET',
      };
    }
  } catch (e) {
    (envInfo as any).runtimeError = String(e);
  }

  return new Response(JSON.stringify(envInfo, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

---

## Deployment Checklist

Before deploying:

1. [ ] `npm run build` passes locally
2. [ ] No TypeScript errors
3. [ ] keystatic.config.ts has no content-components imports
4. [ ] JSON data files match schema (no orphaned conditional fields)
5. [ ] All collection/singleton paths match actual file locations

After deploying:

1. [ ] Check `/api/debug-env` for env vars
2. [ ] Check `/api/keystatic/github/login` returns 307 redirect (not 500)
3. [ ] Check `/keystatic/` loads (may need to authenticate first)
4. [ ] Test each singleton page
5. [ ] Test each collection page

---

## References

- [Keystatic GitHub Issue #1229](https://github.com/Thinkmill/keystatic/issues/1229) - Environment variables on Cloudflare
- [Cloudflare nodejs_compat](https://developers.cloudflare.com/workers/runtime-apis/nodejs/process/) - process.env support
- [@astrojs/cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)

---

## Version History

- 2025-12-07: Initial guide created after debugging 500 errors
  - Identified content-components as incompatible
  - Identified conditional field data mismatch
  - Created working simplified config
