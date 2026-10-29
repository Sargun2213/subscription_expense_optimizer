@echo off
setlocal enabledelayedexpansion
title Launching SubOptima - Subscription Expense Optimizer

echo ======================================================================
echo          LAUNCHING SUBSCRIPTION EXPENSE OPTIMIZATION PLATFORM
echo ======================================================================
echo.

:: 1. Add Node.js and Git to PATH automatically
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\MinGit\cmd;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%PATH%"

:: 2. Auto-locate the project folder from anywhere
set "PROJECT_DIR="

if exist "%~dp0backend\package.json" (
    set "PROJECT_DIR=%~dp0"
) else if exist "%~dp0subscription-expense-optimizer\backend\package.json" (
    set "PROJECT_DIR=%~dp0subscription-expense-optimizer"
) else if exist "%USERPROFILE%\OneDrive\Desktop\subscription-expense-optimizer\backend\package.json" (
    set "PROJECT_DIR=%USERPROFILE%\OneDrive\Desktop\subscription-expense-optimizer"
) else if exist "%USERPROFILE%\Desktop\subscription-expense-optimizer\backend\package.json" (
    set "PROJECT_DIR=%USERPROFILE%\Desktop\subscription-expense-optimizer"
) else if exist "%USERPROFILE%\Downloads\subscription-expense-optimizer\backend\package.json" (
    set "PROJECT_DIR=%USERPROFILE%\Downloads\subscription-expense-optimizer"
) else if exist "C:\Users\sargu\.gemini\antigravity\scratch\subscription-expense-optimizer\backend\package.json" (
    set "PROJECT_DIR=C:\Users\sargu\.gemini\antigravity\scratch\subscription-expense-optimizer"
)

if "%PROJECT_DIR%"=="" (
    echo [ERROR] Could not find the project folder.
    echo Please make sure the 'subscription-expense-optimizer' folder exists.
    pause
    exit /b 1
)

echo Found project at: %PROJECT_DIR%
cd /d "%PROJECT_DIR%"

:: 3. Check if Backend (port 5000) is running
netstat -ano | findstr /R /C:":5000 .*LISTENING" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Starting Backend API Server (Port 5000)...
    start "SubOptima Backend" /min cmd /c "cd /d "%PROJECT_DIR%\backend" && npm run dev"
    timeout /t 2 /nobreak >nul
) else (
    echo Backend API is already running on port 5000.
)

:: 4. Check if Frontend (port 5173) is running
netstat -ano | findstr /R /C:":5173 .*LISTENING" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Starting Frontend UI Server (Port 5173)...
    start "SubOptima Frontend" /min cmd /c "cd /d "%PROJECT_DIR%\frontend" && npm run dev"
    timeout /t 3 /nobreak >nul
) else (
    echo Frontend UI is already running on port 5173.
)

:: 5. Open browser automatically to the dashboard
echo.
echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ======================================================================
echo  [SUCCESS] SubOptima is up and running!
echo  URL: http://localhost:5173
echo ======================================================================
echo.
echo You can close this window at any time.
timeout /t 5 >nul
exit /b 0
