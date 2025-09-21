import { contextBridge, ipcRenderer } from "electron";

console.log("[preload] loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  getEmployees: () => ipcRenderer.invoke("get-employees"),
  getEmployeeById: (id: string) => ipcRenderer.invoke("get-employee-by-id", id),
  createEmployee: (data: any) => ipcRenderer.invoke("create-employee", data),
  updateEmployee: (id: string, data: any) =>
    ipcRenderer.invoke("update-employee", id, data),
  deleteEmployee: (id: string) => ipcRenderer.invoke("delete-employee", id),
});
