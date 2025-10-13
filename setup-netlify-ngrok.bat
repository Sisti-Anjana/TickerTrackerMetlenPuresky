@echo off
echo ============================================
echo   Netlify + ngrok Setup Automation
echo ============================================
echo.

echo Step 1: Checking if backend server is running...
powershell -Command "$process = Get-Process -Name node -ErrorAction SilentlyContinue; if ($process) { Write-Host 'Backend server is running (PID: ' $process[0].Id ')' } else { Write-Host 'WARNING: Backend server not found. Please start it first!' -ForegroundColor Yellow; exit 1 }"
if %errorlevel% neq 0 (
    echo.
    echo Please start your backend server first:
    echo   npm start
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Starting ngrok tunnel...
start /B ngrok http 5001 --log=stdout > ngrok.log 2>&1

echo Waiting for ngrok to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Step 3: Getting ngrok URL...
powershell -Command "$response = Invoke-RestMethod -Uri 'http://127.0.0.1:4040/api/tunnels' -ErrorAction Stop; $url = $response.tunnels[0].public_url; Write-Host 'ngrok URL:' $url; $url | Out-File -FilePath 'ngrok-url.txt' -Encoding ASCII"
if %errorlevel% neq 0 (
    echo ERROR: Could not get ngrok URL
    pause
    exit /b 1
)

set /p NGROK_URL=<ngrok-url.txt

echo.
echo Step 4: Updating netlify.toml configuration...
powershell -File update-netlify-config.ps1 -ngrokUrl "%NGROK_URL%"

echo.
echo ============================================
echo   Configuration Updated Successfully!
echo ============================================
echo.
echo   Frontend: https://frabjous-fairy-9be454.netlify.app
echo   Backend:  %NGROK_URL%
echo.
echo Next step: Deploy to Netlify
echo   Option 1: netlify deploy --prod
echo   Option 2: Push to GitHub (if auto-deploy enabled)
echo.
echo Press any key to open Netlify deployment...
pause > nul

netlify deploy --prod

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
pause
