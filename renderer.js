const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let selectedFiles = [];
let currentFileIndex = 0;
let totalDuration = 0;
let isPaused = false;
let exportDestination = path.join(os.homedir(), 'Downloads');

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileList = document.getElementById('fileList');
const formatSelection = document.getElementById('formatSelection');
const estimatedSizeEl = document.getElementById('sizeEstimate');
const destinationPathEl = document.getElementById('destinationPath');
const browseDestBtn = document.getElementById('browseDestBtn');
const convertBtn = document.getElementById('convertBtn');
const progressSection = document.getElementById('progressSection');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const currentFileEl = document.getElementById('currentFile').querySelector('span');
const pauseBtn = document.getElementById('pauseBtn');
const cancelBtn = document.getElementById('cancelBtn');
const completeSection = document.getElementById('completeSection');
const completedFiles = document.getElementById('completedFiles');
const newConversionBtn = document.getElementById('newConversionBtn');

// Set default destination
destinationPathEl.value = exportDestination;

// Size estimation factors (approximate bitrates in Mbps for 1080p video)
const bitrateEstimates = {
    'proxy': 45,    // ~45 Mbps
    'lt': 102,      // ~102 Mbps
    '422': 147,     // ~147 Mbps
    'hq': 220       // ~220 Mbps
};

// Drop zone handlers
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Browse destination button
browseDestBtn.addEventListener('click', async () => {
    const result = await ipcRenderer.invoke('select-destination-folder', exportDestination);
    if (!result.canceled && result.filePaths.length > 0) {
        exportDestination = result.filePaths[0];
        destinationPathEl.value = exportDestination;
    }
});

// Handle selected files
async function handleFiles(files) {
    selectedFiles = Array.from(files).filter(file => 
        file.name.toLowerCase().endsWith('.mp4')
    );
    
    if (selectedFiles.length === 0) {
        alert('Please select MP4 files only.');
        return;
    }
    
    // Display file info
    fileList.innerHTML = '';
    for (const file of selectedFiles) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        
        fileItem.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">${fileSizeMB} MB</span>
        `;
        
        fileList.appendChild(fileItem);
    }
    
    fileInfo.style.display = 'block';
    formatSelection.style.display = 'block';
    dropZone.style.display = 'none';
    
    // Calculate estimated size
    updateEstimatedSize();
}

// Update estimated size when format changes
document.querySelectorAll('input[name="format"]').forEach(radio => {
    radio.addEventListener('change', updateEstimatedSize);
});

async function updateEstimatedSize() {
    const selectedFormat = document.querySelector('input[name="format"]:checked').value;
    let totalEstimatedSize = 0;
    
    try {
        for (const file of selectedFiles) {
            const videoInfo = await ipcRenderer.invoke('get-video-info', file.path);
            const duration = parseFloat(videoInfo.format.duration) || 0;
            
            // Get video resolution to adjust bitrate
            const videoStream = videoInfo.streams.find(s => s.codec_type === 'video');
            const width = videoStream?.width || 1920;
            const height = videoStream?.height || 1080;
            
            // Adjust bitrate based on resolution (reference is 1080p)
            const resolutionFactor = (width * height) / (1920 * 1080);
            const adjustedBitrate = bitrateEstimates[selectedFormat] * resolutionFactor;
            
            // Calculate size in MB (bitrate in Mbps * duration in seconds / 8)
            const estimatedSizeMB = (adjustedBitrate * duration) / 8;
            totalEstimatedSize += estimatedSizeMB;
        }
        
        const sizeGB = (totalEstimatedSize / 1024).toFixed(2);
        const sizeMB = totalEstimatedSize.toFixed(2);
        
        if (totalEstimatedSize > 1024) {
            estimatedSizeEl.textContent = `~${sizeGB} GB`;
        } else {
            estimatedSizeEl.textContent = `~${sizeMB} MB`;
        }
    } catch (err) {
        console.error('Error calculating size:', err);
        estimatedSizeEl.textContent = 'Unable to calculate';
    }
}

// Convert button handler
convertBtn.addEventListener('click', async () => {
    const selectedFormat = document.querySelector('input[name="format"]:checked').value;
    
    fileInfo.style.display = 'none';
    formatSelection.style.display = 'none';
    progressSection.style.display = 'block';
    
    currentFileIndex = 0;
    await convertNextFile(selectedFormat);
});

async function convertNextFile(format) {
    if (currentFileIndex >= selectedFiles.length) {
        // All files converted
        showComplete();
        return;
    }
    
    const file = selectedFiles[currentFileIndex];
    const inputPath = file.path;
    const fileName = path.parse(file.name).name;
    const outputPath = path.join(exportDestination, `${fileName}_ProRes_${format.toUpperCase()}.mov`);
    
    currentFileEl.textContent = file.name;
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    
    try {
        // Get video duration for progress calculation
        const videoInfo = await ipcRenderer.invoke('get-video-info', inputPath);
        totalDuration = parseFloat(videoInfo.format.duration) || 0;
        
        // Start conversion
        await ipcRenderer.invoke('convert-video', {
            inputPath: inputPath,
            outputPath: outputPath,
            profile: format
        });
        
        currentFileIndex++;
        await convertNextFile(format);
    } catch (err) {
        console.error('Conversion error:', err);
        alert(`Error converting ${file.name}: ${err.message}`);
        resetApp();
    }
}

// Listen for progress updates
ipcRenderer.on('conversion-progress', (event, currentTime) => {
    if (totalDuration > 0) {
        const progress = Math.min((currentTime / totalDuration) * 100, 100);
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }
});

// Pause/Resume button
pauseBtn.addEventListener('click', async () => {
    if (!isPaused) {
        await ipcRenderer.invoke('pause-conversion');
        isPaused = true;
        pauseBtn.innerHTML = '▶ Resume';
        pauseBtn.style.background = '#4caf50';
    } else {
        await ipcRenderer.invoke('resume-conversion');
        isPaused = false;
        pauseBtn.innerHTML = '⏸ Pause';
        pauseBtn.style.background = '#ff9800';
    }
});

// Cancel button
cancelBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to cancel the conversion?')) {
        await ipcRenderer.invoke('cancel-conversion');
        resetApp();
    }
});

// Show completion
function showComplete() {
    progressSection.style.display = 'none';
    completeSection.style.display = 'block';
    
    completedFiles.textContent = `Successfully converted ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}! Saved to: ${exportDestination}`;
}

// New conversion button
newConversionBtn.addEventListener('click', () => {
    resetApp();
});

// Reset app to initial state
function resetApp() {
    selectedFiles = [];
    currentFileIndex = 0;
    totalDuration = 0;
    isPaused = false;
    
    fileInfo.style.display = 'none';
    formatSelection.style.display = 'none';
    progressSection.style.display = 'none';
    completeSection.style.display = 'none';
    dropZone.style.display = 'block';
    
    fileInput.value = '';
    pauseBtn.innerHTML = '⏸ Pause';
    pauseBtn.style.background = '#ff9800';
}
