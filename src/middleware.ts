import { defineMiddleware } from 'astro:middleware';

const CLOUDFLARE_DEPLOY_HOOK = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/3e0b6230-6965-46cf-a7a2-176969101e48';

// Minimal script to inject deploy button into Keystatic navbar
const deployScript = `<script>
(function(){
  var injected = false;

  function createDeployButton() {
    if (injected) return;

    // Find Keystatic's sidebar navigation - look for the nav element with links
    var sidebar = document.querySelector('nav[class*="sidebar"], aside nav, [data-sidebar] nav, header nav');
    if (!sidebar) {
      // Try finding by structure - Keystatic has a left sidebar with navigation
      var navLinks = document.querySelectorAll('a[href*="/keystatic"]');
      if (navLinks.length > 0) {
        sidebar = navLinks[0].closest('nav') || navLinks[0].closest('aside');
      }
    }

    // Alternative: find the main sidebar container
    if (!sidebar) {
      var aside = document.querySelector('aside');
      if (aside) sidebar = aside;
    }

    if (!sidebar) return;

    injected = true;

    // Create deploy button container
    var container = document.createElement('div');
    container.id = 'evolea-deploy-container';
    container.style.cssText = 'padding:12px 16px;border-bottom:1px solid #e5e7eb;';

    // Create the button
    var btn = document.createElement('button');
    btn.id = 'evolea-deploy-btn';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M12 19V5M5 12l7-7 7 7"/></svg>Deploy';
    btn.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;padding:10px 16px;background:linear-gradient(135deg,#DD48E0 0%,#BA53AD 100%);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity 0.2s,transform 0.2s;';

    btn.onmouseover = function(){ this.style.opacity='0.9'; this.style.transform='translateY(-1px)'; };
    btn.onmouseout = function(){ this.style.opacity='1'; this.style.transform='none'; };

    btn.onclick = async function() {
      var originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:evolea-spin 0.8s linear infinite;margin-right:6px"></span>Deploying...';
      btn.style.opacity = '0.7';

      try {
        var response = await fetch('/api/deploy', { method: 'POST' });
        var data = await response.json();
        if (data.success) {
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M20 6L9 17l-5-5"/></svg>Deployed!';
          btn.style.background = '#22c55e';
          showToast('Deploy gestartet! Live in 1-2 Min.', 'success');
        } else {
          throw new Error(data.error || 'Deploy failed');
        }
      } catch (e) {
        btn.innerHTML = originalHTML;
        showToast('Fehler: ' + e.message, 'error');
      }

      setTimeout(function() {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        btn.style.opacity = '1';
        btn.style.background = 'linear-gradient(135deg,#DD48E0 0%,#BA53AD 100%)';
      }, 4000);
    };

    container.appendChild(btn);

    // Insert at the top of sidebar
    sidebar.insertBefore(container, sidebar.firstChild);

    // Add keyframe animation
    if (!document.getElementById('evolea-deploy-styles')) {
      var style = document.createElement('style');
      style.id = 'evolea-deploy-styles';
      style.textContent = '@keyframes evolea-spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);
    }
  }

  function showToast(message, type) {
    var existing = document.getElementById('evolea-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'evolea-toast';
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;top:16px;right:16px;z-index:99999;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:evolea-fade-in 0.3s ease;';
    toast.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
    toast.style.color = type === 'success' ? '#155724' : '#721c24';
    document.body.appendChild(toast);

    setTimeout(function() { toast.remove(); }, 4000);
  }

  // Watch for Keystatic UI to load
  var observer = new MutationObserver(function() {
    if (!injected) createDeployButton();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also try immediately and after short delays
  createDeployButton();
  setTimeout(createDeployButton, 500);
  setTimeout(createDeployButton, 1500);
  setTimeout(createDeployButton, 3000);
})();
</script>`;

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

  // Inject deploy button script on /keystatic pages
  if (url.pathname.startsWith('/keystatic')) {
    const response = await next();

    // Only modify HTML responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      return response;
    }

    try {
      const html = await response.text();
      // Inject script at end of document (Keystatic doesn't have traditional </head>)
      // Look for </astro-island> or end of document
      let modifiedHtml = html;
      if (html.includes('</astro-island>')) {
        modifiedHtml = html.replace('</astro-island>', '</astro-island>' + deployScript);
      } else if (html.includes('</body>')) {
        modifiedHtml = html.replace('</body>', deployScript + '</body>');
      } else {
        // Append to end of document
        modifiedHtml = html + deployScript;
      }
      return new Response(modifiedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });
    } catch {
      // If anything fails, return original - need to re-fetch since body was consumed
    }

    // Fallback: return original response (re-request since body was consumed)
    return next();
  }

  // Pass through all other requests
  return next();
});
