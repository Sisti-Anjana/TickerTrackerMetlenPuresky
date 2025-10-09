@echo off
echo ========================================
echo  Admin & User System - Quick Setup
echo ========================================
echo.
echo This script will guide you through setting up the admin and user system.
echo.
echo Step 1: Database Migration
echo ========================================
echo.
echo Please run the following SQL in your Supabase SQL Editor:
echo.
echo File Location: migrations/06_add_admin_and_user_roles.sql
echo.
echo OR copy and paste the SQL below:
echo.
type "migrations\06_add_admin_and_user_roles.sql"
echo.
echo ========================================
echo.
pause
echo.
echo Step 2: Default Admin Credentials
echo ========================================
echo.
echo After running the migration, you can login with:
echo.
echo   Email:    admin@system.local
echo   Password: Admin@123
echo   Role:     admin
echo.
echo ⚠️  IMPORTANT: Change this password after first login!
echo.
echo ========================================
echo.
echo Step 3: Start the Application
echo ========================================
echo.
echo Open TWO terminal windows and run:
echo.
echo Terminal 1 (Backend):
echo   npm start
echo.
echo Terminal 2 (Frontend):
echo   cd client
echo   npm start
echo.
echo ========================================
echo.
echo Step 4: Access the Application
echo ========================================
echo.
echo Frontend: http://localhost:3001
echo Backend:  http://localhost:5000
echo.
echo ========================================
echo.
echo Setup Complete! Read ADMIN_USER_SYSTEM_GUIDE.md for more details.
echo.
pause