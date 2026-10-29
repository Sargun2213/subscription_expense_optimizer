param(
    [string]$RepoUrl
)

$env:PATH = "$env:LOCALAPPDATA\Programs\MinGit\cmd;$env:PATH"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Push SubOptima Repository to GitHub" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $RepoUrl) {
    $RepoUrl = Read-Host "Enter your GitHub repository URL (e.g. https://github.com/username/my-repo.git)"
}

if (-not $RepoUrl) {
    Write-Host "Error: No repository URL provided." -ForegroundColor Red
    exit 1
}

Write-Host "`nSetting remote origin to: $RepoUrl" -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $RepoUrl
git branch -M main

Write-Host "`nPushing branch 'main' to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Your project has been pushed to GitHub!" -ForegroundColor Green
    Write-Host " Repository: $RepoUrl" -ForegroundColor Cyan
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "`nPush failed. Please check your GitHub repository URL and personal access token/credentials." -ForegroundColor Red
}
