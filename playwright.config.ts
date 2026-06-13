import { defineConfig } from '@playwright/test';

/**
 * EVOLEA Playwright regression net (HYG-04).
 *
 * Two-step flow (do NOT put the build inside webServer.command — build:cloudflare
 * re-installs the @astrojs/cloudflare adapter on every run, Pitfall 7):
 *   1. npm run build:cloudflare      # once — produces dist/_worker.js + dist/_headers
 *   2. npm run test:e2e              # webServer runs `npx wrangler pages dev dist`
 *
 * Serving mode (this machine: macOS arm64):
 *   - DEFAULT (local wrangler):     baseURL http://127.0.0.1:8788; webServer boots
 *     `npx wrangler pages dev dist --port 8788`, exercising the real workerd serving
 *     path (_worker.js middleware headers on SSR routes + public/_headers on
 *     prerendered/static routes). No Cloudflare auth needed for local pages dev;
 *     absent Keystatic env vars only affect /keystatic, which this suite never touches.
 *   - FALLBACK (staging preview):   if wrangler/workerd cannot run locally, run
 *     `TEST_BASE_URL=https://evolea-website.pages.dev npm run test:e2e` (or the
 *     current branch preview URL). When TEST_BASE_URL is set, webServer is skipped.
 *
 * Browser: system Google Chrome via `channel: 'chrome'` — no Playwright browser
 * downloads (repo precedent: scripts/brand-qa.mjs).
 */

const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:8788';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE,
    channel: 'chrome',
    trace: 'on-first-retry',
  },
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : {
        command: 'npx wrangler pages dev dist --port 8788',
        url: 'http://127.0.0.1:8788',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
