@echo off
echo ========================================
echo   MANUAL NETLIFY REDIRECT SETUP
echo ========================================
echo.

if "%1"=="" (
    echo Usage: setup-netlify-redirects.bat YOUR_NGROK_URL
    echo Example: setup-netlify-redirects.bat https://5360dbaf0288.ngrok-free.app
    echo.
    echo This will show you the exact redirect rules to add in Netlify dashboard
    pause
    exit /b 1
)

set NGROK_URL=%1
echo Setting up redirects for ngrok URL: %NGROK_URL%
echo.

echo ========================================
echo   NETLIFY DASHBOARD CONFIGURATION
echo ========================================
echo.
echo 1. Go to: https://app.netlify.com/
echo 2. Click on your site: frabjous-fairy-9be454
echo 3. Go to Site settings → Redirects and rewrites
echo 4. Add these redirect rules:
echo.

echo MAIN REDIRECT RULE:
echo From: /api/*
echo To: %NGROK_URL%/api/:splat
echo Status: 200
echo Force: ✅ (check this box)
echo.

echo OPTIONAL SPECIFIC RULES:
echo.
echo Auth Login:
echo From: /api/auth/login
echo To: %NGROK_URL%/api/auth/login
echo Status: 200
echo.
echo Auth Register:
echo From: /api/auth/register
echo To: %NGROK_URL%/api/auth/register
echo Status: 200
echo.
echo Tickets:
echo From: /api/tickets/*
echo To: %NGROK_URL%/api/tickets/:splat
echo Status: 200
echo.

echo ========================================
echo   AFTER CONFIGURING REDIRECTS
echo ========================================
echo.
echo 1. Click Save in Netlify dashboard
echo 2. Wait for automatic redeploy
echo 3. Test your single URL: https://frabjous-fairy-9be454.netlify.app
echo.

echo ========================================
echo   TESTING
echo ========================================
echo.
echo Test backend directly:
curl -s %NGROK_URL%/api/test
echo.
echo Test Netlify frontend:
curl -s -I https://frabjous-fairy-9be454.netlify.app
echo.

pause

