#!/usr/bin/env node
/**
 * Headless QA for the brand-system overhaul.
 *
 * Drives a real Chromium via playwright-core (already a devDependency).
 * Reports console errors, network failures, viewport checks, and a hex-copy
 * interaction test. Writes screenshots into /tmp/brand-qa/.
 *
 * Run with the dev server already up at localhost:4321.
 *   node scripts/brand-qa.mjs
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:4321/evolea-website';
const OUT = '/tmp/brand-qa';
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { path: '/', label: 'home-de' },
  { path: '/en/', label: 'home-en' },
  { path: '/brand/', label: 'brand-de' },
  { path: '/en/brand/', label: 'brand-en' },
  { path: '/spenden/', label: 'spenden' },
  { path: '/en/donate/', label: 'donate-en' },
  { path: '/angebote/', label: 'angebote' },
  { path: '/ueber-uns/', label: 'ueber-uns' },
  { path: '/team/', label: 'team' },
  { path: '/kontakt/', label: 'kontakt' },
  { path: '/blog/', label: 'blog' },
];

const VIEWPORTS = [
  { w: 1440, h: 900, label: 'desktop' },
  { w: 375, h: 812, label: 'mobile' },
];

const colors = {
  pass: (s) => `\x1b[32m${s}\x1b[0m`,
  fail: (s) => `\x1b[31m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

const summary = {
  routes: {},
  totalConsoleErrors: 0,
  totalNetworkFailures: 0,
  failures: [],
};

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  ignoreHTTPSErrors: true,
});

console.log('Starting headless QA against', BASE, '\n');

for (const route of ROUTES) {
  const url = `${BASE}${route.path}`;
  const page = await context.newPage();
  const consoleErrors = [];
  const consoleWarns = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') consoleWarns.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`pageerror: ${err.message}`);
  });
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.failure()?.errorText} ${req.url()}`);
  });
  page.on('response', (resp) => {
    const status = resp.status();
    if (status >= 400) failedRequests.push(`HTTP ${status} ${resp.url()}`);
  });

  let status = '?';
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20_000 });
    status = String(resp?.status() ?? '?');
    // small settle for any after-paint console messages
    await page.waitForTimeout(400);
  } catch (e) {
    consoleErrors.push(`navigation: ${e.message}`);
  }

  // viewport screenshots
  for (const vp of VIEWPORTS) {
    try {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.waitForTimeout(200);
      await page.screenshot({
        path: `${OUT}/${route.label}-${vp.label}.png`,
        fullPage: vp.label === 'mobile' ? false : false, // viewport-only for diff
      });
    } catch (e) {
      consoleWarns.push(`screenshot ${vp.label}: ${e.message}`);
    }
  }

  summary.routes[route.path] = {
    status,
    consoleErrors,
    consoleWarns,
    failedRequests,
  };
  summary.totalConsoleErrors += consoleErrors.length;
  summary.totalNetworkFailures += failedRequests.length;
  if (status !== '200' || consoleErrors.length || failedRequests.length) {
    summary.failures.push(route.path);
  }

  const tag =
    status === '200' && consoleErrors.length === 0 && failedRequests.length === 0
      ? colors.pass('PASS')
      : colors.fail('FAIL');
  console.log(
    `${tag}  ${status}  ${route.path.padEnd(20)}  ` +
      colors.dim(`console=${consoleErrors.length}/${consoleWarns.length}, net=${failedRequests.length}`)
  );
  await page.close();
}

// ----- Brand-specific interaction: hex copy ------------------------------
console.log('\nInteractive: hex copy on /brand/ ...');
const ipage = await context.newPage();
let hexResult = 'unknown';
try {
  await ipage.goto(`${BASE}/brand/`, { waitUntil: 'networkidle' });
  // Grant clipboard write so navigator.clipboard.writeText resolves
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  // Click first BrandSwatch (which has data-copy)
  await ipage.click('button.brand-swatch[data-copy]');
  // Wait for toast --show class
  await ipage.waitForSelector('.brand-toast--show', { timeout: 1500 });
  const toastText = await ipage.locator('.brand-toast').innerText();
  hexResult = `OK — toast: "${toastText}"`;
} catch (e) {
  hexResult = `FAIL — ${e.message}`;
}
console.log('  ' + (hexResult.startsWith('OK') ? colors.pass(hexResult) : colors.fail(hexResult)));
await ipage.close();

// ----- Brand-specific: prefers-reduced-motion silences donate animation ----
// Note: reducedMotion is a *context* option, not a page option in Playwright.
console.log('\nInteractive: prefers-reduced-motion kills donate halo ...');
const rmContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
const rpage = await rmContext.newPage();
let rmResult = 'unknown';
try {
  await rpage.goto(`${BASE}/brand/`, { waitUntil: 'networkidle' });
  const data = await rpage.evaluate(() => {
    const btn = document.querySelector('.brand-btn--donate');
    if (!btn) return null;
    const cs = getComputedStyle(btn);
    return { name: cs.animationName, duration: cs.animationDuration };
  });
  if (!data) {
    rmResult = 'FAIL — no donate button found';
  } else if (data.name === 'none') {
    rmResult = `OK — animation-name:none, duration:${data.duration}`;
  } else {
    rmResult = `FAIL — animation-name: ${data.name} (duration ${data.duration})`;
  }
} catch (e) {
  rmResult = `FAIL — ${e.message}`;
}
console.log('  ' + (rmResult.startsWith('OK') ? colors.pass(rmResult) : colors.fail(rmResult)));
await rmContext.close();

// ----- Brand-specific: mobile menu solid (brand commandment §10.2) --------
// Header.astro: #mobile-menu-btn opens #mobile-menu-overlay; the visual fill
// lives on the inner .mobile-menu-bg layer.
console.log('\nInteractive: mobile menu solid background (commandment §10.2) ...');
const mctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const mpage = await mctx.newPage();
let menuResult = 'unknown';
try {
  await mpage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await mpage.click('#mobile-menu-btn', { timeout: 5_000 });
  await mpage.waitForTimeout(400);
  const data = await mpage.evaluate(() => {
    const bg = document.querySelector('.mobile-menu-bg');
    if (!bg) return null;
    const cs = getComputedStyle(bg);
    return { color: cs.backgroundColor, opacity: cs.opacity };
  });
  if (!data) {
    menuResult = 'FAIL — .mobile-menu-bg not found after toggle';
  } else {
    const isTransparent = data.color === 'rgba(0, 0, 0, 0)' || Number(data.opacity) < 0.95;
    menuResult = isTransparent
      ? `FAIL — mobile-menu-bg transparent (${data.color}, opacity ${data.opacity})`
      : `OK — mobile-menu-bg solid (${data.color}, opacity ${data.opacity})`;
  }
} catch (e) {
  menuResult = `FAIL — ${e.message.split('\n')[0]}`;
}
console.log(
  '  ' + (menuResult.startsWith('OK') ? colors.pass(menuResult) : colors.fail(menuResult))
);
await mctx.close();

// ----- Final summary -----------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`Routes tested:        ${ROUTES.length}`);
console.log(`Failures:             ${summary.failures.length}`);
console.log(`Total console errors: ${summary.totalConsoleErrors}`);
console.log(`Total network errors: ${summary.totalNetworkFailures}`);
if (summary.failures.length) {
  console.log('\nRoutes with issues:');
  for (const path of summary.failures) {
    const r = summary.routes[path];
    console.log(`\n  ${path}  status=${r.status}`);
    for (const err of r.consoleErrors.slice(0, 3)) console.log(`    console: ${err.slice(0, 200)}`);
    for (const f of r.failedRequests.slice(0, 3)) console.log(`    network: ${f.slice(0, 200)}`);
  }
}
console.log(`\nScreenshots: ${OUT}/`);

await browser.close();
process.exit(summary.failures.length > 0 ? 1 : 0);
