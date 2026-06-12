# Pitfalls Research

**Domain:** Hardening an existing production Astro 5.x + Cloudflare Pages SSR site (bilingual NGO, Keystatic CMS, Formspree forms, static GitHub Pages fallback build)
**Researched:** 2026-06-12
**Confidence:** HIGH (verified against the live repo's `src/middleware.ts`, `astro.config.mjs`, `.github/workflows/deploy.yml`, plus current Astro/Cloudflare/sharp/HSTS sources)

> Scope note: this is not a greenfield build. Every change ships to a live site that must keep Formspree forms, Keystatic CMS, donations, and DE/EN switching working. The single most dangerous structural fact is that the project builds **two ways**: Cloudflare = `output: 'server'` (middleware runs), GitHub Pages = `output: 'static'` (middleware does NOT run, `site`/`base` differ). Most pitfalls below trace back to forgetting one of those two builds.

---

## Critical Pitfalls

### Pitfall 1: Flipping CSP to enforce mode before reading the reports — and breaking Formspree, Instagram, and Keystatic

**What goes wrong:**
A Content-Security-Policy that looks reasonable silently blocks: (a) the Formspree POST/redirect (`form-action` and, if JS-submitted, `connect-src https://formspree.io`), (b) the Instagram embed on `/spenden` (`frame-src https://www.instagram.com` + `script-src https://www.instagram.com`), (c) the inline Keystatic enhancement script injected by `src/middleware.ts` (the toast/deploy-hide IIFE), and (d) Keystatic's own admin React app, which uses inline styles and (depending on version) inline/eval scripting. With CSP in *enforce* mode the forms fail and the CMS becomes unusable, on a live site, with no warning.

**Why it happens:**
CSP failures are invisible in normal QA — the page renders fine; only the blocked sub-resource or form submission fails. Developers test the homepage, see it load, and assume the policy is safe. The site also has *inline* scripts (the middleware's Keystatic IIFE plus any inline `<script>` in `Base.astro`), so a naive `script-src 'self'` policy breaks them immediately.

**How to avoid:**
- Ship as `Content-Security-Policy-Report-Only` first (PROJECT.md already commits to this; honor it — do not let "it's just a header" pressure flip it early). Collect ≥1 week of reports before considering enforce.
- Use a `report-to`/`report-uri` endpoint (or at least Report-Only + browser console review) so you actually *see* violations, otherwise Report-Only collects nothing actionable.
- Enumerate the allowlist from the real dependency list, not memory: `form-action https://formspree.io`, `connect-src https://formspree.io`, `frame-src https://www.instagram.com https://www.facebook.com`, `script-src https://www.instagram.com`, `img-src https://*.cdninstagram.com data:`, font/style for Google Fonts *only if* self-hosting hasn't landed yet (Pitfall 9 removes that need), and a separate, looser policy branch for `/keystatic`.
- Prefer nonces over `'unsafe-inline'` for the inline scripts you control (middleware IIFE, Base.astro inline JS). But note Keystatic admin likely still needs `'unsafe-inline'`/`'unsafe-eval'` in style/script — scope that to the `/keystatic` path only.

**Warning signs:**
Report-Only console fills with `Refused to ...` for formspree/instagram/inline; a test contact submission in DE *and* EN doesn't reach the inbox; `/keystatic` renders blank or unstyled; the save-toast stops appearing.

**Phase to address:**
Security headers phase (Report-Only only). Enforce-mode flip is explicitly **out of scope** for this project (PROJECT.md) — leave it as a documented follow-up after a week of clean reports.

---

### Pitfall 2: Trailing-slash canonical fix that 404s or redirect-loops because Cloudflare and Astro disagree — and behaves differently on the GitHub Pages build

**What goes wrong:**
You set `trailingSlash: 'always'` in `astro.config.mjs` to fix the `/blog` vs `/blog/` split-canonical, and one of three things breaks: (1) Cloudflare's adapter/Pages layer strips or re-adds the slash and produces a 308→404 loop, (2) the existing `redirects` entry in `astro.config.mjs` (`/en/angebote/evolea-cafe/`) stops matching because Astro redirect config "does not handle trailing slashes" consistently, or (3) the static GitHub Pages build (which serves `/blog/index.html` and lets *GitHub Pages*, not Astro, decide slash behavior) ends up with a different canonical than the live Cloudflare site — defeating the whole point of the fix.

**Why it happens:**
`trailingSlash` is an Astro *build/dev* setting; once deployed, the *host* (Cloudflare Pages Functions for SSR, GitHub Pages static server) makes the final URL decision. The Cloudflare adapter has multiple open issues where `trailingSlash` is ignored or fights the platform (308 to slash regardless of config; redirect targets 404 with a trailing slash). The repo's `canonicalURL` in `Base.astro` is computed from `Astro.url.pathname`, so whatever slash the host serves becomes the canonical — if host and config disagree, the canonical points at a URL that redirects.

**How to avoid:**
- Decide the canonical form once: **trailing slash** (matches the existing `@astrojs/sitemap` output — verify the sitemap's actual URLs first).
- Enforce it where the request is actually handled: a redirect branch in `src/middleware.ts` for the SSR build (301 non-slash → slash, but **only for page routes** — never `/assets/*`, `/keystatic`, `robots.txt`, `sitemap*.xml`, or files with an extension), rather than relying solely on `trailingSlash: 'always'`.
- Make `canonicalURL` in `Base.astro` *normalize* to the chosen form rather than echoing `Astro.url.pathname` verbatim, so the canonical is correct even if the host serves the other form transiently.
- Test the GitHub Pages fallback build separately: its `base` is `/evolea-website` and GitHub Pages handles slashes itself. Confirm the canonical there still points at `www.evolea.ch` (it should, via `site`), not at the github.io URL.
- After deploy, `curl -sI` both `/blog` and `/blog/` and confirm exactly one 301 and one 200, with no loop.

**Warning signs:**
`curl -I /blog` returns 308 then the target returns 404; `ERR_TOO_MANY_REDIRECTS`; the evolea-cafe redirect (already in config) breaks after the change; Search Console reports "Page with redirect" or "Duplicate, Google chose different canonical."

**Phase to address:**
SEO / canonical phase. Do the middleware redirect and the `canonicalURL` normalization together; verify on both builds before merge.

---

### Pitfall 3: Breaking the static GitHub Pages fallback build by putting hardening logic only in middleware

**What goes wrong:**
Security headers, cache-control, and the trailing-slash redirect all go into `src/middleware.ts` — which **only runs in `output: 'server'` (Cloudflare)**. The GitHub Pages build is `output: 'static'`; middleware is not executed, so the fallback site silently ships with none of the hardening. Worse, a route you add for hardening (e.g. a dynamic `src/pages/robots.txt.ts`) may behave differently or fail under `output: 'static'`, breaking the GitHub Pages build entirely and turning the fallback into a broken deploy.

**Why it happens:**
The dual-build setup (`isGitHubPages` / `useCloudflare` branches in `astro.config.mjs`) is easy to forget. Developers test locally (often the Cloudflare/SSR path) and on the live site, never exercising the `GITHUB_PAGES=true` static build until the GitHub Action runs — and the Action's failure is easy to ignore because the live Cloudflare site looks fine.

**How to avoid:**
- Treat the GitHub Pages build as a real target: run `GITHUB_PAGES=true npm run build` locally for *every* change before merge, not just the default build.
- For headers/cache that genuinely matter on the fallback, add a `public/_headers` file too — it is ignored by SSR (harmless) but applies to GitHub Pages... except GitHub Pages does not honor `_headers` either, so accept that the fallback is best-effort for headers and document it. The fallback's job is availability, not security parity.
- Make `robots.txt` and any new endpoint work in **both** output modes: a static `public/robots.txt` is safer than a dynamic route if it must exist on the GitHub Pages build; if you need it dynamic for the sitemap URL, guard it so the static build still produces a valid file.
- Keep the GitHub Action green a hard merge gate (it already runs on push to main).

**Warning signs:**
GitHub Actions "Deploy Astro to GitHub Pages" job goes red after a hardening commit; the github.io fallback 404s on `/robots.txt` or whole sections; a route renders on Cloudflare but errors in the static build with "getStaticPaths required" or adapter-specific APIs unavailable.

**Phase to address:**
Every phase that touches middleware or adds routes. Add "GitHub Pages static build passes" to each phase's success criteria.

---

### Pitfall 4: Middleware response-body consumption bug — the existing fragile double-`next()` catch path

**What goes wrong:**
The current `src/middleware.ts` Keystatic branch does `await response.text()` and, in the `catch`, falls through to `return next()` (line 116) — calling `next()` a second time *after the body was already consumed*. When you extend this middleware to add security headers / cache-control / trailing-slash redirects, the natural copy-paste of this pattern multiplies the bug: reading a body you then re-stream, or returning a `next()`-derived response whose body is already locked, produces `TypeError: Body is unusable` / locked-stream errors at the edge — intermittently, because Cloudflare's body buffering sometimes masks it.

**Why it happens:**
The catch path was written assuming `next()` is idempotent and cheap; it is not — a `Response` body is a single-use stream. CONCERNS.md already flags this as a fragile area. New header logic that wraps `next()` and then mutates/reads the response compounds the issue.

**How to avoid:**
- Fix the existing catch path first: on failure, return the *already-fetched* `response` (or the rendered HTML you have), never call `next()` again.
- For header/cache injection, **never read the body**. Use the verified pattern: `const response = await next(); response.headers.set(...); return response;`. Setting headers does not consume the body; only `.text()`/`.json()`/`.arrayBuffer()` does.
- If you must mutate HTML (you do for the Keystatic IIFE), `clone()` before `.text()` so a fallback can still stream the original: `const res = await next(); try { const html = await res.clone().text(); ... } catch { return res; }`.
- Keep the Keystatic-mutation branch and the headers-only branch separate; do not run `.text()` on every page just to add headers.

**Warning signs:**
Intermittent 500s or blank responses on `/keystatic`; edge logs showing `Body has already been used` / `ReadableStream is locked`; the save-toast script missing only sometimes; errors that reproduce on Cloudflare but never locally.

**Phase to address:**
Security headers phase — the very first edit to middleware. Refactor the existing fragile path *before* layering new logic on top.

---

### Pitfall 5: Deleting "unused" images that CMS JSON / fallback paths still reference

**What goes wrong:**
The hygiene task untracks `public/images/generated/` (82MB) and deletes `Final images/` (7.2MB) and superseded logos. But `src/pages/angebote/tagesschule/index.astro:20` and the EN twin fall back to `/images/generated/tagesschule-hero.png` when the CMS `settings` entry is empty. Keystatic-edited JSON in `src/content/` can point at any `public/` path the editor chose. Deleting a "grep-unreferenced" file that is actually referenced only by *runtime CMS data* (not source code) ships a silent 404 on a live program page — and the broken hero only appears when the CMS field happens to be empty, so it passes QA.

**Why it happens:**
`grep` over `src/` finds source references but not values stored in content JSON or entered live in Keystatic. Fallback paths are conditional, so the image is "used" only on a code branch nobody exercises in testing.

**How to avoid:**
- Before deleting, grep **both** `src/` *and* `src/content/**/*.json` (and any committed Keystatic data) for the basename, not just the source tree.
- Execute the documented order: **move `tagesschule-hero.png` to `public/images/programs/` and update both fallback paths FIRST**, then untrack `generated/`. PROJECT.md and CONCERNS.md both call this out — follow it literally.
- `git rm --cached` (untrack) rather than `rm` for `generated/` so files stay on disk during verification; only hard-delete after a full build + link-check passes.
- After deletion, build and run a broken-link/404 image check across all program pages in DE and EN, including the empty-CMS-field branch (temporarily blank the field locally to exercise the fallback).

**Warning signs:**
A program hero shows a broken-image icon only on one language or only when a CMS field is blank; build succeeds but `dist/` is missing an image a template requests; 404s for `/images/...` in server logs after deploy.

**Phase to address:**
Repo hygiene phase. Gate image deletion behind a content-JSON grep + fallback-path migration + 404 sweep.

---

### Pitfall 6: WebP conversion that washes out brand photography by stripping the ICC profile

**What goes wrong:**
Converting team/program PNGs to WebP with sharp's defaults strips the embedded ICC color profile and *doesn't* properly transform to sRGB, so brand-critical photos (faces, warm brand palette) come out desaturated, color-shifted, or washed out on the live site. On an NGO site where the team and program photos are the trust signal, this is a visible brand regression that violates the "visual fidelity" constraint.

**Why it happens:**
By default sharp converts toward device-independent sRGB and strips metadata including the ICC profile. If a source PNG was authored in a wide-gamut or non-sRGB space, dropping the profile without a proper sRGB transform makes the colors render wrong. Quality settings that are too aggressive (low `quality`, lossy on graphics/logos with hard edges) add banding and halos.

**How to avoid:**
- With sharp, explicitly convert to sRGB and attach a web sRGB profile: use the documented metadata handling (e.g. `.toColorspace('srgb')` and keep a sRGB ICC profile via the appropriate `keepMetadata`/profile option) rather than blind `.webp()` with defaults.
- Use sensible quality: photos `quality: 78–82` lossy WebP; the logo should be SVG if possible, else **lossless** WebP (hard edges + flat color band badly under lossy).
- Resize to *display* dimensions before encoding (team ~800px, heroes to actual rendered width) — converting at source resolution wastes bytes and doesn't fix CLS.
- A/B the output against the original at 100% on a calibrated screen and on mobile before replacing. Keep originals (in an untracked/source dir) so re-encoding is possible.
- Set explicit `width`/`height` on every `<img>` during conversion (fixes CLS; the images use raw `<img>` today).

**Warning signs:**
Side-by-side shows faded/cooler skin tones; brand magenta/coral look muted; `exiftool`/`sharp metadata` shows no ICC profile or a non-sRGB one on the output; logo edges show fringing/banding.

**Phase to address:**
Performance / image phase. Build a tiny repeatable sharp script with explicit colorspace handling; review outputs visually before committing.

---

### Pitfall 7: Cache-Control applied to HTML the same way as to hashed assets — caching stale pages at the edge

**What goes wrong:**
The plan adds `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`. If the middleware path-match is too broad (e.g. matches all responses, or matches `/` HTML, or you also "edge-cache HTML because it's a static site"), then SSR HTML gets cached immutably for a year. Result: content edited in Keystatic never appears, the donation page shows stale bank/contact info, language switches serve cached wrong-locale pages, and you cannot fix it without a full cache purge — on a live NGO site.

**Why it happens:**
"It's basically a static site, cache everything" feels right, but Keystatic edits + the prerender-on-redeploy blog model mean HTML *does* change between deploys, and HTML carries no content hash in its URL (unlike `/assets/index.<hash>.js`). `immutable` on a non-hashed URL is a trap.

**How to avoid:**
- Scope the long-cache header **strictly** to `url.pathname.startsWith('/assets/')` (hashed filenames only). Nothing else gets `immutable`.
- For HTML, use short/revalidating caching at most (`Cache-Control: public, max-age=0, must-revalidate` or a short s-maxage with revalidation), never `immutable`, never a year.
- Never apply long cache to `/keystatic`, `robots.txt`, `sitemap*.xml`, or the forms pages.
- After deploy, `curl -sI` an `/assets/*.js` (expect 1-year immutable) AND a page (expect short/revalidate), and confirm a Keystatic edit goes live without manual purge.

**Warning signs:**
Edited content doesn't appear after the documented 1–2 min; `cf-cache-status: HIT` with high `Age` on HTML pages; users report stale info; you find yourself purging the whole zone to ship a typo fix.

**Phase to address:**
Performance / cache phase, in the same middleware edit as headers — with an explicit path guard and a post-deploy curl check.

---

### Pitfall 8: HSTS rollout with `includeSubDomains`/`preload` that locks out a subdomain you forgot

**What goes wrong:**
Shipping `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (or submitting to the preload list) before verifying that *every* subdomain of `evolea.ch` serves valid HTTPS. Any subdomain on HTTP or with a bad cert (a mail host, an old `dev.`, a staging box, a parked record) becomes hard-unreachable in browsers that cached the policy. Preload is effectively a one-way door — removal propagates only with browser releases over weeks/months.

**Why it happens:**
Copy-pasting the "maximal" HSTS header from a hardening checklist. The `evolea-website.pages.dev` staging host and any future subdomain are easy to forget. `preload` looks like a free score bump on Observatory but carries permanent risk.

**How to avoid:**
- Roll out in stages: start `max-age` low (e.g. 300–86400) **without** `includeSubDomains` and **without** `preload`, confirm no breakage, then raise `max-age` to 1 year, then add `includeSubDomains` only after auditing DNS for every subdomain, and only consider `preload` much later (it's not needed to beat the benchmark and is out of scope for a quality lift).
- Audit all `*.evolea.ch` DNS records for HTTPS support before `includeSubDomains`.
- Do **not** send `preload` for this project — Observatory's HSTS points are achievable without it.

**Warning signs:**
A subdomain becomes unreachable after the header ships; users on mobile report can't-connect to a service host; you realize a subdomain is HTTP-only *after* shipping `includeSubDomains`.

**Phase to address:**
Security headers phase. Ship HSTS without `preload`; add `includeSubDomains` only after a DNS audit.

---

### Pitfall 9: X-Frame-Options `DENY` vs CSP `frame-ancestors` conflict breaking Keystatic / Instagram

**What goes wrong:**
Setting a blanket `X-Frame-Options: DENY` on *every* SSR response (including `/keystatic`) plus a CSP with `frame-ancestors 'self'` (or missing). Modern browsers ignore XFO when `frame-ancestors` is present, but the two must agree or you get inconsistent behavior across browser versions. The real breakage: `DENY` on the Instagram-embed parent page is fine, but if any flow frames your own page (preview, OAuth popup), `DENY` blocks it; and a too-strict `frame-ancestors` can interfere with Keystatic's GitHub OAuth popup/iframe flow.

**Why it happens:**
XFO and `frame-ancestors` overlap but have different precedence rules; setting both with mismatched values is a classic mistake. Applying one global value ignores that `/keystatic` has different framing needs than public pages.

**How to avoid:**
- Make the two consistent: `X-Frame-Options: DENY` paired with CSP `frame-ancestors 'none'` for public pages (equivalent, belt-and-suspenders for old browsers).
- Note `frame-ancestors` controls who can frame *you*; it does **not** control Instagram embeds (that's `frame-src`). Don't confuse the two when debugging the `/spenden` embed.
- Scope framing headers per path: public pages get `DENY`/`'none'`; `/keystatic` gets whatever its OAuth/preview flow needs (likely `frame-ancestors 'self'` and no `DENY`, or omit framing restrictions there) — verify the GitHub OAuth login still completes.

**Warning signs:**
Keystatic login popup blank/blocked (`Refused to display ... in a frame`); inconsistent framing behavior between Chrome and Safari; `ERR_BLOCKED_BY_RESPONSE` in the CMS.

**Phase to address:**
Security headers phase, alongside the `/keystatic` CSP carve-out.

---

### Pitfall 10: Structured data that earns a manual action — wrong NGO/Organization markup or invisible-content spam

**What goes wrong:**
JSON-LD that (a) marks up content not visible on the page (e.g. fabricated ratings/reviews, an `aggregateRating` with no real reviews), (b) uses the wrong type (`LocalBusiness`/`Store` for a non-profit, or `Event` for a recurring program that isn't a real dated event), or (c) mismatches the visible page (schema `name`/`address`/`logo` differing from the rendered content). Google issues structured-data manual actions or simply ignores it; fabricated review markup is an explicit spam-policy violation.

**Why it happens:**
Copying schema templates that include `aggregateRating`/`review`/`offers` because "more properties = more rich results." EVOLEA is a Verein (non-profit) — `NGO`/`Organization` + `EducationalOrganization` fits; e-commerce and review markup do not. Recurring meetups (EVOLEA Cafe "every 2nd Wednesday") are not single dated `Event`s.

**How to avoid:**
- Use `Organization` (subtype `NGO`) + `EducationalOrganization` site-wide; `BlogPosting` (real `datePublished`/`author`/`image`) on posts; `BreadcrumbList` matching the visible breadcrumb; `Service` for programs (not `Offer`/`Product`). Use `Event` only for genuinely dated occurrences with `startDate` — for the recurring cafe, prefer describing it as a `Service`/`Schedule` rather than fake one-off events.
- Never add `aggregateRating`/`review` without real, visible, user-generated reviews. The site has parent *testimonials*, which are not `Review` objects with ratings — do not invent star ratings.
- Ensure every JSON-LD value matches what's rendered (name, logo URL = `www.evolea.ch` canonical, `sameAs` only real social profiles).
- Validate every template with Google Rich Results Test and the Schema.org validator before merge; check both DE and EN render correct `inLanguage`.

**Warning signs:**
Rich Results Test shows errors/warnings; Search Console "Manual actions → Structured data issue"; rich result eligibility never appears; mismatched URLs (github.io leaking into JSON-LD on the fallback build — see Pitfall 3).

**Phase to address:**
SEO / structured-data phase. Validate each schema type, in both languages, before shipping.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| CSP `'unsafe-inline'` in `script-src` globally instead of nonces | Forms/inline scripts "just work" | Defeats most of CSP's XSS value; hard to tighten later | Only scoped to `/keystatic`; never on public pages once nonces are wired |
| Headers/cache only in middleware, skip the static build | Faster to ship | GitHub Pages fallback unhardened and may break unnoticed | Acceptable for *security* parity (fallback is availability-only) — never for routes/SEO that must exist on both |
| Convert images at source resolution to save effort | One sharp call, done | Wastes bytes, doesn't fix CLS, misses the perf target | Never — resize to display size is the whole point |
| `git rm` (hard delete) generated/Final images directly | Repo shrinks immediately | Loses recovery if a CMS fallback referenced them | Never first — `--cached` + verify, then delete |
| `trailingSlash: 'always'` alone as the canonical fix | One config line | Cloudflare adapter ignores/fights it; fallback build differs | Only paired with a middleware redirect + canonicalURL normalization |
| HSTS `preload` for the Observatory points | +score | One-way door; subdomain lockout risk | Never for this project |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Formspree | CSP `form-action 'self'` only, or forgetting `connect-src` for JS-submitted forms | Allow `form-action https://formspree.io`; add `connect-src https://formspree.io` if the form posts via fetch; test a real DE *and* EN submission |
| Instagram embed (/spenden) | Allowing only `frame-src` and seeing a blank embed | Also allow `script-src https://www.instagram.com` and `img-src https://*.cdninstagram.com`; `frame-ancestors` is unrelated to this |
| Keystatic CMS | Applying the public CSP + `X-Frame-Options: DENY` to `/keystatic` | Path-scoped looser policy for `/keystatic`; verify GitHub OAuth popup completes; don't strip the inline-enhancement script with CSP |
| Google Fonts | Adding `fonts.googleapis.com`/`fonts.gstatic.com` to CSP permanently | Self-host the fonts (already in `design-system-assets/fonts/`) and drop the Google origins from CSP entirely — GDPR win too |
| @astrojs/sitemap | Assuming the sitemap is discoverable | Reference it in `robots.txt` + `<link rel="sitemap">` + Search Console; verify sitemap URLs use the chosen slash form and `www.evolea.ch` (not github.io) |
| Cloudflare Pages caching | `immutable` on HTML "because static site" | `immutable` only on `/assets/*` hashed files; HTML revalidates |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Converting images but not setting `width`/`height` | LCP/CLS still poor despite smaller bytes | Add explicit dimensions to every `<img>` during conversion | Immediately on any layout-shift-sensitive page |
| Lossy WebP on logo/graphics | Banding, fringing on flat color | SVG or lossless WebP for the logo | As soon as the logo renders on any screen |
| Caching HTML immutably to chase a perf score | Stale content, can't ship edits without purge | Scope long cache to `/assets/*` only | First Keystatic edit after deploy |
| Re-encoding at source resolution | Files still large, target missed | Resize to display width first | At the perf-budget gate (homepage ≤1.5MB) |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| CSP enforce mode before reading reports | Live forms + CMS break with no warning | Report-Only ≥1 week with a working report sink; enforce is out of scope here |
| HSTS `includeSubDomains`/`preload` without DNS audit | Permanent subdomain lockout | Staged max-age; audit all `*.evolea.ch`; no `preload` |
| `X-Frame-Options`/`frame-ancestors` mismatch | Inconsistent clickjacking protection; CMS OAuth blocked | Keep both consistent (`DENY` + `'none'`); carve out `/keystatic` |
| Re-using the fragile double-`next()` middleware pattern | Intermittent 500s / locked-stream errors at edge | Set headers without reading body; clone before `.text()`; fix the existing catch |
| Forgetting the static build has no middleware | Fallback site ships unhardened/broken | Run `GITHUB_PAGES=true npm run build` every change |
| Fabricated review/rating JSON-LD | Structured-data manual action / spam penalty | Only mark up visible, real content; correct NGO types |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Branded 404 only in DE (or only on Cloudflare) | EN users / fallback build get unstyled Cloudflare error | Build `src/pages/404.astro` bilingual; verify it renders on both builds and that Cloudflare actually serves it for SSR misses |
| Washed-out WebP team/program photos | Trust signal degraded on an NGO site | sRGB-correct conversion + visual A/B before replace |
| Trailing-slash redirect catching asset/CMS paths | Broken assets, CMS, sitemap | Exclude `/assets/*`, `/keystatic`, `robots.txt`, `sitemap*`, extensioned files from the redirect |
| Self-hosting fonts but leaving FOUT/wrong fallback | Layout shift, flash of system font | `font-display: swap` + matched fallback metrics; preload the woff2 used above the fold |

## "Looks Done But Isn't" Checklist

- [ ] **CSP:** Renders fine but is it actually *Report-Only* with a working report sink? — submit a real contact form (DE + EN), open `/spenden` Instagram embed, open `/keystatic` and save once; check the report stream for violations.
- [ ] **Security headers:** Present on the homepage — but on *every* SSR route and *not* mangling `/keystatic`? — `curl -sI` homepage, a program page, a blog post, `/keystatic`.
- [ ] **Trailing slash:** `/blog/` works — but `/blog` 301s to it with no loop, and the evolea-cafe redirect still works, on both builds? — `curl -sI` both forms on Cloudflare and on the github.io fallback.
- [ ] **Cache-Control:** Assets cache long — but does HTML still revalidate so Keystatic edits go live without a purge? — edit a CMS field, wait, confirm it appears.
- [ ] **Image conversion:** Smaller bytes — but colors faithful and `width`/`height` set? — visual A/B + check ICC/sRGB on outputs.
- [ ] **Image deletion:** Build passes — but did you grep `src/content/**/*.json` and exercise the empty-CMS fallback branch? — blank the tagesschule CMS field locally and load the page.
- [ ] **robots.txt / sitemap:** File exists — but does it reference the *correct-domain* sitemap and exist on *both* builds? — fetch on Cloudflare and github.io.
- [ ] **JSON-LD:** Present — but passes Rich Results Test in DE *and* EN with no fabricated ratings and `www.evolea.ch` URLs (not github.io)? — validate each type on the fallback build too.
- [ ] **GitHub Pages build:** Cloudflare deploy green — but is the GitHub Action also green after this change? — check Actions tab every merge.
- [ ] **Middleware:** Headers added — but did you fix the existing double-`next()` catch before extending it? — review the catch path returns the existing response.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CSP enforced and broke forms/CMS | LOW | Revert to `-Report-Only` header (one-word change) and redeploy; reports remain for diagnosis |
| Stale HTML cached immutably at edge | MEDIUM | Narrow the cache path guard, redeploy, then purge the Cloudflare zone (`purge_everything`); confirm `Age` resets |
| HSTS `includeSubDomains` locked out a subdomain | HIGH | Lower `max-age` quickly and serve the header; affected clients only recover after their cached max-age expires; `preload` removal takes weeks — avoid by never preloading |
| Deleted an image a CMS fallback referenced | LOW–MEDIUM | Restore from git history (`git checkout <sha> -- path`) or re-commit from the untracked copy; fix the fallback path |
| WebP washed out and already deployed | LOW | Re-encode from kept originals with sRGB-correct settings; re-deploy (assets are hashed, so cache won't fight you) |
| Trailing-slash redirect loop live | MEDIUM | Revert the middleware redirect, ship the canonicalURL normalization alone, re-introduce the redirect with path exclusions |
| GitHub Pages build red | LOW | Revert the offending commit; reproduce locally with `GITHUB_PAGES=true npm run build`; fix; re-merge |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CSP breaks Formspree/Instagram/Keystatic | Security headers (Report-Only) | Report-Only sink shows no violations after real form/embed/CMS use; enforce deferred |
| Trailing-slash 404/loop + dual-build drift | SEO / canonical | `curl -sI` both forms, both builds; one 301 + one 200, no loop; evolea-cafe redirect intact |
| Static fallback unhardened/broken | Every middleware/route phase | `GITHUB_PAGES=true npm run build` green; Action green |
| Middleware double-`next()` body bug | Security headers (first edit) | Catch path returns existing response; no locked-stream errors in edge logs |
| Deleting CMS-referenced images | Repo hygiene | Grep `src/content` + fallback migration + empty-field 404 sweep |
| WebP color/CLS regression | Performance / images | sRGB-correct output, `width`/`height` set, visual A/B |
| HTML cached immutably | Performance / cache | `/assets/*` long, HTML revalidates, CMS edit goes live without purge |
| HSTS subdomain lockout | Security headers | Staged max-age, DNS audit, no `preload` |
| XFO/frame-ancestors conflict | Security headers | Consistent values; `/keystatic` OAuth completes |
| Structured-data spam/wrong type | SEO / structured data | Rich Results Test passes DE+EN; no fabricated ratings; NGO types correct |

## Sources

- Astro middleware response-header pattern (set headers without consuming body): https://docs.astro.build/en/guides/integrations-guide/node/ ; https://astro.tarancodes.in/mastering-astro-middleware-a-complete-guide/ ; https://www.trevorlasn.com/blog/csp-headers-astro (MEDIUM — verified against repo `src/middleware.ts`)
- Astro `trailingSlash` vs Cloudflare adapter (308/404 loops, redirect-config slash handling): https://github.com/withastro/astro/issues/16030 ; https://github.com/withastro/adapters/issues/521 ; https://github.com/withastro/astro/issues/12532 ; https://realmorrisliu.com/thoughts/fixing-astro-seo-cloudflare-trailing-slash/ (HIGH — multiple open issues + repo config corroborate)
- sharp ICC/sRGB handling and washed-out WebP: https://sharp.pixelplumbing.com/api-output/ ; https://github.com/lovell/sharp/issues/1323 ; https://community.adobe.com/t5/photoshop-ecosystem-discussions/photoshop-webp-images-lose-color-accuracy-after-save-icc-profile-issue/td-p/15636825 (HIGH for sharp default behavior)
- HSTS includeSubDomains/preload one-way-door + subdomain lockout: https://hstspreload.org/ ; https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html ; https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security (HIGH)
- X-Frame-Options vs CSP frame-ancestors precedence: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors ; https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html ; https://centralcsp.com/articles/frame-ancestor-frame-options (HIGH)
- Google structured-data / review-snippet spam policy and FAQ rich-result removal: PROJECT.md context + Google Search structured data guidelines (MEDIUM)
- Repo-grounded facts: `src/middleware.ts` (double-`next()` catch, Keystatic IIFE), `astro.config.mjs` (dual-build `output` branches, existing `redirects`, i18n), `.github/workflows/deploy.yml` (`GITHUB_PAGES=true` static build), `.planning/codebase/CONCERNS.md`, `.planning/PROJECT.md`, `evolea-improvement-plan.md` (HIGH — read directly)

---
*Pitfalls research for: hardening an existing production Astro + Cloudflare Pages SSR NGO site (dual static fallback)*
*Researched: 2026-06-12*
