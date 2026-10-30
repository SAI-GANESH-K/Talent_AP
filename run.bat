@echo off
setlocal enabledelayedexpansion
title CoverWise - Intelligent Life Insurance Advisory Platform (Team We4)
color 0b

echo ===============================================================================
echo        COVERWISE - INTELLIGENT LIFE INSURANCE ADVISORY PLATFORM
echo                     Talent AP Mega Hackathon 2026 - Team We4
echo ===============================================================================
echo.

:: Resolve Directory Paths
set "CURRENT_DIR=%~dp0"
if exist "%CURRENT_DIR%FULL_CODE\backend" (
    set "BACKEND_DIR=%CURRENT_DIR%FULL_CODE\backend"
    set "FRONTEND_DIR=%CURRENT_DIR%FULL_CODE\frontend"
) else if exist "%CURRENT_DIR%backend" (
    set "BACKEND_DIR=%CURRENT_DIR%backend"
    set "FRONTEND_DIR=%CURRENT_DIR%frontend"
) else (
    echo [ERROR] Could not locate backend and frontend folders.
    echo Please make sure this script is located in the project root or FULL_CODE folder.
    pause
    exit /b 1
)

:: Free up ports 8000 and 5173 forcefully in case any old or hung processes are lingering
echo [*] Checking and clearing ports 8000 and 5173...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: Validate Backend Python Virtual Environment
if not exist "%BACKEND_DIR%\.venv\Scripts\python.exe" (
    echo [ERROR] Backend virtual environment not found at: %BACKEND_DIR%\.venv
    echo Please create the virtual environment first:
    echo   cd "%BACKEND_DIR%"
    echo   python -m venv .venv
    echo   .venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

:: Validate Frontend node_modules
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [ERROR] Frontend node_modules not found at: %FRONTEND_DIR%\node_modules
    echo Please install frontend dependencies first:
    echo   cd "%FRONTEND_DIR%"
    echo   npm install
    pause
    exit /b 1
)

:: Automatically Detect Local Network IPv4 Address for Mobile Demo
set "LOCAL_IP=localhost"
for /f "tokens=4" %%a in ('route print 0.0.0.0 2^>nul ^| findstr " 0.0.0.0 "') do (
    if "!LOCAL_IP!"=="localhost" set "LOCAL_IP=%%a"
)

echo [*] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "CoverWise - Backend Server (FastAPI :8000)" cmd /k "cd /d "%BACKEND_DIR%" && call .venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Brief pause to let backend initialize
timeout /t 2 /nobreak >nul

echo [*] Starting Vite Frontend on http://localhost:5173 ...
start "CoverWise - Frontend Server (Vite :5173)" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo ===============================================================================
echo                      COVERWISE SERVERS ARE NOW RUNNING!
echo ===============================================================================
echo.
echo   [PC / LAPTOP BROWSER]
echo   -- Frontend Web App:     http://localhost:5173
echo   -- Backend API Docs:     http://localhost:8000/docs
echo   -- Backend Health API:   http://localhost:8000/api/v1/health
echo.
echo   [MOBILE BROWSER - CONNECTED TO SAME WI-FI]
echo   -- Mobile Phone URL:     http://!LOCAL_IP!:5173
echo.
echo ===============================================================================
echo.
echo Opening CoverWise in your default browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Servers are running in the background terminal windows.
echo To stop both servers cleanly, simply run stop.bat or close this window.
echo.
pause
