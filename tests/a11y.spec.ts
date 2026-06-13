import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * axe-core accessibility scan (HYG-04, A11Y-01/02 proof).
 *
 * reducedMotion is set BEFORE every goto (Pitfall 4): the site's animated prism
 * gradients otherwise make color-contrast sampling nondeterministic. The site has
 * thorough prefers-reduced-motion CSS that freezes the backgrounds.
 *
 * Contract (fixed): 0 violations under the four WCAG tags on the representative
 * page set, including /angebote/mini-garten/ (the green-badge page proving the
 * A11Y-02 contrast fix) and the 404 page.
 */

const PAGES = [
  '/',
  '/en/',
  '/angebote/mini-garten/', // green-badge page (A11Y-02)
  '/kontakt/',
  '/this-page-does-not-exist/', // 404
] as const;

for (const path of PAGES) {
  test(`no axe violations on ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
