---
phase: 01-foundation-security
reviewed: 2026-06-12T14:46:37Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - astro.config.mjs
  - package.json
  - public/_headers
  - scripts/gen-headers.mjs
  - src/components/FontFaces.astro
  - src/layouts/Base.astro
  - src/lib/security-headers.ts
  - src/middleware.ts
  - src/pages/angebote/tagesschule/index.astro
  - src/pages/api/csp-report.ts
  - src/pages/en/programs/day-school/index.astro
findings:
  critical: 1
  warning: 5
  info: 7
  total: 13
status: fixed
fixed_at: 2026-06-12T16:57:00Z
---

# Phase 1: Code Review Report

**Reviewed:** 2026-06-12T14:46:37Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Reviewed the Phase 1 security-headers/fonts/hygiene implementation: middleware sequence() composition, the single-source-of-truth header constant plus parity checker, the CSP report sink, FontFaces, Base layout changes, and the new Tagesschule/Day School wrappers.

Verification performed (not just reading):
- Ran `node scripts/gen-headers.mjs` (passes today) and reproduced its extraction logic standalone — **the CSP parity check is broken** (CR-01, proven with a mutation test: a hostile `connect-src` rewrite in `security-headers.ts` passes the check).
- Ran the full static build (`npm run build`) — green; `__SSR_BUILD__` dual-build invariant holds; confirmed `/api/csp-report` emits no file in static output.
- Inspected built HTML — fonts and preloads are correctly base-prefixed, but `og:image` is **not** (proven 404 path on GitHub Pages).
- Parsed the Fredoka woff2 table directory — it is a **variable font** (`fvar`/`gvar`/`STAT`), so the byte-identical SemiBold/Bold files are legitimate (each `@font-face` instantiates its declared weight); explicitly NOT a finding.
- Confirmed `routeMappings` contains `/angebote/tagesschule/` ↔ `/en/programs/day-school/`.

The middleware double-next()/body-consumption fix is correct (clone-before-read, original returned on failure, securityHeaders wraps outermost so headers land on the rebuilt Response). The headline problem is that the drift-prevention gate at the heart of SEC-02 verifies almost nothing.

## Narrative Findings (AI reviewer)

### Critical Issues

#### CR-01: CSP parity check silently verifies only `default-src 'self';` — header drift goes undetected

**File:** `scripts/gen-headers.mjs:59-62`
**Issue:** `extractCsp()` builds its regex with the `'m'` flag, so the `$` in the lookahead `(?=\nexport const |\n\/\*|$)` matches at the **first end-of-line**, not end-of-input. The lazy capture therefore stops after the first source line of each CSP constant. Empirically verified: both `CSP_REPORT_ONLY` and `CSP_REPORT_ONLY_KEYSTATIC` extract as exactly `default-src 'self';`. Because the assertion uses `headersSrc.includes(...)`, this prefix trivially matches both CSP lines in `public/_headers`. Consequences, all proven by a mutation test:
1. Any change to `script-src`, `form-action` (Formspree), `connect-src`, `frame-ancestors`, or `report-uri` in `src/lib/security-headers.ts` passes the "parity" check while `public/_headers` stays stale — the exact drift SEC-02 exists to prevent.
2. The site-wide vs. `/keystatic` CSP distinction collapses (both extract to the same string), so the keystatic-variant check is currently a no-op.
3. The middleware (SSR routes) and `_headers` (static routes) can serve **different policies** with a green build and a passing pre-commit hook.

**Fix:** Drop the `'m'` flag so `$` anchors to end-of-input only (verified to restore full extraction of both CSP strings, which then match `public/_headers` verbatim), and add sanity assertions so a future regression fails loudly:
```js
const re = new RegExp(
  `export const ${name}\\s*=\\s*([\\s\\S]*?)(?=\\nexport const |\\n\\/\\*|$)`
); // no 'm' flag — $ must mean end-of-file
```
```js
// After extraction:
for (const [label, csp] of [['site-wide', cspSiteWide], ['keystatic', cspKeystatic]]) {
  if (!csp.endsWith('report-uri /api/csp-report')) {
    console.error(`PARITY FAIL: ${label} CSP extraction truncated: "${csp}"`);
    process.exit(1);
  }
}
if (cspSiteWide === cspKeystatic) {
  console.error('PARITY FAIL: site-wide and keystatic CSP extracted identically — extraction is broken');
  process.exit(1);
}
```

### Warnings

#### WR-01: /api/csp-report reads attacker-controlled bodies into memory with no size cap

**File:** `src/pages/api/csp-report.ts:22-27`
**Issue:** `await request.text()` buffers the entire POST body into a string before discarding it. The endpoint is unauthenticated, unrated-limited, and reachable by anyone; Cloudflare permits request bodies up to the plan limit (100 MB on Free), while a Workers isolate has a 128 MB memory ceiling. An attacker can POST large bodies in parallel to drive isolate memory pressure/evictions. Draining via full-buffer read is unnecessary — the payload is intentionally discarded.
**Fix:** Cancel the stream instead of buffering it:
```ts
export const POST: APIRoute = async ({ request }) => {
  try {
    await request.body?.cancel();
  } catch {
    // ignore — response is 204 regardless
  }
  return new Response(null, { status: 204 });
};
```

#### WR-02: Rebuilt /keystatic response copies stale `Content-Length` header

**File:** `src/middleware.ts:140-144`
**Issue:** `new Response(modifiedHtml, { headers: new Headers(response.headers) })` copies all upstream headers onto a body that just grew by ~3 KB of injected script. If the upstream response carried `Content-Length` (Node-based dev/preview servers honor an explicit header), the client truncates the response at the original length — cutting off the injected script or mis-framing the document. Cloudflare Workers recomputes the length for fixed strings, so production is likely unaffected, but the dev-path behavior is incorrect and masks the very feature being injected.
**Fix:**
```ts
const headers = new Headers(response.headers);
headers.delete('content-length'); // body length changed; let the runtime recompute
return new Response(modifiedHtml, {
  status: response.status,
  statusText: response.statusText,
  headers,
});
```

#### WR-03: `og:image` / `twitter:image` URLs missing base path — 404 on GitHub Pages build

**File:** `src/layouts/Base.astro:63,71` (default at line 22)
**Issue:** `new URL(image, Astro.site)` ignores the configured base. Proven in the built output: `dist/index.html` contains `og:image content="https://cgjen-box.github.io/images/og-default.jpg"`, but the asset lives at `/evolea-website/images/og-default.jpg` on that deployment — the OG/Twitter image 404s on the GitHub Pages fallback. This violates the project's own base-URL invariant ("every file that constructs asset paths must use `import.meta.env.BASE_URL`"); the `base` constant is already computed two lines above but not applied here. Cloudflare production (base `/`) is unaffected.
**Fix:**
```astro
const ogImage = new URL(`${base}${image}`, Astro.site);
```
and use `{ogImage}` for both `og:image` and `twitter:image`.

#### WR-04: Parity check is one-way and path-scope-blind

**File:** `scripts/gen-headers.mjs:83-104`
**Issue:** Independent of CR-01, the checker only asserts that constant-derived lines appear *somewhere* in `public/_headers` via substring search. It cannot detect: (a) extra or stale headers left in `_headers` (e.g. an old *enforcing* `Content-Security-Policy` line, or a conflicting `X-Frame-Options: SAMEORIGIN` under some path block) — these would ship while the check stays green; (b) the two CSP lines being attached to the wrong path scopes (`/*` vs `/keystatic/*` swapped passes, since both lines merely need to exist anywhere in the file). So "drift" is only half-prevented even once CR-01 is fixed.
**Fix:** Parse `_headers` into `{ pathPattern -> headerName -> value }`, then assert: the site-wide CSP appears under `/*` and the keystatic CSP under `/keystatic/*` specifically; every header under `/*` is either in `SECURITY_HEADERS` or the CSP line (flag unknown extras); no `Content-Security-Policy` (enforcing) header exists anywhere.

#### WR-05: CSP report sink discards 100% of reports — the Report-Only rollout has no feedback signal

**File:** `src/pages/api/csp-report.ts:18-31` (contradicts `src/lib/security-headers.ts:37-40`)
**Issue:** `security-headers.ts` states the Report-Only policy exists "so the allowlist can be tightened safely over time" — but the sink intentionally never stores, logs, or counts anything. No violation data will ever exist, so the allowlist can never be tightened based on evidence, and every browser on every page pays the cost of sending reports into a black hole. The log-injection concern motivating this is real but solvable without discarding everything.
**Fix:** After cancelling/limiting the body (WR-01), log a strictly sanitized, size-capped subset visible in Cloudflare Workers logs — e.g. parse JSON from a capped read (`(await request.text()).slice(0, 4096)`), extract only `violated-directive` and `blocked-uri`, strip to `[\w\-./:]` and truncate to 200 chars each, then `console.log('[csp-report]', directive, blockedUri)`. Alternatively switch to a managed `report-to` collector. If "pure sink" is genuinely the accepted trade-off for Phase 1, update the `security-headers.ts` comment to stop claiming report-driven tightening.

### Info

#### IN-01: Keystatic CSP docstring claims a superset; the value is not one

**File:** `src/lib/security-headers.ts:53-56`
**Issue:** The JSDoc says the keystatic variant allows GitHub saves "on top of the site-wide allowlist", but `connect-src` *replaces* `https://formspree.io` with `https://api.github.com` (lines 49 vs 65). Functionally fine (no Formspree forms under /keystatic), but the comment misdescribes the relationship and invites a wrong mental model during future edits.
**Fix:** Reword to "swaps connect-src formspree.io for api.github.com" or actually include both hosts.

#### IN-02: `/keystatic` prefix match also catches `/keystatic-anything`

**File:** `src/middleware.ts:100,120`
**Issue:** `pathname.startsWith('/keystatic')` matches unrelated paths like `/keystatic-foo`, giving them the looser CSP and the HTML-injection pass. Harmless today (no such routes), sloppy boundary.
**Fix:** `pathname === '/keystatic' || pathname.startsWith('/keystatic/')`.

#### IN-03: Dead clone+read and `innerHTML` sink in injected Keystatic script

**File:** `src/middleware.ts:56-58,31,62`
**Issue:** (a) `response.clone().text().then(function(text) {...})` — `text` is never used; the clone and read are dead code. (b) `toast.innerHTML = message` where line 62 concatenates `error.message` — an innerHTML sink with dynamic input. Today `error.message` is a browser-generated fetch error string and the page is the authenticated CMS admin, so exploitability is negligible, but it is an avoidable pattern.
**Fix:** Drop the dead clone/read; use `toast.textContent` plus a fixed `<strong>` prefix element, or strip the `error.message` concatenation.

#### IN-04: Comment claims static build prerenders "a harmless static 204" — no file is created

**File:** `src/pages/api/csp-report.ts:9-13,34`
**Issue:** Verified in the static build log: `/api/csp-report (file not created, response body was empty)`. GitHub Pages therefore serves a 404, not a 204. Functionally equivalent (no report source exists there, as the comment itself notes), but the stated mechanism is wrong.
**Fix:** Update the comment: "in static builds the route emits no file (404 on GitHub Pages), which is acceptable because no CSP report-uri is served there."

#### IN-05: Invalid `og:locale` value for English pages

**File:** `src/layouts/Base.astro:64`
**Issue:** `og:locale` must be `language_TERRITORY` format; `'en'` alone is invalid (German correctly uses `de_CH`).
**Fix:** `lang === 'de' ? 'de_CH' : 'en_US'` (or `en_GB`).

#### IN-06: Tagesschule hero fallback is dead — CMS points the hero at the homepage image

**File:** `src/pages/angebote/tagesschule/index.astro:18-20` (and the EN twin), data in `src/content/settings/images.json:13`
**Issue:** `programmeHeroes.tagesschule` is set to `/images/hero/homepage-hero.png`, so the CMS value always wins and the relocated fallback `/images/programs/tagesschule-hero.png` (commit cfdb198) is never used. The Tagesschule/Day School pages render the homepage hero image. The wrapper code is correct; verify the CMS value is intentional and not a stale placeholder.
**Fix:** Set `programmeHeroes.tagesschule` to `/images/programs/tagesschule-hero.png` (or `null` to use the fallback) if the homepage image is not intended.

#### IN-07: EN page title fallback `'Day School'` is dead code — title is always "Tagesschule"

**File:** `src/pages/en/programs/day-school/index.astro:22`
**Issue:** `page?.hero?.titel` is a plain string (`"Tagesschule"` in `pages/tagesschule.json`) and always truthy, so the `lang === 'de' ? 'Tagesschule' : 'Day School'` fallback never executes; the EN page `<title>` is "Tagesschule | EVOLEA". If the program name is treated as a proper noun this is fine and matches the mini-garten pattern, but then the `'Day School'` branch is misleading dead code.
**Fix:** Either make `hero.titel` bilingual in the CMS schema and use `getText`, or simplify the fallback to the literal `'Tagesschule'`.

---

## Fixes Applied

**Fixed:** 2026-06-12 (gsd-code-fixer). Scope: all Critical + Warning findings, plus one-line risk-free Info items. Each fix committed atomically with the `fix(01-review):` prefix; pre-commit hooks (check_secrets.py, gitleaks, full `npm run build`) ran on every commit. Final verification: `npm run build` and `GITHUB_PAGES=true npm run build` both exit 0.

| Finding | Status | Commit | Fix |
|---------|--------|--------|-----|
| CR-01 | fixed | 79335ce | Dropped the `'m'` regex flag in `extractCsp()` so `$` anchors to end-of-input; added sanity assertions (extraction must end with `report-uri /api/csp-report`, be > 200 chars, and the two CSPs must differ). Proven by mutation test: a hostile `connect-src https://evil.example` rewrite in `security-headers.ts` now fails `node scripts/gen-headers.mjs` (exit 1); reverted, the check passes. |
| WR-01 | fixed | c7efa7a | `/api/csp-report` no longer buffers unbounded bodies: Content-Length gate rejects > 16 KB unread (`request.body?.cancel()`), and a streaming reader aborts as soon as 16 KB is exceeded. Always returns 204. |
| WR-02 | fixed | 6f4abf3 | Rebuilt `/keystatic` Response now deletes `content-length` from the copied headers so the runtime recomputes it for the enlarged body. |
| WR-03 | fixed | 15b83a1 | `og:image`/`twitter:image` now use `new URL(\`${base}${image}\`, Astro.site)`. Verified in the `GITHUB_PAGES=true` build: `dist/index.html` now emits `https://cgjen-box.github.io/evolea-website/images/og-default.jpg`. |
| WR-04 | fixed | 20a9db1 | `gen-headers.mjs` now parses `_headers` into per-path blocks and asserts two-way, scope-aware parity: exact values under `/*`, each CSP under its own scope, no unknown headers under `/*`, no enforcing `Content-Security-Policy` anywhere, exact immutable Cache-Control under `/assets/*` and `/fonts/*`. Mutation-tested: rogue header, enforcing CSP, and swapped CSP scopes all fail; clean file passes. |
| WR-05 | fixed | c7efa7a | Sink now logs one compact line per report (`[csp-report] directive=... blocked-uri=...`), fields stripped to `[\w\-./:]` and truncated to 200 chars, parsed defensively from the capped read (handles both `csp-report`-wrapped and bare JSON). Over-cap or unparseable bodies skip logging; 204 always. Combined with WR-01 since both reshape the same handler. |
| IN-01 | fixed | b49a95d | Keystatic CSP docstring now says connect-src *swaps* formspree.io for api.github.com (not a superset). |
| IN-02 | fixed | b49a95d | `/keystatic` matching is now exact-or-slash (`=== '/keystatic' \|\| startsWith('/keystatic/')`) in both middleware sites. |
| IN-03 | not fixed | — | Left documented: dead clone/read + `innerHTML` sink in the injected Keystatic script is a multi-line behavioral change inside an inline script string, not a one-line risk-free edit. |
| IN-04 | fixed | b49a95d | Comment corrected: static builds emit no file for `/api/csp-report` (404 on GitHub Pages), not a prerendered 204. |
| IN-05 | fixed | b49a95d | `og:locale` for English pages is now `en_US` (was invalid bare `en`). |
| IN-06 | not fixed | — | Left documented: CMS data decision (`programmeHeroes.tagesschule` points at the homepage hero) — needs a content-owner call, not a code fix. |
| IN-07 | not fixed | — | Left documented: title-fallback design choice (bilingual `hero.titel` vs proper-noun literal) — not one-line risk-free. |

---

_Reviewed: 2026-06-12T14:46:37Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Fixed: 2026-06-12T16:57:00Z (Claude, gsd-code-fixer)_
