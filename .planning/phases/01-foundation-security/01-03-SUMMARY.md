---
phase: 01-foundation-security
plan: 03
subsystem: repo-hygiene
tags: [hygiene, assets, cleanup, dead-code]
requires: []
provides:
  - "tagesschule hero relocated to tracked public/images/programs/"
  - "public/images/generated/ untracked from HEAD (82MB blob no longer in index)"
  - "Final images/ and 4 superseded logo originals deleted"
  - "3 dead components removed"
affects:
  - src/pages/angebote/tagesschule/index.astro
  - src/pages/en/programs/day-school/index.astro
tech-stack:
  added: []
  patterns:
    - "git rm --cached for files already gitignored-but-tracked (HEAD-only untrack, no history rewrite)"
key-files:
  created:
    - public/images/programs/tagesschule-hero.png
  modified:
    - src/pages/angebote/tagesschule/index.astro
    - src/pages/en/programs/day-school/index.astro
  deleted:
    - "public/images/generated/ (26 files, --cached only; disk copies retained)"
    - "public/images/Final images/ (8 files)"
    - "public/images/logo/Evolea Logo.png"
    - "public/images/logo/Evolea New Logo.png"
    - "public/images/logo/evolea-logo-original.png"
    - "public/images/logo/evolea-logo.png"
    - src/components/AngeboteSection.astro
    - src/components/TimelineActivities.astro
    - src/components/ProgramCardEnhanced.astro
decisions:
  - "Used cp (not git mv) to relocate the hero out of the gitignored generated/ dir so the new file lands as a fresh tracked addition in programs/"
  - "git rm --cached only for generated/ (HEAD untrack); disk copies left intact since they are still gitignored — confirmed by post-commit test -f on the hero"
  - "History rewrite explicitly out of scope per CONTEXT.md; the 82MB blob remains in git history, only removed from HEAD"
requirements: [HYG-01, HYG-02, HYG-03]
metrics:
  duration: ~2min
  completed: 2026-06-12
  tasks: 2
  files-changed: 41
---

# Phase 01 Plan 03: Repo Hygiene Cleanup Summary

Relocated the tagesschule hero into the tracked `public/images/programs/` directory and repointed both DE and EN wrappers at it, then untracked the 82MB gitignored-but-committed `public/images/generated/` from HEAD and deleted the unreferenced `Final images/`, four superseded logo originals, and three dead components — all grep-gated, with both Cloudflare and GitHub Pages builds staying green.

## What Was Built

**Task 1 — Hero relocation (HYG-01):** Copied `public/images/generated/tagesschule-hero.png` to `public/images/programs/tagesschule-hero.png` (fresh tracked add via `cp`, not `git mv` from an ignored path). Changed only the `heroImage` fallback string in both byte-identical wrappers (`src/pages/angebote/tagesschule/index.astro` and `src/pages/en/programs/day-school/index.astro`) from `/images/generated/tagesschule-hero.png` to `/images/programs/tagesschule-hero.png`. The CMS-override branch (`siteImages?.programmeHeroes?.tagesschule`) was left untouched, and `src/content/settings/images.json` was not modified (verified zero diff; the tagesschule override is `null` so the fallback is what renders).

**Task 2 — Cleanup (HYG-02 + HYG-03):** Re-ran defense-in-depth greps confirming zero external references, then:
- `git rm -r --cached public/images/generated/` — 26 files removed from HEAD; disk copies retained (still gitignored, hero confirmed present after commit).
- `git rm -r "public/images/Final images/"` — 8 files deleted (disk + index).
- `git rm` four superseded logo originals; kept `evolea-logo-new.png`, `evolea-logo-circle.png`, and both butterfly SVGs.
- `git rm` three dead components (`AngeboteSection.astro`, `TimelineActivities.astro`, `ProgramCardEnhanced.astro`).

## Verification Results

- `git ls-files public/images/generated/` → 0 (untracked from HEAD)
- `public/images/generated/tagesschule-hero.png` → still present on disk after the cleanup commit
- `git ls-files "public/images/Final images/"` → 0
- 3 dead components → all return "No such file"
- `git ls-files public/images/logo/` → exactly the 4 keep-list files (`evolea-butterfly-white.svg`, `evolea-butterfly.svg`, `evolea-logo-circle.png`, `evolea-logo-new.png`)
- `grep -rc "/images/generated/tagesschule-hero.png" src/` → 0; both wrappers reference `/images/programs/tagesschule-hero.png` (1 each)
- `npm run build` → exit 0 (56 pages)
- `GITHUB_PAGES=true npm run build` → exit 0 (56 pages)

## Grep Safety Note

The only matches for `AngeboteSection` and `TimelineActivities` in `src/` were self-references inside each component's own docblock comment (the file being deleted). No external imports or usages exist anywhere in `src/`. `ProgramCardEnhanced` had zero matches at all. The live programs grid component is `AngeboteSectionV3.astro` (kept). All four logo-original basenames and the `Final images` path returned zero references in `src/` and `src/content`.

## Deviations from Plan

None - plan executed exactly as written.

## Commits

- `cfdb198` fix(01-03): relocate tagesschule hero to public/images/programs/
- `b9a450b` chore(01-03): untrack generated/, delete Final images, logo originals, dead components

## Known Stubs

None.

## Self-Check: PASSED

- `public/images/programs/tagesschule-hero.png` — tracked (FOUND)
- `.planning/phases/01-foundation-security/01-03-SUMMARY.md` — exists (FOUND)
- Commits cfdb198, b9a450b, 51d8146 — all present in git log (FOUND)
