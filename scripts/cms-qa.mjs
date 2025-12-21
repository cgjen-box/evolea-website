import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const CMS_BASE =
  process.env.CMS_BASE || 'https://evolea-website.pages.dev/keystatic/branch/main';
const SITE_BASE = process.env.SITE_BASE || 'https://evolea-website.pages.dev';
const GH_REPO = process.env.GH_REPO || 'cgjen-box/evolea-website';
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'artifacts/cms-qa';
const TIMEOUT = 60000;

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

const report = {
  startedAt: new Date().toISOString(),
  cmsBase: CMS_BASE,
  siteBase: SITE_BASE,
  checks: [],
  blocked: [],
  errors: [],
  warnings: [],
};

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

const writeReport = () => {
  ensureDir(OUTPUT_DIR);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'report.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );
};

const addCheck = (name, status, details) => {
  report.checks.push({ name, status, details });
};

const addError = (name, details) => {
  report.errors.push({ name, details });
};

const addWarning = (name, details) => {
  report.warnings.push({ name, details });
};

const getDiagnostics = () => ({
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
});

const attachDiagnostics = (page, diagnostics) => {
  const onConsole = (msg) => {
    if (msg.type() === 'error') {
      diagnostics.consoleErrors.push({
        type: msg.type(),
        text: msg.text(),
      });
    }
  };
  const onPageError = (error) => {
    diagnostics.pageErrors.push({ message: error.message });
  };
  const onRequestFailed = (request) => {
    diagnostics.requestFailures.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'unknown',
    });
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('requestfailed', onRequestFailed);

  return () => {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    page.off('requestfailed', onRequestFailed);
  };
};

const checkA11yBasics = async (page, label) => {
  const missingAlt = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .filter((img) => !img.hasAttribute('alt'))
      .map((img) => img.src);
  });

  const missingLabels = await page.evaluate(() => {
    const fields = Array.from(
      document.querySelectorAll('input, textarea, select')
    );
    return fields.filter((el) => {
      if (el.getAttribute('type') === 'hidden') return false;
      const id = el.getAttribute('id');
      if (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) {
        return false;
      }
      if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) {
        return false;
      }
      return true;
    }).length;
  });

  const headingOrder = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ).map((el) => el.tagName);
  });

  if (missingAlt.length > 0) {
    addWarning(`${label} missing img alt`, { count: missingAlt.length });
  }
  if (missingLabels > 0) {
    addWarning(`${label} missing form labels`, { count: missingLabels });
  }

  addCheck(`${label} heading order`, 'info', { order: headingOrder });
};

const checkBrokenImages = async (page, label) => {
  const broken = await page.evaluate(() => {
    return Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.src);
  });
  if (broken.length > 0) {
    addError(`${label} broken images`, { urls: broken });
  } else {
    addCheck(`${label} broken images`, 'pass', {});
  }
};

const screenshotPage = async (page, name) => {
  const shotsDir = path.join(OUTPUT_DIR, 'screenshots');
  ensureDir(shotsDir);

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(1200);
    const filePath = path.join(shotsDir, `${name}-${vp.name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
  }
};

const navigateWithDiagnostics = async (page, name, url, waitForSelector) => {
  const diagnostics = getDiagnostics();
  const detach = attachDiagnostics(page, diagnostics);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: TIMEOUT });
    }
    await page.waitForTimeout(1500);
  } catch (error) {
    addError(`${name} navigation`, { message: error.message });
  } finally {
    detach();
  }

  if (diagnostics.consoleErrors.length > 0) {
    addError(`${name} console errors`, diagnostics.consoleErrors);
  }
  if (diagnostics.pageErrors.length > 0) {
    addError(`${name} page errors`, diagnostics.pageErrors);
  }
  if (diagnostics.requestFailures.length > 0) {
    addWarning(`${name} request failures`, diagnostics.requestFailures);
  }
};

const checkValidationBanners = async (page, label) => {
  const alerts = await page.locator('[role="alert"]').allTextContents();
  const validationAlerts = alerts.filter((text) =>
    /validation|valid option|error/i.test(text)
  );

  if (validationAlerts.length > 0) {
    addError(`${label} validation alerts`, { alerts: validationAlerts });
  } else {
    addCheck(`${label} validation alerts`, 'pass', {});
  }
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'cms-qa' },
  });
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.json();
};

const getLatestCommitSha = async (branch) => {
  const encoded = encodeURIComponent(branch);
  const url = `https://api.github.com/repos/${GH_REPO}/commits?sha=${encoded}&per_page=1`;
  try {
    const data = await fetchJson(url);
    return data?.[0]?.sha || null;
  } catch (error) {
    addWarning('GitHub commit check', { branch, message: error.message });
    return null;
  }
};

const waitForText = async (page, url, expected, label) => {
  const deadline = Date.now() + 240000;
  while (Date.now() < deadline) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    const hasText = await page.evaluate((text) => {
      return document.body?.innerText?.includes(text);
    }, expected);
    if (hasText) {
      addCheck(`${label} deployment`, 'pass', { expected });
      return true;
    }
    await page.waitForTimeout(15000);
  }
  addError(`${label} deployment`, {
    message: 'Expected text not found before timeout.',
    expected,
  });
  return false;
};

const commitIfPossible = async (page, message) => {
  const saveButton = page.getByRole('button', { name: /save|commit/i }).first();
  if (!(await saveButton.isVisible())) {
    return { ok: false, reason: 'save button not found' };
  }
  await saveButton.click();

  const commitInput = page.getByLabel(/commit message/i);
  if (await commitInput.isVisible().catch(() => false)) {
    await commitInput.fill(message);
    const commitButton = page
      .getByRole('button', { name: /commit|save/i })
      .first();
    await commitButton.click();
  }

  await page.waitForTimeout(2000);
  return { ok: true };
};

const runCmsSmoke = async (page) => {
  const cmsRoot = CMS_BASE.replace(/\/$/, '');
  const mainBefore = await getLatestCommitSha('main');
  const keystaticBefore = await getLatestCommitSha('keystatic/main');
  await navigateWithDiagnostics(
    page,
    'CMS home',
    cmsRoot,
    'body'
  );

  if (await page.getByRole('button', { name: /sign in/i }).isVisible().catch(() => false)) {
    report.blocked.push('CMS login required');
    addError('CMS login', { message: 'Sign-in required in Keystatic UI.' });
    return false;
  }

  const cmsPages = [
    { name: 'Startseite', path: '/singleton/homepage' },
    { name: 'About', path: '/singleton/about' },
    { name: 'Contact', path: '/singleton/contact' },
    { name: 'Angebote Index', path: '/singleton/angeboteIndex' },
    { name: 'Mini Garten', path: '/singleton/miniGarten' },
    { name: 'Mini Projekte', path: '/singleton/miniProjekte' },
    { name: 'Mini Turnen', path: '/singleton/miniTurnen' },
    { name: 'Tagesschule', path: '/singleton/tagesschule' },
    { name: 'Site Images', path: '/singleton/siteImages' },
    { name: 'Site Settings', path: '/singleton/siteSettings' },
    { name: 'Blog', path: '/collection/blog' },
    { name: 'Team', path: '/collection/team' },
    { name: 'Principles', path: '/collection/principles' },
  ];

  for (const item of cmsPages) {
    const url = `${cmsRoot}${item.path}`;
    await navigateWithDiagnostics(page, `CMS ${item.name}`, url, 'body');
    await checkValidationBanners(page, `CMS ${item.name}`);
    await screenshotPage(page, `cms-${item.name.replace(/\s+/g, '-').toLowerCase()}`);
  }

  const siteSettingsUrl = `${cmsRoot}/singleton/siteSettings`;
  await navigateWithDiagnostics(page, 'CMS Site Settings edit', siteSettingsUrl, 'body');
  const taglineField = page.getByLabel('Tagline (DE)');
  if (!(await taglineField.isVisible().catch(() => false))) {
    addWarning('CMS Site Settings edit', {
      message: 'Tagline (DE) field not found; skip edit test.',
    });
    return true;
  }

  await taglineField.scrollIntoViewIfNeeded();
  const original = await taglineField.inputValue();
  const testValue = original.endsWith(' QA') ? original.replace(/ QA$/, '') : `${original} QA`;

  await taglineField.fill(testValue);
  const commitResult = await commitIfPossible(page, 'QA test: footer tagline');
  if (!commitResult.ok) {
    addWarning('CMS Site Settings save', commitResult);
    return true;
  }

  await page.reload({ waitUntil: 'domcontentloaded', timeout: TIMEOUT });
  await page.waitForTimeout(1500);
  const updated = await taglineField.inputValue();
  if (updated !== testValue) {
    addError('CMS Site Settings save', {
      message: 'Footer tagline did not persist after save.',
      expected: testValue,
      actual: updated,
    });
  } else {
    addCheck('CMS Site Settings save', 'pass', {});
  }

  const siteHome = `${SITE_BASE.replace(/\/$/, '')}/`;
  await waitForText(page, siteHome, testValue, 'Footer tagline');

  await page.goto(siteSettingsUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
  await page.waitForTimeout(1500);
  await taglineField.fill(original);
  const revertResult = await commitIfPossible(page, 'QA test: revert footer tagline');
  if (!revertResult.ok) {
    addWarning('CMS Site Settings revert', revertResult);
    return true;
  }

  await page.reload({ waitUntil: 'domcontentloaded', timeout: TIMEOUT });
  await page.waitForTimeout(1500);
  const reverted = await taglineField.inputValue();
  if (reverted !== original) {
    addError('CMS Site Settings revert', {
      message: 'Footer tagline did not revert after save.',
      expected: original,
      actual: reverted,
    });
  } else {
    addCheck('CMS Site Settings revert', 'pass', {});
  }

  await waitForText(page, siteHome, original, 'Footer tagline revert');

  const mainAfter = await getLatestCommitSha('main');
  const keystaticAfter = await getLatestCommitSha('keystatic/main');
  if (mainBefore && mainAfter && mainBefore !== mainAfter) {
    addCheck('GitHub commit on main', 'pass', { before: mainBefore, after: mainAfter });
  } else if (keystaticBefore && keystaticAfter && keystaticBefore !== keystaticAfter) {
    addCheck('GitHub commit on keystatic/main', 'pass', {
      before: keystaticBefore,
      after: keystaticAfter,
    });
  } else {
    addWarning('GitHub commit check', {
      message: 'No new commit detected on main or keystatic/main.',
      mainBefore,
      mainAfter,
      keystaticBefore,
      keystaticAfter,
    });
  }

  return true;
};

const runSiteChecks = async (page) => {
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/ueber-uns/' },
    { name: 'Programs', path: '/angebote/' },
    { name: 'Mini Garten', path: '/angebote/mini-garten/' },
    { name: 'Mini Projekte', path: '/angebote/mini-projekte/' },
    { name: 'Mini Turnen', path: '/angebote/mini-turnen/' },
    { name: 'Tagesschule', path: '/angebote/tagesschule/' },
    { name: 'Contact', path: '/kontakt/' },
    { name: 'Blog', path: '/blog/' },
    { name: 'Team', path: '/team/' },
    { name: 'EN Home', path: '/en/' },
    { name: 'EN About', path: '/en/about/' },
    { name: 'EN Contact', path: '/en/contact/' },
  ];

  for (const item of pages) {
    const url = `${SITE_BASE.replace(/\/$/, '')}${item.path}`;
    await navigateWithDiagnostics(page, item.name, url, 'body');
    await checkBrokenImages(page, item.name);
    await checkA11yBasics(page, item.name);
    await screenshotPage(page, item.name.replace(/\s+/g, '-').toLowerCase());
  }
};

const main = async () => {
  ensureDir(OUTPUT_DIR);
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || (await browser.newContext());
  const page = await context.newPage();

  try {
    const cmsOk = await runCmsSmoke(page);
    if (cmsOk) {
      await runSiteChecks(page);
    }
  } catch (error) {
    addError('fatal', { message: error.message });
  } finally {
    writeReport();
    await page.close();
    await browser.close();
  }
};

main();
