import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const CMS_BASE =
  process.env.CMS_BASE || 'https://evolea-website.pages.dev/keystatic/branch/main';
const PAGE_PATH = process.env.CMS_QA_PAGE_PATH || '/singleton/homepage';
const PAGE_NAME = process.env.CMS_QA_PAGE_NAME || 'Startseite';
const MODE = process.env.CMS_QA_BATCH_MODE || 'edit';
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(process.cwd(), 'artifacts', 'cms-qa');
const STATE_PATH =
  process.env.CMS_QA_STATE_PATH || path.join(OUTPUT_DIR, 'batch-state.json');
const TIMEOUT = 60000;
const FIELD_START = Number.parseInt(process.env.CMS_QA_FIELD_START || '0', 10);
const FIELD_COUNT = Number.parseInt(process.env.CMS_QA_FIELD_COUNT || '0', 10);
const FIELD_QUERY =
  'input, textarea, select, [role="combobox"], [contenteditable="true"]';
const QA_UPLOAD_FILE =
  process.env.CMS_QA_UPLOAD_FILE ||
  path.join(process.cwd(), 'public', 'images', 'logo', 'evolea-logo.png');

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

const readState = () => {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
  } catch {
    return { pages: {} };
  }
};

const writeState = (state) => {
  ensureDir(OUTPUT_DIR);
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf-8');
};

const sanitizeLabel = (value) => {
  if (!value) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
};

const collectFieldCandidates = async (page) => {
  return page.evaluate((query) => {
    const nodes = Array.from(document.querySelectorAll(query));
    const results = [];

    const getLabel = (el) => {
      const id = el.getAttribute('id');
      if (id) {
        const labelEl = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (labelEl?.innerText) return labelEl.innerText.trim();
      }
      const parentLabel = el.closest('label');
      if (parentLabel?.innerText) return parentLabel.innerText.trim();
      return '';
    };

    nodes.forEach((el, rawIndex) => {
      const tagName = el.tagName.toLowerCase();
      const type = el.getAttribute('type') || '';
      const role = el.getAttribute('role') || '';
      const isContentEditable = el.isContentEditable;
      if (tagName === 'input' && type === 'hidden') return;
      const inMain = el.closest('main, [role="main"]');
      if (!inMain) return;

      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const visible =
        (rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none') ||
        (tagName === 'input' && type === 'file');
      if (!visible) return;

      const disabled = el.disabled || el.getAttribute('aria-disabled') === 'true';
      const readOnly = el.readOnly || el.getAttribute('aria-readonly') === 'true';
      const name = el.getAttribute('name') || '';
      const id = el.getAttribute('id') || '';
      const ariaLabel = el.getAttribute('aria-label') || '';
      const placeholder = el.getAttribute('placeholder') || '';
      const label = getLabel(el);

      const combined = `${label} ${ariaLabel} ${placeholder} ${name}`.toLowerCase();
      if (combined.includes('search')) return;

      results.push({
        rawIndex,
        tagName,
        type,
        role,
        isContentEditable,
        disabled,
        readOnly,
        name,
        id,
        ariaLabel,
        placeholder,
        label,
      });
    });

    return results;
  }, FIELD_QUERY);
};

const getFieldLocator = (page, field) => page.locator(FIELD_QUERY).nth(field.rawIndex);

const resolvePublicFilePath = (assetPath) => {
  if (!assetPath || typeof assetPath !== 'string') return null;
  const cleaned = assetPath.replace(/^\/+/, '');
  return path.join(process.cwd(), 'public', cleaned);
};

const getFileFieldAssetPath = async (locator) => {
  return locator.evaluate((el) => {
    const root =
      el.closest('[data-ks-field]') ||
      el.closest('[role="group"]') ||
      el.closest('fieldset') ||
      el.parentElement;
    const text = root?.innerText || '';
    const match = text.match(/\/(?:images|videos|uploads|files)\/[^\s)]+/i);
    return match ? match[0] : '';
  });
};

const openComboboxListbox = async (page, locator) => {
  const listbox = page.locator('[role="listbox"]').last();

  await locator.click({ force: true });
  if (await listbox.isVisible().catch(() => false)) {
    return listbox;
  }

  await locator.focus();
  await page.keyboard.press('ArrowDown');
  if (await listbox.isVisible().catch(() => false)) {
    return listbox;
  }

  const handle = await locator.evaluateHandle(
    (el) => el.closest('[aria-haspopup="listbox"]') || el.parentElement
  );
  const elementHandle = handle.asElement();
  if (elementHandle) {
    await elementHandle.click({ force: true });
  }

  await listbox.waitFor({ state: 'visible', timeout: 5000 });
  return listbox;
};

const chooseNextComboboxValue = async (page, locator, current) => {
  const listbox = await openComboboxListbox(page, locator);
  const options = listbox.locator('[role="option"]');
  const count = await options.count();
  const currentNorm = String(current || '').trim();

  for (let i = 0; i < count; i += 1) {
    const option = options.nth(i);
    const text = (await option.innerText()).trim();
    if (!text || text === currentNorm) continue;
    await option.click();
    return text;
  }

  throw new Error('No alternative combobox option found.');
};

const chooseNextSelectValue = async (locator, current) => {
  const options = locator.locator('option');
  const count = await options.count();
  const currentNorm = String(current || '').trim();

  for (let i = 0; i < count; i += 1) {
    const option = options.nth(i);
    const value = (await option.getAttribute('value')) || '';
    const label = (await option.innerText()).trim();
    const candidate = value || label;
    if (!candidate || candidate === currentNorm) continue;
    await locator.selectOption(value || label);
    return candidate;
  }

  throw new Error('No alternative select option found.');
};

const readFieldValue = async (locator, field) => {
  if (field.tagName === 'input' && field.type === 'checkbox') {
    return locator.isChecked();
  }

  if (field.tagName === 'input' && field.type === 'file') {
    return getFileFieldAssetPath(locator);
  }

  if (field.isContentEditable) {
    return locator.evaluate((el) => el.innerText || '');
  }

  return locator.inputValue();
};

const applyFieldValue = async (page, locator, field, target) => {
  await locator.scrollIntoViewIfNeeded().catch(() => {});

  if (field.tagName === 'input' && field.type === 'checkbox') {
    const current = await locator.isChecked();
    if (current !== target) {
      await locator.click({ force: true });
    }
    return;
  }

  if (field.tagName === 'input' && field.type === 'file') {
    if (!target) {
      await locator.setInputFiles([]);
      return;
    }
    await locator.setInputFiles(target);
    return;
  }

  if (field.role === 'combobox') {
    await chooseNextComboboxValue(page, locator, target);
    return;
  }

  if (field.tagName === 'select') {
    await chooseNextSelectValue(locator, target);
    return;
  }

  if (field.isContentEditable) {
    await locator.click({ force: true });
    await page.keyboard.press('Control+A');
    await page.keyboard.type(String(target ?? ''));
    return;
  }

  await locator.fill(String(target ?? ''));
};

const mutateTextValue = (value) => {
  const suffix = ' QA';
  const cleaned = String(value || '').trim();
  if (!cleaned) return 'QA';
  if (cleaned.endsWith(suffix)) return cleaned.replace(/ QA$/, '');
  return `${cleaned}${suffix}`;
};

const mutateFieldValue = async (page, locator, field) => {
  const original = await readFieldValue(locator, field);

  if (field.disabled || field.readOnly) {
    return { skipped: true, reason: 'disabled or readonly', original };
  }

  if (field.tagName === 'input' && field.type === 'checkbox') {
    await applyFieldValue(page, locator, field, !original);
    return { original, mutated: !original };
  }

  if (field.tagName === 'input' && field.type === 'file') {
    const existingPath = original;
    const localPath = resolvePublicFilePath(existingPath) || QA_UPLOAD_FILE;
    if (!localPath || !fs.existsSync(localPath)) {
      return { skipped: true, reason: 'file not found', original };
    }
    await applyFieldValue(page, locator, field, localPath);
    const updated = await readFieldValue(locator, field);
    return {
      original,
      mutated: updated,
      originalLocalPath: resolvePublicFilePath(original),
    };
  }

  if (field.role === 'combobox') {
    const updated = await chooseNextComboboxValue(page, locator, original);
    return { original, mutated: updated };
  }

  if (field.tagName === 'select') {
    const updated = await chooseNextSelectValue(locator, original);
    return { original, mutated: updated };
  }

  if (field.isContentEditable) {
    const mutated = mutateTextValue(original);
    await applyFieldValue(page, locator, field, mutated);
    return { original, mutated };
  }

  const mutated = mutateTextValue(original);
  await applyFieldValue(page, locator, field, mutated);
  return { original, mutated };
};

const commitIfPossible = async (page, message) => {
  const saveButton = page.getByRole('button', { name: /save|commit/i }).first();
  await saveButton.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  if (!(await saveButton.isVisible().catch(() => false))) {
    const fallbackButton = page.locator('button:has-text("Save"), button:has-text("Commit")').first();
    await fallbackButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (!(await fallbackButton.isVisible().catch(() => false))) {
      throw new Error('Save button not found.');
    }
    await fallbackButton.click();
  } else {
    await saveButton.click();
  }

  const commitInput = page.getByLabel(/commit message/i);
  if (await commitInput.isVisible().catch(() => false)) {
    await commitInput.fill(message);
    const commitButton = page.getByRole('button', { name: /commit|save/i }).first();
    await commitButton.click();
    await commitInput.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  await page.waitForTimeout(6000);
};

const main = async () => {
  ensureDir(OUTPUT_DIR);
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const existingContext = browser.contexts()[0] || null;
  const context = existingContext || (await browser.newContext());
  const page = await context.newPage();

  try {
    const url = `${CMS_BASE.replace(/\/$/, '')}${PAGE_PATH}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    await page.waitForTimeout(1500);

    const loginButton = page
      .getByRole('button', { name: /sign in|log in|login|github/i })
      .first();
    const loginLink = page
      .getByRole('link', { name: /sign in|log in|login|github/i })
      .first();
    const needsLogin =
      (await loginButton.isVisible().catch(() => false)) ||
      (await loginLink.isVisible().catch(() => false));
    if (needsLogin) {
      throw new Error('CMS login required.');
    }

    const candidates = await collectFieldCandidates(page);
    const rangeEnd = FIELD_COUNT > 0 ? FIELD_START + FIELD_COUNT : candidates.length;
    const selection = candidates.slice(FIELD_START, rangeEnd);

    const state = readState();
    const pageKey = `${PAGE_NAME}:${PAGE_PATH}`;

    if (MODE === 'edit') {
      const fields = [];

      for (const field of selection) {
        const locator = getFieldLocator(page, field);
        const result = await mutateFieldValue(page, locator, field);
        if (result.skipped) {
          fields.push({
            ...field,
            skipped: true,
            reason: result.reason,
            original: result.original,
            mutated: result.original,
          });
          continue;
        }
        fields.push({
          ...field,
          original: result.original,
          mutated: result.mutated,
          originalLocalPath: result.originalLocalPath || null,
        });
      }

      const message = `QA batch edit: ${sanitizeLabel(PAGE_NAME)} fields ${FIELD_START}-${rangeEnd - 1}`;
      await commitIfPossible(page, message);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: TIMEOUT });
      await page.waitForTimeout(1500);

      const verifyFailures = [];
      for (const field of fields) {
        if (field.skipped) continue;
        const locator = getFieldLocator(page, field);
        const value = await readFieldValue(locator, field);
        if (String(value) !== String(field.mutated)) {
          verifyFailures.push({
            label: field.label || field.name || field.placeholder || field.tagName,
            expected: field.mutated,
            actual: value,
          });
        }
      }

      state.pages[pageKey] = {
        url,
        pageName: PAGE_NAME,
        fieldStart: FIELD_START,
        fieldCount: selection.length,
        fields,
        lastMode: 'edit',
        verifyFailures,
        updatedAt: new Date().toISOString(),
      };
      writeState(state);

      if (verifyFailures.length > 0) {
        console.log('Verification failures:', verifyFailures);
      } else {
        console.log('Batch edit verification passed.');
      }
    } else if (MODE === 'revert') {
      const pageState = state.pages[pageKey];
      if (!pageState) {
        throw new Error(`No saved batch state for ${pageKey}`);
      }

      for (const field of pageState.fields) {
        if (field.skipped) continue;
        const locator = getFieldLocator(page, field);
        if (field.tagName === 'input' && field.type === 'file') {
          if (field.original) {
            const localPath = resolvePublicFilePath(field.original) || field.originalLocalPath;
            if (localPath && fs.existsSync(localPath)) {
              await applyFieldValue(page, locator, field, localPath);
            } else {
              await applyFieldValue(page, locator, field, null);
            }
          } else {
            await applyFieldValue(page, locator, field, null);
          }
        } else if (field.role === 'combobox' || field.tagName === 'select') {
          await applyFieldValue(page, locator, field, field.original);
        } else {
          await applyFieldValue(page, locator, field, field.original);
        }
      }

      const message = `QA batch revert: ${sanitizeLabel(PAGE_NAME)} fields ${pageState.fieldStart}-${pageState.fieldStart + pageState.fieldCount - 1}`;
      await commitIfPossible(page, message);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: TIMEOUT });
      await page.waitForTimeout(1500);

      const verifyFailures = [];
      for (const field of pageState.fields) {
        if (field.skipped) continue;
        const locator = getFieldLocator(page, field);
        const value = await readFieldValue(locator, field);
        if (String(value) !== String(field.original)) {
          verifyFailures.push({
            label: field.label || field.name || field.placeholder || field.tagName,
            expected: field.original,
            actual: value,
          });
        }
      }

      pageState.lastMode = 'revert';
      pageState.verifyFailures = verifyFailures;
      pageState.updatedAt = new Date().toISOString();
      writeState(state);

      if (verifyFailures.length > 0) {
        console.log('Revert verification failures:', verifyFailures);
      } else {
        console.log('Batch revert verification passed.');
      }
    } else {
      throw new Error(`Unknown CMS_QA_BATCH_MODE: ${MODE}`);
    }
  } finally {
    await page.close().catch(() => {});
    if (!existingContext) {
      await context.close();
    }
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
