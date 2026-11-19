@echo off
start "" /B /D "%~dp0" cmd /C "npx expo start"
start "" /B /D "%~dp0API" cmd /C "npm run start"
pause
