# Start ngrok in the background
Start-Process -FilePath "ngrok" -ArgumentList "http", "5001", "--log=stdout" -NoNewWindow -RedirectStandardOutput "ngrok.log"

# Wait a moment for ngrok to start
Start-Sleep -Seconds 3

# Get the public URL from ngrok API
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels"
    $publicUrl = $response.tunnels[0].public_url
    Write-Host "✅ Backend is now public at: $publicUrl"
    Write-Host ""
    Write-Host "Frontend URL: https://frabjous-fairy-9be454.netlify.app"
    Write-Host "Backend URL: $publicUrl"
    Write-Host ""
    Write-Host "Press Ctrl+C to stop ngrok"
    
    # Keep the script running
    while ($true) {
        Start-Sleep -Seconds 60
    }
} catch {
    Write-Host "❌ Error getting ngrok URL: $_"
}
