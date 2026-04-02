@echo off
TITLE HEMS Tactical Bridge v5.2
echo ###########################################################
echo #             HEMS TACTICAL BRIDGE v5.2                   #
echo #          INITIALIZING SECURE DATA LINK                  #
echo ###########################################################
echo.

:: Check for Node.js
node -v >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install it from: https://nodejs.org/
    pause
    exit
)

:: Install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [1/2] First time setup: Installing tactical protocols...
    call npm install --quiet
)

:: Start the server and open the HUD
echo [2/2] Launching Tactical Bridge...
start http://localhost:8080
node server.js

pause