@echo off
echo ========================================
echo   UNIFIED DEPLOYMENT SETUP
echo ========================================
echo.

echo Step 1: Building frontend...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Step 2: Setting production environment...
set NODE_ENV=production

echo.
echo Step 3: Starting unified server...
echo Your application will be available at: http://localhost:5001
echo.
echo Press Ctrl+C to stop the server
echo.

node server/index.js

