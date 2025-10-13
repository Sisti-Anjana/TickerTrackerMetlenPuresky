param(
  [Parameter(Mandatory=$true)][string]$NetlifyToken
)

$ErrorActionPreference = 'Stop'

$siteId = 'f3c5c5d7-9bc5-4550-a7fb-378024a3683b'
$projectRoot = 'C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud'
$env:NETLIFY_AUTH_TOKEN = $NetlifyToken

# Ensure Netlify CLI
if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
  npm i -g netlify-cli | Out-Null
  if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) { throw 'Netlify CLI not found after install' }
}

# Ensure ngrok
if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
  throw 'ngrok not found in PATH. Install from https://ngrok.com/download and re-run.'
}

# Start backend (minimized window)
Set-Location $projectRoot
Start-Process powershell -ArgumentList "cd `"$projectRoot`"; npm run server" -WindowStyle Minimized | Out-Null
Start-Sleep -Seconds 3

# Start ngrok (minimized window)
Start-Process ngrok -ArgumentList "http 5001" -WindowStyle Minimized | Out-Null

# Wait for ngrok URL
$ngrokUrl = $null
for ($i=0; $i -lt 45 -and -not $ngrokUrl; $i++) {
  try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2
    $ngrokUrl = ($resp.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1).public_url
  } catch {}
  if (-not $ngrokUrl) { Start-Sleep -Seconds 1 }
}
if (-not $ngrokUrl) { throw "Could not obtain ngrok URL (is ngrok running?)" }
Write-Host ("ngrok URL: " + $ngrokUrl)

# Configure single-origin: frontend uses /api, Netlify proxies to ngrok
netlify env:set REACT_APP_API_BASE_URL /api --site $siteId | Out-Null

# Update netlify.toml proxy target to current ngrok URL
$tomlPath = Join-Path $projectRoot 'netlify.toml'
if (Test-Path $tomlPath) {
  $toml = Get-Content $tomlPath -Raw
  if ($toml -notmatch "\[\[redirects\]\]\s*\r?\n\s*from\s*=\s*\"/api/*\"") {
    $append = @"

[[redirects]]
  from = "/api/*"
  to = "${ngrokUrl}/api/:splat"
  status = 200
  force = true
"@
    Add-Content -Path $tomlPath -Value $append
  } else {
    $updated = $toml -replace "https://[^"]+/api/", ("${ngrokUrl}/api/")
    if ($updated -ne $toml) {
      Set-Content -Path $tomlPath -Value $updated -NoNewline
    }
  }
}

# Deploy to Netlify (production)
netlify deploy --build --prod --site $siteId

# Print final shareable URL
$siteInfoJson = netlify sites:info --site $siteId --json
$siteInfo = $siteInfoJson | ConvertFrom-Json
$finalUrl = if ($siteInfo.ssl_url) { $siteInfo.ssl_url } else { $siteInfo.url }
Write-Host ""
Write-Host ("Final URL to share: " + $finalUrl)
Write-Host ("API health: " + $ngrokUrl + "/api/health")
Write-Host ("API test:   " + $ngrokUrl + "/api/test")











