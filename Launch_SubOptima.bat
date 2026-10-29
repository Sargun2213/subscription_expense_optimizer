@echo off
setlocal enabledelayedexpansion
title SubOptima - One-Click Universal Launcher

echo ======================================================================
echo          SUBSCRIPTION EXPENSE OPTIMIZATION PLATFORM LAUNCHER
echo ======================================================================
echo.

:: 1. Ensure Node.js and Git are in PATH (inherited by all child processes)
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\Programs\MinGit\cmd;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%PATH%"

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js was not found on this computer.
    echo Please install Node.js LTS from https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Strip trailing backslash from script directory
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

:: 3. Auto-locate project directory (Prioritize folders with node_modules ready)
set "PROJECT_DIR="

for %%D in (
    "%SCRIPT_DIR%"
    "%SCRIPT_DIR%\subscription-expense-optimizer"
    "C:\Users\sargu\.gemini\antigravity\scratch\subscription-expense-optimizer"
    "%USERPROFILE%\OneDrive\Desktop\subscription-expense-optimizer"
    "%USERPROFILE%\Desktop\subscription-expense-optimizer"
    "%USERPROFILE%\Downloads\subscription-expense-optimizer"
) do (
    if "!PROJECT_DIR!"=="" (
        if exist "%%~D\backend\node_modules" (
            set "PROJECT_DIR=%%~D"
        )
    )
)

:: Fallback: Locate any folder with backend\package.json (will auto-install dependencies)
if "!PROJECT_DIR!"=="" (
    for %%D in (
        "%SCRIPT_DIR%"
        "%SCRIPT_DIR%\subscription-expense-optimizer"
        "C:\Users\sargu\.gemini\antigravity\scratch\subscription-expense-optimizer"
        "%USERPROFILE%\OneDrive\Desktop\subscription-expense-optimizer"
        "%USERPROFILE%\Desktop\subscription-expense-optimizer"
        "%USERPROFILE%\Downloads\subscription-expense-optimizer"
    ) do (
        if "!PROJECT_DIR!"=="" (
            if exist "%%~D\backend\package.json" (
                set "PROJECT_DIR=%%~D"
            )
        )
    )
)

if "!PROJECT_DIR!"=="" (
    echo [ERROR] Could not locate the 'subscription-expense-optimizer' project folder.
    echo Please keep this launcher on your Desktop, Downloads, or inside the project folder.
    pause
    exit /b 1
)

echo [INFO] Project located at: !PROJECT_DIR!
cd /d "!PROJECT_DIR!"

:: 4. Self-Healing Check: Ensure .env, node_modules, and database exist
if not exist "!PROJECT_DIR!\backend\.env" (
    if exist "!PROJECT_DIR!\backend\.env.example" (
        echo [SETUP] Creating backend .env configuration...
        copy /y "!PROJECT_DIR!\backend\.env.example" "!PROJECT_DIR!\backend\.env" >nul
    )
)

if not exist "!PROJECT_DIR!\backend\node_modules" (
    echo [SETUP] Installing backend dependencies ^(first-time setup^)...
    pushd "!PROJECT_DIR!\backend"
    call npm.cmd install
    popd
)

if not exist "!PROJECT_DIR!\backend\prisma\dev.db" (
    echo [SETUP] Initializing SQLite database and demo account...
    pushd "!PROJECT_DIR!\backend"
    call npx.cmd prisma generate
    call npx.cmd prisma db push
    call npm.cmd run prisma:seed
    popd
)

if not exist "!PROJECT_DIR!\frontend\node_modules" (
    echo [SETUP] Installing frontend dependencies ^(first-time setup^)...
    pushd "!PROJECT_DIR!\frontend"
    call npm.cmd install
    popd
)

:: 5. Start Backend Server (Port 5000) if not already listening
netstat -ano | findstr /R /C:":5000 .*LISTENING" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [1/3] Starting Backend API Server ^(Port 5000^)...
    start "SubOptima Backend (Port 5000)" /min /D "!PROJECT_DIR!\backend" cmd /k npm.cmd run dev
) else (
    echo [1/3] Backend API Server is already active on Port 5000.
)

:: 6. Start Frontend Server (Port 5173) if not already listening
netstat -ano | findstr /R /C:":5173 .*LISTENING" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [2/3] Starting Frontend Web Server ^(Port 5173^)...
    start "SubOptima Frontend (Port 5173)" /min /D "!PROJECT_DIR!\frontend" cmd /k npm.cmd run dev
) else (
    echo [2/3] Frontend Web Server is already active on Port 5173.
)

:: 7. Wait until Frontend (Port 5173) and Backend (Port 5000) are actively listening
echo [3/3] Waiting for servers to become ready...
set /a WAIT_COUNT=0

:WAIT_LOOP
set /a BACKEND_UP=0
set /a FRONTEND_UP=0

netstat -ano | findstr /R /C:":5000 .*LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 set /a BACKEND_UP=1

netstat -ano | findstr /R /C:":5173 .*LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 set /a FRONTEND_UP=1

if !BACKEND_UP! EQU 1 if !FRONTEND_UP! EQU 1 goto SERVERS_READY

set /a WAIT_COUNT+=1
if !WAIT_COUNT! GEQ 30 (
    echo [WARN] Servers are still starting up. Opening browser now...
    goto SERVERS_READY
)

ping 127.0.0.1 -n 2 >nul
goto WAIT_LOOP

:SERVERS_READY
endlocal
echo.
echo ======================================================================
echo  [SUCCESS] SubOptima is running!
echo  Frontend App : http://localhost:5173
echo  Backend API  : http://localhost:5000/api/health
echo  Demo Login   : demo@suboptimizer.io  /  DemoPassword123!
echo ======================================================================
echo.
echo Opening http://localhost:5173 in your default web browser...
start "" "http://localhost:5173"

ping 127.0.0.1 -n 4 >nul
exit /b 0
