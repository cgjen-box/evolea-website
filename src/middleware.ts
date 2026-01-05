import { defineMiddleware } from 'astro:middleware';

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

export const onRequest = defineMiddleware(async (context, next) => {
  const { url } = context;

  // Inject script to hide Deploy button on /keystatic pages
  if (url.pathname.startsWith('/keystatic')) {
    const response = await next();

    // Only modify HTML responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      return response;
    }

    try {
      const html = await response.text();
      // Inject script at end of document
      let modifiedHtml = html;
      if (html.includes('</body>')) {
        modifiedHtml = html.replace('</body>', keystaticEnhancementsScript + '</body>');
      } else {
        modifiedHtml = html + keystaticEnhancementsScript;
      }
      return new Response(modifiedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });
    } catch {
      // If anything fails, return original
    }

    return next();
  }

  // Pass through all other requests
  return next();
});
