# Testing Patterns

**Analysis Date:** 2026-06-12

## Test Framework

**Runner:** None — no automated test framework is installed.

There are no `jest`, `vitest`, `playwright` (test runner config), or `cypress` dependencies in `package.json`. No `*.test.*` or `*.spec.*` files exist anywhere in the repository.

`playwright-core` is present as a devDependency but is used exclusively by the manual QA scripts in `scripts/` — it is not configured as a test runner and has no test suites.

**What runs on `npm run build`:**
```bash
astro check && astro build
```
`astro check` runs TypeScript type checking across all `.astro`, `.ts`, and `.tsx` files. Build failure = type error. This is the only automated correctness gate integrated into the normal development workflow.

## Pre-Commit Hooks (the primary automated safety layer)

Husky manages pre-commit hooks. Config: `.husky/pre-commit`

**Hook execution order (all three must pass for a commit to succeed):**

```bash
# 1. Custom secret scanner
python3 scripts/check_secrets.py --staged-only

# 2. gitleaks (must be installed: brew install gitleaks)
gitleaks protect --staged --redact --no-banner

# 3. Full TypeScript + build check
npm run build
```

**Implications for development:**
- Every commit runs a full Astro production build (~30-60 seconds on typical hardware)
- TypeScript errors block commits — the build gate catches type regressions
- Two overlapping secret scanners provide defense-in-depth
- `npm run build` runs `astro check && astro build`, so component prop type mismatches are caught before any code reaches the branch

## Secret Detection Script

**Location:** `scripts/check_secrets.py`

**Run modes:**
```bash
python scripts/check_secrets.py                   # Scan all tracked files
python scripts/check_secrets.py --staged-only     # Pre-commit: staged files only
python scripts/check_secrets.py --file path/to/f  # Scan specific file
python scripts/check_secrets.py --history         # Scan full git history
```

**Detected secret types:**
| Pattern | Type |
|---------|------|
| `AIza[A-Za-z0-9_-]{35}` | Google API Key |
| `AKIA[A-Z0-9]{16}` | AWS Access Key |
| `gh[pousr]_[A-Za-z0-9_]{36,}` | GitHub Token |
| `xox[baprs]-[A-Za-z0-9-]{10,}` | Slack Token |
| `-----BEGIN ... PRIVATE KEY-----` | Private Key |
| Bearer token literals in quotes | Bearer Token |
| Hardcoded `api_key=` or `password=` with quoted values | Various |

**False positive management:** Add entries to `FALSE_POSITIVES` list in `scripts/check_secrets.py`.

**Known history finding:** A Google API key was committed in commit `ec94fcf6` and subsequently revoked. The key remains in git history; `--history` scan will report it as expected.

## Manual QA Scripts

These scripts use `playwright-core` to drive a headless Chrome browser. They require the dev server or a target URL to be running first.

### brand-qa.mjs

**Location:** `scripts/brand-qa.mjs`

**Purpose:** Headless visual QA for the brand system — checks for console errors, network failures, and viewport-level rendering across 11 routes.

**Run:**
```bash
# Start dev server first
npm run dev

# Then in another terminal:
node scripts/brand-qa.mjs
# or with custom base:
BASE_URL=https://evolea-website.pages.dev node scripts/brand-qa.mjs
```

**Routes tested:** `/`, `/en/`, `/brand/`, `/en/brand/`, `/spenden/`, `/en/donate/`, `/angebote/`, `/ueber-uns/`, `/team/`, `/kontakt/`, `/blog/`

**Viewports tested:** 1440x900 (desktop), 375x812 (mobile)

**What it checks:**
- Console errors and warnings per route
- Failed network requests per route
- Screenshots saved to `/tmp/brand-qa/`
- Hex copy interaction test on the brand page

### cms-qa.mjs

**Location:** `scripts/cms-qa.mjs`

**Purpose:** Drives the Keystatic CMS UI on the staging server — fills in form fields, takes screenshots, optionally commits changes. Used for bulk CMS content audits.

**Configuration (env vars):**
- `CMS_BASE` — Keystatic URL (default: `https://evolea-website.pages.dev/keystatic/branch/main`)
- `SITE_BASE` — Site URL for checking published content
- `OUTPUT_DIR` — Where to write `report.json` and screenshots

### cms-batch-qa.mjs

**Location:** `scripts/cms-batch-qa.mjs`

**Purpose:** Batch variant of `cms-qa.mjs` for high-volume field validation.

## Website Review Skill (Manual QA Workflow)

**Location:** `.claude/skills/website-review/`

The `SKILL.md` describes a 6-phase manual QA workflow using the Chrome DevTools MCP integration. It is not automated — it is a protocol for Claude Code to execute interactive browser tests on demand.

**Test cases defined in:** `.claude/skills/website-review/TESTING-MANUAL.md`

**Test categories:**
- VI (Visual Inspection): Screenshot capture at 3 viewports, DOM snapshot, image loading check
- CN (Console/Network): JavaScript error check, network request validation
- AC (Accessibility): Axe audit, keyboard navigation, skip links
- PF (Performance): Core Web Vitals via DevTools
- IT (Interactive): Form submission, mobile menu, language switcher, donation CTA

**To execute:** Start Chrome in debug mode (`scripts/chrome-debug.bat`), connect MCP, then invoke the skill protocol with Claude Code.

## CI/CD Build Check

**Location:** `.github/workflows/deploy.yml`

The GitHub Actions deploy workflow runs `npm run build` (with `GITHUB_PAGES=true`) as part of every push to `main`. Build failure blocks deployment. This is not a test suite — it is a build validation gate.

**What `npm run build` validates:**
- All TypeScript types across `.astro`, `.ts`, `.tsx` files
- All Astro component prop shapes
- All content collection schema conformance
- That the site produces a valid static build artifact

## Coverage

**Requirements:** None enforced — no coverage tooling installed.

## What Is NOT Tested

There is no automated testing for:
- Component rendering output (no snapshot tests)
- i18n translation completeness or key coverage
- Route existence (no link-crawling tests)
- Form submission behavior (Formspree integration is untested programmatically)
- CMS content schema conformance beyond Zod type checking
- Accessibility regressions (only checked manually via the website-review skill)
- Visual regression (brand-qa.mjs takes screenshots but does not diff them)
- The `routeMappings` table in `src/i18n/utils.ts` (critical bilingual routing logic, entirely untested)

## Adding Tests

If adding automated tests, the recommended approach given the existing toolchain:

1. **Install vitest** for unit testing TypeScript utilities (i18n utils, content helpers)
2. **Astro's container API** (`@astrojs/test-utils`) for component rendering tests
3. **Keep playwright-core** for E2E tests — it is already available as a devDependency; add a `playwright.config.ts` and write `.spec.ts` files

Priority candidates for first tests:
- `src/i18n/utils.ts` — `getLangFromUrl`, `getAlternatePath`, `routeMappings` lookups
- `src/content/config.ts` — Zod schema validation against sample fixtures
- `scripts/check_secrets.py` — Already has `SKIP_PATTERNS` for `test_*.py` files, indicating test files were anticipated

---

*Testing analysis: 2026-06-12*
