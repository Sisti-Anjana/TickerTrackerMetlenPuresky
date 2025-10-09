@echo off
echo ═══════════════════════════════════════════════════════
echo 🚀 Starting AGS Ticketing System
echo ═══════════════════════════════════════════════════════
echo.

echo Starting Backend Server on port 5001...
start "Backend Server" cmd /k "cd /d "%~dp0" && npm start"

echo.
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Client on port 3000...
start "Frontend Client" cmd /k "cd /d "%~dp0client" && npm start"

echo.
echo ═══════════════════════════════════════════════════════
echo ✅ Both servers are starting!
echo ═══════════════════════════════════════════════════════
echo.
echo 📋 Access the application:
echo    http://localhost:3000
echo.
echo 🔐 Admin Login:
echo    Email:    admin@system.local
echo    Password: Admin@123
echo.
echo 💡 Two command windows will open:
echo    - Backend Server (port 5001)
echo    - Frontend Client (port 3000)
echo.
echo ⚠️  Do not close those windows while using the app!
echo ═══════════════════════════════════════════════════════
echo.
pause
