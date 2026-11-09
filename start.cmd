@echo off
if not exist "%~dp0dist\index.html" (
  echo Please run npm install and npm run build first.
  pause
  exit /b 1
)
start "" "%~dp0dist\index.html"
