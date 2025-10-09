@echo off
echo ========================================
echo   DEPLOYING TO NETLIFY
echo ========================================
echo.

cd client

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building production bundle...
call npm run build

echo.
echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Your build is ready in: client\build
echo.
echo Next steps:
echo 1. Push changes to GitHub
echo 2. Netlify will auto-deploy
echo.
echo OR manually deploy:
echo - Run: netlify deploy --prod
echo.
pause
