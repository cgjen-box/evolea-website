import { statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Response } from '@playwright/test';

/**
 * Homepage transfer budget guard.
 *
 * Mirrors the Phase 03 measurement contract: desktop viewport, load event,
 * no scroll, lazy images excluded, and hero-mobile.mp4 counted at full on-disk
 * size. The homepage always references the hero video (VideoHero default), so it
 * is counted UNCONDITIONALLY at disk size rather than gated on an autoplay request
 * whose timing/range is environment-dependent (WR-05). The path is matched by
 * basename so the GitHub Pages base prefix does not break the match.
 */

const HOMEPAGE_BUDGET_BYTES = 1_536_000;
const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:8788';
const BASE_ORIGIN = new URL(BASE_URL).origin;
const HERO_VIDEO_BASENAME = 'hero-mobile.mp4';
const HERO_VIDEO_DISK_BYTES = statSync(join(process.cwd(), 'public/videos/hero-mobile.mp4')).size;

interface ResourceEntry {
  url: string;
  type: string;
  bytes: number;
  source: 'content-length' | 'body' | 'disk';
}

function sameOrigin(url: string): boolean {
  try {
    return new URL(url).origin === BASE_ORIGIN;
  } catch {
    return false;
  }
}

function isHeroVideo(pathname: string): boolean {
  return pathname.endsWith(`/${HERO_VIDEO_BASENAME}`) || pathname.endsWith(HERO_VIDEO_BASENAME);
}

async function responseBytes(response: Response): Promise<{ bytes: number; source: ResourceEntry['source'] }> {
  // A 206 Partial Content carries only the requested byte range, so its
  // content-length is the chunk size, not the asset size — fall back to the
  // actual body length in that case so the budget is not silently under-counted
  // (WR-04).
  const contentLength = response.headers()['content-length'];
  if (response.status() !== 206 && contentLength) {
    const parsed = Number(contentLength);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return { bytes: parsed, source: 'content-length' };
    }
  }

  const body = await response.body();
  return { bytes: body.byteLength, source: 'body' };
}

function formatBytes(bytes: number): string {
  return `${bytes.toLocaleString('en-US')} B`;
}

function formatBreakdown(entries: ResourceEntry[]): string {
  const byType = new Map<string, number>();
  for (const entry of entries) {
    byType.set(entry.type, (byType.get(entry.type) ?? 0) + entry.bytes);
  }
  const typeLines = [...byType.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, bytes]) => `  ${type}: ${formatBytes(bytes)}`);
  const largestLines = [...entries]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8)
    .map((entry) => `  ${formatBytes(entry.bytes)} ${entry.type} ${entry.url} (${entry.source})`);
  return [
    'Resource type breakdown:',
    ...typeLines,
    'Largest resources:',
    ...largestLines,
  ].join('\n');
}

test('homepage stays under the 1.5 MB transfer budget', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  const entries: ResourceEntry[] = [];
  const pending: Promise<void>[] = [];

  page.on('response', (response) => {
    if (!sameOrigin(response.url())) return;
    const url = new URL(response.url());
    // Hero video is counted at full disk size below (conservative, range-proof),
    // so skip any actual (possibly ranged) video responses to avoid double counting.
    if (isHeroVideo(url.pathname)) return;

    pending.push((async () => {
      const { bytes, source } = await responseBytes(response);
      entries.push({
        url: url.pathname,
        type: response.request().resourceType(),
        bytes,
        source,
      });
    })());
  });

  const response = await page.goto('/', { waitUntil: 'load' });
  expect(response?.status()).toBe(200);
  await Promise.all(pending);

  // Count the hero video unconditionally at full on-disk weight — the homepage
  // always references it, and counting the full file is the conservative budget.
  entries.push({
    url: `/videos/${HERO_VIDEO_BASENAME}`,
    type: 'video',
    bytes: HERO_VIDEO_DISK_BYTES,
    source: 'disk',
  });

  const total = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  expect(
    total,
    `Homepage transfer budget exceeded: ${formatBytes(total)} > ${formatBytes(HOMEPAGE_BUDGET_BYTES)}\n${formatBreakdown(entries)}`
  ).toBeLessThanOrEqual(HOMEPAGE_BUDGET_BYTES);
});
