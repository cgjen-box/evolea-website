import { defineMiddleware } from 'astro:middleware';

const CLOUDFLARE_DEPLOY_HOOK = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/3e0b6230-6965-46cf-a7a2-176969101e48';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;

  // Handle deploy API endpoint
  if (url.pathname === '/api/deploy' && request.method === 'POST') {
    try {
      const response = await fetch(CLOUDFLARE_DEPLOY_HOOK, { method: 'POST' });
      const data = await response.json() as { success: boolean; result?: { id: string } };

      if (data.success) {
        return new Response(JSON.stringify({
          success: true,
          message: 'Deployment gestartet! Die Änderungen sind in 1-2 Minuten live.',
          deployId: data.result?.id
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({
          success: false,
          error: 'Cloudflare deployment failed'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to trigger deployment'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Pass through all other requests (including /keystatic)
  return next();
});
