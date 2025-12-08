import { defineMiddleware } from 'astro:middleware';

const CLOUDFLARE_DEPLOY_HOOK = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/3e0b6230-6965-46cf-a7a2-176969101e48';

// Floating deploy button HTML to inject into Keystatic pages
const deployButtonScript = `
<style>
  #evolea-deploy-btn {
    position: fixed;
    top: 12px;
    right: 16px;
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(221, 72, 224, 0.3);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  #evolea-deploy-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(221, 72, 224, 0.4);
  }
  #evolea-deploy-btn:disabled {
    opacity: 0.7;
    cursor: wait;
  }
  #evolea-deploy-btn svg {
    width: 16px;
    height: 16px;
  }
  #evolea-deploy-btn .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid white;
    border-top-color: transparent;
    border-radius: 50%;
    animation: evolea-spin 0.8s linear infinite;
  }
  @keyframes evolea-spin { to { transform: rotate(360deg); } }
  #evolea-deploy-toast {
    position: fixed;
    top: 60px;
    right: 16px;
    z-index: 99999;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: none;
  }
  #evolea-deploy-toast.success {
    display: block;
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  #evolea-deploy-toast.error {
    display: block;
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
</style>
<button id="evolea-deploy-btn" onclick="evoleaDeploy()">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 19V5M5 12l7-7 7 7"/>
  </svg>
  Deploy
</button>
<div id="evolea-deploy-toast"></div>
<script>
async function evoleaDeploy() {
  var btn = document.getElementById('evolea-deploy-btn');
  var toast = document.getElementById('evolea-deploy-toast');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Deploying...';
  toast.className = '';
  toast.style.display = 'none';
  try {
    var response = await fetch('/api/deploy', { method: 'POST' });
    var data = await response.json();
    if (data.success) {
      toast.className = 'success';
      toast.textContent = 'Deploy gestartet! Live in 1-2 Min.';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Deployed!';
      setTimeout(function() {
        toast.style.display = 'none';
        btn.disabled = false;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg> Deploy';
      }, 5000);
    } else {
      throw new Error(data.error || 'Deploy failed');
    }
  } catch (error) {
    toast.className = 'error';
    toast.textContent = 'Fehler: ' + error.message;
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg> Deploy';
    setTimeout(function() { toast.style.display = 'none'; }, 5000);
  }
}
</script>
`;

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

  // Only inject deploy button on /keystatic pages
  if (!url.pathname.startsWith('/keystatic')) {
    return next();
  }

  // Get the response from Keystatic - clone it so we can read body
  const response = await next();

  // Only modify HTML responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('text/html')) {
    return response;
  }

  // Clone before reading to preserve the original
  const clonedResponse = response.clone();

  // Read the HTML and inject the deploy button
  try {
    const html = await clonedResponse.text();
    if (html.includes('</body>')) {
      const modifiedHtml = html.replace('</body>', deployButtonScript + '</body>');
      return new Response(modifiedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });
    }
  } catch {
    // If anything fails, return original response
  }

  return response;
});
