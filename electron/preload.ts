// Preload script for Electron
// This script runs in the renderer process and has access to Node.js APIs

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Product APIs
  getProducts: async () => ipcRenderer.invoke('get-products'),

  // Employee APIs
  getEmployees: async () => ipcRenderer.invoke('get-employees'),
  getEmployeeById: async (id: string) => ipcRenderer.invoke('get-employee-by-id', id),
  createEmployee: async (data: any) => ipcRenderer.invoke('create-employee', data),
  updateEmployee: async (id: string, data: any) => ipcRenderer.invoke('update-employee', id, data),
  deleteEmployee: async (id: string) => ipcRenderer.invoke('delete-employee', id),
});
