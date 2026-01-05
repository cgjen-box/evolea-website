import { defineMiddleware } from 'astro:middleware';

// Script to hide Keystatic's built-in Deploy button (it doesn't work without Keystatic Cloud)
// Users just need to click Save - Cloudflare auto-deploys from GitHub
const hideDeployButtonScript = `<script>
(function(){
  function hideDeployButton() {
    // Hide Keystatic's built-in Deploy button
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

  // Also try immediately and after short delays
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
        modifiedHtml = html.replace('</body>', hideDeployButtonScript + '</body>');
      } else {
        modifiedHtml = html + hideDeployButtonScript;
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
