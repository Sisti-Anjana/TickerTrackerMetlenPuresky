@echo off
echo ========================================
echo Restarting React Development Server
echo ========================================
echo.

cd /d "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud\client"

echo Killing existing Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Waiting for processes to close...
timeout /t 3 /nobreak >nul

echo.
echo Starting development server...
echo.
npm start

pause
