# Update ngrok URL in Netlify configuration
param(
    [Parameter(Mandatory=$true)]
    [string]$NgrokUrl
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "   UPDATE NGROK URL IN NETLIFY CONFIG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Updating netlify.toml with ngrok URL: $NgrokUrl" -ForegroundColor Yellow

# Update the netlify.toml file
$content = Get-Content netlify.toml
$updatedContent = $content -replace 'to = "https://[^"]*"', "to = `"$NgrokUrl/api/:splat`""
$updatedContent | Set-Content netlify.toml

Write-Host ""
Write-Host "✅ Updated netlify.toml successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Commit and push changes to trigger Netlify rebuild" -ForegroundColor White
Write-Host "2. Your Netlify URL will now redirect API calls to: $NgrokUrl" -ForegroundColor White
Write-Host ""
Write-Host "Your single shareable URL: https://frabjous-fairy-9be454.netlify.app" -ForegroundColor Magenta
Write-Host ""

Read-Host "Press Enter to continue"

