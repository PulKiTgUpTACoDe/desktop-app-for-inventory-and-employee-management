import { SalesOrderFormValues } from "../types/salesOrder";
import "../types/electronAPI";

export const salesOrderService = {
    getAll: async () => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getSalesOrders();
    },

    getById: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getSalesOrderById(id);
    },

    create: async (data: SalesOrderFormValues) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.createSalesOrder(data);
    },

    update: async (id: string, data: Partial<SalesOrderFormValues>) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.updateSalesOrder(id, data);
    },

    delete: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.deleteSalesOrder(id);
    },

    updateStatus: async (id: string, status: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.updateSalesOrderStatus(id, status);
    },
};
