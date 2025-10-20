import { SupplierFormValues } from "../types/supplier";
import "../types/electronAPI";

export const supplierService = {
    getAll: async () => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getSuppliers();
    },

    getById: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getSupplierById(id);
    },

    create: async (data: SupplierFormValues) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.createSupplier(data);
    },

    update: async (id: string, data: Partial<SupplierFormValues>) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.updateSupplier(id, data);
    },

    delete: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.deleteSupplier(id);
    },
};
