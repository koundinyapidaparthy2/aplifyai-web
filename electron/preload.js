const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // Expose safe APIs here
    platform: process.platform,
});
