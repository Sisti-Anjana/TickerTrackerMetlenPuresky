@echo off
echo ========================================
echo   RESTARTING DEVELOPMENT ENVIRONMENT
echo ========================================
echo.

echo Step 1: Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Step 2: Clearing npm cache...
cd client
call npm cache clean --force

echo.
echo Step 3: Installing/Updating dependencies...
call npm install

echo.
echo Step 4: Starting development server...
echo.
echo ========================================
echo   SERVER STARTING...
echo ========================================
echo.
echo Your app will open at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

start http://localhost:3000
call npm start
