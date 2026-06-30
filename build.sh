#!/bin/bash

# FocusFlow Build Script

echo "=== FocusFlow Build Script ==="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js 22+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "Warning: Node.js 20+ is recommended (current: $(node -v))"
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "Error: Rust is not installed"
    echo "Please install Rust from https://rustup.rs/"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo ""
echo "Building Tauri application..."
npm run build

echo ""
echo "Build complete! Check src-tauri/target/release/bundle/ for the installer."
