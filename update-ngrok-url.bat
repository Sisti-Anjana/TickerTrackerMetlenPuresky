@echo off
echo ========================================
echo   UPDATE NGROK URL
echo ========================================
echo.
echo Current ngrok URL in config:
echo https://5360dbaf0288.ngrok-free.app
echo.
echo.

set /p NEW_URL="Enter your new ngrok URL (without /api): "

if "%NEW_URL%"=="" (
    echo ERROR: No URL provided!
    pause
    exit /b
)

echo.
echo Updating _redirects file...

(
echo /api/*  %NEW_URL%/api/:splat  200
echo /*      /index.html   200
) > "client\public\_redirects"

echo.
echo ✅ Updated _redirects file!
echo.
echo Now updating netlify.toml...

powershell -Command "(Get-Content netlify.toml) -replace 'to = \"https://.*\.ngrok-free\.app', 'to = \"%NEW_URL%\"' | Set-Content netlify.toml"

echo.
echo ✅ Updated netlify.toml!
echo.
echo ========================================
echo   CONFIGURATION UPDATED!
echo ========================================
echo.
echo Next steps:
echo 1. Run: deploy-to-netlify.bat
echo 2. Or push to GitHub for auto-deploy
echo.
pause
