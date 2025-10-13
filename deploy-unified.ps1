# Unified Deployment Script
Write-Host "========================================" -ForegroundColor Green
Write-Host "   UNIFIED DEPLOYMENT SETUP" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Building frontend..." -ForegroundColor Yellow
Set-Location client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "Step 2: Setting production environment..." -ForegroundColor Yellow
$env:NODE_ENV = "production"

Write-Host ""
Write-Host "Step 3: Starting unified server..." -ForegroundColor Yellow
Write-Host "Your application will be available at: http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

node server/index.js
