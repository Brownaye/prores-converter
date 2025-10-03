const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let conversionProcess = null;
let isPaused = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    resizable: true,
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Uncomment for debugging
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Get file size
ipcMain.handle('get-file-size', async (event, filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (err) {
    return 0;
  }
});

// Get video duration and info
ipcMain.handle('get-video-info', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ]);

    let output = '';
    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });

    ffprobe.on('close', (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(output);
          resolve(info);
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error('ffprobe failed'));
      }
    });
  });
});

// Convert video
ipcMain.handle('convert-video', async (event, { inputPath, outputPath, profile }) => {
  return new Promise((resolve, reject) => {
    isPaused = false;
    
    // ProRes profiles mapping
    const profileMap = {
      'proxy': 0,      // ProRes Proxy
      'lt': 1,         // ProRes 422 LT
      '422': 2,        // ProRes 422
      'hq': 3          // ProRes 422 HQ
    };

    const args = [
      '-i', inputPath,
      '-c:v', 'prores_ks',
      '-profile:v', profileMap[profile].toString(),
      '-c:a', 'pcm_s16le',
      '-progress', 'pipe:1',
      '-y',
      outputPath
    ];

    conversionProcess = spawn('ffmpeg', args);

    conversionProcess.stdout.on('data', (data) => {
      const output = data.toString();
      // Parse progress from FFmpeg output
      const timeMatch = output.match(/out_time_ms=(\d+)/);
      if (timeMatch) {
        const currentTime = parseInt(timeMatch[1]) / 1000000; // Convert to seconds
        mainWindow.webContents.send('conversion-progress', currentTime);
      }
    });

    conversionProcess.stderr.on('data', (data) => {
      // FFmpeg outputs to stderr even for normal operation
      const output = data.toString();
      mainWindow.webContents.send('conversion-log', output);
    });

    conversionProcess.on('close', (code) => {
      conversionProcess = null;
      if (code === 0) {
        resolve({ success: true });
      } else if (code === 255) {
        // User cancelled
        resolve({ success: false, cancelled: true });
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    conversionProcess.on('error', (err) => {
      reject(err);
    });
  });
});

// Pause conversion
ipcMain.handle('pause-conversion', async () => {
  if (conversionProcess && !isPaused) {
    conversionProcess.kill('SIGSTOP');
    isPaused = true;
    return { paused: true };
  }
  return { paused: false };
});

// Resume conversion
ipcMain.handle('resume-conversion', async () => {
  if (conversionProcess && isPaused) {
    conversionProcess.kill('SIGCONT');
    isPaused = false;
    return { resumed: true };
  }
  return { resumed: false };
});

// Cancel conversion
ipcMain.handle('cancel-conversion', async () => {
  if (conversionProcess) {
    conversionProcess.kill('SIGTERM');
    conversionProcess = null;
    isPaused = false;
    return { cancelled: true };
  }
  return { cancelled: false };
});

// Open save dialog
ipcMain.handle('show-save-dialog', async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath,
    filters: [
      { name: 'MOV Files', extensions: ['mov'] }
    ]
  });
  return result;
});

// Select destination folder
ipcMain.handle('select-destination-folder', async (event, defaultPath) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    defaultPath: defaultPath,
    properties: ['openDirectory', 'createDirectory']
  });
  return result;
});
