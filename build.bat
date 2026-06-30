@echo off
REM FocusFlow Build Script for Windows

echo === FocusFlow Build Script ===
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js 22+ from https://nodejs.org/
    exit /b 1
)

REM Check if Rust is installed
where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Rust is not installed
    echo Please install Rust from https://rustup.rs/
    exit /b 1
)

echo Installing dependencies...
call npm install

echo.
echo Building Tauri application...
call npm run build

echo.
echo Build complete! Check src-tauri\target\release\bundle\ for the installer.
