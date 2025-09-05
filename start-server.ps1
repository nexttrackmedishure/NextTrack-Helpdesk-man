# PowerShell script to start the development server
Set-Location -Path $PSScriptRoot
Write-Host "Starting development server from: $(Get-Location)" -ForegroundColor Green
npm run dev
