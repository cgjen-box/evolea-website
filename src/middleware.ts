import { defineMiddleware, sequence } from 'astro:middleware';

const CLOUDFLARE_DEPLOY_HOOK = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/3e0b6230-6965-46cf-a7a2-176969101e48';

// Deploy API handler
const deployHandler = defineMiddleware(async (context, next) => {
  const { url, cookies, request } = context;

  // Handle deploy API
  if (url.pathname === '/api/deploy' && request.method === 'POST') {
    const isAuthenticated = cookies.get('keystatic_access')?.value === 'granted';

    if (!isAuthenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const response = await fetch(CLOUDFLARE_DEPLOY_HOOK, { method: 'POST' });
      const data = await response.json();

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
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to trigger deployment'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle deploy page
  if (url.pathname === '/keystatic/deploy') {
    const isAuthenticated = cookies.get('keystatic_access')?.value === 'granted';

    if (!isAuthenticated) {
      return context.redirect('/keystatic/');
    }

    const deployPageHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>EVOLEA CMS - Deploy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8f9fa;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 600px; margin: 0 auto; }
    .card {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e5e5e5;
    }
    .back-link {
      color: #DD48E0;
      text-decoration: none;
      font-size: 0.9rem;
    }
    .back-link:hover { text-decoration: underline; }
    h1 { font-size: 1.5rem; color: #2D2A32; font-weight: 600; }
    .description { color: #5C5762; margin-bottom: 2rem; line-height: 1.6; }
    .deploy-btn {
      width: 100%;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .deploy-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(221, 72, 224, 0.4);
    }
    .deploy-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .status {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 0.5rem;
      display: none;
    }
    .status.success { display: block; background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .status.error { display: block; background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .status.loading { display: block; background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .info-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: #0369a1;
    }
    .info-box strong { display: block; margin-bottom: 0.25rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <a href="/keystatic/" class="back-link">← Zurück zum CMS</a>
      </div>
      <h1>Deploy to Live</h1>
      <p class="description">
        Nachdem du Änderungen im CMS gespeichert hast, klicke hier um sie auf der
        Live-Website zu veröffentlichen. Der Deploy dauert ca. 1-2 Minuten.
      </p>
      <button class="deploy-btn" id="deployBtn" onclick="triggerDeploy()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        Deploy to Live
      </button>
      <div class="status" id="status"></div>
      <div class="info-box">
        <strong>Hinweis:</strong>
        GitHub Pages wird automatisch aktualisiert. Dieser Button ist nur für die
        Cloudflare-Version (evolea-website.pages.dev) notwendig.
      </div>
    </div>
  </div>
  <script>
    async function triggerDeploy() {
      const btn = document.getElementById('deployBtn');
      const status = document.getElementById('status');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Deploying...';
      status.className = 'status loading';
      status.textContent = 'Deployment wird gestartet...';
      try {
        const response = await fetch('/api/deploy', { method: 'POST', credentials: 'include' });
        const data = await response.json();
        if (data.success) {
          status.className = 'status success';
          status.innerHTML = '✓ ' + data.message;
          btn.innerHTML = '✓ Deployed!';
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg> Deploy to Live';
          }, 5000);
        } else {
          throw new Error(data.error || 'Deployment failed');
        }
      } catch (error) {
        status.className = 'status error';
        status.textContent = '✗ Fehler: ' + error.message;
        btn.disabled = false;
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg> Deploy to Live';
      }
    }
  </script>
</body>
</html>`;

    return new Response(deployPageHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return next();
});

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
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
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
  const btn = document.getElementById('evolea-deploy-btn');
  const toast = document.getElementById('evolea-deploy-toast');

  // First, try to click the save button if it exists and is enabled
  const saveBtn = document.querySelector('button[type="submit"], button:has(svg[data-icon="save"]), form button[type="submit"]');
  if (saveBtn && !saveBtn.disabled) {
    saveBtn.click();
    await new Promise(r => setTimeout(r, 1000)); // Wait for save
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Deploying...';
  toast.className = '';
  toast.style.display = 'none';

  try {
    const response = await fetch('/api/deploy', { method: 'POST', credentials: 'include' });
    const data = await response.json();
    if (data.success) {
      toast.className = 'success';
      toast.textContent = '✓ Deploy gestartet! Live in 1-2 Min.';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Deployed!';
      setTimeout(() => {
        toast.style.display = 'none';
        btn.disabled = false;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg> Deploy';
      }, 5000);
    } else {
      throw new Error(data.error || 'Deploy failed');
    }
  } catch (error) {
    toast.className = 'error';
    toast.textContent = '✗ ' + error.message;
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg> Deploy';
    setTimeout(() => { toast.style.display = 'none'; }, 5000);
  }
}
</script>
`;

// Password gate middleware for Keystatic admin
const keystaticPasswordGate = defineMiddleware(async (context, next) => {
  const { url, cookies, request } = context;

  // Only apply to /keystatic routes (but not /keystatic/deploy which is handled above)
  if (!url.pathname.startsWith('/keystatic') || url.pathname === '/keystatic/deploy') {
    return next();
  }

  // Allow API routes (needed for Keystatic to work)
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  // Check if password protection is enabled
  const password = import.meta.env.KEYSTATIC_ACCESS_PASSWORD;
  if (!password) {
    // No password set, but still inject deploy button
    const response = await next();
    if (response.headers.get('content-type')?.includes('text/html')) {
      const html = await response.text();
      const modifiedHtml = html.replace('</body>', deployButtonScript + '</body>');
      return new Response(modifiedHtml, {
        status: response.status,
        headers: response.headers,
      });
    }
    return response;
  }

  // Check if already authenticated via cookie
  const isAuthenticated = cookies.get('keystatic_access')?.value === 'granted';
  if (isAuthenticated) {
    // Inject deploy button into authenticated Keystatic pages
    const response = await next();
    if (response.headers.get('content-type')?.includes('text/html')) {
      const html = await response.text();
      const modifiedHtml = html.replace('</body>', deployButtonScript + '</body>');
      return new Response(modifiedHtml, {
        status: response.status,
        headers: response.headers,
      });
    }
    return response;
  }

  // Handle POST (password submission)
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const submittedPassword = formData.get('password');

      if (submittedPassword === password) {
        // Set authentication cookie (24 hours)
        cookies.set('keystatic_access', 'granted', {
          path: '/keystatic',
          maxAge: 60 * 60 * 24,
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'lax',
        });
        // Redirect to same URL to show the Keystatic UI
        return context.redirect(url.pathname);
      }
    } catch {
      // Form parsing failed, show login form
    }
  }

  // Show login form
  const showError = request.method === 'POST';
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>EVOLEA CMS - Login</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #7BEDD5 0%, #FFE066 21%, #FFFFFF 48%, #E97BF1 81%, #CD87F8 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .login-card {
      background: white;
      border-radius: 1.5rem;
      padding: 3rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
      max-width: 400px;
      width: 100%;
      text-align: center;
    }
    .logo {
      font-size: 2rem;
      font-weight: 700;
      color: #DD48E0;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #5C5762;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
      text-align: left;
    }
    label {
      display: block;
      color: #2D2A32;
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    input[type="password"] {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #E5E5E5;
      border-radius: 0.75rem;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    input[type="password"]:focus {
      border-color: #DD48E0;
      box-shadow: 0 0 0 3px rgba(221, 72, 224, 0.1);
    }
    button {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(221, 72, 224, 0.4);
    }
    button:active { transform: translateY(0); }
    .hint {
      margin-top: 1.5rem;
      color: #9CA3AF;
      font-size: 0.8rem;
    }
    .error {
      background: #FEE2E2;
      color: #DC2626;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="logo">EVOLEA CMS</div>
    <p class="subtitle">Content Management System</p>
    ${showError ? '<div class="error">Falsches Passwort. Bitte versuchen Sie es erneut.</div>' : ''}
    <form method="POST">
      <div class="form-group">
        <label for="password">Zugangspasswort</label>
        <input type="password" id="password" name="password" placeholder="Passwort eingeben..." required autofocus />
      </div>
      <button type="submit">Anmelden</button>
    </form>
    <p class="hint">Nach der Anmeldung werden Sie zur GitHub-Authentifizierung weitergeleitet.</p>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: showError ? 401 : 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
});

export const onRequest = sequence(deployHandler, keystaticPasswordGate);
