// Preload script for Electron
// This script runs in the renderer process and has access to Node.js APIs

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  getProducts: async () => ipcRenderer.invoke('get-products'),
  // Add more APIs for other entities as needed
});
