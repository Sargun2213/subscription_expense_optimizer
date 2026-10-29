@echo off
setlocal enabledelayedexpansion
title Push to GitHub - One Click

:: Ensure MinGit or standard Git is in PATH
set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%PATH%"

:: Navigate to project directory
cd /d "%~dp0"
if not exist ".git" (
    if exist "%~dp0subscription-expense-optimizer\.git" (
        cd /d "%~dp0subscription-expense-optimizer"
    ) else if exist "%USERPROFILE%\OneDrive\Desktop\subscription-expense-optimizer\.git" (
        cd /d "%USERPROFILE%\OneDrive\Desktop\subscription-expense-optimizer"
    ) else if exist "C:\Users\sargu\.gemini\antigravity\scratch\subscription-expense-optimizer\.git" (
        cd /d "C:\Users\sargu\.gemini\antigravity\scratch\subscription-expense-optimizer"
    )
)

echo ======================================================================
echo              ONE-CLICK PUSH TO GITHUB
echo ======================================================================
echo.

:: Check if repository URL is already saved in github_repo.txt
set "REPO_URL="
if exist "github_repo.txt" (
    set /p REPO_URL=<"github_repo.txt"
)

:: If not saved, check git remote origin
if "!REPO_URL!"=="" (
    for /f "tokens=*" %%a in ('git remote get-url origin 2^>nul') do set "REPO_URL=%%a"
)

:: If still empty, prompt via Windows graphical popup or console
if "!REPO_URL!"=="" (
    echo Opening prompt for your GitHub repository URL...
    for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.Interaction]::InputBox('Enter or paste your GitHub repository URL (e.g. https://github.com/username/repo.git):', 'Connect GitHub Repository', [System.Windows.Forms.Clipboard]::GetText())"`) do set "REPO_URL=%%I"
)

:: If user cancelled or left empty, prompt in console
if "!REPO_URL!"=="" (
    echo.
    set /p REPO_URL="Enter your GitHub repository URL: "
)

if "!REPO_URL!"=="" (
    echo [ERROR] No GitHub URL provided. Aborting.
    pause
    exit /b 1
)

:: Clean and save the URL for future instant one-click pushes
echo !REPO_URL!> "github_repo.txt"

echo Target Repository: !REPO_URL!
echo.

:: Ensure origin is configured
git remote remove origin 2>nul
git remote add origin !REPO_URL!
git branch -M main

echo [1/3] Staging all files...
git add -A

echo [2/3] Creating commit...
git commit -m "feat: sync all project files to github" >nul 2>nul

echo [3/3] Pushing to GitHub main branch...
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo   SUCCESS! All files are now live on GitHub!
    echo   Repository: !REPO_URL!
    echo ======================================================================
    echo.
    echo Future pushes: Just double-click this file to instantly sync changes!
) else (
    echo.
    echo ======================================================================
    echo   Push encountered an error.
    echo ======================================================================
    echo If GitHub asks for authentication:
    echo 1. Browser Login: Follow the browser sign-in prompt if it opens.
    echo 2. Personal Access Token: Use your GitHub username and Personal Access Token (PAT) as password.
    echo.
)

pause
