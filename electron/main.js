const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (isDev) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    } else {
        // In production, we can either load a remote URL (wrapper mode)
        // or load static files (standalone mode)
        const PROD_URL = process.env.ELECTRON_APP_URL || 'https://your-production-url.com'; // TODO: Update this with your actual production URL

        // To use wrapper mode, uncomment the following line and comment out win.loadFile
        // win.loadURL(PROD_URL);

        // Default: Load static build
        win.loadFile(path.join(__dirname, '../out/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
