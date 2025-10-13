@echo off
echo ========================================
echo Rebuilding and Deploying to Netlify
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Building React app...
cd client
call npm run build

if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying to Netlify...
cd ..
call netlify deploy --prod

if errorlevel 1 (
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
pause
