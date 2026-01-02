# Massive CMS QA runner
# Usage: .\Run-CmsQaMassive.ps1 -PerField -FieldCount 25

param(
    [string]$CmsBase = $env:CMS_BASE,
    [string]$SiteBase = $env:SITE_BASE,
    [string]$GhRepo = $env:GH_REPO,
    [string]$OutputRoot = (Join-Path (Get-Location) "artifacts\\cms-qa"),
    [switch]$PerField,
    [int]$FieldStart = 0,
    [int]$FieldCount = 0
)

$ErrorActionPreference = "Stop"

if (-not $CmsBase) {
    $CmsBase = "https://evolea-website.pages.dev/keystatic/branch/main"
}
if (-not $SiteBase) {
    $SiteBase = "https://evolea-website.pages.dev"
}
if (-not $GhRepo) {
    $GhRepo = "cgjen-box/evolea-website"
}

$debugPort = 9222
$debugConn = Get-NetTCPConnection -LocalPort $debugPort -ErrorAction SilentlyContinue
if (-not $debugConn) {
    Write-Host "Chrome debug not detected on port $debugPort." -ForegroundColor Yellow
    Write-Host "Run scripts\\Start-ChromeDebug.ps1 first, then re-run this script."
    exit 1
}

function Invoke-CmsQa {
    param([string]$OutputDir)

    $env:CMS_BASE = $CmsBase
    $env:SITE_BASE = $SiteBase
    $env:GH_REPO = $GhRepo
    $env:OUTPUT_DIR = $OutputDir

    node scripts\\cms-qa.mjs
    if ($LASTEXITCODE -ne 0) {
        throw "cms-qa failed (output: $OutputDir)."
    }
}

Write-Host "Phase 1: CMS UI + site checks (no commits)" -ForegroundColor Cyan
$env:CMS_QA_NO_COMMIT = "1"
Remove-Item Env:CMS_QA_PER_FIELD -ErrorAction SilentlyContinue
Remove-Item Env:CMS_QA_NO_SITE -ErrorAction SilentlyContinue
Remove-Item Env:CMS_QA_NO_SCREENSHOTS -ErrorAction SilentlyContinue
$env:CMS_QA_FIELD_START = "0"
$env:CMS_QA_FIELD_COUNT = "0"
Invoke-CmsQa -OutputDir (Join-Path $OutputRoot "smoke")

Write-Host "Phase 2: CMS save + deploy propagation check" -ForegroundColor Cyan
Remove-Item Env:CMS_QA_NO_COMMIT -ErrorAction SilentlyContinue
$env:CMS_QA_NO_SITE = "1"
$env:CMS_QA_NO_SCREENSHOTS = "1"
Invoke-CmsQa -OutputDir (Join-Path $OutputRoot "commit-check")

if ($PerField) {
    Write-Host "Phase 3: Per-field commit checks (batchable)" -ForegroundColor Cyan
    $env:CMS_QA_PER_FIELD = "1"
    $env:CMS_QA_FIELD_START = "$FieldStart"
    if ($FieldCount -gt 0) {
        $env:CMS_QA_FIELD_COUNT = "$FieldCount"
    } else {
        Remove-Item Env:CMS_QA_FIELD_COUNT -ErrorAction SilentlyContinue
    }
    Invoke-CmsQa -OutputDir (Join-Path $OutputRoot "per-field")
}

Write-Host "Done. Reports saved to $OutputRoot." -ForegroundColor Green
