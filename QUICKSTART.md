# 🚀 Quick Start Guide

## You're All Set!

Your ProRes Converter app is installed and ready to use!

## How to Launch

Choose one of these methods:

### 1. Desktop Shortcut (Easiest)
- **Double-click** the **"ProRes Converter"** icon on your desktop
- The app will launch automatically

### 2. Command Line
```bash
cd "prores-converter"
npm start
```

### 3. Quick Start Script
```bash
cd "prores-converter"
./start.sh
```

## How to Use

1. **Launch the app** using any method above
2. **Drag and drop** your MP4 files into the app window (or click to browse)
3. **Select a ProRes format**:
   - **ProRes Proxy** - Smallest size (~45 Mbps)
   - **ProRes 422 LT** - Medium size (~102 Mbps)
   - **ProRes 422** - Large size (~147 Mbps)
   - **ProRes 422 HQ** - Largest size (~220 Mbps)
4. **Check the estimated output size** displayed in the yellow box
5. **Choose export destination** - Defaults to ~/Downloads, or click Browse to select another folder
6. **Click "Start Conversion"**
7. **Monitor progress** with the progress bar
   - Use **Pause** to temporarily stop
   - Use **Cancel** to abort
8. **Done!** Your converted files will be in your chosen destination folder

## Output Files

Converted files are automatically saved as:
```
original_filename_ProRes_FORMAT.mov
```

Example:
- `my_video.mp4` → `my_video_ProRes_422.mov`

## Tips

- 💡 **Batch Processing**: Drop multiple MP4 files at once to convert them all
- 💡 **Size Preview**: The app estimates output size based on video duration and resolution
- 💡 **Quality Guide**: Use **Proxy** for editing, **422** for delivery, **HQ** for mastering
- 💡 **Pause Anytime**: Pause and resume long conversions without losing progress
- 💡 **Export Location**: Files default to Downloads folder, but you can choose any location
- 💡 **Persistent Choice**: Your export folder selection is remembered between conversions

## Troubleshooting

### App won't launch from desktop
Try right-clicking the shortcut and selecting "Allow Launching"

### "FFmpeg not found"
Install FFmpeg:
```bash
sudo apt install ffmpeg
```

### Need Help?
Check the full `README.md` for detailed information and troubleshooting.

---

**Enjoy your new ProRes Converter! 🎬**
