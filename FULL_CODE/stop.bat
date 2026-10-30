@echo off
title Stop CoverWise Servers
color 0c
echo ===============================================================================
echo                    STOPPING COVERWISE SERVERS
echo ===============================================================================
echo.

echo [*] Terminating FastAPI backend on port 8000...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo     Killing process PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo [*] Terminating Vite frontend on port 5173 and 5174...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo     Killing process PID %%a
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5174" ^| findstr "LISTENING"') do (
    echo     Killing process PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [✓] CoverWise servers have been stopped. Ports 8000, 5173, and 5174 are free.
echo.
pause

