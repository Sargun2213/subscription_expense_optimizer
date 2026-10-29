@echo off
setlocal enabledelayedexpansion
title SubOptima - One-Click Push to GitHub

echo ======================================================================
echo          SUBSCRIPTION EXPENSE OPTIMIZER - GITHUB PUSH LAUNCHER
echo ======================================================================
echo.

:: 1. Ensure Portable Git (MinGit) and Standard Git are in PATH
set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;C:\Program Files\nodejs;%PATH%"

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git was not found on this computer.
    pause
    exit /b 1
)

:: 2. Strip trailing backslash from script directory
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

:: 3. Auto-locate project directory from anywhere
set "PROJECT_DIR="

for %%D in (
    "C:\Users\sargu\.gemini\antigravity\scratch\subscription-expense-optimizer"
    "%SCRIPT_DIR%"
    "%SCRIPT_DIR%\subscription-expense-optimizer"
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

if "!PROJECT_DIR!"=="" (
    echo [ERROR] Could not locate the 'subscription-expense-optimizer' project folder.
    pause
    exit /b 1
)

echo [INFO] Project located at: !PROJECT_DIR!
cd /d "!PROJECT_DIR!"

:: 4. Initialize Git repository if not already initialized
if not exist ".git" (
    echo [SETUP] Initializing Git repository...
    git init
    git branch -M main
)

:: Ensure Git author identity is configured locally
for /f "tokens=*" %%a in ('git config user.name 2^>nul') do set "GIT_USER=%%a"
if "!GIT_USER!"=="" (
    git config user.name "Sargun2213"
    git config user.email "sargun@suboptimizer.io"
)

:: 5. Determine Target GitHub Repository URL
set "REPO_URL="
if exist "github_repo.txt" (
    set /p REPO_URL=<"github_repo.txt"
)
if "!REPO_URL!"=="" (
    for /f "tokens=*" %%a in ('git remote get-url origin 2^>nul') do set "REPO_URL=%%a"
)
if "!REPO_URL!"=="" (
    set "REPO_URL=https://github.com/Sargun2213/subscription_expense_optimizer.git"
)

:: Trim any trailing spaces
for /f "tokens=* delims= " %%a in ("!REPO_URL!") do set "REPO_URL=%%a"

echo.
echo Current Target GitHub Repository:
echo   !REPO_URL!
echo.
set "INPUT_URL="
set /p INPUT_URL="Press [ENTER] to push here, or paste a new GitHub URL: "
if not "!INPUT_URL!"=="" (
    set "REPO_URL=!INPUT_URL!"
)

:: Save URL for future runs
echo !REPO_URL!>"github_repo.txt"

:: Configure remote origin
git remote remove origin 2>nul
git remote add origin "!REPO_URL!"

echo.
echo [1/3] Staging all project files ^(excluding node_modules and secrets^)...
git add -A

echo [2/3] Creating commit on branch 'main'...
git commit -m "feat: full-stack subscription expense optimization platform" >nul 2>nul
git branch -M main

echo [3/3] Uploading all files to GitHub...
echo.
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    set "BROWSER_URL=!REPO_URL:.git=!"
    echo.
    echo ======================================================================
    echo  [SUCCESS] All project files have been pushed to GitHub!
    echo  Repository : !BROWSER_URL!
    echo ======================================================================
    echo.
    echo Opening your GitHub repository in the browser...
    start "" "!BROWSER_URL!"
    ping 127.0.0.1 -n 4 >nul
    exit /b 0
) else (
    echo.
    echo ======================================================================
    echo  [ERROR] Push could not complete.
    echo ======================================================================
    echo  1. Make sure the repository exists on GitHub: !REPO_URL!
    echo  2. If prompted for credentials, sign in with your GitHub account
    echo     or paste your GitHub Personal Access Token ^(PAT^) as the password.
    echo.
    pause
    exit /b 1
)
