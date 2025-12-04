const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

// Store for user profile and job data
let userProfile = null;
let currentJobData = null;
let aiAssistantActive = false;

// AI Assistant window (floating panel)
let assistantWindow = null;
let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true, // Enable webview for job site browsing
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, we can either load a remote URL (wrapper mode)
        // or load static files (standalone mode)
        const PROD_URL = process.env.ELECTRON_APP_URL || 'https://your-production-url.com';
        mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
    }

    // Handle main window close
    mainWindow.on('closed', () => {
        mainWindow = null;
        if (assistantWindow) {
            assistantWindow.close();
        }
    });
}

function createAssistantWindow() {
    if (assistantWindow) {
        assistantWindow.focus();
        return;
    }

    assistantWindow = new BrowserWindow({
        width: 400,
        height: 600,
        parent: mainWindow,
        alwaysOnTop: true,
        frame: false,
        transparent: true,
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Load the assistant panel
    if (isDev) {
        assistantWindow.loadURL('http://localhost:3000/assistant');
    } else {
        assistantWindow.loadFile(path.join(__dirname, '../out/assistant.html'));
    }

    assistantWindow.on('closed', () => {
        assistantWindow = null;
        aiAssistantActive = false;
    });
}

// ============================================
// IPC Handlers for AI Assistant
// ============================================

// Toggle AI Assistant panel
ipcMain.handle('ai-assistant:toggle', () => {
    if (assistantWindow) {
        assistantWindow.close();
        aiAssistantActive = false;
    } else {
        createAssistantWindow();
        aiAssistantActive = true;
    }
    return aiAssistantActive;
});

// Set user profile for answer generation
ipcMain.handle('ai-assistant:set-profile', (event, profile) => {
    userProfile = profile;
    // Notify assistant window if open
    if (assistantWindow) {
        assistantWindow.webContents.send('ai-assistant:profile-updated', profile);
    }
    return { success: true };
});

// Set current job data
ipcMain.handle('ai-assistant:set-job', (event, jobData) => {
    currentJobData = jobData;
    if (assistantWindow) {
        assistantWindow.webContents.send('ai-assistant:job-updated', jobData);
    }
    return { success: true };
});

// Get current state
ipcMain.handle('ai-assistant:get-state', () => {
    return {
        isActive: aiAssistantActive,
        userProfile,
        currentJobData,
    };
});

// Inject content script into webview for form detection
ipcMain.handle('ai-assistant:inject-script', async (event, webContentsId) => {
    try {
        const targetWebContents = require('electron').webContents.fromId(webContentsId);
        if (targetWebContents) {
            await targetWebContents.executeJavaScript(`
                (function() {
                    // Content script for detecting questions and filling forms
                    window.aplifyAI = window.aplifyAI || {};
                    window.aplifyAI.detectQuestions = function() {
                        // Question detection logic (simplified version)
                        const textareas = document.querySelectorAll('textarea, input[type="text"]');
                        const questions = [];
                        
                        textareas.forEach((field, index) => {
                            const label = document.querySelector('label[for="' + field.id + '"]');
                            const text = label ? label.textContent : (field.placeholder || field.name || '');
                            
                            if (text && text.length > 10) {
                                questions.push({
                                    id: 'q_' + index,
                                    text: text.trim(),
                                    element: field.id || field.name || index,
                                    type: 'text',
                                    value: field.value
                                });
                            }
                        });
                        
                        return questions;
                    };
                    
                    window.aplifyAI.fillField = function(selector, value) {
                        const field = document.querySelector(selector);
                        if (field) {
                            field.value = value;
                            field.dispatchEvent(new Event('input', { bubbles: true }));
                            field.dispatchEvent(new Event('change', { bubbles: true }));
                            return true;
                        }
                        return false;
                    };
                    
                    console.log('AplifyAI content script loaded');
                })();
            `);
            return { success: true };
        }
        return { success: false, error: 'WebContents not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Detect questions in webview
ipcMain.handle('ai-assistant:detect-questions', async (event, webContentsId) => {
    try {
        const targetWebContents = require('electron').webContents.fromId(webContentsId);
        if (targetWebContents) {
            const questions = await targetWebContents.executeJavaScript(`
                window.aplifyAI && window.aplifyAI.detectQuestions ? 
                    window.aplifyAI.detectQuestions() : []
            `);
            return { success: true, questions };
        }
        return { success: false, error: 'WebContents not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Fill form field in webview
ipcMain.handle('ai-assistant:fill-field', async (event, { webContentsId, selector, value }) => {
    try {
        const targetWebContents = require('electron').webContents.fromId(webContentsId);
        if (targetWebContents) {
            const result = await targetWebContents.executeJavaScript(`
                window.aplifyAI && window.aplifyAI.fillField ? 
                    window.aplifyAI.fillField('${selector}', '${value.replace(/'/g, "\\'")}') : false
            `);
            return { success: result };
        }
        return { success: false, error: 'WebContents not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Get page info from webview
ipcMain.handle('ai-assistant:get-page-info', async (event, webContentsId) => {
    try {
        const targetWebContents = require('electron').webContents.fromId(webContentsId);
        if (targetWebContents) {
            const pageInfo = await targetWebContents.executeJavaScript(`
                ({
                    url: window.location.href,
                    title: document.title,
                    isJobSite: /linkedin|indeed|glassdoor|greenhouse|lever|workday|icims/i.test(window.location.hostname)
                })
            `);
            return { success: true, ...pageInfo };
        }
        return { success: false, error: 'WebContents not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Store API key securely
ipcMain.handle('ai-assistant:set-api-key', async (event, apiKey) => {
    // In production, use keytar or similar for secure storage
    // For now, store in memory only
    process.env.GEMINI_API_KEY = apiKey;
    return { success: true };
});

// ============================================
// Job Browser IPC
// ============================================

// Navigate webview to URL
ipcMain.handle('job-browser:navigate', async (event, { webContentsId, url }) => {
    try {
        const targetWebContents = require('electron').webContents.fromId(webContentsId);
        if (targetWebContents) {
            await targetWebContents.loadURL(url);
            return { success: true };
        }
        return { success: false, error: 'WebContents not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================
// App Lifecycle
// ============================================

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
