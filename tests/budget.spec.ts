import { statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

/**
 * Homepage transfer budget guard.
 *
 * Measures over-the-wire weight via the Resource Timing API
 * (performance.getEntriesByType) rather than intercepting response bodies — the
 * latter races against late CDN responses ("response.body: Test ended") and is
 * fragile against production timing. `transferSize` is the real compressed wire
 * size (incl. response headers); the navigation entry covers the HTML document.
 *
 * Contract: desktop viewport, load event, no scroll (lazy images excluded). The
 * hero video (hero-mobile.mp4) is counted UNCONDITIONALLY at full on-disk size —
 * the homepage always references it (VideoHero default) and the browser only
 * range-requests it, so its transferSize would understate the real weight. Path
 * is matched by basename so the GitHub Pages base prefix does not break it.
 */

const HOMEPAGE_BUDGET_BYTES = 1_536_000;
const HERO_VIDEO_BASENAME = 'hero-mobile.mp4';
const HERO_VIDEO_DISK_BYTES = statSync(join(process.cwd(), 'public/videos/hero-mobile.mp4')).size;

interface ResourceEntry {
  url: string;
  type: string;
  bytes: number;
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
    .map((entry) => `  ${formatBytes(entry.bytes)} ${entry.type} ${entry.url}`);
  return ['Resource type breakdown:', ...typeLines, 'Largest resources:', ...largestLines].join('\n');
}

test('homepage stays under the 1.5 MB transfer budget', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  const response = await page.goto('/', { waitUntil: 'load' });
  expect(response?.status()).toBe(200);
  // Let any load-event-triggered resource requests settle into the timing buffer.
  await page.waitForLoadState('networkidle').catch(() => {});

  // Collect over-the-wire transfer sizes from the Resource Timing API. The
  // navigation entry is the HTML document; resource entries are everything else.
  const raw = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation') as PerformanceResourceTiming[];
    const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const pick = (e: PerformanceResourceTiming) => ({
      url: e.name,
      type: e.initiatorType || 'document',
      bytes: e.transferSize || 0,
    });
    return [...nav.map(pick), ...res.map(pick)];
  });

  const origin = new URL(page.url()).origin;
  const entries: ResourceEntry[] = [];
  for (const e of raw) {
    let pathname = e.url;
    try {
      const u = new URL(e.url);
      if (u.origin !== origin) continue; // same-origin only
      pathname = u.pathname;
    } catch {
      // relative/blank navigation name — keep as-is
    }
    // Hero video counted from disk below; skip its (ranged) timing entry.
    if (pathname.endsWith(`/${HERO_VIDEO_BASENAME}`) || pathname.endsWith(HERO_VIDEO_BASENAME)) continue;
    entries.push({ url: pathname, type: e.type, bytes: e.bytes });
  }

  // Count the hero video unconditionally at full on-disk weight (conservative).
  entries.push({ url: `/videos/${HERO_VIDEO_BASENAME}`, type: 'video', bytes: HERO_VIDEO_DISK_BYTES });

  const total = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  expect(
    total,
    `Homepage transfer budget exceeded: ${formatBytes(total)} > ${formatBytes(HOMEPAGE_BUDGET_BYTES)}\n${formatBreakdown(entries)}`
  ).toBeLessThanOrEqual(HOMEPAGE_BUDGET_BYTES);
});
