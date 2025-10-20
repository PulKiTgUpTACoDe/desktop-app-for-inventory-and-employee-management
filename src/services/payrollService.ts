import { PayrollFormValues } from "../types/payroll";
import "../types/electronAPI";

export const payrollService = {
    getAll: async () => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getPayrolls();
    },

    getById: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.getPayrollById(id);
    },

    create: async (data: PayrollFormValues) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.createPayroll(data);
    },

    update: async (id: string, data: Partial<PayrollFormValues>) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.updatePayroll(id, data);
    },

    delete: async (id: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.deletePayroll(id);
    },

    updateStatus: async (id: string, status: string) => {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }
        return window.electronAPI.updatePayrollStatus(id, status);
    },
};
