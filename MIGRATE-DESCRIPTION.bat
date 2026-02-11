@echo off
echo ========================================
echo  Database Migration - Add Description
echo ========================================
echo.
echo This script will help you add the missing "description" columns
echo to your Supabase tables. This is required for the new dropdowns.
echo.
echo Step 1: Open Supabase Dashboard
echo Step 2: Navigate to the SQL Editor
echo Step 3: Create a "New Query"
echo Step 4: Paste and run the following SQL:
echo.
echo ----------------------------------------
type "migrations\09_add_description_to_client_site.sql"
echo ----------------------------------------
echo.
echo If you have already run this, you can just close this window.
echo.
pause
echo.
echo Step 5: Restart the Backend Server
echo.
echo If the server is currently running, please stop it and start it again.
echo.
echo ========================================
echo Migration Guide Complete!
echo ========================================
pause
