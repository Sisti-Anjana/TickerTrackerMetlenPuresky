@echo off
echo ========================================
echo   UPDATE NGROK URL IN NETLIFY CONFIG
echo ========================================
echo.

if "%1"=="" (
    echo Usage: update-ngrok-url.bat YOUR_NGROK_URL
    echo Example: update-ngrok-url.bat https://5360dbaf0288.ngrok-free.app
    echo.
    echo Current ngrok URL in netlify.toml:
    findstr "to = " netlify.toml
    pause
    exit /b 1
)

set NGROK_URL=%1
echo Updating netlify.toml with ngrok URL: %NGROK_URL%

powershell -Command "(Get-Content netlify.toml) -replace 'to = \"https://[^\"]*\"', 'to = \"%NGROK_URL%/api/:splat\"' | Set-Content netlify.toml"

echo.
echo ✅ Updated netlify.toml successfully!
echo.
echo Next steps:
echo 1. Commit and push changes to trigger Netlify rebuild
echo 2. Your Netlify URL will now redirect API calls to: %NGROK_URL%
echo.
echo Your single shareable URL: https://frabjous-fairy-9be454.netlify.app
echo.
pause