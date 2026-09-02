@echo off
title CBT Examination System + Cloudflare Tunnel
color 0b
cd /d "%~dp0"

echo =====================================================================
echo   CBT EXAMINATION PLATFORM + CLOUDFLARE TUNNEL (1-CLICK LAUNCHER)
echo =====================================================================
echo.

:: 1. Verify Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: 2. Start Backend Server in the background
echo [1/3] Starting CBT Server on http://localhost:8080 ...
start "CBT Backend Server (Port 8080)" /min cmd /c "npm run serve"

:: Wait 3 seconds for server initialization
timeout /t 3 /nobreak >nul

:: 3. Launch Cloudflare Tunnel
echo [2/3] Connecting Cloudflare Tunnel [cbt] ...
echo       Public Domain: https://cbt.rajatkolhapure.me
echo.

if exist "cloudflared.exe" (
    start "Cloudflare Tunnel (cbt)" cmd /k "cloudflared.exe tunnel run cbt"
) else (
    echo [WARNING] cloudflared.exe not found in current directory!
    echo Running with system cloudflared if available...
    start "Cloudflare Tunnel (cbt)" cmd /k "cloudflared tunnel run cbt"
)

:: 4. Open Localhost in Browser
echo [3/3] Opening browser to http://localhost:8080 ...
timeout /t 1 /nobreak >nul
start http://localhost:8080

echo.
echo =====================================================================
echo   SYSTEM READY & RUNNING!
echo   -------------------------------------------------------------------
echo   Local Access:      http://localhost:8080
echo   Cloudflare Tunnel: https://cbt.rajatkolhapure.me
echo   Admin Login:       admin@cbt.com   / admin123
echo   Student Login:     student@cbt.com / student123
echo                      parth@cbt.com   / student123
echo =====================================================================
echo.
echo (Keep the server and tunnel windows open while running.)
echo.
pause
