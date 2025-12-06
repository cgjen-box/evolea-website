# EVOLEA CMS Setup Guide

This project uses **Keystatic CMS** for content management with GitHub integration, allowing your team to edit content directly in the browser.

## Architecture

- **Main Website**: GitHub Pages (static) - https://cgjen-box.github.io/evolea-website/
- **CMS Admin**: Cloudflare Pages (hybrid/SSR) - https://evolea-cms.pages.dev

The CMS commits changes directly to GitHub, which triggers GitHub Actions to rebuild and deploy the static site.

## Setup Instructions

### 1. Deploy CMS to Cloudflare Pages (Free)

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) and sign up/login
2. Click "Create a project" → "Connect to Git"
3. Connect your GitHub account and select `cgjen-box/evolea-website`
4. Configure build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click "Save and Deploy"
6. Note your Cloudflare Pages URL (e.g., `evolea-cms.pages.dev`)

### 2. Create GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → [OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: EVOLEA CMS
   - **Homepage URL**: `https://evolea-cms.pages.dev` (your Cloudflare URL)
   - **Authorization callback URL**: `https://evolea-cms.pages.dev/api/keystatic/github/oauth/callback`
4. Click "Register application"
5. Copy the **Client ID**
6. Click "Generate a new client secret" and copy it

### 3. Configure Cloudflare Environment Variables

In your Cloudflare Pages dashboard:

1. Go to your project → Settings → Environment variables
2. Add these variables (for **Production** environment):

| Variable | Value |
|----------|-------|
| `KEYSTATIC_GITHUB_CLIENT_ID` | Your GitHub OAuth Client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Your GitHub OAuth Client Secret |
| `KEYSTATIC_SECRET` | A random string (use `openssl rand -hex 32` to generate) |

3. Trigger a new deployment (Settings → Builds → Retry deployment)

### 4. Access the CMS

1. Go to `https://evolea-cms.pages.dev/keystatic`
2. Click "Sign in with GitHub"
3. Authorize the app
4. Start editing!

## What You Can Edit

### Blog Posts
- Create, edit, and delete blog articles
- Add images, tags, and set featured status
- Full markdown editor with preview

### Site Settings
- Website name and description (DE/EN)
- Contact email
- Social media links
- Address information

### UI Translations
- Navigation labels
- Hero section text
- Footer content
- Common UI strings

### Page Content
- Homepage content
- Section headings and descriptions
- Call-to-action text

## How It Works

```
┌─────────────────┐     commits      ┌─────────────────┐
│  Keystatic CMS  │ ───────────────> │     GitHub      │
│  (Cloudflare)   │                  │   Repository    │
└─────────────────┘                  └────────┬────────┘
                                              │
                                              │ triggers
                                              ▼
┌─────────────────┐     deploys      ┌─────────────────┐
│  GitHub Pages   │ <─────────────── │  GitHub Actions │
│  (Static Site)  │                  │    (Build)      │
└─────────────────┘                  └─────────────────┘
```

1. **Editor makes change** in Keystatic CMS
2. **Keystatic commits** the change to GitHub
3. **GitHub Actions** automatically rebuilds the static site
4. **GitHub Pages** serves the updated site

Changes typically appear on the live site within 2-3 minutes.

## Local Development

For local development, run in static mode:

```bash
npm run dev
```

Note: The Cloudflare adapter doesn't support Windows ARM64 locally, but this doesn't affect deployment. For local CMS testing, you can edit content files directly or use GitHub's web editor.

## Troubleshooting

### "Unauthorized" error when signing in
- Check that your OAuth callback URL matches exactly: `https://YOUR-CLOUDFLARE-URL/api/keystatic/github/oauth/callback`
- Verify environment variables are set in Cloudflare Pages

### Changes not appearing on live site
- Check GitHub Actions for build errors
- Verify the commit was made to the `main` branch

### CMS shows blank page
- Clear browser cache
- Check browser console for errors
- Verify Cloudflare deployment succeeded

### Build fails on Cloudflare
- Check that all environment variables are set
- Look at the build logs for specific errors

## Team Access

Any team member with:
1. GitHub access to the repository
2. Permission to authorize OAuth apps

Can use the CMS. No additional accounts needed!

## Cloudflare Pages Free Tier Limits

- **Builds**: 500 per month
- **Bandwidth**: Unlimited
- **Sites**: Unlimited
- **Custom domains**: Supported

These limits are very generous for a CMS that only rebuilds when content changes.

## Security Notes

- The CMS only has access to this repository
- All changes are tracked in git history
- OAuth tokens are securely managed by Keystatic
- Cloudflare environment variables are encrypted
