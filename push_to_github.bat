@echo off
setlocal enabledelayedexpansion
title Push SubOptima to GitHub

echo ======================================================================
echo          SUBSCRIPTION EXPENSE OPTIMIZER - GITHUB PUSH TOOL
echo ======================================================================
echo.

:: Ensure MinGit or standard Git is in PATH
set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%PATH%"

:: Verify Git is available
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git was not found in your system PATH.
    echo Please ensure Git is installed.
    echo.
    pause
    exit /b 1
)

:: Navigate to script directory
cd /d "%~dp0"

echo [1/4] Checking Git repository status...
if not exist ".git" (
    echo Initializing new Git repository...
    git init
    git branch -M main
)

:: Check for existing remote origin
set "CURRENT_REMOTE="
for /f "tokens=*" %%a in ('git remote get-url origin 2^>nul') do set "CURRENT_REMOTE=%%a"

echo.
if defined CURRENT_REMOTE (
    echo Current GitHub Remote: !CURRENT_REMOTE!
    echo.
    echo Options:
    echo   1. Press [ENTER] to push to this repository
    echo   2. Or paste a NEW GitHub URL to change the destination
    echo.
    set /p NEW_URL="Choose [ENTER to keep / Paste new URL]: "
    if not "!NEW_URL!"=="" (
        git remote remove origin 2>nul
        git remote add origin !NEW_URL!
        echo Updated remote origin to: !NEW_URL!
    )
) else (
    echo No GitHub remote detected for this project yet.
    echo.
    echo Please create an empty repository at: https://github.com/new
    echo.
    set /p NEW_URL="Paste your GitHub repository URL (e.g., https://github.com/your-username/your-repo.git): "
    if "!NEW_URL!"=="" (
        echo [ERROR] No GitHub URL provided. Aborting push.
        echo.
        pause
        exit /b 1
    )
    git remote add origin !NEW_URL!
    echo Remote origin set to: !NEW_URL!
)

echo.
echo [2/4] Staging all files...
git add .

echo.
echo [3/4] Committing changes...
set /p COMMIT_MSG="Enter commit message (Press ENTER for default: 'Update Subscription Platform'): "
if "!COMMIT_MSG!"=="" set "COMMIT_MSG=Update Subscription Platform"

git commit -m "!COMMIT_MSG!" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Changes committed successfully: "!COMMIT_MSG!"
) else (
    echo Working tree already clean or commit created.
)

:: Ensure branch name is main
git branch -M main

echo.
echo [4/4] Pushing to GitHub (branch: main)...
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo  [SUCCESS] All files have been successfully pushed to GitHub!
    echo ======================================================================
    echo.
) else (
    echo.
    echo ======================================================================
    echo  [PUSH FAILED]
    echo ======================================================================
    echo Common reasons:
    echo  1. You may need to sign in to GitHub in the prompt window.
    echo  2. If using GitHub Personal Access Token (PAT), paste it as password.
    echo  3. The repository URL might be misspelled or does not exist.
    echo.
)

pause
