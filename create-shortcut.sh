#!/bin/bash

# ProRes Converter Desktop Shortcut Creator

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESKTOP_FILE="$HOME/Desktop/ProRes-Converter.desktop"

echo "Creating desktop shortcut for ProRes Converter..."

# Create .desktop file
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=ProRes Converter
Comment=Convert MP4 videos to ProRes formats
Exec=bash -c "cd '$APP_DIR' && npm start"
Icon=$APP_DIR/icon.svg
Terminal=false
Categories=AudioVideo;Video;
StartupNotify=true
EOF

# Make it executable
chmod +x "$DESKTOP_FILE"

# For newer Ubuntu/GNOME versions, also trust the file
if command -v gio &> /dev/null; then
    gio set "$DESKTOP_FILE" metadata::trusted true
fi

echo "✓ Desktop shortcut created successfully!"
echo "You can now launch ProRes Converter from your desktop."
