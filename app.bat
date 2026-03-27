@echo off
title ChatVVP - Master Startup
echo 🚀 Starting the entire ChatVVP Platform...
echo.

echo 📡 Starting Backend (Port 3000)...
start "Backend" cmd /k "cd api && node server.js"

echo 📱 Starting Mobile App (Expo)...
start "Frontend-App" cmd /k "cd AI-College-Study-Assistant && call npx expo start -c --offline"

echo 🌐 Starting Website (Vite on Port 5173)...
start "Frontend-Web" cmd /k "cd web && npm run dev"

echo 🔗 Opening Website...
timeout /t 5 >nul
start http://localhost:5173/

echo.
echo =======================================================
echo All services are starting in separate windows!
echo - Backend: http://localhost:3000
echo - Website: http://localhost:5173
echo - Mobile App: (Check terminal for Expo QR Code)
echo =======================================================
pause
