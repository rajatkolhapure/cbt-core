@echo off
title Stop CBT Server and Tunnel
color 0c
echo =====================================================================
echo   STOPPING CBT SERVER AND CLOUDFLARE TUNNEL
echo =====================================================================
echo.

echo [1/2] Stopping cloudflared processes...
taskkill /F /IM cloudflared.exe 2>nul

echo [2/2] Stopping node processes running on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo All CBT processes stopped successfully.
timeout /t 2 >nul
