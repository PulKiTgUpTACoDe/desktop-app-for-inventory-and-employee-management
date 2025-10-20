import { VendorFormValues } from "../types/vendor";
import "../types/electronAPI";

export const vendorService = {
    getAll: async () => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getVendors();
    },

    getById: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getVendorById(id);
    },

    create: async (data: VendorFormValues) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.createVendor(data);
    },

    update: async (id: string, data: Partial<VendorFormValues>) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.updateVendor(id, data);
    },

    delete: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.deleteVendor(id);
    },
};
