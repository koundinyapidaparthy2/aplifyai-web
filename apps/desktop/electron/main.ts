import { app, BrowserWindow, ipcMain, systemPreferences } from 'electron'
import path from 'node:path'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })


    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(() => {
    // IPC Handlers
    ipcMain.handle('toggle-always-on-top', (event: Electron.IpcMainInvokeEvent, flag: boolean) => {
        if (win) {
            win.setAlwaysOnTop(flag, 'screen-saver');
            return win.isAlwaysOnTop();
        }
        return false;
    });

    ipcMain.handle('open-external', async (_event, url: string) => {
        const { shell } = require('electron');
        await shell.openExternal(url);
    });

    createWindow();

    // Request mic permission on macOS
    if (process.platform === 'darwin') {
        systemPreferences.askForMediaAccess('microphone').then((access: boolean) => {
            console.log('Microphone access:', access);
        });
    }
})

// Handle Deep Links
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('aplifyai', process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('aplifyai')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (_event, commandLine) => {
        // Someone tried to run a second instance, we should focus our window.
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
        }
        // Protocol handler for Windows/Linux
        const url = commandLine.find((arg) => arg.startsWith('aplifyai://'))
        if (url) handleDeepLink(url)
    })
}

app.on('open-url', (event, url) => {
    event.preventDefault()
    handleDeepLink(url)
})

function handleDeepLink(url: string) {
    console.log('Deep link received:', url)
    try {
        const urlObj = new URL(url)
        const token = urlObj.searchParams.get('token')
        if (token && win) {
            win.webContents.send('auth-token', token)
        }
    } catch (error) {
        console.error('Invalid deep link URL:', error)
    }
}
