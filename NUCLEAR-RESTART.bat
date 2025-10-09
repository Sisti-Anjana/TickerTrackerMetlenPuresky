@echo off
color 0C
echo ========================================
echo   NUCLEAR RESTART - FULL CLEAN
echo ========================================
echo.
echo This will:
echo   - Kill all Node processes
echo   - Delete node_modules
echo   - Delete build folder
echo   - Clear all caches
echo   - Fresh install everything
echo.
pause

echo.
echo [1/6] Killing all Node processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 >nul

echo [2/6] Navigating to client folder...
cd client

echo [3/6] Deleting node_modules and build...
rmdir /s /q node_modules 2>nul
rmdir /s /q build 2>nul
del package-lock.json 2>nul

echo [4/6] Clearing npm cache...
call npm cache clean --force

echo [5/6] Fresh npm install...
call npm install

echo [6/6] Starting clean server...
echo.
color 0A
echo ========================================
echo   CLEAN RESTART COMPLETE
echo ========================================
echo.
echo Opening browser...
start http://localhost:3000
echo.
echo Starting server...
call npm start
