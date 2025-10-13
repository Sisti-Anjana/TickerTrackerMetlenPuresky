# Script to update netlify.toml with ngrok URL
param(
    [string]$ngrokUrl
)

if (-not $ngrokUrl) {
    # Try to get ngrok URL automatically
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels"
        $ngrokUrl = $response.tunnels[0].public_url
        Write-Host "✅ Detected ngrok URL: $ngrokUrl"
    } catch {
        Write-Host "❌ Could not detect ngrok URL automatically."
        Write-Host "Please run this script with your ngrok URL:"
        Write-Host ".\update-netlify-config.ps1 -ngrokUrl 'https://your-ngrok-url.ngrok-free.app'"
        exit 1
    }
}

# Remove https:// if present
$ngrokUrl = $ngrokUrl -replace "^https://", ""

# Read the netlify.toml file
$configPath = "netlify.toml"
$content = Get-Content $configPath -Raw

# Replace the placeholder URL
$updatedContent = $content -replace "REPLACE-WITH-YOUR-NGROK-URL\.ngrok-free\.app", "$ngrokUrl"

# Write back to file
Set-Content -Path $configPath -Value $updatedContent

Write-Host "✅ Updated netlify.toml with ngrok URL: https://$ngrokUrl"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Review the change in netlify.toml"
Write-Host "2. Deploy to Netlify: netlify deploy --prod"
Write-Host "   OR push to GitHub if auto-deploy is enabled"
