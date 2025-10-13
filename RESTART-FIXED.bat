@echo off
echo ========================================
echo   RESTARTING WITH FIXED CONFIGURATION
echo ========================================
echo.
echo [1/3] Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Starting Backend Server...
cd /d "%~dp0"
start "Backend Server" cmd /k "npm start"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend Client...
cd client
start "Frontend Client" cmd /k "npm start"

echo.
echo ========================================
echo   APPLICATION STARTED!
echo ========================================
echo.
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Test endpoints:
echo   http://localhost:5001/api/test
echo   http://localhost:5001/api/debug/database
echo.
echo Press any key to close this window...
pause >nul
