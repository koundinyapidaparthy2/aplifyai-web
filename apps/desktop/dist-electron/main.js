"use strict";
const electron = require("electron");
const path = require("node:path");
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : path.join(__dirname, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new electron.BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST || "", "index.html"));
  }
}
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.app.whenReady().then(() => {
  electron.ipcMain.handle("toggle-always-on-top", (event, flag) => {
    if (win) {
      win.setAlwaysOnTop(flag, "screen-saver");
      return win.isAlwaysOnTop();
    }
    return false;
  });
  electron.ipcMain.handle("open-external", async (_event, url) => {
    const { shell } = require("electron");
    await shell.openExternal(url);
  });
  createWindow();
  if (process.platform === "darwin") {
    electron.systemPreferences.askForMediaAccess("microphone").then((access) => {
      console.log("Microphone access:", access);
    });
  }
});
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    electron.app.setAsDefaultProtocolClient("aplifyai", process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  electron.app.setAsDefaultProtocolClient("aplifyai");
}
const gotTheLock = electron.app.requestSingleInstanceLock();
if (!gotTheLock) {
  electron.app.quit();
} else {
  electron.app.on("second-instance", (_event, commandLine) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
    const url = commandLine.find((arg) => arg.startsWith("aplifyai://"));
    if (url) handleDeepLink(url);
  });
}
electron.app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});
function handleDeepLink(url) {
  console.log("Deep link received:", url);
  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get("token");
    if (token && win) {
      win.webContents.send("auth-token", token);
    }
  } catch (error) {
    console.error("Invalid deep link URL:", error);
  }
}
