#!/bin/bash
cd "$(dirname "$0")"
echo "========================================"
echo "   HEMS TACTICAL BRIDGE AUTO-LOADER"
echo "========================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[!] Dependencies missing. Initializing first-time setup..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] npm install failed. Ensure Node.js is installed."
        read -p "Press enter to exit..."
        exit 1
    fi
    echo "[SUCCESS] Setup complete."
fi

echo "[STATION] Starting HEMS Tactical Bridge Server..."
node server.js