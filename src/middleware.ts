import { defineMiddleware, sequence } from 'astro:middleware';
import {
  SECURITY_HEADERS,
  CSP_REPORT_ONLY,
  CSP_REPORT_ONLY_KEYSTATIC,
} from '@/lib/security-headers';

// Script to enhance Keystatic CMS:
// 1. Hide the Deploy button (doesn't work without Keystatic Cloud)
// 2. Show success/failure toast after Save
const keystaticEnhancementsScript = `<script>
(function(){
  // === Toast notification system ===
  var toastContainer = null;

  function createToastContainer() {
    if (toastContainer) return toastContainer;
    toastContainer = document.createElement('div');
    toastContainer.id = 'evolea-toast-container';
    toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  function showToast(message, type) {
    var container = createToastContainer();
    var toast = document.createElement('div');
    var bgColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
    toast.style.cssText = 'background:' + bgColor + ';color:white;padding:14px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:system-ui,sans-serif;font-size:14px;max-width:320px;animation:slideIn 0.3s ease;';
    toast.innerHTML = message;
    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(function() {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(function() { toast.remove(); }, 300);
    }, 5000);
  }

  // Add animation styles
  var style = document.createElement('style');
  style.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}';
  document.head.appendChild(style);

  // === Intercept fetch to detect save success/failure ===
  var originalFetch = window.fetch;
  window.fetch = function(url, options) {
    var urlStr = typeof url === 'string' ? url : url.toString();

    // Watch for GitHub API commits (this is how Keystatic saves)
    if (urlStr.includes('api.github.com') && options && options.method === 'PUT') {
      return originalFetch.apply(this, arguments).then(function(response) {
        if (response.ok) {
          showToast('<strong>Gespeichert!</strong><br>Änderungen sind in 1-2 Min. live.', 'success');
        } else {
          response.clone().text().then(function(text) {
            showToast('<strong>Fehler beim Speichern</strong><br>Bitte erneut versuchen.', 'error');
          });
        }
        return response;
      }).catch(function(error) {
        showToast('<strong>Fehler beim Speichern</strong><br>' + error.message, 'error');
        throw error;
      });
    }

    return originalFetch.apply(this, arguments);
  };

  // === Hide Deploy button ===
  function hideDeployButton() {
    var buttons = document.querySelectorAll('nav button, aside button');
    buttons.forEach(function(btn) {
      if (btn.textContent && btn.textContent.toLowerCase().includes('deploy')) {
        btn.style.display = 'none';
      }
    });
  }

  // Watch for Keystatic UI to load
  var observer = new MutationObserver(hideDeployButton);
  observer.observe(document.body, { childList: true, subtree: true });

  hideDeployButton();
  setTimeout(hideDeployButton, 500);
  setTimeout(hideDeployButton, 1500);
})();
</script>`;

// Security headers middleware: applies the SECURITY_HEADERS constant to every
// response and sets Content-Security-Policy-Report-Only (looser variant under
// /keystatic). Silent-safe: header failures never break a page response.
const securityHeaders = defineMiddleware(async (context, next) => {
  const response = await next();

  try {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value);
    }
    const csp = context.url.pathname.startsWith('/keystatic')
      ? CSP_REPORT_ONLY_KEYSTATIC
      : CSP_REPORT_ONLY;
    response.headers.set('Content-Security-Policy-Report-Only', csp);
  } catch {
    // If header mutation fails, return the response untouched — never break a page.
    return response;
  }

  return response;
});

// Keystatic enhancement middleware: injects the deploy-button-hide + save-toast
// script into /keystatic HTML responses. Fixes the prior double-next() bug by
// cloning the body before reading and returning the original response on failure.
const keystaticEnhancements = defineMiddleware(async (context, next) => {
  const { url } = context;
  const response = await next();

  // Only the /keystatic path gets enhanced; everything else passes through.
  if (!url.pathname.startsWith('/keystatic')) {
    return response;
  }

  // Only modify HTML responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('text/html')) {
    return response;
  }

  try {
    // Clone before consuming so the original body stays intact if injection fails.
    const html = await response.clone().text();
    // Inject script at end of document
    let modifiedHtml = html;
    if (html.includes('</body>')) {
      modifiedHtml = html.replace('</body>', keystaticEnhancementsScript + '</body>');
    } else {
      modifiedHtml = html + keystaticEnhancementsScript;
    }
    const headers = new Headers(response.headers);
    // The body just grew by the injected script; a copied upstream
    // Content-Length would truncate the response on length-honoring servers
    // (dev/preview). Delete it so the runtime recomputes the correct length.
    headers.delete('content-length');
    return new Response(modifiedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    // If anything fails, return the original (un-consumed) response — NEVER call next() again.
    return response;
  }
});

// securityHeaders runs first in the sequence so it wraps outermost (applies its
// headers on the way out, after keystaticEnhancements has rebuilt the Response).
export const onRequest = sequence(securityHeaders, keystaticEnhancements);
