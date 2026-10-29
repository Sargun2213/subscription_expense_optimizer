Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Starting Subscription Expense Optimization Platform" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host " Frontend UI:  http://localhost:5173" -ForegroundColor White
Write-Host "=========================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; cd '$PSScriptRoot\backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "Servers launched in independent background windows." -ForegroundColor Green
