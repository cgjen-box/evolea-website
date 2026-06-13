#!/usr/bin/env node
/**
 * REFERENCED-IMAGE → WebP REFERENCE GATE + OPT-IN CONVERTER.
 *
 * Default mode is the safe, re-runnable reference gate for the current repo
 * state, where original PNG/JPG sources have already been deleted. Regeneration
 * from restored originals is explicit via --from-originals.
 *
 * --from-originals converts every team / program-hero / inner-page-hero / blog /
 * logo / about image that is actually referenced from src/ into a display-size
 * WebP, IN PLACE (locked decision: no src/assets migration).
 *
 * The manifest is an EXPLICIT array of { src, width } — NEVER glob
 * public/images/**, because that directory also holds ~6MB of verified orphans
 * (projects.jpg, sports.png, school.jpg, garden.jpg, tagesschule.jpg,
 * hero-main.jpg, homepage-hero.png — all unreferenced, out of scope, left
 * untouched) plus the untracked generated/ dir and og-default.jpg (kept as
 * JPEG for social scrapers).
 *
 * sharp 0.34.x is already resolved in node_modules via Astro — no install.
 * All referenced sources are sRGB already (verified); the script flags any
 * non-sRGB output as a failure. Logo PNGs carry alpha (4 channels) — WebP
 * preserves it natively.
 *
 * Modes:
 *   node scripts/convert-images.mjs                  # two-way grep gate only
 *   node scripts/convert-images.mjs --verify         # same, backwards compatible
 *   node scripts/convert-images.mjs --from-originals # convert restored originals + self-verify
 *
 * --from-originals self-verifies after conversion: each output exists, is
 * byte-smaller than its source, and sharp metadata reports space:'srgb'.
 *
 * --verify (two-way reference gate, re-runnable after the reference flip):
 *   Gate A — no dangling old-extension refs in src/ outside the allowlist.
 *   Gate B — every manifest .webp output is referenced at least once from src/.
 *
 * Exit 1 on any failure (human-readable diff); exit 0 with one OK line.
 *
 * EXCLUSIONS (never converted, never deleted by this pipeline):
 *   - public/images/og-default.jpg          (og:image — social scraper compat)
 *   - apple-touch-icon.png / favicon.svg / qr-code.svg  (icons)
 *   - *.svg butterfly logo variants          (vector)
 *   - already-webp: blog/buchtipp-anders-nicht-falsch.webp, blog/spektrum-kreis.webp
 *   - public/images/generated/ (untracked), public/videos/
 *   - unreferenced orphans: projects.jpg, sports.png, school.jpg, garden.jpg,
 *     tagesschule.jpg, hero-main.jpg, homepage-hero.png, logo/evolea-logo-circle
 *     (circle IS converted — it is referenced from BrandPageBody)
 */
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename } from 'node:path';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Per-category display widths (RESEARCH constants). withoutEnlargement keeps
// sources that are already smaller than the target untouched in dimension.
const TEAM = 800;
const HERO = 1200; // program heroes, inner-page heroes, blog, about
const POSTER = 1920;
const LOGO = 640;

const MANIFEST = [
  // Team portraits
  { src: 'public/images/team/annemarie-elias.png', width: TEAM },
  { src: 'public/images/team/christoph-jenny.png', width: TEAM },
  { src: 'public/images/team/gianna-spiess.png', width: TEAM },
  { src: 'public/images/team/alexandra-aleksic.jpg', width: TEAM },
  // Program heroes
  { src: 'public/images/programs/mini-garten-hero.png', width: HERO },
  { src: 'public/images/programs/mini-projekte-hero.png', width: HERO },
  { src: 'public/images/programs/mini-turnen-hero.png', width: HERO },
  { src: 'public/images/programs/mini-museum-hero.png', width: HERO },
  { src: 'public/images/programs/mini-abenteuercamp-hero.png', width: HERO },
  { src: 'public/images/programs/tagesschule-hero.png', width: HERO },
  // Inner-page / hero illustrations
  { src: 'public/images/hero/evolea-schloss.png', width: HERO },
  { src: 'public/images/hero/evolea-cafe-hero.png', width: HERO },
  { src: 'public/images/hero/kind-schmetterlinge.png', width: HERO },
  // Posters
  { src: 'public/images/hero-poster.jpg', width: POSTER },
  { src: 'public/images/mini-restaurant-poster.jpg', width: POSTER },
  // Blog featured images
  { src: 'public/images/blog/cafe-evolea.png', width: HERO },
  { src: 'public/images/blog/exekutive-funktionen.png', width: HERO },
  { src: 'public/images/blog/mini-projekte.png', width: HERO },
  { src: 'public/images/blog/soziale-kompetenzen.png', width: HERO },
  { src: 'public/images/blog/belohnung-erziehung.jpg', width: HERO },
  { src: 'public/images/blog/kommunikation-verbessern.jpg', width: HERO },
  { src: 'public/images/blog/verein-gruendung.jpg', width: HERO },
  { src: 'public/images/blog/vorsprachliche-fertigkeiten.jpg', width: HERO },
  // About
  { src: 'public/images/about/mission/bild.jpg', width: HERO },
  { src: 'public/images/about/children-playing-2.jpg', width: HERO }, // becomes the ueber-uns/about fallback target
  // Logos (alpha preserved; brand download page references both)
  { src: 'public/images/logo/evolea-logo-new.png', width: LOGO },
  { src: 'public/images/logo/evolea-logo-circle.png', width: 1024 }, // square avatar/social asset, kept at native 1024
];

const toWebp = (src) => src.replace(/\.(png|jpe?g)$/i, '.webp');

// --- conversion -------------------------------------------------------------
async function convert() {
  const failures = [];
  for (const { src, width } of MANIFEST) {
    const absSrc = resolve(ROOT, src);
    const absOut = resolve(ROOT, toWebp(src));
    try {
      const srcStat = await stat(absSrc);

      // Logo discretion (RESEARCH OQ3): the wordmark sparkle gradients compress
      // poorly; try q82 first, fall back to q75 if it blows past 60KB, keep
      // whichever is smaller while staying clean at 2x header size.
      const isWordmark = basename(src) === 'evolea-logo-new.png';
      let quality = 82;
      await sharp(absSrc).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(absOut);
      if (isWordmark) {
        let outStat = await stat(absOut);
        if (outStat.size > 60 * 1024) {
          await sharp(absSrc).resize({ width, withoutEnlargement: true }).webp({ quality: 75 }).toFile(absOut);
          const retryStat = await stat(absOut);
          if (retryStat.size <= outStat.size) {
            quality = 75;
          } else {
            // q82 was already smaller — re-emit it
            await sharp(absSrc).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(absOut);
          }
        }
      }

      const outStat = await stat(absOut);
      const meta = await sharp(absOut).metadata();
      if (outStat.size >= srcStat.size) {
        failures.push(`${toWebp(src)} (${outStat.size}B) is not smaller than source ${src} (${srcStat.size}B)`);
      }
      if (meta.space !== 'srgb') {
        failures.push(`${toWebp(src)} color space is "${meta.space}", expected "srgb"`);
      }
      console.log(
        `  ${src} (${(srcStat.size / 1024).toFixed(0)}KB) -> ${toWebp(src)} ` +
          `(${(outStat.size / 1024).toFixed(0)}KB, q${quality}, ${meta.width}x${meta.height}, ${meta.channels}ch ${meta.space})`,
      );
    } catch (err) {
      failures.push(`${src}: ${err.message}`);
    }
  }
  if (failures.length > 0) {
    console.error('\nCONVERT FAIL:');
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`OK: converted ${MANIFEST.length} images to WebP (originals retained for the reference-flip step)`);
}

// --- two-way reference gate (--verify) --------------------------------------
function verify() {
  const failures = [];

  // Gate A: no dangling old-extension image refs in src/ outside the allowlist.
  // Allowlist: og-default.jpg (Base default og:image) + apple-touch-icon.png.
  let danglingRaw = '';
  try {
    danglingRaw = execSync(
      `grep -rno "/images/[^\\"' )]*\\.\\(png\\|jpe\\?g\\)" src/ ` +
        `--include='*.astro' --include='*.ts' --include='*.json' --include='*.mdx'`,
      { cwd: ROOT, encoding: 'utf8' },
    );
  } catch (e) {
    // grep exits 1 when no matches — that is the clean state.
    danglingRaw = e.stdout ? e.stdout.toString() : '';
  }
  const ALLOWLIST = [/\/images\/og-default\.jpg/, /apple-touch-icon\.png/];
  for (const line of danglingRaw.split('\n').filter(Boolean)) {
    if (!ALLOWLIST.some((re) => re.test(line))) {
      failures.push(`Gate A — dangling old-extension image ref: ${line}`);
    }
  }

  // Gate B: every manifest .webp output is referenced at least once from src/.
  for (const { src } of MANIFEST) {
    const name = basename(toWebp(src));
    try {
      execSync(`grep -rq "${name.replace(/[.]/g, '\\.')}" src/`, { cwd: ROOT });
    } catch {
      failures.push(`Gate B — orphan webp (no src/ reference): ${name}`);
    }
  }

  if (failures.length > 0) {
    console.error('VERIFY FAIL: image-reference gate is out of sync.');
    for (const f of failures) console.error(`  - ${f}`);
    console.error('\nFix: flip the dangling reference to .webp, or reference/remove the orphan webp.');
    process.exit(1);
  }
  console.log(`OK: two-way image-reference gate clean (Gate A: no dangling refs; Gate B: all ${MANIFEST.length} webp referenced)`);
  process.exit(0);
}

if (process.argv.includes('--from-originals')) {
  await convert();
  process.exit(0);
}

if (process.argv.includes('--verify') || process.argv.length === 2) {
  verify();
}

console.error('Unknown option. Use no args, --verify, or --from-originals.');
process.exit(1);
