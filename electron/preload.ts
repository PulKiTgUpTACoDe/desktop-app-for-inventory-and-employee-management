// Preload script for Electron
// This script runs in the renderer process and has access to Node.js APIs

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Add any APIs you want to expose to the renderer process here
  // For example:
  // sendMessage: (message) => ipcRenderer.send('message', message),
  // onMessage: (callback) => ipcRenderer.on('message', callback)
});
