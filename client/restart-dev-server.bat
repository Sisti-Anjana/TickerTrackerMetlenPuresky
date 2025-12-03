@echo off
echo ============================================
echo   CLEARING REACT CACHE AND RESTARTING
echo ============================================
echo.

cd /d "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud\client"

echo Killing all node processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Clearing build cache...
if exist "build" rmdir /s /q "build"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

echo.
echo Starting React development server...
echo.
echo ============================================
echo   IMPORTANT: After server starts
echo   1. Go to browser (localhost:3000/login)
echo   2. Press Ctrl+Shift+R for hard refresh
echo   3. Or Press F12, right-click refresh, select
echo      "Empty Cache and Hard Reload"
echo ============================================
echo.

start cmd /k "npm start"

echo.
echo Done! Server is starting in a new window...
pause
