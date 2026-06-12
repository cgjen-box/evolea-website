---
phase: 01-foundation-security
audited: 2026-06-12
auditor: gsd-security-auditor
asvs_level: 1
threats_total: 12
threats_closed: 12
threats_open: 0
unregistered_flags: 2
status: secured
---

# Phase 1: Security Audit — Foundation Security

Audit method: every declared mitigation verified directly in the implemented code (grep/read/execute), not from documentation. The parity checker was executed live (exit 0). Implementation files were not modified.

## Threat Verification Register

| Threat ID | Plan | Category | Disposition | Verdict | Evidence |
|-----------|------|----------|-------------|---------|----------|
| T-01-01 | 01-01 | DoS | mitigate | CLOSED | `src/pages/api/csp-report.ts:31` (`MAX_REPORT_BYTES = 16_384`), `:69-73` (Content-Length gate + `request.body?.cancel()` for oversized bodies), `:46-55` (streaming read aborts via `reader.cancel()` the moment the cap is exceeded), `:66-103` (whole handler in try/catch, always returns 204, no storage/amplification) |
| T-01-02 | 01-01 | Tampering (log injection / reflection) | mitigate | CLOSED | `src/pages/api/csp-report.ts:33-36` `sanitizeField` strips to `[\w\-./:]` (CR/LF impossible — no log-line forging) and truncates to 200 chars; `:92-96` single-line `console.log` of only two sanitized fields; `:102` response is `new Response(null, { status: 204 })` — attacker content never re-emitted. See note N1 on the evolved mitigation. |
| T-01-03 | 01-01 | Information disclosure | accept | CLOSED (accepted) | Logged in Accepted Risks below. Deny-by-default Permissions-Policy present: `src/lib/security-headers.ts:31` and `public/_headers:6` (`camera=(), microphone=(), geolocation=(), interest-cohort=()`) |
| T-01-04 | 01-01 | Tampering (header drift) | mitigate | CLOSED | `scripts/gen-headers.mjs` is a two-way, path-scope-aware checker: `:67-69` regex without `'m'` flag (CR-01 fix), `:89-107` anti-truncation sanity assertions (must end `report-uri /api/csp-report`, len > 200, two CSPs must differ), `:150-156` each CSP asserted under its own scope (`/*` vs `/keystatic/*`), `:158-166` rejects unknown extras under `/*`, `:168-175` rejects any enforcing `Content-Security-Policy`, `:177-182` exact immutable Cache-Control on `/assets/*` and `/fonts/*`. Wired into the build: `package.json:9` (`build`), `:10` (`build:cloudflare`), `:11` (`gen:headers`). Executed during this audit: exit 0, parity holds. |
| T-01-05 | 01-01 | Elevation/availability (Keystatic OAuth / Formspree breakage) | mitigate | CLOSED | CSP is Report-Only everywhere — `src/middleware.ts:103` sets only `Content-Security-Policy-Report-Only`; no enforcing CSP exists in `src/middleware.ts` (grep: 0 matches) or `public/_headers` (checker rule 4d bans it). Keystatic variant allows GitHub saves: `src/lib/security-headers.ts:66` + `public/_headers:16` (`connect-src 'self' https://api.github.com`); `form-action 'self' https://formspree.io` (`:48`/`:65`, `_headers:7,16`); Instagram hosts allowlisted (`:43-47`). Keystatic path match is exact-or-slash (`src/middleware.ts:101,121`). See note N2 on the deferred live check. |
| T-01-SC | 01-01 | Supply chain | mitigate | CLOSED | No dependency changes: `git diff ab21d58..HEAD -- package.json` contains only the `scripts` wiring (gen-headers parity gate); no new packages installed in phase commits |
| T-01-06 | 01-02 | Information disclosure (Google Fonts CDN leak) | mitigate | CLOSED | `grep -rn "fonts.googleapis\|fonts.gstatic" src/` returns 0 matches; six self-hosted woff2 in `public/fonts/`; `src/components/FontFaces.astro` emits 6 `@font-face` declarations |
| T-01-07 | 01-02 | Denial of availability (font 404 on base path) | mitigate | CLOSED | `src/components/FontFaces.astro:26,33,42,49,56,63` — all six urls `${base}/fonts/...` with `base` from `import.meta.env.BASE_URL`; preloads base-prefixed at `src/layouts/Base.astro:84-85` |
| T-01-SC | 01-02 | Supply chain (font download) | mitigate | CLOSED | `head -c 4 public/fonts/Poppins-Bold.woff2` = `wOF2` (valid woff2 magic bytes); no package installs |
| T-01-08 | 01-03 | Denial of availability (deleting in-use asset) | mitigate | CLOSED | Zero live refs to deletions: `grep -rn "TimelineActivities\|ProgramCardEnhanced" src/` = 0; `grep -rn "AngeboteSection\b" src/ \| grep -v AngeboteSectionV3` = 0; `grep -rn "/images/generated/" src/` = 0. Hero relocated and referenced: `git ls-files public/images/programs/tagesschule-hero.png` tracked, 1 ref each in `src/pages/angebote/tagesschule/index.astro` and `src/pages/en/programs/day-school/index.astro`. Keep-list logos intact: `git ls-files public/images/logo/` = evolea-logo-new.png, evolea-logo-circle.png, both butterfly SVGs only. |
| T-01-09 | 01-03 | Tampering (`--cached` vs `rm` confusion) | mitigate | CLOSED | `git ls-files public/images/generated/` = 0 (untracked from HEAD); the live, referenced hero `public/images/programs/tagesschule-hero.png` exists on disk and is tracked. See note N3 on the generated/ disk copy. |
| T-01-SC | 01-03 | Supply chain | mitigate | CLOSED | No package installs in plan 03 changes (asset/index operations only) |

## Accepted Risks Log

| Threat ID | Risk | Rationale | Accepted by |
|-----------|------|-----------|-------------|
| T-01-03 | Response headers themselves disclose policy configuration (Permissions-Policy feature list, CSP allowlist) | Headers contain no sensitive data; deny-by-default Permissions-Policy reduces feature exposure; CSP allowlist disclosure is inherent to the mechanism. Accepted per PLAN 01-01 threat register, ASVS L1 scope. | Phase 1 plan (01-01-PLAN.md threat_model) |

## Unregistered Flags (new attack surface without a threat ID)

| Flag | Location | Severity | Detail |
|------|----------|----------|--------|
| UF-01: GET handler on /api/csp-report | `src/pages/api/csp-report.ts:107` | Low (informational) | The plan specified a POST-only sink; a GET handler was added (to make the route prerenderable in static builds). It reads no input and returns an empty 204 — negligible surface, but it is endpoint surface not present in the threat model. No action required; register under SEC-04 if the endpoint evolves. |
| UF-02: `innerHTML` sink in injected Keystatic script | `src/middleware.ts:30,62` | Low (documented, not fixed) | `toast.innerHTML = message` where one call path concatenates `error.message`. REVIEW finding IN-03, deliberately deferred (multi-line change inside an inline script string; input is a browser-generated fetch error on the authenticated CMS admin page). Maps to no threat ID. Recommend `textContent` in a future pass. |

## Notes

- **N1 (T-01-02):** The plan's declared mitigation was "report body is never logged." The implementation evolved per REVIEW WR-05 to log a single sanitized, size-capped line per report (so the Report-Only rollout has a feedback signal). The underlying security property — no log injection (charset whitelist excludes CR/LF/spaces), no reflection (empty 204 body) — is verified present in code, and the bounded log (one ≤~420-char line per ≤16 KB request) does not reopen T-01-01.
- **N2 (T-01-05):** Code-level verification is complete (Report-Only only, no enforcing CSP anywhere, api.github.com/formspree.io/Instagram allowlisted). The live confirmation (zero CSP-blocked-resource console errors on Keystatic save, Formspree submit, on a Cloudflare deploy) is explicitly deferred to phase verification per the plan — it is not observable in `astro dev` or static builds.
- **N3 (T-01-09):** The plan's acceptance criterion said the gitignored `public/images/generated/tagesschule-hero.png` disk copy should survive untracking; on this working tree it is absent (the `generated/` dir exists but holds only `generation_log.json` and `programs/`). Gitignored files do not travel through clones, so this is expected on a fresh checkout and has zero live impact: nothing references the generated/ path (grep = 0) and the tracked `public/images/programs/` copy — the only referenced path — exists on disk and in the index. The threat outcome (broken live hero) did not occur.
- **Summaries:** Only 01-02-SUMMARY.md contains a threat-surface section ("no new security-relevant surface"). 01-01 and 01-03 summaries contain no `## Threat Flags` section; the two unregistered flags above were found by direct code inspection during this audit.
- **Residual (out of phase scope, already tracked in REVIEW):** IN-06 (CMS `programmeHeroes.tagesschule` points at the homepage hero, making the relocated fallback dead at render time — content decision, availability/cosmetic only) and IN-07 (dead EN title fallback) are documented in 01-REVIEW.md and are not security gaps.
