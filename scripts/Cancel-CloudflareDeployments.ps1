# Bulk Cancel/Delete Cloudflare Pages Deployments
# Usage: .\Cancel-CloudflareDeployments.ps1 -OnlyInProgress

param(
    [string]$AccountId,
    [string]$ApiToken,
    [string]$ProjectName = "evolea-website",
    [switch]$OnlyInProgress,
    [switch]$Force,
    [int]$ThrottleLimit = 10
)

$ErrorActionPreference = "Stop"

# Load .env.cloudflare if it exists
$envFile = Join-Path $PSScriptRoot ".env.cloudflare"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.+)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
}

# Use parameters if provided, otherwise fall back to environment variables
if (-not $AccountId) { $AccountId = $env:CF_ACCOUNT_ID }
if (-not $ApiToken) { $ApiToken = $env:CF_API_TOKEN }

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
    Write-Host "Option 2: Set environment variables or edit scripts/.env.cloudflare"
    Write-Host ""
    exit 1
}

Write-Host "Account ID: $AccountId" -ForegroundColor Cyan
Write-Host "API Token: $($ApiToken.Substring(0,8))..." -ForegroundColor Cyan

$baseUrl = "https://api.cloudflare.com/client/v4/accounts/$AccountId/pages/projects/$ProjectName"

# Function to call Cloudflare API using curl
function Invoke-CloudflareApi {
    param(
        [string]$Endpoint,
        [string]$Method = "GET"
    )

    $url = "$baseUrl$Endpoint"
    $authHeader = "Authorization: Bearer $ApiToken"

    if ($Method -eq "GET") {
        $result = curl.exe -s $url -H $authHeader
    } else {
        $result = curl.exe -s -X $Method $url -H $authHeader
    }

    return $result | ConvertFrom-Json
}

# Function to get all deployments
function Get-AllDeployments {
    $allDeployments = @()
    $page = 1
    $perPage = 25
    $emptyPages = 0
    $maxEmptyPages = 3  # Stop after 3 consecutive pages with no matches

    Write-Host "Fetching deployments..." -ForegroundColor Yellow

    do {
        $response = Invoke-CloudflareApi -Endpoint "/deployments?page=$page&per_page=$perPage"

        if (-not $response.success) {
            Write-Host "API Error: $($response.errors | ConvertTo-Json)" -ForegroundColor Red
            exit 1
        }

        $deployments = @($response.result)
        $filteredCount = 0

        if ($OnlyInProgress) {
            $filtered = @($deployments | Where-Object {
                $_.latest_stage.status -in @("active", "idle", "queued", "pending")
            })
            $filteredCount = $filtered.Count
            $allDeployments += $filtered
        } else {
            $filteredCount = $deployments.Count
            $allDeployments += $deployments
        }

        Write-Host "  Page $page`: Found $($deployments.Count) deployments (matched: $filteredCount, total collected: $($allDeployments.Count))"

        # Stop if we've reached the end
        if ($deployments.Count -lt $perPage) {
            break
        }

        # Early exit optimization for -OnlyInProgress: stop after several empty pages
        if ($OnlyInProgress) {
            if ($filteredCount -eq 0) {
                $emptyPages++
                if ($emptyPages -ge $maxEmptyPages) {
                    Write-Host "  (Stopping early - no more queued deployments found)" -ForegroundColor Gray
                    break
                }
            } else {
                $emptyPages = 0
            }
        }

        $page++
        Start-Sleep -Milliseconds 300

    } while ($true)

    return $allDeployments
}

# Function to delete a deployment
function Remove-Deployment {
    param([string]$DeploymentId)

    $response = Invoke-CloudflareApi -Endpoint "/deployments/$DeploymentId`?force=true" -Method "DELETE"

    if ($response.success) {
        Write-Host "[OK] Deleted: $DeploymentId" -ForegroundColor Green
        return $true
    }
    else {
        $errorMsg = if ($response.errors) { $response.errors[0].message } else { "Unknown error" }
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
Write-Host "Deleting deployments..." -ForegroundColor Yellow
Write-Host ""

$deleted = 0
$failed = 0
$startTime = Get-Date

# Process in batches
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
