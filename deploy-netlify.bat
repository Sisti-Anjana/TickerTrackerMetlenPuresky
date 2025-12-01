@echo off
setlocal ENABLEDELAYEDEXPANSION

echo =====================================================
echo            NETLIFY DEPLOYMENT AUTOMATION
echo =====================================================
echo.

REM 1) Ensure Netlify CLI exists
where netlify >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Netlify CLI not found.
    echo Install it first:  npm install -g netlify-cli
    echo or download from https://docs.netlify.com/cli/get-started/
    pause
    exit /b 1
)

REM 2) Make sure we are at repo root
if not exist "client\package.json" (
    echo [ERROR] Run this script from the repository root.
    pause
    exit /b 1
)

REM 3) Optional Site ID argument (so we can reuse script)
set SITE_ID=%1
if "%SITE_ID%"=="" (
    set /p SITE_ID=Enter Netlify Site ID (leave blank to use default linked site): 
)

if "%SITE_ID%"=="" (
    set SITE_FLAG=
    echo Using the site already linked via ^`netlify link^`.
) else (
    set SITE_FLAG=--site %SITE_ID%
    echo Target Netlify site: %SITE_ID%
)
echo.

REM 4) Warn if auth token missing
if "%NETLIFY_AUTH_TOKEN%"=="" (
    echo [WARNING] NETLIFY_AUTH_TOKEN env var not set.
    echo          Netlify CLI will prompt you to log in if required.
    echo.
)

REM 5) Build frontend
echo [STEP] Installing client dependencies and building React app...
pushd client
call npm install
if errorlevel 1 goto :build_error

call npm run build
if errorlevel 1 goto :build_error
popd

REM 6) Deploy
echo.
echo [STEP] Deploying build directory to Netlify...
netlify deploy --prod !SITE_FLAG! --dir "client\build"
if errorlevel 1 goto :deploy_error

echo.
echo =====================================================
echo  ✅ Deployment command finished. Check Netlify logs.
echo =====================================================
pause
exit /b 0

:build_error
echo.
echo [ERROR] npm build step failed. Fix issues above and rerun.
popd >nul 2>&1
pause
exit /b 1

:deploy_error
echo.
echo [ERROR] Netlify deployment failed. Review CLI output above.
pause
exit /b 1


