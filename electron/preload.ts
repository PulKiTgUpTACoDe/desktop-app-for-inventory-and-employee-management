import { contextBridge, ipcRenderer } from "electron";

console.log("[preload] loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  // Employee API
  getEmployees: () => ipcRenderer.invoke("get-employees"),
  getEmployeeById: (id: string) => ipcRenderer.invoke("get-employee-by-id", id),
  createEmployee: (data: any) => ipcRenderer.invoke("create-employee", data),
  updateEmployee: (id: string, data: any) =>
    ipcRenderer.invoke("update-employee", id, data),
  deleteEmployee: (id: string) => ipcRenderer.invoke("delete-employee", id),

  // Product API
  getProducts: () => ipcRenderer.invoke("get-products"),
  getProductById: (id: string) => ipcRenderer.invoke("get-product-by-id", id),
  createProduct: (data: any) => ipcRenderer.invoke("create-product", data),
  updateProduct: (id: string, data: any) =>
    ipcRenderer.invoke("update-product", id, data),
  deleteProduct: (id: string) => ipcRenderer.invoke("delete-product", id),

  // Category API
  getCategories: () => ipcRenderer.invoke("get-categories"),
  createCategory: (data: any) => ipcRenderer.invoke("create-category", data),
  updateCategory: (id: string, data: any) =>
    ipcRenderer.invoke("update-category", id, data),
  deleteCategory: (id: string) => ipcRenderer.invoke("delete-category", id),

  // Brand API
  getBrands: () => ipcRenderer.invoke("get-brands"),
  createBrand: (data: any) => ipcRenderer.invoke("create-brand", data),
  updateBrand: (id: string, data: any) =>
    ipcRenderer.invoke("update-brand", id, data),
  deleteBrand: (id: string) => ipcRenderer.invoke("delete-brand", id),

  // Supplier API
  getSuppliers: () => ipcRenderer.invoke("get-suppliers"),
  getSupplierById: (id: string) => ipcRenderer.invoke("get-supplier-by-id", id),
  createSupplier: (data: any) => ipcRenderer.invoke("create-supplier", data),
  updateSupplier: (id: string, data: any) =>
    ipcRenderer.invoke("update-supplier", id, data),
  deleteSupplier: (id: string) => ipcRenderer.invoke("delete-supplier", id),
});
