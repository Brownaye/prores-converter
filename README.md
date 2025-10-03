# 🎬 ProRes Converter

A simple, elegant desktop application for converting MP4 videos to ProRes formats using FFmpeg.

## Features

- **Drag & Drop Interface** - Simply drop your MP4 files into the app
- **Multiple ProRes Formats**:
  - ProRes Proxy (Small) - Best for offline editing
  - ProRes 422 LT (Medium) - Balanced quality and size
  - ProRes 422 (Large) - High quality for production
  - ProRes 422 HQ (Large) - Highest quality
- **Size Estimation** - See estimated output file size before converting
- **Progress Tracking** - Real-time conversion progress with percentage
- **Pause/Resume** - Pause and resume conversions at any time
- **Batch Processing** - Convert multiple files at once
- **Modern UI** - Clean, intuitive interface

## Requirements

- **Node.js** (v14 or higher) and npm
- **FFmpeg** (must be installed and accessible from command line)
- **Linux** (Ubuntu, Debian, Fedora, Arch, etc.)

## Installation

1. **Install FFmpeg** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt install ffmpeg
   
   # Fedora
   sudo dnf install ffmpeg
   
   # Arch Linux
   sudo pacman -S ffmpeg
   ```

2. **Install Node.js** (if not already installed):
   - Download from [nodejs.org](https://nodejs.org/)
   - Or use your package manager

3. **Run the installation script**:
   ```bash
   cd prores-converter
   chmod +x install.sh
   ./install.sh
   ```

   The script will:
   - Check for required dependencies
   - Install npm packages
   - Optionally create a desktop shortcut

## Usage

### Starting the App

**Option 1: Desktop Shortcut**
- Double-click the "ProRes Converter" icon on your desktop

**Option 2: Command Line**
```bash
cd prores-converter
npm start
```

### Converting Videos

1. **Drop Files** - Drag and drop MP4 files into the app, or click to browse
2. **Select Format** - Choose your desired ProRes format
3. **Check Size** - Review the estimated output size
4. **Choose Destination** - Select where to save converted files (defaults to ~/Downloads)
5. **Convert** - Click "Start Conversion"
6. **Monitor Progress** - Watch the progress bar and use pause/cancel if needed
7. **Done!** - Converted files are saved to your chosen destination

### Output Files

Converted files are saved with the format:
```
original_filename_ProRes_FORMAT.mov
```

For example:
- `video.mp4` → `video_ProRes_PROXY.mov`
- `video.mp4` → `video_ProRes_422.mov`

By default, files are saved to your **Downloads** folder (`~/Downloads`), but you can choose any destination using the Browse button.

## Controls

- **Pause** - Temporarily pause the conversion
- **Resume** - Continue a paused conversion
- **Cancel** - Stop and abort the current conversion

## ProRes Format Guide

| Format | Size | Bitrate (1080p) | Best For |
|--------|------|-----------------|----------|
| **Proxy** | Small | ~45 Mbps | Offline editing, previews |
| **422 LT** | Medium | ~102 Mbps | Balanced quality/size |
| **422** | Large | ~147 Mbps | Production, color grading |
| **422 HQ** | Largest | ~220 Mbps | Maximum quality, VFX |

## Troubleshooting

### "FFmpeg not found" error
- Make sure FFmpeg is installed: `ffmpeg -version`
- Add FFmpeg to your PATH if needed

### Conversion fails
- Check that the input file is a valid MP4
- Ensure you have write permissions in the output directory
- Check disk space for large conversions

### Desktop shortcut doesn't work
- Make sure the shortcut is executable: `chmod +x ~/Desktop/ProRes-Converter.desktop`
- Try marking it as trusted: `gio set ~/Desktop/ProRes-Converter.desktop metadata::trusted true`

## Development

To modify the app:

1. Edit the source files:
   - `main.js` - Main Electron process
   - `renderer.js` - UI logic
   - `index.html` - Interface structure
   - `styles.css` - Styling

2. Restart the app to see changes

## Technical Details

- **Framework**: Electron
- **Video Processing**: FFmpeg (prores_ks encoder)
- **Audio**: PCM 16-bit (uncompressed)
- **Container**: QuickTime MOV

## License

MIT License - Feel free to use and modify as needed!

## Credits

Built with Electron and FFmpeg
# prores-converter
