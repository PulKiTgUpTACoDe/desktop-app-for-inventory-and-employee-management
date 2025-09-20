import { contextBridge, ipcRenderer } from "electron";

console.log("[preload] loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  getEmployees: async () => ipcRenderer.invoke("get-employees"),
  getEmployeeById: async (id: string) => ipcRenderer.invoke("get-employee-by-id", id),
  createEmployee: async (data: any) => ipcRenderer.invoke("create-employee", data),
  updateEmployee: async (id: string, data: any) =>
    ipcRenderer.invoke("update-employee", id, data),
  deleteEmployee: async (id: string) => ipcRenderer.invoke("delete-employee", id),
});
