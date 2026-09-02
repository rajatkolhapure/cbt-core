# CBT Examination Platform + Cloudflare Tunnel PowerShell Launcher
$Host.UI.RawUI.WindowTitle = "CBT Platform + Cloudflare Tunnel"
Set-Location $PSScriptRoot

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  CBT EXAMINATION PLATFORM + CLOUDFLARE TUNNEL (1-CLICK LAUNCH)  " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start CBT Backend Server
Write-Host "[1/3] Starting CBT Server on http://localhost:8080 ..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run serve" -WindowStyle Minimized

Start-Sleep -Seconds 3

# 2. Start Cloudflare Tunnel
Write-Host "[2/3] Connecting Cloudflare Tunnel [cbt] -> https://cbt.rajatkolhapure.me ..." -ForegroundColor Yellow
if (Test-Path ".\cloudflared.exe") {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k .\cloudflared.exe tunnel run cbt"
} else {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cloudflared tunnel run cbt"
}

# 3. Open Browser
Write-Host "[3/3] Opening browser ..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
Start-Process "http://localhost:8080"

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "  SYSTEM READY & RUNNING!                                        " -ForegroundColor Green
Write-Host "  -------------------------------------------------------------  " -ForegroundColor Green
Write-Host "  Local URL:         http://localhost:8080                       " -ForegroundColor White
Write-Host "  Cloudflare Domain: https://cbt.rajatkolhapure.me               " -ForegroundColor White
Write-Host "  Admin Login:       admin@cbt.com   / admin123                  " -ForegroundColor Gray
Write-Host "  Student Login:     student@cbt.com / student123                " -ForegroundColor Gray
Write-Host "                     parth@cbt.com   / student123                " -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit this status window (services will remain running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
