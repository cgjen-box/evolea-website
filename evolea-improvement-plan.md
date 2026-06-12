# evolea.ch — Improvement Plan vs eatplanted.com

Based on the 12 June 2026 benchmark (crawler audit + axe-core + Mozilla Observatory + lab timing).
Stack: **Astro 5.16 on Cloudflare, SSR (`output: "server"`)** — nearly every fix is a config or template change, no replatforming. But because HTML is served by Pages Functions, response headers for pages must be set via **Cloudflare Transform Rule, middleware, or worker** — a `public/_headers` file only applies to static assets, not Function-generated responses.

## Where you stand today

| Dimension | evolea.ch | eatplanted.com | Gap to close |
|---|---|---|---|
| Performance | Fast server (TTFB ~120ms, Brotli, 45KB JS) but ~7MB homepage | Heavy (329 requests, 6.6MB, big tag stack) | **Extend the lead** — fix images |
| SEO | Clean on-page, but no sitemap discovery, zero structured data | Valid sitemap + JSON-LD everywhere | **Biggest gap** |
| Accessibility | 2 axe violations, near-perfect | 7 violations, 2 critical | Keep the lead, fix the last 2 |
| Security | No security headers at all (Observatory D) | HSTS/CSP/nosniff present (but F on cookies/SRI) | **Easiest big win** |

Goal: move evolea from B (76) to a solid A (90+) and beat eatplanted in **all four** categories, not three.

---

## Phase 1 — This week (config-only, ~2–4 hours, biggest score jump)

### 1.1 Security headers (Security: 45 → ~85)
One Cloudflare change fixes most of the category. Use a **Transform Rule → Modify Response Header** (or Astro middleware) — not `_headers`, which won't touch SSR responses:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**CSP separately and carefully.** Run in `Content-Security-Policy-Report-Only` mode for at least a week first. Known dependencies that must be allowed: Formspree contact form (`form-action https://formspree.io`; if the form submits via JS, also `connect-src https://formspree.io`), Instagram embed on /spenden (`frame-src https://www.instagram.com`), Google Fonts (`style-src fonts.googleapis.com`, `font-src fonts.gstatic.com`), inline scripts in Base.astro (`'unsafe-inline'` in script-src, or nonce them), and a looser/separate policy for `/keystatic`. Still far easier than eatplanted's 16-script tag stack — a stricter CSP than theirs is reachable.

### 1.2 Sitemap discovery (SEO +~10 pts)
The sitemap exists (`/sitemap-index.xml`, 56 URLs) but nothing points to it and `/sitemap.xml` 404s:
- **Merge** into the existing `robots.txt` (keep the Cloudflare content-signals block): `User-agent: *`, `Allow: /`, `Sitemap: https://www.evolea.ch/sitemap-index.xml`
- Add `<link rel="sitemap" href="/sitemap-index.xml">` to the head (Astro sitemap docs recommend both)
- Add a Cloudflare redirect `/sitemap.xml → /sitemap-index.xml`
- Submit the sitemap in Google Search Console (and Bing Webmaster Tools)

### 1.3 Image compression (Performance: homepage 7MB → ~1.5MB)
4.5MB sits in three team PNGs + a 721KB logo. Alexandra's 54KB JPG proves the target:
- Convert team photos to WebP/AVIF at display size (~50–100KB each). Note: they currently live in `public/` and are rendered with plain `<img>` — Astro serves `public/` assets as-is with **no processing**, and Cloudflare SSR can't run image transforms at request time. So either (a) convert manually (squoosh/sharp CLI) and keep them in `public/`, or (b) move them to `src/assets` and use `<Image />` on **prerendered** pages. Set explicit `width`/`height` either way (fixes the CLS risk)
- Logo: 721KB PNG used 3× → SVG if possible, else ~20KB WebP
- Add `loading="lazy"` to the remaining below-fold images; `rel=preload` the hero poster (`/images/hero-poster.jpg` is your LCP element)

### 1.4 Cache hashed assets properly
`/assets/*` files are content-hashed but cached only 4h. Cloudflare Cache Rule for `/assets/*`: `Cache-Control: public, max-age=31536000, immutable`. Consider edge-caching HTML too (currently `DYNAMIC`) — it's a static site.

**Expected after Phase 1: Security ~85, Performance ~90, SEO ~82 → overall ~88, ahead of eatplanted everywhere.**

---

## Phase 2 — Next 2 weeks (template work, ~1–2 days)

### 2.1 Structured data (the one place eatplanted clearly beats you)
Zero JSON-LD site-wide today. Add per-template:
- All pages: `Organization` (or `NGO` if applicable — name, logo, sameAs social profiles) + `WebSite`
- Blog posts: `Article`/`BlogPosting` with headline, datePublished, author, image — and switch `og:type` from `website` to `article`
- Offer pages (`/angebote/*`): `Service` or `Event` where it fits; `BreadcrumbList` on nested pages
- `FAQPage` markup: optional only — Google removed FAQ rich results as of May 7, 2026, so it earns no SERP feature anymore. The markup remains valid schema.org and may help AI search/answer engines, but don't prioritize it

### 2.2 Fix duplicate-URL canonicals
`/blog` and `/blog/` both return 200, each canonicalizing to itself. Pick the trailing-slash form (matches the sitemap), 301 the other via Astro config (`trailingSlash: 'always'`) or a Cloudflare redirect rule.

### 2.3 Title tags
"Startseite | EVOLEA" wastes your most important SEO real estate. Pattern: `<primary keyword> – <brand>`, e.g. "Kinderturnen & Bewegungsförderung in Zürich – EVOLEA". Do the same audit for `/angebote/*` pages — they carry the commercial intent. (The "fÃ¼r" encoding glitch reported earlier was an artifact of the audit crawler, not the site — live HTML is correct.)

### 2.4 Custom 404 page
Currently the unstyled Astro default. Build a branded 404 with navigation back to Angebote/Blog.

### 2.5 Close the last 2 accessibility violations
1 serious color-contrast element + 1 landmark issue (from axe-core). Note: zero axe violations is **not** WCAG/EAA conformance — automated tools catch only ~30-50% of issues. Before any public accessibility claim, do manual keyboard, screen-reader, focus-order, form, and mobile checks. The relative position is still strong (eatplanted has 2 critical failures).

---

## Phase 3 — Ongoing (the actual ranking battle)

Technical scores get you eligible; content wins rankings:
- **hreflang is already correct** (de/en/x-default) — your advantage; keep parity as pages are added so /en/ never drifts
- Blog cadence with Article schema + internal links to Angebote pages (you have 56 URLs; eatplanted has hundreds — topical depth is the long-term gap)
- Get `width`/`height` on all images, keep homepage under a 1.5MB budget as content grows
- Compress the hero video further (1.36MB mobile mp4 → ~600KB AV1/H.265 ladder) or honor `prefers-reduced-motion`
- Monitor: re-run this benchmark monthly (`website-benchmark` skill, dated JSONs compare over time); once real-user traffic data accrues in CrUX, add a PSI API key for Core Web Vitals field data

---

## Verification

After Phase 1 ships, re-run: `python3 audit_site.py https://www.evolea.ch --out evolea-postfix.json` and rebuild the comparison dashboard. Targets:

| Category | Now | After P1 | After P2 |
|---|---|---|---|
| Performance | 65–92* | 90 | 92+ |
| SEO | 72–78* | 82 | 90+ |
| Accessibility | 88–96* | 96 | 99 |
| Security | 41–45* | 85 | 90+ |

*Ranges = the two audit methods (crawler-only vs browser-based) — both agree on the gaps, just weight them differently.

These are **audit-score verification thresholds** (what the scanners should report after each phase), not ranking or traffic guarantees — search outcomes depend on content and competition, not just technical health.
