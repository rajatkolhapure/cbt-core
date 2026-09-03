@echo off
title Stopping CBT Services
echo Stopping CBT server and cloudflared tunnel...
taskkill /F /IM cloudflared.exe >nul 2>&1
powershell -Command "Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
echo All CBT services stopped.
timeout /t 2 >nul
