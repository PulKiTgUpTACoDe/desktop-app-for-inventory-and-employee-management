import { InvoiceFormValues } from "../types/invoice";
import "../types/electronAPI";

export const invoiceService = {
    getAll: async () => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getInvoices();
    },

    getById: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getInvoiceById(id);
    },

    create: async (data: InvoiceFormValues) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.createInvoice(data);
    },

    update: async (id: string, data: Partial<InvoiceFormValues>) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.updateInvoice(id, data);
    },

    delete: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.deleteInvoice(id);
    },

    updateStatus: async (id: string, status: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.updateInvoiceStatus(id, status);
    },
};
