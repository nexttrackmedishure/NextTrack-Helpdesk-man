@echo off
echo ========================================
echo   Chat Application Test Environment Setup
echo ========================================
echo.

echo [1/4] Creating test users in MongoDB...
node create-test-users.js
echo.

echo [2/4] Starting backend server...
start "Backend Server" cmd /k "node server.js"
echo Backend server starting in new window...
echo.

echo [3/4] Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo [4/4] Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"
echo Frontend server starting in new window...
echo.

echo [5/5] Opening test setup page...
timeout /t 5 /nobreak >nul
start "" "test-chat-setup.html"
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Your test environment is now ready:
echo - Backend server: http://localhost:5000
echo - Frontend server: http://localhost:3000
echo - Test setup page: test-chat-setup.html
echo.
echo You can now test the chat application with multiple users!
echo.
pause
