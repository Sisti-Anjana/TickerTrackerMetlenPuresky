@echo off
color 0A
title System Status Check

echo ========================================
echo   TICKET TRACKER - SYSTEM STATUS
echo ========================================
echo.

echo Checking Backend Server...
curl -s http://localhost:5001/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend Server: RUNNING on port 5001
) else (
    echo [ERROR] Backend Server: NOT RESPONDING
)
echo.

echo Checking Ngrok Tunnel...
curl -s -H "ngrok-skip-browser-warning: true" https://5360dbaf0288.ngrok-free.app/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ngrok Tunnel: ACTIVE
    echo     URL: https://5360dbaf0288.ngrok-free.app
) else (
    echo [ERROR] Ngrok Tunnel: NOT ACCESSIBLE
)
echo.

echo Checking Database Users...
echo (Testing via backend API)
powershell -Command "try { $response = Invoke-RestMethod -Uri 'https://5360dbaf0288.ngrok-free.app/api/auth/debug/users' -Headers @{'ngrok-skip-browser-warning'='true'}; if ($response.count -gt 0) { Write-Host '[OK] Users Found:' $response.count } else { Write-Host '[WARNING] No users in database - Run SQL fix!' } } catch { Write-Host '[ERROR] Cannot check users' }"
echo.

echo ========================================
echo   NETLIFY DEPLOYMENT
echo ========================================
echo Frontend: https://frabjous-fairy-9be454.netlify.app
echo Alt URL:  https://9be454.netlify.app
echo Backend:  https://5360dbaf0288.ngrok-free.app
echo.

echo ========================================
echo   ADMIN CREDENTIALS
echo ========================================
echo Email:    admin@system.local
echo Password: admin123
echo.

echo ========================================
echo To fix login issue:
echo 1. Open Supabase SQL Editor (already opened)
echo 2. Copy SQL from FIX-LOGIN-SQL.sql (already opened)
echo 3. Run the SQL
echo 4. Try login again
echo ========================================
echo.
pause
