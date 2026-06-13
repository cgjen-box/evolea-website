import { test, expect, type Page } from '@playwright/test';

/**
 * Smoke regression net (HYG-04).
 *
 * Asserts the finished state of Phases 1-3 against the real serving path
 * (wrangler pages dev dist, or TEST_BASE_URL staging). A failing test here is a
 * real defect to investigate, never a test to weaken.
 *
 * Covers: DE/EN homepage load, both contact forms render, donate language
 * switcher both directions, all program pages respond 200, branded bilingual
 * 404, and a broken-image guard on key pages.
 */

// Program paths — source of truth: src/i18n/utils.ts:62-94 (routeMappings).
// 9 DE under /angebote/ (incl. the index) + 9 EN under /en/programs/ (incl. the index).
const PROGRAM_PATHS = [
  // DE (9)
  '/angebote/',
  '/angebote/mini-garten/',
  '/angebote/mini-projekte/',
  '/angebote/mini-projekte/mini-restaurant/',
  '/angebote/mini-turnen/',
  '/angebote/mini-abenteuercamp/',
  '/angebote/mini-museum/',
  '/angebote/evolea-cafe/',
  '/angebote/tagesschule/',
  // EN (9)
  '/en/programs/',
  '/en/programs/mini-garden/',
  '/en/programs/mini-projects/',
  '/en/programs/mini-projects/mini-restaurant/',
  '/en/programs/mini-sports/',
  '/en/programs/mini-adventure-camp/',
  '/en/programs/mini-museum/',
  '/en/programs/evolea-cafe/',
  '/en/programs/day-school/',
] as const;

test.describe('homepages', () => {
  test('DE homepage loads with an h1', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('EN homepage loads with an h1', async ({ page }) => {
    const res = await page.goto('/en/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('contact forms', () => {
  test('DE contact form renders a Formspree form', async ({ page }) => {
    const res = await page.goto('/kontakt/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('form[action^="https://formspree.io/f/"]')).toBeVisible();
  });

  test('EN contact form renders a Formspree form', async ({ page }) => {
    const res = await page.goto('/en/contact/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('form[action^="https://formspree.io/f/"]')).toBeVisible();
  });
});

test.describe('donate language switcher (both directions)', () => {
  test('DE /spenden/ → EN /en/donate/', async ({ page }) => {
    await page.goto('/spenden/');
    // LanguagePicker renders a single <a> with this aria-label on the DE page.
    await page.getByRole('link', { name: 'Switch to English' }).first().click();
    await expect(page).toHaveURL(/\/en\/donate\/?$/);
  });

  test('EN /en/donate/ → DE /spenden/', async ({ page }) => {
    await page.goto('/en/donate/');
    await page.getByRole('link', { name: 'Auf Deutsch wechseln' }).first().click();
    await expect(page).toHaveURL(/\/spenden\/?$/);
  });
});

test.describe('program pages respond 200', () => {
  for (const path of PROGRAM_PATHS) {
    test(`program page ${path} → 200 + h1`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }
});

test.describe('branded bilingual 404', () => {
  test('unmatched route returns 404 with DE + EN content and both link sets', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist/');
    expect(res?.status()).toBe(404);
    // Both languages present on the single bilingual 404 page.
    await expect(page.getByText('Seite nicht gefunden').first()).toBeVisible();
    await expect(page.getByText('Page not found').first()).toBeVisible();
    // DE link set.
    await expect(page.locator('a[href$="/angebote/"]').first()).toBeVisible();
    await expect(page.locator('a[href$="/blog/"]').first()).toBeVisible();
    // EN link set.
    await expect(page.locator('a[href$="/en/programs/"]').first()).toBeVisible();
    await expect(page.locator('a[href$="/en/blog/"]').first()).toBeVisible();
  });
});

test.describe('broken-image guard', () => {
  // Pitfall 2: a single missed image reference renders as a silent 404 only
  // when its CMS value is absent. Assert zero /images/ requests fail or 4xx/5xx.
  const PAGES = ['/', '/en/', '/angebote/', '/blog/', '/ueber-uns/'] as const;

  for (const path of PAGES) {
    test(`no broken /images/ requests on ${path}`, async ({ page }) => {
      const brokenImages: string[] = [];
      const attachListeners = (p: Page) => {
        p.on('requestfailed', (req) => {
          if (req.url().includes('/images/')) {
            brokenImages.push(`${req.failure()?.errorText ?? 'failed'} ${req.url()}`);
          }
        });
        p.on('response', (resp) => {
          if (resp.url().includes('/images/') && resp.status() >= 400) {
            brokenImages.push(`HTTP ${resp.status()} ${resp.url()}`);
          }
        });
      };
      attachListeners(page);
      await page.goto(path, { waitUntil: 'load' });
      expect(brokenImages).toEqual([]);
    });
  }
});
