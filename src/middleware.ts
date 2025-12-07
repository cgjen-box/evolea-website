import { defineMiddleware, sequence } from 'astro:middleware';

// Password gate middleware for Keystatic admin
const keystaticPasswordGate = defineMiddleware(async (context, next) => {
  const { url, cookies, request } = context;

  // Only apply to /keystatic routes
  if (!url.pathname.startsWith('/keystatic')) {
    return next();
  }

  // Allow API routes (needed for Keystatic to work)
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  // Check if password protection is enabled
  const password = import.meta.env.KEYSTATIC_ACCESS_PASSWORD;
  if (!password) {
    // No password set, allow access
    return next();
  }

  // Check if already authenticated via cookie
  const isAuthenticated = cookies.get('keystatic_access')?.value === 'granted';
  if (isAuthenticated) {
    return next();
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

export const onRequest = sequence(keystaticPasswordGate);
