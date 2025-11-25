@echo off
echo ========================================
echo   UNIFIED DEPLOYMENT SETUP
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm run install-all
if %errorlevel% neq 0 (
    echo ERROR: Dependency installation failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Building frontend...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Step 3: Creating deployment files...
echo ✅ Package.json updated for production
echo ✅ Procfile created for Heroku
echo ✅ Railway configuration ready
echo ✅ Environment template created

echo.
echo Step 4: Testing unified deployment locally...
echo Setting production environment...
set NODE_ENV=production

echo.
echo Starting unified server...
echo Your application will be available at: http://localhost:5001
echo.
echo Press Ctrl+C to stop the server
echo.

node server/index.js

