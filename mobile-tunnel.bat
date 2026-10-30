@echo off
title CoverWise - Mobile Public Tunnel (Cloudflare)
color 0b

echo ===============================================================================
echo                COVERWISE - MOBILE PUBLIC TUNNEL (CLOUDFLARE)
echo ===============================================================================
echo.
echo [*] Starting Cloudflare Tunnel to port 5173...
echo [*] This allows accessing the web app from mobile phones on 4G/5G mobile data.
echo.

set "ROOT_DIR=%~dp0"
if exist "%ROOT_DIR%cloudflared.exe" (
    set "CF_EXE=%ROOT_DIR%cloudflared.exe"
) else if exist "%ROOT_DIR%..\cloudflared.exe" (
    set "CF_EXE=%ROOT_DIR%..\cloudflared.exe"
) else (
    echo [ERROR] cloudflared.exe not found.
    pause
    exit /b 1
)

"%CF_EXE%" tunnel --url http://localhost:5173
pause

