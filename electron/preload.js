const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    
    // AI Assistant APIs
    aiAssistant: {
        toggle: () => ipcRenderer.invoke('ai-assistant:toggle'),
        setProfile: (profile) => ipcRenderer.invoke('ai-assistant:set-profile', profile),
        setJob: (jobData) => ipcRenderer.invoke('ai-assistant:set-job', jobData),
        getState: () => ipcRenderer.invoke('ai-assistant:get-state'),
        setApiKey: (apiKey) => ipcRenderer.invoke('ai-assistant:set-api-key', apiKey),
        
        // Webview interaction
        injectScript: (webContentsId) => ipcRenderer.invoke('ai-assistant:inject-script', webContentsId),
        detectQuestions: (webContentsId) => ipcRenderer.invoke('ai-assistant:detect-questions', webContentsId),
        fillField: (webContentsId, selector, value) => 
            ipcRenderer.invoke('ai-assistant:fill-field', { webContentsId, selector, value }),
        getPageInfo: (webContentsId) => ipcRenderer.invoke('ai-assistant:get-page-info', webContentsId),
        
        // Event listeners
        onProfileUpdated: (callback) => {
            ipcRenderer.on('ai-assistant:profile-updated', (event, profile) => callback(profile));
            return () => ipcRenderer.removeAllListeners('ai-assistant:profile-updated');
        },
        onJobUpdated: (callback) => {
            ipcRenderer.on('ai-assistant:job-updated', (event, jobData) => callback(jobData));
            return () => ipcRenderer.removeAllListeners('ai-assistant:job-updated');
        },
        onStateChanged: (callback) => {
            ipcRenderer.on('ai-assistant:state-changed', (event, state) => callback(state));
            return () => ipcRenderer.removeAllListeners('ai-assistant:state-changed');
        }
    },
    
    // Job Browser APIs
    jobBrowser: {
        navigate: (webContentsId, url) => ipcRenderer.invoke('job-browser:navigate', { webContentsId, url }),
    },
});

// Notify renderer when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    // Check if running in Electron
    const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');
    document.body.setAttribute('data-electron', isElectron.toString());
});
