@echo off
setlocal
echo ========================================================
echo   Push SubOptima Repository to GitHub
echo ========================================================
echo.

set /p REPO_URL="Enter your GitHub repository URL (e.g. https://github.com/username/my-repo.git): "

if "%REPO_URL%"=="" (
    echo Error: No repository URL provided.
    pause
    exit /b 1
)

echo.
echo Adding remote origin: %REPO_URL%
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Pushing branch 'main' to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Your project has been pushed to GitHub!
    echo ========================================================
) else (
    echo.
    echo Push failed. Please check your GitHub repository URL and authentication.
)

echo.
pause
