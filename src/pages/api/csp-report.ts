import type { APIRoute } from 'astro';

// __SSR_BUILD__ is injected by astro.config.mjs (Vite `define`): true only when
// the Cloudflare adapter is active (output: 'server'). In static builds
// (GitHub Pages, or adapter-absent local) it is false.
//
// SEC-04 endpoint behaviour:
//   - Cloudflare (SSR): prerender=false → live POST sink for CSP violation reports.
//   - Static build: prerender=true → the route is prerendered to a harmless
//     static 204 response and the server endpoint is excluded, so the build
//     does NOT hit NoAdapterInstalled. GitHub Pages has no CSP report-uri source
//     anyway (public/_headers is Cloudflare-only), so losing the live sink there
//     is acceptable.
declare const __SSR_BUILD__: boolean;

export const prerender = !__SSR_BUILD__;

// Accepts CSP violation reports (application/csp-report or application/json).
// Silent-safe: never throws, always returns 204 No Content with an empty body.
//
// Memory safety (WR-01): the endpoint is unauthenticated, so the body is never
// buffered unbounded. Bodies whose declared Content-Length exceeds the cap are
// cancelled unread; otherwise a streaming read aborts as soon as the cap is hit.
//
// Feedback signal (WR-05): a strictly sanitized, size-capped one-line summary
// (violated-directive + blocked-uri only, charset-stripped, 200 chars each) is
// logged via console.log so Cloudflare Pages Functions logs show real
// violations and the Report-Only allowlist can be tightened over time.
// Attacker-controlled content is never stored or reflected, and never logged
// beyond those two truncated, sanitized fields.
const MAX_REPORT_BYTES = 16_384; // real CSP reports are ~1 KB; bigger is junk

function sanitizeField(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[^\w\-./:]/g, '').slice(0, 200);
}

async function readBodyCapped(
  body: ReadableStream<Uint8Array> | null,
  cap: number
): Promise<string | null> {
  if (!body) return null;
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > cap) {
      // Over the cap: stop reading immediately and signal "skip logging".
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(buf);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Content-Length gate: don't even start reading an oversized body.
    const declared = Number(request.headers.get('content-length') ?? '0');
    if (Number.isFinite(declared) && declared > MAX_REPORT_BYTES) {
      await request.body?.cancel();
      return new Response(null, { status: 204 });
    }

    const text = await readBodyCapped(request.body, MAX_REPORT_BYTES);
    if (text) {
      const parsed: unknown = JSON.parse(text);
      const outer =
        parsed && typeof parsed === 'object'
          ? (parsed as Record<string, unknown>)
          : {};
      // report-uri wraps the report in a top-level "csp-report" key.
      const inner = 'csp-report' in outer ? outer['csp-report'] : outer;
      const report =
        inner && typeof inner === 'object'
          ? (inner as Record<string, unknown>)
          : {};
      const directive = sanitizeField(
        report['violated-directive'] ?? report['effective-directive']
      );
      const blockedUri = sanitizeField(report['blocked-uri']);
      if (directive || blockedUri) {
        console.log(
          `[csp-report] directive=${directive || '-'} blocked-uri=${blockedUri || '-'}`
        );
      }
    }
  } catch {
    // Oversized, malformed, or non-JSON body — skip logging; 204 regardless.
  }

  return new Response(null, { status: 204 });
};

// GET handler so the route is prerenderable in static builds (returns the same
// empty 204). On Cloudflare this is also a valid no-op for accidental GETs.
export const GET: APIRoute = async () => new Response(null, { status: 204 });
