// Debug endpoint to check environment variables on Cloudflare
// DELETE THIS FILE after debugging!

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const runtime = (context.locals as any)?.runtime;
  const env = runtime?.env;

  const debug = {
    hasRuntime: !!runtime,
    hasEnv: !!env,
    envKeys: env ? Object.keys(env) : [],
    hasClientId: !!env?.KEYSTATIC_GITHUB_CLIENT_ID,
    hasClientSecret: !!env?.KEYSTATIC_GITHUB_CLIENT_SECRET,
    hasSecret: !!env?.KEYSTATIC_SECRET,
    secretLength: env?.KEYSTATIC_SECRET?.length || 0,
    clientSecretLength: env?.KEYSTATIC_GITHUB_CLIENT_SECRET?.length || 0,
    clientIdValue: env?.KEYSTATIC_GITHUB_CLIENT_ID || 'not set',
    // Also check process.env
    processEnvClientId: !!process.env.KEYSTATIC_GITHUB_CLIENT_ID,
    processEnvSecret: !!process.env.KEYSTATIC_SECRET,
    processEnvClientIdValue: process.env.KEYSTATIC_GITHUB_CLIENT_ID || 'not set',
    processEnvClientSecretLength: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET?.length || 0,
  };

  return new Response(JSON.stringify(debug, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
};
