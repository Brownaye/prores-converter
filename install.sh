#!/bin/bash

# ProRes Converter Installation Script

echo "================================"
echo "ProRes Converter - Installation"
echo "================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg first."
    echo "Ubuntu/Debian: sudo apt install ffmpeg"
    echo "Fedora: sudo dnf install ffmpeg"
    echo "Arch: sudo pacman -S ffmpeg"
    exit 1
fi

echo "✓ npm found: $(npm --version)"
echo "✓ FFmpeg found: $(ffmpeg -version | head -n 1)"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Dependencies installed successfully!"
    echo ""
    
    # Create desktop shortcut
    read -p "Create desktop shortcut? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        chmod +x create-shortcut.sh
        ./create-shortcut.sh
    fi
    
    echo ""
    echo "================================"
    echo "Installation Complete!"
    echo "================================"
    echo ""
    echo "To start the app, run: npm start"
    echo ""
else
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
