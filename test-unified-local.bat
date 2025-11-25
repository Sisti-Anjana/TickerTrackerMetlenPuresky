@echo off
echo ========================================
echo   UNIFIED DEPLOYMENT - TESTING LOCAL
echo ========================================
echo.

echo Setting production environment...
set NODE_ENV=production

echo.
echo Starting unified server...
echo Your application will be available at: http://localhost:5001
echo.
echo Press Ctrl+C to stop the server
echo.

node server/index.js

