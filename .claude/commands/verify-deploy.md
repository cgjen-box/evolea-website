# Verify Deployment

After every git push, verify that the deployment succeeded:

## Steps to perform:

1. **Check GitHub Actions status** - Fetch https://github.com/cgjen-box/evolea-website/actions and look for:
   - Build status (success/failure)
   - Any TypeScript errors
   - Any build errors or warnings

2. **If GitHub Actions failed**, analyze the error and fix it immediately.

3. **If GitHub Actions passed**, verify the live sites:
   - Production: https://www.evolea.ch/
   - Staging: https://evolea-website.pages.dev/
   - GitHub Pages: https://cgjen-box.github.io/evolea-website/
   - Keystatic CMS: https://www.evolea.ch/keystatic

4. **Report the results** to the user with:
   - Build status
   - Any errors found
   - Confirmation that changes are live

## Common issues to watch for:
- TypeScript errors (unused variables, wrong imports)
- Missing module exports
- Cloudflare caching old versions (may need 2-3 min)
