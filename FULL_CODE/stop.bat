@echo off
title Stop CoverWise Servers
color 0c
echo ===============================================================================
echo                    STOPPING COVERWISE SERVERS
echo ===============================================================================
echo.

echo [*] Forcefully terminating processes on ports 8000, 5173, and 5174...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000,5173,5174 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo.
echo [✓] CoverWise servers have been stopped. Ports 8000, 5173, and 5174 are free.
echo.
pause
