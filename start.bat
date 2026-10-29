@echo off
echo =========================================================
echo  Starting Subscription Expense Optimization Platform
echo =========================================================
echo Backend URL:  http://localhost:5000
echo Frontend URL: http://localhost:5173
echo.
start "Backend API (Port 5000)" cmd /k "cd backend && npm run dev"
start "Frontend UI (Port 5173)" cmd /k "cd frontend && npm run dev"
echo Both servers launched in separate windows!
pause
