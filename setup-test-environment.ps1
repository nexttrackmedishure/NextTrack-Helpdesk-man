# Chat Application Test Environment Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Chat Application Test Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create test users
Write-Host "[1/4] Creating test users in MongoDB..." -ForegroundColor Yellow
try {
    node create-test-users.js
    Write-Host "✅ Test users created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating test users: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Start backend server
Write-Host "[2/4] Starting backend server..." -ForegroundColor Yellow
try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js" -WindowStyle Normal
    Write-Host "✅ Backend server starting in new window..." -ForegroundColor Green
} catch {
    Write-Host "❌ Error starting backend server: $_" -ForegroundColor Red
}
Write-Host ""

# Step 3: Wait for backend to start
Write-Host "[3/4] Waiting 5 seconds for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 4: Start frontend server
Write-Host "[4/4] Starting frontend server..." -ForegroundColor Yellow
try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Write-Host "✅ Frontend server starting in new window..." -ForegroundColor Green
} catch {
    Write-Host "❌ Error starting frontend server: $_" -ForegroundColor Red
}
Write-Host ""

# Step 5: Wait and open test setup page
Write-Host "[5/5] Waiting 5 seconds for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Opening test setup page..." -ForegroundColor Yellow
try {
    Start-Process "test-chat-setup.html"
    Write-Host "✅ Test setup page opened!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error opening test setup page: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your test environment is now ready:" -ForegroundColor Green
Write-Host "- Backend server: http://localhost:5000" -ForegroundColor White
Write-Host "- Frontend server: http://localhost:3000" -ForegroundColor White
Write-Host "- Test setup page: test-chat-setup.html" -ForegroundColor White
Write-Host ""
Write-Host "You can now test the chat application with multiple users!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
