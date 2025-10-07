# PowerShell script to check users in your database
Write-Host "🔍 Checking users in database..." -ForegroundColor Cyan

try {
    # Check all users via API
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/debug/users" -Method GET
    
    Write-Host "✅ Successfully connected to database!" -ForegroundColor Green
    Write-Host "📊 Total Users Found: $($response.count)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($response.users.Count -gt 0) {
        Write-Host "👥 User List:" -ForegroundColor Cyan
        Write-Host "=" * 80
        
        foreach ($user in $response.users) {
            Write-Host "ID: $($user.id)" -ForegroundColor White
            Write-Host "Name: $($user.name)" -ForegroundColor Green
            Write-Host "Email: $($user.email)" -ForegroundColor Blue
            Write-Host "Created: $($user.created_at)" -ForegroundColor Gray
            Write-Host "-" * 40
        }
    } else {
        Write-Host "⚠️  No users found in database" -ForegroundColor Yellow
        Write-Host "💡 Try registering a user first at http://localhost:3000" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Error connecting to server:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Make sure your server is running:" -ForegroundColor Yellow
    Write-Host "   cd 'C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud'" -ForegroundColor Gray
    Write-Host "   npm run server" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🌐 You can also check users at:" -ForegroundColor Cyan
Write-Host "   • Supabase Dashboard → Table Editor → users table" -ForegroundColor Gray
Write-Host "   • Browser: http://localhost:5001/api/auth/debug/users" -ForegroundColor Gray