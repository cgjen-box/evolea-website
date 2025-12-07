import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  // Check environment variables from different sources
  const envInfo = {
    // Build-time injected via vite.define
    viteDefine: {
      KEYSTATIC_GITHUB_CLIENT_ID: process.env.KEYSTATIC_GITHUB_CLIENT_ID ? 'SET (length: ' + process.env.KEYSTATIC_GITHUB_CLIENT_ID.length + ')' : 'NOT SET',
      KEYSTATIC_GITHUB_CLIENT_SECRET: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET ? 'SET (length: ' + process.env.KEYSTATIC_GITHUB_CLIENT_SECRET.length + ')' : 'NOT SET',
      KEYSTATIC_SECRET: process.env.KEYSTATIC_SECRET ? 'SET (length: ' + process.env.KEYSTATIC_SECRET.length + ')' : 'NOT SET',
    },
    // Runtime from Cloudflare
    cloudflareRuntime: {},
    // Check if locals.runtime exists
    hasRuntime: !!(locals as any).runtime,
    hasRuntimeEnv: !!(locals as any).runtime?.env,
  };

  // Try to access Cloudflare runtime env
  try {
    const runtime = (locals as any).runtime;
    if (runtime?.env) {
      envInfo.cloudflareRuntime = {
        KEYSTATIC_GITHUB_CLIENT_ID: runtime.env.KEYSTATIC_GITHUB_CLIENT_ID ? 'SET' : 'NOT SET',
        KEYSTATIC_GITHUB_CLIENT_SECRET: runtime.env.KEYSTATIC_GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET',
        KEYSTATIC_SECRET: runtime.env.KEYSTATIC_SECRET ? 'SET' : 'NOT SET',
      };
    }
  } catch (e) {
    (envInfo as any).runtimeError = String(e);
  }

  return new Response(JSON.stringify(envInfo, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
