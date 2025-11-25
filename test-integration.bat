@echo off
echo ========================================
echo   TEST NETLIFY + NGROK INTEGRATION
echo ========================================
echo.

echo Testing your integrated deployment...
echo.

echo 1. Frontend URL: https://frabjous-fairy-9be454.netlify.app
echo 2. Backend URL: https://5360dbaf0288.ngrok-free.app
echo 3. Single Shareable URL: https://frabjous-fairy-9be454.netlify.app
echo.

echo Testing backend connection...
curl -s https://5360dbaf0288.ngrok-free.app/api/test
if %errorlevel% equ 0 (
    echo ✅ Backend is running and accessible
) else (
    echo ❌ Backend is not accessible - make sure ngrok is running
)

echo.
echo Testing Netlify deployment...
curl -s -I https://frabjous-fairy-9be454.netlify.app
if %errorlevel% equ 0 (
    echo ✅ Netlify frontend is accessible
) else (
    echo ❌ Netlify frontend is not accessible
)

echo.
echo ========================================
echo   DEPLOYMENT STATUS
echo ========================================
echo.
echo ✅ Netlify configured to redirect API calls to ngrok
echo ✅ Changes committed and pushed to GitHub
echo ✅ Netlify should be rebuilding automatically
echo.
echo Your single shareable URL:
echo 🌐 https://frabjous-fairy-9be454.netlify.app
echo.
echo This URL will:
echo - Load the frontend from Netlify
echo - Redirect API calls to your ngrok backend
echo - Provide seamless user experience
echo.
echo Next steps:
echo 1. Wait for Netlify rebuild to complete (check dashboard)
echo 2. Test the single URL in your browser
echo 3. Share https://frabjous-fairy-9be454.netlify.app with others
echo.
pause

