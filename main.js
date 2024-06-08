const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const downloadAudio = require('./download');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
            contextIsolation: false,
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
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

ipcMain.on('download-video', async (event, youtubeUrl) => {
    const outputPath = path.join(__dirname, 'downloads');
    await downloadAudio(youtubeUrl, outputPath);
    event.reply('download-complete', 'Download completed!');
});
