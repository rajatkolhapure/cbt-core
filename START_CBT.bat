@echo off
title CBT Platform + Cloudflare Tunnel
echo ===================================================
echo   Starting CBT Platform + Cloudflare Tunnel
echo ===================================================
echo.
start "CBT Server" /min cmd /c "npm run serve"
ping 127.0.0.1 -n 4 >nul
start "Cloudflare Tunnel (cbt)" /min cmd /c "cloudflared.exe --config config.yml tunnel run"
echo.
echo Server: http://localhost:8080
echo Tunnel: https://cbt.rajatkolhapure.me
echo ===================================================
start http://localhost:8080
