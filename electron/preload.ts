import { contextBridge, ipcRenderer } from "electron";

console.log("[preload] loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  //Login state
  getLoginState: () => ipcRenderer.invoke('get-login-state'),
  login: () => ipcRenderer.send('user-login'),
  logout: () => ipcRenderer.send('user-logout'),

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

  // Vendor API
  getVendors: () => ipcRenderer.invoke("get-vendors"),
  getVendorById: (id: string) => ipcRenderer.invoke("get-vendor-by-id", id),
  createVendor: (data: any) => ipcRenderer.invoke("create-vendor", data),
  updateVendor: (id: string, data: any) =>
    ipcRenderer.invoke("update-vendor", id, data),
  deleteVendor: (id: string) => ipcRenderer.invoke("delete-vendor", id),

  // Purchase Order API
  getPurchaseOrders: () => ipcRenderer.invoke("get-purchase-orders"),
  getPurchaseOrderById: (id: string) => ipcRenderer.invoke("get-purchase-order-by-id", id),
  createPurchaseOrder: (data: any) => ipcRenderer.invoke("create-purchase-order", data),
  updatePurchaseOrder: (id: string, data: any) =>
    ipcRenderer.invoke("update-purchase-order", id, data),
  deletePurchaseOrder: (id: string) => ipcRenderer.invoke("delete-purchase-order", id),
  updatePurchaseOrderStatus: (id: string, status: string) =>
    ipcRenderer.invoke("update-purchase-order-status", id, status),

  // Sales Order API
  getSalesOrders: () => ipcRenderer.invoke("get-sales-orders"),
  getSalesOrderById: (id: string) => ipcRenderer.invoke("get-sales-order-by-id", id),
  createSalesOrder: (data: any) => ipcRenderer.invoke("create-sales-order", data),
  updateSalesOrder: (id: string, data: any) =>
    ipcRenderer.invoke("update-sales-order", id, data),
  deleteSalesOrder: (id: string) => ipcRenderer.invoke("delete-sales-order", id),
  updateSalesOrderStatus: (id: string, status: string) =>
    ipcRenderer.invoke("update-sales-order-status", id, status),

  // Payroll API
  getPayrolls: () => ipcRenderer.invoke("get-payrolls"),
  getPayrollById: (id: string) => ipcRenderer.invoke("get-payroll-by-id", id),
  createPayroll: (data: any) => ipcRenderer.invoke("create-payroll", data),
  updatePayroll: (id: string, data: any) =>
    ipcRenderer.invoke("update-payroll", id, data),
  deletePayroll: (id: string) => ipcRenderer.invoke("delete-payroll", id),
  updatePayrollStatus: (id: string, status: string) =>
    ipcRenderer.invoke("update-payroll-status", id, status),

  // Invoice API
  getInvoices: () => ipcRenderer.invoke("get-invoices"),
  getInvoiceById: (id: string) => ipcRenderer.invoke("get-invoice-by-id", id),
  createInvoice: (data: any) => ipcRenderer.invoke("create-invoice", data),
  updateInvoice: (id: string, data: any) =>
    ipcRenderer.invoke("update-invoice", id, data),
  deleteInvoice: (id: string) => ipcRenderer.invoke("delete-invoice", id),
  updateInvoiceStatus: (id: string, status: string) =>
    ipcRenderer.invoke("update-invoice-status", id, status),

  // Payment API
  getPayments: () => ipcRenderer.invoke("get-payments"),
  getPaymentById: (id: string) => ipcRenderer.invoke("get-payment-by-id", id),
  createPayment: (data: any) => ipcRenderer.invoke("create-payment", data),
  updatePayment: (id: string, data: any) =>
    ipcRenderer.invoke("update-payment", id, data),
  deletePayment: (id: string) => ipcRenderer.invoke("delete-payment", id),
});
