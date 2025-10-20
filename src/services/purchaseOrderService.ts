import { PurchaseOrderFormValues } from "../types/purchaseOrder";
import "../types/electronAPI";

export const purchaseOrderService = {
    getAll: async () => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getPurchaseOrders();
    },

    getById: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getPurchaseOrderById(id);
    },

    create: async (data: PurchaseOrderFormValues) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.createPurchaseOrder(data);
    },

    update: async (id: string, data: Partial<PurchaseOrderFormValues>) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.updatePurchaseOrder(id, data);
    },

    delete: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.deletePurchaseOrder(id);
    },

    updateStatus: async (id: string, status: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.updatePurchaseOrderStatus(id, status);
    },
};
