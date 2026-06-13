#!/usr/bin/env node
/**
 * public/_headers PARITY CHECKER (not a generator).
 *
 * Reads src/lib/security-headers.ts as TEXT (no TS loader — CI is Node 20),
 * regex-extracts the SECURITY_HEADERS key/value pairs and both
 * Content-Security-Policy-Report-Only string values, then parses
 * public/_headers into per-path-pattern blocks and asserts TWO-WAY parity:
 *   - every SECURITY_HEADERS pair appears with its exact value under /*;
 *   - the site-wide CSP sits under /* and the keystatic CSP under
 *     /keystatic/* specifically (swapped scopes fail);
 *   - /* carries no security header that is absent from the constant;
 *   - no ENFORCING Content-Security-Policy header exists anywhere;
 *   - /assets/* and /fonts/* carry the exact immutable Cache-Control rule.
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
const securityHeaderPairs = [];
let m;
while ((m = pairRe.exec(secBlock)) !== null) {
  securityHeaderPairs.push([m[1], m[2]]);
}
if (securityHeaderPairs.length === 0) {
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

// --- 3. Parse public/_headers into { pathPattern -> [[name, value], ...] } --
// Cloudflare _headers format: an unindented line is a path pattern; indented
// "Name: value" lines below it belong to that pattern's block.
const blocks = new Map();
let currentPath = null;
for (const rawLine of headersSrc.split('\n')) {
  const line = rawLine.trimEnd();
  if (line === '') continue;
  if (!/^\s/.test(line)) {
    currentPath = line.trim();
    if (!blocks.has(currentPath)) blocks.set(currentPath, []);
    continue;
  }
  const colon = line.indexOf(':');
  if (currentPath === null || colon === -1) {
    failures.push(`_headers: malformed line: "${line.trim()}"`);
    continue;
  }
  blocks
    .get(currentPath)
    .push([line.slice(0, colon).trim(), line.slice(colon + 1).trim()]);
}

function headerValue(pathPattern, name) {
  const entries = blocks.get(pathPattern) ?? [];
  const hit = entries.find(([n]) => n.toLowerCase() === name.toLowerCase());
  return hit ? hit[1] : null;
}

// --- 4. Two-way, path-scoped parity assertions ------------------------------
const CSP_RO = 'Content-Security-Policy-Report-Only';
const IMMUTABLE = 'public, max-age=31536000, immutable';

// 4a. Constant -> _headers: every SECURITY_HEADERS pair, exact value, under /*.
for (const [name, value] of securityHeaderPairs) {
  const actual = headerValue('/*', name);
  if (actual !== value) {
    failures.push(`/* ${name}: expected "${value}", found ${actual === null ? 'MISSING' : `"${actual}"`}`);
  }
}

// 4b. Each CSP must sit under its OWN path scope (swapped scopes must fail).
if (headerValue('/*', CSP_RO) !== cspSiteWide) {
  failures.push(`/* ${CSP_RO} does not exactly match CSP_REPORT_ONLY`);
}
if (headerValue('/keystatic/*', CSP_RO) !== cspKeystatic) {
  failures.push(`/keystatic/* ${CSP_RO} does not exactly match CSP_REPORT_ONLY_KEYSTATIC`);
}

// 4c. _headers -> constant: no extra/stale security headers under /*.
const allowedSiteWide = new Set(
  [...securityHeaderPairs.map(([name]) => name), CSP_RO].map((n) => n.toLowerCase())
);
for (const [name] of blocks.get('/*') ?? []) {
  if (!allowedSiteWide.has(name.toLowerCase())) {
    failures.push(`/* has header "${name}" that is absent from security-headers.ts — remove or add it to the constant`);
  }
}

// 4d. No ENFORCING Content-Security-Policy header anywhere (Report-Only phase).
for (const [pathPattern, entries] of blocks) {
  for (const [name] of entries) {
    if (name.toLowerCase() === 'content-security-policy') {
      failures.push(`${pathPattern} has an enforcing Content-Security-Policy header — only Report-Only is allowed in this phase`);
    }
  }
}

// 4e. Immutable cache rules on /assets/* and /fonts/* exactly.
for (const pathPattern of ['/assets/*', '/fonts/*']) {
  if (headerValue(pathPattern, 'Cache-Control') !== IMMUTABLE) {
    failures.push(`${pathPattern} Cache-Control: expected "${IMMUTABLE}"`);
  }
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
