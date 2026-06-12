#!/usr/bin/env node
/**
 * public/_headers PARITY CHECKER (not a generator).
 *
 * Reads src/lib/security-headers.ts as TEXT (no TS loader — CI is Node 20),
 * regex-extracts the SECURITY_HEADERS key/value pairs and both
 * Content-Security-Policy-Report-Only string values, then asserts every one of
 * those lines appears verbatim in public/_headers. Also asserts the two
 * immutable Cache-Control rules (/assets, /fonts) are present.
 *
 * On any mismatch: prints a human-readable diff and exits 1 (fails the build,
 * and transitively the pre-commit hook, satisfying SEC-02's no-drift rule).
 * On full parity: prints one OK line and exits 0.
 *
 *   node scripts/gen-headers.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONSTANT_PATH = resolve(ROOT, 'src/lib/security-headers.ts');
const HEADERS_PATH = resolve(ROOT, 'public/_headers');

const constantSrc = readFileSync(CONSTANT_PATH, 'utf8');
const headersSrc = readFileSync(HEADERS_PATH, 'utf8');

const failures = [];

// --- 1. Extract SECURITY_HEADERS key:value pairs ---------------------------
// Match the object body between `SECURITY_HEADERS = {` and the closing `}`.
const secBlockMatch = constantSrc.match(/SECURITY_HEADERS\s*=\s*\{([\s\S]*?)\}\s*as const/);
if (!secBlockMatch) {
  console.error('PARITY FAIL: could not locate SECURITY_HEADERS object in security-headers.ts');
  process.exit(1);
}
const secBlock = secBlockMatch[1];
const pairRe = /'([^']+)'\s*:\s*'([^']*)'/g;
const securityHeaderLines = [];
let m;
while ((m = pairRe.exec(secBlock)) !== null) {
  securityHeaderLines.push(`${m[1]}: ${m[2]}`);
}
if (securityHeaderLines.length === 0) {
  console.error('PARITY FAIL: extracted zero SECURITY_HEADERS pairs');
  process.exit(1);
}

// --- 2. Extract the two CSP string values ----------------------------------
// Each CSP constant is a concatenation of single-quoted string fragments:
//   export const CSP_REPORT_ONLY = "..." + "..." + ...;
// Strip comments first so JSDoc lines don't pollute extraction.
function extractCsp(name) {
  // Capture from `export const NAME =` up to the next top-level `export`/EOF.
  // The CSP value is a `+`-concatenation of quoted fragments that themselves
  // contain `;`, so we must NOT terminate on the first `;` — instead grab the
  // whole assignment block and collect every quoted fragment within it.
  // NO 'm' flag: with 'm', the `$` in the lookahead matches the first
  // end-of-line and truncates extraction to `default-src 'self';` (CR-01).
  // Without it, `$` anchors to end-of-input only.
  const re = new RegExp(
    `export const ${name}\\s*=\\s*([\\s\\S]*?)(?=\\nexport const |\\n\\/\\*|$)`
  );
  const block = constantSrc.match(re);
  if (!block) return null;
  // Collect every quoted fragment (single or double quotes) and join.
  const fragRe = /(['"])((?:\\.|(?!\1).)*)\1/g;
  let frag;
  let out = '';
  while ((frag = fragRe.exec(block[1])) !== null) {
    out += frag[2];
  }
  return out.trim();
}

const cspSiteWide = extractCsp('CSP_REPORT_ONLY');
const cspKeystatic = extractCsp('CSP_REPORT_ONLY_KEYSTATIC');
if (!cspSiteWide || !cspKeystatic) {
  console.error('PARITY FAIL: could not extract CSP_REPORT_ONLY / CSP_REPORT_ONLY_KEYSTATIC values');
  process.exit(1);
}

// Sanity assertions: fail loudly if extraction ever regresses to a truncated
// prefix again (the CR-01 failure mode made the parity check vacuous).
for (const [label, csp] of [
  ['site-wide', cspSiteWide],
  ['keystatic', cspKeystatic],
]) {
  if (!csp.endsWith('report-uri /api/csp-report') || csp.length <= 200) {
    console.error(
      `PARITY FAIL: ${label} CSP extraction truncated (len=${csp.length}): "${csp}"`
    );
    process.exit(1);
  }
}
if (cspSiteWide === cspKeystatic) {
  console.error(
    'PARITY FAIL: site-wide and keystatic CSP extracted identically — extraction is broken'
  );
  process.exit(1);
}

// --- 3. Assert every value appears verbatim in public/_headers -------------
const expectedLines = [
  ...securityHeaderLines,
  `Content-Security-Policy-Report-Only: ${cspSiteWide}`,
  `Content-Security-Policy-Report-Only: ${cspKeystatic}`,
  'Cache-Control: public, max-age=31536000, immutable',
];

for (const line of expectedLines) {
  if (!headersSrc.includes(line)) {
    failures.push(line);
  }
}

// The immutable cache rule must appear exactly twice (/assets + /fonts).
const immutableCount = (
  headersSrc.match(/Cache-Control: public, max-age=31536000, immutable/g) || []
).length;
if (immutableCount !== 2) {
  failures.push(
    `Cache-Control immutable rule expected 2 occurrences (/assets/*, /fonts/*), found ${immutableCount}`
  );
}

if (failures.length > 0) {
  console.error('PARITY FAIL: public/_headers is out of sync with src/lib/security-headers.ts.');
  console.error('The following expected line(s) were missing or changed:');
  for (const f of failures) {
    console.error(`  - ${f}`);
  }
  console.error('\nFix: update public/_headers to match the constant (or vice versa) and re-run the build.');
  process.exit(1);
}

console.log('OK: public/_headers is in parity with src/lib/security-headers.ts');
process.exit(0);
