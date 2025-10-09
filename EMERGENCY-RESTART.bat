@echo off
echo ========================================
echo   EMERGENCY FIX - RESTARTING SERVER
echo ========================================
echo.

echo Killing all Node processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 3 >nul

echo.
echo Clearing npm cache...
cd client
call npm cache clean --force

echo.
echo Deleting node_modules and reinstalling...
rmdir /s /q node_modules 2>nul
rmdir /s /q build 2>nul

echo.
echo Installing dependencies...
call npm install

echo.
echo ========================================
echo   STARTING FRESH SERVER
echo ========================================
echo.

start http://localhost:3000
call npm start
