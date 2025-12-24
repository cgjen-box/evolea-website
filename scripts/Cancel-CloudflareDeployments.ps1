# Bulk Cancel/Delete Cloudflare Pages Deployments
# Usage: .\Cancel-CloudflareDeployments.ps1

param(
    [string]$AccountId = $env:CF_ACCOUNT_ID,
    [string]$ApiToken = $env:CF_API_TOKEN,
    [string]$ProjectName = "evolea-website",
    [switch]$OnlyInProgress,
    [switch]$Force,
    [int]$ThrottleLimit = 10
)

$ErrorActionPreference = "Stop"

Write-Host "=== Cloudflare Pages Bulk Deployment Cancellation ===" -ForegroundColor Yellow
Write-Host "Project: $ProjectName"
Write-Host ""

# Check credentials
if (-not $AccountId -or -not $ApiToken) {
    Write-Host "ERROR: Please provide your Cloudflare credentials!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1: Pass as parameters:"
    Write-Host "  .\Cancel-CloudflareDeployments.ps1 -AccountId 'your-id' -ApiToken 'your-token'"
    Write-Host ""
    Write-Host "Option 2: Set environment variables:"
    Write-Host '  $env:CF_ACCOUNT_ID = "your-account-id"'
    Write-Host '  $env:CF_API_TOKEN = "your-api-token"'
    Write-Host ""
    Write-Host "Find your Account ID: Cloudflare Dashboard -> Pages -> evolea-website -> Settings"
    Write-Host "Create API Token: Dashboard -> My Profile -> API Tokens (needs 'Cloudflare Pages:Edit')"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

$baseUrl = "https://api.cloudflare.com/client/v4/accounts/$AccountId/pages/projects/$ProjectName"

# Function to get all deployments
function Get-AllDeployments {
    $allDeployments = @()
    $page = 1
    $perPage = 100

    Write-Host "Fetching deployments..." -ForegroundColor Yellow

    do {
        $url = "$baseUrl/deployments?page=$page&per_page=$perPage"

        try {
            $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        }
        catch {
            Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }

        if (-not $response.success) {
            Write-Host "API Error: $($response.errors | ConvertTo-Json)" -ForegroundColor Red
            exit 1
        }

        $deployments = $response.result

        if ($OnlyInProgress) {
            $deployments = $deployments | Where-Object {
                $_.latest_stage.status -in @("active", "idle", "queued", "pending")
            }
        }

        $allDeployments += $deployments

        Write-Host "  Page $page`: Found $($response.result.Count) deployments (total collected: $($allDeployments.Count))"

        if ($response.result.Count -lt $perPage) {
            break
        }

        $page++
        Start-Sleep -Milliseconds 500

    } while ($true)

    return $allDeployments
}

# Function to delete a deployment
function Remove-Deployment {
    param([string]$DeploymentId)

    $url = "$baseUrl/deployments/$DeploymentId`?force=true"

    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Delete
        if ($response.success) {
            Write-Host "[OK] Deleted: $DeploymentId" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "[FAIL] $DeploymentId - $($response.errors[0].message)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        # Try to parse error response
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorMsg = $errorBody.errors[0].message
        } catch {}
        Write-Host "[FAIL] $DeploymentId - $errorMsg" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host ""
$deployments = Get-AllDeployments
$total = $deployments.Count

if ($total -eq 0) {
    Write-Host "No deployments to delete!" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Found $total deployments to delete" -ForegroundColor Yellow
Write-Host ""

if (-not $Force) {
    $confirm = Read-Host "Are you sure you want to delete ALL $total deployments? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Aborted."
        exit 0
    }
}

Write-Host ""
Write-Host "Deleting deployments (this may take a while)..." -ForegroundColor Yellow
Write-Host ""

$deleted = 0
$failed = 0
$startTime = Get-Date

# Process in batches to avoid rate limits
$batchSize = $ThrottleLimit
$batches = [math]::Ceiling($total / $batchSize)

for ($i = 0; $i -lt $total; $i += $batchSize) {
    $batch = $deployments[$i..([math]::Min($i + $batchSize - 1, $total - 1))]
    $batchNum = [math]::Floor($i / $batchSize) + 1

    Write-Host "--- Batch $batchNum of $batches ---" -ForegroundColor Cyan

    foreach ($deployment in $batch) {
        $result = Remove-Deployment -DeploymentId $deployment.id
        if ($result) { $deleted++ } else { $failed++ }
    }

    # Rate limit protection
    if ($i + $batchSize -lt $total) {
        Start-Sleep -Seconds 1
    }

    # Progress update
    $elapsed = (Get-Date) - $startTime
    $processed = $i + $batch.Count
    $rate = if ($elapsed.TotalSeconds -gt 0) { $processed / $elapsed.TotalSeconds } else { 0 }
    $remaining = $total - $processed
    $eta = if ($rate -gt 0) { [math]::Round($remaining / $rate) } else { 0 }

    Write-Host "Progress: $processed/$total | Rate: $([math]::Round($rate, 1))/sec | ETA: ${eta}s" -ForegroundColor Gray
    Write-Host ""
}

$totalTime = (Get-Date) - $startTime

Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host "Deleted: $deleted" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "Time: $([math]::Round($totalTime.TotalMinutes, 1)) minutes"
