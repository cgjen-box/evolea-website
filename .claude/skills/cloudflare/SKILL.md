---
name: cloudflare
description: Use this skill for Cloudflare Pages deployment management, cache purging, and API operations. Includes scripts for cleaning up queued deployments, managing the deployment pipeline, and interacting with Cloudflare APIs.
---

# Cloudflare Pages Management

This skill provides tools and documentation for managing the EVOLEA website's Cloudflare Pages deployment.

## Quick Reference

### NPM Scripts

```bash
# Delete only queued/in-progress deployments
npm run cf:clean-queue

# Delete ALL deployments (use with caution!)
npm run cf:clean-all
```

### PowerShell Direct Usage

```powershell
# Clean queued deployments only
.\scripts\Cancel-CloudflareDeployments.ps1 -OnlyInProgress

# Clean with auto-confirm (no prompt)
.\scripts\Cancel-CloudflareDeployments.ps1 -OnlyInProgress -Force

# Delete ALL deployments
.\scripts\Cancel-CloudflareDeployments.ps1

# Custom throttle limit (default: 10)
.\scripts\Cancel-CloudflareDeployments.ps1 -OnlyInProgress -ThrottleLimit 5
```

---

## Configuration

### Credentials File

Location: `scripts/.env.cloudflare`

```env
CF_ACCOUNT_ID=your_account_id_here
CF_API_TOKEN=your_api_token_here
```

**Security:** This file is gitignored and should never be committed.

### Finding Your Account ID

1. Go to https://dash.cloudflare.com/
2. Click **Pages** in the sidebar
3. Click **evolea-website**
4. Look at the URL: `https://dash.cloudflare.com/ACCOUNT_ID/pages/view/evolea-website`
5. Copy the 32-character hex string

### Creating an API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Click **Create Custom Token**
4. Add permissions:
   - **Account > Cloudflare Pages** → Edit
   - **Zone > Cache Purge** → Purge (optional, for cache management)
5. Under **Account Resources**: Select your account
6. Click **Continue to summary** → **Create Token**
7. Copy the token immediately (won't be shown again)

---

## Scripts

### Cancel-CloudflareDeployments.ps1

**Location:** `scripts/Cancel-CloudflareDeployments.ps1`

Bulk deletes Cloudflare Pages deployments.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `-AccountId` | string | from env | Cloudflare account ID |
| `-ApiToken` | string | from env | API token |
| `-ProjectName` | string | `evolea-website` | Pages project name |
| `-OnlyInProgress` | switch | false | Only delete queued/pending deployments |
| `-Force` | switch | false | Skip confirmation prompt |
| `-ThrottleLimit` | int | 10 | Batch size for parallel deletions |

**Deployment Statuses Filtered by `-OnlyInProgress`:**
- `active` - Currently building
- `idle` - Waiting to start
- `queued` - In queue
- `pending` - Pending start

**Example Output:**
```
=== Cloudflare Pages Bulk Deployment Cancellation ===
Project: evolea-website

Fetching deployments...
  Page 1: Found 25 deployments (matched: 17, total collected: 17)
  Page 2: Found 25 deployments (matched: 0, total collected: 17)
  (Stopping early - no more queued deployments found)

Found 17 deployments to delete

Deleting deployments...
--- Batch 1 of 2 ---
[OK] Deleted: abc123...
[OK] Deleted: def456...
Progress: 10/17 | Rate: 0.9/sec | ETA: 8s

=== Done! ===
Deleted: 17
Failed: 0
Time: 0.3 minutes
```

### cancel-cloudflare-deployments.sh (Bash)

**Location:** `scripts/cancel-cloudflare-deployments.sh`

Linux/macOS equivalent using curl and jq. Same functionality as PowerShell version.

---

## Cloudflare Pages API Reference

### Base URL
```
https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}
```

### Authentication
```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" ...
```

### List Deployments
```bash
GET /deployments?page=1&per_page=25
```

### Delete Deployment
```bash
DELETE /deployments/{deployment_id}?force=true
```

### Important Limitations
- Cannot delete the **latest production deployment** (delete the project instead)
- Rate limited to ~100 requests/minute
- Maximum `per_page` is 25 (not 100 as documented)

---

## Common Tasks

### Clear Build Queue

When deployments pile up (e.g., after multiple rapid pushes):

```bash
npm run cf:clean-queue
```

This safely removes all queued/in-progress deployments while preserving completed ones.

### Force Fresh Deployment

1. Clean the queue first:
   ```bash
   npm run cf:clean-queue
   ```

2. Trigger a new build:
   ```bash
   git commit --allow-empty -m "Trigger rebuild"
   git push
   ```

### Verify Deployment Status

Check the Cloudflare dashboard:
- https://dash.cloudflare.com/ → Pages → evolea-website → Deployments

Or use the API:
```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/evolea-website/deployments?per_page=5" \
  -H "Authorization: Bearer $CF_API_TOKEN" | jq '.result[0]'
```

---

## Troubleshooting

### "Invalid list options" Error
The Cloudflare API only accepts `per_page` up to 25. The script handles this automatically.

### "400 Bad Request" with PowerShell
If `Invoke-RestMethod` fails but curl works, the script uses curl.exe as a fallback (Windows has curl.exe built-in since Windows 10).

### Rate Limiting
If you hit rate limits, the script includes:
- 300ms delay between page fetches
- 1s delay between deletion batches
- Configurable `-ThrottleLimit` parameter

### Cannot Delete Latest Deployment
The live production deployment cannot be deleted via API. To replace it:
1. Push a new commit to trigger a new build
2. Wait for it to complete
3. Then you can delete the old deployment

### Custom Domain Shows Old Content (IMPORTANT)

**Symptoms:**
- `evolea-website.pages.dev` shows new content
- `www.evolea.ch` shows old/stale content
- Cache purge doesn't help
- `CF-Cache-Status: HIT` with very high `Age` value

**Root Cause:** Custom domain in Cloudflare Pages became deactivated/errored.

**Diagnosis:**
```bash
# Check custom domain status
curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/evolea-website/domains" \
  -H "Authorization: Bearer $CF_API_TOKEN"
```

Look for:
- `"status": "deactivated"` - Domain needs reactivation
- `"validation_data": {"status": "error"}` - Validation failed

**Fix:**
```bash
# Reactivate the domain (sends PATCH request)
curl -s -X PATCH "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/evolea-website/domains/www.evolea.ch" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json"
```

Wait 10-30 seconds for status to change to "active", then verify site.

### Cache Purge Not Working

If `purge_everything` doesn't clear the cache:

1. **Check if it's actually a cache issue:**
   ```bash
   curl -sI https://www.evolea.ch/ | grep -i "cf-cache\|age:"
   ```

2. **Try purging by host:**
   ```bash
   curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"hosts":["www.evolea.ch","evolea.ch"]}'
   ```

3. **If cache still shows old content**, the issue is likely the Pages custom domain, not caching!

---

## Dashboard Links

| Resource | URL |
|----------|-----|
| Cloudflare Dashboard | https://dash.cloudflare.com/ |
| Pages Project | https://dash.cloudflare.com/861cf040c6bd6d5977d6a93bc1bb6d2e/pages/view/evolea-website |
| Deployments | https://dash.cloudflare.com/861cf040c6bd6d5977d6a93bc1bb6d2e/pages/view/evolea-website/deployments |
| DNS Zone (evolea.ch) | https://dash.cloudflare.com/861cf040c6bd6d5977d6a93bc1bb6d2e/evolea.ch |
| API Tokens | https://dash.cloudflare.com/profile/api-tokens |

## Domain Configuration

| Domain | Type | Target | Status |
|--------|------|--------|--------|
| www.evolea.ch | CNAME | evolea-website.pages.dev | Primary (canonical) |
| evolea.ch | CNAME | evolea-website.pages.dev | Redirects to www (301) |

**Zone ID:** `31692bef127b39a14d1bd5787aafdd12`
**Nameservers:** `elias.ns.cloudflare.com`, `rachel.ns.cloudflare.com`

---

## Related Files

| File | Purpose |
|------|---------|
| `scripts/Cancel-CloudflareDeployments.ps1` | PowerShell deployment cleanup |
| `scripts/cancel-cloudflare-deployments.sh` | Bash deployment cleanup |
| `scripts/.env.cloudflare` | API credentials (gitignored) |
| `wrangler.toml` | Cloudflare Workers/Pages config |
| `.cloudflare-deploy-trigger` | Timestamp file for forcing rebuilds |

---

**Last Updated:** January 2026
**Version:** 1.0
