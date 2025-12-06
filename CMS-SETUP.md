# EVOLEA CMS Setup Guide

This project uses **Keystatic CMS** for content management with GitHub integration, allowing your team to edit content directly in the browser.

## Architecture

- **Main Website**: GitHub Pages (static) - https://cgjen-box.github.io/evolea-website/
- **CMS Admin**: Vercel (hybrid/SSR) - Your Vercel URL

The CMS commits changes directly to GitHub, which triggers GitHub Actions to rebuild and deploy the static site.

## Setup Instructions

### 1. Deploy CMS to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click "Add New Project"
3. Import the `cgjen-box/evolea-website` repository
4. Vercel will auto-detect Astro - click "Deploy"
5. Note your Vercel URL (e.g., `evolea-website-cms.vercel.app`)

### 2. Create GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: EVOLEA CMS
   - **Homepage URL**: Your Vercel URL (e.g., `https://evolea-website-cms.vercel.app`)
   - **Authorization callback URL**: `https://YOUR-VERCEL-URL/api/keystatic/github/oauth/callback`
4. Click "Register application"
5. Copy the **Client ID**
6. Click "Generate a new client secret" and copy it

### 3. Configure Vercel Environment Variables

In your Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Add these variables:

| Variable | Value |
|----------|-------|
| `KEYSTATIC_GITHUB_CLIENT_ID` | Your GitHub OAuth Client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Your GitHub OAuth Client Secret |
| `KEYSTATIC_SECRET` | A random string (generate with `openssl rand -hex 32`) |

3. Redeploy the project

### 4. Access the CMS

1. Go to `https://YOUR-VERCEL-URL/keystatic`
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

1. **Editor makes change** in Keystatic CMS
2. **Keystatic commits** the change to GitHub
3. **GitHub Actions** automatically rebuilds the static site
4. **GitHub Pages** serves the updated site

Changes typically appear on the live site within 2-3 minutes.

## Local Development

For local development, the CMS runs in "local" mode (no GitHub auth needed):

```bash
npm run dev
```

Then visit `http://localhost:4321/keystatic` to access the local CMS.

## Troubleshooting

### "Unauthorized" error when signing in
- Check that your OAuth callback URL matches exactly
- Verify environment variables are set in Vercel

### Changes not appearing on live site
- Check GitHub Actions for build errors
- Verify the commit was made to the `main` branch

### CMS shows blank page
- Clear browser cache
- Check browser console for errors
- Verify Vercel deployment succeeded

## Team Access

Any team member with:
1. GitHub access to the repository
2. Permission to authorize OAuth apps

Can use the CMS. No additional accounts needed!

## Security Notes

- The CMS only has access to this repository
- All changes are tracked in git history
- OAuth tokens are securely managed by Keystatic
- Vercel environment variables are encrypted
